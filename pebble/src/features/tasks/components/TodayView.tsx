'use client';

import { useState } from 'react';
import { PebbleCharacter } from '@/features/companion';
import { PebbleSpeechBubble } from '@/features/companion';
import { usePebble } from '@/features/companion';
import { usePreferences } from '@/shared/preferences';
import { useTimeOfDay } from '@/shared/hooks/useTimeOfDay';
import { useTasks } from '../context/TasksContext';
import { useAddTask } from '../hooks/useAddTask';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTodayClock } from '../hooks/useTodayClock';
import { greeting, nudge, splitTasks } from '../lib/today';
import AddTaskForm from './AddTaskForm';
import DistressPrompt from './DistressPrompt';
import ProgressPath from './ProgressPath';
import RoadmapView from './RoadmapView';
import TaskList from './TaskList';
import TodayGreeting from './TodayGreeting';
import UpNextCard from './UpNextCard';
import ViewToggle, { type ViewMode } from './ViewToggle';

/** The Today screen: the task list or roadmap, Pebble, and what's up next. */
export default function TodayView() {
  const { mood, currentMessage } = usePebble();
  const { tasks, completionPercentage } = useTasks();
  const { preferences, reduceMotion } = usePreferences();
  const timeOfDay = useTimeOfDay();
  const { formattedDate, hour } = useTodayClock();
  const actions = useTaskActions();
  const addTask = useAddTask();
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const calm = preferences.calmMode;
  const noMotion = reduceMotion;
  const { open, done, next } = splitTasks(tasks);

  return (
    <div className="today-layout">
      <div className="today-left">
        <TodayGreeting greeting={greeting(timeOfDay, done.length, tasks.length, calm)} date={formattedDate} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <h1 className="screen-title">Today</h1>
            <p className="screen-subtitle">Your tasks for today, one step at a time.</p>
          </div>
          <ViewToggle value={viewMode} onChange={setViewMode} noMotion={noMotion} />
        </div>

        {viewMode === 'list' ? (
          <TaskList
            open={open}
            done={done}
            onToggle={actions.toggle}
            onToggleSubtask={actions.toggleSubtask}
            onBreakDown={actions.breakDown}
            onWhyOpen={actions.openWhy}
          />
        ) : (
          <RoadmapView
            tasks={tasks}
            completionPercentage={completionPercentage}
            onToggle={actions.toggle}
            calm={calm}
            noMotion={noMotion}
          />
        )}

        <AddTaskForm value={addTask.input} onChange={addTask.setInput} onSubmit={addTask.submit} />

        {addTask.showDistress && (
          <DistressPrompt onStartFresh={addTask.startFresh} onKeepGoing={addTask.keepGoing} />
        )}

        <div style={{ marginTop: 28 }}>
          <ProgressPath completed={done.length} total={tasks.length} percentage={completionPercentage} />
        </div>
      </div>

      <div className="today-right">
        <div className="flex flex-col items-center gap-3 mb-6">
          <PebbleSpeechBubble message={addTask.showDistress ? "I'm right here with you." : currentMessage} />
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

        <UpNextCard task={next} calm={calm} noMotion={noMotion} onStart={actions.toggle} />

        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6, padding: '0 4px' }}>
          {nudge(tasks, timeOfDay, hour, calm)}
        </div>
      </div>
    </div>
  );
}
