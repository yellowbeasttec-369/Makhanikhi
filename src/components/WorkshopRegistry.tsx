import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Award, Users, ShieldCheck, Star, ArrowRight, User, Map as MapIcon, Grid, Paintbrush, Hammer, Settings, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for Leaflet default icon issues in React
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export const WorkshopRegistry: React.FC = () => {
  const [workshops, setWorkshops] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'specialist'),
          where('offersMentorship', '==', true)
        );
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => {
          const data = doc.data() as UserProfile;
          // Add random coordinates for demo if not present (centered around Limpopo)
          if (!data.latitude) {
            data.latitude = -23.8962 + (Math.random() - 0.5) * 0.5;
            data.longitude = 29.4486 + (Math.random() - 0.5) * 0.5;
          }
          return { uid: doc.id, ...data };
        });
        setWorkshops(results);
      } catch (error) {
        console.error("Error fetching workshop registry:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  const filteredWorkshops = workshops.filter(w => 
    w.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const comingSoonFeatures = [
    {
      title: "Autobody Repair",
      description: "Panel beating, structural repairs, and specialized spray painting.",
      icon: <Hammer className="w-6 h-6 text-blue-400" />,
      color: "blue"
    },
    {
      title: "Detailing & Valet",
      description: "Paint correction, ceramic coating, and deep interior restoration.",
      icon: <Paintbrush className="w-6 h-6 text-purple-400" />,
      color: "purple"
    },
    {
      title: "Performance Mods",
      description: "Accreditable modifications, remapping, and certified performance testing.",
      icon: <Settings className="w-6 h-6 text-orange-400" />,
      color: "orange"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-technic-yellow/10 border border-technic-yellow/20 text-technic-yellow text-[10px] font-bold uppercase tracking-widest mb-4">
            <Users className="w-3 h-3" /> Workshop Learning Network
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter mb-4 text-digital-white">
            The <span className="text-technic-yellow">Database</span> Registry
          </h1>
          <p className="text-text-dim max-w-2xl text-lg">
            Find center-grade expertise in your local neighborhood. We digitize Polokwane's best mobile specialists, giving them the professional documentation tools to deliver master repairs right at your home or office.
          </p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-technic-yellow text-industrial-charcoal shadow-lg' : 'text-text-dim hover:text-digital-white'}`}
          >
            <Grid className="w-3 h-3" /> Grid
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-technic-yellow text-industrial-charcoal shadow-lg' : 'text-text-dim hover:text-digital-white'}`}
          >
            <MapIcon className="w-3 h-3" /> Map
          </button>
        </div>
      </header>

      <div className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
        <Input 
          className="bg-white/5 border-white/10 rounded-2xl h-14 pl-12 text-lg focus:ring-technic-yellow/50"
          placeholder="Search by name, specialization, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          <motion.div 
            key="map"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="h-[600px] rounded-[32px] overflow-hidden border border-white/10 relative z-0"
          >
            <MapContainer 
              center={[-23.8962, 29.4486]} 
              zoom={10} 
              style={{ height: '100%', width: '100%' }}
              className="bg-industrial-charcoal"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              {filteredWorkshops.map((workshop) => (
                <Marker 
                  key={workshop.uid} 
                  position={[workshop.latitude || -23.8962, workshop.longitude || 29.4486]}
                >
                  <Popup className="workshop-popup">
                    <div className="p-2 min-w-[200px]">
                      <h4 className="font-black uppercase tracking-tight text-industrial-charcoal">{workshop.displayName}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">{workshop.specialization || 'General'} Specialist</p>
                      <Link to="/register">
                         <Button className="w-full bg-technic-yellow text-industrial-charcoal text-[10px] font-black h-8">CONNECT</Button>
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bento-card h-64 animate-pulse bg-white/[0.02]" />
              ))
            ) : (
              filteredWorkshops.map((workshop) => (
                <motion.div 
                  key={workshop.uid}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bento-card group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 border border-white/20">
                      {workshop.photoURL ? (
                        <img src={workshop.photoURL} alt={workshop.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-technic-yellow">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className="bg-success-green/10 text-success-green border-success-green/20 text-[9px] uppercase tracking-wider h-5">
                        {workshop.isVerified ? 'VERIFIED' : 'PENDING'}
                      </Badge>
                      <div className="flex items-center gap-1 text-technic-yellow">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-black">4.9</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 flex-1">
                    <h3 className="text-xl font-display font-black uppercase tracking-tight mb-1 group-hover:text-technic-yellow transition-colors text-digital-white">
                      {workshop.displayName}
                    </h3>
                    <p className="text-[10px] text-text-dim uppercase font-bold tracking-[2px] mb-4">
                      {workshop.specialization || 'General'} Specialist • {workshop.yearsOfExperience}+ Years XP
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-text-dim">
                        <MapPin className="w-3 h-3" /> {workshop.address || 'Polokwane, ZA'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-dim">
                        <Award className="w-3 h-3" /> Offers Workshop Learning
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5 flex gap-3">
                    <Button asChild className="flex-1 bento-btn text-[10px] h-10 px-0">
                      <Link to="/register">APPLY TO JOIN</Link>
                    </Button>
                    <Button variant="outline" className="w-10 h-10 p-0 border-white/10 rounded-xl">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <section className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-green/10 border border-success-green/20 text-success-green text-[10px] font-black uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3 h-3" /> Professional Standards
          </div>
          <h2 className="text-4xl font-display font-black uppercase tracking-tighter mb-6 text-digital-white">
            The <span className="text-technic-yellow">Professional</span> Power of Local Talent
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-technic-yellow" />
              </div>
              <div>
                <h4 className="font-black uppercase tracking-tight text-digital-white">Real-Time Evidence Capture</h4>
                <p className="text-sm text-text-dim">Avoid disputes. Our specialists capture receipts and parts photos immediately at purchase, creating an immutable paper trail.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <ShieldCheck className="w-5 h-5 text-technic-yellow" />
              </div>
              <div>
                <h4 className="font-black uppercase tracking-tight text-digital-white">Shadow Verification</h4>
                <p className="text-sm text-text-dim">Even if a till slip is non-itemized, our platform enables digital cross-referencing to verify authentic purchase costs.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                <Award className="w-5 h-5 text-technic-yellow" />
              </div>
              <div>
                <h4 className="font-black uppercase tracking-tight text-digital-white">Verified Competence</h4>
                <p className="text-sm text-text-dim">We only list specialists with proven track records, ensuring competence without the service center price tag.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2 p-8 rounded-[40px] bg-white/[0.02] border border-white/5 relative overflow-hidden">
           <div className="absolute inset-0 bg-technic-yellow/5 blur-3xl rounded-full -m-20" />
           <div className="relative z-10 text-center space-y-4">
             <div className="aspect-square w-full rounded-2xl bg-industrial-charcoal/50 border border-white/10 flex items-center justify-center mb-6">
                <div className="text-center">
                   <div className="text-5xl font-black text-technic-yellow mb-2">40%</div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-text-dim">Average cost saving vs centers</div>
                </div>
             </div>
             <p className="text-xs text-text-dim italic">"Makhanikhi brings the service center's reliability to the specialist's neighborhood agility."</p>
           </div>
        </div>
      </section>

      <section className="mt-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6">
          <Star className="w-3 h-3" /> Pipeline
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="text-4xl font-display font-black uppercase tracking-tighter mb-4 text-digital-white">
              Coming <span className="text-blue-400">Soon</span>!
            </h2>
            <p className="text-text-dim max-w-xl text-lg">
              We're expanding the Makhanikhi network to include accreditable experts across all automotive disciplines.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {comingSoonFeatures.map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                {React.cloneElement(feature.icon as React.ReactElement, { className: 'w-24 h-24' })}
              </div>
              <div className="mb-6 w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-black uppercase tracking-tight mb-2 text-digital-white">{feature.title}</h3>
              <p className="text-sm text-text-dim leading-relaxed">{feature.description}</p>
              <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                <ShieldCheck className="w-3 h-3" /> Accreditable experts
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-32 p-12 rounded-[40px] bg-technic-yellow/5 border border-technic-yellow/20 relative overflow-hidden text-center">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-technic-yellow/10 blur-[100px] rounded-full" />
        <h2 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tighter mb-4 relative z-10 text-digital-white">
          Want to <span className="text-technic-yellow">List</span> Your Workshop?
        </h2>
        <p className="text-text-dim max-w-xl mx-auto mb-8 relative z-10 text-sm leading-relaxed">
          Join the registry as a Specialist mentor. Digitize your records, co-opt talent, and build the future of mobile mechanics in Limpopo.
        </p>
        <Link to="/register">
          <Button className="bg-technic-yellow text-industrial-charcoal font-black h-14 px-8 rounded-xl shadow-[0_0_30px_rgba(255,210,0,0.1)] hover:scale-105 transition-transform uppercase text-xs tracking-widest">
            GET STARTED AS SPECIALIST <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </section>
    </div>
  );
};
