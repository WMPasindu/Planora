import { Platform, type TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  largeTitle: {
    fontFamily,
    fontSize: 34,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.37,
    lineHeight: 41,
  },
  display: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700' as TextStyle['fontWeight'],
    letterSpacing: 0.36,
    lineHeight: 34,
  },
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: 0.38,
    lineHeight: 25,
  },
  headline: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  body: {
    fontFamily,
    fontSize: 17,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  bodySmall: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  label: {
    fontFamily,
    fontSize: 13,
    fontWeight: '600' as TextStyle['fontWeight'],
    letterSpacing: -0.08,
    lineHeight: 18,
    textTransform: 'uppercase' as TextStyle['textTransform'],
  },
  caption: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: -0.08,
    lineHeight: 18,
  },
  footnote: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    letterSpacing: -0.08,
    lineHeight: 18,
  },
} as const;
