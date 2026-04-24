import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  signUp: (email: string, password: string, displayName: string, role: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  signUp: async () => {},
  signIn: async () => {},
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setProfile(userDoc.data() as UserProfile);
            } else {
              // Create default profile if not exists
              const newProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'User',
                role: 'owner',
                isVerified: false,
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
              setProfile(newProfile);
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
            setError('Failed to load user profile');
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError('Authentication service unavailable');
      setLoading(false);
      setIsAuthReady(true);
    }
  }, []);

  const signUp = async (email: string, password: string, displayName: string, role: string) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName });
      const newProfile: UserProfile = {
        uid: user.uid,
        email,
        displayName,
        role: role as any,
        isVerified: false,
      };
      await setDoc(doc(db, 'users', user.uid), newProfile);
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, signUp, signIn, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
