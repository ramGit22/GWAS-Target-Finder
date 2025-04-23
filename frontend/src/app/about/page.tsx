'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About GWAS Target Finder</h1>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                The GWAS Target Finder is a tool designed to help researchers identify potential therapeutic targets
                from genome-wide association studies (GWAS) data. It integrates information from multiple bioinformatics
                resources to provide a seamless workflow for identifying druggable genes associated with specific traits
                or diseases.
              </p>
              <p>
                This application is particularly useful for researchers in genomics, drug discovery, and personalized
                medicine who want to quickly move from genetic associations to potential therapeutic targets.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-4">
                <li>
                  <strong>Input a trait or disease:</strong> Start by entering a trait name or EFO ID (e.g., "Type 2 diabetes" or "EFO_0001360").
                  You can also adjust the p-value threshold and genomic window size.
                </li>
                <li>
                  <strong>Fetch significant SNPs:</strong> The system queries the GWAS Catalog to retrieve SNPs significantly
                  associated with your trait of interest.
                </li>
                <li>
                  <strong>Map to genomic coordinates:</strong> Each SNP is mapped to its precise genomic location using
                  data from the Ensembl database.
                </li>
                <li>
                  <strong>Identify nearby genes:</strong> Protein-coding genes within the specified window of each SNP
                  are identified.
                </li>
                <li>
                  <strong>Check drug target status:</strong> The Open Targets Platform is used to determine which of the
                  identified genes are known drug targets.
                </li>
                <li>
                  <strong>Analyze results:</strong> The results are presented in an interactive table and visualizations,
                  allowing you to explore the findings and filter for genes of interest.
                </li>
              </ol>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg mb-1">GWAS Catalog</h3>
                  <p className="text-sm text-gray-600">
                    The NHGRI-EBI GWAS Catalog is a database of SNP-trait associations extracted from published
                    genome-wide association studies. It provides a comprehensive resource of associations between genetic
                    variants and phenotypic traits.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-1">Ensembl</h3>
                  <p className="text-sm text-gray-600">
                    Ensembl is a genome browser that provides annotations for the genomes of various species. We use
                    Ensembl to map SNPs to genomic coordinates and identify nearby genes.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg mb-1">Open Targets Platform</h3>
                  <p className="text-sm text-gray-600">
                    The Open Targets Platform is a resource that integrates genetic and genomic data to help identify
                    and prioritize drug targets. We use this platform to check if the identified genes are known drug targets.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Technical Architecture</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                The GWAS Target Finder consists of a Node.js/Express.js backend API and a Next.js frontend application:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Backend:</strong> RESTful API built with Node.js and Express.js that handles the data retrieval
                  and processing from external databases.
                </li>
                <li>
                  <strong>Frontend:</strong> Modern web interface built with Next.js, React, TypeScript, and Tailwind CSS
                  with shadcn UI components.
                </li>
                <li>
                  <strong>Data Flow:</strong> The frontend communicates with the backend API, which in turn queries the
                  external databases (GWAS Catalog, Ensembl, Open Targets) and processes the results.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
