// SOLYA Doctor & Care Team Dashboard Component
// Implements Role 3 and Demo Journey 4: Doctor Voice Dictation, AI Structuring, Clinical Approval, and Audit Trail

async function renderDoctorDashboard(container, onNavigate) {
  container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading doctor portal...</div></div>`;

  try {
    const data = await api.getDoctorPatients();
    const patients = data.patients || [];
    const p = patients[0] || {};

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 32px;">🩺</span>
            <h2 style="font-size: var(--font-h1); font-weight: 800;">Dr. Ananya Mehta's Clinical Portal</h2>
          </div>
          <p style="font-size: var(--font-base); color: var(--text-secondary); margin-top: 4px;">
            Cardiologist & Senior Physician • CityCare Super Specialty Hospital
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="doc-record-update-btn" class="btn btn-primary">
            🎙️ Record Patient Update (Journey 4)
          </button>
        </div>
      </div>

      <!-- Authorized Patient Card -->
      <div class="card" style="border-top: 8px solid var(--brand-primary);">
        <div class="card-header">
          <div>
            <h3 style="font-size: 24px; font-weight: 800;">${p.name} (Age ${p.age} • ${p.gender} • ${p.blood_group})</h3>
            <p style="font-size: 15px; color: var(--text-secondary); margin-top: 4px;">
              Primary Authorized Care: Hypertension, Osteoarthritis & Type 2 Diabetes
            </p>
          </div>
          <span class="badge badge-normal">Authorized & Connected</span>
        </div>

        <div class="grid-3" style="margin: 16px 0;">
          <div style="background: var(--bg-surface); padding: 14px; border-radius: 10px;">
            <div style="font-size: 13px; color: var(--text-secondary);">Latest BP Reading</div>
            <div style="font-size: 20px; font-weight: 800; color: #0F172A; margin-top: 4px;">${p.recent_bp || "128/82 mmHg"}</div>
          </div>
          <div style="background: var(--bg-surface); padding: 14px; border-radius: 10px;">
            <div style="font-size: 13px; color: var(--text-secondary);">Medication Compliance</div>
            <div style="font-size: 20px; font-weight: 800; color: var(--safe-green); margin-top: 4px;">${p.compliance_rate || "95% Active"}</div>
          </div>
          <div style="background: var(--bg-surface); padding: 14px; border-radius: 10px;">
            <div style="font-size: 13px; color: var(--text-secondary);">Scheduled Consultation</div>
            <div style="font-size: 20px; font-weight: 800; color: var(--brand-primary); margin-top: 4px;">${p.next_appointment || "Today, 10:30 AM"}</div>
          </div>
        </div>

        <div style="margin-top: 16px;">
          <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Current Active Prescriptions:</h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${(p.active_medications || []).map(m => `<span class="badge badge-normal" style="font-size: 15px;">💊 ${m}</span>`).join('')}
          </div>
        </div>

        <div style="margin-top: 24px; display: flex; gap: 12px; flex-wrap: wrap; border-top: 1px solid var(--border-subtle); padding-top: 18px;">
          <button id="doc-start-consult-btn" class="btn btn-primary">
            📹 Start Video Consultation with Rajesh
          </button>
          <button id="doc-view-timeline-btn" class="btn btn-secondary">
            ⏳ View Full Timeline & Records
          </button>
          <button id="doc-message-btn" class="btn btn-secondary">
            💬 Send Direct Message to Senior & Family
          </button>
        </div>
      </div>

      <!-- Clinical Guidelines Callout -->
      <div class="card" style="background: #F8FAFC;">
        <h4 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">🔒 Clinical Integrity & Consent Rules</h4>
        <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.5;">
          All medication adjustments made via voice or text are subject to explicit audit logging. Changes take effect on Rajesh's schedule only after final clinical confirmation.
        </p>
      </div>
    `;

    // Event listeners
    document.getElementById("doc-record-update-btn")?.addEventListener("click", () => {
      openDoctorDictationModal(() => renderDoctorDashboard(container, onNavigate));
    });

    document.getElementById("doc-start-consult-btn")?.addEventListener("click", () => {
      window.dispatchEvent(new CustomEvent("startVideoCall", { detail: { targetName: "Rajesh Sharma (Patient)" } }));
    });

    document.getElementById("doc-view-timeline-btn")?.addEventListener("click", () => onNavigate("timeline"));

    document.getElementById("doc-message-btn")?.addEventListener("click", () => {
      const msg = prompt("Send a reassuring clinical note to Rajesh Sharma:", "Rajesh-ji, your morning BP reading looks very stable. Keep taking morning walks.");
      if (msg) alert(`Clinical message delivered to Rajesh's Solya home screen.`);
    });

  } catch (err) {
    container.innerHTML = `<div class="card"><p>Failed to load doctor dashboard: ${err.message}</p></div>`;
  }
}

// Modal for Doctor Voice Update & Clinical Approval (Journey 4)
function openDoctorDictationModal(onSuccess) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 680px;">
      <div class="card-header">
        <h3 style="font-size: 24px; font-weight: 800;">🎙️ Record Patient Clinical Update</h3>
        <span class="badge badge-normal">Dr. Mehta</span>
      </div>
      <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 16px;">
        Dictate or enter clinical instructions. AI structures changes into medications, scheduled diagnostics, and follow-ups.
      </p>

      <div style="margin-bottom: 16px;">
        <label style="display: block; font-weight: 700; margin-bottom: 6px;">Doctor's Voice Dictation / Note</label>
        <textarea id="dictation-input" class="role-switcher-select" style="width: 100%; height: 90px; padding: 12px;" placeholder="e.g. Continue Amlodipine 10 mg once daily. Schedule serum creatinine test in two weeks.">Continue Amlodipine 10 mg once daily. Stop NSAID painkillers. Schedule serum creatinine test in two weeks.</textarea>
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <button id="mic-dictate-btn" class="btn btn-secondary" style="flex: 1;">
          🎤 Speak Dictation
        </button>
        <button id="ai-structure-btn" class="btn btn-primary" style="flex: 1;">
          ⚡ Convert to Structured Plan
        </button>
      </div>

      <div id="structured-preview" style="display: none; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <h4 style="font-size: 18px; font-weight: 800; color: #166534; margin-bottom: 10px;">Proposed Clinical Changes:</h4>
        <div id="changes-content" style="font-size: 15px; color: #14532D; display: flex; flex-direction: column; gap: 8px;"></div>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="doc-modal-cancel" class="btn btn-secondary">Cancel</button>
        <button id="doc-modal-approve" class="btn btn-safe" style="display: none;">
          ✓ Approve & Update Patient Record
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  let structuredData = null;

  modal.querySelector("#doc-modal-cancel").addEventListener("click", () => modal.remove());

  modal.querySelector("#mic-dictate-btn").addEventListener("click", () => {
    solyaSpeech.startListening((transcript) => {
      modal.querySelector("#dictation-input").value = transcript;
    });
  });

  modal.querySelector("#ai-structure-btn").addEventListener("click", async () => {
    const text = modal.querySelector("#dictation-input").value;
    try {
      structuredData = await api.processDoctorDictation(text);
      const previewDiv = modal.querySelector("#structured-preview");
      const contentDiv = modal.querySelector("#changes-content");
      const approveBtn = modal.querySelector("#doc-modal-approve");

      contentDiv.innerHTML = structuredData.structured_changes.map(chg => `
        <div style="background: #FFFFFF; padding: 10px 14px; border-radius: 8px; border: 1px solid #86EFAC;">
          <strong>${chg.action.replace('_', ' ')}:</strong> ${chg.medication || chg.test_name || chg.notes}
          ${chg.new_dosage ? `➔ <em>${chg.new_dosage}</em>` : ''}
        </div>
      `).join('');

      previewDiv.style.display = "block";
      approveBtn.style.display = "inline-flex";
    } catch (err) {
      alert("Error structuring dictation: " + err.message);
    }
  });

  modal.querySelector("#doc-modal-approve").addEventListener("click", async () => {
    const text = modal.querySelector("#dictation-input").value;
    try {
      const res = await api.approveDoctorUpdate(text, structuredData.structured_changes);
      alert(`✅ Success!\n${res.message}\n\n• Audit log saved\n• Amlodipine updated to 10 mg\n• Timeline record updated\n• Rajesh notified`);
      modal.remove();
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Error approving update: " + err.message);
    }
  });
}
