import { SegmentedPills } from './SegmentedPills';

const OPTIONS = ['Day', 'Week', 'Month', 'All Goals'] as const;
export type TimeframeKey = (typeof OPTIONS)[number];

type Props = {
  value: TimeframeKey;
  onChange: (v: TimeframeKey) => void;
};

export function TimeframeTabs({ value, onChange }: Props) {
  return <SegmentedPills options={OPTIONS} value={value} onChange={onChange} />;
}
