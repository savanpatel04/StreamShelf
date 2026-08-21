import AsyncStorage from '@react-native-async-storage/async-storage';
import { MY_LIST_STORAGE_KEY, createMyListStorage } from '../myListStorage';
import { catalogFixture } from '../../data/fixtures';

describe('myListStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('round-trips saved titles', async () => {
    const storage = createMyListStorage();
    const title = catalogFixture.titles['harbor-lights']!;
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
