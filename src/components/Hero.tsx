import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wrench, Shield, Zap, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden pt-16 pb-32">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-technic-yellow/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-technic-yellow/5 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-technic-yellow/10 border border-technic-yellow/20 text-technic-yellow text-xs font-bold uppercase tracking-widest mb-6">
              <Zap className="w-3 h-3" /> Powered by Yellow Beast R&D
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-6 leading-[0.9]">
              THE DIGITAL <br />
              <span className="text-technic-yellow">WRENCH</span> FOR THE <br />
              MODERN AGE
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-digital-white/60 mb-10">
              Eliminating the friction of traditional car service. Specialist mobile mechanics, 
              apprentice skills transfer, and transparent digital record keeping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/book">
                <Button size="lg" className="bg-technic-yellow text-industrial-charcoal hover:bg-technic-yellow/90 font-black h-14 px-8 text-lg rounded-xl w-full sm:w-auto">
                  BOOK A SPECIALIST <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/verify">
                <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5 font-bold h-14 px-8 text-lg rounded-xl w-full sm:w-auto">
                  JOIN AS MECHANIC
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Shield, title: "VERIFIED TALENT", desc: "Every specialist and apprentice is vetted for trust and expertise." },
              { icon: Users, title: "SKILLS TRANSFER", desc: "Master mechanics working with tech-savvy apprentices for the future." },
              { icon: CheckCircle2, title: "SAFETY FIRST", desc: "Rigorous pre-work checklists and site safety protocols." }
            ].map((feature, i) => (
              <div key={i} className="bento-card text-left group">
                <div className="bento-card-title">
                  <div className="bento-dot"></div> {feature.title}
                </div>
                <feature.icon className="w-10 h-10 text-technic-yellow mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-display font-bold mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-text-dim text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
