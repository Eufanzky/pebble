import type { FormEvent } from 'react';
import { Field } from '@/shared/ui';

interface AddTaskFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

/** "What do you need to do?": Enter adds the task to the list. */
export default function AddTaskForm({ value, onChange, onSubmit }: AddTaskFormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="add-task">
      <Field
        id="task-input"
        label="Add a new task"
        hideLabel
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What do you need to do?"
        autoComplete="off"
      />
    </form>
  );
}
