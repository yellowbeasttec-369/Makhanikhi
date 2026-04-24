import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
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
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraCapture } from './CameraCapture';

export const RegistrationFlow: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
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
    vehicle: {
      make: '',
      model: '',
      year: '',
      registration: '',
    },
    experience: {
      years: '',
      certifications: [] as string[],
      affiliations: [] as string[],
      accreditations: [] as string[],
      accomplishments: '',
      verificationMethod: 'credentials' as 'credentials' | 'references' | 'affidavit',
      references: [] as {name: string, contact: string}[],
      documents: [] as {title: string, url: string, category: string}[]
    },
    apprentice: {
      nomination: 'self' as 'self' | 'co-opted',
      mentorId: '',
      mentorName: '',
      trainingPath: 'practical' as 'traditional' | 'practical',
      startAge: ''
    }
  });

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

      if (formData.role === 'specialist') {
        updateData.yearsOfExperience = parseInt(formData.experience.years) || 0;
        updateData.certifications = formData.experience.certifications;
        updateData.affiliations = formData.experience.affiliations;
        updateData.accreditations = formData.experience.accreditations;
        updateData.accomplishments = formData.experience.accomplishments;
        updateData.verificationDocs = {
          documents: formData.experience.documents
        };
      }

      if (formData.role === 'apprentice') {
        updateData.trainingPath = formData.apprentice.trainingPath;
        updateData.apprenticeStartAge = parseInt(formData.apprentice.startAge) || 0;
        updateData.mentorId = formData.apprentice.mentorId;
        updateData.mentorName = formData.apprentice.mentorName;
      }

      await updateDoc(doc(db, 'users', user.uid), updateData);
      
      // If owner, add the vehicle too
      if (formData.role === 'owner' && formData.vehicle.make) {
        // Here we could add to a vehicles collection, but for now we just finish the flow
        // The Dashboard will handle vehicle management
      }

      toast.success("Registration complete!");
      
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
          {step === 1 ? 'Select Discipline' : 
           step === 2 ? 'Bio Details' : 
           (formData.role === 'owner' ? 'Vehicle Registry' : 
            formData.role === 'specialist' ? 'Experience Verification' : 
            'Apprentice Nomination')}
        </h1>
        <p className="text-text-dim">
          {step === 1 
            ? 'Choose how you will participate in the ecosystem.' 
            : step === 2 
              ? 'Let the community know who you are.'
              : formData.role === 'owner'
                ? 'Add your vehicle to start tracking digital records.'
                : formData.role === 'specialist'
                  ? 'Verify your professional experience and credentials.'
                  : 'Connect with a mentor or self-nominate for apprenticeship.'}
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => { setFormData({...formData, role: 'owner'}); handleNext(); }}
                  className={`bento-card text-left transition-all hover:border-technic-yellow/50 group ${formData.role === 'owner' ? 'border-technic-yellow ring-1 ring-technic-yellow' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-technic-yellow/10 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-technic-yellow" />
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-tight text-lg">Car Owner</h3>
                      <p className="text-xs text-text-dim mt-1 leading-relaxed">Book specialists, track maintenance logs, and manage your vehicle fleet digitally.</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => { setFormData({...formData, role: 'specialist'}); handleNext(); }}
                  className={`bento-card text-left transition-all hover:border-technic-yellow/50 group ${formData.role === 'specialist' ? 'border-technic-yellow ring-1 ring-technic-yellow' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-technic-yellow/10 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6 text-technic-yellow" />
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-tight text-lg">Specialist Mechanic</h3>
                      <p className="text-xs text-text-dim mt-1 leading-relaxed">Master technician providing mobile services. Requires professional validation.</p>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => { setFormData({...formData, role: 'apprentice'}); handleNext(); }}
                  className={`bento-card text-left transition-all hover:border-technic-yellow/50 group ${formData.role === 'apprentice' ? 'border-technic-yellow ring-1 ring-technic-yellow' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-technic-yellow/10 flex items-center justify-center shrink-0">
                      <Users className="w-6 h-6 text-technic-yellow" />
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-tight text-lg">Apprentice</h3>
                      <p className="text-xs text-text-dim mt-1 leading-relaxed">Learning the trade under specialist mentorship. Workplace experience validation.</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="pt-8 flex justify-center">
                <Button variant="ghost" onClick={handleCancel} className="text-[10px] uppercase font-bold tracking-widest text-text-dim hover:text-white">
                  Cancel Registration
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> Profile Setup</div>
              
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
                    placeholder="Tell us about yourself or your workshop interests..."
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-14 text-xs font-bold border-white/10">
                    <ArrowLeft className="mr-2 w-4 h-4" /> BACK
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={loading} 
                    className="bento-btn flex-[2] h-14 text-sm"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'NEXT STEP'} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            formData.role === 'owner' ? (
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
            ) : formData.role === 'specialist' ? (
              <div className="bento-card">
                <div className="bento-card-title"><div className="bento-dot"></div> Professional Experience</div>
                <p className="text-xs text-text-dim mb-6 leading-relaxed uppercase tracking-widest font-bold">Verify your expertise through credentials, references, or affidavit.</p>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Verification Method</Label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setFormData({...formData, experience: { ...formData.experience, verificationMethod: 'credentials' }})}
                        className={`flex-1 p-3 rounded-xl border transition-all ${formData.experience.verificationMethod === 'credentials' ? 'border-technic-yellow bg-technic-yellow/10' : 'border-white/10 bg-white/5'}`}
                      >
                        <div className="text-center">
                          <Award className="w-6 h-6 mx-auto mb-2 text-technic-yellow" />
                          <div className="text-xs font-bold uppercase">Credentials</div>
                          <div className="text-[8px] text-text-dim">Certifications & Accreditations</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => setFormData({...formData, experience: { ...formData.experience, verificationMethod: 'references' }})}
                        className={`flex-1 p-3 rounded-xl border transition-all ${formData.experience.verificationMethod === 'references' ? 'border-technic-yellow bg-technic-yellow/10' : 'border-white/10 bg-white/5'}`}
                      >
                        <div className="text-center">
                          <Users className="w-6 h-6 mx-auto mb-2 text-technic-yellow" />
                          <div className="text-xs font-bold uppercase">References</div>
                          <div className="text-[8px] text-text-dim">Professional References</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => setFormData({...formData, experience: { ...formData.experience, verificationMethod: 'affidavit' }})}
                        className={`flex-1 p-3 rounded-xl border transition-all ${formData.experience.verificationMethod === 'affidavit' ? 'border-technic-yellow bg-technic-yellow/10' : 'border-white/10 bg-white/5'}`}
                      >
                        <div className="text-center">
                          <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-technic-yellow" />
                          <div className="text-xs font-bold uppercase">Affidavit</div>
                          <div className="text-[8px] text-text-dim">Sworn Statement</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Years of Experience</Label>
                    <Input 
                      type="number"
                      value={formData.experience.years}
                      onChange={(e) => setFormData({...formData, experience: { ...formData.experience, years: e.target.value }})}
                      className="bg-white/5 border-white/10 rounded-xl h-12"
                      placeholder="e.g. 5"
                    />
                  </div>

                  {formData.experience.verificationMethod === 'credentials' && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Certifications (comma separated)</Label>
                        <Input 
                          value={formData.experience.certifications.join(', ')}
                          onChange={(e) => setFormData({...formData, experience: { ...formData.experience, certifications: e.target.value.split(',').map(s => s.trim()) }})}
                          className="bg-white/5 border-white/10 rounded-xl h-12"
                          placeholder="e.g. ASE Master Technician, Bosch Certified"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Affiliations (comma separated)</Label>
                        <Input 
                          value={formData.experience.affiliations.join(', ')}
                          onChange={(e) => setFormData({...formData, experience: { ...formData.experience, affiliations: e.target.value.split(',').map(s => s.trim()) }})}
                          className="bg-white/5 border-white/10 rounded-xl h-12"
                          placeholder="e.g. SAMSA, RMI"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Accreditations (comma separated)</Label>
                        <Input 
                          value={formData.experience.accreditations.join(', ')}
                          onChange={(e) => setFormData({...formData, experience: { ...formData.experience, accreditations: e.target.value.split(',').map(s => s.trim()) }})}
                          className="bg-white/5 border-white/10 rounded-xl h-12"
                          placeholder="e.g. NAMB Accreditation, ISO Certified"
                        />
                      </div>
                    </>
                  )}

                  {formData.experience.verificationMethod === 'references' && (
                    <div className="space-y-2">
                      <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Professional References</Label>
                      <Textarea 
                        value={formData.experience.references.map(r => `${r.name}: ${r.contact}`).join('\n')}
                        onChange={(e) => {
                          const lines = e.target.value.split('\n');
                          const refs = lines.map(line => {
                            const [name, contact] = line.split(': ');
                            return { name: name || '', contact: contact || '' };
                          });
                          setFormData({...formData, experience: { ...formData.experience, references: refs }});
                        }}
                        className="bg-white/5 border-white/10 rounded-xl min-h-[80px]"
                        placeholder="Name: Contact Info (one per line)"
                      />
                    </div>
                  )}

                  {formData.experience.verificationMethod === 'affidavit' && (
                    <div className="space-y-2">
                      <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Affidavit Details</Label>
                      <Textarea 
                        value={formData.experience.accomplishments}
                        onChange={(e) => setFormData({...formData, experience: { ...formData.experience, accomplishments: e.target.value }})}
                        className="bg-white/5 border-white/10 rounded-xl min-h-[80px]"
                        placeholder="Describe your experience and any supporting details for affidavit..."
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Key Accomplishments</Label>
                    <Textarea 
                      value={formData.experience.accomplishments}
                      onChange={(e) => setFormData({...formData, experience: { ...formData.experience, accomplishments: e.target.value }})}
                      className="bg-white/5 border-white/10 rounded-xl min-h-[80px]"
                      placeholder="Describe your notable achievements..."
                    />
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
            ) : (
              <div className="bento-card">
                <div className="bento-card-title"><div className="bento-dot"></div> Apprenticeship Setup</div>
                <p className="text-xs text-text-dim mb-6 leading-relaxed uppercase tracking-widest font-bold">Connect with a mentor or self-nominate for skills development.</p>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Nomination Type</Label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setFormData({...formData, apprentice: { ...formData.apprentice, nomination: 'self' }})}
                        className={`flex-1 p-3 rounded-xl border transition-all ${formData.apprentice.nomination === 'self' ? 'border-technic-yellow bg-technic-yellow/10' : 'border-white/10 bg-white/5'}`}
                      >
                        <div className="text-center">
                          <Users className="w-6 h-6 mx-auto mb-2 text-technic-yellow" />
                          <div className="text-xs font-bold uppercase">Self Nominated</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => setFormData({...formData, apprentice: { ...formData.apprentice, nomination: 'co-opted' }})}
                        className={`flex-1 p-3 rounded-xl border transition-all ${formData.apprentice.nomination === 'co-opted' ? 'border-technic-yellow bg-technic-yellow/10' : 'border-white/10 bg-white/5'}`}
                      >
                        <div className="text-center">
                          <Award className="w-6 h-6 mx-auto mb-2 text-technic-yellow" />
                          <div className="text-xs font-bold uppercase">Co-opted by Mechanic</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {formData.apprentice.nomination === 'co-opted' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Mentor Name</Label>
                        <Input 
                          value={formData.apprentice.mentorName}
                          onChange={(e) => setFormData({...formData, apprentice: { ...formData.apprentice, mentorName: e.target.value }})}
                          className="bg-white/5 border-white/10 rounded-xl h-12"
                          placeholder="Full name of your mentor"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Mentor Contact</Label>
                        <Input 
                          value={formData.apprentice.mentorId}
                          onChange={(e) => setFormData({...formData, apprentice: { ...formData.apprentice, mentorId: e.target.value }})}
                          className="bg-white/5 border-white/10 rounded-xl h-12"
                          placeholder="Email or phone of mentor"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Training Path</Label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setFormData({...formData, apprentice: { ...formData.apprentice, trainingPath: 'traditional' }})}
                        className={`flex-1 p-3 rounded-xl border transition-all ${formData.apprentice.trainingPath === 'traditional' ? 'border-technic-yellow bg-technic-yellow/10' : 'border-white/10 bg-white/5'}`}
                      >
                        <div className="text-center">
                          <Wrench className="w-6 h-6 mx-auto mb-2 text-technic-yellow" />
                          <div className="text-xs font-bold uppercase">Traditional</div>
                          <div className="text-[8px] text-text-dim">Formal apprenticeship</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => setFormData({...formData, apprentice: { ...formData.apprentice, trainingPath: 'practical' }})}
                        className={`flex-1 p-3 rounded-xl border transition-all ${formData.apprentice.trainingPath === 'practical' ? 'border-technic-yellow bg-technic-yellow/10' : 'border-white/10 bg-white/5'}`}
                      >
                        <div className="text-center">
                          <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-technic-yellow" />
                          <div className="text-xs font-bold uppercase">Practical</div>
                          <div className="text-[8px] text-text-dim">Workplace experience</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Age Started Training</Label>
                    <Input 
                      type="number"
                      value={formData.apprentice.startAge}
                      onChange={(e) => setFormData({...formData, apprentice: { ...formData.apprentice, startAge: e.target.value }})}
                      className="bg-white/5 border-white/10 rounded-xl h-12"
                      placeholder="e.g. 18"
                    />
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
            )
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
