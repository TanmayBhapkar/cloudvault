import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { storage, db, isFirebaseConfigured } from '../firebase/config';
import { MAX_FILE_SIZE_BYTES } from '../utils/storageQuota';
import { logActivity } from './activityService';

const LOCAL_FILES_KEY = 'cloudvault_demo_files';

function getLocalFiles() {
  try {
    const raw = localStorage.getItem(LOCAL_FILES_KEY);
    if (raw) return JSON.parse(raw);

    // Initial starter files for demonstration
    const sampleFiles = [
      {
        fileId: 'file_demo_1',
        fileName: 'Cloud_Computing_Project_Report.pdf',
        fileType: 'application/pdf',
        fileSize: 4259840, // 4.06 MB
        storagePath: 'demo/Cloud_Computing_Project_Report.pdf',
        downloadURL: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        ownerId: 'demo-admin-uid',
        ownerEmail: 'admin@cloudvault.com',
        uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        isTrash: false,
      },
      {
        fileId: 'file_demo_2',
        fileName: 'System_Architecture_Diagram.png',
        fileType: 'image/png',
        fileSize: 1843200, // 1.75 MB
        storagePath: 'demo/System_Architecture_Diagram.png',
        downloadURL: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200',
        ownerId: 'demo-admin-uid',
        ownerEmail: 'admin@cloudvault.com',
        uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        isTrash: false,
      },
      {
        fileId: 'file_demo_3',
        fileName: 'Student_Dataset_Semester_7.xlsx',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileSize: 852992, // ~833 KB
        storagePath: 'demo/Student_Dataset_Semester_7.xlsx',
        downloadURL: '#',
        ownerId: 'demo-admin-uid',
        ownerEmail: 'admin@cloudvault.com',
        uploadedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        isTrash: false,
      },
      {
        fileId: 'file_demo_4',
        fileName: 'Firebase_Firestore_Rules_Backup.txt',
        fileType: 'text/plain',
        fileSize: 12288, // 12 KB
        storagePath: 'demo/Firebase_Firestore_Rules_Backup.txt',
        downloadURL: '#',
        ownerId: 'demo-admin-uid',
        ownerEmail: 'admin@cloudvault.com',
        uploadedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        isTrash: false,
      },
      {
        fileId: 'file_demo_5',
        fileName: 'Presentation_Mini_Project_Viva.pptx',
        fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        fileSize: 14680064, // 14 MB
        storagePath: 'demo/Presentation_Mini_Project_Viva.pptx',
        downloadURL: '#',
        ownerId: 'demo-admin-uid',
        ownerEmail: 'admin@cloudvault.com',
        uploadedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
        isTrash: false,
      }
    ];
    localStorage.setItem(LOCAL_FILES_KEY, JSON.stringify(sampleFiles));
    return sampleFiles;
  } catch {
    return [];
  }
}

function saveLocalFiles(files) {
  try {
    localStorage.setItem(LOCAL_FILES_KEY, JSON.stringify(files));
  } catch (err) {
    console.error('Failed to save local files:', err);
  }
}

/**
 * Upload single file with progress tracking
 */
export function uploadSingleFile({ file, user, onProgress, onComplete, onError }) {
  // Validate size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const err = new Error(`File size (${(file.size / 1024 / 1024).toFixed(1)} MB) exceeds maximum limit of 100 MB.`);
    onError?.(err);
    return () => {};
  }

  const configured = isFirebaseConfigured() && storage && db;

  if (!configured) {
    // Simulated upload with realistic progress steps
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        // Preview URL generation for images / text
        let previewURL = '';
        if (file.type.startsWith('image/')) {
          try {
            previewURL = URL.createObjectURL(file);
          } catch {
            previewURL = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800';
          }
        }

        const newFile = {
          fileId: 'file_' + Date.now() + Math.random().toString(36).substring(2, 6),
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          storagePath: `demo/${user.uid}/${Date.now()}_${file.name}`,
          downloadURL: previewURL || '#',
          ownerId: user.uid,
          ownerEmail: user.email,
          uploadedAt: new Date().toISOString(),
          isTrash: false,
        };

        const files = getLocalFiles();
        files.unshift(newFile);
        saveLocalFiles(files);

        logActivity({
          userId: user.uid,
          userEmail: user.email,
          action: 'Uploaded file',
          fileName: file.name,
          fileId: newFile.fileId,
        });

        onProgress?.(100);
        onComplete?.(newFile);
      } else {
        onProgress?.(progress);
      }
    }, 150);

    return () => clearInterval(interval);
  }

  // Real Firebase Storage Upload
  const timestamp = Date.now();
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `users/${user.uid}/files/${timestamp}_${safeFileName}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      originalName: file.name,
      ownerUid: user.uid,
      ownerEmail: user.email,
    }
  });

  uploadTask.on(
    'state_changed',
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress?.(Math.round(progress));
    },
    (error) => {
      console.error('Firebase upload error:', error);
      onError?.(error);
    },
    async () => {
      try {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const fileId = 'file_' + timestamp + '_' + Math.random().toString(36).substring(2, 7);

        const fileDocRef = doc(db, 'files', fileId);
        const fileData = {
          fileId,
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
          storagePath,
          downloadURL,
          ownerId: user.uid,
          ownerEmail: user.email,
          uploadedAt: serverTimestamp(),
          isTrash: false,
        };

        // Write file record
        await setDoc(fileDocRef, fileData);

        // Increment user storageUsed counter in users collection
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          storageUsed: increment(file.size),
        }).catch(err => console.warn('Could not increment user storageUsed:', err));

        // Log upload activity
        await logActivity({
          userId: user.uid,
          userEmail: user.email,
          action: 'Uploaded file',
          fileName: file.name,
          fileId,
        });

        onComplete?.({
          ...fileData,
          uploadedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error saving file metadata to Firestore:', err);
        onError?.(err);
      }
    }
  );

  return () => uploadTask.cancel();
}

/**
 * Fetch active files belonging to a user
 */
export async function getUserFiles(uid) {
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const files = getLocalFiles();
    return files.filter(f => f.ownerId === uid && !f.isTrash);
  }

  try {
    const filesRef = collection(db, 'files');
    const q = query(
      filesRef,
      where('ownerId', '==', uid),
      where('isTrash', '==', false),
      orderBy('uploadedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (err) {
    console.error('getUserFiles error:', err);
    // Fallback if composite index is pending
    try {
      const qFallback = query(collection(db, 'files'), where('ownerId', '==', uid));
      const fallbackSnap = await getDocs(qFallback);
      return fallbackSnap.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter(f => !f.isTrash);
    } catch (e2) {
      console.error('Fallback error:', e2);
      return [];
    }
  }
}

/**
 * Fetch trashed files for a user
 */
export async function getTrashedFiles(uid) {
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const files = getLocalFiles();
    return files.filter(f => f.ownerId === uid && f.isTrash);
  }

  try {
    const q = query(
      collection(db, 'files'),
      where('ownerId', '==', uid),
      where('isTrash', '==', true)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (err) {
    console.error('getTrashedFiles error:', err);
    return [];
  }
}

/**
 * Move file to trash
 */
export async function moveToTrash(file, user) {
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const files = getLocalFiles();
    const idx = files.findIndex(f => f.fileId === file.fileId);
    if (idx !== -1) {
      files[idx].isTrash = true;
      files[idx].trashedAt = new Date().toISOString();
      saveLocalFiles(files);
    }
    await logActivity({
      userId: user.uid,
      userEmail: user.email,
      action: 'Moved file to trash',
      fileName: file.fileName,
      fileId: file.fileId,
    });
    return;
  }

  const fileRef = doc(db, 'files', file.fileId);
  await updateDoc(fileRef, {
    isTrash: true,
    trashedAt: serverTimestamp(),
  });

  await logActivity({
    userId: user.uid,
    userEmail: user.email,
    action: 'Moved file to trash',
    fileName: file.fileName,
    fileId: file.fileId,
  });
}

/**
 * Restore file from trash
 */
export async function restoreFromTrash(file, user) {
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const files = getLocalFiles();
    const idx = files.findIndex(f => f.fileId === file.fileId);
    if (idx !== -1) {
      files[idx].isTrash = false;
      delete files[idx].trashedAt;
      saveLocalFiles(files);
    }
    await logActivity({
      userId: user.uid,
      userEmail: user.email,
      action: 'Restored file from trash',
      fileName: file.fileName,
      fileId: file.fileId,
    });
    return;
  }

  const fileRef = doc(db, 'files', file.fileId);
  await updateDoc(fileRef, {
    isTrash: false,
    trashedAt: null,
  });

  await logActivity({
    userId: user.uid,
    userEmail: user.email,
    action: 'Restored file from trash',
    fileName: file.fileName,
    fileId: file.fileId,
  });
}

/**
 * Permanently delete file from Cloud Storage & Firestore
 */
export async function permanentlyDeleteFile(file, user) {
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const files = getLocalFiles();
    const filtered = files.filter(f => f.fileId !== file.fileId);
    saveLocalFiles(filtered);
    await logActivity({
      userId: user.uid,
      userEmail: user.email,
      action: 'Permanently deleted file',
      fileName: file.fileName,
      fileId: file.fileId,
    });
    return;
  }

  // 1. Delete from Firebase Cloud Storage
  if (storage && file.storagePath) {
    try {
      const storageRef = ref(storage, file.storagePath);
      await deleteObject(storageRef);
    } catch (storageErr) {
      console.warn('Storage delete warning (file might already be removed):', storageErr);
    }
  }

  // 2. Delete from Firestore
  const fileRef = doc(db, 'files', file.fileId);
  await deleteDoc(fileRef);

  // 3. Decrement user storageUsed
  if (file.fileSize && user.uid) {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        storageUsed: increment(-Math.abs(file.fileSize)),
      });
    } catch (userErr) {
      console.warn('Could not decrement storageUsed:', userErr);
    }
  }

  // 4. Log permanent deletion
  await logActivity({
    userId: user.uid,
    userEmail: user.email,
    action: 'Permanently deleted file',
    fileName: file.fileName,
    fileId: file.fileId,
  });
}

/**
 * Rename file
 */
export async function renameFile(fileId, newName, user) {
  const configured = isFirebaseConfigured() && db;

  if (!configured) {
    const files = getLocalFiles();
    const target = files.find(f => f.fileId === fileId);
    if (target) {
      target.fileName = newName;
      target.updatedAt = new Date().toISOString();
      saveLocalFiles(files);
      await logActivity({
        userId: user.uid,
        userEmail: user.email,
        action: 'Renamed file to ' + newName,
        fileName: newName,
        fileId,
      });
    }
    return;
  }

  const fileRef = doc(db, 'files', fileId);
  await updateDoc(fileRef, {
    fileName: newName,
    updatedAt: serverTimestamp(),
  });

  await logActivity({
    userId: user.uid,
    userEmail: user.email,
    action: 'Renamed file to ' + newName,
    fileName: newName,
    fileId,
  });
}

/**
 * Download file helper
 */
export function triggerFileDownload(file) {
  if (!file || !file.downloadURL) return;

  if (file.downloadURL.startsWith('blob:') || file.downloadURL.startsWith('http')) {
    const anchor = document.createElement('a');
    anchor.href = file.downloadURL;
    anchor.download = file.fileName || 'download';
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } else {
    // Demo fallback for non-URL files
    const blob = new Blob([`Sample content for ${file.fileName}\nGenerated by CloudVault.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}
