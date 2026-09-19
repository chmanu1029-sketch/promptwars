// SOLYA Navigation Component
// Ultra-Premium Minimalist Design with ALL Main Tabs Clearly Visible Everywhere

function renderNavbar(activeTab, onTabSelect, currentRole, onRoleSelect) {
  const sideNav = document.getElementById("side-nav");
  const mobileNav = document.getElementById("mobile-bottom-nav");
  const topBar = document.getElementById("top-bar");
  const horizontalTabs = document.getElementById("horizontal-tabs-bar");

  // All Core Tabs Configuration
  const seniorTabs = [
    { id: "home", label: t('navHome'), icon: "🏠" },
    { id: "health", label: t('navHealth'), icon: "❤️" },
    { id: "medicines", label: t('navMedicines'), icon: "💊" },
    { id: "care", label: t('navCare'), icon: "📋" },
    { id: "appointments", label: t('navAppointments'), icon: "👨‍⚕️" },
    { id: "family", label: t('navFamily'), icon: "👨‍👩‍👧" },
    { id: "documents", label: t('navDocuments'), icon: "📄" },
    { id: "timeline", label: t('navTimeline'), icon: "⏳" },
    { id: "devices", label: t('navDevices'), icon: "⌚" },
    { id: "assistant", label: t('navAssistant'), icon: "🎙️" },
    { id: "scam", label: t('navScam'), icon: "🛡️" },
    { id: "tutor", label: t('navTutor'), icon: "📱" },
    { id: "settings", label: t('navSettings'), icon: "⚙️" }
  ];

  const familyTabs = [
    { id: "family_dash", label: "Caregiver Overview", icon: "👨‍👩‍👧" },
    { id: "health", label: "Senior Vitals", icon: "❤️" },
    { id: "medicines", label: "Medication Log", icon: "💊" },
    { id: "care", label: "Care Plans", icon: "📋" },
    { id: "appointments", label: "Appointments", icon: "👨‍⚕️" },
    { id: "timeline", label: "Clinical Timeline", icon: "⏳" },
    { id: "documents", label: "Documents", icon: "📄" },
    { id: "settings", label: "Settings & Audit", icon: "⚙️" }
  ];

  const doctorTabs = [
    { id: "doctor_dash", label: "Doctor Portal", icon: "🩺" },
    { id: "health", label: "Patient Vitals", icon: "❤️" },
    { id: "medicines", label: "Prescriptions", icon: "💊" },
    { id: "care", label: "Care Plans (13 Conditions)", icon: "📋" },
    { id: "documents", label: "Prescriptions & Labs", icon: "📄" },
    { id: "timeline", label: "Clinical Timeline", icon: "⏳" },
    { id: "settings", label: "Settings & Audit", icon: "⚙️" }
  ];

  const currentTabsList = currentRole === 'family' ? familyTabs : (currentRole === 'doctor' ? doctorTabs : seniorTabs);

  // 1. Top Bar Rendering
  if (topBar) {
    topBar.innerHTML = `
      <div class="top-bar-left">
        <div class="topbar-logo">
          <img src="assets/logo.jpg" alt="SOLYA" onerror="this.style.display='none'" />
          <span class="topbar-logo-name">SOLYA</span>
        </div>
        <div class="role-badge">
          <span>${currentRole === 'senior' ? '👴 Senior User' : (currentRole === 'family' ? '👨‍👩‍👧 Caregiver' : '👩‍⚕️ Doctor')}</span>
        </div>
        <select id="role-select" class="role-switcher-select" aria-label="Role Switcher">
          <option value="senior" ${currentRole === 'senior' ? 'selected' : ''}>Senior (Rajesh Sharma)</option>
          <option value="family" ${currentRole === 'family' ? 'selected' : ''}>Family (Priya Sharma)</option>
          <option value="doctor" ${currentRole === 'doctor' ? 'selected' : ''}>Doctor (Dr. Ananya Mehta)</option>
        </select>
      </div>
      <div class="top-bar-right">
        <!-- Language Selector -->
        <select id="lang-select" class="role-switcher-select" aria-label="Language Selector">
          ${SUPPORTED_LANGUAGES.map(l => `<option value="${l.code}" ${l.code === currentLanguage ? 'selected' : ''}>🌐 ${l.nativeName} (${l.name})</option>`).join('')}
        </select>
        <!-- Accessibility Quick Toggles -->
        <button id="toggle-vision-btn" class="a11y-btn ${document.body.classList.contains('vision-mode') ? 'active' : ''}" title="Toggle Vision-Friendly Mode">
          👁️ <span>Vision</span>
        </button>
        <button id="toggle-hearing-btn" class="a11y-btn ${document.body.classList.contains('hearing-mode') ? 'active' : ''}" title="Toggle Hearing-Friendly Mode">
          🦻 <span>Hearing</span>
        </button>
        <!-- Top Urgent Help Beacon -->
        <button id="top-emergency-btn" class="btn btn-urgent" style="padding: 8px 18px; min-height: 42px; font-size: 15px; font-weight: 800;">
          🚨 ${t('btnHelp')}
        </button>
      </div>
    `;

    document.getElementById("role-select")?.addEventListener("change", (e) => onRoleSelect(e.target.value));
    document.getElementById("lang-select")?.addEventListener("change", (e) => setLanguage(e.target.value));
    document.getElementById("toggle-vision-btn")?.addEventListener("click", () => {
      document.body.classList.toggle("vision-mode");
      renderNavbar(activeTab, onTabSelect, currentRole, onRoleSelect);
    });
    document.getElementById("toggle-hearing-btn")?.addEventListener("click", () => {
      document.body.classList.toggle("hearing-mode");
      renderNavbar(activeTab, onTabSelect, currentRole, onRoleSelect);
    });
    document.getElementById("top-emergency-btn")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("openEmergency")));
  }

  // 2. Horizontal Main Tabs Quick Bar (All Tabs Clearly Visible)
  if (horizontalTabs) {
    horizontalTabs.innerHTML = `
      ${currentTabsList.map(tab => `
        <button class="tab-pill ${activeTab === tab.id ? 'active' : ''}" data-tab="${tab.id}">
          <span style="font-size: 16px;">${tab.icon}</span>
          <span>${tab.label}</span>
        </button>
      `).join('')}
      <button class="tab-pill emergency-tab" id="quick-bar-emergency-btn">
        <span>🚨</span>
        <span>${t('btnHelp')}</span>
      </button>
    `;

    horizontalTabs.querySelectorAll(".tab-pill[data-tab]").forEach(btn => {
      btn.addEventListener("click", () => onTabSelect(btn.getAttribute("data-tab")));
    });
    document.getElementById("quick-bar-emergency-btn")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("openEmergency")));
  }

  // 3. Side Navigation Menu (Desktop/Tablet)
  if (sideNav) {
    sideNav.innerHTML = `
      <div class="brand-header">
        <div class="brand-icon">
          <img src="assets/logo.jpg" alt="SOLYA Logo" onerror="this.parentElement.innerHTML='S'" />
        </div>
        <div class="brand-titles">
          <h1>${t('appName')}</h1>
          <p class="brand-tagline">${t('tagline')}</p>
        </div>
      </div>

      <div class="nav-subhead">Main Navigation</div>

      <ul class="nav-menu">
        ${currentTabsList.map(tab => `
          <li>
            <button class="nav-item ${activeTab === tab.id ? 'active' : ''}" data-tab="${tab.id}">
              <span class="icon">${tab.icon}</span>
              <span>${tab.label}</span>
            </button>
          </li>
        `).join('')}

        <div class="nav-divider"></div>

        <li>
          <button class="nav-item emergency-nav-btn" id="nav-emergency-btn">
            <span class="icon">🚨</span> <span>${t('btnHelp')}</span>
          </button>
        </li>
      </ul>
    `;

    sideNav.querySelectorAll(".nav-item[data-tab]").forEach(btn => {
      btn.addEventListener("click", () => onTabSelect(btn.getAttribute("data-tab")));
    });
    document.getElementById("nav-emergency-btn")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("openEmergency")));
  }

  // 4. Mobile Bottom Bar
  if (mobileNav) {
    const mobilePrimaryTabs = currentTabsList.slice(0, 4);

    mobileNav.innerHTML = `
      ${mobilePrimaryTabs.map(tab => `
        <button class="mobile-nav-item ${activeTab === tab.id ? 'active' : ''}" data-tab="${tab.id}">
          <span class="icon">${tab.icon}</span>
          <span>${tab.label}</span>
        </button>
      `).join('')}
      <button class="mobile-nav-item ${!mobilePrimaryTabs.some(t => t.id === activeTab) ? 'active' : ''}" id="mobile-more-tabs-btn">
        <span class="icon">☰</span>
        <span>All Tabs</span>
      </button>
      <button class="mobile-nav-item" id="mobile-emergency-btn" style="color: var(--emergency-red); font-weight: 800;">
        <span class="icon">🚨</span>
        <span>Help</span>
      </button>
    `;

    mobileNav.querySelectorAll(".mobile-nav-item[data-tab]").forEach(btn => {
      btn.addEventListener("click", () => onTabSelect(btn.getAttribute("data-tab")));
    });

    document.getElementById("mobile-emergency-btn")?.addEventListener("click", () => window.dispatchEvent(new CustomEvent("openEmergency")));

    document.getElementById("mobile-more-tabs-btn")?.addEventListener("click", () => {
      openMobileTabsDrawer(currentTabsList, activeTab, onTabSelect);
    });
  }
}

// Drawer for Mobile to access every single tab
function openMobileTabsDrawer(tabsList, activeTab, onTabSelect) {
  const drawer = document.createElement("div");
  drawer.className = "modal-overlay";
  drawer.innerHTML = `
    <div class="modal-card" style="margin-top: auto; border-bottom-left-radius: 0; border-bottom-right-radius: 0; max-height: 80vh;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 20px; font-weight: 800;">All Solya Tabs</h3>
        <button id="close-drawer-btn" class="btn btn-secondary" style="min-height: 38px; padding: 6px 14px;">✕ Close</button>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
        ${tabsList.map(t => `
          <button class="btn ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'} drawer-tab-btn" data-id="${t.id}" style="justify-content: flex-start; padding: 12px; font-size: 15px;">
            <span style="font-size: 20px; margin-right: 8px;">${t.icon}</span>
            <span>${t.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(drawer);

  drawer.querySelector("#close-drawer-btn").addEventListener("click", () => drawer.remove());

  drawer.querySelectorAll(".drawer-tab-btn").forEach(b => {
    b.addEventListener("click", () => {
      const id = b.getAttribute("data-id");
      drawer.remove();
      onTabSelect(id);
    });
  });
}
