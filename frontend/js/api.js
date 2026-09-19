// SOLYA Frontend API Client
// Interfaces cleanly with the Python REST backend

const API_BASE = '/api';

const api = {
  async get(url, params = {}) {
    const query = new URLSearchParams(params).toString();
    const fullUrl = query ? `${API_BASE}${url}?${query}` : `${API_BASE}${url}`;
    const res = await fetch(fullUrl);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Network response was not ok' }));
      throw new Error(err.error || 'Server error');
    }
    return res.json();
  },

  async post(url, data = {}) {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Server error');
    }
    return res.json();
  },

  // Auth & Roles
  getCurrentUser(role = 'senior') {
    return this.get('/auth/current', { role });
  },

  // Senior Profile & Settings
  getSeniorProfile() {
    return this.get('/users/senior');
  },
  updateSettings(settings) {
    return this.post('/users/settings', settings);
  },

  // Health
  getHealthSummary() {
    return this.get('/health/summary');
  },
  addHealthReading(reading) {
    return this.post('/health/add-reading', reading);
  },

  // Medications
  getMedications() {
    return this.get('/medications');
  },
  updateMedicationStatus(medication_id, status) {
    return this.post('/medications/status', { medication_id, status });
  },
  addMedication(medData) {
    return this.post('/medications/add', medData);
  },

  // Appointments
  getAppointments() {
    return this.get('/appointments');
  },
  createAppointment(apptData) {
    return this.post('/appointments/create', apptData);
  },

  // Doctors
  getDoctors() {
    return this.get('/doctors');
  },
  getDoctorPatients() {
    return this.get('/doctor/patients');
  },
  processDoctorDictation(dictation) {
    return this.post('/doctor/process-update', { dictation });
  },
  approveDoctorUpdate(dictation, structured_changes) {
    return this.post('/doctor/approve-update', { dictation, structured_changes });
  },

  // Family
  getFamily() {
    return this.get('/family');
  },
  requestSafetyCheck() {
    return this.post('/family/request-safety-check');
  },

  // Emergency
  getEmergencyStatus() {
    return this.get('/emergency/status');
  },
  activateEmergency(details) {
    return this.post('/emergency/activate', details);
  },
  acknowledgeEmergency(emergency_id, contact_name) {
    return this.post('/emergency/acknowledge', { emergency_id, contact_name });
  },
  requestEmergencyDispatch(emergency_id, service_type = 'Ambulance') {
    return this.post('/emergency/dispatch', { emergency_id, service_type });
  },
  cancelEmergency(emergency_id, reason) {
    return this.post('/emergency/cancel', { emergency_id, reason });
  },

  // Daily Check-in
  getTodayCheckIn() {
    return this.get('/checkins/today');
  },
  submitCheckIn(status = 'safe', note = '') {
    return this.post('/checkins/submit', { status, note });
  },

  // Documents & Prescription Extraction
  getDocuments() {
    return this.get('/documents');
  },
  uploadPrescription(text) {
    return this.post('/documents/upload-prescription', { text });
  },
  confirmPrescriptionUpdate() {
    return this.post('/documents/confirm-prescription-update');
  },

  // Conditions & Care Plans
  getConditions() {
    return this.get('/conditions');
  },
  saveDoctorQuestion(condition_id, question) {
    return this.post('/conditions/save-question', { condition_id, question });
  },

  // Timeline
  getTimeline() {
    return this.get('/timeline');
  },

  // Devices
  getDevices() {
    return this.get('/devices');
  },
  syncDevice(device_id) {
    return this.post('/devices/sync', { device_id });
  },

  // Notifications
  getNotifications(role = 'senior') {
    return this.get('/notifications', { role });
  },

  // Permissions & Audit
  getPermissions() {
    return this.get('/permissions');
  },
  togglePermission(permission_id, is_granted) {
    return this.post('/permissions/toggle', { permission_id, is_granted });
  },
  getAuditLogs() {
    return this.get('/audit');
  },

  // Scam Protection
  analyzeScam(message) {
    return this.post('/scam/analyze', { message });
  },

  // Phone Tutor
  getPhoneTutorial(topic = 'send_photo') {
    return this.get('/tutor', { topic });
  },

  // AI Chat & Briefing
  getDailyBriefing() {
    return this.get('/ai/briefing');
  },
  sendAIChat(message) {
    return this.post('/ai/chat', { message });
  }
};
