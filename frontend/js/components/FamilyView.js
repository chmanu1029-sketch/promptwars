// SOLYA Family Connectivity Component
// Family cards, Daily Check-In, Safety Check, Camera check consent, and Video Call triggers

async function renderFamily(container, onNavigate) {
  container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading family connections...</div></div>`;

  try {
    const [familyData, checkInData] = await Promise.all([
      api.getFamily(),
      api.getTodayCheckIn()
    ]);

    const members = familyData.family_members || [];
    const contacts = familyData.emergency_contacts || [];
    const chk = checkInData.check_in || {};
    const isSafe = chk.status === 'safe';

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: var(--font-h1); font-weight: 800;">${t('navFamily')}</h2>
          <p style="font-size: var(--font-base); color: var(--text-secondary);">
            Your loved ones are always connected with love, peace of mind, and mutual consent.
          </p>
        </div>
        <button id="read-family-btn" class="btn btn-secondary">
          🔊 ${t('btnReadAloud')}
        </button>
      </div>

      <!-- Daily Family Check-In Banner -->
      <div class="card" style="border-left: 8px solid ${isSafe ? 'var(--safe-green)' : 'var(--brand-primary)'}; background: #FFFFFF;">
        <div class="card-header">
          <div class="card-title">
            <span>🟢</span>
            <span>${t('familySafetyCheck')}</span>
          </div>
          <span class="badge ${isSafe ? 'badge-normal' : 'badge-attention'}">
            ${isSafe ? "Safe Confirmed Today" : "Awaiting Daily Confirmation"}
          </span>
        </div>
        <p style="font-size: 18px; color: var(--text-main); margin-bottom: 16px;">
          ${isSafe ? `✅ Your family was informed at ${chk.time_stamp ? chk.time_stamp.split(' ')[1] : '8:15 AM'} that you are feeling well.` : "Let Priya and Amit know you are doing well today with a single tap."}
        </p>

        <div style="display: flex; gap: 14px; flex-wrap: wrap;">
          <button id="family-im-ok-btn" class="btn btn-safe" style="flex: 1; min-width: 180px;">
            🟢 ${t('btnImOk')}
          </button>
          <button id="family-call-priya-btn" class="btn btn-secondary" style="flex: 1; min-width: 180px;">
            📞 Call Priya (+91 98765 43211)
          </button>
        </div>
      </div>

      <!-- Family Members Cards Grid -->
      <h3 style="font-size: var(--font-h3); font-weight: 800; margin: 28px 0 16px 0;">Your Authorized Family Network</h3>
      <div class="grid-2">
        ${members.map(m => `
          <div class="card">
            <div style="display: flex; gap: 16px; align-items: center; margin-bottom: 16px;">
              <div style="font-size: 48px; background: var(--bg-surface); width: 68px; height: 68px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                ${m.avatar || '👤'}
              </div>
              <div>
                <h4 style="font-size: 22px; font-weight: 800;">${m.name}</h4>
                <p style="font-size: 16px; color: var(--text-secondary);">${m.relationship}</p>
                <p style="font-size: 14px; font-weight: 600; color: var(--brand-primary);">${m.phone}</p>
              </div>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-primary video-call-btn" data-name="${m.name}" style="flex: 1; min-width: 140px;">
                📹 ${t('btnVideoCall')}
              </button>
              <button class="btn btn-secondary phone-call-btn" data-name="${m.name}" data-phone="${m.phone}" style="flex: 1; min-width: 140px;">
                📞 ${t('btnCall')}
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Safety Check / Consented Camera Request Simulation -->
      <div class="card" style="border: 2px dashed var(--brand-primary); background: #F0F9FF; margin-top: 16px;">
        <div class="card-header">
          <h4 style="font-size: 20px; font-weight: 800; color: var(--brand-primary);">
            🛡️ Consented Safety View Check
          </h4>
          <span class="badge badge-normal">Privacy Protected</span>
        </div>
        <p style="font-size: 16px; color: var(--text-main); margin-bottom: 14px;">
          Family members can <strong>never</strong> secretly open your camera. If Priya requests a safety check, you receive a clear confirmation prompt and can stop it anytime.
        </p>
        <button id="simulate-camera-request-btn" class="btn btn-secondary">
          Simulate "Priya Requests Safety Check" Prompt
        </button>
      </div>

      <!-- Emergency Escalation Contacts List -->
      <h3 style="font-size: var(--font-h3); font-weight: 800; margin: 32px 0 16px 0;">Emergency Contacts Cascade</h3>
      <div class="card">
        <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 16px;">
          When you press 🚨 "I NEED HELP", Solya alerts contacts in this exact priority order:
        </p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${contacts.map(c => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-surface); border-radius: 10px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span class="badge badge-normal" style="font-size: 14px;">Priority #${c.priority_order}</span>
                <div>
                  <strong>${c.name}</strong> (${c.relationship})
                  <div style="font-size: 13px; color: var(--text-secondary);">${c.phone}</div>
                </div>
              </div>
              <span style="font-size: 14px; color: var(--safe-green); font-weight: 600;">✓ Instant Alert Ready</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById("family-im-ok-btn")?.addEventListener("click", async () => {
      await api.submitCheckIn('safe', "Confirmed safe via family screen");
      alert("🟢 Your family has been notified that you're safe!");
      renderFamily(container, onNavigate);
    });

    document.getElementById("family-call-priya-btn")?.addEventListener("click", () => {
      alert("📞 Demo Mode: Calling Priya Sharma at +91 98765 43211...");
    });

    container.querySelectorAll(".phone-call-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-name");
        const phone = btn.getAttribute("data-phone");
        alert(`📞 Demo Mode: Starting phone call to ${name} (${phone}).`);
      });
    });

    container.querySelectorAll(".video-call-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const name = btn.getAttribute("data-name");
        window.dispatchEvent(new CustomEvent("startVideoCall", { detail: { targetName: name } }));
      });
    });

    document.getElementById("read-family-btn")?.addEventListener("click", () => {
      solyaSpeech.speak("You have 3 connected family members. Your daughter Priya is your primary contact. You can tap Call or Video Call anytime.");
    });

    document.getElementById("simulate-camera-request-btn")?.addEventListener("click", () => {
      openCameraConsentModal();
    });

  } catch (err) {
    container.innerHTML = `<div class="card"><p>Failed to load family: ${err.message}</p></div>`;
  }
}

function openCameraConsentModal() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-card" style="text-align: center;">
      <div style="font-size: 48px; margin-bottom: 12px;">👨‍👩‍👧</div>
      <h3 style="font-size: 24px; font-weight: 800; margin-bottom: 10px;">Safety Check Request</h3>
      <p style="font-size: 18px; color: var(--text-main); margin-bottom: 24px;">
        <strong>Priya</strong> wants to check if you are okay right now. Would you like to share a brief video view with her?
      </p>

      <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
        <button id="consent-allow-btn" class="btn btn-safe" style="flex: 1; min-width: 160px;">
          ALLOW CAMERA
        </button>
        <button id="consent-reject-btn" class="btn btn-secondary" style="flex: 1; min-width: 160px;">
          NOT NOW
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#consent-reject-btn").addEventListener("click", () => modal.remove());

  modal.querySelector("#consent-allow-btn").addEventListener("click", () => {
    modal.remove();
    window.dispatchEvent(new CustomEvent("startVideoCall", { detail: { targetName: "Priya Sharma (Safety Check Active)" } }));
  });
}
