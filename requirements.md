# Temporary Event Staffing Website + Admin Portal Requirements

## 1. Project Overview

Build a premium temporary event staffing website with an internal admin portal.

The platform has two parts:

1. Public Website  
   - Show services
   - Build trust
   - Collect staffing inquiries
   - Generate client leads

2. Admin Portal  
   - Manage inquiries
   - Manage clients
   - Manage staff
   - Manage event bookings
   - Assign staff
   - Track quotations, attendance, and payments

---

## 2. Public Website Requirements

### Main Pages

- Home
- About Us
- Services
- Industries Served
- How It Works
- Contact Us
- Careers / Apply as Staff

---

## 3. Home Page Sections

### Hero Section

Content:
- Premium temporary staffing headline
- Short business explanation
- CTA buttons:
  - Request Staff
  - Get Quote
  - Contact Us

### Trust Section

Show:
- Verified staff
- Fast deployment
- Event-ready professionals
- Flexible staffing
- Last-minute support

### Services Section

Include:
- Corporate Event Staffing
- Conference Staffing
- Hospitality Staffing
- Exhibition Staffing
- Wedding Staffing
- Promotional Staffing
- Security & Operations Staffing
- Technical Event Support

### How It Works

Steps:
1. Client submits staffing requirement
2. Admin reviews requirement
3. Staff are selected and assigned
4. Event is executed successfully

### Why Choose Us

Include:
- Trained temporary staff
- Background verified workforce
- Quick turnaround
- Dedicated event support
- Transparent pricing
- Professional service

### Contact / Lead Form

Fields:
- Full name
- Company name
- Phone number
- Email
- Event type
- Event date
- Event location
- Number of staff required
- Required staff roles
- Message

---

## 4. Admin Portal Requirements

## 4.1 Admin Login

Features:
- Secure admin login
- Forgot password
- Role-based access

Roles:
- Super Admin
- Admin / Manager
- Supervisor
- Recruiter

---

## 4.2 Dashboard

Show:
- Total inquiries
- New inquiries
- Confirmed bookings
- Upcoming events
- Total staff
- Assigned staff
- Pending quotations
- Pending payments

---

## 4.3 Inquiry Management

Admin can:
- View all website inquiries
- Search and filter inquiries
- View inquiry details
- Update inquiry status

Inquiry Status:
- New
- Contacted
- Quotation Sent
- Confirmed
- Lost

---

## 4.4 Client Management

Admin can store:
- Client name
- Company name
- Phone number
- Email
- Address
- Past events
- Notes

---

## 4.5 Staff Management

Admin can add and manage staff.

Staff fields:
- Full name
- Phone number
- Email
- City
- Role
- Skills
- Experience
- Availability
- Verification status
- Documents
- Rating
- Notes

Staff Status:
- Active
- Inactive
- Available
- Assigned
- Blacklisted

---

## 4.6 Event Booking Management

Admin can create/manage events.

Event fields:
- Client details
- Event name
- Event type
- Event date
- Start time
- End time
- Location
- Required staff count
- Required staff roles
- Assigned supervisor
- Booking status
- Notes

Booking Status:
- Draft
- Confirmed
- In Progress
- Completed
- Cancelled

---

## 4.7 Staff Assignment

Admin can:
- Assign staff to events
- Check staff availability
- Prevent double booking
- Replace assigned staff
- View assigned staff list

Assignment Status:
- Assigned
- Accepted
- Rejected
- Completed
- No Show

---

## 4.8 Quotation Management

Admin can:
- Create quotation for inquiry/event
- Add staff roles and quantities
- Add per-staff pricing
- Add service charges
- Add tax
- Add discount
- Generate total amount
- Mark quotation status

Quotation Status:
- Draft
- Sent
- Accepted
- Rejected

---

## 4.9 Attendance Management

Admin/Supervisor can:
- Mark staff check-in
- Mark staff check-out
- Mark no-show
- Add supervisor remarks

Attendance Status:
- Present
- Late
- No Show
- Completed

---

## 4.10 Payment Tracking

Admin can track:
- Total amount
- Advance paid
- Balance amount
- Payment status
- Staff payout status
- Invoice status

Payment Status:
- Pending
- Partially Paid
- Paid
- Overdue

---

## 4.11 Reports

Admin can view:
- Inquiry report
- Booking report
- Revenue report
- Staff assignment report
- Attendance report
- Payment report

---

## 5. Basic Database Tables

Required tables:

- users
- roles
- inquiries
- clients
- staff
- staff_documents
- events
- event_staff_assignments
- quotations
- quotation_items
- attendance
- payments

---

## 6. Design Requirements

Public website should feel:
- Premium
- Modern
- Professional
- Clean
- Trustworthy
- Corporate

Admin portal should be:
- Simple
- Clean
- Fast
- Easy to use
- Professional
- Not overcomplicated

---

## 7. Important Development Rules

- Build only public website and admin portal
- Do not create staff app
- Do not create client portal
- Keep the system simple and scalable
- Do not over-engineer
- Use reusable components
- Keep UI clean and professional
- Make everything mobile responsive
- Protect admin routes
- Use proper validation
- Use secure authentication
- Do not break existing functionality

---

## 8. Final Goal

Create a premium temporary event staffing website where clients can submit staffing requirements, and admins can manage inquiries, clients, staff, bookings, assignments, quotations, attendance, and payments from one clean admin portal.