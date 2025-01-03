const dayjs = require("dayjs");

const convDate = (date, customFormat) => {
  const convert = () => {
    return dayjs(date).format(customFormat ? customFormat : 'YYYY-MM-DD');
  };

  if (date && date instanceof Date && !isNaN(date.valueOf())) {
    return convert();
  } else {
    const check = dayjs(date).isValid();
    return check ? convert() : null;
  }
};

const msToHHMMSS = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Pad hours, minutes, and seconds with leading zeros
  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
};

module.exports = {
  convDate,
  msToHHMMSS

}