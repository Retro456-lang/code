# 04. 2-Day (48-Hour) Offline Muscle Memory Practice Plan

## Overview & The "Blank File Syndrome" Solution

Many developers can read code, but freeze when presented with a blank editor without internet or AI tools. This 2-day practice plan uses **Muscle Memory Repetition**, **Deletion Drills**, and **Incremental Building** to hardwire key patterns into your fingers.

---

## 🗓️ DAY 1: Backend TypeScript + Express + Postgres Mastery (24 Hours)

| Time Block | Focus Topic | Activity & Drill | Goal |
| :--- | :--- | :--- | :--- |
| **Hours 01 - 03** | Mental Models & SQL Drills | Write SQL schema & CRUD queries on paper/blank file 10 times without looking at docs. | Write `CREATE TABLE`, `INSERT INTO ... RETURNING`, `SELECT` from memory. |
| **Hours 04 - 07** | Express Server Skeleton | Build `express()` server from scratch 5 times. Configure `express.json()`, `cors()`, and basic `/health` route. | Muscle memory for `package.json`, `tsconfig.json`, and server bootstrap. |
| **Hours 08 - 12** | Auth Core (Bcrypt & JWT) | Write password hashing helper & JWT sign/verify functions in a blank TS file 5 times. | Memorize `bcrypt.hash(pwd, 10)`, `bcrypt.compare()`, and `jwt.sign(payload, secret)`. |
| **Hours 13 - 16** | Register & Login APIs | Build complete `POST /api/auth/register` and `POST /api/auth/login` controllers & routes. | Connect Express request body to PostgreSQL queries and return HTTP 201/200/401 status codes. |
| **Hours 17 - 20** | Protected Middleware & Routes | Write `authenticateToken` middleware and attach to `/api/user/profile` and `/api/dashboard`. | Memorize header parsing (`req.headers['authorization']?.split(' ')[1]`) and JWT verification. |
| **Hours 21 - 24** | 🔥 **THE BACKEND NUKE EXERCISE** | Delete the entire `src/` directory! Turn off Wi-Fi. Rebuild all 4 endpoints in under 45 minutes. | Complete independence from docs/AI for backend foundations. |

---

## 🗓️ DAY 2: Frontend Kotlin + Retrofit + Full-Stack Integration (24 Hours)

| Time Block | Focus Topic | Activity & Drill | Goal |
| :--- | :--- | :--- | :--- |
| **Hours 25 - 28** | Kotlin Models & Retrofit Interface | Write Kotlin `data class` DTOs and `@POST` / `@GET` Retrofit interface methods 5 times from memory. | Memorize `@Body`, `@Header`, and `suspend fun` Retrofit syntax. |
| **Hours 29 - 32** | Token Manager & Interceptor | Build `TokenManager` (SharedPreferences) and `AuthInterceptor` (OkHttp) from scratch 4 times. | Memorize `chain.proceed(request.newBuilder().header(...).build())`. |
| **Hours 33 - 37** | Repository & Coroutines | Write `NetworkResult<T>` sealed class and `AuthRepository` with `try/catch` block. | Hardwire Coroutine error handling and flow of network response into state objects. |
| **Hours 38 - 41** | ViewModel & Localhost Integration | Connect ViewModel `StateFlow` to repository. Test network call against local Express server (`10.0.2.2:5000`). | Validate full network cycle from Android UI -> Node Server -> Postgres DB. |
| **Hours 42 - 44** | Full-Stack Integration & Edge Cases | Handle 401 Unauthorized errors in Kotlin, clear expired JWT tokens, and test edge cases. | Master user session invalidation and re-login flows. |
| **Hours 45 - 48** | 🔥 **THE ULTIMATE DOUBLE NUKE BOSS FIGHT** | Delete `src/` in Node AND delete network layer in Android. Wi-Fi OFF. Rebuild complete app in 90 minutes. | Absolute mastery and elimination of blank-file freeze! |

---

## ⚡ Muscle Memory Flashcard & Deletion Drills

### Drill #1: The 5-Minute SQL Builder
Open a blank file. Without looking at any guide, write:
1. Table creation for `users` with `id`, `email`, `password_hash`, `created_at`.
2. Parameterized `INSERT` query returning `id` and `email`.
3. `SELECT` query searching by email.

### Drill #2: The 5-Minute Express JWT Middleware
Open a blank file. Write the complete `authenticateToken` function:
- Extract Bearer token from `Authorization` header.
- Handle missing token (return 401).
- Call `jwt.verify(token, secret)`.
- Attach payload to `req.user` and call `next()`.

### Drill #3: The 5-Minute Kotlin Auth Interceptor
Open a blank file. Write the complete OkHttp `AuthInterceptor` class:
- Implement `Interceptor` interface.
- Read token from `TokenManager`.
- Rebuild `chain.request()` adding `"Authorization"` header if token exists.
- Return `chain.proceed(newRequest)`.

---

## 🏆 Graduation Criteria
You have mastered this plan when you can sit at a laptop with **NO Wi-Fi, NO AI, and a BLANK editor**, and construct the entire backend and Android network layer from scratch in under **90 minutes**!
