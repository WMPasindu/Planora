import type { PlanCadenceFilter as CadenceFilterKey } from '@/utils/goalLifecycle';

import { SegmentedPills } from './SegmentedPills';

const OPTIONS = ['Day', 'Week', 'Month', 'All Goals'] as const;
type PlanCadenceTab = (typeof OPTIONS)[number];

const TAB_TO_FILTER: Record<PlanCadenceTab, CadenceFilterKey> = {
  Day: 'daily',
  Week: 'weekly',
  Month: 'monthly',
  'All Goals': 'all',
};

const FILTER_TO_TAB: Record<CadenceFilterKey, PlanCadenceTab> = {
  daily: 'Day',
  weekly: 'Week',
  monthly: 'Month',
  all: 'All Goals',
  /** Legacy / edge: treat like all goals in the UI */
  other: 'All Goals',
};

type Props = {
  value: CadenceFilterKey;
  onChange: (v: CadenceFilterKey) => void;
};

export function PlanCadenceFilter({ value, onChange }: Props) {
  const tab = FILTER_TO_TAB[value];

  return (
    <SegmentedPills
      options={OPTIONS}
      value={tab}
      onChange={(t) => onChange(TAB_TO_FILTER[t])}
    />
  );
}
