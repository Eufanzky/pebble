// ========== SCREEN SWITCHING ==========
function switchScreen(name) {
  state.currentScreen = name;
  saveState();

  const currentActive = document.querySelector('.screen.active');
  const nextScreen = document.getElementById('screen-' + name);

  if (currentActive && currentActive !== nextScreen && !state.reduceAnimations) {
    // GSAP screen transition
    gsap.to(currentActive, {
      opacity: 0,
      y: -12,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        currentActive.classList.remove('active');
        currentActive.style.cssText = '';
        nextScreen.classList.add('active');
        gsap.fromTo(nextScreen,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
        );
        animateScreenContent(name);
      }
    });
  } else {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    nextScreen.classList.add('active');
    if (!state.reduceAnimations) {
      animateScreenContent(name);
    }
  }

  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-link[data-screen="${name}"]`).classList.add('active');

  // Right panel
  document.querySelectorAll('.right-panel-section').forEach(s => s.classList.remove('active'));
  const rightId = 'right' + name.charAt(0).toUpperCase() + name.slice(1);
  const rightEl = document.getElementById(rightId);
  if (rightEl) rightEl.classList.add('active');
}

// ========== APPLY STATE ==========
function applyState() {
  // Pebble color
  document.documentElement.style.setProperty('--pebble-color', state.pebbleColor);
  document.documentElement.style.setProperty('--pebble-dark', state.pebbleDark);

  // Color swatch active
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === state.pebbleColor);
  });

  // Personality
  document.querySelectorAll('.personality-option').forEach(o => {
    o.classList.toggle('active', o.dataset.personality === state.personality);
  });

  // Reading level
  document.getElementById('readingSlider').value = state.readingLevel;
  document.getElementById('readingValue').textContent = state.readingLevel;
  document.getElementById('rightReadingLevel').textContent = state.readingLevel;

  // Chunk size
  document.querySelectorAll('.chunk-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.chunk === state.chunkSize);
  });

  // Toggles
  const animToggle = document.getElementById('toggleAnimations');
  animToggle.classList.toggle('on', state.reduceAnimations);
  document.body.classList.toggle('reduce-animations', state.reduceAnimations);

  const calmToggle = document.getElementById('toggleCalm');
  calmToggle.classList.toggle('on', state.calmMode);

  // Screen
  switchScreen(state.currentScreen);
}

// ========== GREETING ==========
function updateGreeting() {
  const hour = new Date().getHours();
  const banner = document.getElementById('greetingBanner');
  const text = document.getElementById('greetingText');
  const date = document.getElementById('greetingDate');

  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  date.textContent = new Date().toLocaleDateString('en-US', options);

  if (hour < 12) {
    text.textContent = state.calmMode ? 'Good morning' : 'Good morning \u2726';
    banner.style.display = 'block';
  } else if (hour >= 19) {
    text.textContent = state.calmMode ? "It's getting late \u2014 you've done enough today" : "It's getting late \u2014 you've done enough today \uD83C\uDF19";
    banner.style.display = 'block';
  } else {
    banner.style.display = 'none';
  }
}

// ========== TASKS ==========
function renderTasks() {
  const list = document.getElementById('taskList');
  list.innerHTML = '';

  state.tasks.forEach((task, index) => {
    const card = document.createElement('div');
    card.className = 'task-card glass-card' + (task.completed ? ' completed' : '');
    card.setAttribute('data-tag', task.tag);

    let subtaskHtml = '';
    if (task.hasSubtasks) {
      subtaskHtml = `
        <button class="breakdown-btn" onclick="breakdownTask(${task.id}, event)">
          ${task.expanded ? '' : '<span>\u2726</span>'} ${task.expanded ? 'Hide steps' : 'Break it down'}
        </button>
        <div class="subtask-list ${task.expanded ? 'show' : ''}" id="subtasks-${task.id}">
          ${task.subtasks.map((st, i) => `<div class="subtask-item ${task.expanded ? 'show' : ''}" style="transition-delay:${i * 0.08}s"><span class="subtask-dot"></span>${st}</div>`).join('')}
        </div>
      `;
    }

    card.innerHTML = `
      <div class="task-header">
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id}, event)"></div>
        <div class="task-content">
          <div class="task-title">${task.title}</div>
          <div class="task-meta">
            <span class="task-tag" data-tag="${task.tag}">${task.tag}</span>
            <span class="task-time">${task.time}</span>
            <span class="priority-dot ${task.priority}"></span>
          </div>
          ${subtaskHtml}
        </div>
      </div>
    `;

    list.appendChild(card);
  });
}

function toggleTask(id, e) {
  e.stopPropagation();
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  const cardIndex = state.tasks.indexOf(task);
  const cards = document.querySelectorAll('.task-card');
  const card = cards[cardIndex];

  task.completed = !task.completed;
  saveState();

  if (task.completed && !state.reduceAnimations) {
    // GSAP completion animation
    const checkbox = card.querySelector('.task-checkbox');
    gsap.fromTo(checkbox,
      { scale: 1 },
      { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' }
    );
    gsap.to(card, {
      x: 6, opacity: 0.5, duration: 0.4, ease: 'power2.out',
      onComplete: () => {
        renderTasks();
        updateProgress();
        updatePebbleMood();
        updateFocusPanel();
      }
    });
    setCatMood('excited', 2000);
    showToast('Nice work!');
  } else {
    renderTasks();
    updateProgress();
    updatePebbleMood();
    updateFocusPanel();
    if (task.completed) {
      setCatMood('excited', 2000);
      showToast('Nice work!');
    }
  }
}

function breakdownTask(id, e) {
  e.stopPropagation();
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  if (task.expanded) {
    task.expanded = false;
    saveState();
    renderTasks();
    return;
  }

  // Show shimmer first
  const subtaskList = document.getElementById('subtasks-' + id);
  const btn = e.currentTarget;
  btn.style.display = 'none';

  const shimmerContainer = document.createElement('div');
  shimmerContainer.style.marginTop = '10px';
  shimmerContainer.innerHTML = '<div class="shimmer-bar"></div><div class="shimmer-bar"></div><div class="shimmer-bar"></div>';
  btn.parentNode.appendChild(shimmerContainer);

  setTimeout(() => {
    task.expanded = true;
    saveState();
    renderTasks();
    // Animate subtasks in with GSAP
    setTimeout(() => {
      const items = document.querySelectorAll(`#subtasks-${id} .subtask-item`);
      if (!state.reduceAnimations) {
        gsap.fromTo(items,
          { opacity: 0, x: -15 },
          { opacity: 1, x: 0, duration: 0.3, stagger: 0.08, ease: 'power2.out',
            onStart: function() { this.targets().forEach(el => el.classList.add('show')); }
          }
        );
      } else {
        items.forEach(item => item.classList.add('show'));
      }
    }, 50);
  }, 1500);
}

function updateProgress() {
  const done = state.tasks.filter(t => t.completed).length;
  const total = state.tasks.length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  document.getElementById('progressCount').textContent = `${done} / ${total}`;

  if (!state.reduceAnimations) {
    gsap.to('#progressFill', { width: pct + '%', duration: 0.6, ease: 'power2.out' });
  } else {
    document.getElementById('progressFill').style.width = pct + '%';
  }

  let emoji = '\uD83C\uDF31';
  if (pct >= 100) emoji = '\uD83C\uDF89';
  else if (pct >= 50) emoji = '\uD83C\uDF33';
  else if (pct > 0) emoji = '\uD83C\uDF3F';

  document.getElementById('progressLabel').textContent = state.calmMode
    ? `Daily progress`
    : `Daily progress ${emoji}`;

  // Sidebar ring
  const circ = 97.4;
  const offset = circ - (circ * pct / 100);
  if (!state.reduceAnimations) {
    gsap.to('#sidebarRing', { attr: { 'stroke-dashoffset': offset }, duration: 0.6, ease: 'power2.out' });
  } else {
    document.getElementById('sidebarRing').style.strokeDashoffset = offset;
  }
}

function updateFocusPanel() {
  const next = state.tasks.find(t => !t.completed);
  const nameEl = document.getElementById('focusTaskName');
  const timeEl = document.getElementById('focusTaskTime');
  const rNameEl = document.getElementById('rightNextTask');
  const rTimeEl = document.getElementById('rightNextTime');

  if (next) {
    nameEl.textContent = next.title;
    timeEl.textContent = next.time;
    rNameEl.textContent = next.title;
    rTimeEl.textContent = next.time;
  } else {
    nameEl.textContent = 'All done for today!';
    timeEl.textContent = '';
    rNameEl.textContent = 'All done!';
    rTimeEl.textContent = '';
  }
}

// ========== DOCUMENTS ==========
function renderDocs() {
  const grid = document.getElementById('docsGrid');
  grid.innerHTML = '';

  documents.forEach(doc => {
    const card = document.createElement('div');
    card.className = 'doc-card glass-card';
    card.onclick = () => openDocModal(doc.id);

    const dots = Array.from({ length: 10 }, (_, i) =>
      `<div class="reading-dot ${i < state.readingLevel ? 'filled' : ''}"></div>`
    ).join('');

    card.innerHTML = `
      <div class="doc-icon">${doc.type === 'PDF' ? '\uD83D\uDCC4' : '\uD83D\uDCCB'}</div>
      <div class="doc-title">${doc.title}</div>
      <div class="doc-tags">
        ${doc.tags.map(t => `<span class="doc-tag">${t}</span>`).join('')}
      </div>
      <div class="reading-dots">
        ${dots}
        <span class="reading-level-label">Lv.${state.readingLevel}</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

let currentDocId = null;

function openDocModal(id) {
  const doc = documents.find(d => d.id === id);
  if (!doc) return;
  currentDocId = id;

  document.getElementById('modalTitle').textContent = doc.title;
  document.getElementById('modalTags').innerHTML = doc.tags.map(t => `<span class="doc-tag">${t}</span>`).join('');
  document.getElementById('modalReadingSlider').value = state.readingLevel;
  updateModalReading(state.readingLevel);
  document.getElementById('modalOriginal').textContent = doc.complex;

  const modal = document.getElementById('docModal');
  modal.classList.add('show');

  // GSAP modal entrance
  if (!state.reduceAnimations) {
    const content = modal.querySelector('.modal-content');
    gsap.fromTo(content,
      { scale: 0.92, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }
    );
  }
}

function updateModalReading(val) {
  val = parseInt(val);
  document.getElementById('modalReadingLabel').textContent = 'Level ' + val;

  const doc = documents.find(d => d.id === currentDocId);
  if (!doc) return;

  let text;
  if (val <= 3) text = doc.simple;
  else if (val <= 7) text = doc.medium;
  else text = doc.complex;

  document.getElementById('modalSimplified').textContent = text;
}

function closeModal() {
  const modal = document.getElementById('docModal');
  if (!state.reduceAnimations) {
    const content = modal.querySelector('.modal-content');
    gsap.to(content, {
      scale: 0.92, opacity: 0, y: 20, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        modal.classList.remove('show');
        content.style.cssText = '';
      }
    });
  } else {
    modal.classList.remove('show');
  }
}

function addDocTasks() {
  const doc = documents.find(d => d.id === currentDocId);
  if (!doc) return;

  doc.taskSnippets.forEach(snippet => {
    const exists = state.tasks.find(t => t.title === snippet);
    if (!exists) {
      state.tasks.push({
        id: Date.now() + Math.random(),
        title: snippet,
        tag: doc.tags[0] || 'Reading',
        time: '~15 min',
        priority: 'medium',
        completed: false,
        hasSubtasks: false,
        expanded: false,
        subtasks: []
      });
    }
  });

  saveState();
  renderTasks();
  updateProgress();
  updateFocusPanel();
  closeModal();
  showToast('Added to your tasks!');
}

function simulateUpload() {
  showToast('File upload simulated!');
}

// ========== STUDY ROOMS ==========
function renderRooms() {
  const scroll = document.getElementById('roomsScroll');
  scroll.innerHTML = '';

  studyRooms.forEach(room => {
    const card = document.createElement('div');
    card.className = 'room-card-small glass-card';
    card.onclick = () => showToast('Joining room...');

    const avatars = room.colors.slice(0, 5).map(c =>
      `<div class="room-card-avatar" style="background:${c}"></div>`
    ).join('');

    card.innerHTML = `
      <div class="room-emoji">${room.emoji}</div>
      <div class="room-card-name">${room.name}</div>
      <div class="room-card-status">${room.status}</div>
      <div class="room-card-avatars">${avatars}</div>
      <div class="room-card-count">${room.people} people</div>
    `;

    scroll.appendChild(card);
  });
}

// ========== PEBBLE MOOD ==========
function updatePebbleMood() {
  const done = state.tasks.filter(t => t.completed).length;
  const total = state.tasks.length;
  const cat = document.getElementById('catContainer');

  cat.classList.remove('mood-sleepy', 'mood-happy', 'mood-excited');

  const eyeL = document.getElementById('catEyeL');
  const eyeR = document.getElementById('catEyeR');
  eyeL.classList.remove('sleepy');
  eyeR.classList.remove('sleepy');

  if (done === 0) {
    eyeL.classList.add('sleepy');
    eyeR.classList.add('sleepy');
    cat.classList.add('mood-sleepy');
  } else if (done === total) {
    cat.classList.add('mood-excited');
  } else {
    cat.classList.add('mood-happy');
  }
}

function setCatMood(mood, duration) {
  const cat = document.getElementById('catContainer');
  cat.classList.remove('mood-sleepy', 'mood-happy', 'mood-excited');
  cat.classList.add('mood-' + mood);
  if (duration) {
    setTimeout(() => updatePebbleMood(), duration);
  }
}

// ========== SPEECH CYCLE ==========
let speechIndex = 0;
let speechInterval = null;

function startSpeechCycle() {
  updateSpeech();
  speechInterval = setInterval(updateSpeech, 8000);
}

function updateSpeech() {
  const done = state.tasks.filter(t => t.completed).length;
  const total = state.tasks.length;
  const hour = new Date().getHours();
  const msgs = messages[state.personality];

  let pool;
  if (hour >= 22 || hour < 5) pool = msgs.late;
  else if (done === total && total > 0) pool = msgs.done;
  else if (done > 0) pool = msgs.progress;
  else pool = msgs.idle;

  const msg = pool[speechIndex % pool.length];
  speechIndex++;

  const bubble = document.getElementById('speechBubble');
  if (!state.reduceAnimations) {
    gsap.fromTo(bubble,
      { opacity: 0, y: 6, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
    );
  }
  bubble.textContent = state.calmMode ? msg.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() : msg;

  // Also update right panel
  const rightMsg = document.getElementById('rightPebbleMsg');
  if (rightMsg) {
    rightMsg.textContent = pebbleTips[speechIndex % pebbleTips.length];
  }
}

// ========== TOAST ==========
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = state.calmMode ? msg.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim() : msg;

  if (!state.reduceAnimations) {
    gsap.fromTo(toast,
      { opacity: 0, y: 20, xPercent: -50 },
      { opacity: 1, y: 0, xPercent: -50, duration: 0.35, ease: 'back.out(1.4)' }
    );
    gsap.to(toast, {
      opacity: 0, y: 20, xPercent: -50,
      duration: 0.3, ease: 'power2.in', delay: 2.2,
      onComplete: () => toast.classList.remove('show')
    });
    toast.classList.add('show');
  } else {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
}
