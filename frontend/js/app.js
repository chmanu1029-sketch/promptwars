// SOLYA Main Application Orchestrator
// State management, routing, role switching, and component lifecycle

class SolyaApp {
  constructor() {
    this.currentRole = localStorage.getItem("solya_role") || "senior";
    this.activeTab = this.getDefaultTabForRole(this.currentRole);
    this.contentArea = document.getElementById("content-area");
    this.init();
  }

  getDefaultTabForRole(role) {
    if (role === 'family') return 'family_dash';
    if (role === 'doctor') return 'doctor_dash';
    return 'home';
  }

  init() {
    this.setupEventListeners();
    this.render();

    // Check if first time user to show onboarding
    if (!localStorage.getItem("solya_onboarded")) {
      setTimeout(() => {
        openOnboardingModal(() => this.render());
      }, 500);
    }
  }

  setupEventListeners() {
    window.addEventListener("languageChanged", () => {
      this.render();
    });

    window.addEventListener("navTab", (e) => {
      if (e.detail?.tab) {
        this.navigateTo(e.detail.tab);
      }
    });

    window.addEventListener("speechStarted", () => {
      // Visual indicator for accessibility
      console.log("Solya speech active");
    });
  }

  setRole(newRole) {
    this.currentRole = newRole;
    localStorage.setItem("solya_role", newRole);
    this.activeTab = this.getDefaultTabForRole(newRole);
    this.render();
  }

  navigateTo(tab) {
    this.activeTab = tab;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render() {
    renderNavbar(
      this.activeTab,
      (tab) => this.navigateTo(tab),
      this.currentRole,
      (role) => this.setRole(role)
    );

    this.renderContent();
  }

  renderContent() {
    if (!this.contentArea) return;

    // Senior views
    if (this.activeTab === 'home') {
      renderSeniorHome(this.contentArea, (tab) => this.navigateTo(tab));
    } else if (this.activeTab === 'health') {
      renderMyHealth(this.contentArea, (tab) => this.navigateTo(tab));
    } else if (this.activeTab === 'care') {
      renderCarePlans(this.contentArea, (tab) => this.navigateTo(tab));
    } else if (this.activeTab === 'family') {
      renderFamily(this.contentArea, (tab) => this.navigateTo(tab));
    } else if (this.activeTab === 'medicines') {
      renderMedications(this.contentArea, (tab) => this.navigateTo(tab));
    } else if (this.activeTab === 'appointments') {
      renderAppointments(this.contentArea, (tab) => this.navigateTo(tab));
    } else if (this.activeTab === 'documents') {
      renderDocuments(this.contentArea, (tab) => this.navigateTo(tab));
    } else if (this.activeTab === 'timeline') {
      renderTimeline(this.contentArea, (tab) => this.navigateTo(tab));
    } else if (this.activeTab === 'devices') {
      renderDevices(this.contentArea, (tab) => this.navigateTo(tab));
    } else if (this.activeTab === 'assistant') {
      renderAssistant(this.contentArea, (tab) => this.navigateTo(tab));
    } else if (this.activeTab === 'scam') {
      renderScamProtection(this.contentArea, (tab) => this.navigateTo(tab));
    } else if (this.activeTab === 'tutor') {
      renderPhoneTutor(this.contentArea, (tab) => this.navigateTo(tab));
    } else if (this.activeTab === 'settings') {
      renderSettings(this.contentArea, (tab) => this.navigateTo(tab));
    }
    // Family specific view
    else if (this.activeTab === 'family_dash') {
      renderFamilyDashboard(this.contentArea, (tab) => this.navigateTo(tab));
    }
    // Doctor specific view
    else if (this.activeTab === 'doctor_dash') {
      renderDoctorDashboard(this.contentArea, (tab) => this.navigateTo(tab));
    }
    else {
      renderSeniorHome(this.contentArea, (tab) => this.navigateTo(tab));
    }
  }
}

// Global bootstrap
document.addEventListener("DOMContentLoaded", () => {
  window.solyaApp = new SolyaApp();
});
