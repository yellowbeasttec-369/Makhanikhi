import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Shield, FileText, Award, Briefcase, CheckCircle2, Loader2, ArrowLeft, ArrowRight, Wrench, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

export const VerificationCenter: React.FC = () => {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    path: profile?.role || 'specialist',
    identityUrl: '',
    certificationUrl: '',
    experienceUrl: '',
    evidenceOfWork: '',
    skills: '',
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        role: formData.path,
        verificationStatus: 'pending',
        verificationDocs: {
          identityUrl: formData.identityUrl,
          certificationUrl: formData.certificationUrl,
          experienceUrl: formData.experienceUrl,
          evidenceOfWork: formData.evidenceOfWork,
        },
        specialization: formData.skills,
      });
      toast.success("Verification documents submitted successfully!");
      setStep(5);
    } catch (error) {
      toast.error("Failed to submit documents.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role === 'owner') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <Shield className="w-16 h-16 text-text-dim mx-auto mb-4" />
        <h1 className="text-3xl font-display font-black uppercase mb-4">Verification Not Required</h1>
        <p className="text-text-dim">Car owners do not need to undergo the specialist verification process.</p>
        <Link to="/dashboard">
          <Button className="bento-btn mt-8">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <header className="flex justify-between items-end mb-8 border-b border-border-dim pb-4">
        <div className="logo text-2xl font-black text-technic-yellow uppercase tracking-tighter">Makhanikhi</div>
        <div className="powered-by text-[10px] tracking-[2px] text-text-dim uppercase">Trust & Verification</div>
      </header>

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-display font-black uppercase mb-2">Verification Center</h1>
        <p className="text-text-dim">Complete these steps to earn your <span className="text-technic-yellow font-bold">VERIFIED</span> badge.</p>
      </div>

      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0" />
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all border-2 ${
              step >= s ? 'bg-technic-yellow text-industrial-charcoal border-technic-yellow' : 'bg-industrial-charcoal text-white/40 border-white/10'
            }`}
          >
            {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> Step 01: Career Path</div>
              <h2 className="text-2xl font-display font-black mb-4 uppercase flex items-center gap-2">
                <Wrench className="w-6 h-6 text-technic-yellow" /> Select Your Path
              </h2>
              <p className="text-text-dim text-sm mb-6">
                Choose the path that best describes your current expertise level.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({...formData, path: 'specialist'})}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.path === 'specialist' ? 'border-technic-yellow bg-technic-yellow/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                >
                  <Award className="w-8 h-8 text-technic-yellow mb-3" />
                  <h3 className="font-bold uppercase tracking-tight">Specialist Mechanic</h3>
                  <p className="text-[11px] text-text-dim mt-1">Experienced professional with trade certifications and 3+ years of experience.</p>
                </button>
                <button 
                  onClick={() => setFormData({...formData, path: 'apprentice'})}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${formData.path === 'apprentice' ? 'border-technic-yellow bg-technic-yellow/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                >
                  <Users className="w-8 h-8 text-technic-yellow mb-3" />
                  <h3 className="font-bold uppercase tracking-tight">Apprentice</h3>
                  <p className="text-[11px] text-text-dim mt-1">Learning the trade. Requires a mentor and proof of enrollment in a training program.</p>
                </button>
              </div>
              <Button onClick={handleNext} className="bento-btn mt-8">
                Next: Identity <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> Step 02: Identity</div>
              <h2 className="text-2xl font-display font-black mb-4 uppercase flex items-center gap-2">
                <FileText className="w-6 h-6 text-technic-yellow" /> Identity Verification
              </h2>
              <p className="text-text-dim text-sm mb-6">
                Please provide a link to a scanned copy of your National ID or Passport. 
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Document URL (ID/Passport)</Label>
                  <Input 
                    placeholder="https://..." 
                    className="bg-white/5 border-white/10 rounded-xl"
                    value={formData.identityUrl}
                    onChange={(e) => setFormData({...formData, identityUrl: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={handleBack} className="flex-1 border-white/10 rounded-xl">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button onClick={handleNext} className="bento-btn flex-1">
                    Next: Expertise <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> Step 03: Expertise</div>
              <h2 className="text-2xl font-display font-black mb-4 uppercase flex items-center gap-2">
                <Award className="w-6 h-6 text-technic-yellow" /> Certifications & Skills
              </h2>
              <p className="text-text-dim text-sm mb-6">
                Upload your trade certificates and list your primary specializations (e.g., Engines, Transmission, Electronics).
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Certification URL</Label>
                  <Input 
                    placeholder="https://..." 
                    className="bg-white/5 border-white/10 rounded-xl"
                    value={formData.certificationUrl}
                    onChange={(e) => setFormData({...formData, certificationUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Specializations (Comma separated)</Label>
                  <Input 
                    placeholder="e.g. BMW Engines, Diesel Systems" 
                    className="bg-white/5 border-white/10 rounded-xl"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={handleBack} className="flex-1 border-white/10 rounded-xl">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button onClick={handleNext} className="bento-btn flex-1">
                    Next: Evidence <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> Step 04: Evidence of Work</div>
              <h2 className="text-2xl font-display font-black mb-4 uppercase flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-technic-yellow" /> Proof of Experience
              </h2>
              <p className="text-text-dim text-sm mb-6">
                Provide links to photos of your work, a portfolio, or your CV. This is critical for specialist verification.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Evidence of Work / Portfolio URL</Label>
                  <Input 
                    placeholder="https://..." 
                    className="bg-white/5 border-white/10 rounded-xl"
                    value={formData.evidenceOfWork}
                    onChange={(e) => setFormData({...formData, evidenceOfWork: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">CV / Experience URL</Label>
                  <Input 
                    placeholder="https://..." 
                    className="bg-white/5 border-white/10 rounded-xl"
                    value={formData.experienceUrl}
                    onChange={(e) => setFormData({...formData, experienceUrl: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={handleBack} className="flex-1 border-white/10 rounded-xl">
                    <ArrowLeft className="mr-2 w-4 h-4" /> Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading} className="bento-btn flex-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit for Review'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="bento-card text-center py-12">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-technic-yellow/20 border-2 border-technic-yellow rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-12 h-12 text-technic-yellow animate-spin" />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-black uppercase">Review in Progress</h2>
                  <p className="text-text-dim text-sm mt-2">
                    Our team is currently verifying your documents. 
                    This usually takes 24-48 hours. You will be notified once your badge is issued.
                  </p>
                </div>
                <Link to="/dashboard">
                  <Button className="bento-btn">Return to Dashboard</Button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
