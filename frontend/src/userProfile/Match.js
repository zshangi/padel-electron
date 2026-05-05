import React, { useState, useEffect } from 'react';
import '../styles/PersianCalendar.css';
import Calendar from '../components/Calender';
import ConfirmDateTime from '../components/ConfirmDateTime';
import { backendAccessGet, backendMe } from '../utils/Authentication';
import { BsChevronLeft } from "react-icons/bs";
import { Link } from 'react-router-dom';
import Package from '../components/Package';
import CreatePackage from '../components/CreatePackage';
import Box from '../components/Box';

const Match = () => {
    const [me, setMe] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(true);
    const [showConfirmDateTime, setShowConfirmDateTime] = useState(false);
    const [selectedLevelId, setSelectedLevelId] = useState(1);
    const [levels, setLevels] = useState([]);
    const [availableDates, setAvailableDates] = useState({}); // ✅ matches available by level
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [selectedCouchId, setSelectedCouchId] = useState('2');
    const [selectedCouchName, setSelectedCouchName] = useState('');
    const [selectedCourtName, setSelectedCourtName] = useState();
            const [selectedReserved, setSelectedReserved] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const m = await backendMe();
            setMe(m);
        };
        loadUser();
    }, []);

    // const loadMatchData = async () => {
    //     const matchsRes = await backendAccessGet("api/match/fetch/");
    //     const levelsRes = await backendAccessGet("api/level/fetch/");
    //     if ("error_message" in matchsRes || "error_message" in levelsRes) return;

    //     const matchsList = matchsRes["matchs"] || [];
    //     const groupedByLevelAndDate = {};

    //     matchsList.forEach(item => {
    //         const { level_id, selected_day, data } = item;
    //         const normalizedDay = selected_day.split('/').map(num => String(Number(num))).join('/');
    //         if (!groupedByLevelAndDate[level_id]) groupedByLevelAndDate[level_id] = {};
    //         groupedByLevelAndDate[level_id][normalizedDay] = data; // store match info
    //     });

    //     setAvailableDates(groupedByLevelAndDate);
    //     setLevels(levelsRes["levels"] || []);
    // };

    useEffect(() => { loadMatchData(); }, []);

    const handleDateSelect = (date) => {
        // store selected match (no time slot step)
        if (!selectedLevelId) return alert('لطفاً سطح مسابقه را انتخاب کنید');

        const levelId = String(selectedLevelId);
        const dateKey = `${date.year}/${date.month}/${date.day}`;
        const matchData = availableDates[levelId]?.[dateKey];

        if (!matchData) return; // shouldn’t happen, but safety check

        const newSlot = {
            date,
            match: matchData,
            levelId: selectedLevelId
        };

        setSelectedSlots([newSlot]);
        setShowCalendar(true);
        setShowConfirmDateTime(true);
    };
const loadMatchData = async () => {
  // Simulate API delay (optional)
  await new Promise(resolve => setTimeout(resolve, 300));

  // 🔸 Sample levels
  const levels = [
    { id: 1, name: 'سطح ۱ (مبتدی)' },
    { id: 2, name: 'سطح ۲ (متوسط)' },
    { id: 3, name: 'سطح ۳ (پیشرفته)' },
  ];

  // 🔸 Sample match data: available by level and date
  const matchsList = [
    // Level 1 matches
    {
      level_id: 1,
      selected_day: '1404/9/29', // Aban 29
      data: { players: 4, court: 'کورت ۳', coach: 'مریم' },
    },
    {
      level_id: 1,
      selected_day: '1404/9/30', // Aban 30
      data: { players: 2, court: 'کورت ۱', coach: 'رضا' },
    },

    // Level 2 matches
    {
      level_id: 2,
      selected_day: '1404/9/6',
      data: { players: 6, court: 'کورت ۲', coach: 'حمید' },
    },
    {
      level_id: 2,
      selected_day: '1404/9/7',
      data: { players: 8, court: 'کورت ۴', coach: 'سارا' },
    },

    // Level 3 — only on 29th
    {
      level_id: 3,
      selected_day: '1404/9/14',
      data: { players: 5, court: 'کورت ۵', coach: 'آرش' },
    },
  ];

  // Group by level_id → date → data
  const groupedByLevelAndDate = {};

  matchsList.forEach(item => {
    const { level_id, selected_day, data } = item;
    // Normalize: remove leading zeros (e.g., '1404/08/29' → '1404/8/29')
    const normalizedDay = selected_day.split('/').map(num => String(Number(num))).join('/');
    if (!groupedByLevelAndDate[level_id]) groupedByLevelAndDate[level_id] = {};
    groupedByLevelAndDate[level_id][normalizedDay] = data;
  });

  setLevels(levels);
  setAvailableDates(groupedByLevelAndDate);
};
    const styles = {
        selectableDay: { backgroundColor: '#fff0f0', color: '#ff0200', border: '0.1px solid #ff020030' },
        selectableHover: { backgroundColor: '#ff0200', color: '#fff' },
        selectedDay: { backgroundColor: '#ff0200', color: '#fff' },
        reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
    };

    return (
        <div className='flex w-[100%]   justify-center items-start body-farsi overflow-x-hidden bg-[#fbfbfb] text-[10px]' style={{ direction: 'rtl' }}>
            <div className='flex flex-col w-full space-y-[10px] mt-[20px]   max-w-[393px] justify-start items-center px-[20px]'>

                {showCalendar && (
                                  <Box width={350} height={330}>

                    <Calendar
                        reservedDates={availableDates} // 🔹 but treated as selectable dates
                        subjectCategory={'همه سطوح'}
                        categories={levels}
                        selectedCourtId={selectedLevelId} // reuse prop for simplicity
                        setSelectedCourtId={setSelectedLevelId}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        showCalendar={showCalendar}
                        setShowCalendar={setShowCalendar}
                        showTimeSlots={false} // no timeslot
                        setShowTimeSlots={() => { }}
                        styles={styles}
                        onDateSelect={handleDateSelect}
                        typeCategory={'level'} // custom flag for category type
                        showConfirmDateTime={showConfirmDateTime}
                        setShowConfirmDateTime={setShowConfirmDateTime}
                        selectedSlots={selectedSlots}
                        mode={'single'}
                        isAvailableMode={true} 
                        selectedCouchId={selectedCouchId}
                        setSelectedCouchId={setSelectedCouchId}
                        selectedCouchName={selectedCouchName}
                        setSelectedCouchName={setSelectedCouchName}
                        setSelectedCourtName={setSelectedCourtName}
                                      selectedReserved={selectedReserved}
                        setSelectedReserved={setSelectedReserved}
                    />
                    </Box>
                )}

                {showConfirmDateTime && selectedSlots.length > 0 && (
                    <ConfirmDateTime
                        selectedSlots={selectedSlots}
                        mode={'match'}
                        setShowConfirmDateTime={setShowConfirmDateTime}
                        setShowCalendar={setShowCalendar}
                        setSelectedSlots={setSelectedSlots}
                        loadReservedData={loadMatchData}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        color={'#ff0200'}
                         isAvailableMode={true} 
                         typeCategory="match"
                                       selectedReserved={selectedReserved}
                        setSelectedReserved={setSelectedReserved}
                    />
                )}

                {!showConfirmDateTime && (
                    <>
                        <div className='w-full h-[20px] content-center px-[20px] '>
                            <div className='float-start'>مسابقات</div>
                            <div className='flex items-center space-x-[4px] space-x-reverse float-end'>
                                <Link to={'/matches'}>مشاهده همه مسابقات</Link>
                                <BsChevronLeft />
                            </div>
                        </div>

                        <Package
                        payload={{
                                subject: 'بازی دوستانه (۸ نفره)',
                                discount: 15,
                                color: '#ff0200',
                                data: [{'price':'۱۰ میلیون تومان'}, {'sessionNum':'۱۲'}, {'start': 'شنبه | ۱۲ آبان'}, {'days':'حذفی |دسته ۲'},{'times':'۶:۰۰ تا ۷:۰۰ صبح'}, {'details':'مدیر اجرایی : ارسلان محمدی'}],
                                buttonText: 'خرید',
                                onClick: () => alert('Package purchased!')
                            }}
                        />

                                   <div className='flex items-center justify-center w-full h-[100px]  '>
                                       <div className='flex flex-col space-y-[5px] w-full h-[100px] bg-white rounded-[12px]  items-center justify-center shadow-md'>
                                           <span>گروه خودت رو بساز</span>
                                           <span> برای شرکت در بازی های گروهی، گروه خود را اضافه کنید.</span>
                                   <Link to={'/match-add-group'} className={`flex justify-center items-center w-[116px] h-[19px] bg-[#ff0200]  text-[#fff] rounded-[2px]`} >اضافه کردن </Link>
                   
                      
                                       </div>
                   
                                   </div>
                    </>
                )}
{/* <div className="flex flex-col items-center w-full mt-[10px]">
  <div className="w-full max-w-[350px] bg-white rounded-lg shadow-md overflow-hidden">
    <div className="bg-[#f5f5f5] p-2 text-center text-[9px] text-[#555] border-b">
      محل برگزاری مسابقات
    </div>
    <div className="w-full h-[120px] bg-gray-100 flex items-center justify-center">
      <img
        src="/images/map-placeholder.jpg" // Optional: use a real map screenshot
        alt="موقعیت مسابقات"
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = '<div class="text-[10px] text-gray-500 text-center px-2">ورزشگاه پدل نو، تهران، خیابان ولیعصر</div>';
        }}
      />
    </div>
  </div>
</div> */}
                <div className='flex flex-col justify-center text-[9px] text-[#808080] items-center w-[400px] h-[30px] px-[20px] border-t-[1px] border-[#f6f6f6] '>
                    2026 PaddelNow, All rights reserved
                </div>

            </div>
        </div>
    );
};

export default Match;
