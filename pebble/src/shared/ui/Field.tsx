import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FieldBase {
  label: string;
  /** Help shown under the control, linked to it for screen readers. */
  hint?: string;
  /** What to change, shown under the control; marks it invalid. Written as guidance, never blame. */
  note?: string;
}

type InputFieldProps = FieldBase & { multiline?: false } & InputHTMLAttributes<HTMLInputElement>;
type TextareaFieldProps = FieldBase & { multiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>;
export type FieldProps = InputFieldProps | TextareaFieldProps;

/** A labelled text input (or textarea) with its hint and note wired up. */
export function Field(props: FieldProps) {
  const { label, hint, note, multiline, id: givenId, className = '', ...control } = props;
  const generated = useId();
  const id = givenId ?? generated;
  const hintId = hint ? `${id}-hint` : undefined;
  const noteId = note ? `${id}-note` : undefined;
  const describedBy = [hintId, noteId].filter(Boolean).join(' ') || undefined;
  const shared = {
    id,
    className: `ui-field__control ${className}`.trim(),
    'aria-describedby': describedBy,
    'aria-invalid': note ? true : undefined,
  };

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea {...shared} {...(control as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input {...shared} {...(control as InputHTMLAttributes<HTMLInputElement>)} />
      )}
      {hint && (
        <p id={hintId} className="ui-field__hint">
          {hint}
        </p>
      )}
      {note && (
        <p id={noteId} className="ui-field__note" role="status">
          {note}
        </p>
      )}
    </div>
  );
}
