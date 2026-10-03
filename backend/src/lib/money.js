function money(value) {
  if (value == null) return null;
  return Number(value.toString());
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function toPaise(amountMajor) {
  return Math.round(roundMoney(amountMajor) * 100);
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

module.exports = { money, roundMoney, toPaise, addMonths, addDays, addMinutes };
