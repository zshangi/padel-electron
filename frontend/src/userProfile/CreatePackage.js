import React, { useState, useRef, useEffect } from 'react';
import '../styles/PersianCalendar.css';
import Calendar from '../components/Calender'
import { formatNumber } from '../utils/numberUtils'
import TimeSlot from '../components/TimeSlot'
import Package from '../components/Package';
import CreatePackage from '../components/CreatePackage';
import ConfirmDateTime from '../components/ConfirmDateTime';
import { backendAccessPost, backendAccessGet, backendMe } from '../utils/Authentication'
import { normalizeTimeSlot } from '../utils/numberUtils';
import { BsChevronLeft } from "react-icons/bs";
import { Link } from 'react-router-dom';
import Box from '../components/Box';


const CreatePackageCourts = () => {
    const [me, setMe] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(true);
    const [showTimeSlots, setShowTimeSlots] = useState(false);
    const [showConfirmDateTime, setShowConfirmDateTime] = useState(false);
    const mode = "package"
    const [selectedCourtId, setSelectedCourtId] = useState(1);
    const [courts, setCourts] = useState([]);
    const [reservedDates, setReservedDates] = useState([])
    const [selectedSlots, setSelectedSlots] = useState([]); // ← NEW
    const [selectedDateTemp, setSelectedDateTemp] = useState()
    const [selectedCouchId, setSelectedCouchId] = useState('');
    const [selectedCouchName, setSelectedCouchName] = useState('');
    const [selectedCourtName, setSelectedCourtName] = useState('');
    const [selectedReserved, setSelectedReserved] = useState(false);
    
    useEffect(() => {
        const load = async () => {
            let m = await backendMe();
            setMe(m);
        };
        load();
    }, []);

    const loadReservedData = async () => {
        const reservedRes = await backendAccessGet("api/reserved/fetch/");
        const courtsRes = await backendAccessGet("api/court/fetch/");
        if ("error_message" in reservedRes || "error_message" in courtsRes) return;

        const reservedList = reservedRes["reserved"] || [];
        const groupedByCourtAndDate = {};
        reservedList.forEach(item => {
            const { court_id, selected_day, selected_time } = item;
            const normalizedDay = selected_day.split('/').map(num => String(Number(num))).join('/');
            if (!groupedByCourtAndDate[court_id]) groupedByCourtAndDate[court_id] = {};
            if (!groupedByCourtAndDate[court_id][normalizedDay]) groupedByCourtAndDate[court_id][normalizedDay] = [];
            if (!groupedByCourtAndDate[court_id][normalizedDay].includes(selected_time))
                groupedByCourtAndDate[court_id][normalizedDay].push(selected_time);
        });

        setReservedDates(groupedByCourtAndDate);
        setCourts(courtsRes["courts"] || []);
    };
    useEffect(() => { loadReservedData(); }, []);
    console.log('reservedDates', reservedDates)


    useEffect(() => { loadReservedData(); }, []);

    const handleAddSlot = (date) => {
        if (mode === "single") {
            setSelectedSlots([{ date, time: null, courtId: selectedCourtId }]);
        } else {
            setSelectedSlots(prev => [...prev, { date, time: null, courtId: selectedCourtId }]);
        }
    };

    const handleRemoveSlot = (date) => {
        setSelectedSlots(prev =>
            prev.filter(
                s => !(s.date.year === date.year && s.date.month === date.month && s.date.day === date.day)
            )
        );
    };




    const handleDateSelect = (date) => {
        setSelectedDateTemp(date);
    };

    const styles = {
        selectableDay: { backgroundColor: 'rgb(185, 237, 0, 0.2)', color: '#788f2a', border: '0.1px solid #B9ED00 ' },
        selectableHover: { backgroundColor: '#b9ed00', color: '#fff' },
        selectedDay: { backgroundColor: '#b9ed00', color: '#fff' },
        reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
    };

    return (
        <div className='flex w-[100%]   justify-center items-start body-farsi bg-[#fbfbfb] text-[10px]' style={{ direction: 'rtl' }}>
            <div className='flex flex-col w-full space-y-[10px] mt-[20px]   max-w-[393px] justify-start items-center px-[20px] '>


                {showCalendar &&
                                <Box width={350} height={330}>

                    <Calendar


                        reservedDates={reservedDates}
                        categories={courts}
                        selectedCourtId={selectedCourtId}
                        setSelectedCourtId={setSelectedCourtId}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        showCalendar={showCalendar}
                        setShowCalendar={setShowCalendar}
                        showTimeSlots={showTimeSlots}
                        setShowTimeSlots={setShowTimeSlots}
                        styles={styles}
                        onDateSelect={handleDateSelect}
                        showConfirmDateTime={showConfirmDateTime}
                        setShowConfirmDateTime={setShowConfirmDateTime}
                        selectedSlots={selectedSlots}
                        selectedCouchId={selectedCouchId}
                        setSelectedCouchId={setSelectedCouchId}
                        selectedCouchName={selectedCouchName}
                        setSelectedCouchName={setSelectedCouchName}
                        setSelectedCourtName={setSelectedCourtName}
                        typeCategory="court"
                        mode={mode}
                        onAddSlot={handleAddSlot}
                        onRemoveSlot={handleRemoveSlot}
                                        selectedReserved={selectedReserved}
                        setSelectedReserved={setSelectedReserved}
                    />
                    </Box>
                }

                {showTimeSlots && (
                    <TimeSlot
                        selectedDate={selectedDateTemp}  
                        onConfirmTime={(time,isReserved) => {
                            const newSlot = {
                                date: selectedDateTemp,
                                time,
                                courtId: selectedCourtId,
                                courtName: selectedCourtName || null,
                                couchId: selectedCouchId || null,
                                couchName: selectedCouchName || null,
                            };

                            if (mode === "single") {
                                setSelectedSlots([newSlot]);
                            } else {
                                setSelectedSlots(prev => {
                                    const exists = prev.some(
                                        s =>
                                            s.date.year === selectedDateTemp.year &&
                                            s.date.month === selectedDateTemp.month &&
                                            s.date.day === selectedDateTemp.day
                                    );

                                    if (exists) {
                                        // update existing slot for that day
                                        return prev.map(s =>
                                            s.date.year === selectedDateTemp.year &&
                                                s.date.month === selectedDateTemp.month &&
                                                s.date.day === selectedDateTemp.day
                                                ? newSlot
                                                : s
                                        );
                                    } else {
                                        // add new if not already present
                                        return [...prev, newSlot];
                                    }
                                });
                            }


                            setShowTimeSlots(false);
                            setShowCalendar(true);
                                if (isReserved) {
                                setSelectedReserved(true);
                            } else {
                                setSelectedReserved(false);
                            }
                        }}

                        selectedSlots={selectedSlots}
                        reservedDates={reservedDates}
                        selectedCourtId={selectedCourtId}
                                                setShowTimeSlots={setShowTimeSlots}
                        setShowCalendar={setShowCalendar}
                                        selectedReserved={selectedReserved}
                        setSelectedReserved={setSelectedReserved}
                    />
                )}
                <div className='flex justify-center w-full h-[20px] content-center px-[20px] '>
                    <span>
                        با انتخاب تاریخ و ساعت های مورد نظرت از همین حالا زمینت رو رزرو کن!
                    </span>


                </div>
                <ConfirmDateTime
                    selectedSlots={selectedSlots}
                    mode={mode}
                    setShowConfirmDateTime={setShowConfirmDateTime}
                    setShowCalendar={setShowCalendar}
                    setShowTimeSlots={setShowTimeSlots}
                    setSelectedSlots={setSelectedSlots}        // ✅ new
                    loadReservedData={loadReservedData}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    color={'#b9ed00'}
                      selectedReserved={selectedReserved}
                        setSelectedReserved={setSelectedReserved}
                />





                <div className='flex flex-col justify-center  text-[9px] text-[#808080] items-center  w-[400px]   h-[30px] px-[20px] border-t-[1px] border-[#f6f6f6] '>
                    2026 PaddelNow, All rights reserved
                </div>

            </div>


        </div>
    )

}
export default CreatePackageCourts



