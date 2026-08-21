import { render, screen, userEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../HomeScreen';
import { CatalogProvider } from '../../state/CatalogContext';
import { DirectionalNavProvider } from '../../focus/DirectionalNav';
import { createCatalogService } from '../../data/catalogService';
import type { CatalogService } from '../../data/catalogService';
import type { HomeCatalog, Title } from '../../types';

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

const testCatalog: HomeCatalog = {
  titles: { [testTitle.id]: testTitle },
  rails: [
    { id: 'trending', title: 'Trending this week', itemIds: [testTitle.id] },
    { id: 'new', title: 'New on StreamShelf', itemIds: [testTitle.id] },
    { id: 'staff', title: 'Staff picks', itemIds: [testTitle.id] },
  ],
};

async function renderHome(service: CatalogService) {
  return render(
    <DirectionalNavProvider>
      <CatalogProvider service={service}>
        <NavigationContainer>
          <HomeScreen />
        </NavigationContainer>
      </CatalogProvider>
    </DirectionalNavProvider>,
  );
}

describe('HomeScreen', () => {
  it('shows a loading state until the catalog resolves', async () => {
    let resolveHome!: (value: HomeCatalog) => void;
    const service: CatalogService = {
      getHome: () =>
        new Promise((resolve) => {
          resolveHome = resolve;
        }),
      getTitle: async () => testTitle,
    };

    await renderHome(service);
    expect(screen.getByTestId('status-loading')).toBeTruthy();

    resolveHome(testCatalog);
    expect(await screen.findByText('Trending this week')).toBeTruthy();
    expect(screen.getByText('New on StreamShelf')).toBeTruthy();
    expect(screen.getByText('Staff picks')).toBeTruthy();
    expect(screen.getByLabelText(/Harbor Lights/)).toBeTruthy();
  });

  it('shows an error with retry when the catalog fails', async () => {
    const user = userEvent.setup();
    let shouldFail = true;
    const service = createCatalogService({
      delayMs: 0,
      failureRate: 1,
      sleep: async () => undefined,
      random: () => (shouldFail ? 0 : 1),
    });

    await renderHome(service);

    expect(await screen.findByTestId('status-error')).toBeTruthy();
    expect(screen.getByText(/check your connection/i)).toBeTruthy();

    shouldFail = false;
    await user.press(screen.getByTestId('status-action'));

    expect(await screen.findByText('Trending this week')).toBeTruthy();
  });
});
