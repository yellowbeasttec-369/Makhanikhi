import React, { useState } from 'react';
import { 
  Car, FileText, CheckCircle2, ShieldCheck, ExternalLink, 
  Upload, AlertTriangle, Key, Hash, Building2, Calendar, 
  DollarSign, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

export const ServiceVehicleAgreement: React.FC = () => {
  const [agreement, setAgreement] = useState({
    isRenting: true,
    lessorName: 'Apex Commercial Fleet Leasing & Tool Transport',
    lessorContact: '+27 11 884 9000 / contracts@apexfleet.co.za',
    vehicleMake: 'Ford',
    vehicleModel: 'Ranger 2.2 TDCi Single Cab Workhorse',
    registrationNumber: 'DX 49 TY GP',
    vinNumber: 'AFBXXMJ2X8819402',
    rentalRate: 450, // ZAR / ZARU per day
    agreementDate: '2026-03-01',
    expiryDate: '2026-08-31',
    storageBucketUri: 'gs://makhanikhi-vault/vehicle-leases/LEASE-2026-RANGER-8819.pdf',
    processedTxHash: '5HqVp8m2K9xPt87VnL2dRt4uY3pL7hVd9CfbM2vQ1eZbT',
    status: 'verified' as 'verified' | 'pending_upload' | 'expired'
  });

  const [showLogForm, setShowLogForm] = useState(false);
  const [formData, setFormData] = useState({ ...agreement });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAgreement({ ...formData, status: 'verified' });
    setShowLogForm(false);
    toast.success('Service vehicle rental agreement processed and stored in vault!');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-industrial-charcoal via-industrial-charcoal/90 to-blue-950/20 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[10px] uppercase">
                Mechanic Operations
              </Badge>
              <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 text-[10px]">
                {agreement.isRenting ? 'Commercial Lease Active' : 'Self-Owned Vehicle'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-digital-white uppercase tracking-tight">
              Service Vehicle & Rental Lease
            </h1>
            <p className="text-text-dim text-xs sm:text-sm max-w-2xl mt-1">
              Mechanics operating leased or rented utility vehicles must log their commercial lease agreement. 
              The platform records the processed state hash on-chain, while keeping the full document in the secure storage bucket.
            </p>
          </div>

          <Button
            onClick={() => setShowLogForm(!showLogForm)}
            className="bg-technic-yellow text-industrial-charcoal font-black text-xs uppercase px-5 h-11 shrink-0"
          >
            {showLogForm ? 'Close Editor' : 'Update Lease Agreement'}
          </Button>
        </div>
      </div>

      {/* Storage Bucket & On-Chain Hashing Policy Card */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase">
          <ShieldCheck className="w-4 h-4" />
          Strict Privacy Architecture: Storage Bucket vs. On-Chain Hashing
        </div>
        <p className="text-xs text-text-dim leading-relaxed">
          Every platform transaction and state transition is strictly hashed on-chain (<strong>txHash</strong>). 
          However, <strong>uploaded contracts and vehicle rental agreements are NEVER hashed on-chain</strong> to prevent exposing private commercial agreements or proprietary trade terms. 
          Instead, all documents are securely preserved in the cloud storage bucket for audit and dispute verification.
        </p>
      </div>

      {/* Active Agreement Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/5 border-white/10">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex justify-between items-center">
              <Badge className="bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase">
                ✓ VERIFIED LEASE AGREEMENT
              </Badge>
              <span className="text-xs font-mono text-text-dim">Term: {agreement.agreementDate} → {agreement.expiryDate}</span>
            </div>
            <CardTitle className="text-lg font-bold uppercase text-white mt-2 flex items-center gap-2">
              <Car className="w-5 h-5 text-technic-yellow" />
              {agreement.vehicleMake} {agreement.vehicleModel}
            </CardTitle>
            <CardDescription className="text-xs">
              Dedicated Service Bakkie • Reg: <span className="text-white font-mono font-bold">{agreement.registrationNumber}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-dim">Lessor Company</span>
                <p className="font-bold text-white text-sm">{agreement.lessorName}</p>
                <p className="text-[11px] text-text-dim">{agreement.lessorContact}</p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-text-dim">Commercial Lease Terms</span>
                <p className="font-bold text-technic-yellow text-sm font-mono">
                  R {agreement.rentalRate}.00 / Day (ZARU)
                </p>
                <p className="text-[11px] text-text-dim">Includes commercial insurance & tool transit waiver</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-text-dim">Vehicle Identification (VIN):</span>
                <span className="font-mono text-white font-bold">{agreement.vinNumber}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-text-dim">Cloud Storage Bucket Reference:</span>
                <span className="font-mono text-blue-400 truncate max-w-xs">{agreement.storageBucketUri}</span>
              </div>
              <div className="flex justify-between text-[11px] border-t border-white/5 pt-2">
                <span className="text-text-dim">Processed On-Chain State Hash:</span>
                <span className="font-mono text-technic-yellow font-bold truncate max-w-xs">{agreement.processedTxHash}</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info(`Accessing bucket document: ${agreement.storageBucketUri}`)}
                className="text-xs border-white/10 hover:bg-white/10 text-white font-bold"
              >
                <FileText className="w-3.5 h-3.5 mr-1 text-blue-400" /> View Bucket Agreement PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Inspection & Demarcation Card */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-sm font-bold uppercase text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-technic-yellow" /> Vehicle Tool Readiness
            </CardTitle>
            <CardDescription className="text-xs">
              Requirements for mobile response vehicles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs text-text-dim leading-relaxed">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Heavy-Duty Oil Spill Mats onboard</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Branded Rapid-Deploy Gazebo tied down</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Certified Multi-Tier Roll-Cab Toolbox secured</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Roadside hazard triangles & safety vest kit</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor Modal / Section */}
      {showLogForm && (
        <Card className="bg-white/5 border-technic-yellow/30">
          <CardHeader>
            <CardTitle className="text-base font-bold uppercase text-white">
              Log or Update Rental Service Vehicle
            </CardTitle>
            <CardDescription className="text-xs">
              Upload signed rental agreement to cloud storage bucket.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-text-dim">Lessor Name / Fleet Owner</Label>
                  <Input 
                    value={formData.lessorName} 
                    onChange={e => setFormData({ ...formData, lessorName: e.target.value })}
                    className="h-8 bg-black/40 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-text-dim">Lessor Contact Info</Label>
                  <Input 
                    value={formData.lessorContact} 
                    onChange={e => setFormData({ ...formData, lessorContact: e.target.value })}
                    className="h-8 bg-black/40 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-text-dim">Vehicle Model</Label>
                  <Input 
                    value={formData.vehicleModel} 
                    onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })}
                    className="h-8 bg-black/40 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-text-dim">Registration Plate</Label>
                  <Input 
                    value={formData.registrationNumber} 
                    onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="h-8 bg-black/40 border-white/10 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-text-dim">Daily Lease Rate (ZAR / ZARU)</Label>
                  <Input 
                    type="number"
                    value={formData.rentalRate} 
                    onChange={e => setFormData({ ...formData, rentalRate: parseFloat(e.target.value) || 0 })}
                    className="h-8 bg-black/40 border-white/10 text-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-text-dim">Storage Bucket URI (PDF)</Label>
                  <Input 
                    value={formData.storageBucketUri} 
                    onChange={e => setFormData({ ...formData, storageBucketUri: e.target.value })}
                    className="h-8 bg-black/40 border-white/10 text-blue-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowLogForm(false)}
                  className="h-8 text-xs border-white/10 text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="h-8 text-xs bg-technic-yellow text-industrial-charcoal font-black uppercase"
                >
                  Save Lease Record
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
