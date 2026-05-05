import React, { useState, useEffect } from 'react';
import Calendar from '../../../components/Calender';
import TimeSlot from '../../../components/TimeSlot';
import { formatNumber, formatPersianFullDate, formatPersianTime } from '../../../utils/numberUtils';
import Box from '../../components/Box';

import jalaali from 'jalaali-js';

const CalendarModal = ({
  showModal,
  setShowModal,
  fetchCourts,
  courts,
  weekDays,
  category,
  subcategory,
  categorycontent,
  setting,
  maincategory_id = '1',
  mode = 'monthly', 
  courtId = null, 
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCourtId, setSelectedCourtId] = useState(courtId || null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [weekDayCheckboxes, setWeekDayCheckboxes] = useState({});
  const [isClosingAllDays, setIsClosingAllDays] = useState(false);
  
  const getTodayJalali = () => {
    const today = new Date();
    const { jy, jm, jd } = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return { year: jy, month: jm, day: jd };
  };

  useEffect(() => {
    if (showModal) {
      setSelectedDate(getTodayJalali());
      setWeekDayCheckboxes({});
      setSelectedSlots([]);
      setIsClosingAllDays(false);
    }
  }, [showModal]);

  const reservedDates = { courts: {}, couches: {} };
  // This would be populated with actual reservation data

  const courtStyles = {
    selectableDay: { backgroundColor: 'rgb(185, 237, 0, 0.2)', color: '#788f2a', border: '0.1px solid #B9ED0070 ' },
    selectableHover: { backgroundColor: '#b9ed00', color: '#fff' },
    selectedDay: { backgroundColor: '#b9ed00', color: '#fff' },
    reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleConfirmTime = (time, isReserved, availableCourts, availableCouches, autoCourtId) => {
    const courtId = selectedCourtId || autoCourtId;
    if (!courtId || !selectedDate) return;

    const newSlot = { date: selectedDate, time, courtId };
    if (selectedSlots.some(s => s.time === time)) {
      setSelectedSlots(prev => prev.filter(s => s.time !== time));
    } else {
      setSelectedSlots(prev => [...prev, newSlot]);
    }
  };

  const handleWeekDayCheckboxChange = (dayKey) => {
    setWeekDayCheckboxes(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }));
  };

  const handleCloseAllDays = () => {
    setIsClosingAllDays(true);
    // Logic to close all selected days in the month
    // This would create reservations for all selected days with get_by_who = admin
  };

  const handleSubmit = () => {
    if (selectedSlots.length === 0 && !isClosingAllDays) {
      alert('لطفاً حداقل یک بازه زمانی یا روز را انتخاب کنید.');
      return;
    }

    // Handle submission logic
    // For blocking slots: create reservations
    // For closing days: create reservations with get_by_who = admin
    setShowModal(false);
    fetchCourts();
  };

  if (!showModal) return null;

  return (
    <>
      <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-[#4D4D4D]">
        <div className="relative w-[672px] h-[565px]">
          <div className="border-0 rounded-[20px] shadow-lg relative flex flex-col w-[672px] bg-[#F8F8F8] outline-none focus:outline-none p-[15px]">
            <div className="flex flex-col w-full justify-center items-start p-[30px] text-center space-y-[15px]">
              <div className='flex w-full h-[310px] space-x-[10px] space-x-reverse'>
                <Box width={360} height={310}>
                  <Calendar
                    reservedDates={reservedDates}
                    categories={courts}
                    subjectCategory={mode === 'monthly' ? 'این زمین' : 'همه زمین ها'}
                    selectedCourtId={selectedCourtId}
                    setSelectedCourtId={setSelectedCourtId}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    showCalendar={true}
                    setShowCalendar={() => { }}
                    showTimeSlots={false}
                    setShowTimeSlots={() => { }}
                    styles={courtStyles}
                    onDateSelect={handleDateSelect}
                    typeCategory="court"
                    mode="single"
                    selectedSlots={[]}
                    onAddSlot={() => { }}
                    onRemoveSlot={() => { }}
                    isAvailableMode={false}
                    setShowConfirmDateTime={() => { }}
                    setSelectedReserved={() => { }}
                    setSelectedCouchId={() => { }}
                    setSelectedCouchName={() => { }}
                    setSelectedCourtName={() => { }}
                    setIs_reserved_before={() => { }}
                    is_reserved_before={false}
                  />
                </Box>
                <Box width={232} height={310}>
                  <div className="flex flex-col space-y-[15px] p-[15px] text-start">
                    <span className='text-[9px]'>انتخاب سانس</span>
                    <TimeSlot
                      selectedDate={selectedDate}
                      onConfirmTime={handleConfirmTime}
                      reservedDates={reservedDates}
                      selectedCourtId={selectedCourtId}
                      selectedCouchId={null}
                      courts={courts}
                      couches={[]}
                      typeCategory="court"
                      mode="single"
                      styles={courtStyles}
                      selectedSlots={selectedSlots}
                      setShowCalendar={() => { }}
                      setShowTimeSlots={() => { }}
                      isAvailableMode={false}
                      setSelectedReserved={() => { }}
                      setIs_reserved_before={() => { }}
                      is_reserved_before={false}
                    />
                  </div>
                </Box>
              </div>
              
              {/* Week day checkboxes and close button */}
              <div className="flex w-full justify-between items-center space-x-[10px] space-x-reverse">
                <button
                  onClick={handleCloseAllDays}
                  className="w-[101px] h-[24px] text-[#000] bg-[#B9ED00] text-[10px] rounded hover:bg-[#a8d400] transition-colors"
                >
                  بستن
                </button>
                <div className="flex space-x-[5px] space-x-reverse">
                  {weekDays.map(day => (
                    <label key={day.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={weekDayCheckboxes[day.key] || false}
                        onChange={() => handleWeekDayCheckboxChange(day.key)}
                        className="mr-1"
                      />
                      <span className="text-[10px]">{day.display}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className='w-full flex justify-end space-x-[15px] space-x-reverse'>
                <button
                  onClick={handleSubmit}
                  className="w-[100px] py-1 rounded text-[10px] h-[25px] text-white bg-[#B9ED00]"
                >
                  تایید
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-[100px] py-1 rounded text-[10px] h-[25px] text-white bg-black"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};

export default CalendarModal;