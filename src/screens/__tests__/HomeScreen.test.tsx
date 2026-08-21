import { render, screen, userEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from '../HomeScreen';
import { CatalogProvider } from '../../state/CatalogContext';
import { DirectionalNavProvider } from '../../focus/DirectionalNav';
import { createCatalogService } from '../../data/catalogService';
import type { CatalogService } from '../../data/catalogService';
import type { HomeCatalog, Title } from '../../types';

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

const testCatalog: HomeCatalog = {
  titles: { [testTitle.id]: testTitle },
  rails: [
    { id: 'popular', title: 'Popular right now', itemIds: [testTitle.id] },
    { id: 'new', title: 'New and recently premiered', itemIds: [testTitle.id] },
    { id: 'drama', title: 'Drama picks', itemIds: [testTitle.id] },
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
    expect(await screen.findByText('Popular right now')).toBeTruthy();
    expect(screen.getByText('New and recently premiered')).toBeTruthy();
    expect(screen.getByText('Drama picks')).toBeTruthy();
    expect(screen.getAllByLabelText(/Breaking Bad/)).toHaveLength(3);
  });

  it('shows an error with retry when the catalog fails', async () => {
    const user = userEvent.setup();
    let shouldFail = true;
    const service = createCatalogService({
      delayMs: 0,
      failureRate: 1,
      sleep: async () => undefined,
      random: () => (shouldFail ? 0 : 1),
      catalog: testCatalog,
    });

    await renderHome(service);

    expect(await screen.findByTestId('status-error')).toBeTruthy();
    expect(screen.getByText(/check your connection/i)).toBeTruthy();

    shouldFail = false;
    await user.press(screen.getByTestId('status-action'));

    expect(await screen.findByText('Popular right now')).toBeTruthy();
  });
});
