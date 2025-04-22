const { createClient } = require('../utils/httpClient');
const apiConfig = require('../config/api').ensembl;
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');
const { retryWithBackoff, rateLimiter, processBatch } = require('../utils/apiClientHelper');
const { snpLocationCache, geneDataCache } = require('../utils/cacheUtil');

// Create HTTP client for Ensembl API
const ensemblClient = createClient(
  apiConfig.baseUrl,
  apiConfig.headers
);

// Create rate-limited API call functions
const postLimitedEnsemblData = rateLimiter(
  (endpoint, data) => ensemblClient.post(endpoint, data),
  1000 // 1 request per second
);

const getLimitedEnsemblData = rateLimiter(
  (endpoint, params) => ensemblClient.get(endpoint, { params }),
  1000 // 1 request per second
);

/**
 * Get genomic coordinates for a list of SNPs
 * @param {Array} snps - Array of SNP objects with rsId property
 * @returns {Promise<Array>} Array of SNPs with location information
 */
const getSnpLocations = async (snps) => {
  try {
    logger.info(`Getting locations for ${snps.length} SNPs`);
    
    // For large sets of SNPs, we'll batch the requests to avoid hitting API limits
    if (snps.length > 200) {
      logger.info(`Large number of SNPs (${snps.length}), processing in batches`);
      
      // Split into batches of 200 SNPs
      const results = [];
      for (let i = 0; i < snps.length; i += 200) {
        const batchSnps = snps.slice(i, i + 200);
        logger.info(`Processing batch ${i/200 + 1} with ${batchSnps.length} SNPs`);
        
        const batchResults = await getSnpLocationsImpl(batchSnps);
        results.push(...batchResults);
      }
      
      return results;
    }
    
    return await getSnpLocationsImpl(snps);
  } catch (error) {
    logger.error(`Error getting SNP locations: ${error.message}`);
    throw new ApiError(`Failed to get SNP locations from Ensembl: ${error.message}`, 
                        error.response?.status || 500);
  }
};

/**
 * Implementation of SNP location fetching for a batch of SNPs
 * @param {Array} snps - Array of SNP objects with rsId property
 * @returns {Promise<Array>} Array of SNPs with location information
 */
const getSnpLocationsImpl = async (snps) => {
  try {
    // Check which SNPs are already in cache
    const snpsToFetch = [];
    const cachedResults = [];
    
    for (const snp of snps) {
      const cacheKey = `snp_location_${snp.rsId}`;
      const cachedData = snpLocationCache.get(cacheKey);
      
      if (cachedData) {
        // Use cached data
        logger.debug(`Using cached location for SNP: ${snp.rsId}`);
        cachedResults.push({
          ...snp,
          ...cachedData
        });
      } else {
        // Need to fetch this SNP
        snpsToFetch.push(snp);
      }
    }
    
    // If all SNPs were in cache, return early
    if (snpsToFetch.length === 0) {
      logger.info('All SNP locations found in cache');
      return cachedResults;
    }
    
    logger.info(`Fetching locations for ${snpsToFetch.length} SNPs from Ensembl API`);
    
    // Prepare request body with rsIDs
    const requestBody = {
      ids: snpsToFetch.map(snp => snp.rsId)
    };
    
    // Call Ensembl API to get SNP locations with retry and rate limiting
    const response = await retryWithBackoff(() => 
      postLimitedEnsemblData(
        apiConfig.endpoints.variation,
        requestBody
      )
    );
    
    // Process the API response for newly fetched SNPs
    const fetchedResults = snpsToFetch.map(snp => {
      const variationData = response.data[snp.rsId];
      
      if (!variationData || !variationData.mappings || variationData.mappings.length === 0) {
        logger.warn(`No location found for SNP: ${snp.rsId}`);
        return {
          ...snp,
          chromosome: null,
          position: null,
          location: null
        };
      }
      
      // Get the primary mapping (GRCh38 by default in Ensembl API)
      // Filter for mappings with chromosome locations (not scaffold)
      const primaryMappings = variationData.mappings.filter(
        mapping => mapping.seq_region_name && !isNaN(parseInt(mapping.seq_region_name))
      );
      
      if (primaryMappings.length === 0) {
        logger.warn(`No chromosome mapping found for SNP: ${snp.rsId}`);
        return {
          ...snp,
          chromosome: null,
          position: null,
          location: null
        };
      }
      
      // Sort by chromosome number to get a consistent result
      primaryMappings.sort((a, b) => 
        parseInt(a.seq_region_name) - parseInt(b.seq_region_name)
      );
      
      const mapping = primaryMappings[0];
      const chromosome = mapping.seq_region_name;
      const position = mapping.start;
      
      // Create location data object
      const locationData = {
        chromosome,
        position,
        location: `${chromosome}:${position}`
      };
      
      // Cache the location data for future use
      const cacheKey = `snp_location_${snp.rsId}`;
      snpLocationCache.set(cacheKey, locationData);
      
      return {
        ...snp,
        ...locationData
      };
    });
    
    // Combine cached and fetched results
    return [...cachedResults, ...fetchedResults];
  } catch (error) {
    logger.error(`Error in getSnpLocationsImpl: ${error.message}`);
    throw error;
  }
};

/**
 * Find protein-coding genes near a genomic location
 * @param {string} chromosome - Chromosome number
 * @param {number} position - Genomic position
 * @param {number} windowKb - Window size in kilobases
 * @returns {Promise<Array>} Array of nearby genes
 */
const findNearbyGenes = async (chromosome, position, windowKb) => {
  try {
    if (!chromosome || !position) {
      logger.warn('Missing chromosome or position for finding nearby genes');
      return [];
    }
    
    // Convert window size from kb to bp
    const windowSize = (windowKb || apiConfig.defaultParams.windowKb) * 1000;
    
    // Calculate region boundaries
    const start = Math.max(1, position - windowSize/2);
    const end = position + windowSize/2;
    
    // Format region string for Ensembl API
    const region = `${chromosome}:${Math.floor(start)}-${Math.floor(end)}`;
    
    // Check if result is in cache
    const cacheKey = `genes_region_${region}`;
    const cachedGenes = geneDataCache.get(cacheKey);
    
    if (cachedGenes) {
      logger.info(`Using cached genes for region: ${region}`);
      return cachedGenes;
    }
    
    logger.info(`Finding genes in region: ${region}`);
    
    // Call Ensembl API to get overlapping features with retry and rate limiting
    const response = await retryWithBackoff(() =>
      getLimitedEnsemblData(
        `${apiConfig.endpoints.overlap}/${region}`,
        {
          feature: 'gene',
          biotype: 'protein_coding'
        }
      )
    );
    
    if (!response.data || !Array.isArray(response.data)) {
      logger.warn(`No genes found in region: ${region}`);
      return [];
    }
    
    // Extract gene information
    const genes = response.data.map(gene => ({
      ensemblId: gene.id,
      symbol: gene.external_name || gene.id,
      biotype: gene.biotype,
      chromosome: gene.seq_region_name,
      start: gene.start,
      end: gene.end,
      strand: gene.strand
    }));
    
    logger.info(`Found ${genes.length} protein-coding genes in region: ${region}`);
    
    // Cache the result
    geneDataCache.set(cacheKey, genes);
    
    return genes;
    
  } catch (error) {
    logger.error(`Error finding nearby genes: ${error.message}`);
    throw new ApiError(`Failed to find nearby genes from Ensembl: ${error.message}`, 
                        error.response?.status || 500);
  }
};

module.exports = {
  getSnpLocations,
  findNearbyGenes
};
