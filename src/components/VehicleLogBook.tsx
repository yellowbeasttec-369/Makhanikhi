import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { History, AlertCircle, TrendingDown, FileText } from 'lucide-react';
import { Button } from './ui/button';

export const VehicleLogBook: React.FC = () => {
  const serviceHistory = [
    { date: '2024-03-15', type: 'Minor Service', specialist: 'John M. (Master)', cost: 'R 2,450', mileage: '82,400 KM' },
    { date: '2023-09-10', type: 'Brake Pad Replacement', specialist: 'Sarah K. (Specialist)', cost: 'R 1,800', mileage: '75,200 KM' },
    { date: '2023-03-05', type: 'Major Service', specialist: 'John M. (Master)', cost: 'R 5,200', mileage: '68,000 KM' },
  ];

  const faults = [
    { id: 1, component: 'Brake System', description: 'Rear pads at 15% life remaining', severity: 'medium' },
    { id: 2, component: 'Cooling System', description: 'Slight seepage at radiator top hose', severity: 'low' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card">
          <div className="bento-card-title"><div className="bento-dot"></div> ACTIVE FAULTS & DIAGNOSTICS</div>
          <div className="space-y-4">
            {faults.map((fault) => (
              <div key={fault.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm">{fault.component}</h4>
                  <p className="text-xs text-text-dim">{fault.description}</p>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${fault.severity === 'high' ? 'bg-danger-red text-industrial-charcoal' : fault.severity === 'medium' ? 'bg-orange-500 text-industrial-charcoal' : 'bg-blue-500 text-industrial-charcoal'}`}>
                  {fault.severity.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bento-card">
          <div className="bento-card-title"><div className="bento-dot"></div> MAINTENANCE SPENDING</div>
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <p className="text-4xl font-display font-black">R 9,450</p>
              <p className="text-xs text-text-dim uppercase tracking-widest font-bold mt-2">Total 12-Month Investment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bento-card">
        <div className="flex flex-row items-center justify-between mb-4">
          <div className="bento-card-title"><div className="bento-dot"></div> SERVICE HISTORY LOG</div>
          <Button variant="outline" size="sm" className="border-white/10 text-xs rounded-xl">
            <FileText className="w-3 h-3 mr-2" /> EXPORT PDF
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest">Date</TableHead>
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest">Service Type</TableHead>
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest">Specialist</TableHead>
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest">Mileage</TableHead>
                <TableHead className="text-text-dim text-[11px] uppercase tracking-widest text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceHistory.map((record, i) => (
                <TableRow key={i} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-mono text-xs">{record.date}</TableCell>
                  <TableCell className="font-bold">{record.type}</TableCell>
                  <TableCell className="text-text-dim text-xs">{record.specialist}</TableCell>
                  <TableCell className="text-text-dim text-xs">{record.mileage}</TableCell>
                  <TableCell className="text-right font-bold text-technic-yellow">{record.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
