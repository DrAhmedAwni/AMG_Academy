'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui';

interface QRScannerProps {
  onScan: (token: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-scanner-container';

  useEffect(() => {
    Html5Qrcode.getCameras().then((devices) => {
      const mapped = devices.map((d) => ({ id: d.id, label: d.label }));
      setCameras(mapped);
      if (mapped.length > 0 && mapped[0]) setSelectedCamera(mapped[0].id);
    });
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) return;
    scannerRef.current = new Html5Qrcode(containerId);
    try {
      await scannerRef.current.start(
        selectedCamera,
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          if (scannerRef.current) {
            scannerRef.current.stop().catch(() => {});
            setIsScanning(false);
          }
        },
        () => {},
      );
      setIsScanning(true);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to start scanner');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          className="rounded-md border border-border bg-background-surface px-3 py-2 text-sm text-text-primary"
          value={selectedCamera}
          onChange={(e) => setSelectedCamera(e.target.value)}
        >
          {cameras.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        {!isScanning ? (
          <Button onClick={startScanning}>Start Camera</Button>
        ) : (
          <Button variant="secondary" onClick={stopScanning}>
            Stop Camera
          </Button>
        )}
      </div>

      <div id={containerId} className="mx-auto w-full max-w-sm overflow-hidden rounded-lg" />

      <div className="rounded-md border border-border bg-background-surface p-4">
        <p className="text-sm text-text-secondary">Or enter token manually:</p>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            className="flex-1 rounded-md border border-border bg-background-main px-3 py-2 text-sm text-text-primary"
            placeholder="Enter QR token"
          />
          <Button onClick={() => onScan(manualToken)}>Submit</Button>
        </div>
      </div>
    </div>
  );
}
