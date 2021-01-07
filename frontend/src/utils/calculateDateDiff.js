import { DateTime } from 'luxon';

const calculateDateDiff = (date) => {
  const dateNow = DateTime.local();
  const daysAgo = Math.floor(dateNow.diff(DateTime.fromISO(date)).as('days'));
  if (daysAgo >= 1) {
    if (daysAgo === 1) {
      return '1 day ago';
    }
    return `${daysAgo} days ago`;
  }
  const hoursAgo = Math.floor(
    dateNow.diff(DateTime.fromISO(date)).as('hours'),
  );
  if (hoursAgo >= 1) {
    if (hoursAgo === 1) {
      return '1 hour ago';
    }
    return `${hoursAgo} hours ago`;
  }
  const minutesAgo = Math.floor(
    dateNow.diff(DateTime.fromISO(date)).as('minutes'),
  );
  if (minutesAgo >= 1) {
    if (minutesAgo === 1) {
      return '1 minute ago';
    }
    return `${minutesAgo} minutes ago`;
  }
  return 'less than a minute ago';
};

export default calculateDateDiff;
