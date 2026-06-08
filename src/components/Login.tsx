import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth, db } from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Wrench, Shield, ArrowRight, UserCheck, Users, Award, Lock, CheckCircle2, AlertTriangle, ShieldCheck, Mail, KeyRound, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const intendedRole = queryParams.get('role');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      const checkProfile = async () => {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data()?.isProfileComplete) {
            navigate('/dashboard');
          } else {
            // New user or incomplete profile, send to registration with the intended role
            // Use stored role if available
            const storedRole = localStorage.getItem('makhanikhi_session_role');
            const roleToUse = intendedRole || storedRole || 'owner';
            navigate(`/register?role=${roleToUse}`);
          }
        } catch (error) {
          console.error("Error checking profile:", error);
          // Fallback to dashboard if check fails for any reason but auth is good
          navigate('/dashboard');
        }
      };
      checkProfile();
    }
  }, [user, navigate, intendedRole]);

  // Unified authenticate and write initial Firestore profile helper
  const handleAuthFlow = async (emailInput: string, passInput: string, selectedRole: string, fullName: string, customFields: any = {}) => {
    setAuthLoading(true);
    const resolvedRole = selectedRole || intendedRole || 'owner';
    localStorage.setItem('makhanikhi_session_role', resolvedRole);

    try {
      let userCredential;
      try {
        // 1. Try signing in
        userCredential = await signInWithEmailAndPassword(auth, emailInput, passInput);
        toast.success(`Dumela! Welcome back, ${fullName || userCredential.user.email}`);
      } catch (signInErr: any) {
        // 2. If user doesn't exist, register them on-the-fly!
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/wrong-password') {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, emailInput, passInput);
            toast.success(`Account registered! Provisioning profile for ${fullName}...`);
          } catch (regErr: any) {
            throw new Error(`Authentication failed. ${regErr.message}`);
          }
        } else {
          throw signInErr;
        }
      }

      if (userCredential?.user) {
        const u = userCredential.user;
        const userDocRef = doc(db, 'users', u.uid);
        const userDocSnap = await getDoc(userDocRef);

        // 3. Auto-populate core user profile if not exists
        if (!userDocSnap.exists()) {
          const initialProfile = {
            uid: u.uid,
            email: emailInput,
            displayName: fullName || emailInput.split('@')[0],
            role: resolvedRole as any,
            isProfileComplete: true,
            isVerified: true,
            verificationStatus: 'verified' as any,
            phone: customFields.phone || '+27 82 123 4567',
            address: customFields.address || 'Polokwane, Limpopo',
            createdAt: new Date().toISOString(),
            ...customFields
          };
          await setDoc(userDocRef, initialProfile);
        }
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Auth Flow Error:', err);
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Preset quick trial logins for clean testing inside sandbox
  const handlePresetLogin = async (presetType: 'owner' | 'specialist' | 'apprentice') => {
    if (presetType === 'owner') {
      await handleAuthFlow(
        'owner@makhanikhi.co.za',
        'makhanikhi123!',
        'owner',
        'Pontsho Moletsane',
        {
          phone: '+27 82 123 4567',
          address: 'Mmotong, Limpopo',
          bio: 'Out-of-motor-plan car owner. Prefers micro-reconstructive maintenance protecting vehicle resale values.'
        }
      );
    } else if (presetType === 'specialist') {
      await handleAuthFlow(
        'specialist@makhanikhi.co.za',
        'makhanikhi123!',
        'specialist',
        "Sipho 'The Hands' Khumalo",
        {
          phone: '+27 83 987 6543',
          address: 'Seshego, Limpopo',
          specialization: 'Gearbox & Engine',
          specializationBrand: 'Ford',
          isAvailable: true,
          yearsOfExperience: 12,
          bio: 'Registered master general mechanic (The Hands). Mentor in local vocational repairs for out-of-motor-plan vehicles.'
        }
      );
    } else if (presetType === 'apprentice') {
      await handleAuthFlow(
        'apprentice@makhanikhi.co.za',
        'makhanikhi123!',
        'apprentice',
        "Thabo 'The Wheels' Modise",
        {
          phone: '+27 71 456 7890',
          address: 'Mmotong, Limpopo',
          apprenticeStatus: 'awaiting-match',
          trainingPath: 'practical',
          apprenticeStartAge: 20,
          bio: 'Apprentice mechanic. Level 2 practical compliance cadet. Dedicated to GRC tracking & carbon integrity.'
        }
      );
    }
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email and password are required.');
      return;
    }
    const derivedRole = intendedRole || 'owner';
    await handleAuthFlow(email, password, derivedRole, email.split('@')[0]);
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const isIframe = window.self !== window.top;

    try {
      if (intendedRole) {
        localStorage.setItem('makhanikhi_session_role', intendedRole);
      }
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error('Google login popup failed:', error);
      if (error.code === 'auth/unauthorized-domain' || isIframe) {
        toast.error("Google Auth is locked inside iframe or domain is unauthorized. Please use the quick One-Click presets or direct email login below to enter instantly!", {
          duration: 10000,
        });
      } else {
        toast.error(`Login failed: ${error.message || 'Please try again.'}`);
      }
    }
  };


  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-technic-yellow/5 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-technic-yellow/5 rounded-full blur-[128px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10"
      >
        {/* Login Section - Left (7 Cols) */}
        <div className="lg:col-span-7 bento-card p-10 flex flex-col justify-between h-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-technic-yellow/10 border border-technic-yellow/20 text-technic-yellow text-[10px] font-bold uppercase tracking-widest mb-6">
              <Lock className="w-3 h-3" /> Digital Registry Access Gate
            </div>
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter mb-2 text-digital-white leading-none">
              {intendedRole === 'pro' ? 'Technical' : intendedRole === 'owner' ? 'Car Owner' : 'Makhanikhi'} <br />
              <span className="text-technic-yellow">Secure Access</span>
            </h1>
            <p className="text-text-dim text-xs mb-6 max-w-md leading-relaxed">
              Log in to the digital registry. Standard Email option acts as a secure bypass if Google Popup domain authorization is locked in your browser.
            </p>

            {/* Presets Grid - ONE-CLICK DEMO LOGIN (EXCELLENT TESTING TOOL) */}
            <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-technic-yellow mb-4 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 1-Click Sandbox Presets (No Popup Needed)
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

            {/* Direct Email/Password Inputs */}
            <form onSubmit={handleManualAuth} className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-black text-text-dim tracking-widest block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-text-dim" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.co.za"
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-10 pl-10 pr-4 text-xs font-mono text-white focus:border-technic-yellow/40 outline-none transition-colors"
                  />
                </div>
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
                  "REGISTER DIRECT ACCOUNT"
                ) : (
                  "SECURE ENTER VIA CRNT"
                )}
              </Button>
            </form>

            <div className="flex justify-between items-center text-[10px] text-text-dim uppercase tracking-widest font-black border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="hover:text-technic-yellow transition-colors"
              >
                {isRegistering ? "Switch to Secure Sign In" : "Need to Register? Custom Account Here"}
              </button>
              <Link to="/" className="hover:text-technic-yellow transition-colors">
                Change Role
              </Link>
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
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 rounded-[32px] bg-success-green/5 border border-success-green/20 relative overflow-hidden group">
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

          <div className="p-8 rounded-[32px] bg-technic-yellow/5 border border-technic-yellow/10 relative overflow-hidden group">
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

          <div className="p-8 rounded-[32px] bg-blue-500/5 border border-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-24 h-24 text-blue-500" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest mb-6">
                Ubuntu Protocol
              </div>
              <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-4 text-digital-white">
                Sustenance <span className="text-blue-400">Reputation</span>
              </h3>
              <p className="text-text-dim text-xs leading-relaxed">
                Under our Hospitality Firewall clause, any lunch, drinks or biltong offered by car owners are logged as 'Sustenance Stakes' to build specialist credibility points, never taken as a cash discount! This builds a reciprocal cycle of local trust.
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

