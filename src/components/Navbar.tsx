import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from './ui/button';
import { Wrench, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export const Navbar: React.FC = () => {
  const { user, profile } = useAuth();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <nav className="border-b border-white/10 bg-industrial-charcoal/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-technic-yellow p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Wrench className="w-6 h-6 text-industrial-charcoal" />
            </div>
            <div className="flex flex-col">
              <span className="makhanikhi-logo text-2xl text-digital-white">Makhanikhi</span>
              <span className="text-[10px] uppercase tracking-widest text-technic-yellow font-bold -mt-1">Specialist Mobile Mechanics</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium hover:text-technic-yellow transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold leading-none">{profile?.displayName}</p>
                    <p className="text-[10px] text-technic-yellow uppercase font-bold tracking-tighter mt-1">
                      {profile?.role} {profile?.isVerified && <Shield className="inline w-2.5 h-2.5 ml-0.5" />}
                    </p>
                  </div>
                  <Avatar className="h-8 w-8 border-2 border-technic-yellow/20">
                    <AvatarImage src={user.photoURL || ''} />
                    <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:text-red-500">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={handleLogin} className="bg-technic-yellow text-industrial-charcoal hover:bg-technic-yellow/90 font-bold">
                Connect Wallet / Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
