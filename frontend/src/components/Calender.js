// src/components/FirstCalendar.js
import React,{useState,useRef} from 'react';
import ReusableCalendar from './ReusableCalendar';
import '../styles/PersianCalendar.css';

const FirstCalendar = ({
  onDateSelect,
  setShowCalendar,
  setShowTimeSlots,
  selectedDate,
  setSelectedDate,
  reservedDates = {},
  categories = [],
  typeCategory,
  selectedCourtId,
  setSelectedCourtId,
  selectedCouchId,
  setSelectedCouchName,
  subjectCategory,
  styles = {},
  setSelectedCourtName,
  isAvailableMode = false,
  mode,
  selectedSlots,
  onAddSlot,
  onRemoveSlot,
  setSelectedReserved,
  selectedReserved,
  setIs_reserved_before,
  is_reserved_before
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  return (
    <ReusableCalendar
      currentDate={currentDate}
      setCurrentDate={setCurrentDate}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      onDateSelect={onDateSelect}
      reservedDates={reservedDates}
      typeCategory={typeCategory}
      selectedCourtId={selectedCourtId}
      selectedCouchId={selectedCouchId}
      subjectCategory={subjectCategory}
      styles={styles}
      setSelectedCourtName={setSelectedCourtName}
      setSelectedCouchName={setSelectedCouchName}
      isAvailableMode={isAvailableMode}
      mode={mode}
      selectedSlots={selectedSlots}
      onAddSlot={onAddSlot}
      onRemoveSlot={onRemoveSlot}
      setSelectedReserved={setSelectedReserved}
      selectedReserved={selectedReserved}
      setIs_reserved_before={setIs_reserved_before}
      is_reserved_before={is_reserved_before}
      setShowCalendar={setShowCalendar}
      setShowTimeSlots={setShowTimeSlots}
      setShowConfirmDateTime={() => {}}
      dropdownOpen={dropdownOpen}
      setDropdownOpen={setDropdownOpen}
      dropdownRef={dropdownRef}
      categories={categories}
    />
  );
};

export default FirstCalendar;