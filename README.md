# GWAS Target Finder

A full-stack application for identifying protein-coding genes near significant genetic variants (SNPs) associated with a specified trait or disease, and checking if these genes are known drug targets.

## Project Overview

This project consists of two main components:

1. **Backend (Node.js/Express.js)**: A RESTful API that integrates data from multiple bioinformatics databases.
2. **Frontend (Next.js)**: A user-friendly interface for searching and displaying results.

The application helps researchers identify potential therapeutic targets by:
- Fetching GWAS SNPs associated with specific traits
- Mapping SNPs to genomic coordinates
- Finding nearby protein-coding genes
- Checking which genes are known drug targets
- Displaying the results in an interactive format

## Backend

### Technologies Used

- **Node.js & Express.js**: Core server framework
- **Axios**: For external API requests
- **Winston**: For structured logging
- **Express Validator**: For input validation
- **Express Rate Limit**: For API protection

### Features

- **GWAS Catalog Integration**: Fetches SNPs associated with traits
- **Ensembl API Integration**: Maps SNPs to genomic locations and finds nearby genes
- **Open Targets Integration**: Checks if genes are drug targets
- **Caching System**: Reduces redundant API calls
- **Error Handling**: Comprehensive error management
- **Rate Limiting**: Prevents API abuse

### API Endpoints

- **GET /**: Health check endpoint
- **POST /api/find-targets**: Main endpoint for finding genes near SNPs

## Frontend

### Technologies Used

- **Next.js**: React framework for the web interface
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **shadcn/ui**: Modern UI component library
- **React Query**: For data fetching
- **Recharts**: For data visualization

### Features

- **Search Interface**: User-friendly search by trait or EFO ID
- **Results View**: Interactive table with sorting and filtering
- **Gene Details**: Detailed information about each gene
- **External Resources**: Quick links to Ensembl, Open Targets, etc.
- **Responsive Design**: Works on various screen sizes

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/gwas-target-finder.git
cd gwas-target-finder/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your settings

# Start development server
npm run dev

# For production
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Update API URL if needed

# Start development server
npm run dev

# For production
npm run build
npm start
```

## Usage

1. Access the frontend application (default: http://localhost:3000)
2. Enter a trait name or EFO ID (e.g., "Type 2 diabetes" or "EFO_0001360")
3. Optionally adjust p-value threshold and genomic window size
4. View the results in the interactive table
5. Click on any gene to see detailed information

## Example Data

The application returns data in the following format:

```json
{
  "results": [
    {
      "gwas_snp": "rs9497975",
      "snp_location": "6:148226666",
      "nearby_gene_symbol": "SASH1",
      "nearby_gene_ensembl_id": "ENSG00000111961",
      "is_drug_target": false
    },
    {
      "gwas_snp": "rs2282978",
      "snp_location": "7:92635096",
      "nearby_gene_symbol": "CDK6",
      "nearby_gene_ensembl_id": "ENSG00000105810",
      "is_drug_target": true
    }
  ]
}
```

## External APIs Used

1. **EBI GWAS Catalog REST API**
   - Base URL: https://www.ebi.ac.uk/gwas/rest/api
   - Used to fetch SNPs associated with a trait

2. **Ensembl REST API**
   - Base URL: https://rest.ensembl.org
   - Used to map SNPs to genomic locations and identify nearby genes

3. **Open Targets Platform GraphQL API**
   - URL: https://api.platform.opentargets.org/api/v4/graphql
   - Used to check if genes are known drug targets

## Architecture

```
gwas-target-finder/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration settings
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic and API clients
│   │   ├── utils/          # Helper utilities
│   │   └── index.js        # Entry point
│   ├── .env                # Environment variables
│   └── package.json        # Project metadata
│
└── frontend/
    ├── components/         # React components
    │   ├── gwas/           # Domain-specific components
    │   ├── layout/         # Layout components
    │   └── ui/             # UI components
    ├── lib/                # Utilities and API clients
    ├── app/                # Next.js app router
    ├── public/             # Static assets
    ├── .env.local          # Environment variables
    └── package.json        # Project metadata
```

## Future Enhancements

- Database integration for saving search results
- User authentication for personalized features
- Advanced filtering options
- Bulk search capabilities
- Integration with additional genomic databases

## License

MIT

## Acknowledgements

- European Bioinformatics Institute (EBI) for the GWAS Catalog
- Ensembl for genomic data
- Open Targets Platform for drug target information

---

For questions or issues, please create an issue on the GitHub repository.
