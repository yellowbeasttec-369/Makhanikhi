import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { History, AlertCircle, TrendingDown, FileText, Plus, Loader2, ShieldCheck, ShieldAlert, Upload, Camera as CameraIcon } from 'lucide-react';
import { Button } from './ui/button';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { CameraCapture } from './CameraCapture';

export const VehicleLogBook: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddLog, setShowAddLog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [newLog, setNewLog] = useState({
    type: '',
    mileage: '',
    cost: '',
    specialist: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const vQ = query(collection(db, 'vehicles'), where('ownerId', '==', user.uid));
    const unsubVehicles = onSnapshot(vQ, (snap) => {
      setVehicles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const q = query(
      collection(db, 'vehicleLogs'),
      where('ownerId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(logData);
      setLoading(false);
    });

    return () => {
      unsubVehicles();
      unsubscribe();
    };
  }, [user]);

  const handleVerifyOwnership = async (vehicleId: string, docUrl: string) => {
    try {
      await updateDoc(doc(db, 'vehicles', vehicleId), {
        isOwnershipVerified: false,
        'ownershipDocs.registrationUrl': docUrl,
        verificationStatus: 'pending'
      });
      toast.success("Verification documents submitted for review.");
      setShowVerifyDialog(false);
    } catch (error) {
      toast.error("Failed to submit verification.");
    }
  };

  const handleAddLog = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'vehicleLogs'), {
        ...newLog,
        ownerId: user.uid,
        createdAt: serverTimestamp()
      });
      toast.success("Log entry added successfully!");
      setShowAddLog(false);
      setNewLog({
        type: '',
        mileage: '',
        cost: '',
        specialist: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error adding log:", error);
      toast.error("Failed to add log entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalInvestment = logs.reduce((acc, log) => acc + (parseFloat(log.cost.replace(/[^0-9.]/g, '')) || 0), 0);

  const faults = [
    { id: 1, component: 'Brake System', description: 'Rear pads at 15% life remaining', severity: 'medium' },
    { id: 2, component: 'Cooling System', description: 'Slight seepage at radiator top hose', severity: 'low' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card">
          <div className="bento-card-title"><div className="bento-dot"></div> VEHICLE OWNERSHIP VERIFICATION</div>
          <div className="space-y-4">
            {vehicles.map((v) => (
              <div key={v.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className={`p-2 rounded-lg ${v.isOwnershipVerified ? 'bg-success-green/10 text-success-green' : 'bg-technic-yellow/10 text-technic-yellow'}`}>
                    {v.isOwnershipVerified ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase">{v.make} {v.model}</h4>
                    <p className="text-[10px] text-text-dim uppercase tracking-widest">
                      {v.isOwnershipVerified ? 'Verified Owner' : v.verificationStatus === 'pending' ? 'Verification Pending' : 'Action Required'}
                    </p>
                  </div>
                </div>
                {!v.isOwnershipVerified && v.verificationStatus !== 'pending' && (
                  <Button 
                    size="sm" 
                    onClick={() => { setSelectedVehicleId(v.id); setShowVerifyDialog(true); }}
                    className="bg-technic-yellow text-industrial-charcoal font-bold text-[10px] h-7"
                  >
                    VERIFY
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bento-card">
          <div className="bento-card-title"><div className="bento-dot"></div> MAINTENANCE SPENDING</div>
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <p className="text-4xl font-display font-black">R {totalInvestment.toLocaleString()}</p>
              <p className="text-xs text-text-dim uppercase tracking-widest font-bold mt-2">Total Lifetime Investment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bento-card">
        <div className="flex flex-row items-center justify-between mb-4">
          <div className="bento-card-title"><div className="bento-dot"></div> SERVICE HISTORY LOG</div>
          <div className="flex gap-2">
            <Dialog open={showAddLog} onOpenChange={setShowAddLog}>
              <DialogTrigger render={<Button size="sm" className="bg-technic-yellow text-industrial-charcoal font-bold rounded-xl text-xs" />}>
                <Plus className="w-3 h-3 mr-2" /> ADD ENTRY
              </DialogTrigger>
              <DialogContent className="bg-industrial-charcoal border-white/10 text-digital-white">
                <DialogHeader>
                  <DialogTitle className="uppercase font-display font-black">Add Log Entry</DialogTitle>
                  <DialogDescription className="text-text-dim">Record a new maintenance or service event.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-text-dim">Date</Label>
                      <Input type="date" className="bg-white/5 border-white/10" value={newLog.date} onChange={(e) => setNewLog({...newLog, date: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-text-dim">Mileage (KM)</Label>
                      <Input placeholder="e.g. 85000" className="bg-white/5 border-white/10" value={newLog.mileage} onChange={(e) => setNewLog({...newLog, mileage: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-text-dim">Service Type</Label>
                    <Input placeholder="e.g. Oil Change" className="bg-white/5 border-white/10" value={newLog.type} onChange={(e) => setNewLog({...newLog, type: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-text-dim">Specialist/Shop</Label>
                      <Input placeholder="e.g. Makhanikhi" className="bg-white/5 border-white/10" value={newLog.specialist} onChange={(e) => setNewLog({...newLog, specialist: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-text-dim">Cost (R)</Label>
                      <Input placeholder="e.g. 1500" className="bg-white/5 border-white/10" value={newLog.cost} onChange={(e) => setNewLog({...newLog, cost: e.target.value})} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddLog(false)} className="border-white/10">CANCEL</Button>
                  <Button onClick={handleAddLog} disabled={submitting} className="bg-technic-yellow text-industrial-charcoal font-bold">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SAVE ENTRY'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="border-white/10 text-xs rounded-xl">
              <FileText className="w-3 h-3 mr-2" /> EXPORT PDF
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest">Date</TableHead>
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest">Service Type</TableHead>
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest">Specialist</TableHead>
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest">Mileage</TableHead>
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-technic-yellow" />
                  </TableCell>
                </TableRow>
              ) : logs.length > 0 ? (
                logs.map((record, i) => (
                  <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="font-mono text-xs">{record.date}</TableCell>
                    <TableCell className="font-bold">{record.type}</TableCell>
                    <TableCell className="text-text-dim text-xs">{record.specialist}</TableCell>
                    <TableCell className="text-text-dim text-xs">{record.mileage} KM</TableCell>
                    <TableCell className="text-right font-bold text-technic-yellow">R {parseFloat(record.cost).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-text-dim italic">
                    No service records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="bg-industrial-charcoal border-white/10 text-digital-white">
          <DialogHeader>
            <DialogTitle className="uppercase font-display font-black">Verify Car Ownership</DialogTitle>
            <DialogDescription className="text-text-dim">
              Upload your vehicle registration document or logbook to verify ownership and ensure worker safety.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-technic-yellow/50 transition-all cursor-pointer group" onClick={() => setShowCamera(true)}>
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CameraIcon className="w-8 h-8 text-technic-yellow" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold uppercase tracking-widest">Capture Document</p>
                <p className="text-[10px] text-text-dim mt-1">USE YOUR CAMERA TO SCAN LOGBOOK</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <Button variant="outline" className="w-full border-white/10 h-12 font-bold uppercase tracking-widest text-xs">
              <Upload className="w-4 h-4 mr-2" /> Upload PDF/Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showCamera && (
        <CameraCapture 
          title="Scan Registration Document"
          onCapture={(img) => selectedVehicleId && handleVerifyOwnership(selectedVehicleId, img)}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};
