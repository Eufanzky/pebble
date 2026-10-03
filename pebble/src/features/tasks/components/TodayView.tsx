'use client';

import { useState } from 'react';
import { PebbleCharacter, PebbleSpeechBubble, usePebble } from '@/features/companion';
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
import { TasksLoadFailed, TasksLoading, TasksSaveFailed } from './TasksStatus';
import TodayGreeting from './TodayGreeting';
import UpNextCard from './UpNextCard';
import ViewToggle, { type ViewMode } from './ViewToggle';
import './Today.css';

/**
 * The Today screen: Pebble's greeting, what's up next, the list (or roadmap)
 * grouped into to do and done, and progress that only adds up. On wide
 * screens Pebble has its own column; elsewhere it sits beside the greeting.
 */
export default function TodayView() {
  const { mood, currentMessage } = usePebble();
  const { tasks, completionPercentage, isLoading, loadFailed, retry, saveFailed, dismissSaveError, addExampleTasks } =
    useTasks();
  const { preferences, reduceMotion } = usePreferences();
  const timeOfDay = useTimeOfDay();
  const { formattedDate, hour } = useTodayClock();
  const actions = useTaskActions();
  const addTask = useAddTask();
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const calm = preferences.calmMode;
  const noMotion = reduceMotion;
  const { open, done, next } = splitTasks(tasks);
  const message = addTask.showDistress ? "I'm right here with you." : currentMessage;

  const addForm = (
    <>
      <AddTaskForm value={addTask.input} onChange={addTask.setInput} onSubmit={addTask.submit} />
      {addTask.showDistress && <DistressPrompt onStartFresh={addTask.startFresh} onKeepGoing={addTask.keepGoing} />}
    </>
  );

  return (
    <div className="today">
      <div className="today__main">
        <TodayGreeting
          greeting={greeting(timeOfDay, done.length, tasks.length, calm)}
          date={formattedDate}
          companion={<PebbleCharacter mood={mood} size="small" />}
        />

        <div className="today__heading">
          <h1 className="today__title">Today</h1>
          <ViewToggle value={viewMode} onChange={setViewMode} noMotion={noMotion} />
        </div>

        {saveFailed && <TasksSaveFailed onDismiss={dismissSaveError} />}

        {loadFailed ? (
          <TasksLoadFailed onRetry={retry} />
        ) : isLoading ? (
          <TasksLoading />
        ) : (
          <>
            {tasks.length > 0 && <UpNextCard task={next} calm={calm} onDone={actions.toggle} />}
            {viewMode === 'list' ? (
              <TaskList
                open={open}
                done={done}
                onToggle={actions.toggle}
                onToggleSubtask={actions.toggleSubtask}
                onBreakDown={actions.breakDown}
                onWhyOpen={actions.openWhy}
                onAddExamples={addExampleTasks}
                addTask={addForm}
              />
            ) : (
              <>
                <RoadmapView
                  tasks={tasks}
                  completionPercentage={completionPercentage}
                  onToggle={actions.toggle}
                  calm={calm}
                  noMotion={noMotion}
                />
                {addForm}
              </>
            )}
          </>
        )}

        <div className="today__progress">
          <ProgressPath completed={done.length} total={tasks.length} percentage={completionPercentage} />
        </div>
      </div>

      <aside className="today__companion" aria-label="Pebble">
        <PebbleSpeechBubble message={message} />
        <PebbleCharacter mood={mood} size="medium" />
        <p className="today__nudge">{nudge(tasks, timeOfDay, hour, calm)}</p>
      </aside>
    </div>
  );
}
