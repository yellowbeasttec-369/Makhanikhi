import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Star, Shield, Award, Wrench, Users, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';

interface SpecialistProfileProps {
  profile: UserProfile;
}

export const SpecialistProfile: React.FC<SpecialistProfileProps> = ({ profile }) => {
  return (
    <div className="bento-card overflow-hidden !p-0">
      <div className="h-24 bg-technic-yellow/10 border-b border-border-dim relative">
        <div className="absolute -bottom-10 left-6">
          <Avatar className="h-20 w-20 border-4 border-industrial-charcoal">
            <AvatarImage src={profile.photoURL} />
            <AvatarFallback className="bg-white/10 text-xl font-black">{profile.displayName[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <div className="p-6 pt-12 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-display font-black tracking-tight flex items-center gap-2 uppercase">
              {profile.displayName} 
              {profile.isVerified ? (
                <Shield className="w-5 h-5 text-success-green" />
              ) : (
                profile.verificationStatus === 'pending' && <Loader2 className="w-4 h-4 text-technic-yellow animate-spin" />
              )}
            </h2>
            <p className="text-technic-yellow font-bold text-xs uppercase tracking-widest">{profile.specialization || 'Master Mechanic'}</p>
          </div>
          <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
            <Star className="w-4 h-4 text-technic-yellow fill-technic-yellow" />
            <span className="font-bold text-sm">{profile.rating || '5.0'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mb-1">Experience</p>
            <p className="font-display font-bold">{profile.experience || '12+'} Years</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mb-1">Apprentices</p>
            <p className="font-display font-bold">3 Trained</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-text-dim uppercase tracking-widest">About</h4>
          <p className="text-sm text-digital-white/70 leading-relaxed">
            {profile.bio || "Specialist in high-performance engines and complex diagnostics. Committed to skills transfer and safety-first mobile servicing."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="bento-badge !mb-0 flex items-center gap-1"><Award className="w-3 h-3" /> ASE Certified</div>
          <div className="bento-badge !mb-0 flex items-center gap-1"><Users className="w-3 h-3" /> Master Mentor</div>
        </div>
      </div>
    </div>
  );
};
