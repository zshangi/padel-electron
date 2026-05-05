import React, { useState, useEffect } from 'react';
import jalaali from 'jalaali-js';
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { 
  persianMonths, 
  formatJalaali,
  getCalendarDays,
  getDayOfWeek,
} from '../../utils/calenderUtils';
import { formatNumber } from '../../utils/numberUtils';

const ReusableCalendar = ({
  selectedDate,
  onDateSelect,
  checkDayStatus, // Recieving the generic check function
  styles = {},
}) => {
  const [currentMonth, setCurrentMonth] = useState(null); 
  const [days, setDays] = useState([]);

  useEffect(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('/').map(Number);
      setCurrentMonth({ jy: y, jm: m });
    } else {
      const today = new Date();
      const j = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
      setCurrentMonth({ jy: j.jy, jm: j.jm });
    }
  }, [selectedDate]);
    console.log(currentMonth)

  useEffect(() => {
    if (!currentMonth) return;
  
    const days = getCalendarDays({
      year: currentMonth.jy,
      month: currentMonth.jm
    });
  
    const mapped = days.map(d =>
      d.isCurrentMonth
        ? {
            day: d.day,
            dateStr: formatJalaali(d.year, d.month, d.day),
            isSelected: selectedDate === formatJalaali(d.year, d.month, d.day)
          }
        : null
    );
  
    setDays(mapped);
  }, [currentMonth, selectedDate]); 
  const prevMonth = () => {
    if (!currentMonth) return;
    let { jy, jm } = currentMonth;
    if (jm === 1) {
      jy -= 1;
      jm = 12;
    } else {
      jm -= 1;
    }
    setCurrentMonth({ jy, jm });
  };

  const nextMonth = () => {
    if (!currentMonth) return;
    let { jy, jm } = currentMonth;
    if (jm === 12) {
      jy += 1;
      jm = 1;
    } else {
      jm += 1;
    }
    setCurrentMonth({ jy, jm });
  };

  const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
console.log(days)
  if (!currentMonth) return <div>در حال بارگذاری...</div>;

  return (
    <div className="flex flex-col items-center w-full h-full justify-center p-[20px] space-y-[10px]">
      <div className="flex justify-center items-center w-full mb-2 space-x-[10px] space-x-reverse">
        <button onClick={prevMonth} className="text-[8px] font-bold"> <SlArrowRight size={7} /></button>
        <span className="text-[8px] font-medium">
          {persianMonths[currentMonth.jm - 1]} {formatNumber(Number(currentMonth.jy))}
        </span>
        <button onClick={nextMonth} className="text-[8px] font-bold"> <SlArrowLeft size={7} /></button>
      </div>

      <div className="grid grid-cols-7 gap-[5px] w-full ">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-[9px] text-gray-600">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-[8px] gap-x-[5px] w-full ">

        {days.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={index}
                className="h-7 flex items-center justify-center text-[10px]"
                style={styles.emptyDay}
              />
            );
          }

          const { dateStr, day: dayNumber } = day;
          const isSelected = selectedDate === dateStr;
          
          // Use the passed function to check availability. 
          // If checkDayStatus returns true, the day is Disabled.
          const isDisabled = checkDayStatus ? checkDayStatus(dateStr) : false;

          let dayStyle;
          if (isDisabled) {
            dayStyle = styles.disabledDay || { backgroundColor: '#f0f0f0', color: '#ccc', cursor: 'not-allowed' };
          } else if (isSelected) {
            dayStyle = styles.selectedDay;
          } else {
            dayStyle = styles.selectableDay;
          }

          return (
            <div
              key={index}
              onClick={() => !isDisabled && onDateSelect(dateStr)}
              className={`w-[30px] h-[30px] flex items-center justify-center text-[10px] rounded-full ${
                !isDisabled ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed'
              }`}
              style={dayStyle}
            >
              {formatNumber(dayNumber)}
            </div>
          );
        })}
      </div>

    </div>
    
  );
};

export default ReusableCalendar;