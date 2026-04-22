Spot Me: Fitness Connection App - Backend Technical Specification
=================================================================

1\. Project Overview
--------------------

**Spot Me** is a high-authenticity fitness connection platform. Unlike standard dating apps, it prioritizes "Fitness Identity" over pure appearance.

*   **Core Pillars:** Discipline, Consistency, Authenticity, and Intentional Connection.
    
*   **Key Differentiator:** "Progress Capture" (In-app only, raw media) and "Fitness Identity" matching scores.
    

2\. System Architecture & Tech Stack (Recommended)
--------------------------------------------------

*   **Language:** Node.js.
    
*   **Database:** Mysql with Sequelize.
    
*   **Real-time:** WebSockets (Socket.io) for Chat and Notifications.
    

3\. Database Schema Entities
----------------------------

### 3.1 Users & Auth

*   User: id, email, password\_hash, is\_verified, face\_verified\_status, created\_at.
    
*   UserAccountStatus: active, flagged, banned, inactive.
    

### 3.2 Fitness Identity (The Core Profile)

*   Profile: user\_id, full\_name, bio, gender, birthdate, height, distance\_pref, last\_location (lat/lng).
    
*   FitnessDetails: workout\_type\[\], workout\_frequency (2x-6x/week), goals\[\], training\_styles\[\], diet\_style, intent (partner/connection/both).
    
*   Lifestyle: smoking, drinking, kids, language.
    
*   UserMedia: id, user\_id, url, type (photo/video), is\_fitness\_required\_item (boolean), order (1-6).
    

### 3.3 Progress Capture (Authenticity Layer)

*   ProgressCapture: id, user\_id, media\_url, type, timestamp (month/year), workout\_type, caption, is\_raw\_verified (boolean).
    
*   VerificationBadge: user\_id, status (active/inactive), last\_updated.
    

### 3.4 Interactions & Social

*   Match: id, user\_one\_id, user\_two\_id, status (pending/matched), mode (connection/training).
    
*   Prompt: id, user\_id, question, answer, likes\_count.
    
*   PromptInteraction: id, sender\_id, receiver\_id, prompt\_id, type (like/reply), is\_unlocked (boolean).
    
*   Chat: id, match\_id, sender\_id, message, timestamp.
    

4\. API Documentation (Production Ready)
----------------------------------------

### Module 1: Authentication & Security

*   POST /auth/signup: Create account with email/password. Triggers OTP email.
    
*   POST /auth/verify-email: Validates 6-digit OTP.
    
*   POST /auth/login: Returns JWT. Triggers Face Verification if account is flagged or on new device.
    
*   POST /auth/face-verify: Sends live-captured image to backend to match against "Main Profile Photo."
    

### Module 2: Consolidated Onboarding (Flutter Optimized)

_As per request, a single API to handle the 4-5 steps stored locally by Flutter._

*   **POST /profile/setup-complete**
    
    *   codeJSON{ "gender": "male", "fitness\_goals": \["build\_muscle", "stay\_active"\], "training\_styles": \["powerlifting", "hiit"\], "workout\_frequency": "5x\_per\_week", "intent": "both", "diet\_style": "high\_protein", "personal\_details": { "height": 180, "kids": "no", "smoking": "no" }, "media": \[ { "url": "...", "type": "image", "is\_fitness": true } \]}
        
    *   **Logic:** Validates that at least 4 media items are present and at least 1 is marked as "fitness." Updates profile to active status.
        

### Module 3: Discovery & Compatibility Engine

*   **GET /discovery/browse**
    
    *   **Query Params:** mode (connection | training\_partner), max\_distance.
        
    *   **Logic:**
        
        *   If connection: Filter by opposite gender + Fitness compatibility.
            
        *   If training\_partner: Show both genders + Fitness compatibility.
            
*   **The Compatibility Score (Internal Logic):**
    
    *   +30% if workout\_frequency matches.
        
    *   +30% if goals overlap.
        
    *   +20% if training\_style is similar.
        
    *   +20% if intent matches.
        

### Module 4: Progress Capture & Badges

*   **POST /progress/upload**
    
    *   **Constraint:** Only accepts "raw" flag from frontend (proving in-app capture).
        
    *   **Logic:** Automatically attaches Month/Year timestamp.
        
*   **GET /progress/badge-status**
    
    *   Calculates if user has uploaded authentic content in the last 30 days to maintain the "Active Fitness Verified" badge.
        

### Module 5: Monetization & Prompts

*   **POST /prompts/interact**
    
    *   Allows liking/replying to a prompt.
        
    *   **Logic:** Hides sender ID from the receiver unless match exists or receiver calls POST /prompts/unlock (using premium credits/one-time purchase).
        

5\. QA Test Cases & Edge Cases (The "QA Defense" Layer)
-------------------------------------------------------

### 5.1 Authentication

*   **Case:** User tries to login while is\_verified is false. -> _Expected: Block and redirect to OTP._
    
*   **Case:** Face verification fails 3 times. -> _Expected: Flag account for Admin Review._
    

### 5.2 Profile & Onboarding

*   **Case:** User uploads 4 photos but none are "fitness-related." -> _Expected: Profile stays in 'Pending' state; cannot access Discovery._
    
*   **Case:** Video upload exceeds 7 seconds. -> _Expected: Backend rejection (400 Bad Request)._
    

### 5.3 Discovery & Matching

*   **Case:** User in Connection Mode tries to see same-gender profiles. -> _Expected: Backend must filter these out regardless of frontend state._
    
*   **Case:** Mutual match occurs. -> _Expected: Trigger Push Notification to both users and initialize Chat ID._
    

### 5.4 Progress Capture

*   **Case:** User attempts to upload a photo from the "Camera Roll" via API. -> _Expected: Backend validates 'Source' metadata; rejects if not 'App\_Internal\_Camera'._
    
*   **Case:** User stops uploading progress for 45 days. -> _Expected: "Active Fitness Verified" badge status set to inactive automatically._
    

### 5.5 Monetization (One-Time Purchases)

*   **Case:** User tries to "Rewind" without a rewind\_pack or premium\_status. -> _Expected: 403 Forbidden with "Upgrade Required" message._
    

6\. Admin Panel Requirements
----------------------------

*   **User Management:** Ability to manually trigger "Face Verification" on any user.
    
*   **Media Moderation:** Queue for reported photos (AI-based nudity detection + manual review).
    
*   **Analytics:** Track "Conversion to Match" based on specific Fitness Goals (e.g., do Powerlifters match more often?).
    
*   **Retention:** Alert admin if "Active Users" count drops below threshold.
    

7\. Performance & Production Standards
--------------------------------------

1.  **Image Optimization:** Backend must resize uploads to WebP for faster mobile loading.
    
2.  **Pagination:** All browse/match lists must use Cursor-based pagination.
    
3.  **Security:** Rate-limiting on Forgot Password and Login to prevent brute force.
    
4.  **Privacy:** Obfuscate exact user location (return distance in KM, not exact coordinates).