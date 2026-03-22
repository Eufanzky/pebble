// ========== GSAP ANIMATIONS ==========

// Pebble floating animation
function initPebbleAnimations() {
  if (state.reduceAnimations) return;

  // Cat float
  gsap.to('.cat-container', {
    y: -8,
    duration: 1.5,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true
  });

  // Cat blink
  gsap.to('.cat-eye:not(.sleepy)', {
    scaleY: 0.1,
    duration: 0.15,
    ease: 'power2.inOut',
    repeat: -1,
    repeatDelay: 3.5,
    yoyo: true
  });

  // Tail wag
  gsap.to('.cat-tail', {
    rotation: -15,
    duration: 1.2,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    transformOrigin: 'left center'
  });

  // Sparkle animation
  gsap.utils.toArray('.cat-sparkle').forEach((sparkle, i) => {
    gsap.to(sparkle, {
      y: -10,
      opacity: 1,
      scale: 1.1,
      duration: 0.75,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 0.3
    });
    gsap.set(sparkle, { opacity: 0, scale: 0.5 });
  });

  // Zzz float
  gsap.to('.cat-zzz', {
    y: -8,
    opacity: 1,
    duration: 1,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true
  });
}

// Animate screen content on entry
function animateScreenContent(screenName) {
  if (state.reduceAnimations) return;

  const screen = document.getElementById('screen-' + screenName);
  if (!screen) return;

  switch (screenName) {
    case 'today':
      animateTodayScreen(screen);
      break;
    case 'documents':
      animateDocumentsScreen(screen);
      break;
    case 'study':
      animateStudyScreen(screen);
      break;
    case 'settings':
      animateSettingsScreen(screen);
      break;
  }
}

function animateTodayScreen(screen) {
  const tl = gsap.timeline();

  // Header
  tl.fromTo(screen.querySelector('.screen-header'),
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  );

  // Progress bar
  tl.fromTo(screen.querySelector('.progress-area'),
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
    '-=0.2'
  );

  // Task cards stagger
  const cards = screen.querySelectorAll('.task-card');
  if (cards.length) {
    tl.fromTo(cards,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' },
      '-=0.15'
    );
  }

  // Focus panel slide in
  const focusPanel = screen.querySelector('.focus-panel');
  if (focusPanel) {
    tl.fromTo(focusPanel,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' },
      '-=0.3'
    );
  }
}

function animateDocumentsScreen(screen) {
  const tl = gsap.timeline();

  tl.fromTo(screen.querySelector('.screen-header'),
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  );

  const docCards = screen.querySelectorAll('.doc-card');
  if (docCards.length) {
    tl.fromTo(docCards,
      { opacity: 0, y: 25, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.1, ease: 'back.out(1.2)' },
      '-=0.2'
    );
  }

  const dropZone = screen.querySelector('.drop-zone');
  if (dropZone) {
    tl.fromTo(dropZone,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
      '-=0.15'
    );
  }
}

function animateStudyScreen(screen) {
  const tl = gsap.timeline();

  tl.fromTo(screen.querySelector('.screen-header'),
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  );

  // Room card scale in
  const roomCard = screen.querySelector('.active-room-card');
  if (roomCard) {
    tl.fromTo(roomCard,
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.3)' },
      '-=0.2'
    );
  }

  // Timer ring draw
  const timerRing = screen.querySelector('.timer-ring-progress');
  if (timerRing) {
    const circumference = 2 * Math.PI * 90;
    gsap.fromTo(timerRing,
      { strokeDashoffset: circumference },
      { strokeDashoffset: circumference * (1 - (1 - timerSeconds / TIMER_TOTAL)), duration: 1, ease: 'power2.out', delay: 0.3 }
    );
  }

  // Avatars pop in
  const avatars = screen.querySelectorAll('.room-avatar');
  if (avatars.length) {
    tl.fromTo(avatars,
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(2)' },
      '-=0.3'
    );
  }

  // Room cards slide in
  const roomCards = screen.querySelectorAll('.room-card-small');
  if (roomCards.length) {
    tl.fromTo(roomCards,
      { opacity: 0, x: 30 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
      '-=0.2'
    );
  }
}

function animateSettingsScreen(screen) {
  const tl = gsap.timeline();

  tl.fromTo(screen.querySelector('.screen-header'),
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
  );

  const sections = screen.querySelectorAll('.settings-section');
  if (sections.length) {
    tl.fromTo(sections,
      { opacity: 0, y: 25, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: 'power2.out' },
      '-=0.2'
    );
  }
}

// Initial page load animation
function playEntryAnimation() {
  if (state.reduceAnimations) return;

  const tl = gsap.timeline();

  // Sidebar slide in
  tl.fromTo('.sidebar',
    { x: -260, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
  );

  // Brand fade in
  tl.fromTo('.sidebar-brand',
    { opacity: 0, y: -10 },
    { opacity: 0.9, y: 0, duration: 0.4, ease: 'power2.out' },
    '-=0.3'
  );

  // Pebble bounce in
  tl.fromTo('.cat-container',
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
    '-=0.2'
  );

  // Speech bubble
  tl.fromTo('.sidebar-speech-bubble',
    { opacity: 0, y: 8, scale: 0.9 },
    { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' },
    '-=0.2'
  );

  // Nav links stagger
  tl.fromTo('.nav-link',
    { opacity: 0, x: -15 },
    { opacity: 1, x: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' },
    '-=0.2'
  );

  // Right panel slide in
  tl.fromTo('.right-panel',
    { x: 320, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' },
    '-=0.4'
  );

  // Main content
  tl.add(() => animateScreenContent(state.currentScreen), '-=0.3');
}

// Hover micro-interactions
function initHoverAnimations() {
  if (state.reduceAnimations) return;

  // Nav link hover glow
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      if (!link.classList.contains('active')) {
        gsap.to(link, { x: 3, duration: 0.2, ease: 'power2.out' });
      }
    });
    link.addEventListener('mouseleave', () => {
      if (!link.classList.contains('active')) {
        gsap.to(link, { x: 0, duration: 0.2, ease: 'power2.out' });
      }
    });
  });
}
