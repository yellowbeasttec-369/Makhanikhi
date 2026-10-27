import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth, db } from '../lib/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { Button } from './ui/button';
import {
  Wrench, Shield, ArrowRight, UserCheck, Users, Award, Lock,
  CheckCircle2, AlertTriangle, ShieldCheck, Mail, KeyRound,
  Loader2, Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

// ─── Fix #9: Detect iframe once at module level ───────────────────────────────
const IS_IFRAME = typeof window !== 'undefined' && window.self !== window.top;

// ─── Fix #1: Demo credentials read from env vars; entire block tree-shaken in
//     production via import.meta.env.DEV (Vite replaces this with `false`).   ─
const DEMO_PRESETS = import.meta.env.DEV
  ? {
      owner: {
        email:    import.meta.env.VITE_DEMO_OWNER_EMAIL      || 'owner@makhanikhi.co.za',
        password: import.meta.env.VITE_DEMO_PASSWORD          || 'makhanikhi123!',
        name:     'Pontsho Moletsane',
        role:     'owner' as const,
        extra: {
          phone: '+27 82 123 4567',
          address: 'North District Zone 2',
          bio: 'Out-of-motor-plan car owner. Prefers micro-reconstructive maintenance protecting vehicle resale values.',
        },
      },
      specialist: {
        email:    import.meta.env.VITE_DEMO_SPECIALIST_EMAIL  || 'specialist@makhanikhi.co.za',
        password: import.meta.env.VITE_DEMO_PASSWORD          || 'makhanikhi123!',
        name:     "Sipho 'The Hands' Khumalo",
        role:     'specialist' as const,
        extra: {
          phone: '+27 83 987 6543',
          address: 'West End Hub 1',
          specialization: 'Gearbox & Engine',
          specializationBrand: 'Ford',
          isAvailable: true,
          yearsOfExperience: 12,
          bio: 'Registered master general mechanic (The Hands). Mentor in local vocational repairs for out-of-motor-plan vehicles.',
        },
      },
      apprentice: {
        email:    import.meta.env.VITE_DEMO_APPRENTICE_EMAIL  || 'apprentice@makhanikhi.co.za',
        password: import.meta.env.VITE_DEMO_PASSWORD          || 'makhanikhi123!',
        name:     "Thabo 'The Wheels' Modise",
        role:     'apprentice' as const,
        extra: {
          phone: '+27 71 456 7890',
          address: 'North District Zone 2',
          apprenticeStatus: 'awaiting-match',
          trainingPath: 'practical',
          apprenticeStartAge: 20,
          bio: 'Apprentice mechanic. Level 2 practical compliance cadet. Dedicated to GRC tracking & carbon integrity.',
        },
      },
    }
  : null;

// ─── Simple email regex ────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ─── Human-readable Firebase auth error messages ──────────────────────────────
const friendlyAuthError = (code: string): string => {
  const map: Record<string, string> = {
    'auth/user-not-found':       'No account found with this email. Please register first.',
    'auth/wrong-password':       'Incorrect password. Please try again.',
    'auth/invalid-credential':   'Incorrect email or password. Please try again.',
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/too-many-requests':    'Too many failed attempts. Please reset your password or try later.',
    'auth/invalid-email':        'Please enter a valid email address.',
  };
  return map[code] || 'Authentication failed. Please try again.';
};

export const Login: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const intendedRole = new URLSearchParams(location.search).get('role');

  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading,   setAuthLoading]   = useState(false);
  const [resetSent,     setResetSent]     = useState(false);
  const [selectedRole, setSelectedRole] = useState<'owner' | 'specialist' | 'apprentice'>(
    intendedRole === 'specialist' || intendedRole === 'pro'
      ? 'specialist'
      : intendedRole === 'apprentice'
        ? 'apprentice'
        : 'owner'
  );

  // ─── Fix #10: Don't silently redirect to /dashboard on profile-check error ──
  React.useEffect(() => {
    if (!user) return;
    const checkProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists() && snap.data()?.isProfileComplete) {
          const savedProfile = snap.data();
          if (savedProfile.role === 'owner') {
            // Older builds could mark an owner complete before the separate vehicle write succeeded.
            // Route that partial state back to vehicle registration instead of stranding the user on the dashboard.
            const ownedVehicles = await getDocs(
              query(collection(db, 'vehicles'), where('ownerId', '==', user.uid))
            );
            if (ownedVehicles.empty) {
              localStorage.setItem('makhanikhi_session_role', 'owner');
              navigate('/register?role=owner');
              return;
            }
          }
          navigate('/dashboard');
        } else {
          const storedRole = localStorage.getItem('makhanikhi_session_role');
          navigate(`/register?role=${selectedRole || storedRole || 'owner'}`);
        }
      } catch (err) {
        console.error('Profile check error:', err);
        toast.error('Could not verify your profile. Please try signing in again.');
      }
    };
    checkProfile();
  }, [user, navigate, intendedRole, selectedRole]);

  // ─── Fix #2 / #6: Separate sign-in path (existing users only) ────────────────
  const handleSignIn = async (emailInput: string, passInput: string) => {
    setAuthLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, emailInput, passInput);
      toast.success(`Dumela! Welcome back, ${cred.user.displayName || cred.user.email}`);
    } catch (err: any) {
      toast.error(friendlyAuthError(err.code));
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Fix #2 / #6: Separate registration path (new users only) ────────────────
  const handleRegister = async (emailInput: string, passInput: string, role: string) => {
    setAuthLoading(true);
    try {
      localStorage.setItem('makhanikhi_session_role', role);
      await createUserWithEmailAndPassword(auth, emailInput, passInput);
      toast.success("Account created! Let's complete your profile.");
      // onAuthStateChanged fires → useEffect above handles redirect to /register
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setIsRegistering(false);
        toast.error('An account already uses this email. We switched to Sign In—enter the password for that account, or use Forgot Password.');
      } else {
        toast.error(friendlyAuthError(err.code));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // ─── Fix #1 / #3 / #4 / #5: Demo preset — dev only, corrected profile flags ─
  const handlePresetLogin = async (key: 'owner' | 'specialist' | 'apprentice') => {
    if (!DEMO_PRESETS) return;
    const preset = DEMO_PRESETS[key];
    setAuthLoading(true);
    localStorage.setItem('makhanikhi_session_role', preset.role);

    try {
      let credential;
      try {
        credential = await signInWithEmailAndPassword(auth, preset.email, preset.password);
      } catch {
        credential = await createUserWithEmailAndPassword(auth, preset.email, preset.password);
      }

      const u           = credential.user;
      const userDocRef  = doc(db, 'users', u.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Fix #3 & #4: isVerified false, verificationStatus pending, no fake placeholder data
        // Fix #5: isProfileComplete true only because preset profiles ARE fully seeded
        await setDoc(userDocRef, {
          uid:                u.uid,
          email:              preset.email,
          displayName:        preset.name,
          role:               preset.role,
          isProfileComplete:  true,
          isVerified:         false,
          verificationStatus: 'pending',
          createdAt:          new Date().toISOString(),
          ...preset.extra,
        });
      }

      toast.success(`Demo: Signed in as ${preset.name}`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Demo login failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset stale role state and return focus to the role gateway without sending users to the marketing page.
  const handleChangeRole = () => {
    localStorage.removeItem('makhanikhi_session_role');
    setSelectedRole('owner');
    setIsRegistering(false);
    setResetSent(false);
    navigate('/login#role-choice-heading');
    window.requestAnimationFrame(() => {
      document.getElementById('role-choice-heading')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  // ─── Fix #8: Client-side validation + Fix #6: route to correct handler ────────
  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      toast.error('Email and password are required.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    const role = selectedRole;
    if (isRegistering) {
      await handleRegister(trimmedEmail, password, role);
    } else {
      await handleSignIn(trimmedEmail, password);
    }
  };

  // ─── Fix #7: Forgot password ──────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error('Enter your email address above, then click Forgot Password.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      toast.error('Please enter a valid email address first.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setResetSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      toast.error(err.message || 'Could not send reset email. Please try again.');
    }
  };

  // ─── Fix #9: IS_IFRAME is now a module-level constant ─────────────────────────
  const handleGoogleLogin = async () => {
    try {
      localStorage.setItem('makhanikhi_session_role', selectedRole);
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error: any) {
      if (
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/popup-closed-by-user'
      ) return;
      console.error('Google login popup failed:', error);
      if (error.code === 'auth/unauthorized-domain') {
        toast.error(
          'Google sign-in is not enabled for this domain yet. Use email and password for now; the site owner must add this domain in Firebase Authentication settings.',
          { duration: 10000 },
        );
      } else if (IS_IFRAME || error.code === 'auth/popup-blocked') {
        toast.error(
          'Google sign-in may be blocked inside an embedded preview. Open Makhanikhi directly in a new browser tab and try again, or use email and password.',
          { duration: 10000 },
        );
      } else {
        toast.error(`Google sign-in failed: ${friendlyAuthError(error.code)}`);
      }
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center py-6 sm:py-12 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-technic-yellow/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-technic-yellow/5 rounded-full blur-[128px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 relative z-10"
      >
        {/* Login Section - Left (7 Cols) */}
        <div className="lg:col-span-7 bento-card p-5 sm:p-8 md:p-10 flex flex-col justify-between h-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-technic-yellow/10 border border-technic-yellow/20 text-technic-yellow text-[10px] font-bold uppercase tracking-widest mb-6">
              <Lock className="w-3 h-3" /> Digital Registry Access Gate
            </div>
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter mb-2 text-digital-white leading-none">
              {intendedRole === 'pro' ? 'Technical' : intendedRole === 'owner' ? 'Car Owner' : 'Makhanikhi'} <br />
              <span className="text-technic-yellow">Secure Access</span>
            </h1>
            <p className="text-text-dim text-xs mb-6 max-w-md leading-relaxed">
              Create an account or sign in. Choose how you will use Makhanikhi first; you can use email and password even if Google sign-in is unavailable.
            </p>

            {/* ── Fix #1: Preset grid only rendered in dev builds ──────────── */}
            {DEMO_PRESETS && (
              <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-xs font-black uppercase tracking-wider text-technic-yellow mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 1-Click Sandbox Presets (Dev Only)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={() => handlePresetLogin('owner')}
                    className="p-3 bg-industrial-charcoal border border-white/10 hover:border-technic-yellow/40 hover:bg-white/5 transition-all rounded-xl text-left flex flex-col justify-between h-24"
                  >
                    <UserCheck className="w-4 h-4 text-technic-yellow" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-white truncate">Pontsho (Owner)</p>
                      <p className="text-[8px] text-text-dim mt-0.5">Out-Of-Plan Cars</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={() => handlePresetLogin('specialist')}
                    className="p-3 bg-industrial-charcoal border border-white/10 hover:border-technic-yellow/40 hover:bg-white/5 transition-all rounded-xl text-left flex flex-col justify-between h-24"
                  >
                    <Wrench className="w-4 h-4 text-technic-yellow" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-white truncate">Sipho (Specialist)</p>
                      <p className="text-[8px] text-text-dim mt-0.5">The Hands - Ford Master</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={() => handlePresetLogin('apprentice')}
                    className="p-3 bg-industrial-charcoal border border-white/10 hover:border-technic-yellow/40 hover:bg-white/5 transition-all rounded-xl text-left flex flex-col justify-between h-24"
                  >
                    <Users className="w-4 h-4 text-technic-yellow" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-white truncate">Thabo (Apprentice)</p>
                      <p className="text-[8px] text-text-dim mt-0.5">The Wheels - Grade 1</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl border border-white/10 bg-white/[0.03]" aria-label="Account access mode">
              <button
                type="button"
                aria-pressed={isRegistering}
                onClick={() => { setIsRegistering(true); setResetSent(false); }}
                className={`rounded-lg py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${isRegistering ? 'bg-technic-yellow text-industrial-charcoal' : 'text-text-dim hover:text-white'}`}
              >
                Create New Account
              </button>
              <button
                type="button"
                aria-pressed={!isRegistering}
                onClick={() => { setIsRegistering(false); setResetSent(false); }}
                className={`rounded-lg py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${!isRegistering ? 'bg-technic-yellow text-industrial-charcoal' : 'text-text-dim hover:text-white'}`}
              >
                Existing User: Sign In
              </button>
            </div>

            <section aria-labelledby="role-choice-heading" className="mb-6">
              <h2 id="role-choice-heading" className="text-xs font-black uppercase tracking-widest text-white mb-3">
                {isRegistering ? '1. I am joining as a…' : 'Choose your role to continue'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {([
                  { value: 'owner', title: 'Vehicle Owner', detail: 'Request vehicle care', icon: UserCheck },
                  { value: 'specialist', title: 'Mechanic / Specialist', detail: 'Offer repair services', icon: Wrench },
                  { value: 'apprentice', title: 'Apprentice', detail: 'Learn with a mentor', icon: Users },
                ] as const).map(({ value, title, detail, icon: RoleIcon }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selectedRole === value}
                    onClick={() => setSelectedRole(value)}
                    className={`rounded-xl border p-3 text-left transition-colors ${selectedRole === value ? 'border-technic-yellow bg-technic-yellow/10' : 'border-white/10 bg-white/[0.02] hover:border-white/30'}`}
                  >
                    <RoleIcon className="w-4 h-4 text-technic-yellow mb-2" />
                    <span className="block text-[10px] font-black uppercase text-white">{title}</span>
                    <span className="block text-[9px] text-text-dim mt-1">{detail}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Direct Email/Password Inputs */}
            <form onSubmit={handleManualAuth} className="space-y-4 mb-4" noValidate>
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-black text-text-dim tracking-widest block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-text-dim" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.co.za"
                    autoComplete="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-10 pl-10 pr-4 text-xs font-mono text-white focus:border-technic-yellow/40 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-black text-text-dim tracking-widest block">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-text-dim" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete={isRegistering ? 'new-password' : 'current-password'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-10 pl-10 pr-4 text-xs font-mono text-white focus:border-technic-yellow/40 outline-none transition-colors"
                  />
                </div>
                {/* ── Fix #8: Show min-length hint when registering ── */}
                {isRegistering && (
                  <p className="text-[9px] text-text-dim pl-1">Minimum 6 characters</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={authLoading}
                className="w-full bg-white/5 border border-white/10 hover:bg-white hover:text-industrial-charcoal text-white font-black h-11 text-xs rounded-xl uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> DISPATCHING SECURE GATEWAY...
                  </>
                ) : isRegistering ? (
                  `CREATE ${selectedRole === 'owner' ? 'OWNER' : selectedRole === 'specialist' ? 'SPECIALIST' : 'APPRENTICE'} ACCOUNT`
                ) : (
                  "SIGN IN"
                )}
              </Button>
            </form>

            {/* ── Fix #7: Forgot password ────────────────────────────────── */}
            {!isRegistering && (
              <div className="mb-4 text-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetSent || authLoading}
                  className="text-[9px] uppercase tracking-widest font-black text-text-dim hover:text-technic-yellow transition-colors disabled:opacity-40"
                >
                  {resetSent ? '✓ Reset Email Sent — Check Your Inbox' : 'Forgot Password?'}
                </button>
              </div>
            )}

            <div className="border-t border-white/5 pt-4 text-[10px] text-text-dim">
              {isRegistering
                ? 'Creating an account is for new users. If you have registered before, choose “Existing User: Sign In” above.'
                : 'New to Makhanikhi? Choose “Create New Account” above to register with your selected role.'}
            </div>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleChangeRole}
                className="text-[10px] uppercase tracking-widest font-black text-text-dim hover:text-technic-yellow transition-colors"
              >
                Change role / choose account type
              </button>
            </div>
          </div>

          <div className="space-y-4 mt-8 pt-6 border-t border-white/5">
            <div className="p-3.5 bg-red-500/5 border border-red-500/20 rounded-xl text-[10px] text-red-200 tracking-wider font-mono flex items-start gap-2.5 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-technic-yellow shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-black uppercase">Browser Security Block:</strong> Standard Google login popups do not show up inside iframes. For a seamless experience, please click any of our <strong>1-Click Sandbox Presets</strong> above, or sign in using a custom email and password. If you want to use Google login, please open the app in a new tab!
              </div>
            </div>
            <Button 
              type="button"
              onClick={handleGoogleLogin} 
              disabled={authLoading}
              className="w-full bg-technic-yellow text-industrial-charcoal hover:bg-technic-yellow/90 font-black h-12 text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,210,0,0.1)]"
            >
              Secure Sign In with Google <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Circularity & Simplified Copy - Right (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          <div className="p-5 sm:p-8 rounded-2xl bg-success-green/5 border border-success-green/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-24 h-24 text-success-green" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-green/20 text-success-green text-[9px] font-black uppercase tracking-widest mb-6">
                Avoided Scrap
              </div>
              <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-4 text-digital-white">
                🌱 Direct <span className="text-success-green">Circularity</span>
              </h3>
              <p className="text-text-dim text-xs leading-relaxed mb-6">
                Stop discarding entire sub-assemblies. When a gearbox experiences wear, you replace a 150g carbon-steel bearing instead of scrapping the whole 35kg unit.
              </p>
              <div className="font-mono text-[10px] bg-white/5 border border-white/10 p-4 rounded-xl text-success-green">
                <strong>PoP Carbon Saved (Average):</strong> 64.47kg CO₂ avoided per service request by protecting existing metal assets.
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 rounded-2xl bg-technic-yellow/5 border border-technic-yellow/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wrench className="w-24 h-24 text-technic-yellow" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-technic-yellow/20 text-technic-yellow text-[9px] font-black uppercase tracking-widest mb-6">
                Eligible Vehicles
              </div>
              <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-4 text-digital-white">
                Out Of <span className="text-technic-yellow">Motor Plan</span>
              </h3>
              <p className="text-text-dim text-xs leading-relaxed">
                As long as your vehicle is out of its original manufacturer motor plan or service warranty, it qualifies for Makhanikhi's premium mobile specialist care.
              </p>
              <ul className="mt-4 space-y-2 text-[10.5px] font-bold uppercase tracking-wider text-white">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-technic-yellow shrink-0" /> Compacts & Sedans</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-technic-yellow shrink-0" /> Utilities, Rangers & NP200s</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-technic-yellow shrink-0" /> Any Make, Model, or SUV</li>
              </ul>
              <p className="text-[10px] text-text-dim mt-4 leading-relaxed italic">
                Provided there is a willingness to invest in high-grade proactive asset preservation.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-8 rounded-2xl bg-blue-500/5 border border-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-24 h-24 text-blue-500" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest mb-6">
                Ubuntu Protocol
              </div>
              <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-4 text-digital-white">
                Driveway <span className="text-blue-400">Hospitality</span>
              </h3>
              <p className="text-text-dim text-xs leading-relaxed">
                A cup of tea, cold drink, or lunch shared on the driveway shows great community spirit. It doesn't replace or discount the specialist's cash payment, but we record it to boost your rating as an awesome car owner to work with!
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trust Badges */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 flex flex-wrap justify-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"
      >
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[3px]">Verified Professionals</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[3px]">Expert Protection</span>
        </div>
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[3px]">Validated Identities</span>
        </div>
      </motion.div>
    </div>
  );
};

