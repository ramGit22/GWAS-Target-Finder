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
  
  // Step 1: Fetch significant SNPs from GWAS Catalog
  const snps = await gwasService.fetchSignificantSnps(trait, p_value);
  
  if (snps.length === 0) {
    return res.status(200).json({ 
      results: [],
      message: `No significant SNPs found for trait: ${trait}`
    });
  }
  
  // Step 2: Get genomic coordinates for SNPs
  const snpsWithLocations = await ensemblService.getSnpLocations(snps);
  
  // Filter out SNPs without locations
  const validSnps = snpsWithLocations.filter(snp => snp.location);
  
  if (validSnps.length === 0) {
    return res.status(200).json({ 
      results: [],
      message: 'No valid SNP locations found'
    });
  }
  
  // Step 3: Find nearby genes for each SNP using batch processing
  const results = [];
  const { processBatch } = require('../utils/apiClientHelper');
  
  // Define the processing function for each SNP
  const processSnp = async (snp) => {
    try {
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
  
  // Step 4: Check which genes are drug targets
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
  
  // Step 5: Format the final response
  const formattedResults = results.flatMap(result => 
    result.genes.map(gene => ({
      gwas_snp: result.snp.rsId,
      snp_location: result.snp.location,
      nearby_gene_symbol: gene.symbol,
      nearby_gene_ensembl_id: gene.ensemblId,
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
