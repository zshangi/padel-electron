import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReusableCalendar from './ReusableCalendar';
import TimeSlot from './TimeSlot';
import { formatNumber, formatPersianFullDate, formatPersianTime, formatPersianTimeSlot } from '../../utils/numberUtils';
import Box from '../../components/Box';
import DropDown from './DropDown';
import Input from './Input';
import jalaali from 'jalaali-js';
import { weekDays, formatJalaali, getDayOfWeek } from '../../utils/calenderUtils';
import { backendAccessPost, backendAccessGet } from '../../utils/Authentication';


const AdminReservationModal = ({
  isOpen,
  onClose,
  category,
  subcategory,
  categorycontent,
  courts = [],
  couches = [],
  members = [],
  reservations = [],
  onSave,
  wantsCoach,
  setWantsCoach,
  isPackage = false,
  styles,
  editingReservation,
  setReservations,
  selectedDate,
  setSelectedDate

}) => {
  const isEditMode = Boolean(editingReservation);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [payableAmount, setPayableAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [isSettled, setIsSettled] = useState(false);
  const [selectedCouchId, setSelectedCouchId] = useState(null);
  const [packagesName, setPackageName] = useState('');
  const [liveReservations, setLiveReservations] = useState([]);
  const [liveReservationsCoach, setLiveReservationsCoach] = useState([]);

  useEffect(() => {
    if (!selectedDate) return;

    backendAccessPost("api/reserved/fetch-selected-day-except-wailinglist/", {
      selected_day: selectedDate
    })
      .then(res => {
        try {
          setLiveReservations(res.reserved || []);
        } catch (error) {
          console.error('Error fetching reservations:', error);
          setLiveReservations([]);
        }
      });


    backendAccessPost("api/reserved/fetch-selected-day-with-couch/", {
      selected_day: selectedDate,
      status: 'confirm'
    })
      .then(res => {
        try {
          setLiveReservationsCoach(res.reserved || []);
        } catch (error) {
          console.error('Error fetching reservations:', error);
          setLiveReservationsCoach([]);
        }
      });
  }, [selectedDate]);
  useEffect(() => {
    if (editingReservation) {
      setSelectedMember(members.find(m => m.id === editingReservation.user_id) || null);
      setSelectedCourtId(editingReservation.court_id || null);
      const hasCoach = editingReservation.couch_id !== null;
      setWantsCoach(hasCoach);
      setSelectedCouchId(hasCoach ? editingReservation.couch_id : null);
      setSelectedDate(editingReservation.selected_day);
      setSelectedSlots([{
        time: editingReservation.selected_time,
        courtId: editingReservation.court_id,
        date: {
          year: parseInt(editingReservation.selected_day.split('/')[0]),
          month: parseInt(editingReservation.selected_day.split('/')[1]),
          day: parseInt(editingReservation.selected_day.split('/')[2]),
        }
      }]);
      const paid = editingReservation.data?.paid || '';
      const payable = editingReservation.data?.payable || '';
      setPaymentAmount(String(paid));
      setPayableAmount(String(payable));
      setIsSettled(paid >= (editingReservation.data?.payable || 0));
      setSelectedCategoryId(editingReservation.data?.reservation_category_id || '');
      setSelectedSubcategoryId(editingReservation.data?.reservation_subcategory_id || '');
      setPackageName(editingReservation.data?.packagesName || '')
    } else {
      setSelectedMember(null);
      setSelectedCourtId(courts[0]?.id ?? null);
      setSelectedCouchId(null);
      setSelectedSlots([]);
      setPaymentAmount('');
      setPayableAmount('');
      setIsSettled(false);
      setSelectedCategoryId('');
      setSelectedSubcategoryId('');
    }
  }, [editingReservation, members, courts, couches]);

  const getDayKeyFromDate = (jalaliDate) => {
    const [year, month, day] = jalaliDate.split('/').map(Number);
    const d = getDayOfWeek({ year, month, day });
    const map = {
      saturday: "sat", sunday: "sun", monday: "mon", tuesday: "tue",
      wednesday: "wed", thursday: "thu", friday: "fri",
      sat: "sat", sun: "sun", mon: "mon", tue: "tue", wed: "wed", thu: "thu", fri: "fri",
    };
    return map[d] ?? d;
  };

  const getWorkingSlotsForCourtOnDay = (court, jalaliDate) => {
    const dayKey = getDayKeyFromDate(jalaliDate);
    if (!dayKey) return [];
    const slots = court?.data?.workingHours?.[dayKey];
    if (!Array.isArray(slots) || slots.length === 0) return [];
    return slots;
  };

  const getSlotStartMinutes = (slot) => {
    const start = slot.split('-')[0];
    const [h, m] = start.split(':').map(Number);
    return (h * 60) + (m || 0);
  };

  const getCoachAvailableSlotsOnDay = (coach, jalaliDate) => {
    if (!coach?.data?.workingHours) return [];
    const dayKey = getDayKeyFromDate(jalaliDate);
    if (!dayKey) return [];
    const slots = coach.data.workingHours[dayKey];
    if (!Array.isArray(slots) || slots.length === 0) return [];

    return slots;

  };

  const checkDayStatus = useCallback((dateStr) => {
    if (wantsCoach) {
      if (!selectedCouchId) return true;
      const coach = couches.find(c => c.id === selectedCouchId);
      if (!coach || !coach.data?.workingHours) return true;

      const dayKey = getDayKeyFromDate(dateStr);
      if (!dayKey || !coach.data.workingHours[dayKey] || coach.data.workingHours[dayKey].length === 0) {
        return true;
      }
      return false;
    }

    return false;
  }, [wantsCoach, selectedCouchId, couches]);


  const generateAllSlots = () => {
    if (!selectedDate || !courts.length || !selectedCourtId) return [];

    const [year, month, day] = selectedDate.split('/').map(Number);
    const dayString = formatJalaali(year, month, day);
    const reservationsOnDay = liveReservations.filter(
      r => r.selected_day === dayString
    );
    const timeSet = new Set();
    const selectedCourt = courts.find(c => String(c.id) === String(selectedCourtId));
    if (!selectedCourt) return [];

    [selectedCourt].forEach(court => {
      const slots = getWorkingSlotsForCourtOnDay(court, selectedDate);
      slots.forEach(slot => timeSet.add(slot));
    });

    const times = Array.from(timeSet).sort((a, b) => {
      return getSlotStartMinutes(a) - getSlotStartMinutes(b);
    });

    const result = [];

    for (const time of times) {
      // Courts working at this hour
      const totalCourts = 1;
      // How many times this court is reserved at this exact time
      const reservedCourts = reservationsOnDay.filter(
        r => r.selected_time === time && String(r.court_id) === String(selectedCourtId)
      ).length;

      // Coach availability (if needed)
      let isCoachAvailable = true;

      if (wantsCoach && selectedCouchId) {
        const coach = couches.find(c => c.id === selectedCouchId);

        // 1️⃣ First check working hours
        const coachSlots = new Set(getCoachAvailableSlotsOnDay(coach, selectedDate));
        isCoachAvailable = coachSlots.has(time);
        // 2️⃣ Then check if coach already reserved at this day+time
        const dayString = formatJalaali(year, month, day);

        const coachAlreadyReserved = liveReservationsCoach.some(r =>
          r.couch_id === selectedCouchId &&
          r.selected_day === dayString &&
          r.selected_time === time
        );

        if (coachAlreadyReserved) {
          isCoachAvailable = false;
        }
      }


      const allFull = reservedCourts >= totalCourts;

      result.push({
        time,
        date: { year, month, day },
        isFullyReserved: allFull,
        isCoachAvailable,
        // still expose what the UI considers "available"
        isAvailable: !allFull && isCoachAvailable
      });
    }
    return result;
  };


  const availableSlots = generateAllSlots();
  const handleDateSelect = (date) => {
    // setSelectedSlots([]);

    setSelectedDate(date);
  };

  const handleSlotClick = (slot) => {
    // 1️⃣ Coach unavailable → block completely (NO waiting list)
    if (wantsCoach && !slot.isCoachAvailable) {
      return;
    }

    const day = formatJalaali(
      slot.date.year,
      slot.date.month,
      slot.date.day
    );
    const courtIdToUse = selectedCourtId;

    if (!courtIdToUse) return;

    const selectedCourt = courts.find(c => String(c.id) === String(courtIdToUse));
    const slots = getWorkingSlotsForCourtOnDay(selectedCourt, selectedDate);
    if (!slots.includes(slot.time)) return;

    const enhancedSlot = {
      ...slot,
      courtId: courtIdToUse,
    };

    const isCourtReserved = reservations.some(r =>
      r.selected_day === day &&
      r.selected_time === slot.time &&
      String(r.court_id) === String(courtIdToUse)
    );

    // 🔴 specific court is full → waiting list
    if (isCourtReserved) {
      if (isEditMode) {
        setSelectedSlots([{ ...enhancedSlot, forceStatus: "waitingList" }]);
      } else {
        setSelectedSlots(prev =>
          toggleSlot(prev, {
            ...enhancedSlot,
            forceStatus: "waitingList"
          })
        );
      }
      return;
    }

    // 🟢 specific court is free → confirm / package
    if (isEditMode) {
      setSelectedSlots([{ ...enhancedSlot, forceStatus: isPackage ? "offerPackage" : "confirm" }]);
    } else {
      setSelectedSlots(prev =>
        toggleSlot(prev, {
          ...enhancedSlot,
          forceStatus: isPackage ? "offerPackage" : "confirm"
        })
      );
    }
  };

  const toggleSlot = (prev, slot) => {
    const exists = prev.some(
      s => s.time === slot.time && s.courtId === slot.courtId &&
        s.date.year === slot.date.year && s.date.month === slot.date.month &&
        s.date.day === slot.date.day
    );
    return exists
      ? prev.filter(s => !(s.time === slot.time && s.courtId === slot.courtId &&
        s.date.year === slot.date.year && s.date.month === slot.date.month &&
        s.date.day === slot.date.day))
      : [...prev, slot];
  };

  const getSelectedMainPrice = () => {
    if (!selectedCategoryId) return '0';

    const matchedCategory = categorycontent.find(
      item => String(item.category_id) === String(selectedCategoryId)
    );
    if (!matchedCategory) return '0';

    if (selectedSubcategoryId) {
      const matchedSub = matchedCategory.subcategorycontent?.find(
        sub => String(sub.subcategory_id) === String(selectedSubcategoryId)
      );

      const subPrice = matchedSub?.mainprice;
      if (subPrice !== undefined && subPrice !== null && String(subPrice).trim() !== '') {
        return String(subPrice);
      }
    }

    const categoryPrice = matchedCategory.categorycontent?.mainprice;
    if (categoryPrice === undefined || categoryPrice === null || String(categoryPrice).trim() === '') {
      return '0';
    }

    return String(categoryPrice);
  };

  const parseCurrencyValue = (value) => {
    if (value === null || value === undefined) return 0;
    const normalized = String(value).replace(/[^\d]/g, '');
    if (!normalized) return 0;
    return parseInt(normalized, 10) || 0;
  };

  const getUnitPayablePrice = () => {
    return parseCurrencyValue(payableAmount || getSelectedMainPrice());
  };

  const getTotalPayablePrice = () => {
    return getUnitPayablePrice() * selectedSlots.length;
  };

  const sortSlotsByDateTime = (slots) => {
    return [...slots].sort((a, b) => {
      const aDate = `${a.date.year}/${String(a.date.month).padStart(2, '0')}/${String(a.date.day).padStart(2, '0')}`;
      const bDate = `${b.date.year}/${String(b.date.month).padStart(2, '0')}/${String(b.date.day).padStart(2, '0')}`;
      if (aDate !== bDate) return aDate.localeCompare(bDate);
      return getSlotStartMinutes(a.time) - getSlotStartMinutes(b.time);
    });
  };

  const allocatePaymentAcrossSlots = (slots, totalPaid, slotPayable) => {
    let remainingPaid = Math.max(0, totalPaid);
    return slots.map(() => {
      const paidForThisSlot = Math.min(remainingPaid, Math.max(0, slotPayable));
      remainingPaid -= paidForThisSlot;
      return paidForThisSlot;
    });
  };

  const handleSettlementChange = (e) => {
    const checked = e.target.checked;
    setIsSettled(checked);
    if (checked) {
      setPaymentAmount(String(getTotalPayablePrice()));
    } else {
      setPaymentAmount('');
    }
  };

  useEffect(() => {
    if (isPackage) return;
    setPayableAmount(getSelectedMainPrice());
  }, [selectedCategoryId, selectedSubcategoryId, isPackage]);

  useEffect(() => {
    if (!isSettled) return;
    setPaymentAmount(String(getTotalPayablePrice()));
  }, [isSettled, selectedSlots, payableAmount, selectedCategoryId, selectedSubcategoryId]);

  const overlappingReservations = selectedSlots.filter(slot =>
    liveReservations.some(r =>
      r.selected_day === formatJalaali(slot.date.year, slot.date.month, slot.date.day) &&
      r.selected_time === slot.time &&
      r.court_id === slot.courtId
    )
  );
  const isWaitingListSelection = selectedSlots.some(slot => slot.forceStatus === "waitingList");

  const handleSubmit = () => {
    if (!isPackage) {
      if (!selectedMember || selectedSlots.length === 0) {
        alert('لطفاً کاربر، حداقل یک بازه زمانی، و مبلغ را وارد کنید.');
        return;
      }
    }
    else {
      if (selectedSlots.length === 0) {
        alert('لطفاً کاربر، حداقل یک بازه زمانی  را وارد کنید.');
        return;
      }
    }
    const isSlotReserved = (slot) => {
      return reservations.some(r =>
        r.selected_day === formatJalaali(slot.date.year, slot.date.month, slot.date.day) &&
        r.selected_time === slot.time &&
        r.court_id === slot.courtId
      );
    };
    const hasOverlappingSlots = selectedSlots.some(isSlotReserved);

    if (hasOverlappingSlots & !editingReservation) {
      const wantsWaitingList = window.confirm(
        "یک یا چند سانس انتخابی شما قبلا رزرو شده است یا در پکیج شما قرار دارد. آیا میخواهید به لیست انتظار اضافه شوید؟"
      );
      if (!wantsWaitingList) {
        alert("ثبت رزرو لغو شد.");
        return;
      }
    }

    const payablePrice = getUnitPayablePrice();
    const totalPaid = parseCurrencyValue(paymentAmount);
    const sortedSlots = sortSlotsByDateTime(selectedSlots);
    const allocatedPaidValues = allocatePaymentAcrossSlots(sortedSlots, totalPaid, payablePrice);

    const newReservations = sortedSlots.map((slot, index) => {
      const baseDay = formatJalaali(slot.date.year, slot.date.month, slot.date.day);
      return {
        selected_day: baseDay,
        selected_time: slot.time,
        court_id: slot.courtId,
        couch_id: wantsCoach ? selectedCouchId : null,
        user_id: !isPackage ? selectedMember.id : null,
        status: slot.forceStatus,
        reservedCouch: true,
        data: {
          paid: allocatedPaidValues[index],
          payable: payablePrice,
          packagesName: isPackage ? packagesName : null,
          reservation_category_id: selectedCategoryId,
          reservation_subcategory_id: selectedSubcategoryId || null,
        }
      };
    });

    handleSaveReservation(newReservations);
  };

  const handleSaveReservation = (newReservations) => {
    if (editingReservation) {

      backendAccessPost(`/api/reserved/update/${editingReservation.id}/`, { reservations: newReservations[0], selectedDate: selectedDate }).then(res => {
        try {
          setReservations(res.reserved)
        }
        catch (error) {
          console.error('Error fetching data:', error);
          setReservations([]);
        } finally {
          onClose()
        }
      })
    } else {
      backendAccessPost("/api/reserved/add-bulk/", { reservations: newReservations, selectedDate: selectedDate }).then(res => {
        try {
          setReservations(res.reserved)
        }
        catch (error) {
          console.error('Error fetching data:', error);
          setReservations([]);
        } finally {
          onClose()
        }
      })
    }
  }

  const courtOptions = courts.map(c => ({ value: c.id, label: c.name }));
  const coachOptions = couches.map(c => ({ value: c.id, label: c.name }));

  return (
    <>
      <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-[#4D4D4D]">
        <div className="relative w-[672px] h-fit">
          <div className="border-0 rounded-[20px] shadow-lg relative flex flex-col w-[672px] bg-[#F8F8F8] outline-none focus:outline-none p-[15px]">
            <div className="flex flex-col w-full justify-center items-start p-[30px] text-center space-y-[15px]">
              <div className='flex w-full h-[100px] space-x-[10px] space-x-reverse'>
                <Box width={700} height={100}>
                  <div className='grid grid-cols-3 gap-[10px] text-start p-[10px]'>
                    {isPackage &&
                      <div className="flex items-center space-x-2 space-x-reverse w-[100px]">
                        <input
                          type="checkbox"
                          id="wants-coach"
                          checked={wantsCoach}
                          onChange={(e) => {
                            setWantsCoach(e.target.checked);
                            setSelectedCouchId(null);
                            setSelectedSlots([]);
                          }}
                          className="mr-1"
                        />
                        <label htmlFor="wants-coach" className="text-[10px]">رزرو با مربی</label>
                      </div>
                    }
                    {wantsCoach && (
                      <DropDown
                        label={'انتخاب مربی:'}
                        field={selectedCouchId}
                        setField={setSelectedCouchId}
                        list={coachOptions}
                        width={150}
                      />
                    )}
                    {(isPackage || !wantsCoach) &&
                      (<DropDown
                        label={'انتخاب زمین:'}
                        field={selectedCourtId}
                        setField={(id) => {
                          setSelectedCourtId(id);
                          setSelectedSlots([]);
                        }}
                        list={courtOptions}
                        width={150}
                      />)
                    }
                  </div>
                </Box>
              </div>

              <div className='flex w-full h-[280px] space-x-[10px] space-x-reverse'>
                <Box width={360} height={280}>
                  <ReusableCalendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    checkDayStatus={checkDayStatus} // Passed the new function
                    styles={styles}
                  />
                </Box>
                <Box width={232} height={280}>
                  <div className='flex flex-col items-center space-y-[15px] p-[15px] text-start h-[280px] overflow-y-auto'>
                    <span className='text-[9px]'>انتخاب سانس</span>
                    <div className="grid grid-cols-3 gap-x-[6px] gap-y-[4px]  text-[9px]  justify-items-center justify-center  items-center  w-full  ">
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => {
                          const isSelected = selectedSlots.some(
                            s =>
                              s.time === slot.time &&
                              s.date.year === slot.date.year &&
                              s.date.month === slot.date.month &&
                              s.date.day === slot.date.day
                          );


                          return (
                            <TimeSlot
                              key={slot.time}
                              time={slot.time}
                              isSelected={isSelected}
                              isReserved={!slot.isAvailable}
                              onClick={() => {
                                handleSlotClick(slot);
                              }}
                              styles={styles}
                            />
                          );
                        })
                      ) : (
                        <div className="text-[10px] text-gray-500">
                          {selectedDate ?
                            '-' : 'لطفاً یک روز را انتخاب کنید'}
                        </div>
                      )}
                    </div>
                  </div>
                </Box>
              </div>

              {/* ... Rest of the component (inputs, buttons) remains the same ... */}
              <div className='flex w-full h-[170px] space-x-[10px] space-x-reverse'>
                <Box width={700} height={170}>
                  <div className='grid grid-cols-2 gap-[10px] text-start px-[20px]'>


                    {!isWaitingListSelection && (
                      <DropDown
                        label={'دسته‌بندی:'}
                        field={selectedCategoryId}
                        setField={setSelectedCategoryId}
                        list={category.map(cat => ({ value: cat.id, label: cat.name }))}
                        width={190}
                      />
                    )}
                    {!isWaitingListSelection && (
                      <DropDown
                        label={'زیردسته:'}
                        field={selectedSubcategoryId}
                        setField={setSelectedSubcategoryId}
                        list={subcategory
                          .filter(sub => sub.category_id == selectedCategoryId)
                          .map(sub => ({ value: sub.id, label: sub.name }))}
                        width={190}
                      />
                    )}
                    {isPackage &&


                      <Input
                        label="  نام پکیج  :"
                        type="text"
                        value={packagesName}
                        onChange={(e) => setPackageName(e.target.value)}
                        required
                        width={190}
                      />

                    }

                    {!isPackage &&

                      <DropDown
                        label={'انتخاب کاربر:'}
                        field={selectedMember?.id || null}
                        setField={(id) => {
                          const member = members.find(m => m.id === id);
                          setSelectedMember(member);
                        }}
                        list={members.map(cat => ({
                          value: cat.id,
                          label: `${cat.fullname || cat.name} — ${cat.phone || cat.mobile}`
                        }))}
                        width={190}
                      />
                    }

                    {!isPackage &&
                      (isEditMode || overlappingReservations.length < 1) && (
                        <div >
                          <Input
                            label="مبلغ پرداختی به تومان :"
                            type="currency"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            required
                            width={190}
                          />

                          <input
                            type="checkbox"
                            id="settlement-checkbox"
                            checked={isSettled}
                            onChange={handleSettlementChange}
                            className=" mt-2 ml-2"
                          />
                          <label htmlFor="settlement-checkbox" className="text-[10px]">
                            تسویه
                          </label>
                        </div>
                      )
                    }
                    {selectedSlots.length > 0 && (
                      <div className='w-[550px] text-[10px] px-4 text-end'>
                        مبلغ قابل دریافت:
                        <span className="">
                          {formatNumber(
                            getTotalPayablePrice()
                          )}
                        </span> تومان
                      </div>
                    )}
                  </div>

                </Box>
              </div>
              {overlappingReservations.length > 0 && !editingReservation && (
                <div className="text-red-600 text-[10px] bg-yellow-100 p-2 rounded text-right w-full">
                  ⚠️ {overlappingReservations.length} از سانس‌های انتخابی قبلاً رزرو شده اند یا در پکیج های شما قراردارد. کاربر به لیست انتظار اضافه خواهد شد.
                </div>
              )}
              {selectedSlots.length > 0 && (
                <div className="mt-2 w-full pt-2">
                  <div className="text-[10px] font-medium mb-1">
                    {isEditMode ? 'سانس رزرو انتخاب‌شده:' : 'سانس‌های انتخاب‌شده:'}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedSlots.map((slot, idx) => {
                      const courtName = courts.find(c => c.id === slot.courtId)?.name || 'نامشخص';
                      return (
                        <div
                          key={idx}
                          className="flex items-center border-[#808080]  border-[0.5px] text-[#808080] text-[9px] px-1 py-1 rounded"
                        >
                          <span>{formatPersianFullDate(slot.date.year, slot.date.month, slot.date.day, '#808080')}</span>
                          <span className="mx-1">|</span>
                          <span>{formatPersianTimeSlot(slot.time)}</span>
                          <span className="mx-1">|</span>
                          <span>{courtName}</span>
                          {!isEditMode && (
                            <button
                              onClick={() => handleSlotClick(slot)}
                              className=" text-[#808080] hover:text-red-700 px-[5px]"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className='w-full flex justify-end space-x-[15px] space-x-reverse'>
                <button
                  onClick={handleSubmit}
                  disabled={selectedSlots.length === 0}
                  className={`w-[100px] py-1 rounded text-[10px] h-[25px] text-white ${(selectedSlots.length === 0) ? 'bg-gray-400' : `bg-[${styles.selectedDay.backgroundColor}] || bg-[#000]`}`}
                >
                  {isEditMode ? 'ویرایش رزرو' : 'ثبت رزرو'}
                </button>
                <button
                  onClick={onClose}
                  className="w-[100px] py-1 rounded text-[10px] h-[25px] text-white bg-black"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div >
      </div >
      <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};

export default AdminReservationModal;
