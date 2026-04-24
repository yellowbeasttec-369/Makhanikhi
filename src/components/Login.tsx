import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from './ui/button';
import { Wrench, Shield, ArrowRight, User, Users, Award, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (error: any) {
      // Gracefully handle popup cancellation/closed errors
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error('Login failed', error);
      toast.error("Login failed. Please try again.");
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
              <Lock className="w-3 h-3" /> Secure Access
            </div>
            <h1 className="text-4xl font-display font-black uppercase tracking-tighter mb-4 text-digital-white">
              Command <br />
              <span className="text-technic-yellow">Center Login</span>
            </h1>
            <p className="text-text-dim text-sm mb-10 max-w-xs leading-relaxed">
              Access your digital wrench, service logs, and specialist dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleLogin} 
              className="w-full bg-technic-yellow text-industrial-charcoal hover:bg-technic-yellow/90 font-black h-14 text-sm rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(255,210,0,0.15)] group"
            >
              Sign in with Google <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-[10px] text-center text-text-dim uppercase tracking-widest font-bold">
              By logging in, you agree to our <span className="text-technic-yellow underline">Terms of Service</span>
            </p>
          </div>
        </div>

        {/* Info/Onboarding Options */}
        <div className="space-y-6">
          <div className="bento-card border-l-4 border-l-technic-yellow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-technic-yellow/10 flex items-center justify-center shrink-0">
                <Wrench className="w-6 h-6 text-technic-yellow" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight text-lg mb-1">Mechanic Onboarding</h3>
                <p className="text-xs text-text-dim leading-relaxed mb-4">Master technicians providing mobile services. Join our elite specialist network.</p>
                <Link to="/register">
                  <Button variant="ghost" className="h-8 px-0 text-[10px] uppercase font-bold tracking-widest text-technic-yellow hover:text-technic-yellow/80 hover:bg-transparent">
                    Apply as Specialist <ChevronRight className="ml-1 w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bento-card border-l-4 border-l-blue-500">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight text-lg mb-1">Apprentice Track</h3>
                <p className="text-xs text-text-dim leading-relaxed mb-4">Start your journey under master mentorship. Real workplace experience logging.</p>
                <Link to="/register">
                  <Button variant="ghost" className="h-8 px-0 text-[10px] uppercase font-bold tracking-widest text-blue-400 hover:text-blue-400/80 hover:bg-transparent">
                    Join Apprenticeship <ChevronRight className="ml-1 w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bento-card border-l-4 border-l-success-green">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-success-green/10 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-success-green" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-tight text-lg mb-1">Car Owners</h3>
                <p className="text-xs text-text-dim leading-relaxed mb-4">Book verified mechanics and build a digital service history for your vehicle.</p>
                <Link to="/register">
                  <Button variant="ghost" className="h-8 px-0 text-[10px] uppercase font-bold tracking-widest text-success-green hover:text-success-green/80 hover:bg-transparent">
                    Register Vehicle <ChevronRight className="ml-1 w-3 h-3" />
                  </Button>
                </Link>
              </div>
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
          <Lock className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[3px]">E2E Encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[3px]">Community R&D</span>
        </div>
      </motion.div>
    </div>
  );
};
