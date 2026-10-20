# Makhanikhi Codebase Audit — Non-Login Issues

## 🔴 Critical / Security

### 1. Firestore rules — anyone can read all user profiles
**File:** [firestore.rules L59](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/firestore.rules#L59)
```
allow read: if isAuthenticated();
```
Any authenticated user can read **every user's profile**, including ID numbers, phone numbers, DOBs, and emergency contacts. The read rule should be scoped to the owner or admin, with a narrower public view function for specialist listings.

---

### 2. Firestore rules — any authenticated specialist/apprentice can update any vehicle
**File:** [firestore.rules L67, L73](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/firestore.rules#L64-L74)
```
allow update: if isAuthenticated() && (isOwner(...) || hasRole('specialist') || hasRole('apprentice'));
```
Any specialist or apprentice can update **any vehicle**, not just those on their active service requests. An apprentice could silently alter another owner's service history.

---

### 3. Firestore rules — no explicit `delete` rules defined
**File:** [firestore.rules](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/firestore.rules)
No collection has a `delete` rule. Firestore defaults to deny, which is safe — but it's implicit. If the rules file is ever partially regenerated, this silent assumption could become a gap.

---

### 4. Hardcoded admin email in Firestore rules
**File:** [firestore.rules L31](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/firestore.rules#L31)
```
request.auth.token.email == "yellowbeasttech@gmail.com"
```
The admin email is baked into the security rules. If this email changes or is compromised, rules must be manually redeployed. The `role: 'admin'` path already handles this — the email bypass is redundant and a liability.

---

### 5. `(window as any).ethereum` bypasses the typed declaration
**File:** [Navbar.tsx L20](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/components/Navbar.tsx#L20)
```ts
const ethereum = (window as any).ethereum;
```
`types.ts` already declares `Window.ethereum?: any` (line 324). The Navbar casts to `any` independently, meaning TypeScript can never catch invalid method calls like `ethereum.request(...)`.

---

### 6. `IS_IFRAME` computed three times inside the same function
**File:** [Navbar.tsx L24, L39, L57](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/components/Navbar.tsx#L24-L57)
`window.self !== window.top` is evaluated at three separate points in `connectWallet`. Should be a module-level constant (same pattern was fixed in Login.tsx).

---

## 🟡 Data Integrity / Logic Bugs

### 7. Mock rating hardcoded to 4.8 stored to Firestore
**File:** [Dashboard.tsx L124](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/components/Dashboard.tsx#L124)
```ts
specialistRating: 4.8, // Mock rating
```
Every offer carries a static 4.8 rating written to Firestore. `profile.rating` should be used instead. Owners are being shown inflated, misleading ratings.

---

### 8. Specialist availability set permanently to `false` after job acceptance
**File:** [Dashboard.tsx L159](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/components/Dashboard.tsx#L159)
```ts
await updateDoc(specialistRef, { isAvailable: false });
// Comment in code: "Simple toggle, ideally date-based"
```
Once set to `false`, there is no automatic reset. The specialist stays indefinitely unavailable unless they manually toggle it back.

---

### 9. Mentor profile fetched via collection scan instead of direct `getDoc`
**File:** [Dashboard.tsx L90](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/components/Dashboard.tsx#L90)
```ts
const q = query(collection(db, 'users'), where('uid', '==', profile.mentorId));
const querySnapshot = await getDocs(q);
```
`mentorId` **is** the Firestore document ID. This runs a full collection scan when a single `getDoc(doc(db, 'users', profile.mentorId))` would be instant and free.

---

### 10. `vehicle.year` stored as string, typed as `number` in `types.ts`
**File:** [RegistrationFlow.tsx L64](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/components/RegistrationFlow.tsx#L64), [types.ts L52](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/types.ts#L52)
```ts
vehicle: { make: '', model: '', year: '', registration: '' }  // year is a string
// But Vehicle interface says:
year: number;
```
The form stores year as a plain string and never parses it before writing to Firestore, creating a silent type mismatch.

---

### 11. No form validation in `RegistrationFlow` before saving to Firestore
**File:** [RegistrationFlow.tsx L86-L148](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/components/RegistrationFlow.tsx#L86-L148)
`handleCompleteRegistration` writes to Firestore with no checks. `displayName`, `phone`, and `address` can all be empty strings. The Firestore `isValidUser` rule only validates `uid`, `email`, and `role`, so blank profiles pass silently.

---

### 12. `offer: any` instead of typed `ServiceOffer`
**File:** [Dashboard.tsx L142](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/components/Dashboard.tsx#L142)
```ts
const handleApproveReferral = async (requestId: string, offer: any) => {
```
The `ServiceOffer` type exists in `types.ts` and should be used here. TypeScript won't catch misuse of `offer.specialistId` or financial fields.

---

## 🟡 Architecture / UX Issues

### 13. `ProtectedRoute` loading spinner is now dead code
**File:** [App.tsx L18-L19](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/App.tsx#L18-L19)
```tsx
const { user, loading } = useAuth();
if (loading) return <div>MAKHANIKHI...</div>;
```
After the AuthContext fix (provider returns `null` until `isAuthReady`), children are never rendered while auth resolves. The `loading` spinner in `ProtectedRoute` is unreachable. Switch to using `isAuthReady` explicitly.

---

### 14. Navbar has a duplicate Google sign-in with no role assignment or profile redirect
**File:** [Navbar.tsx L68-L80](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/components/Navbar.tsx#L68-L80)
A completely separate Google sign-in lives in the Navbar. It authenticates the user but never stores `makhanikhi_session_role` or checks for a Firestore profile. A new user clicking "Login" in the Navbar gets authenticated but stranded — their `/register` redirect never fires.

---

### 15. Cancel during `RegistrationFlow` strands users with incomplete profiles
**File:** [RegistrationFlow.tsx L80](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/components/RegistrationFlow.tsx#L80)
```ts
const handleCancel = () => navigate('/');
```
A user who cancels mid-registration is sent home as an authenticated-but-profile-incomplete user. Every future visit will redirect them back to `/register`. There is no "cancel and delete account" escape hatch.

---

### 16. `gemini.ts` service calls carry no auth headers
**File:** [gemini.ts](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/services/gemini.ts)
All five service functions hit internal `/api/*` routes with no `Authorization: Bearer <token>` header. Anyone who discovers an endpoint can call `POST /api/ai/generate-contract` without authentication.

---

## 🟢 TypeScript / Code Quality

### 17. `timestamp: any` used throughout `types.ts`
**File:** [types.ts L259, L273-L275, L290](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/types.ts#L259-L275)
```ts
specialistSignOff?: { uid: string; timestamp: any; };
signatures: { specialist?: { uid: string; timestamp: any }; };
```
`timestamp` should be typed as `string` (ISO 8601) or Firebase's `Timestamp`. Using `any` bypasses all safety on time-sensitive audit fields.

---

### 18. Widespread `: any` in escrow and financial components
**Files:** `Dashboard.tsx`, `RegistrationFlow.tsx`, `SmartEscrow.tsx`, `SkillsValidation.tsx`
Multiple `: any` annotations appear in components that handle financial calculations, escrow state, and compliance scoring. A type error in payment or compliance logic is invisible at compile time.

---

### 19. Raw `console.error(error)` with no message extraction
**File:** [RegistrationFlow.tsx L143](file:///Users/pontshomoletsane/Documents/GitHub/Makhanikhi/src/components/RegistrationFlow.tsx#L143)
```ts
} catch (error) {
  console.error(error);   // raw object
  toast.error("Failed to save profile.");
}
```
The error is logged as a raw object rather than `error.message`. On production builds or mobile, this makes debugging virtually impossible.

---

## Summary Table

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | 🔴 | `firestore.rules` | All users can read all profiles (PII exposure) |
| 2 | 🔴 | `firestore.rules` | Any specialist/apprentice can update any vehicle |
| 3 | 🔴 | `firestore.rules` | No explicit `delete` rules |
| 4 | 🔴 | `firestore.rules` | Hardcoded admin email |
| 5 | 🔴 | `Navbar.tsx` | `(window as any).ethereum` bypasses typed declaration |
| 6 | 🟡 | `Navbar.tsx` | `IS_IFRAME` computed 3× in same function |
| 7 | 🟡 | `Dashboard.tsx` | Hardcoded `4.8` mock rating stored to Firestore |
| 8 | 🟡 | `Dashboard.tsx` | Specialist availability permanently set to `false` |
| 9 | 🟡 | `Dashboard.tsx` | Collection scan for mentor profile instead of `getDoc` |
| 10 | 🟡 | `RegistrationFlow.tsx` | `vehicle.year` stored as string, typed as `number` |
| 11 | 🟡 | `RegistrationFlow.tsx` | No validation before writing profile to Firestore |
| 12 | 🟡 | `Dashboard.tsx` | `offer: any` instead of typed `ServiceOffer` |
| 13 | 🟡 | `App.tsx` | `ProtectedRoute` loading spinner is now dead code |
| 14 | 🟡 | `Navbar.tsx` | Duplicate Google sign-in with no profile redirect |
| 15 | 🟡 | `RegistrationFlow.tsx` | Cancel leaves authenticated, incomplete-profile users stranded |
| 16 | 🟡 | `gemini.ts` | API calls missing Firebase auth headers |
| 17 | 🟢 | `types.ts` | `timestamp: any` on audit/signature fields |
| 18 | 🟢 | Multiple | Widespread `: any` in financial/escrow components |
| 19 | 🟢 | `RegistrationFlow.tsx` | Raw `console.error(error)` object with no message extraction |
