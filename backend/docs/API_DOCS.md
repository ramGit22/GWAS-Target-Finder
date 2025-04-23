# GWAS Target Finder API Documentation

## Overview

The GWAS Target Finder API identifies protein-coding genes near significant genetic variants (SNPs) associated with a specified trait or disease and checks if these genes are known drug targets. It integrates data from the GWAS Catalog, Ensembl, and Open Targets Platform to provide a comprehensive view of potential therapeutic targets.

## Base URL

```
http://localhost:3000
```

## Endpoints

### Health Check

Check if the API is running.

- **URL:** `/`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:**
    ```json
    {
      "status": "ok",
      "message": "GWAS Target Finder API is running",
      "version": "1.0.0"
    }
    ```

### Find Targets

Find protein-coding genes near SNPs associated with a specified trait and check if they are drug targets.

- **URL:** `/api/find-targets`
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Rate Limit:** 60 requests per minute
- **Request Body:**
  ```json
  {
    "trait": "EFO_0001360",  // Required: Trait name or EFO ID (e.g., Type 2 diabetes)
    "p_value": 1e-5,         // Optional: P-value threshold (default: 5e-8)
    "window_kb": 100         // Optional: Genomic window in kilobases (default: 100 kb)
  }
  ```

- **Success Response:**
  - **Code:** 200
  - **Content:**
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
      "warnings": []  // Optional warnings, e.g., if the drug target API fails
    }
    ```

- **Error Response:**
  - **Code:** 400 (Bad Request)
  - **Content:**
    ```json
    {
      "status": "error",
      "message": "Validation error: Trait is required"
    }
    ```
  - **Code:** 429 (Too Many Requests)
  - **Content:**
    ```json
    {
      "status": "error",
      "message": "Too many requests, please try again later."
    }
    ```
  - **Code:** 500 (Internal Server Error)
  - **Content:**
    ```json
    {
      "status": "error",
      "message": "An unexpected error occurred"
    }
    ```

## Request Parameters

### Trait

The `trait` parameter can be specified in several formats:

1. **EFO ID** (Experimental Factor Ontology): `EFO_0001360` (Type 2 diabetes)
2. **Orphanet ID**: `Orphanet_98765` (Rare disease ID)
3. **HP ID** (Human Phenotype Ontology): `HP_0001234` (Phenotype ID)
4. **MONDO ID** (Mondo Disease Ontology): `MONDO_0005148` (Disease ID)
5. **Trait name**: `Type 2 diabetes` (Plain text trait name)

### P-value

The `p_value` parameter represents the significance threshold for GWAS associations:

- Default: `5e-8` (genome-wide significance)
- Range: 0 to 1
- Example: `1e-5` (suggestive association)

Lower p-values indicate stronger associations.

### Window Size

The `window_kb` parameter defines the genomic window size around each SNP to search for genes:

- Default: `100` (kilobases)
- Range: 1 to 1000 (kilobases)
- Example: `500` (500 kb window)

A larger window will find more distant genes but may include genes unrelated to the causal variant.

## External APIs Used

The API integrates data from three external sources:

1. **EBI GWAS Catalog REST API**
   - Provides SNPs associated with traits from genome-wide association studies
   - [GWAS Catalog API Documentation](https://www.ebi.ac.uk/gwas/rest/docs/)

2. **Ensembl REST API**
   - Maps SNPs to genomic coordinates and identifies nearby genes
   - [Ensembl REST API Documentation](https://rest.ensembl.org/)

3. **Open Targets Platform GraphQL API**
   - Determines if genes are known drug targets
   - [Open Targets Platform API Documentation](https://platform.opentargets.org/api)

## Error Handling

The API implements the following error handling strategies:

1. **Input Validation**: Validates all request parameters before processing
2. **Rate Limiting**: Prevents API abuse with a limit of 60 requests per minute
3. **Retry Logic**: Automatically retries failed external API calls with exponential backoff
4. **Graceful Degradation**: Returns partial results with warnings if one component fails
5. **Detailed Error Messages**: Provides informative error messages for troubleshooting

## Performance Considerations

The API implements several optimizations:

1. **Caching**: Frequent queries are cached to reduce external API calls
2. **Batch Processing**: Large requests are processed in batches to optimize performance
3. **Concurrency Control**: Limits concurrent external API calls to prevent rate limiting

## Example Usage

### cURL

```bash
curl -X POST http://localhost:3000/api/find-targets \
  -H "Content-Type: application/json" \
  -d '{"trait": "EFO_0001360", "p_value": 1e-5, "window_kb": 100}'
```

### JavaScript Fetch

```javascript
fetch('http://localhost:3000/api/find-targets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    trait: 'EFO_0001360',
    p_value: 1e-5,
    window_kb: 100
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error(error));
```

## Rate Limiting

The API is limited to 60 requests per minute per IP address. If you exceed this limit, you will receive a 429 status code. Please respect these limits to ensure service availability for all users.
