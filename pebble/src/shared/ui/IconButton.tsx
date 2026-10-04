import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** What the button does, for screen readers (it shows only an icon). */
  label: string;
  children: ReactNode;
}

/** A round, icon-only button with a 44px touch target and a required label. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className = '', type = 'button', children, ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={label} className={`ui-icon-button ${className}`.trim()} {...rest}>
      <span aria-hidden="true">{children}</span>
    </button>
  );
});
