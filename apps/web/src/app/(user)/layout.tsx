import { UserLayout as UserShell } from '@/components/layouts';

export default function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <UserShell title="Member Workspace">{children}</UserShell>;
}
