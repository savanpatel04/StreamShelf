import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DetailScreen } from '../DetailScreen';
import { CatalogProvider } from '../../state/CatalogContext';
import { MyListProvider } from '../../state/MyListContext';
import { DirectionalNavProvider } from '../../focus/DirectionalNav';
import { createCatalogService } from '../../data/catalogService';
import { createMyListStorage } from '../../storage/myListStorage';
import { catalogFixture } from '../../data/fixtures';
import type { DetailParams } from '../../navigation/types';

const Stack = createNativeStackNavigator<{ Detail: DetailParams }>();

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
                  titleId: 'harbor-lights',
                  preview: catalogFixture.titles['harbor-lights'],
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
