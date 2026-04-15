import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AccountabilityChart,
  AnalyticsTimeframeBar,
  type AnalyticsTimeframe,
  ArchivedCards,
  AnimatedScreen,
  PlanoraScreenHeader,
  MissedCards,
  Text,
} from '@/components';
import { getAnalyticsBundle } from '@/data/analyticsSnapshots';
import { useAppNavigation } from '@/navigation';
import { useAppStore } from '@/stores/appStore';
import { theme } from '@/theme';

export function AnalyticsScreen() {
  const { openProfile, openNotifications } = useAppNavigation();
  const user = useAppStore((s) => s.user);
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('DAY');

  const bundle = useMemo(() => getAnalyticsBundle(timeframe), [timeframe]);

  return (
    <AnimatedScreen tabBarPadding>
      <>
        <PlanoraScreenHeader
          leading="avatar"
          onLeadingPress={openProfile}
          avatarName={user?.displayName ?? undefined}
          avatarEmail={user?.email ?? undefined}
          onBellPress={openNotifications}
        />

        <AnalyticsTimeframeBar value={timeframe} onChange={setTimeframe} />

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text variant="caption" color="onSurfaceVariant" style={styles.perfLabel}>
                PERFORMANCE INDEX
              </Text>
              <Text variant="title" style={styles.hubTitle}>
                Accountability Hub
              </Text>
            </View>
            <View style={styles.scorePill}>
              <View style={styles.scoreDot} />
              <Text variant="headline" style={styles.scoreText}>
                {bundle.score.toFixed(1)}
              </Text>
            </View>
          </View>

          <AccountabilityChart stacks={bundle.chartStacks} />

          <View style={styles.distRow}>
            <View style={styles.distItem}>
              <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
              <Text variant="bodySmall">
                <Text style={{ fontWeight: '700', color: theme.colors.onSurface }}>
                  {bundle.utilizedHours.toFixed(1)}h{' '}
                </Text>
                Utilized
              </Text>
            </View>
            <View style={styles.distItem}>
              <View style={[styles.dot, { backgroundColor: '#F87171' }]} />
              <Text variant="bodySmall">
                <Text style={{ fontWeight: '700', color: theme.colors.onSurface }}>
                  {bundle.missedHours.toFixed(1)}h{' '}
                </Text>
                Missed
              </Text>
            </View>
          </View>

          <View style={styles.insightBox}>
            <Text variant="caption" color="onSurfaceVariant" style={styles.insightCap}>
              INSIGHT
            </Text>
            <Text variant="bodySmall" color="onSurfaceVariant" style={styles.insightBody}>
              {bundle.insight}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          <Text variant="footnote" style={styles.sectionTitle}>
            Archived & Progressed
          </Text>
        </View>
        <ArchivedCards items={bundle.archived} />

        <View style={[styles.sectionHead, styles.sectionHeadMissed]}>
          <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
          <Text variant="footnote" style={styles.sectionTitleMissed}>
            Missed Items / Loss Analysis
          </Text>
        </View>
        <MissedCards items={bundle.missed} />
      </>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    ...StyleSheet.flatten([
      {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
      },
    ]),
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  perfLabel: {
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  hubTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${theme.colors.success}18`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radii.full,
  },
  scoreDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
  },
  scoreText: {
    color: theme.colors.success,
    fontWeight: '800',
  },
  distRow: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  distItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  insightBox: {
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
  },
  insightCap: {
    letterSpacing: 0.8,
    marginBottom: 8,
    fontWeight: '700',
  },
  insightBody: {
    lineHeight: 22,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  sectionHeadMissed: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontWeight: '700',
    color: theme.colors.onSurface,
    letterSpacing: 0.2,
  },
  sectionTitleMissed: {
    fontWeight: '700',
    color: '#B71C1C',
    letterSpacing: 0.2,
  },
});
