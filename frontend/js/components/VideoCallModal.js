// SOLYA Video Call Component
// Working simulation for Family Video Calls and Doctor Consultations with captions, mute, and camera controls

let activeVideoModal = null;

function openVideoCallModal(targetName = "Priya Sharma") {
  if (activeVideoModal) return;

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "video-call-modal";

  modal.innerHTML = `
    <div class="modal-card" style="max-width: 760px; padding: 20px; background: #0F172A; border-radius: 20px;">
      <!-- Call Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: #FFFFFF;">
        <div>
          <h3 style="font-size: 22px; font-weight: 800; color: #FFFFFF;">${targetName}</h3>
          <span style="font-size: 14px; color: #34D399;">● Connected (Demo Mode • Encrypted)</span>
        </div>
        <div class="badge badge-urgent" style="font-size: 13px;">
          🔴 CAMERA ACTIVE
        </div>
      </div>

      <!-- Main Video Simulation Area -->
      <div class="video-call-box">
        <div class="video-feed-mock">
          <div style="text-align: center;">
            <div style="font-size: 72px; margin-bottom: 10px;">
              ${targetName.includes("Doctor") || targetName.includes("Mehta") ? '👩‍⚕️' : '👩'}
            </div>
            <div style="font-size: 20px; font-weight: 700; color: #FFFFFF;">
              ${targetName}
            </div>
            <div style="font-size: 14px; color: #94A3B8; margin-top: 4px;">
              "Namaste Rajesh-ji! It is so good to see you today."
            </div>
          </div>
        </div>

        <!-- Live Closed Captions Banner (Hearing-Friendly Mode) -->
        <div class="video-captions-banner" id="video-captions">
          💬 [Captions]: "Rajesh-ji, I can hear you clearly. How is your knee feeling today?"
        </div>

        <!-- Call Action Controls -->
        <div class="video-controls-row">
          <button id="call-mute-btn" class="video-control-btn" title="Mute Microphone">
            🎤
          </button>
          <button id="call-camera-btn" class="video-control-btn" title="Toggle Camera">
            📷
          </button>
          <button id="call-flip-btn" class="video-control-btn" title="Flip Camera">
            🔄
          </button>
          <button id="call-end-btn" class="video-control-btn btn-end-call" title="End Call">
            📞
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  activeVideoModal = modal;

  let isMuted = false;
  let isCameraOn = true;

  modal.querySelector("#call-mute-btn").addEventListener("click", (e) => {
    isMuted = !isMuted;
    e.currentTarget.style.background = isMuted ? "rgba(220, 38, 38, 0.7)" : "rgba(255, 255, 255, 0.2)";
    e.currentTarget.innerText = isMuted ? "🔇" : "🎤";
    alert(isMuted ? "Microphone muted" : "Microphone active");
  });

  modal.querySelector("#call-camera-btn").addEventListener("click", (e) => {
    isCameraOn = !isCameraOn;
    e.currentTarget.style.background = !isCameraOn ? "rgba(220, 38, 38, 0.7)" : "rgba(255, 255, 255, 0.2)";
    alert(isCameraOn ? "Camera enabled" : "Camera paused");
  });

  modal.querySelector("#call-flip-btn").addEventListener("click", () => {
    alert("Switched to front/rear camera view.");
  });

  modal.querySelector("#call-end-btn").addEventListener("click", () => {
    modal.remove();
    activeVideoModal = null;
    alert("Call ended.");
  });
}

window.addEventListener("startVideoCall", (e) => {
  openVideoCallModal(e.detail?.targetName || "Priya Sharma");
});
