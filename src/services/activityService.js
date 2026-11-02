import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

const LOCAL_ACTIVITY_KEY = 'cloudvault_demo_activities';

function getLocalActivities() {
  try {
    const data = localStorage.getItem(LOCAL_ACTIVITY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalActivities(activities) {
  try {
    localStorage.setItem(LOCAL_ACTIVITY_KEY, JSON.stringify(activities));
  } catch (err) {
    console.error('Failed to save local activity:', err);
  }
}

/**
 * Log a user action to the activity collection
 */
export async function logActivity({ userId, userEmail, action, fileName, fileId = null }) {
  const timestamp = new Date();
  const activityData = {
    userId: userId || 'anonymous',
    userEmail: userEmail || 'user@example.com',
    action,
    fileName: fileName || '',
    fileId: fileId || '',
    timestamp,
  };

  if (!isFirebaseConfigured() || !db) {
    const local = getLocalActivities();
    local.unshift({
      ...activityData,
      activityId: 'act_' + Date.now() + Math.random().toString(36).substring(2, 7),
      timestamp: timestamp.toISOString(),
    });
    saveLocalActivities(local.slice(0, 100));
    return;
  }

  try {
    const activityRef = collection(db, 'activity');
    await addDoc(activityRef, {
      ...activityData,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging activity to Firestore:', error);
  }
}

/**
 * Fetch recent activity for a specific user
 */
export async function getUserActivities(userId, limitCount = 10) {
  if (!isFirebaseConfigured() || !db) {
    const local = getLocalActivities();
    return local.filter(a => a.userId === userId).slice(0, limitCount);
  }

  try {
    const activityRef = collection(db, 'activity');
    const q = query(
      activityRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      activityId: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return [];
  }
}

/**
 * Fetch all platform activities for Admin
 */
export async function getAllActivities(limitCount = 50) {
  if (!isFirebaseConfigured() || !db) {
    return getLocalActivities().slice(0, limitCount);
  }

  try {
    const activityRef = collection(db, 'activity');
    const q = query(activityRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      activityId: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching all activities:', error);
    return [];
  }
}
