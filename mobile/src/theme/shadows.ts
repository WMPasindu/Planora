import { Platform, type ViewStyle } from 'react-native';

export function cardShadow(elevation: 'low' | 'medium' = 'low'): ViewStyle {
  const opacity = elevation === 'medium' ? 0.08 : 0.04;
  const y = elevation === 'medium' ? 10 : 4;
  const blur = elevation === 'medium' ? 30 : 16;
  return Platform.select({
    ios: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: y },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
    android: { elevation: elevation === 'medium' ? 4 : 2 },
    default: {},
  }) as ViewStyle;
}
