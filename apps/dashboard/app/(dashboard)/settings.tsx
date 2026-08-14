import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Card,
  CardHeader,
  Input,
  Switch,
  Button,
  Row,
  Stack,
  Divider,
  Text,
  Callout,
  LoadingState,
  ErrorState,
  useToast,
  tokens,
} from '@odyssey/ui';
import { PageScaffold } from '../../components/PageScaffold';
import { useSettingsPage } from '../../hooks/use-settings-page';
import { validateSettingsForm, type SettingsFormErrors } from '../../lib/form-validation';

type FormState = {
  prepTimeMinutes: string;
  autoAccept: boolean;
  isAcceptingOrders: boolean;
  openingTime: string;
  closingTime: string;
};

export default function SettingsPage() {
  const { settings, isLoading, isError, refetch, update } = useSettingsPage();
  const toast = useToast();
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<SettingsFormErrors>({});
  const initialized = useRef(false);

  // Seed the form from the saved settings once they arrive (don't clobber edits on refetch).
  useEffect(() => {
    if (settings && !initialized.current) {
      initialized.current = true;
      setForm({
        prepTimeMinutes: String(settings.prepTimeMinutes),
        autoAccept: settings.autoAccept,
        isAcceptingOrders: settings.isAcceptingOrders,
        openingTime: settings.openingTime,
        closingTime: settings.closingTime,
      });
    }
  }, [settings]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setErrors((e) => {
      if (!(key in e)) return e;
      const next = { ...e };
      delete next[key as keyof SettingsFormErrors];
      return next;
    });
  }

  function save() {
    if (!form) return;
    const nextErrors = validateSettingsForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.show({ title: 'Fix the highlighted fields', tone: 'error' });
      return;
    }
    update.mutate(
      {
        data: {
          prepTimeMinutes: Number(form.prepTimeMinutes),
          autoAccept: form.autoAccept,
          isAcceptingOrders: form.isAcceptingOrders,
          openingTime: form.openingTime.trim(),
          closingTime: form.closingTime.trim(),
        },
      },
      {
        onSuccess: () => toast.show({ title: 'Settings saved', tone: 'success' }),
        onError: () => toast.show({ title: 'Could not save settings', tone: 'error' }),
      },
    );
  }

  return (
    <PageScaffold title="Settings" subtitle="Ordering availability, prep time, and hours">
      {isError ? (
        <ErrorState description="Couldn’t load settings." onRetry={refetch} />
      ) : isLoading || !form ? (
        <LoadingState label="Loading settings…" />
      ) : (
        <View style={styles.column}>
          {!form.isAcceptingOrders ? (
            <Callout tone="warning" title="Orders are paused">
              New orders are rejected by the API until “Accepting orders” is turned back on.
            </Callout>
          ) : null}
          <Card>
            <CardHeader title="Service availability" subtitle="Control whether new orders are accepted" />
            <Stack gap="lg">
              <Row justify="space-between">
                <Stack gap="xxs" style={styles.rowText}>
                  <Text variant="bodyStrong">Accepting orders</Text>
                  <Text variant="bodySm" color="secondary">
                    When off, the API rejects new orders.
                  </Text>
                </Stack>
                <Switch
                  value={form.isAcceptingOrders}
                  onValueChange={(v) => set('isAcceptingOrders', v)}
                  testID="setting-accepting"
                />
              </Row>
              <Divider />
              <Row justify="space-between">
                <Stack gap="xxs" style={styles.rowText}>
                  <Text variant="bodyStrong">Auto-accept orders</Text>
                  <Text variant="bodySm" color="secondary">
                    New orders start as “accepted” instead of “pending”.
                  </Text>
                </Stack>
                <Switch
                  value={form.autoAccept}
                  onValueChange={(v) => set('autoAccept', v)}
                  testID="setting-auto-accept"
                />
              </Row>
            </Stack>
          </Card>

          <Card>
            <CardHeader title="Timing & hours" />
            <Stack gap="md">
              <Input
                label="Prep time (minutes)"
                value={form.prepTimeMinutes}
                onChangeText={(v) => set('prepTimeMinutes', v.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="15"
                errorText={errors.prepTimeMinutes}
                helperText="0–480 minutes"
              />
              <Row gap="md" align="flex-start">
                <View style={styles.flex}>
                  <Input
                    label="Opening time"
                    value={form.openingTime}
                    onChangeText={(v) => set('openingTime', v)}
                    placeholder="09:00"
                    errorText={errors.openingTime}
                    helperText="24-hour HH:mm"
                  />
                </View>
                <View style={styles.flex}>
                  <Input
                    label="Closing time"
                    value={form.closingTime}
                    onChangeText={(v) => set('closingTime', v)}
                    placeholder="21:00"
                    errorText={errors.closingTime}
                    helperText="Must be after opening"
                  />
                </View>
              </Row>
            </Stack>
          </Card>

          <Row justify="flex-end">
            <Button label="Save changes" onPress={save} loading={update.isPending} />
          </Row>
        </View>
      )}
    </PageScaffold>
  );
}

const styles = StyleSheet.create({
  column: { gap: tokens.spacing.xl, maxWidth: 640, width: '100%' },
  rowText: { flex: 1 },
  flex: { flex: 1 },
});
