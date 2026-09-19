import json
import sqlite3
import datetime
from database import get_db, init_db

def seed():
    init_db()
    conn = get_db()
    cur = conn.cursor()

    # Clear existing data to ensure idempotent seeding
    tables = [
        "audit_logs", "permissions", "notifications", "check_ins",
        "emergency_contact_alerts", "emergency_events", "doctor_updates",
        "health_timeline_events", "health_documents", "appointments",
        "health_devices", "health_readings", "medication_logs", "medications",
        "care_plans", "health_conditions", "doctors", "family_members",
        "emergency_contacts", "hospitals", "profiles", "authorized_editors", "user_settings", "users"
    ]
    cur.execute("PRAGMA foreign_keys = OFF")
    for table in tables:
        cur.execute(f"DELETE FROM {table}")
    cur.execute("PRAGMA foreign_keys = ON")

    now = datetime.datetime.now()
    today_str = now.strftime("%Y-%m-%d")

    # 1. Users
    users = [
        ("usr_rajesh", "Rajesh Sharma", "senior", "rajesh.sharma@example.in", "+91 98765 43210", "hi", "/avatars/rajesh.png"),
        ("usr_priya", "Priya Sharma", "family", "priya.sharma@example.in", "+91 98765 43211", "en", "/avatars/priya.png"),
        ("usr_amit", "Amit Sharma", "family", "amit.sharma@example.in", "+91 98765 43212", "en", "/avatars/amit.png"),
        ("usr_dr_mehta", "Dr. Ananya Mehta", "doctor", "dr.mehta@citycare.in", "+91 98765 43215", "en", "/avatars/dr_mehta.png")
    ]
    cur.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", users)

    # 2. Profiles
    profiles = [
        ("usr_rajesh", 72, "Male", "B+", "Flat 402, Shanti Vihar, 5th Block, Koramangala", "Bengaluru", "Karnataka", "560034", 12.9352, 77.6245, "Penicillin, Sulfa drugs", "Low sodium, diabetic-friendly, vegetarian", "Star Health Senior Citizen Red Carpet - #SH782190")
    ]
    cur.executemany("INSERT INTO profiles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", profiles)

    # 3. Hospitals
    hospitals = [
        ("hosp_citycare", "CityCare Super Specialty Hospital", "14/A, 100 Feet Road, 4th Block, Koramangala", "Bengaluru", "+91 80 2553 0000", "+91 80 2553 9999", "Near Sony World Signal, 500m past BDA Complex", 2.4),
        ("hosp_apollo", "Apollo Hospitals Jayanagar", "21/2, 14th Cross, 3rd Block, Jayanagar", "Bengaluru", "+91 80 2630 4050", "+91 80 1066", "Opposite Madhavan Park", 4.8)
    ]
    cur.executemany("INSERT INTO hospitals VALUES (?, ?, ?, ?, ?, ?, ?, ?)", hospitals)

    # 4. User Settings
    cur.execute("INSERT INTO user_settings VALUES (?, ?, ?, ?, ?, ?, ?)", ("usr_rajesh", "hi", 0, 0, 1, 1.0, "hosp_citycare"))

    # 5. Emergency Contacts
    emergency_contacts = [
        ("emc_1", "usr_rajesh", "Priya Sharma", "Daughter", "+91 98765 43211", 1, 1, 1),
        ("emc_2", "usr_rajesh", "Amit Sharma", "Son", "+91 98765 43212", 2, 1, 1),
        ("emc_3", "usr_rajesh", "Dr. Ananya Mehta", "Cardiologist", "+91 98765 43215", 3, 1, 0)
    ]
    cur.executemany("INSERT INTO emergency_contacts VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", emergency_contacts)

    # 6. Family Members
    family_members = [
        ("fam_1", "usr_rajesh", "usr_priya", "Priya Sharma", "Daughter (Primary Caregiver)", "+91 98765 43211", "👩", "safe", "2026-09-19 08:15:00"),
        ("fam_2", "usr_rajesh", "usr_amit", "Amit Sharma", "Son (Living in Mumbai)", "+91 98765 43212", "👨", "safe", "2026-09-18 20:30:00"),
        ("fam_3", "usr_rajesh", None, "Sunita Devi", "Sister", "+91 98765 43213", "👵", "safe", "2026-09-17 17:00:00")
    ]
    cur.executemany("INSERT INTO family_members VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", family_members)

    # 7. Doctors
    doctors = [
        ("doc_1", "usr_dr_mehta", "Dr. Ananya Mehta", "Cardiologist & Senior Physician", "hosp_citycare", "CityCare Hospital", "+91 98765 43215", "available", 1, 1, "👩‍⚕️"),
        ("doc_2", None, "Dr. K. S. Venkatesh", "Orthopedic Surgeon", "hosp_citycare", "CityCare Hospital", "+91 98765 43216", "available", 0, 1, "👨‍⚕️"),
        ("doc_3", None, "Dr. Ritu Saxena", "Endocrinologist", "hosp_apollo", "Apollo Hospitals", "+91 98765 43217", "on_leave", 0, 1, "👩‍⚕️")
    ]
    cur.executemany("INSERT INTO doctors VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", doctors)

    # 8. Health Conditions (All 13 standard conditions)
    conditions = [
        ("cond_hypertension", "usr_rajesh", "Hypertension", "Heart & Blood Pressure", "I10", "2021-04-10", "active", "doc_1"),
        ("cond_osteoarthritis", "usr_rajesh", "Osteoarthritis", "Bone & Joint", "M17.9", "2022-09-15", "active", "doc_2"),
        ("cond_type2_diabetes", "usr_rajesh", "Type 2 Diabetes", "Diabetes", "E11", "2023-01-20", "active", "doc_3"),
        ("cond_osteoporosis", "usr_rajesh", "Osteoporosis", "Bone & Joint", "M81.0", "2024-02-12", "monitored", "doc_2"),
        ("cond_ckd", "usr_rajesh", "Chronic Kidney Disease", "Kidney", "N18.2", "2024-06-05", "monitored", "doc_1"),
        ("cond_atherosclerosis", "usr_rajesh", "Atherosclerosis", "Heart & Blood Pressure", "I70", "2023-11-10", "monitored", "doc_1"),
        ("cond_heart_failure", "usr_rajesh", "Heart Failure", "Heart & Blood Pressure", "I50.9", "2025-03-01", "monitored", "doc_1"),
        ("cond_copd", "usr_rajesh", "COPD", "Breathing", "J44.9", "2024-08-18", "monitored", "doc_1"),
        ("cond_alzheimers", "usr_rajesh", "Alzheimer's Disease", "Brain & Movement", "G30", "2025-01-15", "monitored", "doc_1"),
        ("cond_parkinsons", "usr_rajesh", "Parkinson's Disease", "Brain & Movement", "G20", "2025-05-10", "monitored", "doc_1"),
        ("cond_amd", "usr_rajesh", "Age-related Macular Degeneration", "Vision", "H35.30", "2024-10-02", "monitored", "doc_1"),
        ("cond_hearing_loss", "usr_rajesh", "Hearing Loss", "Hearing", "H90.5", "2023-08-14", "monitored", "doc_1"),
        ("cond_cancer_care", "usr_rajesh", "Cancer Care", "Cancer", "Z85.3", "2022-12-01", "monitored", "doc_1")
    ]
    cur.executemany("INSERT INTO health_conditions VALUES (?, ?, ?, ?, ?, ?, ?, ?)", conditions)

    # 9. Care Plans for all 13 conditions
    care_plans = [
        (
            "cp_hypertension", "cond_hypertension", "Hypertension",
            "Consistent blood pressure tracking, low-salt diet, daily gentle walking, and adherence to prescribed antihypertensives.",
            json.dumps(["Check BP morning at 8 AM", "Take Amlodipine after breakfast", "Limit dietary salt to under 1 tsp per day", "Evening relaxed stroll for 20 mins"]),
            json.dumps({"target_systolic": "110-130 mmHg", "target_diastolic": "70-85 mmHg", "warning_systolic": "140 mmHg"}),
            "If systolic reading exceeds 160 mmHg or if you feel severe dizziness, headache, or chest pressure, sit down immediately and press 'I NEED HELP'.",
            json.dumps(["Is my morning blood pressure reading within our agreed target?", "Should we check my kidney function tests this month?"])
        ),
        (
            "cp_osteoarthritis", "cond_osteoarthritis", "Osteoarthritis",
            "Joint flexibility management, quadriceps strengthening, fall prevention at home, and warm compression for knee comfort.",
            json.dumps(["Perform 10 minutes seated knee extensions", "Apply warm compress to knees if stiff", "Walk with supportive footwear only", "Avoid sudden climbing without handrails"]),
            json.dumps({"daily_step_target": 3500, "mobility_checkin": "Daily morning stiffness scale (1-10)"}),
            "If severe sudden knee giving-way occurs or fall occurs, do not try to stand rapidly. Use voice help or press the Emergency Help button.",
            json.dumps(["Are there knee exercises I should modify if morning stiffness increases?", "Do I need an updated knee X-ray this winter?"])
        ),
        (
            "cp_type2_diabetes", "cond_type2_diabetes", "Type 2 Diabetes",
            "Glycemic control through regular timing of meals, Metformin adherence, daily foot inspections, and periodic HbA1c testing.",
            json.dumps(["Fasting blood glucose check every Tuesday", "Take Metformin 500mg with afternoon lunch", "Examine feet for minor cuts or blisters", "Stay hydrated with 6-8 glasses of water"]),
            json.dumps({"fasting_target": "90-130 mg/dL", "post_meal_target": "Under 180 mg/dL", "hbA1c_target": "< 7.0%"}),
            "If blood sugar drops below 70 mg/dL or you experience sweating, shaking, or blurred vision, take 3 glucose biscuits or half cup fruit juice immediately.",
            json.dumps(["When is my next HbA1c test due?", "Can we review my snack choices before bed?"])
        ),
        (
            "cp_osteoporosis", "cond_osteoporosis", "Osteoporosis",
            "Bone density preservation, Vitamin D & Calcium supplementation, fall hazard mitigation, and balance training.",
            json.dumps(["Take Calcium + Vitamin D3 post breakfast", "Ensure all room walkways and bathrooms are free of loose rugs", "Perform 10 minutes gentle balance exercises near a sturdy wall"]),
            json.dumps({"dexa_interval": "Every 18 months", "calcium_daily": "1200 mg"}),
            "In case of a fall or sharp spinal pain, stay calm, stay still, and press Emergency Help for immediate family & ambulance alert.",
            json.dumps(["Do I need a repeat DEXA scan this year?", "Should we check serum Calcium levels?"])
        ),
        (
            "cp_ckd", "cond_ckd", "Chronic Kidney Disease",
            "Preserving renal filtration, strict blood pressure regulation, monitoring fluid balance, and limiting high-potassium foods.",
            json.dumps(["Weigh yourself every morning before breakfast", "Log daily fluid intake", "Avoid NSAID painkillers like Ibuprofen", "Low potassium meal choices"]),
            json.dumps({"eGFR_target": "> 60 mL/min", "creatinine_baseline": "1.2 mg/dL", "max_daily_fluid": "1800 mL"}),
            "If you notice sudden ankle swelling, shortness of breath while lying down, or facial puffiness, contact Dr. Mehta immediately.",
            json.dumps(["Are my current medicines safe for kidney filtration?", "When should we recheck serum electrolytes?"])
        ),
        (
            "cp_atherosclerosis", "cond_atherosclerosis", "Atherosclerosis",
            "Plaque stabilization through Atorvastatin, lipid optimization, heart-healthy fiber-rich meals, and daily vascular exercise.",
            json.dumps(["Take Atorvastatin 20 mg at bedtime", "Include flaxseed and oats in breakfast", "Daily brisk walk for 25 minutes", "Avoid deep fried foods"]),
            json.dumps({"ldl_target": "< 70 mg/dL", "total_cholesterol_target": "< 150 mg/dL"}),
            "If experiencing chest heaviness, left arm radiation, or unexplained cold sweat, trigger the Emergency Button without waiting.",
            json.dumps(["How is my LDL cholesterol progressing?", "Should we do a carotid ultrasound screening?"])
        ),
        (
            "cp_heart_failure", "cond_heart_failure", "Heart Failure",
            "Early fluid overload detection via daily morning weighing, sodium restriction, and pacing daily activities.",
            json.dumps(["Weigh daily at 7:30 AM before eating", "Record resting pulse", "Sleep with head slightly elevated if needed"]),
            json.dumps({"weight_gain_alert": "+1.5 kg in 48 hours", "resting_hr_target": "60-80 bpm"}),
            "Sudden weight increase over 1.5 kg in 2 days or shortness of breath when resting warrants prompt doctor review.",
            json.dumps(["Are my ankles swelling more in the evenings?", "Is my pulse rate within the ideal safety zone?"])
        ),
        (
            "cp_copd", "cond_copd", "COPD",
            "Airway management, proper inhaler technique, avoiding smoke and morning chill, and pulse oximetry monitoring.",
            json.dumps(["Morning maintenance inhaler 2 puffs", "Check SpO2 with pulse oximeter", "Breathe through pursed lips when climbing stairs"]),
            json.dumps({"spo2_baseline": "94-98%", "emergency_spo2": "< 90%"}),
            "If oxygen saturation falls below 90% or breathing requires unusual effort, activate emergency protocol.",
            json.dumps(["Should I keep a rescue inhaler in my walking jacket?", "Is an updated flu vaccination recommended?"])
        ),
        (
            "cp_alzheimers", "cond_alzheimers", "Alzheimer's Disease",
            "Memory & Safety Mode: Structured daily schedule, orientation clocks, family GPS geofencing with consent, and simplified reminders.",
            json.dumps(["Morning routine orientation check", "Listen to today's audio schedule", "Family check-in call with Priya at 8 PM"]),
            json.dumps({"memory_mode": "Active", "geofence_safe_zone": "500m home perimeter"}),
            "If senior feels disoriented or doesn't recognize surroundings, large one-tap button 'Where am I? & Call Daughter' is available.",
            json.dumps(["How is Rajesh's sleep pattern holding up?", "Should we simplify the evening medication routine?"])
        ),
        (
            "cp_parkinsons", "cond_parkinsons", "Parkinson's Disease",
            "Precision medication timing to prevent 'off' periods, tremor tracking, balance stabilization, and speech clarity practice.",
            json.dumps(["Take morning dose precisely at 8:00 AM", "15 minutes balance and gait exercise", "Hydrate well before standing up"]),
            json.dumps({"medication_window": "+/- 15 minutes", "fall_risk_mode": "High sensitivity"}),
            "Sudden freezing of gait or difficulty swallowing requires peaceful rest and notifying primary caregiver.",
            json.dumps(["Are medication 'on' times lasting through the afternoon?", "Do we need physical therapy review?"])
        ),
        (
            "cp_amd", "cond_amd", "Age-related Macular Degeneration",
            "Vision-Friendly Mode: Screen reader audio narration, Amsler grid self-assessment, high-contrast interface, and anti-glare protection.",
            json.dumps(["Weekly Amsler grid visual check", "Take eye antioxidant formulation", "Wear UV-blocking sunglasses outside"]),
            json.dumps({"vision_mode": "Ultra Large Font Enabled", "contrast": "AAA Healthcare High"}),
            "If straight lines suddenly appear wavy or central vision darkens rapidly, contact ophthalmologist within 24 hours.",
            json.dumps(["Is central vision stable on the Amsler grid?", "When is the next retina scan?"])
        ),
        (
            "cp_hearing_loss", "cond_hearing_loss", "Hearing Loss",
            "Hearing-Friendly Mode: Real-time visual captions, high-intensity visual alert flashes for doorbells & calls, and hearing aid battery care.",
            json.dumps(["Clean hearing aid earpieces every morning", "Check hearing aid battery indicator", "Enable visual captions on phone calls"]),
            json.dumps({"hearing_mode": "Visual Captions ON", "alert_style": "Vibration + Visual Banner"}),
            "If sudden complete ear pain, drainage, or sudden hearing drop occurs, visit ENT clinic.",
            json.dumps(["Are speech frequencies clearly audible in crowded rooms?", "Should we check earwax buildup?"])
        ),
        (
            "cp_cancer_care", "cond_cancer_care", "Cancer Care",
            "Post-treatment oncology survivorship journey, scheduled tumor marker tests, nutrition support, and immune health preservation.",
            json.dumps(["Hydrate with 2.5L clean fluids daily", "Record temperature if feeling fatigued", "Gentle breathing relaxation"]),
            json.dumps({"temp_threshold": "> 100.4 F", "surveillance_scan": "Due December 2026"}),
            "Any fever above 100.4 F or severe shivering requires immediate emergency attention at oncology casualty.",
            json.dumps(["Are follow-up blood counts normal?", "Can we discuss mild joint stiffness?"])
        )
    ]
    cur.executemany("INSERT INTO care_plans VALUES (?, ?, ?, ?, ?, ?, ?, ?)", care_plans)

    # 10. Medications
    medications = [
        ("med_1", "usr_rajesh", "Amlodipine", "Amlodipine Besylate", "5 mg", "Once daily", "morning", "08:00 AM", "cond_hypertension", "Controls blood pressure and relaxes blood vessels", "Take with or without food after breakfast", "Prescription - Dr. Mehta (18 Sep 2026)", "Dr. Ananya Mehta", "active"),
        ("med_2", "usr_rajesh", "Metformin", "Metformin HCl", "500 mg", "Once daily", "afternoon", "01:00 PM", "cond_type2_diabetes", "Helps regulate blood sugar levels", "Take immediately after lunch with a full glass of water", "Prescription - Dr. Mehta", "Dr. Ananya Mehta", "active"),
        ("med_3", "usr_rajesh", "Atorvastatin", "Atorvastatin Calcium", "20 mg", "Once daily", "night", "08:00 PM", "cond_atherosclerosis", "Lowers LDL cholesterol and protects arteries", "Take at bedtime consistently", "Prescription - Dr. Mehta", "Dr. Ananya Mehta", "active")
    ]
    cur.executemany("INSERT INTO medications VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", medications)

    # 11. Medication Logs for today
    med_logs = [
        ("log_1", "med_1", "usr_rajesh", today_str, "08:00 AM", "taken", f"{today_str} 08:05:00", "Taken with warm water"),
        ("log_2", "med_2", "usr_rajesh", today_str, "01:00 PM", "pending", None, None),
        ("log_3", "med_3", "usr_rajesh", today_str, "08:00 PM", "pending", None, None)
    ]
    cur.executemany("INSERT INTO medication_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?)", med_logs)

    # 12. Health Readings
    readings = [
        ("read_1", "usr_rajesh", "blood_pressure", 128.0, 82.0, "mmHg", "normal", "Smart BP Monitor", f"{today_str} 08:15:00", "Morning resting reading"),
        ("read_2", "usr_rajesh", "heart_rate", 72.0, None, "bpm", "normal", "Smartwatch", f"{today_str} 08:15:00", "Normal sinus rhythm"),
        ("read_3", "usr_rajesh", "spo2", 98.0, None, "%", "normal", "Pulse Oximeter", f"{today_str} 08:20:00", "Oxygenation optimal"),
        ("read_4", "usr_rajesh", "blood_glucose", 132.0, None, "mg/dL", "attention", "Continuous Glucose Monitor", f"{today_str} 07:45:00", "Fasting reading slightly elevated"),
        ("read_5", "usr_rajesh", "temperature", 98.4, None, "°F", "normal", "Digital Thermometer", f"{today_str} 08:00:00", "Normal body temperature"),
        ("read_6", "usr_rajesh", "weight", 68.2, None, "kg", "normal", "Smart Scale", f"{today_str} 07:30:00", "Stable weight trend"),
        ("read_7", "usr_rajesh", "steps", 3420.0, None, "steps", "normal", "Smartwatch", f"{today_str} 10:30:00", "Morning garden walk completed")
    ]
    cur.executemany("INSERT INTO health_readings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", readings)

    # 13. Health Devices
    devices = [
        ("dev_1", "usr_rajesh", "Smart Fitness Band", "Smartwatch", "Titan Smart Health", "connected", 84, f"{today_str} 10:45:00"),
        ("dev_2", "usr_rajesh", "Upper Arm BP Monitor", "Blood pressure monitor", "Omron Smart Connect", "connected", 92, f"{today_str} 08:15:00"),
        ("dev_3", "usr_rajesh", "Fingertip Pulse Oximeter", "Pulse oximeter", "Beurer Medical", "connected", 78, f"{today_str} 08:20:00"),
        ("dev_4", "usr_rajesh", "Continuous Glucose Sensor", "Glucose monitor", "FreeStyle Libre", "syncing", 60, f"{today_str} 07:45:00"),
        ("dev_5", "usr_rajesh", "Apple Health / Google Health Connect", "Phone health sync", "System Health Kit", "connected", 100, f"{today_str} 10:50:00")
    ]
    cur.executemany("INSERT INTO health_devices VALUES (?, ?, ?, ?, ?, ?, ?, ?)", devices)

    # 14. Appointments
    appointments = [
        ("apt_1", "usr_rajesh", "doc_1", "Dr. Ananya Mehta", "Cardiologist", "CityCare Hospital", today_str, "10:30 AM", "Routine Hypertension & Lipid Review", "Carry previous BP log and recent blood reports", "scheduled"),
        ("apt_2", "usr_rajesh", "doc_2", "Dr. K. S. Venkatesh", "Orthopedic Surgeon", "CityCare Hospital", "2026-09-28", "04:00 PM", "Bilateral Knee Osteoarthritis Follow-up", "Wear comfortable loose trousers for knee mobility assessment", "scheduled")
    ]
    cur.executemany("INSERT INTO appointments VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", appointments)

    # 15. Health Documents
    documents = [
        ("doc_file_1", "usr_rajesh", "Cardiology Prescription - Dr. Mehta", "prescription", "/uploads/prescription_sep18.pdf", "2026-09-18", "CityCare Cardiology Clinic", "Prescription with Amlodipine 10mg dosage review, Metformin 500mg continued, and routine lipid profile request.", json.dumps({"doctor": "Dr. Ananya Mehta", "medications": [{"name": "Amlodipine", "dosage": "10 mg", "frequency": "Once daily morning"}], "tests": ["Lipid Profile", "Serum Creatinine"], "followup": "1 month"}), "Dr. Ananya Mehta"),
        ("doc_file_2", "usr_rajesh", "Comprehensive Metabolic Lab Panel", "lab_report", "/uploads/lab_sep15.pdf", "2026-09-15", "CityCare Diagnostics", "Fasting Blood Sugar 132 mg/dL (mild elevation), HbA1c 6.8% (fair control), Serum Creatinine 1.1 mg/dL (normal renal status), eGFR 74 mL/min.", json.dumps({"fasting_glucose": "132 mg/dL", "hba1c": "6.8%", "creatinine": "1.1 mg/dL", "potassium": "4.2 mEq/L"}), "Dr. Ritu Saxena")
    ]
    cur.executemany("INSERT INTO health_documents VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", documents)

    # 16. Health Timeline Events
    timeline_events = [
        ("tle_1", "usr_rajesh", "2026-09-18", "doctor_visit", "Cardiology Consultation", "Dr. Ananya Mehta", "Reviewed blood pressure trends. Advised increasing hydration and monitoring morning readings.", "doc_file_1"),
        ("tle_2", "usr_rajesh", "2026-09-17", "prescription", "Prescription Issued", "Dr. Ananya Mehta", "Amlodipine reviewed for optimal blood pressure control. Advised repeat kidney panel.", "doc_file_1"),
        ("tle_3", "usr_rajesh", "2026-09-15", "lab_report", "Biochemical Lab Panel Uploaded", "CityCare Lab", "Routine quarterly metabolic evaluation showing stable kidney metrics and fair glycemic control.", "doc_file_2"),
        ("tle_4", "usr_rajesh", "2026-09-10", "check_in", "Daily Safety Check Confirmed", "Rajesh Sharma", "Confirmed safe to family at 08:15 PM after dinner.", None)
    ]
    cur.executemany("INSERT INTO health_timeline_events VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", timeline_events)

    # 17. Check Ins
    check_ins = [
        ("chk_1", "usr_rajesh", today_str, f"{today_str} 08:15:00", "safe", "Had morning tea and walked in balcony. Feeling energetic.", 1),
        ("chk_2", "usr_rajesh", "2026-09-18", "2026-09-18 20:15:00", "safe", "Enjoyed dinner with family. Slept well.", 1)
    ]
    cur.executemany("INSERT INTO check_ins VALUES (?, ?, ?, ?, ?, ?, ?)", check_ins)

    # 18. Notifications
    notifications = [
        ("notif_1", "usr_rajesh", "Medication Reminder", "Time to take Metformin 500 mg after your lunch.", "medication", 0),
        ("notif_2", "usr_rajesh", "Doctor Appointment Today", "You have an appointment with Dr. Ananya Mehta at 10:30 AM at CityCare Hospital.", "doctor", 0),
        ("notif_3", "usr_priya", "Senior Safety Check", "Rajesh Sharma checked in safe at 8:15 AM today.", "checkin", 1)
    ]
    cur.executemany("INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", notifications)

    # 19. Permissions
    permissions = [
        ("perm_1", "usr_rajesh", "family_health_access", "Family Health Summary Access", "Allows authorized family members (Priya & Amit) to view health readings and medication statuses", 1),
        ("perm_2", "usr_rajesh", "doctor_health_access", "Doctor Health Record Access", "Allows Dr. Mehta and care team to view medical reports, readings, and care plans", 1),
        ("perm_3", "usr_rajesh", "emergency_location", "Emergency Location Sharing", "Enables real-time GPS location sharing with emergency services and primary contact during emergency", 1),
        ("perm_4", "usr_rajesh", "camera_access", "Camera for Safety Check & Calls", "Allows camera use for family video calls and explicitly authorized safety checks", 1),
        ("perm_5", "usr_rajesh", "microphone_access", "Voice Assistant & Voice Notes", "Allows speaking with Solya and recording doctor voice notes", 1),
        ("perm_6", "usr_rajesh", "device_sync", "Health Devices Data Sync", "Allows automatic data syncing from connected smartwatch and BP monitor", 1)
    ]
    cur.executemany("INSERT INTO permissions VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)", permissions)

    # 20. Audit Logs
    audit_logs = [
        ("aud_1", "usr_rajesh", "usr_dr_mehta", "Dr. Ananya Mehta", "DOCTOR_REVIEW", "Dr. Mehta accessed patient health summary and latest BP trends", "Doctor Portal", f"{today_str} 09:30:00"),
        ("aud_2", "usr_rajesh", "usr_priya", "Priya Sharma", "FAMILY_VIEW", "Priya viewed daily medication completion status", "Family Mobile App", f"{today_str} 08:30:00"),
        ("aud_3", "usr_rajesh", "usr_rajesh", "Rajesh Sharma", "MEDICATION_LOG", "Marked Amlodipine 5 mg as TAKEN", "Senior Dashboard", f"{today_str} 08:05:00")
    ]
    cur.executemany("INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?)", audit_logs)

    conn.commit()
    conn.close()
    print("SOLYA database seeded successfully with realistic senior healthcare data.")

if __name__ == "__main__":
    seed()
