import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { User, MapPin, Phone, ShieldCheck, ArrowRight, Loader2, Camera, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CameraCapture } from './CameraCapture';

export const OwnerRegistration: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    phone: '',
    address: '',
    bio: '',
    photoURL: profile?.photoURL || '',
  });

  const onCapture = (imageData: string) => {
    setFormData({ ...formData, photoURL: imageData });
  };

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        ...formData,
        role: 'owner', // Re-enforce role
        isProfileComplete: true,
      });
      toast.success("Profile updated successfully!");
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      {showCamera && (
        <CameraCapture 
          title="Profile Photo"
          onCapture={onCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-technic-yellow/10 border border-technic-yellow/20 text-technic-yellow text-[10px] font-bold uppercase tracking-widest mb-4">
          <ShieldCheck className="w-3 h-3" /> Secure Registration
        </div>
        <h1 className="text-4xl font-display font-black uppercase tracking-tighter mb-2 text-digital-white">Car Owner Portal</h1>
        <p className="text-text-dim">Complete your professional profile for service priority.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento-card"
      >
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
              <MapPin className="w-3 h-3" /> Primary Service Location
            </Label>
            <Input 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="bg-white/5 border-white/10 rounded-xl h-12"
              placeholder="Street name, City, Code"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">About You (Optional)</Label>
            <Textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="bg-white/5 border-white/10 rounded-xl min-h-[100px]"
              placeholder="Mention special vehicle care needs or preferences..."
            />
          </div>

          <div className="pt-4 flex flex-col gap-4">
            <Button onClick={handleSave} disabled={loading} className="bento-btn h-14 text-sm">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'COMPLETE REGISTRATION'} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Link to="/dashboard" className="text-[10px] text-text-dim text-center uppercase tracking-widest hover:text-technic-yellow transition-colors font-bold">
              Skip for now
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
