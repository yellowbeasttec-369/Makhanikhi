import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Wrench, Shield, ArrowRight, UserCheck, Users, Award, Lock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const intendedRole = queryParams.get('role');

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

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const isIframe = window.self !== window.top;

    try {
      if (intendedRole) {
        localStorage.setItem('makhanikhi_session_role', intendedRole);
      }
      
      // Use signInWithPopup - it's generally more reliable in the AI Studio environment
      // IF the user allows popups.
      await signInWithPopup(auth, provider);
      
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        return;
      }
      
      console.error('Login failed:', error);
      
      if (isIframe) {
        if (error.code === 'auth/unauthorized-domain') {
          toast.error("This domain is NOT authorized in Firebase. Please add the preview URL to your Firebase Console (Authentication > Settings > Authorized domains).", {
            duration: 15000,
          });
        } else {
          toast.error("Login popup failed in the preview window. For security, Google Auth requires a new tab in some browsers.", {
            duration: 10000,
            action: {
              label: "Open in New Tab",
              onClick: () => window.open(window.location.href, '_blank')
            }
          });
        }
      } else {
        toast.error(`Login failed: ${error.message || "Please try again."}`);
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
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
      >
        {/* Login Section */}
        <div className="bento-card flex flex-col justify-between p-10 h-full">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-technic-yellow/10 border border-technic-yellow/20 text-technic-yellow text-[10px] font-bold uppercase tracking-widest mb-8">
              <Lock className="w-3 h-3" /> Digital Registry Access
            </div>
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter mb-4 text-digital-white">
              {intendedRole === 'pro' ? 'Technical' : intendedRole === 'owner' ? 'Car Owner' : 'Command'} <br />
              <span className="text-technic-yellow">Center Login</span>
            </h1>
            <p className="text-text-dim text-sm mb-10 max-w-xs leading-relaxed">
              Sign in to secure your workplace, validate your value, and access the digital registry.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleLogin} 
              className="w-full bg-technic-yellow text-industrial-charcoal hover:bg-technic-yellow/90 font-black h-14 text-xs sm:text-sm rounded-xl uppercase tracking-wider sm:tracking-widest shadow-[0_0_20px_rgba(255,210,0,0.15)] group px-2 sm:px-4"
            >
              Secure Login with Google <ArrowRight className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <div className="flex justify-center gap-4 py-2">
               <Link to="/" className="text-[10px] text-text-dim uppercase tracking-widest font-bold hover:text-technic-yellow transition-colors">
                 Change Role Selection
               </Link>
            </div>
          </div>
        </div>

        {/* Info/Expert Protection Section */}
        <div className="space-y-6">
          <div className="p-8 rounded-[32px] bg-success-green/5 border border-success-green/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-24 h-24 text-success-green" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-green/20 text-success-green text-[9px] font-black uppercase tracking-widest mb-6">
                Zero Suspicion
              </div>
              <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-4 text-digital-white">
                Eliminate <span className="text-success-green">Disputes</span>
              </h3>
              <p className="text-text-dim text-sm leading-relaxed mb-6">
                Specialists capture part receipts and photo evidence in real-time. Even if physical slips are non-itemized, our digital chain of custody validates every cent for total car owner peace of mind.
              </p>
            </div>
          </div>

          <div className="p-8 rounded-[32px] bg-red-500/5 border border-red-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertTriangle className="w-24 h-24 text-red-500" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest mb-6">
                Protecting Talent
              </div>
              <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-4 text-digital-white">
                No More <span className="text-red-500">Unpaid</span> Expert Work
              </h3>
              <p className="text-text-dim text-sm leading-relaxed mb-6">
                Tired of unpaid emergency calls? Makhanikhi ensures your value is validated upfront and your time is compensated fairly through our secure registry.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-digital-white/80">
                  <CheckCircle2 className="w-4 h-4 text-success-green shrink-0" /> Verified Expert Valuation
                </div>
                <div className="flex items-center gap-3 text-xs text-digital-white/80">
                  <CheckCircle2 className="w-4 h-4 text-success-green shrink-0" /> Secure Upfront Documentation
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[32px] bg-blue-500/5 border border-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield className="w-24 h-24 text-blue-500" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest mb-6">
                Safety First
              </div>
              <h3 className="text-2xl font-display font-black uppercase tracking-tight mb-4 text-digital-white">
                Trusted Talent <br /> <span className="text-blue-400">Near Home</span>
              </h3>
              <p className="text-text-dim text-sm leading-relaxed">
                Found incompetence in "the street"? No more. We professionalize local experts with admin tools and verified records, bringing service-center quality to your neighborhood.
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
