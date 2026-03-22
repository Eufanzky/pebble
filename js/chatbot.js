// ========== CHATBOT ==========
let chatOpen = false;
let chatHistory = [];

const pebbleResponses = {
  greetings: {
    patterns: ['hi', 'hello', 'hey', 'hola', 'sup', 'what\'s up', 'good morning', 'good afternoon', 'good evening', 'howdy'],
    replies: [
      "Hey there! I'm so glad you're here. How can I help you today?",
      "Hi friend! Ready to make today count? Tell me what's on your mind.",
      "Hello! I've been waiting for you. What are we working on?",
      "Hey! It's always nice to chat with you. What do you need?"
    ]
  },
  motivation: {
    patterns: ['motivat', 'can\'t focus', 'don\'t want to', 'lazy', 'procrastinat', 'don\'t feel like', 'unmotivated', 'tired', 'exhausted', 'burnt out', 'burnout'],
    replies: [
      "I get it. Some days are harder than others. How about we start with just 5 minutes? You'd be surprised how often that turns into 25.",
      "You know what? Even showing up counts. The fact that you're here means you care. Let's try one tiny task together.",
      "Feeling stuck is totally normal. Try this: pick the easiest thing on your list and do just that. Momentum is magic.",
      "Your brain might be telling you to avoid work, but your heart brought you here. Let's meet in the middle \u2014 one small step.",
      "Rest is important too. If you're truly burnt out, taking a break IS productive. Your brain needs time to recharge."
    ]
  },
  study: {
    patterns: ['study', 'learn', 'exam', 'test', 'quiz', 'homework', 'assignment', 'reading', 'chapter', 'notes', 'lecture', 'class'],
    replies: [
      "For studying, I love the Pomodoro method: 25 minutes on, 5 off. Want to start a focus session? Head to the Study Room!",
      "Here's a tip: before you start reading, skim the headings and summary first. It gives your brain a roadmap.",
      "Try the 'teach it back' method \u2014 after studying something, explain it like you're teaching a friend. You'll spot gaps in your understanding instantly.",
      "Break your study session into chunks. Your brain absorbs more in shorter, focused bursts than in long marathon sessions.",
      "Don't just re-read! Active recall (testing yourself) is 3x more effective. Try covering your notes and recalling key points."
    ]
  },
  tasks: {
    patterns: ['task', 'todo', 'to do', 'to-do', 'what should i', 'what do i', 'what\'s next', 'next task', 'overwhelm', 'too much'],
    replies: [
      () => {
        const next = state.tasks.find(t => !t.completed);
        if (next) return `Your next task is: "${next.title}" (${next.time}). Want to break it down into smaller steps? You can do that on the Today page!`;
        return "You've completed all your tasks! Amazing work. Take a well-deserved break, you've earned it.";
      },
      () => {
        const done = state.tasks.filter(t => t.completed).length;
        const total = state.tasks.length;
        if (done === 0) return "You haven't started yet, and that's okay! Pick the smallest task first \u2014 it'll feel great to check it off.";
        if (done === total) return "All tasks done! You're a productivity champion today. Seriously, be proud of yourself.";
        return `You've done ${done} out of ${total} tasks. That's real progress! Keep going, one at a time.`;
      }
    ]
  },
  stress: {
    patterns: ['stress', 'anxious', 'anxiety', 'worried', 'panic', 'scared', 'nervous', 'overwhelm', 'too much', 'can\'t handle', 'freaking out'],
    replies: [
      "Hey, take a deep breath with me. In for 4 counts... hold for 4... out for 4. You're going to be okay.",
      "When everything feels like too much, zoom in on just ONE thing. Not the whole list \u2014 just the next small step.",
      "It's okay to feel overwhelmed. Here's what helps: write down everything stressing you out, then circle the ONE thing you can control right now.",
      "Remember: you don't have to do everything perfectly. Done is better than perfect, every single time.",
      "Your feelings are valid. Take a moment, get some water, step outside for fresh air. The work will still be here, but you need to take care of YOU first."
    ]
  },
  breaks: {
    patterns: ['break', 'rest', 'relax', 'pause', 'stop', 'done for today', 'take a break', 'need a break'],
    replies: [
      "Great idea! Here are some break ideas: take a short walk, stretch, grab water, or look out a window. Even 5 minutes helps.",
      "Your brain actually processes and consolidates information during rest. So taking a break IS part of learning!",
      "Try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. Your eyes will thank you.",
      "Rest without guilt. You're not being lazy \u2014 you're recharging. Come back when you're ready, I'll be here."
    ]
  },
  time: {
    patterns: ['time', 'schedule', 'plan', 'when', 'deadline', 'late', 'due', 'manage time', 'time management'],
    replies: [
      "Time management tip: try time-blocking. Assign specific hours to specific tasks. It reduces decision fatigue.",
      "If you're racing a deadline, focus on the 20% of work that creates 80% of the value. What's the most important part?",
      "Here's a trick: estimate how long a task will take, then add 50%. We almost always underestimate. Be kind to future-you.",
      "Try working in 25-minute focus sprints! Head to the Study Room to start a timer. Short bursts keep you sharp."
    ]
  },
  pebble: {
    patterns: ['pebble', 'who are you', 'what are you', 'your name', 'about you', 'tell me about'],
    replies: [
      "I'm Pebble! Your cozy study companion. I'm here to keep you company, cheer you on, and gently nudge you in the right direction.",
      "I'm a little cat who loves helping people focus. I float, I blink, and I believe in you. That's basically my whole deal.",
      "I'm Pebble \u2014 think of me as your study buddy who never judges, always encourages, and occasionally reminds you to drink water."
    ]
  },
  thanks: {
    patterns: ['thank', 'thanks', 'appreciate', 'helpful', 'you\'re the best', 'love you', 'great advice'],
    replies: [
      "Aww, you're making me blush! (Can cats blush? I think I just did.) You're very welcome!",
      "That means so much to me! Remember, YOU did the hard work. I'm just here cheering from the sidelines.",
      "You're welcome! Seeing you try your best is the only thanks I need. Now go be awesome!"
    ]
  },
  fallback: [
    "Hmm, I'm not sure about that one, but I do know this: you're doing great just by showing up today.",
    "I might not have the perfect answer, but I'm always here to listen. Want to talk about your tasks or need some motivation?",
    "That's a tough one! Here's what I can help with: study tips, motivation, managing your tasks, or just being a friendly ear.",
    "I'm just a little cat, so I might not know everything. But I know YOU'RE capable of amazing things. Can I help with studying or tasks?",
    "Not sure about that, but how about this: take a breath, pick your next small task, and know that I'm rooting for you!"
  ]
};

function toggleChat() {
  chatOpen = !chatOpen;
  const fab = document.getElementById('chatFab');
  const win = document.getElementById('chatWindow');

  fab.classList.toggle('open', chatOpen);
  fab.classList.remove('has-unread');

  if (chatOpen) {
    win.classList.add('open');
    if (!state.reduceAnimations) {
      gsap.fromTo(win,
        { opacity: 0, y: 16, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.4)' }
      );
    }
    document.getElementById('chatInput').focus();

    // Send welcome message if first time
    if (chatHistory.length === 0) {
      sendPebbleMessage(getWelcomeMessage());
      setTimeout(() => showQuickReplies(), 600);
    }
  } else {
    if (!state.reduceAnimations) {
      gsap.to(win, {
        opacity: 0, y: 16, scale: 0.95, duration: 0.25, ease: 'power2.in',
        onComplete: () => win.classList.remove('open')
      });
    } else {
      win.classList.remove('open');
    }
  }
}

function getWelcomeMessage() {
  const hour = new Date().getHours();
  const done = state.tasks.filter(t => t.completed).length;
  const total = state.tasks.length;

  if (hour < 12) {
    return "Good morning! I'm Pebble, your study buddy. How can I help you today? Ask me for study tips, motivation, or help with your tasks!";
  } else if (hour < 17) {
    if (done > 0) {
      return `Hey! You've already knocked out ${done} task${done > 1 ? 's' : ''} today. That's awesome! What else can I help with?`;
    }
    return "Good afternoon! Ready to get some work done? I've got study tips, motivation, and friendly vibes. What do you need?";
  } else if (hour < 22) {
    return "Good evening! Whether you're wrapping up or just getting started, I'm here for you. How can I help?";
  } else {
    return "Hey night owl! It's getting late. Remember, rest is productive too. But if you need to push through, I'm here with you.";
  }
}

function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  hideQuickReplies();
  addUserMessage(text);

  // Show typing indicator
  showTyping();

  // Generate response with slight delay for natural feel
  const delay = 600 + Math.random() * 800;
  setTimeout(() => {
    hideTyping();
    const response = generateResponse(text);
    sendPebbleMessage(response);
    setTimeout(() => showQuickReplies(), 400);
  }, delay);
}

function sendQuickReply(text) {
  document.getElementById('chatInput').value = text;
  sendMessage();
}

function addUserMessage(text) {
  chatHistory.push({ from: 'user', text });
  const container = document.getElementById('chatMessages');
  const msg = document.createElement('div');
  msg.className = 'chat-msg user';
  msg.innerHTML = `
    <div class="chat-msg-avatar">You</div>
    <div class="chat-msg-bubble">${escapeHtml(text)}</div>
  `;
  container.appendChild(msg);

  if (!state.reduceAnimations) {
    gsap.fromTo(msg,
      { opacity: 0, x: 15, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
    );
  }

  scrollChat();
}

function sendPebbleMessage(text) {
  chatHistory.push({ from: 'pebble', text });
  const container = document.getElementById('chatMessages');
  const msg = document.createElement('div');
  msg.className = 'chat-msg pebble';
  msg.innerHTML = `
    <div class="chat-msg-avatar">🐱</div>
    <div class="chat-msg-bubble">${text}</div>
  `;
  container.appendChild(msg);

  if (!state.reduceAnimations) {
    gsap.fromTo(msg,
      { opacity: 0, x: -15, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
    );
  }

  scrollChat();
}

function showTyping() {
  const container = document.getElementById('chatMessages');
  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.id = 'chatTyping';
  typing.innerHTML = `
    <div class="chat-msg-avatar" style="background:var(--pebble-color);">🐱</div>
    <div class="chat-typing-dots">
      <div class="chat-typing-dot"></div>
      <div class="chat-typing-dot"></div>
      <div class="chat-typing-dot"></div>
    </div>
  `;
  container.appendChild(typing);

  if (!state.reduceAnimations) {
    const dots = typing.querySelectorAll('.chat-typing-dot');
    gsap.to(dots, {
      y: -4,
      duration: 0.4,
      ease: 'sine.inOut',
      stagger: { each: 0.15, repeat: -1, yoyo: true }
    });
  }

  scrollChat();
}

function hideTyping() {
  const typing = document.getElementById('chatTyping');
  if (typing) typing.remove();
}

function showQuickReplies() {
  const container = document.getElementById('chatQuickReplies');
  const done = state.tasks.filter(t => t.completed).length;

  const replies = [
    "What's my next task?",
    "I need motivation",
    "Give me a study tip",
    "I'm stressed"
  ];

  if (done > 0 && done < state.tasks.length) {
    replies[0] = "How am I doing?";
  } else if (done === state.tasks.length && state.tasks.length > 0) {
    replies[0] = "I finished everything!";
  }

  container.innerHTML = replies.map(r =>
    `<button class="chat-quick-btn" onclick="sendQuickReply('${r}')">${r}</button>`
  ).join('');

  if (!state.reduceAnimations) {
    gsap.fromTo(container.children,
      { opacity: 0, y: 8, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.25, stagger: 0.05, ease: 'power2.out' }
    );
  }
}

function hideQuickReplies() {
  document.getElementById('chatQuickReplies').innerHTML = '';
}

function generateResponse(input) {
  const lower = input.toLowerCase();

  // Check each category
  for (const [category, data] of Object.entries(pebbleResponses)) {
    if (category === 'fallback') continue;

    const matched = data.patterns.some(p => lower.includes(p));
    if (matched) {
      const reply = data.replies[Math.floor(Math.random() * data.replies.length)];
      return typeof reply === 'function' ? reply() : reply;
    }
  }

  // Fallback
  return pebbleResponses.fallback[Math.floor(Math.random() * pebbleResponses.fallback.length)];
}

function scrollChat() {
  const container = document.getElementById('chatMessages');
  container.scrollTop = container.scrollHeight;
}

function handleChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Pebble proactive nudge after inactivity
let chatNudgeTimeout = null;

function startChatNudge() {
  clearTimeout(chatNudgeTimeout);
  chatNudgeTimeout = setTimeout(() => {
    if (!chatOpen) {
      const fab = document.getElementById('chatFab');
      fab.classList.add('has-unread');
    }
  }, 60000); // Pulse after 1 minute of no chat interaction
}
