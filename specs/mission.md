# Mission

Pebble lowers the mental effort of everyday work for neurodivergent adults.
It breaks big tasks into small steps, rewrites hard documents in plain language, and helps you start and stay focused.
A calm cat companion keeps you company without pressure.

## Who it is for

Neurodivergent adults: people with ADHD, autism, dyslexia, or a mix.
Pebble covers work, study, and life admin. It does not assume a job title or a school.

Common problems it targets:
- A task feels too big to start.
- A document is too dense to get through.
- Focus slips away, and the usual tools add guilt instead of help.

## What Pebble does

Each capability belongs to a named agent. Every named agent must be backed by real code; the app never shows an agent that does nothing.

| Capability | Agent | What the user gets |
|:--|:--|:--|
| Understand the request | Orchestrator | Pebble works out what you need and sends it to the right agent. |
| Task breakdown | CalmSense | A big task becomes small, time-boxed steps sized to your chunk-size preference. |
| Document simplification | SimplifyCore | A rewrite at your reading level, comprehension checks, and action items you can turn into tasks. |
| Encouragement | PebbleVoice | Specific, honest encouragement based on what you actually did. |
| Explanations | WhyBot | A plain-language "why" for every AI decision. |
| Adaptation | AdaptLens | Suggestions to adjust your preferences, based on how you use Pebble. You approve them; they are never applied silently. |
| Integrations | BridgeBot | Your plan goes to the tools you already use, starting with calendar export. |
| Solo focus | (UI) | A focus timer tied to one task step, with Pebble working beside you as a body double. |
| Distress support | Orchestrator | When you say you are overwhelmed, Pebble slows down and responds gently. |

## Principles (non-negotiable)

1. **Structure without guilt.** Many users need structure from outside to get started, but guilt makes them avoid the app, so Pebble gives the first without the second.
   - **Allowed:**
     - Visible time, shown neutrally (a calm time bar).
     - Progress that only ever adds up ("you finished 14 steps this month").
     - Reminders the user chooses and sets.
     - Accountability through presence (Pebble as a body double).
     - Near a deadline, an offer to make the task smaller.
   - **Banned:**
     - Streaks, or anything that resets to zero.
     - Counting missed days or time away.
     - Red or alarm styling for late items.
     - Loss framing ("don't lose your progress").
     - Nudges nobody asked for.
   - **Late tasks are "still open", not "overdue".** Pebble offers three choices: move it, make it smaller, or let it go. Letting go is a valid outcome, not a failure.
   - **Coming back is a fresh start.** Pebble never mentions how long you were away. Stopping a focus session early is fine.
2. **No silent AI.** Every AI action is logged with the agent name, its reasoning, and its safety status. The user can dismiss or undo it.
3. **Privacy first.** Collect only what a feature needs. Redact PII before any model call. Users can export all their data and delete their account. Uploaded documents are parsed, not stored.
4. **Pebble's voice.** Never shame, rush, or compare. Be specific rather than generic. Use short, plain sentences. This applies to UI copy as much as to prompts.
5. **Accessible by default.** Respect reduce-animations and calm mode everywhere. Full keyboard navigation and ARIA. Dark mode only, on a calm background.
6. **Honest claims.** The README, UI, and demo describe only what works.

## Non-goals

- Multi-user focus rooms and live presence. Maybe later, once there are real users; never with fake numbers.
- Gamification built on loss or comparison: streaks, leaderboards, and social comparison.
- Therapy, diagnosis, or crisis care. Distress support is a gentle pause, not treatment.
- Being tied to one cloud or AI vendor.

## What success looks like

- **Clean demo flow:** a 3-minute walkthrough on the live site with no mocked or broken steps.
- **Deployed live:** a public URL anyone can sign in to and try.
- **Honest README:** the features, architecture, and setup match the code.
- **Well-structured code:** clean architecture in the backend, feature-based frontend, tests and CI green (see `tech.stack.md`).
