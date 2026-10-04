import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `primary` is the one main action on a screen; `quiet` sits beside it; `ghost` is for the rest. */
  variant?: 'primary' | 'quiet' | 'ghost';
  size?: 'md' | 'sm';
  /** Shows that the action is under way; the button can't be pressed again meanwhile. */
  busy?: boolean;
  icon?: ReactNode;
}

/** A pill-shaped button with a 44px touch target. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'quiet', size = 'md', busy = false, icon, className = '', type = 'button', disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`ui-button ui-button--${variant} ui-button--${size} ${className}`.trim()}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      {...rest}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
});
