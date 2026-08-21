import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PosterCard } from '../components/PosterCard';
import { StatusState } from '../components/StatusState';
import { useMyList } from '../state/MyListContext';
import type { HomeStackParamList } from '../navigation/types';
import { colors, spacing } from '../theme';

const CARD_WIDTH = 132;
const CARD_GAP = spacing.sm;

export function MyListScreen() {
  const { titles, isReady } = useMyList();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { width } = useWindowDimensions();

  const availableWidth = width - spacing.md * 2;
  const cardsPerRow = Math.max(1, Math.floor((availableWidth + CARD_GAP) / (CARD_WIDTH + CARD_GAP)));
  const rows = Array.from({ length: Math.ceil(titles.length / cardsPerRow) }, (_, rowIndex) =>
    titles.slice(rowIndex * cardsPerRow, rowIndex * cardsPerRow + cardsPerRow),
  );

  if (!isReady) {
    return (
      <View style={styles.screen}>
        <StatusState status="loading" title="Restoring My List" message="Reading saved titles from device storage." />
      </View>
    );
  }

  if (titles.length === 0) {
    return (
      <View style={styles.screen}>
        <StatusState
          status="empty"
          title="My List is empty"
          message="Open a title from Home and add it here. Saved titles survive app restarts."
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.heading}>{titles.length} saved title{titles.length === 1 ? '' : 's'}</Text>
      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((item) => (
              <View key={item.id} style={styles.cell}>
                <PosterCard
                  title={item}
                  style={styles.poster}
                  onPress={() => navigation.navigate('Detail', { titleId: item.id, preview: item })}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heading: {
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  },
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: CARD_GAP,
  },
  cell: {
    width: CARD_WIDTH,
    marginBottom: spacing.sm,
  },
  poster: {
    width: CARD_WIDTH,
    marginRight: 0,
  },
});
