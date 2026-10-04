'use client';

import { useState, type FormEvent } from 'react';
import { Button, Chip, Dialog, Field } from '@/shared/ui';
import type { TaskEdit } from '../context/TasksContext';
import { PRIORITY_CONFIG, TAG_CONFIG } from '../lib/tags';
import type { Task, TaskPriority, TaskTag } from '../types';

const TAGS = Object.keys(TAG_CONFIG) as TaskTag[];
const PRIORITIES = Object.keys(PRIORITY_CONFIG) as TaskPriority[];

interface EditTaskDialogProps {
  task: Task;
  onSave: (changes: TaskEdit) => void;
  onDelete: () => void;
  onClose: () => void;
}

/** Change a task's title, estimate, tag or priority, or delete it (after asking). */
export default function EditTaskDialog({ task, onSave, onDelete, onClose }: EditTaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [timeEstimate, setTimeEstimate] = useState(task.timeEstimate);
  const [tag, setTag] = useState(task.tag);
  const [priority, setPriority] = useState(task.priority);
  const [missingTitle, setMissingTitle] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const save = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setMissingTitle(true);
      return;
    }
    onSave({ title: trimmed, timeEstimate: timeEstimate.trim(), tag, priority });
    onClose();
  };

  if (confirmingDelete) {
    return (
      <Dialog title="Delete this task?" variant="sheet" onClose={onClose}>
        <p className="edit-task__text">
          &ldquo;{task.title}&rdquo; and its steps will be gone for good. This can&apos;t be undone.
        </p>
        <div className="edit-task__actions">
          <Button variant="primary" onClick={() => setConfirmingDelete(false)}>
            Keep it
          </Button>
          <Button
            variant="quiet"
            onClick={() => {
              onDelete();
              onClose();
            }}
          >
            Delete task
          </Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog title="Edit task" variant="sheet" onClose={onClose}>
      <form className="edit-task" onSubmit={save} noValidate>
        <Field
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setMissingTitle(false);
          }}
          note={missingTitle ? 'Give it a few words.' : undefined}
          maxLength={500}
        />
        <Field
          label="How long it might take"
          value={timeEstimate}
          onChange={(e) => setTimeEstimate(e.target.value)}
          placeholder="~15 min"
          maxLength={50}
        />
        <div role="group" aria-labelledby="edit-task-tag" className="edit-task__choices">
          <p id="edit-task-tag" className="ui-field__label">
            Tag
          </p>
          <div className="edit-task__chips">
            {TAGS.map((t) => (
              <Chip key={t} tone={TAG_CONFIG[t].tone} pressed={tag === t} onClick={() => setTag(t)}>
                {TAG_CONFIG[t].label}
              </Chip>
            ))}
          </div>
        </div>
        <div role="group" aria-labelledby="edit-task-priority" className="edit-task__choices">
          <p id="edit-task-priority" className="ui-field__label">
            Priority
          </p>
          <div className="edit-task__chips">
            {PRIORITIES.map((p) => (
              <Chip key={p} pressed={priority === p} onClick={() => setPriority(p)}>
                {PRIORITY_CONFIG[p].label}
              </Chip>
            ))}
          </div>
        </div>
        <div className="edit-task__actions">
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="ghost" className="edit-task__delete" onClick={() => setConfirmingDelete(true)}>
            Delete task…
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
