-- SOLYA Database Schema
-- Relational model for Senior Citizen Health & Safety Platform

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('senior', 'family', 'doctor')),
    email TEXT,
    phone TEXT NOT NULL,
    language TEXT DEFAULT 'hi',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    age INTEGER,
    gender TEXT,
    blood_group TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    latitude REAL,
    longitude REAL,
    allergies TEXT,
    dietary_notes TEXT,
    insurance_policy TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    emergency_dept_phone TEXT NOT NULL,
    directions_info TEXT,
    distance_km REAL DEFAULT 3.2
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    priority_order INTEGER NOT NULL,
    can_view_health INTEGER DEFAULT 1,
    can_view_location INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    user_id TEXT,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar TEXT,
    safety_check_status TEXT DEFAULT 'pending',
    last_contact_time TIMESTAMP,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    hospital_id TEXT,
    hospital_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    availability_status TEXT DEFAULT 'available',
    is_emergency_doctor INTEGER DEFAULT 0,
    is_connected INTEGER DEFAULT 1,
    avatar TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
);

CREATE TABLE IF NOT EXISTS health_conditions (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    condition_name TEXT NOT NULL,
    category TEXT NOT NULL,
    icd_code TEXT,
    diagnosed_date TEXT,
    status TEXT DEFAULT 'active',
    treating_doctor_id TEXT,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (treating_doctor_id) REFERENCES doctors(id)
);

CREATE TABLE IF NOT EXISTS care_plans (
    id TEXT PRIMARY KEY,
    condition_id TEXT NOT NULL,
    condition_name TEXT NOT NULL,
    overview_text TEXT NOT NULL,
    today_care_reminders TEXT NOT NULL, -- JSON array
    monitoring_targets TEXT NOT NULL,  -- JSON object
    emergency_guidance TEXT NOT NULL,
    doctor_questions TEXT,            -- JSON array
    FOREIGN KEY (condition_id) REFERENCES health_conditions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    name TEXT NOT NULL,
    generic_name TEXT,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    timing_tag TEXT NOT NULL, -- e.g. 'morning', 'afternoon', 'night'
    scheduled_time TEXT NOT NULL, -- e.g. '08:00 AM'
    condition_id TEXT,
    purpose TEXT,
    instructions TEXT,
    source TEXT DEFAULT 'Prescription upload',
    prescribed_by TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'paused', 'discontinued'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medication_logs (
    id TEXT PRIMARY KEY,
    medication_id TEXT NOT NULL,
    senior_id TEXT NOT NULL,
    log_date TEXT NOT NULL, -- 'YYYY-MM-DD'
    scheduled_time TEXT NOT NULL,
    status TEXT NOT NULL, -- 'taken', 'skipped', 'pending'
    action_timestamp TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS health_readings (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'blood_pressure', 'heart_rate', 'spo2', 'blood_glucose', 'temperature', 'weight', 'steps'
    value_numeric REAL,
    value_secondary REAL, -- e.g. diastolic for BP
    unit TEXT NOT NULL,
    status_level TEXT NOT NULL, -- 'normal', 'attention', 'urgent'
    source TEXT DEFAULT 'Manual Input', -- e.g. 'Smart BP Monitor', 'Apple Health'
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS health_devices (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL,
    brand TEXT,
    status TEXT DEFAULT 'connected', -- 'connected', 'syncing', 'disconnected'
    battery_level INTEGER DEFAULT 85,
    last_synced TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    hospital_name TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    purpose TEXT NOT NULL,
    prep_instructions TEXT,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

CREATE TABLE IF NOT EXISTS health_documents (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    title TEXT NOT NULL,
    doc_type TEXT NOT NULL, -- 'prescription', 'lab_report', 'discharge_summary', 'insurance'
    file_url TEXT,
    uploaded_date TEXT NOT NULL,
    source TEXT NOT NULL,
    summary TEXT NOT NULL,
    extracted_data TEXT, -- JSON structure
    doctor_name TEXT,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS health_timeline_events (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'doctor_visit', 'prescription', 'lab_report', 'medication_change', 'reading_alert', 'check_in'
    title TEXT NOT NULL,
    actor_name TEXT,
    description TEXT NOT NULL,
    source_ref_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctor_updates (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL,
    senior_id TEXT NOT NULL,
    voice_note_transcript TEXT,
    proposed_changes TEXT NOT NULL, -- JSON
    status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (senior_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS emergency_events (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    status TEXT NOT NULL, -- 'active', 'escalating', 'acknowledged', 'dispatched', 'resolved', 'cancelled'
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    latitude REAL,
    longitude REAL,
    location_name TEXT,
    user_voice_note TEXT,
    reported_symptom TEXT,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emergency_contact_alerts (
    id TEXT PRIMARY KEY,
    emergency_id TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    priority_order INTEGER NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'alert_sent', 'acknowledged', 'declined'
    notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    FOREIGN KEY (emergency_id) REFERENCES emergency_events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS check_ins (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    check_in_date TEXT NOT NULL,
    time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL, -- 'safe', 'requested', 'missed', 'needs_help'
    note TEXT,
    notified_family INTEGER DEFAULT 1,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL, -- 'medication', 'emergency', 'checkin', 'doctor', 'system'
    is_read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    permission_key TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_granted INTEGER DEFAULT 1,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    action_type TEXT NOT NULL,
    details TEXT NOT NULL,
    source TEXT DEFAULT 'Web App',
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS authorized_editors (
    id TEXT PRIMARY KEY,
    senior_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role_type TEXT NOT NULL, -- 'Family Primary', 'Caregiver', 'Consulting Physician', 'Specialist Nurse'
    access_level TEXT NOT NULL, -- 'editor', 'full_access', 'view_only'
    phone TEXT,
    organization TEXT,
    can_modify_medications INTEGER DEFAULT 1,
    can_view_vitals INTEGER DEFAULT 1,
    can_trigger_emergency INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senior_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    language TEXT DEFAULT 'hi',
    vision_mode INTEGER DEFAULT 0,
    hearing_mode INTEGER DEFAULT 0,
    voice_reading INTEGER DEFAULT 1,
    font_size_scale REAL DEFAULT 1.0,
    emergency_hospital_id TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (emergency_hospital_id) REFERENCES hospitals(id)
);
