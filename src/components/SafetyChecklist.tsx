import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Shield, AlertTriangle, Info } from 'lucide-react';

interface SafetyChecklistProps {
  type: 'pre' | 'post';
  onComplete: (data: any) => void;
}

export const SafetyChecklist: React.FC<SafetyChecklistProps> = ({ type, onComplete }) => {
  const items = type === 'pre' ? [
    { id: 'ppe', label: 'Visual Inspection of PPE (Safety boots, gloves, eye protection)' },
    { id: 'barricade', label: 'Area barricaded with danger tape and cones' },
    { id: 'toolbox', label: 'Toolbox check completed (All tools accounted for)' },
    { id: 'mats', label: 'Oil spill mats properly placed under vehicle' },
    { id: 'stability', label: 'Vehicle stability confirmed (Jack stands/chocks)' },
    { id: 'announcement', label: 'Site safety announcement made to residents/owner' }
  ] : [
    { id: 'clearance', label: 'Site cleared of all tools and equipment' },
    { id: 'waste', label: 'Hazardous waste (oil/parts) properly contained' },
    { id: 'inspection', label: 'Final visual inspection of the work area' },
    { id: 'owner_signoff', label: 'Owner inspection of the site safety state' }
  ];

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-technic-yellow">
          <Shield className="w-5 h-5" /> {type === 'pre' ? 'PRE-WORK' : 'POST-WORK'} SAFETY CHECKLIST
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400 font-bold uppercase tracking-tight">
            Mandatory safety protocol. Work cannot {type === 'pre' ? 'commence' : 'be finalized'} until all items are verified.
          </p>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Checkbox id={item.id} className="mt-1 border-white/30 data-[state=checked]:bg-technic-yellow data-[state=checked]:text-industrial-charcoal" />
              <Label htmlFor={item.id} className="text-sm leading-tight cursor-pointer">
                {item.label}
              </Label>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-400 italic">
            {type === 'pre' 
              ? "If a child or pet approaches the site, work must stop immediately and an announcement made to clear the site."
              : "Ensure all removed parts are documented and shown to the owner before disposal/removal."}
          </p>
        </div>

        <Button className="w-full bg-technic-yellow text-industrial-charcoal font-black">
          VERIFY & {type === 'pre' ? 'START WORK' : 'FINALIZE JOB'}
        </Button>
      </CardContent>
    </Card>
  );
};
