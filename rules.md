Temporary Event Staffing Website + Admin Portal
Production-Ready Project Rules

Project Name:
Niyukti

Goal:
Build a premium temporary event staffing website with a clean, scalable, secure, and production-ready admin portal.

These rules are mandatory for the entire project.

==================================================
CORE DEVELOPMENT RULES
==================================================

1. Do NOT break existing functionality

- Never remove working features unnecessarily
- Never modify unrelated modules
- Always preserve current stable flows
- Every new change must be isolated and safe

--------------------------------------------------

2. Keep implementation simple

- Avoid over-engineering
- Avoid unnecessary abstraction
- Avoid complex architecture without real need
- Prefer clean, understandable solutions

Simple > Clever

--------------------------------------------------

3. Production-ready code only

- No temporary fixes
- No hacky solutions
- No shortcut implementations
- No test-only code in production
- No incomplete placeholders

Everything must be stable and professional

--------------------------------------------------

4. Recheck functionality after every change

Before moving to next task:

- Verify the changed feature works
- Verify related features still work
- Verify no side effects exist
- Verify UI state updates correctly
- Verify API flow is stable

Never move forward without validation

--------------------------------------------------

5. Use reusable components only

- Avoid duplicate code
- Create shared components
- Create reusable utilities
- Centralize repeated logic

Do not copy-paste code across pages

--------------------------------------------------

6. Maintain clean folder structure

- Keep files organized
- Use proper module separation
- Use proper naming conventions
- Keep scalable architecture

No random file placement

--------------------------------------------------

7. Strong validation everywhere

- Frontend form validation required
- Backend DTO validation required
- API input validation required
- Prevent invalid data storage

Never trust frontend alone

--------------------------------------------------

8. Proper loading + error handling

Every action must handle:

- loading state
- success state
- failure state
- retry state where needed

No silent failures allowed

--------------------------------------------------

9. Secure admin routes

- Protect all admin routes
- Use JWT authentication
- Use RBAC authorization
- Validate permissions properly

No unauthorized access possible

--------------------------------------------------

10. Keep public website and admin portal separated

- Website logic must stay separate
- Admin logic must stay separate
- Shared utilities only where required

Avoid mixing public and admin code

==================================================
UI / UX RULES
==================================================

11. Premium design only

Website must feel like:

Apple × Deloitte × Enterprise Brand

Use:

- premium spacing
- elegant typography
- smooth hierarchy
- soft shadows
- luxury gradients
- modern minimal design
- professional layout balance

Avoid:

- cheap template look
- oversized cards
- heavy bold UI
- crowded layouts
- generic dashboard design

--------------------------------------------------

12. Minimal but powerful UI

- Keep interfaces clean
- Reduce unnecessary visual noise
- Strong clarity over decoration

Professional > Fancy

--------------------------------------------------

13. Responsive on all devices

Must work properly on:

- desktop
- laptop
- tablet
- mobile

No broken layouts allowed

--------------------------------------------------

14. Fast UI feedback

- Buttons must respond clearly
- Status updates must be immediate
- Forms must feel fast
- UI should never feel delayed

User must trust the system instantly

--------------------------------------------------

15. Dynamic UI updates required

No manual refresh dependency allowed

All changes must reflect immediately:

- inquiry updates
- booking status
- staff assignments
- quotations
- attendance
- payments

Frontend must auto-sync properly

==================================================
BACKEND RULES
==================================================

16. No business logic inside controllers

Controllers should only:

- receive request
- validate request
- call service
- return response

All logic belongs inside services

--------------------------------------------------

17. Keep services clean

Services must be:

- readable
- modular
- isolated
- testable

Avoid giant service files

--------------------------------------------------

18. Database consistency first

- Use transactions where required
- Prevent partial updates
- Prevent duplicate records
- Prevent broken relationships

Data integrity is critical

--------------------------------------------------

19. Prevent duplicate operations

Examples:

- double booking prevention
- duplicate quotation prevention
- repeated payment entries
- duplicate assignments

System must protect business logic

--------------------------------------------------

20. Proper audit-friendly structure

Track:

- who created
- who updated
- when changed
- important status history

Admin systems require traceability

==================================================
API RULES
==================================================

21. Clean API structure

Use:

- RESTful endpoints
- proper status codes
- consistent response format
- pagination where needed
- filters where needed

No messy API responses

--------------------------------------------------

22. API naming consistency

Examples:

GOOD:
- /api/inquiries
- /api/events
- /api/staff

BAD:
- /api/getAllStuffNow

Consistency is mandatory

--------------------------------------------------

23. Proper API security

- validate tokens
- validate roles
- sanitize input
- prevent injection
- protect sensitive endpoints

Security is not optional

==================================================
DATABASE RULES
==================================================

24. Use PostgreSQL properly

- normalize where needed
- avoid bad schema design
- use indexing where required
- optimize queries

Database should scale

--------------------------------------------------

25. Soft delete where appropriate

Do not permanently remove critical business data

Examples:

- staff
- clients
- quotations
- bookings

Use status-based deletion where needed

==================================================
DEPLOYMENT RULES
==================================================

26. Environment separation required

Separate:

- local
- staging
- production

Never mix environments

--------------------------------------------------

27. Proper .env management

Never hardcode:

- secrets
- API keys
- DB credentials
- tokens

Use secure environment variables only

--------------------------------------------------

28. Logs must be meaningful

- proper backend logs
- proper error logs
- useful debugging logs

Avoid noisy useless logs

==================================================
TEAM RULES
==================================================

29. Every change must be intentional

Do not modify random code

Every change must have:

- clear reason
- clear scope
- clear validation

--------------------------------------------------

30. Before final delivery

Mandatory final check:

- functionality check
- UI check
- mobile check
- security check
- performance check
- deployment check

Only then consider task complete

==================================================
FINAL RULE
==================================================

Build like a real enterprise product.

Not like a demo project.
Not like a quick freelancer project.
Not like a temporary MVP.

Every decision should support:

stability
scalability
professionalism
long-term maintainability

This is the standard.