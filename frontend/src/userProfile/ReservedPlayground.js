import React, { useState, useRef, useEffect } from 'react';
import '../styles/PersianCalendar.css';
import Calendar from '../components/Calender'
import TimeSlot from '../components/TimeSlot'
import Package from '../components/Package';
import CreatePackage from '../components/CreatePackage';
import ConfirmDateTime from '../components/ConfirmDateTime';
import { backendAccessPost, backendAccessGet, backendMe } from '../utils/Authentication'
import { BsChevronLeft } from "react-icons/bs";
import { Link } from 'react-router-dom';
import Box from '../components/Box';
import { useLocation } from 'react-router-dom';


const ReservedPlayground = () => {
    const [me, setMe] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(true);
    const [showTimeSlots, setShowTimeSlots] = useState(false);
    const [showConfirmDateTime, setShowConfirmDateTime] = useState(false);
    const [selectedCourtId, setSelectedCourtId] = useState(null);     // ✅ fixed
    const [selectedCourtName, setSelectedCourtName] = useState(null); // ✅ fixed
    const [courts, setCourts] = useState([]);
    const [couches, setCouches] = useState([]);

    const [reservedDates, setReservedDates] = useState([]);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [selectedDateTemp, setSelectedDateTemp] = useState(null);   // also fix this while you're at it
    const [selectedCouchId, setSelectedCouchId] = useState(null);     // ✅ fixed (was '')
    const [selectedCouchName, setSelectedCouchName] = useState(null); // ✅ fixed (was '')
    const [selectedReserved, setSelectedReserved] = useState(false);
    const [is_reserved_before, setIs_reserved_before] = useState(false);


    const { search } = useLocation();
    const params = new URLSearchParams(search);

    const typeCategory = params.get('typeCategory');
    const mode = params.get('mode');


    useEffect(() => {
        setSelectedDate(null);
        setSelectedDateTemp(null);
        setSelectedSlots([]);
        setSelectedCourtId(null);
        setSelectedCourtName(null);
        setSelectedCouchId(null);
        setSelectedCouchName(null);
        setSelectedReserved(false);
        setShowCalendar(true);
        setShowTimeSlots(false);
        setShowConfirmDateTime(false);
    }, [typeCategory, mode]);

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
        const couchesRes = await backendAccessGet("api/couch/fetch/");

        if ("error_message" in reservedRes || "error_message" in courtsRes) return;

        const reservedList = reservedRes["reserved"] || [];

        const groupedByCourtAndDate = {};
        const groupedByCouchAndDate = {};

        reservedList.forEach(item => {
            const { court_id, couch_id, selected_day, selected_time } = item;
            const normalizedDay = selected_day.split('/').map(num => String(Number(num))).join('/');

            if (!groupedByCourtAndDate[court_id]) groupedByCourtAndDate[court_id] = {};
            if (!groupedByCourtAndDate[court_id][normalizedDay]) groupedByCourtAndDate[court_id][normalizedDay] = [];
            if (!groupedByCourtAndDate[court_id][normalizedDay].includes(selected_time))
                groupedByCourtAndDate[court_id][normalizedDay].push(selected_time);

            if (couch_id !== null) {
                if (!groupedByCouchAndDate[couch_id]) groupedByCouchAndDate[couch_id] = {};
                if (!groupedByCouchAndDate[couch_id][normalizedDay]) groupedByCouchAndDate[couch_id][normalizedDay] = [];
                if (!groupedByCouchAndDate[couch_id][normalizedDay].includes(selected_time))
                    groupedByCouchAndDate[couch_id][normalizedDay].push(selected_time);
            }
        });

        setReservedDates({
            courts: groupedByCourtAndDate,
            couches: groupedByCouchAndDate
        });
        setCourts(courtsRes["courts"] || []);
        setCouches(couchesRes["couchs"] || []);
    };


    const handleAddSlot = (day) => {
        const newSlot = {
            date: day,
            time: null,
            courtId: typeCategory === 'court' ? selectedCourtId : null,
            courtName: typeCategory === 'court' ? selectedCourtName : null,
            couchId: typeCategory === 'couch' ? selectedCouchId : null,
            couchName: typeCategory === 'couch' ? selectedCouchName : null,
        };

        setSelectedSlots(prev => [...prev, newSlot]);
    };

    const handleRemoveSlot = (day) => {
        setSelectedSlots(prev => prev.filter(
            slot => !(slot.date.year === day.year &&
                slot.date.month === day.month &&
                slot.date.day === day.day)
        ));
    };

    useEffect(() => { loadReservedData(); }, []);
    // console.log('reservedDates', reservedDates)



    const handleDateSelect = (date) => {
        setSelectedDateTemp(date);
    };


    const handleConfirmTime = (time, isReserved, availableCourts, availableCouches, courtId, couchId) => {
        // Check if this time is fully reserved
        const isFullyReserved = isReserved && (
            (typeCategory === 'court' && availableCourts.length === 0) ||
            (typeCategory === 'couch' && availableCouches.length === 0)
        );

        setIs_reserved_before(isFullyReserved);

        // ✅ CRITICAL: If court was auto-assigned and not already set globally, update global state
        if (typeCategory === 'court' && courtId && courtId !== selectedCourtId) {
            setSelectedCourtId(courtId);
            // Also find and set court name for UI consistency
            const court = courts.find(c => c.id === courtId);
            if (court) setSelectedCourtName(court.data.name);
        }

        // Similarly for couch (though less critical since couch selection is explicit)
        if (typeCategory === 'couch' && couchId && couchId !== selectedCouchId) {
            setSelectedCouchId(couchId);
            const couch = couches.find(c => c.id === couchId);
            if (couch) setSelectedCouchName(couch.name);
        }

        if (mode === "package") {
            setSelectedSlots(prev => prev.map(slot => {
                if (
                    slot.date.year === selectedDateTemp.year &&
                    slot.date.month === selectedDateTemp.month &&
                    slot.date.day === selectedDateTemp.day
                ) {
                    return {
                        ...slot,
                        time,
                        availableCourts: typeCategory === 'court' ? availableCourts : [],
                        availableCouches: typeCategory === 'couch' ? availableCouches : [],
                        selectedCourtId: typeCategory === 'court' ? courtId : null,
                        selectedCouchId: typeCategory === 'couch' ? couchId : null,
                        selectedCouchCourtId: null,
                        is_reserved_before: false
                    };
                }
                return slot;
            }));
        } else {
            const newSlot = {
                date: selectedDateTemp,
                time,
                availableCourts: typeCategory === 'court' ? availableCourts : [],
                availableCouches: typeCategory === 'couch' ? availableCouches : [],
                selectedCourtId: typeCategory === 'court' ? courtId : null,
                selectedCouchId: typeCategory === 'couch' ? couchId : null,
                selectedCouchCourtId: null,
                is_reserved_before: isFullyReserved
            };

            setSelectedSlots([newSlot]);
        }
        setShowTimeSlots(false);
        setShowCalendar(true);
        setSelectedReserved(isReserved);
    };

    const courtStyles = {
        selectableDay: { backgroundColor: 'rgb(185, 237, 0, 0.2)', color: '#788f2a', border: '0.1px solid #B9ED0070 ' },
        selectableHover: { backgroundColor: '#b9ed00', color: '#fff' },
        selectedDay: { backgroundColor: '#b9ed00', color: '#fff' },
        reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
    };
    const couchStyles = {
        selectableDay: { backgroundColor: '#ffe6d3', color: '#fe7a15', border: '0.01px solid #fe7a1530' },
        selectableHover: { backgroundColor: '#FF6F00', color: '#fff' },
        selectedDay: { backgroundColor: '#FF6F00', color: '#fff' },
        reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
    };

    return (
        <div className='flex w-[100%] h-[calc(100vh-220px)] justify-center items-start overflow-x-hidden body-farsi bg-[#fbfbfb] text-[10px] scroll-m-0' style={{ direction: 'rtl' }}>
            <div className='flex flex-col w-full space-y-[10px] mt-[10px] max-w-[393px] justify-start items-center px-[20px] '>



                {showCalendar &&
                    <Box width={350} height={330}>
                        <Calendar
                            reservedDates={reservedDates}
                            categories={typeCategory === 'couch' ? couches : courts}
                            subjectCategory={typeCategory === 'couch' ? 'همه مربی ها' : 'همه زمین ها'}
                            selectedCourtId={typeCategory === 'couch' ? selectedCouchId : selectedCourtId}
                            setSelectedCourtId={typeCategory === 'couch' ? setSelectedCouchId : setSelectedCourtId}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            showCalendar={showCalendar}
                            setShowCalendar={setShowCalendar}
                            showTimeSlots={showTimeSlots}
                            setShowTimeSlots={setShowTimeSlots}
                            styles={typeCategory === 'couch' ? couchStyles : courtStyles}
                            onDateSelect={handleDateSelect}
                            showConfirmDateTime={showConfirmDateTime}
                            setShowConfirmDateTime={setShowConfirmDateTime}
                            selectedSlots={selectedSlots}
                            onAddSlot={handleAddSlot}
                            onRemoveSlot={handleRemoveSlot}
                            selectedCouchId={selectedCouchId}
                            setSelectedCouchId={setSelectedCouchId}
                            selectedCouchName={selectedCouchName}
                            setSelectedCouchName={setSelectedCouchName}
                            setSelectedCourtName={setSelectedCourtName}
                            typeCategory={typeCategory}
                            mode={mode}
                            selectedReserved={selectedReserved}
                            setSelectedReserved={setSelectedReserved}
                            setIs_reserved_before={setIs_reserved_before}
                            is_reserved_before={is_reserved_before}
                        />
                    </Box>
                }


                {showTimeSlots && (
                    <TimeSlot
                        selectedDate={selectedDateTemp}
                        onConfirmTime={handleConfirmTime}

                        styles={typeCategory === 'couch' ? couchStyles : courtStyles}
                        selectedSlots={selectedSlots}
                        reservedDates={reservedDates}
                        selectedCourtId={selectedCourtId}
                        selectedCouchId={selectedCouchId}
                        setShowTimeSlots={setShowTimeSlots}
                        setShowCalendar={setShowCalendar}
                        selectedReserved={selectedReserved}
                        setSelectedReserved={setSelectedReserved}
                        courts={courts}
                        couches={couches}
                        typeCategory={typeCategory}
                        mode={mode}
                        setIs_reserved_before={setIs_reserved_before}
                        is_reserved_before={is_reserved_before}
                    />
                )}

                {showConfirmDateTime && (
                    <ConfirmDateTime
                        selectedSlots={selectedSlots}
                        mode={mode}
                        setShowConfirmDateTime={setShowConfirmDateTime}
                        setShowCalendar={setShowCalendar}
                        setShowTimeSlots={setShowTimeSlots}
                        setSelectedSlots={setSelectedSlots}
                        loadReservedData={loadReservedData}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        color={typeCategory === 'court' ? '#B9ED00' : '#fe7a15'}
                        selectedCourtName={selectedCourtName}
                        selectedCouchName={selectedCouchName}
                        selectedReserved={selectedReserved}
                        setSelectedReserved={setSelectedReserved}
                        courts={courts}
                        couches={couches}
                        typeCategory={typeCategory}
                        is_reserved_before={is_reserved_before} // Pass is_reserved_before as a prop

                    />
                )}



                {!showConfirmDateTime &&
                    <>
                        <div className='w-full h-[20px] content-center px-[20px] '>
                            <div className='float-start'>پکیج ها</div>
                            <div className='flex items-center space-x-[4px] space-x-reverse float-end'>
                                <Link to={'/packages'}>مشاهده همه پکیج ها</Link>
                                <BsChevronLeft /></div>

                        </div>
      
                        {/* {typeCategory === 'court' ?
                            <Package
                                payload={{
                                    subject: 'پکیـــج ۳ماهه <span>(بدون مربی)</span>',
                                    discount: 10,
                                    color: '#B9ED00',
                                    data: [{ 'price': '۱۸ میلیون تومان' }, { 'sessionNum': '۱۲' }, { 'start': 'شنبه | ۱۲ آبان' }, { 'days': 'شنبه' }, { 'times': '۶:۰۰ تا ۷:۰۰ صبح' }, { 'details': 'این پکیج شامل مربی نمی باشد.' }],
                                    buttonText: 'خرید',
                                    onClick: () => alert('Package purchased!')
                                }}
                            />
                            :
                            <Package
                                payload={{
                                    subject: 'پکیـــج ۳ماهه <span>(همراه با مربی)</span>',
                                    discount: 5,
                                    color: '#FE7A15',
                                    data: [
                                        { price: '۴۰ میلیون تومان' },
                                        { sessionNum: '۱۲' },
                                        { start: 'شنبه | ۱۲ آبان' },
                                        { days: 'شنبه' },
                                        { times: '۶:۰۰ تا ۷:۰۰ صبح' },
                                        { details: 'مربی : ارسلان' },
                                    ],
                                    buttonText: 'خرید',
                                    onClick: () => alert('Package purchased!'),
                                }}
                            />
                        } */}


                        <div className='flex items-center justify-center w-full h-[80px]  '>
                            {typeCategory === 'court' ?
                                <CreatePackage color={'#B9ED00'} link={'/user-home?typeCategory=court&mode=package'} />
                                :
                                <CreatePackage color={'#fe7a15'} link={'/user-home?typeCategory=couch&mode=package'} />
                            }
                        </div>
                    </>
                }

                <div className='flex flex-col justify-center  text-[9px] text-[#808080] items-center  w-[400px]   h-[30px] px-[20px] border-t-[1px] border-[#f6f6f6] '>
                    2026 PaddelNow, All rights reserved
                </div>

            </div>


        </div>
    )

}
export default ReservedPlayground