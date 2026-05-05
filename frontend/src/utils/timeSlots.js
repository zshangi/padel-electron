import { formatNumber } from "./numberUtils";
export const generateTimeSlots = (slotDuration, startTime, endTime) => {
    const slots = [];
    const startHour = parseInt(startTime);
    const endHour = parseInt(endTime);
    
    // Convert slot duration to hours and minutes
    const durationHours = Math.floor(slotDuration / 60);
    const durationMinutes = slotDuration % 60;
    
    let currentHour = startHour;
    let currentMinute = 0;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute === 0)) {
      // Calculate end time for this slot
      let slotEndHour = currentHour + durationHours;
      let slotEndMinute = currentMinute + durationMinutes;
      
      // Handle minute overflow
      if (slotEndMinute >= 60) {
        slotEndHour += Math.floor(slotEndMinute / 60);
        slotEndMinute = slotEndMinute % 60;
      }
      
      // Check if this slot would go beyond the end time
      if (slotEndHour > endHour || (slotEndHour === endHour && slotEndMinute > 0)) {
        break;
      }
      
      // Format the slot as a string
      const slotStart = `${currentHour}:${currentMinute === 0 ? '00' : currentMinute}`;
      const slotEnd = `${slotEndHour}:${slotEndMinute === 0 ? '00' : slotEndMinute}`;
      
      // Add the slot to the array
      slots.push({
        start: slotStart,
        end: slotEnd,
        display: `${formatTime(currentHour, currentMinute)}-${formatTime(slotEndHour, slotEndMinute)}`
      });
      
      // Move to the next slot
      currentHour = slotEndHour;
      currentMinute = slotEndMinute;
    }
    
    return slots;
  };
  export function generateWorkingSlots(startTime, endTime, stepMinutes) {
    const safeStep = Number(stepMinutes);
    if (!Number.isFinite(safeStep) || safeStep <= 0) {
      return [];
    }

    const slots = [];
  
    let [h, m] = startTime.split(":").map(Number);
    let [endH, endM] = endTime.split(":").map(Number);
  
    const start = h * 60 + m;
    const end = endH * 60 + endM;
  
    for (let t = start; t + safeStep <= end; t += safeStep) {
      const sH = Math.floor(t / 60);
      const sM = t % 60;

      const e = t + safeStep;
      const eH = Math.floor(e / 60);
      const eM = e % 60;
  
      const startStr = `${sH}:${sM.toString().padStart(2, "0")}`;
      const endStr   = `${eH}:${eM.toString().padStart(2, "0")}`;
  
      slots.push(`${startStr}-${endStr}`);
    }
  
    return slots;
  }

  /**
   * Formats time for display
   * @param {number} hour - Hour value
   * @param {number} minute - Minute value
   * @returns {string} - Formatted time string
   */
  export const formatTime = (hour, minute) => {
    // Convert to Persian numerals
    const persianNumerals = {
      '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
      '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
    };

    const convertToPersian = (str) => {
      return str.replace(/[0-9]/g, digit => persianNumerals[digit]);
    };
    
    const hourStr = hour.toString();
    const minuteStr = minute === 0 ? '00' : minute.toString();
    
    return `${convertToPersian(hourStr)}:${convertToPersian(minuteStr)}`;
  };
  
  /**
   * Gets the default slots for a court based on its working hours and slot duration
   * @param {Object} courtData - Court data object
   * @param {string} dayKey - Key for the day (e.g., 'saturday')
   * @returns {Array} - Array of default time slots
   */
  export const getDefaultSlots = (courtData, dayKey) => {
    const weekDays = [
        { key: 'saturday', display: 'شنبه', shortKey: 'sat' },
        { key: 'sunday', display: 'یکشنبه', shortKey: 'sun' },
        { key: 'monday', display: 'دوشنبه', shortKey: 'mon' },
        { key: 'tuesday', display: 'سه‌شنبه', shortKey: 'tue' },
        { key: 'wednesday', display: 'چهارشنبه', shortKey: 'wed' },
        { key: 'thursday', display: 'پنجشنبه', shortKey: 'thu' },
        { key: 'friday', display: 'جمعه', shortKey: 'fri' }
    ];
    const shortKey = weekDays.find(day => day.key === dayKey)?.shortKey;
    const workingHours = shortKey && courtData?.workingHours?.[shortKey] 
      ? courtData.workingHours[shortKey] 
      : courtData?.defaultWorkingHours || { startTime: '6', endTime: '23' };
    
    const slotDuration = parseInt(courtData.priceData?.time) || 60;
    
    return generateTimeSlots(slotDuration, workingHours.startTime, workingHours.endTime);
  };
