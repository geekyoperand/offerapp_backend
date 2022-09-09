const codeGenerator = (length) => {
  let result = '';
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = length; i > 0; i -= 1) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

const getWeekDay = (date = new Date()) => {
  return new Date(new Date(date).setHours(0, 0, 0, 0)).getDay() + 1;
};

module.exports = {
  codeGenerator,
  getWeekDay,
};
