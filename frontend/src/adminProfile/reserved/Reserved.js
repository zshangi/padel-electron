import React, { useState, useEffect } from 'react'
import Box from '../../components/Box'

import ReservationsDay from './components/Reserved-list'
import jalaali from 'jalaali-js';
import { backendAccessGet, backendAccessPost } from '../../utils/Authentication'

const ReservedAdmin = () => {

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
    const [status,setStatus] = useState('confirm')
    const styles = {
        selectableDay: { backgroundColor: 'rgb(185, 237, 0, 0.2)', color: '#788f2a', border: '0.1px solid #B9ED0070 ' },
        selectableHover: { backgroundColor: '#b9ed00', color: '#fff' },
        selectedDay: { backgroundColor: '#b9ed00', color: '#fff' },
        reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
    };
    useEffect(() => {
        backendAccessGet("api/court/fetch-all/").then(res => {
            try {
                setCourts(res.courts || [])
                setMembers(res.members || [])

            } catch (error) {
                console.error('Error fetching data:', error);
                setCourts([]);
            }
        })
    }, []);
    useEffect(() => {
        backendAccessPost("api/reserved/fetch-status/", {
            status: status
        })
            .then(res => {
                try {
                    setReservations(res.reserved || []);
                } catch (error) {
                    console.error('Error fetching reservations:', error);
                    setReservations([]);
                } 
            });
    }, []);




    return (
        <>
            <div className='flex flex-col w-full h-full space-y-[15px]'>

              
                        <ReservationsDay
                            reservations={reservations}
                            setReservations={setReservations}
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
              
        </>
    )
}

export default ReservedAdmin