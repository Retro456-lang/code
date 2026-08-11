# Original User Request

## Initial Request — 2026-08-11T18:01:20Z

A research and pedagogical design multi-agent system that analyzes, evaluates, and constructs a beginner-friendly "learn-by-building" curriculum and architecture blueprint for a full-stack Kotlin application (Backend APIs with PostgreSQL + Frontend) designed for a student writing all code by hand.

Working directory: ~/teamwork_projects/kotlin_fullstack_curriculum
Integrity mode: development

## Requirements

### R1. Kotlin Backend Framework & Architecture Research
Perform multi-agent deep research comparing top Kotlin backend frameworks (Ktor, Spring Boot, Micronaut, Javalin) specifically for learning core backend concepts by hand:
- Routing & Controller patterns
- Authentication & Session management (JWT / Password Hashing with BCrypt)
- Database access layers (Raw SQL vs Exposed ORM vs Hibernate) with PostgreSQL
- Developer experience, setup complexity, and boilerplate comparison matrix.

### R2. Core API Blueprint & Database Design
Design clean, beginner-friendly specifications and schemas for 4 foundational APIs:
1. POST /api/auth/register (User registration, password hashing)
2. POST /api/auth/login (Authentication, JWT issuance)
3. GET /api/user/profile (Authenticated user profile retrieval)
4. GET /api/dashboard/summary (Protected dashboard analytics/data feed)
Provide SQL DDL migration scripts for PostgreSQL and raw API request/response contracts.

### R3. Frontend Architecture Options in Kotlin
Evaluate Kotlin-compatible frontend strategies (Jetpack Compose Multiplatform for Desktop/Web/Mobile vs. Kotlin/JS Web) that consume the backend APIs cleanly while keeping fundamentals visible to a learner writing code by hand.

### R4. Step-by-Step Student Master Plan & Exercises
Structure a module-by-module teaching roadmap (from zero to running full-stack app) explaining concepts in simple, intuitive mental models suitable for a beginner, with exercise prompts for writing code by hand.

## Acceptance Criteria

### Research & Framework Comparison
- Includes a structured comparison matrix of Ktor vs Spring Boot vs Javalin evaluating lines of boilerplate, learning curve, database integration ease with PostgreSQL, and transparency of fundamentals.
- Provides a clear recommendation on the best backend framework choice for learning by hand.

### API & Database Specification
- Complete DDL script for PostgreSQL users and dashboard_items tables with proper constraints, data types, and primary/foreign keys.
- Full OpenAPI/Markdown specifications for Register, Login, Profile, and Dashboard APIs including error states (400, 401, 404, 500).

### Pedagogical Blueprint & Exercises
- Module-by-module teaching guide breaking down concepts into 10-year-old friendly mental models (e.g., explaining client-server, HTTP verbs, database queries, password hashing, and JWT tokens).
- Interactive exercises formatted as "Write this by hand" prompts with hints and solution verification tests.
- CRITICAL CONSTRAINT: Do NOT write any application source code files for the student. Focus exclusively on research, architecture, schemas, diagrams, and step-by-step learning exercises.
