import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DetailScreen } from '../DetailScreen';
import { CatalogProvider } from '../../state/CatalogContext';
import { MyListProvider } from '../../state/MyListContext';
import { DirectionalNavProvider } from '../../focus/DirectionalNav';
import { createCatalogService } from '../../data/catalogService';
import { createMyListStorage } from '../../storage/myListStorage';
import type { DetailParams } from '../../navigation/types';
import type { Title } from '../../types';

const Stack = createNativeStackNavigator<{ Detail: DetailParams }>();
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

async function renderDetail() {
  const service = createCatalogService({
    delayMs: 0,
    failureRate: 0,
    sleep: async () => undefined,
    random: () => 1,
  });
  const storage = createMyListStorage();

  return render(
    <DirectionalNavProvider>
      <CatalogProvider service={service}>
        <MyListProvider storage={storage}>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="Detail"
                component={DetailScreen}
                initialParams={{
                  titleId: 'tvmaze-1396',
                  preview: testTitle,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </MyListProvider>
      </CatalogProvider>
    </DirectionalNavProvider>,
  );
}

describe('DetailScreen My List action', () => {
  it('adds and removes a title from My List', async () => {
    const user = userEvent.setup();
    await renderDetail();

    const toggle = await screen.findByTestId('toggle-my-list');
    expect(screen.getByText('Add to My List')).toBeTruthy();

    await user.press(toggle);
    await waitFor(() => {
      expect(screen.getByText('Remove from My List')).toBeTruthy();
    });

    await user.press(screen.getByTestId('toggle-my-list'));
    await waitFor(() => {
      expect(screen.getByText('Add to My List')).toBeTruthy();
    });
  });
});
