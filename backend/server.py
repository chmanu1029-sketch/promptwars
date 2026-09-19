import http.server
import socketserver
import json
import urllib.parse
import os
import uuid
import datetime
from database import query_all, query_one, execute, execute_many, log_audit, init_db
from ai_engine import SolyaAIEngine

PORT = 8080
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))

ai_engine = SolyaAIEngine(senior_id="usr_rajesh")

class SolyaRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=FRONTEND_DIR, **kwargs)

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(204)

    def _parse_body(self):
        content_len = int(self.headers.get('Content-Length', 0))
        if content_len == 0:
            return {}
        post_data = self.rfile.read(content_len)
        try:
            return json.loads(post_data.decode('utf-8'))
        except Exception:
            return {}

    def _send_json(self, data, status=200):
        self._set_headers(status, "application/json")
        self.wfile.write(json.dumps(data, indent=2, default=str).encode('utf-8'))

    def _send_error(self, message, status=400):
        self._send_json({"error": message, "success": False}, status)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if not path.startswith('/api/'):
            # Static file serving
            # If path doesn't exist or is root, serve index.html
            file_path = os.path.join(FRONTEND_DIR, path.lstrip('/'))
            if not os.path.exists(file_path) or os.path.isdir(file_path):
                self.path = '/index.html'
            return super().do_GET()

        try:
            # 1. Auth & Session
            if path == '/api/auth/current':
                role = query.get('role', ['senior'])[0]
                user_map = {
                    'senior': 'usr_rajesh',
                    'family': 'usr_priya',
                    'doctor': 'usr_dr_mehta'
                }
                user_id = user_map.get(role, 'usr_rajesh')
                user = query_one("SELECT * FROM users WHERE id = ?", (user_id,))
                profile = query_one("SELECT * FROM profiles WHERE user_id = ?", (user_id,))
                settings = query_one("SELECT * FROM user_settings WHERE user_id = ?", (user_id,))
                return self._send_json({
                    "user": user,
                    "profile": profile,
                    "settings": settings,
                    "role": role,
                    "active_senior_id": "usr_rajesh"
                })

            # 2. Users & Profiles
            elif path == '/api/users/senior':
                senior = query_one("SELECT * FROM users WHERE id = 'usr_rajesh'")
                profile = query_one("SELECT * FROM profiles WHERE user_id = 'usr_rajesh'")
                settings = query_one("SELECT * FROM user_settings WHERE user_id = 'usr_rajesh'")
                hospital = query_one("SELECT * FROM hospitals WHERE id = ?", (settings["emergency_hospital_id"] if settings else "hosp_citycare",))
                return self._send_json({
                    "senior": senior,
                    "profile": profile,
                    "settings": settings,
                    "preferred_hospital": hospital
                })

            # 3. Health Center & Readings
            elif path == '/api/health/summary':
                readings = query_all("SELECT * FROM health_readings WHERE senior_id = 'usr_rajesh' ORDER BY recorded_at DESC")
                latest_by_type = {}
                for r in readings:
                    if r["metric_type"] not in latest_by_type:
                        latest_by_type[r["metric_type"]] = r
                return self._send_json({
                    "latest_readings": latest_by_type,
                    "all_readings": readings[:15]
                })

            # 4. Medications
            elif path == '/api/medications':
                today_str = datetime.datetime.now().strftime("%Y-%m-%d")
                meds = query_all("SELECT * FROM medications WHERE senior_id = 'usr_rajesh' AND status = 'active' ORDER BY scheduled_time ASC")
                logs = query_all("SELECT * FROM medication_logs WHERE senior_id = 'usr_rajesh' AND log_date = ?", (today_str,))
                log_map = {l["medication_id"]: l["status"] for l in logs}
                
                result = []
                for m in meds:
                    m_copy = dict(m)
                    m_copy["today_status"] = log_map.get(m["id"], "pending")
                    result.append(m_copy)
                return self._send_json({"medications": result, "today": today_str})

            # 5. Appointments
            elif path == '/api/appointments':
                appts = query_all("SELECT * FROM appointments WHERE senior_id = 'usr_rajesh' ORDER BY appointment_date ASC, appointment_time ASC")
                return self._send_json({"appointments": appts})

            # 6. Doctors
            elif path == '/api/doctors':
                docs = query_all("SELECT * FROM doctors")
                emergency_doc = query_one("SELECT * FROM doctors WHERE is_emergency_doctor = 1")
                return self._send_json({"doctors": docs, "emergency_doctor": emergency_doc})

            # 7. Family
            elif path == '/api/family':
                members = query_all("SELECT * FROM family_members WHERE senior_id = 'usr_rajesh'")
                contacts = query_all("SELECT * FROM emergency_contacts WHERE senior_id = 'usr_rajesh' ORDER BY priority_order ASC")
                return self._send_json({"family_members": members, "emergency_contacts": contacts})

            # 8. Emergency Status
            elif path == '/api/emergency/status':
                active = query_one("SELECT * FROM emergency_events WHERE senior_id = 'usr_rajesh' AND status IN ('active', 'escalating', 'acknowledged', 'dispatched') ORDER BY activated_at DESC LIMIT 1")
                alerts = []
                if active:
                    alerts = query_all("SELECT * FROM emergency_contact_alerts WHERE emergency_id = ? ORDER BY priority_order ASC", (active["id"],))
                senior_profile = query_one("SELECT * FROM profiles WHERE user_id = 'usr_rajesh'")
                senior_user = query_one("SELECT * FROM users WHERE id = 'usr_rajesh'")
                hospital = query_one("SELECT * FROM hospitals WHERE id = 'hosp_citycare'")
                return self._send_json({
                    "active_emergency": active,
                    "alerts": alerts,
                    "senior_profile": senior_profile,
                    "senior_user": senior_user,
                    "preferred_hospital": hospital
                })

            # 9. Health Devices
            elif path == '/api/devices':
                devices = query_all("SELECT * FROM health_devices WHERE senior_id = 'usr_rajesh'")
                return self._send_json({"devices": devices})

            # 10. Documents
            elif path == '/api/documents':
                docs = query_all("SELECT * FROM health_documents WHERE senior_id = 'usr_rajesh' ORDER BY uploaded_date DESC")
                return self._send_json({"documents": docs})

            # 11. Conditions & Care Plans
            elif path == '/api/conditions':
                conds = query_all("SELECT * FROM health_conditions WHERE senior_id = 'usr_rajesh'")
                plans = query_all("SELECT * FROM care_plans")
                plan_map = {}
                for p in plans:
                    plan_map[p["condition_id"]] = {
                        "id": p["id"],
                        "condition_name": p["condition_name"],
                        "overview": p["overview_text"],
                        "today_care": json.loads(p["today_care_reminders"]),
                        "monitoring_targets": json.loads(p["monitoring_targets"]),
                        "emergency_guidance": p["emergency_guidance"],
                        "questions": json.loads(p["doctor_questions"] or "[]")
                    }
                return self._send_json({"conditions": conds, "care_plans": plan_map})

            # 12. Check-in Status
            elif path == '/api/checkins/today':
                today_str = datetime.datetime.now().strftime("%Y-%m-%d")
                chk = query_one("SELECT * FROM check_ins WHERE senior_id = 'usr_rajesh' AND check_in_date = ?", (today_str,))
                return self._send_json({"check_in": chk, "today": today_str})

            # 13. Notifications
            elif path == '/api/notifications':
                role = query.get('role', ['senior'])[0]
                user_id = 'usr_priya' if role == 'family' else ('usr_dr_mehta' if role == 'doctor' else 'usr_rajesh')
                notifs = query_all("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
                return self._send_json({"notifications": notifs})

            # 14. Audit Logs
            elif path == '/api/audit':
                logs = query_all("SELECT * FROM audit_logs WHERE senior_id = 'usr_rajesh' ORDER BY logged_at DESC LIMIT 30")
                return self._send_json({"audit_logs": logs})

            # 15. Permissions
            elif path == '/api/permissions':
                perms = query_all("SELECT * FROM permissions WHERE senior_id = 'usr_rajesh'")
                return self._send_json({"permissions": perms})

            # 16. Health Timeline
            elif path == '/api/timeline':
                events = query_all("SELECT * FROM health_timeline_events WHERE senior_id = 'usr_rajesh' ORDER BY event_date DESC, created_at DESC")
                return self._send_json({"events": events})

            # 17. AI Daily Briefing
            elif path == '/api/ai/briefing':
                briefing = ai_engine.generate_daily_briefing()
                return self._send_json(briefing)

            # 18. Tutor
            elif path == '/api/tutor':
                topic = query.get('topic', ['send_photo'])[0]
                tutorial = ai_engine.get_phone_tutorial(topic)
                return self._send_json(tutorial)

            # 19. Doctor Dashboard specific view
            elif path == '/api/doctor/patients':
                patients = [
                    {
                        "id": "usr_rajesh",
                        "name": "Rajesh Sharma",
                        "age": 72,
                        "gender": "Male",
                        "blood_group": "B+",
                        "conditions": ["Hypertension", "Osteoarthritis", "Type 2 Diabetes"],
                        "active_medications": ["Amlodipine 5 mg", "Metformin 500 mg", "Atorvastatin 20 mg"],
                        "recent_bp": "128/82 mmHg (Normal)",
                        "compliance_rate": "95%",
                        "last_visit": "2026-09-18",
                        "next_appointment": "Today, 10:30 AM"
                    }
                ]
                return self._send_json({"patients": patients})

            else:
                return self._send_error(f"Endpoint {path} not found", 404)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return self._send_error(f"Internal server error: {str(e)}", 500)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self._parse_body()

        try:
            # 1. Update Medication Status (Mark taken/skipped)
            if path == '/api/medications/status':
                med_id = body.get('medication_id')
                status = body.get('status', 'taken') # 'taken' or 'skipped'
                today_str = datetime.datetime.now().strftime("%Y-%m-%d")
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                existing = query_one("SELECT * FROM medication_logs WHERE medication_id = ? AND log_date = ?", (med_id, today_str))
                if existing:
                    execute("UPDATE medication_logs SET status = ?, action_timestamp = ? WHERE id = ?", (status, now_str, existing["id"]))
                else:
                    log_id = f"log_{uuid.uuid4().hex[:8]}"
                    execute("INSERT INTO medication_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                            (log_id, med_id, "usr_rajesh", today_str, "Now", status, now_str, "Logged via Solya"))

                med = query_one("SELECT name, dosage FROM medications WHERE id = ?", (med_id,))
                med_name = f"{med['name']} {med['dosage']}" if med else "Medication"
                log_audit("usr_rajesh", "usr_rajesh", "Rajesh Sharma", "MEDICATION_UPDATE", f"Marked {med_name} as {status.upper()}", "Senior Dashboard")
                return self._send_json({"success": True, "status": status, "medication_id": med_id})

            # 2. Add Medication
            elif path == '/api/medications/add':
                med_id = f"med_{uuid.uuid4().hex[:8]}"
                execute("""
                    INSERT INTO medications (id, senior_id, name, dosage, frequency, timing_tag, scheduled_time, condition_id, purpose, instructions, source, prescribed_by, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    med_id, "usr_rajesh", body.get("name"), body.get("dosage"),
                    body.get("frequency", "Once daily"), body.get("timing_tag", "morning"),
                    body.get("scheduled_time", "08:00 AM"), body.get("condition_id"),
                    body.get("purpose"), body.get("instructions"),
                    body.get("source", "Manual entry"), body.get("prescribed_by", "Self / Family"),
                    "active"
                ))
                log_audit("usr_rajesh", "usr_rajesh", "Rajesh Sharma", "MEDICATION_ADD", f"Added new medication: {body.get('name')} {body.get('dosage')}")
                return self._send_json({"success": True, "medication_id": med_id})

            # 3. Smart Prescription Upload & Extraction (Journey 1)
            elif path == '/api/documents/upload-prescription':
                raw_text = body.get('text', '')
                extraction_result = ai_engine.extract_prescription(raw_text)
                return self._send_json(extraction_result)

            # 4. Confirm Prescription & Dosage Change (Journey 1 Complete Cascade)
            elif path == '/api/documents/confirm-prescription-update':
                # Updates Amlodipine 5mg -> 10mg
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                today_str = datetime.datetime.now().strftime("%Y-%m-%d")

                # 1. Update medication table
                execute("UPDATE medications SET dosage = '10 mg', source = 'Prescription uploaded on 18 Sep 2026' WHERE senior_id = 'usr_rajesh' AND name LIKE '%Amlodipine%'")

                # 2. Insert timeline event
                tle_id = f"tle_{uuid.uuid4().hex[:8]}"
                execute("""
                    INSERT INTO health_timeline_events (id, senior_id, event_date, event_type, title, actor_name, description, source_ref_id, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (tle_id, "usr_rajesh", today_str, "medication_change", "Medication Dosage Updated", "AI Verified Prescription", "Amlodipine changed from 5 mg to 10 mg once daily morning per Dr. Mehta's prescription.", "doc_file_1", now_str))

                # 3. Insert notification for Senior & Family
                notif_senior = f"notif_{uuid.uuid4().hex[:8]}"
                execute("INSERT INTO notifications VALUES (?, ?, ?, ?, ?, 0, ?)",
                        (notif_senior, "usr_rajesh", "Medication Updated", "Amlodipine dosage is now updated to 10 mg daily.", "medication", now_str))
                
                notif_family = f"notif_{uuid.uuid4().hex[:8]}"
                execute("INSERT INTO notifications VALUES (?, ?, ?, ?, ?, 0, ?)",
                        (notif_family, "usr_priya", "Prescription Update Confirmed", "Rajesh Sharma's Amlodipine dosage updated to 10 mg.", "medication", now_str))

                # 4. Audit Log
                log_audit("usr_rajesh", "usr_rajesh", "Rajesh Sharma", "PRESCRIPTION_UPDATE", "Confirmed prescription update: Amlodipine 5 mg -> 10 mg. Timeline & Reminders updated.", "Prescription Scanner")

                return self._send_json({
                    "success": True,
                    "message": "Your health record, medication list, reminders, and timeline have been successfully updated.",
                    "updated_medication": "Amlodipine 10 mg"
                })

            # 5. Emergency Activation (Journey 2)
            elif path == '/api/emergency/activate':
                em_id = f"em_{uuid.uuid4().hex[:8]}"
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                lat = body.get('latitude', 12.9352)
                lng = body.get('longitude', 77.6245)
                voice_note = body.get('voice_note', 'User pressed emergency button: "I need help, feeling unsteady in the room."')
                symptom = body.get('reported_symptom', 'Fall / mobility distress')

                execute("""
                    INSERT INTO emergency_events (id, senior_id, status, activated_at, latitude, longitude, location_name, user_voice_note, reported_symptom)
                    VALUES (?, ?, 'active', ?, ?, ?, 'Flat 402, Shanti Vihar, Koramangala, Bengaluru', ?, ?)
                """, (em_id, "usr_rajesh", now_str, lat, lng, voice_note, symptom))

                # Create alerts for emergency contacts
                contacts = query_all("SELECT * FROM emergency_contacts WHERE senior_id = 'usr_rajesh' ORDER BY priority_order ASC")
                for c in contacts:
                    alert_id = f"ema_{uuid.uuid4().hex[:8]}"
                    initial_status = "alert_sent" if c["priority_order"] == 1 else "pending"
                    execute("INSERT INTO emergency_contact_alerts VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)",
                            (alert_id, em_id, c["name"], c["relationship"], c["phone"], c["priority_order"], initial_status, now_str))

                # Notify family
                execute("INSERT INTO notifications VALUES (?, ?, ?, ?, 'emergency', 0, ?)",
                        (f"notif_{uuid.uuid4().hex[:8]}", "usr_priya", "🚨 EMERGENCY ACTIVATED", "Rajesh Sharma has activated emergency assistance.", now_str))

                log_audit("usr_rajesh", "usr_rajesh", "Rajesh Sharma", "EMERGENCY_ACTIVATED", f"Emergency triggered. Location: 12.9352, 77.6245. Voice: '{voice_note}'", "Emergency Button")

                return self._send_json({
                    "success": True,
                    "emergency_id": em_id,
                    "status": "active",
                    "activated_at": now_str,
                    "contacts_notified": len(contacts)
                })

            # 6. Emergency Acknowledge (e.g. Priya acknowledges)
            elif path == '/api/emergency/acknowledge':
                em_id = body.get('emergency_id')
                contact_name = body.get('contact_name', 'Priya Sharma')
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                execute("UPDATE emergency_contact_alerts SET status = 'acknowledged', acknowledged_at = ? WHERE emergency_id = ? AND contact_name = ?",
                        (now_str, em_id, contact_name))
                execute("UPDATE emergency_events SET status = 'acknowledged' WHERE id = ?", (em_id,))

                log_audit("usr_rajesh", "usr_priya", "Priya Sharma", "EMERGENCY_ACKNOWLEDGED", f"{contact_name} acknowledged the emergency alert and accepted assistance.", "Family App")
                return self._send_json({"success": True, "status": "acknowledged", "acknowledged_by": contact_name})

            # 7. Emergency Dispatch Request (Ambulance Demo Mode)
            elif path == '/api/emergency/dispatch':
                em_id = body.get('emergency_id')
                service_type = body.get('service_type', 'Ambulance')
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                execute("UPDATE emergency_events SET status = 'dispatched' WHERE id = ?", (em_id,))

                log_audit("usr_rajesh", "usr_rajesh", "Rajesh Sharma", "EMERGENCY_DISPATCH_DEMO", f"Requested {service_type} dispatch to CityCare Hospital (Demo Mode).", "Emergency Center")
                return self._send_json({
                    "success": True,
                    "status": "dispatched",
                    "service": service_type,
                    "eta_minutes": 12,
                    "note": "Demo mode: Simulated ambulance dispatch created successfully."
                })

            # 8. Cancel Emergency (3-Second Hold Confirmation)
            elif path == '/api/emergency/cancel':
                em_id = body.get('emergency_id')
                reason = body.get('reason', 'Accidental tap / Confirmed safe by senior')
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                execute("UPDATE emergency_events SET status = 'cancelled', resolved_at = ?, resolution_notes = ? WHERE id = ?",
                        (now_str, reason, em_id))

                # Notify contacts that user is safe
                execute("INSERT INTO notifications VALUES (?, ?, ?, ?, 'emergency', 0, ?)",
                        (f"notif_{uuid.uuid4().hex[:8]}", "usr_priya", "Emergency Cancelled - Senior Safe", "Rajesh Sharma has confirmed he is safe and cancelled the emergency alert.", now_str))

                log_audit("usr_rajesh", "usr_rajesh", "Rajesh Sharma", "EMERGENCY_CANCELLED", f"Emergency cancelled after deliberate 3-second hold. Reason: {reason}", "Senior Safe Button")
                return self._send_json({"success": True, "status": "cancelled", "message": "Emergency successfully cancelled. Your family has been informed that you are safe."})

            # 9. Daily Check-in (Journey 3)
            elif path == '/api/checkins/submit':
                status = body.get('status', 'safe') # 'safe' or 'needs_help'
                note = body.get('note', "I'm OK and feeling well today.")
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                today_str = datetime.datetime.now().strftime("%Y-%m-%d")

                chk = query_one("SELECT * FROM check_ins WHERE senior_id = 'usr_rajesh' AND check_in_date = ?", (today_str,))
                if chk:
                    execute("UPDATE check_ins SET status = ?, time_stamp = ?, note = ? WHERE id = ?", (status, now_str, note, chk["id"]))
                else:
                    chk_id = f"chk_{uuid.uuid4().hex[:8]}"
                    execute("INSERT INTO check_ins VALUES (?, ?, ?, ?, ?, ?, 1)", (chk_id, "usr_rajesh", today_str, now_str, status, note))

                # Update family member record
                execute("UPDATE family_members SET safety_check_status = 'safe', last_contact_time = ? WHERE senior_id = 'usr_rajesh'", (now_str,))

                # Notify family
                execute("INSERT INTO notifications VALUES (?, ?, ?, ?, 'checkin', 0, ?)",
                        (f"notif_{uuid.uuid4().hex[:8]}", "usr_priya", "Senior Checked In", f"Rajesh confirmed he is safe at {datetime.datetime.now().strftime('%I:%M %p')}.", now_str))

                log_audit("usr_rajesh", "usr_rajesh", "Rajesh Sharma", "DAILY_CHECKIN", f"Submitted daily check-in: {status.upper()}. Note: {note}", "Senior Dashboard")
                return self._send_json({"success": True, "status": "safe", "time": now_str})

            # 10. Family Requests Safety Check (Journey 3)
            elif path == '/api/family/request-safety-check':
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                today_str = datetime.datetime.now().strftime("%Y-%m-%d")

                execute("UPDATE family_members SET safety_check_status = 'requested' WHERE senior_id = 'usr_rajesh' AND user_id = 'usr_priya'")
                
                # Notify Senior
                execute("INSERT INTO notifications VALUES (?, ?, ?, ?, 'checkin', 0, ?)",
                        (f"notif_{uuid.uuid4().hex[:8]}", "usr_rajesh", "Priya Checked In", "Priya wants to check if you are okay today.", now_str))

                log_audit("usr_rajesh", "usr_priya", "Priya Sharma", "SAFETY_CHECK_REQUESTED", "Priya Sharma requested a safety check-in from senior.", "Family Portal")
                return self._send_json({"success": True, "message": "Safety check request sent to Rajesh."})

            # 11. Doctor Voice/Text Update (Journey 4)
            elif path == '/api/doctor/process-update':
                dictation = body.get('dictation', 'Continue Amlodipine 10 mg once daily. Stop NSAID painkillers. Schedule serum creatinine test in two weeks.')
                proposed = ai_engine.process_doctor_voice_update(dictation)
                return self._send_json(proposed)

            elif path == '/api/doctor/approve-update':
                dictation = body.get('dictation', '')
                proposed_changes = body.get('structured_changes', [])
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                today_str = datetime.datetime.now().strftime("%Y-%m-%d")

                doc_up_id = f"dup_{uuid.uuid4().hex[:8]}"
                execute("""
                    INSERT INTO doctor_updates (id, doctor_id, senior_id, voice_note_transcript, proposed_changes, status, approved_at)
                    VALUES (?, 'doc_1', 'usr_rajesh', ?, ?, 'approved', ?)
                """, (doc_up_id, dictation, json.dumps(proposed_changes), now_str))

                # Apply changes to medications and add timeline event
                for chg in proposed_changes:
                    if chg.get("action") == "UPDATE_DOSAGE":
                        execute("UPDATE medications SET dosage = '10 mg', source = 'Doctor dictation approved by Dr. Mehta' WHERE senior_id = 'usr_rajesh' AND name LIKE '%Amlodipine%'")

                # Timeline event
                tle_id = f"tle_{uuid.uuid4().hex[:8]}"
                execute("""
                    INSERT INTO health_timeline_events (id, senior_id, event_date, event_type, title, actor_name, description, source_ref_id, created_at)
                    VALUES (?, ?, ?, 'medication_change', 'Doctor Consultation Update', 'Dr. Ananya Mehta', 'Medication regimen reviewed. Amlodipine dosage set to 10 mg daily.', ?, ?)
                """, (tle_id, "usr_rajesh", today_str, doc_up_id, now_str))

                # Notify senior
                execute("INSERT INTO notifications VALUES (?, ?, ?, ?, 'doctor', 0, ?)",
                        (f"notif_{uuid.uuid4().hex[:8]}", "usr_rajesh", "Dr. Mehta Updated Your Health Plan", "Dr. Ananya Mehta has updated your medication and requested a follow-up test.", now_str))

                log_audit("usr_rajesh", "usr_dr_mehta", "Dr. Ananya Mehta", "DOCTOR_PRESCRIPTION_APPROVE", f"Approved clinical update for Rajesh Sharma: {json.dumps(proposed_changes)}", "Doctor Portal")
                return self._send_json({"success": True, "message": "Clinical update approved and reflected in patient records."})

            # 12. Scam Analyzer (Journey 5)
            elif path == '/api/scam/analyze':
                msg = body.get('message', '')
                analysis = ai_engine.analyze_scam(msg)
                return self._send_json(analysis)

            # 13. AI Talk to Solya
            elif path == '/api/ai/chat':
                text = body.get('message', '')
                reply = ai_engine.process_chat(text)
                return self._send_json(reply)

            # 14. Save Questions for Doctor (Condition Care)
            elif path == '/api/conditions/save-question':
                condition_id = body.get('condition_id')
                new_question = body.get('question')
                cp = query_one("SELECT * FROM care_plans WHERE condition_id = ?", (condition_id,))
                if cp:
                    current_q = json.loads(cp["doctor_questions"] or "[]")
                    current_q.append(new_question)
                    execute("UPDATE care_plans SET doctor_questions = ? WHERE id = ?", (json.dumps(current_q), cp["id"]))
                    log_audit("usr_rajesh", "usr_rajesh", "Rajesh Sharma", "SAVED_DOCTOR_QUESTION", f"Added question for {cp['condition_name']}: '{new_question}'")
                return self._send_json({"success": True, "question": new_question})

            # 15. Create Appointment
            elif path == '/api/appointments/create':
                apt_id = f"apt_{uuid.uuid4().hex[:8]}"
                execute("""
                    INSERT INTO appointments (id, senior_id, doctor_id, doctor_name, specialty, hospital_name, appointment_date, appointment_time, purpose, prep_instructions, status)
                    VALUES (?, 'usr_rajesh', ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
                """, (
                    apt_id, body.get("doctor_id", "doc_1"), body.get("doctor_name", "Dr. Ananya Mehta"),
                    body.get("specialty", "General Medicine"), body.get("hospital_name", "CityCare Hospital"),
                    body.get("date"), body.get("time", "11:00 AM"), body.get("purpose", "Consultation"),
                    body.get("prep_instructions", "Bring previous records")
                ))
                log_audit("usr_rajesh", "usr_rajesh", "Rajesh Sharma", "APPOINTMENT_CREATE", f"Scheduled appointment with {body.get('doctor_name')} on {body.get('date')}")
                return self._send_json({"success": True, "appointment_id": apt_id})

            # 16. Update Settings / Permissions
            elif path == '/api/users/settings':
                lang = body.get('language')
                vision = 1 if body.get('vision_mode') else 0
                hearing = 1 if body.get('hearing_mode') else 0
                font_scale = body.get('font_size_scale', 1.0)
                
                execute("""
                    UPDATE user_settings
                    SET language = COALESCE(?, language),
                        vision_mode = ?,
                        hearing_mode = ?,
                        font_size_scale = ?
                    WHERE user_id = 'usr_rajesh'
                """, (lang, vision, hearing, font_scale))
                if lang:
                    execute("UPDATE users SET language = ? WHERE id = 'usr_rajesh'", (lang,))
                return self._send_json({"success": True})

            # 17. Toggle Permission
            elif path == '/api/permissions/toggle':
                perm_id = body.get('permission_id')
                is_granted = 1 if body.get('is_granted') else 0
                execute("UPDATE permissions SET is_granted = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (is_granted, perm_id))
                perm = query_one("SELECT title FROM permissions WHERE id = ?", (perm_id,))
                status_str = "GRANTED" if is_granted else "REVOKED"
                log_audit("usr_rajesh", "usr_rajesh", "Rajesh Sharma", "PERMISSION_CHANGE", f"{status_str} permission for: {perm['title'] if perm else perm_id}")
                return self._send_json({"success": True, "permission_id": perm_id, "is_granted": is_granted})

            # 18. Add Health Reading
            elif path == '/api/health/add-reading':
                read_id = f"read_{uuid.uuid4().hex[:8]}"
                metric = body.get("metric_type")
                val1 = body.get("value_numeric")
                val2 = body.get("value_secondary")
                unit = body.get("unit", "")
                notes = body.get("notes", "")

                status_level = "normal"
                if metric == "blood_pressure":
                    if (val1 and val1 >= 140) or (val2 and val2 >= 90):
                        status_level = "attention"
                elif metric == "blood_glucose":
                    if val1 and val1 > 140:
                        status_level = "attention"

                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                execute("""
                    INSERT INTO health_readings (id, senior_id, metric_type, value_numeric, value_secondary, unit, status_level, source, recorded_at, notes)
                    VALUES (?, 'usr_rajesh', ?, ?, ?, ?, ?, 'Manual Input', ?, ?)
                """, (read_id, metric, val1, val2, unit, status_level, now_str, notes))
                
                log_audit("usr_rajesh", "usr_rajesh", "Rajesh Sharma", "HEALTH_READING_ADD", f"Logged {metric}: {val1}/{val2} {unit} ({status_level})")
                return self._send_json({"success": True, "reading_id": read_id, "status_level": status_level})

            # 19. Sync Device
            elif path == '/api/devices/sync':
                dev_id = body.get('device_id')
                now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                execute("UPDATE health_devices SET last_synced = ?, status = 'connected' WHERE id = ?", (now_str, dev_id))
                return self._send_json({"success": True, "synced_at": now_str})

            else:
                return self._send_error(f"Endpoint {path} not found", 404)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return self._send_error(f"Internal server error: {str(e)}", 500)

def run_server():
    init_db()
    with socketserver.TCPServer(("", PORT), SolyaRequestHandler) as httpd:
        print(f"==================================================")
        print(f"SOLYA Server running on http://localhost:{PORT}")
        print(f"Serving frontend from {FRONTEND_DIR}")
        print(f"==================================================")
        httpd.serve_forever()

if __name__ == '__main__':
    run_server()
