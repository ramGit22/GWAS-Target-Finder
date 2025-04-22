/**
 * Custom validators for genomic data
 */

/**
 * Validates if the input is a valid EFO ID or trait name
 * @param {string} value - The trait value to validate
 * @returns {boolean} Whether the value is valid
 */
const isValidTrait = (value) => {
  // Accept EFO IDs in the format EFO_0000000
  if (/^EFO_\d+$/.test(value)) {
    return true;
  }
  
  // Accept Orphanet IDs
  if (/^Orphanet_\d+$/.test(value)) {
    return true;
  }
  
  // Accept HP IDs (Human Phenotype Ontology)
  if (/^HP_\d+$/.test(value)) {
    return true;
  }
  
  // Accept MONDO IDs (Mondo Disease Ontology)
  if (/^MONDO_\d+$/.test(value)) {
    return true;
  }
  
  // Accept trait names (alphanumeric with spaces and some special characters)
  if (/^[A-Za-z0-9\s\-_,.()]+$/.test(value) && value.length >= 3) {
    return true;
  }
  
  return false;
};

/**
 * Validates if the input is a valid p-value (between 0 and 1)
 * @param {number} value - The p-value to validate
 * @returns {boolean} Whether the value is valid
 */
const isValidPValue = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && num <= 1;
};

/**
 * Validates if the input is a valid window size in kb (between 1 and 1000)
 * @param {number} value - The window size to validate
 * @returns {boolean} Whether the value is valid
 */
const isValidWindowSize = (value) => {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 1 && num <= 1000;
};

module.exports = {
  isValidTrait,
  isValidPValue,
  isValidWindowSize
};
