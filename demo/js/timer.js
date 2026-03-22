// ========== TIMER STATE ==========
let timerInterval = null;
let timerRunning = false;
let timerSeconds = 25 * 60;
const TIMER_TOTAL = 25 * 60;

// ========== TIMER ==========
function toggleTimer() {
  if (timerRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  timerRunning = true;
  const btn = document.getElementById('timerBtn');
  btn.textContent = 'Pause';
  btn.className = 'timer-btn pause';
  document.getElementById('timerAmbient').classList.add('show');

  timerInterval = setInterval(() => {
    timerSeconds--;
    if (timerSeconds <= 0) {
      timerSeconds = 0;
      clearInterval(timerInterval);
      timerRunning = false;
      btn.textContent = 'Start Focus Session';
      btn.className = 'timer-btn start';
      document.getElementById('timerAmbient').classList.remove('show');
      playChime();
      showToast('Great session! You focused for 25 minutes!');
      setCatMood('excited', 3000);
      timerSeconds = TIMER_TOTAL;
      setTimeout(updateTimer, 2000);
    }
    updateTimer();
  }, 1000);
}

function pauseTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
  const btn = document.getElementById('timerBtn');
  btn.textContent = 'Resume';
  btn.className = 'timer-btn start';
}

function updateTimer() {
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  document.getElementById('timerDisplay').textContent =
    String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

  // Ring progress
  const circ = 2 * Math.PI * 90; // ~565.5
  const progress = 1 - (timerSeconds / TIMER_TOTAL);
  const offset = circ * (1 - progress);
  document.getElementById('timerRingProgress').style.strokeDashoffset = offset;
}

function startFocusFromPanel() {
  switchScreen('study');
  if (!timerRunning) {
    setTimeout(toggleTimer, 300);
  }
}

// ========== AUDIO ==========
function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + 0.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.3);
      osc.stop(ctx.currentTime + i * 0.3 + 0.8);
    });
  } catch (e) {}
}
