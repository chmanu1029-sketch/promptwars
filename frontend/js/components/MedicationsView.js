// SOLYA Medications Management View
// Senior-friendly cards, clear large buttons, mark taken/skipped, add medication, voice reading

async function renderMedications(container, onNavigate) {
  container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading medicines...</div></div>`;

  try {
    const data = await api.getMedications();
    const meds = data.medications || [];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: var(--font-h1); font-weight: 800;">${t('navMedicines')}</h2>
          <p style="font-size: var(--font-base); color: var(--text-secondary);">
            Today is ${data.today}. Simple reminders to keep your health on track.
          </p>
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="add-med-btn" class="btn btn-primary">
            + Add Medicine
          </button>
          <button id="read-meds-btn" class="btn btn-secondary">
            🔊 ${t('btnReadAloud')}
          </button>
        </div>
      </div>

      <!-- Schedule Cards List -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        ${meds.length === 0 ? `
          <div class="card" style="text-align: center; padding: 40px;">
            <p>No active medications scheduled.</p>
          </div>
        ` : meds.map(m => {
          const isTaken = m.today_status === 'taken';
          const isSkipped = m.today_status === 'skipped';
          const isPending = !isTaken && !isSkipped;

          return `
            <div class="card" style="border-left: 8px solid ${isTaken ? 'var(--safe-green)' : (isSkipped ? 'var(--text-secondary)' : 'var(--brand-primary)')};">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                    <span style="font-size: 24px;">💊</span>
                    <h3 style="font-size: 24px; font-weight: 800; color: #0F172A;">${m.name} ${m.dosage}</h3>
                    <span class="badge ${isTaken ? 'badge-normal' : (isSkipped ? 'badge-attention' : 'badge-attention')}">
                      ${isTaken ? '🟢 TAKEN' : (isSkipped ? '⚪ SKIPPED' : '🟡 DUE TODAY')}
                    </span>
                  </div>
                  <p style="font-size: 16px; font-weight: 600; color: var(--brand-primary); margin-bottom: 6px;">
                    ⏰ Scheduled: ${m.scheduled_time} (${m.frequency})
                  </p>
                  <p style="font-size: 16px; color: var(--text-muted); margin-bottom: 6px;">
                    <strong>Instructions:</strong> ${m.instructions || "Take with water after food."}
                  </p>
                  <p style="font-size: 14px; color: var(--text-secondary);">
                    <strong>Purpose:</strong> ${m.purpose || "Prescribed by physician"} • <em>${m.source || "Prescription record"}</em>
                  </p>
                </div>

                <!-- Action Buttons for Senior -->
                <div style="display: flex; flex-direction: column; gap: 10px; min-width: 180px;">
                  ${isTaken ? `
                    <button class="btn btn-safe" style="cursor: default;" disabled>
                      ✓ Completed
                    </button>
                    <button class="btn btn-secondary med-undo-btn" data-id="${m.id}" style="font-size: 14px; min-height: 40px;">
                      Change Status
                    </button>
                  ` : `
                    <button class="btn btn-safe med-take-btn" data-id="${m.id}">
                      🟢 ${t('btnTakeNow')}
                    </button>
                    <button class="btn btn-secondary med-skip-btn" data-id="${m.id}">
                      ⚪ Mark Skipped
                    </button>
                    <button class="btn btn-secondary med-remind-btn" data-name="${m.name}" data-time="${m.scheduled_time}">
                      🔔 ${t('btnRemindMe')}
                    </button>
                  `}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Missed Medicine Safety Note -->
      <div class="card" style="margin-top: 24px; background: #F8FAFC; border: 1px dashed var(--border-subtle);">
        <h4 style="font-size: 18px; font-weight: 700; margin-bottom: 6px;">🛡️ Safe Medication Habits</h4>
        <p style="font-size: 15px; color: var(--text-secondary);">
          If you accidentally miss a morning tablet, do not double the next dose. Take it when you remember, or consult Dr. Mehta if you are unsure. One missed tablet is not an emergency.
        </p>
      </div>
    `;

    // Button event listeners
    container.querySelectorAll(".med-take-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await api.updateMedicationStatus(id, 'taken');
        renderMedications(container, onNavigate);
      });
    });

    container.querySelectorAll(".med-skip-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (confirm("Mark this medicine as skipped for today?")) {
          const id = btn.getAttribute("data-id");
          await api.updateMedicationStatus(id, 'skipped');
          renderMedications(container, onNavigate);
        }
      });
    });

    container.querySelectorAll(".med-undo-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await api.updateMedicationStatus(id, 'pending');
        renderMedications(container, onNavigate);
      });
    });

    container.querySelectorAll(".med-remind-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-name");
        const time = btn.getAttribute("data-time");
        alert(`🔔 Solya Reminder set for ${name} at ${time}. We will speak a reminder gently on this device.`);
      });
    });

    document.getElementById("read-meds-btn")?.addEventListener("click", () => {
      const pendingNames = meds.filter(m => m.today_status !== 'taken').map(m => `${m.name} at ${m.scheduled_time}`).join(", ");
      const text = pendingNames.length > 0 ? 
        `You have medicines scheduled: ${pendingNames}. Please remember to take them with a glass of water.` :
        "Great news, Rajesh! You have taken all your scheduled medicines for today.";
      solyaSpeech.speak(text);
    });

    document.getElementById("add-med-btn")?.addEventListener("click", () => {
      openAddMedicationModal(() => renderMedications(container, onNavigate));
    });

  } catch (err) {
    container.innerHTML = `<div class="card"><p>Failed to load medicines: ${err.message}</p></div>`;
  }
}

function openAddMedicationModal(onSuccess) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-card">
      <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Add New Medication</h3>
      <form id="add-med-form">
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Medicine Name</label>
          <input type="text" id="modal-med-name" class="role-switcher-select" style="width: 100%; height: 48px;" placeholder="e.g. Telmisartan" required />
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Dosage</label>
          <input type="text" id="modal-med-dosage" class="role-switcher-select" style="width: 100%; height: 48px;" placeholder="e.g. 40 mg" required />
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Frequency & Time</label>
          <div style="display: flex; gap: 10px;">
            <select id="modal-med-timing" class="role-switcher-select" style="flex: 1; height: 48px;">
              <option value="morning">Morning (08:00 AM)</option>
              <option value="afternoon">Afternoon (01:00 PM)</option>
              <option value="night">Night (08:00 PM)</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Instructions</label>
          <input type="text" id="modal-med-instructions" class="role-switcher-select" style="width: 100%; height: 48px;" placeholder="e.g. Take after breakfast" />
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Medicine</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#modal-cancel-btn").addEventListener("click", () => modal.remove());

  modal.querySelector("#add-med-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = modal.querySelector("#modal-med-name").value;
    const dosage = modal.querySelector("#modal-med-dosage").value;
    const timing = modal.querySelector("#modal-med-timing").value;
    const instructions = modal.querySelector("#modal-med-instructions").value;

    const timeMap = { morning: "08:00 AM", afternoon: "01:00 PM", night: "08:00 PM" };

    try {
      await api.addMedication({
        name,
        dosage,
        frequency: "Once daily",
        timing_tag: timing,
        scheduled_time: timeMap[timing] || "08:00 AM",
        instructions,
        source: "Manual entry by senior/family"
      });
      alert(`Medication ${name} added!`);
      modal.remove();
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Error adding medication: " + err.message);
    }
  });
}
