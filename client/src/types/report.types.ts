// ── Overview ──────────────────────────────────────────────────────────────────

export interface OverviewReport {
  inquiries: {
    total: number;
    new: number;
    confirmed: number;
    lost: number;
  };
  events: {
    total: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  staff: {
    total: number;
    active: number;
    assigned: number;
  };
  quotations: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
  };
  payments: {
    total: number;
    pending: number;
    partiallyPaid: number;
    paid: number;
    overdue: number;
  };
  attendance: {
    total: number;
    present: number;
    late: number;
    noShow: number;
    completed: number;
  };
}

// ── Financials ────────────────────────────────────────────────────────────────

export interface FinancialStatusBreakdown {
  count: number;
  totalAmount: number;
  collected: number;
  outstanding: number;
}

export interface FinancialsReport {
  totalRevenue: number;
  totalCollected: number;
  totalOutstanding: number;
  acceptedQuotationsValue: number;
  byStatus: Record<string, FinancialStatusBreakdown>;
}

// ── Events Report ─────────────────────────────────────────────────────────────

export interface EventReportItem {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  status: string;
  staffCount: number;
  client: { id: string; name: string; companyName: string | null } | null;
  payment: {
    totalAmount: number;
    advancePaid: number;
    balanceAmount: number;
    status: string;
  } | null;
  _count: {
    assignments: number;
    attendance: number;
  };
}

export interface EventsReport {
  data: EventReportItem[];
  total: number;
  page: number;
  limit: number;
}

// ── Staff Report ──────────────────────────────────────────────────────────────

export interface StaffReportItem {
  id: string;
  fullName: string;
  role: string;
  city: string;
  status: string;
  phone: string;
  email: string;
  _count: {
    assignments: number;
    attendance: number;
  };
}

export interface StaffReport {
  data: StaffReportItem[];
  total: number;
  page: number;
  limit: number;
}
