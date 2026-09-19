// SOLYA 7-Step Senior Onboarding Component

function openOnboardingModal(onFinish) {
  let step = 1;
  let userName = "Rajesh Sharma";
  let selectedLang = currentLanguage || "hi";

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "onboarding-modal";

  function renderStep() {
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 600px; text-align: center;">
        ${step === 1 ? `
          <!-- Screen 1: Welcome -->
          <div style="font-size: 64px; margin-bottom: 12px;">🌟</div>
          <h2 style="font-size: 32px; font-weight: 800; color: #0F172A; margin-bottom: 8px;">SOLYA</h2>
          <p style="font-size: 20px; font-weight: 700; color: var(--brand-primary); margin-bottom: 12px;">
            "Your health. Your people. Always connected."
          </p>
          <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 32px; line-height: 1.5;">
            An intelligent, peaceful health and safety companion designed specifically for senior citizens in India.
          </p>
          <button id="ob-next-1" class="btn btn-primary" style="width: 100%; font-size: 20px;">
            Get Started ➔
          </button>
        ` : ''}

        ${step === 2 ? `
          <!-- Screen 2: Name Input -->
          <div style="font-size: 48px; margin-bottom: 12px;">👋</div>
          <h3 style="font-size: 26px; font-weight: 800; margin-bottom: 12px;">What should we call you?</h3>
          <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 24px;">
            Enter your preferred name so Solya can address you respectfully.
          </p>
          <input type="text" id="ob-name-input" class="role-switcher-select" style="width: 100%; height: 56px; font-size: 20px; text-align: center; margin-bottom: 28px;" value="${userName}" placeholder="e.g. Rajesh Sharma" />
          <div style="display: flex; gap: 12px;">
            <button id="ob-back" class="btn btn-secondary" style="flex: 1;">Back</button>
            <button id="ob-next-2" class="btn btn-primary" style="flex: 2;">Continue ➔</button>
          </div>
        ` : ''}

        ${step === 3 ? `
          <!-- Screen 3: Language Selection -->
          <div style="font-size: 48px; margin-bottom: 12px;">🌐</div>
          <h3 style="font-size: 26px; font-weight: 800; margin-bottom: 12px;">Choose Your Language</h3>
          <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 20px;">
            Select your preferred language. You can change this at any time.
          </p>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-height: 280px; overflow-y: auto; margin-bottom: 24px; padding: 4px;">
            ${SUPPORTED_LANGUAGES.map(l => `
              <button class="btn ${l.code === selectedLang ? 'btn-primary' : 'btn-secondary'} ob-lang-card" data-code="${l.code}" style="padding: 12px; font-size: 16px; min-height: 48px;">
                ${l.nativeName} (${l.name})
              </button>
            `).join('')}
          </div>
          <div style="display: flex; gap: 12px;">
            <button id="ob-back" class="btn btn-secondary" style="flex: 1;">Back</button>
            <button id="ob-next-3" class="btn btn-primary" style="flex: 2;">Save Language ➔</button>
          </div>
        ` : ''}

        ${step === 4 ? `
          <!-- Screen 4: Emergency Contacts -->
          <div style="font-size: 48px; margin-bottom: 12px;">👨‍👩‍👧</div>
          <h3 style="font-size: 26px; font-weight: 800; margin-bottom: 12px;">Who should we contact in an emergency?</h3>
          <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 20px;">
            Your primary emergency network receives alerts with your location and medical summary if you press help.
          </p>
          <div style="background: var(--bg-surface); padding: 16px; border-radius: 12px; text-align: left; margin-bottom: 24px;">
            <div style="font-size: 16px; font-weight: 700;">• Primary: Priya Sharma (Daughter) - +91 98765 43211</div>
            <div style="font-size: 16px; font-weight: 700; margin-top: 6px;">• Secondary: Amit Sharma (Son) - +91 98765 43212</div>
          </div>
          <div style="display: flex; gap: 12px;">
            <button id="ob-back" class="btn btn-secondary" style="flex: 1;">Back</button>
            <button id="ob-next-4" class="btn btn-primary" style="flex: 2;">Confirm Contacts ➔</button>
          </div>
        ` : ''}

        ${step === 5 ? `
          <!-- Screen 5: Connect Doctor -->
          <div style="font-size: 48px; margin-bottom: 12px;">🩺</div>
          <h3 style="font-size: 26px; font-weight: 800; margin-bottom: 12px;">Do you have a doctor you want to connect?</h3>
          <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 20px;">
            Dr. Ananya Mehta from CityCare Hospital is ready to connect with your records.
          </p>
          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; padding: 16px; border-radius: 12px; text-align: left; margin-bottom: 24px;">
            <strong>Dr. Ananya Mehta, MD</strong> (Cardiologist, CityCare Hospital)
            <div style="font-size: 14px; color: #166534;">✓ Connected in Demo Mode</div>
          </div>
          <div style="display: flex; gap: 12px;">
            <button id="ob-back" class="btn btn-secondary" style="flex: 1;">Back</button>
            <button id="ob-next-5" class="btn btn-primary" style="flex: 2;">Connect Doctor ➔</button>
          </div>
        ` : ''}

        ${step === 6 ? `
          <!-- Screen 6: Health Reminders -->
          <div style="font-size: 48px; margin-bottom: 12px;">🔔</div>
          <h3 style="font-size: 26px; font-weight: 800; margin-bottom: 12px;">Would you like health reminders?</h3>
          <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 24px;">
            Solya can gently remind you when it is time to take medicines or check your morning blood pressure.
          </p>
          <div style="display: flex; gap: 12px;">
            <button id="ob-back" class="btn btn-secondary" style="flex: 1;">Back</button>
            <button id="ob-next-6" class="btn btn-safe" style="flex: 2;">Yes, Enable Reminders ➔</button>
          </div>
        ` : ''}

        ${step === 7 ? `
          <!-- Screen 7: Permissions Explanation -->
          <div style="font-size: 48px; margin-bottom: 12px;">🛡️</div>
          <h3 style="font-size: 26px; font-weight: 800; margin-bottom: 12px;">Clear Permissions</h3>
          <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 20px;">
            We only request permissions essential for your safety:
          </p>
          <div style="background: var(--bg-surface); padding: 16px; border-radius: 12px; text-align: left; margin-bottom: 28px; font-size: 15px; display: flex; flex-direction: column; gap: 8px;">
            <div>📍 <strong>Location:</strong> Used strictly to help ambulance and family locate you during emergency.</div>
            <div>🎙️ <strong>Microphone:</strong> Used when you speak to Solya or record doctor dictation.</div>
            <div>📷 <strong>Camera:</strong> Used exclusively during video calls with your family with your consent.</div>
          </div>
          <button id="ob-finish" class="btn btn-primary" style="width: 100%; font-size: 22px; padding: 18px;">
            🎉 Enter Solya
          </button>
        ` : ''}
      </div>
    `;

    // Attach step button listeners
    modal.querySelector("#ob-next-1")?.addEventListener("click", () => { step = 2; renderStep(); });
    modal.querySelector("#ob-next-2")?.addEventListener("click", () => {
      userName = modal.querySelector("#ob-name-input")?.value || userName;
      step = 3;
      renderStep();
    });
    modal.querySelector("#ob-next-3")?.addEventListener("click", () => {
      setLanguage(selectedLang);
      step = 4;
      renderStep();
    });
    modal.querySelector("#ob-next-4")?.addEventListener("click", () => { step = 5; renderStep(); });
    modal.querySelector("#ob-next-5")?.addEventListener("click", () => { step = 6; renderStep(); });
    modal.querySelector("#ob-next-6")?.addEventListener("click", () => { step = 7; renderStep(); });
    modal.querySelector("#ob-back")?.addEventListener("click", () => { step = Math.max(1, step - 1); renderStep(); });

    modal.querySelectorAll(".ob-lang-card").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedLang = btn.getAttribute("data-code");
        modal.querySelectorAll(".ob-lang-card").forEach(b => b.className = "btn btn-secondary ob-lang-card");
        btn.className = "btn btn-primary ob-lang-card";
      });
    });

    modal.querySelector("#ob-finish")?.addEventListener("click", () => {
      modal.remove();
      localStorage.setItem("solya_onboarded", "true");
      alert(`Welcome to Solya, ${userName}! Your calm companion is ready.`);
      if (onFinish) onFinish();
    });
  }

  document.body.appendChild(modal);
  renderStep();
}
