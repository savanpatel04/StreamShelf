import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Title } from '../types';
import { colors, spacing } from '../theme';
import { PosterCard } from './PosterCard';

type Props = {
  heading: string;
  titles: Title[];
  onOpenTitle: (title: Title) => void;
};

export function ContentRail({ heading, titles, onOpenTitle }: Props) {
  return (
    <View style={styles.rail} accessibilityRole="summary">
      <Text style={styles.heading}>{heading}</Text>
      <FlatList
        horizontal
        data={titles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PosterCard title={item} onPress={() => onOpenTitle(item)} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    marginBottom: spacing.lg,
  },
  heading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  row: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
});
