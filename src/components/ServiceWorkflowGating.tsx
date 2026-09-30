import React, { useState } from 'react';
import { 
  Users, CheckCircle2, AlertTriangle, Clock, ArrowRight, ShieldCheck, 
  FileText, Coins, Wrench, Search, Star, MessageSquare, ExternalLink, 
  Car, Lock, Unlock, Play, RefreshCw, ThumbsUp, ThumbsDown, Gift, 
  Percent, AlertCircle, Sparkles, Scale, Video, HelpCircle, Send
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';

export const ServiceWorkflowGating: React.FC = () => {
  // Current active step (1 to 10)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [oilSpillMatDeployed, setOilSpillMatDeployed] = useState<boolean>(true);
  const [oilSpillMatProofType, setOilSpillMatProofType] = useState<'15s_video' | 'photo'>('15s_video');
  const [gazeboWallsDeployed, setGazeboWallsDeployed] = useState<boolean>(true);
  const [gazeboWallsProofType, setGazeboWallsProofType] = useState<'15s_video' | 'photo'>('photo');

  // Stage 1: Duo Call-in
  const [vehicleMake] = useState('Toyota');
  const [vehicleModel] = useState('Hilux 2.8 GD-6');
  const [issueSummary] = useState('Steering whining noise and heavy resistance at low speeds (Power Steering)');

  // Stage 2 & 3: In-App Negotiation & Fee Setup
  const [mechanicProposedLabor, setMechanicProposedLabor] = useState<number>(1800);
  const [clientCounterLabor, setClientCounterLabor] = useState<number>(1500);
  const [agreedLabor, setAgreedLabor] = useState<number>(1600);
  const [negotiationStatus, setNegotiationStatus] = useState<'open' | 'accepted'>('accepted');
  const [includeApprentice, setIncludeApprentice] = useState<boolean>(true);
  const [apprenticeStipend, setApprenticeStipend] = useState<number>(350);

  // Stage 4 & 5: Site Visit (Diagnostic & First Trip On House)
  const [isFirstTripOnHouse] = useState<boolean>(true);
  const [diagnosticFee] = useState<number>(350);
  const [diagnosticSettled, setDiagnosticSettled] = useState<boolean>(true);

  // Stage 6: Parts Sourcing & Wait Period Logging
  const [partsSourceMode, setPartsSourceMode] = useState<'store_ferry' | 'order_wait'>('order_wait');
  const [waitLog, setWaitLog] = useState({
    dealerName: 'Goldwagen Central Distribution',
    partDescription: 'Power Steering Pump Pressure Hose & High-Pressure O-Ring Kit',
    orderReference: 'GW-ORD-88219',
    orderDate: new Date().toLocaleDateString(),
    estimatedDeliveryDate: 'Tomorrow, 14:00 SAST',
    status: 'ordered_waiting' as 'ordered_waiting' | 'in_transit' | 'delivered_ready',
    partsCost: 1450,
    notes: 'Parts ordered from Johannesburg hub. Mechanic & client notified of 24h wait period.'
  });

  // Stage 7: Repair Agreement
  const [repairAgreementSigned, setRepairAgreementSigned] = useState<boolean>(true);

  // Stage 8: Service Delivery
  const [serviceDelivered, setServiceDelivered] = useState<boolean>(true);

  // Stage 9: Satisfaction Review Gate (>= 4 stars required for payout)
  const [clientRating, setClientRating] = useState<number>(5);
  const [satisfactionChecks, setSatisfactionChecks] = useState({
    correctDiagnosis: true,
    correctPartsSourced: true,
    correctMethodApplied: true,
    deliverableVisible: true // Car fixed!
  });
  const [clientFeedback, setClientFeedback] = useState<string>(
    'The power steering is completely quiet now and turns effortlessly. Appreciated that the apprentice handled the fluid bleed under supervision.'
  );

  // Stage 10: Dissatisfaction AI Explainer & Video Matcher
  const [dissatisfactionTopic, setDissatisfactionTopic] = useState<string>('Power Steering Pump Failure & Aeration');
  const [aiEducationResult, setAiEducationResult] = useState<any>({
    title: 'Understanding Power Steering Hydraulic Failure Modes',
    explanation: 'Power steering pumps rely on cavitation-free hydraulic flow. A failing reservoir O-ring draws in micro-air bubbles (aeration), causing fluid foaming, loss of hydraulic pressure assist, and high-pitched whining.',
    commonCauses: [
      'Reservoir inlet hose hardening allowing air ingestion',
      'Pump internal flow control valve sticking',
      'Steering rack internal seal blow-by'
    ],
    diagnosticChecklist: [
      'Inspect reservoir fluid: foaming or brown fluid confirms aeration',
      'Check lock-to-lock pressure relief valve bypass sound',
      'Verify belt tensioner alignment and pulley runout'
    ],
    recommendedVideoTitle: 'How Power Steering Works & Why Pumps Whine / Fail - Engineering Explained',
    youtubeSearchUrl: 'https://www.youtube.com/results?search_query=how+power+steering+works+and+why+pumps+fail',
    antiParasitismGuideline: 'Client is NOT obliged to pay if value was not demonstrated that day. This eliminates opportunists and enforces financial discipline.'
  });
  const [isQueryingAI, setIsQueryingAI] = useState<boolean>(false);
  const [paymentWaivedDueToDissatisfaction, setPaymentWaivedDueToDissatisfaction] = useState<boolean>(false);

  // Stage 11: Retention Discount & Mutual 2-Way Ratings
  const [retentionDiscountCode, setRetentionDiscountCode] = useState<string>('TECHTRUST-15');
  const [retentionOffered, setRetentionOffered] = useState<boolean>(true);
  const [mutualRatings, setMutualRatings] = useState({
    clientRatedMechanic: 5,
    clientRatedApprentice: 5,
    mechanicRatedClient: 5
  });

  // Calculate if satisfaction criteria pass the >= 4 star gate
  const allCriteriaChecked = 
    satisfactionChecks.correctDiagnosis &&
    satisfactionChecks.correctPartsSourced &&
    satisfactionChecks.correctMethodApplied &&
    satisfactionChecks.deliverableVisible;
  const isSatisfiedAndUnlocked = clientRating >= 4 && allCriteriaChecked;

  const handleQueryAiExplainer = async () => {
    setIsQueryingAI(true);
    try {
      const res = await fetch('/api/ai/explain-issue-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueTopic: dissatisfactionTopic,
          vehicleInfo: { make: vehicleMake, model: vehicleModel, year: 2021 },
          clientConcerns: clientFeedback
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiEducationResult(data);
        toast.success('AI technical breakdown & YouTube video matched!');
      }
    } catch (e) {
      toast.error('Could not query AI educational engine.');
    } finally {
      setIsQueryingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-industrial-charcoal via-industrial-charcoal/90 to-amber-950/20 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[10px] uppercase">
                End-To-End Gated Lifecycle
              </Badge>
              <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 text-[10px]">
                Anti-Parasitism & Financial Discipline
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-digital-white uppercase tracking-tight">
              Service Gating & In-App Protocol
            </h1>
            <p className="text-text-dim text-xs sm:text-sm max-w-2xl mt-1">
              Every stage is strictly gated by in-app compliance: duo dispatch, in-app fee negotiation, 
              parts ordering wait periods, satisfaction gates (≥4 stars), and educational AI YouTube matchers.
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 p-3 rounded-xl flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-technic-yellow/20 text-technic-yellow font-black text-sm">
              STEP {currentStep} / 6
            </div>
            <div>
              <div className="text-[10px] text-text-dim uppercase font-bold">Stage Controller</div>
              <div className="text-xs font-bold text-white">
                {currentStep === 1 && 'Duo Ping & Negotiation'}
                {currentStep === 2 && 'Agreement & First Trip'}
                {currentStep === 3 && 'Diagnostic & Parts Wait Log'}
                {currentStep === 4 && 'Repair & Delivery'}
                {currentStep === 5 && 'Satisfaction Gate (≥4★)'}
                {currentStep === 6 && 'Retention & 2-Way Rating'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Circumvention / In-App Negotiation Penalty Banner */}
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <strong className="text-rose-400 font-bold uppercase block mb-0.5">
            Strict Anti-Circumvention Policy: Negotiate In-App Only
          </strong>
          <p className="text-text-dim leading-relaxed">
            All price negotiations, fee agreements, and parts terms <strong>must remain inside the app</strong>. Negotiating outside the app breaches platform trust, voids legal indemnification and smart escrow dispute protection, and incurs an automatic <strong>R500 platform fine</strong>.
          </p>
        </div>
      </div>

      {/* Step Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { num: 1, label: '1. Negotiation & Duo' },
          { num: 2, label: '2. Agreement & 1st Trip' },
          { num: 3, label: '3. Parts & Wait Period' },
          { num: 4, label: '4. Service Delivery' },
          { num: 5, label: '5. Satisfaction Gate' },
          { num: 6, label: '6. Retention & Ratings' },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setCurrentStep(s.num)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
              currentStep === s.num
                ? 'bg-technic-yellow text-industrial-charcoal border-technic-yellow font-black shadow-lg shadow-technic-yellow/10'
                : currentStep > s.num
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/5 text-text-dim border-white/10 hover:text-white'
            }`}
          >
            {currentStep > s.num ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------- */}
      {/* STEP 1: DUO PING & IN-APP FEE NEGOTIATION            */}
      {/* ---------------------------------------------------- */}
      {currentStep === 1 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[9px] uppercase mb-1">
                  Step 1 & 2 of Gated Lifecycle
                </Badge>
                <CardTitle className="text-base font-bold uppercase tracking-wider">
                  Duo Ping & In-App Job Card Fee Negotiation
                </CardTitle>
                <CardDescription className="text-xs">
                  Client calls in mechanic & apprentice duo. Both parties negotiate labor in-app before physical dispatch.
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400">
                DUO PINGED: KABELO & LERATO
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-dim">Vehicle:</span>
                <span className="font-bold text-white">{vehicleMake} {vehicleModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Client Problem Statement:</span>
                <span className="font-bold text-technic-yellow">{issueSummary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Apprentice Duo Policy:</span>
                <span className="text-emerald-400 font-bold">Included (Skills Transfer & Fair Stipend Logged)</span>
              </div>
            </div>

            {/* Negotiation Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <Label className="text-xs uppercase font-bold text-technic-yellow">Mechanic Initial Proposal</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={mechanicProposedLabor}
                    onChange={(e) => setMechanicProposedLabor(parseFloat(e.target.value) || 0)}
                    className="bg-black/40 border-white/10 font-mono font-bold text-white text-sm"
                  />
                  <span className="text-xs text-text-dim font-bold">ZAR Labor</span>
                </div>
                <p className="text-[11px] text-text-dim">Includes master specialist labor plus apprentice coaching.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <Label className="text-xs uppercase font-bold text-blue-400">Client In-App Counter-Offer</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    value={clientCounterLabor}
                    onChange={(e) => setClientCounterLabor(parseFloat(e.target.value) || 0)}
                    className="bg-black/40 border-white/10 font-mono font-bold text-white text-sm"
                  />
                  <span className="text-xs text-text-dim font-bold">ZAR Offer</span>
                </div>
                <p className="text-[11px] text-text-dim">Client negotiates based on local market & parts budget.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase block">Mutually Agreed Labor</span>
                <span className="text-2xl font-black font-mono text-white">R {agreedLabor.toLocaleString()}</span>
                <span className="text-[10px] text-text-dim block mt-0.5">
                  Apprentice allocation: R {apprenticeStipend}.00 (Guaranteed on-time fair compensation)
                </span>
              </div>
              <Button
                onClick={() => {
                  setNegotiationStatus('accepted');
                  toast.success('Terms agreed in-app! Generating legal service agreement.');
                  setCurrentStep(2);
                }}
                className="bg-technic-yellow text-industrial-charcoal font-black text-xs uppercase px-6"
              >
                Accept & Proceed to Agreement <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 2: AGREEMENT, INDEMNITY & FIRST TRIP ON HOUSE   */}
      {/* ---------------------------------------------------- */}
      {currentStep === 2 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[9px] uppercase mb-1">
                  Step 3 & 4 of Gated Lifecycle
                </Badge>
                <CardTitle className="text-base font-bold uppercase tracking-wider">
                  Digital Service Agreement & First Trip On The House
                </CardTitle>
                <CardDescription className="text-xs">
                  Legal terms generated (labor, apprentice inclusion, warranty & indemnity). Duo arrives in person for free to show face.
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400">
                CALL-OUT: R0.00 (FIRST TRIP FREE)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase text-xs">Generated Agreement Summary</h4>
              <div className="space-y-1.5 text-text-dim border-t border-white/5 pt-2">
                <div className="flex justify-between">
                  <span>Labor Terms:</span>
                  <span className="text-white font-bold">R {agreedLabor} (Specialist + Apprentice Included)</span>
                </div>
                <div className="flex justify-between">
                  <span>Workmanship Warranty:</span>
                  <span className="text-emerald-400 font-bold">6 Months / 10,000 km</span>
                </div>
                <div className="flex justify-between">
                  <span>Indemnification Clause:</span>
                  <span className="text-white font-bold">Mutual Driveway Safety & Tool Custody Active</span>
                </div>
                <div className="flex justify-between">
                  <span>First Diagnostic Trip:</span>
                  <span className="text-emerald-400 font-bold">R0.00 (Show Face Guarantee - No Advance Risk)</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-1.5 text-[11px]">
                  <span>Contract Storage:</span>
                  <span className="text-blue-300 font-mono">gs://makhanikhi-vault/agreements/AGR-8819.pdf (Off-Chain Bucket)</span>
                </div>
              </div>
            </div>

            {/* Mandatory Oil Spill Mat Deployment Gate */}
            <div className={`p-4 rounded-xl border transition-all ${
              oilSpillMatDeployed 
                ? 'bg-black/40 border-white/10' 
                : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="oilSpillMat"
                    checked={oilSpillMatDeployed}
                    onChange={(e) => setOilSpillMatDeployed(e.target.checked)}
                    className="accent-technic-yellow w-5 h-5 rounded mt-0.5"
                  />
                  <div>
                    <label htmlFor="oilSpillMat" className="text-xs font-bold text-white uppercase block cursor-pointer">
                      Mandatory Oil Spill Mats Deployed Beneath Vehicle
                    </label>
                    <p className="text-[11px] text-text-dim mt-0.5">
                      Work CANNOT commence without oil spill mat verification to protect client driveways from stains.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-text-dim uppercase font-bold">Proof Type:</span>
                  <button
                    type="button"
                    onClick={() => setOilSpillMatProofType('15s_video')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      oilSpillMatProofType === '15s_video' ? 'bg-technic-yellow text-black' : 'bg-white/10 text-white'
                    }`}
                  >
                    15s Video Proof
                  </button>
                  <button
                    type="button"
                    onClick={() => setOilSpillMatProofType('photo')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      oilSpillMatProofType === 'photo' ? 'bg-technic-yellow text-black' : 'bg-white/10 text-white'
                    }`}
                  >
                    Photo Proof
                  </button>
                </div>
              </div>

              {!oilSpillMatDeployed && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[11px] text-rose-300 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  HARD LOCK: Work is blocked. You must deploy oil spill mats and verify via 15-second video or photo.
                </div>
              )}
            </div>

            {/* Mandatory Gazebo with Wall Coverings (Water Ingress Prevention) Gate */}
            <div className={`p-4 rounded-xl border transition-all ${
              gazeboWallsDeployed 
                ? 'bg-black/40 border-white/10' 
                : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="gazeboWalls"
                    checked={gazeboWallsDeployed}
                    onChange={(e) => setGazeboWallsDeployed(e.target.checked)}
                    className="accent-technic-yellow w-5 h-5 rounded mt-0.5"
                  />
                  <div>
                    <label htmlFor="gazeboWalls" className="text-xs font-bold text-white uppercase block cursor-pointer">
                      Gazebo with Sealed Wall Coverings Deployed (Water Ingress Prevention)
                    </label>
                    <p className="text-[11px] text-text-dim mt-0.5">
                      Ensures rain does not stop viable work (e.g. air filter, alternator, spark plugs) by insulating the mobile workshop from side winds and rainfall.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-text-dim uppercase font-bold">Proof Type:</span>
                  <button
                    type="button"
                    onClick={() => setGazeboWallsProofType('photo')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      gazeboWallsProofType === 'photo' ? 'bg-technic-yellow text-black' : 'bg-white/10 text-white'
                    }`}
                  >
                    Photo Proof
                  </button>
                  <button
                    type="button"
                    onClick={() => setGazeboWallsProofType('15s_video')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      gazeboWallsProofType === '15s_video' ? 'bg-technic-yellow text-black' : 'bg-white/10 text-white'
                    }`}
                  >
                    15s Video Proof
                  </button>
                </div>
              </div>

              {!gazeboWallsDeployed && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[11px] text-rose-300 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  GATE BLOCKED: Rain and water ingress protection required. Mount gazebo side wall curtains to establish the covered mobile workshop.
                </div>
              )}
            </div>

            {/* Duo Show Face Confirmation */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-400 block">Duo Checked In on Site</span>
                  <span className="text-text-dim">Specialist & Apprentice arrived with toolset, all-weather gazebo + wall coverings, & oil spill mats.</span>
                </div>
              </div>
              <Button
                onClick={() => {
                  if (!oilSpillMatDeployed) {
                    toast.error('Deploy oil spill mats and verify proof to proceed!');
                    return;
                  }
                  if (!gazeboWallsDeployed) {
                    toast.error('Deploy gazebo with wall coverings to protect site from water ingress!');
                    return;
                  }
                  toast.success('Site established & agreement counter-signed! Moving to diagnostic & parts check.');
                  setCurrentStep(3);
                }}
                disabled={!oilSpillMatDeployed || !gazeboWallsDeployed}
                className={`text-xs uppercase font-black ${
                  (oilSpillMatDeployed && gazeboWallsDeployed)
                    ? 'bg-technic-yellow hover:bg-technic-yellow/90 text-industrial-charcoal' 
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                Sign & Authorize Diagnostic <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 3: DIAGNOSTIC SETTLED & PARTS WAIT PERIOD LOG   */}
      {/* ---------------------------------------------------- */}
      {currentStep === 3 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[9px] uppercase mb-1">
                  Step 5, 6 & 7 of Gated Lifecycle
                </Badge>
                <CardTitle className="text-base font-bold uppercase tracking-wider">
                  Diagnostic Settled & Parts Wait Period Logging
                </CardTitle>
                <CardDescription className="text-xs">
                  Diagnostic completed. Client agrees to parts sourcing. If parts must be ordered, the wait period is formally logged.
                </CardDescription>
              </div>
              <Badge className={waitLog.status === 'delivered_ready' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
                {waitLog.status === 'delivered_ready' ? 'PARTS ON SITE' : 'PARTS WAIT PERIOD LOGGED'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sourcing Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPartsSourceMode('store_ferry')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  partsSourceMode === 'store_ferry' ? 'border-technic-yellow bg-technic-yellow/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="font-bold text-xs uppercase text-white mb-1">Option A: Store Ferry</div>
                <p className="text-[11px] text-text-dim">Client accompanies mechanic to local Midas / Goldwagen for immediate shelf pickup.</p>
              </button>

              <button
                onClick={() => setPartsSourceMode('order_wait')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  partsSourceMode === 'order_wait' ? 'border-technic-yellow bg-technic-yellow/10' : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="font-bold text-xs uppercase text-technic-yellow mb-1">Option B: Ordered / Wait Period</div>
                <p className="text-[11px] text-text-dim">Specialized parts must be ordered from central hub. Wait period formally logged in-app.</p>
              </button>
            </div>

            {/* Wait Period Log Form */}
            {partsSourceMode === 'order_wait' && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" /> Active Parts Ordering Log
                  </h4>
                  <Badge variant="outline" className="text-amber-400 border-amber-400/30 text-[10px]">
                    WORK PAUSED PENDING DELIVERY
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <Label className="text-text-dim">Dealer / Supplier</Label>
                    <Input 
                      value={waitLog.dealerName}
                      onChange={(e) => setWaitLog({ ...waitLog, dealerName: e.target.value })}
                      className="h-8 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-text-dim">Order / Tracking Ref</Label>
                    <Input 
                      value={waitLog.orderReference}
                      onChange={(e) => setWaitLog({ ...waitLog, orderReference: e.target.value })}
                      className="h-8 bg-white/5 border-white/10 text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-text-dim">Part Description</Label>
                    <Input 
                      value={waitLog.partDescription}
                      onChange={(e) => setWaitLog({ ...waitLog, partDescription: e.target.value })}
                      className="h-8 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-text-dim">Estimated Delivery Time</Label>
                    <Input 
                      value={waitLog.estimatedDeliveryDate}
                      onChange={(e) => setWaitLog({ ...waitLog, estimatedDeliveryDate: e.target.value })}
                      className="h-8 bg-white/5 border-white/10 text-amber-400 font-bold"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-text-dim italic">
                  Note: Gating prevents mechanic from billing final installation until parts arrive and are verified.
                </p>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setWaitLog({ ...waitLog, status: 'delivered_ready' });
                      toast.success('Parts received on site! Repair stage UNLOCKED.');
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs"
                  >
                    Mark Parts Received (Unlock Repair)
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep(4)}
                disabled={partsSourceMode === 'order_wait' && waitLog.status !== 'delivered_ready'}
                className="bg-technic-yellow text-industrial-charcoal font-black text-xs uppercase px-6"
              >
                Proceed to Service Execution <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 4: SERVICE DELIVERED & REMEDIAL INSPECTION      */}
      {/* ---------------------------------------------------- */}
      {currentStep === 4 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[9px] uppercase mb-1">
                  Step 8 & 9 of Gated Lifecycle
                </Badge>
                <CardTitle className="text-base font-bold uppercase tracking-wider">
                  Service Execution & Physical Deliverable
                </CardTitle>
                <CardDescription className="text-xs">
                  Repairs completed by specialist and apprentice under driveway safety protocols.
                </CardDescription>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400">
                REPAIR DELIVERED
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase text-xs">Work Completed & Roadworthy Safety Checks</h4>
              <div className="space-y-1.5 text-text-dim border-t border-white/5 pt-2">
                <div className="flex justify-between">
                  <span>Installed Parts:</span>
                  <span className="text-white font-bold">{waitLog.partDescription}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fluid Flush & Bleed:</span>
                  <span className="text-emerald-400 font-bold">100% Completed (Aeration Free)</span>
                </div>
                <div className="flex justify-between">
                  <span>Independent Roadworthy Safety Standards:</span>
                  <span className="text-emerald-400 font-bold">Steering, Brakes, Lights & Leak Tests Passed</span>
                </div>
                <div className="flex justify-between">
                  <span>Apprentice Mentorship Logged:</span>
                  <span className="text-white font-bold">3.5 hrs (Ubuntu Skills Transfer Completed)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-technic-yellow/10 border border-technic-yellow/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-technic-yellow font-bold uppercase block">Next Gate: Client Road Test & Review</span>
                <span className="text-text-dim text-[11px]">Client must conduct physical road test to verify the vehicle is truly fixed.</span>
              </div>
              <Button
                onClick={() => setCurrentStep(5)}
                className="bg-technic-yellow text-industrial-charcoal font-black text-xs uppercase"
              >
                Proceed to Satisfaction Gate <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 5: SATISFACTION GATE (≥4 STARS) & ANTI-PARASITISM */}
      {/* ---------------------------------------------------- */}
      {currentStep === 5 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[9px] uppercase mb-1">
                  Step 10 of Gated Lifecycle
                </Badge>
                <CardTitle className="text-base font-bold uppercase tracking-wider">
                  Client Satisfaction Gate (≥ 4-Star Requirement)
                </CardTitle>
                <CardDescription className="text-xs">
                  Reimbursement for services rendered is conditioned on client satisfaction (≥ 4 stars) with 4 physical deliverable criteria.
                </CardDescription>
              </div>
              <Badge className={isSatisfiedAndUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>
                {isSatisfiedAndUnlocked ? 'PAYOUT UNLOCKED' : 'PAYOUT GATED (HOLD)'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Star Rating Selector */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase font-bold text-white">Client Rating (Must be ≥ 4 Stars to Release Funds)</Label>
                <span className="text-technic-yellow font-black font-mono text-base">{clientRating} / 5 Stars</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setClientRating(star)}
                    className={`text-2xl transition-all ${star <= clientRating ? 'text-technic-yellow scale-110' : 'text-white/20'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* The 4 Mandatory Deliverable Checkboxes */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase text-xs">4 Visible Deliverable Criteria</h4>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={satisfactionChecks.correctDiagnosis}
                  onChange={(e) => setSatisfactionChecks({ ...satisfactionChecks, correctDiagnosis: e.target.checked })}
                  className="w-4 h-4 accent-technic-yellow rounded"
                />
                <span className="text-white">1. Correct diagnosis was identified accurately</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={satisfactionChecks.correctPartsSourced}
                  onChange={(e) => setSatisfactionChecks({ ...satisfactionChecks, correctPartsSourced: e.target.checked })}
                  className="w-4 h-4 accent-technic-yellow rounded"
                />
                <span className="text-white">2. Correct, high-grade parts were sourced and verified</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={satisfactionChecks.correctMethodApplied}
                  onChange={(e) => setSatisfactionChecks({ ...satisfactionChecks, correctMethodApplied: e.target.checked })}
                  className="w-4 h-4 accent-technic-yellow rounded"
                />
                <span className="text-white">3. Correct remedial action & professional method applied</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={satisfactionChecks.deliverableVisible}
                  onChange={(e) => setSatisfactionChecks({ ...satisfactionChecks, deliverableVisible: e.target.checked })}
                  className="w-4 h-4 accent-technic-yellow rounded"
                />
                <span className="text-white font-bold">
                  4. Deliverable visible: the car got fixed and the issue the client raised got remedied!
                </span>
              </label>
            </div>

            {/* Dissatisfaction & Anti-Parasitism Module (< 4 Stars) */}
            {clientRating < 4 && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-400 uppercase">
                      Anti-Parasitism & Financial Discipline Protocol Active
                    </h4>
                    <p className="text-[11px] text-text-dim mt-0.5 leading-relaxed">
                      "The client is not obliged to pay the mechanic if they do not see the value of their effort that day. This avoids mechanic parasitism, protects the client, and instills financial discipline in the service provider."
                    </p>
                  </div>
                </div>

                {/* AI Education & YouTube Matcher */}
                <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-technic-yellow uppercase flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> AI Root-Cause Explainer & YouTube Matcher
                    </span>
                    <Button
                      size="sm"
                      onClick={handleQueryAiExplainer}
                      disabled={isQueryingAI}
                      className="h-7 text-[10px] bg-white/10 hover:bg-white/20 text-white font-bold"
                    >
                      {isQueryingAI ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : null}
                      Re-Query AI
                    </Button>
                  </div>

                  <p className="text-xs text-white leading-relaxed">
                    {aiEducationResult.explanation}
                  </p>

                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-xs text-white font-bold truncate max-w-xs sm:max-w-md">
                        {aiEducationResult.recommendedVideoTitle}
                      </span>
                    </div>
                    <a
                      href={aiEducationResult.youtubeSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-red-400 hover:text-red-300 inline-flex items-center gap-1 shrink-0"
                    >
                      Watch on YouTube <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPaymentWaivedDueToDissatisfaction(true);
                      toast.warning('Payment waived under Anti-Parasitism rule. No client obligation.');
                    }}
                    className="border-rose-500/40 text-rose-300 hover:bg-rose-500/20 text-xs font-bold"
                  >
                    Waive Payment (No Value Demonstrated)
                  </Button>
                </div>
              </div>
            )}

            {/* Payout Action */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => {
                  toast.success('Service approved & final tax invoice generated!');
                  setCurrentStep(6);
                }}
                disabled={!isSatisfiedAndUnlocked}
                className={`text-xs font-black uppercase px-6 ${
                  isSatisfiedAndUnlocked 
                    ? 'bg-technic-yellow hover:bg-technic-yellow/90 text-industrial-charcoal' 
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                }`}
              >
                Disburse Payout & Generate Invoice <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 6: RETENTION DISCOUNT & 2-WAY MUTUAL RATINGS     */}
      {/* ---------------------------------------------------- */}
      {currentStep === 6 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <Badge className="bg-emerald-500/20 text-emerald-400 font-bold text-[9px] uppercase mb-1">
                  Final Step: Relationship Retention
                </Badge>
                <CardTitle className="text-base font-bold uppercase tracking-wider">
                  Retention Discount & 2-Way Mutual Ratings
                </CardTitle>
                <CardDescription className="text-xs">
                  Seamless transaction completed! Mechanic offers future call-out discount and both parties exchange ratings.
                </CardDescription>
              </div>
              <Badge className="bg-technic-yellow text-industrial-charcoal font-black">
                15% RETENTION VOUCHER
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Retention Voucher Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-technic-yellow/10 to-emerald-500/10 border border-technic-yellow/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-technic-yellow font-bold uppercase tracking-widest block">Seamless Service Reward</span>
                <h4 className="text-lg font-black text-white uppercase mt-0.5">
                  15% Off Next Call-Out: <code className="text-technic-yellow font-mono">{retentionDiscountCode}</code>
                </h4>
                <p className="text-xs text-text-dim mt-1">
                  Issued by Kabelo Sithole to Sipho Ndlovu for future fleet / personal driveway maintenance.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(retentionDiscountCode);
                  toast.success('Retention discount code copied to clipboard!');
                }}
                className="bg-technic-yellow text-industrial-charcoal font-black text-xs uppercase shrink-0"
              >
                Copy Voucher
              </Button>
            </div>

            {/* 2-Way Mutual Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-text-dim uppercase font-bold text-[10px]">Client Rates Specialist</span>
                <h5 className="font-bold text-white">Kabelo Sithole</h5>
                <div className="flex text-technic-yellow text-base">★★★★★</div>
                <p className="text-[11px] text-text-dim">Technical competence, diagnosis, and clean site management.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-text-dim uppercase font-bold text-[10px]">Client Rates Apprentice</span>
                <h5 className="font-bold text-white">Lerato Mokoena</h5>
                <div className="flex text-technic-yellow text-base">★★★★★</div>
                <p className="text-[11px] text-text-dim">Punctuality, attentiveness to mentor, tool cleanliness.</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-text-dim uppercase font-bold text-[10px]">Specialist Rates Client</span>
                <h5 className="font-bold text-white">Sipho Ndlovu</h5>
                <div className="flex text-technic-yellow text-base">★★★★★</div>
                <p className="text-[11px] text-text-dim">Ubuntu hospitality, clear driveway access, prompt sign-off.</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="border-white/10 text-white text-xs font-bold uppercase"
              >
                Start New Job Cycle
              </Button>
              <Badge className="bg-emerald-500 text-black font-black text-xs uppercase px-3 py-1">
                ✓ LIFECYCLE 100% COMPLETE & AUDITED
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
