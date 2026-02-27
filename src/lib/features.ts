/**
 * Feature flags
 *
 * Flags are read from the Cloudflare Worker environment (CloudflareEnv).
 * Set them as plain vars in wrangler.jsonc or via `wrangler secret put` for
 * per-environment overrides. All flags default to DISABLED when absent.
 *
 * Usage in an Astro SSR page:
 *   import { isDrillsEnabled } from '../lib/features';
 *   const drillsOn = isDrillsEnabled(Astro.locals.runtime?.env);
 *
 * Usage in an API route:
 *   import { isDrillsEnabled } from '../../../lib/features';
 *   if (!isDrillsEnabled(locals.runtime.env)) return 404;
 */

type FeatureEnv = Pick<CloudflareEnv, 'DRILLS_ENABLED'> | undefined;

/**
 * Returns true only when DRILLS_ENABLED is explicitly set to "true".
 * Safe to call from static pages where `runtime` may be undefined.
 */
export function isDrillsEnabled(env: FeatureEnv): boolean {
  return env?.DRILLS_ENABLED === 'true';
}
