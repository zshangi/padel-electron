import React, { useState, useEffect, useMemo } from 'react';
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
  const [showModal, setShowModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPersianDate, setSelectedPersianDate] = useState('1404/07/15');
  const [selectedReserved, setSelectedReserved] = useState(false);
  const [selectedRequestDate, setSelectedRequestDate] = useState('');
  const [selectedRequestTimes, setSelectedRequestTimes] = useState([]);
  const [selectedModalTime, setSelectedModalTime] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const openModal = (session) => {
    setSelectedSession(session);
    setSelectedModalTime(''); // reset selection
    setShowModal(true);
    setMessageSent(false);
  };

  useEffect(() => {
    const loadUser = async () => {
      const m = await backendMe();
      setMe(m);
    };
    loadUser();
  }, []);

  const handleDateSelect = (date) => {
    const formatted = `${date.year}/${String(date.month).padStart(2, '0')}/${String(date.day).padStart(2, '0')}`;
    setSelectedPersianDate(formatted);
  };

  // Enhanced sample data with more dates and sessions
  const dateToSessions = {
    '1404/09/07': [
      { id: '15-1', image: 'tennis-1.jpg', name: 'آرشام', coach: 'ارسلان', level: '۲', timeSlots: ['۱۱:۰۰-۱۲:۰۰', '۱۷:۰۰-۱۸:۰۰'] },
      { id: '15-2', image: 'tennis-2.jpg', name: 'سارا', coach: 'مریم', level: '۳', timeSlots: ['۹:۰۰-۱۰:۰۰', '۱۴:۰۰-۱۵:۰۰'] }
    ],
    '1404/09/14': [
      { id: '20-1', image: 'tennis-2.jpg', name: 'علی', coach: 'رضا', level: '۱', timeSlots: ['۹:۰۰-۱۰:۰۰', '۱۶:۰۰-۱۷:۰۰'] },
      { id: '20-2', image: 'tennis-3.jpg', name: 'نیما', coach: 'مریم', level: '۴', timeSlots: ['۱۲:۰۰-۱۳:۰۰', '۱۸:۰۰-۱۹:۰۰'] }
    ],
    '1404/08/29': [
      { id: 'def-1', image: 'tennis-1.jpg', name: 'آرش', coach: 'ارسلان', level: '۲', timeSlots: ['۱۱:۰۰-۱۲:۰۰', '۱۷:۰۰-۱۸:۰۰'] },
      { id: 'def-2', image: 'tennis-2.jpg', name: 'آرشام', coach: 'حمید', level: '۳', timeSlots: ['۱۰:۰۰-۱۱:۰۰', '۱۴:۰۰-۱۵:۰۰'] },
      { id: 'def-3', image: 'tennis-3.jpg', name: 'سارا', coach: 'نرگس', level: '۱', timeSlots: ['۹:۰۰-۱۰:۰۰', '۱۶:۰۰-۱۷:۰۰'] }
    ],
    '1404/09/29': [
      { id: 'sep-1', image: 'tennis-1.jpg', name: 'بهار', coach: 'احمد', level: '۲', timeSlots: ['۸:۰۰-۹:۰۰', '۱۵:۰۰-۱۶:۰۰'] },
      { id: 'sep-2', image: 'tennis-2.jpg', name: 'کامران', coach: 'رضا', level: '۳', timeSlots: ['۱۰:۰۰-۱۱:۰۰', '۱۸:۰۰-۱۹:۰۰'] },
      { id: 'sep-3', image: 'tennis-3.jpg', name: 'مریم', coach: 'نرگس', level: '۱', timeSlots: ['۱۱:۰۰-۱۲:۰۰', '۱۶:۰۰-۱۷:۰۰'] }
    ],
    '1404/09/30': [
      { id: 'sep-4', image: 'tennis-1.jpg', name: 'پیمان', coach: 'ارسلان', level: '۴', timeSlots: ['۹:۰۰-۱۰:۰۰', '۱۷:۰۰-۱۸:۰۰'] },
      { id: 'sep-5', image: 'tennis-2.jpg', name: 'سارا', coach: 'مریم', level: '۲', timeSlots: ['۱۱:۰۰-۱۲:۰۰', '۱۴:۰۰-۱۵:۰۰'] },
      { id: 'sep-6', image: 'tennis-3.jpg', name: 'بهنام', coach: 'حمید', level: '۳', timeSlots: ['۸:۰۰-۹:۰۰', '۱۶:۰۰-۱۷:۰۰'] }
    ]
  };

  const sessionsToShow = useMemo(() => {
    if (!selectedPersianDate) return [];
    return dateToSessions[selectedPersianDate] || [];
  }, [selectedPersianDate]);

  const loadMatchData = async () => {
    const matchsRes = await backendAccessGet("api/match/fetch/");
    const levelsRes = await backendAccessGet("api/level/fetch/");
    if ("error_message" in matchsRes || "error_message" in levelsRes) return;

    const matchsList = matchsRes["matchs"] || [];
    const groupedByLevelAndDate = {};

    matchsList.forEach(item => {
      const { level_id, selected_day, data } = item;
      const normalizedDay = selected_day.split('/').map(num => String(Number(num))).join('/');
      if (!groupedByLevelAndDate[level_id]) groupedByLevelAndDate[level_id] = {};
      groupedByLevelAndDate[level_id][normalizedDay] = data; // store match info
    });

    setAvailableDates(groupedByLevelAndDate);
    setLevels(levelsRes["levels"] || []);
  };

  useEffect(() => { loadMatchData(); }, []);

  const closeModal = () => {
    setShowModal(false);
    setSelectedSession(null);
    setMessageSent(false);
  };

  const styles = {
    selectableDay: { backgroundColor: '#d6e5f8', color: '#005cd7', border: '0.18px solid #005cd730' },
    selectableHover: { backgroundColor: '#005cd7', color: '#fff' },
    selectedDay: { backgroundColor: '#005cd7', color: '#fff' },
    reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
  };

  const formatNumber = (num) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(num).replace(/\d/g, d => persianDigits[d] || d);
  };

  const sampleRequestDates = [
    '1404/09/25',
    '1404/09/26',
    '1404/09/27',
    '1404/09/28',
    '1404/09/29',
    '1404/09/30',
  ].map(d => d.split('/').map(n => String(Number(n))).join('/')); // → '1404/8/25'

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour < 22; hour++) {
      const start = `${hour}:00`;
      const end = `${hour + 1}:00`;
      slots.push(`${start}-${end}`);
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots(); // ['6:00-7:00', '7:00-8:00', ..., '21:00-22:00']

  const handleSendMessage = () => {
    if (!selectedModalTime) return alert('لطفاً ساعت را انتخاب کنید');
    setMessageSent(true);
    setTimeout(() => {
      closeModal();
    }, 1500);
  };

  const handleSubmitRequest = () => {
    if (!selectedRequestDate || selectedRequestTimes.length === 0) {
      alert('لطفاً یک تاریخ و حداقل یک ساعت انتخاب کنید.');
      return;
    }
    setRequestSubmitted(true);
    setTimeout(() => {
      setShowRequestModal(false);
      setSelectedRequestDate('');
      setSelectedRequestTimes([]);
      setRequestSubmitted(false);
    }, 1500);
  };

  return (
    <>
      <div className='flex w-[100%] justify-center items-start body-farsi overflow-x-hidden bg-[#fbfbfb] text-[10px]' style={{ direction: 'rtl' }}>
        <div className='flex flex-col w-full space-y-[10px] mt-[20px] max-w-[393px] justify-start items-center px-[20px]'>

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

          {/* Date indicator */}
          <div className="w-full max-w-[350px] bg-white rounded-lg shadow-sm p-3 flex items-center justify-between">
            <span className="text-[11px] font-medium">تاریخ انتخاب شده:</span>
            <span className="text-[11px] font-bold text-[#005CD7]">
              {selectedPersianDate ? selectedPersianDate.split('/').map(formatNumber).join('/') : 'انتخاب نشده'}
            </span>
          </div>

          <div className="flex flex-col space-y-4">
            {sessionsToShow?.length > 0 ? (
              <>
                {/* <div className="text-center text-gray-700 text-sm font-medium">
                  {sessionsToShow.length} همبازی برای این روز موجود است
                </div> */}
                {sessionsToShow.map((session) => (
                  <div key={session.id} className="flex w-[350px] items-center rounded-lg shadow-md h-[100px] p-[20px] bg-white hover:shadow-lg transition-shadow">
                    <div className="w-[100px]">
                      <img src={`/images/${session.image}`} className="w-[62px] h-auto rounded-full object-cover" alt={session.name} />
                    </div>
                    <div className="flex flex-col w-full h-full justify-center space-y-1 px-2 text-[9px]">
                      <span className="font-bold">{session.name}</span>
                      <span>مربی: {session.coach}</span>
                      <span>سطح: {session.level}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {session.timeSlots.map((time, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 rounded text-[10px]">{time}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end w-[100px] h-full items-start">
                      <button onClick={() => openModal(session)} className="w-[56px] h-[15px] bg-[#005CD7] rounded text-white text-[8px] font-medium body-farsi">
                        ارسال پیام
                      </button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center text-gray-500 text-sm mt-10">هیچ همبازی برای این روز موجود نیست</div>
            )}
          </div>

          <div className="flex flex-col space-y-[10px] mt-[10px] justify-center w-full items-center rounded-lg shadow-md h-[120px] bg-white">
            <span className='body-farsi-bold text-[10px]'>همبازی تو پیدا نکردی؟</span>
            <button
              onClick={() => setShowRequestModal(true)}
              className='bg-[#005CD7] text-[10px] w-[150px] body-farsi p-[5px] text-white rounded-[4px]'
            >
              درخواست جدید
            </button>
          </div>

          <div className='flex flex-col justify-center text-[9px] text-[#808080] items-center w-[400px] h-[30px] px-[20px] border-t-[1px] border-[#f6f6f6] '>
            2026 PaddelNow, All rights reserved
          </div>

        </div>
      </div>

      {/* ===== MESSAGE MODAL ===== */}
      {showModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-[300px] p-4 text-[10px] body-farsi" style={{ direction: 'rtl' }}>
            {/* Header */}
            <div className="text-start font-bold mb-3">
              ارسال پیام به {selectedSession.name}
            </div>

            {/* Date & Time in same row */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <label className="block text-[9px] text-gray-600 mb-1">تاریخ</label>
                <div className="w-full p-1 bg-gray-100 rounded text-right text-[10px]">
                  {selectedPersianDate.split('/').map(formatNumber).join('/')}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-[9px] text-gray-600 mb-1">ساعت</label>
                <select
                  value={selectedModalTime}
                  onChange={(e) => setSelectedModalTime(e.target.value)}
                  className="w-full p-[1px] text-[10px] border rounded bg-white"
                >
                  <option value="">انتخاب کنید</option>
                  {selectedSession.timeSlots.map((time, idx) => (
                    <option key={idx} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message Preview - always visible */}
            <div className="mb-4">
              <label className="block text-[9px] text-gray-600 mb-1">پیام پیشنهادی</label>
              <div className="w-full p-3 bg-gray-50 rounded text-right border text-[10px] leading-relaxed min-h-[80px]">
                سلام 👋<br />
                من هم در تاریخ{' '}
                <span className="font-bold">
                  {selectedPersianDate.split('/').map(formatNumber).join('/')}
                </span>{' '}
                از ساعت{' '}
                <span className="font-bold">
                  {selectedModalTime ? selectedModalTime.split('-')[0] : '[ساعت شروع]'}
                </span>{' '}
                تا{' '}
                <span className="font-bold">
                  {selectedModalTime ? selectedModalTime.split('-')[1] : '[ساعت پایان]'}
                </span>{' '}
                وقت دارم. اگر موافق باشید، می‌توانیم در زمین پدل پدلوند همدیگر را ببینیم. در صورت تأیید، زمین را رزرو کنیم.
              </div>
            </div>

            {/* Success message */}
            {messageSent && (
              <div className="bg-green-100 text-green-800 p-2 rounded text-center mb-4">
                پیام با موفقیت ارسال شد!
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-3">
              <button
                onClick={closeModal}
                className="px-4 py-1 text-[9px] text-gray-600 rounded"
              >
                لغو
              </button>
              <button
                onClick={handleSendMessage}
                className={`px-4 py-1 text-[9px] rounded ${
                  selectedModalTime
                    ? 'bg-[#005CD7] text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                ارسال پیام
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال درخواست همبازی جدید ===== */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-10">
          <div className="bg-white rounded-lg w-full max-w-[300px] p-4 text-[10px] body-farsi max-h-[85vh] overflow-y-auto"
            style={{ direction: 'rtl' }}>
            <div className="text-center font-bold mb-3">درخواست همبازی جدید</div>

            {/* Dropdown تاریخ */}
            <div className="mb-3">
              <label className="block text-[9px] text-gray-600 mb-1">تاریخ</label>
              <select
                value={selectedRequestDate}
                onChange={(e) => setSelectedRequestDate(e.target.value)}
                className="w-full p-1 text-[10px] border rounded bg-white text-right"
              >
                <option value="">تاریخ را انتخاب کنید</option>
                {sampleRequestDates.map((date) => (
                  <option key={date} value={date}>
                    {date.split('/').map(formatNumber).join('/')}
                  </option>
                ))}
              </select>
            </div>

            {/* تایم‌ها — همیشه نمایش داده می‌شود، اما غیرفعال تا زمانی که تاریخ انتخاب نشود */}
            <div className="mb-2 text-[9px] text-gray-600">ساعت‌های مورد نظر را انتخاب کنید:</div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {allTimeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  disabled={!selectedRequestDate} // غیرفعال تا انتخاب تاریخ
                  onClick={() => {
                    if (!selectedRequestDate) return;
                    setSelectedRequestTimes(prev =>
                      prev.includes(time)
                        ? prev.filter(t => t !== time)
                        : [...prev, time]
                    );
                  }}
                  className={`px-1.5 py-1.5 text-[9px] rounded text-center whitespace-nowrap ${
                    selectedRequestTimes.includes(time)
                      ? 'bg-[#005CD7] text-white'
                      : selectedRequestDate
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {time.replace(/-/g, '–')}
                </button>
              ))}
            </div>

            {/* پیش‌نمایش (اختیاری ولی کاربردی) */}
            {selectedRequestDate && selectedRequestTimes.length > 0 && (
              <div className="p-2 bg-blue-50 rounded mb-3 text-[10px]">
                <div className="font-medium">درخواست شما:</div>
                <div>تاریخ: {selectedRequestDate.split('/').map(formatNumber).join('/')}</div>
                <div>ساعت‌ها: {selectedRequestTimes.join(', ')}</div>
              </div>
            )}

            {/* Success message */}
            {requestSubmitted && (
              <div className="bg-green-100 text-green-800 p-2 rounded text-center mb-3">
                درخواست همبازی شما با موفقیت ثبت شد!
              </div>
            )}

            {/* دکمه‌ها */}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedRequestDate('');
                  setSelectedRequestTimes([]);
                  setRequestSubmitted(false);
                }}
                className="px-4 py-1.5 text-[9px] text-gray-600 rounded"
              >
                لغو
              </button>
              <button
                onClick={handleSubmitRequest}
                className="px-4 py-1.5 bg-[#005CD7] text-white text-[9px] rounded"
              >
                ثبت درخواست
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Match;