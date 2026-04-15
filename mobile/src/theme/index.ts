import { colors } from './colors';
import { screenLayout } from './layout';
import { radii, spacing } from './spacing';
import { typography } from './typography';

export const theme = {
  colors,
  spacing,
  screenLayout,
  radii,
  typography,
} as const;

export type Theme = typeof theme;

export { colors } from './colors';
export { screenLayout } from './layout';
export { spacing, radii } from './spacing';
export { typography } from './typography';
export { cardShadow } from './shadows';
export { authCoral, authIndigo } from './auth';
