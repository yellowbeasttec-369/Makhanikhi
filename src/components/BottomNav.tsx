import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, Car, User, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user, profile } = useAuth();

  if (!user) return null;

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Wrench, label: 'Jobs', path: '/dashboard' },
    { icon: Users, label: 'Registry', path: '/registry' },
    { icon: Car, label: 'Book', path: '/book' },
    { icon: ShieldCheck, label: 'Verify', path: '/verify' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-industrial-charcoal/90 backdrop-blur-lg border-t border-white/10 px-6 py-3 z-50">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-technic-yellow' : 'text-text-dim'}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
