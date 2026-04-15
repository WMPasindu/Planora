import { StyleSheet, View, type ViewProps } from 'react-native';

export function DecorativeBackdrop({ style, ...rest }: ViewProps) {
  return (
    <View pointerEvents="none" style={[styles.root, style]} {...rest}>
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />
      <View style={[styles.blob, styles.blob3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blob1: {
    width: 300,
    height: 300,
    top: -100,
    right: -80,
    backgroundColor: '#007AFF',
    opacity: 0.06,
  },
  blob2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -60,
    backgroundColor: '#5AC8FA',
    opacity: 0.05,
  },
  blob3: {
    width: 140,
    height: 140,
    top: '40%',
    right: 30,
    backgroundColor: '#34C759',
    opacity: 0.04,
  },
});
