// SOLYA Appointments & Doctors View
// Doctor cards, scheduled consultations, emergency doctor access, and directions

async function renderAppointments(container, onNavigate) {
  container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading appointments & doctors...</div></div>`;

  try {
    const [apptsData, docsData] = await Promise.all([
      api.getAppointments(),
      api.getDoctors()
    ]);

    const appts = apptsData.appointments || [];
    const docs = docsData.doctors || [];
    const emDoc = docsData.emergency_doctor || docs[0];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: var(--font-h1); font-weight: 800;">${t('navAppointments')} & Doctors</h2>
          <p style="font-size: var(--font-base); color: var(--text-secondary);">
            Upcoming hospital consultations and direct connections with your healthcare team.
          </p>
        </div>
        <button id="book-appt-btn" class="btn btn-primary">
          + Schedule New Appointment
        </button>
      </div>

      <!-- Emergency Doctor Card -->
      <div class="card" style="background: linear-gradient(135deg, #FEF2F2 0%, #FFF1F2 100%); border: 2px solid #FECACA; margin-bottom: 28px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="font-size: 40px;">🩺</div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 style="font-size: 22px; font-weight: 800; color: #991B1B;">Emergency On-Call Doctor</h3>
                <span class="badge badge-normal">Available Now</span>
              </div>
              <p style="font-size: 16px; color: #7F1D1D; margin-top: 4px;">
                ${emDoc.name} • ${emDoc.specialty} (${emDoc.hospital_name})
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <button id="call-em-doc-btn" class="btn btn-urgent" style="min-height: 48px;">
              📞 CALL DOCTOR
            </button>
            <button id="alert-em-doc-btn" class="btn btn-secondary" style="min-height: 48px; border-color: #FECACA;">
              🚨 ALERT DOCTOR
            </button>
          </div>
        </div>
      </div>

      <!-- Upcoming Appointments List -->
      <h3 style="font-size: var(--font-h3); font-weight: 800; margin-bottom: 16px;">Scheduled Consultations</h3>
      <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 32px;">
        ${appts.length === 0 ? `
          <div class="card" style="text-align: center; padding: 40px;">
            <p>No upcoming doctor appointments scheduled.</p>
          </div>
        ` : appts.map(a => `
          <div class="card" style="border-left: 8px solid var(--brand-primary);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 26px;">👨‍⚕️</span>
                  <h4 style="font-size: 24px; font-weight: 800; color: #0F172A;">${a.doctor_name}</h4>
                  <span class="badge badge-normal">${a.specialty}</span>
                </div>
                <p style="font-size: 18px; font-weight: 700; color: var(--brand-primary); margin: 6px 0;">
                  📅 ${a.appointment_date} at ${a.appointment_time}
                </p>
                <p style="font-size: 16px; color: var(--text-main);">
                  <strong>Hospital:</strong> ${a.hospital_name}
                </p>
                <p style="font-size: 15px; color: var(--text-muted); margin-top: 4px;">
                  <strong>Purpose:</strong> ${a.purpose}
                </p>
                ${a.prep_instructions ? `
                  <div style="background: var(--bg-surface); padding: 10px 14px; border-radius: 8px; margin-top: 8px; font-size: 14px;">
                    📝 <strong>Preparation:</strong> ${a.prep_instructions}
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Action Buttons for Appointment -->
            <div style="display: flex; gap: 10px; flex-wrap: wrap; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
              <button class="btn btn-primary appt-call-doc-btn" data-doc="${a.doctor_name}">
                📞 Call Doctor
              </button>
              <button class="btn btn-secondary appt-directions-btn" data-hosp="${a.hospital_name}">
                📍 Directions
              </button>
              <button class="btn btn-secondary appt-notify-family-btn">
                👨‍👩‍👧 Notify Family
              </button>
              <button class="btn btn-secondary appt-reminder-btn" data-time="${a.appointment_time}">
                🔔 Set Reminder
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- My Doctors Directory -->
      <h3 style="font-size: var(--font-h3); font-weight: 800; margin-bottom: 16px;">My Connected Doctors</h3>
      <div class="grid-2">
        ${docs.map(d => `
          <div class="card">
            <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 14px;">
              <div style="font-size: 44px; width: 64px; height: 64px; border-radius: 50%; background: var(--bg-surface); display: flex; align-items: center; justify-content: center;">
                ${d.avatar || '👨‍⚕️'}
              </div>
              <div>
                <h4 style="font-size: 20px; font-weight: 800;">${d.name}</h4>
                <p style="font-size: 15px; color: var(--brand-primary); font-weight: 600;">${d.specialty}</p>
                <p style="font-size: 14px; color: var(--text-secondary);">${d.hospital_name}</p>
              </div>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-primary appt-call-doc-btn" data-doc="${d.name}" style="flex: 1;">
                📞 Call
              </button>
              <button class="btn btn-secondary" onclick="window.dispatchEvent(new CustomEvent('startVideoCall', {detail: {targetName: '${d.name}'}}))" style="flex: 1;">
                📹 Video Consult
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Event listeners
    document.getElementById("call-em-doc-btn")?.addEventListener("click", () => {
      alert(`📞 Demo Mode: Calling emergency doctor ${emDoc.name} at ${emDoc.phone}...`);
    });

    document.getElementById("alert-em-doc-btn")?.addEventListener("click", () => {
      alert(`🚨 Demo Mode: High-priority clinical alert dispatched to ${emDoc.name} with Rajesh Sharma's vitals.`);
    });

    container.querySelectorAll(".appt-call-doc-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const doc = btn.getAttribute("data-doc");
        alert(`📞 Demo Mode: Calling ${doc} clinic office...`);
      });
    });

    container.querySelectorAll(".appt-directions-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const hosp = btn.getAttribute("data-hosp");
        alert(`📍 Directions to ${hosp}: Near Sony World Signal, 100 Feet Road, Koramangala. 2.4 km away.`);
      });
    });

    container.querySelectorAll(".appt-notify-family-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        alert("👨‍👩‍👧 Priya and Amit have been notified of this consultation schedule.");
      });
    });

    container.querySelectorAll(".appt-reminder-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        alert("🔔 Voice reminder scheduled 2 hours before your appointment.");
      });
    });

    document.getElementById("book-appt-btn")?.addEventListener("click", () => {
      openScheduleAppointmentModal(() => renderAppointments(container, onNavigate));
    });

  } catch (err) {
    container.innerHTML = `<div class="card"><p>Failed to load appointments: ${err.message}</p></div>`;
  }
}

function openScheduleAppointmentModal(onSuccess) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-card">
      <h3 style="font-size: 24px; font-weight: 800; margin-bottom: 16px;">Schedule Doctor Consultation</h3>
      <form id="schedule-appt-form">
        <div style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Select Doctor</label>
          <select id="modal-appt-doc" class="role-switcher-select" style="width: 100%; height: 48px;">
            <option value="doc_1|Dr. Ananya Mehta|Cardiologist">Dr. Ananya Mehta (Cardiologist)</option>
            <option value="doc_2|Dr. K. S. Venkatesh|Orthopedic Surgeon">Dr. K. S. Venkatesh (Orthopedic Surgeon)</option>
            <option value="doc_3|Dr. Ritu Saxena|Endocrinologist">Dr. Ritu Saxena (Endocrinologist)</option>
          </select>
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Date</label>
          <input type="date" id="modal-appt-date" class="role-switcher-select" style="width: 100%; height: 48px;" required />
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Time</label>
          <input type="time" id="modal-appt-time" class="role-switcher-select" style="width: 100%; height: 48px;" value="10:30" required />
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 600; margin-bottom: 6px;">Purpose of Consultation</label>
          <input type="text" id="modal-appt-purpose" class="role-switcher-select" style="width: 100%; height: 48px;" placeholder="e.g. Blood pressure and routine review" required />
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary" id="modal-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn-primary">Confirm Appointment</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);
  // Default to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  modal.querySelector("#modal-appt-date").value = tomorrow.toISOString().split('T')[0];

  modal.querySelector("#modal-cancel-btn").addEventListener("click", () => modal.remove());

  modal.querySelector("#schedule-appt-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const docParts = modal.querySelector("#modal-appt-doc").value.split('|');
    const docId = docParts[0];
    const docName = docParts[1];
    const spec = docParts[2];
    const date = modal.querySelector("#modal-appt-date").value;
    const time = modal.querySelector("#modal-appt-time").value;
    const purpose = modal.querySelector("#modal-appt-purpose").value;

    try {
      await api.createAppointment({
        doctor_id: docId,
        doctor_name: docName,
        specialty: spec,
        hospital_name: "CityCare Hospital",
        date: date,
        time: time,
        purpose: purpose
      });
      alert(`Appointment scheduled with ${docName} on ${date}!`);
      modal.remove();
      if (onSuccess) onSuccess();
    } catch (err) {
      alert("Error scheduling appointment: " + err.message);
    }
  });
}
