# ResQAI — Setup Guide

## Quick Start

### 1. Fill in API Keys

Open `.env` and replace the placeholder values:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_GEMINI_API_KEY=...     (from aistudio.google.com)
VITE_GOOGLE_MAPS_KEY=...    (from console.cloud.google.com)
```

### 2. Firebase Setup

1. Go to https://console.firebase.google.com
2. Create new project "ResQAI"
3. Enable Authentication > Email/Password
4. Enable Firestore > Start in test mode
5. Enable Storage > Start in test mode
6. Project Settings > Web App > copy values to .env

### 3. Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /incidents/{id} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 4. Run

```bash
npm run dev
```

Open: http://localhost:3000

---

## Project Structure

```
src/
├── components/
│   ├── ai/           AIVerdictCard, DamageResultCard
│   ├── dashboard/    StatsBar, StatusTimeline, IncidentDetailPanel
│   ├── layout/       Navbar
│   ├── map/          GoogleMap
│   ├── sos/          SOSForm
│   └── ui/           Button, Badge, Card, Input, Spinner, Toast
├── context/          Auth, Theme, Toast
├── firebase/         config, auth, firestore, storage
├── hooks/            useIncidents, useMaps
├── pages/            Landing, SOS, Dashboard, DamageDetector, Auth
├── services/         geminiService
└── utils/            constants, helpers
```

## Features

| Feature | Description |
|---|---|
| Smart SOS | Pulsing button, GPS, photo, Gemini triage |
| AI Priority | Critical / High / Medium / Low color-coded |
| Live Dashboard | Real-time Firestore + Google Maps markers |
| AI Damage | Image upload + Gemini Vision analysis |
| Auth | Firebase Email/Password |
| Dark/Light | Toggle, persisted to localStorage |
