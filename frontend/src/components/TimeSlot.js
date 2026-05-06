// src/components/TimeSlot.js
import React, { useRef, useEffect, useState } from 'react';
import '../styles/PersianCalendar.css';
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { formatNumber } from '../utils/numberUtils'
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import jalaali from 'jalaali-js';

const TimeSlot = ({
  selectedDate,
  onConfirmTime,
  reservedDates = {},    
  selectedCourtId,
  selectedCouchId,
  selectedSlots = [],
  setShowCalendar,
  setShowTimeSlots,
  styles = {},
  isAvailableMode = false, 
  courts,
  couches,
  typeCategory,
  mode,
  setIs_reserved_before,
  is_reserved_before
}) => {
  const scrollRef = useRef(null);
  const [showCouchSelection, setShowCouchSelection] = useState(false);
  const [tempSelectedCouchId, setTempSelectedCouchId] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [selectedDate]);

  // Check if we need to show couch selection
  useEffect(() => {
    if (typeCategory === 'couch' && !selectedCouchId) {
      setShowCouchSelection(true);
    } else {
      setShowCouchSelection(false);
    }
  }, [typeCategory, selectedCouchId]);

  const handleScrollDown = () => {
    scrollRef.current?.scrollBy({ top: 100, behavior: "smooth" });
  };

  // Helper function to get day of week in Persian
  const getDayOfWeek = (date) => {
    if (!date) return '';
    const jalaaliDate = jalaali.toJalaali(date.year, date.month, date.day);
    const gregorian = jalaali.toGregorian(jalaaliDate.jy, jalaaliDate.jm, jalaaliDate.jd);
    const gregorianDate = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
    const dayIndex = gregorianDate.getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayIndex];
  };

  // Create date key for reservation lookup
  const dateKey = `${selectedDate?.year}/${selectedDate?.month}/${selectedDate?.day}`;
  
  // Function to find available courts for a specific time
  const findAvailableCourts = (timeString) => {
    return courts.filter(court => {
      // First, check if this court is reserved at this time
      const courtReservedDates = reservedDates.courts?.[String(court.id)]?.[dateKey] || [];
      if (courtReservedDates.includes(timeString)) {
        return false;
      }
      
      // Now check if the court is open at this time
      const dayOfWeek = getDayOfWeek(selectedDate);
      const exceptions = court.data.workingHoursExceptions;
      
      let courtStartHour, courtEndHour;
      
      // Check if there's an exception for this day
      if (exceptions && exceptions[dayOfWeek]) {
        courtStartHour = parseInt(exceptions[dayOfWeek].startTime);
        courtEndHour = parseInt(exceptions[dayOfWeek].endTime);
      } else {
        courtStartHour = parseInt(court.data.defaultWorkingHours.startTime);
        courtEndHour = parseInt(court.data.defaultWorkingHours.endTime);
      }
      
      // Extract the hour from the time string (e.g., "7:00 - 8:00" -> 7)
      const timeHour = parseInt(timeString.split(':')[0]);
      
      // Check if the time is within the court's working hours
      return timeHour >= courtStartHour && timeHour < courtEndHour;
    }).map(court => ({
      id: court.id,
      name: court.data.name,
      price: court.data.mainPrice
    }));
  };

  // Function to find available couches for a specific time
  const findAvailableCouches = (timeString) => {
    // First, check if there's at least one court available at this time
    const dayOfWeek = getDayOfWeek(selectedDate);
    const timeHour = parseInt(timeString.split(':')[0]);
    
    // Find all available courts at this time
    const availableCourts = courts.filter(court => {
      // Check if this court is reserved at this time
      const courtReservedDates = reservedDates.courts?.[String(court.id)]?.[dateKey] || [];
      if (courtReservedDates.includes(timeString)) {
        return false; // Court is already reserved at this time
      }
      
      // Check if the court is open at this time
      const exceptions = court.data.workingHoursExceptions;
      
      let courtStartHour, courtEndHour;
      
      // Check if there's an exception for this day
      if (exceptions && exceptions[dayOfWeek]) {
        courtStartHour = parseInt(exceptions[dayOfWeek].startTime);
        courtEndHour = parseInt(exceptions[dayOfWeek].endTime);
      } else {
        courtStartHour = parseInt(court.data.defaultWorkingHours.startTime);
        courtEndHour = parseInt(court.data.defaultWorkingHours.endTime);
      }
      
      // Check if the time is within the court's working hours
      return timeHour >= courtStartHour && timeHour < courtEndHour;
    }).map(court => ({
      id: court.id,
      name: court.data.name,
      price: court.data.mainPrice
    }));
    
    // If no court is available, no couch can be available
    if (availableCourts.length === 0) {
      return [];
    }
    
    // Now filter couches based on their own availability
    return couches.filter(couch => {
      // First, check if this couch is reserved at this time
      const couchReservedDates = reservedDates.couches?.[String(couch.id)]?.[dateKey] || [];
      if (couchReservedDates.includes(timeString)) {
        return false; // Couch is already reserved at this time
      }
      
      // Now check if the couch is available at this time based on their working hours
      const workingHours = couch.data.workingHours;
      
      // Check if the couch works on this day
      if (!workingHours || !workingHours[dayOfWeek]) {
        return false; // Couch doesn't work on this day
      }
      
      // Check if the time is within the couch's working hours
      const times = workingHours[dayOfWeek].time;
      for (let i = 0; i < times.length; i++) {
        const hour = parseInt(times[i]);
        if (timeHour === hour) {
          return true; // Couch is available at this time
        }
      }
      
      return false; // Couch is not available at this time
    }).map(couch => ({
      id: couch.id,
      name: couch.name,
      price: couch.data.price,
      courtPrice: couch.data.courtPrice,
      availableCourts: availableCourts // Include available courts for this couch
    }));
  };

  // Function to find available couches for the selected date
  const findAvailableCouchesForDate = () => {
    const dayOfWeek = getDayOfWeek(selectedDate);
    
    // Filter couches based on their working hours for the selected date
    return couches.filter(couch => {
      // Check if the couch works on this day
      const workingHours = couch.data.workingHours;
      if (!workingHours || !workingHours[dayOfWeek]) {
        return false; // Couch doesn't work on this day
      }
      
      // Check if the couch has any working hours for this day
      const times = workingHours[dayOfWeek].time;
      return times && times.length > 0;
    }).map(couch => ({
      id: couch.id,
      name: couch.name,
      price: couch.data.price,
      courtPrice: couch.data.courtPrice
    }));
  };

  // Get times selected by user
  const userSelected = selectedSlots
    .filter(s =>
      s.date.year === selectedDate?.year &&
      s.date.month === selectedDate?.month &&
      s.date.day === selectedDate?.day
    )
    .map(s => s.time);

  const timeSlots = [];
  
  // Generate time slots for all hours (6:00-23:00) to show all possible reservations
  const startHour = 6; // Start from 6:00 AM
  const endHour = 23;  // End at 11:00 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    const timeString = `${hour}:00-${hour + 1}:00`;
    const displayTime = `${formatNumber(hour)}:۰۰-${formatNumber(hour + 1)}:۰۰`;

    let isReserved = false;
    
    if (typeCategory === 'court') {
      if (selectedCourtId) {
        // Check if this time slot is reserved for the selected court
        const courtReservedDates = reservedDates.courts?.[String(selectedCourtId)]?.[dateKey] || [];
        isReserved = courtReservedDates.includes(timeString);
      } else {
        // If no court selected, check if all courts are reserved for this time
        isReserved = courts.every(court => {
          const courtReservedDates = reservedDates.courts?.[String(court.id)]?.[dateKey] || [];
          return courtReservedDates.includes(timeString);
        });
      }
    } else if (typeCategory === 'couch') {
      const couchIdToCheck = tempSelectedCouchId || selectedCouchId;
      if (couchIdToCheck) {
        // Check if this time slot is reserved for the selected couch
        const couchReservedDates = reservedDates.couches?.[String(couchIdToCheck)]?.[dateKey] || [];
        isReserved = couchReservedDates.includes(timeString);
      } else {
        // If no couch selected, check if all couches are reserved for this time
        isReserved = couches.every(couch => {
          const couchReservedDates = reservedDates.couches?.[String(couch.id)]?.[dateKey] || [];
          return couchReservedDates.includes(timeString);
        });
      }
    }

    const isSelectedByUser = userSelected.includes(timeString);

    const baseStyle =
      isSelectedByUser
        ? styles.selectedDay
        : isReserved
        ? { backgroundColor: "#DCDCDC", color: "#fff" }
        : { backgroundColor: "#f5f5f5", color: "#000" };

    timeSlots.push(
      <div
        key={hour}
        style={baseStyle}
        className="flex w-[52px] justify-center items-center body-farsi rounded-[2px] h-[25px]  cursor-pointer hover:bg-[#e0e0e0]"
        onClick={() => {
          // Find available courts and couches for this time
          const availableCourts = typeCategory === 'court' ? findAvailableCourts(timeString) : [];
          const availableCouches = typeCategory === 'couch' ? findAvailableCouches(timeString) : [];
          
          // For court category, if no court is selected, automatically select the first available court
          let courtId = null;
          let couchId = null;
          
          if (typeCategory === 'court' && !selectedCourtId && availableCourts.length > 0) {
            courtId = availableCourts[0].id;
          } else if (typeCategory === 'court') {
            courtId = selectedCourtId;
          }
          
          if (typeCategory === 'couch') {
            couchId = tempSelectedCouchId || selectedCouchId;
          }
          
          // Check if this time is fully reserved
          const isFullyReserved = isReserved && (
            (typeCategory === 'court' && availableCourts.length === 0) ||
            (typeCategory === 'couch' && availableCouches.length === 0)
          );
          
          // In package mode, don't allow selection of fully reserved times
          if (mode === 'package' && isFullyReserved) {
            return;
          }
          
          // Update the is_reserved_before state for single mode
          if (mode === 'single') {
            setIs_reserved_before(isFullyReserved);
          }
          
          onConfirmTime(timeString, isReserved, availableCourts, availableCouches, courtId, couchId);
        }}
      >
        {displayTime}
      </div>
    );
  }

  // If we need to show couch selection
  if (showCouchSelection) {
    const availableCouches = findAvailableCouchesForDate();
    
    return (
      <div className='flex items-center justify-center w-full h-[330px] bg-[#fff rounded-[14px] shadow-md '>
        <div className="flex flex-col w-full justify-start items-center px-[10px]">
          <div className="w-full items-center mb-[20px] justify-center text-center relative">
            <span>انتخاب مربی</span>
            <button
              className="absolute left-0"
              onClick={() => {
                setShowTimeSlots(false);
                setShowCalendar(true);
              }}
            >
              <IoArrowBackCircleOutline color={"#ccc"} size={20} />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex flex-col justify-start items-center space-y-[5px] w-[300px] h-[220px] overflow-y-auto overflow-x-hidden scrollbar-hide"
          >
            {availableCouches.map(couch => (
              <div
                key={couch.id}
                className="flex w-[200px] justify-between items-center body-farsi rounded-[4px] h-[25px] p-[10px] cursor-pointer hover:bg-[#ffe6d3] border border-[#fe7a1530]"
                onClick={() => {
                  setTempSelectedCouchId(couch.id);
                  setShowCouchSelection(false);
                }}
              >
                <span>{couch.name}</span>
                <span>{formatNumber(couch.price)} تومان</span>
              </div>
            ))}
          </div>

          <button onClick={handleScrollDown} className="my-[5px]">
            <MdOutlineKeyboardArrowDown size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="grid grid-cols-3 gap-x-[6px] gap-y-[4px]  text-[9px]  justify-items-center justify-center  items-center  w-full  "
    >
      {timeSlots}
    </div>
  );
};

export default TimeSlot;
