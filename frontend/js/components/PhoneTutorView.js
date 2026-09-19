// SOLYA Digital Phone Tutor Component ("Show Me How")
// Step-by-step instructions for seniors with audio read aloud and clear progress

async function renderPhoneTutor(container, onNavigate) {
  const topics = [
    { id: "send_photo", title: "How to Send a Photo to Priya on WhatsApp", icon: "📸" },
    { id: "video_call", title: "How to Make a Video Call to Family", icon: "📹" },
    { id: "increase_volume", title: "How to Increase Phone Ringing Volume", icon: "🔊" }
  ];

  let currentTopicId = "send_photo";
  let currentStepIndex = 0;

  async function loadTutorial() {
    container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading tutorial...</div></div>`;
    const tutorial = await api.getPhoneTutorial(currentTopicId);
    const steps = tutorial.steps || [];
    const step = steps[currentStepIndex] || steps[0];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 32px;">📱</span>
            <h2 style="font-size: var(--font-h1); font-weight: 800;">${t('navTutor')}</h2>
          </div>
          <p style="font-size: var(--font-base); color: var(--text-secondary); margin-top: 4px;">
            Simple, peaceful step-by-step guidance for everyday smartphone tasks.
          </p>
        </div>
        <button id="tutor-read-step-btn" class="btn btn-secondary">
          🔊 ${t('btnReadAloud')}
        </button>
      </div>

      <!-- Topic Selector Tabs -->
      <div style="display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap;">
        ${topics.map(t => `
          <button class="btn ${t.id === currentTopicId ? 'btn-primary' : 'btn-secondary'} tutor-topic-btn" data-id="${t.id}" style="font-size: 15px; min-height: 44px;">
            ${t.icon} ${t.title}
          </button>
        `).join('')}
      </div>

      <!-- Interactive Step Card -->
      <div class="card" style="border-top: 8px solid var(--brand-primary); text-align: center; padding: 36px 24px;">
        <span class="badge badge-normal" style="font-size: 16px; margin-bottom: 16px;">
          Step ${step.step_num} of ${steps.length}
        </span>

        <h3 style="font-size: 28px; font-weight: 800; color: #0F172A; margin-bottom: 12px;">
          ${step.title}
        </h3>

        <p style="font-size: 20px; color: var(--text-main); max-width: 600px; margin: 0 auto 32px auto; line-height: 1.6;">
          ${step.description}
        </p>

        <!-- Progress Steps Indicators -->
        <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 32px;">
          ${steps.map((s, idx) => `
            <div style="width: 32px; height: 8px; border-radius: 4px; background: ${idx === currentStepIndex ? 'var(--brand-primary)' : 'var(--border-subtle)'};"></div>
          `).join('')}
        </div>

        <!-- Navigation Buttons for Step -->
        <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
          ${currentStepIndex > 0 ? `
            <button id="tutor-prev-btn" class="btn btn-secondary" style="min-width: 160px;">
              ⬅️ Previous Step
            </button>
          ` : ''}

          ${currentStepIndex < steps.length - 1 ? `
            <button id="tutor-next-btn" class="btn btn-primary" style="min-width: 180px;">
              Next Step ➡️
            </button>
          ` : `
            <button id="tutor-finish-btn" class="btn btn-safe" style="min-width: 180px;">
              🎉 Done! You did it!
            </button>
          `}
        </div>
      </div>
    `;

    // Event listeners
    container.querySelectorAll(".tutor-topic-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentTopicId = btn.getAttribute("data-id");
        currentStepIndex = 0;
        loadTutorial();
      });
    });

    document.getElementById("tutor-read-step-btn")?.addEventListener("click", () => {
      solyaSpeech.speak(`Step ${step.step_num}. ${step.title}. ${step.description}`);
    });

    document.getElementById("tutor-next-btn")?.addEventListener("click", () => {
      if (currentStepIndex < steps.length - 1) {
        currentStepIndex++;
        loadTutorial();
      }
    });

    document.getElementById("tutor-prev-btn")?.addEventListener("click", () => {
      if (currentStepIndex > 0) {
        currentStepIndex--;
        loadTutorial();
      }
    });

    document.getElementById("tutor-finish-btn")?.addEventListener("click", () => {
      alert("Wonderful job! You have mastered this lesson.");
      currentStepIndex = 0;
      loadTutorial();
    });
  }

  loadTutorial();
}
