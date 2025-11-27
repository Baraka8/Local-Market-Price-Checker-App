import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../services/authService';
import { User } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<FirebaseUser | void>;
  signUp: (email: string, password: string, displayName: string, language: 'en' | 'rw') => Promise<FirebaseUser | void>;
  signOut: () => Promise<void>;
  updateUserData: (updates: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<void>;
  requiresOtpVerification: boolean;
  setRequiresOtpVerification: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresOtpVerification, setRequiresOtpVerification] = useState(false);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        const data = await AuthService.getUserData(user.uid);
        if (data?.otpVerified === false) {
          setRequiresOtpVerification(true);
          await AuthService.signOutUser();
          setUserData(null);
        } else {
          setRequiresOtpVerification(false);
          setUserData(data);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
    const user = await AuthService.signIn(email, password);
    const data = await AuthService.getUserData(user.uid);
    if (data?.otpVerified === false) {
      setRequiresOtpVerification(true);
      await AuthService.signOutUser();
      const error: any = new Error('Please verify the OTP sent to your email before signing in.');
      error.code = 'otp-required';
      error.uid = user.uid;
      error.email = user.email;
      throw error;
    }
    return user;
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    language: 'en' | 'rw'
  ): Promise<FirebaseUser> => {
    const user = await AuthService.register(email, password, displayName, language);
    setRequiresOtpVerification(true);
    await AuthService.signOutUser();
    return user;
  };

  const signOut = async () => {
    await AuthService.signOutUser();
    setUserData(null);
  };

  const updateUserData = async (updates: Partial<User>) => {
    if (!currentUser) return;
    await AuthService.updateUserProfile(currentUser.uid, updates);
    if (userData) {
      setUserData({ ...userData, ...updates });
    }
  };

  const refreshUserData = async () => {
    if (!currentUser) return;
    const data = await AuthService.getUserData(currentUser.uid);
    setUserData(data);
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserData,
    refreshUserData,
    requiresOtpVerification,
    setRequiresOtpVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

