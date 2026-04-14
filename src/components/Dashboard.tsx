import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Link } from 'react-router-dom';
import { Wrench, Car, ClipboardCheck, History, TrendingUp, UserCheck, AlertTriangle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { VehicleLogBook } from './VehicleLogBook';
import { SpecialistProfile } from './SpecialistProfile';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const isSpecialist = profile?.role === 'specialist' || profile?.role === 'apprentice';

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
        <div className="flex gap-2">
          <div className="bento-badge">
            {profile?.role?.toUpperCase()}
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

      <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
        <TabsList className="bg-card-bg border border-border-dim p-1 rounded-xl h-auto flex-wrap justify-start">
          <TabsTrigger value="overview" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
            <TrendingUp className="w-4 h-4 mr-2" /> OVERVIEW
          </TabsTrigger>
          <TabsTrigger value="jobs" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
            <Wrench className="w-4 h-4 mr-2" /> {isSpecialist ? 'ACTIVE JOBS' : 'MY REQUESTS'}
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
            <Car className="w-4 h-4 mr-2" /> {isSpecialist ? 'FLEET RECORDS' : 'MY GARAGE'}
          </TabsTrigger>
          <TabsTrigger value="safety" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2.5 font-bold transition-all text-xs tracking-widest uppercase">
            <ClipboardCheck className="w-4 h-4 mr-2" /> SAFETY
          </TabsTrigger>
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
              <div className="bento-grid">
                {/* Active Request Card (Span 2x2) */}
                <div className="bento-card col-span-1 md:col-span-2 row-span-2">
                  <div className="bento-card-title"><div className="bento-dot"></div>Active Service Request</div>
                  <div className="bento-badge">Major Engine Overhaul</div>
                  <h2 className="text-3xl font-display font-black mb-2">BMW 320i (G20)</h2>
                  <p className="bento-status">● Specialist En Route (ETA 12 Mins)</p>
                  
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-technic-yellow flex items-center justify-center font-bold">TM</div>
                      <div>
                        <h4 className="text-sm font-bold">Thabo Mokoena <span className="text-success-green">✓ Verified</span></h4>
                        <p className="text-[11px] text-text-dim">Master Specialist • 12 Years Exp.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/20">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center font-bold text-text-dim">NK</div>
                      <div>
                        <h4 className="text-sm font-bold">Neo Khumalo</h4>
                        <p className="text-[11px] text-text-dim">Apprentice • Skills Transfer Program</p>
                      </div>
                    </div>
                  </div>

                  <Button className="bento-btn mt-auto">View Smart Contract Details</Button>
                </div>

                {/* Safety Checklist (Span 1x2) */}
                <div className="bento-card col-span-1 md:col-span-1 row-span-2">
                  <div className="bento-card-title">Pre-Work Safety Protocol</div>
                  <ul className="space-y-3">
                    {[
                      { text: "Visual PPE Inspection", checked: true },
                      { text: "Barricading & Danger Tape", checked: true },
                      { text: "Oil Spill Mats Deployed", checked: true },
                      { text: "Toolbox Inventory", checked: true },
                      { text: "Site Clearance (Pets/Children)", checked: false },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-[13px]">
                        <div className={`w-[18px] h-[18px] border border-white/20 rounded-[4px] flex items-center justify-center text-[12px] ${item.checked ? 'bg-success-green border-success-green text-industrial-charcoal' : ''}`}>
                          {item.checked ? '✓' : ''}
                        </div>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                  <div className="bento-danger-warning mt-6">
                    <AlertTriangle className="w-4 h-4" /> IF HAZARD DETECTED: WORK STOPS IMMEDIATELY
                  </div>
                  <p className="text-[11px] text-text-dim mt-4">
                    The apprentice handles digital documentation and site safety monitoring during labor.
                  </p>
                </div>

                {/* Financial Summary (Span 1x1) */}
                <div className="bento-card col-span-1">
                  <div className="bento-card-title">Live Quote & Billing</div>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between"><span>Diagnostics Fee</span> <span>R 450.00</span></div>
                    <div className="flex justify-between"><span>Call-out Fee</span> <span>R 250.00</span></div>
                    <div className="flex justify-between"><span>Consumables Dep.</span> <span>R 1,200.00</span></div>
                    <div className="border-t border-white/10 pt-2 mt-2 font-bold text-lg text-technic-yellow">
                      Total: R 1,900.00
                    </div>
                  </div>
                  <p className="text-[10px] text-text-dim mt-3">Payment gateway secured via Yellow Beast R&D.</p>
                </div>

                {/* Regional Stats (Span 1x1) */}
                <div className="bento-card col-span-1">
                  <div className="bento-card-title">Regional Insights</div>
                  <div className="text-2xl font-bold">Alternators</div>
                  <div className="text-[12px] text-text-dim">Most failed part in Gauteng (Central)</div>
                  <div className="h-10 bg-white/10 rounded-[4px] mt-3 relative overflow-hidden">
                    <div className="h-full bg-technic-yellow w-[72%]" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-digital-white">72% Freq.</span>
                  </div>
                </div>

                {/* Car Logbook (Span 2x1) */}
                <div className="bento-card col-span-1 md:col-span-2">
                  <div className="bento-card-title">Digital Vehicle Logbook</div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bento-log-entry">
                      <div className="bento-log-date">14 Mar 2023</div>
                      <div className="bento-log-task">Brake Pad Replacement (Front)</div>
                    </div>
                    <div className="bento-log-entry">
                      <div className="bento-log-date">02 Jan 2023</div>
                      <div className="bento-log-task">Minor Service - Synthetic Oil</div>
                    </div>
                  </div>
                </div>

                {/* Trust & Verification (Span 1x1) */}
                <div className="bento-card col-span-1">
                  <div className="bento-card-title"><div className="bento-dot"></div> Verification Status</div>
                  {profile?.isVerified ? (
                    <div className="flex flex-col items-center justify-center h-full py-4">
                      <div className="w-12 h-12 bg-success-green/20 rounded-full flex items-center justify-center mb-2">
                        <Shield className="w-6 h-6 text-success-green" />
                      </div>
                      <div className="text-xl font-display font-black uppercase text-success-green">Verified</div>
                      <p className="text-[10px] text-text-dim mt-1">Identity & Certs Confirmed</p>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full">
                      <div className="text-2xl font-display font-black uppercase mb-1">
                        {profile?.verificationStatus === 'pending' ? 'Pending' : 'Unverified'}
                      </div>
                      <p className="text-[11px] text-text-dim mb-4">
                        {profile?.verificationStatus === 'pending' 
                          ? 'Our team is reviewing your documents.' 
                          : 'Identity, Certs & Experience verification required.'}
                      </p>
                      {profile?.verificationStatus !== 'pending' && (
                        <Link to="/verify" className="mt-auto">
                          <Button className="bento-btn">Start Verification</Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* History (Span 1x1) */}
                <div className="bento-card col-span-1">
                  <div className="bento-card-title">Record Keeping</div>
                  <p className="text-[13px] leading-snug">
                    Secure invoicing for all parts replaced. High-resolution photo evidence available in archives.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="jobs" className="mt-0">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle>Active Service Requests</CardTitle>
                  <CardDescription>Track your ongoing maintenance and upcoming call-outs.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
                    <Wrench className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <p className="text-digital-white/40 font-bold">No active jobs found.</p>
                    <Link to="/book">
                      <Button className="mt-4 bg-technic-yellow text-industrial-charcoal font-bold">Request New Service</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vehicles" className="mt-0">
               <VehicleLogBook />
            </TabsContent>

            <TabsContent value="safety" className="mt-0 space-y-6">
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
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-technic-yellow" />
                        <span className="text-sm font-medium">{item}</span>
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
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};
