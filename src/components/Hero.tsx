import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Wrench, Shield, Zap, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

export const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-32">
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
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-technic-yellow/10 border border-technic-yellow/20 text-technic-yellow text-[10px] font-black uppercase tracking-widest mb-6">
              <Wrench className="w-3.5 h-3.5" /> Driveway Mechanics Registry
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter mb-6 leading-[0.9] text-white uppercase italic">
              Simple <span className="text-technic-yellow">Driveway</span> <br />
              Repairs & Trust.
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-digital-white/80 mb-10 leading-relaxed px-2">
              Keep your out-of-motor-plan car, bakkie, or compact workhorse in perfect order. Makhanikhi brings direct engineering standards and transparent audit trails directly to your driveway in Polokwane, Seshego, and Mmotong.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0">
              <Link to="/login?role=owner">
                <Button size="lg" className="bg-technic-yellow text-industrial-charcoal hover:bg-technic-yellow/90 font-black h-16 px-10 text-lg rounded-2xl w-full sm:w-auto shadow-[0_0_40px_rgba(255,210,0,0.2)] uppercase tracking-tight">
                  Book a Repair <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </Link>
              <Link to="/login?role=pro">
                <Button size="lg" variant="outline" className="bg-white/5 border-white/10 hover:bg-white hover:text-industrial-charcoal font-black h-16 px-10 text-lg rounded-2xl w-full sm:w-auto uppercase text-white transition-all tracking-tight">
                  Enter Technical Gate
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              {['Out-of-Warranty Rangers & NP200s', 'Township Built', 'Verified Local Hands'].map((tag) => (
                <div key={tag} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/80">
                  <CheckCircle2 className="w-3 h-3 text-technic-yellow" /> {tag}
                </div>
              ))}
            </div>
          </motion.div>

          {/* The Six Core Operational Rules Showcase */}
          <div className="mt-12 sm:mt-24 text-left">
            <div className="border-b border-white/10 pb-4 mb-6 sm:mb-10">
              <p className="text-technic-yellow font-mono text-[10px] uppercase tracking-[4px] font-black">THE MAKHANIKHI PROTOCOL</p>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tighter mt-1">Our Six Rules of the Driveway</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* 1. OUT-OF-MOTOR-PLAN ACCORD */}
              <div className="bento-card bg-white/[0.01] border-white/5 p-5 sm:p-8 flex flex-col justify-between h-auto hover:border-technic-yellow/25 transition-colors">
                <div>
                  <div className="text-[10px] font-mono font-black text-technic-yellow tracking-wider uppercase mb-4">RULE 01 // APPROVED VEHICLES</div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-3">Out-of-Plan Cars</h3>
                  <p className="text-xs text-text-dim leading-relaxed mb-6">
                    Any sedan, hatchback, SUV, or compact bakkie that has run out of its official dealer service or motor plan is eligible! As long as you are willing to look after your vehicle, our specialists are ready to help.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-technic-yellow bg-technic-yellow/5 border border-technic-yellow/20 p-2.5 rounded-xl uppercase font-black">
                  Sedans, hatchbacks, SUVs & compact workhorses
                </div>
              </div>

              {/* 2. THE HOSPITALITY FIREWALL */}
              <div className="bento-card bg-white/[0.01] border-white/5 p-5 sm:p-8 flex flex-col justify-between h-auto hover:border-technic-yellow/25 transition-colors">
                <div>
                  <div className="text-[10px] font-mono font-black text-technic-yellow tracking-wider uppercase mb-4">RULE 02 // SHARED RESPECT</div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-3">Hospitality Firewall</h3>
                  <p className="text-xs text-text-dim leading-relaxed mb-6">
                    Sharing food, coffee, or a cold drink is a beautiful gesture of respect on the driveway. But remember, hospitality is a gift and <strong>never</strong> discounts or replaces the specialist's cash payment. It simply adds to your honor score.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-success-green bg-success-green/5 border border-success-green/20 p-2.5 rounded-xl uppercase font-black">
                  Protected Cash Pay + Reputation Points
                </div>
              </div>

              {/* 3. SAPS COMPLIANCE */}
              <div className="bento-card bg-white/[0.01] border-white/5 p-5 sm:p-8 flex flex-col justify-between h-auto hover:border-technic-yellow/25 transition-colors">
                <div>
                  <div className="text-[10px] font-mono font-black text-technic-yellow tracking-wider uppercase mb-4">RULE 03 // SPARES SECURITY</div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-3">Safe Spares Guarantee</h3>
                  <p className="text-xs text-text-dim leading-relaxed mb-6">
                    No stolen parts are allowed on our driveways. We protect everyone by logging receipts with valid details. For used parts, the specialist photographs the serial code so you have complete peace of mind.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-white/50 bg-white/5 border border-white/10 p-2.5 rounded-xl uppercase font-black">
                  SAPS Second-Hand Goods Protection
                </div>
              </div>

              {/* 4. CLIENT CO-PILOT OVERRIDE */}
              <div className="bento-card bg-white/[0.01] border-white/5 p-5 sm:p-8 flex flex-col justify-between h-auto hover:border-technic-yellow/25 transition-colors">
                <div>
                  <div className="text-[10px] font-mono font-black text-technic-yellow tracking-wider uppercase mb-4">RULE 04 // HELPING HAND</div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-3">Client Co-Pilot</h3>
                  <p className="text-xs text-text-dim leading-relaxed mb-6">
                    If an apprentice is busy at school or delayed, the job doesn't stop. You can step in as a visual safety co-pilot by taking direct walkaround photos or checking sand-bags on your phone to unlock an immediate 10% help-out rebate.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-blue-400 bg-blue-500/5 border border-blue-500/20 p-2.5 rounded-xl uppercase font-black">
                  Easy phone-guided checklists
                </div>
              </div>

              {/* 5. THE VOCATIONAL ELEVATION LADDER */}
              <div className="bento-card bg-white/[0.01] border-white/5 p-5 sm:p-8 flex flex-col justify-between h-auto hover:border-technic-yellow/25 transition-colors">
                <div>
                  <div className="text-[10px] font-mono font-black text-technic-yellow tracking-wider uppercase mb-4">RULE 05 // REAL LEARNING</div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-3">Vocational Growth</h3>
                  <p className="text-xs text-text-dim leading-relaxed mb-6">
                    This is about building proper careers, not a temporary gig-work trap. We log every practical repair onto a clean digital resume for our apprentice mechanics, while specialists earn mentoring points to unlock professional garage tools.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-technic-yellow bg-technic-yellow/5 border border-technic-yellow/20 p-2.5 rounded-xl uppercase font-black">
                  Proper resumes for apprentice mechanics
                </div>
              </div>

              {/* 6. PROOF-OF-PRESERVATION */}
              <div className="bento-card bg-white/[0.01] border-white/5 p-5 sm:p-8 flex flex-col justify-between h-auto hover:border-technic-yellow/25 transition-colors">
                <div>
                  <div className="text-[10px] font-mono font-black text-technic-yellow tracking-wider uppercase mb-4">RULE 06 // AIR & NATURE</div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-3">Green Repairs</h3>
                  <p className="text-xs text-text-dim leading-relaxed mb-6">
                    Replacing a small high-wear bearing instead of scraping an entire large gearbox prevents carbon and steel from polluting our air and soils. We write these green records straight to your car's lifetime logbook.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-success-green bg-success-green/5 border border-success-green/20 p-2.5 rounded-xl uppercase font-black">
                  Verified eco-friendly repair history
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-10 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
          >
            {[
              { icon: Shield, title: "VERIFIED HANDS", desc: "Every specialist master mechanic and apprentice is fully vetted on-site." },
              { icon: Users, title: "LADDER PROGRESSION", desc: "Practical hands-on learning logs verified on safe public ledgers." },
              { icon: CheckCircle2, title: "ZERO-SPILL CLEAN", desc: "No job is marked closed unless driveway site cleanliness is verified completely." }
            ].map((feature, i) => (
              <div key={i} className="bento-card text-left group p-5 sm:p-6">
                <div className="bento-card-title">
                  <div className="bento-dot"></div> {feature.title}
                </div>
                <feature.icon className="w-10 h-10 text-technic-yellow mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-display font-bold mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-text-dim text-xs leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
