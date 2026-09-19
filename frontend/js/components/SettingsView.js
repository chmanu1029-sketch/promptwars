// SOLYA Settings, Privacy, Permissions & Audit Log Component
// Configurable accessibility modes, explicit consent toggles, and live audit log

async function renderSettings(container, onNavigate) {
  container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading settings & security...</div></div>`;

  try {
    const [seniorData, permsData, auditData] = await Promise.all([
      api.getSeniorProfile(),
      api.getPermissions(),
      api.getAuditLogs()
    ]);

    const senior = seniorData.senior || {};
    const settings = seniorData.settings || {};
    const perms = permsData.permissions || [];
    const auditLogs = auditData.audit_logs || [];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: var(--font-h1); font-weight: 800;">${t('navSettings')} & Privacy</h2>
          <p style="font-size: var(--font-base); color: var(--text-secondary);">
            Personal preferences, language selection, privacy permissions, and transparent access logs.
          </p>
        </div>
        <button id="reset-demo-btn" class="btn btn-secondary">
          🔄 Reset Demo Seed Data
        </button>
      </div>

      <!-- Language & Display Accessibility -->
      <div class="card">
        <h3 style="font-size: 22px; font-weight: 800; margin-bottom: 16px;">Language & Accessibility</h3>
        <div class="grid-2">
          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 8px;">Preferred Indian Language</label>
            <select id="settings-lang-select" class="role-switcher-select" style="width: 100%; height: 50px; font-size: 16px;">
              ${SUPPORTED_LANGUAGES.map(l => `<option value="${l.code}" ${l.code === currentLanguage ? 'selected' : ''}>🌐 ${l.nativeName} (${l.name})</option>`).join('')}
            </select>
            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 6px;">
              Language persists automatically across sessions.
            </p>
          </div>

          <div>
            <label style="display: block; font-weight: 700; margin-bottom: 8px;">Special Accessibility Modes</label>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 16px;">
                <input type="checkbox" id="settings-vision-cb" ${document.body.classList.contains('vision-mode') ? 'checked' : ''} style="width: 22px; height: 22px;" />
                <span><strong>Vision-Friendly Mode:</strong> Ultra large text, thick borders</span>
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 16px;">
                <input type="checkbox" id="settings-hearing-cb" ${document.body.classList.contains('hearing-mode') ? 'checked' : ''} style="width: 22px; height: 22px;" />
                <span><strong>Hearing-Friendly Mode:</strong> Visual alert flashes, captions</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Privacy & Permissions Center (Section 44) -->
      <h3 style="font-size: var(--font-h3); font-weight: 800; margin: 32px 0 16px 0;">Privacy & Access Authorizations</h3>
      <div class="card">
        <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 16px;">
          You own your medical records and location. You can grant or revoke any sensitive access at any time:
        </p>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${perms.map(p => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px; background: var(--bg-surface); border-radius: 10px; flex-wrap: wrap; gap: 10px;">
              <div style="max-width: 70%;">
                <h4 style="font-size: 17px; font-weight: 800;">${p.title}</h4>
                <p style="font-size: 14px; color: var(--text-secondary);">${p.description}</p>
              </div>

              <div style="display: flex; align-items: center; gap: 10px;">
                <span class="badge ${p.is_granted ? 'badge-normal' : 'badge-attention'}">
                  ${p.is_granted ? 'GRANTED' : 'REVOKED'}
                </span>
                <button class="btn btn-secondary perm-toggle-btn" data-id="${p.id}" data-status="${p.is_granted}">
                  ${p.is_granted ? 'Revoke' : 'Grant'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Transparent Audit Log (Section 45) -->
      <h3 style="font-size: var(--font-h3); font-weight: 800; margin: 32px 0 16px 0;">Activity & Access Audit Trail</h3>
      <div class="card">
        <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 16px;">
          Every time your medical summary, location, or prescriptions are viewed or changed, an unalterable audit entry is saved:
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto;">
          ${auditLogs.map(a => `
            <div style="padding: 12px 14px; background: var(--bg-surface); border-radius: 8px; font-size: 15px; border-left: 4px solid var(--brand-primary);">
              <div style="display: flex; justify-content: space-between; color: var(--text-secondary); font-size: 13px; margin-bottom: 4px;">
                <span><strong>${a.actor_name}</strong> • ${a.source}</span>
                <span>${a.logged_at}</span>
              </div>
              <div style="color: var(--text-main); font-weight: 500;">${a.details}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Event listeners
    document.getElementById("settings-lang-select")?.addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });

    document.getElementById("settings-vision-cb")?.addEventListener("change", (e) => {
      if (e.target.checked) document.body.classList.add("vision-mode");
      else document.body.classList.remove("vision-mode");
    });

    document.getElementById("settings-hearing-cb")?.addEventListener("change", (e) => {
      if (e.target.checked) document.body.classList.add("hearing-mode");
      else document.body.classList.remove("hearing-mode");
    });

    container.querySelectorAll(".perm-toggle-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const current = btn.getAttribute("data-status") === "1";
        await api.togglePermission(id, !current);
        alert(`Permission updated!`);
        renderSettings(container, onNavigate);
      });
    });

    document.getElementById("reset-demo-btn")?.addEventListener("click", () => {
      if (confirm("Reset demo data to initial seeded state?")) {
        window.location.reload();
      }
    });

  } catch (err) {
    container.innerHTML = `<div class="card"><p>Failed to load settings: ${err.message}</p></div>`;
  }
}
