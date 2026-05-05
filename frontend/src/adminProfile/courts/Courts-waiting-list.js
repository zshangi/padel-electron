import { useState, useEffect } from 'react';
import { PiTrashLight } from "react-icons/pi";
import { formatNumber, formatPersianTimeSlot, formatJalaliDateString } from '../../utils/numberUtils';
import { backendAccessGet, backendAccessPost } from '../../utils/Authentication'
import DropDown from '../components/DropDown';

const CourtsAdmin = () => {

    const [reservations, setReservations] = useState([]);
    const [filteredReservations, setFilteredReservations] = useState([]);
    const [selectedDate, setSelectedDate] = useState();
    const [selectedTime, SetSelectedTime] = useState();
    const [message, setMessage] = useState();
    const [members, setMembers] = useState([]);
    const [courts, setCourts] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    const fetchWaitingListByStatus = () => {
        return backendAccessPost("api/reserved/fetch-status/", {
            status: 'waitingList'
        })
            .then(res => {
                setReservations(res.reserved || []);
            })
            .catch(error => {
                console.error('Error fetching reservations:', error);
                setReservations([]);
            });
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
        fetchWaitingListByStatus();
    }, []);

    useEffect(() => {
        const uniqueDates = Array.from(new Set(reservations.map(r => r.selected_day)));
        setAvailableDates(uniqueDates);
        if (!selectedDate || !uniqueDates.includes(selectedDate)) {
            setSelectedDate(uniqueDates[0]);
        }
    }, [reservations]);

    useEffect(() => {
        if (!selectedDate) {
            setAvailableTimes([]);
            return;
        }
        const uniqueTimes = Array.from(new Set(
            reservations
                .filter(r => r.selected_day == selectedDate)
                .map(r => r.selected_time)
        ));
        setAvailableTimes(uniqueTimes);
        if (!selectedTime || !uniqueTimes.includes(selectedTime)) {
            SetSelectedTime(uniqueTimes[0]);
        }
    }, [reservations, selectedDate]);

    const handleSearch = async () => {
        if (!selectedDate || !selectedTime) {
            alert('لطفا تاریخ و ساعت را انتخاب کنید');
            return;
        }

        try {
            const res = await backendAccessPost("api/reserved/fetch-selected-day-time-status/", {
            selected_day: selectedDate,
            selected_time: selectedTime,
            status: 'waitingList'
            });

            const targetReservations = res?.reserved || [];
            if (!targetReservations.length) {
                setFilteredReservations([]);
                setSelectedUserIds([]);
                alert('برای این تاریخ و ساعت، کاربری در لیست انتظار یافت نشد');
                return;
            }

            setFilteredReservations(targetReservations);
            setSelectedUserIds([]);
        } catch (error) {
            console.error('Error handling waiting-list confirm:', error);
            alert('دریافت لیست ناموفق بود');
        }
    }

    const toggleUserSelection = (userId) => {
        setSelectedUserIds(prev => (
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        ));
    };

    const handleSelectAll = () => {
        const allUserIds = Array.from(
            new Set(filteredReservations.map(item => Number(item.user_id)).filter(Boolean))
        );
        setSelectedUserIds(prev => (
            prev.length === allUserIds.length ? [] : allUserIds
        ));
    };

    const handleSendSelectedSms = async () => {
        if (!selectedUserIds.length) {
            alert('حداقل یک کاربر را انتخاب کنید');
            return;
        }

        try {
            await Promise.all(
                selectedUserIds.map((userId) =>
                    backendAccessPost("api/reserved/send-sms-waiting-list/", { id: userId })
                )
            );

            alert('پیام با موفقیت ارسال شد');
            setMessage('');
            setFilteredReservations([]);
            setSelectedUserIds([]);
            await fetchWaitingListByStatus();
        } catch (error) {
            console.error('Error sending selected SMS:', error);
            alert('ارسال پیام ناموفق بود');
        }
    };

    const allFilteredUserIds = Array.from(
        new Set(filteredReservations.map(item => Number(item.user_id)).filter(Boolean))
    );
    const isAllSelected = allFilteredUserIds.length > 0 && selectedUserIds.length === allFilteredUserIds.length;

    return (
        <>
            <div className="flex flex-col w-full space-y-[15px]">
                <div className='flex'>
                    <div className='w-[calc(100%-125px)]'>
                        < textarea
                            type=" a"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            
                            style={{ width: '100%', height: '90px', padding: '10px' }}
                            required
                            className={` flex items-center rounded-[4px] border-[1px]  text-[10px]
                                                              `}

                        />
                    </div>
                    <div className='flex flex-col space-y-[5px] items-center justify-center w-[125px] '>
                        <DropDown
                            field={selectedDate}
                            setField={setSelectedDate}
                            list={availableDates
                                .map(d => ({ value: d, label: formatJalaliDateString(d) }))}
                            width={120}
                            labelPosition={'inside'}
                        />
                        <DropDown
                            field={selectedTime}
                            setField={SetSelectedTime}
                            list={availableTimes
                                .map(t => ({ value: t, label: formatPersianTimeSlot(t) }))}
                            width={120}
                            labelPosition={'inside'}

                        />
                        <button onClick={handleSearch} className='w-[120px] bg-[#000] text-[#fff] mr-[8px] rounded-[4px] text-[10px] h-[25px]'>تایید</button>
                    </div>

                </div>

                <div className="flex flex-col w-[100%] space-y-[2px] rounded-[14px] border border-1 border-[#cfcece90] text-[#808080] ">

                    <div className='flex w-full items-center justify-center h-[50px] bg-[#f6f6f6]  border-b border-[#cfcece90] rounded-t-[14px] body-farsi-bold text-[12px] text-[#7F7F7F]'>

                        {formatJalaliDateString(selectedDate)}
                    </div>
                    <div className='flex w-full items-center h-[40px] body-farsi-bold text-[12px] bg-[#f6f6f6]  text-[#7F7F7F]'>
                        <div className='flex justify-center w-[80px]'>انتخاب</div>
                        <div className='flex justify-center w-[250px]'>نام و نام خانوادگی</div>
                        <div className='flex justify-center w-[100px]'>تلفن همراه</div>
                        <div className='flex justify-center w-[100px]'>زمین</div>
                        <div className='flex justify-center w-[150px]'>تاریخ</div>
                        <div className='flex justify-center w-[100px]'>زمان</div>
                        <div className='flex justify-center w-[calc(100%-780px)]'></div>
                    </div>

                    {filteredReservations.map((reservation) => {
                        const member = members.find(m => m.id === reservation.user_id);
                        const court = courts.find(c => c.id === reservation.court_id);
                        const userId = Number(member?.id);
                        const checked = selectedUserIds.includes(userId);

                        return (
                            <div key={reservation.id} className='flex w-full items-center h-[50px] text-[12px] border-b bg-white'>
                                <div className='flex justify-center w-[80px]'>
                                    <input
                                        type='checkbox'
                                        checked={checked}
                                        onChange={() => toggleUserSelection(userId)}
                                        disabled={!userId}
                                    />
                                </div>
                                <div className='flex justify-center w-[250px]'>{member?.name || 'نامشخص'}</div>
                                <div className='flex justify-center w-[100px]'>{formatNumber(member?.mobile) || 'نامشخص'}</div>
                                <div className='flex justify-center w-[100px]'>{court?.name || 'نامشخص'}</div>
                                <div className='flex justify-center w-[150px]'>{formatJalaliDateString(reservation.selected_day)}</div>
                                <div className='flex justify-center w-[100px]'>{formatPersianTimeSlot(reservation.selected_time)}</div>
                                <div className='flex justify-center items-center  w-[calc(100%-780px)] space-x-[15px] space-x-reverse'>
                                    <PiTrashLight className='cursor-pointer text-[#005CD7]' />

                                </div>

                            </div>
                        );
                    })}


                    <div className='flex w-full justify-between p-4 h-[50px] bg-[#f6f6f6] rounded-b-[16px] items-center'>
                        <div className='text-[11px] text-[#7F7F7F]'>
                            {filteredReservations.length ? `${selectedUserIds.length} نفر انتخاب شده‌اند` : 'ابتدا تاریخ و ساعت را انتخاب و تایید کنید'}
                        </div>
                        <div className='flex space-x-[8px] space-x-reverse'>
                            <button
                                type='button'
                                onClick={handleSelectAll}
                                disabled={!filteredReservations.length}
                                className='w-[120px] bg-[#005CD7] disabled:bg-[#9db9e4] text-[#fff] rounded-[4px] text-[10px] h-[25px]'
                            >
                                {isAllSelected ? 'لغو انتخاب همه' : 'انتخاب همه'}
                            </button>
                            <button
                                type='button'
                                onClick={handleSendSelectedSms}
                                disabled={!selectedUserIds.length}
                                className='w-[120px] bg-[#000] disabled:bg-[#999] text-[#fff] rounded-[4px] text-[10px] h-[25px]'
                            >
                                ارسال به منتخب‌ها
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default CourtsAdmin
