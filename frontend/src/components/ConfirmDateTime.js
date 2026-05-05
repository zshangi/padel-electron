// ConfirmDateTime.js

import React, { useState } from 'react';
import { backendAccessPost } from '../utils/Authentication';
import { formatPersianFullDate, formatPersianTime, formatNumber } from '../utils/numberUtils';

const ConfirmDateTime = ({
  selectedSlots,
  mode,
  setShowConfirmDateTime,
  setShowCalendar,
  setShowTimeSlots,
  setSelectedSlots,
  loadReservedData,
  setSelectedDate,
  color,
  typeCategory,
  is_reserved_before // Receive is_reserved_before as a prop
}) => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  console.log('selectedSlots',selectedSlots)
  // Calculate total price for the entire package
  const calculateTotalPrice = () => {
    if (selectedSlots.length === 0) return 0;

    let totalPrice = 0;

    selectedSlots.forEach(slot => {
      // Skip price calculation for reserved slots
      if (is_reserved_before) return;
      
      let singleSessionPrice = 0;

      if (typeCategory === 'court' && slot.selectedCourtId) {
        const court = slot.availableCourts.find(c => c.id === slot.selectedCourtId);
        if (court) {
          singleSessionPrice = parseInt(court.price);
        }
      } else if (typeCategory === 'couch' && slot.selectedCouchId) {
        const couch = slot.availableCouches.find(c => c.id === slot.selectedCouchId);
        if (couch && couch.availableCourts && couch.availableCourts.length > 0) {
          // For couch, we need to find the specific court for this slot
          const courtId = slot.selectedCouchCourtId || couch.availableCourts[0].id;
          const court = couch.availableCourts.find(c => c.id === courtId);
          if (court) {
            singleSessionPrice = parseInt(couch.price) + parseInt(couch.courtPrice);
          }
        }
      }

      totalPrice += singleSessionPrice;
    });

    return totalPrice;
  };

  const totalPrice = calculateTotalPrice();

  // Update the handleSubmit function to handle waiting list for fully reserved slots
  const handleSubmit = async () => {
    if (selectedSlots.length === 0) {
      alert("لطفاً حداقل یک زمان را انتخاب کنید");
      return;
    }

    // Check if we have the necessary IDs for all slots
    for (const slot of selectedSlots) {
      if (typeCategory === 'court' && !slot.selectedCourtId) {
        alert("لطفاً برای تمام زمان‌ها یک زمین را انتخاب کنید");
        return;
      }
      
      if (typeCategory === 'couch' && !slot.selectedCouchId) {
        alert("لطفاً برای تمام زمان‌ها یک مربی را انتخاب کنید");
        return;
      }
    }

    setSubmitting(true);

    try {
      let res;
      if (mode === "single") {
        // Single mode logic
        const slot = selectedSlots[0];
        let dataField = {};
        let courtIdForApi = null;
        let couchIdForApi = null;

        if (typeCategory === 'court') {
          const selectedCourtObject = slot.availableCourts.find(c => c.id === slot.selectedCourtId);
          if (selectedCourtObject) {
            dataField = {
              courtname: selectedCourtObject.name,
              totalprice: parseInt(selectedCourtObject.price)
            };
            courtIdForApi = selectedCourtObject.id;
          }
        } else if (typeCategory === 'couch') {
          const selectedCouchObject = slot.availableCouches.find(c => c.id === slot.selectedCouchId);
          const courtId = slot.selectedCouchCourtId || selectedCouchObject.availableCourts[0].id;
          const selectedCouchCourtObject = selectedCouchObject.availableCourts.find(c => c.id === courtId);

          if (selectedCouchObject && selectedCouchCourtObject) {
            dataField = {
              courtname: selectedCouchCourtObject.name,
              couchname: selectedCouchObject.name,
              totalprice: parseInt(selectedCouchObject.price) + parseInt(selectedCouchCourtObject.price)
            };
            courtIdForApi = selectedCouchCourtObject.id;
            couchIdForApi = selectedCouchObject.id;
          }
        }

        const payload = {
          selected_day: `${slot.date.year}/${slot.date.month}/${slot.date.day}`,
          selected_time: slot.time,
          court_id: courtIdForApi,
          couch_id: couchIdForApi,
          totalPrice:totalPrice,
          data: dataField,
          is_waiting_list: is_reserved_before // Use the prop directly
        };
        
        res = await backendAccessPost("/api/reserved/add/", payload);
        
        // Show appropriate message based on whether it's a waiting list
        if (res.error_message) {
          alert(res.error_message);
        } else {
          // if (is_reserved_before) {
          //   alert("شما در لیست انتظار قرار گرفتید. در صورت آزاد شدن این زمان، با شما تماس گرفته خواهد شد.");
          // } else {
          //   alert("رزرو شما با موفقیت ثبت شد!");
          // }
          
          setSubmitSuccess(true);
          setTimeout(async () => {
            setShowConfirmDateTime(false);
            setShowCalendar(true);
            setShowTimeSlots(false);
            setSelectedSlots([]);
            await loadReservedData();
            setSelectedDate()
          }, 7000);
        }
      } else {
        // Package mode logic - now using individual court/couch for each slot
        const payload = {
          reservations: selectedSlots.map(slot => {
            let dataField = {};
            let courtIdForApi = null;
            let couchIdForApi = null;

            if (typeCategory === 'court') {
              const selectedCourtObject = slot.availableCourts.find(c => c.id === slot.selectedCourtId);
              if (selectedCourtObject) {
                dataField = {
                  courtname: selectedCourtObject.name,
                  totalprice: parseInt(selectedCourtObject.price)
                };
                courtIdForApi = selectedCourtObject.id;
              }
            } else if (typeCategory === 'couch') {
              const selectedCouchObject = slot.availableCouches.find(c => c.id === slot.selectedCouchId);
              const courtId = slot.selectedCouchCourtId || selectedCouchObject.availableCourts[0].id;
              const selectedCouchCourtObject = selectedCouchObject.availableCourts.find(c => c.id === courtId);

              if (selectedCouchObject && selectedCouchCourtObject) {
                dataField = {
                  courtname: selectedCouchCourtObject.name,
                  couchname: selectedCouchObject.name,
                  totalprice: parseInt(selectedCouchObject.price) + parseInt(selectedCouchCourtObject.price)
                };
                courtIdForApi = selectedCouchCourtObject.id;
                couchIdForApi = selectedCouchObject.id;
              }
            }

            return {
              selected_day: `${slot.date.year}/${slot.date.month}/${slot.date.day}`,
              selected_time: slot.time,
              court_id: courtIdForApi,
              couch_id: couchIdForApi,
              totalPrice:totalPrice,
              user_id: 1,
              data: dataField,
              is_waiting_list: slot.is_reserved_before // Use the value from selectedSlots for package mode
            };
          })
        };
        
        res = await backendAccessPost("/api/reserved/add-bulk/", payload);
        
        if (res.error_message) {
          alert(res.error_message);
        } else {
          // Check if any of the reservations are in the waiting list
          const hasWaitingList = selectedSlots.some(slot => slot.is_reserved_before);
          
          if (hasWaitingList) {
            alert("برخی از زمان‌های انتخاب شده در لیست انتظار قرار گرفتند. در صورت آزاد شدن این زمان‌ها، با شما تماس گرفته خواهد شد.");
          } else {
            alert("پکیج شما با موفقیت ایجاد شد!");
          }
          
          setSubmitSuccess(true);
          setTimeout(async () => {
            setShowConfirmDateTime(false);
            setShowCalendar(true);
            setShowTimeSlots(false);
            setSelectedSlots([]);
            await loadReservedData();
            setSelectedDate()
          }, 7000);
        }
      }

    } catch (err) {
      alert("خطا در ارسال درخواست");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className='flex flex-col space-y-[4px] px-[20px] w-full h-[134px] bg-[#1E1E1E] rounded-[12px] text-[10px] text-white justify-center items-center text-center'>
        {mode === "single"
          ? is_reserved_before 
            ? "شما در لیست انتظار قرار گرفتید." 
            : 
            <>
            <span>این رزرو به مدت ‍۱۲ ساعت برای شما در نظر گرفته شد جهت ثبت نهایی مبلغ {formatNumber(totalPrice)} تومان را به شماره کارت ذیل واریز و در بخش رزروهای من شماره پیگیری و تصویر آن  را آپلود نمایید </span>
          <span>6069-8618-4912-2022</span>
          <span>به نام زهرا محمدی</span>
          </>
          : "پکیج شما با موفقیت ایجاد شد!"}
      </div>
    );
  }

  // Get the selected court or couch name for display
  const getSelectedNames = () => {
    if (selectedSlots.length === 0) return [];
    
    return selectedSlots.map(slot => {
      if (typeCategory === 'court' && slot.selectedCourtId) {
        const court = slot.availableCourts.find(c => c.id === slot.selectedCourtId);
        return court ? court.name : "";
      } else if (typeCategory === 'couch' && slot.selectedCouchId) {
        const couch = slot.availableCouches.find(c => c.id === slot.selectedCouchId);
        return couch ? couch.name : "";
      }
      return "";
    });
  };

  const selectedNames = getSelectedNames();

  return (
    <div className={`flex flex-col space-y-[8px] w-full ${mode === 'single' ? 'h-fit text-center justify-center items-center' : 'h-fit text-start justify-start items-start '} bg-black rounded-[12px] text-[10px] text-white  p-[20px] `}>
      {selectedSlots.length > 0 ? (
        mode !== 'match' ? (
          <>
            <span className='body-farsi-bold' style={{ color: color }}>
              {mode === "single" 
                ? (is_reserved_before ? "لیست انتظار" : "تایید نهایی") 
                : "تایید نهایی پکیج"}
            </span>

            {/* Display selected courts or couches */}
            <div className="flex flex-col justify-center items-center">
              {selectedNames.map((name, index) => (
                <span key={index}>
                  {typeCategory === 'court' ? 'زمین' : 'مربی'} {index + 1}: {name}
                </span>
              ))}
            </div>

            {selectedSlots.map((slot, i) => (
              <div className='flex flex-col' key={i}>
                <span>
                  {formatPersianFullDate(slot.date.year, slot.date.month, slot.date.day, color)} | {formatPersianTime(slot.time)}
                </span>
                {mode === "single" && is_reserved_before && (
                  <span className="text-yellow-400 text-xs mt-1">
                    این زمان قبلاً رزرو شده است. شما در لیست انتظار قرار خواهید گرفت.
                  </span>
                )}
              </div>
            ))}

            <div className='flex justify-center w-full'>
              <div className='flex flex-col items-center space-y-[10px]'>
                {!is_reserved_before && (
                  <span>مجموع قابل پرداخت: {formatNumber(totalPrice)} تومان</span>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`w-[116px] h-[19px] text-[#000] rounded-[2px] mt-1`}
                  style={{ backgroundColor: color }}
                >
                  {submitting 
                    ? "در حال ارسال..." 
                    : (is_reserved_before 
                        ? "افزودن به لیست انتظار" 
                        : "خرید")
                  }
                </button>
              </div>
            </div>
          </>
        ) : (
          // Match mode logic (unchanged)
          <>
            <span className='text-[#ff000a] body-farsi-bold'>تورنومنت پاییزه <span className='body-farsi'>(۲۰ نفر)</span></span>
            {/* ... other match details ... */}
          </>
        )
      ) : (
        <div className='flex w-full h-full justify-center items-center' style={{ color: color }}>
          <span>هنوز تاریخ و ساعتی مشخص نشده.</span>
        </div>
      )}
    </div>
  );
};

export default ConfirmDateTime;