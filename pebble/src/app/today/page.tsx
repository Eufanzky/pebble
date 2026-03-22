'use client';

import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import TaskCard from '@/components/today/TaskCard';
import { usePebble } from '@/contexts/PebbleContext';
import { useTasks } from '@/contexts/TasksContext';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import type { PebbleMood } from '@/lib/types';

const moods: PebbleMood[] = ['sleepy', 'normal', 'happy', 'excited'];

export default function TodayPage() {
  const { mood, currentMessage, setMood } = usePebble();
  const { tasks, toggleTask, toggleSubtask, completionPercentage } = useTasks();
  const { addEntry } = useActivityLog();
  const { preferences } = usePreferences();

  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      addEntry(
        'PebbleVoice',
        `Nice work! You finished "${task.title}". That's ${done + 1} of ${total} done today.`,
        'Task completed by user. Triggered encouragement message.'
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

  // Sort: incomplete first, completed at bottom
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <>
      <ScreenBackground scene="cafe" />
      <div className="relative z-[1] p-10 px-12">
        <div className="mb-7">
          <h1 className="screen-title">Today</h1>
          <p className="screen-subtitle">Your tasks for today, one step at a time.</p>
        </div>

        <div className="flex gap-10">
          {/* Left: task list */}
          <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onToggleSubtask={handleToggleSubtask}
                onBreakDown={handleBreakDown}
              />
            ))}

            {/* Mood test buttons — temporary */}
            <div
              className="glass-card p-4 mt-2"
              style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}
            >
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-nunito)', textTransform: 'uppercase', letterSpacing: '1px', marginRight: 8 }}>
                Test mood:
              </span>
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 8,
                    border: mood === m ? '1.5px solid var(--accent-lavender)' : '1px solid var(--border-soft)',
                    background: mood === m ? 'rgba(196,181,212,0.15)' : 'transparent',
                    color: mood === m ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-nunito)',
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Pebble companion */}
          <div className="flex flex-col items-center gap-4 min-w-[200px] pt-2">
            <PebbleSpeechBubble message={currentMessage} />
            <PebbleCharacter mood={mood} size="medium" />
            <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 4 }}>
              Pebble
            </div>

            {/* Progress summary */}
            <div
              className="glass-card"
              style={{ padding: '12px 18px', textAlign: 'center', width: '100%', marginTop: 8 }}
            >
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 22, color: 'var(--text-primary)', fontWeight: 700 }}>
                {completionPercentage}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {done} of {total} tasks done
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
