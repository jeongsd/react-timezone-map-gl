export default function timezoneParser(timeZone: string) {
  // if (timeZone === 'UTC±00:00') return 'UTC+00:00';
  return timeZone.replace('±', '+')
}
