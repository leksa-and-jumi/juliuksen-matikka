import { createConvexStore } from './convexStore';
import { createLocalStore } from './localStore';
import type { ProgressStore } from './store';

/** Convex when VITE_CONVEX_URL is set, otherwise this browser only. */
export function createStore(): ProgressStore {
  const url = import.meta.env.VITE_CONVEX_URL as string | undefined;
  return url ? createConvexStore(url) : createLocalStore();
}
