import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { logActivity } from './activityService';

const LOCAL_USERS_KEY = 'cloudvault_demo_users';
const LOCAL_SESSION_KEY = 'cloudvault_demo_session';

function getLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [
      {
        uid: 'demo-admin-uid',
        name: 'Admin Developer',
        email: 'admin@cloudvault.com',
        role: 'admin',
        storageUsed: 384000000, // ~384 MB sample
        createdAt: new Date().toISOString(),
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
      {
        uid: 'demo-user-uid',
        name: 'Student Scholar',
        email: 'student@cloudvault.com',
        role: 'user',
        storageUsed: 125829120, // ~120 MB sample
        createdAt: new Date().toISOString(),
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      }
    ];
  } catch {
    return [];
  }
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Register a new user with Email, Password, and Full Name
 */
export async function registerUser({ name, email, password }) {
  const configured = isFirebaseConfigured() && auth && db;

  if (!configured) {
    // Local interactive demo fallback
    const users = getLocalUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('A user with this email address already exists.');
    }
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@cloudvault.com';
    const role = email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';

    const newUser = {
      uid: 'user_' + Date.now(),
      name,
      email,
      role,
      storageUsed: 0,
      createdAt: new Date().toISOString(),
      photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0284c7`,
    };

    users.push(newUser);
    saveLocalUsers(users);
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(newUser));

    await logActivity({
      userId: newUser.uid,
      userEmail: newUser.email,
      action: 'Account registered',
    });

    return newUser;
  }

  // Real Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const defaultPhoto = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0284c7`;

  // Update Auth Profile
  await updateProfile(user, {
    displayName: name,
    photoURL: defaultPhoto,
  });

  // Determine role (default admin check or first user)
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@cloudvault.com';
  const role = email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';

  // Create Firestore Document
  const userDocRef = doc(db, 'users', user.uid);
  const userData = {
    uid: user.uid,
    name,
    email: user.email,
    role,
    storageUsed: 0,
    photoURL: defaultPhoto,
    createdAt: serverTimestamp(),
  };

  await setDoc(userDocRef, userData);

  await logActivity({
    userId: user.uid,
    userEmail: user.email,
    action: 'Account registered',
  });

  return { ...user, ...userData };
}

/**
 * Sign in existing user with email and password
 */
export async function loginUser(email, password) {
  const configured = isFirebaseConfigured() && auth && db;

  if (!configured) {
    const users = getLocalUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      // Auto-create for friendly demo if not found
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@cloudvault.com';
      const role = email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';
      const fallbackUser = {
        uid: 'user_' + Date.now(),
        name: email.split('@')[0],
        email,
        role,
        storageUsed: 0,
        createdAt: new Date().toISOString(),
        photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=0284c7`,
      };
      users.push(fallbackUser);
      saveLocalUsers(users);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(fallbackUser));
      await logActivity({
        userId: fallbackUser.uid,
        userEmail: fallbackUser.email,
        action: 'User signed in',
      });
      return fallbackUser;
    }

    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(existing));
    await logActivity({
      userId: existing.uid,
      userEmail: existing.email,
      action: 'User signed in',
    });
    return existing;
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  // Retrieve Firestore profile
  const userDocRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userDocRef);

  let profile = null;
  if (snap.exists()) {
    profile = snap.data();
  } else {
    // Re-create profile if missing
    profile = {
      uid: user.uid,
      name: user.displayName || email.split('@')[0],
      email: user.email,
      role: 'user',
      storageUsed: 0,
      createdAt: serverTimestamp(),
      photoURL: user.photoURL || '',
    };
    await setDoc(userDocRef, profile);
  }

  await logActivity({
    userId: user.uid,
    userEmail: user.email,
    action: 'User signed in',
  });

  return { ...user, ...profile };
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  const configured = isFirebaseConfigured() && auth;
  if (!configured) {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    return;
  }
  await signOut(auth);
}

/**
 * Send password reset email
 */
export async function sendResetPassword(email) {
  const configured = isFirebaseConfigured() && auth;
  if (!configured) {
    // In demo mode, simulate success
    return { success: true, message: 'Password reset link sent (demo simulation).' };
  }
  await sendPasswordResetEmail(auth, email);
  return { success: true };
}

/**
 * Fetch current user Firestore profile
 */
export async function getUserProfile(uid) {
  const configured = isFirebaseConfigured() && db;
  if (!configured) {
    const users = getLocalUsers();
    return users.find(u => u.uid === uid) || null;
  }

  const userDocRef = doc(db, 'users', uid);
  const snap = await getDoc(userDocRef);
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

/**
 * Update user display name and photo
 */
export async function updateUserProfileData(currentUser, { displayName, photoURL }) {
  const configured = isFirebaseConfigured() && auth && db;

  if (!configured) {
    const users = getLocalUsers();
    const idx = users.findIndex(u => u.uid === currentUser.uid);
    if (idx !== -1) {
      if (displayName) users[idx].name = displayName;
      if (photoURL) users[idx].photoURL = photoURL;
      saveLocalUsers(users);
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(users[idx]));
    }
    return users[idx] || currentUser;
  }

  // Update Auth Profile
  await updateProfile(auth.currentUser, {
    displayName: displayName || auth.currentUser.displayName,
    photoURL: photoURL || auth.currentUser.photoURL,
  });

  // Update Firestore
  const userDocRef = doc(db, 'users', currentUser.uid);
  await updateDoc(userDocRef, {
    name: displayName || currentUser.displayName,
    photoURL: photoURL || currentUser.photoURL || '',
    updatedAt: serverTimestamp(),
  });

  await logActivity({
    userId: currentUser.uid,
    userEmail: currentUser.email,
    action: 'Updated profile information',
  });
}

/**
 * Change user password
 */
export async function changePassword(newPassword) {
  const configured = isFirebaseConfigured() && auth;
  if (!configured) {
    return { success: true, message: 'Password updated (demo simulation).' };
  }
  if (!auth.currentUser) throw new Error('No user is currently signed in.');
  await updatePassword(auth.currentUser, newPassword);
}
