// src/components/SecondCalendar.js
import React, { useState, useEffect,useRef } from 'react';
import ReusableCalendar from './ReusableCalendar';
import '../styles/PersianCalendar.css';
import {gregorianToJalaali} from '../utils/calenderUtils'
const SecondCalendar = ({ 
  courtId, 
  couchId, 
  reservations, 
  courts, 
  loading,
  onReservationClick,
  selectedDateReservations,
  setSelectedDateReservations,
  selectedDate,
  setSelectedDate,
  calendarStyles = {
    selectableDay: { backgroundColor: '#ffe6d3', color: '#fe7a15', border: '0.01px solid #fe7a1530' },
    selectableHover: { backgroundColor: '#FF6F00', color: '#fff' },
    selectedDay: { backgroundColor: '#FF6F00', color: '#fff' },
    reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
  }
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [fade, setFade] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const today = new Date();
    const { jy, jm, jd } = gregorianToJalaali(today);
    
    setSelectedDate({
      year: jy,
      month: jm,
      day: jd
    });
  }, []);

  return (
    <ReusableCalendar
      currentDate={currentDate}
      setCurrentDate={setCurrentDate}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      onDateSelect={() => {}}
      reservedDates={reservations}
      typeCategory="court"
      selectedCourtId={courtId}
      selectedCouchId={couchId}
      subjectCategory="All Courts"
      styles={calendarStyles}
      calendarStyles={calendarStyles}
      loading={loading}
      onReservationClick={onReservationClick}
      setSelectedDateReservations={setSelectedDateReservations}
      selectedDateReservations={selectedDateReservations}
      setShowCalendar={() => {}}
      setShowTimeSlots={() => {}}
      setShowConfirmDateTime={() => {}}
      dropdownOpen={dropdownOpen}
      setDropdownOpen={setDropdownOpen}
      dropdownRef={dropdownRef}
      hoveredDay={hoveredDay}
      setHoveredDay={setHoveredDay}
    />
  );
};

export default SecondCalendar;