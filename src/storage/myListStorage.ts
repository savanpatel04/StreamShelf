import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Title } from '../types';

export const MY_LIST_STORAGE_KEY = 'streamshelf.myList.v1';

export type MyListStorage = {
  load: () => Promise<Title[]>;
  save: (titles: Title[]) => Promise<void>;
};

export function createMyListStorage(): MyListStorage {
  return {
    async load() {
      const raw = await AsyncStorage.getItem(MY_LIST_STORAGE_KEY);
      if (!raw) {
        return [];
      }
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (!Array.isArray(parsed)) {
          return [];
        }
        return parsed.filter(isTitle);
      } catch {
        return [];
      }
    },
    async save(titles: Title[]) {
      await AsyncStorage.setItem(MY_LIST_STORAGE_KEY, JSON.stringify(titles));
    },
  };
}

function isTitle(value: unknown): value is Title {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<Title>;
  return typeof candidate.id === 'string' && typeof candidate.name === 'string';
}

export const myListStorage = createMyListStorage();
