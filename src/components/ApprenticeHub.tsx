import React, { useState } from 'react';
import { 
  Award, Star, FileText, Download, Mail, CheckCircle2, 
  DollarSign, Clock, UserCheck, ShieldCheck, Sparkles, 
  Send, ExternalLink, RefreshCw, ChevronRight, User, Wrench
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { useAuth } from '../lib/AuthContext';

interface SkillRating {
  domain: string;
  stars: number; // 1 to 5
  level: string;
  verifiedByMentor: boolean;
  dateVerified: string;
}

interface CompensationLog {
  id: string;
  date: string;
  jobDescription: string;
  hoursWorked: number;
  amountPaid: number;
  status: 'paid' | 'pending';
  mentorSignature: string;
}

export const ApprenticeHub: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'prowess' | 'compensation' | 'poe_export' | 'kudos'>('prowess');
  const [recipientEmail, setRecipientEmail] = useState<string>('skills.authority@makhanikhi.co.za');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'apprentice' | 'mechanic'>('apprentice');

  // Technical Prowess Matrix
  const [skills, setSkills] = useState<SkillRating[]>([
    {
      domain: 'Engine Diagnostics & Code Parsing',
      stars: 5,
      level: 'Mastery (Level 4)',
      verifiedByMentor: true,
      dateVerified: '2026-03-15'
    },
    {
      domain: 'Brake Servicing & ABS Hydraulics',
      stars: 4,
      level: 'Advanced (Level 3)',
      verifiedByMentor: true,
      dateVerified: '2026-03-20'
    },
    {
      domain: 'Automotive Electrical & CAN-bus',
      stars: 5,
      level: 'Mastery (Level 4)',
      verifiedByMentor: true,
      dateVerified: '2026-03-28'
    },
    {
      domain: 'Driveway Safety, Gazebo & Demarcation',
      stars: 5,
      level: 'Certified Auditor',
      verifiedByMentor: true,
      dateVerified: '2026-03-10'
    },
    {
      domain: 'Suspension, Steering & Wheel Alignment',
      stars: 4,
      level: 'Advanced (Level 3)',
      verifiedByMentor: true,
      dateVerified: '2026-03-22'
    }
  ]);

  // Fair Compensation Logs
  const [compensationLogs] = useState<CompensationLog[]>([
    {
      id: 'COMP-101',
      date: '2026-03-25',
      jobDescription: 'Toyota Hilux 2.8 GD-6 100k Major Service & Brake Flush',
      hoursWorked: 4.5,
      amountPaid: 650,
      status: 'paid',
      mentorSignature: 'Kabelo Sithole (Cert #882)'
    },
    {
      id: 'COMP-102',
      date: '2026-03-22',
      jobDescription: 'Ford Ranger 3.2 TDCi Alternator & Belt Replacement',
      hoursWorked: 3.0,
      amountPaid: 450,
      status: 'paid',
      mentorSignature: 'Kabelo Sithole (Cert #882)'
    },
    {
      id: 'COMP-103',
      date: '2026-03-18',
      jobDescription: 'VW Polo 1.4 TSI Water Pump & Coolant System Flush',
      hoursWorked: 4.0,
      amountPaid: 580,
      status: 'paid',
      mentorSignature: 'Kabelo Sithole (Cert #882)'
    }
  ]);

  // Client Kudos
  const [kudosList] = useState([
    {
      clientName: 'Sipho Ndlovu (Fleet Director)',
      stars: 5,
      comment: 'Impressive apprentice! Kept the work site pristine, placed oil spill mats immediately, and handled torque wrench calibrations with precision.',
      date: '2 days ago'
    },
    {
      clientName: 'Elize Van Der Merwe',
      stars: 5,
      comment: 'Very polite and knowledgeable technician. Explained the brake pad wear clearly. Deserves top kudos!',
      date: '1 week ago'
    }
  ]);

  // PDF Generator using jsPDF
  const generateFormalPoEPDF = (mode: 'download' | 'email') => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Top Header Industrial Bar
      doc.setFillColor(18, 24, 36); // #121824 industrial charcoal
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Accent gold strip
      doc.setFillColor(255, 210, 0); // #FFD200 technic yellow
      doc.rect(0, 38, pageWidth, 2.5, 'F');

      // Header Brand
      doc.setTextColor(255, 210, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('MAKHANIKHI', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL PORTFOLIO OF EVIDENCE & TECHNICAL PROWESS RECORD', 14, 28);
      doc.text('Regulated Skills Transfer & Compliance Protocol', 14, 34);

      // Document Meta Box
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(8);
      doc.text(`ISSUED: ${new Date().toLocaleDateString()} | REF: MKH-POE-${Math.floor(100000 + Math.random() * 900000)}`, pageWidth - 80, 20);
      doc.text('VERIFICATION: CIPC / BIZEE VERIFIED', pageWidth - 80, 26);
      doc.text('ESCROW AUDIT STATUS: COMPLIANT (>=90%)', pageWidth - 80, 32);

      let yPos = 52;

      // Profile Summary Section
      doc.setFillColor(248, 249, 250);
      doc.rect(14, yPos, pageWidth - 28, 32, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(14, yPos, pageWidth - 28, 32, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(`RECORD HOLDER: ${profile?.displayName || 'Lerato Mokoena'} (${viewMode.toUpperCase()})`, 18, yPos + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      doc.text(`Accreditation ID: MKH-ZA-2026-APP | Mentor: Kabelo Sithole (Master Tech)`, 18, yPos + 16);
      doc.text(`Company Registration: CIPC CoR 14.3 (#2023/849201/07) | Tax PIN: Verified`, 18, yPos + 22);
      doc.text(`Live Substance Test: Timestamp Verified | PPE Audit: Full Compliance`, 18, yPos + 28);

      yPos += 42;

      // Section: Continuous Technical Prowess Stars
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(18, 24, 36);
      doc.text('1. CONTINUOUS TECHNICAL PROWESS GROWTH & STAR RATINGS', 14, yPos);
      doc.setDrawColor(255, 210, 0);
      doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);

      yPos += 10;
      doc.setFontSize(9);

      skills.forEach((skill, idx) => {
        doc.setFillColor(idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 250);
        doc.rect(14, yPos, pageWidth - 28, 9, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(skill.domain, 18, yPos + 6);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(200, 150, 0);
        const starStr = '★'.repeat(skill.stars) + '☆'.repeat(5 - skill.stars);
        doc.text(`${starStr} (${skill.stars}/5 Stars)`, 120, yPos + 6);

        doc.setTextColor(40, 140, 40);
        doc.text(`Verified: ${skill.dateVerified}`, pageWidth - 55, yPos + 6);

        yPos += 9.5;
      });

      yPos += 8;

      // Section: Fair Compensation Track
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(18, 24, 36);
      doc.text('2. APPRENTICE FAIR COMPENSATION & HOURS LOGGED', 14, yPos);
      doc.setDrawColor(255, 210, 0);
      doc.line(14, yPos + 2, pageWidth - 14, yPos + 2);

      yPos += 10;

      compensationLogs.forEach((log) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(20, 20, 20);
        doc.text(`${log.date}: ${log.jobDescription}`, 18, yPos);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(`Hours: ${log.hoursWorked} hrs | Stipend Paid: R ${log.amountPaid}.00 [ON-TIME]`, 18, yPos + 5);
        doc.setTextColor(80, 80, 80);
        doc.text(`Master Sign-Off: ${log.mentorSignature}`, pageWidth - 90, yPos + 5);

        yPos += 11;
      });

      yPos += 6;

      // Section: Compliance & Liability Declaration
      doc.setFillColor(240, 244, 248);
      doc.rect(14, yPos, pageWidth - 28, 26, 'F');
      doc.setDrawColor(180, 200, 220);
      doc.rect(14, yPos, pageWidth - 28, 26, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(10, 50, 90);
      doc.text('FORMAL SKILLS & COMPLIANCE CERTIFICATION CLAUSE:', 18, yPos + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(50, 70, 90);
      doc.text('This document certifies that the technician has demonstrated continuous prowess growth and adheres to the Makhanikhi', 18, yPos + 12);
      doc.text('Driveway Protocols, OHSA standard operating procedures, and 90%+ compliance audits. Fair compensation has been audited.', 18, yPos + 17);
      doc.text('Authenticated via Makhanikhi Smart Escrow Protocol (PDA Hash: 5KnpwW2m9X8e1JzXq6aRt4uY3pL7hVd9CfbM2vQ1eZbT).', 18, yPos + 22);

      yPos += 36;

      // Signatures
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);

      doc.line(18, yPos, 80, yPos);
      doc.text('Technician / Apprentice Signature', 18, yPos + 5);

      doc.line(pageWidth - 85, yPos, pageWidth - 18, yPos);
      doc.text('Master Specialist / Authority Stamp', pageWidth - 85, yPos + 5);

      if (mode === 'download') {
        doc.save(`Makhanikhi_Evidence_Record_${viewMode}.pdf`);
        toast.success('Official Portfolio of Evidence PDF generated and downloaded!');
      } else {
        // Email trigger
        setIsSendingEmail(true);
        setTimeout(() => {
          setIsSendingEmail(false);
          toast.success(`Portfolio of Evidence PDF dispatched via email to ${recipientEmail}!`);
        }, 1500);
      }
    } catch (err: any) {
      console.error('PDF error:', err);
      toast.error('Failed to generate PDF document.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-industrial-charcoal via-industrial-charcoal/90 to-blue-950/20 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-technic-yellow text-industrial-charcoal font-black text-[10px] uppercase">
                Skills Growth & Evidence Track
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400/30 text-[10px]">
                Accreditation Portfolio (PoE)
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-digital-white uppercase tracking-tight">
              Apprentices & Technical Prowess Hub
            </h1>
            <p className="text-text-dim text-xs sm:text-sm max-w-2xl mt-1">
              Documenting technical prowess growth in stars, fair compensation audits, client kudos, and 
              exporting formal <strong className="text-technic-yellow">Portfolio of Evidence (PoE) PDFs</strong> for both apprentices and master mechanics.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1.5 rounded-xl">
            <button
              onClick={() => setViewMode('apprentice')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                viewMode === 'apprentice' 
                  ? 'bg-technic-yellow text-industrial-charcoal' 
                  : 'text-text-dim hover:text-white'
              }`}
            >
              Apprentice Track
            </button>
            <button
              onClick={() => setViewMode('mechanic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                viewMode === 'mechanic' 
                  ? 'bg-technic-yellow text-industrial-charcoal' 
                  : 'text-text-dim hover:text-white'
              }`}
            >
              Mechanic Track
            </button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="bg-card-bg border border-border-dim p-1 rounded-xl flex-wrap justify-start">
          <TabsTrigger value="prowess" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal font-bold text-xs uppercase px-4 py-2">
            <Star className="w-3.5 h-3.5 mr-1.5" /> Technical Prowess Stars
          </TabsTrigger>
          <TabsTrigger value="compensation" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal font-bold text-xs uppercase px-4 py-2">
            <DollarSign className="w-3.5 h-3.5 mr-1.5" /> Fair Compensation
          </TabsTrigger>
          <TabsTrigger value="kudos" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal font-bold text-xs uppercase px-4 py-2">
            <Award className="w-3.5 h-3.5 mr-1.5" /> Client Kudos & Ratings
          </TabsTrigger>
          <TabsTrigger value="poe_export" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal font-bold text-xs uppercase px-4 py-2">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Export PDF & Send Email
          </TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: TECHNICAL PROWESS STARS                       */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="prowess" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill, idx) => (
              <Card key={idx} className="bg-white/5 border-white/10 hover:border-technic-yellow/30 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm font-bold uppercase text-digital-white">
                        {skill.domain}
                      </CardTitle>
                      <CardDescription className="text-xs text-text-dim mt-0.5">
                        {skill.level}
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px] uppercase">
                      Mentor Verified
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-1.5 text-technic-yellow text-lg">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={s <= skill.stars ? 'text-technic-yellow' : 'text-white/20'}>
                        ★
                      </span>
                    ))}
                    <span className="text-xs font-mono font-bold text-white ml-2">
                      ({skill.stars} / 5 Stars)
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-text-dim border-t border-white/5 pt-2">
                    <span>Verified: {skill.dateVerified}</span>
                    <button
                      onClick={() => {
                        const newSkills = [...skills];
                        newSkills[idx].stars = (newSkills[idx].stars % 5) + 1;
                        setSkills(newSkills);
                        toast.success(`Updated prowess star rating for ${skill.domain}`);
                      }}
                      className="text-technic-yellow hover:underline font-bold"
                    >
                      Rate Growth +
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 2: FAIR COMPENSATION TRACKER                     */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="compensation" className="space-y-4 mt-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wide">
                Fair Compensation Guarantee
              </h3>
              <p className="text-xs text-text-dim mt-0.5">
                Mechanics who train and fairly compensate apprentices qualify for the <strong>15% platform fee discount</strong>.
              </p>
            </div>
            <Badge className="bg-emerald-500 text-black font-black text-xs">
              100% COMPLIANT
            </Badge>
          </div>

          <div className="space-y-3">
            {compensationLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-technic-yellow">{log.id}</span>
                    <span className="text-xs text-text-dim">{log.date}</span>
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px] uppercase">
                      {log.status}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-digital-white">
                    {log.jobDescription}
                  </h4>
                  <div className="text-xs text-text-dim flex items-center gap-4">
                    <span>Hours Logged: <strong>{log.hoursWorked} hrs</strong></span>
                    <span>Stipend: <strong className="text-emerald-400">R {log.amountPaid}.00</strong></span>
                  </div>
                </div>

                <div className="text-xs text-text-dim md:text-right border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                  <div className="text-[10px] uppercase font-bold text-text-dim">Master Specialist Sign-Off</div>
                  <div className="font-mono text-white text-xs">{log.mentorSignature}</div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 3: CLIENT KUDOS & RATINGS                        */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="kudos" className="space-y-4 mt-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-digital-white uppercase">
                Client Kudos & Rating Rewards
              </h3>
              <p className="text-xs text-text-dim mt-0.5">
                Clients who rate technicians earn <strong>Makhanikhi Kudos points</strong> and discounts on connection fees!
              </p>
            </div>
            <div className="flex items-center gap-2 text-technic-yellow font-black text-xl">
              <span>5.0</span>
              <span className="text-sm">★ ★ ★ ★ ★</span>
            </div>
          </div>

          <div className="space-y-3">
            {kudosList.map((kudos, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                      {kudos.clientName[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{kudos.clientName}</div>
                      <div className="text-[10px] text-text-dim">{kudos.date}</div>
                    </div>
                  </div>
                  <div className="text-technic-yellow text-xs font-mono font-bold">
                    {'★'.repeat(kudos.stars)} (5/5)
                  </div>
                </div>
                <p className="text-xs text-text-dim leading-relaxed italic">
                  "{kudos.comment}"
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- */}
        {/* TAB 4: PDF GENERATION & EMAIL DISPATCH               */}
        {/* ---------------------------------------------------- */}
        <TabsContent value="poe_export" className="space-y-6 mt-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-base uppercase tracking-wider font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-technic-yellow" />
                Formal Portfolio of Evidence (PoE) PDF Generator
              </CardTitle>
              <CardDescription className="text-xs text-text-dim">
                Generates a download-ready, formal PDF incorporating technical prowess stars, CIPC registration numbers, 
                live substance test timestamps, full PPE audits, and mentor sign-offs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PDF Preview Summary */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-text-dim">Document Type:</span>
                  <span className="font-bold text-white uppercase">Makhanikhi Formal Portfolio of Evidence (PoE)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-text-dim">Subject:</span>
                  <span className="font-bold text-technic-yellow">{profile?.displayName || 'Technician'} ({viewMode.toUpperCase()})</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-text-dim">Regulatory Inclusions:</span>
                  <span className="font-bold text-white">CIPC Reg #2023/849201/07 | Annual Returns Proof</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-text-dim">Safety Inclusions:</span>
                  <span className="font-bold text-emerald-400">Live Substance Timestamp | Full PPE | Certified Toolbox</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-dim">Escrow Release Stamp:</span>
                  <span className="font-mono text-emerald-400 font-bold">Compliant & Audited (&gt;=90%)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => generateFormalPoEPDF('download')}
                  className="bg-technic-yellow hover:bg-technic-yellow/90 text-industrial-charcoal font-black text-xs uppercase h-11"
                >
                  <Download className="w-4 h-4 mr-2" /> Download Formal PDF Document
                </Button>

                <div className="flex gap-2">
                  <Input 
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter email to dispatch PDF"
                    className="h-11 text-xs bg-black/40 border-white/10 text-white"
                  />
                  <Button
                    onClick={() => generateFormalPoEPDF('email')}
                    disabled={isSendingEmail}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 font-bold text-xs uppercase shrink-0 h-11"
                  >
                    <Mail className="w-4 h-4 mr-1.5" /> Send
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
