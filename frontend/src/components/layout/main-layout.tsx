import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? 'text-indigo-700 font-medium' : 'text-gray-600 hover:text-indigo-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">GWAS Target Finder</h1>
              <nav className="ml-10 flex items-center space-x-6">
                <Link href="/" className={`text-sm ${isActive('/')}`}>
                  Home
                </Link>
                <Link href="/about" className={`text-sm ${isActive('/about')}`}>
                  About
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="https://www.ebi.ac.uk/gwas/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                GWAS Catalog
              </a>
              <a 
                href="https://www.ensembl.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                Ensembl
              </a>
              <a 
                href="https://platform.opentargets.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                Open Targets
              </a>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>
            GWAS Target Finder API - Integrating data from GWAS Catalog, Ensembl, and Open Targets
          </p>
        </div>
      </footer>
    </div>
  );
}
