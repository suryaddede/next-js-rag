import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gets a formatted date and time for display purposes
 * @param date Optional Date object to format (defaults to current time)
 * @returns A formatted date string
 */
export function getCurrentTimestamp(date?: Date): string {
  const now = new Date();
  const targetDate = date || now;

  // Check if it's today
  const isToday = targetDate.toDateString() === now.toDateString();

  // If it's within the last hour, show relative time
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;

  // For today, show the time
  if (isToday) {
    return targetDate.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // For this year, show month and day
  if (targetDate.getFullYear() === now.getFullYear()) {
    return targetDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  }

  // For other years, include the year
  return targetDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
