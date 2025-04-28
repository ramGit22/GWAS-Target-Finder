const { createClient } = require('../utils/httpClient');
const apiConfig = require('../config/api').gwas;
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');
const { retryWithBackoff, rateLimiter } = require('../utils/apiClientHelper');

// Create HTTP client for GWAS Catalog API
const gwasClient = createClient(apiConfig.baseUrl);

// Create rate-limited API call function
const getLimitedGwasData = rateLimiter(
  (endpoint, params) => gwasClient.get(endpoint, { params }),
  1000 // 1 request per second
);

/**
 * Fetch SNPs associated with a specified trait from the GWAS Catalog
 * @param {string} trait - Trait identifier (e.g., "Parkinson disease" or EFO ID)
 * @param {number} pValue - P-value threshold for significance
 * @param {number} [maxResults=500] - Maximum number of SNPs to retrieve
 * @returns {Promise<Array>} Array of significant SNPs
 */
const fetchSignificantSnps = async (trait, pValue, maxResults = 500) => {
  try {
    // Normalize p-value
    const pValueThreshold = pValue || apiConfig.defaultParams.pValue;
    logger.info(`Fetching SNPs for trait: ${trait} with p-value threshold: ${pValueThreshold}`);
    
    // Check if trait is an EFO ID or a trait name
    const isEfoId = trait.startsWith('EFO_');
    const endpoint = apiConfig.endpoints.snpsByTrait;
    
    let allSnps = [];
    let currentPage = 0;
    const pageSize = 100; // Number of results per page
    let hasMoreResults = true;
    
    // Implement pagination loop to fetch results in chunks
    while (hasMoreResults && allSnps.length < maxResults) {
      // Call GWAS Catalog API with retry and rate limiting
      const response = await retryWithBackoff(() => 
        getLimitedGwasData(
          endpoint,
          {
            diseaseTrait: isEfoId ? null : trait,
            efoTrait: isEfoId ? trait : null,
            size: pageSize,
            page: currentPage
          }
        )
      );
      
      if (!response.data || !response.data._embedded || 
          !response.data._embedded.singleNucleotidePolymorphisms) {
        logger.warn(`No SNPs found for trait: ${trait} on page ${currentPage}`);
        break;
      }
      
      // Extract SNP information
      const pageSnps = response.data._embedded.singleNucleotidePolymorphisms;
      logger.info(`Found ${pageSnps.length} SNPs for trait: ${trait} on page ${currentPage}`);
      
      // Add results to the cumulative collection
      allSnps = [...allSnps, ...pageSnps];
      
      // Check if we should fetch the next page
      const pageInfo = response.data.page || {};
      const totalPages = pageInfo.totalPages || 0;
      
      currentPage++;
      hasMoreResults = currentPage < totalPages && pageSnps.length === pageSize;
      
      // Safety check to prevent infinite loops
      if (currentPage > 10) {
        logger.warn('Reached maximum number of pages (10), stopping pagination');
        break;
      }
    }
    
    logger.info(`Finished fetching SNPs. Total retrieved: ${allSnps.length}`);
    
    // Map to simplified SNP objects with rsIDs and genomic contexts
    const processedSnps = allSnps
      .filter(snp => snp.rsId && snp.genomicContexts && snp.genomicContexts.length > 0)
      .map(snp => {
        // Find genes that are closest to the SNP or the SNP is within the gene
        const relevantGenes = snp.genomicContexts
          .filter(context => 
            context.isClosestGene === true || 
            (context.distance === 0 && context.gene && context.gene.geneName)
          )
          .map(context => ({
            geneName: context.gene.geneName,
            ensemblId: context.gene.ensemblGeneIds ? 
                       context.gene.ensemblGeneIds[0]?.ensemblGeneId : null,
            distance: context.distance,
            isWithinGene: context.distance === 0
          }));

        // Get the chromosome and position information
        const location = snp.locations && snp.locations.length > 0 ? {
          chromosome: snp.locations[0].chromosomeName,
          position: snp.locations[0].chromosomePosition
        } : null;

        return {
          rsId: snp.rsId,
          location: location,
          genes: relevantGenes,
          functionalClass: snp.functionalClass || 'Unknown'
        };
      });
    
    return processedSnps;
  } catch (error) {
    logger.error(`Error fetching SNPs: ${error.message}`);
    throw new ApiError(`Failed to fetch SNPs from GWAS Catalog: ${error.message}`, 
                      error.response?.status || 500);
  }
};

module.exports = {
  fetchSignificantSnps
};