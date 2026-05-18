import { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';
import AdminShell from './admin-shell';

export const metadata: Metadata = {
  title: {
    default: `Admin Portal | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME} Admin`,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
