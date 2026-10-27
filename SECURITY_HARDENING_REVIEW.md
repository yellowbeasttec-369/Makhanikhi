# Security hardening review

## Scope of this change

This branch hardens Firestore access rules and requires a valid Firebase ID token on mutating Express API routes. It does not merge or deploy these changes.

## Changes made

- User profile reads are limited to the profile owner and an administrator. Firestore rules cannot hide selected fields from a document, so public mechanic discovery needs a separate curated `publicProfiles` collection.
- Client-created user profiles cannot assign the `admin` role.
- Profile owners cannot change role, email, UID, rating, verification flags, account flags, or document-review state through ordinary profile updates.
- Vehicle and vehicle-log records are private to the owner/admin until a more granular assignment model is implemented.
- Service requests are readable only by their owner, assigned specialist/apprentice, or an admin. Client updates cannot transfer the request to a different owner, vehicle, specialist, or apprentice.
- Workplace reports and portfolios are private to their owner/admin. Client-side updates cannot change report validation status or portfolio validation status.
- Unmatched collections are explicitly denied.
- Mutating Express API routes require a Firebase ID token verified by Firebase Identity Toolkit. The public `GET /api/mcp` discovery endpoint remains public. JSON request bodies are capped at 1 MB.
- A lightweight in-memory invalid-token throttle is included as a best-effort guard; it is not a substitute for a shared production rate limiter.

## Important residual risks

1. **Authorization is not the same as authentication.** API routes now verify that a token belongs to a real Firebase account, but not every handler binds the requested service/job/notification to that UID. In particular, notification endpoints should verify that the caller is a participant in the referenced service request before sending or logging messages.
2. **The MCP order route currently models a simulated order/escrow ledger.** It must not be represented as a real payment, purchase, blockchain transaction or courier dispatch. Before any real side effect is connected, enforce role/ownership checks, validate inputs, use idempotency keys, and use a trusted payment/escrow integration.
3. **The Firebase account lookup adds a network request to each protected API request.** Validate latency, quotas, error behavior and deployment networking before production. A trusted Firebase Admin SDK verifier is preferable when the project's package/lockfile and server credentials can be updated and tested safely.
4. **The throttle is per-process and resets on restart.** Use a shared store or platform rate limiting for production.
5. **Firestore rule changes intentionally close broad reads.** Existing screens that query all specialist profiles, read other users' vehicles, or list all service requests/reports/portfolios may stop working. Do not widen rules again to fix UI errors; introduce narrow, documented sharing/assignment paths instead.
6. **No emulator/test configuration was found during this change.** Rules compilation, positive/negative authorization tests, TypeScript checks, production build and live API smoke tests remain to be run before merging/deployment.

## Required validation before merge

- Compile/deploy rules to a non-production Firebase project or emulator first.
- Verify owner can read/update their profile, but cannot assign admin, change role, self-verify, change rating/flags, or read another profile.
- Verify a specialist/apprentice cannot read another owner's vehicle, vehicle logs, private report or portfolio unless a later explicit assignment rule grants access.
- Verify only owner/assigned participants/admin can read a service request; participant reassignment is denied.
- Verify every mutating API returns 401 with no token, 401 with a malformed/expired token, and proceeds only with a valid token.
- Verify legitimate logged-in UI flows and notifications after the new API gate.
- Run `bun run lint` and `bun run build` in CI; do not infer success from source inspection alone.
- Confirm the Vercel deployment environment uses the same Firebase project as `firebase-applet-config.json`.

## Rollout recommendation

Review this as a security-focused pull request. Test against a staging Firebase project first; only publish Firestore rules after confirming expected application workflows. No production deployment is claimed by this branch.
