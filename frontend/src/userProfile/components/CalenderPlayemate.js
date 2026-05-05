// persian-calendar.js
import React, { useState,useEffect } from 'react';
import '../../styles/PersianCalendar.css';
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import jalaali from 'jalaali-js';
import { formatNumber } from '../../utils/numberUtils'
import { IoMdArrowDropleft } from "react-icons/io";
import { IoMdArrowDropdown } from "react-icons/io";

const reservedDates = [
  '1404/07/09',
  '1404/07/30',
  '1404/07/03'
];

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر',
  'مرداد', 'شهریور', 'مهر', 'آبان',
  'آذر', 'دی', 'بهمن', 'اسفند'
];

const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنج شنبه', 'جمعه'];

// Convert Gregorian Date → Persian { jy, jm, jd }
const gregorianToJalaali = (date) => {
  return jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

// Convert Persian (jy, jm, jd) → Gregorian Date
const jalaaliToGregorian = (jy, jm, jd) => {
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
};

// Format as "YYYY/MM/DD"
const formatJalaali = (jy, jm, jd) => {
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
};

const Calendar = ({ onDateSelect }) => {

    // Step 1: Get TODAY in Gregorian
  const todayGregorian = new Date();
  
  // Step 2: Convert to Persian
  const todayPersian = gregorianToJalaali(todayGregorian);
  const { jy: year, jm: month, jd: day } = todayPersian;
  
  // Step 3: Create a Persian date object with consistent keys
  const todayPersianObj = { year, month, day };

  // Step 4: Set currentDate to 1st of current Persian month (to show correct month)
  const firstOfCurrentMonthGreg = jalaaliToGregorian(year, month, 1);

  const [currentDate, setCurrentDate] = useState(firstOfCurrentMonthGreg);
  const [selectedDate, setSelectedDate] = useState(todayPersianObj); // auto-select today
  const [showCalendar, setShowCalendar] = useState(true);
  const [fade, setFade] = useState(false);
  // ... other state (showTimeSlots, formData, etc.) — keep as needed

  // // Step 5: Notify parent (Home) that "today" is selected by default
  // useEffect(() => {
  //   onDateSelect(todayPersianObj);
  // }, [onDateSelect, todayPersianObj]);



  // Get current Persian year/month from currentDate (Gregorian)
  const { jy: pYear, jm: pMonth } = gregorianToJalaali(currentDate);

  const getCalendarDays = () => {
    // First day of Persian month (as Gregorian Date)
    const firstDayGreg = jalaaliToGregorian(pYear, pMonth, 1);
    const jsWeekday = firstDayGreg.getDay(); // 0 = Sun, 6 = Sat
    const persianStartWeekday = (jsWeekday + 1) % 7; // 0 = Saturday

    // Days in current Persian month
    const daysInMonth = jalaali.jalaaliMonthLength(pYear, pMonth);

    const days = [];

    // Previous month days
    for (let i = persianStartWeekday - 1; i >= 0; i--) {
      const prevDate = new Date(firstDayGreg);
      prevDate.setDate(firstDayGreg.getDate() - (i + 1));
      const { jy, jm, jd } = gregorianToJalaali(prevDate);
      const pStr = formatJalaali(jy, jm, jd);
      days.push({
        day: jd,
        month: jm,
        year: jy,
        isCurrentMonth: false,
        isReserved: reservedDates.includes(pStr)
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const pStr = formatJalaali(pYear, pMonth, d);
      days.push({
        day: d,
        month: pMonth,
        year: pYear,
        isCurrentMonth: true,
        isReserved: reservedDates.includes(pStr)
      });
    }

    // Next month days (fill to 42 cells)
    const totalCells = 42;
    const nextDays = totalCells - days.length;
    for (let i = 1; i <= nextDays; i++) {
      const nextDate = new Date(firstDayGreg);
      nextDate.setDate(firstDayGreg.getDate() + daysInMonth + i - 1);
      const { jy, jm, jd } = gregorianToJalaali(nextDate);
      const pStr = formatJalaali(jy, jm, jd);
      days.push({
        day: jd,
        month: jm,
        year: jy,
        isCurrentMonth: false,
        isReserved: reservedDates.includes(pStr)
      });
    }

    return days;
  };

// In Calendar.js

const handleDateClick = (day) => {
  if (!day.isCurrentMonth || day.isReserved) return;

  setSelectedDate(day);
  onDateSelect(day); // 👈 Pass the Persian date object up

  setFade(true);
  setTimeout(() => {
    setShowCalendar(true);
    setFade(false);
  }, 300);
};



  const navigateMonth = (direction) => {
    // Move to first day of current Persian month
    const firstOfCurrent = jalaaliToGregorian(pYear, pMonth, 1);
    // Add/subtract 1 month in Gregorian, then adjust to Persian month
    const newDate = new Date(firstOfCurrent);
    newDate.setMonth(newDate.getMonth() + direction);
    // Now get the Persian month of that date and snap to its 1st
    const { jy, jm } = gregorianToJalaali(newDate);
    const firstOfNew = jalaaliToGregorian(jy, jm, 1);
    setCurrentDate(firstOfNew);
  };


  const renderCalendar = () => {
    const days = getCalendarDays();

    return (
      <div className={`w-full h-[300px] ${fade ? 'fade-out' : ''} body-farsi`}>
        <div className="calendar-header mb-[20px] items-center h-[40px]">
          <button onClick={() => navigateMonth(-1)}>
            <SlArrowRight size={10} />
          </button>
          <h2 className='body-farsi px-[20px]'>{persianMonths[pMonth - 1]}{formatNumber(Number(pYear))}
          </h2>
          <button onClick={() => navigateMonth(1)}>
            <SlArrowLeft size={10} />
          </button>
        </div>

        <div className="week-days">
          {weekDays.map((day, index) => (
            <div key={index} className="week-day body-farsi text-[8px] text-[#808080]">{day}</div>
          ))}
        </div>

        <div className="calendar-grid    ">
          {days.map((day, index) => (
            <div
              key={`${day.year}-${day.month}-${day.day}-${index}`}
              className={` body-farsi  calendar-day  ${!day.isCurrentMonth ? 'other-month' :
                day.isReserved ? 'reserved' :
                  'selectable'
                } ${selectedDate?.day === day.day &&
                  selectedDate?.month === day.month &&
                  selectedDate?.year === day.year ? 'selected' : ''
                }`}
              onClick={() => handleDateClick(day)}
            >
              {formatNumber(Number(day.day))}
            </div>
          ))}
        </div>
      </div>
    );
  };




  return (
    <div className='flex flex-col w-full h-[350px]  rounded-[12px] shadow-sm  bg-white p-[10px] justify-start  items-start   '>

      <div className='flex flex-col w-full    overflow-y-auto overflow-x-hidden'>

        <div className="flex justify-center   w-full  h-[350px]  overflow-y-auto overflow-x-hidden">
          {showCalendar && renderCalendar()}
        </div>

     

      </div>

    </div>
  );
};

export default Calendar;