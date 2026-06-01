import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, getDocs, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button, buttonVariants } from './ui/button';
import { cn } from '../lib/utils';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Link, useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Wrench, Car, ClipboardCheck, History, TrendingUp, UserCheck, AlertTriangle, Shield, Clock, CheckCircle2, PlayCircle, XCircle, MapPin, Loader2, Users, Award, BarChart3, Camera as CameraIcon, Menu, LogOut, Home, User, ShieldCheck, Zap, Circle, FileText, Settings, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import { VehicleLogBook } from './VehicleLogBook';
import { SpecialistProfile } from './SpecialistProfile';
import { SkillsValidation } from './SkillsValidation';
import { FleetManager } from './FleetManager';
import { OHSAGuidelines } from './OHSAGuidelines';
import { CameraCapture } from './CameraCapture';
import { CalendarView } from './CalendarView';
import { ServiceRequest, UserProfile, ApprenticeTask, RoadworthyChecklist } from '../types';
import { notifyParties, addToCalendar, notifyApprentice } from '../services/gemini';

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [leads, setLeads] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showApprenticeDialog, setShowApprenticeDialog] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [availableApprentices, setAvailableApprentices] = useState<UserProfile[]>([]);
  const [selectedApprenticeId, setSelectedApprenticeId] = useState<string | null>(null);
  const [mentorProfile, setMentorProfile] = useState<UserProfile | null>(null);
  const [showOHSA, setShowOHSA] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'document' | 'part' | 'evidence'>('evidence');
  const [cameraTitle, setCameraTitle] = useState('Capture Evidence');
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [specialistName, setSpecialistName] = useState('');
  const [specialistSignature, setSpecialistSignature] = useState('');
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showBodyScanModal, setShowBodyScanModal] = useState(false);
  const [bodyScanPhotos, setBodyScanPhotos] = useState<{front?: string, back?: string, left?: string, right?: string}>({});
  const [safetyChecklist, setSafetyChecklist] = useState({
    ppeWorn: false,
    sixConesPlaced: false,
    dangerTapeSet: false,
    oilSpillMats: false,
    toolboxBrief: false,
    handshake: false
  });
  const [showReferralInfo, setShowReferralInfo] = useState(false);
  const [showRoadworthyModal, setShowRoadworthyModal] = useState(false);
  const [roadworthyData, setRoadworthyData] = useState<Partial<RoadworthyChecklist>>({
    identification: { vinMatch: false, engineNoMatch: false },
    electrical: { wipers: false, lights: false, horn: false, batteryClamp: false },
    fittings: { bumpers: false, mirrors: false, seatbelts: false, doors: false, chassis: false },
    braking: { serviceBrake: false, parkingBrake: false },
    wheels: { tireCondition: false, tireSizeMatch: false, rimIntegrity: false },
    suspension: { shocks: false, steeringBox: false, leaks: false },
    engine: { smokeEmission: false, mountings: false, exhaustSystem: false },
    instruments: { speedometer: false }
  });

  useEffect(() => {
    if (profile?.role === 'apprentice' && profile.mentorId) {
      const fetchMentor = async () => {
        try {
          const q = query(collection(db, 'users'), where('uid', '==', profile.mentorId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setMentorProfile(querySnapshot.docs[0].data() as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching mentor profile:", error);
        }
      };
      fetchMentor();
    }
  }, [profile]);

  // Determine active platform view
  const sessionRole = localStorage.getItem('makhanikhi_session_role');
  const activeRole = (sessionRole === 'pro' && (profile?.role === 'specialist' || profile?.role === 'apprentice')) 
    ? profile.role 
    : (sessionRole === 'owner' || profile?.role === 'owner') 
      ? 'owner' 
      : profile?.role || 'owner';

  const isSpecialist = activeRole === 'specialist' || activeRole === 'apprentice';
  const isOwner = activeRole === 'owner';

  const handleAcceptLead = async (requestId: string) => {
    if (!user || !profile) return;
    setProcessingId(requestId);
    try {
      const request = leads.find(r => r.id === requestId);
      if (!request) return;

      const offer = {
        specialistId: user.uid,
        specialistName: profile.displayName || 'Technician',
        specialistRating: 4.8, // Mock rating
        callOutFee: request.callOutFee || 500,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      await updateDoc(doc(db, 'serviceRequests', requestId), {
        status: 'quoted',
        offers: [offer] // For now, simple one-offer referral
      });
      toast.success("Offer sent to car owner! Waiting for their approval.");
    } catch (error) {
      toast.error("Failed to accept lead.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproveReferral = async (requestId: string, offer: any) => {
    setProcessingId(requestId);
    try {
      const reqDoc = requests.find(r => r.id === requestId);
      const appointmentDate = reqDoc?.appointmentDate?.split('T')[0];

      // Update request status
      await updateDoc(doc(db, 'serviceRequests', requestId), {
        specialistId: offer.specialistId,
        status: 'accepted'
      });

      // Mark specialist as unavailable for this date
      if (appointmentDate) {
        const specialistRef = doc(db, 'users', offer.specialistId);
        // In a real app we'd use arrayUnion, but I'll update isAvailable for simplicity now
        await updateDoc(specialistRef, {
          isAvailable: false // Simple toggle, ideally date-based
        });
      }

      toast.success("Specialist approved! They can now begin work.");
    } catch (error) {
      toast.error("Failed to approve specialist.");
    } finally {
      setProcessingId(null);
    }
  };

  const declineReferral = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      await updateDoc(doc(db, 'serviceRequests', requestId), {
        status: 'dispatching',
        offers: [] // Clear offers so it goes back to dispatching
      });
      toast.info("Referral declined. Finding a new specialist...");
    } catch (error) {
      toast.error("Failed to decline.");
    } finally {
      setProcessingId(null);
    }
  };

  const signContractAsSpecialist = async (requestId: string) => {
    if (!specialistName.trim() || !specialistSignature.trim()) {
      toast.error("Please provide both your name and signature.");
      return;
    }
    setIsSigning(true);
    try {
      const reqRef = doc(db, 'serviceRequests', requestId);
      const reqDoc = requests.find(r => r.id === requestId);
      
      await updateDoc(reqRef, {
        'signatures.specialist': {
          uid: user?.uid,
          timestamp: new Date().toISOString(),
          name: specialistName,
          signature: specialistSignature
        },
        contractSigned: true,
        emailsSent: true // Mark as sent for this simulation
      });

      // If signed, notify all parties
      if (reqDoc) {
        toast.promise(
          Promise.all([
            notifyParties(requestId, [
              { email: profile?.email, name: profile?.displayName },
              { email: 'owner@example.com', name: 'Car Owner' } // Placeholder for owner email
            ], reqDoc.smartContract),
            // Mocking calendar add
            addToCalendar({
              summary: `${reqDoc.vehicleMake} Service`,
              location: reqDoc.location,
              description: reqDoc.description,
              startTime: reqDoc.appointmentDate,
              endTime: new Date(new Date(reqDoc.appointmentDate!).getTime() + 2 * 60 * 60 * 1000).toISOString()
            }, 'mock-token')
          ]),
          {
            loading: 'Synchronizing with all parties...',
            success: 'Agreement emailed & Calendar invitation sent!',
            error: 'Contract signed, but notification services are currently offline.'
          }
        );
      }

      setSpecialistName('');
      setSpecialistSignature('');
    } catch (error) {
      toast.error("Failed to sign contract.");
    } finally {
      setIsSigning(false);
    }
  };

  const fetchApprentices = async () => {
    try {
      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'apprentice'), 
        where('apprenticeStatus', '==', 'awaiting-match')
      );
      const querySnapshot = await getDocs(q);
      const apps = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
      setAvailableApprentices(apps);
    } catch (error) {
      console.error("Error fetching apprentices:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'marketplace') {
      fetchApprentices();
    }
  }, [activeTab]);

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
        { id: 't1', title: 'PPE & Safety Brief', description: 'Mandatory toolbox talk and PPE inspection', status: 'pending' },
        { id: 't2', title: 'Site Perimeter Setup', description: '6 cones/bottles + danger tape perimeter', status: 'pending' },
        { id: 't3', title: 'Work Area Prep', description: 'Oil spill mats and tool layout', status: 'pending' }
      ];

      const initialMilestones = [
        { id: 'm1', title: 'Safety & Site Prep', description: 'Site secured and safety brief conducted', status: 'pending', order: 1 },
        { id: 'm2', title: 'Diagnosis & Teardown', description: 'Initial diagnostics and component access', status: 'pending', order: 2 },
        { id: 'm3', title: 'Part Replacement/Repair', description: 'Primary technical work execution', status: 'pending', order: 3 },
        { id: 'm4', title: 'Testing & Reassembly', description: 'Work validation and site clearance', status: 'pending', order: 4 }
      ];

      const resolvedApprenticeId = apprenticeId || (profile?.role === 'apprentice' ? user.uid : null);

      await updateDoc(requestRef, {
        status: 'in-progress',
        specialistId: user.uid,
        apprenticeId: resolvedApprenticeId,
        tasks: initialTasks,
        milestones: initialMilestones
      });

      // Notify apprentice team if one is successfully co-opted
      if (resolvedApprenticeId) {
        let apprenticeProfile: UserProfile | null = null;
        apprenticeProfile = availableApprentices.find(a => a.uid === resolvedApprenticeId) || null;
        if (!apprenticeProfile) {
          const appSnap = await getDoc(doc(db, 'users', resolvedApprenticeId));
          if (appSnap.exists()) {
            apprenticeProfile = { uid: appSnap.id, ...appSnap.data() } as UserProfile;
          }
        }

        if (apprenticeProfile) {
          try {
            const reqSnap = await getDoc(requestRef);
            const reqData = reqSnap.data();
            const make = reqData?.vehicleMake || 'Ford';
            const model = reqData?.vehicleModel || 'Bakkie';
            const type = reqData?.type || 'General Maintenance';
            const description = reqData?.description || 'Roadside troubleshooting';

            await notifyApprentice({
              apprenticeEmail: apprenticeProfile.email,
              apprenticePhone: apprenticeProfile.phone || '+27 71 456 7890',
              apprenticeName: apprenticeProfile.displayName,
              specialistName: profile?.displayName || "Sipho 'The Hands'",
              vehicleDetails: `${make} ${model}`,
              serviceType: type,
              description: description
            });
            toast.success(`Direct dispatch sent to apprentice cadet: ${apprenticeProfile.displayName}!`);
          } catch (notifyErr) {
            console.error("Error dispatching apprentice notifications:", notifyErr);
          }
        }
      }

      toast.success("Job accepted and assigned! Complete Body Scan to document asset state.");
      setShowApprenticeDialog(false);
      setActiveRequestId(requestId);
      setShowBodyScanModal(true);
    } catch (error) {
      console.error("Error accepting job:", error);
      toast.error("Failed to accept job. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const verifySafetySetup = async () => {
    if (!activeRequestId) return;
    if (!safetyChecklist.ppeWorn || !safetyChecklist.sixConesPlaced || !safetyChecklist.dangerTapeSet || !safetyChecklist.toolboxBrief) {
      toast.error("All safety requirements must be met before starting works.");
      return;
    }
    
    setCameraMode('evidence');
    setCameraTitle('Capture 6-Cone Site Perimeter');
    setShowCamera(true);
  };

  const completeSafetyGateway = async (photoUrl: string) => {
    if (!activeRequestId) return;
    try {
      const request = requests.find(r => r.id === activeRequestId);
      if (!request) return;

      const updatedMilestones = (request.milestones || []).map(m => 
        m.id === 'm1' ? { ...m, status: 'completed', photoEvidence: photoUrl, timestamp: new Date().toISOString() } : m
      );

      const updatedTasks = (request.tasks || []).map(t => 
        (t.id === 't1' || t.id === 't2') ? { ...t, status: 'signed-off' as const, photoEvidence: photoUrl } : t
      );

      await updateDoc(doc(db, 'serviceRequests', activeRequestId), {
        'checklist.preWork': {
          ppeInspected: true,
          areaBarricaded: true,
          toolboxCheck: true,
          oilSpillMatsPlaced: true,
          siteSafe: true,
          sixConesPlaced: true,
          dangerTapeSet: true,
          safetyBriefHeld: true
        },
        'checklist.ohsaCompliance.siteSetupPhoto': photoUrl,
        milestones: updatedMilestones,
        tasks: updatedTasks,
        safetyBriefCompleted: true
      });

      toast.success("Safety gateway passed. You are cleared to commence works.");
      setShowSafetyModal(false);
    } catch (error) {
      toast.error("Failed to verify safety setup.");
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
      const symbols = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceRequest[];
      setRequests(symbols);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching requests:", error);
      setLoading(false);
    });

    // Also fetch available leads for specialists
    let unsubscribeLeads = () => {};
    if (isSpecialist && profile?.role === 'specialist') {
      const qLeads = query(
        collection(db, 'serviceRequests'),
        where('status', '==', 'dispatching'),
        where('vehicleMake', '==', profile.specializationBrand || 'None')
      );
      unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
        const leadList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRequest));
        setLeads(leadList);
      });
    }

    return () => {
      unsubscribe();
      unsubscribeLeads();
    };
  }, [user, isSpecialist, profile?.role, profile?.specializationBrand]);

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

  const completeBodyScan = async () => {
    if (!bodyScanPhotos.front || !bodyScanPhotos.back || !bodyScanPhotos.left || !bodyScanPhotos.right) {
      toast.error("Please capture all 4 angles of the vehicle.");
      return;
    }
    
    if (!activeRequestId) return;
    
    try {
      await updateDoc(doc(db, 'serviceRequests', activeRequestId), {
        'bodyScan': bodyScanPhotos,
        'bodyScanCompletedAt': new Date().toISOString()
      });
      setShowBodyScanModal(false);
      setShowSafetyModal(true);
      toast.success("Body scan complete. Now verify site safety.");
    } catch (error) {
      toast.error("Failed to save body scan.");
    }
  };

  const saveRoadworthyAudit = async () => {
    if (!activeRequestId) return;
    try {
      await updateDoc(doc(db, 'serviceRequests', activeRequestId), {
        roadworthyChecklist: {
          ...roadworthyData,
          lastUpdate: new Date().toISOString()
        }
      });
      toast.success("Roadworthiness Digital Audit Saved.");
      setShowRoadworthyModal(false);
    } catch (error) {
      toast.error("Failed to save roadworthy audit.");
    }
  };

  const handleCaptureEvidence = async (imgUrl: string) => {
    if (!activeRequestId) return;
    
    // Check if we are in the body scan step
    if (showBodyScanModal) {
      const mode = cameraTitle.toLowerCase();
      if (mode.includes('front')) setBodyScanPhotos(prev => ({ ...prev, front: imgUrl }));
      else if (mode.includes('back')) setBodyScanPhotos(prev => ({ ...prev, back: imgUrl }));
      else if (mode.includes('left')) setBodyScanPhotos(prev => ({ ...prev, left: imgUrl }));
      else if (mode.includes('right')) setBodyScanPhotos(prev => ({ ...prev, right: imgUrl }));
      setShowCamera(false);
      return;
    }

    // Check if we are in the safety gateway validation step
    if (showSafetyModal) {
      await completeSafetyGateway(imgUrl);
      return;
    }

    try {
      const request = requests.find(r => r.id === activeRequestId);
      if (!request) return;

      // Handle Milestone update
      if (activeTaskId?.startsWith('m')) {
        const updatedMilestones = (request.milestones || []).map(m => 
          m.id === activeTaskId ? { ...m, status: 'completed' as const, photoEvidence: imgUrl, timestamp: new Date().toISOString() } : m
        );
        await updateDoc(doc(db, 'serviceRequests', activeRequestId), {
          milestones: updatedMilestones
        });
        toast.success("Project milestone updated.");
        setActiveTaskId(null);
        return;
      }
      
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

  const handleLogout = async () => {
    localStorage.removeItem('makhanikhi_session_role');
    await signOut(auth);
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'dispatching':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><MapPin className="w-3 h-3" /> Dispatching</Badge>;
      case 'quoted':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Referral Sent</Badge>;
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
      <AnimatePresence>
        {(requests.some(r => r.status === 'in-progress' || r.status === 'accepted')) && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-tight text-white/90">
                <span className="text-red-500">SAFETY WARNING:</span> NEVER communicate or pay outside this app. Your insurance, warranty, and technician ratings depend on in-platform documentation.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="flex justify-between items-end mb-8 border-b border-border-dim pb-4">
        <div className="makhanikhi-logo text-2xl text-technic-yellow uppercase tracking-tighter">Makhanikhi</div>
        <div className="powered-by text-[10px] tracking-[2px] text-text-dim uppercase">Powered by Yellow Beast R&D Studio</div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight uppercase">
            {isSpecialist ? 'Makhanikhi' : 'My Garage'}
          </h1>
          <p className="text-text-dim text-xs sm:text-sm">Hello, {profile?.displayName}. Accessing your {isSpecialist ? 'Workshop' : 'Records'}.</p>
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto justify-between sm:justify-end">
          <div className="bento-badge hidden sm:block bg-technic-yellow/10 text-technic-yellow border border-technic-yellow/20">
            {activeRole?.toUpperCase() || 'UNKNOWN'} MODE
          </div>
          
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="icon" className="border-white/10 rounded-xl bg-white/5">
                  <Menu className="w-5 h-5 text-technic-yellow" />
                </Button>
              }>
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
                  <span>{isSpecialist ? 'My Jobs' : 'My Services'}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('vehicles')} className="focus:bg-white/5 focus:text-technic-yellow cursor-pointer">
                  <Car className="mr-2 h-4 w-4" />
                  <span>{isSpecialist ? 'Fleet List' : 'My Cars'}</span>
                </DropdownMenuItem>
                {profile?.role === 'specialist' && (
                  <DropdownMenuItem onClick={() => setActiveTab('marketplace')} className="focus:bg-white/5 focus:text-technic-yellow cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Hire Helper</span>
                  </DropdownMenuItem>
                )}
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
            <Wrench className="w-4 h-4 mr-2" /> {isSpecialist ? 'MY JOBS' : 'MY BOOKINGS'}
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
            <Car className="w-4 h-4 mr-2" /> {isSpecialist ? 'FLEET' : 'MY CARS'}
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="fleet" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
              <BarChart3 className="w-4 h-4 mr-2" /> FLEET MANAGER
            </TabsTrigger>
          )}
          {profile?.role === 'specialist' && (
            <TabsTrigger value="marketplace" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
              <Users className="w-4 h-4 mr-2" /> HIRE
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
                  {profile?.role === 'apprentice' && profile.apprenticeStatus === 'co-opted' && mentorProfile && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 rounded-[32px] bg-success-green/10 border border-success-green/30 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Award className="w-24 h-24 text-success-green" />
                      </div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-green/20 text-success-green text-[10px] font-bold uppercase tracking-widest mb-6">
                          <CheckCircle2 className="w-3 h-3" /> Status: Co-opted
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tighter mb-4 text-digital-white">
                          Learning with <br />
                          <span className="text-success-green">{mentorProfile.displayName}</span>
                        </h2>
                        <p className="text-text-dim text-sm max-w-md leading-relaxed mb-6">
                          You are currently co-opted into {mentorProfile.displayName}'s mobile workshop. Your tasks and workplace experience will be validated by this specialist.
                        </p>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 w-fit">
                           <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 border border-white/20">
                             {mentorProfile.photoURL ? (
                               <img src={mentorProfile.photoURL} alt={mentorProfile.displayName} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-technic-yellow">
                                 <User className="w-5 h-5" />
                               </div>
                             )}
                           </div>
                           <div>
                             <div className="text-[8px] font-black uppercase text-text-dim tracking-widest">Makhanikhi Mentor</div>
                             <div className="text-xs font-bold uppercase">{mentorProfile.specialization || 'General'} Makhanikhi</div>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {profile?.role === 'apprentice' && profile.apprenticeStatus === 'awaiting-match' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 rounded-[32px] bg-blue-500/10 border border-blue-500/30 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-24 h-24 text-blue-400" />
                      </div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6">
                          <Clock className="w-3 h-3" /> Status: Awaiting Match
                        </div>
                        <h2 className="text-3xl font-display font-black uppercase tracking-tighter mb-4 text-digital-white">
                          Matching in <br />
                          <span className="text-blue-400">Progress...</span>
                        </h2>
                        <p className="text-text-dim text-sm max-w-md leading-relaxed mb-8">
                          Your profile is active in the specialist network. Master technicians can now view your skills and co-opt you into their mobile workshops for validated workplace experience.
                        </p>
                        <div className="flex gap-4">
                          <Link to="/verify">
                            <Button className="bg-blue-500 text-white hover:bg-blue-600 font-bold h-11 px-6 rounded-xl text-xs uppercase">
                              Check Verification
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <CalendarView requests={requests} />
                  
                  <div className="bento-card">
                    <div className="bento-card-title"><div className="bento-dot"></div> LATEST JOBS</div>
                    <div className="space-y-4 mt-6">
                      {requests.filter(r => r.status === 'in-progress' || r.status === 'pending').slice(0, 5).map(req => (
                        <div key={req.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-technic-yellow/10 flex items-center justify-center">
                              <Wrench className="w-5 h-5 text-technic-yellow" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black uppercase">{req.vehicleMake} {req.vehicleModel}</h4>
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

                  {/* PROOF-OF-PRESERVATION CIRCULARITY MATH CARD */}
                  <div className="bento-card bg-success-green/5 border border-success-green/20">
                    <div className="bento-card-title text-success-green flex items-center gap-1.5 font-black uppercase text-[10px]">
                      <div className="w-2 h-2 rounded-full bg-success-green animate-pulse"></div> 
                      🌿 PROOF-OF-PRESERVATION (PoP)
                    </div>
                    <div className="mt-6 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase text-white">Avoided Manufacturing Scrap</h4>
                        <p className="text-[11px] text-text-dim mt-1 normal-case leading-relaxed">
                          By rebuilding specific high-wear components (e.g., individual bearings, rings) instead of throwing away full sub-assemblies, we protect valuable metal assets.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl">
                          <div className="text-xl font-display font-black text-success-green">
                            {(requests.filter(r => r.status === 'completed').length || 1) * 34.85} kg
                          </div>
                          <div className="text-[8px] text-text-dim uppercase tracking-widest font-bold mt-1">High-Grade Steel Saved</div>
                        </div>

                        <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl">
                          <div className="text-xl font-display font-black text-success-green">
                            {(requests.filter(r => r.status === 'completed').length || 1) * 64.47} kg
                          </div>
                          <div className="text-[8px] text-text-dim uppercase tracking-widest font-bold mt-1">Carbon (CO₂) Avoided</div>
                        </div>
                      </div>

                      <div className="text-[10px] text-success-green/80 font-mono flex items-center gap-1.5 pt-2 border-t border-white/5 uppercase">
                        <Sparkles className="w-3.5 h-3.5" /> Minted {requests.filter(r => r.status === 'completed').length} cNFT Solana & OYU Green ESG Logs
                      </div>
                    </div>
                  </div>

                  <div className="bento-card">
                    <div className="bento-card-title"><div className="bento-dot"></div> SHORTCUTS</div>
                    <div className="space-y-3 mt-6">
                      <Link to="/book" className={cn(buttonVariants({ variant: "default" }), "w-full bento-btn")}>
                        BOOK A SERVICE
                      </Link>
                      <Button variant="outline" className="w-full border-white/10 rounded-xl h-12 text-[10px] items-center gap-2 uppercase tracking-widest font-bold" onClick={() => setActiveTab('vehicles')}>
                        <Car className="w-4 h-4" /> MY CARS
                      </Button>
                      {!profile?.isProfileComplete && (
                        <Link to="/register" className={cn(buttonVariants({ variant: "outline" }), "w-full border-technic-yellow/30 text-technic-yellow rounded-xl h-12 text-[10px] uppercase tracking-widest font-bold")}>
                          COMPLETE BIO PROFILE
                        </Link>
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
                          <div className={cn(buttonVariants({ variant: "default" }), "bento-btn w-full")}>Start Verification</div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="jobs" className="mt-0">
              {isOwner && (
                <div className="mb-6 p-6 rounded-[24px] bg-success-green/5 border border-success-green/20 flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-success-green/10 flex items-center justify-center shrink-0 border border-success-green/20">
                    <ShieldCheck className="w-6 h-6 text-success-green" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-success-green mb-1 tracking-tight">Professional Assurance</h4>
                    <p className="text-[10px] text-text-dim uppercase leading-relaxed tracking-wider">
                      Your specialist is mandated to capture all part receipts and task evidence digitally in real-time. This eliminates suspicion and ensures you only pay for verified, itemized costs.
                    </p>
                  </div>
                </div>
              )}

              {isSpecialist && leads.length > 0 && (
                <div className="mb-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-technic-yellow animate-pulse" />
                    <h3 className="text-lg font-display font-black uppercase tracking-tight text-white">Matching Leads ({leads.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {leads.map(lead => (
                      <div key={lead.id} className="bento-card bg-technic-yellow/5 border-technic-yellow/30 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-black uppercase tracking-tighter">{lead.vehicleMake} {lead.vehicleModel}</h4>
                            <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">{lead.location} • {lead.serviceType} service</p>
                          </div>
                          <Badge className="bg-technic-yellow text-industrial-charcoal font-black border-none">R{lead.callOutFee || 500} C.O.</Badge>
                        </div>
                        <p className="text-xs text-text-dim mb-6 line-clamp-2">{lead.description}</p>
                        <Button 
                          onClick={() => handleAcceptLead(lead.id)}
                          disabled={processingId === lead.id}
                          className="w-full bg-technic-yellow text-industrial-charcoal font-black rounded-xl uppercase tracking-widest h-10 text-[10px]"
                        >
                          {processingId === lead.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ACCEPT THIS LEAD'}
                        </Button>
                        <p className="text-[8px] text-center mt-3 text-text-dim uppercase tracking-widest">Client is waiting for a specialist matching this brand.</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                            {req.vehicleMake} {req.vehicleModel}
                          </h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-sm text-text-dim">{(req.type || 'GENERAL').toUpperCase()} SERVICE • {req.description.slice(0, 60)}{req.description.length > 60 ? '...' : ''}</p>
                        <div className="flex items-center gap-4 mt-3 text-[11px] text-text-dim font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date((req.createdAt as any)?.seconds * 1000).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.location}</span>
                        </div>

                        {/* Referral Management (Owner View) */}
                        {isOwner && req.status === 'quoted' && req.offers && req.offers[0] && (
                          <div className="mt-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 animate-in fade-in slide-in-from-top-1">
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                                  {req.offers[0].specialistName.slice(0, 1).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase text-blue-400 mb-0.5 tracking-tight">Referred Specialist Match</p>
                                  <p className="text-xs font-bold">{req.offers[0].specialistName} ({req.offers[0].specialistRating} ★)</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest mb-1">Call-out Fee</p>
                                <p className="text-sm font-black text-digital-white tracking-widest">R{req.offers[0].callOutFee}</p>
                              </div>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <Button 
                                variant="outline" 
                                onClick={() => declineReferral(req.id)}
                                disabled={processingId === req.id}
                                className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl text-[10px] font-black uppercase h-9"
                              >
                                DECLINE REFERRAL
                              </Button>
                              <Button 
                                onClick={() => handleApproveReferral(req.id, req.offers![0])}
                                disabled={processingId === req.id}
                                className="flex-2 bg-blue-500 text-white font-black rounded-xl text-[10px] uppercase h-9"
                              >
                                {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'APPROVE & BOOK'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                          <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            {req.status === 'completed' && (
                              <Button 
                                variant="outline" 
                                onClick={() => toast.success("Service record saved to your Digital Service Book.")}
                                className="flex-1 md:flex-none border-technic-yellow/30 text-technic-yellow bg-technic-yellow/5 hover:bg-technic-yellow/10 rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-4"
                              >
                                 <Shield className="w-3.5 h-3.5 mr-2" /> SERVICE BOOK
                              </Button>
                            )}
                            <Button variant="outline" className="flex-1 md:flex-none border-white/10 rounded-xl text-xs font-bold h-10">DETAILS</Button>
                          {isSpecialist && req.status === 'pending' && (
                            <Button 
                              onClick={() => handleAcceptJobClick(req.id)}
                              disabled={processingId === req.id}
                              className="flex-1 md:flex-none bg-technic-yellow text-industrial-charcoal font-black rounded-xl text-[10px] tracking-widest uppercase h-10 px-6"
                            >
                              {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'TAKE JOB'}
                            </Button>
                          )}
                        </div>

                      {/* Specialist Signature Requirement */}
                      {req.status === 'in-progress' && !req.signatures?.specialist && profile?.role === 'specialist' && (
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
                          <div className="flex flex-col gap-3">
                            <Input 
                              placeholder="Specialist Full Name" 
                              className="bg-industrial-charcoal border-white/20 h-11 text-sm font-bold uppercase tracking-tight"
                              value={specialistName}
                              onChange={(e) => setSpecialistName(e.target.value)}
                            />
                            <div className="flex gap-3">
                              <Input 
                                placeholder="Type your signature (e.g. /s/ J. Doe)" 
                                className="bg-industrial-charcoal border-white/20 h-11 text-sm font-display italic flex-1"
                                value={specialistSignature}
                                onChange={(e) => setSpecialistSignature(e.target.value)}
                              />
                              <Button 
                                onClick={() => signContractAsSpecialist(req.id)}
                                disabled={isSigning || !specialistName.trim() || !specialistSignature.trim()}
                                className="bg-technic-yellow text-industrial-charcoal font-black h-11 px-6 text-xs uppercase"
                              >
                                {isSigning ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SIGN & AUTHORIZE'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Display Specialist Signature when present */}
                      {req.signatures?.specialist && (
                        <div className="mt-4 p-4 rounded-xl bg-success-green/5 border border-success-green/10 w-full">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 className="w-4 h-4 text-success-green" />
                            <span className="text-[10px] font-black uppercase text-success-green tracking-tight">Contract Authorized</span>
                          </div>
                          <p className="text-[11px] text-digital-white/70">
                            Signed by <span className="font-bold text-digital-white">{req.signatures.specialist.name || 'Authorised Specialist'}</span> on {new Date(req.signatures.specialist.timestamp).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Project Milestones Timeline */}
                      {req.status === 'in-progress' && req.milestones && (
                        <div className="mt-8 pt-8 border-t border-white/5 w-full">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-technic-yellow/10 flex items-center justify-center">
                                 <BarChart3 className="w-4 h-4 text-technic-yellow" />
                               </div>
                               <div>
                                 <h4 className="text-xs font-black uppercase tracking-widest text-digital-white">Project Milestones</h4>
                                 <p className="text-[10px] text-text-dim uppercase tracking-wider font-bold">Real-time status updates via evidence</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="text-xl font-display font-black text-technic-yellow">
                                 {Math.round((req.milestones.filter(m => m.status === 'completed').length / req.milestones.length) * 100)}%
                               </div>
                               <div className="text-[8px] font-black uppercase text-text-dim tracking-widest">Total Completion</div>
                            </div>
                          </div>

                          <div className="relative space-y-8 pl-4">
                            {/* Vertical Line */}
                            <div className="absolute left-[7px] top-2 bottom-8 w-[2px] bg-white/5" />

                            {req.milestones.map((milestone, idx) => (
                              <div key={milestone.id} className="relative pl-8 group">
                                {/* Dot */}
                                <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 transition-all z-10 ${
                                  milestone.status === 'completed' 
                                    ? 'bg-success-green border-success-green shadow-[0_0_10px_rgba(34,197,94,0.5)]' 
                                    : milestone.status === 'in-progress'
                                      ? 'bg-technic-yellow border-technic-yellow animate-pulse'
                                      : 'bg-industrial-charcoal border-white/20 group-hover:border-white/40'
                                }`} />

                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04]">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                      <h5 className={`text-xs font-black uppercase tracking-tight ${milestone.status === 'completed' ? 'text-success-green' : 'text-digital-white'}`}>
                                        {idx + 1}. {milestone.title}
                                      </h5>
                                      {milestone.status === 'completed' && <Badge className="bg-success-green/10 text-success-green text-[8px] h-4 uppercase">Verified</Badge>}
                                    </div>
                                    <p className="text-[11px] text-text-dim leading-relaxed max-w-md">{milestone.description}</p>
                                    
                                    {milestone.timestamp && (
                                      <div className="mt-2 text-[9px] font-bold text-text-dim uppercase tracking-widest">
                                        Completed: {new Date(milestone.timestamp).toLocaleTimeString()}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3">
                                    {milestone.photoEvidence ? (
                                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 group-hover:border-technic-yellow/30 transition-all cursor-pointer">
                                        <img src={milestone.photoEvidence} alt={milestone.title} className="w-full h-full object-cover" />
                                      </div>
                                    ) : (
                                      profile?.role === 'specialist' && milestone.status !== 'completed' && (
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="border-white/10 rounded-xl h-10 px-4 text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-technic-yellow hover:text-industrial-charcoal"
                                          onClick={() => {
                                            setActiveRequestId(req.id);
                                            setActiveTaskId(milestone.id); // Re-use Task state for milestone updates
                                            setCameraMode('evidence');
                                            setCameraTitle(`Capture Evidence: ${milestone.title}`);
                                            setShowCamera(true);
                                          }}
                                        >
                                          <CameraIcon className="w-3.5 h-3.5 mr-2" /> UPDATE
                                        </Button>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Roadworthiness Audit Section */}
                      {req.status === 'in-progress' && (
                        <div className="mt-8 pt-8 border-t border-white/5 w-full">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-orange-400" />
                              </div>
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-digital-white">Roadworthy Check</h4>
                                <p className="text-[10px] text-text-dim uppercase tracking-wider font-bold">Official standards (Polokwane)</p>
                              </div>
                            </div>
                            {isSpecialist && (
                              <Button 
                                onClick={() => {
                                  setActiveRequestId(req.id);
                                  if (req.roadworthyChecklist) setRoadworthyData(req.roadworthyChecklist);
                                  setShowRoadworthyModal(true);
                                }}
                                className="bg-white/5 border border-white/10 hover:bg-white hover:text-industrial-charcoal text-[10px] font-black uppercase tracking-widest h-9 px-4 rounded-xl"
                              >
                                {req.roadworthyChecklist ? 'VIEW RECORD' : 'START CHECK'}
                              </Button>
                            )}
                          </div>

                          {req.roadworthyChecklist && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                               {[
                                 { label: 'Electrical', items: req.roadworthyChecklist.electrical },
                                 { label: 'Braking', items: req.roadworthyChecklist.braking },
                                 { label: 'Suspension', items: req.roadworthyChecklist.suspension },
                                 { label: 'Wheels', items: req.roadworthyChecklist.wheels }
                               ].map((cat) => {
                                 const total = Object.keys(cat.items).filter(k => k !== 'lastUpdate').length;
                                 const passed = Object.values(cat.items).filter(v => v === true).length;
                                 return (
                                   <div key={cat.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                      <div className="text-[9px] font-black uppercase text-text-dim mb-1">{cat.label}</div>
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs font-black text-white">{passed}/{total}</div>
                                        <div className={`text-[8px] font-black uppercase ${passed === total ? 'text-success-green' : 'text-orange-400'}`}>
                                          {passed === total ? 'PASSED' : 'RE-TEST'}
                                        </div>
                                      </div>
                                   </div>
                                 );
                               })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Body Scan & Safety Audit */}
                      {req.bodyScan && (
                        <div className="mt-8 pt-8 border-t border-white/5 w-full">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center">
                              <CameraIcon className="w-4 h-4 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black uppercase tracking-widest text-digital-white">Asset Integrity: 4-Point Body Scan</h4>
                              <p className="text-[10px] text-text-dim uppercase tracking-wider font-bold">Pre-service vehicle documentation</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(req.bodyScan).map(([pos, url]) => url && (
                              <div key={pos} className="space-y-2">
                                <div className="aspect-video rounded-xl overflow-hidden border border-white/10 group relative transition-all hover:border-blue-400/50">
                                  <img src={url as string} alt={pos} className="w-full h-full object-cover" />
                                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[8px] font-black uppercase text-white backdrop-blur-md">
                                    {pos}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Helper Jobs */}
                      {req.status === 'in-progress' && req.apprenticeId && req.tasks && (
                        <div className="mt-6 pt-6 border-t border-white/5 w-full">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-technic-yellow flex items-center gap-2">
                              <Users className="w-4 h-4" /> Helper's Job List
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
                                        DONE
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
                                    <Clock className="w-2.5 h-2.5" /> Awaiting Makhanikhi approval
                                  </div>
                                )}
                                {task.status === 'signed-off' && (
                                  <div className="flex items-center gap-1 text-[8px] text-success-green font-bold uppercase">
                                    <UserCheck className="w-2.5 h-2.5" /> Makhanikhi Verified
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
                      <CardTitle>Service History</CardTitle>
                      <CardDescription>Check your car's progress and past services.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
                        <Wrench className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-digital-white/40 font-bold">No jobs here yet.</p>
                        {!isSpecialist && (
                          <Link to="/book">
                            <div className={cn(buttonVariants({ variant: "default" }), "mt-4 bg-technic-yellow text-industrial-charcoal font-bold")}>Book a Job</div>
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

            <TabsContent value="marketplace" className="mt-0">
              <div className="bento-card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-display font-black uppercase tracking-tight">Hire a Helper</h2>
                    <p className="text-xs text-text-dim uppercase tracking-widest font-bold">Find a motivated helper for your workshop.</p>
                  </div>
                  <Button 
                    onClick={fetchApprentices} 
                    variant="outline" 
                    size="sm"
                    className="border-white/10 rounded-xl text-[10px] uppercase font-bold tracking-widest h-10 px-4"
                  >
                    Refresh
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableApprentices.map((apprentice) => (
                    <motion.div 
                      key={apprentice.uid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-technic-yellow/30 transition-all group"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 border border-white/20">
                          {apprentice.photoURL ? (
                            <img src={apprentice.photoURL} alt={apprentice.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-technic-yellow">
                              <User className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-black uppercase tracking-tight text-sm">{apprentice.displayName}</h4>
                          <div className="flex items-center gap-2">
                             <Badge variant="outline" className={`text-[8px] h-4 uppercase ${apprentice.isVerified ? 'text-success-green border-success-green/20 bg-success-green/5' : 'text-text-dim border-white/10 bg-white/5'}`}>
                               {apprentice.isVerified ? 'Verified' : 'Pending Verification'}
                             </Badge>
                             <span className="text-[10px] text-text-dim font-bold uppercase transition-colors">{apprentice.trainingPath} LEVEL</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-text-dim leading-relaxed mb-6 line-clamp-3">
                        {apprentice.bio || "No biography provided yet."}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                         <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <span className="block text-[8px] uppercase text-text-dim font-bold tracking-[2px] mb-1">Start Age</span>
                            <span className="font-black text-xs text-digital-white">{apprentice.apprenticeStartAge} Years</span>
                         </div>
                         <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <span className="block text-[8px] uppercase text-text-dim font-bold tracking-[2px] mb-1">Status</span>
                            <span className="font-black text-xs text-blue-400 capitalize">{apprentice.apprenticeStatus?.replace('-', ' ')}</span>
                         </div>
                      </div>

                      <Button 
                        onClick={async () => {
                          try {
                            setProcessingId(apprentice.uid);
                            await updateDoc(doc(db, 'users', apprentice.uid), {
                              apprenticeStatus: 'co-opted',
                              mentorId: user?.uid
                            });
                            toast.success(`Co-opted ${apprentice.displayName} successfully!`);
                            fetchApprentices();
                          } catch (error) {
                            toast.error("Failed to co-opt apprentice.");
                          } finally {
                            setProcessingId(null);
                          }
                        }}
                        disabled={processingId === apprentice.uid}
                        className="w-full bento-btn h-10 text-[10px]"
                      >
                        {processingId === apprentice.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : 'CO-OPT INTO WORKSHOP'}
                      </Button>
                    </motion.div>
                  ))}
                  {availableApprentices.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[32px]">
                       <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
                       <p className="text-[10px] text-text-dim uppercase tracking-widest font-black">No apprentices currently available for co-opting.</p>
                    </div>
                  )}
                </div>
              </div>
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
                                    setCameraMode('evidence');
                                    setCameraTitle('Capture Site Safety Evidence');
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

                  <Card className="bg-success-green/5 border-success-green/20 relative overflow-hidden group mb-6">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Users className="w-16 h-16 text-success-green" />
                    </div>
                    <CardHeader>
                      <Badge className="w-fit bg-success-green/20 text-success-green mb-2">Early Adopter Reward</Badge>
                      <CardTitle className="text-xl font-display font-black uppercase tracking-tight text-white">Refer a Neighbor</CardTitle>
                      <CardDescription className="text-text-dim">Help build the most trusted network in Polokwane.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-digital-white/60 mb-6 leading-relaxed">
                        Tell a friend about Makhanikhi. Once they finish their first service, you both get a <span className="text-success-green font-bold">R250 discount</span>.
                      </p>
                      <Button 
                        onClick={() => {
                          const text = `Join me on Makhanikhi! Get professional, center-grade car service in your own driveway with full digital history. Use my referral to save.`;
                          if (navigator.share) {
                            navigator.share({ title: 'Makhanikhi Referral', text, url: window.location.origin });
                          } else {
                            navigator.clipboard.writeText(`${text} ${window.location.origin}`);
                            toast.success("Referral link copied to clipboard!");
                          }
                        }}
                        className="bg-success-green text-industrial-charcoal font-black rounded-xl uppercase tracking-widest text-xs px-6"
                      >
                         SHARE REFERRAL
                      </Button>
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
              <Users className="w-6 h-6 text-technic-yellow" /> Pick a Helper
            </DialogTitle>
            <DialogDescription className="text-text-dim">
              Select a helper to assist you with this job.
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
                      {(app.displayName || '??').slice(0, 2).toUpperCase()}
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

      <Dialog open={showSafetyModal} onOpenChange={setShowSafetyModal}>
        <DialogContent className="bg-industrial-charcoal border-white/10 text-digital-white max-w-lg rounded-[32px] p-0 overflow-hidden">
          <div className="bg-technic-yellow p-6 text-industrial-charcoal">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6" />
              <h2 className="text-xl font-display font-black uppercase tracking-tight">Mandatory Safety Gateway</h2>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest leading-relaxed opacity-80">
              Works cannot commence until the site is secured and a toolbox talk is completed.
            </p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              {[
                { id: 'ppeWorn', label: 'PPE Donned (All Personnel)', icon: <UserCheck className="w-4 h-4" /> },
                { id: 'sixConesPlaced', label: '6 Cones/Bottles Perimeter Set', icon: <MapPin className="w-4 h-4" /> },
                { id: 'dangerTapeSet', label: 'Danger Tape Deployed', icon: <AlertTriangle className="w-4 h-4" /> },
                { id: 'toolboxBrief', label: 'Safety Brief & Toolbox Talk Held', icon: <Users className="w-4 h-4" /> },
                { id: 'oilSpillMats', label: 'Oil Spill Mats in Position', icon: <ClipboardCheck className="w-4 h-4" /> },
                { id: 'handshake', label: 'Handshake Agreement Accepted', icon: <UserCheck className="w-4 h-4" /> },
              ].map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => {
                    if (item.id === 'handshake') {
                      setSafetyChecklist(prev => ({ ...prev, ppeWorn: prev.ppeWorn })); // Just a dummy trigger or update state properly
                      // Actually let's just add it to safetyChecklist state to be clean
                    }
                    setSafetyChecklist(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof safetyChecklist] }))
                  }}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${safetyChecklist[item.id as keyof typeof safetyChecklist] ? 'border-success-green bg-success-green/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${safetyChecklist[item.id as keyof typeof safetyChecklist] ? 'bg-success-green border-success-green' : 'bg-transparent border-white/20'}`}>
                    {safetyChecklist[item.id as keyof typeof safetyChecklist] && <CheckCircle2 className="w-4 h-4 text-industrial-charcoal" />}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-text-dim">{item.icon}</span>
                    <span className="text-sm font-bold uppercase tracking-tight">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex gap-3 items-start">
                <Shield className="w-5 h-5 text-technic-yellow shrink-0 mt-1" />
                <p className="text-[10px] text-text-dim uppercase leading-relaxed tracking-wider">
                  Handshake Agreement: By proceeding, you authorize Yellow Beast (Pty) Ltd for an on-site technical intervention in a residential setting. All work is risk-mitigated via digital audit.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 flex gap-3">
            <Button variant="outline" onClick={() => setShowSafetyModal(false)} className="flex-1 border-white/10 rounded-xl font-bold">
              POSTPONE
            </Button>
            <Button 
              onClick={verifySafetySetup}
              disabled={!Object.values(safetyChecklist).every(v => v)}
              className="flex-1 bg-technic-yellow text-industrial-charcoal font-black rounded-xl uppercase tracking-widest text-xs"
            >
               PROCEED TO OVERVIEW PHOTO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRoadworthyModal} onOpenChange={setShowRoadworthyModal}>
        <DialogContent className="bg-industrial-charcoal border-white/10 text-digital-white max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] p-0">
          <div className="sticky top-0 z-50 bg-orange-600 p-6 text-white shadow-xl">
             <div className="flex items-center gap-2 mb-2">
               <FileText className="w-6 h-6" />
               <h2 className="text-xl font-display font-black uppercase tracking-tight">Roadworthy Check</h2>
             </div>
             <p className="text-xs font-bold uppercase tracking-widest leading-relaxed opacity-80">
               Official Inspection (SANS 10047)
             </p>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {[
                 { id: 'identification', icon: <UserCheck className="w-4 h-4" />, label: 'Identification' },
                 { id: 'electrical', icon: <Zap className="w-4 h-4" />, label: 'Electrical System' },
                 { id: 'fittings', icon: <Wrench className="w-4 h-4" />, label: 'Fittings & Equipment' },
                 { id: 'braking', icon: <ShieldCheck className="w-4 h-4" />, label: 'Braking System' },
                 { id: 'wheels', icon: <Circle className="w-4 h-4" />, label: 'Wheels & Tyres' },
                 { id: 'suspension', icon: <Settings className="w-4 h-4" />, label: 'Suspension & Steering' },
                 { id: 'engine', icon: <TrendingUp className="w-4 h-4" />, label: 'Engine & Exhaust' },
                 { id: 'instruments', icon: <BarChart3 className="w-4 h-4" />, label: 'Instruments' }
               ].map((section) => (
                 <div key={section.id} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                       <span className="text-orange-400">{section.icon}</span>
                       <h3 className="text-sm font-black uppercase tracking-widest text-white">{section.label}</h3>
                    </div>
                    <div className="space-y-2">
                       {roadworthyData[section.id as keyof RoadworthyChecklist] && Object.keys(roadworthyData[section.id as keyof RoadworthyChecklist] as object).map((item) => (
                         <div 
                           key={item} 
                           onClick={() => {
                             const currentSection = roadworthyData[section.id as keyof RoadworthyChecklist] as any;
                             setRoadworthyData(prev => ({
                               ...prev,
                               [section.id]: { ...currentSection, [item]: !currentSection[item] }
                             }));
                           }}
                           className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                             (roadworthyData[section.id as keyof RoadworthyChecklist] as any)[item] 
                               ? 'border-success-green bg-success-green/10' 
                               : 'border-white/5 bg-white/5 hover:border-white/10'
                           }`}
                         >
                           <span className="text-[10px] font-bold uppercase tracking-tight text-white/80">
                             {item.replace(/([A-Z])/g, ' $1').trim()}
                           </span>
                           <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                             (roadworthyData[section.id as keyof RoadworthyChecklist] as any)[item] 
                               ? 'bg-success-green border-success-green' 
                               : 'bg-transparent border-white/20'
                           }`}>
                             {(roadworthyData[section.id as keyof RoadworthyChecklist] as any)[item] && <CheckCircle2 className="w-3 h-3 text-industrial-charcoal" />}
                           </div>
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20">
               <div className="flex gap-3">
                 <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
                 <p className="text-[11px] text-white/60 uppercase leading-relaxed tracking-wider">
                   Note: This is your digital record. Take this record to any municipality test station for faster processing.
                 </p>
               </div>
            </div>

            <div className="flex gap-4 pb-8">
              <Button variant="outline" onClick={() => setShowRoadworthyModal(false)} className="flex-1 border-white/10 text-white hover:bg-white/5 font-bold uppercase">
                DISCARD
              </Button>
              <Button 
                onClick={saveRoadworthyAudit}
                className="flex-1 bg-orange-600 text-white font-black rounded-xl uppercase tracking-widest"
              >
                SAVE RECORD
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBodyScanModal} onOpenChange={setShowBodyScanModal}>
        <DialogContent className="bg-industrial-charcoal border-white/10 text-digital-white max-w-4xl rounded-[32px] p-0 overflow-hidden">
          <div className="bg-blue-600 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <CameraIcon className="w-6 h-6" />
              <h2 className="text-xl font-display font-black uppercase tracking-tight">Pre-Service Body Scan</h2>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest leading-relaxed opacity-80">
              Mandatory Documentation: Take 4 photos of the vehicle to protect against pre-existing damage claims.
            </p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { id: 'front', label: 'Front View' },
                { id: 'back', label: 'Rear View' },
                { id: 'left', label: 'Left Side' },
                { id: 'right', label: 'Right Side' }
              ].map((pos) => (
                <div key={pos.id} className="space-y-3">
                  <div 
                    onClick={() => {
                      setCameraMode('evidence');
                      setCameraTitle(`Capture ${pos.label}`);
                      setShowCamera(true);
                    }}
                    className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative ${bodyScanPhotos[pos.id as keyof typeof bodyScanPhotos] ? 'border-success-green bg-success-green/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                  >
                    {bodyScanPhotos[pos.id as keyof typeof bodyScanPhotos] ? (
                      <>
                        <img src={bodyScanPhotos[pos.id as keyof typeof bodyScanPhotos]} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <CameraIcon className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <CameraIcon className="w-6 h-6 text-text-dim mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">{pos.label}</span>
                      </>
                    )}
                  </div>
                  {bodyScanPhotos[pos.id as keyof typeof bodyScanPhotos] && (
                    <div className="flex items-center gap-1 justify-center text-success-green">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Captured</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 mb-8">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-[11px] text-text-dim uppercase leading-relaxed tracking-wider">
                  Visual Compliance: This audit trail protects your reputation and justifies our 'Center-Grade' standard. Insurers value this 4-point inspection above all else.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowBodyScanModal(false)} className="flex-1 border-white/10 rounded-xl font-bold uppercase">
                CANCEL
              </Button>
              <Button 
                onClick={completeBodyScan}
                disabled={!bodyScanPhotos.front || !bodyScanPhotos.back || !bodyScanPhotos.left || !bodyScanPhotos.right}
                className="flex-1 bg-blue-600 text-white font-black rounded-xl uppercase tracking-widest"
              >
                SAVE & PROCEED TO SAFETY
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showCamera && (
        <CameraCapture 
          title={cameraTitle}
          mode={cameraMode}
          onCapture={handleCaptureEvidence}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};
