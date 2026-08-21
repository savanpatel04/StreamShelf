import AsyncStorage from '@react-native-async-storage/async-storage';
import { MY_LIST_STORAGE_KEY, createMyListStorage } from '../myListStorage';
import type { Title } from '../../types';

const testTitle: Title = {
  id: 'harbor-lights',
  name: 'Harbor Lights',
  kind: 'series',
  year: 2024,
  seasons: 2,
  rating: 'TV-MA',
  genres: ['Drama'],
  description: 'A dockside investigator uncovers a smuggling network.',
  artworkUrl: 'https://example.com/harbor-lights.jpg',
};

describe('myListStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('round-trips saved titles', async () => {
    const storage = createMyListStorage();
    const title = testTitle;
    await storage.save([title]);

    const loaded = await storage.load();
    expect(loaded).toEqual([title]);
    expect(await AsyncStorage.getItem(MY_LIST_STORAGE_KEY)).toContain('harbor-lights');
  });

  it('returns an empty list when storage is missing or corrupt', async () => {
    const storage = createMyListStorage();
    expect(await storage.load()).toEqual([]);

    await AsyncStorage.setItem(MY_LIST_STORAGE_KEY, '{not-json');
    expect(await storage.load()).toEqual([]);
  });
});
