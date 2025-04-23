import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneTarget } from '@/lib/api/gwas';

interface SummaryStatsProps {
  results: GeneTarget[];
}

export function SummaryStats({ results }: SummaryStatsProps) {
  // Calculate summary statistics
  const totalGenes = results.length;
  const uniqueGenes = new Set(results.map(r => r.nearby_gene_symbol)).size;
  const drugTargets = results.filter(r => r.is_drug_target).length;
  const uniqueSnps = new Set(results.map(r => r.gwas_snp)).size;
  
  // Calculate percentage of drug targets
  const drugTargetPercentage = totalGenes > 0 
    ? Math.round((drugTargets / uniqueGenes) * 100) 
    : 0;

  // Group by chromosome
  const chromosomeStats = results.reduce((acc, result) => {
    const chromosome = result.snp_location.split(':')[0];
    if (!acc[chromosome]) {
      acc[chromosome] = 0;
    }
    acc[chromosome]++;
    return acc;
  }, {} as Record<string, number>);

  const topChromosomes = Object.entries(chromosomeStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Genes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalGenes}</div>
          <p className="text-xs text-muted-foreground">
            {uniqueGenes} unique genes identified
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">GWAS SNPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueSnps}</div>
          <p className="text-xs text-muted-foreground">
            Unique genetic variants 
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Drug Targets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{drugTargets}</div>
          <p className="text-xs text-muted-foreground">
            {drugTargetPercentage}% of unique genes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Chromosome</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topChromosomes.length > 0 ? topChromosomes[0][0] : 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            {topChromosomes.length > 0 ? `${topChromosomes[0][1]} genes found` : 'No data'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
