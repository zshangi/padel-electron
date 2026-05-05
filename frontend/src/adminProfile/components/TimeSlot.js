import React from 'react';
import { normalizeTimeSlot, formatPersianFullDate, formatPersianTimeSlot } from '../../utils/numberUtils';

const TimeSlot = ({ time, isSelected, isReserved = false, styles, onClick }) => {

  let dayStyle;
  if (isReserved) {
    dayStyle = styles.reservedDay; 
  } else if (isSelected) {
    dayStyle = styles.selectedDay;
  } else {
    dayStyle = styles.selectableDay;
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center w-[55px] h-[25px] text-[8px] rounded-[2px] border text-center cursor-pointer transition-all ${
        !isReserved ? 'hover:shadow-sm' : ''
      }`}
      style={dayStyle}
    >
      {formatPersianTimeSlot(time)}
    </div>
  );
};

export default TimeSlot;