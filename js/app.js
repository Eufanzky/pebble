// ========== INIT ==========
function init() {
  applyState();
  renderTasks();
  renderDocs();
  renderRooms();
  updateGreeting();
  updatePebbleMood();
  updateFocusPanel();
  startSpeechCycle();
  updateProgress();
  updateTimer();

  // GSAP animations
  initPebbleAnimations();
  initHoverAnimations();
  playEntryAnimation();

  // Chatbot nudge
  startChatNudge();
}

// ========== MODAL CLOSE ON OVERLAY CLICK ==========
document.getElementById('docModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// ========== START ==========
init();
