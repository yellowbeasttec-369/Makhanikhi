import React, { useState } from 'react';
import { 
  ShoppingBag, Car, ExternalLink, ShieldCheck, CheckCircle2, 
  AlertTriangle, DollarSign, Wrench, Clock, Users, ArrowRight, 
  Lock, Unlock, Camera, Store, FileText, Sparkles, Search, RefreshCw,
  Gift, Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { 
  PUBLISHED_PARTS_DEALERS, 
  DealerPartsItem, 
  searchDealerParts, 
  isRepairStepGated,
  PartsFerryVerification 
} from '../services/partsPricingService';

interface PartsPricingAndFerryingProps {
  vehicleMake?: string;
  vehicleModel?: string;
  onUpdateQuote?: (labor: number, parts: number, callOut: number) => void;
}

export const PartsPricingAndFerrying: React.FC<PartsPricingAndFerryingProps> = ({
  vehicleMake = 'Toyota',
  vehicleModel = 'Hilux 2.8 GD-6',
  onUpdateQuote
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dealer_api' | 'ferry_log' | 'labor_callout'>('overview');

  // 1. Labor & Call-Out Fee State
  const [isFirstTrip, setIsFirstTrip] = useState<boolean>(true);
  const [callOutFee, setCallOutFee] = useState<number>(0); // R0 if first trip!
  const [laborHours, setLaborHours] = useState<number>(3.5);
  const [hourlyLaborRate, setHourlyLaborRate] = useState<number>(450); // negotiated ZAR/hr
  const [laborNegotiationNotes, setLaborNegotiationNotes] = useState<string>(
    'Agreed on R450/hr for multi-point brake overhaul & fluid bleeding.'
  );

  const negotiatedLaborTotal = Math.round(laborHours * hourlyLaborRate);

  // 2. Parts Selection Method: 'api_catalog' | 'store_ferry' | 'client_supplied'
  const [partsMethod, setPartsMethod] = useState<'api_catalog' | 'store_ferry' | 'client_supplied'>('api_catalog');
  const [partSearchQuery, setPartSearchQuery] = useState<string>('Front Brake Pads');
  const [dealerResults, setDealerResults] = useState<DealerPartsItem[]>([]);
  const [isSearchingParts, setIsSearchingParts] = useState<boolean>(false);
  const [selectedDealerPart, setSelectedDealerPart] = useState<DealerPartsItem | null>(null);

  // 3. Ferry with Mechanic to Parts Shop Log State
  const [ferryLog, setFerryLog] = useState<PartsFerryVerification>({
    jobId: 'JOB-MKH-7721',
    storeName: 'Goldwagen Central Wholesale',
    storeAddress: '14 Auto Industrial Parkway, Central District',
    timestamp: new Date().toLocaleTimeString() + ' SAST',
    clientAccompanied: true,
    clientName: 'Sipho Ndlovu',
    mechanicName: 'Kabelo Sithole (Master Tech)',
    totalAgreedPartsPrice: 780,
    receiptNumber: 'GW-REC-90142',
    receiptPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
    clientVerified: true,
    mechanicVerified: true,
    status: 'verified_by_both',
    notes: 'Client ferried in workshop bakkie to confirm brake pad brand (Ferodo) and verify cash invoice.'
  });

  // Calculate gatekeeper state
  const partsAgreedPrice = partsMethod === 'api_catalog' 
    ? (selectedDealerPart?.estimatedPriceZAR || 0)
    : partsMethod === 'store_ferry' 
      ? ferryLog.totalAgreedPartsPrice 
      : 0;

  const gatingCheck = isRepairStepGated(
    true, // parts needed
    partsMethod,
    ferryLog.status === 'verified_by_both' 
      ? { logged: true, verifiedByClient: true, verifiedByMechanic: true } 
      : { logged: ferryLog.clientAccompanied, verifiedByClient: ferryLog.clientVerified, verifiedByMechanic: ferryLog.mechanicVerified },
    selectedDealerPart ? { dealerName: selectedDealerPart.dealerName, estimatedPrice: selectedDealerPart.estimatedPriceZAR } : undefined
  );

  const handleSearchParts = async (queryText?: string) => {
    const q = queryText || partSearchQuery;
    setIsSearchingParts(true);
    try {
      const results = await searchDealerParts(q, vehicleMake, vehicleModel);
      setDealerResults(results);
      if (results.length > 0 && !selectedDealerPart) {
        setSelectedDealerPart(results[0]);
      }
      toast.success(`Found ${results.length} published dealer catalog quotes`);
    } catch (err) {
      toast.error('Could not query dealer API.');
    } finally {
      setIsSearchingParts(false);
    }
  };

  const handleToggleFirstTrip = (onHouse: boolean) => {
    setIsFirstTrip(onHouse);
    setCallOutFee(onHouse ? 0 : 450);
    toast.info(onHouse 
      ? 'First Trip On The House activated! R0.00 call-out fee to build trust.' 
      : 'Standard call-out fee (R450.00) applied for subsequent service call.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-industrial-charcoal via-industrial-charcoal/90 to-amber-950/20 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[10px] uppercase">
                Trust & Transparency Protocol
              </Badge>
              <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 text-[10px]">
                Gated In-App Compliance
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-digital-white uppercase tracking-tight">
              Parts Pricing & Ferry Verification
            </h1>
            <p className="text-text-dim text-xs sm:text-sm max-w-2xl mt-1">
              Negotiate fair labor with your mechanic, check published dealer catalogs, or <strong className="text-technic-yellow">ferry with your mechanic to the parts shop</strong> to inspect receipts before work begins.
            </p>
          </div>

          {/* Gating Status Badge */}
          <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-3 rounded-xl">
            <div className={`p-2.5 rounded-xl ${!gatingCheck.isGated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {!gatingCheck.isGated ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-[10px] text-text-dim uppercase font-bold tracking-widest">Next Step Gate</div>
              <div className="text-sm font-black font-mono">
                {!gatingCheck.isGated ? (
                  <span className="text-emerald-400">CLEARED TO WORK</span>
                ) : (
                  <span className="text-rose-400">GATED / HOLD</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Guarantee: First Trip on the House Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm uppercase text-digital-white tracking-wide">
                First Trip On The House (R0.00 Call-out Fee)
              </h3>
              <Badge className="bg-emerald-500 text-black font-black text-[9px] uppercase">
                SHOW-FACE GUARANTEE
              </Badge>
            </div>
            <p className="text-xs text-text-dim mt-0.5">
              To eliminate any fear of sending money to someone bogus, the specialist and apprentice <strong>visit in person for free on the first trip</strong> to inspect the vehicle and establish mutual trust. Subsequent service calls are billable.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => handleToggleFirstTrip(!isFirstTrip)}
            variant={isFirstTrip ? 'default' : 'outline'}
            className={isFirstTrip ? 'bg-emerald-500 text-black font-bold text-xs' : 'border-white/20 text-white text-xs'}
          >
            {isFirstTrip ? '✓ First Trip (FREE)' : 'Subsequent Trip (R450)'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="bg-card-bg border border-border-dim p-1 rounded-xl flex-wrap justify-start">
          <TabsTrigger value="overview" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal font-bold text-xs uppercase px-4 py-2">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Financial & Gating Summary
          </TabsTrigger>
          <TabsTrigger value="dealer_api" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal font-bold text-xs uppercase px-4 py-2">
            <Store className="w-3.5 h-3.5 mr-1.5" /> Published Dealer Catalogs
          </TabsTrigger>
          <TabsTrigger value="ferry_log" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal font-bold text-xs uppercase px-4 py-2">
            <Car className="w-3.5 h-3.5 mr-1.5" /> Ferry to Store Log
          </TabsTrigger>
          <TabsTrigger value="labor_callout" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal font-bold text-xs uppercase px-4 py-2">
            <Wrench className="w-3.5 h-3.5 mr-1.5" /> Negotiated Labor & Call-Out
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: OVERVIEW & GATING STATUS                      */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Call-Out Fee Card */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <Badge className="w-fit text-[9px] bg-emerald-500/20 text-emerald-400">
                  {isFirstTrip ? 'ON THE HOUSE' : 'BILLABLE CALL-OUT'}
                </Badge>
                <CardTitle className="text-sm font-bold uppercase">Call-Out Fee</CardTitle>
                <CardDescription className="text-xs">Initial roadside / driveway dispatch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black font-mono text-digital-white">
                  R {callOutFee.toFixed(2)}
                </div>
                <p className="text-[11px] text-text-dim mt-2">
                  {isFirstTrip ? 'First trip is R0.00 so mechanic & apprentice show face.' : 'Standard call-out rate applies.'}
                </p>
              </CardContent>
            </Card>

            {/* Negotiated Labor Card */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <Badge className="w-fit text-[9px] bg-blue-500/20 text-blue-400">
                  NEGOTIATED LABOR
                </Badge>
                <CardTitle className="text-sm font-bold uppercase">Labor Quote</CardTitle>
                <CardDescription className="text-xs">{laborHours} hrs @ R{hourlyLaborRate}/hr</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black font-mono text-digital-white">
                  R {negotiatedLaborTotal.toLocaleString()}
                </div>
                <p className="text-[11px] text-text-dim mt-2 truncate">
                  {laborNegotiationNotes}
                </p>
              </CardContent>
            </Card>

            {/* Parts Quote Card */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <Badge className="w-fit text-[9px] bg-technic-yellow/20 text-technic-yellow uppercase">
                  {partsMethod === 'api_catalog' ? 'DEALER CATALOG API' : partsMethod === 'store_ferry' ? 'FERRY LOGGED' : 'PRE-SUPPLIED'}
                </Badge>
                <CardTitle className="text-sm font-bold uppercase">Parts Sourcing</CardTitle>
                <CardDescription className="text-xs">
                  {partsMethod === 'api_catalog' && selectedDealerPart ? selectedDealerPart.dealerName : 'In-Store Physical Trip'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black font-mono text-technic-yellow">
                  R {partsAgreedPrice.toLocaleString()}
                </div>
                <p className="text-[11px] text-text-dim mt-2">
                  Verified via {partsMethod === 'api_catalog' ? 'public catalog reference' : 'joint ferry trip to store'}.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gating Status Box */}
          <div className={`p-4 rounded-xl border ${!gatingCheck.isGated ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
            <div className="flex items-start gap-3">
              {!gatingCheck.isGated ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${!gatingCheck.isGated ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {!gatingCheck.isGated ? 'Transparency Gate Cleared' : 'Repair Work Gated: Parts Transparency Required'}
                </h4>
                <p className="text-xs text-text-dim">
                  {gatingCheck.reason}
                </p>
              </div>
            </div>
          </div>

          {/* Sourcing Method Selector */}
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase text-digital-white tracking-wider">
              Choose How Parts Are Verified
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setPartsMethod('api_catalog');
                  if (dealerResults.length === 0) handleSearchParts();
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  partsMethod === 'api_catalog'
                    ? 'border-technic-yellow bg-technic-yellow/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-digital-white flex items-center gap-2">
                    <Store className="w-4 h-4 text-technic-yellow" /> Published Dealer Catalogs
                  </span>
                  {partsMethod === 'api_catalog' && <Check className="w-4 h-4 text-technic-yellow" />}
                </div>
                <p className="text-xs text-text-dim leading-relaxed">
                  Call public APIs or link directly to Goldwagen, AutoZone, Midas, or Masterparts for reference pricing.
                </p>
              </button>

              <button
                onClick={() => setPartsMethod('store_ferry')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  partsMethod === 'store_ferry'
                    ? 'border-technic-yellow bg-technic-yellow/10'
                    : 'border-white/10 hover:border-white/20 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-digital-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-technic-yellow" /> Ferry to Parts Shop
                  </span>
                  {partsMethod === 'store_ferry' && <Check className="w-4 h-4 text-technic-yellow" />}
                </div>
                <p className="text-xs text-text-dim leading-relaxed">
                  Ferry together with the mechanic to the store, inspect terms and prices in person, and log the receipt in-app.
                </p>
              </button>
            </div>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 2: PUBLISHED DEALER CATALOGS (API & LINKS)       */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="dealer_api" className="space-y-6 mt-4">
          {/* Published Dealers Info Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PUBLISHED_PARTS_DEALERS.map((dealer, i) => (
              <a
                key={i}
                href={dealer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-technic-yellow/40 transition-all group block"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-digital-white group-hover:text-technic-yellow transition-colors">
                    {dealer.name}
                  </h4>
                  <ExternalLink className="w-3 h-3 text-text-dim group-hover:text-technic-yellow" />
                </div>
                <p className="text-[10px] text-text-dim mt-1 line-clamp-1">
                  {dealer.specialty}
                </p>
              </a>
            ))}
          </div>

          {/* Search Box */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
              <Input
                value={partSearchQuery}
                onChange={(e) => setPartSearchQuery(e.target.value)}
                placeholder="Search part (e.g. Brake Pads, Alternator, Clutch Kit)"
                className="pl-9 h-10 bg-black/40 border-white/10 text-white text-xs"
              />
            </div>
            <Button
              onClick={() => handleSearchParts()}
              disabled={isSearchingParts}
              className="bg-technic-yellow hover:bg-technic-yellow/90 text-industrial-charcoal font-bold text-xs uppercase h-10 px-6 shrink-0"
            >
              {isSearchingParts ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Query Dealer API'}
            </Button>
          </div>

          {/* Dealer Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(dealerResults.length > 0 ? dealerResults : [
              {
                id: 'gw-sample-1',
                dealerName: 'Goldwagen' as const,
                dealerWebsite: 'https://www.goldwagen.com',
                partName: 'Front Ceramic Brake Pad Set (Ferodo / Meyle)',
                partNumber: 'GW-FER-8821',
                oemEquivalentNumber: '04465-0K260',
                vehicleCompatibility: `${vehicleMake} ${vehicleModel}`,
                estimatedPriceZAR: 780,
                condition: 'Brand New (Tier 1 Aftermarket)' as const,
                warrantyMonths: 12,
                inStock: true,
                publicCatalogUrl: 'https://www.goldwagen.com'
              },
              {
                id: 'az-sample-2',
                dealerName: 'AutoZone' as const,
                dealerWebsite: 'https://autozone.co.za',
                partName: 'Bosch Pro-Stop Heavy Duty Front Brake Pads',
                partNumber: 'AZ-BOS-4910',
                oemEquivalentNumber: '04465-0K370',
                vehicleCompatibility: `${vehicleMake} ${vehicleModel}`,
                estimatedPriceZAR: 820,
                condition: 'Brand New (Tier 1 Aftermarket)' as const,
                warrantyMonths: 12,
                inStock: true,
                publicCatalogUrl: 'https://autozone.co.za'
              },
              {
                id: 'mid-sample-3',
                dealerName: 'Midas' as const,
                dealerWebsite: 'https://midas.co.za',
                partName: 'Ate High Performance Front Brake Pad Set',
                partNumber: 'MID-ATE-201',
                oemEquivalentNumber: '1K0698151',
                vehicleCompatibility: `${vehicleMake} ${vehicleModel}`,
                estimatedPriceZAR: 890,
                condition: 'OEM Genuine' as const,
                warrantyMonths: 24,
                inStock: true,
                publicCatalogUrl: 'https://midas.co.za'
              }
            ]).map((part) => {
              const isSelected = selectedDealerPart?.id === part.id;
              return (
                <Card 
                  key={part.id} 
                  className={`bg-white/5 border transition-all ${
                    isSelected ? 'border-technic-yellow bg-technic-yellow/5' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge className="bg-white/10 text-white text-[10px]">
                        {part.dealerName}
                      </Badge>
                      <span className="text-xl font-black font-mono text-technic-yellow">
                        R {part.estimatedPriceZAR.toLocaleString()}
                      </span>
                    </div>
                    <CardTitle className="text-sm font-bold text-digital-white mt-1">
                      {part.partName}
                    </CardTitle>
                    <CardDescription className="text-xs text-text-dim">
                      SKU: {part.partNumber} | OEM: {part.oemEquivalentNumber || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-xs text-text-dim space-y-1">
                      <div className="flex justify-between">
                        <span>Condition:</span>
                        <span className="font-bold text-white">{part.condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Warranty:</span>
                        <span className="font-bold text-emerald-400">{part.warrantyMonths} Months</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <a
                        href={part.publicCatalogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-white/10 text-[11px] font-bold text-text-dim hover:text-white hover:bg-white/5 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Dealer Catalog
                      </a>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDealerPart(part);
                          setPartsMethod('api_catalog');
                          toast.success(`Locked ${part.dealerName} price (R ${part.estimatedPriceZAR}) into quote!`);
                        }}
                        className={`text-xs font-bold ${
                          isSelected 
                            ? 'bg-technic-yellow text-industrial-charcoal' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : 'Lock Price'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 3: FERRY TO PARTS SHOP LOG (JOINT SOURCING)     */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="ferry_log" className="space-y-6 mt-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[9px] uppercase mb-1">
                    Gating Requirement
                  </Badge>
                  <CardTitle className="text-base font-bold uppercase tracking-wider">
                    Ferry with Mechanic to Parts Shop Log
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Client and mechanic travel together to the parts store. Logging this process unlocks the next repair step.
                  </CardDescription>
                </div>
                <Badge className={ferryLog.status === 'verified_by_both' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
                  {ferryLog.status === 'verified_by_both' ? '✓ DUAL SIGNED' : 'PENDING LOG'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <Label className="text-text-dim">Parts Store Name</Label>
                  <Input 
                    value={ferryLog.storeName}
                    onChange={(e) => setFerryLog(prev => ({ ...prev, storeName: e.target.value }))}
                    className="h-9 bg-black/40 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-text-dim">Store Address / Location</Label>
                  <Input 
                    value={ferryLog.storeAddress}
                    onChange={(e) => setFerryLog(prev => ({ ...prev, storeAddress: e.target.value }))}
                    className="h-9 bg-black/40 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-text-dim">Total Agreed Parts Amount (ZAR)</Label>
                  <Input 
                    type="number"
                    value={ferryLog.totalAgreedPartsPrice}
                    onChange={(e) => setFerryLog(prev => ({ ...prev, totalAgreedPartsPrice: parseFloat(e.target.value) || 0 }))}
                    className="h-9 bg-black/40 border-white/10 text-white font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-text-dim">Till Slip / Invoice Number</Label>
                  <Input 
                    value={ferryLog.receiptNumber || ''}
                    onChange={(e) => setFerryLog(prev => ({ ...prev, receiptNumber: e.target.value }))}
                    placeholder="e.g. REC-99214"
                    className="h-9 bg-black/40 border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              {/* Trip Checklist Toggles */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ferryLog.clientAccompanied}
                    onChange={(e) => setFerryLog(prev => ({ ...prev, clientAccompanied: e.target.checked }))}
                    className="w-4 h-4 accent-technic-yellow rounded"
                  />
                  <span className="text-white font-bold">
                    Client ferried with mechanic to parts store (physical presence confirmed)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ferryLog.clientVerified}
                    onChange={(e) => setFerryLog(prev => ({ ...prev, clientVerified: e.target.checked }))}
                    className="w-4 h-4 accent-technic-yellow rounded"
                  />
                  <span className="text-white">
                    Client verified counter pricing, return policy, and warranty terms directly with parts counter staff
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ferryLog.mechanicVerified}
                    onChange={(e) => setFerryLog(prev => ({ ...prev, mechanicVerified: e.target.checked }))}
                    className="w-4 h-4 accent-technic-yellow rounded"
                  />
                  <span className="text-white">
                    Mechanic verified part tolerances, part numbers, and seal integrity before purchasing
                  </span>
                </label>
              </div>

              {/* Sign & Complete Button */}
              <Button
                onClick={() => {
                  setFerryLog(prev => ({
                    ...prev,
                    clientAccompanied: true,
                    clientVerified: true,
                    mechanicVerified: true,
                    status: 'verified_by_both'
                  }));
                  setPartsMethod('store_ferry');
                  toast.success('Ferry trip verified and signed by both parties! Next repair step is now UNLOCKED.');
                }}
                className="w-full bg-technic-yellow hover:bg-technic-yellow/90 text-industrial-charcoal font-black text-xs uppercase h-11"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Complete & Dual-Sign Ferry Log (Unlock Next Step)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 4: NEGOTIATED LABOR & CALL-OUT                   */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="labor_callout" className="space-y-6 mt-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-base font-bold uppercase tracking-wider">
                Labor & Call-Out Terms Negotiation
              </CardTitle>
              <CardDescription className="text-xs">
                Specialists price based on their labor expertise. Transparency ensures mutual agreement before opening the hood.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-text-dim">Hourly Labor Rate (ZAR)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={hourlyLaborRate}
                      onChange={(e) => setHourlyLaborRate(parseFloat(e.target.value) || 0)}
                      className="bg-black/40 border-white/10 text-white font-mono font-bold"
                    />
                    <span className="text-xs text-text-dim">/ hour</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-text-dim">Estimated Labor Hours</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.5"
                      value={laborHours}
                      onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                      className="bg-black/40 border-white/10 text-white font-mono font-bold"
                    />
                    <span className="text-xs text-text-dim">hours</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-text-dim">Labor Negotiation Notes</Label>
                <Input
                  value={laborNegotiationNotes}
                  onChange={(e) => setLaborNegotiationNotes(e.target.value)}
                  className="bg-black/40 border-white/10 text-white text-xs"
                />
              </div>

              {/* Live Calculation Box */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-dim">Call-Out Fee (First Trip on the House):</span>
                  <span className="font-bold text-emerald-400">R {callOutFee.toFixed(2)} {isFirstTrip && '(FREE)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-dim">Agreed Labor ({laborHours} hrs x R{hourlyLaborRate}):</span>
                  <span className="font-bold text-white">R {negotiatedLaborTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-dim">Estimated Parts ({partsMethod}):</span>
                  <span className="font-bold text-technic-yellow">R {partsAgreedPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black border-t border-white/10 pt-2 text-digital-white">
                  <span>Combined Job Total:</span>
                  <span className="text-technic-yellow">R {(callOutFee + negotiatedLaborTotal + partsAgreedPrice).toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (onUpdateQuote) {
                    onUpdateQuote(negotiatedLaborTotal, partsAgreedPrice, callOutFee);
                  }
                  toast.success('Negotiated financial terms saved to job card!');
                }}
                className="w-full bg-technic-yellow hover:bg-technic-yellow/90 text-industrial-charcoal font-black text-xs uppercase h-11"
              >
                Apply Negotiated Financial Terms
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
