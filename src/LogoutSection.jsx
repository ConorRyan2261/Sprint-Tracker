import React, { useState } from 'react';
import { useFirebase } from './context/FirebaseAppContext';

const LogoutSection = () => {
  const { user, logout } = useFirebase();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!confirm('Are you sure you want to sign out?')) {
      return;
    }

    setLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to sign out. Please try again.');
      setLoggingOut(false);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">Account</h3>
      
      {/* User Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
          <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold">
            {user?.email?.[0]?.toUpperCase() || user?.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.displayName || 'User'}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {user?.email || 'No email'}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 disabled:bg-slate-700 border border-red-600 text-red-300 disabled:text-slate-500 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loggingOut ? (
          <>
            <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
            <span>Signing out...</span>
          </>
        ) : (
          <>
            <span>🚪</span>
            <span>Sign Out</span>
          </>
        )}
      </button>

      <p className="text-xs text-slate-500 text-center">
        Your data is securely stored in the cloud
      </p>
    </div>
  );
};

export default LogoutSection;
