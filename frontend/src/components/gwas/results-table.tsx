import React, { useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'

import { GeneTarget } from '@/lib/api/gwas'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DrugTargetBadge } from './drug-target-badge'
import { GeneDetails } from './gene-details'
import { Badge } from '@/components/ui/badge'

interface ResultsTableProps {
  results: GeneTarget[]
}

export function ResultsTable({ results }: ResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [geneFilter, setGeneFilter] = useState('')
  const [selectedGene, setSelectedGene] = useState<GeneTarget | null>(null)

  // Define table columns
  const columns: ColumnDef<GeneTarget>[] = [
    {
      accessorKey: 'gwas_snp',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="font-medium"
          >
            SNP ID
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('gwas_snp')}</div>
      ),
    },
    {
      accessorKey: 'snp_location',
      header: 'Genomic Location',
    },
    {
      accessorKey: 'functional_class',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="font-medium"
          >
            Variant Type
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        )
      },
      cell: ({ row }) => {
        const functionalClass = row.getValue('functional_class') as string
        return (
          <Badge variant="outline" className="capitalize">
            {functionalClass.replace('_variant', '').replace(/_/g, ' ')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'nearby_gene_symbol',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="font-medium"
          >
            Gene Symbol
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        )
      },
    },
    {
      accessorKey: 'distance_to_gene',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="font-medium"
          >
            Distance (bp)
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        )
      },
      cell: ({ row }) => {
        const distance = row.getValue('distance_to_gene') as number
        const isWithinGene = row.original.is_within_gene

        if (isWithinGene) {
          return <span className="text-green-600 font-medium">Within gene</span>
        }

        return <span>{distance.toLocaleString()}</span>
      },
    },
    {
      accessorKey: 'is_drug_target',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="font-medium"
          >
            Drug Target
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : null}
          </Button>
        )
      },
      cell: ({ row }) => {
        const isDrugTarget = row.getValue('is_drug_target') as boolean
        return <DrugTargetBadge isDrugTarget={isDrugTarget} />
      },
      sortingFn: (rowA, rowB) => {
        const valueA = rowA.getValue('is_drug_target') as boolean
        const valueB = rowB.getValue('is_drug_target') as boolean
        return valueA === valueB ? 0 : valueA ? -1 : 1
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const gene = row.original
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedGene(gene)
            }}
            className="p-0 h-8 w-8"
            title="View gene details"
          >
            <Search className="h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  // Setup the table with our data and columns
  const table = useReactTable({
    data: results,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  const handleGeneFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGeneFilter(value)
    table.getColumn('nearby_gene_symbol')?.setFilterValue(value)
  }

  // Count statistics
  const drugTargetCount = results.filter(
    (result) => result.is_drug_target
  ).length
  const uniqueSnpsCount = new Set(results.map((r) => r.gwas_snp)).size
  const genesWithinCount = results.filter(
    (result) => result.is_within_gene
  ).length

  // Get unique variant types
  const variantTypes = Array.from(
    new Set(results.map((r) => r.functional_class))
  )

  return (
    <div className="space-y-6">
      {selectedGene ? (
        <GeneDetails
          gene={selectedGene}
          onClose={() => setSelectedGene(null)}
        />
      ) : null}

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>
            Found {results.length} genes near {uniqueSnpsCount} significant
            SNPs, including {drugTargetCount} known drug targets and{' '}
            {genesWithinCount} genes with variants directly within the gene
          </CardDescription>
          <div className="flex items-center pt-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Filter by gene symbol..."
                value={geneFilter}
                onChange={handleGeneFilterChange}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedGene(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {results.length}{' '}
            entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <div className="text-sm">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
