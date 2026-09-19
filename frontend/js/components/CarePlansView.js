// SOLYA Condition-Specific Care Plans View
// Full coverage of all 13 conditions organized by category with interactive care plans and questions for doctor

async function renderCarePlans(container, onNavigate, initialConditionId = null) {
  container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading care plans...</div></div>`;

  try {
    const data = await api.getConditions();
    const conditions = data.conditions || [];
    const carePlans = data.care_plans || {};

    let selectedCondition = initialConditionId ? 
      conditions.find(c => c.id === initialConditionId) || conditions[0] : 
      conditions[0];

    function drawView() {
      const plan = carePlans[selectedCondition.id] || {
        overview: "Care plan active.",
        today_care: ["Regular health monitoring", "Medication compliance"],
        monitoring_targets: {},
        emergency_guidance: "Contact doctor or trigger emergency help if symptoms worsen.",
        questions: []
      };

      const categories = [
        { name: "Bone & Joint", ids: ["cond_osteoarthritis", "cond_osteoporosis"] },
        { name: "Heart & Blood Pressure", ids: ["cond_hypertension", "cond_atherosclerosis", "cond_heart_failure"] },
        { name: "Kidney", ids: ["cond_ckd"] },
        { name: "Diabetes", ids: ["cond_type2_diabetes"] },
        { name: "Breathing", ids: ["cond_copd"] },
        { name: "Brain & Movement", ids: ["cond_alzheimers", "cond_parkinsons"] },
        { name: "Vision", ids: ["cond_amd"] },
        { name: "Hearing", ids: ["cond_hearing_loss"] },
        { name: "Cancer", ids: ["cond_cancer_care"] }
      ];

      container.innerHTML = `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: var(--font-h1); font-weight: 800;">Your Personalized Care</h2>
          <p style="font-size: var(--font-base); color: var(--text-secondary); margin-top: 4px;">
            Solya provides reminders, monitoring tools, safety features, and care-team connections based on your documented health information.
          </p>
        </div>

        <!-- Condition Category Pills / Selector -->
        <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 24px;">
          ${conditions.map(c => `
            <button class="btn ${c.id === selectedCondition.id ? 'btn-primary' : 'btn-secondary'} condition-select-pill" data-id="${c.id}" style="padding: 8px 16px; min-height: 44px; font-size: 15px; white-space: nowrap;">
              ${c.condition_name}
            </button>
          `).join('')}
        </div>

        <!-- Selected Condition Care Plan Detail -->
        <div class="card" style="border-top: 8px solid var(--brand-primary);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <h3 style="font-size: 28px; font-weight: 800; color: #0F172A;">${selectedCondition.condition_name}</h3>
                <span class="badge badge-normal">${selectedCondition.category}</span>
              </div>
              <p style="font-size: 15px; color: var(--text-secondary); margin-top: 4px;">
                ICD Code: <strong>${selectedCondition.icd_code || "Clinical"}</strong> • Status: <strong>${selectedCondition.status.toUpperCase()}</strong>
              </p>
            </div>
            <button id="read-careplan-btn" class="btn btn-secondary">
              🔊 ${t('btnReadAloud')}
            </button>
          </div>

          <!-- Section 1: Overview -->
          <div style="background: var(--bg-surface); padding: 18px; border-radius: 12px; margin-bottom: 20px;">
            <h4 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">Overview & Clinical Goals</h4>
            <p style="font-size: 16px; color: var(--text-muted); line-height: 1.6;">
              ${plan.overview}
            </p>
          </div>

          <!-- Special Mode Callout (for Alzheimer's, AMD, Hearing Loss, Cancer) -->
          ${selectedCondition.id === 'cond_alzheimers' ? `
            <div class="card" style="background: #F0FDF4; border: 2px solid #86EFAC; margin-bottom: 20px;">
              <h4 style="font-size: 20px; font-weight: 800; color: #166534; display: flex; align-items: center; gap: 8px;">
                <span>🧠</span> <span>Memory & Safety Mode Active</span>
              </h4>
              <p style="font-size: 16px; color: #14532D; margin: 8px 0;">
                Orientation clock, simplified 1-tap reminders, and consented family geofencing (500m safe perimeter) are configured for Rajesh.
              </p>
              <button class="btn btn-primary" id="where-am-i-btn" style="background-color: #166534;">
                📍 Tap "Where am I?" (Orient Location)
              </button>
            </div>
          ` : ''}

          ${selectedCondition.id === 'cond_amd' ? `
            <div class="card" style="background: #FEF3C7; border: 2px solid #FCD34D; margin-bottom: 20px;">
              <h4 style="font-size: 20px; font-weight: 800; color: #92400E;">
                👁️ Vision-Friendly Features
              </h4>
              <p style="font-size: 16px; color: #78350F; margin: 8px 0;">
                High contrast typography and automatic text-to-speech reading for all reports and prescriptions.
              </p>
              <button class="btn btn-primary" onclick="document.body.classList.toggle('vision-mode')">
                Toggle Ultra-Large Vision Mode
              </button>
            </div>
          ` : ''}

          ${selectedCondition.id === 'cond_hearing_loss' ? `
            <div class="card" style="background: #E0F2FE; border: 2px solid #7DD3FC; margin-bottom: 20px;">
              <h4 style="font-size: 20px; font-weight: 800; color: #075985;">
                🦻 Hearing-Friendly Mode
              </h4>
              <p style="font-size: 16px; color: #0C4A6E; margin: 8px 0;">
                High-intensity visual alerts, real-time video captions, and vibration reminders enabled.
              </p>
              <button class="btn btn-primary" onclick="document.body.classList.toggle('hearing-mode')">
                Toggle Visual Alerts & Captions
              </button>
            </div>
          ` : ''}

          ${selectedCondition.id === 'cond_cancer_care' ? `
            <div class="card" style="background: #FDF2F8; border: 2px solid #F472B6; margin-bottom: 20px;">
              <h4 style="font-size: 20px; font-weight: 800; color: #9D174D;">
                🎗️ Oncology Survivorship & Surveillance Journey
              </h4>
              <p style="font-size: 16px; color: #831843; margin: 8px 0;">
                Post-treatment recovery plan: Next surveillance scan scheduled for December 2026. Daily temperature monitoring is active.
              </p>
              <div class="badge badge-normal" style="background: #FFFFFF; color: #9D174D;">Threshold: Immediate consult if temp > 100.4°F</div>
            </div>
          ` : ''}

          <!-- Grid: Today's Care & Monitoring Targets -->
          <div class="grid-2" style="margin-bottom: 20px;">
            <div style="background: #FFFFFF; border: 1px solid var(--border-subtle); padding: 18px; border-radius: 12px;">
              <h4 style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">☀️ Today's Care Routine</h4>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
                ${(plan.today_care || []).map(item => `
                  <li style="display: flex; align-items: flex-start; gap: 10px; font-size: 16px;">
                    <span style="color: var(--safe-green); font-weight: bold;">✔</span>
                    <span>${item}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div style="background: #FFFFFF; border: 1px solid var(--border-subtle); padding: 18px; border-radius: 12px;">
              <h4 style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">🎯 Monitoring Targets & Baselines</h4>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${Object.entries(plan.monitoring_targets || {}).map(([k, v]) => `
                  <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--bg-surface); font-size: 15px;">
                    <span style="color: var(--text-secondary); text-transform: capitalize;">${k.replace(/_/g, ' ')}:</span>
                    <strong>${v}</strong>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Emergency Guidance -->
          <div style="background: var(--emergency-bg); border-left: 6px solid var(--emergency-red); padding: 18px; border-radius: 8px; margin-bottom: 24px;">
            <h4 style="font-size: 18px; font-weight: 800; color: #991B1B; margin-bottom: 6px;">🚨 Condition Emergency Guidance</h4>
            <p style="font-size: 16px; color: #7F1D1D; line-height: 1.5;">
              ${plan.emergency_guidance}
            </p>
          </div>

          <!-- Questions for Doctor Form & List -->
          <div style="background: var(--bg-surface); padding: 20px; border-radius: 12px;">
            <h4 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">❓ Questions for Dr. Mehta at Next Visit</h4>
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 14px;">
              Save questions ahead of time so you never forget to ask during your consultation.
            </p>

            <div id="questions-list" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
              ${(plan.questions || []).map((q, idx) => `
                <div style="background: #FFFFFF; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border-subtle); font-size: 15px;">
                  💬 "${q}"
                </div>
              `).join('')}
            </div>

            <form id="add-question-form" style="display: flex; gap: 10px; flex-wrap: wrap;">
              <input type="text" id="new-question-input" class="role-switcher-select" style="flex: 1; height: 48px; min-width: 260px;" placeholder="Type your question for Dr. Mehta..." required />
              <button type="submit" class="btn btn-primary" style="min-height: 48px;">
                Save Question
              </button>
            </form>
          </div>
        </div>
      `;

      // Attach handlers
      container.querySelectorAll(".condition-select-pill").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          selectedCondition = conditions.find(c => c.id === id);
          drawView();
        });
      });

      document.getElementById("read-careplan-btn")?.addEventListener("click", () => {
        const text = `${selectedCondition.condition_name} Care Plan. ${plan.overview}. Today's routine includes: ${plan.today_care.join(', ')}.`;
        solyaSpeech.speak(text);
      });

      document.getElementById("where-am-i-btn")?.addEventListener("click", () => {
        alert("📍 Location check: You are safely at home in Flat 402, Shanti Vihar, Koramangala. Priya has your consented location.");
      });

      document.getElementById("add-question-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = document.getElementById("new-question-input");
        const q = input.value.trim();
        if (!q) return;

        try {
          await api.saveDoctorQuestion(selectedCondition.id, q);
          plan.questions.push(q);
          drawView();
          alert("Question saved for your doctor!");
        } catch (err) {
          alert("Error saving question: " + err.message);
        }
      });
    }

    drawView();

  } catch (err) {
    container.innerHTML = `<div class="card"><p>Failed to load care plans: ${err.message}</p></div>`;
  }
}
