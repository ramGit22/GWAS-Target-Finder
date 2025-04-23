# GWAS Target Finder API - Project Summary

## Overview

The GWAS Target Finder API is a Node.js/Express.js backend service that helps researchers identify potential drug targets associated with specific genetic traits or diseases. The service integrates data from three major bioinformatics resources:

1. **GWAS Catalog** - For genetic variant associations
2. **Ensembl** - For genomic coordinates and gene identification
3. **Open Targets Platform** - For drug target information

## Project Architecture

The project follows a clean, modular MERN-style architecture:

```
gwas-target-finder-api/
├── src/
│   ├── config/         # Configuration settings
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic and external API clients
│   ├── utils/          # Helper utilities
│   └── index.js        # Entry point
├── docs/               # Documentation
├── test/               # Test files
├── .env                # Environment variables
├── .env.example        # Environment template
└── package.json        # Project metadata
```

## Key Features

1. **Trait-Based SNP Retrieval**: Fetches significant SNPs from the GWAS Catalog based on trait identifiers
2. **Genomic Coordinate Mapping**: Maps SNPs to their precise genomic locations using Ensembl
3. **Nearby Gene Identification**: Finds protein-coding genes within a specified window around each SNP
4. **Drug Target Validation**: Checks if the identified genes are known drug targets
5. **Comprehensive Results**: Returns a unified list of SNP-gene-drug target associations

## Technical Highlights

1. **Robust Error Handling**: Comprehensive error handling with custom ApiError class
2. **Caching System**: In-memory cache with TTL to reduce redundant API calls
3. **Rate Limiting**: Both internal (for external APIs) and external (for API users)
4. **Batch Processing**: Handles large requests in batches to optimize performance
5. **Retry Logic**: Implements exponential backoff for failed API requests
6. **Validation**: Thorough input validation with custom genomic data validators
7. **Logging**: Structured logging with Winston for better debugging and monitoring

## Performance Optimizations

1. **SNP Batching**: Processes SNPs in batches to avoid overwhelming external APIs
2. **Parallel Processing**: Uses concurrent requests with controlled concurrency
3. **Caching Strategy**: Different TTLs for different data types (locations vs. drug targets)
4. **Response Streaming**: Progressive processing and response generation for large datasets

## API Endpoints

1. **Health Check**: `GET /` - Simple health check endpoint
2. **Find Targets**: `POST /api/find-targets` - Main endpoint for finding genes near SNPs

## Security Measures

1. **Helmet Integration**: Sets secure HTTP headers
2. **Rate Limiting**: Prevents API abuse
3. **Input Sanitization**: Validates and sanitizes all inputs
4. **Error Message Sanitization**: Hides implementation details in production

## Testing

The project includes unit tests with Jest for the key functionality:
- API endpoint tests
- Service layer tests with mocked external APIs
- Validation logic tests

## Configuration

The API is highly configurable through environment variables:
- External API URLs
- Default parameter values
- Performance settings
- Security options

## Future Enhancements

Potential future improvements include:
1. **MongoDB Integration**: Store and retrieve past query results
2. **Webhook Notifications**: For long-running queries
3. **Pagination**: For very large result sets
4. **Advanced Filtering**: More granular control over the results
5. **User Authentication**: For more secure access control

## Getting Started

1. Clone the repository
2. Run `npm install`
3. Configure the `.env` file
4. Start the server with `npm start`
5. Access the API at `http://localhost:3001/`

## Documentation

Detailed documentation is available in:
- `README.md`: Basic usage instructions
- `docs/API_DOCS.md`: Comprehensive API documentation
- `docs/swagger.json`: Swagger/OpenAPI specification
