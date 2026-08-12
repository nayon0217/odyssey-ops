import { useEffect, useRef } from 'react';
import { Animated,
  Platform, StyleSheet, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '../tokens';
import { Stack } from './Box';

type RadiusToken = keyof typeof tokens.radius;

export type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: RadiusToken;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Placeholder block with a gentle pulsing opacity loop. Respectful, ~1s cycle. */
export function Skeleton({ width = '100%', height = 16, radius = 'sm', style, testID }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: tokens.motion.duration.slow * 2,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: tokens.motion.duration.slow * 2,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: tokens.radius[radius],
          opacity,
        },
        style,
      ]}
    />
  );
}

export type SkeletonTextProps = {
  lines?: number;
  lastLineWidth?: DimensionValue;
  testID?: string;
};

/** Stacks `lines` Skeleton bars, the last one narrower to read as text. */
export function SkeletonText({ lines = 3, lastLineWidth = '60%', testID }: SkeletonTextProps) {
  return (
    <Stack gap="sm" testID={testID}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={14} width={i === lines - 1 ? lastLineWidth : '100%'} />
      ))}
    </Stack>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: tokens.colors.surface.sunken,
  },
});
