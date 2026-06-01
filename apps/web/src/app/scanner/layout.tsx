import { ScannerLayout as ScannerShell } from '@/components/layouts';

export default function ScannerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ScannerShell>{children}</ScannerShell>;
}
