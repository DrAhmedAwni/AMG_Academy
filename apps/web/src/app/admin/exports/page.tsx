'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Download, FileSpreadsheet, Users, Calendar, CheckCircle, CreditCard, BookOpen } from 'lucide-react';

const exportTypes = [
  { key: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { key: 'registrations', label: 'Registrations', icon: <Calendar className="h-4 w-4" /> },
  { key: 'attendance', label: 'Attendance', icon: <CheckCircle className="h-4 w-4" /> },
  { key: 'payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
  { key: 'enrollments', label: 'Enrollments', icon: <BookOpen className="h-4 w-4" /> },
];

export default function AdminExportsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setLoading(type);
    try {
      const response = await api.post(`/exports/${type}`, {}, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${type} exported successfully`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Export failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-text-primary">Export Center</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exportTypes.map((type) => (
          <Card key={type.key} className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand-action/10 p-2 text-brand-action">
                {type.icon}
              </div>
              <div>
                <h3 className="font-medium text-text-primary">{type.label}</h3>
                <p className="text-xs text-text-muted">Download as CSV</p>
              </div>
            </div>
            <Button
              onClick={() => handleExport(type.key)}
              disabled={loading === type.key}
              className="mt-auto gap-2"
              size="sm"
            >
              <Download className="h-4 w-4" />
              {loading === type.key ? 'Exporting...' : 'Export'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
