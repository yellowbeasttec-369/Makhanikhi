import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Wrench, Car, MapPin, ClipboardList, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateSmartContract } from '../services/gemini';

export const ServiceBooking: React.FC = () => {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    serviceType: 'minor',
    description: '',
    location: '',
  });
  const [smartContract, setSmartContract] = useState<string | null>(null);

  const handleNext = async () => {
    if (step === 2) {
      setLoading(true);
      try {
        const contract = await generateSmartContract(formData);
        setSmartContract(contract);
        setStep(3);
      } catch (error) {
        toast.error("Failed to generate service agreement.");
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'serviceRequests'), {
        ...formData,
        ownerId: profile?.uid,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: serverTimestamp(),
        smartContract,
      });
      toast.success("Service request submitted successfully!");
      setStep(4);
    } catch (error) {
      toast.error("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="flex justify-between mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 z-0" />
        {[1, 2, 3].map((s) => (
          <div 
            key={s} 
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= s ? 'bg-technic-yellow text-industrial-charcoal' : 'bg-white/10 text-white/40'
            }`}
          >
            {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> VEHICLE DETAILS</div>
              <h2 className="text-2xl font-display font-black mb-4 uppercase">The Machine</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Make</Label>
                    <Input 
                      placeholder="e.g. Toyota" 
                      className="bg-white/5 border-white/10 rounded-xl"
                      value={formData.vehicleMake}
                      onChange={(e) => setFormData({...formData, vehicleMake: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Model</Label>
                    <Input 
                      placeholder="e.g. Hilux" 
                      className="bg-white/5 border-white/10 rounded-xl"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Year</Label>
                  <Input 
                    type="number" 
                    placeholder="2020" 
                    className="bg-white/5 border-white/10 rounded-xl"
                    value={formData.vehicleYear}
                    onChange={(e) => setFormData({...formData, vehicleYear: e.target.value})}
                  />
                </div>
                <Button onClick={handleNext} className="bento-btn mt-6">NEXT: SERVICE TYPE</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> SERVICE REQUIREMENTS</div>
              <h2 className="text-2xl font-display font-black mb-4 uppercase">Specialist Work</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Service Type</Label>
                  <Select onValueChange={(v) => setFormData({...formData, serviceType: v})}>
                    <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent className="bg-industrial-charcoal border-white/10 text-white">
                      <SelectItem value="minor">Minor Service</SelectItem>
                      <SelectItem value="major">Major Service</SelectItem>
                      <SelectItem value="overhaul">Engine Overhaul</SelectItem>
                      <SelectItem value="diagnostic">Diagnostic Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Faults / Requirements</Label>
                  <Textarea 
                    placeholder="Describe any specific issues..." 
                    className="bg-white/5 border-white/10 min-h-[100px] rounded-xl"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Service Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                    <Input 
                      placeholder="Enter address for call-out" 
                      className="bg-white/5 border-white/10 pl-10 rounded-xl"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 border-white/10 rounded-xl">BACK</Button>
                  <Button onClick={handleNext} disabled={loading} className="bento-btn flex-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'GENERATE AGREEMENT'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bento-card">
              <div className="bento-card-title"><div className="bento-dot"></div> DIGITAL SERVICE AGREEMENT</div>
              <h2 className="text-2xl font-display font-black mb-4 uppercase">Smart Contract</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 font-mono text-xs leading-relaxed whitespace-pre-wrap text-text-dim">
                  {smartContract}
                </div>
                <div className="bento-danger-warning">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <p className="text-[10px]">
                    By proceeding, you agree to the call-out fee and diagnostic quote. 
                  </p>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1 border-white/10 rounded-xl">BACK</Button>
                  <Button onClick={handleSubmit} disabled={loading} className="bento-btn flex-1">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CONFIRM & BOOK'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="bento-card text-center py-12">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-technic-yellow rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-12 h-12 text-industrial-charcoal" />
                </div>
                <div>
                  <h2 className="text-3xl font-display font-black uppercase">Booking Confirmed</h2>
                  <p className="text-text-dim text-sm mt-2">
                    A specialist and apprentice have been notified. 
                    You can track the status in your dashboard.
                  </p>
                </div>
                <Button onClick={() => window.location.href = '/dashboard'} className="bento-btn">
                  GO TO DASHBOARD
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
