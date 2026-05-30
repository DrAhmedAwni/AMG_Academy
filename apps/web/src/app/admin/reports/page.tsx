'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/states';
import { api } from '@/lib/api';
import { Users, Calendar, CheckCircle, DollarSign, CreditCard, BookOpen, QrCode } from 'lucide-react';

interface ReportCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function ReportCard({ title, icon, children }: ReportCardProps) {
  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-heading text-lg font-semibold text-text-primary">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

async function fetchReport(endpoint: string) {
  const { data } = await api.get(`/reports/${endpoint}`);
  return data.data;
}

export default function AdminReportsPage() {
  const usersReport = useQuery({ queryKey: ['report', 'users'], queryFn: () => fetchReport('users') });
  const registrationsReport = useQuery({ queryKey: ['report', 'registrations'], queryFn: () => fetchReport('registrations') });
  const attendanceReport = useQuery({ queryKey: ['report', 'attendance'], queryFn: () => fetchReport('attendance') });
  const revenueReport = useQuery({ queryKey: ['report', 'revenue'], queryFn: () => fetchReport('revenue') });
  const paymentsReport = useQuery({ queryKey: ['report', 'payments'], queryFn: () => fetchReport('payments') });
  const coursesReport = useQuery({ queryKey: ['report', 'courses'], queryFn: () => fetchReport('courses') });

  const isLoading = usersReport.isLoading || registrationsReport.isLoading || attendanceReport.isLoading ||
    revenueReport.isLoading || paymentsReport.isLoading || coursesReport.isLoading;

  if (isLoading) return <LoadingSkeleton lines={8} />;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-text-primary">Reports Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ReportCard title="Users" icon={<Users className="h-5 w-5 text-brand-action" />}>
          {usersReport.data && (
            <div className="space-y-2 text-sm">
              <p className="text-text-secondary">Total: <span className="font-semibold text-text-primary">{usersReport.data.summary?.total}</span></p>
              <p className="text-text-secondary">New (30d): <span className="font-semibold text-text-primary">{usersReport.data.summary?.recent}</span></p>
              <div className="space-y-1">
                {usersReport.data.byStatus?.map((s: any) => (
                  <div key={s.status} className="flex justify-between text-xs">
                    <span className="text-text-muted">{s.status}</span>
                    <span className="font-medium text-text-primary">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ReportCard>

        <ReportCard title="Registrations" icon={<Calendar className="h-5 w-5 text-brand-action" />}>
          {registrationsReport.data && (
            <div className="space-y-2 text-sm">
              <p className="text-text-secondary">Total: <span className="font-semibold text-text-primary">{registrationsReport.data.summary?.total}</span></p>
              <div className="space-y-1">
                {registrationsReport.data.byStatus?.map((s: any) => (
                  <div key={s.status} className="flex justify-between text-xs">
                    <span className="text-text-muted">{s.status}</span>
                    <span className="font-medium text-text-primary">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ReportCard>

        <ReportCard title="Attendance" icon={<CheckCircle className="h-5 w-5 text-brand-action" />}>
          {attendanceReport.data && (
            <div className="space-y-2 text-sm">
              <p className="text-text-secondary">Total Check-ins: <span className="font-semibold text-text-primary">{attendanceReport.data.summary?.total}</span></p>
              <div className="space-y-1">
                {attendanceReport.data.byStatus?.map((s: any) => (
                  <div key={s.status} className="flex justify-between text-xs">
                    <span className="text-text-muted">{s.status}</span>
                    <span className="font-medium text-text-primary">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ReportCard>

        <ReportCard title="Revenue" icon={<DollarSign className="h-5 w-5 text-brand-action" />}>
          {revenueReport.data && (
            <div className="space-y-2 text-sm">
              <p className="text-text-secondary">Total Revenue: <span className="font-semibold text-text-primary">{revenueReport.data.summary?.totalRevenue} EGP</span></p>
              <div className="space-y-1">
                {revenueReport.data.byStatus?.map((s: any) => (
                  <div key={s.status} className="flex justify-between text-xs">
                    <span className="text-text-muted">{s.status}</span>
                    <span className="font-medium text-text-primary">{s.amount} EGP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ReportCard>

        <ReportCard title="Payments" icon={<CreditCard className="h-5 w-5 text-brand-action" />}>
          {paymentsReport.data && (
            <div className="space-y-2 text-sm">
              <p className="text-text-secondary">Total: <span className="font-semibold text-text-primary">{paymentsReport.data.summary?.total}</span></p>
              <p className="text-text-secondary">Pending: <span className="font-semibold text-warning">{paymentsReport.data.summary?.pending}</span></p>
              <p className="text-text-secondary">Successful: <span className="font-semibold text-success">{paymentsReport.data.summary?.successful}</span></p>
              <p className="text-text-secondary">Failed: <span className="font-semibold text-error">{paymentsReport.data.summary?.failed}</span></p>
            </div>
          )}
        </ReportCard>

        <ReportCard title="Courses" icon={<BookOpen className="h-5 w-5 text-brand-action" />}>
          {coursesReport.data && (
            <div className="space-y-2 text-sm">
              <p className="text-text-secondary">Total: <span className="font-semibold text-text-primary">{coursesReport.data.summary?.total}</span></p>
              <p className="text-text-secondary">Enrollments: <span className="font-semibold text-text-primary">{coursesReport.data.summary?.enrollmentsTotal}</span></p>
              <div className="space-y-1">
                {coursesReport.data.topCourses?.map((c: any) => (
                  <div key={c.id} className="flex justify-between text-xs">
                    <span className="text-text-muted line-clamp-1">{c.title}</span>
                    <span className="font-medium text-text-primary">{c.enrollments}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ReportCard>
      </div>
    </div>
  );
}
