import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { FileText, Shield, Wrench, AlertCircle } from 'lucide-react';

interface QuoteInvoiceProps {
  data: {
    title: string;
    scopeOfWork: string[];
    safetyObligations: string[];
    paymentTerms: {
      callOutFee: number;
      diagnosticFee: number;
      laborEstimate: number;
      partsEstimate: number;
    };
    warrantyInfo: string;
    legalDisclaimer: string;
  };
  isInvoice?: boolean;
}

export const QuoteInvoice: React.FC<QuoteInvoiceProps> = ({ data, isInvoice = false }) => {
  const total = data.paymentTerms.callOutFee + 
                data.paymentTerms.diagnosticFee + 
                data.paymentTerms.laborEstimate + 
                data.paymentTerms.partsEstimate;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-display font-black uppercase tracking-tight text-technic-yellow">
            {isInvoice ? 'Tax Invoice' : 'Service Quote'}
          </h3>
          <p className="text-[10px] text-text-dim uppercase tracking-widest font-bold">
            Ref: MKH-{Math.floor(Math.random() * 10000)}
          </p>
        </div>
        <Badge variant="outline" className="border-technic-yellow text-technic-yellow">
          {isInvoice ? 'PROVISIONAL' : 'VALID FOR 7 DAYS'}
        </Badge>
      </div>

      <div className="space-y-4">
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-4 h-4 text-technic-yellow" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Scope of Work</h4>
          </div>
          <ul className="space-y-1.5 pl-6">
            {data.scopeOfWork.map((item, i) => (
              <li key={i} className="text-sm text-digital-white/80 list-disc">{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-success-green" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Safety & Compliance</h4>
          </div>
          <ul className="space-y-1.5 pl-6">
            {data.safetyObligations.map((item, i) => (
              <li key={i} className="text-sm text-digital-white/80 list-disc">{item}</li>
            ))}
          </ul>
        </section>

        <Separator className="bg-white/10" />

        <section className="bg-success-green/5 p-4 rounded-xl border border-success-green/20 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-success-green" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-success-green">Professional Transparency</h4>
          </div>
          <p className="text-[10px] text-text-dim leading-relaxed uppercase tracking-widest font-bold">
            Note: All parts costs are validated via real-time digital receipt capture. If a physical till slip is non-itemized, our registry cross-verifies the cost for total peace of mind.
          </p>
        </section>

        <section className="bg-black/20 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-technic-yellow" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Financial Summary</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-text-dim">Call-out Fee</span>
              <span>R {data.paymentTerms.callOutFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-dim">Diagnostics</span>
              <span>R {data.paymentTerms.diagnosticFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-dim">Labor Estimate</span>
              <span>R {data.paymentTerms.laborEstimate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-dim">Parts Estimate</span>
              <span>R {data.paymentTerms.partsEstimate.toFixed(2)}</span>
            </div>
            <Separator className="bg-white/10 my-2" />
            <div className="flex justify-between text-lg font-black text-technic-yellow uppercase">
              <span>Total Estimate</span>
              <span>R {total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        <section className="p-3 rounded-lg bg-technic-yellow/5 border border-technic-yellow/20">
          <p className="text-[11px] font-medium leading-relaxed italic text-digital-white/70">
            {data.warrantyInfo}
          </p>
        </section>

        <section className="flex gap-2 items-start opacity-50">
          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
          <p className="text-[9px] leading-tight">
            {data.legalDisclaimer}
          </p>
        </section>
      </div>
    </div>
  );
};
