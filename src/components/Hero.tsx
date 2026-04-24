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
        <img 
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop" 
          alt="Workshop" 
          className="absolute inset-0 w-full h-full object-cover faded-img opacity-20 pointer-events-none"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-8">
              <img src="/Makhanikhi_logo_launch.png" alt="Makhanikhi Logo" className="h-32 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,210,0,0.3)]" referrerPolicy="no-referrer" />
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-technic-yellow/10 border border-technic-yellow/20 text-technic-yellow text-[10px] font-bold uppercase tracking-widest mb-6">
              <img src="/yellow beast.jpg" alt="Yellow Beast" className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" /> Powered by Yellow Beast R&D & Venture Studio
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-6 leading-[0.9] text-white">
              <span className="text-technic-yellow">THE DIGITAL</span> <br />
              <span className="bg-gradient-to-r from-technic-yellow to-white bg-clip-text text-transparent">WRENCH</span> FOR THE <br />
              <span className="text-technic-yellow">MODERN AGE</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-digital-white/80 mb-10">
              Eliminating the friction of traditional car service. Specialist mobile mechanics, 
              apprentice skills transfer, and transparent digital record keeping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-technic-yellow text-industrial-charcoal hover:bg-technic-yellow/90 font-black h-14 px-8 text-lg rounded-xl w-full sm:w-auto shadow-[0_0_20px_rgba(255,210,0,0.2)]">
                  LOGIN / SIGN IN <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5 font-bold h-14 px-8 text-lg rounded-xl w-full sm:w-auto">
                  REGISTER NOW
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-32 p-12 rounded-[40px] bg-white/[0.02] border border-white/5 relative group"
          >
            <div className="absolute top-0 right-0 p-8">
              <Wrench className="w-24 h-24 text-technic-yellow/5 group-hover:text-technic-yellow/10 transition-colors" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
              <div>
                <span className="text-technic-yellow font-black uppercase text-xs tracking-[4px] mb-4 block">Specialist Network</span>
                <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter mb-6 leading-none">
                  ARE YOU A <span className="text-technic-yellow">SPECIALIST</span> OR <span className="text-technic-yellow">APPRENTICE?</span>
                </h2>
                <p className="text-digital-white/60 mb-8 text-lg">
                  Join Polokwane's premier mobile workshop ecosystem. Digitise your track record, manage fleet logs, and mentor the next generation of technicians.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                    <Shield className="w-4 h-4 text-technic-yellow" /> Certified Route
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest">
                    <Users className="w-4 h-4 text-technic-yellow" /> Skills Transfer
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Link to="/register" className="block">
                  <div className="bento-card hover:border-technic-yellow/40 transition-all cursor-pointer group">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-black uppercase tracking-tight text-xl">Apply as Specialist</h4>
                        <p className="text-xs text-text-dim mt-1">For master technicians with proven track records.</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-technic-yellow group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
                <Link to="/register" className="block">
                  <div className="bento-card hover:border-technic-yellow/40 transition-all cursor-pointer group">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-black uppercase tracking-tight text-xl">Join as Apprentice</h4>
                        <p className="text-xs text-text-dim mt-1">For early-career mechanics looking for validated XP.</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-technic-yellow group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </div>
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
