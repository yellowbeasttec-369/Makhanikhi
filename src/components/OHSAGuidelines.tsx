import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shield, CheckCircle2, AlertTriangle, Info, HardHat, Construction, Flame, Thermometer } from 'lucide-react';
import { motion } from 'motion/react';

export const OHSAGuidelines: React.FC = () => {
  const guidelines = [
    {
      title: "Workshop Setup & Demarcation",
      icon: <Construction className="w-5 h-5 text-technic-yellow" />,
      items: [
        "A minimum of 6 safety cones (or sand-filled bottles) must be placed around the vehicle perimeter.",
        "Yellow danger tape must be strung between cones to create a visible physical barrier.",
        "Ensure the work area is level and stable for jacking operations.",
        "Ensure adequate lighting (minimum 300 lux) for the task area.",
        "Place 'Work in Progress' signage clearly at all entry points."
      ]
    },
    {
      title: "Personal Protective Equipment (PPE)",
      icon: <HardHat className="w-5 h-5 text-technic-yellow" />,
      items: [
        "Steel-toed safety boots must be worn at all times.",
        "Safety goggles or face shields required for grinding, drilling, or fluid handling.",
        "Nitrile gloves for chemical/oil handling; heavy-duty gloves for mechanical work.",
        "High-visibility vest must be worn during roadside or open-area servicing."
      ]
    },
    {
      title: "Fire & Chemical Safety",
      icon: <Flame className="w-5 h-5 text-technic-yellow" />,
      items: [
        "A certified 4.5kg DCP fire extinguisher must be within 3 meters of the work area.",
        "Use oil spill mats or drip trays under all fluid drainage points.",
        "Store flammable chemicals in sealed, labeled containers away from heat sources.",
        "Ensure a basic First Aid kit is accessible and fully stocked."
      ]
    },
    {
      title: "Tool & Equipment Integrity",
      icon: <Shield className="w-5 h-5 text-technic-yellow" />,
      items: [
        "Inspect all hydraulic jacks and jack stands for leaks or structural damage before use.",
        "Always use secondary support (jack stands); never rely solely on a hydraulic jack.",
        "Check power tool cords for fraying or exposed wiring.",
        "Ensure all tools are cleaned and accounted for after each task."
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bento-card bg-technic-yellow/5 border-technic-yellow/20">
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-technic-yellow rounded-2xl">
            <Shield className="w-6 h-6 text-industrial-charcoal" />
          </div>
          <div>
            <h2 className="text-xl font-display font-black uppercase tracking-tight">OHSA Standard Operating Procedure</h2>
            <p className="text-xs text-text-dim uppercase tracking-widest font-bold mt-1">Mobile Workshop Compliance v2.4</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guidelines.map((section, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <CheckCircle2 className="w-3.5 h-3.5 text-technic-yellow shrink-0 mt-0.5" />
                      <span className="text-xs text-digital-white/80 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
        <div>
          <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">Mandatory Compliance Notice</p>
          <p className="text-xs text-digital-white/60 mt-1">
            Failure to adhere to these OHSA guidelines may result in immediate suspension of the specialist's license and voiding of the smart contract insurance coverage.
          </p>
        </div>
      </div>
    </div>
  );
};
