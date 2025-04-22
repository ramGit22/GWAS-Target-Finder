const axios = require('axios');
const apiConfig = require('../config/api').openTargets;
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');
const { retryWithBackoff, rateLimiter } = require('../utils/apiClientHelper');
const { drugTargetCache } = require('../utils/cacheUtil');

// Create a rate-limited function for Open Targets API
const postLimitedGraphQL = rateLimiter(
  (url, data, headers) => axios.post(url, data, { headers }),
  1000 // 1 request per second
);

/**
 * Check if a list of genes are known drug targets using Open Targets Platform
 * @param {Array} geneIds - Array of Ensembl gene IDs
 * @returns {Promise<Object>} Object mapping gene IDs to drug target status
 */
const checkDrugTargets = async (geneIds) => {
  try {
    if (!geneIds || geneIds.length === 0) {
      return {};
    }
    
    logger.info(`Checking drug target status for ${geneIds.length} genes`);
    
    // For large sets of genes, we'll batch the requests to avoid hitting API limits
    if (geneIds.length > 200) {
      logger.info(`Large number of genes (${geneIds.length}), processing in batches`);
      
      // Initialize result map
      const drugTargetMap = {};
      
      // Initialize all genes as not drug targets
      geneIds.forEach(geneId => {
        drugTargetMap[geneId] = false;
      });
      
      // Process in batches of 200 genes
      for (let i = 0; i < geneIds.length; i += 200) {
        const batchGeneIds = geneIds.slice(i, i + 200);
        logger.info(`Processing batch ${i/200 + 1} with ${batchGeneIds.length} genes`);
        
        try {
          const batchResults = await checkDrugTargetsImpl(batchGeneIds);
          
          // Merge batch results into the overall map
          Object.keys(batchResults).forEach(geneId => {
            if (batchResults[geneId]) {
              drugTargetMap[geneId] = true;
            }
          });
        } catch (error) {
          logger.error(`Error processing gene batch ${i/200 + 1}: ${error.message}`);
          // Continue with next batch instead of failing the entire operation
        }
      }
      
      const targetCount = Object.values(drugTargetMap).filter(Boolean).length;
      logger.info(`Found ${targetCount} genes that are drug targets out of ${geneIds.length}`);
      
      return drugTargetMap;
    }
    
    return await checkDrugTargetsImpl(geneIds);
  } catch (error) {
    logger.error(`Error checking drug targets: ${error.message}`);
    // Return empty result with a warning rather than failing the entire request
    return {
      error: `Failed to check drug targets: ${error.message}`
    };
  }
};

/**
 * Implementation of drug target checking for a batch of genes
 * @param {Array} geneIds - Array of Ensembl gene IDs
 * @returns {Promise<Object>} Object mapping gene IDs to drug target status
 */
const checkDrugTargetsImpl = async (geneIds) => {
  try {
    // Check cache first
    const genesToFetch = [];
    const drugTargetMap = {};
    
    // Initialize all genes as not drug targets
    geneIds.forEach(geneId => {
      drugTargetMap[geneId] = false;
    });
    
    // Check which genes are in cache
    for (const geneId of geneIds) {
      const cacheKey = `drug_target_${geneId}`;
      const cachedStatus = drugTargetCache.get(cacheKey);
      
      if (cachedStatus !== null && cachedStatus !== undefined) {
        // Use cached status
        logger.debug(`Using cached drug target status for gene: ${geneId}`);
        drugTargetMap[geneId] = cachedStatus;
      } else {
        // Need to fetch this gene
        genesToFetch.push(geneId);
      }
    }
    
    // If all genes were in cache, return early
    if (genesToFetch.length === 0) {
      logger.info('All drug target statuses found in cache');
      return drugTargetMap;
    }
    
    logger.info(`Checking drug target status for ${genesToFetch.length} genes from Open Targets`);
    
    // Define GraphQL query
    const query = `
      query DrugTargets($ensemblIds: [String!]!) {
        drugs(ensemblIds: $ensemblIds) {
          count
          rows {
            id
            drugType
            name
            maximumClinicalTrialPhase
            targets {
              approvedName
              id
            }
          }
        }
      }
    `;
    
    // Send request to Open Targets GraphQL API with retry and rate limiting
    const response = await retryWithBackoff(() =>
      postLimitedGraphQL(
        apiConfig.url,
        {
          query,
          variables: {
            ensemblIds: genesToFetch
          }
        },
        apiConfig.headers
      )
    );
    
    if (!response.data || !response.data.data || !response.data.data.drugs) {
      logger.warn('Invalid response from Open Targets API');
      
      // Cache the negative results to avoid repeated API calls
      genesToFetch.forEach(geneId => {
        const cacheKey = `drug_target_${geneId}`;
        drugTargetCache.set(cacheKey, false);
      });
      
      return drugTargetMap;
    }
    
    const { drugs } = response.data.data;
    
    // Mark genes that are drug targets based on API response
    if (drugs.rows && drugs.rows.length > 0) {
      drugs.rows.forEach(drug => {
        if (drug.targets && drug.targets.length > 0) {
          drug.targets.forEach(target => {
            // Extract Ensembl ID from the target ID if needed
            const targetId = target.id.startsWith('ENSG') 
              ? target.id 
              : target.id.split('/').pop();
            
            if (genesToFetch.includes(targetId)) {
              drugTargetMap[targetId] = true;
              
              // Cache the positive result
              const cacheKey = `drug_target_${targetId}`;
              drugTargetCache.set(cacheKey, true);
            }
          });
        }
      });
    }
    
    // Cache negative results for genes not found to be drug targets
    genesToFetch.forEach(geneId => {
      if (!drugTargetMap[geneId]) {
        const cacheKey = `drug_target_${geneId}`;
        drugTargetCache.set(cacheKey, false);
      }
    });
    
    const targetCount = Object.values(drugTargetMap).filter(Boolean).length;
    logger.info(`Found ${targetCount} genes that are drug targets out of ${geneIds.length}`);
    
    return drugTargetMap;
  } catch (error) {
    logger.error(`Error in checkDrugTargetsImpl: ${error.message}`);
    throw error;
  }
};

module.exports = {
  checkDrugTargets
};
