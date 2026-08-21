import {
  CatalogError,
  TitleNotFoundError,
  createCatalogService,
} from '../catalogService';
import { catalogFixture } from '../fixtures';

const instantSleep = async () => undefined;

describe('createCatalogService', () => {
  it('returns rails and titles after a successful fetch', async () => {
    const service = createCatalogService({
      delayMs: 0,
      failureRate: 0,
      sleep: instantSleep,
      random: () => 1,
    });

    const home = await service.getHome();

    expect(home.rails).toHaveLength(3);
    expect(home.rails.map((rail) => rail.id)).toEqual(['trending', 'new', 'staff']);
    expect(home.titles['harbor-lights']?.name).toBe('Harbor Lights');
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
      catalog: catalogFixture,
    });

    await expect(service.getTitle('kiln')).resolves.toMatchObject({ name: 'Kiln' });
    await expect(service.getTitle('missing')).rejects.toBeInstanceOf(TitleNotFoundError);
  });
});
