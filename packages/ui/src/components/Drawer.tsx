import { useEffect, useRef, type ReactNode } from 'react';
import {
  Pressable,
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  Easing,
  type ViewStyle,
} from 'react-native';
import { tokens } from '../tokens';
import { Text } from './Text';
import type { PressableState } from './Button';

export type DrawerProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
  testID?: string;
};

const WEB_FIXED = Platform.OS === 'web' ? ({ position: 'fixed' } as unknown as ViewStyle) : null;

/**
 * Right-edge sheet, full height. Dims the screen with `surface.overlay` and slides the panel
 * in from the right. Closes on backdrop press; clicks on the panel never close it.
 */
export function Drawer({ visible, onClose, title, children, footer, width, testID }: DrawerProps) {
  const panelWidth = width ?? 440;
  const translateX = useRef(new Animated.Value(panelWidth)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    translateX.setValue(panelWidth);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: tokens.motion.duration.slow,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: tokens.motion.duration.base,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [visible, panelWidth, translateX, opacity]);

  if (!visible) return null;

  return (
    <View style={[styles.overlay, WEB_FIXED]} testID={testID}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close panel" />
      </Animated.View>
      <Animated.View style={[styles.panel, { width: panelWidth, transform: [{ translateX }] }]}>
        <View style={styles.header}>
          {title ? (
            <Text variant="h3" style={styles.headerTitle}>
              {title}
            </Text>
          ) : (
            <View style={styles.headerTitle} />
          )}
          <CloseButton onPress={onClose} testID={testID ? `${testID}-close` : undefined} />
        </View>
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {children}
        </ScrollView>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </Animated.View>
    </View>
  );
}

function CloseButton({ onPress, testID }: { onPress: () => void; testID?: string }) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Close"
      hitSlop={8}
      style={(rawState) => {
        const { pressed, hovered } = rawState as PressableState;
        return [
          styles.closeButton,
          {
            backgroundColor: pressed
              ? tokens.colors.surface.sunken
              : hovered
                ? tokens.colors.surface.raised
                : 'transparent',
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
        ];
      }}
    >
      <Text variant="h3" color="secondary" style={styles.closeGlyph}>
        ×
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: tokens.colors.surface.overlay,
    zIndex: tokens.zIndex.drawer,
  },
  panel: {
    height: '100%',
    backgroundColor: tokens.colors.surface.base,
    padding: tokens.spacing.xl,
    ...tokens.shadow.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  headerTitle: { flex: 1 },
  body: { flex: 1 },
  bodyContent: { flexGrow: 1 },
  footer: { marginTop: tokens.spacing.xl },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: { lineHeight: 24, marginTop: -2 },
});
