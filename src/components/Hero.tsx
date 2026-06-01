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
              <img src="/yellow beast.jpg" alt="Yellow Beast" className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> Powered by Yellow Beast R&D & Venture Studio
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter mb-6 leading-[0.9] text-white uppercase italic">
              Simple <span className="text-technic-yellow">Driveway</span> <br />
              Repairs & Trust.
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-digital-white/80 mb-10 leading-relaxed px-2">
              Keep your bakkie or compact workhorse in perfect order. Makhanikhi brings direct engineering standards and transparent audit trails directly to your driveway in Polokwane, Seshego, and Mmotong.
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
          <div className="mt-32 text-left">
            <div className="border-b border-white/10 pb-4 mb-10">
              <p className="text-technic-yellow font-mono text-[10px] uppercase tracking-[4px] font-black">THE MAKHANIKHI PROTOCOL</p>
              <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tighter mt-1">Our Six Rules of the Driveway</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. THE 40/40/20 SPLIT */}
              <div className="bento-card bg-white/[0.01] border-white/5 p-8 flex flex-col justify-between h-auto hover:border-technic-yellow/25 transition-colors">
                <div>
                  <div className="text-[10px] font-mono font-black text-technic-yellow tracking-wider uppercase mb-4">RULE 01 // CO-OWNERSHIP</div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-3">The 40 / 40 / 20 Split</h3>
                  <p className="text-xs text-text-dim leading-relaxed mb-6">
                    Every job fee is divided directly to keep local mechanics and support teams thriving. 40% goes to <strong>The Hands</strong> (Specialist Labor), 40% goes to <strong>The Wheels</strong> (Bakkie upkeep & Apprentice support), and 20% goes to <strong>The System</strong> (tool pool & app upkeep).
                  </p>
                </div>
                <div className="text-[10px] font-mono text-technic-yellow bg-technic-yellow/5 border border-technic-yellow/20 p-2.5 rounded-xl uppercase font-black">
                  Solo master takes 80% with 100% logs
                </div>
              </div>

              {/* 2. THE HOSPITALITY FIREWALL */}
              <div className="bento-card bg-white/[0.01] border-white/5 p-8 flex flex-col justify-between h-auto hover:border-technic-yellow/25 transition-colors">
                <div>
                  <div className="text-[10px] font-mono font-black text-technic-yellow tracking-wider uppercase mb-4">RULE 02 // UBUNTU ACCORD</div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-3">Hospitality Firewall</h3>
                  <p className="text-xs text-text-dim leading-relaxed mb-6">
                    A meal, coffee, or cold drink offered by a kind client is treated as a cultural gift of respect. It <strong>never</strong> discounts or replaces the cash labor payment. Offering food is recorded as a <strong>Sustenance Stake</strong> to boost client dispatch priority.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-success-green bg-success-green/5 border border-success-green/20 p-2.5 rounded-xl uppercase font-black">
                  Protected cash pay + Sustenance Stake
                </div>
              </div>

              {/* 3. SAPS COMPLIANCE */}
              <div className="bento-card bg-white/[0.01] border-white/5 p-8 flex flex-col justify-between h-auto hover:border-technic-yellow/25 transition-colors">
                <div>
                  <div className="text-[10px] font-mono font-black text-technic-yellow tracking-wider uppercase mb-4">RULE 03 // GRC MANDATE</div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-3">SAPS Second-Hand Goods</h3>
                  <p className="text-xs text-text-dim leading-relaxed mb-6">
                    To keep backyard black markets out of our driveways, parts must be legal. The Apprentice scans official VAT supplier invoices. Reconditioned or secondhand units must have physical serial microdots pictured before the job progresses.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-white/50 bg-white/5 border border-white/10 p-2.5 rounded-xl uppercase font-black">
                  SAPS SHG Amendment Act 6 of 2009
                </div>
              </div>

              {/* 4. CLIENT CO-PILOT OVERRIDE */}
              <div className="bento-card bg-white/[0.01] border-white/5 p-8 flex flex-col justify-between h-auto hover:border-technic-yellow/25 transition-colors">
                <div>
                  <div className="text-[10px] font-mono font-black text-technic-yellow tracking-wider uppercase mb-4">RULE 04 // FLEXIBILITY</div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-3">Client Co-Pilot Mode</h3>
                  <p className="text-xs text-text-dim leading-relaxed mb-6">
                    If an Apprentice is studying or delayed, the master technical job does not stall. The client can step in as visual and safety co-pilot. For logging perimeter photos and sand-bottles, you receive an immediate 10% Co-Pilot rebate.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-blue-400 bg-blue-500/5 border border-blue-500/20 p-2.5 rounded-xl uppercase font-black">
                  Instant QR Apprentice Handoff
                </div>
              </div>

              {/* 5. THE VOCATIONAL ELEVATION LADDER */}
              <div className="bento-card bg-white/[0.01] border-white/5 p-8 flex flex-col justify-between h-auto hover:border-technic-yellow/25 transition-colors">
                <div>
                  <div className="text-[10px] font-mono font-black text-technic-yellow tracking-wider uppercase mb-4">RULE 05 // ELEVATION</div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-3">Vocational Ladder</h3>
                  <p className="text-xs text-text-dim leading-relaxed mb-6">
                    We are building a decentralized workspace, not a gig-work trap. Driveway repairs log logged tasks to a sovereign digital resume for the Apprentice. Specialists earn Legacy Wrench Points to unlock specialized tools from our central pool.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-technic-yellow bg-technic-yellow/5 border border-technic-yellow/20 p-2.5 rounded-xl uppercase font-black">
                  Mentoring & Professional Growth
                </div>
              </div>

              {/* 6. PROOF-OF-PRESERVATION */}
              <div className="bento-card bg-white/[0.01] border-white/5 p-8 flex flex-col justify-between h-auto hover:border-technic-yellow/25 transition-colors">
                <div>
                  <div className="text-[10px] font-mono font-black text-technic-yellow tracking-wider uppercase mb-4">RULE 06 // EARTH INTEGRITY</div>
                  <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-3">Preservation Math</h3>
                  <p className="text-xs text-text-dim leading-relaxed mb-6">
                    By repairing a 150g steel bearing instead of scrapping a 35kg gearbox sub-assembly, we save 34.85kg of premium steel and keep 64.47kg of raw CO₂ from entering the air. Logs mint as cNFTs on Solana and bridge to OYU Green.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-success-green bg-success-green/5 border border-success-green/20 p-2.5 rounded-xl uppercase font-black">
                  Verified avoided Scope 3 carbon
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Shield, title: "VERIFIED HANDS", desc: "Every specialist master mechanic and apprentice is fully vetted on-site." },
              { icon: Users, title: "LADDER PROGRESSION", desc: "Practical hands-on learning logs verified on safe public ledgers." },
              { icon: CheckCircle2, title: "ZERO-SPILL CLEAN", desc: "No job is marked closed unless driveway site cleanliness is verified completely." }
            ].map((feature, i) => (
              <div key={i} className="bento-card text-left group">
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
