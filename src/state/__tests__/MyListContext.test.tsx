import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Text } from 'react-native';
import { act, render, screen, waitFor } from '@testing-library/react-native';
import { MyListProvider, useMyList } from '../MyListContext';
import { createMyListStorage } from '../../storage/myListStorage';
import type { Title } from '../../types';

const testTitles: Title[] = [
  {
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
  {
    id: 'harbor-lights',
    name: 'Harbor Lights',
    kind: 'series',
    year: 2024,
    seasons: 2,
    rating: 'TV-MA',
    genres: ['Drama'],
    description: 'A dockside investigator uncovers a smuggling network.',
    artworkUrl: 'https://example.com/harbor-lights.jpg',
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

    expect(await screen.findByText('Kiln')).toBeTruthy();

    await view.unmount();
    await render(
      <MyListProvider storage={storage}>
        <Probe />
      </MyListProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Kiln')).toBeTruthy();
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
