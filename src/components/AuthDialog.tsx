import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose, initialMode = 'register' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('owner');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        await signUp(email, password, displayName, role);
        toast.success('Account created successfully!');
      } else {
        await signIn(email, password);
        toast.success('Signed in successfully!');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-industrial-charcoal border-white/10">
        <DialogHeader>
          <DialogTitle className="text-digital-white text-center">
            {mode === 'register' ? 'Create Account' : 'Sign In'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <Label htmlFor="displayName" className="text-digital-white">Full Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-digital-white"
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-digital-white">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-digital-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-industrial-charcoal border-white/10">
                    <SelectItem value="owner" className="text-digital-white">Vehicle Owner</SelectItem>
                    <SelectItem value="specialist" className="text-digital-white">Mechanic Specialist</SelectItem>
                    <SelectItem value="apprentice" className="text-digital-white">Apprentice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div>
            <Label htmlFor="email" className="text-digital-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-digital-white"
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-digital-white">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-digital-white"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-technic-yellow text-industrial-charcoal hover:bg-technic-yellow/90"
          >
            {loading ? 'Please wait...' : mode === 'register' ? 'Create Account' : 'Sign In'}
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
              className="text-technic-yellow hover:underline text-sm"
            >
              {mode === 'register' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};