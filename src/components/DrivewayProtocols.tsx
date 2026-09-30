import React, { useState, useEffect, useRef } from 'react';
import { 
  Wrench, Shield, ShieldCheck, Clock, CheckCircle2, XCircle, 
  PlayCircle, AlertTriangle, Battery, UserCheck, Phone, 
  Camera, FileText, Sparkles, Volume2, Mic, Check, 
  HelpCircle, User, Award, RefreshCw, Layers, ArrowRight, ClipboardCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

interface VoiceLog {
  id: string;
  timestamp: string;
  language: string;
  text: string;
  audioUrl?: string;
}

export const DrivewayProtocols: React.FC = () => {
  // Operational Role
  const [activeRole, setActiveRole] = useState<'specialist' | 'patron'>('specialist');
  
  // General State variables as mandated by specifications
  const [is_solo_mode_active, setIsSoloModeActive] = useState(false);
  const [parts_pending_paused, setPartsPendingPaused] = useState(false);
  const [fuel_level_checked, setFuelLevelChecked] = useState(false);
  const [sobriety_passed, setSobrietyPassed] = useState(false);
  
  // 1. Check-In & Responsible Person Lock States
  const [checkInVerified, setCheckInVerified] = useState(false);
  const [checkInTimerActive, setCheckInTimerActive] = useState(false);
  const [checkInCountdown, setCheckInCountdown] = useState(900); // 15 mins in seconds
  const [isForfeited, setIsForfeited] = useState(false);
  const [fuelLevel, setFuelLevel] = useState(75); // Percentage
  const [isFuelLocked, setIsFuelLocked] = useState(false);

  // 2. Toolkit Isolation States
  const [toolboxScannedStart, setToolboxScannedStart] = useState(false);
  const [toolboxScannedEnd, setToolboxScannedEnd] = useState(false);
  const [isClientToolsRemoved, setIsClientToolsRemoved] = useState(false);
  const [scanningToolbox, setScanningToolbox] = useState(false);

  // 3. Sobriety Filter States
  const [sobrietyCheckedAt, setSobrietyCheckedAt] = useState<string | null>(null);
  const [clientRequestedSobriety, setClientRequestedSobriety] = useState(false);
  const [scanningSobrietyTest, setScanningSobrietyTest] = useState(false);

  // 4. B2B Fleet & Job Cards States
  const [activeStage, setActiveStage] = useState<'setup' | 'diagnostic' | 'parts_pending' | 'fix' | 'clean_test' | 'handover'>('setup');
  const [hoursUnderHood, setHoursUnderHood] = useState(2.5);
  const [hourlyRate, setHourlyRate] = useState(450); // ZAR

  // 5. Uncover & Validate / Pre-Authorized Waiver States
  const [isDiagnosticOnlyMode, setIsDiagnosticOnlyMode] = useState(false);
  const [isAutonomyWaiverSigned, setIsAutonomyWaiverSigned] = useState(false);
  const [isSourcingReleaseSigned, setIsSourcingReleaseSigned] = useState(false);
  const [sourcingWaiverText, setSourcingWaiverText] = useState("");

  // 6. Parts Pending & OMS States
  const [isInvoiceScanned, setIsInvoiceScanned] = useState(false);
  const [scanningInvoice, setScanningInvoice] = useState(false);
  const [invoiceMetadata, setInvoiceMetadata] = useState<{
    supplier: string;
    invoiceNo: string;
    vatNo: string;
    sapsCleared: boolean;
    partName: string;
    cost: number;
  } | null>(null);

  // Greasy Hands - Solo Worker Module States
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [voiceLogs, setVoiceLogs] = useState<VoiceLog[]>([
    {
      id: "v-1",
      timestamp: "08:24 AM",
      language: "Sepedi",
      text: "Tappet cover e butšwe, mephato e mene e pshatlegile, di-spring tšona di hantle."
    }
  ]);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState('Sepedi');
  const [coPilotProxyLinkSent, setCoPilotProxyLinkSent] = useState(false);
  const [coPilotPhotoUploaded, setCoPilotPhotoUploaded] = useState<string | null>(null);
  const [cleanHandsTransition, setCleanHandsTransition] = useState<'setup' | 'diagnostic' | 'fix' | null>(null);

  // Countdown Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Format countdown helper
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Check-In Countdown Logic
  useEffect(() => {
    if (checkInTimerActive && checkInCountdown > 0) {
      timerRef.current = setInterval(() => {
        setCheckInCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsForfeited(true);
            toast.error("15-Minute Presence Timer Expired! Prepaid Call-out Fee is 100% Forfeited.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [checkInTimerActive, checkInCountdown]);

  // Fuel tank checker
  useEffect(() => {
    if (fuelLevel >= 95) {
      setIsFuelLocked(true);
      setFuelLevelChecked(false);
      toast.warning("SAFETY LOCKOUT: Fuel tank is at 100%. Pause job until fuel level is verified to be under 95% due to high vapor risk!");
    } else {
      setIsFuelLocked(false);
    }
  }, [fuelLevel]);

  // Handle Presence toggle
  const togglePresenceVerification = () => {
    if (checkInVerified) {
      setCheckInVerified(false);
      setCheckInTimerActive(true);
    } else {
      setCheckInVerified(true);
      setCheckInTimerActive(false);
      toast.success("Patron presence verified! Workspace presence locked.");
    }
  };

  // Simulators
  const triggerToolboxScan = () => {
    setScanningToolbox(true);
    setTimeout(() => {
      setScanningToolbox(false);
      if (!toolboxScannedStart) {
        setToolboxScannedStart(true);
        toast.success("Start-of-day Shadow Board Scan completed. All 24 sockets & spanners verified in their slots.");
      } else {
        setToolboxScannedEnd(true);
        toast.success("End-of-day Shadow Board Scan completed. Zero tools left under the hood. Site secure.");
      }
    }, 1800);
  };

  const triggerSobrietyCheck = () => {
    setScanningSobrietyTest(true);
    setTimeout(() => {
      setScanningSobrietyTest(false);
      setSobrietyPassed(true);
      setSobrietyCheckedAt(new Date().toLocaleTimeString());
      toast.success("OHSA Sobriety verification cleared. Test strip negative (0.00%). Liability waiver unlocked!");
    }, 1500);
  };

  const triggerVoiceRecord = () => {
    if (recordingVoice) {
      setRecordingVoice(false);
      const randomTexts: Record<string, string> = {
        'Sepedi': "Dihloko tša di-valve di hlakahlakane, tšhipi e a sega mo mahlakoreng.",
        'Zulu': "I-gasket ye-cylinder head ishile, kumele ishintshwe.",
        'Xhosa': "I-wiring harness inengxaki, masilungise iingcingo ezonakeleyo.",
        'English': "Opened steering box, seals are completely worn out, leaking hydraulic oil."
      };
      
      const newLog: VoiceLog = {
        id: `v-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: selectedVoiceLang,
        text: randomTexts[selectedVoiceLang] || "Cylinder head gasket checked, slight pitting noticed."
      };
      setVoiceLogs([newLog, ...voiceLogs]);
      toast.success("Voice memo translated to itemized task list!");
    } else {
      setRecordingVoice(true);
      toast.info(`Recording voice log in ${selectedVoiceLang}... speak clearly.`);
    }
  };

  const sendCoPilotLink = () => {
    setCoPilotProxyLinkSent(true);
    toast.success("Co-Pilot upload link dispatched to Client's registered WhatsApp/SMS!");
  };

  const simulateCoPilotUpload = () => {
    setCoPilotPhotoUploaded("/placeholder_conquest.jpg");
    toast.success("Client Co-Pilot successfully uploaded evidence photo of stripped Conquest thread!");
  };

  const triggerInvoiceScan = () => {
    setScanningInvoice(true);
    setTimeout(() => {
      setScanningInvoice(false);
      setIsInvoiceScanned(true);
      setPartsPendingPaused(false);
      setInvoiceMetadata({
        supplier: "Korea Parts Distribution Hub",
        invoiceNo: "KP-2026-9481",
        vatNo: "VAT-4820194827",
        sapsCleared: true,
        partName: "Hyundai i20 Timing Chain Tensioner",
        cost: 840.00
      });
      toast.success("Invoice scanned successfully. SAPS Second-Hand Goods trace verified. Labor timer resumed!");
    }, 2000);
  };

  // Mathematical Preservation and Carbon Formulas
  const massRepaired = 4.2; // in kg (e.g. replacing gear linkages / brackets instead of sub-assembly)
  const massTotalAssembly = 18.5; // in kg
  
  // S_pres = (M_repaired / M_total) * 100
  const sPres = ((massRepaired / massTotalAssembly) * 100).toFixed(1);
  
  // C_saved = M_repaired * (E_virgin - E_repaired) * alpha
  const cSaved = (massRepaired * (6.4 - 0.8) * 1.25).toFixed(2);

  // Generate formal, download-ready PDF Job Card with diagnostics, labor timestamps, and liability clauses
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Page Border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(8, 8, 194, 281);
      
      // Top Decorative Accent Line (Technic Yellow)
      doc.setDrawColor(242, 180, 46);
      doc.setLineWidth(3);
      doc.line(8, 10, 202, 10);
      
      // Document Main Header
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      doc.text("MAKHANIKHI PROTOCOL", 14, 22);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("STANDARD OPERATING B2B JOB CARD & COMPLIANCE REPORT", 14, 27);
      
      // Hub Details (Right-aligned header block)
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 20, 20);
      doc.text("HUB LOCATION: POLOKWANE HUB", 130, 22);
      doc.setFont("Helvetica", "normal");
      doc.text(`REPORT DATE: ${new Date().toLocaleDateString()}`, 130, 27);
      doc.text("ID: M-JOB-CARD-4820", 130, 32);

      // Horizontal divider line
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(14, 38, 196, 38);

      // SECTION 1: FLEET CLIENT & VEHICLE REGISTRATION
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(242, 180, 46);
      doc.text("1. FLEET CLIENT & VEHICLE REGISTRATION", 14, 46);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text("VEHICLE MODEL:", 14, 54);
      doc.setFont("Helvetica", "normal");
      doc.text("Hyundai i20 (2013 Facelift)", 55, 54);

      doc.setFont("Helvetica", "bold");
      doc.text("REGISTRATION NO:", 14, 60);
      doc.setFont("Helvetica", "normal");
      doc.text("ND 48201", 55, 60);

      doc.setFont("Helvetica", "bold");
      doc.text("FLEET / OWNER ID:", 14, 66);
      doc.setFont("Helvetica", "normal");
      doc.text("O-94821", 55, 66);

      doc.setFont("Helvetica", "bold");
      doc.text("RESPONSIBLE PERSON:", 14, 72);
      doc.setFont("Helvetica", "normal");
      doc.text(sourcingWaiverText.trim() ? sourcingWaiverText : "CLIENT PRESENCE CONFIRMED", 55, 72);

      // Checklist Status box (grey accent box)
      doc.setFillColor(245, 245, 245);
      doc.rect(125, 42, 71, 34, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);
      doc.text("SAFETY COMPLIANCE STATUS", 129, 48);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`* Presence Locked: ${checkInVerified ? "YES" : "NO"}`, 129, 54);
      doc.text(`* Fuel Safety Checked: ${fuel_level_checked ? "YES" : "NO"} (${fuelLevel}%)`, 129, 59);
      doc.text(`* Sobriety Cleared: ${sobriety_passed ? "PASSED (0.00%)" : "NOT CHECKED"}`, 129, 64);
      doc.text(`* Toolbox Board Scan: ${toolboxScannedStart ? "COMPLETED" : "PENDING"}`, 129, 69);

      // Horizontal separator line
      doc.line(14, 82, 196, 82);

      // SECTION 2: DIAGNOSTIC & OPERATIONAL BREAKDOWN
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(242, 180, 46);
      doc.text("2. DIAGNOSTIC CHECKLIST & WORKFLOW", 14, 90);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text("DIAGNOSTIC TASK / COMPONENT CHECKPOINT", 14, 98);
      doc.text("VERIFICATION STATUS", 130, 98);
      doc.line(14, 100, 196, 100);

      doc.setFont("Helvetica", "normal");
      doc.text("1. Cylinder Head and Gasket Quality Scan", 14, 106);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(46, 125, 50); // green
      doc.text("PASSED / HEALTHY", 130, 106);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text("2. Timing Chain Tensioner Play Assessment", 14, 112);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(211, 47, 47); // red
      doc.text("CRITICAL: EXCESSIVE PLAY", 130, 112);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text("3. Dynamic Tensioner Swapping & Alignment", 14, 118);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(230, 81, 0); // orange
      doc.text(parts_pending_paused ? "PAUSED: PENDING SOURCING" : "ACTIVE WORK IN PROGRESS", 130, 118);

      // Voice Memo Logs (if any have been captured)
      let voiceY = 124;
      if (voiceLogs.length > 0) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text("TRANSCRIBED AUDIO LOGS:", 14, voiceY);
        voiceY += 5;
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(110, 110, 110);
        
        voiceLogs.slice(0, 2).forEach((log) => {
          doc.text(`[${log.language} Memo - ${log.timestamp}]: "${log.text}"`, 14, voiceY);
          voiceY += 5;
        });
      }

      // Horizontal separator line
      doc.setDrawColor(220, 220, 220);
      doc.line(14, voiceY + 4, 196, voiceY + 4);

      // SECTION 3: TIME STAMPS & LABOR FINANCIALS
      const financeY = voiceY + 12;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(242, 180, 46);
      doc.text("3. LABOR TIME AUDIT & FINANCIAL SUMMARY", 14, financeY);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text("LABOR HOURS UNDER HOOD:", 14, financeY + 8);
      doc.setFont("Helvetica", "normal");
      doc.text(`${hoursUnderHood} Hours`, 75, financeY + 8);

      doc.setFont("Helvetica", "bold");
      doc.text("HOURLY LABOR CHARGEOUT RATE:", 14, financeY + 14);
      doc.setFont("Helvetica", "normal");
      doc.text(`R ${hourlyRate} ZAR / hour`, 75, financeY + 14);

      doc.setFont("Helvetica", "bold");
      doc.text("TOTAL LABOR COMPONENT COST:", 14, financeY + 20);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text(`R ${hoursUnderHood * hourlyRate} ZAR`, 75, financeY + 20);

      // Replacement parts scan info
      if (isInvoiceScanned && invoiceMetadata) {
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text("REPLACEMENT PART COST:", 14, financeY + 26);
        doc.setFont("Helvetica", "normal");
        doc.text(`R ${invoiceMetadata.cost} ZAR (${invoiceMetadata.partName})`, 75, financeY + 26);

        doc.setFont("Helvetica", "bold");
        doc.text("SAPS REGISTER TRACE STATUS:", 14, financeY + 32);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(46, 125, 50); // green
        doc.text(`VERIFIED (INVOICE NO: ${invoiceMetadata.invoiceNo})`, 75, financeY + 32);
      } else {
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text("REPLACEMENT PART COST:", 14, financeY + 26);
        doc.setFont("Helvetica", "normal");
        doc.text("No retail invoices registered under Protocol 06.", 75, financeY + 26);
      }

      // Horizontal separator line
      const afterFinanceY = financeY + 38;
      doc.setDrawColor(220, 220, 220);
      doc.line(14, afterFinanceY, 196, afterFinanceY);

      // SECTION 4: ESG CIRCULARITY & MATERIAL PRESERVATION MATHEMATICS
      const mathY = afterFinanceY + 8;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(242, 180, 46);
      doc.text("4. ESG CIRCULARITY & MATERIAL PRESERVATION SCORE", 14, mathY);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text("MATERIAL PRESERVATION SCORE (S_pres):", 14, mathY + 8);
      doc.setFont("Helvetica", "normal");
      doc.text(`${sPres}% of aluminum/steel components preserved locally in the vehicle.`, 88, mathY + 8);

      doc.setFont("Helvetica", "bold");
      doc.text("AVOIDED CARBON FOOTPRINT (C_saved):", 14, mathY + 14);
      doc.setFont("Helvetica", "normal");
      doc.text(`${cSaved} kg CO2 prevented by executing micro-linkage repairs instead of assembly scrappage.`, 88, mathY + 14);

      // Visual Highlight box for ESG
      doc.setFillColor(232, 245, 233);
      doc.rect(14, mathY + 18, 182, 10, "F");
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(46, 125, 50);
      doc.text(`CIRCULAR RATING: CENTER-GRADE BRONZE // TOTAL EMISSIONS PREVENTED: ${cSaved} kg CO2`, 18, mathY + 24);

      // Horizontal separator line
      const afterMathY = mathY + 32;
      doc.setDrawColor(220, 220, 220);
      doc.line(14, afterMathY, 196, afterMathY);

      // SECTION 5: LEGAL DECLARATIONS & LIABILITY CLAUSES
      const legalY = afterMathY + 8;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(211, 47, 47); // red
      doc.text("5. FORMAL REGULATORY COMPLIANCE & LIABILITY CLAUSES", 14, legalY);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      
      const clause1 = "1. SECTION 14 DRIVEWAY INDEMNITY CLAUSE: All on-site operations are executed within the bounds of private residential driveway spaces. The Client indemnifies the platform and specialist crew against incidental surface oil stains or dust residue. Workmanship is fully guaranteed for 30 days post-handover.";
      const linesClause1 = doc.splitTextToSize(clause1, 182);
      doc.text(linesClause1, 14, legalY + 6);

      const nextY = legalY + 6 + (linesClause1.length * 3.5);

      const clause2 = "2. SOURCING RELEASE WAIVER (PARTS AUTONOMY): Where clients choose to hunt down cheaper components themselves to save cash, they accept that the specialist team holds zero liability for assembly delays, parts compatibility, or vehicle security during this period.";
      const linesClause2 = doc.splitTextToSize(clause2, 182);
      doc.text(linesClause2, 14, nextY);

      const finalY = nextY + (linesClause2.length * 3.5);

      const clause3 = "3. FAIR-TRADE & CLEAN SOURCING COMPLIANCE: By uploading retail supplier tax invoices containing unique identifier codes, our platform and repair specialists verify that all parts are cleared of any second-hand illicit trace. All database entries are synced with regional compliance hubs.";
      const linesClause3 = doc.splitTextToSize(clause3, 182);
      doc.text(linesClause3, 14, finalY);

      // Footer message
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("OFFICIAL MAKHANIKHI B2B JOB CARD REPORT -- SECURED COMPLIANCE PROTOCOL LOCK", 45, 282);

      // Save PDF document
      doc.save(`makhanikhi_jobcard_${Date.now()}.pdf`);
      toast.success("B2B Fleet Job Card PDF downloaded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Error generating PDF: ${err?.message || "Please check console details"}`);
    }
  };

  return (
    <div className="bento-card bg-industrial-charcoal border border-border-dim rounded-2xl p-4 sm:p-6 text-left relative overflow-hidden">
      {/* Visual Identity Decor */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-technic-yellow/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-success-green/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header with Title and Role Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-dim pb-5 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 text-technic-yellow text-[10px] font-black uppercase tracking-[3px] mb-2">
            <Layers className="w-3.5 h-3.5" /> Driveway Compliance & Verification
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase italic tracking-tight">
            THE MAKHANIKHI PROTOCOL
          </h2>
          <p className="text-xs text-text-dim uppercase tracking-wider font-bold mt-1">
            Standard Operating Procedures & Transactional Loops (Metropolitan Service Hub)
          </p>
        </div>

        {/* Dual Role Toggle & Solo Mode Controls */}
        <div className="flex items-center gap-3">
          <div className="bg-card-bg border border-border-dim p-1 rounded-xl flex items-center">
            <button 
              onClick={() => setActiveRole('specialist')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                activeRole === 'specialist' 
                  ? 'bg-technic-yellow text-industrial-charcoal' 
                  : 'text-text-dim hover:text-white'
              }`}
            >
              Mechanic
            </button>
            <button 
              onClick={() => setActiveRole('patron')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                activeRole === 'patron' 
                  ? 'bg-technic-yellow text-industrial-charcoal' 
                  : 'text-text-dim hover:text-white'
              }`}
            >
              Client (Patron)
            </button>
          </div>
        </div>
      </div>

      {/* Solo Worker Ergonomic Switch Banner */}
      <div className="mb-6 relative z-10">
        <div className={`p-4 rounded-xl border transition-all duration-300 ${
          is_solo_mode_active 
            ? 'bg-technic-yellow/15 border-technic-yellow/40 text-white' 
            : 'bg-card-bg border-border-dim text-text-dim'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                is_solo_mode_active ? 'bg-technic-yellow text-industrial-charcoal' : 'bg-white/5 text-text-dim'
              }`}>
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-1.5">
                  SOLO WORKER ERGONOMIC MODULE
                  {is_solo_mode_active && (
                    <span className="bg-technic-yellow text-industrial-charcoal text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </h4>
                <p className="text-[11px] normal-case leading-relaxed mt-0.5">
                  Designed for oily hands under vehicles. Activates 1-tap "Greasy-Finger" buttons, voice diagnostics, client co-pilot uploads, and delayed stage reporting checks.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setIsSoloModeActive(!is_solo_mode_active);
                toast.info(is_solo_mode_active ? "Standard Interface activated." : "Greasy-Hands Mode active! Giants tap targets deployed.");
              }}
              className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                is_solo_mode_active 
                  ? 'bg-white text-industrial-charcoal hover:bg-gray-100' 
                  : 'bg-technic-yellow text-industrial-charcoal hover:brightness-110'
              }`}
              style={is_solo_mode_active ? { height: '54px' } : {}}
            >
              {is_solo_mode_active ? 'DEACTIVATE SOLO MODE' : 'ACTIVATE SOLO MODE'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Split into Left Cockpit and Right Operational Guide / Job Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: ACTIVE TRANSACTION CONTROL WORKSPACE (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* PROTOCOL 1: PHYSICAL CHECK-IN & PRESENCE VERIFICATION LOCK */}
          <div className="p-5 rounded-xl bg-card-bg border border-border-dim relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-dim text-[9px] font-black uppercase tracking-wider">
                Protocol 01 // Site Check-In
              </span>
              {checkInVerified ? (
                <span className="text-success-green text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SECURE ON-SITE
                </span>
              ) : isForfeited ? (
                <span className="text-danger-red text-[10px] font-black uppercase flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> TIMER FORFEIT (100% FEE)
                </span>
              ) : (
                <span className="text-technic-yellow text-[10px] font-black uppercase flex items-center gap-1.5 animate-pulse">
                  <Clock className="w-3.5 h-3.5" /> PENDING CHECK-IN
                </span>
              )}
            </div>

            <h3 className="text-lg font-display font-black uppercase text-white mb-2">
              Responsible Person Verification Lock
            </h3>
            
            <p className="text-xs text-text-dim leading-relaxed mb-4">
              The technician is prohibited from picking up tools unless the client or an authorized adult is physically present.
            </p>

            {/* Timer countdown controls */}
            {!checkInVerified && !isForfeited && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-black text-text-dim uppercase tracking-wider">No-Show Expiry Counter</div>
                  <div className="text-3xl font-mono font-black text-technic-yellow mt-1 tracking-wider">
                    {formatTime(checkInCountdown)}
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  {!checkInTimerActive ? (
                    <button 
                      onClick={() => {
                        setCheckInTimerActive(true);
                        toast.info("15-Minute on-site attendance timer started.");
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-technic-yellow/20 text-technic-yellow border border-technic-yellow/30 text-[10px] font-black uppercase"
                    >
                      START TIMER
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setCheckInTimerActive(false);
                        toast.info("Timer paused.");
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-white/5 text-text-dim border border-white/10 text-[10px] font-black uppercase"
                    >
                      PAUSE
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setCheckInCountdown(0);
                      setIsForfeited(true);
                      setCheckInTimerActive(false);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-danger-red/10 text-danger-red border border-danger-red/20 text-[10px] font-black uppercase"
                  >
                    FORFEIT
                  </button>
                </div>
              </div>
            )}

            {/* Fuel level validation */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-white">Fuel Tank Check-In Level</span>
                <span className={`text-xs font-black uppercase tracking-widest ${isFuelLocked ? 'text-danger-red' : 'text-success-green'}`}>
                  {fuelLevel}% {isFuelLocked ? '(PAUSED)' : '(SAFE)'}
                </span>
              </div>
              <p className="text-[10px] text-text-dim leading-relaxed normal-case">
                To prevent dangerous fuel siphoning disputes and fire hazards, any tank at 100% full immediately locks progress until verified under 95%.
              </p>
              
              <div className="flex items-center gap-4 pt-1">
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  value={fuelLevel}
                  onChange={(e) => {
                    setFuelLevel(Number(e.target.value));
                    setFuelLevelChecked(Number(e.target.value) < 95);
                  }}
                  className="w-full accent-technic-yellow"
                />
                <span className="text-[11px] font-mono font-black">{fuelLevel}%</span>
              </div>
            </div>

            {/* Big Tap button or regular */}
            {is_solo_mode_active ? (
              <button 
                onClick={togglePresenceVerification}
                disabled={isForfeited || isFuelLocked}
                className={`w-full py-5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                  checkInVerified 
                    ? 'bg-success-green text-industrial-charcoal' 
                    : 'bg-technic-yellow text-industrial-charcoal'
                }`}
                style={{ height: '64px' }}
              >
                {checkInVerified ? '✓ VERIFIED: LOCK CLIENT PRESENCE' : 'TAP TO CONFIRM CLIENT IS PRESENT'}
              </button>
            ) : (
              <button 
                onClick={togglePresenceVerification}
                disabled={isForfeited || isFuelLocked}
                className={`w-full py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${
                  checkInVerified 
                    ? 'bg-success-green/20 text-success-green border border-success-green/30' 
                    : 'bg-technic-yellow text-industrial-charcoal hover:brightness-110'
                }`}
              >
                {checkInVerified ? '✓ PRESENCE VERIFIED' : 'CONFIRM PHYSICALLY PRESENT ON-SITE'}
              </button>
            )}
          </div>

          {/* PROTOCOL 2: TOOLKIT ISOLATION & SHADOW BOARD SCAN */}
          <div className="p-5 rounded-xl bg-card-bg border border-border-dim">
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-dim text-[9px] font-black uppercase tracking-wider">
                Protocol 02 // Spares & Gear Security
              </span>
              <span className={`text-[10px] font-black uppercase ${
                toolboxScannedStart && toolboxScannedEnd ? 'text-success-green' : 'text-technic-yellow'
              }`}>
                {toolboxScannedStart && toolboxScannedEnd ? 'CLEARED OUT' : toolboxScannedStart ? 'ACTIVE SCANNER' : 'UNVERIFIED'}
              </span>
            </div>

            <h3 className="text-lg font-display font-black uppercase text-white mb-2">
              Toolkit Isolation & Shadow Board Photo Scan
            </h3>
            
            <p className="text-xs text-text-dim leading-relaxed mb-4">
              Our mechanics utilize computerized bird's-eye photo scans of tool drawers to verify zero spanners are missing or left behind inside engine bays.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* Start Scan Status */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <span className="block text-[8px] uppercase tracking-widest font-black text-text-dim">START OF DAY</span>
                <div className="flex items-center gap-2">
                  {toolboxScannedStart ? (
                    <CheckCircle2 className="w-5 h-5 text-success-green shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-text-dim shrink-0" />
                  )}
                  <span className="text-xs font-black uppercase text-white">
                    {toolboxScannedStart ? 'Verified (24/24 Sockets)' : 'Scan Required'}
                  </span>
                </div>
              </div>

              {/* End Scan Status */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <span className="block text-[8px] uppercase tracking-widest font-black text-text-dim">END OF DAY</span>
                <div className="flex items-center gap-2">
                  {toolboxScannedEnd ? (
                    <CheckCircle2 className="w-5 h-5 text-success-green shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-text-dim shrink-0" />
                  )}
                  <span className="text-xs font-black uppercase text-white">
                    {toolboxScannedEnd ? 'Verified (0 Left Behind)' : 'Pending Handover'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isClientToolsRemoved}
                  onChange={(e) => setIsClientToolsRemoved(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-industrial-charcoal accent-technic-yellow"
                />
                <div>
                  <span className="text-xs font-black uppercase text-white block">CLIENT TOOLKIT ISOLATION AGREEMENT</span>
                  <p className="text-[10px] text-text-dim normal-case mt-0.5 leading-relaxed">
                    Client agrees to remove all personal tools from the workspace. Our crew is banned from borrowing or handling any client-owned tools to eliminate misplacement disputes.
                  </p>
                </div>
              </label>
            </div>

            {/* Giant button for solo hands */}
            <button 
              onClick={triggerToolboxScan}
              disabled={scanningToolbox || !isClientToolsRemoved}
              className={`w-full rounded-xl font-black uppercase tracking-widest transition-all ${
                is_solo_mode_active 
                  ? 'py-5 text-xs bg-technic-yellow text-industrial-charcoal' 
                  : 'py-3.5 text-[11px] bg-white/5 text-white border border-white/10 hover:bg-white/[0.08]'
              } ${(!isClientToolsRemoved || scanningToolbox) && 'opacity-40 cursor-not-allowed'}`}
              style={is_solo_mode_active ? { height: '64px' } : {}}
            >
              {scanningToolbox ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> RUNNING COMPUTER VISION SCAN...
                </span>
              ) : !toolboxScannedStart ? (
                '✓ START WORK: CAPTURE SHADOW BOARD PHOTO'
              ) : (
                '✓ FINISH WORK: CAPTURE END-OF-DAY PHOTO'
              )}
            </button>
          </div>

          {/* PROTOCOL 3: THE OHS SOBRIETY FILTER */}
          <div className="p-5 rounded-xl bg-card-bg border border-border-dim">
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-dim text-[9px] font-black uppercase tracking-wider">
                Protocol 03 // Safety Sobriety Filter
              </span>
              {sobriety_passed ? (
                <span className="text-success-green text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SOBRIETY VERIFIED
                </span>
              ) : (
                <span className="text-danger-red text-[10px] font-black uppercase flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> CHECK REQUIRED
                </span>
              )}
            </div>

            <h3 className="text-lg font-display font-black uppercase text-white mb-2">
              The OHS Sobriety Filter Lock
            </h3>
            
            <p className="text-xs text-text-dim leading-relaxed mb-4">
              Safety clearance check. The specialist must confirm zero impairment before taking apart fuel manifolds, timing gear, or brake lines.
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-white">Client's Active Test Request</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                  clientRequestedSobriety ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-text-dim'
                }`}>
                  {clientRequestedSobriety ? 'Client Demanded' : 'Optional Check'}
                </span>
              </div>
              <p className="text-[10px] text-text-dim normal-case leading-relaxed">
                Every vehicle owner has the right to request a physical rapid test strip verification. Refusing or failing instantly terminates the job and forfeits the call-out fee.
              </p>
              
              <button 
                onClick={() => {
                  setClientRequestedSobriety(!clientRequestedSobriety);
                  toast.success(clientRequestedSobriety ? "Client request cancelled." : "Client request logged! Sobriety scan mandatory to unlock waiver.");
                }}
                className={`w-full text-center py-2 px-3 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all ${
                  clientRequestedSobriety 
                    ? 'border-orange-500/40 text-orange-400 bg-orange-500/5' 
                    : 'border-white/10 text-text-dim bg-white/5 hover:text-white'
                }`}
              >
                {clientRequestedSobriety ? '✕ DISMISS CLIENT REQUEST' : '⚠️ ACTIVATE CLIENT DEMAND FOR TEST'}
              </button>
            </div>

            {/* Sobriety verification execution */}
            {is_solo_mode_active ? (
              <button 
                onClick={triggerSobrietyCheck}
                disabled={scanningSobrietyTest}
                className="w-full py-5 bg-success-green text-industrial-charcoal rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                style={{ height: '64px' }}
              >
                {scanningSobrietyTest ? 'PROCESSING TEST STRIP...' : sobriety_passed ? '✓ TEST CLEARED (0.00% IMPAIRMENT)' : 'TAP TO SCAN PHYSICAL TEST STRIP PHOTO'}
              </button>
            ) : (
              <button 
                onClick={triggerSobrietyCheck}
                disabled={scanningSobrietyTest}
                className="w-full py-3.5 bg-white/5 border border-white/10 hover:bg-white/[0.08] rounded-xl font-black text-[11px] uppercase tracking-widest text-white transition-all"
              >
                {scanningSobrietyTest ? 'SCANNING...' : sobriety_passed ? '✓ SOBRIETY CLEARED' : 'CAPTURE RAPID TEST STRIP PHOTO'}
              </button>
            )}

            {sobrietyCheckedAt && (
              <p className="text-[9px] text-center text-success-green font-mono uppercase tracking-widest mt-2">
                Logged test clearance code at {sobrietyCheckedAt}
              </p>
            )}
          </div>

          {/* PROTOCOL 5: DIAGNOSTIC-ONLY MODE & PRE-AUTHORIZED LIABILITY WAIVERS */}
          <div className="p-5 rounded-xl bg-card-bg border border-border-dim">
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-dim text-[9px] font-black uppercase tracking-wider">
                Protocol 05 // Sourcing Releases
              </span>
              <span className={`text-[10px] font-black uppercase ${
                isSourcingReleaseSigned ? 'text-success-green' : 'text-technic-yellow'
              }`}>
                {isSourcingReleaseSigned ? 'WAIVER RECORDED' : 'AWAITING SIGNATURE'}
              </span>
            </div>

            <h3 className="text-lg font-display font-black uppercase text-white mb-2">
              Uncover & Validate / Parts Autonomy Waivers
            </h3>
            
            <p className="text-xs text-text-dim leading-relaxed mb-4">
              When clients choose to hunt down cheaper components themselves to save cash, the active labor clock pauses, and they must authorize our Sourcing Release.
            </p>

            <div className="space-y-4 mb-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isDiagnosticOnlyMode}
                    onChange={(e) => setIsDiagnosticOnlyMode(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-industrial-charcoal accent-technic-yellow"
                  />
                  <div>
                    <span className="text-xs font-black uppercase text-white block">DIAGNOSTIC-ONLY FIXED FEE MODE</span>
                    <span className="text-[10px] text-text-dim">Uncover internal engine fault only (R450 flat rate)</span>
                  </div>
                </label>
              </div>

              {/* Sourcing Autonomy Release */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <span className="text-xs font-black uppercase text-white block">PARTS AUTONOMY SIGN-OFF</span>
                <p className="text-[10px] text-text-dim normal-case leading-relaxed">
                  "I have elected to source my own replacement parts. I understand and accept that the specialist team and platform hold zero liability for assembly delays, parts compatibility, or vehicle security during this period."
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder="Enter Client Full Name to sign"
                    value={sourcingWaiverText}
                    onChange={(e) => setSourcingWaiverText(e.target.value)}
                    className="bg-industrial-charcoal border border-white/10 px-3 py-2 text-xs uppercase font-black rounded-lg text-white placeholder-text-dim flex-1"
                  />
                  <button 
                    disabled={!sourcingWaiverText.trim()}
                    onClick={() => {
                      setIsSourcingReleaseSigned(true);
                      setPartsPendingPaused(true);
                      setPartsPendingPaused(true);
                      toast.success(`Autonomy waiver registered for client: ${sourcingWaiverText}. Active labor timer paused!`);
                    }}
                    className="px-4 py-2 bg-technic-yellow text-industrial-charcoal text-[10px] font-black uppercase rounded-lg hover:brightness-110"
                  >
                    SIGN WAIVER
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PROTOCOL 6: PARTS PENDING & OMS INVOICE SCAN LOOP */}
          <div className="p-5 rounded-xl bg-card-bg border border-border-dim">
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-dim text-[9px] font-black uppercase tracking-wider">
                Protocol 06 // SAPS Goods Compliance
              </span>
              <span className={`text-[10px] font-black uppercase ${
                isInvoiceScanned ? 'text-success-green' : 'text-technic-yellow'
              }`}>
                {isInvoiceScanned ? 'INVOICE VERIFIED' : 'AWAITING SCAN'}
              </span>
            </div>

            <h3 className="text-lg font-display font-black uppercase text-white mb-2">
              "Parts Pending" Order Management System
            </h3>
            
            <p className="text-xs text-text-dim leading-relaxed mb-4">
              To fully comply with the SAPS Second-Hand Goods Act, any newly arrived custom components must have their retail VAT receipts captured, which instantly resumes work.
            </p>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-white">Labor Timer Status</span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase ${
                  parts_pending_paused ? 'bg-danger-red/20 text-danger-red animate-pulse' : 'bg-success-green/20 text-success-green'
                }`}>
                  {parts_pending_paused ? '⏸ LABOR PAUSED' : '▶ LABOR ACTIVE'}
                </span>
              </div>
              <p className="text-[10px] text-text-dim normal-case leading-relaxed">
                Labor timers are automatically suspended on the platform during the "Parts Pending" stage to safeguard the client's wallet.
              </p>
              
              <button 
                onClick={() => {
                  setPartsPendingPaused(!parts_pending_paused);
                  toast.info(parts_pending_paused ? "Work resumed." : "Job status updated to PARTS PENDING. Timer suspended.");
                }}
                className="w-full text-center py-2 px-3 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-wider text-text-dim bg-white/5 hover:text-white"
              >
                {parts_pending_paused ? '▶ MANUALLY RESUME TIMER' : '⏸ PAUSE TIMER FOR PARTS DELIVERY'}
              </button>
            </div>

            {/* Scan and metadata results */}
            {isInvoiceScanned && invoiceMetadata && (
              <div className="p-4 rounded-xl bg-success-green/5 border border-success-green/20 mb-4 space-y-2 text-xs uppercase font-mono">
                <div className="flex justify-between text-success-green font-bold text-[10px]">
                  <span>✓ SAPS REGISTER VALIDATED</span>
                  <span>VAT COMPLIANT</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-text-dim">
                  <div>SUPPLIER: <span className="text-white font-bold">{invoiceMetadata.supplier}</span></div>
                  <div>INVOICE NO: <span className="text-white font-bold">{invoiceMetadata.invoiceNo}</span></div>
                  <div>VAT REG NO: <span className="text-white font-bold">{invoiceMetadata.vatNo}</span></div>
                  <div>PART DESC: <span className="text-white font-bold">{invoiceMetadata.partName}</span></div>
                </div>
              </div>
            )}

            {is_solo_mode_active ? (
              <button 
                onClick={triggerInvoiceScan}
                disabled={scanningInvoice}
                className="w-full py-5 bg-technic-yellow text-industrial-charcoal rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                style={{ height: '64px' }}
              >
                {scanningInvoice ? 'ANALYZING TAX INVOICE DETAILS...' : isInvoiceScanned ? '✓ INVOICE VERIFIED & LOGGED' : 'TAP TO SCAN INVOICE RECEIPT PHOTO'}
              </button>
            ) : (
              <button 
                onClick={triggerInvoiceScan}
                disabled={scanningInvoice}
                className="w-full py-3.5 bg-white/5 border border-white/10 hover:bg-white/[0.08] rounded-xl font-black text-[11px] uppercase tracking-widest text-white transition-all"
              >
                {scanningInvoice ? 'SCANNING...' : isInvoiceScanned ? '✓ INVOICE SCAN COMPLETE' : 'SCAN TAX INVOICE PHOTO'}
              </button>
            )}
          </div>

          {/* GREASY HANDS EXTRA CO-PILOT AND VOICE LOGS DISPLAY */}
          {is_solo_mode_active && (
            <div className="p-5 rounded-xl bg-technic-yellow/5 border border-technic-yellow/30 space-y-6">
              <div>
                <h4 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-technic-yellow" /> Voice-to-Text Logs Simulator
                </h4>
                <p className="text-[10px] text-text-dim mt-0.5 leading-relaxed">
                  Avoid greasy smudges on screen. Speak diagnostic findings in any home language (Sepedi, Zulu, Xhosa, English). The platform logs the audio directly on the job card and transcribes tasks in the background.
                </p>

                {/* Voice controls */}
                <div className="flex gap-2 mt-4">
                  {['Sepedi', 'Zulu', 'Xhosa', 'English'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedVoiceLang(lang)}
                      className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg border transition-all ${
                        selectedVoiceLang === lang 
                          ? 'bg-technic-yellow border-technic-yellow text-industrial-charcoal' 
                          : 'bg-white/5 border-white/10 text-text-dim hover:text-white'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={triggerVoiceRecord}
                  className={`w-full mt-4 py-5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                    recordingVoice ? 'bg-danger-red text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  style={{ height: '54px' }}
                >
                  <Mic className="w-4 h-4" />
                  {recordingVoice ? 'TAP TO STOP & TRANSCRIBE' : `TAP TO SPEAK IN ${selectedVoiceLang.toUpperCase()}`}
                </button>

                {/* Render voice transcripts */}
                <div className="space-y-3 mt-4">
                  {voiceLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs uppercase font-mono relative">
                      <div className="flex justify-between text-[9px] text-text-dim mb-1 font-bold">
                        <span>{log.language} MEMO</span>
                        <span>{log.timestamp}</span>
                      </div>
                      <p className="text-white text-[11px] font-sans normal-case italic">"{log.text}"</p>
                      <div className="text-[8px] text-technic-yellow mt-1 font-bold tracking-widest">
                        ✓ AUTO-TRANSCRIBED & ITEMISED ON CLIENT JOB CARD
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Co-Pilot Upload Proxy */}
              <div className="border-t border-white/10 pt-4 space-y-4">
                <div>
                  <h4 className="text-sm font-black uppercase text-white tracking-tight flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-technic-yellow" /> "Client Co-Pilot" Upload Proxy
                  </h4>
                  <p className="text-[10px] text-text-dim mt-0.5 leading-relaxed">
                    Under the hood and cannot hold your phone? Dispatch an instant link to the client's phone. They take and upload photos of worn parts directly, keeping hands clean.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={sendCoPilotLink}
                    className="flex-1 py-4 bg-technic-yellow text-industrial-charcoal font-black text-xs uppercase tracking-wider rounded-xl"
                    style={{ height: '50px' }}
                  >
                    {coPilotProxyLinkSent ? '✓ CO-PILOT LINK SENT' : 'SEND CO-PILOT PHOTO LINK'}
                  </button>

                  {coPilotProxyLinkSent && (
                    <button 
                      onClick={simulateCoPilotUpload}
                      className="flex-1 py-4 bg-success-green/20 text-success-green border border-success-green/30 font-black text-xs uppercase tracking-wider rounded-xl"
                      style={{ height: '50px' }}
                    >
                      SIMULATE UPLOAD
                    </button>
                  )}
                </div>

                {coPilotPhotoUploaded && (
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
                    <div className="w-12 h-12 rounded bg-white/10 overflow-hidden shrink-0">
                      <img src="/placeholder_conquest.jpg" alt="Conquest stripped thread" className="w-full h-full object-cover" onError={(e)=>{e.currentTarget.src='https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=150';}} />
                    </div>
                    <div>
                      <span className="text-[10px] text-success-green font-mono font-black block">✓ CLIENT CO-PILOT UPLOAD SUCCESSFUL</span>
                      <span className="text-[10px] text-white font-mono uppercase">CONQUEST_THREAD_DAMAGED.JPG</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: PROFESSIONAL B2B JOB CARD & MATHEMATICAL ESG PROOFS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* DIGITAL JOB CARD */}
          <div className="p-5 rounded-xl bg-card-bg border border-border-dim relative overflow-hidden">
            <div className="border-b border-white/10 pb-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono font-black bg-white/5 border border-white/10 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                  M-JOB-CARD-4820
                </span>
                <span className="text-technic-yellow text-[10px] font-mono font-black uppercase">
                  Regional Tech Hub
                </span>
              </div>
              <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tight mt-2">
                Professional Job Card
              </h3>
            </div>

            {/* Stage tracker bar */}
            <div className="grid grid-cols-6 gap-1 mb-6">
              {(['setup', 'diagnostic', 'parts_pending', 'fix', 'clean_test', 'handover'] as const).map((stage) => {
                const activeMap = {
                  setup: activeStage === 'setup',
                  diagnostic: activeStage === 'diagnostic',
                  parts_pending: activeStage === 'parts_pending' || parts_pending_paused,
                  fix: activeStage === 'fix',
                  clean_test: activeStage === 'clean_test',
                  handover: activeStage === 'handover'
                };
                const isCurrent = activeStage === stage;
                return (
                  <div key={stage} className="flex flex-col items-center">
                    <div 
                      onClick={() => setActiveStage(stage)}
                      className={`h-1.5 w-full rounded transition-all cursor-pointer ${
                        isCurrent 
                          ? 'bg-technic-yellow' 
                          : activeMap[stage] 
                            ? 'bg-success-green' 
                            : 'bg-white/10'
                      }`} 
                    />
                    <span className="text-[7px] text-text-dim uppercase tracking-tighter mt-1 font-bold text-center truncate w-full">
                      {stage.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Vehicle Details */}
            <div className="space-y-4 text-xs font-mono uppercase mb-6">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                <div className="text-[9px] text-text-dim font-black tracking-widest">COMMUNITY FLEET VEHICLE</div>
                <div className="text-sm font-black text-white">Hyundai i20 (2013 Facelift)</div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-text-dim">
                  <div>REG NO: ND 48201</div>
                  <div>OWNER ID: O-94821</div>
                </div>
              </div>

              {/* Step-by-Step Diagnostic Breakdown */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-text-dim block tracking-widest">Diagnostic & Task Breakdown</span>
                <div className="space-y-1.5">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                    <span>1. Cylinder Head Inspection</span>
                    <span className="text-success-green font-bold">✓ PASSED</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between">
                    <span>2. Timing Tensioner Play Test</span>
                    <span className="text-danger-red font-bold">⚠️ EXCESSIVE PLAY</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between font-bold text-technic-yellow">
                    <span>3. Tensioner Swap & Timing Lineup</span>
                    <span>{parts_pending_paused ? '⏸ PENDING PARTS' : '▶ IN PROGRESS'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Labor rate details */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 mb-6">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-text-dim uppercase font-bold">Hourly Labor Time under Hood</span>
                <span className="text-white font-black">{hoursUnderHood} Hours</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-text-dim uppercase font-bold">Labor Rate per Hour</span>
                <span className="text-white font-black">R{hourlyRate}</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setHoursUnderHood(prev => Math.max(0.5, prev - 0.5))}
                  className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10"
                >
                  -30m
                </button>
                <button 
                  onClick={() => setHoursUnderHood(prev => prev + 0.5)}
                  className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10"
                >
                  +30m
                </button>
                <div className="ml-auto text-right font-mono">
                  <span className="text-[9px] text-text-dim uppercase font-black block leading-none">TOTAL LABOR</span>
                  <span className="text-base font-black text-technic-yellow tracking-wider">R{hoursUnderHood * hourlyRate}</span>
                </div>
              </div>
            </div>

            {/* Standard Liability Clause on Job Card */}
            <div className="p-3 rounded-lg bg-danger-red/5 border border-danger-red/20 text-[9px] leading-relaxed text-text-dim uppercase font-mono">
              <span className="text-danger-red font-bold block mb-1">⚠️ SECTION 14 WAIVER CLAUSE</span>
              All on-site operations are executed within the bounds of private residential driveway spaces. The Client indemnifies the platform against incidental surface oil stains or dust residue. Workmanship is guaranteed for 30 days post-handover.
            </div>

            <button 
              onClick={generatePDF}
              className="w-full mt-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-technic-yellow" /> DOWNLOAD OFFICIAL B2B JOB CARD (PDF)
            </button>
          </div>

          {/* MATHEMATICAL PROOFS: ESG CIRCULARITY */}
          <div className="p-5 rounded-xl bg-success-green/5 border border-success-green/20 relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 text-success-green text-[10px] font-black uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Material Preservation & Avoided Carbon Proofs
            </div>

            <h3 className="text-lg font-display font-black uppercase text-digital-white mb-2">
              Driveway Recycling Mathematics
            </h3>
            
            <p className="text-xs text-text-dim leading-relaxed mb-6">
              Instead of discarding complete aluminum assemblies, we repair localized linkages to maximize carbon and material preservation.
            </p>

            {/* Standard LaTeX Proof Block */}
            <div className="p-4 bg-industrial-charcoal/80 border border-success-green/30 rounded-xl space-y-4 font-mono text-xs text-success-green mb-6">
              <div className="border-b border-success-green/10 pb-2 mb-2">
                <span className="text-[9px] text-text-dim block uppercase font-bold tracking-widest mb-1">Equation 1: Material Preservation Score</span>
                <div className="text-sm font-sans font-bold text-center py-2 text-white bg-black/30 rounded">
                  {"$$S_{pres} = \\frac{M_{repaired}}{M_{total}} \\times 100$$"}
                </div>
                <div className="text-[9px] text-text-dim mt-2 leading-relaxed normal-case">
                  {"Where $M_{repaired}$ is mass of salvaged steel ("}{massRepaired}{" kg), and $M_{total}$ is full sub-assembly mass ("}{massTotalAssembly}{" kg)."}
                </div>
                <div className="text-right text-xs font-black text-success-green tracking-widest mt-1">
                  {"$S_{pres} = "}{sPres}{"\\%$"}
                </div>
              </div>

              <div>
                <span className="text-[9px] text-text-dim block uppercase font-bold tracking-widest mb-1">Equation 2: Avoided Carbon Footprint</span>
                <div className="text-sm font-sans font-bold text-center py-2 text-white bg-black/30 rounded">
                  {"$$C_{saved} = M_{repaired} \\times \\left( E_{virgin} - E_{repaired} \\right) \\times \\alpha$$"}
                </div>
                <div className="text-[9px] text-text-dim mt-2 leading-relaxed normal-case">
                  {"Where $E_{virgin}$ is raw mining energy ($6.4\\text{ kg CO}_2/\\text{kg}$), $E_{repaired}$ is localized machining energy ($0.8\\text{ kg CO}_2/\\text{kg}$), and $\\alpha$ is regional grid emission factor ($1.25$)."}
                </div>
                <div className="text-right text-xs font-black text-success-green tracking-widest mt-1">
                  {"$C_{saved} = "}{cSaved}{"\\text{ kg CO}_2$"}
                </div>
              </div>
            </div>

            {/* Circularity Performance Badge */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-text-dim uppercase font-black block text-[8px] tracking-widest">PRESERVATION RATING</span>
                <span className="text-sm font-black text-white">CENTER-GRADE BRONZE</span>
              </div>
              <div className="text-right">
                <span className="text-text-dim uppercase font-black block text-[8px] tracking-widest">TOTAL EMISSIONS PREVENTED</span>
                <span className="text-sm font-black text-success-green">{cSaved} kg CO₂</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* STANDARD OPERATING PROCEDURES (SOPS) MARKDOWN TABLES */}
      <div className="mt-8 border-t border-white/5 pt-8 relative z-10">
        <h3 className="text-lg font-display font-black uppercase text-white mb-4 flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-technic-yellow" /> Operational Matrix SOP
        </h3>
        
        <p className="text-xs text-text-dim leading-relaxed mb-6">
          The table below maps out physical actions, compliance checks, and electronic transactions required for each stage of the driveway repair pipeline.
        </p>

        {/* Responsive table wrapper */}
        <div className="overflow-x-auto border border-border-dim rounded-xl">
          <table className="w-full text-xs font-mono text-text-dim uppercase tracking-wide">
            <thead>
              <tr className="bg-white/5 border-b border-border-dim text-white text-[10px] font-black tracking-widest text-left">
                <th className="p-4">STAGE</th>
                <th className="p-4">CLIENT (PATRON) ACTION</th>
                <th className="p-4">SPECIALIST MECHANIC ACTION</th>
                <th className="p-4">PLATFORM SYSTEM COMPLIANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dim bg-card-bg/40">
              <tr>
                <td className="p-4 font-black text-technic-yellow">01 // SETUP</td>
                <td className="p-4 normal-case">Arrive on-site; confirm presence physically. Complete fuel safety level review.</td>
                <td className="p-4 normal-case">Place 6 warning cones; capture toolbox shadow board photo scan. Verify sobriety strip.</td>
                <td className="p-4 normal-case">Initiate 15-minute forfeit countdown. Lock location presence check.</td>
              </tr>
              <tr>
                <td className="p-4 font-black text-technic-yellow">02 // DIAGNOSTIC</td>
                <td className="p-4 normal-case">Authorize Diagnostic-Only flat rate or sign parts autonomy waiver.</td>
                <td className="p-4 normal-case">Execute precision diagnostics; log voice findings in Sepedi/Zulu/English.</td>
                <td className="p-4 normal-case">Generate electronic B2B Job Card. Compute material preservation rating.</td>
              </tr>
              <tr>
                <td className="p-4 font-black text-technic-yellow">03 // PARTS PENDING</td>
                <td className="p-4 normal-case">Source cheaper parts from local retail or opt for automated platform orders.</td>
                <td className="p-4 normal-case">Pause labor clock. Isolate workspace tools entirely from client gear.</td>
                <td className="p-4 normal-case">Enforce parts-sourcing release liability waiver. Pause active invoicing.</td>
              </tr>
              <tr>
                <td className="p-4 font-black text-technic-yellow">04 // THE FIX</td>
                <td className="p-4 normal-case">Monitor real-time milestones or provide client co-pilot photo assistance.</td>
                <td className="p-4 normal-case">Install replacement parts. Capture VAT invoice receipt for SAPS registry.</td>
                <td className="p-4 normal-case">Validate invoice receipt via SAPS Second-Hand Goods check. Restart labor clock.</td>
              </tr>
              <tr>
                <td className="p-4 font-black text-technic-yellow">05 // CLEAN & TEST</td>
                <td className="p-4 normal-case">Conduct joint on-site physical drive test under technician co-pilot.</td>
                <td className="p-4 normal-case">Run full diagnostics scan. Clear the driveway of all oils/spills completely.</td>
                <td className="p-4 normal-case">Calculate final preservation score. Compile avoided carbon emissions.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
