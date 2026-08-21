import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { Title } from '../types';
import { colors, radii, spacing } from '../theme';
import { Focusable } from './Focusable';

type Props = {
  title: Title;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function PosterCard({ title, onPress, style }: Props) {
  return (
    <Focusable
      onPress={onPress}
      style={[styles.card, style]}
      hoveredStyle={styles.cardHover}
      accessibilityLabel={`${title.name}, ${title.year}`}
      testID={`poster-${title.id}`}
    >
      <Image source={{ uri: title.artworkUrl }} style={styles.art} />
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.name}>
          {title.name}
        </Text>
        <Text style={styles.year}>{title.year}</Text>
      </View>
    </Focusable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 132,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    borderRadius: radii.sm,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHover: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.2,
  },
  art: {
    width: '100%',
    height: 188,
    backgroundColor: colors.posterPlaceholder,
  },
  meta: {
    padding: spacing.xs,
    backgroundColor: '#D9EAFD',
  },
  name: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  year: {
    color: '#3B4A63',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
});
