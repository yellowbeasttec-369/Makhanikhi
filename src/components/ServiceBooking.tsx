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
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Wrench, Car, MapPin, ClipboardList, CheckCircle2, Loader2, Search, Calendar, Clock as ClockIcon, ShieldCheck, Camera as CameraIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateSmartContract } from '../services/gemini';
import { QuoteInvoice } from './QuoteInvoice';
import { ScrollArea } from './ui/scroll-area';
import { CameraCapture } from './CameraCapture';

const POPULAR_VEHICLES = [
  { make: 'Toyota', models: ['Hilux', 'Corolla', 'Fortuner', 'Starlet'] },
  { make: 'Volkswagen', models: ['Polo', 'Golf', 'Amarok', 'Tiguan'] },
  { make: 'Ford', models: ['Ranger', 'Everest', 'EcoSport', 'Fiesta'] },
  { make: 'BMW', models: ['3 Series', 'X5', '1 Series', 'X3'] },
  { make: 'Mercedes-Benz', models: ['C-Class', 'E-Class', 'GLC', 'A-Class'] },
  { make: 'Hyundai', models: ['i20', 'Tucson', 'Venue', 'Creta'] },
  { make: 'Nissan', models: ['NP200', 'Navara', 'Magnite', 'Qashqai'] },
];

export const ServiceBooking: React.FC = () => {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [formData, setFormData] = useState({
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    serviceType: 'minor',
    description: '',
    location: '',
    appointmentDate: '',
    appointmentTime: '',
    isOwnershipVerified: false,
    ownershipDocUrl: '',
  });
  const [smartContract, setSmartContract] = useState<any>(null);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [showVehicleResults, setShowVehicleResults] = useState(false);

  const filteredVehicles = POPULAR_VEHICLES.filter(v => 
    v.make.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
    v.models.some(m => m.toLowerCase().includes(vehicleSearch.toLowerCase()))
  );

  const selectVehicle = (make: string, model: string) => {
    setFormData({ ...formData, vehicleMake: make, vehicleModel: model });
    setVehicleSearch(`${make} ${model}`);
    setShowVehicleResults(false);
  };

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
        appointmentDate: `${formData.appointmentDate}T${formData.appointmentTime}`,
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
              <div className="bento-card-title"><div className="bento-dot"></div> VEHICLE SEARCH & DETAILS</div>
              <h2 className="text-2xl font-display font-black mb-4 uppercase">The Machine</h2>
              <div className="space-y-4">
                <div className="relative">
                  <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Search Vehicle</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                    <Input 
                      placeholder="Search Make or Model..." 
                      className="bg-white/5 border-white/10 pl-10 rounded-xl"
                      value={vehicleSearch}
                      onChange={(e) => {
                        setVehicleSearch(e.target.value);
                        setShowVehicleResults(true);
                      }}
                      onFocus={() => setShowVehicleResults(true)}
                    />
                  </div>
                  {showVehicleResults && vehicleSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-industrial-charcoal border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                      <ScrollArea className="h-[200px]">
                        {filteredVehicles.map((v) => (
                          <div key={v.make} className="p-2">
                            <p className="text-[10px] font-bold text-technic-yellow px-2 uppercase tracking-widest">{v.make}</p>
                            {v.models.filter(m => m.toLowerCase().includes(vehicleSearch.toLowerCase()) || v.make.toLowerCase().includes(vehicleSearch.toLowerCase())).map(m => (
                              <button
                                key={m}
                                onClick={() => selectVehicle(v.make, m)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors rounded-lg"
                              >
                                {v.make} {m}
                              </button>
                            ))}
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-technic-yellow/5 border border-technic-yellow/20">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-technic-yellow" />
                      <span className="text-xs font-bold uppercase tracking-widest text-technic-yellow">Ownership Verification</span>
                    </div>
                    {formData.ownershipDocUrl && (
                      <Badge className="bg-success-green text-industrial-charcoal text-[8px] h-4">CAPTURED</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-digital-white/60 mb-4 leading-relaxed uppercase tracking-tight">
                    To ensure worker safety and prevent unauthorized service, please verify vehicle ownership by scanning your logbook or registration document.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCamera(true)}
                    className="w-full border-technic-yellow/30 text-technic-yellow hover:bg-technic-yellow/10 font-bold text-[10px] h-10 uppercase tracking-widest"
                  >
                    <CameraIcon className="w-4 h-4 mr-2" /> {formData.ownershipDocUrl ? 'RE-SCAN LOGBOOK' : 'SCAN LOGBOOK'}
                  </Button>
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Preferred Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                      <Input 
                        type="date" 
                        className="bg-white/5 border-white/10 pl-10 rounded-xl"
                        value={formData.appointmentDate}
                        onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Preferred Time</Label>
                    <div className="relative">
                      <ClockIcon className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                      <Input 
                        type="time" 
                        className="bg-white/5 border-white/10 pl-10 rounded-xl"
                        value={formData.appointmentTime}
                        onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                      />
                    </div>
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
              <h2 className="text-2xl font-display font-black mb-4 uppercase">Smart Contract & Quote</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  {smartContract && <QuoteInvoice data={smartContract} />}
                </div>
                <div className="bento-danger-warning">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <p className="text-[10px]">
                    By proceeding, you agree to the call-out fee and diagnostic quote. This agreement is digitally signed and binding.
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

      {showCamera && (
        <CameraCapture 
          title="Scan Registration Document"
          onCapture={(img) => setFormData({ ...formData, ownershipDocUrl: img, isOwnershipVerified: false })}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};
