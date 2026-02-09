import {
  doc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser } from './auth';

export const saveSprint = async (sprint: any) => {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');

  const sprintRef = doc(db, 'users', user.uid, 'sprints', sprint.id.toString());
  await setDoc(sprintRef, {
    ...sprint,
    updatedAt: serverTimestamp()
  });
  console.log('Sprint saved:', sprint.name);
};

export const getSprints = async () => {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');

  const sprintsRef = collection(db, 'users', user.uid, 'sprints');
  const q = query(sprintsRef);
  const snapshot = await getDocs(q);

  const sprints = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: parseInt(doc.id)
  }));
  
  console.log('Got sprints:', sprints.length);
  return sprints;
};

export const updateSprint = async (sprintId: number, updates: any) => {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');

  const sprintRef = doc(db, 'users', user.uid, 'sprints', sprintId.toString());
  await updateDoc(sprintRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
  console.log('Sprint updated:', sprintId);
};

export const saveSettings = async (settings: any) => {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');

  const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
  await setDoc(settingsRef, {
    ...settings,
    updatedAt: serverTimestamp()
  }, { merge: true });
  console.log('Settings saved');
};

export const getSettings = async () => {
  const user = getCurrentUser();
  if (!user) throw new Error('Not logged in');

  const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
  const settingsSnapshot = await getDocs(collection(db, 'users', user.uid, 'settings'));
  
  const settings: any = {};
  settingsSnapshot.docs.forEach(doc => {
    Object.assign(settings, doc.data());
  });
  
  return settings;
};
