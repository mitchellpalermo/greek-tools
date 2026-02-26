/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;

interface CloudflareEnv {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PRICE_ID: string;
  /** Set to "true" to enable the Parsing Drills feature. Defaults to disabled. */
  DRILLS_ENABLED?: string;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: CloudflareEnv;
    };
  }
}
