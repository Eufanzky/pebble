// ========== SETTINGS ==========
function setPebbleColor(el) {
  state.pebbleColor = el.dataset.color;
  state.pebbleDark = el.dataset.dark;
  saveState();
  document.documentElement.style.setProperty('--pebble-color', state.pebbleColor);
  document.documentElement.style.setProperty('--pebble-dark', state.pebbleDark);
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === state.pebbleColor);
  });

  // GSAP color swatch bounce
  if (!state.reduceAnimations) {
    gsap.fromTo(el, { scale: 1.2 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
  }
}

function setPersonality(el) {
  state.personality = el.dataset.personality;
  saveState();
  document.querySelectorAll('.personality-option').forEach(o => {
    o.classList.toggle('active', o.dataset.personality === state.personality);
  });
  speechIndex = 0;
  updateSpeech();
}

function setReadingLevel(val) {
  state.readingLevel = parseInt(val);
  saveState();
  document.getElementById('readingValue').textContent = val;
  document.getElementById('rightReadingLevel').textContent = val;
  renderDocs();
}

function setChunkSize(el) {
  state.chunkSize = el.dataset.chunk;
  saveState();
  document.querySelectorAll('.chunk-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.chunk === state.chunkSize);
  });
}

function toggleSetting(type) {
  if (type === 'animations') {
    state.reduceAnimations = !state.reduceAnimations;
    document.getElementById('toggleAnimations').classList.toggle('on', state.reduceAnimations);
    document.body.classList.toggle('reduce-animations', state.reduceAnimations);
  } else if (type === 'calm') {
    state.calmMode = !state.calmMode;
    document.getElementById('toggleCalm').classList.toggle('on', state.calmMode);
    updateGreeting();
    updateProgress();
    updateSpeech();
  }
  saveState();
}
