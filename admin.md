# Spot Me Admin Implementation Plan

> Purpose: turn the existing static admin frontend in `client/` into a fully working admin panel backed by real APIs in `server/`, aligned with `InitalRequirements.md`, `requirement.md`, and the completed items already tracked in `plan.md`.

## 1. Admin requirements from the docs

### 1.1 Requirements from `InitalRequirements.md`
- User Management: admins can view and manage all users.
- Profile Review: admins can inspect complete profile details and uploaded media.
- Verification Review: admins can review flagged verification cases.
- Progress Capture Review: admins can inspect suspicious or reported progress capture submissions.
- Report Management: admins can view and resolve user reports.
- Moderation Actions: admins can suspend, ban, or delete accounts.
- Premium and Purchase Management: admins can monitor premium users, boosts, rewinds, one-time purchases, and unlock purchases.
- Analytics Dashboard: admins can view performance and growth metrics.
- Safety and Moderation support:
  - review suspicious profiles
  - force stronger verification for flagged users
  - review reported photos, videos, and progress capture content
  - manage profile approval policies if manual moderation is needed
- Analytics requirements:
  - total users
  - active users
  - verified users
  - profiles activated
  - matches created
  - chat starts
  - premium conversions
  - one-time purchase usage
  - most used premium features
  - active vs inactive trends
  - compatibility insights usage
  - prompt interaction tracking

### 1.2 Requirements from `requirement.md`
- Ability to manually trigger face verification on any user.
- Media moderation queue for reported photos with AI-based nudity detection plus manual review.
- Analytics to track conversion to match by fitness goals.
- Retention alert when active users drop below threshold.

## 2. Current project state

### 2.1 What already exists in backend
- Auth foundation is implemented.
- Profile, media, and progress modules are implemented.
- Seed already creates an admin-like user entry in `server/seeder/index.js`.
- Role enum already includes `admin` and `super_admin`.
- Current mounted API routes in `server/routes/api.js` only expose:
  - `/auth`
  - `/profile`
  - `/media`
  - `/progress`

### 2.2 What is still missing in backend for admin
- No dedicated admin module is implemented under `server/src/admin`.
- No admin auth flow or admin middleware separation.
- No admin routes for users, reports, moderation, analytics, purchases, or dashboard.
- No report/block/moderation models and APIs implemented yet.
- No purchase/subscription models and APIs implemented yet.
- No discovery, match, chat, or analytics modules implemented yet.
- No admin-facing aggregation endpoints.

### 2.3 What already exists in frontend
Static admin UI exists in `client/src` with these pages:
- `Dashboard.tsx`
- `UserManagement.tsx`
- `ModerationQueue.tsx`
- `VerificationReview.tsx`
- `ProgressCapture.tsx`
- `SafetyReports.tsx`
- `Financials.tsx`
- `Settings.tsx`

### 2.4 What is still missing in frontend
- All pages use hardcoded mock data.
- No API client layer.
- No auth token handling for admin.
- No loading, error, empty, pagination, or mutation states.
- No route protection.
- No real filters/search synced to backend.
- No real approve/reject/ban/suspend/resolve actions.

## 3. Core dependency reality

Some admin pages can be made dynamic immediately from existing backend data, but some cannot until core product modules are built.

### 3.1 Can be built first with current backend foundation
- Admin auth
- User listing from `User`, `Profile`, `FitnessDetails`, `Lifestyle`
- User detail page
- Verification review from `FaceVerificationLog`, `UserMedia`, `User`
- Progress capture review from `ProgressCapture`, `VerificationBadge`
- Basic dashboard counts:
  - total users
  - verified users
  - active profiles
  - flagged users

### 3.2 Blocked until other backend modules are built
- Safety reports page needs report/block/moderation system.
- Moderation queue needs media moderation queue and moderation actions.
- Financials page needs subscriptions, receipts, purchases, entitlements.
- Full analytics dashboard needs match, chat, purchases, prompts, compatibility usage, retention metrics.
- Settings page should not be wired as editable config until a proper settings/config store exists.

Because of that, the admin work should be split into:
- Phase A: admin foundation + pages that can run on current data.
- Phase B: build missing backend product modules that admin depends on.
- Phase C: connect remaining admin pages once those modules exist.

## 4. Target admin architecture

## 4.1 Backend modules to add
- `server/src/admin/`
- `server/src/report/`
- `server/src/analytics/`
- later, if still missing:
  - `server/src/discovery/`
  - `server/src/match/`
  - `server/src/chat/`
  - `server/src/premium/`
  - `server/src/purchase/`

## 4.2 Admin models
- `AdminUser`
  - id
  - email
  - password_hash
  - role (`super_admin`, `moderator`, `analyst`)
  - is_active
  - last_login_at
- `AdminActionLog`
  - id
  - admin_id
  - action_type
  - target_type
  - target_id
  - payload
  - created_at

## 4.3 Reuse existing user-side models in admin APIs
- `User`
- `Profile`
- `FitnessDetails`
- `Lifestyle`
- `UserMedia`
- `FaceVerificationLog`
- `ProgressCapture`
- `VerificationBadge`

## 4.4 Additional models required for full admin scope
- `Report`
- `Block`
- `MediaModerationQueue`
- `Subscription`
- `PurchaseReceipt`
- `PurchaseEntitlement`
- `MetricSnapshot`
- `UserEvent`

## 4.5 Frontend structure to add
- `client/src/lib/api.ts`
- `client/src/lib/query-keys.ts` or equivalent constants
- `client/src/hooks/` for page-level data hooks
- `client/src/types/admin.ts`
- `client/src/components/admin/`
- `client/src/context/AuthContext.tsx` or simple token provider
- protected routes for admin pages

## 5. API plan for admin

## 5.1 Admin auth
- `POST /api/v1/admin/auth/login`
- `POST /api/v1/admin/auth/logout`
- `GET /api/v1/admin/auth/me`

### Response/data needs
- admin profile
- admin role
- admin JWT

## 5.2 Dashboard
- `GET /api/v1/admin/dashboard/overview`

### Minimum fields
- totalUsers
- verifiedUsers
- activeProfiles
- flaggedUsers
- pendingVerificationReviews
- pendingMediaReviews
- pendingReports
- progressCapturesThisMonth

### Later fields
- activeUsers
- matchesCreated
- chatStarts
- premiumConversions
- purchaseUsage
- featureUsage
- retentionAlerts

## 5.3 Users
- `GET /api/v1/admin/users`
  - search
  - status
  - verificationStatus
  - profileStatus
  - page/cursor
- `GET /api/v1/admin/users/:id`
- `PATCH /api/v1/admin/users/:id/status`
  - active
  - suspended
  - banned
- `POST /api/v1/admin/users/:id/force-face-verify`
- `DELETE /api/v1/admin/users/:id`
  - soft delete only

### User detail response should include
- account info
- fitness identity
- lifestyle
- media list
- progress captures
- verification history
- moderation history
- basic engagement summary

## 5.4 Verification review
- `GET /api/v1/admin/verifications`
- `POST /api/v1/admin/verifications/:id/approve`
- `POST /api/v1/admin/verifications/:id/reject`

### Data source
- `FaceVerificationLog`
- related user main photo from `UserMedia`
- user account status

## 5.5 Progress capture review
- `GET /api/v1/admin/progress/reviews`
- `POST /api/v1/admin/progress/:id/approve`
- `POST /api/v1/admin/progress/:id/reject`
- optional: `POST /api/v1/admin/progress/:id/toggle-badge`

### Note
If badge status remains rule-based only, do not make badge toggle manual in production logic. The page should approve/reject suspicious captures, then let badge recompute automatically.

## 5.6 Media moderation
- `GET /api/v1/admin/media/queue`
- `POST /api/v1/admin/media/:id/approve`
- `POST /api/v1/admin/media/:id/reject`

### Queue items should include
- media id
- user info
- source type (`user_media` or `progress_capture`)
- AI moderation result
- report count
- current status

## 5.7 Reports
- `GET /api/v1/admin/reports`
- `GET /api/v1/admin/reports/:id`
- `POST /api/v1/admin/reports/:id/resolve`
- `POST /api/v1/admin/reports/:id/dismiss`
- `POST /api/v1/admin/reports/:id/ban-user`
- `POST /api/v1/admin/reports/:id/suspend-user`

## 5.8 Financials
- `GET /api/v1/admin/subscriptions`
- `GET /api/v1/admin/purchases`
- `GET /api/v1/admin/entitlements/:userId`

## 5.9 Analytics
- `GET /api/v1/admin/analytics/overview`
- `GET /api/v1/admin/analytics/retention`
- `GET /api/v1/admin/analytics/matches-by-goal`
- `GET /api/v1/admin/analytics/monetization`
- `GET /api/v1/admin/analytics/engagement`
- `GET /api/v1/admin/alerts`

## 5.10 Settings
- `GET /api/v1/admin/settings`
- `PUT /api/v1/admin/settings`

### Important rule
Do not implement editable admin settings until there is a clearly defined persistence layer and allowed config surface. Until then, keep the Settings page read-only or hide save actions.

## 6. Frontend page-by-page dynamic plan

## 6.1 Dashboard page
Current: fully mocked cards and charts.

Replace with:
- overview cards from `/admin/dashboard/overview`
- chart blocks from `/admin/analytics/overview`
- alert panel from `/admin/alerts`

States to add:
- loading skeleton
- API failure banner
- empty-state when analytics data unavailable

## 6.2 User Management page
Current: local `mockUsers`, local search, fake edit modal.

Replace with:
- server-side paginated user table
- search input with debounce
- filters: account status, verification status, profile status
- row click opens real user detail modal or drawer
- edit actions become real mutations:
  - suspend
  - ban
  - reactivate
  - force face verification
  - soft delete

## 6.3 Moderation Queue page
Current: tabbed fake media gallery with approve/reject buttons.

Replace with:
- queue data from `/admin/media/queue`
- tabs mapped to actual moderation filters:
  - main profile photos
  - short videos
  - required fitness media
  - reported progress capture
- approve/reject mutations
- moderation reason display
- AI score / report count / uploaded date metadata

## 6.4 Verification Review page
Current: mocked live photo vs profile photo review cards.

Replace with:
- pending flagged verification cases from `/admin/verifications`
- actual live face image and main profile media
- approve / reject / request re-verify actions
- show attempt count and failure history

## 6.5 Progress Capture page
Current: mocked list with local badge toggle.

Replace with:
- suspicious or flagged captures from `/admin/progress/reviews`
- capture metadata:
  - month/year
  - workout type
  - caption
  - raw verification status
- actions:
  - approve capture
  - reject capture
  - open user profile

Important:
- if badge is fully automatic, remove manual toggle behavior from UI
- if temporary manual override is needed, define a separate admin override field instead of mutating badge directly

## 6.6 Safety & Reports page
Current: mocked reports table and fake evidence modal.

Replace with:
- reports list from `/admin/reports`
- report details modal from `/admin/reports/:id`
- resolve, dismiss, suspend, and ban actions
- related evidence:
  - report text
  - related media if present
  - reporter and reported user summary

## 6.7 Financials page
Current: mocked revenue stats and transactions table.

Replace with:
- subscriptions summary
- one-time purchase summary
- recent receipts and entitlement usage
- filters by plan, platform, date, product type

Dependency:
- this page must wait until purchase/subscription backend exists

## 6.8 Settings page
Current: all local component state only.

Recommended implementation:
- short term: convert to “Platform Rules Overview” read-only page showing current system rules from docs/backend config
- long term: enable editable settings only after config persistence is defined

Fields that must stay consistent with backend rules:
- min media = 4
- max media = 6
- short profile video max = 7 seconds
- progress video range = 3 to 10 seconds
- face verification fail threshold = 3
- report auto-flag threshold = configurable only if backend supports it

## 7. Backend implementation phases

## Phase 1: Admin foundation
- Create `AdminUser` and `AdminActionLog` models.
- Create `server/src/admin/admin.controller.js`.
- Create `server/src/admin/admin.service.js`.
- Create `server/src/admin/admin.routes.js`.
- Add admin auth middleware separate from user auth.
- Add `POST /admin/auth/login`.
- Add seed for real admin credentials if not already separated from normal `User`.
- Mount admin routes in `server/routes/api.js`.

## Phase 2: User management APIs
- Build `GET /admin/users`.
- Build `GET /admin/users/:id`.
- Build `PATCH /admin/users/:id/status`.
- Build `POST /admin/users/:id/force-face-verify`.
- Build soft delete flow.
- Log every admin action into `AdminActionLog`.

## Phase 3: Verification and progress review APIs
- Build verification review queries from `FaceVerificationLog`.
- Build progress review queries from `ProgressCapture`.
- Define approve/reject workflow and status fields if current tables lack them.
- Add moderation notes and reviewer tracking.

## Phase 4: Report and moderation system
- Create `Report`, `Block`, and `MediaModerationQueue` models.
- Build user-side report and block APIs.
- Build admin report queue and media queue APIs.
- Add automatic flagging rules:
  - repeated report threshold
  - repeated face verification failures
  - AI nudity detection flagging hook

## Phase 5: Dashboard and analytics foundations
- Add aggregate queries for overview metrics.
- Create analytics service with reusable aggregation functions.
- Add alert logic for low active users threshold.
- Start collecting `UserEvent` and `MetricSnapshot` data.

## Phase 6: Purchases and subscriptions
- Build subscription, receipt, entitlement models and services.
- Build admin financial APIs.
- Connect purchases into analytics.

## Phase 7: Full analytics expansion
- Add match-rate by fitness goal.
- Add retention metrics.
- Add premium feature usage metrics.
- Add compatibility insight usage metrics.
- Add prompt interaction contribution metrics.

## 8. Frontend implementation phases

## Phase A: shared frontend foundation
- Add API base config.
- Add admin auth flow.
- Add protected router wrapper.
- Add request helpers with token injection.
- Add shared table, modal, and action state patterns.
- Add loading/error/empty states across pages.

## Phase B: first dynamic pages
- Dashboard
- User Management
- Verification Review
- Progress Capture

These can be built first because they mostly depend on existing backend entities.

## Phase C: moderation and reports
- Moderation Queue
- Safety & Reports

These depend on the report/moderation backend.

## Phase D: financials and advanced analytics
- Financials
- deeper dashboard charts
- alerts panels

These depend on purchase, subscription, and analytics infrastructure.

## Phase E: settings cleanup
- Convert current local settings UI into read-only config view first.
- Only later add editable controls if backed by stored configuration and audit logging.

## 9. Required file changes

## 9.1 Backend
- `server/routes/api.js`
- `server/models/index.js`
- `server/seeder/index.js`
- new files under:
  - `server/models/`
  - `server/src/admin/`
  - `server/src/report/`
  - `server/src/analytics/`
  - later `server/src/purchase/`, `server/src/premium/`

## 9.2 Frontend
- `client/src/App.tsx`
- `client/src/components/Sidebar.tsx`
- `client/src/pages/Dashboard.tsx`
- `client/src/pages/UserManagement.tsx`
- `client/src/pages/ModerationQueue.tsx`
- `client/src/pages/VerificationReview.tsx`
- `client/src/pages/ProgressCapture.tsx`
- `client/src/pages/SafetyReports.tsx`
- `client/src/pages/Financials.tsx`
- `client/src/pages/Settings.tsx`
- new shared files under:
  - `client/src/lib/`
  - `client/src/hooks/`
  - `client/src/types/`
  - `client/src/components/admin/`

## 10. Data contract mapping from current static pages

## 10.1 Dashboard
Current mock values map to:
- Total Users -> count of `User`
- Active Now -> active users within defined time window
- Premium Conversions -> paid users / total verified users
- Reports Pending -> open reports count
- User Growth chart -> monthly user registrations
- Premium features chart -> aggregated entitlement consumption
- Average Compatibility Score -> analytics metric, not current data

## 10.2 User Management
Current fields map to:
- name -> `Profile.full_name`
- email -> `User.email`
- status -> `User.account_status` or `Profile.profile_status`
- fitnessGoal -> `FitnessDetails.goals`
- joinDate -> `User.created_at`
- workoutFrequency -> `FitnessDetails.workout_frequency`
- trainingStyle -> `FitnessDetails.training_styles`
- diet -> `FitnessDetails.diet_style`

## 10.3 Verification Review
Current fields map to:
- livePhoto -> `FaceVerificationLog.attempt_image_url`
- profilePhoto -> main `UserMedia.url`
- submittedDate -> `FaceVerificationLog.created_at`

## 10.4 Progress Capture
Current fields map to:
- thumbnail -> `ProgressCapture.media_url`
- timestamp -> `captured_month` + `captured_year`
- workoutType -> `ProgressCapture.workout_type`
- badgeGranted -> `VerificationBadge.status`

## 10.5 Safety Reports
Current fields map to future `Report` table fields:
- reportedUser
- reason_category
- reporter
- created_at
- status
- description / related evidence

## 10.6 Financials
Current fields map to future monetization tables:
- premium subscriptions -> `Subscription`
- one-time purchases -> `PurchaseReceipt` + `PurchaseEntitlement`
- revenue numbers -> analytics aggregates from verified receipts

## 11. Risks and decisions to lock before implementation

### 11.1 Admin identity model
Decision needed:
- separate `AdminUser` table
- or reuse `User` with admin role

Recommended:
- use separate `AdminUser` table for cleaner auth, security, and audit boundaries

### 11.2 Manual badge control
Decision needed:
- should admins manually grant/revoke Active Fitness Verified
- or should badge remain fully rule-based

Recommended:
- keep badge rule-based and let admins moderate captures instead

### 11.3 Settings persistence
Decision needed:
- which settings are configurable from panel
- where they are stored
- whether changes require audit records

Recommended:
- postpone editable settings until backend config persistence is designed

### 11.4 Financial data source
Decision needed:
- show only verified receipts
- or also show attempted/unverified transactions

Recommended:
- default to verified receipts only, with a separate failed receipts view if needed

## 12. Execution order recommended for this repo

1. Implement admin auth and route protection.
2. Implement admin user list and user detail APIs.
3. Make `Dashboard`, `UserManagement`, `VerificationReview`, and `ProgressCapture` dynamic.
4. Build report/block/media moderation models and APIs.
5. Make `ModerationQueue` and `SafetyReports` dynamic.
6. Build purchase/subscription backend.
7. Make `Financials` dynamic.
8. Build analytics snapshots and advanced dashboard charts.
9. Rework `Settings` into backend-backed read-only or editable config view.

## 13. Definition of done

Admin work is complete only when all of the following are true:
- No admin page in `client/src/pages` depends on mock arrays.
- All admin routes are protected by admin auth.
- Every destructive admin action is audited in `AdminActionLog`.
- User management actions update backend state immediately and reflect in UI.
- Verification review uses real face verification submissions.
- Progress review uses real progress captures and real badge status.
- Reports and moderation queues use real report and queue data.
- Financials use real subscription and purchase data.
- Dashboard metrics are backed by real aggregated queries.
- Frontend handles loading, empty, success, and error states cleanly.
- Pagination and filtering are handled server-side for admin tables.

## 14. Immediate next implementation slice

Best first slice for actual development:
- Backend:
  - add `AdminUser`
  - add `AdminActionLog`
  - add admin auth routes
  - add `/admin/dashboard/overview`
  - add `/admin/users`
  - add `/admin/users/:id`
  - add `/admin/verifications`
  - add `/admin/progress/reviews`
- Frontend:
  - add admin API client and token storage
  - protect routes
  - replace mocks in:
    - `Dashboard.tsx`
    - `UserManagement.tsx`
    - `VerificationReview.tsx`
    - `ProgressCapture.tsx`

This slice gives a working admin foundation quickly and uses the backend entities that already exist in the repo.
