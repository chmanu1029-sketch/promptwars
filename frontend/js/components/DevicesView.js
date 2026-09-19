// SOLYA Connected Devices View
// Smartwatch, blood pressure monitor, pulse oximeter, and phone health sync

async function renderDevices(container, onNavigate) {
  container.innerHTML = `<div style="text-align: center; padding: 40px;"><div class="badge badge-normal">Loading devices...</div></div>`;

  try {
    const data = await api.getDevices();
    const devices = data.devices || [];

    const iconMap = {
      "Smartwatch": "⌚",
      "Blood pressure monitor": "🩺",
      "Pulse oximeter": "🫁",
      "Glucose monitor": "🩸",
      "Phone health sync": "📱"
    };

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-size: var(--font-h1); font-weight: 800;">${t('navDevices')}</h2>
          <p style="font-size: var(--font-base); color: var(--text-secondary);">
            Automated, continuous health telemetry from verified medical monitors.
          </p>
        </div>
        <button id="sync-all-btn" class="btn btn-primary">
          🔄 Sync All Devices
        </button>
      </div>

      <!-- Devices Grid -->
      <div class="grid-2">
        ${devices.map(d => `
          <div class="card" style="border-left: 6px solid ${d.status === 'connected' ? 'var(--safe-green)' : 'var(--attention-amber)'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <div style="display: flex; gap: 12px; align-items: center;">
                <span style="font-size: 32px;">${iconMap[d.device_type] || '📟'}</span>
                <div>
                  <h4 style="font-size: 20px; font-weight: 800;">${d.device_name}</h4>
                  <p style="font-size: 14px; color: var(--text-secondary);">${d.brand || 'Certified Medical'}</p>
                </div>
              </div>
              <span class="badge ${d.status === 'connected' ? 'badge-normal' : 'badge-attention'}">
                ${d.status.toUpperCase()}
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 14px; color: var(--text-muted); margin: 12px 0;">
              <span>Battery: <strong>${d.battery_level}%</strong></span>
              <span>Last Sync: <strong>${d.last_synced ? d.last_synced.split(' ')[1] : 'Just now'}</strong></span>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 14px;">
              <button class="btn btn-secondary sync-single-btn" data-id="${d.id}" style="flex: 1; font-size: 14px; min-height: 42px;">
                Sync Now
              </button>
              <button class="btn btn-secondary" onclick="alert('Device settings and calibration: Calibration normal.')" style="font-size: 14px; min-height: 42px;">
                Settings
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Integrations Banner -->
      <div class="card" style="margin-top: 24px; background: #F8FAFC;">
        <h4 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">🔗 Platform Integrations</h4>
        <p style="font-size: 15px; color: var(--text-secondary); margin-bottom: 14px;">
          Solya interfaces smoothly with Apple Health, Google Health Connect, and Bluetooth medical sensors (Demo Mode).
        </p>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <span class="badge badge-normal">✓ Apple Health Connected</span>
          <span class="badge badge-normal">✓ Google Health Connect Ready</span>
          <span class="badge badge-normal">✓ Omron BP Bluetooth Active</span>
        </div>
      </div>
    `;

    container.querySelectorAll(".sync-single-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        btn.innerText = "Syncing...";
        await api.syncDevice(id);
        alert("Device synchronized with latest reading!");
        renderDevices(container, onNavigate);
      });
    });

    document.getElementById("sync-all-btn")?.addEventListener("click", async () => {
      for (const d of devices) {
        await api.syncDevice(d.id);
      }
      alert("All connected health devices synchronized!");
      renderDevices(container, onNavigate);
    });

  } catch (err) {
    container.innerHTML = `<div class="card"><p>Failed to load devices: ${err.message}</p></div>`;
  }
}
