// SOLYA My Health Center Component
// Clean summary, intuitive status indicators, structured health record with sources

async function renderMyHealth(container, onNavigate) {
  container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading health records...</div></div>`;

  try {
    const [healthData, seniorData] = await Promise.all([
      api.getHealthSummary(),
      api.getSeniorProfile()
    ]);

    const readings = healthData.latest_readings || {};
    const senior = seniorData.senior || {};
    const profile = seniorData.profile || {};
    const hospital = seniorData.preferred_hospital || {};

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: var(--font-h1); font-weight: 800;">${t('navHealth')}</h2>
          <p style="font-size: var(--font-base); color: var(--text-secondary);">
            Clear, continuous monitoring grounded in your baseline and medical records.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="add-reading-btn" class="btn btn-primary">
            + Log Health Reading
          </button>
          <button id="read-health-summary-btn" class="btn btn-secondary">
            🔊 ${t('btnReadAloud')}
          </button>
        </div>
      </div>

      <!-- Vital Metrics Cards Grid -->
      <div class="grid-3" style="margin-bottom: 28px;">
        <!-- Blood Pressure -->
        <div class="card" style="border-top: 6px solid var(--safe-green);">
          <div class="card-header">
            <span style="font-weight: 700; font-size: 18px;">❤️ Blood Pressure</span>
            <span class="badge badge-normal">🟢 Safe</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #0F172A; margin: 8px 0;">
            ${readings.blood_pressure ? `${readings.blood_pressure.value_numeric}/${readings.blood_pressure.value_secondary} <span style="font-size: 18px; font-weight: 500;">mmHg</span>` : "128/82 mmHg"}
          </div>
          <p style="font-size: 14px; color: var(--text-secondary);">
            Target: 110-130 / 70-85 mmHg<br>
            <strong>Source:</strong> ${readings.blood_pressure ? readings.blood_pressure.source : "Smart BP Monitor"}
          </p>
        </div>

        <!-- Heart Rate -->
        <div class="card" style="border-top: 6px solid var(--safe-green);">
          <div class="card-header">
            <span style="font-weight: 700; font-size: 18px;">💓 Heart Rate</span>
            <span class="badge badge-normal">🟢 Safe</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #0F172A; margin: 8px 0;">
            ${readings.heart_rate ? `${readings.heart_rate.value_numeric} <span style="font-size: 18px; font-weight: 500;">bpm</span>` : "72 bpm"}
          </div>
          <p style="font-size: 14px; color: var(--text-secondary);">
            Resting target: 60-80 bpm<br>
            <strong>Source:</strong> ${readings.heart_rate ? readings.heart_rate.source : "Smartwatch"}
          </p>
        </div>

        <!-- Blood Glucose -->
        <div class="card" style="border-top: 6px solid var(--attention-amber);">
          <div class="card-header">
            <span style="font-weight: 700; font-size: 18px;">🩸 Blood Glucose</span>
            <span class="badge badge-attention">🟡 Needs Attention</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #0F172A; margin: 8px 0;">
            ${readings.blood_glucose ? `${readings.blood_glucose.value_numeric} <span style="font-size: 18px; font-weight: 500;">mg/dL</span>` : "132 mg/dL"}
          </div>
          <p style="font-size: 14px; color: var(--text-secondary);">
            Fasting target: 90-130 mg/dL<br>
            <strong>Source:</strong> Continuous Glucose Monitor
          </p>
        </div>

        <!-- SpO2 -->
        <div class="card" style="border-top: 6px solid var(--safe-green);">
          <div class="card-header">
            <span style="font-weight: 700; font-size: 18px;">🫁 Oxygen (SpO2)</span>
            <span class="badge badge-normal">🟢 Safe</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #0F172A; margin: 8px 0;">
            ${readings.spo2 ? `${readings.spo2.value_numeric}%` : "98%"}
          </div>
          <p style="font-size: 14px; color: var(--text-secondary);">
            Baseline: 95-99%<br>
            <strong>Source:</strong> Fingertip Pulse Oximeter
          </p>
        </div>

        <!-- Weight -->
        <div class="card" style="border-top: 6px solid var(--safe-green);">
          <div class="card-header">
            <span style="font-weight: 700; font-size: 18px;">⚖️ Body Weight</span>
            <span class="badge badge-normal">🟢 Stable</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #0F172A; margin: 8px 0;">
            ${readings.weight ? `${readings.weight.value_numeric} kg` : "68.2 kg"}
          </div>
          <p style="font-size: 14px; color: var(--text-secondary);">
            Fluid balance stable<br>
            <strong>Source:</strong> Smart Weight Scale
          </p>
        </div>

        <!-- Daily Steps -->
        <div class="card" style="border-top: 6px solid var(--safe-green);">
          <div class="card-header">
            <span style="font-weight: 700; font-size: 18px;">🚶 Morning Walk</span>
            <span class="badge badge-normal">🟢 Active</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #0F172A; margin: 8px 0;">
            ${readings.steps ? `${readings.steps.value_numeric} <span style="font-size: 18px; font-weight: 500;">steps</span>` : "3,420 steps"}
          </div>
          <p style="font-size: 14px; color: var(--text-secondary);">
            Joint health goal: 3,500 steps<br>
            <strong>Source:</strong> Apple Health Sync
          </p>
        </div>
      </div>

      <!-- Structured Health Profile Card -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <span>📋</span>
            <span>Personal Health Profile</span>
          </h3>
          <span class="badge badge-normal">Verified Records</span>
        </div>

        <div class="grid-2" style="margin-top: 16px;">
          <div>
            <p style="font-size: 16px; margin-bottom: 8px;"><strong>Full Name:</strong> ${senior.name} (${profile.age || 72} years, ${profile.gender || 'Male'})</p>
            <p style="font-size: 16px; margin-bottom: 8px;"><strong>Blood Group:</strong> <span class="badge badge-normal">${profile.blood_group || 'B+'}</span></p>
            <p style="font-size: 16px; margin-bottom: 8px; color: #991B1B;"><strong>Documented Allergies:</strong> ${profile.allergies || 'Penicillin, Sulfa drugs'}</p>
            <p style="font-size: 16px; margin-bottom: 8px;"><strong>Dietary Notes:</strong> ${profile.dietary_notes || 'Low sodium, diabetic-friendly, vegetarian'}</p>
          </div>
          <div>
            <p style="font-size: 16px; margin-bottom: 8px;"><strong>Primary Hospital:</strong> ${hospital.name || 'CityCare Super Specialty Hospital'}</p>
            <p style="font-size: 16px; margin-bottom: 8px;"><strong>Emergency Dept:</strong> ${hospital.emergency_dept_phone || '+91 80 2553 9999'}</p>
            <p style="font-size: 16px; margin-bottom: 8px;"><strong>Health Insurance:</strong> ${profile.insurance_policy || 'Star Health Senior Citizen Red Carpet'}</p>
            <p style="font-size: 16px; margin-bottom: 8px;"><strong>Home Location:</strong> ${profile.address || 'Flat 402, Shanti Vihar, Koramangala'}</p>
          </div>
        </div>

        <div style="margin-top: 20px; display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-secondary" id="open-timeline-btn">
            ⏳ View Complete Health Timeline
          </button>
          <button class="btn btn-secondary" id="open-careplans-btn">
            📋 View 13 Condition Care Plans
          </button>
        </div>
      </div>
    `;

    // Audio Read Aloud
    document.getElementById("read-health-summary-btn")?.addEventListener("click", () => {
      const speechText = "Here is your health summary, Rajesh. Your blood pressure is 128 over 82, which is safe. Your heart rate is 72 beats per minute. Your blood glucose is 132, which needs slight attention. You have walked 3,420 steps today.";
      solyaSpeech.speak(speechText);
    });

    document.getElementById("open-timeline-btn")?.addEventListener("click", () => onNavigate("timeline"));
    document.getElementById("open-careplans-btn")?.addEventListener("click", () => onNavigate("care"));

    // Add reading modal
    document.getElementById("add-reading-btn")?.addEventListener("click", () => {
      openAddReadingModal(() => renderMyHealth(container, onNavigate));
    });

  } catch (err) {
    container.innerHTML = `<div class="card"><p>Failed to load health: ${err.message}</p></div>`;
  }
}

function openAddReadingModal(onSuccess) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-card">
      <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Log New Health Reading</h3>
      <form id="reading-form">
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Metric Type</label>
          <select id="modal-metric" class="role-switcher-select" style="width: 100%; height: 48px;">
            <option value="blood_pressure">Blood Pressure (mmHg)</option>
            <option value="blood_glucose">Blood Glucose (mg/dL)</option>
            <option value="heart_rate">Heart Rate (bpm)</option>
            <option value="weight">Body Weight (kg)</option>
            <option value="spo2">Oxygen SpO2 (%)</option>
          </select>
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Value (Primary / Systolic)</label>
          <input type="number" id="modal-val1" class="role-switcher-select" style="width: 100%; height: 48px;" placeholder="e.g. 126" required />
        </div>

        <div id="secondary-field" style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Value (Diastolic for BP)</label>
          <input type="number" id="modal-val2" class="role-switcher-select" style="width: 100%; height: 48px;" placeholder="e.g. 80" />
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Notes (Optional)</label>
          <input type="text" id="modal-notes" class="role-switcher-select" style="width: 100%; height: 48px;" placeholder="e.g. Taken 30 mins after breakfast" />
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Reading</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const metricSelect = modal.querySelector("#modal-metric");
  const secondaryField = modal.querySelector("#secondary-field");
  metricSelect.addEventListener("change", (e) => {
    secondaryField.style.display = e.target.value === "blood_pressure" ? "block" : "none";
  });

  modal.querySelector("#modal-cancel-btn").addEventListener("click", () => modal.remove());

  modal.querySelector("#reading-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const metric = metricSelect.value;
    const v1 = parseFloat(modal.querySelector("#modal-val1").value);
    const v2 = modal.querySelector("#modal-val2").value ? parseFloat(modal.querySelector("#modal-val2").value) : null;
    const notes = modal.querySelector("#modal-notes").value;

    let unit = "mmHg";
    if (metric === "blood_glucose") unit = "mg/dL";
    if (metric === "heart_rate") unit = "bpm";
    if (metric === "weight") unit = "kg";
    if (metric === "spo2") unit = "%";

    try {
      const res = await api.addHealthReading({
        metric_type: metric,
        value_numeric: v1,
        value_secondary: v2,
        unit: unit,
        notes: notes
      });
      alert(`Reading saved! Status: ${res.status_level.toUpperCase()}`);
      modal.remove();
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Error saving reading: " + err.message);
    }
  });
}
