export const ORIGIN_DATE = new Date(2023, 7, 17); // Aug 17, 2023 (month is 0-indexed)

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function daysSinceOrigin(date: Date = new Date()): number {
  const start = startOfDay(ORIGIN_DATE);
  const end = startOfDay(date);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function formatVellunaDate(date: Date = new Date()): string {
  const dd = pad(date.getDate());
  const mm = pad(date.getMonth() + 1);
  const dayCount = daysSinceOrigin(date);
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hh = pad(hours);
  const min = pad(date.getMinutes());
  return `${dd}-${mm}-(${dayCount}) ${hh}:${min} ${ampm}`;
}
