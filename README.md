# 🎯 SPRINT TRACKER - COMPLETE PROJECT

A beautiful, feature-rich goal-tracking app with gamification, Firebase cloud storage, and full offline support.

## 📦 What's Included

This is a **complete, ready-to-use project** with:

- ✅ Beautiful React app (11+ screens)
- ✅ Firebase integration (cloud data storage)
- ✅ Gamification (XP, levels, badges, streaks)
- ✅ Responsive design
- ✅ Full project structure
- ✅ All configuration files

## 🚀 Quick Start

### 1. Install Node.js
Download from https://nodejs.org/ (LTS version)

### 2. Open This Folder in VS Code
- Right-click `sprint-tracker` folder
- Select "Open with Code"

### 3. Open Terminal in VS Code
- Click Terminal menu → New Terminal
- Or press Ctrl+`

### 4. Install Dependencies
```bash
npm install
```

### 5. Setup Firebase
1. Go to https://console.firebase.google.com
2. Create new project: "Sprint Tracker"
3. Create web app
4. Copy the 6 config values
5. Open `.env.local` file
6. Replace YOUR_XXX_HERE with your Firebase values
7. Save the file

### 6. Enable Firestore Database
In Firebase Console:
1. Click "Firestore Database"
2. Click "Create Database"
3. Choose "Production mode"
4. Select nearest region
5. Click "Create"

### 7. Enable Anonymous Authentication
In Firebase Console:
1. Click "Authentication"
2. Click "Get started"
3. Find "Anonymous" provider
4. Toggle ON
5. Click "Save"

### 8. Set Security Rules
In Firebase Console Firestore > Rules tab, paste:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```
Click "Publish"

### 9. Run Your App
```bash
npm run dev
```

Click the link (usually http://localhost:5173)

## ✨ Features

### 📱 Screens
- **Home**: Daily check-in, XP, level, streak
- **Sprints**: Create/edit/delete goals with tasks
- **Calendar**: View and manage your sprints
- **Insights**: Charts and analytics
- **Achievements**: Badges and progress
- **Leaderboard**: Compare XP with friends
- **Habits**: Track daily habits
- **Archive**: View completed sprints
- **Settings**: Customization options

### 🎮 Gamification
- XP points for completing tasks
- Level progression
- Daily streaks
- Achievement badges
- Power-ups
- Leaderboards

### ☁️ Data Storage
- Firebase cloud sync
- Automatic data backup
- Multi-device sync (with login)
- Offline support

## 📁 Project Structure

```
sprint-tracker/
├── src/
│   ├── config/
│   │   └── firebase.ts          (Firebase setup)
│   ├── services/
│   │   ├── auth.ts              (Authentication)
│   │   └── firebaseData.ts      (Data operations)
│   ├── context/
│   │   └── FirebaseAppContext.tsx (React context)
│   ├── App.jsx                  (Main app component)
│   ├── main.jsx                 (Entry point)
│   └── index.css                (Global styles)
├── public/                      (Static files)
├── package.json                 (Dependencies)
├── vite.config.js              (Vite config)
├── index.html                  (HTML entry)
├── .env.local                  (Firebase credentials)
└── README.md                   (This file)
```

## 🔧 Configuration

### Firebase Credentials
Your Firebase config values go in `.env.local`:
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

Get these from Firebase Console > Project Settings > Web App

## 🎯 How to Use

### Create a Sprint
1. Go to "Sprints" tab
2. Click "Create Sprint"
3. Enter name and goal
4. Click "Create"
5. Check off tasks as you complete them

### Daily Check-In
1. Go to "Home" tab
2. Click "Daily Check-In"
3. Get +25 XP
4. Increase your streak

### Track Progress
- Sprints show completion percentage
- XP accumulates with each action
- Level up every 500 XP
- Unlock badges at milestones

## 📊 Gamification System

### XP Rewards
- Create Sprint: +50 XP
- Complete Task: +10 XP
- Daily Check-In: +25 XP

### Levels
- Every 500 XP = 1 Level
- Displayed in top-right corner

### Streaks
- Increase by daily check-in
- Bonus multipliers at 7, 30, 100 days

### Badges
- Unlock achievements
- Displayed in Achievements screen

## 🆘 Troubleshooting

### "npm is not recognized"
- Install Node.js from nodejs.org
- Restart your computer

### "MISSING_OR_INVALID_ENVIRONMENT_VARIABLE"
- Check `.env.local` has all 6 Firebase values
- No spaces around `=` signs
- Restart dev server (Ctrl+C, then `npm run dev`)

### "Not logged in" error
- Make sure Anonymous auth is ON in Firebase
- Restart the app

### "Permission denied" error
- Check Firestore Security Rules are published
- Wait 1-2 minutes for changes to apply

### Port already in use
- Try: `npm run dev -- --port 3000`

## 🚀 Next Steps

1. ✅ Get the app running
2. ✅ Create some sprints
3. ✅ Start checking in daily
4. Add Google/GitHub login
5. Invite friends
6. Deploy to web

## 📚 Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool
- **Firebase**: Cloud backend
- **Recharts**: Charts and graphs
- **Tailwind CSS**: Styling

## 📝 Notes

- Data is stored in Firebase Firestore
- Anonymous auth means no login needed (yet)
- All data syncs automatically
- Offline support included
- Free Firebase tier is very generous

## 💬 Support

If you get stuck:
1. Check the console (F12) for error messages
2. Check Firebase Console for data issues
3. Verify all 6 Firebase config values are correct
4. Make sure Firestore Database is created
5. Make sure Anonymous auth is enabled

## 🎉 Have Fun!

You now have a fully functional Sprint Tracker!

Start by creating a sprint and watching your XP grow! 🚀
