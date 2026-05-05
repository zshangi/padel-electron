import React, { useState, useEffect } from 'react';
import '../styles/PersianCalendar.css';
import Calendar from '../components/Calender';
import TimeSlot from '../components/TimeSlot';
import ConfirmDateTime from '../components/ConfirmDateTime';
import { backendAccessPost, backendAccessGet, backendMe } from '../utils/Authentication';
import { BsChevronLeft } from "react-icons/bs";
import { Link } from 'react-router-dom';
import Package from '../components/Package';
import CreatePackage from '../components/CreatePackage';
import Box from '../components/Box';

const ReservedCouch = () => {
    const [me, setMe] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(true);
    const [showTimeSlots, setShowTimeSlots] = useState(false);
    const [showConfirmDateTime, setShowConfirmDateTime] = useState(false);
    const [selectedCouchId, setSelectedCouchId] = useState();
    const [selectedCouchName, setSelectedCouchName] = useState();
    const [couches, setCouches] = useState([]);
    const [reservedDates, setReservedDates] = useState({});
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [selectedDateTemp, setSelectedDateTemp] = useState();
        const [selectedCourtId, setSelectedCourtId] = useState(1);
            const [selectedCourtName, setSelectedCourtName] = useState('');
            const [selectedReserved, setSelectedReserved] = useState(false);
        
    
    const mode = "package"
    // ------------------------------------------------
    // 🔹 Load current user
    // ------------------------------------------------
    useEffect(() => {
        const load = async () => {
            const m = await backendMe();
            setMe(m);
        };
        load();
    }, []);

    // ------------------------------------------------
    // 🔹 Fetch reservations + couches
    // ------------------------------------------------
    const loadReservedData = async () => {
        const reservedRes = await backendAccessGet("api/reserved/fetch_couch/");
        const couchesRes = await backendAccessGet("api/couch/fetch/");
        if ("error_message" in reservedRes || "error_message" in couchesRes) return;

        const reservedList = reservedRes["reserved"] || [];
        const grouped = {};

        // Prepare lookup for couches grouped by court_id
        const couchByCourt = {};
        (couchesRes["couchs"] || []).forEach(c => {
            if (!c.court_id) return;
            if (!couchByCourt[c.court_id]) couchByCourt[c.court_id] = [];
            couchByCourt[c.court_id].push(String(c.id));
        });

        reservedList.forEach(item => {
            const { selected_day, selected_time, court_id, couch_id } = item;
            const normalizedDay = selected_day.split('/').map(num => String(Number(num))).join('/');

            // 🔹 CASE 1: Couch reservation (specific coach blocked)
            if (couch_id) {
                const key = String(couch_id);
                if (!grouped[key]) grouped[key] = {};
                if (!grouped[key][normalizedDay]) grouped[key][normalizedDay] = [];
                if (!grouped[key][normalizedDay].includes(selected_time))
                    grouped[key][normalizedDay].push(selected_time);
            }

            // 🔹 CASE 2: Court reservation with no couch → block all couches under this court
            else if (court_id && couchByCourt[court_id]) {
                couchByCourt[court_id].forEach(couchKey => {
                    if (!grouped[couchKey]) grouped[couchKey] = {};
                    if (!grouped[couchKey][normalizedDay]) grouped[couchKey][normalizedDay] = [];
                    if (!grouped[couchKey][normalizedDay].includes(selected_time))
                        grouped[couchKey][normalizedDay].push(selected_time);
                });
            }

            // 🔹 CASE 3: Neither couch nor court → ignore or handle separately
        });

        setReservedDates(grouped);
        setCouches(couchesRes["couchs"] || []);
    };


    useEffect(() => { loadReservedData(); }, []);
    const handleAddSlot = (date) => {
        if (mode === "single") {
            setSelectedSlots([{ date, time: null, couchId: selectedCouchId }]);
        } else {
            setSelectedSlots(prev => [...prev, { date, time: null, couchId: selectedCouchId }]);
        }
    };
    console.log('selectedSlots', selectedSlots)

    const handleRemoveSlot = (date) => {
        setSelectedSlots(prev =>
            prev.filter(
                s => !(s.date.year === date.year && s.date.month === date.month && s.date.day === date.day)
            )
        );
    };

    // ------------------------------------------------
    // 🔹 Handlers
    // ------------------------------------------------
    const handleDateSelect = (date) => {
        setSelectedDateTemp(date);
    };

    const styles = {
        selectableDay: { backgroundColor: '#ffe6d3', color: '#fe7a15', border: '0.01px solid #fe7a1530' },
        selectableHover: { backgroundColor: '#FF6F00', color: '#fff' },
        selectedDay: { backgroundColor: '#FF6F00', color: '#fff' },
        reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
    };

    // ------------------------------------------------
    // 🔹 JSX
    // ------------------------------------------------
    return (
        <div
            className='flex w-[100%] h-[calc(100vh-220px)] justify-center items-start body-farsi bg-[#f8f9fa] text-[10px]'
            style={{ direction: 'rtl' }}
        >
            <div className='flex flex-col w-full space-y-[10px] mt-[20px] max-w-[393px] justify-start items-center px-[20px]'>

                {showCalendar && (
                <Box width={350} height={330}>
                    <Calendar
                        reservedDates={reservedDates}
                        categories={couches}
                        subjectCategory={'همه مربیان'}
                        selectedCourtId={selectedCouchId}
                        setSelectedCourtId={setSelectedCouchId}
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
                        setSelectedCourtName={setSelectedCouchName}
                        setSelectedCouchName={setSelectedCouchName}
                        setSelectedCouchId={setSelectedCouchId}
                        typeCategory="couch"
                        mode={mode}
                        onAddSlot={handleAddSlot}
                        onRemoveSlot={handleRemoveSlot}
                                         selectedReserved={selectedReserved}
                        setSelectedReserved={setSelectedReserved}
                    />
                    </Box>
                )}

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
          if (isReserved) {
                                setSelectedReserved(true);
                            } else {
                                setSelectedReserved(false);
                            }

                            setShowTimeSlots(false);
                            setShowCalendar(true);
                        }}

                        selectedSlots={selectedSlots}
                        reservedDates={reservedDates}
                        selectedCourtId={selectedCourtId}
                                                setShowTimeSlots={setShowTimeSlots}
                        setShowCalendar={setShowCalendar}
                    />
                )}

                    <ConfirmDateTime
                        selectedSlots={selectedSlots}
                        mode="package"
                        setShowConfirmDateTime={setShowConfirmDateTime}
                        setShowCalendar={setShowCalendar}
                        setShowTimeSlots={setShowTimeSlots}
                        setSelectedSlots={setSelectedSlots}
                        loadReservedData={loadReservedData}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        color={'#fe7a15'}
                        selectedCouchName={selectedCouchName}
                          selectedReserved={selectedReserved}
                        setSelectedReserved={setSelectedReserved}
                    />
                

          

                <div className='flex flex-col justify-center text-[9px] text-[#808080] items-center w-[400px] h-[30px] px-[20px] border-t-[1px] border-[#f6f6f6]'>
                    2026 PaddelNow, All rights reserved
                </div>
            </div>
        </div>
    );
};

export default ReservedCouch;
