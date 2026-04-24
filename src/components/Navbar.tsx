import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { auth } from '../lib/firebase';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Button } from './ui/button';
import { Wrench, LogOut, User as UserIcon, Shield, Wallet, Home, Calendar, LayoutDashboard, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { BrowserProvider } from 'ethers';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const { user, profile } = useAuth();
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Use BrowserProvider from ethers (v6)
        const provider = new BrowserProvider(window.ethereum);
        // Request accounts
        const accounts = await provider.send("eth_requestAccounts", []);
        
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          toast.success(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        }
      } catch (error: any) {
        console.error('MetaMask connection error:', error);
        
        // Handle specific MetaMask error codes
        if (error.code === 4001) {
          toast.error("Connection request rejected. Please approve it in MetaMask.");
        } else if (error.code === -32002) {
          toast.error("MetaMask request already pending. Check your extension.");
        } else {
          toast.error("Failed to connect to MetaMask. Ensure it is installed and unlocked.");
        }
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
            <div className="bg-technic-yellow p-1 rounded-lg group-hover:rotate-12 transition-transform overflow-hidden w-10 h-10 flex items-center justify-center">
              <img src="/Makhanikhi_logo_launch.png" alt="Makhanikhi Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col">
              <span className="makhanikhi-logo text-2xl text-digital-white leading-none">Makhanikhi</span>
              <span className="text-[10px] uppercase tracking-widest text-technic-yellow font-bold mt-0.5">Specialist Mobile Mechanics</span>
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
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold leading-none">{profile?.displayName}</p>
                    <p className="text-[10px] text-technic-yellow uppercase font-bold tracking-tighter mt-1">
                      {profile?.role} {profile?.isVerified && <Shield className="inline w-2.5 h-2.5 ml-0.5" />}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" className="relative flex items-center gap-2 h-10 px-2 rounded-full hover:bg-white/5" />}>
                      <Avatar className="h-8 w-8 border-2 border-technic-yellow/20">
                        <AvatarImage src={user.photoURL || ''} />
                        <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                      </Avatar>
                      <Menu className="w-4 h-4 text-text-dim" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-industrial-charcoal border-white/10 text-digital-white" align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="font-display font-bold uppercase text-[10px] tracking-widest text-text-dim">
                          Navigation
                        </DropdownMenuLabel>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <Link to="/">
                        <DropdownMenuItem className="focus:bg-white/5 focus:text-technic-yellow cursor-pointer">
                          <Home className="mr-2 h-4 w-4" />
                          <span>Home</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/dashboard">
                        <DropdownMenuItem className="focus:bg-white/5 focus:text-technic-yellow cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/dashboard">
                        <DropdownMenuItem className="focus:bg-white/5 focus:text-technic-yellow cursor-pointer">
                          <Wrench className="mr-2 h-4 w-4" />
                          <span>Jobs</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/book">
                        <DropdownMenuItem className="focus:bg-white/5 focus:text-technic-yellow cursor-pointer">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Booking</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator className="bg-white/5" />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-400"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
                  Login
                </Button>
                <Link to="/register">
                  <Button className="border-technic-yellow/30 text-technic-yellow hover:bg-technic-yellow/5 font-bold" variant="outline">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
