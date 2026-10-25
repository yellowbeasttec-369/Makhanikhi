import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ClipboardCheck, FileText, ShieldCheck, Wrench, CarFront, CircleDollarSign } from 'lucide-react';

const steps = [
  { number: '01', title: 'Describe the vehicle need', detail: 'A vehicle owner describes a symptom or the work they need and selects a suitable service category.', icon: CarFront },
  { number: '02', title: 'Review the specialist and quote', detail: 'The owner reviews the proposed service, call-out or inspection fee, parts estimate and labour quote before approving work.', icon: FileText },
  { number: '03', title: 'Agree before extra work', detail: 'If inspection reveals another issue, the specialist shares an updated estimate and waits for the customer to approve it.', icon: ClipboardCheck },
  { number: '04', title: 'Record completion and maintenance', detail: 'The parties can retain an agreed record of work performed, parts used and handover details for future reference.', icon: ShieldCheck },
];

export const PublicDemo: React.FC = () => (
  <main className="min-h-screen bg-industrial-charcoal px-4 py-10 text-white sm:px-6 sm:py-16">
    <div className="mx-auto max-w-5xl">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-technic-yellow hover:underline"><ArrowLeft className="h-4 w-4" /> Back to Makhanikhi</Link>
      <div className="mt-8 flex items-center gap-4"><img src="/Makhanikhi_logo_launch.png" alt="Makhanikhi logo" className="h-16 w-auto" /><div><p className="text-xs font-black uppercase tracking-[.2em] text-technic-yellow">Guided product preview</p><h1 className="mt-1 text-3xl font-black sm:text-5xl">A clearer repair journey</h1></div></div>
      <p className="mt-5 max-w-3xl text-base leading-8 text-white/65">This sample shows the type of workflow Makhanikhi is exploring. It does not create a real booking, contact a mechanic, run a live diagnostic, verify a repair or move money.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {steps.map(({ number, title, detail, icon: Icon }) => <article key={number} className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><div className="flex items-center justify-between"><span className="text-sm font-black text-technic-yellow">{number} / SAMPLE FLOW</span><Icon className="h-6 w-6 text-technic-yellow" /></div><h2 className="mt-5 text-xl font-black">{title}</h2><p className="mt-3 text-sm leading-7 text-white/65">{detail}</p></article>)}
      </div>
      <div className="mt-8 rounded-2xl border border-technic-yellow/20 bg-technic-yellow/[.05] p-6">
        <div className="flex items-start gap-4"><div className="rounded-xl bg-technic-yellow/10 p-3"><CircleDollarSign className="h-6 w-6 text-technic-yellow" /></div><div><h2 className="text-xl font-black">Fairness matters</h2><p className="mt-2 text-sm leading-7 text-white/65">The product is being shaped around clear fees, approval before additional work, fair treatment of specialists and better records for vehicle owners. Payment protection and live integrations should only be described as available once implemented and tested.</p></div></div>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/#interest" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-technic-yellow px-6 py-3 font-black text-industrial-charcoal">Tell us what you need <ArrowRight className="h-5 w-5" /></Link><Link to="/login" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-6 py-3 font-bold">Existing user sign-in</Link></div>
      <p className="mt-8 text-xs text-white/35">Illustrative sample journey only. No live transaction or customer data is used here.</p>
    </div>
  </main>
);
