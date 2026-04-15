export const colors = {
  /** App accent — navy blue */
  primary: '#1e3a8a',
  /** Light tint for insight cards, chips, soft fills on primary */
  primaryContainer: '#e0e7ff',
  onPrimary: '#ffffff',
  secondary: '#34C759',
  onSecondary: '#ffffff',
  tertiary: '#FF9500',
  /** Main app / screen background */
  surface: '#FFFFFF',
  surfaceContainerLow: '#EFEFF4',
  surfaceContainerHigh: '#E5E5EA',
  surfaceBright: '#FFFFFF',
  surfaceLowest: '#FFFFFF',
  onSurface: '#000000',
  onSurfaceVariant: '#8E8E93',
  outline: '#C7C7CC',
  outlineVariant: '#D1D1D6',
  error: '#FF3B30',
  onError: '#ffffff',
  inversePrimary: '#93c5fd',
  success: '#34C759',
  secondaryLabel: '#3C3C4399',
  tertiaryLabel: '#3C3C434D',
  fill: '#78788033',
  separator: '#3C3C4349',
  /** Scroll / outer chrome when using grouped layouts */
  groupedBackground: '#FFFFFF',
  /** Inset grouped blocks, secondary panels (subtle contrast vs pure white) */
  secondaryGroupedBackground: '#F1F5F9',
} as const;

export type ColorName = keyof typeof colors;
