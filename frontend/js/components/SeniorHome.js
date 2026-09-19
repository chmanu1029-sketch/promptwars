// SOLYA Senior Home Dashboard
// Ultra-Premium Minimalist Senior Experience: Calm, High Contrast, Clear Hierarchy, No Visual Noise

async function renderSeniorHome(container, onNavigate) {
  container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading Solya...</div></div>`;

  try {
    const [briefing, medsData, apptsData, checkInData, healthData] = await Promise.all([
      api.getDailyBriefing(),
      api.getMedications(),
      api.getAppointments(),
      api.getTodayCheckIn(),
      api.getHealthSummary()
    ]);

    const activeMeds = medsData.medications || [];
    const pendingMeds = activeMeds.filter(m => m.today_status !== 'taken');
    const firstAppt = (apptsData.appointments && apptsData.appointments[0]) || null;
    const isSafe = checkInData.check_in && checkInData.check_in.status === 'safe';

    container.innerHTML = `
      <!-- Greeting & Daily Briefing Banner (Minimal Luxury) -->
      <div class="card" style="border-left: 6px solid var(--brand-primary); background: #FFFFFF;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="badge badge-normal" style="font-size: 13px;">${t('dailyBriefingTitle')}</span>
              <span style="font-size: 14px; color: var(--text-secondary);">• Today's Overview</span>
            </div>
            <h2 style="font-size: var(--font-h1); font-weight: 800; color: var(--text-main); margin-bottom: 6px;">
              ${briefing.greeting || "Good morning, Rajesh"}
            </h2>
            <p style="font-size: var(--font-base); color: var(--text-muted);">
              Everything is calm, connected, and on schedule.
            </p>
          </div>
          <button id="home-read-briefing-btn" class="btn btn-secondary" style="min-height: 44px; padding: 8px 16px;">
            🔊 <span>${t('btnReadAloud')}</span>
          </button>
        </div>

        <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border-subtle); display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
          ${(briefing.summary_points || []).map(pt => `
            <div style="display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 16px; color: var(--text-main);">
              <span style="color: var(--safe-green); font-size: 18px;">✓</span>
              <span>${pt}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Hero Emergency Beacon Section (Minimalist & Crisp) -->
      <div class="hero-emergency-container">
        <button id="hero-emergency-btn" class="btn btn-hero-emergency">
          🚨 ${t('btnHelp')}
        </button>
        <p style="font-size: 14px; color: var(--text-secondary); margin-top: 10px; font-weight: 500;">
          Tap once for immediate family alert, ambulance assistance & location sharing.
        </p>
      </div>

      <!-- Large "Talk to Solya" Assistant Button -->
      <div style="margin-bottom: 24px;">
        <button id="hero-solya-talk-btn" class="btn hero-solya-btn">
          🎙️ ${t('btnTalkToSolya')}
        </button>
      </div>

      <!-- Daily Family Safety Check-In -->
      <div class="card" style="border-left: 6px solid ${isSafe ? 'var(--safe-green)' : 'var(--brand-primary)'};">
        <div class="card-header">
          <div class="card-title">
            <span>👨‍👩‍👧</span>
            <span>${t('familySafetyCheck')}</span>
          </div>
          <span class="badge ${isSafe ? 'badge-normal' : 'badge-attention'}">
            ${isSafe ? '🟢 Safe Confirmed Today' : '🟡 Check-in Pending'}
          </span>
        </div>
        <p style="font-size: var(--font-base); color: var(--text-muted); margin-bottom: 18px;">
          ${isSafe ? "Your family knows you are safe. Last confirmed at 08:15 AM." : "Let Priya know that you are feeling well today with one gentle tap."}
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button id="checkin-im-ok-btn" class="btn btn-safe" style="flex: 1; min-width: 180px;">
            🟢 ${t('btnImOk')}
          </button>
          <button id="checkin-call-family-btn" class="btn btn-secondary" style="flex: 1; min-width: 180px;">
            📞 ${t('btnCallFamily')}
          </button>
        </div>
      </div>

      <!-- Primary Care Grid: Today's Priorities -->
      <div class="grid-2" style="margin-bottom: 28px;">
        <!-- Medicines Card -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>💊</span>
              <span>${t('navMedicines')}</span>
            </div>
            <span class="badge ${pendingMeds.length > 0 ? 'badge-attention' : 'badge-normal'}">
              ${activeMeds.length} Prescribed
            </span>
          </div>
          <p style="font-size: var(--font-base); color: var(--text-muted); margin-bottom: 16px;">
            ${pendingMeds.length > 0 ? `Next: <strong>${pendingMeds[0].name} (${pendingMeds[0].dosage})</strong> at ${pendingMeds[0].scheduled_time}` : "All medications taken for today!"}
          </p>
          <button class="btn btn-primary" style="width: 100%;" id="view-medicines-btn">
            View Today's Medicines
          </button>
        </div>

        <!-- Appointment Card -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>👨‍⚕️</span>
              <span>${t('navAppointments')}</span>
            </div>
            <span class="badge badge-normal">Scheduled</span>
          </div>
          <p style="font-size: var(--font-base); color: var(--text-muted); margin-bottom: 16px;">
            ${firstAppt ? `<strong>${firstAppt.doctor_name}</strong> • ${firstAppt.appointment_time} (${firstAppt.hospital_name})` : "No hospital visits scheduled today"}
          </p>
          <button class="btn btn-primary" style="width: 100%;" id="view-appointment-btn">
            View Doctor Appointment
          </button>
        </div>

        <!-- Health Readings Card -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>❤️</span>
              <span>${t('navHealth')}</span>
            </div>
            <span class="badge badge-normal">Stable</span>
          </div>
          <p style="font-size: var(--font-base); color: var(--text-muted); margin-bottom: 16px;">
            BP: <strong>128/82 mmHg</strong> • Pulse: <strong>72 bpm</strong> • SpO2: <strong>98%</strong>
          </p>
          <button class="btn btn-secondary" style="width: 100%;" id="view-health-btn">
            Open Health Center
          </button>
        </div>

        <!-- Family Card -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <span>👨‍👩‍👧</span>
              <span>${t('navFamily')}</span>
            </div>
            <span class="badge badge-normal">Connected</span>
          </div>
          <p style="font-size: var(--font-base); color: var(--text-muted); margin-bottom: 16px;">
            Priya Sharma (Daughter, Bengaluru) & Amit Sharma (Son, Mumbai)
          </p>
          <button class="btn btn-secondary" style="width: 100%;" id="view-family-btn">
            Connect With Family
          </button>
        </div>
      </div>

      <!-- All Main Features Directly Accessible On Home -->
      <div style="margin-top: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: var(--font-h3); font-weight: 800; color: var(--text-main);">All Health & Safety Features</h3>
          <span style="font-size: 14px; color: var(--text-secondary);">Direct 1-Tap Access</span>
        </div>

        <div class="grid-3">
          <div class="card" style="cursor: pointer; padding: 20px;" id="quick-care-btn">
            <div style="font-size: 28px; margin-bottom: 8px;">📋</div>
            <h4 style="font-size: 18px; font-weight: 700;">Condition Care Plans</h4>
            <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">13 personalized plans: Joint, BP, Heart, Diabetes & Memory.</p>
          </div>

          <div class="card" style="cursor: pointer; padding: 20px;" id="quick-rx-btn">
            <div style="font-size: 28px; margin-bottom: 8px;">📄</div>
            <h4 style="font-size: 18px; font-weight: 700;">Prescriptions & Lab Reports</h4>
            <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">Smart upload extracts dosage changes with confirmation.</p>
          </div>

          <div class="card" style="cursor: pointer; padding: 20px;" id="quick-timeline-btn">
            <div style="font-size: 28px; margin-bottom: 8px;">⏳</div>
            <h4 style="font-size: 18px; font-weight: 700;">Health Timeline</h4>
            <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">Chronological history of doctor visits, tests, and medicines.</p>
          </div>

          <div class="card" style="cursor: pointer; padding: 20px;" id="quick-devices-btn">
            <div style="font-size: 28px; margin-bottom: 8px;">⌚</div>
            <h4 style="font-size: 18px; font-weight: 700;">Connected Devices</h4>
            <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">Smartwatch, BP monitor, Apple Health & Google Health sync.</p>
          </div>

          <div class="card" style="cursor: pointer; padding: 20px;" id="quick-scam-btn">
            <div style="font-size: 28px; margin-bottom: 8px;">🛡️</div>
            <h4 style="font-size: 18px; font-weight: 700;">Scam Shield</h4>
            <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">Paste suspicious bank messages before tapping any link.</p>
          </div>

          <div class="card" style="cursor: pointer; padding: 20px;" id="quick-tutor-btn">
            <div style="font-size: 28px; margin-bottom: 8px;">📱</div>
            <h4 style="font-size: 18px; font-weight: 700;">Show Me How</h4>
            <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">Step-by-step guides for sending WhatsApp photos & video calls.</p>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById("hero-emergency-btn")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("openEmergency")));
    document.getElementById("hero-solya-talk-btn")?.addEventListener("click", () => onNavigate("assistant"));
    document.getElementById("home-read-briefing-btn")?.addEventListener("click", () => {
      solyaSpeech.speak(briefing.read_aloud_text || "Good morning Rajesh. Have a peaceful day.");
    });

    document.getElementById("checkin-im-ok-btn")?.addEventListener("click", async () => {
      try {
        await api.submitCheckIn('safe', "Confirmed safe from home dashboard");
        alert("🟢 Your family has been notified that you're safe!");
        renderSeniorHome(container, onNavigate);
      } catch (err) {
        alert("Could not update check-in: " + err.message);
      }
    });

    document.getElementById("checkin-call-family-btn")?.addEventListener("click", () => onNavigate("family"));
    document.getElementById("view-medicines-btn")?.addEventListener("click", () => onNavigate("medicines"));
    document.getElementById("view-appointment-btn")?.addEventListener("click", () => onNavigate("appointments"));
    document.getElementById("view-health-btn")?.addEventListener("click", () => onNavigate("health"));
    document.getElementById("view-family-btn")?.addEventListener("click", () => onNavigate("family"));

    document.getElementById("quick-care-btn")?.addEventListener("click", () => onNavigate("care"));
    document.getElementById("quick-rx-btn")?.addEventListener("click", () => onNavigate("documents"));
    document.getElementById("quick-timeline-btn")?.addEventListener("click", () => onNavigate("timeline"));
    document.getElementById("quick-devices-btn")?.addEventListener("click", () => onNavigate("devices"));
    document.getElementById("quick-scam-btn")?.addEventListener("click", () => onNavigate("scam"));
    document.getElementById("quick-tutor-btn")?.addEventListener("click", () => onNavigate("tutor"));

  } catch (err) {
    container.innerHTML = `
      <div class="card" style="text-align: center; padding: 40px;">
        <h3 style="color: var(--emergency-red);">Something went wrong</h3>
        <p style="margin: 12px 0;">${err.message}</p>
        <button class="btn btn-primary" onclick="renderSeniorHome(document.getElementById('content-area'), (tab) => window.dispatchEvent(new CustomEvent('navTab', {detail: {tab}})))">Try Again</button>
      </div>
    `;
  }
}
