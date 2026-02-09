import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initializeApp,
  getApps,
  getApp
} from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut // ✅ NEW: Added for logout functionality
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  getDocs,
  deleteDoc,
  getDoc
} from 'firebase/firestore';

// ============================================================================
// FIREBASE CONFIGURATION - For Vite use import.meta.env
// ============================================================================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log('🔍 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? '✅ Set' : '❌ Missing'
});

let app, auth, db;

// Initialize Firebase
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase initialized');
} catch (error) {
  console.error('❌ Firebase init error:', error);
}

// ============================================================================
// FIREBASE CONTEXT - Data Persistence Layer
// ============================================================================

const FirebaseAppContext = createContext();

export const useFirebase = () => {
  const context = useContext(FirebaseAppContext);
  if (!context) {
    console.warn('⚠️ useFirebase called outside FirebaseAppProvider. Using fallback.');
    return null;
  }
  return context;
};

export const FirebaseAppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ NEW: Loading state for auth
  const [authInitialized, setAuthInitialized] = useState(false); // ✅ NEW: Track if auth is ready

  // ✅ UPDATED: Initialize Firebase Auth (now supports email/Google AND anonymous)
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!auth) {
          console.error('❌ Firebase auth not initialized');
          setIsInitialized(true);
          setLoading(false);
          setAuthInitialized(true);
          return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            // User is signed in (could be email, Google, or anonymous)
            console.log('✅ User authenticated:', currentUser.uid);
            
            // ✅ NEW: Enhanced user object with real email support
            setUser({
              uid: currentUser.uid,
              email: currentUser.email || `anon-${currentUser.uid}@sprint-tracker.local`,
              displayName: currentUser.displayName || null,
              photoURL: currentUser.photoURL || null,
              isAnonymous: currentUser.isAnonymous,
              emailVerified: currentUser.emailVerified
            });
            
            // Log auth method
            if (currentUser.isAnonymous) {
              console.log('👤 Anonymous user');
            } else if (currentUser.email) {
              console.log('📧 Email user:', currentUser.email);
            }
          } else {
            // ✅ CHANGED: Don't auto-sign in anonymously
            // Let the AuthScreen handle login now
            console.log('❌ No user authenticated');
            setUser(null);
          }
          
          setIsInitialized(true);
          setLoading(false);
          setAuthInitialized(true);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
        setError(err.message);
        setIsInitialized(true);
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // ============================================================================
  // ✅ NEW: AUTHENTICATION METHODS
  // ============================================================================

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      console.log('✅ User signed out');
      setUser(null);
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  };

  // Helper functions
  const getUserId = () => user?.uid || null;
  const getUserEmail = () => user?.email || null;
  const isAnonymous = () => user?.isAnonymous || false;
  const isAuthenticated = !!user;

  // ============================================================================
  // DATA PERSISTENCE METHODS - FIRESTORE (All your existing methods preserved!)
  // ============================================================================

  const loadSprints = async () => {
    try {
      if (!user || !db) {
        console.log('⚠️ No user or Firebase');
        return [];
      }
      
      console.log('🔄 Loading sprints from Firestore');
      const sprintsCollection = collection(db, 'users', user.uid, 'sprints');
      const querySnapshot = await getDocs(sprintsCollection);
      
      const sprints = [];
      querySnapshot.forEach((doc) => {
        sprints.push({
          ...doc.data(),
          id: doc.id
        });
      });

      console.log('✅ Loaded sprints from Firestore:', sprints.length, 'sprints');
      return sprints;
    } catch (err) {
      console.error('❌ Error loading sprints:', err);
      setError(err.message);
      return [];
    }
  };

  const saveSprint = async (sprint) => {
    try {
      if (!user || !db) {
        console.warn('⚠️ Cannot save: no user');
        return false;
      }

      if (!sprint.id || !sprint.name) {
        console.error('❌ Invalid sprint data:', sprint);
        return false;
      }

      console.log('💾 Saving sprint to Firestore:', sprint.name);
      const sprintRef = doc(db, 'users', user.uid, 'sprints', String(sprint.id));
      await setDoc(sprintRef, {
        ...sprint,
        updatedAt: new Date().toISOString()
      });

      console.log('✅ Saved sprint:', sprint.name);
      return true;
    } catch (err) {
      console.error('❌ Error saving sprint:', err);
      setError(err.message);
      return false;
    }
  };

  const deleteSprint = async (sprintId) => {
    try {
      if (!user || !db) return false;

      console.log('🗑️ Deleting sprint:', sprintId);
      const sprintRef = doc(db, 'users', user.uid, 'sprints', sprintId);
      await deleteDoc(sprintRef);

      console.log('✅ Deleted sprint:', sprintId);
      return true;
    } catch (err) {
      console.error('❌ Error deleting sprint:', err);
      setError(err.message);
      return false;
    }
  };

  const saveAppState = async (state) => {
    try {
      if (!user || !db) return false;

      console.log('💾 Saving app state to Firestore');
      const stateRef = doc(db, 'users', user.uid, 'state', 'appState');
      await setDoc(stateRef, {
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        lastCheckIn: state.lastCheckIn,
        username: state.username,
        friends: state.friends,
        unlockedBadges: state.unlockedBadges,
        notificationsEnabled: state.notificationsEnabled,
        savedAt: new Date().toISOString()
      });

      console.log('💾 Saved app state');
      return true;
    } catch (err) {
      console.error('❌ Error saving app state:', err);
      setError(err.message);
      return false;
    }
  };

  const loadAppState = async () => {
    try {
      if (!user || !db) return null;

      console.log('🔄 Loading app state from Firestore');
      const stateRef = doc(db, 'users', user.uid, 'state', 'appState');
      const docSnap = await getDoc(stateRef);

      if (docSnap.exists()) {
        console.log('✅ Loaded app state');
        return docSnap.data();
      }

      console.log('📭 No app state found');
      return null;
    } catch (err) {
      console.error('❌ Error loading app state:', err);
      setError(err.message);
      return null;
    }
  };

  const clearAllData = async () => {
    try {
      if (!user || !db) return false;

      console.log('🧹 Clearing all data from Firestore');
      const sprintsCollection = collection(db, 'users', user.uid, 'sprints');
      const querySnapshot = await getDocs(sprintsCollection);
      
      querySnapshot.forEach(async (docSnap) => {
        await deleteDoc(docSnap.ref);
      });

      const stateRef = doc(db, 'users', user.uid, 'state', 'appState');
      await deleteDoc(stateRef);

      console.log('🧹 Cleared all data');
      return true;
    } catch (err) {
      console.error('❌ Error clearing data:', err);
      setError(err.message);
      return false;
    }
  };

  const exportData = async () => {
    try {
      if (!user) return null;

      const sprints = await loadSprints();
      const appState = await loadAppState();

      const exportData = {
        user: user.uid,
        exportDate: new Date().toISOString(),
        sprints: sprints || [],
        appState: appState || {}
      };

      return exportData;
    } catch (err) {
      console.error('❌ Error exporting data:', err);
      setError(err.message);
      return null;
    }
  };

  const importData = async (data) => {
    try {
      if (!user || !db || !data.sprints) return false;

      console.log('📥 Importing data');
      
      // Import sprints
      for (const sprint of data.sprints) {
        if (sprint.id) {
          const sprintRef = doc(db, 'users', user.uid, 'sprints', sprint.id);
          await setDoc(sprintRef, {
            ...sprint,
            importedAt: new Date().toISOString()
          });
        }
      }

      // Import app state if present
      if (data.appState) {
        const stateRef = doc(db, 'users', user.uid, 'state', 'appState');
        await setDoc(stateRef, {
          ...data.appState,
          importedAt: new Date().toISOString()
        });
      }

      console.log('✅ Imported data successfully');
      return true;
    } catch (err) {
      console.error('❌ Error importing data:', err);
      setError(err.message);
      return false;
    }
  };

  // ============================================================================
  // DATA BACKUP & RECOVERY (Using Firestore)
  // ============================================================================

  const createBackup = async () => {
    try {
      const data = await exportData();
      if (!user || !db || !data) return null;

      console.log('💾 Creating backup');
      const backupRef = doc(db, 'users', user.uid, 'backups', `backup_${Date.now()}`);
      await setDoc(backupRef, {
        ...data,
        backupCreatedAt: new Date().toISOString()
      });

      console.log('✅ Backup created');
      return `backup_${Date.now()}`;
    } catch (err) {
      console.error('❌ Error creating backup:', err);
      setError(err.message);
      return null;
    }
  };

  const listBackups = async () => {
    try {
      if (!user || !db) return [];

      console.log('🔄 Loading backups');
      const backupsCollection = collection(db, 'users', user.uid, 'backups');
      const querySnapshot = await getDocs(backupsCollection);
      
      const backups = [];
      querySnapshot.forEach((doc) => {
        backups.push({
          key: doc.id,
          date: doc.data().backupCreatedAt || new Date().toLocaleString()
        });
      });

      return backups.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (err) {
      console.error('❌ Error listing backups:', err);
      return [];
    }
  };

  const restoreBackup = async (backupKey) => {
    try {
      if (!user || !db) return false;

      console.log('🔄 Restoring backup:', backupKey);
      const backupRef = doc(db, 'users', user.uid, 'backups', backupKey);
      const backupSnap = await getDoc(backupRef);

      if (!backupSnap.exists()) {
        console.error('❌ Backup not found:', backupKey);
        return false;
      }

      const data = backupSnap.data();
      return await importData(data);
    } catch (err) {
      console.error('❌ Error restoring backup:', err);
      setError(err.message);
      return false;
    }
  };

  // ============================================================================
  // DATA VALIDATION
  // ============================================================================

  const validateSprints = async () => {
    try {
      const sprints = await loadSprints();
      if (!sprints) return { valid: true, issues: [] };

      const issues = [];

      sprints.forEach((sprint, idx) => {
        if (!sprint.id) issues.push(`Sprint ${idx}: missing id`);
        if (!sprint.name) issues.push(`Sprint ${idx}: missing name`);
        if (!Array.isArray(sprint.weeklyTasks)) issues.push(`Sprint ${idx}: weeklyTasks not an array`);
        if (!Array.isArray(sprint.completedTasks)) issues.push(`Sprint ${idx}: completedTasks not an array`);
      });

      if (issues.length > 0) {
        console.warn('⚠️ Validation issues found:', issues);
      }

      return { valid: issues.length === 0, issues };
    } catch (err) {
      console.error('❌ Error validating sprints:', err);
      return { valid: false, issues: [err.message] };
    }
  };

  const repairData = async () => {
    try {
      const sprints = await loadSprints();
      if (!sprints) return false;

      console.log('🔧 Repairing data');
      for (const sprint of sprints) {
        const repaired = {
          ...sprint,
          id: sprint.id || `sprint-${Date.now()}`,
          name: sprint.name || 'Unnamed Sprint',
          weeklyTasks: Array.isArray(sprint.weeklyTasks) ? sprint.weeklyTasks : [],
          completedTasks: Array.isArray(sprint.completedTasks) ? sprint.completedTasks : [],
          createdAt: sprint.createdAt || new Date().toISOString(),
          startDate: sprint.startDate || new Date().toISOString().split('T')[0],
          endDate: sprint.endDate || new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        
        await saveSprint(repaired);
      }

      console.log('✅ Data repaired. Fixed', sprints.length, 'sprints');
      return true;
    } catch (err) {
      console.error('❌ Error repairing data:', err);
      setError(err.message);
      return false;
    }
  };

  // ============================================================================
  // CONTEXT VALUE - ✅ UPDATED with new auth features
  // ============================================================================

  const value = {
    // ✅ NEW: Firebase instances (needed for AuthScreen)
    app,
    auth,
    db,
    
    // ✅ NEW: Auth state
    user,
    loading,
    authInitialized,
    isAuthenticated,
    
    // Legacy/compatibility
    isInitialized,
    error,
    setError,
    
    // ✅ NEW: Auth methods
    logout,
    getUserId,
    getUserEmail,
    isAnonymous,
    
    // Data loading/saving (all preserved!)
    loadSprints,
    saveSprint,
    deleteSprint,
    saveAppState,
    loadAppState,
    clearAllData,
    exportData,
    importData,
    
    // Backups (all preserved!)
    createBackup,
    listBackups,
    restoreBackup,
    
    // Validation (all preserved!)
    validateSprints,
    repairData
  };

  return (
    <FirebaseAppContext.Provider value={value}>
      {children}
    </FirebaseAppContext.Provider>
  );
};
