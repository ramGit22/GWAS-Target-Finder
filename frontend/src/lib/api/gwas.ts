import axios from 'axios';

// Define the API base URL - can be adjusted based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.origin) || 
  'http://localhost:3000';

// Define the result type from the backend
export interface GeneTarget {
  gwas_snp: string;
  snp_location: string;
  functional_class: string;
  nearby_gene_symbol: string;
  nearby_gene_ensembl_id: string;
  distance_to_gene: number;
  is_within_gene: boolean;
  is_drug_target: boolean;
}

export interface FindTargetsResponse {
  results: GeneTarget[];
  warnings?: string[];
}

// API client for the GWAS Target Finder service
const gwasApi = {
  // Health check endpoint
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/`);
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Find targets endpoint
  findTargets: async (
    trait: string,
    p_value?: number,
    window_kb?: number
  ): Promise<FindTargetsResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/find-targets`, {
        trait,
        p_value,
        window_kb,
      });
      return response.data;
    } catch (error) {
      console.error('Find targets request failed:', error);
      throw error;
    }
  },
};

export default gwasApi;