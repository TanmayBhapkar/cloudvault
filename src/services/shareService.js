import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { logActivity } from './activityService';

const LOCAL_SHARES_KEY = 'cloudvault_demo_shares';

function getLocalShares() {
  try {
    const raw = localStorage.getItem(LOCAL_SHARES_KEY);
    if (raw) return JSON.parse(raw);
    const initialShares = [
      {
        shareId: 'share_demo_1',
        fileId: 'file_demo_1',
        fileName: 'Cloud_Computing_Project_Report.pdf',
        fileSize: 4259840,
        fileType: 'application/pdf',
        storagePath: 'demo/Cloud_Computing_Project_Report.pdf',
        downloadURL: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        ownerId: 'demo-admin-uid',
        ownerEmail: 'admin@cloudvault.com',
        sharedWithEmail: 'student@cloudvault.com',
        permission: 'viewer',
        expiresAt: null,
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      }
    ];
    localStorage.setItem(LOCAL_SHARES_KEY, JSON.stringify(initialShares));
    return initialShares;
  } catch {
    return [];
  }
}

function saveLocalShares(shares) {
  try {
    localStorage.setItem(LOCAL_SHARES_KEY, JSON.stringify(shares));
  } catch (err) {
    console.error('Failed to save local shares:', err);
  }
}

/**
 * Share a file with an email address
 */
export async function createShare({
  file,
  sharedWithEmail,
  permission = 'viewer',
  expiresInDays = null, // null = never, or 1, 7, 30
  currentUser
}) {
  let expiresAt = null;
  if (expiresInDays) {
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + parseInt(expiresInDays, 10));
    expiresAt = expDate.toISOString();
  }

  const shareId = 'share_' + Date.now() + Math.random().toString(36).substring(2, 8);
  const shareData = {
    shareId,
    fileId: file.fileId,
    fileName: file.fileName,
    fileSize: file.fileSize || 0,
    fileType: file.fileType || 'application/octet-stream',
    storagePath: file.storagePath || '',
    downloadURL: file.downloadURL || '',
    ownerId: currentUser.uid,
    ownerEmail: currentUser.email,
    sharedWithEmail: (sharedWithEmail || '').toLowerCase().trim(),
    permission,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const shares = getLocalShares();
    shares.unshift(shareData);
    saveLocalShares(shares);

    await logActivity({
      userId: currentUser.uid,
      userEmail: currentUser.email,
      action: `Shared "${file.fileName}" with ${sharedWithEmail || 'link recipients'}`,
      fileName: file.fileName,
      fileId: file.fileId,
    });

    return shareData;
  }

  // Real Firestore share creation
  const shareDocRef = doc(db, 'shares', shareId);
  await setDoc(shareDocRef, {
    ...shareData,
    createdAt: serverTimestamp(),
  });

  await logActivity({
    userId: currentUser.uid,
    userEmail: currentUser.email,
    action: `Shared "${file.fileName}" with ${sharedWithEmail || 'link recipients'}`,
    fileName: file.fileName,
    fileId: file.fileId,
  });

  return shareData;
}

/**
 * Fetch files shared WITH a user (matching user's email)
 */
export async function getFilesSharedWithUser(userEmail) {
  if (!userEmail) return [];
  const normalizedEmail = userEmail.toLowerCase().trim();
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const shares = getLocalShares();
    return shares.filter(s => {
      if (s.sharedWithEmail && s.sharedWithEmail !== normalizedEmail) return false;
      // Check expiry
      if (s.expiresAt && new Date(s.expiresAt) < new Date()) return false;
      return true;
    });
  }

  try {
    const sharesRef = collection(db, 'shares');
    const q = query(
      sharesRef,
      where('sharedWithEmail', '==', normalizedEmail)
    );
    const snap = await getDocs(q);
    const now = new Date();
    return snap.docs
      .map(doc => ({ ...doc.data(), id: doc.id }))
      .filter(item => {
        if (!item.expiresAt) return true;
        const exp = typeof item.expiresAt.toDate === 'function' ? item.expiresAt.toDate() : new Date(item.expiresAt);
        return exp > now;
      });
  } catch (err) {
    console.error('getFilesSharedWithUser error:', err);
    return [];
  }
}

/**
 * Fetch files shared BY the current user (owner)
 */
export async function getFilesSharedByOwner(ownerId) {
  if (!ownerId) return [];
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const shares = getLocalShares();
    return shares.filter(s => s.ownerId === ownerId);
  }

  try {
    const sharesRef = collection(db, 'shares');
    const q = query(
      sharesRef,
      where('ownerId', '==', ownerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (err) {
    console.error('getFilesSharedByOwner error:', err);
    return [];
  }
}

/**
 * Revoke/delete a share
 */
export async function revokeShare(shareId, currentUser) {
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const shares = getLocalShares();
    const target = shares.find(s => s.shareId === shareId);
    const filtered = shares.filter(s => s.shareId !== shareId);
    saveLocalShares(filtered);

    if (target) {
      await logActivity({
        userId: currentUser.uid,
        userEmail: currentUser.email,
        action: `Revoked share access for "${target.fileName}"`,
        fileName: target.fileName,
        fileId: target.fileId,
      });
    }
    return;
  }

  const shareDocRef = doc(db, 'shares', shareId);
  const snap = await getDoc(shareDocRef);
  const data = snap.exists() ? snap.data() : null;

  await deleteDoc(shareDocRef);

  if (data) {
    await logActivity({
      userId: currentUser.uid,
      userEmail: currentUser.email,
      action: `Revoked share access for "${data.fileName}"`,
      fileName: data.fileName,
      fileId: data.fileId,
    });
  }
}

/**
 * Get share details by shareId (for public/link access)
 */
export async function getShareById(shareId) {
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const shares = getLocalShares();
    const share = shares.find(s => s.shareId === shareId);
    if (!share) return null;
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return { expired: true };
    }
    return share;
  }

  try {
    const shareDocRef = doc(db, 'shares', shareId);
    const snap = await getDoc(shareDocRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    if (data.expiresAt) {
      const exp = typeof data.expiresAt.toDate === 'function' ? data.expiresAt.toDate() : new Date(data.expiresAt);
      if (exp < new Date()) {
        return { expired: true };
      }
    }
    return { ...data, id: snap.id };
  } catch (err) {
    console.error('getShareById error:', err);
    return null;
  }
}
