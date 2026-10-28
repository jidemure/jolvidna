/**
 * Client-safe utility functions for word counts and string formatting.
 * Safe to import in client ('use client') components without pulling in server libraries.
 */

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
