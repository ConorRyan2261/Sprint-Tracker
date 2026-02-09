import React from 'react';
import { useFirebase } from './context/FirebaseAppContext';
import AuthScreen from './AuthScreen';

const AuthWrapper = ({ children }) => {
  const { user, loading, authInitialized } = useFirebase();

  // Show loading spinner while checking auth state
  if (!authInitialized || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <div className="w-12 h-12 mx-auto border-4 border-slate-700 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-slate-400 mt-4">Loading Sprint Tracker...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!user) {
    return <AuthScreen />;
  }

  // Show main app if logged in
  return children;
};

export default AuthWrapper;
