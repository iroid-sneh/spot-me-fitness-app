# Spot Me Fix Audit

Scope of this audit:
- Compared `InitalRequirements.md`, `requirement.md`, and `plan.md`
- Reviewed the implementation that claims Phases 0 to 4 are done
- This is a code and contract audit of the completed work, not a full runtime E2E pass

## Critical Fixes

### 1. Login does not actually enforce face verification
Files:
- `server/src/auth/auth.service.js:154-180`
- `server/src/common/middleware/auth.js:47-64`

Problem:
- Login creates a normal session and returns a full `accessToken` even when `requiresFaceVerification` is true.
- After that, the auth middleware only checks JWT + session revocation. It does not block flagged users, new-device users, or `face_verified_status = pending/failed` users from using protected APIs.
- This breaks the requirement that face verification is required at login for suspicious/new-device cases.

Required fix:
- Do not issue a normal app session until face verification passes.
- Return a short-lived verification challenge token or temporary login state instead.
- Add middleware enforcement so flagged or pending-face-verify accounts cannot access protected product routes until verification is completed.

### 2. Forgot-password OTP becomes effectively reusable for an unlimited time
Files:
- `server/src/auth/auth.service.js:105`
- `server/src/auth/auth.service.js:230-240`

Problem:
- OTP verification sets `is_forgot_password_verified = true`.
- Password reset only checks that boolean.
- That means once a user verifies OTP once, they can reset later without a fresh OTP until another flow clears the flag.
- This violates the 10-minute, single-use OTP behavior from the requirements.

Required fix:
- Replace the boolean with a short-lived reset challenge tied to the verified OTP.
- Store reset authorization with its own expiry and consume it during reset.
- Ensure the reset grant expires when the OTP would have expired and cannot be replayed.

### 3. Uploads are stored in the wrong folder because multer reads the wrong user field
File:
- `server/src/common/config/multer.js:13-14`

Problem:
- Upload storage uses `req.user?.id`.
- Auth middleware sets `req.user.userId`, not `req.user.id`.
- Result: authenticated uploads are written under `uploads/.../anonymous` instead of `uploads/.../<userId>`.
- This breaks the per-user upload structure promised in Phase 3 and creates cross-user storage disorder.

Required fix:
- Change storage path resolution to use `req.user.userId`.
- Verify both `/media/upload` and `/progress/upload` now store files under the correct user directory.

### 4. Onboarding trusts arbitrary client media URLs and metadata
File:
- `server/src/profile/profile.service.js:126-140`

Problem:
- `POST /profile/setupcomplete` deletes existing media rows and recreates them directly from client-supplied `url`, `durationSec`, and `source`.
- The backend is not verifying that these URLs belong to files uploaded through the backend.
- Video duration and media ownership can be faked by the client.
- A profile can become active using media that never passed the media pipeline.

Required fix:
- Do not accept arbitrary media URLs in onboarding.
- Make onboarding reference existing backend-owned `UserMedia` records by ID, or validate that supplied media already exists and belongs to the authenticated user.
- Reuse actual stored metadata from `UserMedia` instead of trusting client `durationSec` and `source`.

### 5. Badge expiry is not automated even though Phase 4 is marked complete
Files:
- `server/src/progress/badge.service.js:8-42`
- `plan.md:198`
- `plan.md:625`

Problem:
- Badge status is recomputed only when progress is uploaded, deleted, or when badge status is requested.
- There is no scheduled job to expire stale badges.
- `plan.md` still has the cron item unchecked, but Phase 4 is marked complete in the progress summary.
- This means an active badge can remain stale in storage after the 30/45 day inactivity window unless some endpoint happens to recompute it.

Required fix:
- Add a daily scheduled job that runs `recomputeAllBadges`.
- Run it against all relevant users, not only during request-time flows.
- Update `plan.md` so completion status matches actual implementation.

## High Fixes

### 6. Implemented endpoint names do not match the required API contract
Files:
- `server/src/auth/auth.routes.js:18,20,21,24`
- `server/src/profile/profile.routes.js:13`
- `server/src/media/media.routes.js:14`
- `server/src/progress/progress.routes.js:12`

Current routes:
- `/auth/verifyotp`
- `/auth/forgotpassword`
- `/auth/resetpassword`
- `/auth/faceverify`
- `/profile/setupcomplete`
- `/media/:id/setmain`
- `/progress/badgestatus`

Required contract from `requirement.md`:
- `/auth/verify-email`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/face-verify`
- `/profile/setup-complete`
- `/progress/badge-status`

Problem:
- The implemented API does not match the documented production contract.
- This will break mobile/client integration and invalidates the technical spec.

Required fix:
- Add the required canonical endpoints immediately.
- Keep backward-compatible aliases only if needed temporarily.
- Update Swagger and route documentation to the canonical names.

### 7. Face verification and clear-face detection are effectively always passing in default mode
File:
- `server/src/common/utils/faceVerify.js:6-21`

Problem:
- If `FACE_VERIFY_PROVIDER` is unset, `compareFaces` returns `match: true`.
- `detectFace` also returns `hasFace: true` and `isClear: true`.
- This means:
  - main profile photo validation is not real
  - face verification failures are not realistically testable
  - the QA case for 3 consecutive face verification failures cannot happen in normal default setup

Required fix:
- Fail closed outside local dev/test if no provider is configured.
- Make stub behavior explicit and environment-bound.
- Add a deterministic test mode for pass/fail simulation instead of unconditional success.

### 8. Face verification does not fail fast when the user has no main reference photo
File:
- `server/src/auth/auth.service.js:302-314`

Problem:
- The service attempts comparison even when `reference?.url` is missing.
- Requirement says face verification compares the live image against the main profile photo.
- Without a main face photo, this flow should be blocked with a clear validation error.

Required fix:
- Reject face verification if no valid main profile photo exists.
- Return a clear error instructing the user/admin to set a valid main face photo first.

### 9. Public profile and public progress access rules are incomplete
Files:
- `server/src/profile/profile.service.js:208-240`
- `server/src/progress/progress.service.js:119-126`

Problem:
- Public profile only checks `profile_status = active` and computes distance.
- It does not enforce the mode/filter rules referenced in the profile requirement.
- Public progress listing returns captures for any requested user ID with no additional visibility checks.
- The phase notes mention respecting blocks, but that behavior is not present.

Required fix:
- Add proper public-visibility rules before exposing profile/progress content.
- If block logic is deferred to a later phase, clearly mark these endpoints as incomplete instead of treating the phase as done.
- Do not expose public progress blindly by user ID.

### 10. Activation recompute does not validate all required fitness fields
File:
- `server/src/profile/profile.service.js:52-55`

Problem:
- `recomputeActivation` checks `workout_frequency`, `fitness_goals`, `training_styles`, and `intent`.
- It does not check `workout_types`, even though onboarding requires it and the product requirements make workout type a core profile field.
- This creates a logic gap between setup validation and activation recomputation.

Required fix:
- Include `workout_types` in activation checks.
- Keep activation rules identical everywhere they are evaluated.

## Medium Fixes

### 11. Several Phase 0 foundation items are marked complete in `plan.md` but do not exist
Files:
- `plan.md:44-48`

Missing files:
- `server/src/common/utils/response.js`
- `server/src/common/utils/pagination.js`
- `server/src/common/middleware/validate.js`

Problem:
- The plan marks these as completed, but they are absent from the codebase.
- This makes phase tracking unreliable and means the foundation is not what the plan claims.

Required fix:
- Either add these files and wire them properly, or mark the checklist items incomplete.
- Do not mark foundation items done unless they are physically present and used.

### 12. Phase completion tracking is inaccurate for already claimed completed phases
Files:
- `plan.md:167`
- `plan.md:198`
- `plan.md:624-625`

Problem:
- `POST /media/upload-bulk` is still unchecked, but Phase 3 is marked complete.
- Daily badge cron is still unchecked, but Phase 4 is marked complete.

Required fix:
- Correct the phase status summary.
- Do not treat a phase as complete while checklist items remain open.

### 13. The onboarding and media contract is split in a way that weakens backend guarantees
Files:
- `server/src/profile/profile.service.js:87-95`
- `server/src/profile/profile.service.js:130-139`

Problem:
- Setup validates the main photo with `detectFace`, but the rest of the media payload is still trusted from the client.
- The backend is enforcing business rules partly in the upload service and partly in onboarding, but onboarding can bypass the stronger upload guarantees.

Required fix:
- Make media upload the only source of truth for file validation and stored metadata.
- Make onboarding only assemble or select already-validated media.

## Suggested Retest Checklist After Fixes

1. Signup -> verify email -> login while unverified -> blocked correctly.
2. Login from a new device -> user cannot access protected APIs until face verification succeeds.
3. Fail face verification 3 times -> account becomes flagged and admin-reviewable.
4. Forgot-password OTP verified once -> reset allowed once only within validity window.
5. Media upload stores files under the authenticated user folder, not `anonymous`.
6. Profile setup cannot activate using arbitrary URLs not uploaded by the backend.
7. Badge becomes inactive automatically after inactivity even if the user never calls `badge-status`.
8. Mobile client can call the canonical documented routes from `requirement.md` without special-case mapping.
