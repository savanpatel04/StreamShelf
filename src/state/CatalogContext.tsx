import { createContext, useContext, type ReactNode } from 'react';
import { catalogService, type CatalogService } from '../data/catalogService';

const CatalogContext = createContext<CatalogService>(catalogService);

export function CatalogProvider({
  children,
  service = catalogService,
}: {
  children: ReactNode;
  service?: CatalogService;
}) {
  return <CatalogContext.Provider value={service}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  return useContext(CatalogContext);
}
