# Spot Me — Fitness Connection App Backend Plan

> **Project:** Spot Me — Fitness Connection Mobile App Backend
> **Stack:** Node.js + Express + Sequelize v6 + MySQL + Socket.io + Firebase Admin SDK
> **Architecture Reference:** `backend.md`
> **Requirement Sources:** `InitalRequirements.md` (client/PM) + `requirement.md` (technical spec)
>
> **How to use this file:** Work through phases sequentially. Each task has a checkbox `[ ]`. Mark `[x]` when complete. Do not jump phases — later phases depend on earlier foundations.

---

## Phase 0 — Project Setup & Foundation

Goal: Bootstrap the server skeleton exactly per `backend.md` so every later phase builds on the same standard.

### 0.1 Project Initialization
- [x] `npm init -y` inside `server/`
- [x] Install core deps: `express`, `sequelize`, `mysql2`, `dotenv`, `cors`
- [x] Install auth deps: `jsonwebtoken`, `argon2`, `bcryptjs`
- [x] Install validation deps: `joi` (or `express-validator`)
- [x] Install upload deps: `multer`, `sharp` (WebP conversion)
- [x] Install docs deps: `swagger-jsdoc`, `swagger-ui-express`
- [x] Install realtime deps: `socket.io`
- [x] Install notification deps: `firebase-admin`
- [x] Install mail deps: `nodemailer`
- [x] Install transpile deps: `@babel/core`, `@babel/preset-env`, `@babel/register`, `nodemon`
- [x] Create `.babelrc` with `@babel/preset-env`
- [x] Add `start`, `dev`, `seed` scripts to `package.json`

### 0.2 Folder Scaffold (per backend.md Section 2)
- [x] Create `models/`, `routes/`, `seeder/`, `public/`, `uploads/`
- [x] Create `src/common/{config,constants,middleware,utils}/`
- [x] Create feature module folders: `src/auth/`, `src/profile/`, `src/media/`, `src/progress/`, `src/discovery/`, `src/match/`, `src/chat/`, `src/prompts/`, `src/premium/`, `src/purchase/`, `src/notification/`, `src/report/`, `src/admin/`, `src/analytics/`, `src/fcm/`
- [x] Each feature folder contains `<feature>.controller.js`, `<feature>.service.js`, `<feature>.routes.js`, `dtos/<feature>.validation.js`

### 0.3 Environment & Checklist
- [x] Create `.env` with all required keys (ENV, BASE_URL, CLIENT_URL, IS_SECURE, APP_URL, APP_URL_ADMIN, APP_NAME, PORT, SSL_CERT_BASE_PATH, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV, DB_HOST/PORT/USER/PASS/NAME/DIALECT, MAIL_HOST/PORT/USER/PASS, FIREBASE_SERVICE_ACCOUNT)
- [x] Add `.env` to `.gitignore`
- [x] Create `serverChecklist.js` validating all env keys, uploads folder, SSL certs, node_modules, package.json
- [x] Create `src/common/config/db.config.js` with MySQL + utf8mb4 pool config

### 0.4 Core Utilities & Middleware
- [x] Create `src/common/utils/errorException.js` (Exception, ValidationException, HttpStatus)
- [x] Create `src/common/utils/response.js` (standardized success/error response helpers)
- [x] Create `src/common/utils/pagination.js` (cursor-based pagination helper)
- [x] Create `src/common/middleware/errorHandler.js` (Joi + Exception + unhandled)
- [x] Create `src/common/middleware/auth.js` (JWT verify)
- [x] Create `src/common/middleware/validate.js` (Joi wrapper)
- [x] Create `src/common/middleware/auditLog.js` (response interceptor)
- [x] Create `src/common/middleware/roleCheck.js` (user vs admin)
- [x] Create `src/common/middleware/rateLimiter.js` (login + forgot password brute-force protection)
- [x] Create `src/common/constants/enums.js` (workout types, goals, training styles, intents, modes, statuses)

### 0.5 Server Bootstrap
- [x] Create `models/connection.js` with two-stage sync (alter dev, force:false prod)
- [x] Create `models/index.js` (empty exports for now, populated as models are added)
- [x] Create `routes/index.js` with request timing middleware + `/api/v1` mount
- [x] Create `routes/api.js` with public/protected route split
- [x] Create `app.js` following backend.md Section 4 exactly (dotenv → checklist → express → middleware → routes → swagger → errorHandler → HTTPS/HTTP branch)
- [x] Create `seeder/index.js` (idempotent, non-fatal on error)
- [x] Create `src/common/config/swagger.js` (OpenAPI 3.0 spec)
- [x] Verify `npm run dev` starts, DB connects, seed runs, no errors

---

## Phase 1 — Authentication & Security

Goal: Email/password signup, OTP verification, login, forgot password, face verification (initial + flagged), rate limiting.

### 1.1 Models
- [x] `User` model — id, email (unique), password_hash, is_verified (bool), face_verified_status (pending/approved/failed), account_status (active/flagged/banned/inactive), last_login_at, created_at, updated_at
- [x] `EmailOTP` model — id, user_id, otp_code, purpose (verify_email/forgot_password), expires_at, consumed_at
- [x] `FaceVerificationLog` model — id, user_id, attempt_image_url, matched_against_media_id, result (pass/fail), attempt_count, created_at
- [x] `LoginSession` model — id, user_id, device_id, ip, user_agent, jwt_id, created_at, last_seen_at
- [x] Register all in `models/index.js` with associations

### 1.2 Services & Controllers
- [x] `auth.service.signup(email, password)` — hash with argon2, create user, generate OTP, send email
- [x] `auth.service.verifyEmail(email, otp)` — validate code, mark is_verified=true
- [x] `auth.service.login(email, password, device_id)` — password check, is_verified check, flagged-account check → trigger face verify, issue JWT
- [x] `auth.service.forgotPassword(email)` — generate reset OTP, send mail
- [x] `auth.service.resetPassword(email, otp, newPassword)` — validate + update hash
- [x] `auth.service.faceVerify(userId, liveImageBase64)` — compare live image to main profile photo (stub AI provider hook), log attempt; 3 fails → flag account
- [x] `auth.service.resendOtp(email, purpose)` — throttled
- [x] Wire controllers with Joi validation

### 1.3 Routes (public — no auth middleware)
- [x] `POST /auth/signup`
- [x] `POST /auth/verify-email`
- [x] `POST /auth/login`
- [x] `POST /auth/forgot-password`
- [x] `POST /auth/reset-password`
- [x] `POST /auth/resend-otp`
- [x] `POST /auth/face-verify` (auth required; used during login-flagged flow and secondary scans)

### 1.4 Security Hardening
- [x] Rate limit on `/auth/login` and `/auth/forgot-password` (e.g., 5/min per IP)
- [x] JWT includes user_id + session_id (revocable via LoginSession)
- [x] Argon2 params tuned (timeCost/memoryCost) for production
- [x] OTP expiry = 10 minutes, single-use
- [x] Seed an admin user in `seeder/index.js`

### 1.5 QA Edge Cases
- [x] Login before verification → 403 redirect to OTP
- [x] 3 consecutive face verify fails → account_status = flagged + admin alert
- [x] Duplicate signup email → 409
- [x] Expired OTP → 400 with clear code

---

## Phase 2 — User Profile & Fitness Identity

Goal: Dynamic profile creation covering fitness identity, lifestyle, intent; consolidated onboarding API for Flutter.

### 2.1 Models
- [x] `Profile` — user_id (PK/FK), full_name, bio, gender, birthdate, height_cm, last_location (lat/lng), distance_pref_km, main_profile_photo_media_id, profile_status (pending/active/suspended), activated_at
- [x] `FitnessDetails` — user_id, workout_types (JSON), workout_frequency (enum 2x-6x/week), goals (JSON), training_styles (JSON), diet_style (enum), intent (partner/connection/both), same_diff_style_pref (same/different/no_pref)
- [x] `Lifestyle` — user_id, smoking, drinking, kids, language
- [x] `ProfilePromptAnswer` — id, user_id, question_id, answer_text, likes_count, created_at (defined fully in Phase 5 but table scaffolded here)

### 2.2 Enums / Constants
- [x] workout_types: cardio, weightlifting, yoga, hiit, pilates, crossfit, etc.
- [x] goals: lose_weight, build_muscle, stay_active, improve_endurance, general_health
- [x] training_styles: strength, bodybuilding, powerlifting, hybrid, cardio, cross, calisthenics, other
- [x] workout_frequency: 2x, 3x, 5x, 6x per week
- [x] diet_style: vegan, keto, vegetarian, high_protein, balanced, other
- [x] intent: training_partner, connection, both

### 2.3 Endpoints
- [x] `POST /profile/setup-complete` — consolidated onboarding: basic info + fitness + lifestyle + intent + media payload. Validates: ≥4 media items, ≥1 fitness-tagged, main photo is clear face, all required fitness fields present. On pass → profile_status=active.
- [x] `GET /profile/me` — full profile with computed fields (badge status, media list, prompt answers)
- [x] `PUT /profile/me` — partial edits (excluding gender/birthdate field-lock)
- [x] `PUT /profile/fitness` — edit fitness details
- [x] `PUT /profile/lifestyle` — edit lifestyle
- [x] `PUT /profile/location` — update lat/lng (obfuscated on discovery — stored raw, exposed as distance only)
- [x] `GET /profile/:userId` — public view (respecting block list, mode filter)

### 2.4 Activation Logic
- [x] Service helper `profile.service.recomputeActivation(userId)` runs after media upload / fitness edit — flips status to `active` only when: ≥4 media, ≥1 fitness media, main photo present, all required fitness fields.
- [x] Block Discovery endpoints if profile_status ≠ active.

### 2.5 QA Edge Cases
- [x] Setup called with 3 media → 422 with clear message
- [x] Setup with 4 media but no fitness tag → 422
- [x] Main profile photo not flagged as face image → 422
- [x] Profile active but later a media item deleted drops count below 4 → auto-revert to pending

---

## Phase 3 — Media Upload System

Goal: Mixed photo/video uploads with constraints (4–6 items, videos ≤7s, 1 fitness required, WebP optimization).

### 3.1 Models
- [x] `UserMedia` — id, user_id, url, type (photo/video), duration_sec (nullable), is_fitness (bool), is_main_photo (bool), order (1-6), source (app_internal_camera / camera_roll), mime_type, size_bytes, created_at
- [x] Unique constraint: one `is_main_photo=true` per user
- [x] Index: (user_id, order)

### 3.2 Upload Infrastructure
- [x] Configure `multer` with disk storage under `uploads/users/<userId>/`
- [x] Image pipeline via `sharp`: auto-convert to WebP, resize to max 1080px wide, strip EXIF
- [x] Video pipeline via `ffmpeg` (or `fluent-ffmpeg`): reject if duration > 7s, optional re-encode to H.264/AAC mp4
- [x] File size cap per upload (e.g., 10MB photo, 30MB video)

### 3.3 Endpoints
- [x] `POST /media/upload` — single file upload, returns media record
- [ ] `POST /media/upload-bulk` — optional helper for multi-file
- [x] `PUT /media/:id/set-main` — marks as main photo (requires face image validation hook)
- [x] `PUT /media/:id/mark-fitness` — toggle is_fitness flag
- [x] `PUT /media/reorder` — body: `[{id, order}]`
- [x] `DELETE /media/:id` — cascade-check activation status

### 3.4 QA Edge Cases
- [x] Upload #7 while at 6 → 409
- [x] Video duration = 8s → 400
- [x] Non face-image set as main → 422 (reuse face-detection service)
- [x] Delete brings user below 4 → profile auto-revert to pending

---

## Phase 4 — Progress Capture & Active Fitness Verified Badge

Goal: Authentic in-app-only fitness content with auto timestamps and a dynamic badge based on recency.

### 4.1 Models
- [x] `ProgressCapture` — id, user_id, media_url, type (photo/video), duration_sec, captured_month, captured_year, workout_type, caption, source (must be `app_internal_camera`), is_raw_verified (bool), created_at
- [x] `VerificationBadge` — user_id, status (active/inactive), last_activity_at, last_updated

### 4.2 Endpoints
- [x] `POST /progress/upload` — requires `source=app_internal_camera` metadata from client; reject camera_roll source; auto-stamps month/year server-side; only light trim allowed (3–10s for video)
- [x] `GET /progress/me` — list own progress captures
- [x] `GET /progress/user/:userId` — public-visible capture list (respects blocks)
- [x] `DELETE /progress/:id`
- [x] `GET /progress/badge-status` — returns current badge state

### 4.3 Badge Logic
- [x] Service `badge.service.recompute(userId)` — set status=active if user has ≥1 progress capture within last 30 days; else inactive
- [ ] Cron/scheduled job (daily) to scan all users and flip badges
- [x] Trigger recompute on every progress upload/delete

### 4.4 QA Edge Cases
- [x] Upload with source=camera_roll → 400 with specific errorCode `PROGRESS_SOURCE_INVALID`
- [x] Video duration outside 3–10s → 400
- [x] 45-day gap → badge auto-inactive
- [x] Deleted progress drops last activity → badge re-evaluated

---

## Phase 5 — Prompts & Personality Layer

Goal: Fitness prompts, likes, private replies with hidden-identity rules.

### 5.1 Models
- [ ] `PromptQuestion` — id, text, is_active, created_at (seeded system-wide)
- [ ] `ProfilePromptAnswer` — id, user_id, prompt_question_id, answer_text, likes_count, created_at (finalize from Phase 2)
- [ ] `PromptInteraction` — id, sender_id, receiver_id, prompt_answer_id, type (like/reply), reply_text, is_unlocked (bool), created_at

### 5.2 Endpoints
- [ ] `GET /prompts/questions` — list available prompt questions
- [ ] `POST /profile/prompts` — save prompt answer (max N per profile)
- [ ] `DELETE /profile/prompts/:id`
- [ ] `POST /prompts/interact` — body: `{prompt_answer_id, type, reply_text?}`. Hides sender unless match exists OR receiver unlocks.
- [ ] `GET /prompts/inbox` — receiver sees interactions, identity hidden where applicable
- [ ] `POST /prompts/:interactionId/unlock` — consumes premium credit or one-time purchase

### 5.3 Seed Data
- [ ] Seed 10–15 fitness-themed prompt questions: "What keeps you consistent?", "Current goal?", "Favorite workout day?", "Training for right now?", etc.

### 5.4 QA Edge Cases
- [ ] Unlock without credits → 403 `UPGRADE_REQUIRED`
- [ ] Self-interact (sender==receiver) → 400
- [ ] Interact on hidden/blocked user → 404 to avoid leaking existence

---

## Phase 6 — Discovery & Matching System

Goal: Mode-aware browse feed, like/pass, mutual match creation, match list.

### 6.1 Models
- [ ] `DiscoveryAction` — id, actor_id, target_id, action (like/pass/power_tap/rewind), mode (connection/training/both), created_at. Index (actor_id, target_id)
- [ ] `Match` — id, user_one_id, user_two_id, status (pending/matched/unmatched), mode (connection/training), created_at, matched_at (ordered canonical pair: user_one_id < user_two_id)
- [ ] `DailyActionLimit` — user_id, date, like_count, power_tap_count, rewind_count (resets daily)

### 6.2 Endpoints
- [ ] `GET /discovery/browse` — query: `mode` (connection|training_partner|both), `max_distance`, filters. Returns paginated candidate list.
  - Connection mode → opposite gender only (server-enforced)
  - Training Partner mode → both genders
  - Excludes: already-acted, blocked, self, inactive profiles, non-active-status profiles
- [ ] `POST /discovery/like` — body: `{target_id}`. If reciprocal like exists → create Match, send notifications, open chat
- [ ] `POST /discovery/pass`
- [ ] `POST /discovery/power-tap` — premium/one-time action
- [ ] `POST /discovery/rewind` — premium only, max N last actions
- [ ] `GET /match/list` — paginated matches (most recent first)
- [ ] `POST /match/:id/unmatch`
- [ ] `GET /match/likes-received` — premium only (see who liked you)
- [ ] `GET /match/views` — premium only (who viewed you)

### 6.3 Feed Ranking (Activity-Based — see Phase 10)
- [ ] Boost active users (recent login, recent progress upload)
- [ ] Boost premium users
- [ ] Demote inactive users

### 6.4 QA Edge Cases
- [ ] Connection mode returns same-gender → backend filter even if client bypasses → must be impossible
- [ ] Daily like limit exceeded (free) → 403 `LIMIT_REACHED`
- [ ] Mutual match → push notification to both + initialize match_id for chat
- [ ] Like already-liked target → idempotent, no duplicate match
- [ ] Pass does not consume daily limit (decision point) — confirm with PM

---

## Phase 7 — Compatibility Engine

Goal: Compute & surface compatibility scores driven by fitness identity.

### 7.1 Scoring Service
- [ ] `compatibility.service.score(userA, userB)` — returns `{ overall, breakdown }`
  - +30% workout_frequency match
  - +30% goals overlap (partial credit per shared goal)
  - +20% training_style compatibility (respecting `same_diff_style_pref`)
  - +20% intent alignment
  - Optional: +bonus diet alignment, lifestyle alignment
- [ ] Cache scores in Redis (optional) or lazy DB table `CompatibilityScore` keyed by (user_one_id, user_two_id)

### 7.2 Endpoints
- [ ] `GET /compatibility/:targetUserId` — free users get `{ overall }` only, premium get full breakdown + alignment reason

### 7.3 Integration
- [ ] Expose score on discovery feed items (basic % for free, full breakdown for premium on profile detail)

### 7.4 QA Edge Cases
- [ ] User with incomplete fitness details → score returns null with message
- [ ] Diff training style preference: user prefers different → similar styles score lower

---

## Phase 8 — Chat & Messaging (Real-time)

Goal: Post-match 1:1 text chat via Socket.io, persisted to MySQL.

### 8.1 Models
- [ ] `Chat` — id, match_id (unique), last_message_at, last_message_preview, created_at
- [ ] `ChatMessage` — id, chat_id, sender_id, message_text, read_at, created_at
- [ ] Index (chat_id, created_at)

### 8.2 Endpoints
- [ ] `GET /chat/list` — list user's chats with unread counts
- [ ] `GET /chat/:chatId/messages` — cursor-paginated history
- [ ] `POST /chat/:chatId/messages` — send message (also emits via socket)
- [ ] `POST /chat/:chatId/read` — mark messages as read

### 8.3 Socket.io Layer
- [ ] Authenticate socket via JWT
- [ ] Rooms: `chat:<chatId>` joined on match
- [ ] Events: `message:new`, `message:read`, `typing:start`, `typing:stop`, `presence:online`
- [ ] Persist every message to DB before broadcast
- [ ] Fan-out push notification if recipient offline (Phase 11)

### 8.4 QA Edge Cases
- [ ] Send message on non-matched chat → 403
- [ ] Send after unmatch → 403
- [ ] Explicit: NO video/voice calling in MVP (per client)

---

## Phase 9 — Monetization: Premium & One-Time Purchases

Goal: Subscription tier + one-time IAPs with receipt verification (Apple/Google).

### 9.1 Models
- [ ] `Subscription` — user_id, platform (ios/android), plan (monthly/yearly), status (active/expired/cancelled/refunded), started_at, expires_at, latest_receipt, auto_renew
- [ ] `PurchaseEntitlement` — id, user_id, type (rewind_pack/see_who_liked/see_who_viewed/boost_24h/missed_match/unlock_prompt), quantity_remaining, granted_at, source_receipt
- [ ] `PurchaseReceipt` — id, user_id, platform, product_id, transaction_id (unique), raw_payload, verified (bool), created_at

### 9.2 Services
- [ ] Apple StoreKit receipt verification service
- [ ] Google Play billing receipt verification service
- [ ] `entitlement.service.consume(userId, type, qty=1)` — decrements; 403 if none
- [ ] `premium.service.isActive(userId)` — checks live subscription

### 9.3 Endpoints
- [ ] `POST /purchase/verify` — body: `{platform, product_id, receipt}` → verify + grant entitlement/subscription
- [ ] `GET /purchase/entitlements` — current balances + subscription status
- [ ] `POST /purchase/consume` — internal-ish; called by rewind/unlock/boost handlers
- [ ] `POST /premium/apply-boost` — starts 24h visibility boost (if entitlement)

### 9.4 Feature Gates (across app)
- [ ] Daily swipe limit (free) vs unlimited (premium)
- [ ] Basic filters (free) vs advanced filters (premium)
- [ ] Basic compatibility (free) vs full breakdown (premium)
- [ ] Rewind gated to premium OR rewind_pack
- [ ] See who liked you gated
- [ ] See who viewed you gated
- [ ] Power taps limits (free gets few/none, premium gets more)
- [ ] Spotlight exposure gated

### 9.5 QA Edge Cases
- [ ] Replayed receipt (duplicate transaction_id) → 409
- [ ] Rewind without entitlement or premium → 403 `UPGRADE_REQUIRED`
- [ ] Expired subscription → re-gate features immediately
- [ ] Refund webhook → revoke subscription/entitlement

---

## Phase 10 — Activity-Based Visibility Algorithm

Goal: Reward active, authentic users; demote dormant ones.

### 10.1 Signals
- [ ] Last login recency
- [ ] Progress capture recency (feeds Active Fitness Verified badge)
- [ ] Media freshness
- [ ] Daily like/match activity
- [ ] Premium status
- [ ] Boost entitlement active

### 10.2 Implementation
- [ ] `UserActivityScore` table — user_id, score, last_computed_at
- [ ] Nightly cron recomputes scores for all users
- [ ] Discovery feed ORDER BY activity_score DESC (plus randomness)
- [ ] Decay function: score degrades if no login in 7+ days

### 10.3 QA Edge Cases
- [ ] New user bootstrap — neutral mid-range score so they appear in feeds
- [ ] Premium user with zero activity — still capped to avoid pay-to-win dominance

---

## Phase 11 — Notifications

Goal: Push (FCM) + in-app notifications for all engagement events.

### 11.1 Models
- [ ] `DeviceToken` — id, user_id, fcm_token, platform (ios/android), is_active, last_seen_at
- [ ] `Notification` — id, user_id, type, title, body, payload (JSON), read_at, created_at
- [ ] `NotificationPreference` — user_id, match_enabled, message_enabled, like_enabled, marketing_enabled, etc.

### 11.2 Firebase Integration
- [ ] `src/common/config/firebase.js` — initialize Admin SDK from env/service account JSON
- [ ] `notification.service.sendPush(userId, payload)` — sends to all active tokens
- [ ] Token refresh endpoint

### 11.3 Triggered Notifications
- [ ] New match
- [ ] New chat message (if recipient offline)
- [ ] New like (with hidden-identity rules until premium unlock)
- [ ] Prompt interaction received
- [ ] Daily swipe limit reached
- [ ] Upgrade offers / boost promotions
- [ ] Verification alerts (OTP, face verify prompts, suspicious login)
- [ ] Badge lost / re-earned
- [ ] Admin moderation actions (warning, ban, verification required)

### 11.4 Endpoints
- [ ] `POST /notifications/register-token`
- [ ] `DELETE /notifications/token/:id`
- [ ] `GET /notifications` — paginated in-app feed
- [ ] `POST /notifications/:id/read`
- [ ] `POST /notifications/read-all`
- [ ] `GET /notifications/preferences`
- [ ] `PUT /notifications/preferences`

---

## Phase 12 — Safety & Moderation

Goal: User reporting, blocking, admin review workflow, AI-assisted content moderation.

### 12.1 Models
- [ ] `Report` — id, reporter_id, reported_user_id, reason_category, description, related_media_id (nullable), status (open/reviewed/actioned/dismissed), admin_note, created_at, resolved_at
- [ ] `Block` — id, blocker_id, blocked_id, created_at (unique pair)
- [ ] `MediaModerationQueue` — id, media_id, source (progress/user_media), flagged_by (report/ai/admin), ai_score (JSON), status (pending/approved/rejected), reviewer_id, created_at

### 12.2 Endpoints (user-facing)
- [ ] `POST /report/user` — body: `{reported_user_id, reason, description, media_id?}`
- [ ] `POST /block/:userId`
- [ ] `DELETE /block/:userId` — unblock
- [ ] `GET /block/list`

### 12.3 System Rules
- [ ] Blocked users are filtered from discovery, cannot chat, cannot see profile, cannot interact with prompts — both directions
- [ ] User with N reports in M days auto-flags account → admin review + optional force face re-verify
- [ ] AI nudity detection hook (stub provider interface) on every media/progress upload → flagged items queued

### 12.4 QA Edge Cases
- [ ] Blocking a matched user → unmatch + remove from chat list
- [ ] Report spam — rate-limit reports per reporter

---

## Phase 13 — Admin Panel (API)

Goal: Backoffice APIs for user management, moderation, verification, analytics, purchases.

### 13.1 Admin Models
- [ ] `AdminUser` — id, email, password_hash, role (super/moderator/analyst), is_active
- [ ] `AdminActionLog` — id, admin_id, action_type, target_type, target_id, payload, created_at

### 13.2 Admin Auth
- [ ] Separate `/admin/auth/login` with stricter rate limit
- [ ] Admin JWT distinguishable from user JWT
- [ ] `adminAuthMiddleware` on all `/admin/*` routes

### 13.3 User Management Endpoints
- [ ] `GET /admin/users` — filter/search/paginate
- [ ] `GET /admin/users/:id` — full profile + media + progress + matches summary
- [ ] `POST /admin/users/:id/force-face-verify` — re-trigger verification
- [ ] `POST /admin/users/:id/suspend` with reason
- [ ] `POST /admin/users/:id/ban`
- [ ] `POST /admin/users/:id/reactivate`
- [ ] `DELETE /admin/users/:id` — soft delete (paranoid)

### 13.4 Moderation Endpoints
- [ ] `GET /admin/reports` — queue with filters
- [ ] `POST /admin/reports/:id/resolve`
- [ ] `GET /admin/media-queue` — flagged media
- [ ] `POST /admin/media/:id/approve`
- [ ] `POST /admin/media/:id/reject`
- [ ] `GET /admin/progress-queue`
- [ ] `POST /admin/progress/:id/approve`
- [ ] `POST /admin/progress/:id/reject`

### 13.5 Purchase & Premium Monitoring
- [ ] `GET /admin/subscriptions`
- [ ] `GET /admin/purchases`
- [ ] `GET /admin/entitlements/:userId`
- [ ] `POST /admin/entitlements/grant` — manual grant (edge cases/refunds)

### 13.6 Admin Dashboard Aggregates
- [ ] `GET /admin/dashboard/overview` — all key metrics on one call
- [ ] Feeds into Phase 14 analytics

---

## Phase 14 — Analytics & Reporting

Goal: Track product metrics and retention signals.

### 14.1 Models
- [ ] `MetricSnapshot` — id, metric_key, value, dimension (JSON), snapshot_date
- [ ] `UserEvent` — id, user_id, event_type, payload (JSON), created_at (event log for ad-hoc queries)

### 14.2 Tracked Metrics
- [ ] Total users / active users / verified users
- [ ] Profiles activated (daily, weekly, monthly)
- [ ] Matches created
- [ ] Chat starts / messages sent
- [ ] Premium conversions
- [ ] One-time purchase usage by type
- [ ] Most used premium features
- [ ] Active vs inactive user trends
- [ ] Compatibility view engagement
- [ ] Prompt interaction stats
- [ ] Match-rate by fitness goal (e.g., powerlifters vs bodybuilders)
- [ ] Day-1 / Day-7 / Day-30 retention

### 14.3 Endpoints
- [ ] `GET /admin/analytics/overview`
- [ ] `GET /admin/analytics/matches?groupBy=goal`
- [ ] `GET /admin/analytics/retention`
- [ ] `GET /admin/analytics/monetization`
- [ ] `GET /admin/analytics/engagement`

### 14.4 Alerts
- [ ] Alert admin when active users drop below threshold
- [ ] Alert on report spike
- [ ] Alert on verification failure spike

---

## Phase 15 — Performance, Security & Production Hardening

Goal: Make the backend production-ready per `requirement.md` Section 7.

### 15.1 Performance
- [ ] All uploads converted to WebP (photos) via sharp pipeline
- [ ] All list endpoints use cursor-based pagination (discovery, matches, chat, notifications, admin)
- [ ] DB indexes audited: match pairs, chat queries, discovery filter columns, foreign keys
- [ ] Connection pool sized appropriately in `db.config.js`
- [ ] Optional: Redis cache for hot reads (compatibility, discovery feed)

### 15.2 Security
- [ ] Helmet middleware enabled
- [ ] CORS origin locked down in production (CLIENT_URL + APP_URL_ADMIN)
- [ ] Rate limiters on: login, forgot password, signup, OTP resend, report submission
- [ ] Argon2 params tuned
- [ ] JWT rotation on password change / logout-all
- [ ] Secrets never logged; auditLog redacts passwords/tokens
- [ ] SQL injection: rely on Sequelize bind params, never raw concat

### 15.3 Privacy
- [ ] Location obfuscation: store raw lat/lng, expose only distance in km
- [ ] Hidden prompt interaction identity respected everywhere
- [ ] Right-to-delete endpoint (GDPR-style): `DELETE /profile/me` with data scrub
- [ ] Export-my-data endpoint (optional): `GET /profile/me/export`

### 15.4 Observability
- [ ] Request timing middleware (already in Phase 0) logs duration
- [ ] Error reporting hook (Sentry-style) wired in errorHandler for production
- [ ] Health check endpoint `GET /health` (DB ping + version)

### 15.5 Docs & Deployment
- [ ] Swagger API docs published at `/api/documentation` covering every endpoint
- [ ] Postman collection export (optional)
- [ ] HTTPS via Let's Encrypt (`IS_SECURE=true`, `SSL_CERT_BASE_PATH` set)
- [ ] Production `.env` reviewed against `serverChecklist.js`
- [ ] Backup strategy for MySQL (daily dumps)
- [ ] Uploads folder backed up / moved to S3 (optional, post-MVP)

---

## Cross-Cutting QA Pass (Before Launch)

These tests from `requirement.md` Section 5 must all pass end-to-end.

### Authentication
- [ ] Login while `is_verified=false` → blocked, redirect to OTP
- [ ] Face verify fails 3× → account flagged for admin review
- [ ] Forgot password flow end-to-end

### Profile & Onboarding
- [ ] 4 photos, 0 fitness → profile stays pending; discovery blocked
- [ ] Video upload > 7s → 400
- [ ] Main photo non-face → 422

### Discovery & Matching
- [ ] Connection mode, same-gender target → filtered out by backend even if client requests
- [ ] Mutual match → push notifications + chat_id ready

### Progress Capture
- [ ] Camera roll upload via API → rejected (`PROGRESS_SOURCE_INVALID`)
- [ ] 45 days of inactivity → badge auto-inactive

### Monetization
- [ ] Rewind without entitlement or premium → 403 `UPGRADE_REQUIRED`
- [ ] Purchase receipt replay → 409
- [ ] Subscription expiry → premium features re-locked

### Safety
- [ ] Blocked user disappears from discovery, chat, prompts, profile views
- [ ] Report spike on one target → auto-flag + admin notification

---

## Out of MVP Scope (Noted for Future)

Per client direction + `requirement.md`:
- [ ] ~~Face-to-face video/voice calling~~ (explicitly excluded from MVP)
- [ ] Referral program (future)
- [ ] Community/group features (future, only if needed)
- [ ] Richer verification methods beyond face (future)
- [ ] Deeper recommendation engine / ML models (future)

Architecture should support adding these without rebuilds (per client expectation).

---

## Progress Tracking

- **Phase 0:** ✅ Complete (server boots, MySQL connected, models synced, seed runs)
- **Phase 1:** ✅ Complete (auth endpoints implemented; ready for live signup/login flow)
- **Phase 2:** ✅ Complete (profile + fitness + lifestyle + consolidated onboarding implemented)
- **Phase 3:** ✅ Complete (WebP pipeline + 7s video guard + activation recompute)
- **Phase 4:** ✅ Complete (in-app-only source guard + badge recompute on upload/delete)
- **Phase 5:** ☐ Not started
- **Phase 6:** ☐ Not started
- **Phase 7:** ☐ Not started
- **Phase 8:** ☐ Not started
- **Phase 9:** ☐ Not started
- **Phase 10:** ☐ Not started
- **Phase 11:** ☐ Not started
- **Phase 12:** ☐ Not started
- **Phase 13:** ☐ Not started
- **Phase 14:** ☐ Not started
- **Phase 15:** ☐ Not started
- **Final QA Pass:** ☐ Not started

Flip each phase header to ✅ once every checkbox under it is marked done.
