// src/utils/calendarUtils.js
import jalaali from 'jalaali-js';

export const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر',
  'مرداد', 'شهریور', 'مهر', 'آبان',
  'آذر', 'دی', 'بهمن', 'اسفند'
];
export const listTime = {
  '6': '۶:۰۰', '7': '۷:۰۰', '8': '۸:۰۰', '9': '۹:۰۰', '10': '۱۰:۰۰',
  '11': '۱۱:۰۰', '12': '۱۲:۰۰', '13': '۱۳:۰۰', '14': '۱۴:۰۰',
  '15': '۱۵:۰۰', '16': '۱۶:۰۰', '17': '۱۷:۰۰', '18': '۱۸:۰۰',
  '19': '۱۹:۰۰', '20': '۲۰:۰۰', '21': '۲۱:۰۰', '22': '۲۲:۰۰', '23': '۲۳:۰۰'
};
export const listTime_ClosedOption = [
  { value: 'closed', label: 'تعطیل' },
  ...Array.from({ length: 18 }, (_, i) => ({
      value: (i + 6).toString(),
      label: listTime[(i + 6).toString()]
  }))
];
export const weekDays = 
[
  { key: 'saturday', display: 'شنبه', shortKey: 'sat' },
  { key: 'sunday', display: 'یکشنبه', shortKey: 'sun' },
  { key: 'monday', display: 'دوشنبه', shortKey: 'mon' },
  { key: 'tuesday', display: 'سه‌شنبه', shortKey: 'tue' },
  { key: 'wednesday', display: 'چهارشنبه', shortKey: 'wed' },
  { key: 'thursday', display: 'پنجشنبه', shortKey: 'thu' },
  { key: 'friday', display: 'جمعه', shortKey: 'fri' }
];
export const gregorianToJalaali = (date) => jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());


export const jalaaliToGregorian = (jy, jm, jd) => {
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
};
export const formatJalaali = (jy, jm, jd) => `${jy}/${jm}/${jd}`;

export const getFilteredReservations = (reservedDates, typeCategory, selectedId) => {
  if (!reservedDates) return {};
  
  if (typeCategory === 'couch') {
    if (selectedId) {
      return reservedDates.couches?.[String(selectedId)] || {};
    }
    return {};
  } else if (typeCategory === 'court') {
    if (selectedId) {
      return reservedDates.courts?.[String(selectedId)] || {};
    }
    return {};
  }
  
  return {};
};

export const getCalendarDays = (currentDate, isCurrentMonth = true) => {
  const firstDayGreg = jalaaliToGregorian(currentDate.year, currentDate.month, 1);
  const jsWeekday = firstDayGreg.getDay();
  const persianStartWeekday = (jsWeekday + 1) % 7;
  const daysInMonth = jalaali.jalaaliMonthLength(currentDate.year, currentDate.month);
  
  const days = [];
  
  const makeDay = (d, m, y, current) => ({
    day: d,
    month: m,
    year: y,
    isCurrentMonth: current
  });

  // Previous month days
  for (let i = persianStartWeekday - 1; i >= 0; i--) {
    const prevDate = new Date(firstDayGreg);
    prevDate.setDate(firstDayGreg.getDate() - (i + 1));
    const { jy, jm, jd } = gregorianToJalaali(prevDate);
    days.push(makeDay(jd, jm, jy, false));
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(makeDay(d, currentDate.month, currentDate.year, true));
  }

  // Next month filler
  const totalCells = 35;
  const nextDays = totalCells - days.length;
  for (let i = 1; i <= nextDays; i++) {
    const nextDate = new Date(firstDayGreg);
    nextDate.setDate(firstDayGreg.getDate() + daysInMonth + i - 1);
    const { jy, jm, jd } = gregorianToJalaali(nextDate);
    days.push(makeDay(jd, jm, jy, false));
  }

  return days;
};

export const navigateMonth = (currentDate, direction) => {
  const firstOfCurrent = jalaaliToGregorian(currentDate.year, currentDate.month, 1);
  const newDate = new Date(firstOfCurrent);
  newDate.setMonth(newDate.getMonth() + direction);
  const { jy, jm } = gregorianToJalaali(newDate);
  const firstOfNew = jalaaliToGregorian(jy, jm, 1);
  return {
    year: jy,
    month: jm,
    date: firstOfNew
  };
};

export const getDayOfWeek = (day) => {
  if (!day) return '';
  const gregorian = jalaali.toGregorian(day.year, day.month, day.day);
  const gregorianDate = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
  const dayIndex = gregorianDate.getDay();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayIndex];
};

export const formatNumber = (num) => {
  return num.toString();
};


