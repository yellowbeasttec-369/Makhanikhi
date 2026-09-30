import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Unlock, AlertTriangle, CheckCircle2, 
  Coins, ArrowRight, FileCode, Check, Copy, ExternalLink, 
  RefreshCw, Terminal, Eye, Scale, UserCheck, Flame, 
  Box, Sparkles, Building, Play, ChevronRight, XCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { 
  EscrowComplianceData, 
  calculateComplianceScore, 
  calculateEscrowFinancials, 
  MechanicRanking 
} from '../services/escrowService';

export const SmartEscrow: React.FC = () => {
  // Financial parameters
  const [jobAmount, setJobAmount] = useState<number>(3500);
  const [escrowState, setEscrowState] = useState<'awaiting_deposit' | 'funds_locked' | 'audited' | 'released' | 'refunded'>('funds_locked');
  const [activeTab, setActiveTab] = useState<'protocol' | 'compliance' | 'zaru_fairtrade' | 'rust_contract'>('protocol');

  // Mechanic Ranking State (3 months 5-stars + apprentice mentor)
  const [mechanicRanking, setMechanicRanking] = useState<MechanicRanking>({
    mechanicId: 'mech-za-882',
    name: 'Kabelo "Speedy" Sithole (Master Tech)',
    currentRating: 5.0,
    consecutiveFiveStarMonths: 3,
    trainsApprentices: true,
    fairlyCompensatesApprentices: true,
    cpdPoints: 120,
    rulesGameCompleted: true,
    eligibleFor15PercentDiscount: true,
    lifetimeJobs: 47
  });

  // 3-Pillar Compliance State
  const [complianceData, setComplianceData] = useState<EscrowComplianceData>({
    // Pillar 1: Incorporation (35%)
    jurisdiction: 'ZA',
    cipcRegistrationNumber: '2023/849201/07',
    cipcCertificateUploaded: true,
    cipcAnnualReturnsProof: true,
    bizeeFilingId: '',
    bizeeArticlesUploaded: false,
    bizeeAnnualReportProof: false,
    globalRegistrationNumber: '',
    globalCertificateUploaded: false,

    // Pillar 2: Safety & Live Substance Test (35%)
    liveSubstanceTestProof: true,
    substanceTestTimestamp: new Date().toLocaleTimeString() + ' SAST',
    ppeSteelToeBoots: true,
    ppeOverallsFlameRetardant: true,
    ppeEyeGoggles: true,
    ppeMechanicGloves: true,

    // Pillar 3: Site Readiness & Specialized Toolset (30%)
    brandedGazeboDeployed: true,
    demarcationMethod: 'sand_bottles_6',
    dangerTapePerimeterSet: true,
    oilSpillMatDeployed: true,
    oilSpillMatProofType: '15s_video',
    oilSpillMatMediaUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=400',
    oilSpillMatVerified: true,
    toolboxType: 'specialized_mechanic_box',
    toolboxParsedTimestamp: new Date().toLocaleTimeString()
  });

  const [txHash, setTxHash] = useState<string>('5KnpwW2m9X8e1JzXq6aRt4uY3pL7hVd9CfbM2vQ1eZbT');
  const [storageBucketUri] = useState<string>('gs://makhanikhi-vault/agreements/AGR-2026-8819-signed.pdf');
  const [viewAs, setViewAs] = useState<'mechanic' | 'client'>('mechanic');
  const [isProcessingTx, setIsProcessingTx] = useState<boolean>(false);

  // Calculate scores and financials
  const auditResult = calculateComplianceScore(complianceData);
  const financials = calculateEscrowFinancials(jobAmount, mechanicRanking);

  // Toggle helper
  const updateCompliance = (patch: Partial<EscrowComplianceData>) => {
    setComplianceData(prev => ({ ...prev, ...patch }));
  };

  const handleDeposit = () => {
    setIsProcessingTx(true);
    setTimeout(() => {
      setEscrowState('funds_locked');
      setTxHash('4LmXvP8kR9' + Math.random().toString(36).substring(2, 10));
      setIsProcessingTx(false);
      toast.success('Funds locked into Solana Anchor Escrow PDA Vault!');
    }, 1000);
  };

  const handleRelease = () => {
    if (!auditResult.passedThreshold) {
      toast.error(`Compliance is ${auditResult.totalScore}%. Minimum 90% required to disburse funds!`);
      return;
    }
    setIsProcessingTx(true);
    setTimeout(() => {
      setEscrowState('released');
      setIsProcessingTx(false);
      toast.success(`Escrow Released! R ${financials.netMechanicPayout.toLocaleString()} paid to mechanic, R ${financials.totalPlatformRevenue.toLocaleString()} to Makhanikhi Platform Treasury.`);
    }, 1200);
  };

  const handleRefund = () => {
    setIsProcessingTx(true);
    setTimeout(() => {
      setEscrowState('refunded');
      setIsProcessingTx(false);
      toast.warning(`Escrow refunded to client! Connection fee retained for roadside dispatch expenses.`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-industrial-charcoal via-industrial-charcoal/90 to-black border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-technic-yellow/20 text-technic-yellow text-[10px] font-mono font-black uppercase tracking-widest border border-technic-yellow/30">
                Rust / Solana Anchor Protocol
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                Mainnet / Localnet Compatible
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-digital-white uppercase">
              Smart Escrow & Compliance Oracle
            </h1>
            <p className="text-text-dim text-xs sm:text-sm max-w-2xl mt-1">
              Automated smart escrow settled in <strong className="text-technic-yellow">ZARU Digital Rands (1 ZARU = R 1.00)</strong>, 
              governed by national motor industry fair trade standards, technical roadworthy safety rules, and the strict <strong className="text-technic-yellow">90%+ compliance threshold</strong>.
            </p>
          </div>

          {/* Quick Status Pill */}
          <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-3 rounded-xl">
            <div className={`p-2.5 rounded-xl ${auditResult.passedThreshold ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {auditResult.passedThreshold ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[10px] text-text-dim uppercase font-bold tracking-widest">Escrow Condition</div>
              <div className="text-sm font-black font-mono">
                {auditResult.passedThreshold ? (
                  <span className="text-emerald-400">UNLOCKED ({auditResult.totalScore}% ≥ 90%)</span>
                ) : (
                  <span className="text-rose-400">LOCKED ({auditResult.totalScore}% &lt; 90%)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="bg-card-bg border border-border-dim p-1 rounded-xl flex-wrap justify-start">
          <TabsTrigger value="protocol" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal font-bold text-xs uppercase px-4 py-2">
            <Coins className="w-3.5 h-3.5 mr-1.5" /> Escrow Flow & Fees
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal font-bold text-xs uppercase px-4 py-2">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> 3-Pillar Compliance (90%+)
          </TabsTrigger>
          <TabsTrigger value="zaru_fairtrade" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal font-bold text-xs uppercase px-4 py-2">
            <Scale className="w-3.5 h-3.5 mr-1.5" /> ZARU & Fair Trade
          </TabsTrigger>
          <TabsTrigger value="rust_contract" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal font-bold text-xs uppercase px-4 py-2">
            <FileCode className="w-3.5 h-3.5 mr-1.5" /> Rust Smart Contract Code
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: PROTOCOL & FEE BREAKDOWN                      */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="protocol" className="space-y-6 mt-4">
          {/* ZARU Digital Rand & Bank Custody Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-emerald-500/10 to-transparent border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 font-mono font-black text-sm shrink-0">
                ZARU
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm uppercase text-digital-white tracking-wide">
                    Settled in ZARU Digital Rands (1 ZARU = R 1.00 Cash Rand)
                  </h3>
                  <Badge className="bg-emerald-500 text-black font-black text-[9px] uppercase">
                    100% BANK-CUSTODIED
                  </Badge>
                </div>
                <p className="text-xs text-text-dim mt-0.5 leading-relaxed">
                  1 ZARU is always worth exactly 1 South African Rand, backed by cash kept safely in registered South African commercial bank vaults. 
                  Your money sits safely in this digital lock-box until the vehicle passes the road safety inspection.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-text-dim uppercase font-bold block">Escrow Valuation</span>
              <span className="text-base font-black font-mono text-technic-yellow">
                {(jobAmount + financials.clientConnectionFee).toLocaleString()} ZARU
              </span>
            </div>
          </div>

          {/* Perspective Toggle (Client Clean View vs Mechanic View) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-dim uppercase font-bold">Audience Perspective:</span>
              <div className="bg-black/50 border border-white/10 p-0.5 rounded-lg flex">
                <button
                  type="button"
                  onClick={() => setViewAs('client')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    viewAs === 'client' ? 'bg-blue-500 text-white shadow' : 'text-text-dim hover:text-white'
                  }`}
                >
                  Client Clean View
                </button>
                <button
                  type="button"
                  onClick={() => setViewAs('mechanic')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    viewAs === 'mechanic' ? 'bg-technic-yellow text-industrial-charcoal shadow' : 'text-text-dim hover:text-white'
                  }`}
                >
                  Mechanic & Audit View
                </button>
              </div>
            </div>
            <div className="text-[11px] text-text-dim">
              {viewAs === 'client' ? (
                <span className="text-blue-400 font-medium">✓ Apprentice internal amounts private • Clean consumer invoice</span>
              ) : (
                <span className="text-technic-yellow font-medium">Full in-house accounting • Flexible 12% rate & ranking discounts</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client Card */}
            <Card className="bg-white/5 border-white/10 hover:border-technic-yellow/30 transition-all">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit text-[10px] text-blue-400 border-blue-400/30">CLIENT INFLOW</Badge>
                <CardTitle className="text-base uppercase tracking-wider font-bold">Client Deposit</CardTitle>
                <CardDescription className="text-xs">Job Amount + Platform Fee (10–15%)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-black font-mono text-digital-white">
                  R {(jobAmount + financials.clientConnectionFee).toLocaleString()}
                </div>
                <div className="text-xs space-y-1 text-text-dim border-t border-white/5 pt-2">
                  <div className="flex justify-between">
                    <span>Base Service Labor:</span>
                    <span className="font-bold text-white">R {jobAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-blue-400">
                    <span>Client Platform Fee ({financials.clientFeeRatePercent}%):</span>
                    <span className="font-bold">+ R {financials.clientConnectionFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 border-t border-white/5 pt-1 mt-1">
                    <span>Apprentice Remuneration:</span>
                    <span className="font-bold">✓ Confirmed & Disbursed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Escrow Vault Card */}
            <Card className="bg-white/5 border-technic-yellow/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lock className="w-20 h-20 text-technic-yellow" />
              </div>
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit text-[10px] text-technic-yellow border-technic-yellow/40">
                  SMART ESCROW VAULT (PDA)
                </Badge>
                <CardTitle className="text-base uppercase tracking-wider font-bold">Funds Locked</CardTitle>
                <CardDescription className="text-xs">Under Contract: <code className="text-technic-yellow font-mono text-[10px]">MakhEscrow111...</code></CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-black font-mono text-technic-yellow">
                  R {(jobAmount + financials.clientConnectionFee).toLocaleString()}
                </div>
                <div className="text-xs space-y-1.5 border-t border-white/5 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-text-dim">Status:</span>
                    <Badge className={`text-[10px] uppercase font-mono ${
                      escrowState === 'released' ? 'bg-emerald-500/20 text-emerald-400' :
                      escrowState === 'funds_locked' ? 'bg-technic-yellow/20 text-technic-yellow' : 'bg-white/10 text-white'
                    }`}>
                      {escrowState.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-dim">Compliance Oracle:</span>
                    <span className={`font-black font-mono ${auditResult.passedThreshold ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {auditResult.totalScore}% / 100% {auditResult.passedThreshold ? '✓ PASSED' : '✗ HOLD'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mechanic Payout Card */}
            <Card className="bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all">
              <CardHeader className="pb-2">
                <Badge variant="outline" className="w-fit text-[10px] text-emerald-400 border-emerald-400/30">
                  MECHANIC DISBURSEMENT
                </Badge>
                <CardTitle className="text-base uppercase tracking-wider font-bold">Mechanic Net Payout</CardTitle>
                <CardDescription className="text-xs">After Modest Platform Fee & Discount</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-black font-mono text-emerald-400">
                  R {financials.netMechanicPayout.toLocaleString()}
                </div>
                <div className="text-xs space-y-1 text-text-dim border-t border-white/5 pt-2">
                  <div className="flex justify-between">
                    <span>Base Platform Fee (8%):</span>
                    <span className="text-rose-400">- R {financials.basePlatformFee.toLocaleString()}</span>
                  </div>
                  {financials.discountPercentage > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>🏆 15% Rank Discount (5-Star Streak):</span>
                      <span>+ R {(financials.basePlatformFee - financials.appliedPlatformFee).toLocaleString()} saved</span>
                    </div>
                  )}
                  <div className="flex justify-between text-text-dim border-t border-white/5 pt-1">
                    <span>Effective Platform Fee:</span>
                    <span className="font-bold text-white">R {financials.appliedPlatformFee.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gamification & Discount Badge Section */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-technic-yellow/10 to-amber-500/5 border border-technic-yellow/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-technic-yellow text-industrial-charcoal font-black text-xl">
                ★
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm uppercase text-digital-white tracking-wide">
                    Mechanic Gamified Tier: {mechanicRanking.name}
                  </h3>
                  <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[9px]">
                    15% FEE DISCOUNT ACTIVE
                  </Badge>
                </div>
                <p className="text-xs text-text-dim mt-0.5">
                  Qualification met: <strong>3 consecutive months of 5 stars</strong> (streak: {mechanicRanking.consecutiveFiveStarMonths} mos) + 
                  active training & fair compensation of apprentices. Platform fee discounted from 8.0% to <strong>6.8%</strong>!
                </p>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setMechanicRanking(prev => ({
                  ...prev,
                  consecutiveFiveStarMonths: prev.consecutiveFiveStarMonths >= 3 ? 1 : 3,
                  eligibleFor15PercentDiscount: prev.consecutiveFiveStarMonths < 3
                }));
                toast.info('Toggled mechanic 5-star streak criteria');
              }}
              className="border-technic-yellow/40 text-technic-yellow hover:bg-technic-yellow/20 text-xs font-bold shrink-0"
            >
              Toggle 5-Star Streak
            </Button>
          </div>

          {/* Escrow Action Console */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold uppercase tracking-wider text-digital-white">
                  Smart Contract Actions
                </h3>
                <p className="text-xs text-text-dim">
                  Manage escrow state machine transitions on the Solana network.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={handleDeposit}
                  disabled={escrowState !== 'awaiting_deposit' || isProcessingTx}
                  variant="outline"
                  size="sm"
                  className="border-blue-500/40 text-blue-400 hover:bg-blue-500/20 text-xs font-bold"
                >
                  <Lock className="w-3.5 h-3.5 mr-1" /> Deposit & Lock
                </Button>

                <Button
                  onClick={handleRelease}
                  disabled={escrowState !== 'funds_locked' || !auditResult.passedThreshold || isProcessingTx}
                  className={`text-xs font-bold ${
                    auditResult.passedThreshold 
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-black' 
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  <Unlock className="w-3.5 h-3.5 mr-1" /> Release Escrow to Mechanic
                </Button>

                <Button
                  onClick={handleRefund}
                  disabled={escrowState !== 'funds_locked' || isProcessingTx}
                  variant="destructive"
                  size="sm"
                  className="text-xs font-bold"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Refund on Breach
                </Button>
              </div>
            </div>

            {/* Error or Warning banner when < 90% */}
            {!auditResult.passedThreshold && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-200">
                  <strong className="text-rose-400 font-bold uppercase block mb-0.5">
                    Smart Contract Hard Lock (Rule 9000 BPS Active)
                  </strong>
                  The mechanic compliance score is currently <strong>{auditResult.totalScore}%</strong> (must be ≥ 90%). 
                  The smart contract code will reject any payout instruction until missing compliance pillars are verified.
                  {auditResult.disqualified && (
                    <span className="block mt-1 font-bold text-rose-300">
                      Reason: {auditResult.disqualificationReason}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Off-Chain Storage Bucket & On-Chain Transaction Hash */}
            <div className="space-y-2 p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-text-dim">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <strong>On-Chain Financial Transaction Hash:</strong>
                </span>
                <span className="text-[11px] text-technic-yellow truncate max-w-sm font-bold">
                  {txHash}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-text-dim border-t border-white/5 pt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <strong>Cloud Storage Bucket (Off-Chain Document):</strong>
                </span>
                <span className="text-[11px] text-blue-300 truncate max-w-sm">
                  {storageBucketUri}
                </span>
              </div>
              <p className="text-[10px] text-text-dim/80 font-sans italic mt-1">
                Policy: Financial states are hashed on-chain; private documents & agreements are kept in the cloud storage bucket and NEVER hashed on-chain.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 2: 3-PILLAR COMPLIANCE ENGINE                    */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="compliance" className="space-y-6 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <h2 className="text-lg font-bold uppercase text-digital-white">
                3-Pillar Compliance Verification
              </h2>
              <p className="text-xs text-text-dim">
                Real-time oracle parameters inspected by the smart contract before authorizing payout release.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-text-dim uppercase font-bold">Total Score</div>
                <div className={`text-2xl font-black font-mono ${auditResult.passedThreshold ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {auditResult.totalScore} / 100%
                </div>
              </div>
              <div className={`w-3 h-12 rounded-full ${auditResult.passedThreshold ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PILLAR 1: COMPANY INCORPORATION */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">PILLAR 1 (35%)</Badge>
                  <span className="font-mono text-xs font-bold text-white">{auditResult.pillar1} / 35 pts</span>
                </div>
                <CardTitle className="text-sm font-bold uppercase flex items-center gap-2 mt-2">
                  <Building className="w-4 h-4 text-blue-400" /> Company Incorporation
                </CardTitle>
                <CardDescription className="text-xs">
                  CIPC (South Africa) or Bizee (USA) or Global Registrar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Jurisdiction Picker */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-text-dim">Jurisdiction</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['ZA', 'US', 'GLOBAL'] as const).map(j => (
                      <button
                        key={j}
                        onClick={() => updateCompliance({ jurisdiction: j })}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          complianceData.jurisdiction === j 
                            ? 'bg-technic-yellow text-industrial-charcoal border-technic-yellow' 
                            : 'border-white/10 hover:border-white/20 text-text-dim'
                        }`}
                      >
                        {j === 'ZA' ? 'South Africa (CIPC)' : j === 'US' ? 'USA (Bizee)' : 'Global'}
                      </button>
                    ))}
                  </div>
                </div>

                {complianceData.jurisdiction === 'ZA' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-text-dim">CIPC Registration No.</Label>
                      <Input 
                        value={complianceData.cipcRegistrationNumber || ''} 
                        onChange={e => updateCompliance({ cipcRegistrationNumber: e.target.value })}
                        placeholder="e.g. 2023/849201/07"
                        className="h-8 text-xs bg-black/40 border-white/10 text-white font-mono"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={complianceData.cipcCertificateUploaded}
                        onChange={e => updateCompliance({ cipcCertificateUploaded: e.target.checked })}
                        className="accent-technic-yellow w-4 h-4 rounded"
                      />
                      <span>CIPC Certificate (CoR 14.3 / CK1) Verified (+20 pts)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={complianceData.cipcAnnualReturnsProof}
                        onChange={e => updateCompliance({ cipcAnnualReturnsProof: e.target.checked })}
                        className="accent-technic-yellow w-4 h-4 rounded"
                      />
                      <span>Proof of CIPC Annual Returns Submission (+15 pts)</span>
                    </label>
                  </div>
                )}

                {complianceData.jurisdiction === 'US' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-text-dim">Bizee / State Filing ID</Label>
                      <Input 
                        value={complianceData.bizeeFilingId || ''} 
                        onChange={e => updateCompliance({ bizeeFilingId: e.target.value })}
                        placeholder="e.g. BZ-902148"
                        className="h-8 text-xs bg-black/40 border-white/10 text-white font-mono"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={complianceData.bizeeArticlesUploaded}
                        onChange={e => updateCompliance({ bizeeArticlesUploaded: e.target.checked })}
                        className="accent-technic-yellow w-4 h-4 rounded"
                      />
                      <span>Bizee / State Articles of Org Verified (+20 pts)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={complianceData.bizeeAnnualReportProof}
                        onChange={e => updateCompliance({ bizeeAnnualReportProof: e.target.checked })}
                        className="accent-technic-yellow w-4 h-4 rounded"
                      />
                      <span>Annual Report & Tax Standing Verified (+15 pts)</span>
                    </label>
                  </div>
                )}

                {complianceData.jurisdiction === 'GLOBAL' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-text-dim">Registrar / Business No.</Label>
                      <Input 
                        value={complianceData.globalRegistrationNumber || ''} 
                        onChange={e => updateCompliance({ globalRegistrationNumber: e.target.value })}
                        placeholder="e.g. REG-884920"
                        className="h-8 text-xs bg-black/40 border-white/10 text-white font-mono"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={complianceData.globalCertificateUploaded}
                        onChange={e => updateCompliance({ globalCertificateUploaded: e.target.checked })}
                        className="accent-technic-yellow w-4 h-4 rounded"
                      />
                      <span>Official Certificate of Incorporation (+35 pts)</span>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PILLAR 2: MECHANIC SAFETY & SUBSTANCE TEST */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">PILLAR 2 (35%)</Badge>
                  <span className="font-mono text-xs font-bold text-white">{auditResult.pillar2} / 35 pts</span>
                </div>
                <CardTitle className="text-sm font-bold uppercase flex items-center gap-2 mt-2">
                  <Flame className="w-4 h-4 text-amber-400" /> Safety & Substance Check
                </CardTitle>
                <CardDescription className="text-xs">
                  Live timestamped substance test + Full PPE gear.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Live Substance Test */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-digital-white">Live Substance Test</span>
                    <Badge className={complianceData.liveSubstanceTestProof ? 'bg-emerald-500/20 text-emerald-400 text-[9px]' : 'bg-rose-500/20 text-rose-400 text-[9px]'}>
                      {complianceData.liveSubstanceTestProof ? 'TIMESTAMP VERIFIED' : 'PENDING'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-text-dim">
                    Timestamped photo or live camera stream proving zero substance impairment.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const passed = !complianceData.liveSubstanceTestProof;
                      updateCompliance({ 
                        liveSubstanceTestProof: passed,
                        substanceTestTimestamp: passed ? new Date().toLocaleTimeString() + ' SAST' : undefined
                      });
                      toast.info(passed ? 'Live substance test verified with digital timestamp!' : 'Substance test cleared');
                    }}
                    className="w-full text-xs font-bold h-7 border-amber-400/30 text-amber-400 hover:bg-amber-400/10"
                  >
                    {complianceData.liveSubstanceTestProof ? 'Re-run Substance Test' : 'Run Live Substance Test'}
                  </Button>
                </div>

                {/* PPE Checklist */}
                <div className="space-y-2">
                  <Label className="text-xs text-text-dim font-bold uppercase tracking-wider">Full PPE Gear (+15 pts)</Label>
                  <div className="space-y-1.5 text-xs text-white">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={complianceData.ppeSteelToeBoots}
                        onChange={e => updateCompliance({ ppeSteelToeBoots: e.target.checked })}
                        className="accent-technic-yellow w-4 h-4 rounded"
                      />
                      <span>Steel-Toe Safety Boots</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={complianceData.ppeOverallsFlameRetardant}
                        onChange={e => updateCompliance({ ppeOverallsFlameRetardant: e.target.checked })}
                        className="accent-technic-yellow w-4 h-4 rounded"
                      />
                      <span>Flame-Retardant Heavy Overalls</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={complianceData.ppeEyeGoggles}
                        onChange={e => updateCompliance({ ppeEyeGoggles: e.target.checked })}
                        className="accent-technic-yellow w-4 h-4 rounded"
                      />
                      <span>Safety Eye Glasses / Impact Goggles</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={complianceData.ppeMechanicGloves}
                        onChange={e => updateCompliance({ ppeMechanicGloves: e.target.checked })}
                        className="accent-technic-yellow w-4 h-4 rounded"
                      />
                      <span>Nitrile / Mechanic Grip Gloves</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PILLAR 3: SITE READINESS & SPECIALIZED TOOLSET */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">PILLAR 3 (30%)</Badge>
                  <span className="font-mono text-xs font-bold text-white">{auditResult.pillar3} / 30 pts</span>
                </div>
                <CardTitle className="text-sm font-bold uppercase flex items-center gap-2 mt-2">
                  <Box className="w-4 h-4 text-emerald-400" /> Site Readiness & Toolset
                </CardTitle>
                <CardDescription className="text-xs">
                  Branded gazebo, 6 sand bottles / cones, & certified toolbox.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2 text-xs text-white">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={complianceData.brandedGazeboDeployed}
                      onChange={e => updateCompliance({ brandedGazeboDeployed: e.target.checked })}
                      className="accent-technic-yellow w-4 h-4 rounded"
                    />
                    <span>Branded Gazebo / Mobile Shelter (+10 pts)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={complianceData.dangerTapePerimeterSet}
                      onChange={e => updateCompliance({ dangerTapePerimeterSet: e.target.checked })}
                      className="accent-technic-yellow w-4 h-4 rounded"
                    />
                    <span>6 Sand Bottles / Cones + Danger Tape (+7 pts)</span>
                  </label>
                  
                  {/* Mandatory Oil Spill Mat Check */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                        <input 
                          type="checkbox"
                          checked={complianceData.oilSpillMatDeployed}
                          onChange={e => updateCompliance({ oilSpillMatDeployed: e.target.checked })}
                          className="accent-technic-yellow w-4 h-4 rounded"
                        />
                        <span>Oil Spill Mats Deployed Under Vehicle (Mandatory)</span>
                      </label>
                      <Badge className={complianceData.oilSpillMatVerified ? "bg-emerald-500/20 text-emerald-400 text-[9px]" : "bg-rose-500/20 text-rose-400 text-[9px]"}>
                        {complianceData.oilSpillMatVerified ? "VERIFIED PROOF" : "PROOF REQUIRED"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-dim border-t border-white/5 pt-2">
                      <span>Proof Format:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => updateCompliance({ oilSpillMatProofType: '15s_video', oilSpillMatVerified: true })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            complianceData.oilSpillMatProofType === '15s_video' ? 'bg-technic-yellow text-black' : 'bg-white/10 text-white'
                          }`}
                        >
                          15-Second Video Proof
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCompliance({ oilSpillMatProofType: 'photo', oilSpillMatVerified: true })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            complianceData.oilSpillMatProofType === 'photo' ? 'bg-technic-yellow text-black' : 'bg-white/10 text-white'
                          }`}
                        >
                          Photo Proof
                        </button>
                      </div>
                    </div>

                    {!complianceData.oilSpillMatDeployed && (
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-400 font-bold">
                        🚨 HARD-LOCK: Work CANNOT happen without deployed oil spill mats and 15s video / photo proof!
                      </div>
                    )}
                  </div>
                </div>

                {/* Specialized Toolset Scanner */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-digital-white">Toolbox Parsing AI</Label>
                    <span className="text-[10px] text-text-dim">Strict Certification</span>
                  </div>
                  <select
                    value={complianceData.toolboxType}
                    onChange={e => updateCompliance({ toolboxType: e.target.value as any })}
                    className="w-full h-8 text-xs bg-industrial-charcoal border border-white/20 rounded-lg px-2 text-white font-medium"
                  >
                    <option value="specialized_mechanic_box">✓ Specialized Multi-Tier Mechanic Toolbox (Approved)</option>
                    <option value="cooler_box">✗ Cooler Box with loose parts (DISQUALIFIED!)</option>
                    <option value="plastic_bucket">✗ Plastic bucket / tub (DISQUALIFIED!)</option>
                    <option value="unorganized_carton">✗ Cardboard box with tools (DISQUALIFIED!)</option>
                  </select>

                  {complianceData.toolboxType === 'cooler_box' && (
                    <div className="text-[10px] text-rose-400 font-bold bg-rose-500/10 p-2 rounded border border-rose-500/30">
                      🚨 RULE BREACH: Tools kept in a cooler box or non-specialized container trigger total site disqualification!
                    </div>
                  )}

                  {complianceData.toolboxType === 'specialized_mechanic_box' && (
                    <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded border border-emerald-500/30">
                      ✓ Specialized mechanic cantilever / roll-cab toolbox detected & verified (+10 pts).
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 3: ZARU STABLECOIN & FAIR TRADE STANDARDS         */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="zaru_fairtrade" className="space-y-6 mt-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-blue-500/20 text-blue-400 font-bold text-[10px] uppercase">
                  Regulated Stablecoin & Fair Trade
                </Badge>
                <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 text-[10px]">
                  1 ZARU = R 1.00 CASH RAND
                </Badge>
              </div>
              <h2 className="text-lg font-bold uppercase text-digital-white">
                ZARU Digital Rand & Motor Fair-Trade Standards
              </h2>
              <p className="text-xs text-text-dim max-w-2xl mt-0.5">
                Clear, simple rules written for everyday vehicle owners and honest technicians. 
                Built to match the rigorous standards of premier banking institutions and national motor industry bodies.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-text-dim uppercase font-bold block">Current Service Escrow</span>
              <span className="text-xl font-black font-mono text-technic-yellow">
                {(jobAmount + financials.clientConnectionFee).toLocaleString()} ZARU
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: ZARU Digital Rand */}
            <Card className="bg-white/5 border-white/10 hover:border-blue-500/30 transition-all">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">1:1 DIGITAL RAND</Badge>
                  <span className="font-mono text-xs font-bold text-white">1 ZARU = R 1.00</span>
                </div>
                <CardTitle className="text-sm font-bold uppercase flex items-center gap-2 mt-2">
                  <Coins className="w-4 h-4 text-blue-400" /> What is ZARU?
                </CardTitle>
                <CardDescription className="text-xs">
                  Tier-1 Regulated Bank-Custodied Digital Rand
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-xs leading-relaxed text-text-dim">
                <p className="text-white font-medium">
                  <strong>Think of ZARU as safe digital cash.</strong> It is not like internet coins that jump up and down in price. 1 ZARU is always worth exactly 1 South African Rand.
                </p>
                <p>
                  Every ZARU is backed 100% by money kept safely inside registered South African commercial bank vaults.
                </p>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <strong className="text-digital-white block font-bold text-[11px] uppercase">How It Protects You:</strong>
                  <ul className="space-y-1 list-disc pl-4 text-[11px]">
                    <li>Money is locked in a digital lock-box when you book.</li>
                    <li>No stranger can take your money and disappear.</li>
                    <li>Mechanic is guaranteed payment as soon as the car is fixed.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Fair Trade Motor Standards */}
            <Card className="bg-white/5 border-white/10 hover:border-technic-yellow/30 transition-all">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <Badge className="bg-technic-yellow/20 text-technic-yellow text-[10px]">FAIR TRADE CODE</Badge>
                  <span className="font-mono text-xs font-bold text-emerald-400">Zero Parasitism</span>
                </div>
                <CardTitle className="text-sm font-bold uppercase flex items-center gap-2 mt-2">
                  <Scale className="w-4 h-4 text-technic-yellow" /> Motor Industry Fair Trade
                </CardTitle>
                <CardDescription className="text-xs">
                  Consumer Protection & Fair Trade Automotive Code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-xs leading-relaxed text-text-dim">
                <p className="text-white font-medium">
                  <strong>Fair trade means honest prices for real work.</strong> No inflated parts prices, no surprise bills, and no taking advantage of anyone.
                </p>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <strong className="text-technic-yellow block font-bold text-[11px] uppercase">Fair Trade Rules:</strong>
                  <ul className="space-y-1 list-disc pl-4 text-[11px]">
                    <li><strong>Open Parts Receipts:</strong> All parts costs come from published dealer catalogs or verified store till slips.</li>
                    <li><strong>Anti-Parasitism Protection:</strong> If a technician fails to demonstrate value or remedy the fault, the client is not obliged to pay.</li>
                    <li><strong>Apprentice Ubuntu:</strong> Young apprentices receive fair stipends and real hands-on mentorship.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Technical Roadworthy & Safety Standards */}
            <Card className="bg-white/5 border-white/10 hover:border-emerald-500/30 transition-all">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">SAFETY FIRST</Badge>
                  <span className="font-mono text-xs font-bold text-white">Roadworthy Tested</span>
                </div>
                <CardTitle className="text-sm font-bold uppercase flex items-center gap-2 mt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Roadworthy Safety Rules
                </CardTitle>
                <CardDescription className="text-xs">
                  Certified Technical Vehicle Inspection Standards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4 text-xs leading-relaxed text-text-dim">
                <p className="text-white font-medium">
                  <strong>Before any vehicle leaves the driveway,</strong> it must pass the independent vehicle safety inspection so your family is 100% safe on the road.
                </p>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <strong className="text-emerald-400 block font-bold text-[11px] uppercase">Inspection Points Checked:</strong>
                  <ul className="space-y-1 list-disc pl-4 text-[11px]">
                    <li>Steering & suspension torque settings</li>
                    <li>Brake pad thickness, fluid aeration & pedal pressure</li>
                    <li>Exterior lighting, indicators & battery terminals</li>
                    <li>Zero engine fluid, oil, or coolant leaks on the ground</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 4: RUST SMART CONTRACT CODE                      */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="rust_contract" className="space-y-4 mt-4">
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase text-digital-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-technic-yellow" /> Rust / Solana Anchor Source Code
              </h3>
              <p className="text-xs text-text-dim mt-0.5">
                Saved at <code className="text-technic-yellow">/src/blockchain/MakhanikhiEscrow.rs</code>. Ready for <code className="text-white">anchor build</code> and <code className="text-white">anchor test</code>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`anchor build\nanchor test\nanchor deploy --provider.cluster devnet`);
                  toast.success('CLI build commands copied to clipboard!');
                }}
                className="text-xs font-mono border-white/20 text-white hover:bg-white/10"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Build Commands
              </Button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="p-4 rounded-xl bg-industrial-charcoal border border-white/10 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed text-text-dim">
            <pre className="text-technic-yellow">
{`// ============================================================================
// MAKHANIKHI SMART ESCROW PROTOCOL (Rust / Solana Anchor)
// Enforces 90%+ 3-Pillar Compliance Oracle Settlement & Modest Fee Distribution
// ============================================================================

use anchor_lang::prelude::*;

declare_id!("MakhEscrow111111111111111111111111111111111");

#[program]
pub mod makhanikhi_escrow {
    use super::*;

    /// Initialize Escrow with Client Connection Fee (5%) and Mechanic Platform Fee (8%)
    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        job_id: String,
        job_amount: u64,
        client_connection_fee_bps: u16, // 500 = 5%
        mechanic_platform_fee_bps: u16, // 800 = 8%
    ) -> Result<()> { ... }

    /// Release Escrow:
    /// CRITICAL RULE: Payout ONLY releases if compliance_score_bps >= 9000 (90.00%)
    pub fn release_escrow(ctx: Context<ReleaseEscrow>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_account;
        require!(escrow.state == EscrowState::FundsLocked, EscrowError::InvalidState);

        // HARD ENFORCEMENT OF 90% COMPLIANCE REQUIREMENT
        require!(
            escrow.compliance_score_bps >= 9000,
            EscrowError::ComplianceBelowNinetyPercent
        );

        let mechanic_payout = escrow.job_amount - escrow.applied_platform_fee;
        let total_platform_revenue = escrow.client_connection_fee + escrow.applied_platform_fee;

        // Disburse funds from PDA vault to Mechanic & Treasury
        **escrow.to_account_info().try_borrow_mut_lamports()? -= mechanic_payout;
        **ctx.accounts.mechanic.try_borrow_mut_lamports()? += mechanic_payout;

        **escrow.to_account_info().try_borrow_mut_lamports()? -= total_platform_revenue;
        **ctx.accounts.platform_treasury.try_borrow_mut_lamports()? += total_platform_revenue;

        escrow.state = EscrowState::Completed;
        Ok(())
    }
}`}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
