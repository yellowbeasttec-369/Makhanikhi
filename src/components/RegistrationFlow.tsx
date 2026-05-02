import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, setDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { 
  User, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Wrench, 
  Users, 
  Camera, 
  Trash2, 
  Award,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraCapture } from './CameraCapture';

export const RegistrationFlow: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryRole = queryParams.get('role');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  const [formData, setFormData] = useState({
    role: '',
    displayName: profile?.displayName || user?.displayName || '',
    phone: '',
    address: '',
    emergencyContact: '',
    dob: profile?.dob || '',
    idNumber: profile?.idNumber || '',
    bio: '',
    photoURL: profile?.photoURL || user?.photoURL || '',
    // Role specific fields
    specialization: '',
    yearsOfExperience: 0,
    offersMentorship: false,
    trainingPath: 'practical' as 'traditional' | 'practical',
    apprenticeStartAge: 18,
    certifications: [] as string[],
    interests: [] as string[],
    vehicle: {
      make: '',
      model: '',
      year: '',
      registration: '',
    }
  });

  useEffect(() => {
    if (queryRole === 'owner') {
      setFormData(prev => ({ ...prev, role: 'owner' }));
      setStep(2); // Skip role selection if they already chose owner
    } else if (queryRole === 'pro') {
      // Stay on step 1 to choose between specialist or apprentice
    }
  }, [queryRole]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleCancel = () => navigate('/');

  const onCapture = (imageData: string) => {
    setFormData({ ...formData, photoURL: imageData });
  };

  const handleCompleteRegistration = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const updateData: any = {
        displayName: formData.displayName,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact,
        address: formData.address,
        dob: formData.dob,
        idNumber: formData.idNumber,
        bio: formData.bio,
        photoURL: formData.photoURL,
        role: formData.role,
        isProfileComplete: true,
        updatedAt: new Date().toISOString(),
      };

      if (formData.role === 'apprentice') {
        updateData.apprenticeStatus = 'awaiting-match';
        updateData.trainingPath = formData.trainingPath;
        updateData.apprenticeStartAge = formData.apprenticeStartAge;
      }

      if (formData.role === 'specialist') {
        updateData.specialization = formData.specialization;
        updateData.yearsOfExperience = formData.yearsOfExperience;
        updateData.offersMentorship = formData.offersMentorship;
      }

      await setDoc(doc(db, 'users', user.uid), updateData, { merge: true });
      
      // If owner, add the vehicle too
      if (formData.role === 'owner' && formData.vehicle.make) {
        const vehicleRef = doc(collection(db, 'vehicles'));
        await setDoc(vehicleRef, {
          ...formData.vehicle,
          ownerId: user.uid,
          createdAt: new Date().toISOString(),
          mileage: 0,
          serviceHistory: [],
          faults: []
        });
      }

      if (formData.role === 'apprentice') {
        toast.success("Registration complete! You are now awaiting matching with a Specialist.");
      } else {
        toast.success("Registration complete!");
      }
      
      if (formData.role === 'owner') {
        navigate('/dashboard');
      } else {
        navigate('/verify'); // Go to verification center for specialists/apprentices
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-black uppercase text-technic-yellow mb-4">Auth Required</h1>
        <p className="text-text-dim mb-8">Please login with Google first to begin registration.</p>
        <Button onClick={() => navigate('/login')} className="bento-btn">Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4 relative">
      {/* Cancel Button */}
      <button 
        onClick={handleCancel}
        className="absolute top-4 right-4 p-2 text-text-dim hover:text-white transition-colors"
        title="Cancel Registration"
      >
        <X className="w-6 h-6" />
      </button>

      {showCamera && (
        <CameraCapture 
          title="Profile Photo"
          onCapture={onCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-technic-yellow/10 border border-technic-yellow/20 text-technic-yellow text-[10px] font-bold uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3 h-3" /> Professional Onboarding
        </div>
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter mb-2 text-digital-white">
          {step === 1 ? 'Technical Stream' : step === 2 ? 'Identity Check' : 'Vehicle Registry'}
        </h1>
        <p className="text-text-dim">
          {step === 1 
            ? 'Refine your participation in the technical ecosystem.' 
            : step === 2 
              ? 'Complete your digital profile to start working.'
              : 'Add your vehicle to start tracking digital records.'}
        </p>
      </header>

      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => { setFormData({...formData, role: 'specialist'}); handleNext(); }}
                  className={`p-8 rounded-[32px] bg-white/[0.02] border transition-all text-left group flex items-start gap-6 ${formData.role === 'specialist' ? 'border-technic-yellow ring-1 ring-technic-yellow' : 'border-white/10 hover:border-technic-yellow/50'}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-technic-yellow/10 flex items-center justify-center shrink-0 border border-technic-yellow/20">
                    <Award className="w-7 h-7 text-technic-yellow" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight text-xl mb-2 text-digital-white">Master Specialist</h3>
                    <p className="text-xs text-text-dim leading-relaxed">For skilled technicians with master-level experience seeking safe, paid engagements.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setFormData({...formData, role: 'apprentice'}); handleNext(); }}
                  className={`p-8 rounded-[32px] bg-white/[0.02] border transition-all text-left group flex items-start gap-6 ${formData.role === 'apprentice' ? 'border-technic-yellow ring-1 ring-technic-yellow' : 'border-white/10 hover:border-technic-yellow/50'}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-technic-yellow/10 flex items-center justify-center shrink-0 border border-technic-yellow/20">
                    <Users className="w-7 h-7 text-technic-yellow" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight text-xl mb-2 text-digital-white">Technical Apprentice</h3>
                    <p className="text-xs text-text-dim leading-relaxed">For aspiring mechanics looking to validate skills under expert mentorship.</p>
                  </div>
                </button>
              </div>

              {/* Expert Protection Bubble */}
              <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Safety & Value Guarantee</h4>
                  <p className="text-[10px] text-text-dim leading-relaxed">
                    By registering, you access a secure environment that prevents unpaid emergency exploitation and validates your technical worth upfront.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button variant="ghost" onClick={handleCancel} className="text-[10px] uppercase font-bold tracking-widest text-text-dim hover:text-white">
                  Cancel Registration
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bento-card relative">
              {/* Profile setup UI remains similar but with added safety bubbles */}
              <div className="bento-card-title"><div className="bento-dot"></div> Registry Profile</div>
              
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  {formData.photoURL ? (
                    <div className="relative">
                      <img src={formData.photoURL} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-technic-yellow shadow-[0_0_20px_rgba(255,210,0,0.2)]" />
                      <button 
                        onClick={() => setFormData({...formData, photoURL: ''})}
                        className="absolute -top-1 -right-1 bg-danger-red p-1.5 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setShowCamera(true)}
                      className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all transition-transform hover:scale-105"
                    >
                      <Camera className="w-6 h-6 text-technic-yellow mb-1" />
                      <span className="text-[8px] font-bold uppercase tracking-widest">Add Photo</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                    <User className="w-3 h-3" /> Full Name
                  </Label>
                  <Input 
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="bg-white/5 border-white/10 rounded-xl h-12"
                    placeholder="Your full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">ID / Passport Number</Label>
                    <Input 
                      value={formData.idNumber}
                      onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                      className="bg-white/5 border-white/10 rounded-xl h-12"
                      placeholder="Identity Number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Date of Birth</Label>
                    <Input 
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                      className="bg-white/5 border-white/10 rounded-xl h-12 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Contact Phone
                  </Label>
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-white/5 border-white/10 rounded-xl h-12"
                    placeholder="+27 (0) ..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Emergency Contact (Next of Kin)
                  </Label>
                  <Input 
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    className="bg-white/5 border-white/10 rounded-xl h-12"
                    placeholder="Name & Relationship - Phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Location / Area
                  </Label>
                  <Input 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="bg-white/5 border-white/10 rounded-xl h-12"
                    placeholder="e.g. Randburg, Johannesburg"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Mini Bio</Label>
                  <Textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="bg-white/5 border-white/10 rounded-xl min-h-[100px]"
                    placeholder={formData.role === 'specialist' ? "Describe your workshop experience and specialities..." : "Tell us about your interest in mechanics and what you hope to learn..."}
                  />
                </div>

                {formData.role === 'specialist' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6 pt-4 border-t border-white/5"
                  >
                    <div className="bento-card-title"><div className="bento-dot bg-technic-yellow"></div> Specialist Credentials</div>
                    
                    <div className="space-y-2">
                       <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Main Specialization</Label>
                       <select 
                         value={formData.specialization}
                         onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                         className="w-full bg-white/5 border-white/10 rounded-xl h-12 px-4 text-digital-white focus:outline-none focus:ring-1 focus:ring-technic-yellow"
                       >
                         <option value="" className="bg-industrial-charcoal">Select Specialization</option>
                         <option value="european" className="bg-industrial-charcoal">European (BMW, Merc, VAG)</option>
                         <option value="asian" className="bg-industrial-charcoal">Asian (Toyota, Honda, Kia)</option>
                         <option value="diesel" className="bg-industrial-charcoal">Diesel & Heavy Duty</option>
                         <option value="hybrid-ev" className="bg-industrial-charcoal">Hybrid & Electric</option>
                         <option value="general" className="bg-industrial-charcoal">General Maintenance</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Years of Experience</Label>
                      <Input 
                        type="number"
                        min="0"
                        value={formData.yearsOfExperience}
                        onChange={(e) => setFormData({...formData, yearsOfExperience: parseInt(e.target.value) || 0})}
                        className="bg-white/5 border-white/10 rounded-xl h-12"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer group hover:border-technic-yellow/30 transition-all"
                         onClick={() => setFormData({...formData, offersMentorship: !formData.offersMentorship})}>
                      <div className={`w-10 h-6 rounded-full relative transition-colors ${formData.offersMentorship ? 'bg-technic-yellow' : 'bg-white/20'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-industrial-charcoal transition-all ${formData.offersMentorship ? 'left-5' : 'left-1'}`} />
                      </div>
                      <div>
                        <Label className="text-digital-white text-xs font-bold uppercase tracking-tight cursor-pointer">Offer Workshop Learning</Label>
                        <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest">Willing to mentor and co-opt apprentices</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {formData.role === 'apprentice' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6 pt-4 border-t border-white/5"
                  >
                    <div className="bento-card-title"><div className="bento-dot bg-blue-500"></div> Apprentice Track</div>
                    
                    <div className="space-y-2">
                       <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Training Path</Label>
                       <div className="flex gap-4">
                         <button 
                           onClick={() => setFormData({...formData, trainingPath: 'traditional'})}
                           className={`flex-1 p-4 rounded-xl border transition-all text-left ${formData.trainingPath === 'traditional' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}
                         >
                           <div className="font-black text-xs uppercase mb-1">Traditional</div>
                           <div className="text-[10px] text-text-dim">TVET / College Student</div>
                         </button>
                         <button 
                           onClick={() => setFormData({...formData, trainingPath: 'practical'})}
                           className={`flex-1 p-4 rounded-xl border transition-all text-left ${formData.trainingPath === 'practical' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}
                         >
                           <div className="font-black text-xs uppercase mb-1">Practical</div>
                           <div className="text-[10px] text-text-dim">Workshop Learning</div>
                         </button>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Approx. Start Age</Label>
                      <Input 
                        type="number"
                        min="16"
                        value={formData.apprenticeStartAge}
                        onChange={(e) => setFormData({...formData, apprenticeStartAge: parseInt(e.target.value) || 18})}
                        className="bg-white/5 border-white/10 rounded-xl h-12"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="pt-4 flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-14 text-xs font-bold border-white/10">
                    <ArrowLeft className="mr-2 w-4 h-4" /> BACK
                  </Button>
                  <Button 
                    onClick={() => formData.role === 'owner' ? handleNext() : handleCompleteRegistration()} 
                    disabled={loading} 
                    className="bento-btn flex-[2] h-14 text-sm"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : formData.role === 'owner' ? 'NEXT STEP' : 'SAVE & FINISH'} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && formData.role === 'owner' && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> Ownership Details</div>
              <p className="text-xs text-text-dim mb-6 leading-relaxed uppercase tracking-widest font-bold">Register your vehicle to build its digital service history.</p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Make</Label>
                    <Input 
                      value={formData.vehicle.make}
                      onChange={(e) => setFormData({...formData, vehicle: { ...formData.vehicle, make: e.target.value }})}
                      className="bg-white/5 border-white/10 rounded-xl h-12"
                      placeholder="e.g. BMW"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Model</Label>
                    <Input 
                      value={formData.vehicle.model}
                      onChange={(e) => setFormData({...formData, vehicle: { ...formData.vehicle, model: e.target.value }})}
                      className="bg-white/5 border-white/10 rounded-xl h-12"
                      placeholder="e.g. 320i"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Year</Label>
                    <Input 
                      value={formData.vehicle.year}
                      onChange={(e) => setFormData({...formData, vehicle: { ...formData.vehicle, year: e.target.value }})}
                      className="bg-white/5 border-white/10 rounded-xl h-12"
                      placeholder="e.g. 2021"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Registration / VIN</Label>
                    <Input 
                      value={formData.vehicle.registration}
                      onChange={(e) => setFormData({...formData, vehicle: { ...formData.vehicle, registration: e.target.value }})}
                      className="bg-white/5 border-white/10 rounded-xl h-12"
                      placeholder="e.g. GP 123 456"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-14 text-xs font-bold border-white/10">
                    <ArrowLeft className="mr-2 w-4 h-4" /> BACK
                  </Button>
                  <Button onClick={handleCompleteRegistration} disabled={loading} className="bento-btn flex-[2] h-14 text-sm">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'COMPLETE REGISTRATION'} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
