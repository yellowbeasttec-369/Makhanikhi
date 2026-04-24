import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Wrench, Car, ClipboardCheck, History, TrendingUp, UserCheck, AlertTriangle, Shield, Clock, CheckCircle2, PlayCircle, XCircle, MapPin, Loader2, Users, Award, BarChart3, Camera as CameraIcon, Menu, LogOut, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import { VehicleLogBook } from './VehicleLogBook';
import { SpecialistProfile } from './SpecialistProfile';
import { SkillsValidation } from './SkillsValidation';
import { FleetManager } from './FleetManager';
import { OHSAGuidelines } from './OHSAGuidelines';
import { CameraCapture } from './CameraCapture';
import { CalendarView } from './CalendarView';
import { ServiceRequest, UserProfile, ApprenticeTask } from '../types';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showApprenticeDialog, setShowApprenticeDialog] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [availableApprentices, setAvailableApprentices] = useState<UserProfile[]>([]);
  const [selectedApprenticeId, setSelectedApprenticeId] = useState<string | null>(null);
  const [showOHSA, setShowOHSA] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [specialistSignature, setSpecialistSignature] = useState('');

  const isSpecialist = profile?.role === 'specialist' || profile?.role === 'apprentice';

  const signContractAsSpecialist = async (requestId: string) => {
    if (!specialistSignature.trim()) {
      toast.error("Please provide your signature.");
      return;
    }
    setIsSigning(true);
    try {
      await updateDoc(doc(db, 'serviceRequests', requestId), {
        'signatures.specialist': {
          uid: user?.uid,
          timestamp: new Date().toISOString(),
          name: specialistSignature
        },
        contractSigned: true
      });
      toast.success("Contract signed and work authorized.");
      setSpecialistSignature('');
    } catch (error) {
      toast.error("Failed to sign contract.");
    } finally {
      setIsSigning(false);
    }
  };
  const isOwner = profile?.role === 'owner';

  const fetchApprentices = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'apprentice'), where('isVerified', '==', true));
      const querySnapshot = await getDocs(q);
      const apps = querySnapshot.docs.map(doc => doc.data() as UserProfile);
      setAvailableApprentices(apps);
    } catch (error) {
      console.error("Error fetching apprentices:", error);
    }
  };

  const handleAcceptJobClick = (requestId: string) => {
    if (profile?.role === 'specialist') {
      setSelectedJobId(requestId);
      fetchApprentices();
      setShowApprenticeDialog(true);
    } else {
      handleAcceptJob(requestId, null);
    }
  };

  const handleAcceptJob = async (requestId: string, apprenticeId: string | null) => {
    if (!user) return;
    setProcessingId(requestId);
    try {
      const requestRef = doc(db, 'serviceRequests', requestId);
      const initialTasks: ApprenticeTask[] = [
        { id: 't1', title: 'Site Safety Setup', description: 'Barricading and PPE check', status: 'pending' },
        { id: 't2', title: 'Diagnostic Scan', description: 'Initial OBD-II scan and fault logging', status: 'pending' },
        { id: 't3', title: 'Work Area Prep', description: 'Oil spill mats and tool layout', status: 'pending' }
      ];

      await updateDoc(requestRef, {
        status: 'in-progress',
        specialistId: user.uid,
        apprenticeId: apprenticeId || (profile?.role === 'apprentice' ? user.uid : null),
        tasks: initialTasks
      });
      toast.success("Job accepted! Time to get to work.");
      setShowApprenticeDialog(false);
    } catch (error) {
      console.error("Error accepting job:", error);
      toast.error("Failed to accept job. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'serviceRequests'),
      where(isSpecialist ? 'specialistId' : 'ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceRequest[];
      setRequests(reqs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching requests:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isSpecialist]);

  const signOffTask = async (requestId: string, taskId: string) => {
    if (!user || profile?.role !== 'specialist') return;
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request || !request.tasks) return;

      const updatedTasks = request.tasks.map(t => 
        t.id === taskId ? { 
          ...t, 
          status: 'signed-off' as const, 
          specialistSignOff: { uid: user.uid, timestamp: new Date().toISOString() } 
        } : t
      );

      await updateDoc(doc(db, 'serviceRequests', requestId), {
        tasks: updatedTasks
      });
      toast.success("Task signed off successfully.");
    } catch (error) {
      toast.error("Failed to sign off task.");
    }
  };

  const markTaskCompleted = async (requestId: string, taskId: string) => {
    if (!user || profile?.role !== 'apprentice') return;
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request || !request.tasks) return;

      const updatedTasks = request.tasks.map(t => 
        t.id === taskId ? { ...t, status: 'completed' as const } : t
      );

      await updateDoc(doc(db, 'serviceRequests', requestId), {
        tasks: updatedTasks
      });
      toast.success("Task marked as completed.");
    } catch (error) {
      toast.error("Failed to update task.");
    }
  };

  const handleCaptureEvidence = async (imgUrl: string) => {
    if (!activeRequestId) return;
    try {
      const request = requests.find(r => r.id === activeRequestId);
      
      if (activeTaskId) {
        // Task evidence
        const updatedTasks = (request?.tasks || []).map(t => 
          t.id === activeTaskId ? { ...t, photoEvidence: imgUrl } : t
        );
        await updateDoc(doc(db, 'serviceRequests', activeRequestId), {
          tasks: updatedTasks
        });
        toast.success("Task evidence captured.");
      } else {
        // OHSA evidence
        const currentEvidence = request?.checklist?.ohsaCompliance?.photoEvidence || [];
        await updateDoc(doc(db, 'serviceRequests', activeRequestId), {
          'checklist.ohsaCompliance.photoEvidence': [...currentEvidence, imgUrl]
        });
        toast.success("OHSA evidence captured.");
      }
    } catch (error) {
      toast.error("Failed to save evidence.");
    } finally {
      setActiveTaskId(null);
    }
  };

  const handleLogout = () => signOut(auth);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><PlayCircle className="w-3 h-3" /> In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-success-green/10 text-success-green border-success-green/20 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelled</Badge>;
      default:
        return <Badge className="bg-white/10 text-white/40 border-white/20 px-2 py-0.5 rounded-full">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="flex justify-between items-end mb-8 border-b border-border-dim pb-4">
        <div className="makhanikhi-logo text-2xl text-technic-yellow uppercase tracking-tighter">Makhanikhi</div>
        <div className="powered-by text-[10px] tracking-[2px] text-text-dim uppercase">Powered by Yellow Beast R&D Studio</div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight uppercase">Command Center</h1>
          <p className="text-text-dim text-sm">Welcome back, {profile?.displayName}. Your mobile workshop is ready.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="bento-badge hidden sm:block">
            {profile?.role?.toUpperCase()}
          </div>
          
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="border-white/10 rounded-xl bg-white/5" />}>
                <Menu className="w-5 h-5 text-technic-yellow" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-industrial-charcoal border-white/10 text-digital-white" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-display font-bold uppercase text-[10px] tracking-widest text-text-dim">
                    Dashboard Menu
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={() => setActiveTab('overview')} className="focus:bg-white/5 focus:text-technic-yellow cursor-pointer">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>Overview</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('jobs')} className="focus:bg-white/5 focus:text-technic-yellow cursor-pointer">
                  <Wrench className="mr-2 h-4 w-4" />
                  <span>{isSpecialist ? 'Active Jobs' : 'My Requests'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('vehicles')} className="focus:bg-white/5 focus:text-technic-yellow cursor-pointer">
                  <Car className="mr-2 h-4 w-4" />
                  <span>{isSpecialist ? 'Fleet Records' : 'My Garage'}</span>
                </DropdownMenuItem>
                {isOwner && (
                  <DropdownMenuItem onClick={() => setActiveTab('fleet')} className="focus:bg-white/5 focus:text-technic-yellow cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Fleet Manager</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setActiveTab('safety')} className="focus:bg-white/5 focus:text-technic-yellow cursor-pointer">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  <span>Safety</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {profile?.isVerified ? (
            <div className="bg-success-green/10 text-success-green px-2 py-1 rounded-[4px] text-[11px] font-bold border border-success-green/20">
              VERIFIED
            </div>
          ) : (
            (profile?.role === 'specialist' || profile?.role === 'apprentice') && (
              <Link to="/verify">
                <div className="bg-technic-yellow/10 text-technic-yellow px-2 py-1 rounded-[4px] text-[11px] font-bold border border-technic-yellow/20 hover:bg-technic-yellow/20 transition-all cursor-pointer">
                  GET VERIFIED
                </div>
              </Link>
            )
          )}
        </div>
      </div>

      <Tabs value={activeTab} className="space-y-8" onValueChange={setActiveTab}>
        <TabsList className="hidden md:flex bg-card-bg border border-border-dim p-1 rounded-xl h-auto flex-wrap justify-start">
          <TabsTrigger value="overview" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
            <TrendingUp className="w-4 h-4 mr-2" /> OVERVIEW
          </TabsTrigger>
          <TabsTrigger value="jobs" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
            <Wrench className="w-4 h-4 mr-2" /> {isSpecialist ? 'ACTIVE JOBS' : 'MY REQUESTS'}
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
            <Car className="w-4 h-4 mr-2" /> {isSpecialist ? 'FLEET RECORDS' : 'MY GARAGE'}
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="fleet" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
              <BarChart3 className="w-4 h-4 mr-2" /> FLEET MANAGER
            </TabsTrigger>
          )}
          <TabsTrigger value="safety" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
            <ClipboardCheck className="w-4 h-4 mr-2" /> SAFETY
          </TabsTrigger>
          {(profile?.role === 'specialist' || profile?.role === 'apprentice') && (
            <TabsTrigger value="skills" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
              <Award className="w-4 h-4 mr-2" /> SKILLS
            </TabsTrigger>
          )}
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <CalendarView requests={requests} />
                  
                  <div className="bento-card">
                    <div className="bento-card-title"><div className="bento-dot"></div> ACTIVE SERVICE QUEUE</div>
                    <div className="space-y-4 mt-6">
                      {requests.filter(r => r.status === 'in-progress' || r.status === 'pending').slice(0, 5).map(req => (
                        <div key={req.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-technic-yellow/10 flex items-center justify-center">
                              <Wrench className="w-5 h-5 text-technic-yellow" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black uppercase">{(req as any).vehicleMake} {(req as any).vehicleModel}</h4>
                              <p className="text-[10px] text-text-dim uppercase tracking-widest">{req.type} SERVICE</p>
                            </div>
                          </div>
                          {getStatusBadge(req.status)}
                        </div>
                      ))}
                      {requests.filter(r => r.status === 'in-progress' || r.status === 'pending').length === 0 && (
                        <p className="text-center py-8 text-[10px] text-text-dim uppercase tracking-widest font-bold">No active requests</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bento-card">
                    <div className="bento-card-title"><div className="bento-dot"></div> STATUS OVERVIEW</div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                        <div className="text-2xl font-display font-black text-technic-yellow">{requests.length}</div>
                        <div className="text-[9px] text-text-dim uppercase tracking-widest font-bold">Total Jobs</div>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                        <div className="text-2xl font-display font-black text-success-green">{requests.filter(r => r.status === 'completed').length}</div>
                        <div className="text-[9px] text-text-dim uppercase tracking-widest font-bold">Completed</div>
                      </div>
                    </div>
                  </div>

                  <div className="bento-card">
                    <div className="bento-card-title"><div className="bento-dot"></div> QUICK ACTIONS</div>
                    <div className="space-y-3 mt-6">
                      <Button asChild className="w-full bento-btn">
                        <Link to="/book">NEW SERVICE BOOKING</Link>
                      </Button>
                      <Button variant="outline" className="w-full border-white/10 rounded-xl h-12 text-[10px] items-center gap-2 uppercase tracking-widest font-bold" onClick={() => setActiveTab('vehicles')}>
                        <Car className="w-4 h-4" /> VIEW GARAGE
                      </Button>
                      {!profile?.isProfileComplete && (
                        <Button asChild variant="outline" className="w-full border-technic-yellow/30 text-technic-yellow rounded-xl h-12 text-[10px] uppercase tracking-widest font-bold">
                          <Link to="/register">COMPLETE BIO PROFILE</Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="bento-card">
                    <div className="bento-card-title"><div className="bento-dot"></div> VERIFICATION</div>
                    <div className="flex flex-col h-full">
                      <div className="text-2xl font-display font-black uppercase mb-1">
                        {profile?.verificationStatus === 'pending' ? 'Pending' : profile?.isVerified ? 'Verified' : 'Unverified'}
                      </div>
                      <p className="text-[11px] text-text-dim mb-4 leading-relaxed uppercase tracking-widest">
                        {profile?.isVerified 
                          ? 'All credentials validated.' 
                          : profile?.verificationStatus === 'pending' 
                            ? 'Our team is reviewing your documents.' 
                            : 'Identity & Professional validation required for specialists.'}
                      </p>
                      {!profile?.isVerified && profile?.verificationStatus !== 'pending' && (isSpecialist) && (
                        <Link to="/verify" className="mt-auto">
                          <Button className="bento-btn">Start Verification</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="jobs" className="mt-0">
              <div className="space-y-4">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <div key={req.id} className="bento-card flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <Wrench className="w-8 h-8 text-technic-yellow" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <h3 className="text-lg font-display font-black uppercase tracking-tight">
                            {(req as any).vehicleMake} {(req as any).vehicleModel}
                          </h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-sm text-text-dim">{req.type.toUpperCase()} SERVICE • {req.description.slice(0, 60)}{req.description.length > 60 ? '...' : ''}</p>
                        <div className="flex items-center gap-4 mt-3 text-[11px] text-text-dim font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date((req.createdAt as any)?.seconds * 1000).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {(req as any).location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-none border-white/10 rounded-xl text-xs font-bold">DETAILS</Button>
                        {isSpecialist && req.status === 'pending' && (
                          <Button 
                            onClick={() => handleAcceptJobClick(req.id)}
                            disabled={processingId === req.id}
                            className="flex-1 md:flex-none bg-technic-yellow text-industrial-charcoal font-bold rounded-xl text-xs"
                          >
                            {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ACCEPT JOB'}
                          </Button>
                        )}
                      </div>

                      {/* Specialist Signature Requirement */}
                      {req.status === 'in-progress' && !(req as any).signatures?.specialist && profile?.role === 'specialist' && (
                        <div className="mt-6 p-6 rounded-2xl bg-technic-yellow/5 border border-technic-yellow/30 w-full animate-pulse-slow">
                          <div className="flex items-start gap-4 mb-4">
                            <Shield className="w-6 h-6 text-technic-yellow shrink-0 mt-1" />
                            <div>
                              <h4 className="text-sm font-black uppercase text-technic-yellow mb-1 tracking-tight">Contract Authorization Required</h4>
                              <p className="text-[10px] text-text-dim uppercase leading-relaxed tracking-wider">
                                Before commencing physical works, you must counter-sign the digital service agreement. This authorizes the call-out and protects your specialist rating.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Input 
                              placeholder="Type your full name to sign" 
                              className="bg-industrial-charcoal border-white/20 h-11 text-sm font-display italic"
                              value={specialistSignature}
                              onChange={(e) => setSpecialistSignature(e.target.value)}
                            />
                            <Button 
                              onClick={() => signContractAsSpecialist(req.id)}
                              disabled={isSigning || !specialistSignature.trim()}
                              className="bg-technic-yellow text-industrial-charcoal font-black h-11 px-6 text-xs uppercase"
                            >
                              {isSigning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SIGN & AUTHORIZE'}
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Apprentice Tasks Section */}
                      {req.status === 'in-progress' && req.apprenticeId && req.tasks && (
                        <div className="mt-6 pt-6 border-t border-white/5 w-full">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-technic-yellow flex items-center gap-2">
                              <Users className="w-4 h-4" /> Apprentice Tasks & Skills Transfer
                            </h4>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant="outline" className="text-[9px] border-white/10 uppercase">
                                {req.tasks.filter(t => t.status === 'signed-off').length} / {req.tasks.length} Signed Off
                              </Badge>
                              <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                <div 
                                  className="h-full bg-success-green transition-all duration-500" 
                                  style={{ width: `${(req.tasks.filter(t => t.status === 'signed-off').length / req.tasks.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {req.tasks.map((task) => (
                              <div key={task.id} className={`p-3 rounded-xl border transition-all ${task.status === 'signed-off' ? 'bg-success-green/5 border-success-green/20' : 'bg-white/5 border-white/10'}`}>
                                <div className="flex justify-between items-start mb-1">
                                  <span className="text-[10px] font-bold uppercase tracking-tight">{task.title}</span>
                                  <div className="flex items-center gap-2">
                                    {task.photoEvidence && (
                                      <div className="w-4 h-4 rounded bg-success-green/20 flex items-center justify-center">
                                        <CameraIcon className="w-2.5 h-2.5 text-success-green" />
                                      </div>
                                    )}
                                    {task.status === 'signed-off' ? (
                                      <CheckCircle2 className="w-3 h-3 text-success-green" />
                                    ) : (
                                      <Clock className="w-3 h-3 text-text-dim" />
                                    )}
                                  </div>
                                </div>
                                <p className="text-[10px] text-text-dim leading-tight mb-3">{task.description}</p>
                                <div className="flex gap-2">
                                  {profile?.role === 'apprentice' && task.status === 'pending' && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        onClick={() => markTaskCompleted(req.id, task.id)}
                                        className="flex-1 h-7 text-[9px] bg-white/10 hover:bg-technic-yellow hover:text-industrial-charcoal font-bold uppercase"
                                      >
                                        MARK COMPLETED
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => { setActiveRequestId(req.id); setActiveTaskId(task.id); setShowCamera(true); }}
                                        className="w-7 h-7 p-0 border-white/10"
                                      >
                                        <CameraIcon className="w-3 h-3" />
                                      </Button>
                                    </>
                                  )}
                                  {profile?.role === 'specialist' && task.status === 'completed' && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        onClick={() => signOffTask(req.id, task.id)}
                                        className="flex-1 h-7 text-[9px] bg-white/10 hover:bg-technic-yellow hover:text-industrial-charcoal font-bold uppercase"
                                      >
                                        SIGN OFF
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => { setActiveRequestId(req.id); setActiveTaskId(task.id); setShowCamera(true); }}
                                        className="w-7 h-7 p-0 border-white/10"
                                      >
                                        <CameraIcon className="w-3 h-3" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                                {task.status === 'completed' && profile?.role === 'apprentice' && (
                                  <div className="flex items-center gap-1 text-[8px] text-technic-yellow font-bold uppercase">
                                    <Clock className="w-2.5 h-2.5" /> Awaiting specialist sign-off
                                  </div>
                                )}
                                {task.status === 'signed-off' && (
                                  <div className="flex items-center gap-1 text-[8px] text-success-green font-bold uppercase">
                                    <UserCheck className="w-2.5 h-2.5" /> Specialist Verified
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle>Active Service Requests</CardTitle>
                      <CardDescription>Track your ongoing maintenance and upcoming call-outs.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
                        <Wrench className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-digital-white/40 font-bold">No active jobs found.</p>
                        {!isSpecialist && (
                          <Link to="/book">
                            <Button className="mt-4 bg-technic-yellow text-industrial-charcoal font-bold">Request New Service</Button>
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="vehicles" className="mt-0">
               <VehicleLogBook />
            </TabsContent>

            <TabsContent value="fleet" className="mt-0">
              <FleetManager />
            </TabsContent>

            <TabsContent value="safety" className="mt-0 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-technic-yellow flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Safety & Compliance
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowOHSA(!showOHSA)}
                  className="border-technic-yellow/20 text-technic-yellow hover:bg-technic-yellow/10 font-bold text-[10px]"
                >
                  {showOHSA ? 'CLOSE GUIDELINES' : 'VIEW OHSA SOP'}
                </Button>
              </div>

              {showOHSA ? (
                <OHSAGuidelines />
              ) : (
                <>
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-technic-yellow" /> SAFETY PROTOCOLS & COMPLIANCE
                      </CardTitle>
                      <CardDescription>Mandatory checklists for every mobile service site.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 rounded-xl bg-technic-yellow/5 border border-technic-yellow/20">
                        <h4 className="font-bold text-technic-yellow mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> SITE SAFETY ANNOUNCEMENT
                        </h4>
                        <p className="text-sm text-digital-white/70 italic">
                          "Attention: A mobile mechanic service is in progress. Please clear the site of all potential hazards. 
                          Ensure children and pets are kept at a safe distance. Work will stop immediately if the site is breached."
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          "Visual Inspection of PPE",
                          "Barricading with Danger Tape/Cones",
                          "Toolbox Check (Pre-work)",
                          "Oil Spill Mats Placement",
                          "Vehicle Stability Check",
                          "Site Clearance (Post-work)"
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-technic-yellow" />
                              <span className="text-sm font-medium">{item}</span>
                            </div>
                            {isSpecialist && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-text-dim hover:text-technic-yellow"
                                onClick={() => {
                                  const activeJob = requests.find(r => r.status === 'in-progress');
                                  if (activeJob) {
                                    setActiveRequestId(activeJob.id);
                                    setShowCamera(true);
                                  } else {
                                    toast.error("No active job to attach evidence to.");
                                  }
                                }}
                              >
                                <CameraIcon className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-technic-yellow uppercase tracking-widest">Regional Reliability Stats</CardTitle>
                    <CardDescription>Data-driven insights for Polokwane & Surrounds</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { part: "Alternators", rate: 42, color: "bg-red-500" },
                      { part: "Fuel Pumps", rate: 28, color: "bg-orange-500" },
                      { part: "Suspension Bushings", rate: 15, color: "bg-blue-500" }
                    ].map((stat, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{stat.part}</span>
                          <span>{stat.rate}% Failure Rate</span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className={`${stat.color} h-full rounded-full`} style={{ width: `${stat.rate}%` }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-technic-yellow uppercase tracking-widest">Recent Invoices</CardTitle>
                    <CardDescription>Verified purchases and service billing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[150px]">
                      {[
                        { id: "INV-001", date: "15 Mar", amount: "R 2,450", status: "PAID" },
                        { id: "INV-002", date: "10 Sep", amount: "R 1,800", status: "PAID" },
                        { id: "INV-003", date: "05 Mar", amount: "R 5,200", status: "PAID" }
                      ].map((inv, i) => (
                        <div key={i} className="flex justify-between items-center p-3 border-b border-white/5 last:border-0">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">{inv.id}</span>
                            <span className="text-[10px] text-digital-white/40">{inv.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold">{inv.amount}</span>
                            <Badge className="ml-2 bg-green-500/10 text-green-500 text-[8px] h-4">PAID</Badge>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
            <TabsContent value="skills" className="mt-0">
              <SkillsValidation />
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      <Dialog open={showApprenticeDialog} onOpenChange={setShowApprenticeDialog}>
        <DialogContent className="bg-industrial-charcoal border-white/10 text-digital-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-black uppercase flex items-center gap-2">
              <Users className="w-6 h-6 text-technic-yellow" /> Assign Apprentice
            </DialogTitle>
            <DialogDescription className="text-text-dim">
              Select an apprentice to assist you with this job. This is part of our skills transfer program.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest font-bold text-technic-yellow">Available Apprentices</p>
            <ScrollArea className="h-[200px] pr-4">
              {availableApprentices.length > 0 ? (
                availableApprentices.map((app) => (
                  <button
                    key={app.uid}
                    onClick={() => setSelectedApprenticeId(app.uid)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all mb-2 text-left ${selectedApprenticeId === app.uid ? 'border-technic-yellow bg-technic-yellow/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">
                      {app.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{app.displayName}</p>
                      <p className="text-[10px] text-text-dim uppercase tracking-tighter">{app.specialization || 'General Apprentice'}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                  <p className="text-xs text-text-dim italic">No verified apprentices available at the moment.</p>
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowApprenticeDialog(false)} className="flex-1 border-white/10 rounded-xl">
              CANCEL
            </Button>
            <Button 
              onClick={() => selectedJobId && handleAcceptJob(selectedJobId, selectedApprenticeId)}
              className="flex-1 bg-technic-yellow text-industrial-charcoal font-bold rounded-xl"
            >
              CONFIRM ACCEPTANCE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showCamera && (
        <CameraCapture 
          title="Capture Safety Evidence"
          onCapture={handleCaptureEvidence}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};
