// src/components/AdminReservationModal.js
import React, { useState, useEffect, useRef } from 'react';
import ReusableCalendar from '../../../components/ReusableCalendar';
import TimeSlot from '../../../components/TimeSlot';
import { formatNumber, formatPersianFullDate, formatPersianTime } from '../../../utils/numberUtils';
import Box from '../../components/Box';
import DropDown from '../../components/DropDown';
import Input from '../../components/Input';
import jalaali from 'jalaali-js';



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
  isEditMode = false,
  editingReservation = null,
  formData,
  setFormData,
  styles

}) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [selectedCouchId, setSelectedCouchId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [isSettled, setIsSettled] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showCouchSelection, setShowCouchSelection] = useState(false);
  const [tempSelectedCouchId, setTempSelectedCouchId] = useState(null);

  const getTodayJalali = () => {
    const today = new Date();
    const { jy, jm, jd } = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return { year: jy, month: jm, day: jd };
  };
  console.log('courts',courts)
  console.log('couches',couches)
  console.log('reservations',reservations)

  // Initialize form data when modal opens or when editing reservation changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editingReservation) {
        // Set form data from existing reservation
        setSelectedMember(members.find(m => m.id === editingReservation.user_id));
        if (editingReservation.court_id) {
          setSelectedCourtId(editingReservation.court_id);
        } else if (editingReservation.couch_id) {
          setSelectedCouchId(editingReservation.couch_id);
        }
        
        // Parse date from reservation
        const [year, month, day] = editingReservation.selected_day.split('/').map(Number);
        setSelectedDate({ year, month, day });
        
        setSelectedSlots([{
          date: { year, month, day },
          time: editingReservation.selected_time,
          courtId: editingReservation.court_id,
          couchId: editingReservation.couch_id
        }]);
        
        setPaymentAmount(editingReservation.data.paid || '');
        
        // Set category and subcategory if available
        setSelectedCategoryId(editingReservation.data.reservation_category_id || '');
        setSelectedSubcategoryId(editingReservation.data.reservation_subcategory_id || '');
        
        setIsSettled(editingReservation.data.paid >= editingReservation.data.payable);
      } else {
        // Reset for add mode
        setSelectedMember(null);
        setSelectedCourtId(null);
        setSelectedCouchId(null);
        setSelectedDate(getTodayJalali());
        setSelectedSlots([]);
        setPaymentAmount('');
        setSelectedCategoryId('');
        setSelectedSubcategoryId('');
        setIsSettled(false);
        setShowCouchSelection(false);
        setTempSelectedCouchId(null);
      }
    }
  }, [isOpen, isEditMode, editingReservation, members]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedMember(null);
      setSelectedCourtId(null);
      setSelectedCouchId(null);
      setSelectedDate(getTodayJalali()); 
      setSelectedSlots([]);
      setPaymentAmount('');
      setSelectedCategoryId('');
      setSelectedSubcategoryId('');
      setIsSettled(false);
      setShowCouchSelection(false);
      setTempSelectedCouchId(null);
    }
  }, [isOpen]);

  const reservedDates = { courts: {}, couches: {} };
  reservations.forEach(res => {
    const { court_id, couch_id, selected_day, selected_time } = res;
    if (court_id) {
      if (!reservedDates.courts[court_id]) reservedDates.courts[court_id] = {};
      if (!reservedDates.courts[court_id][selected_day]) {
        reservedDates.courts[court_id][selected_day] = [];
      }
      reservedDates.courts[court_id][selected_day].push(selected_time);
    }
    if (couch_id) {
      if (!reservedDates.couches[couch_id]) reservedDates.couches[couch_id] = {};
      if (!reservedDates.couches[couch_id][selected_day]) {
        reservedDates.couches[couch_id][selected_day] = [];
      }
      reservedDates.couches[couch_id][selected_day].push(selected_time);
    }
  });


  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCouchSelection(true);
  };

  const handleConfirmTime = (time, isReserved, availableCourts, availableCouches, autoCourtId, autoCouchId) => {
    const courtId = selectedCourtId || autoCourtId;
    const couchId = selectedCouchId || autoCouchId;
    if (!courtId && !couchId || !selectedDate) return;

    const newSlot = { 
      date: selectedDate, 
      time, 
      courtId: courtId || null, 
      couchId: couchId || null 
    };
    if (selectedSlots.some(s => s.time === time)) {
      setSelectedSlots(prev => prev.filter(s => s.time !== time));
    } else {
      setSelectedSlots(prev => [...prev, newSlot]);
    }
  };

  const handleSubmit = () => {
    if (!selectedMember || selectedSlots.length === 0 || !paymentAmount) {
      alert('لطفاً کاربر، حداقل یک بازه زمانی، و مبلغ را وارد کنید.');
      return;
    }

    const payablePrice = getSelectedMainPrice();
    const newReservations = selectedSlots.map(slot => ({
      user_id: selectedMember.id,
      court_id: slot.courtId,
      couch_id: slot.couchId,
      selected_day: `${slot.date.year}/${slot.date.month}/${slot.date.day}`,
      selected_time: slot.time,
      data: {
        paid: paymentAmount,
        payable: payablePrice,
        reservation_category_id: selectedCategoryId,
        reservation_subcategory_id: selectedSubcategoryId || null
      }
    }));

    onSave(newReservations);
    onClose();
  };

  const getSelectedMainPrice = () => {
    let price = '0';
  
    if (!selectedCategoryId) {
      return price;
    }
  
    const matchedCategory = categorycontent.find(
      item => String(item.category_id) === String(selectedCategoryId)
    );
  
    if (!matchedCategory) {
      return price;
    }
  
    if (selectedSubcategoryId) {
      const matchedSub = matchedCategory.subcategorycontent?.find(
        sub => String(sub.subcategory_id) === String(selectedSubcategoryId)
      );
      if (matchedSub?.mainprice !== undefined) {
        price = matchedSub.mainprice;
      }
    }
  
    if (price === '0' || !selectedSubcategoryId) {
      price = matchedCategory.categorycontent?.mainprice || '0';
    }
  
    return price;
  };

  const handleSettlementChange = (e) => {
    const checked = e.target.checked;
    setIsSettled(checked);
    
    if (checked) {
      const payablePrice = getSelectedMainPrice();
      setPaymentAmount(payablePrice);
    } else {
      setPaymentAmount('');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-[#4D4D4D]">
        <div className="relative w-[672px] h-[565px]">
          <div className="border-0 rounded-[20px] shadow-lg relative flex flex-col w-[672px] bg-[#F8F8F8] outline-none focus:outline-none p-[15px]">
            <div className="flex flex-col w-full justify-center items-start p-[30px] text-center space-y-[15px]">
              <div className='flex w-full h-[310px] space-x-[10px] space-x-reverse'>
                <Box width={360} height={310}>
                  <ReusableCalendar
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    onDateSelect={handleDateSelect}
                    reservedDates={reservedDates}
                    typeCategory="couch"
                    selectedCourtId={selectedCourtId}
                    setSelectedCourtId={setSelectedCourtId}
                    selectedCouchId={selectedCouchId}
                    setSelectedCouchId={setSelectedCouchId}
                    subjectCategory="همه مربیان"
                    styles={styles}
                    selectedReserved={null}
                    categories={couches}
                    setShowCalendar={() => {}}
                    setShowTimeSlots={() => {}}
                    setShowConfirmDateTime={() => {}}
                    setSelectedCourtName={() => {}}
                    setSelectedCouchName={() => {}}
                    setSelectedReserved={() => {}}
                    setIs_reserved_before={() => {}}
                    is_reserved_before={false}
                    mode="single"
                    selectedSlots={[]}
                    onAddSlot={() => {}}
                    onRemoveSlot={() => {}}
                    dropdownOpen={dropdownOpen}
                    setDropdownOpen={setDropdownOpen}
                    dropdownRef={dropdownRef}
                    hoveredDay={null}
                    setHoveredDay={() => {}}
                  />
                </Box>
                <Box width={232} height={310}>
                  <div className='flex flex-col space-y-[15px] p-[15px] text-start'>
                    {showCouchSelection ? (
                      <div className='flex flex-col space-y-[15px]'>
                        <span className='text-[9px]'>انتخاب مربی</span>
                        <div className='flex flex-col space-y-[5px]'>
                          {couches.map(couch => (
                            <div
                              key={couch.id}
                              className="flex w-full justify-between items-center body-farsi rounded-[4px] h-[25px] p-[10px] cursor-pointer hover:bg-[#ffe6d3] border border-[#fe7a1530]"
                              onClick={() => {
                                setTempSelectedCouchId(couch.id);
                                setSelectedCouchId(couch.id);
                                setShowCouchSelection(false);
                              }}
                            >
                              <span>{couch.name}</span>
                              <span>{formatNumber(couch.data.price)} تومان</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span className='text-[9px]'>  انتخاب سانس  </span>
                        <TimeSlot
                          selectedDate={selectedDate}
                          onConfirmTime={handleConfirmTime}
                          reservedDates={reservedDates}
                          selectedCourtId={selectedCourtId}
                          selectedCouchId={selectedCouchId}
                          courts={courts}
                          couches={couches}
                          typeCategory="couch"
                          mode="single"
                          styles={styles}
                          selectedSlots={selectedSlots}
                          setShowCalendar={() => { }}
                          setShowTimeSlots={() => { }}
                          isAvailableMode={false}
                          setSelectedReserved={() => { }}
                          setIs_reserved_before={() => { }}
                          is_reserved_before={false}
                        />
                      </div>
                    )}
                  </div>
                </Box>
              </div>
              <div className='flex w-full h-[170px] space-x-[10px] space-x-reverse'>
                <Box width={700} height={150}>
                  <div className='grid grid-cols-2 gap-[10px] text-start'>
                    <DropDown
                      label={'دسته‌بندی:'}
                      field={selectedCategoryId}
                      setField={setSelectedCategoryId}
                      list={category.map(cat => ({
                        value: cat.id,
                        label: cat.name
                      }))}
                      width={190}
                    />
                    <DropDown
                      label={'زیردسته:'}
                      field={selectedSubcategoryId}
                      setField={setSelectedSubcategoryId}
                      list={subcategory
                        .filter(sub => sub.category_id == selectedCategoryId)
                        .map(sub => ({
                          value: sub.id,
                          label: sub.name
                        }))}
                      width={190}
                    />
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
                    <Input
                      label="مبلغ پرداختی به تومان :"
                      type="currency"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      required
                      width={190}
                    />
                    <div className="flex w-full  justify-end items-center space-x-[4px] space-x-reverse">
                    </div>
                    <div className="flex  w-full  justify-start items-center space-x-[4px] space-x-reverse">
                      <input
                        type="checkbox"
                        id="settlement-checkbox"
                        checked={isSettled}
                        onChange={handleSettlementChange}
                        className="mr-2"
                      />
                      <label htmlFor="settlement-checkbox" className="text-[10px]">
                        تسویه
                      </label>
                    </div>
                    {selectedSlots.length > 0 && (
                      <div className='w-[550px] text-[10px] text-end'>
                        مبلغ قابل دریافت:  
                        <span className="">
                          {formatNumber(
                            selectedSlots.length * 
                            (parseInt(getSelectedMainPrice().replace(/,/g, '')) || 0)
                          )}
                        </span> تومان
                      </div>
                    )}
                  </div>
                </Box>
              </div>
              <div className='w-full flex justify-end space-x-[15px] space-x-reverse'>
                <button
                  onClick={handleSubmit}
                  disabled={!paymentAmount || !selectedMember || selectedSlots.length === 0}
                  className={`w-[100px] py-1 rounded text-[10px] h-[25px] text-white ${(!paymentAmount || !selectedMember || selectedSlots.length === 0) ? 'bg-gray-400' : 'bg-[#B9ED00]'}`}
                >
                  {isEditMode ? 'به‌روزرسانی' : 'ثبت رزرو'}
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
        </div>
      </div>
      <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};

export default AdminReservationModal;