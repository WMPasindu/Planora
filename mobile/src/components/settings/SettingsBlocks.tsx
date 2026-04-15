import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { theme } from '@/theme';

import { Text } from '../ui/Text';

const ICON_BG = theme.colors.surfaceContainerHigh;
const ICON_FG = theme.colors.onSurfaceVariant;

type IconName = keyof typeof Ionicons.glyphMap;

export function SettingsSectionLabel({ children }: { children: string }) {
  return (
    <Text variant="caption" color="onSurfaceVariant" style={styles.sectionLabel}>
      {children}
    </Text>
  );
}

export function SettingsCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function SettingsIcon({
  name,
  backgroundColor = ICON_BG,
}: {
  name: keyof typeof Ionicons.glyphMap;
  backgroundColor?: string;
}) {
  return (
    <View style={[styles.iconWrap, { backgroundColor }]}>
      <Ionicons name={name} size={19} color={ICON_FG} />
    </View>
  );
}

export function SettingsLinkRow({
  icon,
  title,
  iconBg,
  onPress,
  showDivider = true,
}: {
  icon: IconName;
  title: string;
  iconBg?: string;
  onPress?: () => void;
  showDivider?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.row, showDivider && styles.rowDivider]}
    >
      <SettingsIcon name={icon} backgroundColor={iconBg ?? ICON_BG} />
      <Text variant="body" style={styles.rowTitle}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.outline} />
    </Pressable>
  );
}

export function SettingsToggleRow({
  icon,
  title,
  iconBg,
  value,
  onValueChange,
  showDivider = true,
}: {
  icon: IconName;
  title: string;
  iconBg?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  showDivider?: boolean;
}) {
  return (
    <View style={[styles.row, showDivider && styles.rowDivider]}>
      <SettingsIcon name={icon} backgroundColor={iconBg ?? ICON_BG} />
      <Text variant="body" style={styles.rowTitle}>
        {title}
      </Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.outlineVariant, true: theme.colors.primary }}
        thumbColor="#fff"
        ios_backgroundColor={theme.colors.outlineVariant}
      />
    </View>
  );
}

export function SettingsBadgeRow({
  icon,
  title,
  iconBg,
  badge,
  onPress,
  showDivider = true,
  showChevron = true,
}: {
  icon: IconName;
  title: string;
  iconBg?: string;
  badge: string;
  onPress?: () => void;
  showDivider?: boolean;
  showChevron?: boolean;
}) {
  const body = (
    <>
      <SettingsIcon name={icon} backgroundColor={iconBg ?? ICON_BG} />
      <Text variant="body" style={styles.rowTitle}>
        {title}
      </Text>
      <View style={styles.badge}>
        <Text variant="caption" style={styles.badgeTxt}>
          {badge}
        </Text>
      </View>
      {showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={theme.colors.outline} />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.row, showDivider && styles.rowDivider]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={[styles.row, showDivider && styles.rowDivider]}>{body}</View>;
}

export function SettingsSyncRow({
  icon,
  title,
  subtitle,
  iconBg,
  showDivider = true,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  iconBg?: string;
  showDivider?: boolean;
  onPress?: () => void;
}) {
  const body = (
    <>
      <SettingsIcon name={icon} backgroundColor={iconBg ?? ICON_BG} />
      <View style={styles.syncCopy}>
        <Text variant="body" style={styles.rowTitle}>
          {title}
        </Text>
        <Text variant="footnote" color="onSurfaceVariant">
          {subtitle}
        </Text>
      </View>
      <View style={styles.syncOk}>
        <Ionicons name="checkmark-circle-outline" size={22} color={ICON_FG} />
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.row, styles.rowTall, showDivider && styles.rowDivider]}
      >
        {body}
      </Pressable>
    );
  }

  return <View style={[styles.row, styles.rowTall, showDivider && styles.rowDivider]}>{body}</View>;
}

export function SettingsValueRow({
  icon,
  title,
  value,
  iconBg,
  showDivider = true,
  onPress,
}: {
  icon: IconName;
  title: string;
  value: string;
  iconBg?: string;
  showDivider?: boolean;
  onPress?: () => void;
}) {
  const inner = (
    <>
      <SettingsIcon name={icon} backgroundColor={iconBg ?? ICON_BG} />
      <Text variant="body" style={styles.rowTitle}>
        {title}
      </Text>
      <Text variant="footnote" color="onSurfaceVariant" style={styles.valueRight}>
        {value}
      </Text>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={theme.colors.outline} /> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.row, showDivider && styles.rowDivider]}
      >
        {inner}
      </Pressable>
    );
  }

  return <View style={[styles.row, showDivider && styles.rowDivider]}>{inner}</View>;
}

const styles = StyleSheet.create({
  sectionLabel: {
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.2,
    textTransform: 'none',
  },
  card: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.outlineVariant,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    minHeight: 52,
  },
  rowTall: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.separator,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: { flex: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  badgeTxt: {
    fontWeight: '600',
    fontSize: 10,
    letterSpacing: 0.3,
    color: theme.colors.onSurfaceVariant,
  },
  syncCopy: { flex: 1, gap: 2 },
  syncOk: { marginLeft: 4 },
  valueRight: {
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
  },
});
