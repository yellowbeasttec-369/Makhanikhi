import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Shield, FileText, Award, Briefcase, CheckCircle2, Loader2, ArrowLeft, ArrowRight, Wrench, Users, Camera, Trash2, ClipboardCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { CameraCapture } from './CameraCapture';

export const VerificationCenter: React.FC = () => {
  const { profile } = useAuth();
  const [step, setStep] = useState(profile?.role && (profile.role === 'specialist' || profile.role === 'apprentice') ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [captureTarget, setCaptureTarget] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    path: profile?.role || 'specialist',
    trainingPath: profile?.trainingPath || 'traditional' as 'traditional' | 'practical',
    apprenticeStartAge: profile?.apprenticeStartAge || '',
    identityUrl: '',
    certificationUrl: '',
    experienceUrl: '',
    experienceYears: '',
    accreditations: '',
    affiliations: '',
    accomplishments: '',
    affidavitUrl: '',
    isSpecialistRawExperience: false,
    skills: '',
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const onCapture = (imageData: string) => {
    if (captureTarget) {
      setFormData({ ...formData, [captureTarget]: imageData });
    }
  };

  const removeImage = (target: string) => {
    setFormData({ ...formData, [target]: '' });
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        role: formData.path,
        trainingPath: formData.trainingPath,
        apprenticeStartAge: parseInt(formData.apprenticeStartAge.toString()) || 0,
        verificationStatus: 'pending',
        yearsOfExperience: parseInt(formData.experienceYears) || 0,
        certifications: formData.certificationUrl ? ['Certified Documentation'] : [],
        accreditations: formData.accreditations.split(',').map(s => s.trim()).filter(Boolean),
        affiliations: formData.affiliations.split(',').map(s => s.trim()).filter(Boolean),
        accomplishments: formData.accomplishments,
        verificationDocs: {
          identityUrl: formData.identityUrl,
          certificationUrl: formData.certificationUrl,
          experienceUrl: formData.experienceUrl,
          affidavitUrl: formData.affidavitUrl,
        },
        specialization: formData.skills,
      });
      toast.success("Registration documents submitted for review!");
      setStep(6);
    } catch (error) {
      toast.error("Failed to submit documents.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role === 'owner') {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-12">
          <img src="/Makhanikhi_logo_launch.png" alt="Logo" className="w-24 h-24 mx-auto mb-8 grayscale opacity-50" />
          <Shield className="w-16 h-16 text-text-dim mx-auto mb-4" />
          <h1 className="text-3xl font-display font-black uppercase mb-4">Verification Not Required</h1>
          <p className="text-text-dim max-w-md mx-auto">
            Car owners do not need to undergo the specialist verification process. Your identity is managed via your linked primary account.
          </p>
          <Link to="/dashboard">
            <Button className="bento-btn mt-8 max-w-xs">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const CaptureButton = ({ target, label, current }: { target: string, label: string, current: string }) => (
    <div className="space-y-2">
      <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">{label}</Label>
      {!current ? (
        <Button 
          variant="outline" 
          onClick={() => { setCaptureTarget(target); setShowCamera(true); }}
          className="w-full h-24 border-dashed border-white/10 bg-white/5 hover:bg-white/10 flex flex-col gap-2 rounded-2xl"
        >
          <Camera className="w-6 h-6 text-technic-yellow" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Scan Document</span>
        </Button>
      ) : (
        <div className="relative group">
          <img src={current} alt={label} className="w-full h-32 object-cover rounded-2xl border border-white/10" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-2xl">
            <Button size="icon" variant="outline" className="border-white/20 h-10 w-10" onClick={() => { setCaptureTarget(target); setShowCamera(true); }}>
              <Camera className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="destructive" className="h-10 w-10" onClick={() => removeImage(target)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {showCamera && (
        <CameraCapture 
          title={`Scan ${(captureTarget?.replace('Url', '') || '').toUpperCase()}`}
          onCapture={onCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <header className="flex justify-between items-end mb-12 border-b border-border-dim pb-6">
        <div className="logo text-3xl font-black text-technic-yellow uppercase tracking-tighter">Makhanikhi</div>
        <div className="powered-by text-[10px] tracking-[4px] text-text-dim uppercase font-bold">Specialist Onboarding</div>
      </header>

      <div className="mb-12 text-center">
        <h1 className="text-4xl font-display font-black uppercase mb-4 tracking-tighter">Registration Portal</h1>
        <p className="text-text-dim">Professional validation for the <span className="text-technic-yellow font-bold italic underline decoration-technic-yellow/30">digital mechanic</span>.</p>
      </div>

      <div className="flex justify-between mb-16 relative px-4">
        <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -translate-y-1/2 z-0" />
        {[1, 2, 3, 4, 5].map((s) => (
          <div 
            key={s} 
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2 ${
              step >= s ? 'bg-technic-yellow text-industrial-charcoal border-technic-yellow shadow-[0_0_15px_rgba(255,210,0,0.3)]' : 'bg-industrial-charcoal text-white/40 border-white/5'
            }`}
          >
            {step > s ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs">{s}</span>}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.25 }}
        >
          {step === 1 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> Path Selection</div>
              <h2 className="text-2xl font-display font-black mb-6 uppercase flex items-center gap-3">
                <Wrench className="w-7 h-7 text-technic-yellow" /> Discipline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({...formData, path: 'specialist'})}
                  className={`p-8 rounded-[24px] border-2 text-left transition-all ${formData.path === 'specialist' ? 'border-technic-yellow bg-technic-yellow/5' : 'border-white/5 bg-white/2 hover:border-white/10'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-technic-yellow/10 flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-technic-yellow" />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-lg">Specialist</h3>
                  <p className="text-[11px] text-text-dim mt-2 leading-relaxed">Master technician with years of clinical workshop experience and certifications.</p>
                </button>
                <button 
                  onClick={() => setFormData({...formData, path: 'apprentice'})}
                  className={`p-8 rounded-[24px] border-2 text-left transition-all ${formData.path === 'apprentice' ? 'border-technic-yellow bg-technic-yellow/5' : 'border-white/5 bg-white/2 hover:border-white/10'}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-technic-yellow/10 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-technic-yellow" />
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-lg">Apprentice</h3>
                  <p className="text-[11px] text-text-dim mt-2 leading-relaxed">Early career mechanic looking for mentorship and validated workplace experience logging.</p>
                </button>
              </div>
              <Button onClick={handleNext} className="bento-btn mt-10 h-14 text-sm tracking-widest">
                VERIFY IDENTITY <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> Legal Validation</div>
              <h2 className="text-2xl font-display font-black mb-6 uppercase flex items-center gap-3">
                <Shield className="w-7 h-7 text-technic-yellow" /> Identity
              </h2>
              <p className="text-text-dim text-sm mb-8 leading-relaxed">
                Scan your passport or national ID. This must be a clear, high-resolution capture of a certified copy.
              </p>
              <div className="space-y-6">
                <CaptureButton target="identityUrl" label="Certified Identity Document" current={formData.identityUrl} />
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-12 border-white/10 rounded-xl text-xs font-bold">
                    <ArrowLeft className="mr-2 w-4 h-4" /> BACK
                  </Button>
                  <Button onClick={handleNext} disabled={!formData.identityUrl} className="bento-btn flex-1 h-12 text-xs">
                    CONTINUE <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> Professional Standing</div>
              <h2 className="text-2xl font-display font-black mb-6 uppercase flex items-center gap-3">
                <Award className="w-7 h-7 text-technic-yellow" /> Track Record
              </h2>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setFormData({...formData, trainingPath: 'traditional'})}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.trainingPath === 'traditional' ? 'border-technic-yellow bg-technic-yellow/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                  >
                    <h4 className="font-bold uppercase tracking-tight text-[11px]">Certified Route</h4>
                    <p className="text-[9px] text-text-dim mt-1">Formal training, Red Seal, or accredited diplomas.</p>
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, trainingPath: 'practical'})}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.trainingPath === 'practical' ? 'border-technic-yellow bg-technic-yellow/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                  >
                    <h4 className="font-bold uppercase tracking-tight text-[11px]">Practical Route</h4>
                    <p className="text-[9px] text-text-dim mt-1">Self-taught experts & practical workforce experience.</p>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Apprentice Start Age (Min 16)</Label>
                    <Input 
                      type="number"
                      min="16"
                      placeholder="e.g. 17" 
                      className="bg-white/5 border-white/10 rounded-xl h-12"
                      value={formData.apprenticeStartAge}
                      onChange={(e) => setFormData({...formData, apprenticeStartAge: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Total Years Exp.</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 8" 
                      className="bg-white/5 border-white/10 rounded-xl h-12"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({...formData, experienceYears: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Specializations</Label>
                  <Input 
                    placeholder="e.g. BMW Engines, Diesel, Diagnostics" 
                    className="bg-white/5 border-white/10 rounded-xl h-12"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  />
                </div>

                {formData.trainingPath === 'traditional' ? (
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Accreditations (Red Seal, ASE, etc)</Label>
                    <Input 
                      placeholder="e.g. Red Seal, MERSETA Section 13..." 
                      className="bg-white/5 border-white/10 rounded-xl h-12"
                      value={formData.accreditations}
                      onChange={(e) => setFormData({...formData, accreditations: e.target.value})}
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-technic-yellow/5 border border-technic-yellow/20 rounded-2xl">
                    <p className="text-[10px] text-technic-yellow font-bold uppercase tracking-widest mb-1 italic">Notice: Practical Expert Path</p>
                    <p className="text-[10px] text-text-dim leading-relaxed uppercase tracking-widest font-black">
                      Official SAPS Affidavit Required
                    </p>
                    <p className="text-[9px] text-text-dim leading-relaxed mt-1">
                      If you lack formal certificates but possess master-level skills, you must submit a Sworn Affidavit from the SAPS (South African Police Service) attesting to your ability to diagnose and repair vehicles safely.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {formData.trainingPath === 'traditional' ? (
                    <CaptureButton target="certificationUrl" label="Certification Scan" current={formData.certificationUrl} />
                  ) : (
                    <CaptureButton target="affidavitUrl" label="SAPS Sworn Affidavit Scan" current={formData.affidavitUrl} />
                  )}
                  <CaptureButton target="experienceUrl" label="Workshop Reference / Log" current={formData.experienceUrl} />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-12 border-white/10 rounded-xl text-xs font-bold">
                    BACK
                  </Button>
                  <Button onClick={handleNext} className="bento-btn flex-1 h-12 text-xs">
                    STEP 4: ACCOMPLISHMENTS <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> Elite Status</div>
              <h2 className="text-2xl font-display font-black mb-6 uppercase flex items-center gap-3">
                <Award className="w-7 h-7 text-technic-yellow" /> Accomplishments
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Affiliations & Guilds</Label>
                  <Input 
                    placeholder="MIWA, RMI, Independent Workshop Association" 
                    className="bg-white/5 border-white/10 rounded-xl h-12"
                    value={formData.affiliations}
                    onChange={(e) => setFormData({...formData, affiliations: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Outstanding Accomplishments</Label>
                  <Textarea 
                    placeholder="Describe major projects, unique engine builds, or industry awards..." 
                    className="bg-white/5 border-white/10 rounded-xl min-h-[120px]"
                    value={formData.accomplishments}
                    onChange={(e) => setFormData({...formData, accomplishments: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-12 border-white/10 rounded-xl text-xs font-bold">
                    BACK
                  </Button>
                  <Button onClick={handleNext} className="bento-btn flex-1 h-12 text-xs">
                    EVIDENCE OF WORK <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> Physical Proof</div>
              <h2 className="text-2xl font-display font-black mb-6 uppercase flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-technic-yellow" /> Portfolio
              </h2>
              <p className="text-text-dim text-sm mb-8 leading-relaxed">
                Scan photos of your workshop setup, specialized tools, or completed high-performance engine bays.
              </p>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CaptureButton target="experienceUrl" label="Workshop / Work Evidence 1" current={formData.experienceUrl} />
                  <CaptureButton target="evidenceOfWork" label="Workshop / Work Evidence 2" current={formData.evidenceOfWork} />
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-12 border-white/10 rounded-xl text-xs font-bold">
                    BACK
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading} className="bento-btn flex-1 h-12 text-xs">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SUBMIT APPLICATION'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="bento-card text-center py-16">
              <div className="space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-technic-yellow/10 border border-technic-yellow/20 rounded-[32px] flex items-center justify-center mx-auto animate-pulse">
                    <ClipboardCheck className="w-12 h-12 text-technic-yellow" />
                  </div>
                  <div className="absolute top-0 right-1/2 translate-x-12 -translate-y-2 bg-success-green text-industrial-charcoal text-[10px] font-black px-2 py-1 rounded-full uppercase">
                    Received
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Review Pending</h2>
                  <p className="text-text-dim text-sm mt-4 max-w-sm mx-auto leading-relaxed">
                    Our accreditation team is validating your credentials. You'll receive the <span className="text-technic-yellow font-bold uppercase">Makhanikhi Shield</span> upon successful verification.
                  </p>
                </div>
                <Link to="/dashboard" className="block">
                  <Button className="bento-btn max-w-xs h-14">Return to Command Center</Button>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
