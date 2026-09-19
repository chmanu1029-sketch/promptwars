// SOLYA Emergency Workflow Component
// Real-time emergency escalation, voice note, simulated dispatch, and 3-second hold to cancel

let activeEmergencyModal = null;

async function openEmergencyModal() {
  if (activeEmergencyModal) return;

  // Immediately activate emergency event on backend
  let emergencyData = null;
  try {
    emergencyData = await api.activateEmergency({
      latitude: 12.9352,
      longitude: 77.6245,
      voice_note: "I need assistance, feeling unsteady.",
      reported_symptom: "Fall / mobility distress"
    });
  } catch (err) {
    console.error("Emergency activation notice:", err);
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "emergency-active-overlay";

  modal.innerHTML = `
    <div class="modal-card emergency-modal-card">
      <!-- Emergency Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 36px; animation: pulse-soft 1s infinite;">🚨</span>
          <div>
            <h2 style="font-size: 26px; font-weight: 900; color: var(--emergency-red);">${t('emergencyActivated')}</h2>
            <p style="font-size: 14px; color: var(--text-secondary);">Solya is assisting your emergency network in real-time.</p>
          </div>
        </div>
        <span class="badge badge-urgent" style="font-size: 14px;">Demo Mode</span>
      </div>

      <!-- Live Emergency Status Banner -->
      <div style="background: var(--emergency-bg); border: 1px solid var(--emergency-border); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <h3 style="font-size: 20px; font-weight: 800; color: #991B1B; margin-bottom: 8px;">
          Rajesh Sharma Needs Immediate Assistance
        </h3>
        <p style="font-size: 15px; color: #7F1D1D; margin-bottom: 4px;">
          <strong>📍 Location:</strong> Flat 402, Shanti Vihar, 5th Block, Koramangala (12.9352° N, 77.6245° E)
        </p>
        <p style="font-size: 15px; color: #7F1D1D; margin-bottom: 4px;">
          <strong>🩺 Medical Summary:</strong> Blood Group B+ • Known Hypertension & Osteoarthritis • Allergic to Penicillin
        </p>
        <p style="font-size: 15px; color: #7F1D1D;">
          <strong>🏥 Preferred Hospital:</strong> CityCare Super Specialty Hospital (Emergency: +91 80 2553 9999)
        </p>
      </div>

      <!-- Emergency Voice Note Recording -->
      <div class="card" style="margin-bottom: 20px; background: #F8FAFC;">
        <h4 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">🎙️ Tell Us What Happened (Voice Note)</h4>
        <div id="voice-note-display" style="font-size: 16px; color: var(--text-main); font-style: italic; background: #FFFFFF; padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle); margin-bottom: 12px;">
          "I fell in the bathroom and I cannot stand."
        </div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
          <em>AI Summary: The user reports a fall in the bathroom and difficulty standing. This is user-reported information, not a medical diagnosis.</em>
        </div>
        <button id="em-record-voice-btn" class="btn btn-secondary" style="width: 100%;">
          🎙️ Record New Voice Update
        </button>
      </div>

      <!-- Escalation Network Status -->
      <div class="card" style="margin-bottom: 20px;">
        <h4 style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">Contact Escalation Status</h4>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #F0FDF4; border-radius: 8px; border: 1px solid #BBF7D0;">
            <div>
              <strong>1. Priya Sharma (Daughter)</strong> • Primary Contact
              <div style="font-size: 13px; color: var(--text-secondary);">+91 98765 43211</div>
            </div>
            <span id="priya-status-badge" class="badge badge-normal">🟢 Help Accepted</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface); border-radius: 8px;">
            <div>
              <strong>2. Amit Sharma (Son)</strong> • Secondary Contact
              <div style="font-size: 13px; color: var(--text-secondary);">+91 98765 43212</div>
            </div>
            <span class="badge badge-attention">⚪ Standby</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-surface); border-radius: 8px;">
            <div>
              <strong>3. Dr. Ananya Mehta</strong> • Cardiologist
              <div style="font-size: 13px; color: var(--text-secondary);">CityCare Hospital (+91 98765 43215)</div>
            </div>
            <span class="badge badge-normal">🟢 Alert Dispatched</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons Grid -->
      <div class="grid-2" style="margin-bottom: 24px;">
        <button id="em-call-family-btn" class="btn btn-primary">
          📞 Call Priya (+91 98765 43211)
        </button>
        <button id="em-dispatch-ambulance-btn" class="btn btn-urgent">
          🚑 Request Ambulance Dispatch
        </button>
        <button id="em-call-hospital-btn" class="btn btn-secondary">
          🏥 Call CityCare Hospital
        </button>
        <button id="em-open-location-btn" class="btn btn-secondary">
          📍 Share GPS Directions
        </button>
      </div>

      <!-- Accidental Protection: Press and Hold 3 Seconds to Cancel -->
      <div style="border-top: 1px solid var(--border-subtle); padding-top: 18px;">
        <p style="font-size: 14px; text-align: center; color: var(--text-secondary); margin-bottom: 10px;">
          To prevent accidental cancellation, press and hold for 3 seconds:
        </p>
        <button id="em-hold-cancel-btn" class="btn-hold-cancel">
          <div id="em-hold-progress-bar" class="btn-hold-progress"></div>
          <span class="btn-hold-text">🛡️ PRESS & HOLD 3 SECONDS TO CANCEL EMERGENCY</span>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  activeEmergencyModal = modal;

  // Speak announcement for senior
  solyaSpeech.speak("Emergency activated. We have notified your daughter Priya and Dr. Mehta. Help is being coordinated.");

  // Voice note recorder handler
  document.getElementById("em-record-voice-btn")?.addEventListener("click", () => {
    solyaSpeech.startListening((transcript) => {
      document.getElementById("voice-note-display").innerText = `"${transcript}"`;
      solyaSpeech.speak("Your message has been attached to the emergency alert.");
    });
  });

  // Ambulance dispatch button
  document.getElementById("em-dispatch-ambulance-btn")?.addEventListener("click", async () => {
    try {
      const res = await api.requestEmergencyDispatch(emergencyData?.emergency_id || "em_current");
      alert(`🚑 ${res.service} Request Received!\nStatus: ${res.status.toUpperCase()} (Demo Mode)\nEstimated arrival: ~12 minutes at Flat 402, Shanti Vihar.`);
    } catch (e) {
      alert("Ambulance dispatch simulated.");
    }
  });

  document.getElementById("em-call-family-btn")?.addEventListener("click", () => {
    alert("📞 Demo Mode: Calling Priya Sharma (+91 98765 43211)...");
  });

  document.getElementById("em-call-hospital-btn")?.addEventListener("click", () => {
    alert("🏥 Demo Mode: Calling CityCare Hospital Emergency Desk (+91 80 2553 9999)...");
  });

  document.getElementById("em-open-location-btn")?.addEventListener("click", () => {
    alert("📍 Location link copied: https://maps.google.com/?q=12.9352,77.6245");
  });

  // 3-SECOND PRESS AND HOLD IMPLEMENTATION
  const holdBtn = document.getElementById("em-hold-cancel-btn");
  const progressBar = document.getElementById("em-hold-progress-bar");
  let holdTimer = null;
  let holdStartTime = null;

  function startHold(e) {
    e.preventDefault();
    holdStartTime = Date.now();
    progressBar.style.transition = "width 3s linear";
    progressBar.style.width = "100%";

    holdTimer = setTimeout(async () => {
      // 3 seconds satisfied
      if (confirm("Are you sure you want to cancel the emergency? Your family will be informed that you are safe.")) {
        try {
          await api.cancelEmergency(emergencyData?.emergency_id || "em_current", "Confirmed safe by senior");
        } catch (err) {}
        modal.remove();
        activeEmergencyModal = null;
        alert("🟢 Emergency cancelled. Priya and Dr. Mehta have been notified that you are safe.");
        solyaSpeech.speak("Emergency cancelled. Your family knows you are safe.");
        window.location.reload();
      } else {
        resetHold();
      }
    }, 3000);
  }

  function resetHold() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    progressBar.style.transition = "width 0.15s ease";
    progressBar.style.width = "0%";
  }

  holdBtn.addEventListener("mousedown", startHold);
  holdBtn.addEventListener("touchstart", startHold);
  holdBtn.addEventListener("mouseup", resetHold);
  holdBtn.addEventListener("mouseleave", resetHold);
  holdBtn.addEventListener("touchend", resetHold);
}

// Global listener for emergency triggers
window.addEventListener("openEmergency", () => openEmergencyModal());
