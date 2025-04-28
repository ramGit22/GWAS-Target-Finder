const { asyncHandler } = require('../middleware/errorHandler');
const gwasService = require('../services/gwasService');
const ensemblService = require('../services/ensemblService');
const openTargetsService = require('../services/openTargetsService');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Find target genes near GWAS SNPs for a specified trait
 */
exports.findTargets = asyncHandler(async (req, res) => {
  const { trait, p_value, window_kb } = req.body;
  
  if (!trait) {
    throw new ApiError('Trait parameter is required', 400);
  }
  
  logger.info(`Processing target finding request for trait: ${trait}`);
  const warnings = [];
  
  // Step 1: Fetch significant SNPs from GWAS Catalog using new endpoint
  const snps = await gwasService.fetchSignificantSnps(trait, p_value);
  
  if (snps.length === 0) {
    return res.status(200).json({ 
      results: [],
      message: `No significant SNPs found for trait: ${trait}`
    });
  }
  
  // Process SNPs to handle both the new format (with location already included)
  // and older format that might need location lookup
  const validSnps = [];
  
  for (const snp of snps) {
    if (snp.location && snp.location.chromosome && snp.location.position) {
      // New format: SNP already has location info
      validSnps.push({
        rsId: snp.rsId,
        chromosome: snp.location.chromosome,
        position: snp.location.position,
        location: `${snp.location.chromosome}:${snp.location.position}`,
        functionalClass: snp.functionalClass
      });
    } else {
      // Old format: Need to look up location (for backward compatibility)
      // We'll skip this in the updated version
      logger.debug(`SNP ${snp.rsId} missing location information`);
    }
  }
  
  if (validSnps.length === 0) {
    return res.status(200).json({ 
      results: [],
      message: 'No valid SNP locations found'
    });
  }
  
  // Step 2: Find nearby genes for each SNP using batch processing
  const results = [];
  const { processBatch } = require('../utils/apiClientHelper');
  
  // Define the processing function for each SNP
  const processSnp = async (snp) => {
    try {
      // If SNP already has gene information from GWAS Catalog, use that data
      if (snp.genes && snp.genes.length > 0) {
        logger.info(`Using gene data from GWAS Catalog for SNP: ${snp.rsId}`);
        
        // Format genes to match the expected structure
        const formattedGenes = snp.genes
          .filter(gene => gene.ensemblId) // Ensure we have an Ensembl ID
          .map(gene => ({
            ensemblId: gene.ensemblId,
            symbol: gene.geneName,
            biotype: 'protein_coding', // Assuming these are protein-coding genes
            chromosome: snp.chromosome,
            isWithinGene: gene.isWithinGene || false,
            distance: gene.distance || 0
          }));
          
        if (formattedGenes.length > 0) {
          return {
            snp,
            genes: formattedGenes
          };
        }
      }
      
      // Otherwise, use Ensembl API to find nearby genes
      const nearbyGenes = await ensemblService.findNearbyGenes(
        snp.chromosome, 
        snp.position, 
        window_kb
      );
      
      if (nearbyGenes.length > 0) {
        return {
          snp,
          genes: nearbyGenes
        };
      }
      return null;
    } catch (error) {
      logger.error(`Error processing SNP ${snp.rsId}: ${error.message}`);
      warnings.push(`Failed to process SNP ${snp.rsId}: ${error.message}`);
      return null;
    }
  };
  
  // Process SNPs in batches with limited concurrency
  const batchResults = await processBatch(validSnps, processSnp, 3);
  
  // Filter out null results
  const filteredResults = batchResults.filter(result => result !== null);
  results.push(...filteredResults);
  
  if (results.length === 0) {
    return res.status(200).json({
      results: [],
      warnings,
      message: 'No nearby genes found for any SNP'
    });
  }
  
  // Step 3: Check which genes are drug targets
  // Collect all unique gene IDs
  const allGeneIds = [...new Set(
    results.flatMap(result => result.genes.map(gene => gene.ensemblId))
  )];
  
  let drugTargetMap = {};
  
  try {
    drugTargetMap = await openTargetsService.checkDrugTargets(allGeneIds);
    
    // Check if there was an error with the Open Targets API
    if (drugTargetMap.error) {
      warnings.push(drugTargetMap.error);
      drugTargetMap = {}; // Reset to empty object
    }
  } catch (error) {
    logger.error(`Error checking drug targets: ${error.message}`);
    warnings.push(`Failed to check drug targets: ${error.message}`);
  }
  
  // Step 4: Format the final response
  const formattedResults = results.flatMap(result => 
    result.genes.map(gene => ({
      gwas_snp: result.snp.rsId,
      snp_location: result.snp.location,
      functional_class: result.snp.functionalClass || 'Unknown',
      nearby_gene_symbol: gene.symbol,
      nearby_gene_ensembl_id: gene.ensemblId,
      distance_to_gene: gene.distance || 0,
      is_within_gene: gene.isWithinGene || false,
      is_drug_target: !!drugTargetMap[gene.ensemblId]
    }))
  );
  
  res.status(200).json({
    results: formattedResults,
    warnings: warnings.length > 0 ? warnings : undefined
  });
});

/**
 * Health check endpoint
 */
exports.healthCheck = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'GWAS Target Finder API is running',
    version: process.env.npm_package_version || '1.0.0'
  });
};