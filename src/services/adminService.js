import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { logActivity } from './activityService';

const LOCAL_USERS_KEY = 'cloudvault_demo_users';
const LOCAL_FILES_KEY = 'cloudvault_demo_files';

function getLocalUsers() {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error(err);
  }
}

function getLocalFiles() {
  try {
    const raw = localStorage.getItem(LOCAL_FILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Fetch all registered users for Admin Dashboard
 */
export async function getAllUsers() {
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    return getLocalUsers();
  }

  try {
    const usersRef = collection(db, 'users');
    const snap = await getDocs(usersRef);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  } catch (err) {
    console.error('getAllUsers error:', err);
    return [];
  }
}

/**
 * Fetch all files in the system for Admin monitoring
 */
export async function getAllFiles() {
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    return getLocalFiles();
  }

  try {
    const filesRef = collection(db, 'files');
    const snap = await getDocs(filesRef);
    return snap.docs.map(d => ({ fileId: d.id, ...d.data() }));
  } catch (err) {
    console.error('getAllFiles error:', err);
    return [];
  }
}

/**
 * Update user role (e.g. promote to admin or demote to user)
 */
export async function updateUserRole(targetUid, newRole, adminUser) {
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const users = getLocalUsers();
    const target = users.find(u => u.uid === targetUid);
    if (target) {
      target.role = newRole;
      saveLocalUsers(users);
      await logActivity({
        userId: adminUser.uid,
        userEmail: adminUser.email,
        action: `Changed role of ${target.email} to ${newRole}`,
      });
    }
    return;
  }

  const userDocRef = doc(db, 'users', targetUid);
  await updateDoc(userDocRef, {
    role: newRole,
  });

  await logActivity({
    userId: adminUser.uid,
    userEmail: adminUser.email,
    action: `Changed role of user ${targetUid} to ${newRole}`,
  });
}

/**
 * Delete user record (Admin action)
 */
export async function deleteUserAccount(targetUid, adminUser) {
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const users = getLocalUsers();
    const filtered = users.filter(u => u.uid !== targetUid);
    saveLocalUsers(filtered);
    await logActivity({
      userId: adminUser.uid,
      userEmail: adminUser.email,
      action: `Deleted user account ${targetUid}`,
    });
    return;
  }

  const userDocRef = doc(db, 'users', targetUid);
  await deleteDoc(userDocRef);

  await logActivity({
    userId: adminUser.uid,
    userEmail: adminUser.email,
    action: `Deleted user account ${targetUid}`,
  });
}

/**
 * Calculate system-wide admin metrics
 */
export async function getSystemMetrics() {
  const [users, files] = await Promise.all([
    getAllUsers(),
    getAllFiles(),
  ]);

  const totalUsers = users.length;
  const totalFiles = files.length;
  const activeFiles = files.filter(f => !f.isTrash).length;
  const trashedFiles = files.filter(f => f.isTrash).length;
  const totalStorageBytes = files.reduce((acc, f) => acc + (f.fileSize || 0), 0);

  return {
    totalUsers,
    totalFiles,
    activeFiles,
    trashedFiles,
    totalStorageBytes,
    users,
    files,
  };
}
