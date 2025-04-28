/**
 * External API configuration
 */
module.exports = {
  // GWAS Catalog API
  gwas: {
    baseUrl: process.env.GWAS_CATALOG_API_URL || 'https://www.ebi.ac.uk/gwas/rest/api',
    endpoints: {
      associations: '/associations',
      snpsByTrait: '/singleNucleotidePolymorphisms/search/findByDiseaseTrait'
    },
    defaultParams: {
      pValue: process.env.DEFAULT_P_VALUE || 5e-8
    }
  },
  
  // Ensembl API
  ensembl: {
    baseUrl: process.env.ENSEMBL_API_URL || 'https://rest.ensembl.org',
    endpoints: {
      variation: '/variation/human',
      overlap: '/overlap/region/human'
    },
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    defaultParams: {
      windowKb: process.env.DEFAULT_WINDOW_KB || 100
    }
  },
  
  // Open Targets Platform API
  openTargets: {
    url: process.env.OPEN_TARGETS_API_URL || 'https://api.platform.opentargets.org/api/v4/graphql',
    headers: {
      'Content-Type': 'application/json'
    }
  }
};