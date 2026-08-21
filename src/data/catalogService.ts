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
  live?: boolean;
  fetch?: typeof globalThis.fetch;
};

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export function createCatalogService(
  options: CatalogServiceOptions = {},
): CatalogService {
  const delayMs = options.delayMs ?? 700;
  const failureRate = options.failureRate ?? (options.live ? 0 : 0.2);
  const random = options.random ?? Math.random;
  const sleep = options.sleep ?? defaultSleep;
  const fetcher = options.fetch ?? globalThis.fetch;

  if (!fetcher && options.live) {
    throw new Error('A fetch implementation is required for live catalog data.');
  }

  async function withLatency<T>(work: () => T | Promise<T>): Promise<T> {
    await sleep(delayMs);
    if (random() < failureRate) {
      throw new CatalogError();
    }
    return await work();
  }

  return {
    getHome: () =>
      withLatency(async () => {
        if (!options.live) {
          return options.catalog ?? catalogFixture;
        }
        const shows = await fetchShows(fetcher!);
        return createHomeCatalog(shows);
      }),
    getTitle: (id: string) =>
      withLatency(async () => {
        if (!options.live) {
          const catalog = options.catalog ?? catalogFixture;
          const title = catalog.titles[id];
          if (!title) {
            throw new TitleNotFoundError(id);
          }
          return title;
        }
        const showId = parseShowId(id);
        if (showId === null) {
          throw new TitleNotFoundError(id);
        }
        const response = await fetcher!(`https://api.tvmaze.com/shows/${showId}`);
        if (!response.ok) {
          throw new CatalogError('The title could not be loaded.');
        }
        return mapShow(await response.json() as TvMazeShow);
      }),
  };
}

type TvMazeShow = {
  id: number;
  name: string;
  premiered: string | null;
  genres: string[];
  summary: string | null;
  image: { medium?: string; original?: string } | null;
  rating: { average: number | null };
  runtime: number | null;
  status: string;
};

async function fetchShows(fetcher: typeof globalThis.fetch): Promise<TvMazeShow[]> {
  const response = await fetcher('https://api.tvmaze.com/shows?page=1');
  if (!response.ok) {
    throw new CatalogError('The live catalog is temporarily unavailable.');
  }
  const payload = await response.json() as unknown;
  if (!Array.isArray(payload)) {
    throw new CatalogError('The live catalog returned an invalid response.');
  }
  return payload.filter(isTvMazeShow);
}

function isTvMazeShow(value: unknown): value is TvMazeShow {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const show = value as Partial<TvMazeShow>;
  return typeof show.id === 'number' && typeof show.name === 'string';
}

function createHomeCatalog(shows: TvMazeShow[]): HomeCatalog {
  const titles = shows.map(mapShow);
  const byId = Object.fromEntries(titles.map((title) => [title.id, title]));
  const recent = [...titles].sort((a, b) => b.year - a.year);
  const popular = [...titles].sort((a, b) => ratingScore(b) - ratingScore(a));
  const drama = titles.filter((title) => title.genres.includes('Drama'));
  const fallback = titles.filter((title) => !drama.includes(title));

  return {
    titles: byId,
    rails: [
      createRail('popular', 'Popular right now', popular.slice(0, 12)),
      createRail('new', 'New and recently premiered', recent.slice(0, 12)),
      createRail('drama', 'Drama picks', (drama.length > 0 ? drama : fallback).slice(0, 12)),
    ].filter((rail) => rail.itemIds.length > 0),
  };
}

function createRail(id: string, title: string, items: Title[]) {
  return { id, title, itemIds: items.map((item) => item.id) };
}

function ratingScore(title: Title) {
  const rating = Number.parseFloat(title.rating);
  return Number.isFinite(rating) ? rating : 0;
}

function mapShow(show: TvMazeShow): Title {
  const year = show.premiered ? Number.parseInt(show.premiered.slice(0, 4), 10) : new Date().getFullYear();
  return {
    id: `tvmaze-${show.id}`,
    name: show.name,
    kind: 'series',
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
    seasons: undefined,
    rating: show.rating?.average ? `${show.rating.average}/10` : 'NR',
    genres: show.genres.length > 0 ? show.genres : ['Series'],
    description: stripHtml(show.summary) || 'No description is available for this title.',
    artworkUrl: show.image?.original ?? show.image?.medium ?? '',
  };
}

function stripHtml(value: string | null) {
  return value?.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() ?? '';
}

function parseShowId(id: string) {
  const match = /^tvmaze-(\d+)$/.exec(id);
  return match ? Number.parseInt(match[1], 10) : null;
}

export const catalogService = createCatalogService({ live: true });
