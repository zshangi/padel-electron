// src/components/ReservationGrid.jsx
import React, { useState, useEffect } from 'react';
import Box from '../../components/Box';
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import jalaali from 'jalaali-js';
import { formatNumber, formatPersianFullDate, formatPersianTimeSlot } from '../../../utils/numberUtils';

const gregorianToJalaali = (date) => jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
const formatJalaali = (jy, jm, jd) => `${jy}/${jm}/${jd}`;

const timeSlots = [];
for (let i = 6; i <= 23; i++) {
  timeSlots.push(`${i}:00-${i + 1}:00`);
}

const ReservationGrid = ({ selectedTime, setSelectedTime, courts, reservations }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const { jy, jm, jd } = gregorianToJalaali(currentDate);

  const isSelectedTime = (timeSlot) => selectedTime === timeSlot;
  const handleTimeSlotClick = (timeSlot) => setSelectedTime(timeSlot);

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };


const currentDateStr = formatJalaali(jy, jm, jd);

const reservationsForDate = reservations.filter(
  res => res.selected_day === currentDateStr
);

const isReserved = (courtId, timeSlot) => {
  return reservationsForDate.some(
    reservation =>
      reservation.court_id === courtId &&
      reservation.selected_time === timeSlot
  );
};

const isAnyCourtReserved = (timeSlot) => {
  return reservationsForDate.some(
    reservation => reservation.selected_time === timeSlot
  );
};

const getAllCourtsCellColor = (timeSlot) => {
  const totalCourts = courts.length;
  const reservedCourts = courts.filter(court => isReserved(court.id, timeSlot)).length;

  if (reservedCourts === 0) return 'bg-white';
  if (reservedCourts === totalCourts) return 'bg-black';

  const percentage = reservedCourts / totalCourts;
  if (percentage <= 0.25) return 'bg-gray-200';
  if (percentage <= 0.5) return 'bg-gray-400';
  if (percentage <= 0.75) return 'bg-gray-600';
  return 'bg-gray-800';
};




  if (loading) {
    return (
      <Box width={697} height={311}>
        <div className="flex justify-center items-center h-full">
          <div>Loading...</div>
        </div>
      </Box>
    );
  }

  return (
    <div className="flex flex-col h-full p-[15px] text-[10px]">
      <div className="flex justify-center items-center mb-[10px] ">
        <button onClick={() => navigateDay(-1)} className="p-1 rounded hover:bg-gray-200 transition-colors">
          <SlArrowRight size={8} />
        </button>
        <div className='text-[12px] text-[#4E4E4E]'>
          {formatPersianFullDate(jy, jm, jd, '#4E4E4E')}
        </div>
        <button onClick={() => navigateDay(1)} className="p-1 rounded hover:bg-gray-200 transition-colors">
          <SlArrowLeft size={8} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex flex-col w-full border-collapse">
          {/* Time header row */}
<div className="flex h-[60px]"> {/* increase height */}
  <div className="w-[80px] text-right h-[80px] "></div>
  {timeSlots.map(timeSlot => (
    <div
      key={timeSlot}
      className={`w-[55px] h-[60px]  flex items-center justify-center   text-[7px] text-center cursor-pointer hover:bg-gray-100 ${
        isSelectedTime(timeSlot) ? 'body-farsi-bold' : ''
      }`}
      onClick={() => handleTimeSlotClick(timeSlot)}
      style={{ transformOrigin: 'center center' }} // ensures rotation pivots correctly
    >
     <span  >{formatPersianTimeSlot(timeSlot)}</span> 
    </div>
  ))}
</div>


          <div className="flex h-[28px]">
            <div className="w-[80px] text-right">همه زمین ها</div>
            {timeSlots.map(timeSlot => (
              <div
                key={timeSlot}
                className={`w-[55px] border-[0.5px] border-gray-300 p-1 text-center text-xs ${getAllCourtsCellColor(timeSlot)} ${
                  isSelectedTime(timeSlot) ? 'bg-[#000AFF]' : ''
                }`}
                onClick={() => handleTimeSlotClick(timeSlot)}
              ></div>
            ))}
          </div>

          {courts.map(court => (
            <div className="flex h-[28px]" key={court.id}>
              <div className="flex w-[80px] items-center text-right text-[10px]">{court.name}</div>
              {timeSlots.map(timeSlot => (
                <div
                  key={`${court.id}-${timeSlot}`}
                  className={`w-[55px] border-[0.5px] border-gray-300 p-1 text-center ${
                    isReserved(court.id, timeSlot) ? 'bg-black' : 'bg-white hover:bg-gray-50'
                  } ${isSelectedTime(timeSlot) ? 'bg-[#4951FF]' : ''}`}
                  onClick={() => handleTimeSlotClick(timeSlot)}
                >
                  {isReserved(court.id, timeSlot) && (
                    <span className="text-white text-xs">رزرو</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReservationGrid;
