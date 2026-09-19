import json
import re
import datetime
from database import query_all, query_one

class SolyaAIEngine:
    def __init__(self, senior_id="usr_rajesh"):
        self.senior_id = senior_id

    def get_context(self):
        senior = query_one("SELECT * FROM users WHERE id = ?", (self.senior_id,))
        profile = query_one("SELECT * FROM profiles WHERE user_id = ?", (self.senior_id,))
        meds = query_all("SELECT * FROM medications WHERE senior_id = ? AND status = 'active'", (self.senior_id,))
        appts = query_all("SELECT * FROM appointments WHERE senior_id = ? AND status = 'scheduled' ORDER BY appointment_date ASC", (self.senior_id,))
        readings = query_all("SELECT * FROM health_readings WHERE senior_id = ? ORDER BY recorded_at DESC LIMIT 5", (self.senior_id,))
        family = query_all("SELECT * FROM family_members WHERE senior_id = ?", (self.senior_id,))
        contacts = query_all("SELECT * FROM emergency_contacts WHERE senior_id = ? ORDER BY priority_order ASC", (self.senior_id,))
        conditions = query_all("SELECT * FROM health_conditions WHERE senior_id = ? AND status = 'active'", (self.senior_id,))
        return {
            "senior": senior,
            "profile": profile,
            "medications": meds,
            "appointments": appts,
            "readings": readings,
            "family": family,
            "emergency_contacts": contacts,
            "conditions": conditions
        }

    def generate_daily_briefing(self):
        ctx = self.get_context()
        name = ctx["senior"]["name"] if ctx["senior"] else "Rajesh"
        first_name = name.split()[0]
        med_count = len(ctx["medications"])
        appt_count = len(ctx["appointments"])
        
        appt_text = ""
        if ctx["appointments"]:
            first_appt = ctx["appointments"][0]
            appt_text = f"You have an appointment with {first_appt['doctor_name']} at {first_appt['appointment_time']} today."

        briefing = {
            "greeting": f"Good morning, {first_name}.",
            "summary_points": [
                f"{med_count} medicines scheduled for today",
                f"{appt_count} doctor consultation upcoming" if appt_count else "No hospital visits scheduled today",
                "Morning blood pressure reading is safe (128/82 mmHg)",
                "Family safety check-in scheduled for 8:00 PM"
            ],
            "action_text": "Would you like me to guide you through your medicines or appointment?",
            "read_aloud_text": f"Good morning {first_name}. Here is your briefing for today. You have {med_count} medicines scheduled, {appt_text} Your morning blood pressure is within your safe range. Have a wonderful and peaceful day."
        }
        return briefing

    def process_chat(self, user_text):
        text = user_text.lower().strip()
        ctx = self.get_context()
        
        # 1. Emergency detection
        if any(w in text for w in ["help", "emergency", "fell", "fall", "pain", "madad", "bachao"]):
            return {
                "reply": "I am here with you. If you need immediate assistance, please press the large red emergency button, or I can immediately alert your daughter Priya and Dr. Mehta.",
                "action": "TRIGGER_EMERGENCY_MODAL",
                "suggested_actions": ["Open Emergency Screen", "Call Priya (+91 98765 43211)", "Call Doctor"]
            }

        # 2. Medication queries
        if any(w in text for w in ["medicine", "medicines", "dawa", "dawai", "pill", "tablet", "dosage"]):
            meds = ctx["medications"]
            med_lines = []
            for m in meds:
                med_lines.append(f"• {m['scheduled_time']} — {m['name']} {m['dosage']} ({m['timing_tag']})")
            reply = f"You have {len(meds)} active medicines today:\n\n" + "\n".join(med_lines) + "\n\nWould you like me to set a reminder or view instructions?"
            return {
                "reply": reply,
                "action": "NAVIGATE_MEDICATIONS",
                "suggested_actions": ["Show Medicines", "Mark Taken", "Set Reminder"]
            }

        # 3. Appointments
        if any(w in text for w in ["appointment", "doctor", "dr", "dr.", "mehta", "visit", "hospital"]):
            if ctx["appointments"]:
                apt = ctx["appointments"][0]
                reply = f"You have an appointment with {apt['doctor_name']} ({apt['specialty']}) at {apt['hospital_name']} today at {apt['appointment_time']}.\n\nPurpose: {apt['purpose']}.\nPreparation: {apt['prep_instructions']}."
                return {
                    "reply": reply,
                    "action": "NAVIGATE_APPOINTMENTS",
                    "suggested_actions": ["View Appointment", "Directions to Hospital", "Call Doctor"]
                }
            else:
                return {
                    "reply": "You have no appointments scheduled for today. Would you like to schedule one?",
                    "action": "NAVIGATE_APPOINTMENTS",
                    "suggested_actions": ["Schedule Appointment", "View Doctors"]
                }

        # 4. Family calls
        if any(w in text for w in ["daughter", "priya", "son", "amit", "call family", "family"]):
            return {
                "reply": "Your daughter Priya Sharma is your primary contact (+91 98765 43211). Would you like me to start a phone call or a video call with her?",
                "action": "OPEN_FAMILY_CARD",
                "suggested_actions": ["Call Priya", "Video Call Priya", "Send Safety Check"]
            }

        # 5. Health readings
        if any(w in text for w in ["health", "bp", "blood pressure", "reading", "pulse", "sugar", "spo2"]):
            readings = ctx["readings"]
            r_text = []
            for r in readings:
                val = f"{r['value_numeric']}/{r['value_secondary']} {r['unit']}" if r['value_secondary'] else f"{r['value_numeric']} {r['unit']}"
                name = r['metric_type'].replace("_", " ").title()
                r_text.append(f"• {name}: {val} ({r['status_level']})")
            reply = "Here are your latest health readings:\n\n" + "\n".join(r_text) + "\n\nYour readings are generally within your configured safe range."
            return {
                "reply": reply,
                "action": "NAVIGATE_HEALTH",
                "suggested_actions": ["View Health Center", "View Trends", "Contact Doctor"]
            }

        # 6. Report reading
        if any(w in text for w in ["report", "test", "lab", "prescription", "scan"]):
            return {
                "reply": "Your latest lab report from CityCare Diagnostics shows normal kidney status (Creatinine 1.1 mg/dL) and mild elevation in fasting sugar (132 mg/dL). No critical issues were detected.",
                "action": "NAVIGATE_DOCUMENTS",
                "suggested_actions": ["Open Lab Report", "Upload New Prescription", "Questions for Doctor"]
            }

        # 7. Phone tutorial
        if any(w in text for w in ["photo", "send", "whatsapp", "tutorial", "how do i", "how to"]):
            return {
                "reply": "I can teach you step-by-step! For example, to send a photo to your daughter on WhatsApp: 1) Open WhatsApp, 2) Open Priya's chat, 3) Tap the paperclip or plus icon, 4) Choose Photos, and tap Send.",
                "action": "OPEN_TUTOR",
                "suggested_actions": ["Open Digital Tutor", "Practice Step-by-Step", "Read Aloud"]
            }

        # Default calm response
        return {
            "reply": "I'm Solya, your personal health companion. You can ask me about your medicines, today's appointments, your latest blood pressure readings, or tell me to call your daughter Priya.",
            "action": "SHOW_OPTIONS",
            "suggested_actions": ["What medicines today?", "Show my appointment", "Call my daughter", "I need help"]
        }

    def analyze_scam(self, message_text):
        text = message_text.lower()
        reasons = []
        is_suspicious = False

        if any(w in text for w in ["blocked", "suspended", "immediately", "urgent", "24 hours", "deactivated"]):
            is_suspicious = True
            reasons.append("Creates artificial urgency and panic (claims account will be blocked)")
        if any(w in text for w in ["otp", "pin", "password", "cvv", "bank account", "aadhaar", "pan"]):
            is_suspicious = True
            reasons.append("Demands confidential sensitive information (OTP, PIN, or banking credentials)")
        if any(w in text for w in ["http://", "https://", "bit.ly", "tinyurl", "click here", "link"]):
            is_suspicious = True
            reasons.append("Contains unverified external links asking you to tap immediately")
        if any(w in text for w in ["lottery", "won", "reward", "crore", "lakh", "gift card"]):
            is_suspicious = True
            reasons.append("Promises unrealistic prizes, lotteries, or unexpected money")

        if is_suspicious:
            return {
                "classification": "HIGH_RISK_SCAM",
                "title": "⚠️ Potential Scam Message Detected",
                "explanation": "This message exhibits strong characteristics of financial fraud. Legitimate banks and government departments in India never ask for OTPs or threaten immediate account suspension via SMS or WhatsApp links.",
                "reasons": reasons,
                "safety_guideline": "Never share your OTP, PIN, password, or banking credentials with anyone over phone, SMS, or WhatsApp.",
                "recommended_actions": [
                    {"label": "Tell Family", "action": "NOTIFY_FAMILY", "desc": "Send this alert to Priya so she can assist you"},
                    {"label": "Report to Cyber Police (1930)", "action": "REPORT_SCAM", "desc": "National Cyber Crime helpline demo"},
                    {"label": "Delete Message", "action": "DELETE", "desc": "Safely remove this message"}
                ]
            }
        else:
            return {
                "classification": "SAFE_OR_UNKNOWN",
                "title": "Information Looks Normal",
                "explanation": "No typical scam markers (urgent threats, requests for OTPs, or suspicious shortened links) were found in this text. However, always verify unknown numbers with family before acting.",
                "reasons": ["No aggressive threat language found", "No request for passwords or OTPs detected"],
                "safety_guideline": "When in doubt, ask your family before clicking any unknown link.",
                "recommended_actions": [
                    {"label": "Share with Family", "action": "NOTIFY_FAMILY", "desc": "Ask Priya to double check"}
                ]
            }

    def extract_prescription(self, raw_text=None):
        """Simulate extracting structured data from uploaded prescription image/pdf"""
        extracted = {
            "doctor": "Dr. Ananya Mehta, MD (Cardiology)",
            "clinic": "CityCare Super Specialty Clinic",
            "date": "2026-09-18",
            "patient_name": "Rajesh Sharma, 72M",
            "diagnosis": "Essential Hypertension, Primary Osteoarthritis",
            "medications": [
                {
                    "name": "Amlodipine",
                    "dosage": "10 mg",
                    "frequency": "Once daily",
                    "timing": "Morning after breakfast",
                    "duration": "30 days",
                    "instructions": "Take with water"
                },
                {
                    "name": "Metformin",
                    "dosage": "500 mg",
                    "frequency": "Once daily",
                    "timing": "After lunch",
                    "duration": "30 days",
                    "instructions": "Maintain with low sugar diet"
                }
            ],
            "tests_ordered": [
                "Lipid Profile (Fasting)",
                "Serum Creatinine & Electrolytes"
            ],
            "follow_up": "In 4 weeks (mid-October 2026)",
            "instructions": "Monitor morning blood pressure twice a week. Maintain 20 minutes gentle walking."
        }

        # Detect changes against current active medications
        current_amlodipine = query_one(
            "SELECT * FROM medications WHERE senior_id = ? AND name LIKE '%Amlodipine%'",
            (self.senior_id,)
        )
        
        changes = []
        if current_amlodipine:
            old_dosage = current_amlodipine["dosage"]
            new_dosage = "10 mg"
            if old_dosage != new_dosage:
                changes.append({
                    "type": "DOSAGE_CHANGE",
                    "medication_name": "Amlodipine",
                    "previous_value": f"Amlodipine {old_dosage}",
                    "new_value": f"Amlodipine {new_dosage}",
                    "reason": "Blood pressure optimization recommended by Dr. Mehta",
                    "source": "Prescription — 18 Sep 2026"
                })

        return {
            "extracted": extracted,
            "detected_changes": changes,
            "requires_user_confirmation": True
        }

    def process_doctor_voice_update(self, transcription_text):
        """Processes doctor's voice dictation into structured changes"""
        # Example dictation: "Continue Medicine A 10 mg once daily. Stop Medicine B. Blood test in two weeks."
        proposed = {
            "doctor_name": "Dr. Ananya Mehta",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "raw_dictation": transcription_text,
            "structured_changes": [
                {
                    "action": "UPDATE_DOSAGE",
                    "medication": "Amlodipine",
                    "new_dosage": "10 mg once daily morning",
                    "note": "Optimizing systolic control"
                },
                {
                    "action": "SCHEDULE_TEST",
                    "test_name": "Serum Creatinine & Potassium",
                    "due_in": "2 weeks"
                },
                {
                    "action": "FOLLOW_UP",
                    "date": "2026-10-15",
                    "notes": "Review response to 10mg dosage"
                }
            ],
            "audit_required": True
        }
        return proposed

    def get_phone_tutorial(self, topic):
        tutorials = {
            "send_photo": {
                "title": "How to Send a Photo to Priya on WhatsApp",
                "steps": [
                    {"step_num": 1, "title": "Open WhatsApp", "description": "Tap the green WhatsApp icon on your phone's home screen."},
                    {"step_num": 2, "title": "Open Priya's Chat", "description": "Tap on 'Priya Sharma' in your recent chats list."},
                    {"step_num": 3, "title": "Tap Attachment Icon", "description": "Tap the paperclip or '+' icon next to where you type."},
                    {"step_num": 4, "title": "Choose Gallery / Photos", "description": "Select 'Gallery' or 'Photos' to see your pictures."},
                    {"step_num": 5, "title": "Tap Send", "description": "Tap the photo you want, then tap the green arrow to send."}
                ]
            },
            "video_call": {
                "title": "How to Make a Video Call to Family",
                "steps": [
                    {"step_num": 1, "title": "Open Solya or WhatsApp", "description": "Open Solya and go to the 'Family' screen."},
                    {"step_num": 2, "title": "Find Priya or Amit", "description": "Look for the card with your family member's photo."},
                    {"step_num": 3, "title": "Tap 'Video Call'", "description": "Press the large blue 'Video Call' button with the camera icon."},
                    {"step_num": 4, "title": "Hold Phone at Eye Level", "description": "Keep your phone steady so they can see your warm smile."}
                ]
            },
            "increase_volume": {
                "title": "How to Increase Phone Ringing Volume",
                "steps": [
                    {"step_num": 1, "title": "Locate Side Buttons", "description": "Feel the side of your phone for the volume buttons."},
                    {"step_num": 2, "title": "Press the Top Button", "description": "Press the top volume button several times until the bar is high."},
                    {"step_num": 3, "title": "Check Ringer", "description": "Ensure the switch on the side or screen shows a bell icon, not a slash."}
                ]
            }
        }
        return tutorials.get(topic, tutorials["send_photo"])
