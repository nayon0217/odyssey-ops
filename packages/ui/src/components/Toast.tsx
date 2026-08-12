import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { View, Pressable, StyleSheet, Animated, Platform, Easing, type ViewStyle } from 'react-native';
import { tokens } from '../tokens';
import { Text } from './Text';
import type { PressableState } from './Button';

// Anchor the toast stack to the viewport on web (position:absolute would pin it to the
// scrolled document top and drift out of view).
const WEB_FIXED = Platform.OS === 'web' ? ({ position: 'fixed' } as unknown as ViewStyle) : null;

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastItem = ToastOptions & { id: string };

export type ToastContextValue = {
  show: (toast: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

// tone -> the semantic status color it borrows for its accent + dot.
const TONE_STATUS: Record<ToastTone, keyof typeof tokens.colors.status> = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  info: 'info',
};

let idSeq = 0;
function nextToastId(): string {
  idSeq += 1;
  return `toast-${Date.now()}-${idSeq}`;
}

export function ToastProvider({ children }: { children?: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (toast: ToastOptions) => {
      const id = nextToastId();
      const durationMs = toast.durationMs ?? 3500;
      setToasts((prev) => [...prev, { ...toast, id }]);
      const timer = setTimeout(() => dismiss(id), durationMs);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  // Clear any outstanding auto-dismiss timers on unmount.
  useEffect(() => {
    const activeTimers = timers.current;
    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/** Read-and-write access to the toast stack. Throws outside a ToastProvider. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast() must be called within a <ToastProvider>.');
  }
  return ctx;
}

function Toaster({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <View style={[styles.toaster, WEB_FIXED]} pointerEvents="box-none" testID="toaster">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </View>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: tokens.motion.duration.base,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: tokens.motion.duration.base,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [opacity, translateY]);

  const tone = toast.tone ?? 'info';
  const accentColor = tokens.colors.status[TONE_STATUS[tone]];

  return (
    <Animated.View
      style={[styles.card, { opacity, transform: [{ translateY }] }]}
      testID={`toast-${tone}`}
    >
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      <View style={styles.cardBody}>
        <Text variant="bodyStrong">{toast.title}</Text>
        {toast.description ? (
          <Text variant="bodySm" color="secondary" style={styles.description}>
            {toast.description}
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
        hitSlop={8}
        style={(rawState) => {
          const { pressed, hovered } = rawState as PressableState;
          return [
            styles.dismiss,
            {
              backgroundColor: pressed
                ? tokens.colors.surface.sunken
                : hovered
                  ? tokens.colors.surface.raised
                  : 'transparent',
            },
          ];
        }}
      >
        <Text variant="body" color="secondary" style={styles.dismissGlyph}>
          ×
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toaster: {
    position: 'absolute',
    top: tokens.spacing.xl,
    right: tokens.spacing.xl,
    zIndex: tokens.zIndex.toast,
    gap: tokens.spacing.sm,
    maxWidth: 360,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: tokens.colors.surface.base,
    borderRadius: tokens.radius.md,
    borderWidth: tokens.border.hairline,
    borderColor: tokens.colors.border.subtle,
    padding: tokens.spacing.md,
    gap: tokens.spacing.sm,
    ...tokens.shadow.md,
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: tokens.radius.pill,
  },
  cardBody: { flex: 1, gap: tokens.spacing.xxs },
  description: { marginTop: 2 },
  dismiss: {
    width: 22,
    height: 22,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissGlyph: { lineHeight: 18, marginTop: -2 },
});
