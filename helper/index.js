const dayjs =  require ("dayjs");

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

module.exports = {
  convDate,

}