# SOLYA — AI-Powered Senior Citizen Health & Safety Platform

> **"Your health. Your people. Always connected."**  
> *An intelligent health and safety companion designed for senior citizens.*

---

## 🌟 Overview

**SOLYA** is a full-stack digital health, safety, family connectivity, emergency response, and daily assistance platform designed primarily for senior citizens in India.

It connects health information, family, doctors, devices, reminders, and emergency support into one calm, accessible, and simple experience.

---

## 👵 Primary Roles & Demo Personas

1. **Role 1 — Senior User**: **Rajesh Sharma** (72 years, Hindi/English, Hypertension, Osteoarthritis, Type 2 Diabetes).
2. **Role 2 — Family / Caregiver**: **Priya Sharma** (Daughter & Primary Caregiver, Bengaluru).
3. **Role 3 — Doctor / Care Team**: **Dr. Ananya Mehta, MD** (Cardiologist & Senior Physician, CityCare Super Specialty Hospital).

Instant one-click role switching is available directly in the top header.

---

## 🌐 11 Indian Languages Supported

Solya includes a comprehensive multilingual translation engine with persistent language selection across sessions:
1. **English** (en)
2. **Hindi** (hi — हिंदी)
3. **Bengali** (bn — বাংলা)
4. **Marathi** (mr — मराठी)
5. **Telugu** (te — తెలుగు)
6. **Tamil** (ta — தமிழ்)
7. **Gujarati** (gu — ગુજરાતી)
8. **Kannada** (kn — ಕನ್ನಡ)
9. **Malayalam** (ml — മലയാളം)
10. **Punjabi** (pa — ਪੰਜਾਬੀ)
11. **Odia** (or — ଓଡ଼ିଆ)

---

## 👓 Senior-First Accessibility

- **Vision-Friendly Mode**: Ultra-large typography, high-contrast borders, simplified layouts, and screen narration.
- **Hearing-Friendly Mode**: Real-time visual alerts, closed captions on video calls, and vibration banners.
- **Web Speech API**: Natural Text-to-Speech (TTS) reading aloud for briefings, prescriptions, and lab reports, plus speech-to-text input.
- **Senior Touch Targets**: Minimum 56px touch areas, high contrast (WCAG AAA compliant), zero micro-fonts.

---

## 🚀 5 Interactive Demo Journeys

### 1. Journey 1 — Smart Prescription Upload & Dosage Cascade
- Upload or scan paper prescription from Dr. Mehta.
- AI extracts explicitly documented medications, tests, and follow-ups.
- Detects dosage change: **Amlodipine 5 mg ➔ 10 mg**.
- Shows before-and-after review modal.
- Senior confirms update ➔ Live cascade updates medication list, schedule, health timeline, and notifies family!

### 2. Journey 2 — 🚨 Emergency System & 3-Second Hold Cancel
- Tap prominent red **"I NEED HELP"** button.
- Emergency activated with simulated GPS location, medical summary (Blood Group B+, Penicillin allergy).
- Record user-reported voice note (*"I fell in the bathroom and I cannot stand"*).
- Alerts escalate to Priya (Primary), Amit (Secondary), and Dr. Mehta.
- Simulated ambulance dispatch with ETA ~12 mins (*Demo Mode*).
- Accidental protection: **Press and hold for 3 seconds** to cancel, immediately reassuring family.

### 3. Journey 3 — Daily Family Check-In & Consented Camera View
- Senior taps **"I'M OK"** on home screen.
- Priya's caregiver dashboard instantly displays: *"Rajesh confirmed he is safe"*.
- Consented Camera View: Family requests safety check ➔ Senior receives prompt: *"Priya wants to check if you are okay"* ➔ Senior chooses **ALLOW CAMERA** or **NOT NOW**. Senior can stop the camera at any moment.

### 4. Journey 4 — Doctor Voice Update & Audit Trail
- Dr. Mehta dictates clinical instructions (*"Continue Amlodipine 10 mg once daily. Stop NSAID painkillers. Schedule serum creatinine test in two weeks"*).
- AI converts dictation into structured changes.
- Doctor reviews and clicks **"Approve & Update Record"**.
- Transparent audit entry is logged and Rajesh's schedule is updated.

### 5. Journey 5 — Scam Protection & Digital Phone Tutor
- Senior pastes suspicious SMS or WhatsApp message (e.g. *"Bank account blocked, click bit.ly link and enter OTP"*).
- Solya analyzes urgency triggers, sensitive credential demands, and fraudulent links.
- Explains why it is suspicious and provides direct action buttons: **Tell Family**, **Report to 1930 Cyber Crime**, and **Delete**.
- **Show Me How**: Step-by-step phone tutor for sending photos on WhatsApp, making video calls, or adjusting phone ringer volume with audio guidance.

---

## 📋 13 Condition-Specific Care Plans

1. **Osteoarthritis** (Bone & Joint) — Mobility check-in, knee stiffness care, fall prevention.
2. **Osteoporosis** (Bone & Joint) — Fall risk mitigation, Vitamin D/Calcium tracking.
3. **Hypertension** (Heart & BP) — Morning BP log, salt restrictions, Amlodipine regimen.
4. **Atherosclerosis** (Heart & BP) — Atorvastatin schedule, lipid targets.
5. **Heart Failure** (Heart & BP) — Daily weighing, fluid balance, resting heart rate.
6. **Chronic Kidney Disease** (Kidney) — eGFR monitoring, avoiding NSAIDs.
7. **Type 2 Diabetes** (Diabetes) — Fasting glucose tracking, Metformin adherence.
8. **COPD** (Breathing) — Inhaler technique, SpO2 monitoring.
9. **Alzheimer's Disease** (Brain & Movement) — **Memory & Safety Mode**, "Where am I?" button, orientation schedule.
10. **Parkinson's Disease** (Brain & Movement) — Precision medication timing, fall safety.
11. **Age-related Macular Degeneration** (Vision) — **Vision-Friendly Mode**, Amsler grid self-check.
12. **Hearing Loss** (Hearing) — **Hearing-Friendly Mode**, visual caption banners.
13. **Cancer Care** (Cancer) — Post-treatment oncology survivorship journey, temperature alert threshold (>100.4°F).

---

## 🛠️ Technology Stack

- **Backend**: Python 3.9+ REST API (`http.server` & `sqlite3`) with zero external dependency friction.
- **Database**: SQLite3 (`backend/solya.db`) with 22 relational tables modeling users, profiles, care plans, medications, logs, timeline events, and audit trails.
- **Frontend**: Modern vanilla SPA with clean modular component architecture, accessible CSS design system, Web Speech API (TTS and voice input), and responsive tablet/desktop/mobile layouts.
- **Testing**: Python integration test suite verifying all 16 endpoints and workflows.

---

## 💻 Running the Application

### Start Server
```bash
./start.sh
# or
python3 backend/server.py
```
Open your browser at **`http://localhost:8080`**.

### Run Test Suite
```bash
python3 backend/test_server_e2e.py
```