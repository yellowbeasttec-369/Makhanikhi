import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FileText, Shield, Award, CheckCircle2, Clock, UserCheck, Briefcase, Plus, Loader2, PenTool } from 'lucide-react';
import { toast } from 'sonner';
import { WorkplaceReport, PortfolioOfEvidence, UserRole } from '../types';

export const SkillsValidation: React.FC = () => {
  const { user, profile } = useAuth();
  const [reports, setReports] = useState<WorkplaceReport[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioOfEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const reportsQ = query(collection(db, 'workplaceReports'), where('userId', '==', user.uid));
    const portfoliosQ = query(collection(db, 'portfolios'), where('userId', '==', user.uid));

    const unsubReports = onSnapshot(reportsQ, (snap) => {
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkplaceReport)));
    });

    const unsubPortfolios = onSnapshot(portfoliosQ, (snap) => {
      setPortfolios(snap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioOfEvidence)));
      setLoading(false);
    });

    return () => {
      unsubReports();
      unsubPortfolios();
    };
  }, [user]);

  const createReport = async () => {
    if (!user || !profile) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'workplaceReports'), {
        userId: user.uid,
        role: profile.role,
        periodStart: new Date().toISOString().split('T')[0],
        periodEnd: new Date().toISOString().split('T')[0],
        totalHours: 0,
        tasksCompleted: [],
        signatures: {},
        status: 'draft',
        createdAt: serverTimestamp()
      });
      toast.success("New workplace report draft created.");
    } catch (error) {
      toast.error("Failed to create report.");
    } finally {
      setSubmitting(false);
    }
  };

  const signReport = async (reportId: string, role: 'specialist' | 'skillsAuthority' | 'peerReviewer') => {
    if (!user || !profile) return;
    try {
      const reportRef = doc(db, 'workplaceReports', reportId);
      const signatureData: any = {
        uid: user.uid,
        timestamp: new Date().toISOString(),
      };

      if (role === 'skillsAuthority') signatureData.name = profile.displayName;
      if (role === 'peerReviewer') signatureData.industryId = "PR-" + Math.random().toString(36).substr(2, 9).toUpperCase();

      await updateDoc(reportRef, {
        [`signatures.${role}`]: signatureData
      });
      toast.success(`Signed as ${role.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    } catch (error) {
      toast.error("Failed to sign report.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">Skills & Validation</h2>
          <p className="text-text-dim text-sm">Validate your workplace experience and build your Portfolio of Evidence (PoE).</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createReport} disabled={submitting} className="bg-technic-yellow text-industrial-charcoal font-bold rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> NEW REPORT
          </Button>
        </div>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="reports" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2 uppercase font-bold text-[10px] tracking-widest">
            Workplace Reports
          </TabsTrigger>
          <TabsTrigger value="poe" className="data-[state=active]:bg-technic-yellow data-[state=active]:text-industrial-charcoal rounded-lg px-6 py-2 uppercase font-bold text-[10px] tracking-widest">
            Portfolio of Evidence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.id} className="bento-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="bento-card-title"><div className="bento-dot"></div> Report #{report.id.slice(0, 8)}</div>
                    <h3 className="text-lg font-display font-bold uppercase tracking-tight mt-1">
                      Workplace Experience: {report.periodStart} to {report.periodEnd}
                    </h3>
                  </div>
                  <Badge variant="outline" className="border-technic-yellow text-technic-yellow uppercase text-[10px]">
                    {report.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-text-dim uppercase font-bold mb-1">Total Hours</p>
                    <p className="text-xl font-display font-black">{report.totalHours} HRS</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-text-dim uppercase font-bold mb-1">Tasks Logged</p>
                    <p className="text-xl font-display font-black">{report.tasksCompleted.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-text-dim uppercase font-bold mb-1">Role</p>
                    <p className="text-xl font-display font-black uppercase">{report.role}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-technic-yellow">Required Signatures</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Specialist Signature */}
                    <div className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${report.signatures.specialist ? 'border-success-green bg-success-green/5' : 'border-white/10 bg-white/5'}`}>
                      {report.signatures.specialist ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-success-green mb-2" />
                          <p className="text-[10px] font-bold uppercase">Specialist Signed</p>
                          <p className="text-[9px] text-text-dim mt-1">{new Date(report.signatures.specialist.timestamp).toLocaleDateString()}</p>
                        </>
                      ) : (
                        <>
                          <PenTool className="w-8 h-8 text-white/20 mb-2" />
                          <p className="text-[10px] font-bold uppercase text-text-dim">Specialist Pending</p>
                          {profile?.role === 'specialist' && (
                            <Button size="sm" onClick={() => signReport(report.id, 'specialist')} className="mt-2 h-7 text-[9px] bg-technic-yellow text-industrial-charcoal">SIGN NOW</Button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Skills Authority (for Apprentices) */}
                    {report.role === 'apprentice' && (
                      <div className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${report.signatures.skillsAuthority ? 'border-success-green bg-success-green/5' : 'border-white/10 bg-white/5'}`}>
                        {report.signatures.skillsAuthority ? (
                          <>
                            <Shield className="w-8 h-8 text-success-green mb-2" />
                            <p className="text-[10px] font-bold uppercase">Skills Authority Signed</p>
                            <p className="text-[9px] text-text-dim mt-1">{report.signatures.skillsAuthority.name}</p>
                          </>
                        ) : (
                          <>
                            <Shield className="w-8 h-8 text-white/20 mb-2" />
                            <p className="text-[10px] font-bold uppercase text-text-dim">Skills Authority Pending</p>
                            {profile?.role === 'admin' && (
                              <Button size="sm" onClick={() => signReport(report.id, 'skillsAuthority')} className="mt-2 h-7 text-[9px] bg-technic-yellow text-industrial-charcoal">SIGN NOW</Button>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Peer Reviewer (for Specialists) */}
                    {report.role === 'specialist' && (
                      <div className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${report.signatures.peerReviewer ? 'border-success-green bg-success-green/5' : 'border-white/10 bg-white/5'}`}>
                        {report.signatures.peerReviewer ? (
                          <>
                            <UserCheck className="w-8 h-8 text-success-green mb-2" />
                            <p className="text-[10px] font-bold uppercase">Peer Review Validated</p>
                            <p className="text-[9px] text-text-dim mt-1">ID: {report.signatures.peerReviewer.industryId}</p>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-8 h-8 text-white/20 mb-2" />
                            <p className="text-[10px] font-bold uppercase text-text-dim">Peer Review Pending</p>
                            {profile?.role === 'specialist' && profile.uid !== report.userId && (
                              <Button size="sm" onClick={() => signReport(report.id, 'peerReviewer')} className="mt-2 h-7 text-[9px] bg-technic-yellow text-industrial-charcoal">VALIDATE PEER</Button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
              <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-text-dim font-bold">No workplace reports found.</p>
              <Button onClick={createReport} className="mt-4 bg-technic-yellow text-industrial-charcoal font-bold">Generate First Report</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="poe" className="space-y-4">
          <div className="bento-card">
            <div className="bento-card-title"><div className="bento-dot"></div> Portfolio of Evidence (PoE) for RPL</div>
            <h3 className="text-xl font-display font-black uppercase tracking-tight mb-4">Recognition of Prior Learning (RPL)</h3>
            <p className="text-sm text-text-dim mb-6">
              Compile your evidence of competence for formal recognition. This portfolio is reviewed by industry peers and skills authorities.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-technic-yellow/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-technic-yellow" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight">Engine Overhaul PoE</h4>
                    <p className="text-[10px] text-text-dim uppercase tracking-widest">3 Documents Attached • Last Updated 2 days ago</p>
                  </div>
                </div>
                <Badge className="bg-success-green/10 text-success-green border-success-green/20">VALIDATED</Badge>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-text-dim" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight">Diagnostic Systems PoE</h4>
                    <p className="text-[10px] text-text-dim uppercase tracking-widest">1 Document Attached • Draft</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-white/20 text-text-dim">DRAFT</Badge>
              </div>
            </div>

            <Button className="bento-btn mt-8 w-full">UPLOAD NEW EVIDENCE</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
