# CodeRecall Firestore Security Specification

## 1. Data Invariants
1. **Strict Ownership & PII Isolation**: `users/{userId}` contains `email` (PII). Only the authenticated, email-verified user with `request.auth.uid == userId` may read, create, or update their profile. Cross-user reads and blanket `list` queries on `/users` are forbidden.
2. **Master Gate Parent Integrity**: Subcollections `/users/{userId}/progress/{problemId}` and `/users/{userId}/recallSessions/{sessionId}` require an existing parent profile document (`exists(/databases/$(database)/documents/users/$(userId))`) and matching `userId == request.auth.uid`.
3. **Immutable Audit & Identity Fields**: `uid`, `userId`, `problemId`, and `createdAt` cannot be modified after creation. Server timestamps (`request.time`) are mandatory for `createdAt` on create and `updatedAt` on update.
4. **Volumetric & Schema Guarding**: Every string field enforces strict `.size()` bounds (`codeJava/Cpp/Python <= 25000`, `notes <= 5000`, `displayName <= 100`), numeric ranges (`streakDays >= 0`, `accuracyPercent` between 0 and 100, `easeFactor >= 1.3`), and strict `keys().hasAll(...)` / `keys().hasOnly(...)` checks to prevent ghost fields.
5. **Immutable Recall Logs**: `recallSessions` are append-only (`allow update, delete: if false`).

## 2. Adversarial Payloads Blocked ("Dirty Dozen")
1. Unauthenticated read of `/users/uid1`. -> `PERMISSION_DENIED`
2. Cross-user read of `/users/uid2/progress/two-sum` by `uid1`. -> `PERMISSION_DENIED`
3. Unverified email write (`email_verified: false`) to `/users/uid1`. -> `PERMISSION_DENIED`
4. Shadow field injection (`{ ..., isAdmin: true }`) on `/users/uid1` create or update. -> `PERMISSION_DENIED`
5. Identity spoofing (`{ userId: "uid2" }`) inside `/users/uid1/progress/two-sum`. -> `PERMISSION_DENIED`
6. Path ID poisoning (`/users/uid1/progress/invalid$id!`) violating `isValidId()`. -> `PERMISSION_DENIED`
7. Client-forged timestamp (`createdAt: "2020-01-01T00:00:00Z"`) instead of `request.time`. -> `PERMISSION_DENIED`
8. Mutating `createdAt` or `problemId` during an update on `progress`. -> `PERMISSION_DENIED`
9. Oversized payload (`codePython` > 25000 chars) denial-of-wallet attack. -> `PERMISSION_DENIED`
10. Invalid enum value (`status: "hacked"` or `preferredLanguage: "rust"`). -> `PERMISSION_DENIED`
11. Modifying or deleting an immutable `recallSessions` log entry. -> `PERMISSION_DENIED`
12. Unscoped `list` query on `/users` collection. -> `PERMISSION_DENIED`
