import React, { useState, useEffect } from 'react';
import jalaali from 'jalaali-js';
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import DropDown from './DropDown';
import Input from './Input';

import { generateWorkingSlots } from "../../utils/timeSlots";
import Box from '../../components/Box'
import { backendAccessPost } from '../../utils/Authentication';
import { FiArrowDownCircle,FiArrowUpCircle } from 'react-icons/fi';
import {
  getCalendarDays,
  getDayOfWeek,
  weekDays,
} from '../../utils/calenderUtils';
import { formatNumber, formatPersianTime } from '../../utils/numberUtils';
const persianMonthLabels = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const ListDateTime = ({ category, categorycontent, reservations, courts, subcategory, setReservations }) => {
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [currentMonth, setCurrentMonth] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([])
  const [packagesName, setPackageName] = useState()
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [days, setDays] = useState([]);
  const [partDays,setPartDays] = useState(16)
  const [selectedWeekdayIndex, setSelectedWeekdayIndex] = useState(
    Math.max(0, weekDays.findIndex(day => day.key === 'monday'))
  );
  const [selectedWeekdayDate, setSelectedWeekdayDate] = useState(null);
  const selectedCourt = courts.find(c => String(c.id) === String(selectedCourtId));
  const categoryPackage = category.filter(c => c.maincategory_id === "3")

  useEffect(() => {
    if (selectedCourtId) return;
    const firstActiveCourt = courts.find(c => c.status === 'active');
    if (firstActiveCourt) {
      setSelectedCourtId(firstActiveCourt.id);
    }
  }, [courts, selectedCourtId]);

  const [month, setMonth] = useState(1);
  useEffect(() => {

    const today = new Date();
    const j = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    setCurrentMonth({ jy: j.jy, jm: j.jm });
    setMonth(j.jm);

  }, []);

  const selectedYear = currentMonth?.jy;
  const selectedMonth = Number(month);
  const monthOptions = persianMonthLabels.map((label, idx) => ({ value: idx + 1, label }));

  useEffect(() => {
    if (!selectedYear || !selectedMonth) return;
    setDays(getCalendarDays({
      year: selectedYear,
      month: selectedMonth
    }))

  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    setPartDays(16);
    setSelectedWeekdayDate(null);
  }, [selectedMonth]);

  const formatReservationDate = (year, monthValue, day) => `${year}/${monthValue}/${day}`;
  const monthDays = days.filter(d => d.month === selectedMonth && d.isCurrentMonth);
  const activeWeekDay = weekDays[selectedWeekdayIndex]?.key;
  const weekDayDays = monthDays.filter(d => getDayOfWeek(d) === activeWeekDay);
  const visibleDays = weekDayDays.slice(0, partDays);
  const getCourtSlotsForShortKey = (shortKey) => {
    if (!selectedCourt) return [];

    const slots = selectedCourt?.data?.workingHours?.[shortKey];
    if (Array.isArray(slots) && slots.length > 0) {
      return slots;
    }

    const startTime = `${selectedCourt?.data?.defaultWorkingHours?.startTime || '6'}:00`;
    const endTime = `${selectedCourt?.data?.defaultWorkingHours?.endTime || '23'}:00`;
    const duration = parseInt(selectedCourt?.data?.priceData?.time, 10) || 60;

    return generateWorkingSlots(startTime, endTime, duration);
  };

  const selectedWeekdayShortKey = weekDays[selectedWeekdayIndex]?.shortKey;
  const weekdaySlots = getCourtSlotsForShortKey(selectedWeekdayShortKey);

  const isReservedSlot = (selectedDay, timeSlot) => {
    return reservations.some(
      r =>
        r.selected_day === selectedDay &&
        r.selected_time === timeSlot &&
        String(r.court_id) === String(selectedCourtId)
    );
  };

  const handleAddSlot = (day, slot) => {
    if (!selectedCourtId || isReservedSlot(day, slot)) {
      return;
    }

    const existingSlot = selectedSlots.find(
      selectedSlot => selectedSlot.date === day && selectedSlot.time === slot
    );
    if (existingSlot) {
      handleRemoveSlot(existingSlot);
      return;
    }
    const newSlot = {
      date: day,
      time: slot,
      courtid: selectedCourtId
    };
    setSelectedSlots(prev => [...prev, newSlot]);
  };
  const handleRemoveSlot = (selectedSlot) => {
    setSelectedSlots(prev => prev.filter(
      slot => !(slot.date === selectedSlot.date && slot.time === selectedSlot.time)
    ));
  };
  const isSlotSelected = (day, slot) =>
    selectedSlots.some(selectedSlot => selectedSlot.date === day && selectedSlot.time === slot);
  const getSelectedMainPrice = () => {
    let price = '0';
    if (!selectedCategoryId) return price;
    const matchedCategory = categorycontent.find(
      item => String(item.category_id) === String(selectedCategoryId)
    );
    if (!matchedCategory) return price;
    if (selectedSubcategoryId) {
      const matchedSub = matchedCategory.subcategorycontent?.find(
        sub => String(sub.subcategory_id) === String(selectedSubcategoryId)
      );
      if (matchedSub?.packageprice !== undefined) {
        price = matchedSub.packageprice;
      }
    }
    if (price === '0' || !selectedSubcategoryId) {
      price = matchedCategory.categorycontent?.packageprice || '0';
    }
    return price;
  };
  const handleSubmit = () => {



    const payablePrice = getSelectedMainPrice();
    const newReservations = selectedSlots.map(slot => {
      return {
        selected_day: slot.date,
        selected_time: slot.time,
        court_id: slot.courtid,
        couch_id: null,
        user_id: null,
        status: 'offerPackage',
        reservedCouch: true,
        data: {
          paid: 0,
          payable: payablePrice,
          packagesName: packagesName,
          reservation_category_id: selectedCategoryId,
          reservation_subcategory_id: selectedSubcategoryId || null,
        }
      };
    });

    handleSaveReservation(newReservations);
  };
  const handleSaveReservation = (newReservations) => {
    const fallbackDate = selectedYear && selectedMonth ? formatReservationDate(selectedYear, selectedMonth, 1) : null;
    backendAccessPost("/api/reserved/add-bulk/", {
      reservations: newReservations,
      selectedDate: newReservations?.[0]?.selected_day || fallbackDate
    }).then(res => {
      try {
        setReservations(res.reserved)
      }
      catch (error) {
        console.error('Error fetching data:', error);
        setReservations([]);
      }
    })

  }
  const handleWeekdayMove = (direction) => {
    setSelectedWeekdayDate(null);
    setSelectedWeekdayIndex(prev => {
      const next = prev + direction;
      if (next < 0) return weekDays.length - 1;
      if (next >= weekDays.length) return 0;
      return next;
    });
  };
  const handleWeekdayDateClick = (dateValue) => {
    setSelectedWeekdayDate(prev => (prev === dateValue ? null : dateValue));
  };

  return (
    <div className='flex flex-col w-full space-y-[15px] '>
      <div className='flex space-x-[20px] space-x-reverse p-[10px]'>
        <DropDown
          label={'انتخاب ماه:'}

          field={month}
          setField={setMonth}
          list={monthOptions}
          width={150}
          labelPosition={'inside'}
        />
        <DropDown
          label={'زمین:'}
          field={selectedCourtId}
          setField={(value) => {
            setSelectedCourtId(value);
            setSelectedSlots([]);
          }}
          list={courts
            .filter(court => court.status === 'active')
            .map(court => ({ value: court.id, label: court.name }))}
          width={220}
          labelPosition='inside'
        />


      </div>
      <Box width={1071} height={700}>

        <div className='flex flex-col w-full space-y-[10px] pt-[10px] ' >
          <div className='flex items-center justify-center px-[10px]'>
            <button
              type='button'
              onClick={() => handleWeekdayMove(-1)}
              className='w-[24px] h-[24px] flex items-center justify-center  rounded-[4px] text-[#808080] '
            >
              <SlArrowRight size={10} />
            </button>
            <div className='h-[26px] min-w-[70px] px-[10px] rounded-[4px] font-bold text-[10px] flex items-center justify-center text-[#4951FF] '>
              {weekDays[selectedWeekdayIndex]?.display}
            </div>
            <button
              type='button'
              onClick={() => handleWeekdayMove(1)}
              className='w-[24px] h-[24px] flex items-center justify-center  rounded-[4px] text-[#808080] '
            >
              <SlArrowLeft size={10} />
            </button>
          </div>

          <div className=" w-fit ">
            <div className='w-[55px] float-start justify-center '></div>
            <div className='flex  space-x-[2px] space-x-reverse w-[cal(100%-70px)]  float-end'>
              {weekdaySlots
                .map(slot => (
                  <div key={slot}>
                    <button
                      className="block w-[55px] h-[10px]  text-center  border-l border-[#000] text-[8px] hover:bg-[#4951FF] hover:text-[#fff]"
                    >
                      {formatPersianTime(slot)}
                    </button>
                  </div>
                ))}

            </div>
          </div>

          <div className='flex flex-col space-y-[1px] text-[9px] bg-[#f6f6f6] border border-[#f6f6f6]  w-fit '>
            {visibleDays.map((d, indx) => {
              const dateValue = formatReservationDate(d.year, d.month, d.day);
              const isSelectedDate = selectedWeekdayDate === dateValue;
              return (
              <div className=" w-fit   ">

                <button
                  type='button'
                  onClick={() => handleWeekdayDateClick(dateValue)}
                  className={`w-[55px] float-start flex justify-center h-[20px] items-center border-l border-[#f6f6f6] ${
                    isSelectedDate
                      ? 'bg-[#4951FF] text-white'
                      : 'bg-white text-[#808080]'
                  }`}
                >
                  {formatNumber(d.year)}/{formatNumber(d.month)}/{formatNumber(d.day)}
                </button>
                <div className='flex  space-x-[2px] space-x-reverse w-[cal(100%-55px)]   float-end'>
                  {weekdaySlots
                    .map(slot => {
                      const isReserved = isReservedSlot(dateValue, slot);
                      const selectedCell = isSlotSelected(dateValue, slot);
                      const cellColorClass = selectedCell
                        ? 'bg-[#4951FF]'
                        : isReserved
                          ? 'bg-black'
                          : 'bg-white';
                      return (
                      <button
                        key={slot}
                        disabled={isReserved}
                        onClick={() => handleAddSlot(dateValue, slot)}
                        className={`flex justify-center items-center w-[55px] text-center text-[9px] ${
                          isReserved ? 'cursor-not-allowed' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className={` flex justify-center items-center  w-[55px] h-[20px] ${cellColorClass} text-[7px] ${
                          selectedCell || isReserved ? 'text-[#fff]' : 'text-[#808080]'
                        }`}>
                          {isReserved ? 'رزرو' : ''}
                        </div>

                      </button>
                      );
                    })}
                </div>
              </div>
            )})}
   
          </div>
<div className='w-full flex justify-center'>  
         {partDays < weekDayDays.length ?
            <button onClick={()=>setPartDays(weekDayDays.length)}>
<FiArrowDownCircle color={'#80808080'}/>
            </button>
            : weekDayDays.length > 16 ?
            <button onClick={()=>setPartDays(16)}><FiArrowUpCircle  color={'#80808080'}/></button>
            : null}</div>
        </div>
      </Box>
      <div>
        <Box width={1071} height={400} >
          <div className='flex h-[130px] p-[15px]'>
            <div className='w-[50%] grid grid-cols-2 '>
              <DropDown
                label={'دسته‌بندی:'}
                field={selectedCategoryId}
                setField={setSelectedCategoryId}
                list={categoryPackage.map(cat => ({ value: cat.id, label: cat.name }))}
                width={190}
              />
              <DropDown
                label={'زیردسته:'}
                field={selectedSubcategoryId}
                setField={setSelectedSubcategoryId}
                list={subcategory
                  .filter(sub => sub.category_id == selectedCategoryId)
                  .map(sub => ({ value: sub.id, label: sub.name }))}
                width={190}
              />
              <Input
                label="  نام پکیج  :"
                type="text"
                value={packagesName}
                onChange={(e) => setPackageName(e.target.value)}
                required
                width={190}
              />
              <Input
                label="  قیمت پیکیج(تومان)  :"
                value={formatNumber(
                  selectedSlots.length * (parseInt(getSelectedMainPrice()) || 0)
                )}
                required
                width={190}
                disabled={true}
                type="text"
              />
            </div>

            <div className='w-[50%] bg-white h-[100px] '>
              <div className="">
                <div className="text-[10px] font-medium mb-[5px] body-farsi-bold">سانس‌های انتخاب‌شده:</div>
                <div className="flex flex-wrap gap-[5px] border p-[5px] rounded-[4px] h-[70px] overflow-y-auto">
                  {selectedSlots?.map((slot, idx) => {
                    const courtName = courts.find(c => String(c.id) === String(slot.courtid))?.name || 'نامشخص';
                    return (
                      <div
                        key={idx}
                        className="flex items-center h-[25px] bg-[#80808010] text-[#808080] text-[9px] px-[3px] rounded"
                      >
                        <span>{slot.date}</span>
                        <span className="mx-1">|</span>
                        <span>{formatPersianTime(slot.time)}</span>
                        <span className="mx-1">|</span>
                        <span>{courtName}</span>
                        <button
                          onClick={() => handleRemoveSlot(slot)}
                          className=" text-[#808080] hover:text-red-700 px-[5px]"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>


            </div>
          </div>
          <div className=' flex justify-center'>
            <button onClick={handleSubmit} className='w-[70px] h-[25px] text-[9px] text-[#fff] bg-[#4951FF] rounded-[2px]'>ثبت</button>
            {selectedSlots.length > 0 && (
              <div className='w-[550px] text-[10px] text-end'>
                قیمت پکیج :
                <span className="">
                  {formatNumber(
                    selectedSlots.length * (parseInt(getSelectedMainPrice()) || 0)
                  )}
                </span> تومان
              </div>
            )}
          </div>

        </Box>

      </div>
    </div>

  );
};

export default ListDateTime;
