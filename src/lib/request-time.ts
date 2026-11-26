import "server-only";

import { connection } from "next/server";

/**
 * The current time, for Server Components and queries.
 * `connection()` tells Next.js to wait for a real request first; with Cache Components,
 * calling `new Date()` during prerendering is an error (and would freeze the time).
 * Server actions always run per request and can use `new Date()` directly.
 */
export async function requestTime(): Promise<Date> {
  await connection();
  return new Date();
}
