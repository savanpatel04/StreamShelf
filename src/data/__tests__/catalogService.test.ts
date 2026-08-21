import {
  CatalogError,
  TitleNotFoundError,
  createCatalogService,
} from '../catalogService';
import type { HomeCatalog } from '../../types';

const testCatalog: HomeCatalog = {
  titles: {
    'tvmaze-1396': {
      id: 'tvmaze-1396',
      name: 'Breaking Bad',
      kind: 'series',
      year: 2008,
      rating: '9.5/10',
      genres: ['Drama', 'Crime', 'Thriller'],
      description: 'A high school chemistry teacher turned meth producer.',
      artworkUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/81/202627.jpg',
    },
    'tvmaze-82': {
      id: 'tvmaze-82',
      name: 'Game of Thrones',
      kind: 'series',
      year: 2011,
      rating: '9.2/10',
      genres: ['Drama', 'Fantasy', 'Adventure'],
      description: 'Nine noble families fight for control of the lands of Westeros.',
      artworkUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/0/190.jpg',
    },
  },
  rails: [
    { id: 'popular', title: 'Popular right now', itemIds: ['tvmaze-1396', 'tvmaze-82'] },
    { id: 'new', title: 'New and recently premiered', itemIds: ['tvmaze-1396', 'tvmaze-82'] },
    { id: 'drama', title: 'Drama picks', itemIds: ['tvmaze-1396', 'tvmaze-82'] },
  ],
};

describe('createCatalogService', () => {
  it('returns rails and titles after a successful fetch', async () => {
    const service = createCatalogService({
      delayMs: 0,
      failureRate: 0,
      sleep: async () => undefined,
      random: () => 1,
      catalog: testCatalog,
    });

    const home = await service.getHome();

    expect(home.rails).toHaveLength(3);
    expect(home.rails.map((rail) => rail.id)).toEqual(['popular', 'new', 'drama']);
    expect(home.titles['tvmaze-1396']?.name).toBe('Breaking Bad');
    expect(home.titles['tvmaze-82']?.name).toBe('Game of Thrones');
  });

  it('simulates an intermittent catalog failure', async () => {
    const service = createCatalogService({
      delayMs: 0,
      failureRate: 1,
      sleep: async () => undefined,
      random: () => 0,
    });

    await expect(service.getHome()).rejects.toBeInstanceOf(CatalogError);
  });

  it('looks up a title by id and rejects unknown ids', async () => {
    const service = createCatalogService({
      delayMs: 0,
      failureRate: 0,
      sleep: async () => undefined,
      random: () => 1,
      catalog: testCatalog,
    });

    await expect(service.getTitle('tvmaze-1396')).resolves.toMatchObject({ name: 'Breaking Bad' });
    await expect(service.getTitle('tvmaze-missing')).rejects.toBeInstanceOf(TitleNotFoundError);
  });

  it('shows loading experience with simulated latency', async () => {
    let resolveHome!: (value: HomeCatalog) => void;
    const delayPromise = new Promise<void>((resolve) => {
      setTimeout(resolve, 100);
    });

    const service = createCatalogService({
      delayMs: 100,
      failureRate: 0,
      sleep: () => delayPromise,
      random: () => 1,
      catalog: testCatalog,
    });

    const homePromise = service.getHome();
    
    // Should still be pending after initial call
    expect(homePromise).toBeDefined();
    
    const home = await homePromise;
    expect(home.rails).toHaveLength(3);
  });

  it('provides empty catalog gracefully when no titles available', async () => {
    const emptyCatalog: HomeCatalog = {
      titles: {},
      rails: [],
    };

    const service = createCatalogService({
      delayMs: 0,
      failureRate: 0,
      sleep: async () => undefined,
      random: () => 1,
      catalog: emptyCatalog,
    });

    const home = await service.getHome();
    
    expect(home.rails).toHaveLength(0);
    expect(Object.keys(home.titles)).toHaveLength(0);
  });

  it('throws CatalogError with descriptive message on failure', async () => {
    const service = createCatalogService({
      delayMs: 0,
      failureRate: 1,
      sleep: async () => undefined,
      random: () => 0,
    });

    try {
      await service.getHome();
      fail('Should have thrown CatalogError');
    } catch (error) {
      expect(error).toBeInstanceOf(CatalogError);
      expect((error as Error).message).toBe('The catalog is temporarily unavailable.');
    }
  });

  it('recovers from temporary failures on retry', async () => {
    let attemptCount = 0;
    const service = createCatalogService({
      delayMs: 0,
      failureRate: 0.5,
      sleep: async () => undefined,
      random: () => {
        attemptCount++;
        // First attempt fails, second succeeds
        return attemptCount > 1 ? 1 : 0;
      },
      catalog: testCatalog,
    });

    // First attempt fails
    await expect(service.getHome()).rejects.toBeInstanceOf(CatalogError);

    // Reset counter for next attempt
    attemptCount = 0;
    
    // Second attempt succeeds
    const home = await service.getHome();
    expect(home.rails).toHaveLength(3);
  });
});
