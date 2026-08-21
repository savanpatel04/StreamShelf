import {
  CatalogError,
  TitleNotFoundError,
  createCatalogService,
} from '../catalogService';
import type { HomeCatalog } from '../../types';

const testCatalog: HomeCatalog = {
  titles: {
    kiln: {
      id: 'kiln',
      name: 'Kiln',
      kind: 'movie',
      year: 2024,
      runtimeMinutes: 104,
      rating: 'PG-13',
      genres: ['Documentary'],
      description: 'A ceramicist rebuilds a wood-fired kiln.',
      artworkUrl: 'https://example.com/kiln.jpg',
    },
  },
  rails: [
    { id: 'trending', title: 'Trending this week', itemIds: ['kiln'] },
    { id: 'new', title: 'New on StreamShelf', itemIds: ['kiln'] },
    { id: 'staff', title: 'Staff picks', itemIds: ['kiln'] },
  ],
};

const instantSleep = async () => undefined;

describe('createCatalogService', () => {
  it('returns rails and titles after a successful fetch', async () => {
    const service = createCatalogService({
      delayMs: 0,
      failureRate: 0,
      sleep: instantSleep,
      random: () => 1,
      catalog: testCatalog,
    });

    const home = await service.getHome();

    expect(home.rails).toHaveLength(3);
    expect(home.rails.map((rail) => rail.id)).toEqual(['trending', 'new', 'staff']);
    expect(home.titles.kiln?.name).toBe('Kiln');
  });

  it('simulates an intermittent catalog failure', async () => {
    const service = createCatalogService({
      delayMs: 0,
      failureRate: 1,
      sleep: instantSleep,
      random: () => 0,
    });

    await expect(service.getHome()).rejects.toBeInstanceOf(CatalogError);
  });

  it('looks up a title by id and rejects unknown ids', async () => {
    const service = createCatalogService({
      delayMs: 0,
      failureRate: 0,
      sleep: instantSleep,
      random: () => 1,
      catalog: testCatalog,
    });

    await expect(service.getTitle('kiln')).resolves.toMatchObject({ name: 'Kiln' });
    await expect(service.getTitle('missing')).rejects.toBeInstanceOf(TitleNotFoundError);
  });
});
