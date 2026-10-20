import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  // Fix #11: expose refreshProfile so components can re-fetch after writes
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,        setUser]        = useState<User | null>(null);
  const [profile,     setProfile]     = useState<UserProfile | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const fetchProfile = useCallback(async (firebaseUser: User) => {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    setProfile(userDoc.exists() ? (userDoc.data() as UserProfile) : null);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  // Fix #11: callable refresh so other components don't need a reload
  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user);
  }, [user, fetchProfile]);

  // Fix #12: Don't render children until Firebase auth state is known.
  // This prevents routes from briefly rendering in the wrong state.
  if (!isAuthReady) return null;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

