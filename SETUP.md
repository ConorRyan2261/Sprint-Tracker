# 🎯 VISUAL STUDIO CODE SETUP GUIDE

Complete step-by-step instructions to get your Sprint Tracker running.

## ✅ Prerequisites

- Windows 10/11 or Mac
- VS Code (free from https://code.visualstudio.com/)
- Node.js (free from https://nodejs.org/)

## 📋 Setup Steps

### Step 1: Install Node.js
1. Go to https://nodejs.org/
2. Download LTS version
3. Run installer, click Next through everything
4. Restart your computer
5. Open Command Prompt, type: `node --version`
6. You should see a version number

### Step 2: Open Project in VS Code
1. Right-click the `sprint-tracker` folder
2. Select "Open with Code"
3. VS Code opens

### Step 3: Install Dependencies
1. Click "Terminal" menu at top
2. Click "New Terminal"
3. Type: `npm install`
4. Press Enter
5. Wait 2-3 minutes for packages to install
6. You should see: ✅ added XX packages

### Step 4: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Name: Sprint Tracker
4. Uncheck "Enable Google Analytics"
5. Click "Create project"
6. Wait for it to load

### Step 5: Create Web App
1. Click "</>" icon for Web
2. App nickname: web
3. Click "Register app"
4. Copy the config values (big JavaScript object)
5. Close this screen

### Step 6: Fill in .env.local
1. In VS Code, click `.env.local` file (left panel)
2. Replace `YOUR_API_KEY_HERE` with your actual API key
3. Replace `YOUR_AUTH_DOMAIN_HERE` with your auth domain
4. Do this for all 6 values
5. Save (Ctrl+S)

Example:
```
REACT_APP_FIREBASE_API_KEY=AIzaSyABC123def456
REACT_APP_FIREBASE_AUTH_DOMAIN=sprint-tracker-abc123.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=sprint-tracker-abc123
REACT_APP_FIREBASE_STORAGE_BUCKET=sprint-tracker-abc123.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abc123def456
```

### Step 7: Enable Firestore Database
1. Go back to Firebase Console
2. Click "Firestore Database" on left
3. Click "Create Database"
4. Choose "Production mode"
5. Choose nearest region
6. Click "Create"
7. Wait for it to finish

### Step 8: Enable Anonymous Auth
1. Click "Authentication" on left
2. Click "Get started"
3. Find "Anonymous" provider
4. Click toggle to turn ON
5. Click "Save"

### Step 9: Set Security Rules
1. Still in Firebase, click "Firestore Database"
2. Click "Rules" tab
3. Delete all the red text
4. Paste this:
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
5. Click "Publish"
6. Click "Publish" again to confirm

### Step 10: Run Your App
1. Back in VS Code
2. In terminal, type: `npm run dev`
3. Press Enter
4. You'll see: `Local: http://localhost:5173/`
5. Click that link
6. Your beautiful app opens! 🎉

### Step 11: Test It
1. Create a sprint
2. Open browser console (F12)
3. Look for "Sprint saved: [name]"
4. Refresh page (F5)
5. Sprint is still there! ✅

## 🎮 How to Use the App

### Create a Sprint
- Click "Sprints" tab
- Type sprint name and goal
- Click "Create Sprint"
- Click tasks to complete them

### Daily Check-In
- Click "Home" tab
- Click "Daily Check-In" button
- Get +25 XP and increase streak

### Change Theme
- Click "Settings" tab
- Choose a color theme
- App changes instantly

### View Progress
- See progress bars on sprints
- Watch XP increase
- Level up every 500 XP

## 🆘 Common Issues

### "npm is not recognized"
**Solution**: Install Node.js from nodejs.org, restart computer

### "MISSING_OR_INVALID_ENVIRONMENT_VARIABLE"
**Solution**: 
- Check `.env.local` has all 6 values
- No spaces around `=`
- Restart terminal: Ctrl+C, then `npm run dev`

### "Cannot find module"
**Solution**: Run `npm install` again in terminal

### Port 5173 already in use
**Solution**: Type: `npm run dev -- --port 3000`

### App won't save data
**Solution**:
- Check Firebase has Firestore Database created
- Check Anonymous auth is ON
- Check Security Rules are published

## 📝 File Structure

```
sprint-tracker/          (Main folder)
├── src/               (Source code)
│   ├── App.jsx        (Main app)
│   ├── main.jsx       (Entry point)
│   ├── index.css      (Styles)
│   ├── config/        (Firebase config)
│   ├── services/      (Firebase services)
│   └── context/       (React context)
├── public/            (Static files)
├── package.json       (Dependencies)
├── index.html         (HTML page)
├── vite.config.js     (Vite config)
├── .env.local         (Your Firebase credentials)
├── README.md          (Project info)
└── SETUP.md           (This file)
```

## ✅ You're Done!

Your Sprint Tracker is now running with Firebase!

- All data saves to cloud
- Offline support included
- Full gamification system
- Beautiful responsive UI

Start creating sprints and have fun! 🚀

## 📞 Need Help?

1. Check browser console (F12) for red error messages
2. Check Firebase Console for data issues
3. Check that all `.env.local` values are correct
4. Try restarting the dev server: Ctrl+C, then `npm run dev`
5. Try: `npm install` again

Good luck! 🎉
