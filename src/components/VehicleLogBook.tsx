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
  const { user, profile } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddLog, setShowAddLog] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    mileage: ''
  });
  const [newLog, setNewLog] = useState({
    vehicleId: '',
    type: '',
    mileage: '',
    cost: '',
    specialist: '',
    date: new Date().toISOString().split('T')[0],
    tasks: [] as { id: string; title: string; status: 'pending' | 'completed' | 'signed-off' }[]
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
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

  const handleAddVehicle = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'vehicles'), {
        ...newVehicle,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        isOwnershipVerified: false,
        verificationStatus: 'unverified'
      });
      toast.success("Vehicle added to your garage!");
      setShowAddVehicle(false);
      setNewVehicle({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        mileage: ''
      });
    } catch (error) {
      toast.error("Failed to add vehicle.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLog = async () => {
    if (!user) return;
    if (!newLog.vehicleId) {
      toast.error("Please select a vehicle.");
      return;
    }
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
        vehicleId: '',
        type: '',
        mileage: '',
        cost: '',
        specialist: '',
        date: new Date().toISOString().split('T')[0],
        tasks: []
      });
    } catch (error) {
      console.error("Error adding log:", error);
      toast.error("Failed to add log entry.");
    } finally {
      setSubmitting(false);
    }
  };

  const addTaskToLog = () => {
    if (!newTaskTitle) return;
    setNewLog({
      ...newLog,
      tasks: [...newLog.tasks, { id: Math.random().toString(36).substr(2, 9), title: newTaskTitle, status: 'pending' }]
    });
    setNewTaskTitle('');
  };

  const toggleTaskStatus = (logId: string, taskId: string, currentStatus: string) => {
    const log = logs.find(l => l.id === logId);
    if (!log) return;

    const updatedTasks = log.tasks.map((t: any) => {
      if (t.id === taskId) {
        // Apprentice marks as completed
        if (currentStatus === 'pending' && profile?.role === 'apprentice') {
          return { ...t, status: 'completed' };
        }
        // Specialist signs off
        if (currentStatus === 'completed' && profile?.role === 'specialist') {
          return { ...t, status: 'signed-off' };
        }
        // Specialist can also mark as completed if no apprentice
        if (currentStatus === 'pending' && profile?.role === 'specialist') {
          return { ...t, status: 'completed' };
        }
        return t;
      }
      return t;
    });

    updateDoc(doc(db, 'vehicleLogs', logId), { tasks: updatedTasks });
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
          <div className="flex justify-between items-center mb-4">
            <div className="bento-card-title"><div className="bento-dot"></div> VEHICLE OWNERSHIP VERIFICATION</div>
            <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
              <DialogTrigger render={<Button size="sm" className="bg-white/10 text-digital-white font-bold rounded-xl text-[10px] h-7" />}>
                <Plus className="w-3 h-3 mr-1" /> ADD VEHICLE
              </DialogTrigger>
              <DialogContent className="bg-industrial-charcoal border-white/10 text-digital-white">
                <DialogHeader>
                  <DialogTitle className="uppercase font-display font-black">Add New Vehicle</DialogTitle>
                  <DialogDescription className="text-text-dim">Register a new machine in your digital garage.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-text-dim">Make</Label>
                      <Input placeholder="e.g. Toyota" className="bg-white/5 border-white/10" value={newVehicle.make} onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-text-dim">Model</Label>
                      <Input placeholder="e.g. Hilux" className="bg-white/5 border-white/10" value={newVehicle.model} onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-text-dim">Year</Label>
                      <Input type="number" className="bg-white/5 border-white/10" value={newVehicle.year} onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-text-dim">Current Mileage</Label>
                      <Input type="number" className="bg-white/5 border-white/10" value={newVehicle.mileage} onChange={(e) => setNewVehicle({...newVehicle, mileage: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-text-dim">VIN Number (17 Characters)</Label>
                    <Input 
                      placeholder="Enter VIN for parts sourcing..." 
                      className="bg-white/5 border-white/10 font-mono" 
                      value={newVehicle.vin} 
                      onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value.toUpperCase()})} 
                      maxLength={17}
                    />
                    <p className="text-[9px] text-technic-yellow/60 italic">Essential for sourcing specialized parts correctly.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddVehicle(false)} className="border-white/10">CANCEL</Button>
                  <Button onClick={handleAddVehicle} disabled={submitting} className="bg-technic-yellow text-industrial-charcoal font-bold">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ADD TO GARAGE'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-4">
            {vehicles.map((v) => (
              <div key={v.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className={`p-2 rounded-lg ${v.isOwnershipVerified ? 'bg-success-green/10 text-success-green' : 'bg-technic-yellow/10 text-technic-yellow'}`}>
                    {v.isOwnershipVerified ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm uppercase">{v.make} {v.model}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-text-dim uppercase tracking-widest">
                        {v.isOwnershipVerified ? 'Verified Owner' : v.verificationStatus === 'pending' ? 'Verification Pending' : 'Action Required'}
                      </p>
                      <span className="text-[9px] text-technic-yellow font-mono">VIN: {v.vin || 'N/A'}</span>
                    </div>
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
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-text-dim">Select Vehicle</Label>
                    <select 
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-md px-3 text-sm"
                      value={newLog.vehicleId}
                      onChange={(e) => setNewLog({...newLog, vehicleId: e.target.value})}
                    >
                      <option value="" className="bg-industrial-charcoal">Choose a vehicle...</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id} className="bg-industrial-charcoal">
                          {v.make} {v.model} ({v.vin?.slice(-6) || 'No VIN'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-text-dim">Date</Label>
                      <Input type="date" className="bg-white/5 border-white/10" value={newLog.date} onChange={(e) => setNewLog({...newLog, date: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-text-dim">Mileage (KM)</Label>
                      <Input type="number" placeholder="e.g. 85000" className="bg-white/5 border-white/10" value={newLog.mileage} onChange={(e) => setNewLog({...newLog, mileage: e.target.value})} />
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

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <Label className="text-[10px] uppercase font-bold text-technic-yellow">Workplace Tasks (Apprentice/Specialist)</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add a task (e.g. Brake Pad Replacement)" 
                        className="bg-white/5 border-white/10 h-8 text-xs" 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTaskToLog()}
                      />
                      <Button size="sm" onClick={addTaskToLog} className="h-8 bg-white/10 hover:bg-white/20">ADD</Button>
                    </div>
                    <div className="space-y-1 mt-2">
                      {newLog.tasks.map((task, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                          <span className="text-[11px]">{task.title}</span>
                          <Badge variant="outline" className="text-[8px] uppercase">Pending</Badge>
                        </div>
                      ))}
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
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest">Vehicle & VIN</TableHead>
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest">Service Type</TableHead>
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest">Workplace Tasks</TableHead>
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
                logs.map((record, i) => {
                  const vehicle = vehicles.find(v => v.id === record.vehicleId);
                  return (
                    <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-mono text-xs">{record.date}</TableCell>
                      <TableCell>
                        <div className="font-bold text-xs uppercase">{vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown'}</div>
                        <div className="text-[9px] text-technic-yellow font-mono">{vehicle?.vin || 'NO VIN'}</div>
                      </TableCell>
                      <TableCell className="font-bold text-xs">{record.type}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {record.tasks?.map((task: any) => (
                            <div key={task.id} className="flex items-center gap-2">
                              <button 
                                onClick={() => toggleTaskStatus(record.id, task.id, task.status)}
                                className={`w-3 h-3 rounded-sm border ${task.status === 'signed-off' ? 'bg-success-green border-success-green' : task.status === 'completed' ? 'bg-technic-yellow border-technic-yellow' : 'border-white/20'}`}
                              />
                              <span className={`text-[9px] uppercase font-bold ${task.status === 'signed-off' ? 'text-success-green' : task.status === 'completed' ? 'text-technic-yellow' : 'text-text-dim'}`}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                          {(!record.tasks || record.tasks.length === 0) && <span className="text-[9px] text-text-dim italic">No tasks recorded</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-technic-yellow">R {parseFloat(record.cost).toLocaleString()}</TableCell>
                    </TableRow>
                  );
                })
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
