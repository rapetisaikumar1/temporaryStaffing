export const SITE_NAME = 'Niyukti';
export const SITE_TAGLINE = 'Premium Temporary Event Staffing';
export const SITE_DESCRIPTION =
  'Niyukti provides verified, trained, and event-ready temporary staff for corporate events, conferences, exhibitions, weddings, and more.';

export const CONTACT_EMAIL = 'contact@niyukti.com';
export const CONTACT_PHONE = '+91 98765 43210';

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Industries', href: '/industries' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

export const SERVICES = [
  { title: 'Corporate Event Staffing', icon: 'building-2', slug: 'corporate-events' },
  { title: 'Conference Staffing', icon: 'presentation', slug: 'conferences' },
  { title: 'Hospitality Staffing', icon: 'utensils', slug: 'hospitality' },
  { title: 'Exhibition Staffing', icon: 'layout-grid', slug: 'exhibitions' },
  { title: 'Wedding Staffing', icon: 'heart', slug: 'weddings' },
  { title: 'Promotional Staffing', icon: 'megaphone', slug: 'promotional' },
  { title: 'Security & Operations', icon: 'shield', slug: 'security' },
  { title: 'Technical Event Support', icon: 'monitor', slug: 'technical' },
];

export const EVENT_TYPES = [
  'Corporate Event',
  'Conference',
  'Exhibition',
  'Wedding',
  'Product Launch',
  'Trade Show',
  'Awards Ceremony',
  'Hospitality Event',
  'Promotional Event',
  'Other',
];

export const INQUIRY_STATUS = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUOTATION_SENT: 'QUOTATION_SENT',
  CONFIRMED: 'CONFIRMED',
  LOST: 'LOST',
} as const;

export const BOOKING_STATUS = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const STAFF_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  BLACKLISTED: 'BLACKLISTED',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
} as const;

export const ADMIN_SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'layout-dashboard' },
  { label: 'Inquiries', href: '/inquiries', icon: 'mail' },
  { label: 'Clients', href: '/clients', icon: 'users' },
  { label: 'Staff', href: '/staff', icon: 'user-check' },
  { label: 'Events', href: '/events', icon: 'calendar' },
  { label: 'Assignments', href: '/assignments', icon: 'clipboard-list' },
  { label: 'Quotations', href: '/quotations', icon: 'file-text' },
  { label: 'Attendance', href: '/attendance', icon: 'clock' },
  { label: 'Payments', href: '/payments', icon: 'credit-card' },
  { label: 'Reports', href: '/reports', icon: 'bar-chart-2' },
  { label: 'Settings', href: '/settings', icon: 'settings' },
];

export const PAGINATION_PAGE_SIZE = 20;
