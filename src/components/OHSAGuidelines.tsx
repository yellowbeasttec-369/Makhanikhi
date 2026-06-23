import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shield, CheckCircle2, AlertTriangle, Info, HardHat, Construction, Flame, Thermometer } from 'lucide-react';
import { motion } from 'motion/react';

export const OHSAGuidelines: React.FC = () => {
  const guidelines = [
    {
      title: "1. Setting up a safe work area",
      icon: <Construction className="w-5 h-5 text-technic-yellow" />,
      items: [
        "Use safety cones (or bright sand-filled bottles) to clearly mark the work zone around the car.",
        "String high-visibility tape between the markers to keep bystanders and children at a safe distance.",
        "Put down clean floor mats under the vehicle to make sure no oil or fluids drip onto your driveway.",
        "Place a simple check-in sign clearly so neighbor folks know we are busy with professional work.",
        "Always park the car on level ground and lock it safely on jack-stands before starting any work underneath."
      ]
    },
    {
      title: "2. Protecting your car's body & engine",
      icon: <Shield className="w-5 h-5 text-technic-yellow" />,
      items: [
        "Do a quick camera scan around the car body before any tools touch it to prevent arguments.",
        "Use fender covers or soft clean cloths so that wrenches and keys do not scratch the paintwork.",
        "Document and photograph the parts removed as well as new ones going in for your vehicle logbook.",
        "Place oily cloths and dirty cardboard straight into waste bags so we leave the workspace cleaner than we found it."
      ]
    },
    {
      title: "3. Staying Safe with the Right Gear",
      icon: <HardHat className="w-5 h-5 text-technic-yellow" />,
      items: [
        "Heavy-duty boots should be worn to protect toes from dropped tools.",
        "Safety goggles must be used when drilling, grinding, or handling strong fluids.",
        "Wear nitrile gloves when handling oil or chemicals, and heavy work gloves for heavy lifting.",
        "Wear a bright, high-visibility vest if doing any work near a street or open roadside."
      ]
    },
    {
      title: "4. Fire & Fuel Safety",
      icon: <Flame className="w-5 h-5 text-technic-yellow" />,
      items: [
        "Keep a reliable, fully working fire extinguisher close by at all times during a job.",
        "Always place a deep drip tray under fluid drain plugs to catch every drop of waste oil.",
        "Keep flammable chemicals closed tightly in their original cans, far away from warm engines.",
        "Have a basic first aid kit completely ready and on-site for scratches or cuts."
      ]
    },
    {
      title: "5. Caring for Tools & Jacks",
      icon: <Shield className="w-5 h-5 text-technic-yellow" />,
      items: [
        "Check all jacks and jack-stands for any signs of leaks or wear before lifting the car.",
        "Never crawl under a vehicle that is only held up by a jack - heavy metal stands are mandatory.",
        "Inspect electrical cords on power tools for fraying or exposed wires before plugging in.",
        "Clean all tools, dry them, and place them back in their boxes after finishing the task."
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
            <h2 className="text-xl font-display font-black uppercase tracking-tight">Driveway Safety & General Care Rules</h2>
            <p className="text-xs text-text-dim uppercase tracking-widest font-bold mt-1">How we keep you, your car, and our mechanics completely safe</p>
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
          <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">Important Safety Notice</p>
          <p className="text-xs text-digital-white/60 mt-1">
            Setting up safety barriers and taking good care of the driveway is not optional. Mechanics who ignore these basic safety guidelines will be blocked from receiving new jobs.
          </p>
        </div>
      </div>
    </div>
  );
};
