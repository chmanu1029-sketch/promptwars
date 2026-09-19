// SOLYA Documents & Smart Prescription Upload View
// Implements Demo Journey 1: Smart Prescription Extraction, Dosage Change Diff, and Cascading Health Record Update

async function renderDocuments(container, onNavigate) {
  container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading documents...</div></div>`;

  try {
    const data = await api.getDocuments();
    const docs = data.documents || [];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: var(--font-h1); font-weight: 800;">${t('navDocuments')}</h2>
          <p style="font-size: var(--font-base); color: var(--text-secondary);">
            Prescriptions, lab reports, and doctor notes safely stored and explained in simple language.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="upload-rx-hero-btn" class="btn btn-primary">
            📄 Upload / Scan Prescription
          </button>
        </div>
      </div>

      <!-- Smart Upload Options Card -->
      <div class="card" style="background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); border: 2px dashed #0284C7;">
        <div class="card-header">
          <h3 style="font-size: 22px; font-weight: 800; color: #0369A1;">
            📄 Smart Prescription Upload (Demo Journey 1)
          </h3>
          <span class="badge badge-normal">AI Grounded Verification</span>
        </div>
        <p style="font-size: 16px; color: var(--text-main); margin-bottom: 16px;">
          Upload a paper prescription from Dr. Mehta. Solya extracts verified medications, checks for dosage changes, and asks for your confirmation before updating your schedule.
        </p>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button id="scan-sample-rx-btn" class="btn btn-primary" style="flex: 1; min-width: 220px;">
            📄 Analyze Dr. Mehta's New Prescription
          </button>
          <button id="record-audio-rx-btn" class="btn btn-secondary" style="flex: 1; min-width: 220px;">
            🎙️ Record Doctor Instructions
          </button>
        </div>
      </div>

      <!-- Existing Stored Documents List -->
      <h3 style="font-size: var(--font-h3); font-weight: 800; margin: 32px 0 16px 0;">Stored Medical Documents</h3>
      <div style="display: flex; flex-direction: column; gap: 20px;">
        ${docs.map(d => `
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 28px;">${d.doc_type === 'prescription' ? '💊' : '🧪'}</span>
                  <h4 style="font-size: 22px; font-weight: 800;">${d.title}</h4>
                  <span class="badge badge-normal">${d.doc_type.toUpperCase()}</span>
                </div>
                <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                  Date: <strong>${d.uploaded_date}</strong> • Source: <strong>${d.source}</strong> • Clinician: <strong>${d.doctor_name || "Care Team"}</strong>
                </p>
              </div>
              <button class="btn btn-secondary read-doc-btn" data-text="${d.summary}">
                🔊 Read Summary
              </button>
            </div>

            <!-- Plain Language AI Explanation -->
            <div style="background: var(--bg-surface); padding: 14px; border-radius: 10px; margin-top: 8px;">
              <h5 style="font-size: 15px; font-weight: 700; color: var(--text-secondary); margin-bottom: 4px;">Plain-Language Summary:</h5>
              <p style="font-size: 16px; color: var(--text-main); line-height: 1.5;">
                ${d.summary}
              </p>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Event listeners
    document.getElementById("upload-rx-hero-btn")?.addEventListener("click", () => {
      document.getElementById("scan-sample-rx-btn").click();
    });

    document.getElementById("scan-sample-rx-btn")?.addEventListener("click", async () => {
      openPrescriptionExtractionModal(() => renderDocuments(container, onNavigate));
    });

    document.getElementById("record-audio-rx-btn")?.addEventListener("click", () => {
      solyaSpeech.startListening((transcript) => {
        alert(`Doctor instruction captured: "${transcript}". Converting to structured prescription...`);
        openPrescriptionExtractionModal(() => renderDocuments(container, onNavigate));
      });
    });

    container.querySelectorAll(".read-doc-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-text");
        solyaSpeech.speak(text);
      });
    });

  } catch (err) {
    container.innerHTML = `<div class="card"><p>Failed to load documents: ${err.message}</p></div>`;
  }
}

// Modal for Prescription Extraction & Dosage Diff Confirmation (Journey 1)
async function openPrescriptionExtractionModal(onSuccess) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-card">
      <div style="text-align: center; padding: 20px;">
        <span style="font-size: 32px;">🔍</span>
        <p style="font-size: 18px; font-weight: 700; margin-top: 10px;">AI Extracting Prescription Data...</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  try {
    const rxData = await api.uploadPrescription();
    const extracted = rxData.extracted;
    const changes = rxData.detected_changes || [];

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 700px;">
        <div class="card-header">
          <h3 style="font-size: 24px; font-weight: 800; color: #0F172A;">
            📄 Review Extracted Prescription
          </h3>
          <span class="badge badge-normal">Verified OCR</span>
        </div>

        <div style="background: var(--bg-surface); padding: 14px; border-radius: 10px; margin-bottom: 18px; font-size: 15px;">
          <p><strong>Doctor:</strong> ${extracted.doctor}</p>
          <p><strong>Clinic:</strong> ${extracted.clinic}</p>
          <p><strong>Date:</strong> ${extracted.date}</p>
          <p><strong>Patient:</strong> ${extracted.patient_name}</p>
        </div>

        <!-- Detected Dosage Change Callout -->
        ${changes.length > 0 ? `
          <div style="background: #FFFBEB; border: 2px solid #FCD34D; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <h4 style="font-size: 18px; font-weight: 800; color: #92400E; margin-bottom: 8px;">
              ⚠️ Medication Dosage Change Detected
            </h4>
            <p style="font-size: 15px; color: #78350F; margin-bottom: 12px;">
              Solya detected a change between your current active schedule and this prescription. Please review carefully before confirming:
            </p>

            <table class="diff-table">
              <thead>
                <tr>
                  <th>Medication</th>
                  <th>Current Value</th>
                  <th>New Prescribed Value</th>
                </tr>
              </thead>
              <tbody>
                ${changes.map(ch => `
                  <tr>
                    <td><strong>${ch.medication_name}</strong></td>
                    <td class="diff-old">${ch.previous_value}</td>
                    <td class="diff-new">${ch.new_value}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <p style="font-size: 13px; color: #92400E; font-style: italic;">
              Source: ${changes[0].source}
            </p>
          </div>
        ` : `
          <div class="badge badge-normal" style="margin-bottom: 16px;">No dosage modifications detected.</div>
        `}

        <div style="display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap;">
          <button id="rx-cancel-btn" class="btn btn-secondary">
            Cancel
          </button>
          <button id="rx-confirm-btn" class="btn btn-safe">
            ✓ Confirm Update & Update Health Record
          </button>
        </div>
      </div>
    `;

    modal.querySelector("#rx-cancel-btn").addEventListener("click", () => modal.remove());

    modal.querySelector("#rx-confirm-btn").addEventListener("click", async () => {
      try {
        const updateRes = await api.confirmPrescriptionUpdate();
        alert(`✅ SUCCESS!\n${updateRes.message}\n\n• Medication list updated to 10 mg\n• Reminders refreshed\n• Timeline event recorded\n• Family notified`);
        solyaSpeech.speak("Your prescription has been confirmed and your health record is updated.");
        modal.remove();
        if (onSuccess) onSuccess();
      } catch (err) {
        alert("Error confirming update: " + err.message);
      }
    });

  } catch (err) {
    modal.innerHTML = `
      <div class="modal-card">
        <p>Failed to analyze prescription: ${err.message}</p>
        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Close</button>
      </div>
    `;
  }
}
