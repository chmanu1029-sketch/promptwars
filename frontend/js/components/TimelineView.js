// SOLYA Smart Health Timeline Component
// Chronological audit of visits, prescriptions, lab results, and dosage changes

async function renderTimeline(container, onNavigate) {
  container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading health timeline...</div></div>`;

  try {
    const data = await api.getTimeline();
    const events = data.events || [];

    const iconMap = {
      doctor_visit: "👨‍⚕️",
      prescription: "💊",
      lab_report: "🧪",
      medication_change: "🔄",
      check_in: "🟢",
      reading_alert: "⚠️"
    };

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: var(--font-h1); font-weight: 800;">${t('navTimeline')}</h2>
          <p style="font-size: var(--font-base); color: var(--text-secondary);">
            Every clinical event, prescription update, and lab result tracked chronologically.
          </p>
        </div>
        <button id="read-timeline-btn" class="btn btn-secondary">
          🔊 ${t('btnReadAloud')}
        </button>
      </div>

      <div style="position: relative; padding-left: 24px; border-left: 3px solid var(--border-subtle); display: flex; flex-direction: column; gap: 24px; margin-left: 12px;">
        ${events.length === 0 ? `
          <p>No timeline events recorded yet.</p>
        ` : events.map(ev => `
          <div class="card" style="margin-bottom: 0; position: relative;">
            <!-- Circle Dot on Timeline -->
            <div style="position: absolute; left: -37px; top: 24px; width: 22px; height: 22px; border-radius: 50%; background: var(--brand-primary); border: 4px solid #FFFFFF; box-shadow: 0 0 0 1px var(--border-subtle);"></div>

            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 26px;">${iconMap[ev.event_type] || '📌'}</span>
                <div>
                  <h4 style="font-size: 20px; font-weight: 800; color: #0F172A;">${ev.title}</h4>
                  <p style="font-size: 14px; color: var(--text-secondary);">
                    Actor: <strong>${ev.actor_name || "Care Team"}</strong> • Date: <strong>${ev.event_date}</strong>
                  </p>
                </div>
              </div>
              <span class="badge badge-normal">${ev.event_type.replace(/_/g, ' ').toUpperCase()}</span>
            </div>

            <p style="font-size: 16px; color: var(--text-main); margin-top: 8px; line-height: 1.5;">
              ${ev.description}
            </p>

            ${ev.source_ref_id ? `
              <div style="margin-top: 12px; font-size: 13px; color: var(--brand-primary); font-weight: 600;">
                🔗 Linked Source: ${ev.source_ref_id}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    document.getElementById("read-timeline-btn")?.addEventListener("click", () => {
      const firstFew = events.slice(0, 3).map(e => `${e.event_date}: ${e.title}`).join(". ");
      solyaSpeech.speak(`Recent health timeline: ${firstFew}`);
    });

  } catch (err) {
    container.innerHTML = `<div class="card"><p>Failed to load timeline: ${err.message}</p></div>`;
  }
}
