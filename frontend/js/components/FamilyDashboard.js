// SOLYA Family Caregiver Dashboard Component
// Implements Role 2 and Demo Journey 3: Senior Safety Status, Safety Check Requests, and Emergency Telemetry

async function renderFamilyDashboard(container, onNavigate) {
  container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading family portal...</div></div>`;

  try {
    const [checkInData, healthData, medsData, emData] = await Promise.all([
      api.getTodayCheckIn(),
      api.getHealthSummary(),
      api.getMedications(),
      api.getEmergencyStatus()
    ]);

    const isSafe = checkInData.check_in && checkInData.check_in.status === 'safe';
    const readings = healthData.latest_readings || {};
    const meds = medsData.medications || [];
    const activeEmergency = emData.active_emergency;

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 32px;">👨‍👩‍👧</span>
            <h2 style="font-size: var(--font-h1); font-weight: 800;">Priya's Caregiver Portal</h2>
          </div>
          <p style="font-size: var(--font-base); color: var(--text-secondary); margin-top: 4px;">
            Authorized Caregiver for Rajesh Sharma (Father, 72)
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="fam-safety-check-req-btn" class="btn btn-primary">
            🛡️ Request Safety Check (Journey 3)
          </button>
        </div>
      </div>

      <!-- Live Emergency Banner if Emergency is Active -->
      ${activeEmergency ? `
        <div class="card" style="background: var(--emergency-bg); border: 2px solid var(--emergency-red); margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 28px;">🚨</span>
              <h3 style="font-size: 22px; font-weight: 900; color: var(--emergency-red);">EMERGENCY ACTIVE</h3>
            </div>
            <span class="badge badge-urgent">Immediate Action</span>
          </div>
          <p style="font-size: 16px; color: #7F1D1D; margin-bottom: 12px;">
            Rajesh Sharma triggered emergency assistance at ${activeEmergency.activated_at}.<br>
            Voice Note: <em>"${activeEmergency.user_voice_note}"</em>
          </p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button id="fam-ack-btn" class="btn btn-safe">
              ✓ Acknowledge & Accept Help
            </button>
            <button class="btn btn-primary" onclick="window.dispatchEvent(new CustomEvent('startVideoCall', {detail: {targetName: 'Rajesh Sharma'}}))">
              📹 Open Video Link
            </button>
            <button class="btn btn-secondary" onclick="alert('Calling Rajesh: +91 98765 43210')">
              📞 Call Rajesh
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Senior Status Hero Card -->
      <div class="card" style="border-left: 8px solid ${isSafe ? 'var(--safe-green)' : 'var(--attention-amber)'};">
        <div class="card-header">
          <h3 style="font-size: 24px; font-weight: 800; display: flex; align-items: center; gap: 10px;">
            <span>👴</span>
            <span>Rajesh Sharma's Status</span>
          </h3>
          <span class="badge ${isSafe ? 'badge-normal' : 'badge-attention'}">
            ${isSafe ? '🟢 Confirmed Safe' : '🟡 Check-in Pending'}
          </span>
        </div>
        <p style="font-size: 18px; color: var(--text-main); margin-bottom: 16px;">
          ${isSafe ? `Rajesh checked in safe today. Everything is calm and normal at home.` : `Rajesh has not yet sent today's morning check-in.`}
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-primary" id="call-papa-video-btn">
            📹 Video Call Papa
          </button>
          <button class="btn btn-secondary" onclick="alert('Calling Rajesh: +91 98765 43210')">
            📞 Direct Phone Call
          </button>
        </div>
      </div>

      <!-- Grid: Health Vitals & Medication Status -->
      <div class="grid-2">
        <div class="card">
          <div class="card-header">
            <h4 style="font-size: 20px; font-weight: 700;">❤️ Today's Vitals</h4>
            <span class="badge badge-normal">Synced</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; font-size: 16px; border-bottom: 1px solid var(--bg-surface); padding-bottom: 6px;">
              <span>Blood Pressure:</span>
              <strong>${readings.blood_pressure ? `${readings.blood_pressure.value_numeric}/${readings.blood_pressure.value_secondary} mmHg` : "128/82 mmHg"}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; border-bottom: 1px solid var(--bg-surface); padding-bottom: 6px;">
              <span>Heart Rate:</span>
              <strong>${readings.heart_rate ? `${readings.heart_rate.value_numeric} bpm` : "72 bpm"}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; border-bottom: 1px solid var(--bg-surface); padding-bottom: 6px;">
              <span>Blood Glucose:</span>
              <strong style="color: var(--attention-amber);">${readings.blood_glucose ? `${readings.blood_glucose.value_numeric} mg/dL` : "132 mg/dL"}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px;">
              <span>Oxygen (SpO2):</span>
              <strong>${readings.spo2 ? `${readings.spo2.value_numeric}%` : "98%"}</strong>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h4 style="font-size: 20px; font-weight: 700;">💊 Medication Adherence</h4>
            <span class="badge badge-normal">${meds.filter(m => m.today_status === 'taken').length}/${meds.length} Taken</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${meds.map(m => `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 15px; background: var(--bg-surface); padding: 8px 12px; border-radius: 8px;">
                <span>${m.name} ${m.dosage} (${m.scheduled_time})</span>
                <span class="badge ${m.today_status === 'taken' ? 'badge-normal' : 'badge-attention'}" style="font-size: 13px;">
                  ${m.today_status.toUpperCase()}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById("fam-safety-check-req-btn")?.addEventListener("click", async () => {
      try {
        await api.requestSafetyCheck();
        alert("🛡️ Safety Check requested!\nRajesh will see a polite prompt on his screen: 'Priya wants to check if you are okay.'");
      } catch (err) {
        alert("Error requesting safety check: " + err.message);
      }
    });

    document.getElementById("call-papa-video-btn")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("startVideoCall", { detail: { targetName: "Rajesh Sharma (Father)" } }));
    });

    document.getElementById("fam-ack-btn")?.addEventListener("click", async () => {
      if (activeEmergency) {
        await api.acknowledgeEmergency(activeEmergency.id, "Priya Sharma");
        alert("🟢 Help accepted! Status set to 'Help on the way'.");
        renderFamilyDashboard(container, onNavigate);
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="card"><p>Failed to load family dashboard: ${err.message}</p></div>`;
  }
}
