import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Car, Search, TrendingUp, AlertCircle, Wrench, History, ChevronRight, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { Vehicle, ServiceRequest } from '../types';
import { Link } from 'react-router-dom';

export const FleetManager: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [makeFilter, setMakeFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    const vQ = query(collection(db, 'vehicles'), where('ownerId', '==', user.uid));
    const rQ = query(collection(db, 'serviceRequests'), where('ownerId', '==', user.uid));

    const unsubVehicles = onSnapshot(vQ, (snap) => {
      setVehicles(snap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle)));
    });

    const unsubRequests = onSnapshot(rQ, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceRequest)));
      setLoading(false);
    });

    return () => {
      unsubVehicles();
      unsubRequests();
    };
  }, [user]);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.make.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         v.vin?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMake = makeFilter === 'all' || v.make === makeFilter;
    const matchesModel = modelFilter === 'all' || v.model === modelFilter;
    return matchesSearch && matchesMake && matchesModel;
  });

  const uniqueMakes = Array.from(new Set(vehicles.map(v => v.make)));
  const uniqueModels = Array.from(new Set(vehicles.filter(v => makeFilter === 'all' || v.make === makeFilter).map(v => v.model)));

  const totalInvestment = vehicles.reduce((acc, v) => {
    const history = v.serviceHistory || [];
    // Note: In a real app, we'd sum actual costs. For now, we'll use a placeholder or sum from a logs collection if available.
    return acc + (history.length * 1500); // Placeholder average cost
  }, 0);

  const pendingServices = requests.filter(r => r.status === 'pending' || r.status === 'in-progress').length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bento-card">
          <div className="bento-card-title">Total Fleet</div>
          <div className="text-3xl font-display font-black">{vehicles.length}</div>
          <p className="text-[10px] text-text-dim uppercase tracking-widest mt-1">Active Vehicles</p>
        </div>
        <div className="bento-card">
          <div className="bento-card-title">Fleet Health</div>
          <div className="text-3xl font-display font-black text-success-green">94%</div>
          <p className="text-[10px] text-text-dim uppercase tracking-widest mt-1">Operational Rate</p>
        </div>
        <div className="bento-card">
          <div className="bento-card-title">Pending Tasks</div>
          <div className="text-3xl font-display font-black text-technic-yellow">{pendingServices}</div>
          <p className="text-[10px] text-text-dim uppercase tracking-widest mt-1">Services Required</p>
        </div>
        <div className="bento-card">
          <div className="bento-card-title">Total Investment</div>
          <div className="text-2xl font-display font-black">R {totalInvestment.toLocaleString()}</div>
          <p className="text-[10px] text-text-dim uppercase tracking-widest mt-1">Lifecycle Cost</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
            <Input 
              placeholder="Search VIN, Make or Model..." 
              className="pl-10 bg-white/5 border-white/10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-digital-white outline-none focus:ring-1 focus:ring-technic-yellow"
            value={makeFilter}
            onChange={(e) => { setMakeFilter(e.target.value); setModelFilter('all'); }}
          >
            <option value="all" className="bg-industrial-charcoal">All Makes</option>
            {uniqueMakes.map(make => (
              <option key={make} value={make} className="bg-industrial-charcoal">{make}</option>
            ))}
          </select>
          <select 
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-widest text-digital-white outline-none focus:ring-1 focus:ring-technic-yellow"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
          >
            <option value="all" className="bg-industrial-charcoal">All Models</option>
            {uniqueModels.map(model => (
              <option key={model} value={model} className="bg-industrial-charcoal">{model}</option>
            ))}
          </select>
        </div>
        <Link to="/book">
          <Button className="bg-technic-yellow text-industrial-charcoal font-black rounded-xl uppercase text-xs tracking-widest">
            <Wrench className="w-4 h-4 mr-2" /> Schedule Fleet Service
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-technic-yellow flex items-center gap-2">
            <Car className="w-4 h-4" /> Vehicle Inventory
          </h3>
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bento-card hover:border-technic-yellow/30 transition-all group cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-technic-yellow">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-display font-black uppercase tracking-tight">{vehicle.make} {vehicle.model}</h4>
                      <p className="text-[10px] text-text-dim uppercase tracking-widest">VIN: {vehicle.vin || 'NOT RECORDED'} • {vehicle.year}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-bold">{vehicle.mileage.toLocaleString()} KM</div>
                    <Badge variant="outline" className="text-[9px] border-success-green/20 text-success-green uppercase">Healthy</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
                  <div>
                    <p className="text-[9px] text-text-dim uppercase font-bold mb-1">Last Service</p>
                    <p className="text-xs font-bold">12 Oct 2023</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-text-dim uppercase font-bold mb-1">Next Due</p>
                    <p className="text-xs font-bold text-technic-yellow">15,000 KM</p>
                  </div>
                  <div className="flex justify-end items-end">
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase group-hover:text-technic-yellow">
                      LOGBOOK <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-2xl">
              <Car className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-text-dim font-bold">No vehicles found in your fleet.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-technic-yellow flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Fleet Analytics
          </h3>
          
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-text-dim">Maintenance Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Minor Service", value: 65, color: "bg-blue-500" },
                { label: "Major Repairs", value: 20, color: "bg-red-500" },
                { label: "Diagnostics", value: 15, color: "bg-technic-yellow" }
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-text-dim">Recent Fleet Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {requests.slice(0, 5).map((req, i) => (
                  <div key={i} className="mb-4 last:mb-0 pb-4 border-b border-white/5 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[11px] font-bold uppercase">{(req as any).vehicleMake} {(req as any).vehicleModel}</span>
                      <Badge className="text-[8px] h-4 bg-white/10">{req.status}</Badge>
                    </div>
                    <p className="text-[10px] text-text-dim">{req.description.slice(0, 40)}...</p>
                    <div className="flex items-center gap-2 mt-2 text-[9px] text-text-dim">
                      <History className="w-3 h-3" /> {new Date((req.createdAt as any)?.seconds * 1000).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
