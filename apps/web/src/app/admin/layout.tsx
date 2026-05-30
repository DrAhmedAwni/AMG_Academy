import { cookies } from 'next/headers';
import { AdminLayout as AdminShell } from '@/components/layouts';
import { ACCESS_TOKEN_COOKIE, verifyAccessToken } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const user = token ? await verifyAccessToken(token).catch(() => null) : null;

  return <AdminShell user={user}>{children}</AdminShell>;
}
