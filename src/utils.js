// Date utilities
export const dateUtils = {
  getDateString: (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  getDateFromString: (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  },
  addDays: (date, days) => {
    const d = typeof date === 'string' ? dateUtils.getDateFromString(date) : new Date(date);
    d.setDate(d.getDate() + days);
    return dateUtils.getDateString(d);
  },
  isSameDay: (date1, date2) => {
    const d1 = typeof date1 === 'string' ? dateUtils.getDateFromString(date1) : new Date(date1);
    const d2 = typeof date2 === 'string' ? dateUtils.getDateFromString(date2) : new Date(date2);
    return dateUtils.getDateString(d1) === dateUtils.getDateString(d2);
  },
  formatDate: (date, format = 'short') => {
    const d = typeof date === 'string' ? dateUtils.getDateFromString(date) : new Date(date);
    if (format === 'short') {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return d.toISOString().split('T')[0];
  }
};

// Data validation
export const dataValidation = {
  validateSprint: (sprint) => {
    const errors = [];
    if (!sprint) return { valid: false, errors: ['Sprint is null'] };
    if (!sprint.id) errors.push('Missing id');
    if (!sprint.name) errors.push('Missing name');
    if (!sprint.goal) errors.push('Missing goal');
    if (!sprint.startDate) errors.push('Missing startDate');
    if (!sprint.endDate) errors.push('Missing endDate');
    if (!Array.isArray(sprint.weeklyTasks)) errors.push('weeklyTasks not array');
    if (!Array.isArray(sprint.completedTasks)) errors.push('completedTasks not array');
    return { valid: errors.length === 0, errors };
  },
  repairSprint: (sprint) => {
    const now = new Date();
    const sixWeeksLater = new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000);
    return {
      id: sprint.id || `sprint-${Date.now()}`,
      name: sprint.name || sprint.goal || 'Unnamed Sprint',
      goal: sprint.goal || 'No goal',
      category: sprint.category || 'general',
      difficulty: sprint.difficulty || 'Moderate',
      weeklyTasks: Array.isArray(sprint.weeklyTasks) ? sprint.weeklyTasks : [],
      completedTasks: Array.isArray(sprint.completedTasks) ? sprint.completedTasks : [],
      startDate: sprint.startDate || dateUtils.getDateString(now),
      endDate: sprint.endDate || dateUtils.getDateString(sixWeeksLater),
      createdAt: sprint.createdAt || now.toISOString(),
      privacy: sprint.privacy || { goals: {} },
      goalCategories: sprint.goalCategories || [],
      ...sprint
    };
  },
  repairAppState: (state) => {
    return {
      xp: typeof state.xp === 'number' ? state.xp : 0,
      level: typeof state.level === 'number' ? state.level : 1,
      streak: typeof state.streak === 'number' ? state.streak : 0,
      lastCheckIn: state.lastCheckIn || null,
      username: state.username || 'User',
      friends: Array.isArray(state.friends) ? state.friends : [],
      unlockedBadges: Array.isArray(state.unlockedBadges) ? state.unlockedBadges : [],
      notificationsEnabled: state.notificationsEnabled === true,
      ...state
    };
  }
};

// Storage utilities
export const storageUtils = {
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.error(`Error reading ${key}:`, err);
      return defaultValue;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`Error writing ${key}:`, err);
      return false;
    }
  }
};
