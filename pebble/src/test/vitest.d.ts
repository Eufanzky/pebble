import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

// vitest-axe only augments the old global `Vi` namespace, so register its
// matcher with Vitest's current types here. The type parameter must match
// Vitest's own declaration exactly for the interfaces to merge.
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  interface Assertion<T = any> extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
