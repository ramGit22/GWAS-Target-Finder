# GWAS Target Finder API

A Node.js/Express.js backend service that identifies protein-coding genes near significant genetic variants (SNPs) associated with a specified trait or disease, and checks if these genes are known drug targets.

## Overview

This API helps researchers and bioinformaticians study genetic associations and potential therapeutic targets by:

1. Fetching GWAS SNPs associated with a specified trait
2. Getting genomic coordinates for those SNPs
3. Finding nearby protein-coding genes
4. Checking which genes are known drug targets
5. Returning the results as a comprehensive list

## Installation

```bash
# Clone the repository
git clone [repository-url]
cd gwas-target-finder-api

# Install dependencies
npm install

# Copy .env.example to .env and modify as needed
cp .env.example .env
```

## Usage

```bash
# Start in development mode
npm run dev

# Start in production mode
npm start
```

## API Endpoints

### Health Check

- **URL:** `GET /`
- **Description:** Simple health check to verify the API is running.
- **Response:**
  ```json
  {
    "status": "ok",
    "message": "GWAS Target Finder API is running",
    "version": "1.0.0"
  }
  ```

### Find Targets

- **URL:** `POST /api/find-targets`
- **Description:** Main endpoint to find genes near GWAS SNPs and check if they are drug targets.
- **Request Body:**
  ```json
  {
    "trait": "EFO_0001360",  // Trait name or EFO ID (e.g., Type 2 diabetes)
    "p_value": 1e-5,         // P-value threshold (default: 5e-8)
    "window_kb": 100         // Genomic window in kilobases (default: 100 kb)
  }
  ```
- **Response:**
  ```json
  {
    "results": [
      {
        "gwas_snp": "rs123456",
        "snp_location": "1:123456",
        "nearby_gene_symbol": "GENE1",
        "nearby_gene_ensembl_id": "ENSG00000123456",
        "is_drug_target": true
      }
    ],
    "warnings": [] // Optional warnings, e.g., if drug target API fails
  }
  ```

## External APIs Used

1. **EBI GWAS Catalog REST API**
   - Base URL: https://www.ebi.ac.uk/gwas/rest/api
   - Used to fetch SNPs associated with a trait, filtered by p-value.

2. **Ensembl REST API**
   - Base URL: https://rest.ensembl.org
   - Used to map SNPs to genomic locations and identify nearby genes.

3. **Open Targets Platform GraphQL API**
   - URL: https://api.platform.opentargets.org/api/v4/graphql
   - Used to check if genes are known drug targets.

## Environment Variables

The following environment variables can be set in the `.env` file:

```
PORT=3000
NODE_ENV=development
GWAS_CATALOG_API_URL=https://www.ebi.ac.uk/gwas/rest/api
ENSEMBL_API_URL=https://rest.ensembl.org
OPEN_TARGETS_API_URL=https://api.platform.opentargets.org/api/v4/graphql
DEFAULT_P_VALUE=5e-8
DEFAULT_WINDOW_KB=100
MAX_REQUESTS_PER_MINUTE=60
```

## Testing

```bash
# Run tests
npm test
```

## Documentation

API documentation is available in Swagger format in `docs/swagger.json`.

## License

MIT
