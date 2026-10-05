'use client';

import { useState } from 'react';
import { PebbleCharacter, PebbleSpeechBubble, usePebble } from '@/features/companion';
import { usePreferences } from '@/shared/preferences';
import { Button } from '@/shared/ui';
import { useTimeOfDay } from '@/shared/hooks/useTimeOfDay';
import { useTasks } from '../context/TasksContext';
import { useAddTask } from '../hooks/useAddTask';
import { useTaskActions } from '../hooks/useTaskActions';
import { useTodayClock } from '../hooks/useTodayClock';
import { filterTasks, isFiltering, NO_FILTER, type TaskFilter } from '../lib/organise';
import { greeting, nudge, splitTasks } from '../lib/today';
import AddTaskForm from './AddTaskForm';
import DistressPrompt from './DistressPrompt';
import EditTaskDialog from './EditTaskDialog';
import ProgressPath from './ProgressPath';
import RoadmapView from './RoadmapView';
import TaskList from './TaskList';
import TaskFilters from './TaskFilters';
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
  const {
    tasks,
    completionPercentage,
    isLoading,
    loadFailed,
    retry,
    saveFailed,
    dismissSaveError,
    addExampleTasks,
    editTask,
    deleteTask,
    reorderTasks,
    setStepsShown,
  } = useTasks();
  const { preferences, reduceMotion } = usePreferences();
  const timeOfDay = useTimeOfDay();
  const { formattedDate, hour } = useTodayClock();
  const actions = useTaskActions();
  const addTask = useAddTask();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filter, setFilter] = useState<TaskFilter>(NO_FILTER);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = tasks.find((t) => t.id === editingId);

  const calm = preferences.calmMode;
  const noMotion = reduceMotion;
  const { done, next } = splitTasks(tasks);
  const filtering = isFiltering(filter);
  const shown = splitTasks(filterTasks(tasks, filter));
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
              <>
                {tasks.length > 0 && (
                  <TaskFilters
                    filter={filter}
                    onChange={setFilter}
                    shown={shown.open.length + shown.done.length}
                    total={tasks.length}
                  />
                )}
                <TaskList
                  open={shown.open}
                  done={shown.done}
                  onToggle={actions.toggle}
                  onToggleStep={actions.toggleStep}
                  onShowSteps={setStepsShown}
                  onWhyOpen={actions.openWhy}
                  onEdit={setEditingId}
                  // Reordering a filtered list would be confusing: only the whole list moves
                  onReorderOpen={filtering ? undefined : (ids) => reorderTasks([...ids, ...done.map((t) => t.id)])}
                  onAddExamples={addExampleTasks}
                  addTask={addForm}
                  emptyFilter={
                    filtering && tasks.length > 0 ? (
                      <div className="task-empty">
                        <p>Nothing here matches. Try other words or another tag.</p>
                        <Button variant="quiet" onClick={() => setFilter(NO_FILTER)}>
                          Show all tasks
                        </Button>
                      </div>
                    ) : undefined
                  }
                />
              </>
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

      {editing && (
        <EditTaskDialog
          task={editing}
          onSave={(changes) => editTask(editing.id, changes)}
          onDelete={() => deleteTask(editing.id)}
          onClose={() => setEditingId(null)}
        />
      )}

      <aside className="today__companion" aria-label="Pebble">
        <PebbleSpeechBubble message={message} />
        <PebbleCharacter mood={mood} size="medium" />
        <p className="today__nudge">{nudge(tasks, timeOfDay, hour, calm)}</p>
      </aside>
    </div>
  );
}
