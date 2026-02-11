// ✅ FIREBASE IMPORTS - ADD AT VERY TOP
import { FirebaseAppProvider, useFirebase } from './context/FirebaseAppContext';
import { dateUtils, dataValidation, storageUtils } from './utils';
import AuthWrapper from './AuthWrapper';
import LogoutSection from './LogoutSection';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

// ============================================================================
// LOADING & UI COMPONENTS
// ============================================================================

const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClass} border-4 border-slate-700 border-t-violet-600 rounded-full animate-spin`} />
    </div>
  );
};

const SkeletonBox = ({ height = 'h-6', width = 'w-full', className = '' }) => (
  <div className={`${height} ${width} bg-slate-800 rounded animate-pulse ${className}`} />
);

const SkeletonCard = ({ lines = 3 }) => (
  <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
    <SkeletonBox height="h-6" width="w-2/3" />
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBox key={i} height="h-4" width={i === lines - 1 ? 'w-4/5' : 'w-full'} />
    ))}
  </div>
);

// ERROR BOUNDARY
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Oops! Something went wrong</h2>
            <p className="text-slate-400 mb-6">The app encountered an error. Try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-500 font-semibold"
            >
              🔄 Refresh Page
            </button>
            <details className="mt-6 text-left">
              <summary className="text-slate-400 cursor-pointer text-sm">Error details</summary>
              <pre className="bg-slate-800 p-3 rounded mt-2 text-xs text-red-400 overflow-auto max-h-40">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// NOTIFICATION TOAST SYSTEM
const NotificationToast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600 border-green-500' :
                type === 'error' ? 'bg-red-600 border-red-500' :
                type === 'info' ? 'bg-blue-600 border-blue-500' :
                'bg-violet-600 border-violet-500';

  const textColor = type === 'success' ? 'text-white' :
                  type === 'error' ? 'text-white' :
                  type === 'info' ? 'text-white' :
                  'text-white';

  const icon = type === 'success' ? '✓' :
               type === 'error' ? '✕' :
               type === 'info' ? 'ℹ' :
               '★';

 return (
  <div className={`p-4 rounded-lg border-2 ${bgColor} ${textColor} flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 shadow-xl`}>
      <span className="text-xl font-bold">{icon}</span>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-lg hover:opacity-70 transition-opacity">×</button>
    </div>
  );
};

// ============================================================================
// ONBOARDING COMPONENTS
// ============================================================================

const OnboardingSpotlight = ({ targetId, position = 'bottom', children, onNext, onSkip, step, totalSteps }) => {
  const [spotlightStyle, setSpotlightStyle] = useState({});

  useEffect(() => {
    if (targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setSpotlightStyle({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        });
      }
    }
  }, [targetId]);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with hole */}
      <div className="absolute inset-0 bg-black/80" />
      
      {/* Spotlight hole */}
      {targetId && (
        <div 
          className="absolute border-4 border-violet-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] animate-pulse"
          style={spotlightStyle}
        />
      )}

      {/* Content card */}
      <div className={`absolute bg-slate-900 border-2 border-violet-500 rounded-xl p-6 max-w-sm shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 ${
        position === 'bottom' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' :
        position === 'top' ? 'bottom-24 left-1/2 -translate-x-1/2' :
        'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
      }`}>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-violet-400">STEP {step} OF {totalSteps}</span>
            <button onClick={onSkip} className="text-slate-400 hover:text-white text-sm">Skip Tutorial</button>
          </div>
          <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-violet-600 h-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-white space-y-3">
          {children}
        </div>

        <button
          onClick={onNext}
          className="mt-4 w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all"
        >
          {step === totalSteps ? '🎉 Get Started!' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

const WelcomeModal = ({ onStartTour, onSkip }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-violet-500 rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Animated Logo */}
        <div className="text-center mb-6">
          <div className="text-7xl mb-4 animate-bounce">⚡</div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Sprint Tracker!</h1>
          <p className="text-slate-300 text-lg">Turn big goals into achievable sprints</p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
            <span className="text-2xl">🎯</span>
            <div>
              <h3 className="font-bold text-white">6-Week Sprints</h3>
              <p className="text-sm text-slate-400">Break goals into manageable tasks</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
            <span className="text-2xl">💫</span>
            <div>
              <h3 className="font-bold text-white">XP & Levels</h3>
              <p className="text-sm text-slate-400">Gamify your progress, stay motivated</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
            <span className="text-2xl">📅</span>
            <div>
              <h3 className="font-bold text-white">Smart Scheduling</h3>
              <p className="text-sm text-slate-400">Track and reschedule tasks easily</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
            <span className="text-2xl">🏆</span>
            <div>
              <h3 className="font-bold text-white">Achievements</h3>
              <p className="text-sm text-slate-400">Unlock badges and build streaks</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-3 border-2 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 font-semibold transition-colors"
          >
            Skip Tour
          </button>
          <button
            onClick={onStartTour}
            className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:from-violet-500 hover:to-fuchsia-500 font-bold transition-all shadow-lg"
          >
            Take 30s Tour ✨
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          You can always access this tour again from the help button
        </p>
      </div>
    </div>
  );
};

const HelpButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 md:bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-40 flex items-center justify-center text-2xl font-bold border-2 border-white/20"
      title="Help & Tutorial"
    >
      ?
    </button>
  );
};

const OnboardingTutorial = () => {
  const { onboardingStep, setOnboardingStep, completeOnboarding, setCurrentScreen } = useApp();

  const handleNext = () => {
    if (onboardingStep === 5) {
      completeOnboarding();
      setCurrentScreen('sprints');
    } else {
      setOnboardingStep(onboardingStep + 1);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  // Tutorial Steps
  const steps = [
    {
      targetId: null,
      content: null
    },
    {
      targetId: 'create-sprint-button',
      position: 'bottom',
      content: (
        <>
          <h3 className="text-xl font-bold mb-2">👆 Start Here!</h3>
          <p className="text-slate-300">
            Create a sprint for any goal - fitness, learning, career, anything!
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Our smart templates will generate a personalized 6-week plan.
          </p>
        </>
      )
    },
    {
      targetId: 'calendar-nav',
      position: 'top',
      content: (
        <>
          <h3 className="text-xl font-bold mb-2">📅 Track Everything</h3>
          <p className="text-slate-300">
            All your tasks appear in the calendar. Drag to reschedule, click to edit!
          </p>
          <p className="text-sm text-slate-400 mt-2">
            Use list view on mobile for the best experience.
          </p>
        </>
      )
    },
    {
      targetId: 'xp-level-display',
      position: 'bottom',
      content: (
        <>
          <h3 className="text-xl font-bold mb-2">💫 Earn XP & Level Up!</h3>
          <p className="text-slate-300">
            Complete tasks, check in daily, finish sprints - everything earns XP!
          </p>
          <ul className="text-sm text-slate-400 mt-2 space-y-1">
            <li>✓ Complete task: +10 XP</li>
            <li>✓ Daily check-in: +25 XP</li>
            <li>✓ Finish sprint: +50 XP</li>
          </ul>
        </>
      )
    },
    {
      targetId: 'achievements-nav',
      position: 'top',
      content: (
        <>
          <h3 className="text-xl font-bold mb-2">🏆 Unlock Achievements</h3>
          <p className="text-slate-300">
            Build streaks, earn badges, compete on leaderboards!
          </p>
          <p className="text-sm text-slate-400 mt-2">
            7-day streaks, 30-day streaks, and special milestone badges.
          </p>
        </>
      )
    },
    {
      targetId: null,
      position: 'center',
      content: (
        <>
          <h3 className="text-2xl font-bold mb-2">🎉 You're All Set!</h3>
          <p className="text-slate-300 mb-4">
            Ready to create your first sprint and start leveling up?
          </p>
          <div className="p-4 bg-violet-600/20 border border-violet-500 rounded-lg">
            <p className="text-sm text-violet-200">
              <strong>💡 Pro Tip:</strong> Start with a smaller goal (2-4 weeks) to get a feel for the system!
            </p>
          </div>
        </>
      )
    }
  ];

  const currentStep = steps[onboardingStep];

  if (onboardingStep === 0) {
    return null;
  }

  if (!currentStep.content) return null;

  return (
    <OnboardingSpotlight
      targetId={currentStep.targetId}
      position={currentStep.position}
      step={onboardingStep}
      totalSteps={5}
      onNext={handleNext}
      onSkip={handleSkip}
    >
      {currentStep.content}
    </OnboardingSpotlight>
  );
};

// ============================================================================
// CONTEXT & STATE MANAGEMENT
// ============================================================================

const AppContext = createContext();
const useApp = () => useContext(AppContext);

const AppProvider = ({ children }) => {
  const firebase = useFirebase(); // ✅ GET FIREBASE
  const [sprints, setSprints] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('sprints');
  const [selectedSprintId, setSelectedSprintId] = useState(null);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [username, setUsername] = useState('User');
  const [friends, setFriends] = useState([]);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [taskSchedules, setTaskSchedules] = useState({});
  const [timeLogged, setTimeLogged] = useState({});
  const [habits, setHabits] = useState([]);
  const [completedSprints, setCompletedSprints] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [userId] = useState('user-' + Math.random().toString(36).substr(2, 9));
  const [sprintInsights, setSprintInsights] = useState({});
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [toastNotifications, setToastNotifications] = useState([]);

  // Onboarding state
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    const saved = localStorage.getItem('hasSeenOnboarding');
    return saved === 'true';
  });
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // ✅ LOAD FROM FIREBASE
  useEffect(() => {
    if (firebase?.user && firebase?.loadSprints) {
      console.log('🔄 Loading sprints from Firebase...');
      const loadData = async () => {
        try {
          const saved = await firebase.loadSprints();
          if (saved && saved.length > 0) {
            console.log('✅ Loaded', saved.length, 'sprints from Firebase');
            setSprints(saved);
          }
        } catch (error) {
          console.error('❌ Error loading from Firebase:', error);
        }
      };
      loadData();
    } else {
      // Fallback to localStorage if Firebase not ready
      const saved = localStorage.getItem('sprintTrackerData');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setSprints(data.sprints || []);
          setXp(data.xp || 0);
          setLevel(data.level || 1);
          setStreak(data.streak || 0);
          setLastCheckIn(data.lastCheckIn || null);
          setUsername(data.username || 'User');
          setFriends(data.friends || []);
          setUnlockedBadges(data.unlockedBadges || []);
          setTaskSchedules(data.taskSchedules || {});
          setTimeLogged(data.timeLogged || {});
          setHabits(data.habits || []);
          setCompletedSprints(data.completedSprints || []);
        } catch (error) {
          console.error('Failed to load saved data:', error);
        }
      }
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [firebase?.user]);

  // ✅ AUTO-SAVE TO FIREBASE
  useEffect(() => {
    if (firebase?.user && firebase?.saveSprint && sprints.length > 0) {
      console.log('💾 Auto-saving', sprints.length, 'sprints to Firebase');
      sprints.forEach(sprint => {
        firebase.saveSprint(sprint).catch(err => console.error('Save error:', err));
      });
    } else {
      // Fallback to localStorage
      const dataToSave = {
        sprints,
        xp,
        level,
        streak,
        lastCheckIn,
        username,
        friends,
        unlockedBadges,
        taskSchedules,
        timeLogged,
        habits,
        completedSprints
      };
      localStorage.setItem('sprintTrackerData', JSON.stringify(dataToSave));
    }
  }, [sprints, xp, level, streak, lastCheckIn, username, friends, unlockedBadges, taskSchedules, timeLogged, habits, completedSprints, firebase?.user]);

  const addSprint = (sprint) => {
    const newSprint = {
      ...sprint,
      id: Date.now().toString(),
      weeklyTasks: sprint.weeklyTasks || [],
      completedTasks: sprint.completedTasks || [],
      createdAt: new Date().toISOString(),
      privacy: sprint.privacy || { goals: {} },
    };
    setSprints(prev => [...prev, newSprint]);
    
    // Auto-schedule tasks on calendar
    sprint.weeklyTasks?.forEach((task, idx) => {
      const taskDate = new Date();
      taskDate.setDate(taskDate.getDate() + (task.week * 7));
      scheduleTask(`${newSprint.id}-${idx}`, taskDate.toISOString().split('T')[0], 0);
    });

    return newSprint;
  };

  const deleteSprint = (sprintId) => {
    setSprints(prev => prev.filter(s => s.id !== sprintId));
  };

  const updateSprint = (sprintId, updates) => {
    setSprints(prev => prev.map(s => s.id === sprintId ? { ...s, ...updates } : s));
  };

  const toggleTaskComplete = (sprintId, taskIndex) => {
    setSprints(prev => prev.map(s => {
      if (s.id === sprintId) {
        const updatedCompleted = [...(s.completedTasks || [])];
        const index = updatedCompleted.indexOf(taskIndex);
        if (index > -1) {
          updatedCompleted.splice(index, 1);
        } else {
          updatedCompleted.push(taskIndex);
          addXP(30 + (taskIndex * 5)); // Award XP for completion
          showNotification('Task Completed! 🎉', `You earned ${30 + (taskIndex * 5)} XP`);
        }
        return { ...s, completedTasks: updatedCompleted };
      }
      return s;
    }));
  };

  const scheduleTask = (taskId, date, postponeCount = 0) => {
    setTaskSchedules(prev => ({ ...prev, [taskId]: { date, postponeCount } }));
  };

  const postponeTask = (taskId) => {
    const current = taskSchedules[taskId] || { date: new Date().toISOString().split('T')[0], postponeCount: 0 };
    const nextDate = new Date(current.date);
    nextDate.setDate(nextDate.getDate() + 1);
    scheduleTask(taskId, nextDate.toISOString().split('T')[0], current.postponeCount + 1);
  };

  const addXP = (amount) => {
    const newXp = xp + amount;
    setXp(newXp);
    
    // Level up at 500 XP increments
    const newLevel = Math.floor(newXp / 500) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      showNotification('Level Up! 🎊', `You reached Level ${newLevel}`);
    }
  };

  const logTime = (taskId, hours) => {
    setTimeLogged(prev => ({
      ...prev,
      [taskId]: (prev[taskId] || 0) + hours
    }));
    addXP(Math.floor(hours * 2)); // 2 XP per hour
  };

  const addHabit = (habit) => {
    setHabits([...habits, {
      id: Date.now().toString(),
      ...habit,
      completed: false,
      lastCompleted: null
    }]);
  };

  const completeHabit = (habitId) => {
    setHabits(habits.map(h => 
      h.id === habitId 
        ? { ...h, completed: true, lastCompleted: new Date().toISOString() }
        : h
    ));
    addXP(5);
  };

  const showNotification = (title, message, type = 'success') => {
    // Show toast notification
    const id = Date.now();
    const notification = { id, message: `${title} ${message}`, type };
    setToastNotifications(prev => [...prev, notification]);
    
    // Show push notification if enabled
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '🎯',
        tag: 'sprint-tracker',
        requireInteraction: false
      });
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }
    
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      showNotification('✓ Notifications Enabled', 'You\'ll get reminders for sprints!', 'success');
      return;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        showNotification('✓ Notifications Enabled', 'You\'ll get daily reminders!', 'success');
      }
    }
  };

  const scheduleReminder = (type = 'daily-check-in') => {
    if (!notificationsEnabled) return;
    
    // Browser doesn't support scheduled notifications natively
    // This would need a backend service worker for true scheduled notifications
    // For now, we'll use in-app reminders
    console.log('Reminder scheduled:', type);
  };

  const dailyCheckIn = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastCheck = lastCheckIn ? new Date(lastCheckIn).toISOString().split('T')[0] : null;
    if (lastCheck === today) return false;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastCheck === yesterdayStr) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(1);
    }
    setLastCheckIn(new Date().toISOString());
    addXP(25);
    showNotification('Check-in Complete! ✅', 'You earned 25 XP');
    return true;
  };

  const checkBadges = () => {
    const newBadges = [];
    if (xp >= 100 && !unlockedBadges.includes('first-100')) newBadges.push('first-100');
    if (xp >= 500 && !unlockedBadges.includes('xp-500')) newBadges.push('xp-500');
    if (streak >= 7 && !unlockedBadges.includes('seven-day-streak')) newBadges.push('seven-day-streak');
    if (completedSprints.length >= 5 && !unlockedBadges.includes('sprint-master')) newBadges.push('sprint-master');
    
    if (newBadges.length > 0) {
      setUnlockedBadges([...unlockedBadges, ...newBadges]);
      newBadges.forEach(badge => {
        showNotification('Badge Unlocked! 🏆', `You earned the ${badge} badge!`);
      });
    }
  };

  const viewSprintDetails = (sprintId) => {
    setSelectedSprintId(sprintId);
    setCurrentScreen('sprint-detail');
  };

  // ANALYTICS & INSIGHTS ENGINE
  const calculateSprintInsights = (sprint) => {
    if (!sprint) return null;
    
    const totalTasks = sprint.weeklyTasks?.length || 0;
    const completedTasks = sprint.completedTasks?.length || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Calculate postponement data
    let totalPostponements = 0;
    let maxPostpones = 0;
    sprint.weeklyTasks?.forEach((task, idx) => {
      const taskId = `${sprint.id}-${idx}`;
      const postponeCount = taskSchedules[taskId]?.postponeCount || 0;
      totalPostponements += postponeCount;
      maxPostpones = Math.max(maxPostpones, postponeCount);
    });
    
    const avgPostponements = totalTasks > 0 ? Math.round(totalPostponements / totalTasks * 10) / 10 : 0;
    
    // Difficulty assessment
    const hoursLogged = sprint.weeklyTasks?.reduce((sum, _, idx) => {
      const taskId = `${sprint.id}-${idx}`;
      return sum + (timeLogged[taskId] || 0);
    }, 0) || 0;
    
    return {
      sprintId: sprint.id,
      name: sprint.name,
      goal: sprint.goal,
      completionRate,
      totalTasks,
      completedTasks,
      totalPostponements,
      avgPostponements,
      maxPostpones,
      hoursLogged,
      difficulty: hoursLogged > 20 ? 'Hard' : hoursLogged > 10 ? 'Medium' : 'Easy',
      createdDate: sprint.createdAt,
      categories: sprint.goalCategories || []
    };
  };

  const generateWeeklyReport = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const thisWeekSprints = completedSprints.filter(s => 
      new Date(s.createdAt) >= weekAgo
    );
    
    const insights = thisWeekSprints.map(s => calculateSprintInsights(s)).filter(Boolean);
    
    const avgCompletion = insights.length > 0 
      ? Math.round(insights.reduce((sum, i) => sum + i.completionRate, 0) / insights.length)
      : 0;
    
    const avgPostponements = insights.length > 0
      ? Math.round(insights.reduce((sum, i) => sum + i.avgPostponements, 0) / insights.length * 10) / 10
      : 0;
    
    const totalHours = insights.reduce((sum, i) => sum + i.hoursLogged, 0);
    const bestCategory = insights.length > 0 
      ? insights.sort((a, b) => b.completionRate - a.completionRate)[0]?.goal
      : 'N/A';
    
    return {
      week: `${weekAgo.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
      sprints: insights,
      stats: {
        avgCompletion,
        avgPostponements,
        totalHours,
        sprintsCompleted: insights.length,
        bestPerformer: bestCategory
      },
      insights: generateInsights(insights)
    };
  };

  const generateInsights = (insights) => {
    const messages = [];
    
    if (insights.length === 0) {
      messages.push("No completed sprints this week yet. Start one to see insights!");
      return messages;
    }
    
    const avgCompletion = insights.reduce((sum, i) => sum + i.completionRate, 0) / insights.length;
    if (avgCompletion >= 80) {
      messages.push("🔥 Amazing! You're crushing it with 80%+ completion!");
    } else if (avgCompletion >= 60) {
      messages.push("✅ Good progress! You're completing most of your goals.");
    } else if (avgCompletion >= 40) {
      messages.push("⚠️ Moderate completion. Consider making smaller sprints.");
    } else {
      messages.push("🚨 Low completion. Your sprints might be too ambitious.");
    }
    
    const avgPostpones = insights.reduce((sum, i) => sum + i.avgPostponements, 0) / insights.length;
    if (avgPostpones > 3) {
      messages.push("📋 Pattern: You're postponing tasks frequently. Try breaking them into smaller pieces.");
    } else if (avgPostpones > 1) {
      messages.push("💡 Tip: Watch out for procrastination patterns. Daily check-ins help!");
    }
    
    const hardSprints = insights.filter(i => i.difficulty === 'Hard').length;
    if (hardSprints > insights.length / 2) {
      messages.push("⚡ You prefer challenging sprints! Make sure they're achievable.");
    }
    
    return messages;
  };

  const getGoalCategory = (sprintGoal) => {
    const lower = sprintGoal.toLowerCase();
    if (lower.includes('fit') || lower.includes('exercise') || lower.includes('run') || lower.includes('gym')) return 'fitness';
    if (lower.includes('learn') || lower.includes('code') || lower.includes('study')) return 'learning';
    if (lower.includes('work') || lower.includes('job') || lower.includes('career')) return 'career';
    if (lower.includes('health') || lower.includes('sleep') || lower.includes('meditate')) return 'wellness';
    if (lower.includes('money') || lower.includes('save') || lower.includes('budget')) return 'financial';
    return 'general';
  };

  const getPredictions = () => {
    if (completedSprints.length < 2) return null;
    
    const recentInsights = completedSprints.slice(-5).map(s => calculateSprintInsights(s)).filter(Boolean);
    const avgCompletion = recentInsights.reduce((sum, i) => sum + i.completionRate, 0) / recentInsights.length;
    const avgTasks = recentInsights.reduce((sum, i) => sum + i.totalTasks, 0) / recentInsights.length;
    
    return {
      expectedCompletion: Math.round(avgCompletion),
      recommendedTaskCount: Math.round(avgTasks),
      trend: avgCompletion >= 75 ? '📈 Improving' : avgCompletion >= 50 ? '➡️ Stable' : '📉 Needs work'
    };
  };

  // CHART DATA GENERATORS
  const getCompletionRateData = () => {
    const allSprints = [...completedSprints, ...sprints].slice(-12);
    return allSprints.map(s => {
      const insights = calculateSprintInsights(s);
      return {
        name: s.name.substring(0, 12),
        completion: insights.completionRate,
        tasks: insights.completedTasks,
        total: insights.totalTasks
      };
    });
  };

  const getCategoryPerformanceData = () => {
    const categories = {};
    [...completedSprints, ...sprints].forEach(s => {
      const insights = calculateSprintInsights(s);
      const cat = s.category || 'general';
      if (!categories[cat]) {
        categories[cat] = { completion: 0, count: 0 };
      }
      categories[cat].completion += insights.completionRate;
      categories[cat].count += 1;
    });

    return Object.entries(categories).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(data.completion / data.count),
      count: data.count
    }));
  };

  const getXpProgressionData = () => {
    const data = [];
    let currentXp = 0;
    const events = [
      ...completedSprints.map(s => ({ date: new Date(s.createdAt), type: 'sprint', xp: 50 })),
      ...habits.map(h => ({ date: new Date(h.lastCompleted || new Date()), type: 'habit', xp: 5 }))
    ].sort((a, b) => a.date - b.date).slice(-30);

    events.forEach(event => {
      currentXp += event.xp;
      data.push({
        date: event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        xp: currentXp,
        level: Math.floor(currentXp / 500) + 1
      });
    });

    return data.length === 0 ? [{ date: 'Today', xp: xp, level }] : data;
  };

  const getHabitConsistencyData = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const completedCount = habits.filter(h => h.lastCompleted && new Date(h.lastCompleted).toISOString().split('T')[0] === dateStr).length;
      last30Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: completedCount,
        total: habits.length,
        percentage: habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0
      });
    }
    return last30Days;
  };

  const getStreakData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasCheckedIn = false; // Would need to track this
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        checked: hasCheckedIn ? 1 : 0
      });
    }
    // Mark today and recent days
    data[6].checked = lastCheckIn && new Date(lastCheckIn).toISOString().split('T')[0] === new Date().toISOString().split('T')[0] ? 1 : 0;
    return data;
  };

  // ============================================================================
  // PREDICTIVE ANALYTICS
  // ============================================================================

  const predictSprintCompletion = (sprintId) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return null;

    // Calculate completion rate
    const totalTasks = sprint.weeklyTasks?.length || 1;
    const completedTasks = sprint.completedTasks?.length || 0;
    const currentProgress = (completedTasks / totalTasks) * 100;

    // Get sprint duration
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(1, totalDays - elapsedDays);

    // Calculate completion velocity (tasks per day)
    const velocity = elapsedDays > 0 ? completedTasks / elapsedDays : 0;
    const tasksRemaining = totalTasks - completedTasks;

    // Predict completion time
    const predictedDaysRemaining = velocity > 0 ? tasksRemaining / velocity : remainingDays;
    const predictedCompletionDate = new Date();
    predictedCompletionDate.setDate(predictedCompletionDate.getDate() + predictedDaysRemaining);

    // Calculate success probability
    let successProbability = 50; // Base 50%

    // Factor 1: Current progress (0-30 points)
    successProbability += Math.min(30, (currentProgress / 100) * 30);

    // Factor 2: Velocity (0-20 points)
    // Good velocity = 1+ task per day
    const velocityScore = Math.min(20, (velocity / 1) * 20);
    successProbability += velocityScore;

    // Factor 3: Time remaining (0-20 points)
    // More time = higher probability
    const timeScore = Math.min(20, (remainingDays / 7) * 20);
    successProbability += timeScore;

    // Factor 4: Historical success rate (0-10 points)
    const categorySuccessRate = calculateCategorySuccessRate(sprint.category);
    successProbability += (categorySuccessRate / 100) * 10;

    // Factor 5: Streak bonus (0-10 points)
    successProbability += Math.min(10, (streak / 30) * 10);

    successProbability = Math.min(100, Math.max(0, successProbability));

    // Identify risk flags
    const riskFlags = [];
    
    if (velocity === 0) {
      riskFlags.push({ level: 'critical', message: '⚠️ No progress yet - start now!' });
    }
    
    if (velocity < 0.5 && elapsedDays > 3) {
      riskFlags.push({ level: 'warning', message: '📉 Low velocity - need to speed up' });
    }
    
    if (predictedDaysRemaining > remainingDays * 1.5) {
      riskFlags.push({ level: 'warning', message: '⏰ Falling behind schedule' });
    }
    
    if (successProbability < 30) {
      riskFlags.push({ level: 'critical', message: '🚨 High risk of failure' });
    }

    if (sprint.difficulty === 'Hard' && currentProgress < 30 && elapsedDays > totalDays * 0.3) {
      riskFlags.push({ level: 'warning', message: '💪 Hard sprint - increase effort' });
    }

    // Positive indicators
    if (velocity > 1.5) {
      riskFlags.push({ level: 'success', message: '🚀 Excellent pace - on track!' });
    }

    if (currentProgress > 80) {
      riskFlags.push({ level: 'success', message: '✨ Almost there - finish strong!' });
    }

    return {
      currentProgress: Math.round(currentProgress),
      velocity: Number(velocity.toFixed(2)),
      predictedDaysRemaining: Math.round(predictedDaysRemaining),
      predictedCompletionDate: predictedCompletionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      successProbability: Math.round(successProbability),
      riskFlags,
      elapsedDays,
      totalDays,
      remainingDays
    };
  };

  const calculateCategorySuccessRate = (category) => {
    if (completedSprints.length === 0) return 50;

    const categorySpints = completedSprints.filter(s => s.category === category);
    if (categorySpints.length === 0) return 50;

    const completionRates = categorySpints.map(s => {
      const insights = calculateSprintInsights(s);
      return insights.completionRate;
    });

    const avgCompletion = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;
    return avgCompletion;
  };

  const getPredictiveInsights = () => {
    const predictions = sprints
      .filter(s => new Date() >= new Date(s.startDate) && new Date() <= new Date(s.endDate))
      .map(s => ({
        ...s,
        prediction: predictSprintCompletion(s.id)
      }))
      .filter(s => s.prediction);

    return predictions;
  };

  const getRiskSprants = () => {
    return getPredictiveInsights()
      .filter(s => s.prediction.successProbability < 50)
      .sort((a, b) => a.prediction.successProbability - b.prediction.successProbability);
  };

  const toggleGoalPrivacy = (sprintId, goalName) => {
    setSprints(prev => prev.map(s => {
      if (s.id === sprintId) {
        const newPrivacy = { ...s.privacy };
        if (!newPrivacy.goals) newPrivacy.goals = {};
        newPrivacy.goals[goalName] = !newPrivacy.goals[goalName];
        return { ...s, privacy: newPrivacy };
      }
      return s;
    }));
  };

  const exportData = () => {
    const dataToExport = {
      sprints,
      completedSprints,
      xp,
      level,
      username,
      exportDate: new Date().toISOString()
    };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(dataStr));
    element.setAttribute('download', `sprint-tracker-${new Date().toISOString().split('T')[0]}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AppContext.Provider value={{ 
      sprints, setSprints, currentScreen, setCurrentScreen, selectedSprintId, 
      xp, level, streak, username, setUsername, friends, unlockedBadges,
      taskSchedules, timeLogged, habits, completedSprints,
      notificationsEnabled, setNotificationsEnabled, requestNotificationPermission, scheduleReminder,
      addSprint, deleteSprint, updateSprint, toggleTaskComplete,
      scheduleTask, postponeTask, addXP, logTime,
      addHabit, completeHabit, dailyCheckIn, checkBadges,
      toggleGoalPrivacy, showNotification, exportData,
      viewSprintDetails, userId, toastNotifications, setToastNotifications,
      calculateSprintInsights, generateWeeklyReport, getPredictions, getGoalCategory,
      getCompletionRateData, getCategoryPerformanceData, getXpProgressionData, getHabitConsistencyData, getStreakData,
      predictSprintCompletion, getPredictiveInsights, getRiskSprants,
      hasSeenOnboarding,
      showOnboarding,
      setShowOnboarding,
      onboardingStep,
      setOnboardingStep,
      completeOnboarding: () => {
        setHasSeenOnboarding(true);
        setShowOnboarding(false);
        localStorage.setItem('hasSeenOnboarding', 'true');
      },
      restartOnboarding: () => {
        setShowOnboarding(true);
        setOnboardingStep(0);
      }
    }}>
      {children}
    </AppContext.Provider>
  );
};

// ============================================================================
// MOBILE DETECTION & RESPONSIVE WRAPPER
// ============================================================================

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const MobileHeader = () => {
  const { xp, level, dailyCheckIn, lastCheckIn, setCurrentScreen } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const lastCheckInDate = lastCheckIn ? new Date(lastCheckIn).toISOString().split('T')[0] : null;
  const hasCheckedInToday = lastCheckInDate === today;

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 z-40 p-3">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => setCurrentScreen('home')}
          className="text-lg font-bold text-white hover:opacity-80 transition-opacity group flex items-center gap-1"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🎯</span>
          <span>Tracker</span>
        </button>
        <div className="flex gap-2 text-xs">
          <div className="bg-slate-800 px-2 py-1 rounded border border-slate-700 text-white">⭐ {level}</div>
          <div className="bg-slate-800 px-2 py-1 rounded border border-slate-700 text-white">💫 {xp}</div>
          <button 
            onClick={dailyCheckIn} 
            disabled={hasCheckedInToday}
            className="px-2 py-1 bg-violet-600 text-white rounded text-xs disabled:bg-slate-700 hover:bg-violet-500"
          >
            {hasCheckedInToday ? '✓' : 'Check'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MobileBottomNav = () => {
  const { currentScreen, setCurrentScreen } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const mainNavItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'sprints', label: 'Sprints', icon: '⚡' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
  ];

  const moreNavItems = [
    { id: 'insights', label: 'Insights', icon: '📊' },
    { id: 'predictions', label: 'Predictions', icon: '🔮' },
    { id: 'planning', label: 'Planning', icon: '🎬' },
    { id: 'habits', label: 'Habits', icon: '✅' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏅' },
    { id: 'archive', label: 'Archive', icon: '📦' },
  ];

  const handleMoreClick = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleNavClick = (screenId) => {
    setCurrentScreen(screenId);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Bottom Sheet More Menu */}
      {showMoreMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setShowMoreMenu(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="fixed bottom-16 left-0 right-0 bg-slate-900 border-t-2 border-slate-700 z-50 md:hidden animate-in slide-in-from-bottom duration-300 rounded-t-3xl shadow-2xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">More Options</h3>
                <button 
                  onClick={() => setShowMoreMenu(false)}
                  className="text-slate-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-2">
                {moreNavItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`p-4 rounded-xl transition-all flex flex-col items-center gap-2 ${
                      currentScreen === item.id
                        ? 'bg-violet-600 text-white shadow-lg scale-105'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 active:scale-95'
                    }`}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-xs font-semibold text-center leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-40 flex justify-around md:hidden shadow-lg">
        {mainNavItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`flex-1 py-3 text-center transition-all flex flex-col items-center gap-0.5 active:scale-95 ${
              currentScreen === item.id
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-semibold">{item.label}</span>
          </button>
        ))}
        
        {/* More Button */}
        <button
          onClick={handleMoreClick}
          className={`flex-1 py-3 text-center transition-all flex flex-col items-center gap-0.5 active:scale-95 ${
            showMoreMenu
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-xl">⋯</span>
          <span className="text-xs font-semibold">More</span>
        </button>
        
        {/* Settings Button */}
        <button
          onClick={() => handleNavClick('settings')}
          className={`flex-1 py-3 text-center transition-all flex flex-col items-center gap-0.5 active:scale-95 ${
            currentScreen === 'settings'
              ? 'bg-violet-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-xl">⚙️</span>
          <span className="text-xs font-semibold">Settings</span>
        </button>
      </div>
    </>
  );
};

// ============================================================================
// NAVIGATION
// ============================================================================

const Navigation = () => {
  const { currentScreen, setCurrentScreen, xp, level, streak, dailyCheckIn, lastCheckIn } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const lastCheckInDate = lastCheckIn ? new Date(lastCheckIn).toISOString().split('T')[0] : null;
  const hasCheckedInToday = lastCheckInDate === today;

  return (
    <nav className="hidden md:block bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 shadow-2xl border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <button 
            onClick={() => setCurrentScreen('home')}
            className="text-2xl font-bold hover:opacity-80 transition-opacity cursor-pointer group flex items-center gap-2"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">🎯</span>
            <span className="text-white">Sprint Tracker</span>
          </button>
          <div id="xp-level-display" className="flex gap-2 items-center flex-wrap text-sm">
            <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">⭐ Lvl {level}</div>
            <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">💫 {xp} XP</div>
            <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">🔥 {streak} day</div>
            <button onClick={dailyCheckIn} disabled={hasCheckedInToday} className="px-3 py-1 bg-violet-600 text-white rounded-full text-sm disabled:bg-slate-700 disabled:text-slate-500 hover:bg-violet-500">
              {hasCheckedInToday ? '✓ Checked' : 'Check-in'}
            </button>
          </div>
        </div>
        <div className="flex gap-2 justify-start flex-wrap overflow-x-auto">
          {[
            { id: 'home', label: 'Home', icon: '📊' },
            { id: 'sprints', label: 'Sprints', icon: '🎯' },
            { id: 'calendar', label: 'Calendar', icon: '📅' },
            { id: 'insights', label: 'Insights', icon: '📈' },
            { id: 'predictions', label: 'Predictions', icon: '🔮' },
            { id: 'planning', label: 'Planning', icon: '🎬' },
            { id: 'habits', label: 'Habits', icon: '📋' },
            { id: 'achievements', label: 'Achievements', icon: '🏆' },
            { id: 'leaderboard', label: 'Leaderboard', icon: '🎖️' },
            { id: 'archive', label: 'Archive', icon: '📦' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map(item => (
            <button 
              key={item.id}
              id={item.id === 'calendar' ? 'calendar-nav' : item.id === 'achievements' ? 'achievements-nav' : undefined}
              onClick={() => setCurrentScreen(item.id)} 
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                currentScreen === item.id 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// ============================================================================
// HOME SCREEN
// ============================================================================

const HomeScreen = () => {
  const { sprints, xp, level, streak, habits, completeHabit, viewSprintDetails, setCurrentScreen, dailyCheckIn, lastCheckIn, notificationsEnabled, requestNotificationPermission } = useApp();
  const today = new Date().toISOString().split('T')[0];
  const lastCheckInDate = lastCheckIn ? new Date(lastCheckIn).toISOString().split('T')[0] : null;
  const hasCheckedInToday = lastCheckInDate === today;
  
  const completedToday = habits.filter(h => h.lastCompleted && new Date(h.lastCompleted).toISOString().split('T')[0] === today).length;
  const activeSprints = sprints.filter(s => new Date() >= new Date(s.startDate) && new Date() <= new Date(s.endDate));
  const totalProgress = activeSprints.length > 0 
    ? Math.round(activeSprints.reduce((sum, s) => sum + (s.completedTasks?.length / (s.weeklyTasks?.length || 1)), 0) / activeSprints.length * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* GREETING SECTION */}
      <div className="mb-12">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Welcome back! 👋</h1>
            <p className="text-slate-400 text-sm md:text-base">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border-2 border-violet-500 flex items-center justify-center hover:scale-105 transition-transform">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{level}</div>
                <div className="text-xs text-violet-300 font-bold">LEVEL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BIG CHECK-IN CTA */}
      {!hasCheckedInToday && (
        <button 
          onClick={dailyCheckIn}
          className="w-full mb-8 py-8 px-6 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-violet-500 text-white rounded-2xl font-bold text-lg md:text-xl transition-all hover:shadow-2xl hover:shadow-violet-500/40 transform hover:scale-105 active:scale-95 border-2 border-violet-400/30"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">✨</span>
            <span>Daily Check-In — {streak} day streak 🔥</span>
            <span className="text-2xl">→</span>
          </div>
        </button>
      )}
      
      {hasCheckedInToday && (
        <div className="w-full mb-8 py-6 px-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-2 border-green-500 text-white rounded-2xl font-bold text-center text-lg md:text-xl">
          ✓ Checked in today! Keep that {streak} 🔥 streak going!
        </div>
      )}

      {/* NOTIFICATION BANNER */}
      {!notificationsEnabled && (
        <div className="w-full mb-8 p-5 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-2 border-blue-500 text-blue-300 rounded-2xl flex items-center justify-between gap-4 hover:border-blue-400 transition-all">
          <div className="flex-1">
            <p className="font-bold text-sm md:text-base">📲 Get Daily Reminders</p>
            <p className="text-xs md:text-sm text-blue-400">Never miss sprint updates and milestones</p>
          </div>
          <button 
            onClick={requestNotificationPermission}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold whitespace-nowrap transition-all transform hover:scale-105"
          >
            Enable
          </button>
        </div>
      )}

      {/* STAT CARDS - BEAUTIFUL REDESIGN */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {/* XP Card */}
        <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border-2 border-violet-500/50 hover:border-violet-400 transition-all hover:shadow-lg hover:shadow-violet-500/20 cursor-default">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-600/20 to-transparent rounded-bl-3xl -z-0"></div>
          <div className="relative z-10">
            <div className="text-violet-300 text-xs font-bold uppercase tracking-widest mb-3">Today's XP</div>
            <div className="text-4xl md:text-5xl font-black text-violet-400 mb-1">{xp % 500}</div>
            <div className="text-xs text-slate-500">+{500 - (xp % 500)} to next level</div>
            <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600" style={{ width: `${(xp % 500) / 5}%` }}></div>
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border-2 border-green-500/50 hover:border-green-400 transition-all hover:shadow-lg hover:shadow-green-500/20 cursor-default">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-600/20 to-transparent rounded-bl-3xl -z-0"></div>
          <div className="relative z-10">
            <div className="text-green-300 text-xs font-bold uppercase tracking-widest mb-3">Streak</div>
            <div className="text-4xl md:text-5xl font-black text-green-400 mb-1">🔥 {streak}</div>
            <div className="text-xs text-slate-500">Days in a row</div>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: Math.min(7, streak) }).map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-green-600 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Sprints Card */}
        <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border-2 border-blue-500/50 hover:border-blue-400 transition-all hover:shadow-lg hover:shadow-blue-500/20 cursor-default">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-600/20 to-transparent rounded-bl-3xl -z-0"></div>
          <div className="relative z-10">
            <div className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-3">Active Sprints</div>
            <div className="text-4xl md:text-5xl font-black text-blue-400 mb-1">{activeSprints.length}</div>
            <div className="text-xs text-slate-500">{activeSprints.length === 0 ? 'Create one today' : 'In progress'}</div>
            <div className="mt-3 text-xs text-blue-400 font-semibold">→ View all</div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border-2 border-orange-500/50 hover:border-orange-400 transition-all hover:shadow-lg hover:shadow-orange-500/20 cursor-default">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-600/20 to-transparent rounded-bl-3xl -z-0"></div>
          <div className="relative z-10">
            <div className="text-orange-300 text-xs font-bold uppercase tracking-widest mb-3">Progress</div>
            <div className="text-4xl md:text-5xl font-black text-orange-400 mb-1">{totalProgress}%</div>
            <div className="text-xs text-slate-500">This week</div>
            <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-600 to-red-600" style={{ width: `${totalProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TODAY'S SPRINT GOALS - 2 COLUMNS */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 md:p-8 rounded-2xl border-2 border-slate-700 hover:border-violet-500/30 transition-all">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <span>Today's Sprint Goals</span>
              {activeSprints.length > 0 && <span className="text-sm font-normal text-slate-400">({activeSprints.length} active)</span>}
            </h3>
            
            {activeSprints.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-6 text-lg">No active sprints right now</p>
                <button 
                  onClick={() => setCurrentScreen('sprints')}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold transition-all transform hover:scale-105"
                >
                  + Create Your First Sprint
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSprints.map(s => {
                  const progress = s.weeklyTasks?.length > 0 ? (s.completedTasks?.length / s.weeklyTasks.length) * 100 : 0;
                  const currentWeek = s.weeklyTasks?.[0]?.week || 1;
                  return (
                    <div 
                      key={s.id} 
                      onClick={() => viewSprintDetails(s.id)}
                      className="p-5 bg-slate-800/50 rounded-xl border-2 border-slate-700 hover:border-violet-500 hover:bg-slate-800 transition-all cursor-pointer group transform hover:scale-102"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-lg group-hover:text-violet-300 transition-colors truncate">{s.name}</h4>
                          <p className="text-sm text-slate-400 truncate">{s.goal}</p>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <div className="text-2xl font-bold text-violet-400">{Math.round(progress)}%</div>
                          <div className="text-xs text-slate-500 font-bold">W{currentWeek}</div>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 transition-all duration-500" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                      <div className="text-xs text-slate-500 text-center font-semibold">
                        {s.completedTasks?.length || 0}/{s.weeklyTasks?.length || 0} tasks completed
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* TODAY'S HABITS - 1 COLUMN */}
        <div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 md:p-8 rounded-2xl border-2 border-slate-700 hover:border-emerald-500/30 transition-all h-full">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">✓</span>
              <span>Today's Habits</span>
              <span className="text-sm font-normal text-slate-400">({completedToday}/{habits.length})</span>
            </h3>
            
            {habits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-4 text-sm">No habits yet</p>
                <button 
                  onClick={() => setCurrentScreen('habits')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-all"
                >
                  + Add Habit
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {habits.map(h => {
                  const isCompletedToday = h.lastCompleted && new Date(h.lastCompleted).toISOString().split('T')[0] === today;
                  return (
                    <button
                      key={h.id}
                      onClick={() => !isCompletedToday && completeHabit(h.id)}
                      disabled={isCompletedToday}
                      className={`w-full p-3 rounded-lg transition-all text-sm font-semibold text-left flex items-center gap-3 transform hover:scale-102 ${
                        isCompletedToday 
                          ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-2 border-green-500 text-green-300 cursor-default' 
                          : 'bg-slate-800 border-2 border-slate-700 text-white hover:border-emerald-500 hover:bg-slate-700 hover:shadow-lg hover:shadow-emerald-500/10'
                      }`}
                    >
                      <span className="text-xl">{isCompletedToday ? '✓' : '○'}</span>
                      <span className="flex-1">{h.name}</span>
                      {isCompletedToday && <span className="text-xs text-green-300 font-bold">DONE!</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM MOTIVATIONAL SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div className="bg-gradient-to-br from-cyan-900/30 via-slate-900 to-blue-900/30 p-6 rounded-2xl border-2 border-cyan-700/50 hover:border-cyan-600 transition-all">
          <h4 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
            <span>💡</span> Daily Tip
          </h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            {streak > 14 
              ? "You're on fire! 🔥 Your consistency is incredible. Keep pushing toward your next goal!"
              : streak > 7 
              ? "Great momentum! Your streaks compound. Just keep checking in daily."
              : streak > 3 
              ? "You're building habits! Keep this going for 30 days to lock them in."
              : "Every journey starts with one step. Today is that step. Keep going!"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-violet-900/30 via-slate-900 to-fuchsia-900/30 p-6 rounded-2xl border-2 border-violet-700/50 hover:border-violet-600 transition-all">
          <h4 className="text-lg font-bold text-violet-300 mb-3 flex items-center gap-2">
            <span>📈</span> This Week
          </h4>
          <div className="space-y-2 text-sm text-slate-300">
            <p>✨ Total XP: <span className="text-violet-400 font-bold">{xp}</span></p>
            <p>🎯 Active: <span className="text-blue-400 font-bold">{activeSprints.length} sprint{activeSprints.length !== 1 ? 's' : ''}</span></p>
            <p>✓ Habits: <span className="text-emerald-400 font-bold">{completedToday} completed</span></p>
            <p>📊 Progress: <span className="text-orange-400 font-bold">{totalProgress}%</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
// IMPROVED CALENDAR SCREEN WITH LIST VIEW
// Replace your existing CalendarScreen component with this version

const CalendarScreen = () => {
  const { sprints, taskSchedules, scheduleTask, postponeTask } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [viewMode, setViewMode] = useState('list'); // Default to list view (better for mobile)
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'today', 'week', 'overdue'

  const getAllTasks = () => {
    const tasks = [];
    sprints.forEach(sprint => {
      sprint.weeklyTasks?.forEach((task, idx) => {
        const taskId = `${sprint.id}-${idx}`;
        const isCompleted = sprint.completedTasks?.includes(idx);
        tasks.push({
          id: taskId,
          sprintId: sprint.id,
          taskIdx: idx,
          title: task.title,
          sprintName: sprint.name,
          scheduledDate: taskSchedules[taskId]?.date || sprint.startDate,
          postponeCount: taskSchedules[taskId]?.postponeCount || 0,
          isCompleted
        });
      });
    });
    return tasks;
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getWeekDays = (date) => {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay();
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(first + i));
      days.push(new Date(d));
    }
    return days;
  };

  const handleTaskDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDayDrop = (e, day) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-violet-600/20', 'border-violet-500');
    if (draggedTask) {
      const newDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      scheduleTask(draggedTask.id, newDate.toISOString().split('T')[0]);
      setDraggedTask(null);
    }
  };

  const getPostponementWarning = (count) => {
    if (count === 0) return { bgColor: 'bg-emerald-900/20', borderColor: 'border-emerald-400', emoji: '✅', label: 'On Track', textColor: 'text-emerald-300' };
    if (count <= 2) return { bgColor: 'bg-amber-900/20', borderColor: 'border-amber-400', emoji: '⚠️', label: 'Risky', textColor: 'text-amber-300' };
    if (count <= 5) return { bgColor: 'bg-orange-900/20', borderColor: 'border-orange-400', emoji: '🚨', label: 'Heavy', textColor: 'text-orange-300' };
    return { bgColor: 'bg-rose-900/20', borderColor: 'border-rose-400', emoji: '🛑', label: 'Critical!', textColor: 'text-rose-300' };
  };

  const renderTaskCard = (task, compact = false) => {
    const warning = getPostponementWarning(task.postponeCount);
    
    if (compact) {
      // Compact version for calendar grid
      return (
        <div 
          key={task.id}
          draggable 
          onDragStart={(e) => handleTaskDragStart(e, task)} 
          onClick={() => { setSelectedTaskForEdit(task); setEditDate(task.scheduledDate); }}
          className={`p-2 rounded-lg border cursor-move transition-all hover:shadow-lg ${warning.bgColor} ${warning.borderColor} ${task.isCompleted ? 'opacity-50' : ''}`}
        >
          <div className="flex items-center justify-between gap-1">
            <p className="text-xs font-semibold text-white truncate flex-1">{task.title}</p>
            <span className="text-sm flex-shrink-0">{warning.emoji}</span>
          </div>
        </div>
      );
    }

    // Full version for list view
    return (
      <div 
        key={task.id}
        draggable 
        onDragStart={(e) => handleTaskDragStart(e, task)} 
        onClick={() => { setSelectedTaskForEdit(task); setEditDate(task.scheduledDate); }}
        className={`p-4 rounded-xl border-2 cursor-pointer group transition-all hover:shadow-xl ${warning.bgColor} ${warning.borderColor} ${task.isCompleted ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white text-base leading-tight mb-1">{task.title}</h4>
            <p className="text-sm text-slate-300">{task.sprintName}</p>
            <p className="text-xs text-slate-400 mt-1">
              📅 {new Date(task.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <span className="text-2xl flex-shrink-0">{warning.emoji}</span>
        </div>
        
        {task.isCompleted && (
          <div className="mb-2 px-2 py-1 rounded bg-green-900/30 border border-green-600">
            <span className="text-xs font-semibold text-green-300">✓ Completed</span>
          </div>
        )}
        
        {task.postponeCount > 0 && (
          <div className="mb-2 px-2 py-1 rounded-lg bg-slate-900/40 border border-slate-700">
            <span className={`text-xs font-semibold ${warning.textColor}`}>
              ⏱️ Postponed {task.postponeCount}x - {warning.label}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
          <button 
            onClick={(e) => { e.stopPropagation(); setSelectedTaskForEdit(task); setEditDate(task.scheduledDate); }} 
            className="text-xs px-3 py-1.5 bg-slate-700/50 text-slate-300 rounded hover:bg-slate-600 font-semibold transition-colors"
          >
            📅 Reschedule
          </button>
          {!task.isCompleted && (
            <button 
              onClick={(e) => { e.stopPropagation(); postponeTask(task.id); }} 
              className="text-xs px-3 py-1.5 bg-amber-700/30 text-amber-300 rounded hover:bg-amber-600/40 font-semibold transition-colors"
            >
              ⏭️ Postpone
            </button>
          )}
        </div>
      </div>
    );
  };

  const allTasks = getAllTasks();
  
  // Filter tasks based on filter mode
  const getFilteredTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    return allTasks.filter(task => {
      const taskDate = new Date(task.scheduledDate);
      taskDate.setHours(0, 0, 0, 0);

      if (filterMode === 'all') return true;
      if (filterMode === 'today') return taskDate.getTime() === today.getTime();
      if (filterMode === 'week') return taskDate >= today && taskDate <= weekFromNow;
      if (filterMode === 'overdue') return taskDate < today && !task.isCompleted;
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.scheduledDate);
      const dateB = new Date(b.scheduledDate);
      return dateA - dateB;
    });
  };

  // LIST VIEW - Mobile Friendly
  if (viewMode === 'list') {
    const filteredTasks = getFilteredTasks();
    const groupedTasks = {};
    
    filteredTasks.forEach(task => {
      const date = new Date(task.scheduledDate).toDateString();
      if (!groupedTasks[date]) groupedTasks[date] = [];
      groupedTasks[date].push(task);
    });

    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 86400000).toDateString();

    return (
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-4">📅 Calendar</h2>
          
          {/* View Toggle */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              📋 List
            </button>
            <button 
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${viewMode === 'month' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              📅 Month
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${viewMode === 'week' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              📊 Week
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button 
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterMode === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
            >
              All Tasks
            </button>
            <button 
              onClick={() => setFilterMode('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterMode === 'today' ? 'bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
            >
              Today
            </button>
            <button 
              onClick={() => setFilterMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterMode === 'week' ? 'bg-slate-700 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
            >
              This Week
            </button>
            <button 
              onClick={() => setFilterMode('overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterMode === 'overdue' ? 'bg-red-700 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white'}`}
            >
              Overdue
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-6">
          {Object.keys(groupedTasks).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">📭</p>
              <p className="text-slate-400 text-lg">No tasks scheduled</p>
              <p className="text-slate-500 text-sm mt-2">Create a sprint to get started!</p>
            </div>
          ) : (
            Object.keys(groupedTasks).map(dateStr => {
              const displayDate = dateStr === today ? '🎯 Today' : 
                                 dateStr === tomorrow ? '📅 Tomorrow' :
                                 new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
              
              const isOverdue = new Date(dateStr) < new Date(today) && groupedTasks[dateStr].some(t => !t.isCompleted);

              return (
                <div key={dateStr} className="space-y-3">
                  <h3 className={`text-lg font-bold sticky top-0 bg-gradient-to-b from-slate-950 to-slate-900 pb-2 z-10 ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                    {isOverdue && '⚠️ '}{displayDate}
                    <span className="ml-2 text-sm font-normal text-slate-400">
                      ({groupedTasks[dateStr].length} task{groupedTasks[dateStr].length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {groupedTasks[dateStr].map(task => renderTaskCard(task))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm font-semibold mb-3">Status Guide:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-900/20 rounded border border-emerald-400">
              <span>✅</span>
              <div><p className="text-emerald-300 font-semibold text-xs">On Track</p></div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-900/20 rounded border border-amber-400">
              <span>⚠️</span>
              <div><p className="text-amber-300 font-semibold text-xs">Risky (1-2)</p></div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-900/20 rounded border border-orange-400">
              <span>🚨</span>
              <div><p className="text-orange-300 font-semibold text-xs">Heavy (3-5)</p></div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-rose-900/20 rounded border border-rose-400">
              <span>🛑</span>
              <div><p className="text-rose-300 font-semibold text-xs">Critical (6+)</p></div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {selectedTaskForEdit && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-md p-6 border border-slate-800">
              <h2 className="text-2xl font-bold text-white mb-4">📅 Reschedule Task</h2>
              <p className="text-slate-300 mb-2 font-semibold">{selectedTaskForEdit.title}</p>
              <p className="text-slate-400 text-sm mb-4">{selectedTaskForEdit.sprintName}</p>
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">New Date:</label>
                <input 
                  type="date" 
                  value={editDate} 
                  onChange={(e) => setEditDate(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedTaskForEdit(null)} 
                  className="flex-1 px-4 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    scheduleTask(selectedTaskForEdit.id, editDate);
                    setSelectedTaskForEdit(null);
                  }} 
                  className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-500 font-semibold transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // MONTH VIEW
  if (viewMode === 'month') {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">📅 Calendar</h2>
          <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-start md:items-center w-full md:w-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                📋 List
              </button>
              <button 
                onClick={() => setViewMode('month')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${viewMode === 'month' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                📅 Month
              </button>
              <button 
                onClick={() => setViewMode('week')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${viewMode === 'week' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                📊 Week
              </button>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-semibold text-sm">←</button>
              <span className="text-white font-bold text-sm px-4 py-2 flex-1 md:flex-none md:min-w-[180px] text-center bg-slate-800/50 rounded-lg">{monthName}</span>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-semibold text-sm">→</button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-slate-400 text-xs md:text-sm font-semibold p-2">{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {days.map((day, idx) => (
            <div 
              key={idx} 
              className={`p-2 rounded-lg border min-h-[80px] md:min-h-[140px] overflow-y-auto transition-all ${
                day === null 
                  ? 'bg-slate-800/20 border-transparent' 
                  : 'bg-slate-900/50 border-slate-700 hover:border-violet-500'
              }`}
              onDragOver={day ? (e) => { e.preventDefault(); e.currentTarget.classList.add('bg-violet-600/20', 'border-violet-500'); } : undefined}
              onDragLeave={day ? (e) => e.currentTarget.classList.remove('bg-violet-600/20', 'border-violet-500') : undefined}
              onDrop={day ? (e) => handleDayDrop(e, day) : undefined}
            >
              {day && (
                <>
                  <div className="text-white font-bold text-sm mb-1 pb-1 border-b border-slate-700">{day.getDate()}</div>
                  <div className="space-y-1">
                    {allTasks.filter(t => {
                      const taskDate = new Date(t.scheduledDate);
                      return taskDate.toDateString() === day.toDateString();
                    }).map(task => renderTaskCard(task, true))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {selectedTaskForEdit && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-2xl w-full max-w-md p-6 border border-slate-800">
              <h2 className="text-2xl font-bold text-white mb-4">📅 Reschedule Task</h2>
              <p className="text-slate-300 mb-2 font-semibold">{selectedTaskForEdit.title}</p>
              <p className="text-slate-400 text-sm mb-4">{selectedTaskForEdit.sprintName}</p>
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">New Date:</label>
                <input 
                  type="date" 
                  value={editDate} 
                  onChange={(e) => setEditDate(e.target.value)} 
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedTaskForEdit(null)} 
                  className="flex-1 px-4 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    scheduleTask(selectedTaskForEdit.id, editDate);
                    setSelectedTaskForEdit(null);
                  }} 
                  className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-500 font-semibold"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // WEEK VIEW (keep existing implementation)
  const weekDays = getWeekDays(currentDate);
  const weekStart = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekEnd = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white">📅 Calendar</h2>
        <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-start md:items-center w-full md:w-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              📋 List
            </button>
            <button 
              onClick={() => setViewMode('month')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${viewMode === 'month' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              📅 Month
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${viewMode === 'week' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              📊 Week
            </button>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))} className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-semibold text-sm">←</button>
            <span className="text-white font-bold text-xs md:text-sm px-3 py-2 flex-1 md:flex-none md:min-w-[200px] text-center bg-slate-800/50 rounded-lg">{weekStart} - {weekEnd}</span>
            <button onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))} className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-semibold text-sm">→</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {weekDays.map((day, idx) => (
          <div 
            key={idx}
            className="p-3 md:p-4 rounded-lg border-2 bg-slate-900/50 border-slate-700 hover:border-violet-500 transition-all"
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('bg-violet-600/20', 'border-violet-500'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('bg-violet-600/20', 'border-violet-500')}
            onDrop={(e) => handleDayDrop(e, day)}
          >
            <div className="mb-3 pb-2 border-b border-slate-700">
              <p className="text-slate-400 text-xs font-semibold">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
              <p className="text-white font-bold text-xl md:text-2xl">{day.getDate()}</p>
            </div>
            <div className="space-y-2 min-h-[200px] md:min-h-[400px] overflow-y-auto">
              {allTasks.filter(t => {
                const taskDate = new Date(t.scheduledDate);
                return taskDate.toDateString() === day.toDateString();
              }).length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">No tasks</p>
              ) : (
                allTasks.filter(t => {
                  const taskDate = new Date(t.scheduledDate);
                  return taskDate.toDateString() === day.toDateString();
                }).map(task => renderTaskCard(task, true))
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTaskForEdit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md p-6 border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-4">📅 Reschedule Task</h2>
            <p className="text-slate-300 mb-2 font-semibold">{selectedTaskForEdit.title}</p>
            <p className="text-slate-400 text-sm mb-4">{selectedTaskForEdit.sprintName}</p>
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">New Date:</label>
              <input 
                type="date" 
                value={editDate} 
                onChange={(e) => setEditDate(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedTaskForEdit(null)} 
                className="flex-1 px-4 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  scheduleTask(selectedTaskForEdit.id, editDate);
                  setSelectedTaskForEdit(null);
                }} 
                className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-500 font-semibold"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



const SprintDetailScreen = () => {
  const { sprints, toggleTaskComplete, deleteSprint, selectedSprintId, setCurrentScreen, logTime, predictSprintCompletion } = useApp();
  const sprint = sprints.find(s => s.id === selectedSprintId);
  const [showTimeForm, setShowTimeForm] = useState(null);
  const [timeInput, setTimeInput] = useState('');

  if (!sprint) return <div className="max-w-4xl mx-auto p-6 text-slate-400">Sprint not found</div>;

  const progress = sprint.weeklyTasks?.length > 0 ? Math.round((sprint.completedTasks?.length / sprint.weeklyTasks.length) * 100) : 0;
  const prediction = predictSprintCompletion(sprint.id);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <button onClick={() => setCurrentScreen('sprints')} className="text-violet-400 hover:text-violet-300 mb-4 text-sm md:text-base">← Back</button>
      
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{sprint.name}</h2>
        <p className="text-slate-400 mb-4 text-sm md:text-base">{sprint.goal}</p>
        
        {/* Difficulty & Category Badges */}
        <div className="flex flex-wrap gap-2">
          {sprint.difficulty && (
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              sprint.difficulty === 'Easy' ? 'bg-green-600/20 border border-green-500 text-green-300' :
              sprint.difficulty === 'Moderate' ? 'bg-yellow-600/20 border border-yellow-500 text-yellow-300' :
              'bg-red-600/20 border border-red-500 text-red-300'
            }`}>
              📊 {sprint.difficulty} Difficulty
            </div>
          )}
          {sprint.category && (
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-600/20 border border-blue-500 text-blue-300">
              🏷️ {sprint.category}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
        <div className="bg-violet-600/20 p-3 md:p-4 rounded-lg border border-violet-500">
          <div className="text-slate-400 text-xs">Progress</div>
          <div className="text-2xl md:text-3xl font-bold text-violet-400 mt-1">{progress}%</div>
        </div>
        <div className="bg-blue-600/20 p-3 md:p-4 rounded-lg border border-blue-500">
          <div className="text-slate-400 text-xs">Tasks</div>
          <div className="text-2xl md:text-3xl font-bold text-blue-400 mt-1">{sprint.completedTasks?.length || 0}/{sprint.weeklyTasks?.length || 0}</div>
        </div>
        <div className="bg-green-600/20 p-3 md:p-4 rounded-lg border border-green-500">
          <div className="text-slate-400 text-xs">Dates</div>
          <div className="text-xs md:text-sm text-green-400 mt-1">{sprint.startDate}</div>
        </div>
      </div>

      <div className="mb-6 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600" style={{ width: `${progress}%` }} />
      </div>

      {/* PREDICTIVE ANALYTICS CARD */}
      {prediction && (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Completion Prediction */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 rounded-2xl border-2 border-slate-700 hover:border-violet-500/50 transition-all">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🔮</span> Completion Forecast
            </h3>
            
            <div className="space-y-5">
              {/* Success Probability */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-300 font-semibold">Success Probability</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                    {prediction.successProbability}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      prediction.successProbability >= 70 ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                      prediction.successProbability >= 50 ? 'bg-gradient-to-r from-yellow-600 to-amber-600' :
                      'bg-gradient-to-r from-red-600 to-orange-600'
                    }`}
                    style={{ width: `${prediction.successProbability}%` }}
                  />
                </div>
              </div>

              {/* Predicted Completion */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Expected Completion</div>
                <div className="text-2xl font-bold text-violet-400">{prediction.predictedCompletionDate}</div>
                <div className="text-xs text-slate-500 mt-1">
                  In ~{prediction.predictedDaysRemaining} days at current pace
                </div>
              </div>

              {/* Velocity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="text-xs text-slate-400 mb-1">Velocity</div>
                  <div className="text-2xl font-bold text-cyan-400">{prediction.velocity}</div>
                  <div className="text-xs text-slate-500">tasks/day</div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="text-xs text-slate-400 mb-1">Pace</div>
                  <div className="text-xl font-bold">
                    {prediction.velocity > 1 ? '🚀 Fast' : prediction.velocity > 0.5 ? '📈 Good' : '⏱️ Slow'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 rounded-2xl border-2 border-slate-700 hover:border-amber-500/50 transition-all">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>⚡</span> Risk Assessment
            </h3>
            
            {prediction.riskFlags.length > 0 ? (
              <div className="space-y-3">
                {prediction.riskFlags.map((flag, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      flag.level === 'critical' ? 'bg-red-600/10 border-red-500 text-red-300' :
                      flag.level === 'warning' ? 'bg-yellow-600/10 border-yellow-500 text-yellow-300' :
                      'bg-green-600/10 border-green-500 text-green-300'
                    }`}
                  >
                    <div className="font-semibold text-sm">{flag.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-slate-300 font-semibold">All systems go!</p>
                <p className="text-slate-400 text-sm mt-2">No major risks detected</p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-slate-700 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Days Elapsed:</span>
                <span className="text-white font-bold">{prediction.elapsedDays}/{prediction.totalDays}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Days Remaining:</span>
                <span className="text-white font-bold">{prediction.remainingDays}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sprint.weeklyTasks?.map((task, idx) => {
          const isCompleted = sprint.completedTasks?.includes(idx);
          return (
            <div key={idx} className={`p-4 md:p-6 rounded-lg border transition-all ${isCompleted ? 'bg-green-600/10 border-green-600' : 'bg-slate-900/50 border-slate-700 hover:border-violet-500'}`}>
              <div className="flex flex-col md:flex-row items-start justify-between mb-3 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-xs font-semibold text-slate-300">Week {task.week}</span>
                    {task.week === 1 && <span className="text-xs text-emerald-400">🏗️ Foundation</span>}
                    {task.week === Math.ceil(sprint.weeklyTasks.length / 7) && <span className="text-xs text-amber-400">🎯 Final Push</span>}
                  </div>
                  <h3 className={`text-lg font-bold mb-1 ${isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</h3>
                  <p className="text-slate-300 text-sm mb-3">{task.description}</p>
                </div>
                <button 
                  onClick={() => toggleTaskComplete(sprint.id, idx)} 
                  className={`px-4 py-2 rounded font-semibold whitespace-nowrap text-sm transition-all ${isCompleted ? 'bg-green-600/20 text-green-400 border border-green-600' : 'bg-violet-600 text-white hover:bg-violet-500'}`}
                >
                  {isCompleted ? '✓ Done' : '✓ Complete'}
                </button>
              </div>

              {showTimeForm === idx ? (
                <div className="mb-3 flex gap-2">
                  <input type="number" value={timeInput} onChange={(e) => setTimeInput(e.target.value)} placeholder="Hours" className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm" />
                  <button onClick={() => { logTime(`${sprint.id}-${idx}`, parseFloat(timeInput) || 0); setShowTimeForm(null); setTimeInput(''); }} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 text-sm font-semibold">Log</button>
                </div>
              ) : (
                <button onClick={() => setShowTimeForm(idx)} className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 mb-3">⏱️ Log Time</button>
              )}

              {task.actionItems && task.actionItems.length > 0 && (
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mt-4">
                  <h4 className="font-semibold text-white text-sm mb-3 flex items-center gap-2">
                    📋 Action Items ({task.actionItems.length})
                  </h4>
                  <div className="space-y-2.5">
                    {task.actionItems.map((item, i) => (
                      <label key={i} className="flex items-start gap-3 text-sm text-slate-300 hover:text-white cursor-pointer group">
                        <input type="checkbox" className="w-5 h-5 mt-0.5 cursor-pointer" />
                        <span className="group-hover:text-slate-100 transition-colors flex-1 break-words">{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-700">
        <button onClick={() => { deleteSprint(sprint.id); setCurrentScreen('sprints'); }} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete Sprint</button>
      </div>
    </div>
  );
};

// ============================================================================
// HABITS SCREEN
// ============================================================================

const HabitsScreen = () => {
  const { habits, addHabit, completeHabit } = useApp();
  const [newHabit, setNewHabit] = useState('');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-white mb-6">📋 Daily Habits</h2>

      <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 mb-8">
        <div className="flex gap-2">
          <input type="text" value={newHabit} onChange={(e) => setNewHabit(e.target.value)} placeholder="Add a new habit..." className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white" onKeyPress={(e) => { if (e.key === 'Enter' && newHabit) { addHabit({ name: newHabit }); setNewHabit(''); } }} />
          <button onClick={() => { addHabit({ name: newHabit }); setNewHabit(''); }} className="px-6 py-2 bg-violet-600 text-white rounded hover:bg-violet-500">Add</button>
        </div>
      </div>

      <div className="space-y-3">
        {habits.map(habit => (
          <div key={habit.id} className={`p-4 rounded-lg border flex items-center justify-between ${habit.completed ? 'bg-green-600/20 border-green-600' : 'bg-slate-900/50 border-slate-700'}`}>
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input type="checkbox" checked={habit.completed} onChange={() => completeHabit(habit.id)} className="w-5 h-5" />
              <span className={habit.completed ? 'text-green-300 line-through' : 'text-white'}>{habit.name}</span>
            </label>
            {habit.lastCompleted && (
              <span className="text-xs text-slate-400">Today ✓</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// ANALYTICS SCREEN
// ============================================================================

const AnalyticsScreen = () => {
  const { sprints, xp, level, streak } = useApp();
  const totalTasks = sprints.reduce((sum, s) => sum + (s.weeklyTasks?.length || 0), 0);
  const completedTasks = sprints.reduce((sum, s) => sum + (s.completedTasks?.length || 0), 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-white mb-6">📈 Analytics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-violet-600/20 p-4 rounded-lg border border-violet-500">
          <div className="text-slate-400 text-xs">Total XP</div>
          <div className="text-2xl font-bold text-violet-400 mt-1">{xp}</div>
        </div>
        <div className="bg-blue-600/20 p-4 rounded-lg border border-blue-500">
          <div className="text-slate-400 text-xs">Level</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{level}</div>
        </div>
        <div className="bg-green-600/20 p-4 rounded-lg border border-green-500">
          <div className="text-slate-400 text-xs">Completion</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{completionRate}%</div>
        </div>
        <div className="bg-orange-600/20 p-4 rounded-lg border border-orange-500">
          <div className="text-slate-400 text-xs">Streak</div>
          <div className="text-2xl font-bold text-orange-400 mt-1">🔥 {streak}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Task Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-300">Total Tasks</span>
                <span className="text-violet-400">{completedTasks}/{totalTasks}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-violet-600" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Sprint Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Active Sprints</span><span className="text-white">{sprints.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Avg Completion</span><span className="text-white">{completionRate}%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ACHIEVEMENTS SCREEN
// ============================================================================

const AchievementsScreen = () => {
  const { xp, unlockedBadges, checkBadges } = useApp();

  const allBadges = [
    { id: 'first-100', name: '🎯 Century Club', description: 'Earn 100 XP', icon: '💯' },
    { id: 'xp-500', name: '⭐ Superstar', description: 'Earn 500 XP', icon: '⭐' },
    { id: 'seven-day-streak', name: '🔥 Week Warrior', description: 'Check in 7 days straight', icon: '🔥' },
    { id: 'sprint-master', name: '👑 Sprint Master', description: 'Complete 5 sprints', icon: '👑' }
  ];

  React.useEffect(() => {
    checkBadges();
  }, [xp]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-white mb-6">🏆 Achievements</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-violet-600/20 p-6 rounded-lg border border-violet-500">
          <div className="text-slate-400 text-sm">Total XP</div>
          <div className="text-4xl font-bold text-violet-400 mt-2">{xp}</div>
        </div>
        <div className="bg-yellow-600/20 p-6 rounded-lg border border-yellow-500">
          <div className="text-slate-400 text-sm">Badges Earned</div>
          <div className="text-4xl font-bold text-yellow-400 mt-2">{unlockedBadges.length}/{allBadges.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allBadges.map(badge => {
          const isUnlocked = unlockedBadges.includes(badge.id);
          return (
            <div key={badge.id} className={`p-6 rounded-lg border-2 ${isUnlocked ? 'bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border-yellow-500' : 'bg-slate-900/50 border-slate-700'}`}>
              <div className={`text-5xl mb-3 ${isUnlocked ? '' : 'opacity-30'}`}>{badge.icon}</div>
              <h3 className={`font-bold text-lg mb-1 ${isUnlocked ? 'text-yellow-300' : 'text-slate-500'}`}>{badge.name}</h3>
              <p className={`text-sm ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>{badge.description}</p>
              {isUnlocked && <div className="text-xs text-yellow-400 font-semibold mt-3">✓ UNLOCKED</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// INSIGHTS SCREEN (ACCOUNTABILITY ENGINE)
// ============================================================================

const InsightsScreen = () => {
  const { 
    completedSprints, calculateSprintInsights, generateWeeklyReport, getPredictions,
    getCompletionRateData, getCategoryPerformanceData, getXpProgressionData, getHabitConsistencyData
  } = useApp();
  const weeklyReport = generateWeeklyReport();
  const predictions = getPredictions();
  const completionData = getCompletionRateData();
  const categoryData = getCategoryPerformanceData();
  const xpData = getXpProgressionData();
  const habitData = getHabitConsistencyData();

  const COLORS = ['#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">📊 Insights & Analytics</h2>

      {/* Weekly Summary */}
      <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-4 md:p-6 rounded-xl border border-purple-700 mb-8">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4">📈 Weekly Summary</h3>
        <div className="text-xs md:text-sm text-slate-300 mb-4">{weeklyReport.week}</div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-slate-900/50 p-3 md:p-4 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs">Avg Completion</div>
            <div className="text-2xl md:text-3xl font-bold text-green-400 mt-2">{weeklyReport.stats.avgCompletion}%</div>
          </div>
          <div className="bg-slate-900/50 p-3 md:p-4 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs">Sprints Done</div>
            <div className="text-2xl md:text-3xl font-bold text-blue-400 mt-2">{weeklyReport.stats.sprintsCompleted}</div>
          </div>
          <div className="bg-slate-900/50 p-3 md:p-4 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs">Hours Logged</div>
            <div className="text-2xl md:text-3xl font-bold text-orange-400 mt-2">{weeklyReport.stats.totalHours}h</div>
          </div>
          <div className="bg-slate-900/50 p-3 md:p-4 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs">Avg Postpones</div>
            <div className="text-2xl md:text-3xl font-bold text-rose-400 mt-2">{weeklyReport.stats.avgPostponements}x</div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-slate-800/50 p-3 md:p-4 rounded-lg border border-slate-700">
          <p className="text-white font-semibold text-sm md:text-base mb-3">💡 AI Insights:</p>
          <div className="space-y-1 md:space-y-2">
            {weeklyReport.insights.map((insight, idx) => (
              <div key={idx} className="text-slate-300 text-xs md:text-sm flex items-start gap-2">
                <span className="mt-0.5">→</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Completion Rate Chart */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 rounded-2xl border-2 border-slate-700 hover:border-violet-500/50 transition-all hover:shadow-lg hover:shadow-violet-500/10">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📈</span> Completion Rate Trend
          </h3>
          {completionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={completionData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="100%" y2="0">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '2px solid #a855f7', borderRadius: '12px' }}
                  labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                  formatter={(value) => [`${value}%`, 'Completion']}
                />
                <Line 
                  type="monotone" 
                  dataKey="completion" 
                  stroke="url(#lineGrad)" 
                  strokeWidth={3}
                  dot={{ fill: '#a855f7', r: 5, strokeWidth: 2, stroke: '#7c3aed' }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-16 font-semibold">Complete sprints to see trends</p>
          )}
        </div>

        {/* XP Progression Chart */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 rounded-2xl border-2 border-slate-700 hover:border-violet-500/50 transition-all hover:shadow-lg hover:shadow-violet-500/10">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⭐</span> XP Progression
          </h3>
          {xpData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={xpData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '2px solid #a855f7', borderRadius: '12px' }}
                  labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
                  formatter={(value) => [`${value} XP`, 'Total']}
                />
                <Area 
                  type="monotone" 
                  dataKey="xp" 
                  stroke="#a855f7" 
                  fillOpacity={1} 
                  fill="url(#colorXp)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-12">XP data will appear here</p>
          )}
        </div>
      </div>

      {/* Category Performance & Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Performance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 rounded-2xl border-2 border-slate-700 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🎯</span> Category Performance
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(value) => `${value}%`}
                />
                <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-12">Complete sprints in different categories</p>
          )}
        </div>

        {/* Habit Consistency */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 rounded-2xl border-2 border-slate-700 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>✓</span> Habit Consistency (Last 30 Days)
          </h3>
          {habitData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={habitData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(value) => `${value}%`}
                />
                <Bar dataKey="percentage" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-sm text-center py-12">Add habits to track consistency</p>
          )}
        </div>
      </div>

      {/* Predictions */}
      {predictions && (
        <div className="bg-gradient-to-br from-cyan-900/50 to-teal-900/50 p-4 md:p-6 rounded-xl border border-cyan-700">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-4">🔮 Your Trends & Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-slate-900/50 p-3 md:p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-xs">Expected Completion</div>
              <div className="text-2xl md:text-3xl font-bold text-white mt-2">{predictions.expectedCompletion}%</div>
              <p className="text-xs text-slate-400 mt-1">Based on your history</p>
            </div>
            <div className="bg-slate-900/50 p-3 md:p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-xs">Recommended Tasks</div>
              <div className="text-2xl md:text-3xl font-bold text-white mt-2">{predictions.recommendedTaskCount}</div>
              <p className="text-xs text-slate-400 mt-1">Per sprint</p>
            </div>
            <div className="bg-slate-900/50 p-3 md:p-4 rounded-lg border border-slate-700">
              <div className="text-slate-400 text-xs">Performance Trend</div>
              <div className="text-xl md:text-2xl font-bold text-white mt-2">{predictions.trend}</div>
              <p className="text-xs text-slate-400 mt-1">Last 5 sprints</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SMART PLANNING SCREEN (GOAL SETTING WITH INTELLIGENCE)
// ============================================================================

const SmartPlanningScreen = () => {
  const { getPredictions, completedSprints, calculateSprintInsights } = useApp();
  const predictions = getPredictions();
  const recentInsights = completedSprints.slice(-5).map(s => calculateSprintInsights(s)).filter(Boolean);
  
  // Calculate category stats
  const categoryStats = {};
  recentInsights.forEach(insight => {
    insight.categories?.forEach(cat => {
      const key = cat.name || 'general';
      if (!categoryStats[key]) {
        categoryStats[key] = { total: 0, completed: 0, count: 0 };
      }
      categoryStats[key].count++;
      categoryStats[key].completed += insight.completionRate;
    });
  });

  const categoryPerformance = Object.entries(categoryStats).map(([name, stats]) => ({
    name,
    avgCompletion: Math.round(stats.completed / stats.count),
    attempts: stats.count
  })).sort((a, b) => b.avgCompletion - a.avgCompletion);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-white mb-6">🎯 Smart Planning</h2>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-6 rounded-lg border border-indigo-700 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">📋 Recommendations</h3>
        <div className="space-y-3">
          {predictions && (
            <>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-white font-semibold mb-2">💪 Difficulty</p>
                <p className="text-slate-300 text-sm">You typically complete {predictions.expectedCompletion}% of tasks. Create sprints with <strong>{Math.max(3, Math.round(predictions.recommendedTaskCount * 0.8))}-{Math.round(predictions.recommendedTaskCount)}</strong> tasks for best results.</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <p className="text-white font-semibold mb-2">⏱️ Duration</p>
                <p className="text-slate-300 text-sm">Based on history, <strong>4-6 week sprints</strong> work best for you. Shorter sprints = more wins, longer sprints = deeper work.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category Performance */}
      {categoryPerformance.length > 0 && (
        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">📊 By Category</h3>
          <div className="space-y-4">
            {categoryPerformance.map(cat => (
              <div key={cat.name}>
                <div className="flex justify-between mb-2">
                  <span className="text-white capitalize">{cat.name}</span>
                  <span className={cat.avgCompletion >= 70 ? 'text-green-400' : cat.avgCompletion >= 50 ? 'text-yellow-400' : 'text-red-400'}>{cat.avgCompletion}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${cat.avgCompletion >= 70 ? 'bg-green-500' : cat.avgCompletion >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${cat.avgCompletion}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{cat.attempts} sprints</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patterns & Tips */}
      <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">🎯 Patterns & Tips</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 p-3 bg-emerald-900/20 rounded border border-emerald-700">
            <span className="text-lg">✅</span>
            <div>
              <p className="text-white font-semibold">Focus on High-Performance Categories</p>
              <p className="text-slate-300 text-xs">{categoryPerformance[0]?.name?.toUpperCase()} is your strongest area at {categoryPerformance[0]?.avgCompletion}%</p>
            </div>
          </div>
          {categoryPerformance.length > 1 && (
            <div className="flex items-start gap-3 p-3 bg-amber-900/20 rounded border border-amber-700">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="text-white font-semibold">Level Up Weaker Areas</p>
                <p className="text-slate-300 text-xs">{categoryPerformance[categoryPerformance.length - 1].name?.toUpperCase()} needs attention ({categoryPerformance[categoryPerformance.length - 1].avgCompletion}%)</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3 p-3 bg-blue-900/20 rounded border border-blue-700">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-white font-semibold">Break It Down</p>
              <p className="text-slate-300 text-xs">Larger tasks get postponed more. Aim for 3-5 action items per week.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PREDICTIVE ANALYTICS SCREEN
// ============================================================================

const PredictiveAnalyticsScreen = () => {
  const { getPredictiveInsights, getRiskSprants } = useApp();
  const predictions = getPredictiveInsights();
  const riskSprints = getRiskSprants();

  const successProbabilityColor = (prob) => {
    if (prob >= 70) return 'from-green-600 to-emerald-600';
    if (prob >= 50) return 'from-yellow-600 to-amber-600';
    return 'from-red-600 to-orange-600';
  };

  const successProbabilityText = (prob) => {
    if (prob >= 70) return 'text-green-300';
    if (prob >= 50) return 'text-yellow-300';
    return 'text-red-300';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h2 className="text-4xl md:text-5xl font-black text-white mb-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
        🔮 Predictive Analytics
      </h2>
      <p className="text-slate-400 mb-8 text-lg">AI-powered forecasts for your sprints</p>

      {predictions.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-4 text-xl">No active sprints with data yet</p>
          <p className="text-slate-500">Create and start a sprint to see predictions</p>
        </div>
      ) : (
        <>
          {/* RISK ALERT SECTION */}
          {riskSprints.length > 0 && (
            <div className="mb-10">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>⚠️</span> At-Risk Sprints
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {riskSprints.slice(0, 4).map((s) => (
                  <div 
                    key={s.id}
                    className="bg-gradient-to-br from-red-900/30 to-orange-900/30 p-6 rounded-2xl border-2 border-red-600/50 hover:border-red-500 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-white">{s.name}</h4>
                        <p className="text-red-300 text-sm mt-1">{s.goal}</p>
                      </div>
                      <div className="text-4xl font-black text-red-400">{s.prediction.successProbability}%</div>
                    </div>
                    
                    {s.prediction.riskFlags.slice(0, 2).map((flag, idx) => (
                      <div key={idx} className="text-sm text-red-200 mb-2 flex items-start gap-2">
                        <span className="mt-0.5">→</span>
                        <span>{flag.message}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ALL PREDICTIONS */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📊</span> All Sprint Forecasts
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {predictions.map((s) => (
                <div 
                  key={s.id}
                  className="bg-gradient-to-br from-slate-900 to-slate-800/50 p-6 rounded-2xl border-2 border-slate-700 hover:border-violet-500/50 transition-all"
                >
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-white mb-2">{s.name}</h4>
                    <p className="text-slate-400 text-sm">{s.goal}</p>
                  </div>

                  {/* Success Probability */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-300 font-semibold text-sm">Success Probability</span>
                      <span className={`text-2xl font-black ${successProbabilityText(s.prediction.successProbability)}`}>
                        {s.prediction.successProbability}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${successProbabilityColor(s.prediction.successProbability)} transition-all`}
                        style={{ width: `${s.prediction.successProbability}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="text-xs text-slate-400 mb-1">Completion Date</div>
                      <div className="text-sm font-bold text-violet-400">{s.prediction.predictedCompletionDate}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="text-xs text-slate-400 mb-1">Days Remaining</div>
                      <div className="text-sm font-bold text-cyan-400">{s.prediction.predictedDaysRemaining}</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="text-xs text-slate-400 mb-1">Velocity</div>
                      <div className="text-sm font-bold text-emerald-400">{s.prediction.velocity} tasks/day</div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="text-xs text-slate-400 mb-1">Progress</div>
                      <div className="text-sm font-bold text-orange-400">{s.prediction.currentProgress}%</div>
                    </div>
                  </div>

                  {/* Risk Flags */}
                  {s.prediction.riskFlags.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-slate-700">
                      {s.prediction.riskFlags.slice(0, 2).map((flag, idx) => (
                        <div 
                          key={idx}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                            flag.level === 'critical' ? 'bg-red-600/20 text-red-300 border border-red-600/50' :
                            flag.level === 'warning' ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/50' :
                            'bg-green-600/20 text-green-300 border border-green-600/50'
                          }`}
                        >
                          {flag.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* INSIGHTS */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-cyan-900/30 via-slate-900 to-blue-900/30 p-6 rounded-2xl border-2 border-cyan-700/50">
              <h4 className="text-lg font-bold text-cyan-300 mb-3 flex items-center gap-2">
                <span>💡</span> How It Works
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>✓ Analyzes your completion velocity</li>
                <li>✓ Predicts finishing date at current pace</li>
                <li>✓ Calculates success probability from multiple factors</li>
                <li>✓ Flags risks early so you can adjust</li>
                <li>✓ Learns from your sprint history</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-violet-900/30 via-slate-900 to-fuchsia-900/30 p-6 rounded-2xl border-2 border-violet-700/50">
              <h4 className="text-lg font-bold text-violet-300 mb-3 flex items-center gap-2">
                <span>🎯</span> Pro Tips
              </h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>→ Keep velocity high by completing tasks regularly</li>
                <li>→ Check predictions weekly to stay on track</li>
                <li>→ If risk flags appear, adjust your plan early</li>
                <li>→ Similar goals = better predictions over time</li>
                <li>→ Predictions improve as your data grows</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================

const LeaderboardScreen = () => {
  const { username, xp, level, unlockedBadges } = useApp();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-white mb-6">🎖️ Personal Leaderboard</h2>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-yellow-600 to-amber-600 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Your Stats</p>
              <p className="text-2xl font-bold text-white mt-2">{username}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">🥇</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs">Level</div>
            <div className="text-2xl font-bold text-violet-400 mt-1">{level}</div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs">XP</div>
            <div className="text-2xl font-bold text-blue-400 mt-1">{xp}</div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs">Badges</div>
            <div className="text-2xl font-bold text-yellow-400 mt-1">{unlockedBadges.length}</div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="text-slate-400 text-xs">Level Progress</div>
            <div className="text-2xl font-bold text-green-400 mt-1">{(xp % 500)}/500</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ARCHIVE SCREEN
// ============================================================================

const ArchiveScreen = () => {
  const { completedSprints } = useApp();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-white mb-6">📦 Completed Sprints Archive</h2>

      {completedSprints.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 rounded-lg border border-slate-800">
          <p className="text-slate-400">No completed sprints yet. Complete some sprints to see them here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedSprints.map(sprint => (
            <div key={sprint.id} className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-2">{sprint.name}</h3>
              <p className="text-slate-400 text-sm mb-3">{sprint.goal}</p>
              <p className="text-xs text-slate-500">Completed: {new Date(sprint.completedDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SETTINGS SCREEN
// ============================================================================

const SettingsScreen = () => {
  const { username, setUsername, notificationsEnabled, setNotificationsEnabled, exportData, userId, requestNotificationPermission } = useApp();
  const [editingUsername, setEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-white mb-6">⚙️ Settings</h2>

      <div className="space-y-6">
        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Username</label>
              {editingUsername ? (
                <div className="flex gap-2">
                  <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white" />
                  <button onClick={() => { setUsername(tempUsername); setEditingUsername(false); }} className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-500">Save</button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{username}</span>
                  <button onClick={() => setEditingUsername(true)} className="px-3 py-1 text-sm bg-slate-800 text-slate-300 rounded hover:bg-slate-700">Edit</button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">User ID</label>
              <code className="text-slate-300 text-sm bg-slate-800 p-2 rounded block">{userId}</code>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">🔔 Notifications</h3>
          <div className="space-y-4">
            <p className="text-slate-400 text-sm">Get daily check-in reminders and sprint updates</p>
            <button 
              onClick={() => requestNotificationPermission()}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:from-violet-500 hover:to-fuchsia-500 font-semibold transition-all"
            >
              {notificationsEnabled ? '✓ Notifications Enabled' : '📲 Enable Notifications'}
            </button>
            <p className="text-xs text-slate-500">
              {notificationsEnabled 
                ? 'You\'ll receive reminders for daily check-ins and sprint milestones'
                : 'Enable to get helpful reminders for your goals'}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Data</h3>
          <button onClick={exportData} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">📥 Export Data (JSON)</button>
        </div>

        <LogoutSection />
      </div>
    </div>
  );
};

// ============================================================================
// SPRINT SCREEN
// ============================================================================

const SprintScreen = () => {
  const { sprints, deleteSprint, addSprint, viewSprintDetails, showNotification } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [goalsList, setGoalsList] = useState([{ goal: '', category: '', customName: '', customEmoji: '' }]);
  const [duration, setDuration] = useState('6');
  const [startingPoint, setStartingPoint] = useState('');
  const [constraints, setConstraints] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'fitness', name: '💪 Fitness' },
    { id: 'career', name: '🎯 Career' },
    { id: 'learning', name: '📚 Learning' },
    { id: 'wellness', name: '🧘 Wellness' },
    { id: 'financial', name: '💰 Financial' },
    { id: 'household', name: '🏠 Household' },
    { id: 'general', name: '⭐ General' },
  ];

  const updateGoal = (idx, field, value) => {
    const updated = [...goalsList];
    updated[idx][field] = value;
    setGoalsList(updated);
  };

  const addGoalLine = () => {
    setGoalsList([...goalsList, { goal: '', category: '', customName: '', customEmoji: '' }]);
  };

  const removeGoalLine = (idx) => {
    setGoalsList(goalsList.filter((_, i) => i !== idx));
  };

  const generatePlan = async () => {
    const validGoals = goalsList.filter(g => g.goal.trim());
    if (validGoals.length === 0) {
      setError('Please enter at least one goal');
      return;
    }

    setLoading(true);
    setError(null);
    const weeks = parseInt(duration);

    try {
      for (const item of validGoals) {
        const goal = item.goal;
        const goalCategory = item.customName ? `${item.customEmoji} ${item.customName}` : item.category || 'general';
        
        // Generate sprint plan using smart templates (no API needed)
        const plan = generateSmartTemplate(goal, weeks, goalCategory);
        
        const weeklyTasks = plan.weeklyMilestones.map((milestone) => ({
          week: milestone.week,
          title: milestone.title,
          description: milestone.description,
          actionItems: milestone.actionItems,
          category: plan.category || item.category || 'general',
          goal: goal,
          completed: false
        }));

        addSprint({
          name: plan.sprintName,
          goal: goal,
          goals: [goal],
          difficulty: plan.difficulty || 'Moderate',
          category: plan.category || item.category || 'general',
          goalCategories: [{ name: goal, category: plan.category || goalCategory, customName: item.customName, emoji: item.customEmoji }],
          weeklyTasks: weeklyTasks,
          completedTasks: [],
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
      setShowForm(false);
      setGoalsList([{ goal: '', category: '', customName: '', customEmoji: '' }]);
      setStartingPoint('');
      setConstraints('');
      showNotification('Sprint Created!', '🎯 Your sprint plan is ready. Start executing!', 'success');
    } catch (error) {
      console.error(error);
      setError('Error generating plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSmartTemplate = (goal, weeks, category) => {
    const goalLower = goal.toLowerCase();
    const difficulty = determineDifficulty(goal);
    
    // Categorize based on keywords
    let detectedCategory = category;
    if (goalLower.includes('run') || goalLower.includes('exercise') || goalLower.includes('fit') || goalLower.includes('gym') || goalLower.includes('weight')) {
      detectedCategory = 'fitness';
    } else if (goalLower.includes('learn') || goalLower.includes('code') || goalLower.includes('skill') || goalLower.includes('study')) {
      detectedCategory = 'learning';
    } else if (goalLower.includes('job') || goalLower.includes('work') || goalLower.includes('career') || goalLower.includes('promotion')) {
      detectedCategory = 'career';
    } else if (goalLower.includes('save') || goalLower.includes('money') || goalLower.includes('budget') || goalLower.includes('financial')) {
      detectedCategory = 'financial';
    } else if (goalLower.includes('health') || goalLower.includes('sleep') || goalLower.includes('meditation') || goalLower.includes('wellness')) {
      detectedCategory = 'wellness';
    } else if (goalLower.includes('clean') || goalLower.includes('organize') || goalLower.includes('home') || goalLower.includes('house')) {
      detectedCategory = 'household';
    }

    const sprintName = generateSprintName(goal, weeks, difficulty);
    const milestones = generateMilestones(goal, weeks, difficulty, detectedCategory);

    return {
      sprintName,
      category: detectedCategory,
      difficulty,
      weeklyMilestones: milestones
    };
  };

  const determineDifficulty = (goal) => {
    const goalLower = goal.toLowerCase();
    const hardKeywords = ['advanced', 'master', 'expert', 'perfect', 'professional', 'fluent', 'complete'];
    const easyKeywords = ['try', 'start', 'basic', 'intro', 'beginner', 'explore'];
    
    if (hardKeywords.some(k => goalLower.includes(k))) return 'Hard';
    if (easyKeywords.some(k => goalLower.includes(k))) return 'Easy';
    return 'Moderate';
  };

  const generateSprintName = (goal, weeks, difficulty) => {
    const difficulties = { 'Easy': '🌱', 'Moderate': '🌿', 'Hard': '🚀' };
    const durationLabel = weeks < 4 ? 'Quick' : weeks < 8 ? 'Standard' : 'Extended';
    return `${difficulties[difficulty]} ${durationLabel} Sprint: ${goal.substring(0, 30)}${goal.length > 30 ? '...' : ''}`;
  };

  const generateMilestones = (goal, weeks, difficulty, category) => {
    const milestones = [];
    
    for (let week = 1; week <= weeks; week++) {
      const weekProgress = week / weeks;
      let title, description, actionItems;

      if (weekProgress <= 0.25) {
        // Foundation weeks
        title = `🏗️ Week ${week}: Foundation & Setup`;
        description = `Start strong by understanding the basics of "${goal}". Set up your environment, gather resources, and create a solid foundation for the rest of your sprint.`;
        actionItems = generateActionItems(goal, 'foundation', difficulty, category);
      } else if (weekProgress <= 0.75) {
        // Building weeks
        const buildPhase = Math.ceil(weekProgress * 3);
        title = `📈 Week ${week}: Building Skills & Momentum`;
        description = `Push forward! You're now in the middle phase where consistent effort compounds. Focus on deepening your skills and maintaining momentum.`;
        actionItems = generateActionItems(goal, 'building', difficulty, category);
      } else {
        // Final weeks
        title = `🎯 Week ${week}: Final Push & Consolidation`;
        description = `You're in the home stretch! Consolidate what you've learned, push for excellence, and prepare to achieve your goal.`;
        actionItems = generateActionItems(goal, 'final', difficulty, category);
      }

      milestones.push({
        week,
        title,
        description,
        actionItems
      });
    }

    return milestones;
  };

  const generateActionItems = (goal, phase, difficulty, category) => {
    const templates = {
      fitness: {
        foundation: [
          '3-4x/week: 20-min baseline workout (establish routine)',
          'Daily: Log all activity (build tracking habit)',
          '2x/week: Stretch & mobility work (reduce injury risk)',
          '1x/week: Rest & recovery day (prioritize health)',
          'Daily: Drink water throughout day (hydration baseline)'
        ],
        building: [
          '4-5x/week: 30-40 min sessions (increase duration)',
          'Daily: Progressive intensity (track improvements)',
          '2x/week: Strength training (build power)',
          '1x/week: Review and adjust plan (course correct)',
          'Daily: Nutrition logging (optimize fuel)'
        ],
        final: [
          '5x/week: 45-60 min intense sessions (peak effort)',
          'Daily: Approach goal metrics (final push)',
          'Weekly: Test max capacity (measure progress)',
          'Prep: Recovery protocol (prevent burnout)',
          'Daily: Mental prep & visualization (mindset)'
        ]
      },
      learning: {
        foundation: [
          'Daily: 30 min focused study (build discipline)',
          '3x/week: Practical exercises (apply knowledge)',
          '1x/week: Review & organize notes (retention)',
          '1x/week: Teach someone else (test understanding)',
          'Daily: Consume one relevant piece (immersion)'
        ],
        building: [
          'Daily: 45-60 min deep work (grow expertise)',
          '4x/week: Build projects/solve problems (apply)',
          'Weekly: Reflect on progress (metacognition)',
          '1x/week: Get feedback (improve faster)',
          'Daily: Read/watch advanced material (growth)'
        ],
        final: [
          'Daily: 60+ min mastery work (excellence)',
          '5x/week: Build capstone project (demonstrate)',
          'Weekly: Teach & mentor (solidify knowledge)',
          '3x/week: Tackle hard problems (mastery)',
          'Daily: Polish & refine skills (perfection)'
        ]
      },
      career: {
        foundation: [
          'Daily: 30 min skill building (invest in self)',
          '2x/week: Network & connect (build relationships)',
          '1x/week: Research opportunities (awareness)',
          '1x/week: Practice interview skills (prep)',
          'Daily: Update portfolio/projects (visibility)'
        ],
        building: [
          'Daily: 45 min focused skill work (deepen)',
          '3x/week: Applied projects (show value)',
          '2x/week: Networking events/calls (expand network)',
          '1x/week: Seek mentorship (accelerate)',
          'Weekly: Update resume & materials (stay current)'
        ],
        final: [
          'Daily: 60+ min impact work (maximize value)',
          '5x/week: Execute major projects (results)',
          '3x/week: Strategic networking (key contacts)',
          '2x/week: Mentor others (leadership)',
          'Weekly: Document achievements (evidence)'
        ]
      },
      wellness: {
        foundation: [
          'Daily: 10 min meditation (start practice)',
          '3-4x/week: Movement (30 min walks or yoga)',
          'Daily: Sleep tracking (baseline)',
          '1x/week: Healthy meal prep (nutrition base)',
          'Daily: Stress logging (awareness)'
        ],
        building: [
          'Daily: 15-20 min meditation (deepen)',
          '4-5x/week: Exercise (45 min sessions)',
          'Daily: Sleep optimization (8+ hours)',
          '2x/week: Healthy cooking (improve skills)',
          'Daily: Journaling (emotional health)'
        ],
        final: [
          'Daily: 20+ min meditation (mastery)',
          '5-6x/week: Exercise (intense sessions)',
          'Daily: Perfect sleep routine (consistency)',
          '3x/week: Meal prep (excellence)',
          'Daily: Mindfulness practices (integration)'
        ]
      },
      default: {
        foundation: [
          'Daily: 30 min focused work (establish routine)',
          '3x/week: Review progress (track momentum)',
          '1x/week: Plan next steps (stay organized)',
          '1x/week: Celebrate wins (motivation)',
          'Daily: Log effort (accountability)'
        ],
        building: [
          'Daily: 45 min focused work (increase effort)',
          '4x/week: Make measurable progress (results)',
          '2x/week: Seek feedback (improve)',
          'Weekly: Adjust plan if needed (flexibility)',
          'Daily: Push comfort zone (growth)'
        ],
        final: [
          'Daily: 60+ min peak effort (go all in)',
          '5x/week: Final sprints toward goal (execution)',
          'Daily: Track all metrics (precision)',
          'Weekly: Reflect on learnings (wisdom)',
          'Daily: Visualization & mental prep (mindset)'
        ]
      }
    };

    const phaseTemplates = templates[category] || templates.default;
    return phaseTemplates[phase] || phaseTemplates.foundation;
  };


  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Sprints</h2>
        <button 
          id="create-sprint-button"
          onClick={() => setShowForm(true)} 
          className="w-full md:w-auto px-4 md:px-6 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-500"
        >
          + Create Sprint
        </button>
      </div>

      {sprints.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 rounded-lg border border-slate-800">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">No Sprints Yet</h3>
          <p className="text-slate-400 mb-6 text-sm md:text-base">Create your first sprint to get started!</p>
          <button onClick={() => setShowForm(true)} className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm md:text-base">Create Sprint</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sprints.map(s => {
            const progress = s.weeklyTasks?.length > 0 ? (s.completedTasks?.length / s.weeklyTasks.length) * 100 : 0;
            const difficultyColor = s.difficulty === 'Easy' ? 'from-green-600/40 to-emerald-600/40 border-green-500 text-green-300' :
                                   s.difficulty === 'Moderate' ? 'from-yellow-600/40 to-amber-600/40 border-yellow-500 text-yellow-300' :
                                   'from-red-600/40 to-orange-600/40 border-red-500 text-red-300';
            
            return (
              <div 
                key={s.id} 
                className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border-2 border-slate-700 hover:border-violet-500 hover:shadow-2xl hover:shadow-violet-500/20 transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer"
                onClick={() => viewSprintDetails(s.id)}
              >
                {/* Gradient background accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-violet-600/10 to-transparent rounded-bl-3xl -z-0"></div>
                
                <div className="relative z-10">
                  {/* Header with title and badges */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors truncate">{s.name}</h3>
                        <p className="text-sm text-slate-400 truncate mt-1">{s.goal}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); deleteSprint(s.id); }}
                        className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 text-xl"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      {s.difficulty && (
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r ${difficultyColor} border`}>
                          {s.difficulty}
                        </div>
                      )}
                      {s.category && (
                        <div className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-600/40 border border-blue-500 text-blue-300">
                          {s.category}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Circular Progress */}
                  <div className="flex justify-center mb-5">
                    <div className="relative w-28 h-28">
                      <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#334155" strokeWidth="4" />
                        <circle 
                          cx="50" cy="50" r="40" 
                          fill="none" 
                          stroke="url(#grad)" 
                          strokeWidth="4" 
                          strokeDasharray={`${(progress / 100) * 251} 251`} 
                          style={{ transition: 'stroke-dasharray 0.6s ease', strokeLinecap: 'round' }}
                        />
                        <defs>
                          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{Math.round(progress)}%</div>
                          <div className="text-xs text-slate-500 mt-1">{s.completedTasks?.length || 0}/{s.weeklyTasks?.length || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-slate-400 mb-4">
                    <div className="flex items-center justify-between">
                      <span>📅 Start:</span>
                      <span className="text-slate-300 font-semibold">{s.startDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🎯 Tasks:</span>
                      <span className="text-slate-300 font-semibold">{s.weeklyTasks?.length || 0} weeks</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button 
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold transition-all transform group-hover:scale-105 text-sm"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 p-4 flex items-center justify-center md:items-center overflow-y-auto md:overflow-y-visible">
         <div className="bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-800 flex flex-col my-4 md:my-0" style={{maxHeight: 'min(90vh, calc(100vh - 32px))'}}>
            {/* STICKY HEADER */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center gap-3 z-10 rounded-t-2xl flex-shrink-0">
              <span className="text-3xl">✨</span>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">Create Sprint Plan</h2>
                <p className="text-slate-400 text-sm mt-1">Smart templates generate your plan instantly</p>
              </div>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-2xl flex-shrink-0">×</button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div style={{flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch'}}>
              <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                {error && (
                  <div className="p-3 bg-red-600/20 border border-red-600 rounded text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-white font-semibold mb-3">Your Goals</label>
                  <div className="space-y-3">
                    {goalsList.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          value={item.goal} 
                          onChange={(e) => updateGoal(idx, 'goal', e.target.value)} 
                          placeholder="e.g., Run 10km" 
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500" 
                        />
                        {!item.customName ? (
                          <select 
                            value={item.category} 
                            onChange={(e) => {
                              if (e.target.value === 'custom') {
                                updateGoal(idx, 'category', 'custom');
                              } else {
                                updateGoal(idx, 'category', e.target.value);
                              }
                            }} 
                            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-semibold"
                          >
                            <option value="">Category</option>
                            {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                            <option value="custom">✏️ Custom</option>
                          </select>
                        ) : null}
                        {item.customName ? (
                          <div className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-semibold whitespace-nowrap">
                            {item.customEmoji} {item.customName}
                          </div>
                        ) : null}
                        <button 
                          onClick={() => removeGoalLine(idx)} 
                          className="px-3 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 font-semibold flex-shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addGoalLine} className="mt-3 w-full px-4 py-3 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30 border-2 border-violet-500 text-white rounded-lg hover:from-violet-600/40 hover:to-fuchsia-600/40 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
                   <span className="text-lg">✨</span> Add Another Goal
                   </button>                
                   </div>

                <div>
                <label className="block text-white font-semibold mb-3 flex items-center justify-between">
                  <span>Duration</span>
                  <span className="text-2xl font-bold text-violet-400">{duration} weeks</span>
                </label>
                <div className="space-y-2">
                  <input 
                    type="range" 
                    min="2" 
                    max="12" 
                    step="2"
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    style={{
                      background: `linear-gradient(to right, rgb(124 58 237) 0%, rgb(124 58 237) ${((duration - 2) / 10) * 100}%, rgb(51 65 85) ${((duration - 2) / 10) * 100}%, rgb(51 65 85) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-slate-500 font-semibold px-1">
                    <span>2w</span>
                    <span>4w</span>
                    <span>6w</span>
                    <span>8w</span>
                    <span>10w</span>
                    <span>12w</span>
                  </div>
                </div>
               </div>

              {/* Collapsible Advanced Options */}
<div className="border border-slate-700 rounded-lg overflow-hidden">
  <button
    onClick={() => {
      const advancedSection = document.getElementById('advanced-options');
      const isHidden = advancedSection.style.display === 'none';
      advancedSection.style.display = isHidden ? 'block' : 'none';
      event.currentTarget.querySelector('.arrow').style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    }}
    className="w-full px-4 py-3 bg-slate-800/50 hover:bg-slate-800 transition-colors flex items-center justify-between"
  >
    <span className="text-white font-semibold flex items-center gap-2">
      <span className="text-lg">⚙️</span>
      Advanced Options
      <span className="text-xs text-slate-400">(optional)</span>
    </span>
    <span className="arrow text-slate-400 transition-transform duration-300">▼</span>
  </button>
  
  <div id="advanced-options" style={{display: 'none'}} className="p-4 space-y-4 bg-slate-800/20">
    <div>
      <label className="block text-white font-semibold mb-2 text-sm">Starting Point</label>
      <textarea 
        value={startingPoint} 
        onChange={(e) => setStartingPoint(e.target.value)} 
        placeholder="e.g., Currently can run 2K, never coded before..." 
        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm" 
        rows="2" 
      />
      <p className="text-xs text-slate-500 mt-1">Where are you starting from?</p>
    </div>

    <div>
      <label className="block text-white font-semibold mb-2 text-sm">Constraints</label>
      <textarea 
        value={constraints} 
        onChange={(e) => setConstraints(e.target.value)} 
        placeholder="e.g., Only have 30 mins/day, need to work around injury..." 
        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm" 
        rows="2" 
      />
      <p className="text-xs text-slate-500 mt-1">Any limitations or special considerations?</p>
    </div>
  </div>
</div>
              </div>
            </div>

            {/* STICKY FOOTER BUTTONS */}
            <div className="bg-slate-900 border-t border-slate-800 p-6 flex gap-3 flex-shrink-0">
              <button onClick={() => setShowForm(false)} disabled={loading} className="flex-1 px-4 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 disabled:opacity-50 font-semibold">Cancel</button>
              <button onClick={generatePlan} disabled={loading} className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:from-violet-500 hover:to-fuchsia-500 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Generate Plan</span>
                  </>
                )}
              </button>
            </div>

            {loading && (
              <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center z-20">
                <div className="text-center">
                  <LoadingSpinner size="lg" />
                  <p className="text-white font-semibold mt-4">Creating your sprint plan...</p>
                  <p className="text-slate-400 text-sm mt-1">Using smart templates or AI</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

const App = () => {
  const { currentScreen } = useApp();
  
  if (currentScreen === 'sprint-detail') return <SprintDetailScreen />;
  if (currentScreen === 'home') return <HomeScreen />;
  if (currentScreen === 'calendar') return <CalendarScreen />;
  if (currentScreen === 'insights') return <InsightsScreen />;
  if (currentScreen === 'predictions') return <PredictiveAnalyticsScreen />;
  if (currentScreen === 'planning') return <SmartPlanningScreen />;
  if (currentScreen === 'habits') return <HabitsScreen />;
  if (currentScreen === 'achievements') return <AchievementsScreen />;
  if (currentScreen === 'leaderboard') return <LeaderboardScreen />;
  if (currentScreen === 'archive') return <ArchiveScreen />;
  if (currentScreen === 'settings') return <SettingsScreen />;
  return <SprintScreen />;
};

function Root() {
  return (
    <ErrorBoundary>
      <FirebaseAppProvider>
        <RootContent />
      </FirebaseAppProvider>
    </ErrorBoundary>
  );
}

function RootContent() {
  return (
    <AppProvider>
      <AuthWrapper>
        <RootContentInner />
      </AuthWrapper>
    </AppProvider>
  );
}

function RootContentInner() {
  const isMobile = useMobileDetection();
  const { 
    toastNotifications, 
    setToastNotifications,
    showOnboarding,
    onboardingStep,
    setOnboardingStep,
    completeOnboarding,
    restartOnboarding
  } = useApp();

  const removeToast = (id) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {isMobile && <MobileHeader />}
      <Navigation />
      {/* Mobile: add top padding for header + bottom padding for nav */}
      <div className={isMobile ? 'pt-16 pb-24' : ''}>
        <App />
      </div>
      {isMobile && <MobileBottomNav />}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-md">
        {toastNotifications.map(notification => (
          <NotificationToast
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeToast(notification.id)}
          />
        ))}
      </div>

      {/* Onboarding System */}
      {showOnboarding && onboardingStep === 0 && (
        <WelcomeModal
          onStartTour={() => setOnboardingStep(1)}
          onSkip={completeOnboarding}
        />
      )}

      {showOnboarding && onboardingStep > 0 && (
        <OnboardingTutorial />
      )}

      {/* Help Button */}
      <HelpButton onClick={restartOnboarding} />
    </div>
  );
}
export default Root;