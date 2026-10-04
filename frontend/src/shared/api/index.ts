// Types for the backend API, generated from its OpenAPI schema. Never write
// them by hand: after changing a backend schema, run `npm run api:generate`.
import type { components } from './schema';

/** A request or response body the backend defines, e.g. `ApiSchema<'ChatResponse'>`. */
export type ApiSchema<Name extends keyof components['schemas']> = components['schemas'][Name];
