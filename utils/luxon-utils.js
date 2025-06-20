const { DateTime, Duration } = require('luxon');

function getAge(isoString) {
  return DateTime.fromISO(isoString).toRelative();
}

function formatDuration(isoString) {
  if (isoString === 'P0D') return 'Live';

  const duration = Duration.fromISO(isoString);
  const hours = duration.as('hours');

  if (hours < 1) {
    return duration.toFormat('m:ss');
  } else {
    return duration.toFormat('h:mm:ss');
  }
}

module.exports = { getAge, formatDuration };
