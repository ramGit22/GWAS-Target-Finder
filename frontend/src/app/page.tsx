'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { SearchForm } from '@/components/gwas/search-form';
import { ResultsTable } from '@/components/gwas/results-table';
import { SummaryStats } from '@/components/gwas/summary-stats';
import { GeneDistributionChart } from '@/components/gwas/gene-distribution-chart';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import gwasApi, { GeneTarget, FindTargetsResponse } from '@/lib/api/gwas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample data for initial development/testing
import sampleData from '@/lib/sample-data';

export default function Home() {
  const [results, setResults] = useState<GeneTarget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (trait: string, pValue?: number, windowKb?: number) => {
    setIsLoading(true);
    setError(null);
    setWarnings([]);
    
    try {
      // Use the actual API endpoint
      const response = await gwasApi.findTargets(trait, pValue, windowKb);
      
      // Fallback to sample data only if API call fails
      // const response = {
      //   results: sampleData.results,
      //   warnings: []
      // } as FindTargetsResponse;
      
      setResults(response.results);
      if (response.warnings) {
        setWarnings(response.warnings);
      }
      setHasSearched(true);
    } catch (err) {
      console.error('Error searching for targets:', err);
      setError('Failed to fetch results. Please try again later.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Title section */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Identify Potential Drug Targets from GWAS Data
          </h2>
          <p className="text-gray-600">
            Enter a trait or disease to find protein-coding genes near significant genetic variants
            and check if they are known drug targets.
          </p>
        </div>
        
        {/* Search form */}
        <div className="mb-8">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Results section */}
        {isLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Searching for targets...</p>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        ) : hasSearched && results.length === 0 ? (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">No Results Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-800">
                No significant SNPs or nearby genes were found for this trait.
                Try adjusting your search parameters.
              </p>
            </CardContent>
          </Card>
        ) : results.length > 0 ? (
          <div className="space-y-8">
            {/* Display warnings if any */}
            {warnings.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">Warnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5">
                    {warnings.map((warning, index) => (
                      <li key={index} className="text-yellow-800">{warning}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            
            {/* Summary statistics */}
            <SummaryStats results={results} />
            
            {/* Visualization */}
            <GeneDistributionChart results={results} />
            
            {/* Results table */}
            <ResultsTable results={results} />
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
}
