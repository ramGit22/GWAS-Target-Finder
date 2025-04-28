import React from 'react';
import { GeneTarget } from '@/lib/api/gwas';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DrugTargetBadge } from './drug-target-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface GeneDetailsProps {
  gene: GeneTarget;
  onClose: () => void;
}

export function GeneDetails({ gene, onClose }: GeneDetailsProps) {
  // Extract chromosome and position from the SNP location
  const [chromosome, position] = gene.snp_location.split(':');
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{gene.nearby_gene_symbol}</CardTitle>
            <CardDescription>{gene.nearby_gene_ensembl_id}</CardDescription>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <DrugTargetBadge isDrugTarget={gene.is_drug_target} />
            {gene.is_within_gene && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Located within gene
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Associated SNP</h3>
            <p className="text-base">{gene.gwas_snp}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Functional Class</h3>
            <Badge variant="outline" className="capitalize">
              {gene.functional_class.replace('_variant', '').replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Genomic Location</h3>
            <p className="text-base">Chromosome {chromosome}, Position {parseInt(position).toLocaleString()}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Distance to Gene</h3>
            <p className="text-base">
              {gene.is_within_gene 
                ? 'Within gene' 
                : `${gene.distance_to_gene.toLocaleString()} bp`}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <a 
            href={`https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${gene.nearby_gene_ensembl_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100"
          >
            View in Ensembl
            <ExternalLink className="h-4 w-4" />
          </a>
          
          <a 
            href={`https://platform.opentargets.org/target/${gene.nearby_gene_ensembl_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100"
          >
            Open Targets
            <ExternalLink className="h-4 w-4" />
          </a>
          
          <a 
            href={`https://www.uniprot.org/uniprotkb?query=${gene.nearby_gene_symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100"
          >
            UniProt
            <ExternalLink className="h-4 w-4" />
          </a>
          
          <a 
            href={`https://www.genecards.org/cgi-bin/carddisp.pl?gene=${gene.nearby_gene_symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100"
          >
            GeneCards
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        
        {/* Add SNP-specific links */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">SNP Resources</h3>
          <div className="grid grid-cols-2 gap-4">
            <a 
              href={`https://www.ncbi.nlm.nih.gov/snp/${gene.gwas_snp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100"
            >
              dbSNP
              <ExternalLink className="h-4 w-4" />
            </a>
            
            <a 
              href={`https://www.ebi.ac.uk/gwas/variants/${gene.gwas_snp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100"
            >
              GWAS Catalog
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={onClose}
          className="w-full"
        >
          Close
        </Button>
      </CardFooter>
    </Card>
  );
}
