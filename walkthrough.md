# 🚀 ResQAI — AI Powered Disaster Response System

## 🌟 Executive Summary

**ResQAI** is a startup-grade, real-world emergency disaster response platform. Built with React (Vite), Tailwind v3, Framer Motion, Clerk Authentication, Node.js/Express REST API, MongoDB Atlas, and Leaflet/OpenStreetMap.

---

## 🔑 Key Features Implemented

### 1. 🚨 Emergency First SOS (`/`)
- **Home Route is SOS:** Opening the site (`/`) immediately presents the Emergency SOS action.
- **Auto-GPS Detection:** Automatically detects location coordinates upon page load.
- **1-Minute Voice Distress Recorder:** Record, stop, preview, and attach up to a 60-second voice message.
- **Optional Description & Disaster Photo:** Fast, low-friction reporting for citizens in a crisis.

### 2. 🔐 Real Clerk Authentication (`/auth`)
- **Real Clerk User Profiles:** Full integration with `@clerk/clerk-react` (`<SignedIn>`, `<SignedOut>`, `<UserButton>`, `<SignIn>`, `<SignUp>`).
- **Crash-Proof Guard:** Includes `ClerkErrorBoundary` to handle invalid API keys gracefully.

### 3. 🍃 MongoDB Atlas Sync (`server.js`)
- **Native Document Storage:** Stores emergency reports with citizen metadata (`userId`, `userName`, `userEmail`, `userPhone`, `userImage`, `lat`, `lng`, `emergencyType`, `aiPriority`, `aiReason`, `assignedUnit`).
- **Resilient Fallback:** Automatically switches between MongoDB Atlas and local file storage if offline.

### 4. 🔒 Rescue Authority Command Center (`/dashboard`)
- **Security Lock:** Access to the live command map is locked behind Authority Passcode authentication (Demo badge: `ADMIN` / passcode: `admin123`).
- **Interactive Leaflet Map:** Dark & Light custom pins, priority auto-bounds, and detailed incident popups.
- **Rescue Taskforce Assignment:** Dispatch NDRF, SDRF, Fire Brigade, and Medical units with status updates (`pending` → `assigned` → `in_progress` → `resolved`).

### 5. 🤖 AI Emergency Prioritization (`aiService.js`)
- **Multi-Model Provider:** Supports **Llama 3.1 8B**, **Gemini 2.0 Flash**, and an instant 0-latency Smart NLP Severity Classifier.
- **Output:** Returns priority (`Critical`, `High`, `Medium`, `Low`), AI Reasoning, and Recommended Rescue Team.

### 6. 📷 AI Damage Assessment (`/damage`)
- Drag-and-drop disaster photo analysis with multimodal vision AI.

---

## 🎨 UI & Aesthetics
- **Theme:** Clean White (`#FFFFFF`), Vibrant Safety Orange (`#F97316`), and Rescue Blue (`#0284C7`).
- **Typography:** Plus Jakarta Sans & Inter.
- **Contrast:** High-contrast dark slate text (`#0F172A`) for 100% legibility across all cards and forms.

---

## 🛠️ Quick Commands

```bash
# Start both client and server
npm run dev
```

- **Client:** `http://localhost:3001` (or active Vite port)
- **API Server:** `http://localhost:5000`
