'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Award, Download, ShieldCheck, ShieldX } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { LoadingSkeleton, ErrorState } from '@/components/states';
import { api } from '@/lib/api';

interface VerificationResult {
  valid: boolean;
  certificateNumber: string | null;
  learnerName: string | null;
  sourceType: string | null;
  sourceTitle: string | null;
  issuerName: string;
  issuedAt: string | null;
  hours: number | null;
  credits: number | null;
  status: string;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : '-';
}

export default function CertificateVerificationPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const verificationQuery = useQuery({
    queryKey: ['certificate-verification', code],
    queryFn: async () => {
      const { data } = await api.get(`/certificates/verify/${encodeURIComponent(code)}`, {
        headers: { 'x-skip-auth-redirect': '1' },
      });
      return (data?.data ?? data) as VerificationResult;
    },
    enabled: Boolean(code),
  });

  if (verificationQuery.isLoading) {
    return (
      <main className="min-h-screen bg-surface-main px-4 py-10 text-text-primary">
        <div className="mx-auto max-w-3xl">
          <LoadingSkeleton lines={7} />
        </div>
      </main>
    );
  }

  if (verificationQuery.isError) {
    return (
      <main className="min-h-screen bg-surface-main px-4 py-10 text-text-primary">
        <div className="mx-auto max-w-3xl">
          <ErrorState
            title="Verification failed"
            description="We could not verify this certificate right now."
            onRetry={verificationQuery.refetch}
          />
        </div>
      </main>
    );
  }

  const result = verificationQuery.data;
  const publicDownloadUrl = `/api/v1/certificates/verify/${encodeURIComponent(code)}/download`;

  return (
    <main className="min-h-screen bg-surface-main px-4 py-10 text-text-primary">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan/30 bg-cyan/10">
            <Award className="h-7 w-7 text-cyan" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
            AMG Academy
          </p>
          <h1 className="font-heading text-3xl font-bold">Certificate Verification</h1>
        </div>

        <Card className="space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            {result?.valid ? (
              <ShieldCheck className="h-14 w-14 text-success" />
            ) : (
              <ShieldX className="h-14 w-14 text-error" />
            )}
            <div>
              <h2 className="font-heading text-2xl font-semibold">
                {result?.valid ? 'Valid Certificate' : 'Certificate Not Valid'}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {result?.valid
                  ? 'This certificate was issued by AMG Academy.'
                  : 'This certificate is missing, unreleased, revoked, or voided.'}
              </p>
            </div>
          </div>

          {result?.valid ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail label="Certificate ID" value={result.certificateNumber ?? '-'} />
              <Detail label="Learner" value={result.learnerName ?? '-'} />
              <Detail label="Source" value={result.sourceTitle ?? '-'} />
              <Detail label="Type" value={result.sourceType ?? '-'} />
              <Detail label="Issued" value={formatDate(result.issuedAt)} />
              <Detail label="Issuer" value={result.issuerName} />
              <Detail label="Hours" value={result.hours ? String(result.hours) : '-'} />
              <Detail label="Credits" value={result.credits ? String(result.credits) : '-'} />
            </div>
          ) : (
            <div className="rounded-lg border border-error/25 bg-error/10 p-4 text-sm text-text-secondary">
              Status: {result?.status?.replace('_', ' ') ?? 'not found'}
            </div>
          )}

          {result?.valid ? (
            <a href={publicDownloadUrl}>
              <Button>
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </a>
          ) : null}
        </Card>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background-elevated p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</p>
      <p className="mt-1 font-medium text-text-primary">{value}</p>
    </div>
  );
}
