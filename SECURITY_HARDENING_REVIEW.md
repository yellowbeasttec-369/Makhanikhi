# Security hardening review

## Scope of this change

This branch hardens Firestore access rules and requires a valid Firebase ID token on mutating Express API routes. It does not merge or deploy these changes.

## Changes made

- User profile reads are limited to the profile owner and an administrator. Firestore rules cannot hide selected fields from a document, so public mechanic discovery needs a separate curated `publicProfiles` collection.
- Client-created profiles may use the ordinary `owner`, `specialist` or `apprentice` roles so the existing onboarding flow remains usable. Admin roles remain trusted-provisioning-only. New profiles cannot self-verify or set an approved verification status.
- Profile owners cannot change role, email, UID, rating, verification flags, account flags, or document-review state through ordinary profile updates. Registration now supplies the required UID/email fields when creating the first Firestore profile, and profile hydration errors no longer leave auth readiness stuck.
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
- Verify owner, specialist and apprentice can each complete registration and read/update their own profile, but cannot assign admin, change role, self-verify, change rating/flags, or read another profile.
- Verify a specialist/apprentice cannot read another owner's vehicle, vehicle logs, private report or portfolio unless a later explicit assignment rule grants access.
- Verify only owner/assigned participants/admin can read a service request; participant reassignment is denied.
- Verify email/password login with an existing account reaches a usable authenticated route; verify a new account can register with each of the three roles; verify an already-registered email switches the UI to Sign In; verify a profile-read failure does not leave the app in an infinite loading state.
- Google sign-in still requires the deployed domain to be listed under Firebase Authentication → Settings → Authorized domains. Test both the canonical production domain and preview domain after configuration.
- Verify every mutating API returns 401 with no token, 401 with a malformed/expired token, and proceeds only with a valid token.
- Verify legitimate logged-in UI flows and notifications after the new API gate.
- Run `bun run lint` and `bun run build` in CI; do not infer success from source inspection alone.
- Confirm the Vercel deployment environment uses the same Firebase project as `firebase-applet-config.json`.

## Rollout recommendation

Review this as a security-focused pull request. Test against a staging Firebase project first; only publish Firestore rules after confirming expected application workflows. No production deployment is claimed by this branch.


## Vehicle agreements and custody record (added 2026-10-27)

- Added a dashboard Documents & Agreements area for registering a vehicle record and drafting a vehicle loan, repair-authorisation, or temporary-custody agreement.
- The vehicle record keeps the account managing the record separate from the optional legal-owner name and records that ownership remains unverified until reviewed.
- Agreement documents are readable only by the two UIDs listed as participants. Either the owner or the mechanic/custodian can initiate the agreement for a vehicle record they manage; each party can record only their own acknowledgement, once, using a server timestamp. Agreement content and participant identities cannot be changed after creation through client updates; deletion is admin-only.
- The UI warns that duplicate detection is limited to vehicles the current account can read. A platform-wide duplicate check needs a trusted server-side lookup that does not disclose private vehicle records.
- Agreement PDFs include a visible Makhanikhi watermark and a disclaimer that the document is user-generated and is not proof of ownership, legal advice, an official roadworthy certificate, or proof of payment.
- Email delivery, uploaded evidence, formal e-signature provider integration, agreement templates reviewed by counsel, job-card/invoice/warranty PDFs, persistent roadworthiness reports, and experience portfolios are not implemented by this change. Do not claim these features are live yet.

### Additional validation required for vehicle agreements

- Test with the Firestore Emulator before deploying rules: an owner can create an agreement; unrelated users cannot read it; the custodian can read and acknowledge it; the owner cannot write the custodian acknowledgement and vice versa; participant lists, vehicle reference, terms, and existing acknowledgement timestamps cannot be changed; neither participant can delete the agreement.
- Test vehicle registration for owner, specialist, and apprentice accounts; confirm ownerId remains the account that manages the record and that registration is not displayed as ownership verification.
- Confirm the generated PDF watermark is visible on every page, long terms wrap across pages, and the disclaimer remains present.
- Confirm the dashboard tab works at mobile and desktop widths and does not interrupt existing login/onboarding.
- Run TypeScript lint, production build, Firebase rules tests, and authenticated end-to-end tests before merging. Firestore rules have been edited in the feature branch only and have not been deployed.
