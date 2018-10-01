
export default function time_zoneParser(time_zone) {
  // if (time_zone === 'UTC±00:00') return 'UTC+00:00';
  return time_zone.replace('±', '+')
}