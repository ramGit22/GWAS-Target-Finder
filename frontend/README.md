# GWAS Target Finder - Frontend

A Next.js frontend application for the GWAS Target Finder API. This application allows users to search for protein-coding genes near significant genetic variants (SNPs) associated with a specified trait or disease, and checks if these genes are known drug targets.

## Overview

This frontend provides an intuitive user interface for interacting with the GWAS Target Finder API. It allows users to:

1. Search for targets by trait or EFO ID
2. Visualize the distribution of genes across chromosomes
3. View comprehensive results in a sortable and filterable table
4. Explore detailed information about each gene

## Technologies Used

- **Next.js**: React framework for building the web application
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **shadcn/ui**: Modern UI component library built on Radix UI
- **React Query**: For data fetching and state management
- **Recharts**: For data visualization

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd gwas-target-finder/frontend

# Install dependencies
npm install
# or
yarn install
```

### Configuration

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Replace the URL with your backend API URL.

### Development

```bash
# Start the development server
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Production Build

```bash
# Build the application
npm run build
# or
yarn build

# Start the production server
npm start
# or
yarn start
```

## Features

### Search Form

- Search for targets by trait name or EFO ID
- Set custom p-value threshold
- Adjust genomic window size

### Results Visualization

- Summary statistics dashboard
- Gene distribution by chromosome
- Drug target pie chart

### Results Table

- Sortable columns
- Filter by gene symbol
- Pagination
- Detailed gene information

## Folder Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   │   ├── gwas/         # Domain-specific components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Utilities
│   │   └── api/          # API clients
│   └── types/            # TypeScript types
├── .env.local            # Environment variables
└── ...
```

## License

MIT
