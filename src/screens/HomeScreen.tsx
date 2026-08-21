import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ContentRail } from '../components/ContentRail';
import { StatusState } from '../components/StatusState';
import { CatalogError } from '../data/catalogService';
import { useCatalog } from '../state/CatalogContext';
import type { HomeStackParamList } from '../navigation/types';
import type { HomeCatalog, Title } from '../types';
import { colors, spacing } from '../theme';

export function HomeScreen() {
  const catalog = useCatalog();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [data, setData] = useState<HomeCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const home = await catalog.getHome();
      setData(home);
    } catch (caught) {
      const message =
        caught instanceof CatalogError
          ? caught.message
          : 'We could not load the home catalog.';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [catalog]);

  useEffect(() => {
    void load();
  }, [load]);

  const openTitle = (title: Title) => {
    navigation.navigate('Detail', { titleId: title.id, preview: title });
  };

  if (loading && !data) {
    return (
      <View style={styles.screen}>
        <StatusState
          status="loading"
          message="Fetching rails from the catalog service."
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.screen}>
        <StatusState
          status="error"
          message={`${error} Check your connection and try again.`}
          actionLabel="Retry"
          onAction={() => {
            void load();
          }}
        />
      </View>
    );
  }

  if (!data || data.rails.length === 0) {
    return (
      <View style={styles.screen}>
        <StatusState
          status="empty"
          message="No rails were returned by the catalog."
          actionLabel="Reload"
          onAction={() => {
            void load();
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => void load()} tintColor={colors.accent} />
      }
    >
      
      {data.rails.map((rail) => (
        <ContentRail
          key={rail.id}
          heading={rail.title}
          titles={rail.itemIds
            .map((id) => data.titles[id])
            .filter((title): title is Title => Boolean(title))}
          onOpenTitle={openTitle}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  kicker: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 4,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
});
