import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusState } from '../components/StatusState';
import { Focusable } from '../components/Focusable';
import { CatalogError } from '../data/catalogService';
import { useCatalog } from '../state/CatalogContext';
import { useMyList } from '../state/MyListContext';
import type { DetailParams } from '../navigation/types';
import type { Title } from '../types';
import { colors, radii, spacing } from '../theme';

type Props = NativeStackScreenProps<{ Detail: DetailParams }, 'Detail'>;

export function DetailScreen({ route }: Props) {
  const { titleId, preview } = route.params;
  const catalog = useCatalog();
  const { isSaved, toggle, isReady } = useMyList();
  const navigation = useNavigation();
  const [title, setTitle] = useState<Title | null>(preview ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!preview);

  useEffect(() => {
    let cancelled = false;
    setLoading(!preview);
    setError(null);
    catalog
      .getTitle(titleId)
      .then((fresh) => {
        if (!cancelled) {
          setTitle(fresh);
        }
      })
      .catch((caught) => {
        if (cancelled) {
          return;
        }
        if (preview) {
          return;
        }
        const message =
          caught instanceof CatalogError
            ? caught.message
            : 'This title could not be loaded.';
        setError(message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [catalog, preview, titleId]);

  if (loading && !title) {
    return (
      <View style={styles.screen}>
        <StatusState status="loading" message="Opening title details." />
      </View>
    );
  }

  if (error || !title) {
    return (
      <View style={styles.screen}>
        <StatusState
          status="error"
          message={error ?? 'Title not found.'}
          actionLabel="Try again"
          onAction={() => {
            setLoading(true);
            setError(null);
            void catalog.getTitle(titleId).then(setTitle).catch((caught) => {
              setError(caught instanceof Error ? caught.message : 'Unknown error');
            }).finally(() => setLoading(false));
          }}
        />
      </View>
    );
  }

  const saved = isSaved(title.id);
  const runtime =
    title.kind === 'movie'
      ? `${title.runtimeMinutes ?? 0} min`
      : `${title.seasons ?? 1} season${(title.seasons ?? 1) === 1 ? '' : 's'}`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
        <Text style={styles.backButtonText}>←</Text>
      </Pressable>

      <Image source={{ uri: title.artworkUrl }} style={styles.hero} />
      <Text style={styles.name}>{title.name}</Text>
      <Text style={styles.meta}>
        {title.year} · {title.kind === 'movie' ? 'Movie' : 'Series'} · {title.rating} · {runtime}
      </Text>
      <Text style={styles.genres}>{title.genres.join('  ·  ')}</Text>
      <Text style={styles.description}>{title.description}</Text>
      <Focusable
        onPress={() => {
          void toggle(title);
        }}
        style={[styles.cta, saved ? styles.ctaSaved : styles.ctaAdd]}
        testID="toggle-my-list"
        accessibilityLabel={saved ? 'Remove from My List' : 'Add to My List'}
      >
        <Text style={styles.ctaLabel}>
          {!isReady ? 'Loading My List…' : saved ? 'Remove from My List' : 'Add to My List'}
        </Text>
      </Focusable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 24,
  },
  hero: {
    width: '100%',
    aspectRatio: 2 / 3,
    maxHeight: 420,
    borderRadius: radii.lg,
    backgroundColor: colors.posterPlaceholder,
    marginBottom: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  meta: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontSize: 15,
  },
  genres: {
    color: colors.accent,
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    color: colors.text,
    marginTop: spacing.md,
    fontSize: 16,
    lineHeight: 24,
  },
  cta: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C9D8F5',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  ctaAdd: {
    backgroundColor: '#2F7CF6',
  },
  ctaSaved: {
    backgroundColor: '#2F7CF6',
    borderColor: '#2F7CF6',
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
