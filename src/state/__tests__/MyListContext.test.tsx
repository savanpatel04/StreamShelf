import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Text } from 'react-native';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { MyListProvider, useMyList } from '../MyListContext';
import { createMyListStorage } from '../../storage/myListStorage';
import type { Title } from '../../types';

const testTitles: Title[] = [
  {
    id: 'tvmaze-1396',
    name: 'Breaking Bad',
    kind: 'series',
    year: 2008,
    rating: '9.5/10',
    genres: ['Drama', 'Crime', 'Thriller'],
    description: 'A high school chemistry teacher turned meth producer.',
    artworkUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/81/202627.jpg',
  },
  {
    id: 'tvmaze-82',
    name: 'Game of Thrones',
    kind: 'series',
    year: 2011,
    rating: '9.2/10',
    genres: ['Drama', 'Fantasy', 'Adventure'],
    description: 'Nine noble families fight for control of the lands of Westeros.',
    artworkUrl: 'https://static.tvmaze.com/uploads/images/original_untouched/0/190.jpg',
  },
];

function Probe() {
  const { titles, isReady } = useMyList();
  if (!isReady) {
    return <Text>restoring</Text>;
  }
  return <Text>{titles[0]?.name ?? 'empty'}</Text>;
}

describe('MyListProvider', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('restores titles from storage after a remount', async () => {
    const storage = createMyListStorage();
    await storage.save([testTitles[0]]);

    const view = await render(
      <MyListProvider storage={storage}>
        <Probe />
      </MyListProvider>,
    );

    expect(await screen.findByText('Breaking Bad')).toBeTruthy();

    await view.unmount();
    await render(
      <MyListProvider storage={storage}>
        <Probe />
      </MyListProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Breaking Bad')).toBeTruthy();
    });
  });

  it('keeps all titles when many are added in quick succession', async () => {
    const storage = createMyListStorage();
    const titles = testTitles;

    let api: ReturnType<typeof useMyList> | undefined;

    function RapidAddProbe() {
      const value = useMyList();
      useEffect(() => {
        api = value;
      }, [value]);

      return <Text>{value.titles.length}</Text>;
    }

    render(
      <MyListProvider storage={storage}>
        <RapidAddProbe />
      </MyListProvider>,
    );

    await waitFor(() => {
      expect(api).toBeDefined();
    });

    await act(async () => {
      await Promise.all(titles.map((title) => api!.toggle(title)));
    });

    await waitFor(() => {
      expect(screen.getByText(String(titles.length))).toBeTruthy();
    });
  });
});
