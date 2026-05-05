import React, { useState, useEffect } from 'react'
import Box from '../../components/Box'

import ReservationGrid from './components/Court-reservation-grid-hoursly';
import ReservationsDay from './components/Package-list'
import MonthlyStatsCalculator from '../components/MonthlyStatsCalculator';
import { backendAccessGet, backendAccessPost } from '../../utils/Authentication'
import jalaali from 'jalaali-js';
import  ListDateTime  from '../components/ListDateTime'

const CourtsAdmin = () => {

    const [showDailyCalender, setShowDailyCalender] = useState(false);
    const [showMonthlyCalender, setShowMonthlyCalender] = useState(true);
    const [selectedCourtId, setSelectedCourtId] = useState(null);
    const [selectedDateReservations, setSelectedDateReservations] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [reservations, setReservations] = useState([]);
    const [courts, setCourts] = useState([]);
    const [courtR, setCourtR] = useState([]);
    const [category, setCategory] = useState([])
    const [subcategory, setSubcategory] = useState([])
    const [categorycontent, setCategorycontent] = useState([])
    const [loading, setLoading] = useState(true);
    const [couches, setCouches] = useState([]);
    const [members, setMembers] = useState([]);
    const [settingdata, setSettingdata] = useState([]);
    const [allReservations, setAllReservations] = useState([]);

    const styles = {
        selectableDay: { backgroundColor: '#EDEEFF', color: '#4951FF', border: '0.5px solid #4951FF60' },
        selectableHover: { backgroundColor: '#b9ed00', color: '#fff' },
        selectedDay: { backgroundColor: '#4951FF', color: '#fff' },
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

  backendAccessPost("api/reserved/fetch-status/", {
    status: 'offerPackage'
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



    return (
        <>
            <div className='flex flex-col w-full h-full space-y-[15px]'>

     <ListDateTime
                    styles={styles}
                            category={category}
                      reservations={allReservations}  
                                          setReservations={setReservations}
 
                      courts={courts}   
                                        subcategory={subcategory}

                                                            categorycontent={categorycontent}

                  />
                    <div className='flex space-x-[15px] space-x-reverse'>
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
            </div>  </div>
        </>
    )
}

export default CourtsAdmin