import React from 'react'
import { GeneTarget } from '@/lib/api/gwas'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SummaryStatsProps {
  results: GeneTarget[]
}

export function SummaryStats({ results }: SummaryStatsProps) {
  // Skip rendering if no results
  if (!results || results.length === 0) return null

  // Calculate summary statistics
  const uniqueSnpsCount = new Set(results.map((r) => r.gwas_snp)).size
  const uniqueGenesCount = new Set(results.map((r) => r.nearby_gene_ensembl_id))
    .size
  const drugTargetCount = results.filter((r) => r.is_drug_target).length
  const withinGeneCount = results.filter((r) => r.is_within_gene).length

  // Count variant types
  const variantTypes = Array.from(
    new Set(results.map((r) => r.functional_class))
  )
  const variantCounts = variantTypes.map((type) => ({
    type,
    count: results.filter((r) => r.functional_class === type).length,
    label: type.replace('_variant', '').replace(/_/g, ' '),
  }))

  // Sort variant counts by frequency (descending)
  variantCounts.sort((a, b) => b.count - a.count)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Key Findings</CardTitle>
          <CardDescription>Summary of GWAS target analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total SNPs</p>
              <p className="text-2xl font-bold">{uniqueSnpsCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Unique Genes</p>
              <p className="text-2xl font-bold">{uniqueGenesCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Drug Targets</p>
              <p className="text-2xl font-bold text-blue-600">
                {drugTargetCount}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Within-Gene Variants</p>
              <p className="text-2xl font-bold text-green-600">
                {withinGeneCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Variant Types</CardTitle>
          <CardDescription>Distribution of functional classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {variantCounts.slice(0, 4).map((variant) => (
              <div key={variant.type} className="space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium capitalize">
                    {variant.label}
                  </p>
                  <p className="text-sm text-gray-500">{variant.count}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${(variant.count / results.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {variantCounts.length > 4 && (
              <p className="text-xs text-gray-500 italic">
                +{variantCounts.length - 4} more variant types
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
