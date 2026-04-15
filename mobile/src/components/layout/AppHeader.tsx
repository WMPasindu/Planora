import { PlanoraScreenHeader } from './PlanoraScreenHeader';

type AppHeaderProps = {
  onBack?: () => void;
};

/** Auth helper: back chevron + centered Planora (no bell). Prefer `PlanoraScreenHeader` for full control. */
export function AppHeader({ onBack }: AppHeaderProps) {
  return (
    <PlanoraScreenHeader
      leading={onBack ? 'back' : 'none'}
      onLeadingPress={onBack}
    />
  );
}
