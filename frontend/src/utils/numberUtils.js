// utils/numberUtils.js
import jalaali from 'jalaali-js';

export const convertNumberToPersian = (input) => {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return String(input).replace(/\d/g, (digit) => persianDigits[digit]);
};

export const formatNumber = (number) => {
  // Ensure it's a valid number
  const num = Number(number);
  if (isNaN(num)) return '-----';

  const plainString = num.toString(); 
  
  return convertNumberToPersian(plainString);
};

export const removeFormatting = (input) => {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return String(input)
    .replace(/[۰-۹]/g, (digit) => persianDigits.indexOf(digit))
    .replace(/\D/g, ''); 
};

const jalaaliToGregorian = (jy, jm, jd) => {
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
};
const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر',
  'مرداد', 'شهریور', 'مهر', 'آبان',
  'آذر', 'دی', 'بهمن', 'اسفند'
];

export const formatPersianFullDate = (jy, jm, jd, color = '#B9ED00') => {
  const date = jalaaliToGregorian(jy, jm, jd);
  const weekdayIndex = (date.getDay() + 1) % 7; 
  const weekdayName = weekDays[weekdayIndex];
  const monthName = persianMonths[jm - 1];

  return (
    <span>
      <span style={{ color }}>{weekdayName}</span>{' '}
      {formatNumber(jd)} {monthName} {formatNumber(jy)}
    </span>
  );
};

export const normalizeTimeSlot = (timeStr) => {
  if (!timeStr) return '';

  const persianToLatin = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  };

  let normalized = timeStr.replace(/[۰-۹]/g, char => persianToLatin[char] || char);

  const matches = normalized.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!matches) return timeStr; // fallback

  let [_, startH, startM, endH, endM] = matches;
  startH = parseInt(startH, 10);
  endH = parseInt(endH, 10);

  // Fix reversed time (e.g., "13:00 - 12:00")
  if (startH > endH || (startH === endH && parseInt(startM,10) >= parseInt(endM,10))) {
    [startH, endH] = [endH, startH];
    [startM, endM] = [endM, startM];
  }

  // Format as "H:00 - H+1:00" (assuming 1-hour slots)
  // But better: keep original normalized format for comparison
  return `${String(startH)}:${startM.padStart(2, '0')} - ${String(endH)}:${endM.padStart(2, '0')}`;
};

export const formatPersianTime = (timeString) => {
  if (!timeString) return "";
  const [start, end] = timeString.split("-");
  const startHourOne = parseInt(start.split(":")[0]);
  const startHourTwo = parseInt(start.split(":")[1]);
  const endHourOne = parseInt(end.split(":")[0]);
  const endHourTwo = parseInt(end.split(":")[1]);

  return `${formatNumber(startHourOne)}:${startHourTwo !== 0 ? formatNumber(startHourTwo) : '۰۰'} - ${formatNumber(endHourOne)}:${endHourTwo !== 0 ? formatNumber(endHourTwo) : '۰۰'}`;
};


export const formatPersianTimeSlot = (timeString) => {
  if (!timeString) return "";
  const [start, end] = timeString.split("-");
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  const startMin = Number.isFinite(startM) ? startM : 0;
  const endMin = Number.isFinite(endM) ? endM : 0;
  return `${formatNumber(startH)}:${startMin !== 0 ? formatNumber(startMin) : '۰۰'} - ${formatNumber(endH)}:${endMin !== 0 ? formatNumber(endMin) : '۰۰'}`;
};
// Converts "1404/8/24" → "شنبه ۲۴ آبان"
export const formatJalaliDateString = (jalaliDateString) => {
  if (!jalaliDateString) return '---';

  const parts = jalaliDateString.split('/');
  if (parts.length !== 3) return jalaliDateString;

  const [jy, jm, jd] = parts.map(Number);

  // Validate numbers
  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return jalaliDateString;

  try {
    // Convert to Gregorian to get weekday
    const g = jalaali.toGregorian(jy, jm, jd);
    const date = new Date(g.gy, g.gm - 1, g.gd);

    // Persian weekday: Saturday = 0
    // JS: Sun=0 → Sat=6 → map to [Shanbe=0, ... Jome=6]
    const weekdayIndex = (date.getDay() + 1) % 7; // JS Sun(0) → Per 1 (Yekshanbe), Sat(6) → Per 0 (Shanbe)
    const weekdayName = weekDays[weekdayIndex];
    const monthName = persianMonths[jm - 1];

    const dayPersian = formatNumber(jd);

    return `${weekdayName} ${dayPersian} ${monthName}`;
  } catch (e) {
    console.warn('Failed to format Jalali date:', jalaliDateString, e);
    return jalaliDateString;
  }
};
/**
 * Converts a Gregorian date to Jalali (Persian) date and time
 * @param {string|Date} gregorianDate - The Gregorian date to convert
 * @returns {string} - The formatted Jalali date and time
 */
export const formatGregorianToJalaliDateTime = (gregorianDate) => {
  if (!gregorianDate) return '';
  
  // Convert to Date object if it's a string
  const date = typeof gregorianDate === 'string' ? new Date(gregorianDate) : gregorianDate;
  
  // Extract time components
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const time = `${hours}:${minutes}`;
  
  // Extract Gregorian date components
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1; // JavaScript months are 0-indexed
  const gregorianDay = date.getDate();
  
  // Convert Gregorian to Jalali
  const { year: jalaliYear, month: jalaliMonth, day: jalaliDay } = gregorianToJalali(
    gregorianYear, gregorianMonth, gregorianDay
  );
  
  // Format the Jalali date
  const jalaliDate = `${jalaliYear}/${jalaliMonth.toString().padStart(2, '0')}/${jalaliDay.toString().padStart(2, '0')}`;
  
  // Return date and time
  return `${jalaliDate} ${time}`;
};

/**
 * Converts Gregorian date to Jalali date
 * @param {number} gy - Gregorian year
 * @param {number} gm - Gregorian month (1-12)
 * @param {number} gd - Gregorian day
 * @returns {Object} - Object containing year, month, and day in Jalali calendar
 */
const gregorianToJalali = (gy, gm, gd) => {
  const g_d_n = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy;
  
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }
  
  let gy2 = (gm > 2) ? gy + 1 : gy;
  let days = (365 * gy) + ((parseInt((gy2 + 3) / 4)) - parseInt((gy2 + 99) / 100) + parseInt((gy2 + 399) / 400)) - 80 + gd + g_d_n[gm - 1];
  
  jy += 33 * parseInt(days / 12053);
  days %= 12053;
  jy += 4 * parseInt(days / 1461);
  days %= 1461;
  
  if (days > 365) {
    jy += parseInt((days - 1) / 365);
    days = (days - 1) % 365;
  }
  
  let jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
  let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  
  return {
    year: jy,
    month: jm,
    day: jd
  };
};

