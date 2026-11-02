import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import {
  registerUser,
  loginUser,
  logoutUser,
  sendResetPassword,
  updateUserProfileData,
  changePassword as changeUserPassword,
  getUserProfile
} from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isFirebaseConfigured();

  // Load user session on mount
  useEffect(() => {
    let unsubscribeSnapshot = null;

    if (!isConfigured || !auth) {
      // Demo session management from localStorage
      try {
        const saved = localStorage.getItem('cloudvault_demo_session');
        if (saved) {
          const user = JSON.parse(saved);
          setCurrentUser(user);
          setUserProfile(user);
        } else {
          // Default initial logged in demo user for immediate college viva evaluation
          const defaultDemo = {
            uid: 'demo-admin-uid',
            name: 'College Admin',
            email: 'admin@cloudvault.com',
            role: 'admin',
            storageUsed: 384000000,
            photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          };
          setCurrentUser(defaultDemo);
          setUserProfile(defaultDemo);
          localStorage.setItem('cloudvault_demo_session', JSON.stringify(defaultDemo));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Real Firebase Auth listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Subscribe to Firestore user doc for real-time updates (e.g. storage quota changes)
        if (db) {
          const userDocRef = doc(db, 'users', user.uid);
          unsubscribeSnapshot = onSnapshot(
            userDocRef,
            (snap) => {
              if (snap.exists()) {
                const data = snap.data();
                setUserProfile(data);
              } else {
                // If doc not created yet, use basic user data
                setUserProfile({
                  uid: user.uid,
                  name: user.displayName || user.email.split('@')[0],
                  email: user.email,
                  role: user.email === (import.meta.env.VITE_ADMIN_EMAIL || 'admin@cloudvault.com') ? 'admin' : 'user',
                  storageUsed: 0,
                  photoURL: user.photoURL,
                });
              }
              setLoading(false);
            },
            (err) => {
              console.warn('Firestore user profile snapshot warning:', err);
              setLoading(false);
            }
          );
        } else {
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [isConfigured]);

  const login = async (email, password) => {
    const user = await loginUser(email, password);
    if (!isConfigured) {
      setCurrentUser(user);
      setUserProfile(user);
    }
    return user;
  };

  const register = async ({ name, email, password }) => {
    const user = await registerUser({ name, email, password });
    if (!isConfigured) {
      setCurrentUser(user);
      setUserProfile(user);
    }
    return user;
  };

  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email) => {
    return await sendResetPassword(email);
  };

  const updateProfile = async ({ displayName, photoURL }) => {
    if (!currentUser) return;
    const updated = await updateUserProfileData(currentUser, { displayName, photoURL });
    if (!isConfigured && updated) {
      setCurrentUser({ ...updated });
      setUserProfile({ ...updated });
    }
  };

  const changePassword = async (newPassword) => {
    return await changeUserPassword(newPassword);
  };

  const refreshUserProfile = useCallback(async () => {
    if (!currentUser?.uid) return;
    const profile = await getUserProfile(currentUser.uid);
    if (profile) {
      setUserProfile(profile);
    }
  }, [currentUser]);

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@cloudvault.com';
  const isAdmin = Boolean(
    userProfile?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === adminEmail.toLowerCase()
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isConfigured,
        isAdmin,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        changePassword,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
