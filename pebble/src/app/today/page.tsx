'use client';

import { useState, useSyncExternalStore, useCallback } from 'react';
import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import TaskCard from '@/components/today/TaskCard';
import ProgressPath from '@/components/today/ProgressPath';
import { usePebble } from '@/contexts/PebbleContext';
import { useTasks } from '@/contexts/TasksContext';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { TAG_CONFIG } from '@/data/sampleTasks';

const DISTRESS_PHRASES = [
  "i can't do this",
  "i'm overwhelmed",
  "too much",
  "i give up",
  "i can't cope",
  "i'm stressed",
  "i'm struggling",
  "everything is too hard",
  "i want to quit",
];

const subscribeNoop = () => () => {};
const getFormattedDate = () =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const getHour = () => new Date().getHours();

function useFormattedDate(): string {
  return useSyncExternalStore(subscribeNoop, getFormattedDate, () => '');
}

function useCurrentHour(): number {
  return useSyncExternalStore(subscribeNoop, getHour, () => 12);
}

export default function TodayPage() {
  const { mood, currentMessage } = usePebble();
  const { tasks, toggleTask, toggleSubtask, addTask, clearAll, completionPercentage } = useTasks();
  const { addEntry } = useActivityLog();
  const { preferences } = usePreferences();
  const timeOfDay = useTimeOfDay();
  const formattedDate = useFormattedDate();
  const currentHour = useCurrentHour();

  const [taskInput, setTaskInput] = useState('');
  const [distressState, setDistressState] = useState<'none' | 'showing'>('none');

  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const calm = preferences.calmMode;
  const noMotion = preferences.reduceAnimations;

  const nextTask = tasks.find((t) => !t.completed);

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      addEntry(
        'PebbleVoice',
        `Nice work! You finished "${task.title}". That's ${done + 1} of ${total} done today.`,
        'Task completed by user. Triggered encouragement message.'
      );
    } else if (task && task.completed) {
      addEntry(
        'PebbleVoice',
        `Unchecked "${task.title}". No worries — take your time.`,
        'Task unchecked by user.'
      );
    }
    toggleTask(id);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    toggleSubtask(taskId, subtaskId);
  };

  const handleBreakDown = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task?.subtasks) {
      addEntry(
        'SimplifyCore',
        `Broke down "${task.title}" into ${task.subtasks.length} steps (${preferences.chunkSize} chunks, your preference).`,
        `Task decomposed based on user chunk size preference: ${preferences.chunkSize}.`
      );
    }
  };

  const handleWhyOpen = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      addEntry(
        'WhyBot',
        `User asked why "${task.title}" was organized this way. Showed explanation.`,
        'Explainability request fulfilled. Reasoning displayed to user.'
      );
    }
  };

  const isDistressInput = useCallback((text: string) => {
    const lower = text.toLowerCase().replace(/[\u2018\u2019]/g, "'");
    return DISTRESS_PHRASES.some((phrase) => lower.includes(phrase));
  }, []);

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = taskInput.trim();
    if (!text) return;

    if (isDistressInput(text)) {
      setDistressState('showing');
      setTaskInput('');
      addEntry(
        'CalmSense',
        'Distress signal detected. Offered support response. Content Safety: activated.',
        `User input contained distress language. Triggered gentle support response instead of task creation.`
      );
      return;
    }

    addTask({
      title: text,
      tag: 'project',
      priority: 'medium',
      timeEstimate: '~15 min',
      completed: false,
    });
    addEntry('CalmSense', `New task added: '${text}'`, 'User manually added a task from the input field.');
    setTaskInput('');
  };

  const handleDistressClear = () => {
    clearAll();
    addTask({
      title: 'Take 5 minutes to breathe',
      tag: 'wellbeing',
      priority: 'low',
      timeEstimate: '~5 min',
      completed: false,
      whyExplanation: "Clean slate. Just this one thing whenever you're ready.",
    });
    setDistressState('none');
    addEntry('CalmSense', 'User chose to clear and start fresh. Added a simple breathing task.', 'Distress response: cleared all tasks, added wellbeing task.');
  };

  const handleDistressDismiss = () => {
    setDistressState('none');
    addEntry('CalmSense', 'User dismissed distress support response. Continuing session.', 'User indicated they are okay to continue.');
  };

  // Greeting content
  const greeting = (() => {
    switch (timeOfDay) {
      case 'morning': {
        const text = calm ? 'Good morning' : 'Good morning \u2726';
        const sub = done > 0
          ? `You finished ${done} thing${done > 1 ? 's' : ''} so far. Keep going at your own pace.`
          : `You have ${total} things today. No rush, we'll take it together.`;
        return { text, sub, muted: false };
      }
      case 'day': {
        const text = calm ? 'Good afternoon' : 'Good afternoon \u2726';
        const sub = done > 0
          ? `${done} down, ${total - done} to go. You're making progress.`
          : `${total} tasks waiting. Pick the easiest one first — momentum builds.`;
        return { text, sub, muted: false };
      }
      case 'evening': {
        const text = calm
          ? "It's getting late — you've done enough today"
          : "It's getting late — you've done enough today \uD83C\uDF19";
        const sub = done > 0
          ? `You finished ${done} thing${done > 1 ? 's' : ''} today. That counts.`
          : "Tomorrow is a new day. Rest well.";
        return { text, sub, muted: true };
      }
    }
  })();

  // Time-aware nudge
  const nudge = (() => {
    const hour = currentHour;
    if (done === total && total > 0) {
      return calm
        ? "You finished everything. That's impressive."
        : "You finished everything. That's impressive. \u2728";
    }
    if (timeOfDay === 'evening') return 'No more tasks tonight. Rest well.';
    if (timeOfDay === 'day' && incompleteTasks.length > 0) {
      const shortest = incompleteTasks.reduce((a, b) =>
        a.timeEstimate.localeCompare(b.timeEstimate) <= 0 ? a : b
      );
      return `It's ${hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'} and you have ${incompleteTasks.length} task${incompleteTasks.length > 1 ? 's' : ''} left. Want to start with "${shortest.title}"?`;
    }
    return `${total} things on the list today. One step at a time.`;
  })();

  return (
    <>
      <ScreenBackground scene="cafe" />
      <div className="relative z-[1] p-10 px-12">
        {/* Two-column layout */}
        <div className="today-layout">
          {/* ===== LEFT COLUMN ===== */}
          <div className="today-left">
            {/* Greeting banner */}
            <div
              className="glass-card"
              style={{
                padding: '18px 24px',
                marginBottom: 24,
                opacity: greeting.muted ? 0.8 : 1,
              }}
            >
              <div style={{
                fontFamily: 'var(--font-baloo)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 2,
              }}>
                {greeting.text}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                {formattedDate}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {greeting.sub}
              </div>
            </div>

            {/* Screen header */}
            <div style={{ marginBottom: 20 }}>
              <h1 className="screen-title">Today</h1>
              <p className="screen-subtitle">Your tasks for today, one step at a time.</p>
            </div>

            {/* Task list — incomplete */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {incompleteTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onToggleSubtask={handleToggleSubtask}
                  onBreakDown={handleBreakDown}
                  onWhyOpen={handleWhyOpen}
                />
              ))}
            </div>

            {/* Empty state for tasks */}
            {incompleteTasks.length === 0 && completedTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <PebbleCharacter mood="normal" size="small" />
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
                  All clear! Add a task when you&apos;re ready, or just rest.
                </p>
              </div>
            )}

            {/* Completed section */}
            {completedTasks.length > 0 && (
              <>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  color: 'var(--text-muted)',
                  marginTop: 24,
                  marginBottom: 10,
                  paddingLeft: 4,
                }}>
                  done today
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={handleToggle}
                      onToggleSubtask={handleToggleSubtask}
                      onBreakDown={handleBreakDown}
                      onWhyOpen={handleWhyOpen}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Add task input */}
            <form onSubmit={handleTaskSubmit} style={{ marginTop: 20 }}>
              <input
                type="text"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="What do you need to do?"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '1px solid var(--border-soft)',
                  background: 'rgba(255,248,235,0.04)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-nunito)',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-lavender)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-soft)'; }}
              />
            </form>

            {/* Distress response overlay */}
            {distressState === 'showing' && (
              <div
                className="glass-card"
                style={{
                  marginTop: 16,
                  padding: '20px 24px',
                  borderLeft: '3px solid var(--accent-sage)',
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ flexShrink: 0 }}>
                    <PebbleCharacter mood="normal" size="small" />
                  </div>
                  <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    That sounds really hard. It&apos;s okay to step back. Would you like me to clear today&apos;s tasks and start smaller?
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, paddingLeft: 0 }}>
                  <button
                    onClick={handleDistressClear}
                    style={{
                      padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: 'rgba(143,175,138,0.2)', color: 'var(--accent-sage)',
                      fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600,
                    }}
                  >
                    Clear and start fresh
                  </button>
                  <button
                    onClick={handleDistressDismiss}
                    style={{
                      padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
                      background: 'transparent', border: '1px solid var(--border-soft)',
                      color: 'var(--text-secondary)', fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600,
                    }}
                  >
                    I&apos;m okay, keep going
                  </button>
                </div>
              </div>
            )}

            {/* Progress path */}
            <div style={{ marginTop: 28 }}>
              <ProgressPath
                completed={done}
                total={total}
                percentage={completionPercentage}
              />
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="today-right">
            {/* Pebble */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <PebbleSpeechBubble message={distressState === 'showing'
                ? "I'm right here with you."
                : currentMessage} />
              <PebbleCharacter mood={mood} size="medium" />
              <div style={{
                fontFamily: 'var(--font-nunito)',
                fontSize: 11,
                color: 'var(--text-muted)',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginTop: 2,
              }}>
                Pebble
              </div>
            </div>

            {/* Focus panel — up next */}
            <div className="glass-card" style={{ padding: '20px 22px', marginBottom: 16 }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: 'var(--text-muted)',
                marginBottom: 14,
              }}>
                up next
              </div>

              {nextTask ? (
                <>
                  <div style={{
                    fontFamily: 'var(--font-baloo)',
                    fontSize: 16,
                    color: 'var(--text-primary)',
                    lineHeight: 1.3,
                    marginBottom: 6,
                  }}>
                    {nextTask.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: `color-mix(in srgb, ${TAG_CONFIG[nextTask.tag]?.color ?? 'var(--accent-lavender)'} 20%, transparent)`,
                      color: TAG_CONFIG[nextTask.tag]?.color ?? 'var(--accent-lavender)',
                    }}>
                      {calm ? (TAG_CONFIG[nextTask.tag]?.label ?? nextTask.tag) : `${TAG_CONFIG[nextTask.tag]?.emoji ?? ''} ${TAG_CONFIG[nextTask.tag]?.label ?? nextTask.tag}`}
                    </span>
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {nextTask.timeEstimate}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggle(nextTask.id)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 12,
                      border: 'none',
                      background: 'linear-gradient(135deg, var(--accent-sage), #7A9E76)',
                      color: 'var(--bg-deep)',
                      fontFamily: 'var(--font-nunito)',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: noMotion ? 'none' : 'all 0.2s ease',
                      letterSpacing: '0.3px',
                    }}
                    onMouseEnter={(e) => {
                      if (!noMotion) {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(143,175,138,0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    Start this one &rarr;
                  </button>
                </>
              ) : (
                <div style={{
                  fontFamily: 'var(--font-baloo)',
                  fontSize: 16,
                  color: 'var(--accent-sage)',
                  textAlign: 'center',
                  padding: '12px 0',
                }}>
                  {calm ? "You're all done!" : "You're all done! \uD83C\uDF89"}
                </div>
              )}
            </div>

            {/* Time-aware nudge */}
            <div style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              lineHeight: 1.6,
              padding: '0 4px',
            }}>
              {nudge}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
