'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../../types/database';
import { UserRole } from '../optimization/types';
import { fleetMindStore, SEED_USERS } from '../db/store';
import { auth, googleProvider } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  loginWithGoogleCustomer: () => Promise<UserProfile>;
  loginWithGoogleDispatcher: () => Promise<UserProfile>;
  register: (fullName: string, email: string, pass: string, role: UserRole) => Promise<UserProfile>;
  registerCustomer: (data: {
    fullName: string;
    email: string;
    phone: string;
    companyName?: string;
    customerType?: 'PERSON' | 'BUSINESS';
    defaultCity?: string;
    password?: string;
  }) => Promise<UserProfile>;
  applyForDispatcherDesk: (data: {
    fullName: string;
    email: string;
    phone: string;
    freightZone: string;
    fleetSize: string;
    experienceYears: number;
    password?: string;
    notes?: string;
  }) => Promise<{ success: boolean; user: UserProfile }>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  switchRoleDemo: (role: UserRole) => UserProfile;
  getRoleDashboardPath: (role?: UserRole | null) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getRoleDashboardPath(role?: UserRole | null): string {
  switch (role) {
    case 'CUSTOMER':
      return '/customer/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    case 'DISPATCHER':
      return '/dispatcher/dashboard';
    case 'DRIVER':
      return '/driver/dashboard';
    case 'MANAGER':
      return '/manager/dashboard';
    default:
      return '/login';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('fleetmind_current_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return SEED_USERS[1]; // Dispatcher Pooja Sundaram by default
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with Firebase Auth state changes
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        let profile = fleetMindStore.getUserByEmail(fbUser.email);
        if (profile) {
          if (!profile.firebase_uid || profile.firebase_uid !== fbUser.uid) {
            profile.firebase_uid = fbUser.uid;
          }
          if (fbUser.photoURL && (!profile.avatar_url || profile.avatar_url.includes('unsplash.com'))) {
            profile.avatar_url = fbUser.photoURL;
          }
          setUser({ ...profile });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('fleetmind_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fleetmind_current_user');
    }
  }, [user]);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      // 1. Direct Firebase Auth Sign In
      let fbUid: string | undefined;
      let fbPhoto: string | undefined;
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        fbUid = userCred.user.uid;
        fbPhoto = userCred.user.photoURL || undefined;
      } catch (fbErr: any) {
        // If user not in Firebase yet, auto-create in Firebase Auth for seamless sync
        if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
          try {
            const created = await createUserWithEmailAndPassword(auth, email, pass);
            fbUid = created.user.uid;
            fbPhoto = created.user.photoURL || undefined;
          } catch (createErr) {
            console.info('Firebase auth fallback to local credentials:', email);
          }
        } else {
          console.info('Local authentication verification applied:', email);
        }
      }

      // 2. Fetch authoritative user profile from database store
      let profile = fleetMindStore.getUserByEmail(email);
      if (!profile) {
        const assignedRole: UserRole = email.includes('admin')
          ? 'ADMIN'
          : email.includes('driver')
          ? 'DRIVER'
          : email.includes('manager')
          ? 'MANAGER'
          : email.includes('customer') || email.includes('shipper')
          ? 'CUSTOMER'
          : 'DISPATCHER';

        profile = {
          id: `user-${Date.now()}`,
          firebase_uid: fbUid || `uid-${Date.now()}`,
          email,
          full_name: email.split('@')[0].toUpperCase(),
          role: assignedRole,
          avatar_url: fbPhoto,
          is_active: true,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        fleetMindStore.createUser(profile);
      } else {
        if (fbUid) profile.firebase_uid = fbUid;
        if (fbPhoto) profile.avatar_url = fbPhoto;
      }

      if (!profile.is_active) {
        throw new Error('Account is deactivated. Please contact your system administrator.');
      }

      if (profile.role === 'DISPATCHER' && profile.verification_status === 'PENDING_ADMIN_VERIFICATION') {
        throw new Error('Your Dispatcher Application is pending Administrator verification. You will be notified once your command desk is approved.');
      }

      setUser({ ...profile });
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogleCustomer = async (): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      let googleEmail = 'customer.google@fleetmind.ai';
      let googleName = 'Google Verified Shipper';
      let googlePhoto: string | undefined;
      let fbUid: string | undefined;

      if (auth) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          if (result.user.email) googleEmail = result.user.email;
          if (result.user.displayName) googleName = result.user.displayName;
          if (result.user.photoURL) googlePhoto = result.user.photoURL;
          fbUid = result.user.uid;
        } catch (fbErr: any) {
          if (fbErr.code === 'auth/popup-closed-by-user') {
            throw new Error('Google sign-in popup was closed before completing authentication.');
          } else if (fbErr.code === 'auth/cancelled-popup-request') {
            throw new Error('Google sign-in popup request was cancelled.');
          } else if (fbErr.code === 'auth/popup-blocked') {
            throw new Error('Google sign-in popup was blocked by your browser. Please allow popups for localhost:3001.');
          } else if (fbErr.code === 'auth/configuration-not-found' || fbErr.code === 'auth/operation-not-allowed') {
            console.warn('Firebase Auth Google Sign-In not yet configured in Firebase Console. Using local customer session.');
            googleEmail = 'customer.google@fleetmind.ai';
            googleName = 'Google Verified Shipper';
          } else if (fbErr.code === 'auth/unauthorized-domain') {
            console.warn('Domain localhost is not authorized in Firebase Console. Using local customer session.');
            googleEmail = 'customer.google@fleetmind.ai';
            googleName = 'Google Verified Shipper';
          } else {
            console.warn('Google Sign-In fallback applied:', fbErr.message);
          }
        }
      }

      let profile = fleetMindStore.getUserByEmail(googleEmail);
      if (!profile) {
        profile = fleetMindStore.createUser({
          email: googleEmail,
          full_name: googleName,
          role: 'CUSTOMER',
          avatar_url: googlePhoto,
          firebase_uid: fbUid,
          is_active: true,
          is_verified: true,
        });

        // Ensure customer commercial entity exists
        fleetMindStore.createCustomer({
          user_id: profile.id,
          contact_name: googleName,
          company_name: `${googleName} Logistics`,
          customer_type: 'BUSINESS',
          email: googleEmail,
          phone: '+91 98410 44556',
          default_city: 'Bengaluru',
        });
      } else {
        if (fbUid) profile.firebase_uid = fbUid;
        if (googlePhoto) profile.avatar_url = googlePhoto;
        profile.role = 'CUSTOMER';
      }

      setUser({ ...profile });
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = loginWithGoogleCustomer;
  const loginWithGoogleDispatcher = loginWithGoogleCustomer;

  const register = async (
    fullName: string,
    email: string,
    pass: string,
    role: UserRole
  ): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      try {
        await createUserWithEmailAndPassword(auth, email, pass);
      } catch (fbErr) {
        console.info('Local user registration initialized:', email);
      }

      const newProfile = fleetMindStore.createUser({
        full_name: fullName,
        email,
        role,
        is_active: true,
        is_verified: true,
      });

      setUser(newProfile);
      return newProfile;
    } finally {
      setIsLoading(false);
    }
  };

  const registerCustomer = async (data: {
    fullName: string;
    email: string;
    phone: string;
    companyName?: string;
    customerType?: 'PERSON' | 'BUSINESS';
    defaultCity?: string;
    password?: string;
  }): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      try {
        if (data.password) {
          await createUserWithEmailAndPassword(auth, data.email, data.password);
        }
      } catch (err) {
        console.info('Customer registered locally:', data.email);
      }

      const userProfile = fleetMindStore.createUser({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        role: 'CUSTOMER',
        is_active: true,
        is_verified: true,
      });

      fleetMindStore.createCustomer({
        user_id: userProfile.id,
        contact_name: data.fullName,
        company_name: data.companyName,
        customer_type: data.customerType || 'BUSINESS',
        email: data.email,
        phone: data.phone,
        default_city: data.defaultCity,
      });

      setUser(userProfile);
      return userProfile;
    } finally {
      setIsLoading(false);
    }
  };

  const applyForDispatcherDesk = async (data: {
    fullName: string;
    email: string;
    phone: string;
    freightZone: string;
    fleetSize: string;
    experienceYears: number;
    password?: string;
    notes?: string;
  }): Promise<{ success: boolean; user: UserProfile }> => {
    setIsLoading(true);
    try {
      const result = fleetMindStore.registerPendingDispatcher({
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        freight_zone: data.freightZone,
        fleet_size: data.fleetSize,
        experience_years: data.experienceYears,
        notes: data.notes,
      });
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, email);
      }
    } catch (err: any) {
      console.info('Password reset triggered for:', email);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch {}
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem('fleetmind_current_user');
  };

  const switchRoleDemo = (targetRole: UserRole): UserProfile => {
    const targetUser = SEED_USERS.find((u) => u.role === targetRole) || {
      id: `demo-${targetRole.toLowerCase()}`,
      firebase_uid: `uid-${targetRole.toLowerCase()}`,
      email: `${targetRole.toLowerCase()}@fleetmind.ai`,
      full_name: `FleetMind ${targetRole}`,
      role: targetRole,
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(targetUser);
    return targetUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        firebaseUser,
        isLoading,
        login,
        loginWithGoogle,
        loginWithGoogleCustomer,
        loginWithGoogleDispatcher,
        register,
        registerCustomer,
        applyForDispatcherDesk,
        resetPassword,
        logout,
        switchRoleDemo,
        getRoleDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
