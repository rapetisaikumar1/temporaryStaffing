Temporary Event Staffing Website + Admin Portal
Production-Ready Project Architecture

Project Name:
Niyukti

Goal:
Build a premium temporary event staffing website with a professional internal admin portal.

Tech Stack:
- Next.js (Frontend + Admin Portal)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Node.js / NestJS (Backend API)
- PostgreSQL (Neon / Supabase)
- Prisma ORM
- Cloudinary (File Uploads)
- JWT Authentication
- Role-Based Access Control (RBAC)

==================================================
COMPLETE FOLDER ARCHITECTURE
==================================================

niyukti/
│
├── client/                          # Next.js Frontend + Admin Portal
│
│   ├── public/
│   │   ├── images/
│   │   ├── icons/
│   │   ├── logos/
│   │   └── favicon.ico
│   │
│   ├── src/
│   │
│   │   ├── app/                     # Next.js App Router
│   │   │
│   │   │   ├── (website)/           # Public Website
│   │   │   │   ├── page.tsx         # Home
│   │   │   │   ├── about/
│   │   │   │   ├── services/
│   │   │   │   ├── industries/
│   │   │   │   ├── careers/
│   │   │   │   ├── contact/
│   │   │   │   └── layout.tsx
│   │   │
│   │   │   ├── (admin)/             # Admin Portal
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── inquiries/
│   │   │   │   ├── clients/
│   │   │   │   ├── staff/
│   │   │   │   ├── events/
│   │   │   │   ├── assignments/
│   │   │   │   ├── quotations/
│   │   │   │   ├── attendance/
│   │   │   │   ├── payments/
│   │   │   │   ├── reports/
│   │   │   │   ├── settings/
│   │   │   │   └── layout.tsx
│   │   │
│   │   │   ├── api/
│   │   │   ├── globals.css
│   │   │   └── layout.tsx
│   │
│   │   ├── components/
│   │   │
│   │   │   ├── ui/                  # Shadcn components
│   │   │   ├── shared/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Loader.tsx
│   │   │
│   │   │   ├── website/
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── Services.tsx
│   │   │   │   ├── WhyChooseUs.tsx
│   │   │   │   ├── Testimonials.tsx
│   │   │   │   ├── ContactForm.tsx
│   │   │   │   └── CTA.tsx
│   │   │
│   │   │   └── admin/
│   │   │       ├── DashboardCards.tsx
│   │   │       ├── InquiryTable.tsx
│   │   │       ├── StaffTable.tsx
│   │   │       ├── EventTable.tsx
│   │   │       ├── QuoteBuilder.tsx
│   │   │       └── ReportsChart.tsx
│   │
│   │   ├── lib/
│   │   │   ├── axios.ts
│   │   │   ├── auth.ts
│   │   │   ├── utils.ts
│   │   │   ├── validations.ts
│   │   │   └── constants.ts
│   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── usePagination.ts
│   │
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── inquiryStore.ts
│   │   │   └── dashboardStore.ts
│   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── inquiry.service.ts
│   │   │   ├── staff.service.ts
│   │   │   ├── event.service.ts
│   │   │   └── payment.service.ts
│   │
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── inquiry.types.ts
│   │   │   ├── staff.types.ts
│   │   │   └── event.types.ts
│   │
│   │   └── middleware.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.js
│
│
├── server/                          # NestJS Backend API
│
│   ├── src/
│   │
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   ├── decorators/
│   │   │   ├── interceptors/
│   │   │   ├── filters/
│   │   │   ├── middleware/
│   │   │   └── enums/
│   │
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── jwt.config.ts
│   │   │   └── cloudinary.config.ts
│   │
│   │   ├── prisma/
│   │   │   ├── prisma.service.ts
│   │   │   └── prisma.module.ts
│   │
│   │   ├── modules/
│   │   │
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── inquiries/
│   │   │   ├── clients/
│   │   │   ├── staff/
│   │   │   ├── events/
│   │   │   ├── assignments/
│   │   │   ├── quotations/
│   │   │   ├── attendance/
│   │   │   ├── payments/
│   │   │   ├── reports/
│   │   │   └── uploads/
│   │
│   │   ├── app.module.ts
│   │   └── main.ts
│
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
│
│
├── docs/
│   ├── API.md
│   ├── DB_SCHEMA.md
│   ├── FLOW_DIAGRAMS.md
│   └── DEPLOYMENT.md
│
│
├── .env.example
├── docker-compose.yml
├── README.md
└── .gitignore

==================================================
ARCHITECTURE RULES
==================================================

Rules:

1. Keep public website and admin portal separate logically
2. Use reusable components only
3. Keep backend modular and scalable
4. Use RBAC properly
5. Use proper DTO validation
6. Avoid business logic inside controllers
7. Keep services clean
8. Protect admin routes
9. Prevent over-engineering
10. Keep UI premium and professional
11. Use proper loading + error states
12. Use centralized state only where needed
13. Use production-ready folder structure
14. Keep code clean and maintainable
15. No unnecessary complexity

==================================================
MAIN DEVELOPMENT FLOW
==================================================

Phase 1:
Public Website

Phase 2:
Admin Authentication + Dashboard

Phase 3:
Inquiry + Client Management

Phase 4:
Staff + Event Management

Phase 5:
Assignments + Quotations

Phase 6:
Attendance + Payments

Phase 7:
Reports + Optimization

==================================================
FINAL GOAL
==================================================

A premium enterprise-grade temporary staffing platform
with:
- strong public lead generation
- smooth internal operations
- scalable admin management
- clean professional architecture
- production-ready codebase