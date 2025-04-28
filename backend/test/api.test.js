const request = require('supertest');
const app = require('../src/index');

// Mock services to avoid actual API calls
jest.mock('../src/services/gwasService', () => ({
  fetchSignificantSnps: jest.fn()
}));

jest.mock('../src/services/ensemblService', () => ({
  getSnpLocations: jest.fn(),
  findNearbyGenes: jest.fn()
}));

jest.mock('../src/services/openTargetsService', () => ({
  checkDrugTargets: jest.fn()
}));

const gwasService = require('../src/services/gwasService');
const ensemblService = require('../src/services/ensemblService');
const openTargetsService = require('../src/services/openTargetsService');

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return health check status', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('message', 'GWAS Target Finder API is running');
    });
  });

  describe('POST /api/find-targets', () => {
    it('should return 400 if trait is missing', async () => {
      const res = await request(app)
        .post('/api/find-targets')
        .send({});
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('Trait is required');
    });

    it('should return empty results if no SNPs found', async () => {
      gwasService.fetchSignificantSnps.mockResolvedValue([]);

      const res = await request(app)
        .post('/api/find-targets')
        .send({ trait: 'EFO_0001360' });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('results');
      expect(res.body.results).toEqual([]);
      expect(res.body).toHaveProperty('message');
      expect(gwasService.fetchSignificantSnps).toHaveBeenCalledWith('EFO_0001360', undefined, 500);
    });

    it('should respect custom max_results parameter', async () => {
      // Mock service responses
      gwasService.fetchSignificantSnps.mockResolvedValue([
        { rsId: 'rs123', pValue: 1e-8 }
      ]);
      
      ensemblService.findNearbyGenes.mockResolvedValue([
        { ensemblId: 'ENSG000001', symbol: 'GENE1' }
      ]);
      
      openTargetsService.checkDrugTargets.mockResolvedValue({
        'ENSG000001': true
      });

      const res = await request(app)
        .post('/api/find-targets')
        .send({ 
          trait: 'EFO_0001360',
          p_value: 1e-5,
          max_results: 200
        });
      
      expect(res.statusCode).toEqual(200);
      expect(gwasService.fetchSignificantSnps).toHaveBeenCalledWith('EFO_0001360', 1e-5, 200);
    });

    it('should process valid request and return formatted results', async () => {
      // Mock service responses
      gwasService.fetchSignificantSnps.mockResolvedValue([
        { rsId: 'rs123', pValue: 1e-8 }
      ]);
      
      ensemblService.getSnpLocations.mockResolvedValue([
        { rsId: 'rs123', pValue: 1e-8, chromosome: '1', position: 12345, location: '1:12345' }
      ]);
      
      ensemblService.findNearbyGenes.mockResolvedValue([
        { ensemblId: 'ENSG000001', symbol: 'GENE1' }
      ]);
      
      openTargetsService.checkDrugTargets.mockResolvedValue({
        'ENSG000001': true
      });

      const res = await request(app)
        .post('/api/find-targets')
        .send({ 
          trait: 'EFO_0001360',
          p_value: 1e-5,
          window_kb: 200
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('results');
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0]).toHaveProperty('gwas_snp', 'rs123');
      expect(res.body.results[0]).toHaveProperty('is_drug_target', true);
      
      // Verify service calls with correct parameters
      expect(gwasService.fetchSignificantSnps).toHaveBeenCalledWith('EFO_0001360', 1e-5, 500);
      expect(ensemblService.findNearbyGenes).toHaveBeenCalledWith('1', 12345, 200);
    });
  });
});
