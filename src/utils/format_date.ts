const MINUTE = 60_000;
const HOUR = 3_600_000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function calendarDaysDiff(date: Date, now: Date): number {
  const dateDay = startOfDay(date).getTime();
  const nowDay = startOfDay(now).getTime();
  return Math.round((nowDay - dateDay) / 86_400_000);
}

export function formatRelativeDate(date: Date, now: Date = new Date()): string {
  const diff = now.getTime() - date.getTime();

  if (diff < 0) {
    return formatAbsoluteDate(date, now);
  }

  if (diff < MINUTE) {
    return 'Just now';
  }

  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  const daysDiff = calendarDaysDiff(date, now);

  if (daysDiff === 0) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (daysDiff === 1) {
    return 'Yesterday';
  }

  if (daysDiff < 7) {
    return `${daysDiff} days ago`;
  }

  return formatAbsoluteDate(date, now);
}

function formatAbsoluteDate(date: Date, now: Date): string {
  const sameYear = date.getFullYear() === now.getFullYear();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();

  if (sameYear) {
    return `${month} ${day}`;
  }

  return `${month} ${day}, ${date.getFullYear()}`;
}
