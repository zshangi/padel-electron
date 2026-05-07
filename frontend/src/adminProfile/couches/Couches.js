import React, { useState, useEffect } from 'react'
import Box from '../../components/Box'

import CouchList from './components/Couch-list';
import MonthlyStatsCalculator from '../components/MonthlyStatsCalculator';
import { backendAccessGet, backendAccessPost } from '../../utils/Authentication'
import ReservationsDay from './components/Couch-reservation-daily'
import CouchAll from './components/Couch-all';
import jalaali from 'jalaali-js';
import ReusableCalendar from '../components/ReusableCalendar';

const AdminCouches = () => {
    const [showCouches, setShowCouches] = useState(false);
    const [showMonthlyCalender, setShowMonthlyCalender] = useState(true);

    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const [reservations, setReservations] = useState([]);
    const [courts, setCourts] = useState([]);
    const [category, setCategory] = useState([])
    const [subcategory, setSubcategory] = useState([])
    const [categorycontent, setCategorycontent] = useState([])
    const [loading, setLoading] = useState(true);
    const [couches, setCouches] = useState([]);
    const [members, setMembers] = useState([]);
    const [settingdata, setSettingdata] = useState([]);
    const [allReservations, setAllReservations] = useState([]);
    const [selectedCouchId, setSelectedCouchId] = useState([]);
    const [allReservationsWithCouch, setAllReservationsWithCouch] = useState([]);

    const styles = {
        selectableDay: { backgroundColor: '#ffe6d3', color: '#fe7a15', border: '0.01px solid #fe7a1530' },
        selectableHover: { backgroundColor: '#FF6F00', color: '#fff' },
        selectedDay: { backgroundColor: '#FF6F00', color: '#fff' },
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
                setAllReservationsWithCouch(res.reservedwithcouch || [])
                setCourts(res.courts || [])
                setCouches(res.couchs || [])
                setSettingdata(res.setting || [])
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

        backendAccessPost("api/reserved/fetch-selected-day-with-couch/", {
            selected_day: selectedDate,
            status: 'confirm'
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
    const handleCouchSelect = (couchId) => {
        console.log('Court selected in parent:', couchId);
        setSelectedCouchId(couchId);
    };



    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    return (
        <>
            <div className='flex flex-col w-full h-full space-y-[15px]'>
                <div className='flex space-x-[15px] space-x-reverse'>
                    <Box width={173} height={'153px'}>
                        <div className='flex justify-center items-center p-[20px]'>
                            <div className="flex flex-col items-center relative">
                                <button onClick={() => [setShowMonthlyCalender(true), setShowCouches(false), setSelectedTime('')]} className="relative w-[85px] h-[85px] rounded-full border cursor-pointer text-[11px] bg-white focus:outline-none">
                                    <img
                                        src={`${showMonthlyCalender ? './images/couch-selected-menu-item.svg' : './images/back-menu-item.svg'}`}
                                        className="w-[55px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                        alt=""
                                    />
                                    <img
                                        src={`./images/testtop.svg`}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    />
                                </button>
                                <div className="text-[11px] font-[500] mt-1">
                                    تقویم کاری مربی ها
                                </div>
                            </div>
                        </div>
                    </Box>
                    <Box width={173} height={'153px'}>
                        <div className='flex justify-center items-center p-[20px]'>
                            <div className="flex flex-col items-center relative">
                                <button onClick={() => [setShowMonthlyCalender(false), setShowCouches(true)]} className="relative w-[85px] h-[85px] rounded-full border cursor-pointer text-[11px] bg-white focus:outline-none">
                                    <img
                                        src={`${showCouches ? './images/couch-selected-menu-item.svg' : './images/back-menu-item.svg'}`}
                                        className="w-[55px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                        alt=""
                                    />
                                    <img
                                        src={`./images/reserve-couch-icon.svg`}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    />
                                </button>
                                <div className="text-[11px] font-[500] mt-1">
                                    مربی ها
                                </div>
                            </div>
                        </div>
                    </Box>

                    {/* Weekly Reservation Stats - Now using the new component */}
                    <MonthlyStatsCalculator
                        courts={couches}
                        reservations={allReservationsWithCouch}
                        loading={loading}
                        color={'#fe7a15'}
                        title={'مربی ها'}
                    />

                </div>

                {showMonthlyCalender && (
                    <div className='flex flex-col space-y-[15px]'>

                        <div className='flex space-x-[15px] space-x-reverse'>
                            <Box width={360} height={'311px'}>
                                <ReusableCalendar
                                    selectedDate={selectedDate}
                                    onDateSelect={handleDateSelect}
                                    // coachAllowedDays={coachAllowedDays} 
                                    wantsCoach={false}
                                    styles={styles}
                                />
                            </Box>

                            <Box width={697} height={'311px'}>

                                <CouchList
                                    couches={couches}
                                    loading={loading}
                                    onCouchSelect={handleCouchSelect}
                                    courts={courts}
                                    setCouches={setCouches}
                                    setting={settingdata}
                                    category={category}
                                    subcategory={subcategory}
                                    categorycontent={categorycontent}
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
                    </div>   </div>
                )}



                {showCouches && (
                    <div className='flex flex-col space-y-[15px]'>

                        <CouchAll with_add_modal={true} couches={couches} reservations={reservations} />
                    </div>
                )}




            </div>


        </>
    )
}

export default AdminCouches