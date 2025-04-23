import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GeneTarget } from '@/lib/api/gwas';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend, PieChart, Pie } from 'recharts';

interface GeneDistributionChartProps {
  results: GeneTarget[];
}

export function GeneDistributionChart({ results }: GeneDistributionChartProps) {
  // Process data for chromosome distribution chart
  const chromosomeData = useMemo(() => {
    // Extract chromosomes and count occurrences
    const chromosomeCounts = results.reduce((acc, result) => {
      const chromosome = result.snp_location.split(':')[0];
      if (!acc[chromosome]) {
        acc[chromosome] = { total: 0, drugTargets: 0 };
      }
      acc[chromosome].total++;
      if (result.is_drug_target) {
        acc[chromosome].drugTargets++;
      }
      return acc;
    }, {} as Record<string, { total: number; drugTargets: number }>);

    // Convert to array for chart and sort by chromosome number
    return Object.entries(chromosomeCounts)
      .map(([chromosome, counts]) => ({
        chromosome,
        count: counts.total,
        drugTargetCount: counts.drugTargets,
        nonDrugTargetCount: counts.total - counts.drugTargets
      }))
      .sort((a, b) => {
        // Sort numerically, but handle X, Y, etc.
        const aNum = parseInt(a.chromosome);
        const bNum = parseInt(b.chromosome);
        
        if (isNaN(aNum) && isNaN(bNum)) {
          return a.chromosome.localeCompare(b.chromosome);
        }
        if (isNaN(aNum)) return 1;
        if (isNaN(bNum)) return -1;
        return aNum - bNum;
      });
  }, [results]);

  // Process data for drug target pie chart
  const drugTargetPieData = useMemo(() => {
    const drugTargets = results.filter(r => r.is_drug_target).length;
    const nonDrugTargets = results.length - drugTargets;
    
    return [
      { name: 'Drug Targets', value: drugTargets, color: '#4caf50' },
      { name: 'Not Drug Targets', value: nonDrugTargets, color: '#8884d8' }
    ];
  }, [results]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 h-80">
        <CardHeader>
          <CardTitle>Genes by Chromosome</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chromosomeData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <XAxis 
                dataKey="chromosome" 
                label={{ value: 'Chromosome', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ value: 'Number of Genes', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value, name, props) => {
                  const label = name === 'drugTargetCount' ? 'Drug Targets' : name === 'nonDrugTargetCount' ? 'Not Drug Targets' : 'Total';
                  return [`${value} genes`, label];
                }}
                labelFormatter={(label) => `Chromosome ${label}`}
              />
              <Legend />
              <Bar dataKey="nonDrugTargetCount" name="Not Drug Targets" stackId="a" fill="#8884d8" />
              <Bar dataKey="drugTargetCount" name="Drug Targets" stackId="a" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="h-80">
        <CardHeader>
          <CardTitle>Drug Target Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={drugTargetPieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {drugTargetPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} genes`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
