// SOLYA AI Assistant Component ("Talk to Solya")
// Dedicated conversational companion with voice synthesis, safety layer, and grounded responses

async function renderAssistant(container, onNavigate) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 32px;">🎙️</span>
          <h2 style="font-size: var(--font-h1); font-weight: 800;">${t('btnTalkToSolya')}</h2>
        </div>
        <p style="font-size: var(--font-base); color: var(--text-secondary); margin-top: 4px;">
          Your gentle, intelligent companion. Ask questions about your medicines, appointments, or loved ones.
        </p>
      </div>
      <span class="badge badge-normal">AI Grounded & Safe</span>
    </div>

    <!-- Main Chat Conversation Box -->
    <div class="card" style="min-height: 440px; display: flex; flex-direction: column; justify-content: space-between;">
      <div id="assistant-chat-history" style="display: flex; flex-direction: column; gap: 16px; max-height: 420px; overflow-y: auto; padding: 10px 0;">
        <!-- Initial Welcome Message from Solya -->
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <div style="background: var(--brand-light); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">
            🌟
          </div>
          <div style="background: var(--bg-surface); padding: 16px 20px; border-radius: 18px; border-top-left-radius: 4px; max-width: 80%; font-size: 18px; line-height: 1.5;">
            Namaste Rajesh-ji! I am Solya. How may I assist you today? You can ask me:
            <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="badge badge-normal prompt-chip" data-text="What medicines do I have today?">
                💊 "What medicines today?"
              </button>
              <button class="badge badge-normal prompt-chip" data-text="Show my doctor appointment">
                👨‍⚕️ "Show my appointment"
              </button>
              <button class="badge badge-normal prompt-chip" data-text="Call my daughter Priya">
                👨‍👩‍👧 "Call my daughter"
              </button>
              <button class="badge badge-normal prompt-chip" data-text="What was my last blood pressure reading?">
                ❤️ "My latest blood pressure"
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Voice and Text Input Area -->
      <div style="border-top: 1px solid var(--border-subtle); padding-top: 16px; margin-top: 16px;">
        <form id="assistant-form" style="display: flex; gap: 12px; align-items: center;">
          <button type="button" id="assistant-mic-btn" class="btn btn-primary" style="width: 58px; height: 58px; border-radius: 50%; padding: 0; font-size: 24px; flex-shrink: 0;" title="Speak to Solya">
            🎙️
          </button>
          <input type="text" id="assistant-text-input" class="role-switcher-select" style="flex: 1; height: 58px; font-size: 18px; padding: 0 18px;" placeholder="Ask Solya anything (e.g. 'What medicines do I have today?')..." required />
          <button type="submit" class="btn btn-primary" style="height: 58px; padding: 0 24px; font-size: 18px;">
            Send
          </button>
        </form>
      </div>
    </div>

    <!-- Safety Boundary Notice -->
    <div style="text-align: center; margin-top: 12px; font-size: 14px; color: var(--text-secondary);">
      Solya is an assistant designed to support your daily care. It does not replace medical diagnoses by Dr. Mehta.
    </div>
  `;

  const chatHistory = document.getElementById("assistant-chat-history");
  const form = document.getElementById("assistant-form");
  const input = document.getElementById("assistant-text-input");
  const micBtn = document.getElementById("assistant-mic-btn");

  function appendMessage(sender, text, actions = []) {
    const isUser = sender === 'user';
    const msgDiv = document.createElement("div");
    msgDiv.style.display = "flex";
    msgDiv.style.gap = "12px";
    msgDiv.style.alignItems = "flex-start";
    msgDiv.style.justifyContent = isUser ? "flex-end" : "flex-start";

    msgDiv.innerHTML = `
      ${!isUser ? `<div style="background: var(--brand-light); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;">🌟</div>` : ''}
      <div style="background: ${isUser ? 'var(--brand-primary)' : 'var(--bg-surface)'}; color: ${isUser ? '#FFFFFF' : 'var(--text-main)'}; padding: 16px 20px; border-radius: 18px; ${isUser ? 'border-top-right-radius: 4px;' : 'border-top-left-radius: 4px;'} max-width: 80%; font-size: 18px; line-height: 1.5; white-space: pre-wrap;">
        ${text}
        ${actions.length > 0 ? `
          <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
            ${actions.map(a => `<button class="btn btn-secondary assistant-action-pill" style="font-size: 14px; min-height: 38px; padding: 6px 14px; background: #FFFFFF;">${a}</button>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Attach suggested action button handlers
    msgDiv.querySelectorAll(".assistant-action-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        const actionText = btn.innerText;
        if (actionText.includes("Medicine")) onNavigate("medicines");
        else if (actionText.includes("Appointment") || actionText.includes("Doctor")) onNavigate("appointments");
        else if (actionText.includes("Priya") || actionText.includes("Family")) onNavigate("family");
        else if (actionText.includes("Emergency")) window.dispatchEvent(new CustomEvent("openEmergency"));
        else if (actionText.includes("Health")) onNavigate("health");
        else {
          input.value = actionText;
          form.dispatchEvent(new Event("submit"));
        }
      });
    });
  }

  async function handleQuery(queryText) {
    appendMessage('user', queryText);
    const loadingDiv = document.createElement("div");
    loadingDiv.innerHTML = `<span style="font-size: 14px; color: var(--text-secondary); font-style: italic;">Solya is thinking...</span>`;
    chatHistory.appendChild(loadingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    try {
      const resp = await api.sendAIChat(queryText);
      loadingDiv.remove();
      appendMessage('solya', resp.reply, resp.suggested_actions || []);
      solyaSpeech.speak(resp.reply);

      if (resp.action === "TRIGGER_EMERGENCY_MODAL") {
        setTimeout(() => window.dispatchEvent(new CustomEvent("openEmergency")), 1000);
      }
    } catch (err) {
      loadingDiv.remove();
      appendMessage('solya', "I am here with you, but had trouble reaching my helper engine. You can ask about medicines or call Priya directly.");
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    input.value = "";
    handleQuery(query);
  });

  micBtn.addEventListener("click", () => {
    micBtn.style.animation = "pulse-soft 1s infinite";
    solyaSpeech.startListening((transcript) => {
      micBtn.style.animation = "none";
      handleQuery(transcript);
    }, () => {
      micBtn.style.animation = "none";
    });
  });

  container.querySelectorAll(".prompt-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      handleQuery(chip.getAttribute("data-text"));
    });
  });
}
