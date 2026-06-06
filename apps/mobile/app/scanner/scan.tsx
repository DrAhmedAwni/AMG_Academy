import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header, Screen } from '../../src/components/layout';
import { ErrorState, LoadingState, PermissionDeniedState } from '../../src/components/states';
import { Button, GlassCard, TextField } from '../../src/components/ui';
import { SessionGate } from '../../src/features/auth/SessionGate';
import {
  serializeScannerResult,
  useScanQrMutation,
} from '../../src/features/scanner/scanner.hooks';
import type { ScannerValidationResult } from '../../src/features/scanner/scanner.api';
import { mapApiErrorToUi } from '../../src/lib/errors';
import { colors, radius, spacing, textStyles } from '../../src/theme';

function resolveParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function ScannerCameraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ eventId?: string | string[]; eventTitle?: string | string[] }>();
  const eventId = resolveParam(params.eventId);
  const eventTitle = resolveParam(params.eventTitle);
  const [permission, requestPermission] = useCameraPermissions();
  const scanMutation = useScanQrMutation();
  const [scanLocked, setScanLocked] = useState(false);
  const [manualToken, setManualToken] = useState('');

  const routeToResult = useCallback(
    (result: ScannerValidationResult) => {
      router.replace({
        pathname: '/scanner/result',
        params: {
          ...serializeScannerResult(result),
          eventId: eventId ?? '',
          eventTitle: eventTitle ?? '',
        },
      } as never);
    },
    [eventId, eventTitle, router],
  );

  const routeErrorToResult = useCallback(
    (error: unknown) => {
      const uiError = mapApiErrorToUi(error);
      routeToResult({
        valid: false,
        reason: 'invalid',
        title: uiError.title,
        message: uiError.message,
      });
    },
    [routeToResult],
  );

  const submitToken = useCallback(
    (token: string) => {
      if (!eventId || scanLocked || scanMutation.isPending) {
        return;
      }

      const trimmedToken = token.trim();
      if (!trimmedToken) {
        return;
      }

      setScanLocked(true);
      void scanMutation
        .mutateAsync({ token: trimmedToken, eventId })
        .then(routeToResult)
        .catch((error: unknown) => {
          setScanLocked(false);
          routeErrorToResult(error);
        });
    },
    [eventId, routeErrorToResult, routeToResult, scanLocked, scanMutation],
  );

  const onBarcodeScanned = useMemo(
    () => (result: BarcodeScanningResult) => {
      submitToken(result.data);
    },
    [submitToken],
  );

  if (!eventId) {
    return (
      <SessionGate requireScanner>
        <Screen>
          <ErrorState title="Event required" message="Select an event before opening the scanner." />
        </Screen>
      </SessionGate>
    );
  }

  if (!permission) {
    return (
      <SessionGate requireScanner>
        <Screen>
          <LoadingState title="Checking camera" message="Preparing camera permission." />
        </Screen>
      </SessionGate>
    );
  }

  if (!permission.granted) {
    return (
      <SessionGate requireScanner>
        <Screen>
          <Header
            title="Camera permission"
            subtitle={eventTitle ?? 'Scanner mode'}
            action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
          />
          <PermissionDeniedState
            title="Camera access required"
            message="Scanner mode needs camera permission to validate QR tickets."
            action={
              permission.canAskAgain
                ? {
                    label: 'Allow camera',
                    onPress: () => {
                      void requestPermission();
                    },
                  }
                : undefined
            }
          />
        </Screen>
      </SessionGate>
    );
  }

  return (
    <SessionGate requireScanner>
      <Screen scroll={false} contentStyle={styles.screen}>
        <Header
          title="Scan QR"
          subtitle={eventTitle ?? 'Selected event'}
          action={<Button label="Back" variant="secondary" onPress={() => router.back()} />}
        />

        <View style={styles.cameraShell}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanLocked ? undefined : onBarcodeScanned}
          />
          <View pointerEvents="none" style={styles.scanFrame}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          {scanMutation.isPending ? (
            <View style={styles.pendingOverlay}>
              <Text style={styles.pendingText}>Checking ticket...</Text>
            </View>
          ) : null}
        </View>

        <GlassCard style={styles.manualCard}>
          <Text style={styles.manualTitle}>Fallback entry</Text>
          <Text style={styles.manualMessage}>
            Use this only when the camera cannot read the QR code.
          </Text>
          <TextField
            label="QR code"
            value={manualToken}
            onChangeText={setManualToken}
            placeholder="Paste or type the QR code"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button
            label="Validate"
            disabled={!manualToken.trim() || scanLocked}
            loading={scanMutation.isPending}
            onPress={() => submitToken(manualToken)}
          />
        </GlassCard>
      </Screen>
    </SessionGate>
  );
}

const cornerBase = {
  position: 'absolute' as const,
  width: 36,
  height: 36,
  borderColor: colors.accent.primary,
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  cameraShell: {
    flex: 1,
    minHeight: 360,
    overflow: 'hidden',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.strong,
    backgroundColor: colors.surface.elevated,
  },
  camera: {
    flex: 1,
  },
  scanFrame: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 220,
    height: 220,
    marginLeft: -110,
    marginTop: -110,
  },
  cornerTopLeft: {
    ...cornerBase,
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    ...cornerBase,
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    ...cornerBase,
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    ...cornerBase,
    right: 0,
    bottom: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  pendingOverlay: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    left: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.background.overlay,
    padding: spacing.md,
  },
  pendingText: {
    ...textStyles.label,
    color: colors.accent.primary,
  },
  manualCard: {
    gap: spacing.sm,
  },
  manualTitle: textStyles.label,
  manualMessage: textStyles.body,
});
