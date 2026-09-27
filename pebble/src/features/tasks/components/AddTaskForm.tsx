import type { FormEvent } from 'react';

interface AddTaskFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function AddTaskForm({ value, onChange, onSubmit }: AddTaskFormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
      <label htmlFor="task-input" className="sr-only">Add a new task</label>
      <input
        id="task-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  );
}
