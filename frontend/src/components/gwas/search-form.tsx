import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

interface SearchFormProps {
  onSearch: (trait: string, pValue?: number, windowKb?: number) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [trait, setTrait] = useState('');
  const [pValue, setPValue] = useState<string>('');
  const [windowKb, setWindowKb] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse numeric values (but only if they're provided)
    const parsedPValue = pValue ? parseFloat(pValue) : undefined;
    const parsedWindowKb = windowKb ? parseInt(windowKb, 10) : undefined;
    
    // Capitalize first letter of search text if it exists and is lowercase
    const capitalizedTrait = trait && trait.length > 0 
      ? (trait.charAt(0).toLowerCase() === trait.charAt(0) 
        ? trait.charAt(0).toUpperCase() + trait.slice(1) 
        : trait)
      : trait;
    
    onSearch(capitalizedTrait, parsedPValue, parsedWindowKb);
  };

  // Common example traits with EFO IDs
  const exampleTraits = [
    { name: 'Parkinson disease', id: 'Parkinson disease' },
    { name: 'Type 2 diabetes', id: 'EFO_0001360' },
    { name: 'Rheumatoid arthritis', id: 'EFO_0000685' },
    { name: 'Coronary artery disease', id: 'EFO_0001645' },
    { name: 'Alzheimer\'s disease', id: 'EFO_0000249' }
  ];

  const setExampleTrait = (id: string) => {
    setTrait(id);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>GWAS Target Finder</CardTitle>
        <CardDescription>
          Find protein-coding genes near significant genetic variants associated with a trait or disease
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trait">Trait or EFO ID</Label>
            <Input 
              id="trait" 
              placeholder="e.g., EFO_0001360 (Type 2 diabetes)" 
              value={trait}
              onChange={(e) => setTrait(e.target.value)}
              required
            />
            <div className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
              <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>
                Enter a trait name or EFO ID (e.g., EFO_0001360 for Type 2 diabetes).
                <a 
                  href="https://www.ebi.ac.uk/gwas/efotraits" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline ml-1"
                >
                  Browse EFO traits
                </a>
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pValue">P-value threshold</Label>
              <Input 
                id="pValue" 
                placeholder="Default: 5e-8" 
                value={pValue}
                onChange={(e) => setPValue(e.target.value)}
                type="number" 
                step="any" 
                min="0" 
                max="1"
              />
              <div className="text-xs text-muted-foreground">
                Significance threshold (0-1)
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="windowKb">Window size (kb)</Label>
              <Input 
                id="windowKb" 
                placeholder="Default: 100" 
                value={windowKb}
                onChange={(e) => setWindowKb(e.target.value)}
                type="number" 
                min="1" 
                max="1000"
              />
              <div className="text-xs text-muted-foreground">
                Distance around SNP to search
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Try these example traits:</p>
            <div className="flex flex-wrap gap-2">
              {exampleTraits.map(trait => (
                <button
                  key={trait.id}
                  type="button"
                  onClick={() => setExampleTrait(trait.id)}
                  className="text-xs inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 font-medium text-gray-700 hover:bg-gray-100"
                >
                  {trait.name}
                </button>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          disabled={isLoading || !trait}
          className="w-full"
        >
          {isLoading ? 'Searching...' : 'Find Targets'}
        </Button>
      </CardFooter>
    </Card>
  );
}
