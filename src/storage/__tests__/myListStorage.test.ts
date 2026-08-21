import AsyncStorage from '@react-native-async-storage/async-storage';
import { MY_LIST_STORAGE_KEY, createMyListStorage } from '../myListStorage';
import type { Title } from '../../types';

const testTitle: Title = {
  id: 'tvmaze-1396',
  name: 'Breaking Bad',
  kind: 'series',
  year: 2008,
  rating: '9.5/10',
  genres: ['Drama', 'Crime', 'Thriller'],
  description: 'A high school chemistry teacher turned meth producer.',
  artworkUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/81/202627.jpg',
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
    expect(await AsyncStorage.getItem(MY_LIST_STORAGE_KEY)).toContain('tvmaze-1396');
  });

  it('returns an empty list when storage is missing or corrupt', async () => {
    const storage = createMyListStorage();
    expect(await storage.load()).toEqual([]);

    await AsyncStorage.setItem(MY_LIST_STORAGE_KEY, '{not-json');
    expect(await storage.load()).toEqual([]);
  });
});
