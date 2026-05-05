import React, { useEffect, useMemo, useState } from 'react';
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import {
  gregorianToJalaali,
  jalaaliToGregorian,
  formatJalaali
} from '../../../utils/calenderUtils';
import { formatPersianTimeSlot, formatPersianFullDate } from '../../../utils/numberUtils';
import { generateWorkingSlots } from '../../../utils/timeSlots';

const DEFAULT_SLOT_DURATION = 60;
const DAY_START_TIME = '6:00';
const DAY_END_TIME = '24:00';

const parseJalaaliStringToDate = (jalaaliStr) => {
  if (!jalaaliStr) return new Date();
  const [y, m, d] = jalaaliStr.split('/').map(Number);
  return jalaaliToGregorian(y, m, d);
};

const ReservationGrid = ({
  selectedTime,
  setSelectedTime,
  courts,
  reservations,
  setReservations,
  category = [],
  categoryContent = [],
  selectedDate,
  setSelectedDate
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const categoriesWithTime = useMemo(() => {
    const contentByCategoryId = new Map(
      categoryContent.map(item => [String(item.category_id), item])
    );

    const mapped = category.map(item => {
      const matchedContent = contentByCategoryId.get(String(item.id));
      const rawDuration = matchedContent?.categorycontent?.time;
      const parsedDuration = parseInt(rawDuration, 10);

      return {
        id: String(item.id),
        name: item.name,
        hasTime: Number.isFinite(parsedDuration) && parsedDuration > 0,
        duration: Number.isFinite(parsedDuration) && parsedDuration > 0
          ? parsedDuration
          : DEFAULT_SLOT_DURATION
      };
    });

    const onlyWithTime = mapped.filter(item => item.hasTime);
    return onlyWithTime.length ? onlyWithTime : mapped;
  }, [category, categoryContent]);

  useEffect(() => {
    if (!categoriesWithTime.length) {
      setSelectedCategoryId('');
      return;
    }

    setSelectedCategoryId(prev =>
      categoriesWithTime.some(item => item.id === prev) ? prev : categoriesWithTime[0].id
    );
  }, [categoriesWithTime]);

  const selectedCategory = useMemo(
    () => categoriesWithTime.find(item => item.id === selectedCategoryId),
    [categoriesWithTime, selectedCategoryId]
  );
  const filteredCourts = useMemo(() => {
    if (!selectedCategoryId) return courts;
    return courts.filter(
      court => String(court?.data?.category_id) === String(selectedCategoryId)
    );
  }, [courts, selectedCategoryId]);

  const timeSlots = useMemo(() => {
    const step = selectedCategory?.duration || DEFAULT_SLOT_DURATION;
    const slots = generateWorkingSlots(DAY_START_TIME, DAY_END_TIME, step);
    return slots.length
      ? slots
      : generateWorkingSlots(DAY_START_TIME, DAY_END_TIME, DEFAULT_SLOT_DURATION);
  }, [selectedCategory]);

  useEffect(() => {
    if (!selectedTime) return;
    if (!timeSlots.includes(selectedTime)) {
      setSelectedTime(null);
    }
  }, [selectedTime, setSelectedTime, timeSlots]);

  const isSelectedTime = (timeSlot) => selectedTime === timeSlot;
  const handleTimeSlotClick = (timeSlot) => setSelectedTime(timeSlot);
  const isSameCourt = (reservationCourtId, courtId) =>
    String(reservationCourtId) === String(courtId);

  const navigateDay = (direction) => {
    const currentGregDate = parseJalaaliStringToDate(selectedDate);
    const newDate = new Date(currentGregDate);
    newDate.setDate(newDate.getDate() + direction);
    const { jy, jm, jd } = gregorianToJalaali(newDate);
    const newJalaaliStr = formatJalaali(jy, jm, jd);
    setSelectedDate(newJalaaliStr);
  };

  const isReserved = (courtId, timeSlot) => {
    return reservations.some(reservation =>
      isSameCourt(reservation.court_id, courtId) &&
      reservation.selected_time === timeSlot
    );
  };

  const getReservedCourtCountForTime = (timeSlot) => {
    const validCourtIds = new Set(filteredCourts.map(court => String(court.id)));
    const reservedIds = new Set(
      reservations
        .filter(reservation => reservation.selected_time === timeSlot)
        .map(reservation => String(reservation.court_id))
        .filter(courtId => validCourtIds.has(courtId))
    );
    return reservedIds.size;
  };

  const getAllCourtsCellStyle = (timeSlot) => {
    const totalCourts = filteredCourts.length;
    if (totalCourts === 0) return { backgroundColor: '#ffffff' };

    const reservedCourts = getReservedCourtCountForTime(timeSlot);
    const ratio = reservedCourts / totalCourts;

    if (ratio === 0) return { backgroundColor: '#ffffff' };
    if (ratio === 1) return { backgroundColor: '#000000' };

    const alpha = 0.12 + ratio * 0.78;
    return { backgroundColor: `rgba(0, 0, 0, ${alpha.toFixed(3)})` };
  };

  let displayJy = '';
  let displayJm = '';
  let displayJd = '';
  if (selectedDate) {
    [displayJy, displayJm, displayJd] = selectedDate.split('/').map(Number);
  }

  return (
    <div className="flex flex-col h-full p-[15px] text-[10px]">
      <div className="flex items-center justify-between mb-[10px]">
        <div className="flex items-center space-x-[6px] space-x-reverse">
          <div className="text-[10px] text-[#4E4E4E]">دسته بندی</div>
          <select
            className="h-[24px] min-w-[150px] border border-gray-300 rounded px-[4px] text-[10px] bg-white"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            {categoriesWithTime.map(item => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center items-center">
          <button
            onClick={() => navigateDay(-1)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            <SlArrowRight size={8} />
          </button>
          <div className='text-[12px] text-[#4E4E4E]'>
            {formatPersianFullDate(displayJy, displayJm, displayJd, '#4E4E4E')}
          </div>
          <button
            onClick={() => navigateDay(1)}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
          >
            <SlArrowLeft size={8} />
          </button>
        </div>

        <div className="w-[160px]"></div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex flex-col w-full border-collapse">
          <div className="flex h-[28px]">
            <div className="w-[80px] text-right"></div>
            {timeSlots.map(timeSlot => (
              <div
                key={timeSlot}
                className={`w-[55px] py-2 text-[8px] text-center cursor-pointer hover:bg-[#000AFF] hover:text-[#fff] ${
                  isSelectedTime(timeSlot) ? 'body-farsi-bold bg-[#000AFF] text-[#fff]' : ''
                }`}
                onClick={() => handleTimeSlotClick(timeSlot)}
              >
                {formatPersianTimeSlot(timeSlot)}
              </div>
            ))}
          </div>

          <div className="flex h-[28px]">
            <div className="w-[80px] text-right">همه زمین ها</div>
            {timeSlots.map(timeSlot => (
              <div
                key={timeSlot}
                className={`w-[55px] border-[0.5px] border-gray-300 p-1 text-center text-xs cursor-pointer ${
                  isSelectedTime(timeSlot) ? 'ring-1 ring-inset ring-[#000AFF]' : ''
                }`}
                style={getAllCourtsCellStyle(timeSlot)}
                onClick={() => handleTimeSlotClick(timeSlot)}
              ></div>
            ))}
          </div>

          {filteredCourts.map(court => (
            <div className="flex h-[28px]" key={court.id}>
              <div className="flex w-[80px] items-center text-right text-[10px]">{court.name}</div>
              {timeSlots.map(timeSlot => (
                <div
                  key={`${court.id}-${timeSlot}`}
                  className={`w-[55px] border-[0.5px] border-gray-300 p-1 text-center ${
                    isReserved(court.id, timeSlot) ? 'bg-black' : 'bg-white hover:bg-gray-50'
                  } ${isSelectedTime(timeSlot) ? 'ring-1 ring-inset ring-[#4951FF]' : ''}`}
                  onClick={() => handleTimeSlotClick(timeSlot)}
                >
                  {isReserved(court.id, timeSlot) && (
                    <span className="text-white text-xs"> </span>
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
