// src/components/ReusableCalendar.js
import React, { useEffect, useRef, useState } from 'react';
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { 
  persianMonths, 
  weekDays, 
  gregorianToJalaali, 
  jalaaliToGregorian, 
  formatJalaali,
  getCalendarDays,
  navigateMonth,
  getFilteredReservations,
  getDayOfWeek,
} from '../utils/calenderUtils';
import { formatNumber } from '../utils/numberUtils';

const ReusableCalendar = ({
  // Core calendar props

  selectedDate,
  setSelectedDate,
  onDateSelect,
  
  // Reservation props
  reservedDates = {},
  typeCategory,
  selectedCourtId,
  selectedCouchId,
  setSelectedCouchId,
setSelectedCourtId,  
  // Display props
  isAvailableMode = false,
  mode = 'single',
  selectedSlots = [],
  onAddSlot,
  onRemoveSlot,
  
  // UI props
 styles = {
    selectableDay: { backgroundColor: 'rgb(185, 237, 0, 0.2)', color: '#788f2a', border: '0.1px solid #B9ED0070 ' },
    selectableHover: { backgroundColor: '#b9ed00', color: '#fff' },
    selectedDay: { backgroundColor: '#b9ed00', color: '#fff' },
    reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
},
  calendarStyles = {},
  loading = false,
  
  // Callbacks
  onReservationClick,
  setSelectedDateReservations,
  selectedDateReservations,
  setShowCalendar,
  setShowTimeSlots,
  setShowConfirmDateTime,
  setSelectedCourtName,
  setSelectedCouchName,
  subjectCategory,
  setSelectedReserved,
  setIs_reserved_before,
  
  // Dropdown props
  dropdownOpen,
  setDropdownOpen,
  dropdownRef,
  hoveredDay,
  setHoveredDay,
  
  // Categories for dropdown
  categories = []
}) => {
  const [fade, setFade] = useState(false);
  const [localDropdownOpen, setLocalDropdownOpen] = useState(false);
  const localDropdownRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const effectiveDropdownOpen = dropdownOpen !== undefined ? dropdownOpen : localDropdownOpen;
  const effectiveDropdownRef = dropdownRef || localDropdownRef;
  const effectiveSetDropdownOpen = dropdownOpen !== undefined ? setDropdownOpen : setLocalDropdownOpen;
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (effectiveDropdownRef.current && !effectiveDropdownRef.current.contains(e.target)) {
        effectiveSetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [effectiveDropdownRef, effectiveSetDropdownOpen]);

  const { jy: pYear, jm: pMonth } = gregorianToJalaali(currentDate);

  // Get filtered reservations for the selected court/couch
  const filteredReservations = getFilteredReservations(
    reservedDates, 
    typeCategory, 
    typeCategory === 'couch' ? selectedCouchId : selectedCourtId
  );

  // Handle day click
  const handleDayClick = (day) => {
    if (mode === 'package') {
      setSelectedDate(day);
      onDateSelect(day);
      
      const exists = selectedSlots.some(
        slot =>
          slot?.date.year === day?.year &&
          slot?.date.month === day?.month &&
          slot?.date.day === day?.day
      );

      if (exists) {
        onRemoveSlot(day);
      } else {
        onAddSlot(day);
        setShowTimeSlots(true);
        setShowCalendar(false);
        setShowConfirmDateTime(true);
      }
    } else {
      setSelectedDate(day);
      onDateSelect(day);
      
      const pStr = formatJalaali(day.year, day.month, day.day);
      const dayReservations = filteredReservations[pStr] || [];
      const isFullyReserved = dayReservations.length > 0;
      
      setIs_reserved_before(isFullyReserved);

      setFade(true);

      setTimeout(() => {
        if (!isAvailableMode || typeCategory === 'couch') {
          setShowCalendar(false);
          setShowTimeSlots(true);
        }
        setShowConfirmDateTime(true);
        setFade(false);
      }, 300);
    }
  };

  // Navigate months
  const navigateMonthHandler = (direction) => {
    setFade(true);
    setTimeout(() => {
      const newMonth = navigateMonth({ year: pYear, month: pMonth }, direction);
      setCurrentDate(newMonth.date);
      setFade(false);
    }, 300);
  };

  // Get calendar days
  const days = getCalendarDays({ year: pYear, month: pMonth });

  // Get item name for dropdown
  const getItemName = () => {
    if (typeCategory === 'couch') {
      return selectedCouchId 
        ? categories.find(cat => String(cat.id) === String(selectedCouchId))?.name 
        : subjectCategory;
    } else {
      return selectedCourtId 
        ? categories.find(cat => String(cat.id) === String(selectedCourtId))?.name 
        : subjectCategory;
    }
  };

  // Get day style
  const getDayStyle = (day) => {
    const isSelected = 
      mode === 'package'
        ? selectedSlots?.some(
          slot =>
            slot?.date.year === day?.year &&
            slot?.date.month === day?.month &&
            slot?.date.day === day?.day
        )
        : selectedDate &&
          selectedDate.year === day.year &&
          selectedDate.month === day.month &&
          selectedDate.day === day.day;

    const pStr = formatJalaali(day.year, day.month, day.day);
    const dayReservations = filteredReservations[pStr] || [];
    const isReserved = dayReservations.length > 0;
    
    let baseStyle = isReserved 
      ? styles.reservedDay 
      : isSelected 
        ? styles.selectedDay 
        : styles.selectableDay;

    if (calendarStyles) {
      if (!day.isCurrentMonth) {
        baseStyle = { ...baseStyle, color: '#bdbdbd' };
      } else if (isSelected) {
        baseStyle = { ...baseStyle, ...calendarStyles.selectedDay };
      } else if (isReserved) {
        baseStyle = { ...baseStyle, ...calendarStyles.reservedDay };
      } else {
        baseStyle = { ...baseStyle, ...calendarStyles.selectableDay };
      }
    }

    return baseStyle;
  };
  useEffect(() => {
    if (!selectedDate && typeof setSelectedDate === 'function') {
      const today = new Date();
      const { jy, jm, jd } = gregorianToJalaali(today);
      setSelectedDate({ year: jy, month: jm, day: jd });
    }
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className='flex flex-col w-full justify-center items-center space-y-[10px] '>
      {/* Calendar Header */}
      <div className="w-full px-[10px] mt-[10px]">
        {categories.length > 0 && (
          <div className="flex justify-center mb-2 float-end">
            <div ref={effectiveDropdownRef} className="relative">
              <button
                onClick={() => effectiveSetDropdownOpen(!effectiveDropdownOpen)}
                className="flex items-center justify-between body-farsi text-[8px] border border-[#eee] bg-[#FAFAFA] w-[110px] rounded text-[#4E4E4E] py-1 h-[22px] px-2"
              >
                <span>{getItemName()}</span>
                <MdOutlineKeyboardArrowDown
                  className={`transition-transform duration-200 ${effectiveDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                  size={12}
                />
              </button>

              {effectiveDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#eee] rounded shadow-md z-10">
                  <div
                    onClick={() => {
                      if (typeCategory === 'couch') {
                        setSelectedCouchId(null);
                        setSelectedCouchName(null);
                      } else {
                        setSelectedCourtId(null);
                        setSelectedCourtName(null);
                      }
                      effectiveSetDropdownOpen(false);
                    }}
                    className={`px-2 py-1 text-[8px] hover:bg-gray-100 cursor-pointer ${
                      !(typeCategory === 'couch' ? selectedCouchId : selectedCourtId) ? 'bg-gray-100' : ''
                    }`}
                  >
                    {subjectCategory}
                  </div>
                  
                  {categories.map(cat => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        if (typeCategory === 'couch') {
                          setSelectedCouchId(cat.id);
                          setSelectedCouchName(cat.name);
                        } else {
                          setSelectedCourtId(cat.id);
                          setSelectedCourtName(cat.name);
                        }
                        effectiveSetDropdownOpen(false);
                      }}
                      className={`px-2 py-1 text-[8px] hover:bg-gray-100 cursor-pointer ${
                        String(typeCategory === 'couch' ? selectedCouchId : selectedCourtId) === String(cat.id) ? 'bg-gray-100' : ''
                      }`}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-start h-[30px] text-[9px] float-start">
          <button onClick={() => navigateMonthHandler(-1)}>
            <SlArrowRight size={7} />
          </button>
          <h2 className='body-farsi px-[5px] text-[9px]'>{persianMonths[pMonth - 1]} {formatNumber(Number(pYear))}</h2>
          <button onClick={() => navigateMonthHandler(1)}>
            <SlArrowLeft size={7} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="flex space-x-[15px] space-x-reverse w-full px-[30px]">
      {weekDays.map((day) => (
  <div key={day.key} className="week-day body-farsi text-[8px] text-[#808080]">
    {day.display}
  </div>
))}
      </div>

      {/* Calendar days */}
      <div className={`grid grid-cols-7 gap-y-[10px] px-[20px] w-full justify-items-center items-center  body-farsi`}>
        {days.map((day, index) => {
          const dayStyle = getDayStyle(day);
          const isSelected = 
            mode === 'package'
              ? selectedSlots?.some(
                slot =>
                  slot?.date.year === day?.year &&
                  slot?.date.month === day?.month &&
                  slot?.date.day === day?.day
              )
              : selectedDate &&
                selectedDate.year === day.year &&
                selectedDate.month === day.month &&
                selectedDate.day === day.day;
          
          return (
            <div
              key={index}
              className={`calendar-day ${isSelected ? 'selected' : ''}`}
              style={dayStyle}
              onClick={() => handleDayClick(day)}
              onMouseEnter={() => setHoveredDay && setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay && setHoveredDay(null)}
            >
              {formatNumber(Number(day.day))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReusableCalendar;