// SOLYA Scam Protection Component
// Implements Demo Journey 5: Suspicious SMS/WhatsApp Message Analysis, Urgent Threat Detection, and Protective Actions

async function renderScamProtection(container, onNavigate) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 32px;">🛡️</span>
          <h2 style="font-size: var(--font-h1); font-weight: 800;">${t('navScam')}</h2>
        </div>
        <p style="font-size: var(--font-base); color: var(--text-secondary); margin-top: 4px;">
          Paste any message, SMS, or link you received. Solya checks if it is a fraud attempt.
        </p>
      </div>
      <button id="read-scam-guide-btn" class="btn btn-secondary">
        🔊 ${t('btnReadAloud')}
      </button>
    </div>

    <!-- Message Analyzer Input Card -->
    <div class="card">
      <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 12px;">Check a Suspicious Message</h3>
      <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 12px;">
        Did you get an SMS claiming your bank account, electricity, or SIM card is blocked? Paste it below:
      </p>

      <textarea id="scam-text-input" class="role-switcher-select" style="width: 100%; height: 110px; padding: 14px; font-size: 17px; margin-bottom: 14px;" placeholder="Paste the SMS or message here..."></textarea>

      <!-- Quick Demo Phishing Samples -->
      <div style="margin-bottom: 16px;">
        <span style="font-size: 14px; font-weight: 600; color: var(--text-secondary);">Try a common Indian scam sample:</span>
        <div style="display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap;">
          <button class="btn btn-secondary sample-scam-btn" data-text="URGENT: Your SBI bank account will be blocked within 24 hours. Click bit.ly/bank-kyc and verify OTP immediately to avoid penalty." style="font-size: 14px; min-height: 40px;">
            🚨 Sample 1: "Bank Account Blocked"
          </button>
          <button class="btn btn-secondary sample-scam-btn" data-text="Dear Customer, your electricity will be disconnected tonight at 9:30 PM due to unpaid bill. Call officer immediately at 98112-XXXXX." style="font-size: 14px; min-height: 40px;">
            💡 Sample 2: "Electricity Disconnection"
          </button>
          <button class="btn btn-secondary sample-scam-btn" data-text="Congratulations! You have won Rs 25,00,000 in KBC Lucky Draw. Deposit processing fee of Rs 5000 to claim prize." style="font-size: 14px; min-height: 40px;">
            🎁 Sample 3: "Lottery Prize"
          </button>
        </div>
      </div>

      <div style="display: flex; gap: 12px;">
        <button id="analyze-scam-btn" class="btn btn-primary" style="flex: 1;">
          🔍 Analyze Message Safety
        </button>
        <button id="clear-scam-btn" class="btn btn-secondary">
          Clear
        </button>
      </div>
    </div>

    <!-- Analysis Results Container -->
    <div id="scam-results-container"></div>

    <!-- Golden Safety Rule Card -->
    <div class="card" style="background: #FFFBEB; border: 2px solid #FCD34D;">
      <h4 style="font-size: 20px; font-weight: 800; color: #92400E; margin-bottom: 8px;">
        🔒 Solya's Golden Rules for Seniors
      </h4>
      <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 16px; color: #78350F;">
        <li>• <strong>Never share your OTP or PIN:</strong> No real bank manager or government officer will ever ask for your OTP.</li>
        <li>• <strong>Never install screen-sharing apps:</strong> Scammers ask you to install AnyDesk, TeamViewer, or QuickSupport. Never install these.</li>
        <li>• <strong>When scared, call Priya:</strong> If a caller threatens police or arrest over phone, hang up and call your family.</li>
      </ul>
    </div>
  `;

  // Preload sample click handlers
  container.querySelectorAll(".sample-scam-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("scam-text-input").value = btn.getAttribute("data-text");
      document.getElementById("analyze-scam-btn").click();
    });
  });

  document.getElementById("clear-scam-btn")?.addEventListener("click", () => {
    document.getElementById("scam-text-input").value = "";
    document.getElementById("scam-results-container").innerHTML = "";
  });

  document.getElementById("read-scam-guide-btn")?.addEventListener("click", () => {
    solyaSpeech.speak("Remember Solya's Golden Rule: Never share your one time password or bank PIN with anyone over the phone.");
  });

  document.getElementById("analyze-scam-btn")?.addEventListener("click", async () => {
    const text = document.getElementById("scam-text-input").value.trim();
    if (!text) {
      alert("Please paste a message or select a sample above first.");
      return;
    }

    const resDiv = document.getElementById("scam-results-container");
    resDiv.innerHTML = `<div class="card" style="text-align: center;"><p>Analyzing message with Solya Safety Engine...</p></div>`;

    try {
      const analysis = await api.analyzeScam(text);
      const isScam = analysis.classification === 'HIGH_RISK_SCAM';

      resDiv.innerHTML = `
        <div class="card" style="border-left: 8px solid ${isScam ? 'var(--emergency-red)' : 'var(--safe-green)'};">
          <div class="card-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 32px;">${isScam ? '⚠️' : '✅'}</span>
              <h3 style="font-size: 24px; font-weight: 800; color: ${isScam ? 'var(--emergency-red)' : 'var(--safe-green)'};">
                ${analysis.title}
              </h3>
            </div>
            <span class="badge ${isScam ? 'badge-urgent' : 'badge-normal'}">
              ${isScam ? 'DO NOT CLICK' : 'SAFE'}
            </span>
          </div>

          <p style="font-size: 17px; color: var(--text-main); margin-bottom: 16px; line-height: 1.5;">
            ${analysis.explanation}
          </p>

          ${analysis.reasons && analysis.reasons.length > 0 ? `
            <div style="background: var(--bg-surface); padding: 14px; border-radius: 10px; margin-bottom: 18px;">
              <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 8px;">Why this looks suspicious:</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 15px;">
                ${analysis.reasons.map(r => `<li>❌ ${r}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Protective Actions Buttons -->
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button id="scam-tell-family-btn" class="btn btn-primary">
              👨‍👩‍👧 Tell Daughter Priya About This
            </button>
            <button id="scam-report-cyber-btn" class="btn btn-urgent">
              🚨 Report to Cyber Crime Helpline (1930)
            </button>
            <button id="scam-delete-btn" class="btn btn-secondary">
              🗑️ Delete & Clear
            </button>
          </div>
        </div>
      `;

      // Read announcement aloud
      solyaSpeech.speak(isScam ? "Warning. This looks like a fraud message. Do not tap the link or share your OTP. Tell your family." : "This message does not appear to contain fraud markers.");

      document.getElementById("scam-tell-family-btn")?.addEventListener("click", () => {
        alert("👨‍👩‍👧 Alert sent to Priya Sharma! She will see this suspicious message on her caregiver dashboard.");
      });

      document.getElementById("scam-report-cyber-btn")?.addEventListener("click", () => {
        alert("🚨 Demo Mode: Dialing National Cyber Crime Helpline (1930) or reporting to cybercrime.gov.in.");
      });

      document.getElementById("scam-delete-btn")?.addEventListener("click", () => {
        document.getElementById("scam-text-input").value = "";
        resDiv.innerHTML = "";
        alert("Message cleared. Stay safe!");
      });

    } catch (err) {
      resDiv.innerHTML = `<div class="card"><p>Error analyzing text: ${err.message}</p></div>`;
    }
  });
}
