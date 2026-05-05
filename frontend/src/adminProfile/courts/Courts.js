import React, { useState, useEffect } from 'react'
import Box from '../../components/Box'

import CourtList from './components/Court-list';
import ReservationGrid from './components/Court-reservation-grid-hoursly';
import ReservationsDay from './components/Court-reservation-daily'
import MonthlyStatsCalculator from '../components/MonthlyStatsCalculator';
import jalaali from 'jalaali-js';
import { backendAccessGet, backendAccessPost } from '../../utils/Authentication'
import ReusableCalendar from '../components/ReusableCalendar';
import { SlCalender } from "react-icons/sl";
const CourtsAdmin = () => {

    const [showDailyCalender, setShowDailyCalender] = useState(false);

    const [showMonthlyCalender, setShowMonthlyCalender] = useState(true);
    const [selectedCourtId, setSelectedCourtId] = useState(null);
    const [selectedDate, setSelectedDate] = useState();
    const [selectedTime, setSelectedTime] = useState(null);
    const [allReservations, setAllReservations] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [courts, setCourts] = useState([]);
    const [category, setCategory] = useState([])
    const [subcategory, setSubcategory] = useState([])
    const [categorycontent, setCategorycontent] = useState([])
    const [loading, setLoading] = useState(true);
    const [couches, setCouches] = useState([]);
    const [members, setMembers] = useState([]);
    const [settingdata, setSettingdata] = useState([]);

    const styles = {
        selectableDay: { backgroundColor: 'rgb(185, 237, 0, 0.2)', color: '#788f2a', border: '0.1px solid #B9ED0070 ' },
        selectableHover: { backgroundColor: '#b9ed00', color: '#fff' },
        selectedDay: { backgroundColor: '#b9ed00', color: '#fff' },
        reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
    };

    useEffect(() => {
        const today = new Date();
        const jalaliToday = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
        const formatted = `${jalaliToday.jy}/${String(jalaliToday.jm).padStart(2, '0')}/${String(jalaliToday.jd).padStart(2, '0')}`;
        setSelectedDate(formatted);
        backendAccessGet("api/court/fetch-all/").then(res => {
            try {
                setAllReservations(res.reserved || [])
                setCourts(res.courts || [])
                setCouches(res.couchs || [])
                setSettingdata(res.settings || [])
                setCategory(res.categories || [])
                setSubcategory(res.subcategories || [])
                setCategorycontent(res.categorycontent || [])
                setMembers(res.members || [])

            } catch (error) {
                console.error('Error fetching data:', error);
                setReservations([]);
                setCourts([]);
            } finally {
                setLoading(false);
            }
        })
    }, []);

    useEffect(() => {
        if (!selectedDate) return;
        setReservations([])
        backendAccessPost("api/reserved/fetch-selected-day-except-wailinglist/", {
            selected_day: selectedDate
        })
            .then(res => {
                try {
                    setReservations(res.reserved || []);
                } catch (error) {
                    console.error('Error fetching reservations:', error);
                    setReservations([]);
                } finally {
                    setLoading(false);
                }
            });
    }, [selectedDate]);

    const handleCourtSelect = (courtId) => {
        console.log('Court selected in parent:', courtId);
        setSelectedCourtId(courtId);
    };



    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };
    const displayedReservations = selectedTime
        ? reservations.filter(res => res.selected_time === selectedTime)
        : reservations;
    return (
        <>
            <div className='flex flex-col w-full h-full space-y-[15px]'>
                <div className='flex space-x-[15px] space-x-reverse'>
                    <Box width={173} height={'153px'}>
                        <div className='flex justify-center items-center p-[20px]'>
                            <div className="flex flex-col items-center relative">
                                <button onClick={() => [setShowMonthlyCalender(true), setShowDailyCalender(false), setSelectedTime('')]} className="relative w-[85px] h-[85px] rounded-full border cursor-pointer text-[11px] bg-white focus:outline-none">
                                    <img
                                        src={`${showMonthlyCalender ? '/images/back-selected-menu-item.svg' : '/images/back-menu-item.svg'}`}
                                        className="w-[55px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                        alt=""
                                    />
                                    <img
                                        src={`/images/testtop.svg`}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    />
                                </button>
                                <div className="text-[11px] font-[500] mt-1">
                                    تقویم کاری ماهانه
                                </div>
                            </div>
                        </div>
                    </Box>

                    <Box width={173} height={'153px'}>
                        <div className='flex justify-center items-center p-[20px]'>
                            <div className="flex flex-col items-center relative">
                                <button onClick={() => [setShowMonthlyCalender(false), setShowDailyCalender(true)]} className="relative w-[85px] h-[85px] rounded-full border cursor-pointer text-[11px] bg-white focus:outline-none">
                                    <img
                                        src={`${showDailyCalender ? '/images/back-selected-menu-item.svg' : '/images/back-menu-item.svg'}`}
                                        className="w-[55px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                        alt=""
                                    />
                                    <img
                                        src={`/images/daily-calender.svg`}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    />
                                </button>
                                <div className="text-[11px] font-[500] mt-1">
                                    تقویم روزانه
                                </div>
                            </div>
                        </div>
                    </Box>

                    <MonthlyStatsCalculator
                        courts={courts}
                        reservations={allReservations}
                        loading={loading}
                        color={'#B9ED00'}
                        title={'زمین ها'}


                    />

                </div>

                {showMonthlyCalender && (
                    <div className='flex flex-col w-full h-full space-y-[15px]'>

                        <div className='flex space-x-[15px] space-x-reverse'>
                            <Box width={360} height={'311px'}>
                                <ReusableCalendar
                                    selectedDate={selectedDate}
                                    onDateSelect={handleDateSelect}
                                    wantsCoach={false}
                                    styles={styles}
                                />

                            </Box>

                            <Box width={697} height={'311px'}>
                                <CourtList
                                    onCourtSelect={handleCourtSelect}
                                    courts={courts}
                                    setCourts={setCourts}
                                    setting={settingdata}
                                    category={category}
                                    subcategory={subcategory}
                                    categorycontent={categorycontent}
                                    loading={loading}
                                />
                            </Box>
                        </div>
                                                <div className='flex space-x-[15px] space-x-reverse'>

                        <ReservationsDay
                            reservations={reservations}
                            setReservations={setReservations}
                            allReservations={allReservations}
                            setAllReservations={setAllReservations}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            courts={courts}
                            couches={couches}
                            members={members}
                            category={category}
                            subcategory={subcategory}
                            categorycontent={categorycontent}
                            selectedTime={selectedTime}
                            styles={styles}
                        />

                    </div>
                    </div>
                )}

                {showDailyCalender && (
                    <div className='flex flex-col w-full h-full space-y-[15px]'>

                        <div className='flex space-x-[15px] space-x-reverse'>
                            <Box width={1071} height={'auto'}>
                                <ReservationGrid
                                    reservations={reservations}
                                    setReservations={setReservations}
                                    courts={courts}
                                    category={category}
                                    categoryContent={categorycontent}
                                    loading={loading}
                                    members={members}
                                    selectedTime={selectedTime}
                                    setSelectedTime={setSelectedTime}
                                    selectedDate={selectedDate}
                                    setSelectedDate={setSelectedDate}
                                />

                            </Box>
                        </div>
                        <ReservationsDay
                            reservations={displayedReservations}
                            setReservations={setReservations}
                            allReservations={allReservations}
                            setAllReservations={setAllReservations}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                            courts={courts}
                            couches={couches}
                            members={members}
                            category={category}
                            subcategory={subcategory}
                            categorycontent={categorycontent}
                            selectedTime={selectedTime}
                            styles={styles}
                        />

                    </div>
                )}

  
            </div>
        </>
    )
}

export default CourtsAdmin