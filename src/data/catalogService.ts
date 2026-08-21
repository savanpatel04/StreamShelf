import { catalogFixture } from './fixtures';
import type { HomeCatalog, Title } from '../types';

export class CatalogError extends Error {
  constructor(message = 'The catalog is temporarily unavailable.') {
    super(message);
    this.name = 'CatalogError';
  }
}

export class TitleNotFoundError extends Error {
  constructor(id: string) {
    super(`No title found for id "${id}".`);
    this.name = 'TitleNotFoundError';
  }
}

export type CatalogService = {
  getHome: () => Promise<HomeCatalog>;
  getTitle: (id: string) => Promise<Title>;
};

export type CatalogServiceOptions = {
  delayMs?: number;
  failureRate?: number;
  random?: () => number;
  sleep?: (ms: number) => Promise<void>;
  catalog?: HomeCatalog;
};

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export function createCatalogService(
  options: CatalogServiceOptions = {},
): CatalogService {
  const delayMs = options.delayMs ?? 700;
  const failureRate = options.failureRate ?? 0.2;
  const random = options.random ?? Math.random;
  const sleep = options.sleep ?? defaultSleep;
  const catalog = options.catalog ?? catalogFixture;

  async function withLatency<T>(work: () => T): Promise<T> {
    await sleep(delayMs);
    if (random() < failureRate) {
      throw new CatalogError();
    }
    return work();
  }

  return {
    getHome: () => withLatency(() => catalog),
    getTitle: (id: string) =>
      withLatency(() => {
        const title = catalog.titles[id];
        if (!title) {
          throw new TitleNotFoundError(id);
        }
        return title;
      }),
  };
}

export const catalogService = createCatalogService();
