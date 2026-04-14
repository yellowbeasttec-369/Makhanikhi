import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from './ui/button';
import { Wrench, LogOut, User as UserIcon, Shield, Wallet } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BrowserProvider } from 'ethers';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const { user, profile } = useAuth();
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
        toast.success(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      } catch (error: any) {
        console.error('MetaMask connection failed', error);
        toast.error("Failed to connect to MetaMask. Please ensure it is unlocked and you approve the request.");
      }
    } else {
      toast.error("MetaMask not detected. Please install the extension.");
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
      toast.error("Login failed. Please try again.");
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
                {walletAddress && (
                  <div className="hidden md:flex items-center gap-2 bg-technic-yellow/10 border border-technic-yellow/20 px-3 py-1.5 rounded-lg">
                    <Wallet className="w-3.5 h-3.5 text-technic-yellow" />
                    <span className="text-[10px] font-mono text-technic-yellow font-bold">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                )}
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
              <div className="flex gap-2">
                <Button 
                  onClick={connectWallet} 
                  variant="outline"
                  className="border-white/20 hover:bg-white/5 font-bold hidden md:flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" /> Connect Wallet
                </Button>
                <Button onClick={handleLogin} className="bg-technic-yellow text-industrial-charcoal hover:bg-technic-yellow/90 font-bold">
                  Login with Google
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
