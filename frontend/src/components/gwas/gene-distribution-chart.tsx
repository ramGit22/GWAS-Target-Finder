import React, { useMemo } from 'react'
import { GeneTarget } from '@/lib/api/gwas'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from 'recharts'

interface GeneDistributionChartProps {
  results: GeneTarget[]
}

// Custom tooltip component for better control over formatting
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{`Chromosome ${label}`}</p>
        {payload.map((entry, index) => {
          // Explicitly map the data keys to display names
          const displayName = entry.dataKey === 'count' ? 'Total Genes' : 'Drug Targets';
          return (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${displayName}: ${entry.value} genes`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export function GeneDistributionChart({ results }: GeneDistributionChartProps) {
  // Skip rendering if no results
  if (!results || results.length === 0) return null

  // Process data for visualization
  const data = useMemo(() => {
    // Get chromosome distribution
    const chromosomeData: Record<
      string,
      { count: number; drugTargets: number }
    > = {}

    // Group by chromosome
    results.forEach((result) => {
      const chromosome = result.snp_location.split(':')[0]

      if (!chromosomeData[chromosome]) {
        chromosomeData[chromosome] = { count: 0, drugTargets: 0 }
      }

      chromosomeData[chromosome].count += 1

      if (result.is_drug_target) {
        chromosomeData[chromosome].drugTargets += 1
      }
    })

    // Convert to array format for chart
    const chartData = Object.entries(chromosomeData)
      .map(([chr, stats]) => ({
        chromosome: chr,
        count: stats.count,
        drugTargets: stats.drugTargets,
      }))
      .sort((a, b) => {
        // Sort numerically, but X and Y at the end
        if (a.chromosome === 'X') return 1
        if (b.chromosome === 'X') return -1
        if (a.chromosome === 'Y') return 1
        if (b.chromosome === 'Y') return -1
        return parseInt(a.chromosome) - parseInt(b.chromosome)
      })

    return chartData
  }, [results])
  console.log('Chromosome data:', data)

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
                label={{
                  value: 'Gene Count',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<CustomTooltip />} />
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
  )
}
