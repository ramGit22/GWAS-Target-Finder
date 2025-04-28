import React, { useMemo } from 'react';
import { GeneTarget } from '@/lib/api/gwas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GeneDistributionChartProps {
  results: GeneTarget[];
}

export function GeneDistributionChart({ results }: GeneDistributionChartProps) {
  // Skip rendering if no results
  if (!results || results.length === 0) return null;
  
  // Process data for visualization
  const data = useMemo(() => {
    // Get chromosome distribution
    const chromosomeData: Record<string, { count: number, drugTargets: number }> = {};
    
    // Group by chromosome
    results.forEach(result => {
      const chromosome = result.snp_location.split(':')[0];
      
      if (!chromosomeData[chromosome]) {
        chromosomeData[chromosome] = { count: 0, drugTargets: 0 };
      }
      
      chromosomeData[chromosome].count += 1;
      
      if (result.is_drug_target) {
        chromosomeData[chromosome].drugTargets += 1;
      }
    });
    
    // Convert to array format for chart
    const chartData = Object.entries(chromosomeData)
      .map(([chr, stats]) => ({
        chromosome: chr,
        count: stats.count,
        drugTargets: stats.drugTargets
      }))
      .sort((a, b) => {
        // Sort numerically, but X and Y at the end
        if (a.chromosome === 'X') return 1;
        if (b.chromosome === 'X') return -1;
        if (a.chromosome === 'Y') return 1;
        if (b.chromosome === 'Y') return -1;
        return parseInt(a.chromosome) - parseInt(b.chromosome);
      });
    
    return chartData;
  }, [results]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Chromosomal Distribution</CardTitle>
        <CardDescription>Distribution of genes by chromosome</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <XAxis 
                dataKey="chromosome" 
                label={{ value: 'Chromosome', position: 'bottom', offset: 0 }}
              />
              <YAxis 
                label={{ value: 'Gene Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value, name) => {
                  return [`${value} genes`, name === 'count' ? 'Total' : 'Drug Targets'];
                }}
                labelFormatter={(label) => `Chromosome ${label}`}
              />
              <Bar dataKey="count" fill="#8884d8" name="Total Genes">
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.drugTargets > 0 ? '#8884d8' : '#ccc'} 
                  />
                ))}
              </Bar>
              <Bar dataKey="drugTargets" fill="#82ca9d" name="Drug Targets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
