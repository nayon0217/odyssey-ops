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
import { Row } from './Box';
import { Button, type PressableState, type ButtonProps } from './Button';

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
  testID?: string;
};

// A viewport-fixed overlay (web) / absolute-fill (native). Using a plain fixed layer
// instead of RN's Modal avoids react-native-web's portal quirks and paints reliably.
const WEB_FIXED = Platform.OS === 'web' ? ({ position: 'fixed' } as unknown as ViewStyle) : null;

/**
 * Centered dialog. Dims the screen with `surface.overlay`, materializes the panel with a
 * brief fade + scale, and closes on backdrop press. Clicks on the panel never close it
 * (the backdrop is a separate layer behind the panel).
 */
export function Modal({ visible, onClose, title, children, footer, width, testID }: ModalProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: tokens.motion.duration.base,
      easing: Easing.out(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [visible, opacity]);

  if (!visible) return null;

  return (
    <View style={[styles.overlay, WEB_FIXED]} testID={testID}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close dialog" />
      {/* No transform on this layer — a transform would trap position:fixed descendants
          (e.g. a Select dropdown opened inside the modal). Fade only. */}
      <Animated.View style={[styles.panelWrap, { maxWidth: width ?? 480, opacity }]}>
        <View style={styles.panel}>
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
          {footer ? (
            <Row justify="flex-end" gap="sm" style={styles.footer}>
              {footer}
            </Row>
          ) : null}
        </View>
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

export type ConfirmDialogTone = 'default' | 'danger';

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  testID?: string;
};

/** A Modal preset for confirm/cancel prompts, including destructive ("danger") actions. */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
  loading = false,
  testID,
}: ConfirmDialogProps) {
  const confirmVariant: ButtonProps['variant'] = tone === 'danger' ? 'destructive' : 'primary';
  return (
    <Modal
      visible={visible}
      onClose={onCancel}
      title={title}
      width={400}
      testID={testID}
      footer={
        <>
          <Button
            label={cancelLabel}
            variant="secondary"
            onPress={onCancel}
            disabled={loading}
            testID={testID ? `${testID}-cancel` : undefined}
          />
          <Button
            label={confirmLabel}
            variant={confirmVariant}
            onPress={onConfirm}
            loading={loading}
            testID={testID ? `${testID}-confirm` : undefined}
          />
        </>
      }
    >
      <Text variant="body" color="secondary">
        {message}
      </Text>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.xl,
    backgroundColor: tokens.colors.surface.overlay,
    zIndex: tokens.zIndex.modal,
  },
  panelWrap: {
    width: '100%',
    maxHeight: '85%',
    alignSelf: 'center',
  },
  panel: {
    backgroundColor: tokens.colors.surface.base,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.xl,
    maxHeight: '100%',
    width: '100%',
    overflow: 'hidden',
    ...tokens.shadow.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
  },
  headerTitle: { flex: 1, minWidth: 0 },
  body: { flexShrink: 1, width: '100%' },
  bodyContent: { flexGrow: 1, width: '100%' },
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
