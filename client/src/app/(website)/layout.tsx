import { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';
import Navbar from '@/components/website/Navbar';
import Footer from '@/components/website/Footer';

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Premium Temporary Event Staffing`,
    template: `%s | ${SITE_NAME}`,
  },
};

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="website-public-shell flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
