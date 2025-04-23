const logger = require('./logger');

/**
 * Filters out duplicate SNPs based on rsId
 * @param {Array} snps - Array of SNP objects
 * @returns {Array} Array of unique SNPs
 */
const getUniqueSnps = (snps) => {
  const uniqueSnps = [];
  const rsIdSet = new Set();
  
  for (const snp of snps) {
    if (!rsIdSet.has(snp.rsId)) {
      rsIdSet.add(snp.rsId);
      uniqueSnps.push(snp);
    }
  }
  
  if (uniqueSnps.length < snps.length) {
    logger.info(`Removed ${snps.length - uniqueSnps.length} duplicate SNPs`);
  }
  
  return uniqueSnps;
};

/**
 * Groups SNPs by chromosome to optimize API calls
 * @param {Array} snps - Array of SNP objects with chromosome property
 * @returns {Object} Object with chromosome as key and array of SNPs as value
 */
const groupSnpsByChromosome = (snps) => {
  const groupedSnps = {};
  
  for (const snp of snps) {
    if (!snp.chromosome) continue;
    
    if (!groupedSnps[snp.chromosome]) {
      groupedSnps[snp.chromosome] = [];
    }
    
    groupedSnps[snp.chromosome].push(snp);
  }
  
  // Log the distribution
  const chrCounts = Object.keys(groupedSnps).map(chr => 
    `chr${chr}: ${groupedSnps[chr].length}`
  ).join(', ');
  
  logger.info(`SNPs grouped by chromosome: ${chrCounts}`);
  
  return groupedSnps;
};

/**
 * Formats genomic coordinates in standard format (chr:start-end)
 * @param {string} chromosome - Chromosome number or name
 * @param {number} start - Start position
 * @param {number} end - End position
 * @returns {string} Formatted genomic coordinates
 */
const formatGenomicCoordinates = (chromosome, start, end) => {
  return `${chromosome}:${Math.floor(start)}-${Math.floor(end)}`;
};

/**
 * Converts p-value to -log10 scale (commonly used in GWAS visualization)
 * @param {number} pValue - P-value (between 0 and 1)
 * @returns {number} -log10(p-value)
 */
const convertToNegLog10 = (pValue) => {
  if (pValue <= 0 || pValue > 1) {
    logger.warn(`Invalid p-value: ${pValue}`);
    return null;
  }
  
  return -Math.log10(pValue);
};

module.exports = {
  getUniqueSnps,
  groupSnpsByChromosome,
  formatGenomicCoordinates,
  convertToNegLog10
};
