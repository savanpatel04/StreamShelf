import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import { Focusable } from './Focusable';

type Props = {
  status: 'loading' | 'error' | 'empty';
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
};

export function StatusState({
  status,
  title,
  message,
  actionLabel,
  onAction,
  testID,
}: Props) {
  const resolvedTitle =
    title ??
    (status === 'loading'
      ? 'Loading catalog'
      : status === 'error'
        ? 'Something went wrong'
        : 'Nothing here yet');

  return (
    <View style={styles.wrap} testID={testID ?? `status-${status}`}>
      {status === 'loading' ? <ActivityIndicator color={colors.accent} size="large" /> : null}
      <Text style={styles.title}>{resolvedTitle}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onAction && actionLabel ? (
        <Focusable onPress={onAction} style={styles.action} testID="status-action">
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Focusable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 360,
  },
  action: {
    marginTop: spacing.sm,
    backgroundColor: colors.accentDim,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  actionLabel: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 16,
  },
});
