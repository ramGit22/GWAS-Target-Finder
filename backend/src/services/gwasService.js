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
 * @param {string} trait - Trait identifier (e.g., EFO_0001360 for Type 2 diabetes)
 * @param {number} pValue - P-value threshold for significance
 * @returns {Promise<Array>} Array of significant SNPs
 */
const fetchSignificantSnps = async (trait, pValue) => {
  try {
    // Normalize p-value
    const pValueThreshold = pValue || apiConfig.defaultParams.pValue;
    logger.info(`Fetching SNPs for trait: ${trait} with p-value threshold: ${pValueThreshold}`);
    
    // Call GWAS Catalog API with retry and rate limiting
    const response = await retryWithBackoff(() => 
      getLimitedGwasData(
        apiConfig.endpoints.associations,
        {
          efoTrait: trait,
          pValueUpperLimit: pValueThreshold
        }
      )
    );
    
    if (!response.data || !response.data._embedded || !response.data._embedded.associations) {
      logger.warn(`No associations found for trait: ${trait}`);
      return [];
    }
    
    // Extract SNP information
    const associations = response.data._embedded.associations;
    logger.info(`Found ${associations.length} associations for trait: ${trait}`);
    
    // Map to simplified SNP objects with rsIDs
    const snps = associations
      .filter(assoc => assoc.loci && assoc.loci.length > 0 && 
              assoc.loci[0].strongestRiskAlleles && 
              assoc.loci[0].strongestRiskAlleles.length > 0)
      .map(assoc => {
        const rsId = assoc.loci[0].strongestRiskAlleles[0].riskAlleleName;
        // Some risk allele names include the actual allele (e.g., "rs123-A")
        // We just want the rsID part
        const cleanRsId = rsId.split('-')[0];
        return {
          rsId: cleanRsId,
          pValue: assoc.pvalue,
          traitName: assoc.efoTraits ? assoc.efoTraits.map(t => t.trait).join(', ') : 'Unknown'
        };
      })
      .filter(snp => snp.rsId.startsWith('rs')); // Ensure valid rsID format
    
    return snps;
  } catch (error) {
    logger.error(`Error fetching SNPs: ${error.message}`);
    throw new ApiError(`Failed to fetch SNPs from GWAS Catalog: ${error.message}`, 
                      error.response?.status || 500);
  }
};

module.exports = {
  fetchSignificantSnps
};
