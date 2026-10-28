// ============================================================================
// OPPORTUNITY RADAR & PITCH ENGINE — TIMEZONE GUARD
// Document Reference: docs/04-TRD.md & GEMINI.md Hard Lock 3
// ============================================================================

export interface TimezoneCheckResult {
  inPeakWindow: boolean;
  localTimeFormatted: string;
  localHour: number;
  localMinute: number;
  weekday: string;
  targetTimezone: string;
  watTimeFormatted: string;
}

/**
 * Common target timezones for Kitchen & Bathroom Remodeler radar campaigns.
 */
export const SUPPORTED_TIMEZONES = [
  { label: 'Eastern Time (New York, Atlanta, Miami)', value: 'America/New_York' },
  { label: 'Central Time (Dallas, Chicago, Houston)', value: 'America/Chicago' },
  { label: 'Mountain Time (Denver, Salt Lake City)', value: 'America/Denver' },
  { label: 'Arizona (Phoenix, Scottsdale - No DST)', value: 'America/Phoenix' },
  { label: 'Pacific Time (Los Angeles, Seattle)', value: 'America/Los_Angeles' },
  { label: 'UK (London)', value: 'Europe/London' },
  { label: 'Eastern Canada (Toronto, Montreal)', value: 'America/Toronto' },
];

/**
 * Validates whether an IANA timezone string is valid.
 */
function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * LOCK 3: WAT-to-Target-City Timezone Guard.
 * Evaluates whether the contractor's city is currently in the active 09:00–16:59 peak ad window.
 * Because the operator runs the engine from Lagos (WAT, UTC+1), contractor ad budgets
 * are paused overnight in the US/Canada.
 */
export function isTargetCityInPeakAdHours(targetTimezone: string, referenceDate: Date = new Date()): TimezoneCheckResult {
  const safeTz = isValidTimezone(targetTimezone) ? targetTimezone : 'America/Chicago';

  const localFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTz,
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const parts = localFormatter.formatToParts(referenceDate);
  const hourPart = parts.find((p) => p.type === 'hour')?.value ?? '0';
  const minutePart = parts.find((p) => p.type === 'minute')?.value ?? '0';
  const weekdayPart = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';

  const localHour = parseInt(hourPart, 10);
  const localMinute = parseInt(minutePart, 10);

  // Peak contractor ad spend window: Monday-Friday 09:00 to 16:59 local time
  const isWeekday = !['Sat', 'Sun'].includes(weekdayPart);
  const isWithinHours = localHour >= 9 && localHour < 17;
  const inPeakWindow = isWeekday && isWithinHours;

  const localTimeFormatted = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(referenceDate);

  const watTimeFormatted = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Lagos',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    month: 'short',
    day: 'numeric',
  }).format(referenceDate);

  return {
    inPeakWindow,
    localTimeFormatted,
    localHour,
    localMinute,
    weekday: weekdayPart,
    targetTimezone: safeTz,
    watTimeFormatted: `${watTimeFormatted} WAT`,
  };
}

/**
 * Calculates the next 09:30 AM local time occurrence in target timezone.
 * Used to set `scheduled_for` when queueing campaigns outside peak ad hours.
 */
export function getNextPeakWindowTimestamp(targetTimezone: string, fromDate: Date = new Date()): Date {
  const safeTz = isValidTimezone(targetTimezone) ? targetTimezone : 'America/Chicago';

  // We test increments of 30 minutes until we hit a weekday at 09:30 local
  const candidate = new Date(fromDate.getTime() + 15 * 60 * 1000); // start slightly forward

  for (let i = 0; i < 7 * 48; i++) {
    // max 7 days of 30-min steps
    const check = isTargetCityInPeakAdHours(safeTz, candidate);
    if (!['Sat', 'Sun'].includes(check.weekday) && check.localHour === 9 && check.localMinute >= 30) {
      return candidate;
    }
    candidate.setTime(candidate.getTime() + 30 * 60 * 1000);
  }

  // Fallback: 12 hours from now
  return new Date(fromDate.getTime() + 12 * 60 * 60 * 1000);
}
