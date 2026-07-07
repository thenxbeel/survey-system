# Survey Response Management Platform — Refactored

## What changed

The application was refactored from a **Customer Relationship Management (CRM)** platform into a clean **Survey Response Management Platform**. The Customer and Follow-up modules were completely removed.

## Business rule

> When someone receives a survey link and submits the survey, the system creates **ONE Response record only**. No Customer record is ever created. No Follow-up is ever created. Optional respondent info (name, email, phone) is stored directly on the Response row.

## Removed modules

### Customer module — completely removed
- `app/dashboard/customers/` — page deleted
- `app/api/customers/` — API routes deleted
- `components/customers/` — all components deleted
- `lib/mockCustomers.ts` — mock data deleted
- `lib/api/customers.ts` — API client deleted
- `lib/types/customer.ts` — types deleted
- `Customer` Prisma model — deleted
- `CustomerTier`, `CustomerStatus` enums — deleted
- All `customerId` foreign keys — deleted
- Sidebar "Customers" nav item — deleted

### Follow-up module — completely removed
- `app/dashboard/followups/` — page deleted
- `app/api/followups/` — API routes deleted
- `components/followups/` — all components deleted
- `components/dashboard/FollowUpPanel.tsx` — deleted
- `lib/mockFollowups.ts` — mock data deleted
- `FollowUp`, `FollowUpNote` Prisma models — deleted
- `FollowUpPriority`, `FollowUpStatus` enums — deleted
- All `followUp` relations on Response — deleted
- Sidebar "Follow-ups" nav item — deleted
- Auto-create follow-up for detractors logic — deleted
- Follow-up status badge in ResponseTable — deleted
- Follow-up filter in ResponseToolbar — deleted

### Stale duplicates — removed
- Root-level `api/`, `dashboard/`, `login/`, `register/`, `layout.tsx`, `page.tsx`, `globals.css` (duplicates of `app/` contents) — deleted
- `public/app/`, `public/components/`, `public/lib/`, `public/dashboard/` (old build artifacts) — deleted
- `components/components/` (nested duplicate) — deleted
- `components/Sidebar.tsx`, `components/Navbar.tsx` (legacy, unused) — deleted
- `lib/types.ts`, `lib/mock-data.ts`, `lib/mock-data/` (dead code, no imports) — deleted
- `lib/api/`, `lib/repositories/`, `lib/services/`, `lib/types/` (empty dirs) — deleted

## Database schema changes

The Prisma schema was refactored:

**Removed models:**
- `Customer`
- `FollowUp`
- `FollowUpNote`

**Removed enums:**
- `CustomerTier`
- `CustomerStatus`
- `FollowUpPriority`
- `FollowUpStatus`

**Modified models:**
- `User` — removed `customers`, `followUps`, `followUpNotes` relations
- `Branch` — removed `customers` relation
- `Response` — removed `customerId`, `customer` relation, `followUps` relation; renamed `customerName` → `respondentName`, `customerEmail` → `respondentEmail`, `customerPhone` → `respondentPhone`

**New relationship:**
```
Survey → Responses
```
No Customer table. No Follow-up table. No Customer relationship.

## API changes

### Removed API routes
- `GET/POST /api/customers` — deleted
- `GET/PUT/DELETE /api/customers/[id]` — deleted
- `GET/POST /api/followups` — deleted
- `GET/PUT/DELETE /api/followups/[id]` — deleted
- `GET/POST /api/followups/[id]/notes` — deleted

### Modified API routes
- `POST /api/public/surveys/[slug]/responses` — no longer creates Customer records; no longer creates Follow-up records for detractors; stores respondent info directly on the Response
- `POST /api/responses` — no longer upserts Customer records; no longer creates Follow-up records
- `GET /api/responses` — removed `customer` include; removed `followUps` count; uses `respondentName/Email/Phone` fields
- `GET /api/responses/[id]` — removed customer/followup sections; returns `respondentName/Email/Phone` instead
- `GET /api/analytics/overview` — removed all Customer/FollowUp queries; metrics now computed from Response records only; added `surveyPerformance` section
- `GET /api/analytics/trends` — removed `branchId` filter (was filtering by customer branch)
- `GET /api/reports/export` — removed `customers` report type; added `surveys` and `campaigns` report types; `executive` and `responses` types no longer reference customer/followup
- `GET /api/branches` — removed `customers` count; now returns `departmentCount` instead

## UI changes

### Sidebar
- Removed the entire "Customer Care" section (Customers + Follow-ups)
- Kept: Overview, Survey Management (Surveys, Builder, Responses, Analytics, Campaigns), Administration (Reports, Users, Employee Surveys, Audit Log, My Profile, Settings)

### Navbar
- Removed page metadata for `/dashboard/followups` and `/dashboard/customers`
- Added page metadata for Campaigns, Employee Surveys, Audit Log, My Profile
- Updated search placeholder to "Search surveys, responses, campaigns…"

### Notifications
- Removed `followup` category from NotificationStore
- Updated seed notifications to remove follow-up references
- Updated NotificationPanel "View all activity" link to point to `/dashboard/responses`

### Responses page
- Removed "Follow-up" column from ResponseTable
- Removed "Follow-up Status" filter from ResponseToolbar
- Renamed "Customer" column header to "Respondent"
- Updated subtitle to "Review survey feedback, NPS scores, and response status across all surveys."

### Response Details page
- Removed "Customer" section (replaced with "Respondent" section)
- Removed "Follow-ups" section
- Uses `respondentName/Email/Phone` from the API

### Public survey page (`/survey/[slug]`)
- Removed the required customer info form
- Replaced with an OPTIONAL contact info section (name, email, phone)
- No customer record is created — info is stored on the Response row only

### Analytics
- `customerJourneyFunnel` renamed conceptually to a "Response Funnel" (Survey Sent → Opened → Started → Partially Completed → Fully Submitted → With NPS Score)
- `open-followups` KPI replaced with `active-surveys` KPI
- `PriorityCase.customer` field renamed to `PriorityCase.respondent`

### Settings
- Removed "SLA Breach", "Follow-up Escalated", "Follow-up Assigned" notification events
- Added "Survey Published" and "Survey Expired" notification events

### Mock data
- `mockResponses.ts` — removed `FollowUpStatus` type and `followUpStatus` field from `ResponseRecord`
- `mockUsers.ts` — removed "Customers" and "Follow-ups" permission module entries
- `lib/mock-data/executiveAnalytics.ts` — renamed `customer` field to `respondent` in `PriorityCase` interface

## Surviving functionality

All existing survey functionality is preserved:
- ✅ Authentication (login, register, logout, JWT)
- ✅ Dashboard (KPIs, charts, recent responses)
- ✅ Survey Builder (create, edit, availability, anonymous toggle)
- ✅ Survey Management (list, filter, search)
- ✅ Survey Publishing (auto-generate URL + QR + audit log)
- ✅ Survey Published page (copy URL, download QR, share via Email/SMS/WhatsApp, extend, deactivate/reactivate)
- ✅ Public Survey pages (`/survey/[slug]` + thank-you)
- ✅ Response Management (list, filter, search, detail view)
- ✅ Analytics (real-time, multi-dimensional)
- ✅ Campaigns (create, list, performance metrics)
- ✅ Reports (CSV export: executive, responses, surveys, campaigns)
- ✅ Audit Log (survey lifecycle events)
- ✅ Employee Surveys (admin view of per-user survey ownership)
- ✅ My Profile (employee's own surveys)
- ✅ Users (user management with survey counts)
- ✅ Settings (profile, notifications, organization, security, appearance, integrations)

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Reset the database (the schema changed — old DB will not work)
npm run db:push    # or: npx prisma db push --accept-data-loss

# 3. Seed the database
npm run db:seed

# 4. Start the dev server
npm run dev
```

## Login credentials

| Field    | Value             |
|----------|-------------------|
| Email    | `admin@nps.local` |
| Password | `Admin@123`       |

## Verification

- ✅ TypeScript: `tsc --noEmit` passes with zero errors
- ✅ Production build: `next build` succeeds with zero warnings
- ✅ All 12 dashboard pages return HTTP 200
- ✅ All 6 surviving API routes return HTTP 200
- ✅ Removed pages (`/dashboard/customers`, `/dashboard/followups`) return HTTP 404
- ✅ Removed APIs (`/api/customers`, `/api/followups`) return HTTP 404
- ✅ End-to-end test: survey creation → public submission → ONE Response record created (no customer, no followup)
