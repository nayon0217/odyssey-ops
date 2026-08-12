import { useEffect, useRef } from 'react';
import { Animated,
  Platform, Easing, Pressable, StyleSheet } from 'react-native';
import { tokens } from '../tokens';
import type { PressableState } from './Button';

export type SwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
};

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const THUMB_SIZE = 20;
const TRACK_PADDING = 2;
const THUMB_TRAVEL = TRACK_WIDTH - THUMB_SIZE - TRACK_PADDING * 2;

export function Switch({ value, onValueChange, disabled = false, testID }: SwitchProps) {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: tokens.motion.duration.fast,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [value, progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, THUMB_TRAVEL] });

  return (
    <Pressable
      testID={testID}
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      style={(rawState) => {
        const { pressed } = rawState as PressableState;
        return [
          styles.track,
          {
            backgroundColor: value ? tokens.colors.interactive.primary : tokens.colors.surface.sunken,
            borderColor: value ? tokens.colors.interactive.primary : tokens.colors.border.default,
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale: pressed && !disabled ? 0.96 : 1 }],
          },
        ];
      }}
    >
      <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: tokens.radius.pill,
    borderWidth: tokens.border.thin,
    padding: TRACK_PADDING,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.surface.base,
    ...tokens.shadow.sm,
  },
});
