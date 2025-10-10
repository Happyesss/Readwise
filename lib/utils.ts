import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

/**
 * Return true when the value is a valid src for next/image
 * Accepts:
 *  - absolute URLs (http:// or https://)
 *  - root-relative paths starting with '/'
 *  - data URLs (data:...)
 */
export function isValidImageSrc(src?: string | null): src is string {
  if (!src) return false;
  const trimmed = src.trim();
  return (
    /^https?:\/\//i.test(trimmed) ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:")
  );
}
