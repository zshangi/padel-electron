import { useState, useEffect } from 'react';
import { backendAccessPost, backendAccessGet } from '../../../utils/Authentication';
import { PiTrashLight } from "react-icons/pi";
import { AiOutlinePlus } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { SlRefresh } from 'react-icons/sl';
import { formatNumber, formatPersianTimeSlot, formatJalaliDateString } from '../../../utils/numberUtils';
import AdminReservationModal from '../../components/Add-reservation-modal';
import { Link } from 'react-router-dom';
import DropDown from '../../components/DropDown'

const persianMonths = [
    {
        value: '1',
        label: 'فروردین'
    },
    {
        value: '2',
        label: 'اردیبهشت'
    },
    {
        value: '3',
        label: 'خرداد'
    },
    {
        value: '4',
        label: 'تیر'
    },
    {
        value: '5',
        label: 'مرداد'
    },
    {
        value: '6',
        label: 'شهریور'
    },
    {
        value: '7',
        label: 'مهر'
    },
    {
        value: '8',
        label: 'آبان'
    },
    {
        value: '9',
        label: 'آذر'
    },
    {
        value: '10',
        label: 'دی'
    },
    {
        value: '11',
        label: 'بهمن'
    },
    {
        value: '12',
        label: 'اسفند'
    }
]

const ReservationDay = () => {
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [showSettled, setShowSettled] = useState(false);
    const [showNotSettled, setShowNotSettled] = useState(false);
    const [month, setMonth] = useState();

    const [showConfirm, setShowConfirm] = useState(false);
    const [showPackage, setShowPackage] = useState(false);

    const [wantsCoach, setWantsCoach] = useState(false)
    const [mainListPage, setMainListPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState();
    const [selectedTime, SetSelectedTime] = useState();
    const [reservations, setReservations] = useState([]);
    const [members, setMembers] = useState([]);
    const [courts, setCourts] = useState([]);
    const itemsPerPage = 12;
    useEffect(() => {
        setMainListPage(1);
    }, [selectedDate, showSettled, showNotSettled, reservations]);


    const [category, setCategory] = useState([])
    const [subcategory, setSubcategory] = useState([])
    const [categorycontent, setCategorycontent] = useState([])
    const [loading, setLoading] = useState(true);
    const [couches, setCouches] = useState([]);
    const [settingdata, setSettingdata] = useState([]);

    const styles = {
        selectableDay: { backgroundColor: 'rgb(185, 237, 0, 0.2)', color: '#788f2a', border: '0.1px solid #B9ED0070 ' },
        selectableHover: { backgroundColor: '#b9ed00', color: '#fff' },
        selectedDay: { backgroundColor: '#b9ed00', color: '#fff' },
        reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
    };

    useEffect(() => {

        backendAccessGet("api/court/fetch-all/").then(res => {
            try {
                setReservations(res.reserved || [])
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

    const filterReservations = () => {
        let filtered = reservations

        if (showSettled || showNotSettled) {
            filtered = filtered.filter(res => {
                const payable = res.data?.payable || 0;
                const paid = res.data?.paid || 0;

                if (showSettled && showNotSettled) return true;
                if (showSettled) return paid >= payable;
                if (showNotSettled) return paid < payable;

                return true;
            });
        }
        if (month) {
            filtered = filtered.filter(res => res.selected_day.split('/')[1] === month)

        }
        if (showConfirm || showPackage) {
            filtered = filtered.filter(res => {
                const cinfirmdata = res.status === 'confirm';
                const packagedata = res.status === 'offerPackage';

                if (showConfirm && showPackage) return true;
                if (showConfirm) return cinfirmdata;
                if (showPackage) return packagedata;

                return true;
            });
        }


        return filtered;
    };


    const finalFilteredReservations = filterReservations();
    const totalPages = Math.ceil(finalFilteredReservations.length / itemsPerPage);
    const startIndex = (mainListPage - 1) * itemsPerPage;
    const paginatedReservations = finalFilteredReservations.slice(startIndex, startIndex + itemsPerPage);


    const handleEditReservation = (reservation) => {
        setEditingReservation(reservation);
        setIsEditMode(true);
        setIsReservationModalOpen(true);
    };

    const handleAddReservation = () => {
        setEditingReservation(null);
        setIsEditMode(false);
        setIsReservationModalOpen(true);
    };

    const handleDeleteReservation = async (reservationId) => {
        if (!window.confirm("آیا مطمئن هستید که می‌خواهید این رزرو را حذف کنید؟")) return;

        backendAccessPost("api/reserved/remove/", {
            selected_day: selectedDate,
            status: 'confirm',
            id: reservationId
        }, { 'Content-Type': 'application/json' })
            .then(res => {
                try {
                    setReservations(res.reserved || []);
                } catch (error) {
                    console.error('Error fetching reservations:', error);

                } finally {
                    console.log('Done')
                }
            });
    };

    const handleDeleteFilter = () => {
        setMonth('')
        setShowNotSettled(false)
        setShowSettled(false)
        setShowConfirm(false)
        setShowPackage(false)

    }





    return (
        <>
            <div className="flex flex-col w-[100%] space-y-[2px] rounded-[14px] border-[0.3px] text-[#808080] border-[#9C9C9C90]">
                <div className=' w-full justify-start items-center border-b-[0.3px] border-[#9C9C9C90] space-x-[20px] space-x-reverse p-4'>
                    <div className='flex w-[100%] space-x-[15px] space-x-reverse float-start'>
                        <DropDown
                            field={month}
                            setField={setMonth}
                            list={persianMonths
                                .map(r => ({ value: r.value, label: r.label }))}
                            width={120}
                            labelPosition={'inside'}
                        />



                        <div className="flex items-center space-x-[15px] space-x-reverse relative">

                            <label className="flex items-center text-xs"><input type="checkbox" checked={showSettled} onChange={(e) => setShowSettled(e.target.checked)} className="ml-1" />تسویه شده</label>
                            <label className="flex items-center text-xs"><input type="checkbox" checked={showNotSettled} onChange={(e) => setShowNotSettled(e.target.checked)} className="ml-1" />تسویه نشده</label>

                        </div>


                        <div className="flex items-center space-x-[15px] space-x-reverse relative">
                            <label className="flex items-center text-xs"><input type="checkbox" checked={showConfirm} onChange={(e) => setShowConfirm(e.target.checked)} className="ml-1" />رزرونهایی </label>
                            <label className="flex items-center text-xs"><input type="checkbox" checked={showPackage} onChange={(e) => setShowPackage(e.target.checked)} className="ml-1" /> پکیج </label>

                        </div>
                        <button onClick={handleDeleteFilter}><SlRefresh/></button>
                    </div>
                </div>

                <div className='flex w-full items-center h-[54px] text-[12px] text-[#7F7F7F]'>
                    <div className='flex justify-center w-[250px]'>نام و نام خانوادگی</div>
                    <div className='flex justify-center w-[150px]'>تاریخ</div>
                    <div className='flex justify-center w-[150px]'>سانس</div>

                    <div className='flex justify-center w-[150px]'>زمین</div>
                    <div className='flex justify-center w-[150px]'>مربی</div>

                    <div className='flex justify-center w-[150px]'>قابل دریافت</div>
                    <div className='flex justify-center w-[150px]'>دریافت شده</div>
                    <div className='flex justify-center w-[150px]'>مانده</div>
                    <div className='flex justify-center w-[120px]'>
                        <button onClick={handleAddReservation} className='flex justify-center items-center space-x-2 space-x-reverse  p-[1px] body-farsi-bold text-[#005CD7]'>
                            <AiOutlinePlus /><span> اضافه کردن </span>
                        </button>
                    </div>
                </div>

                {paginatedReservations.map((reservation) => {
                    const member = members.find(m => m.id === reservation.user_id);
                    const court = courts.find(c => c.id === reservation.court_id);
                    const couch = couches.find(c => c.id === reservation.couch_id);

                    return (
                        <div key={reservation.id} className='flex w-full items-center h-[54px] text-[12px] bg-white'>
                            <div className='flex justify-center w-[250px]'>{member?.name || reservation.data.packagesName}</div>
                            <div className='flex justify-center w-[150px]'>{formatJalaliDateString(reservation.selected_day)}</div>
                            <div className='flex justify-center w-[150px]'>{formatPersianTimeSlot(reservation.selected_time)}</div>

                            <div className='flex justify-center w-[150px]'>{court?.name || 'زمین نامشخص'}</div>
                            <div className='flex justify-center w-[150px]'>{couch?.name || ' بدون مربی'}</div>

                            <div className='flex justify-center w-[150px]'>{formatNumber(reservation.data?.payable || 0)}</div>
                            <div className='flex justify-center w-[150px]'>{formatNumber(reservation.data?.paid || 0)}</div>
                            <div className='flex justify-center w-[150px]'>{formatNumber((reservation.data?.payable || 0) - (reservation.data?.paid || 0))}</div>
                            <div className='flex justify-center w-[120px] space-x-2 space-x-reverse'>
                                <FiEdit2 className='cursor-pointer text-[#005CD790]' onClick={() => handleEditReservation(reservation)} />
                                <PiTrashLight className='cursor-pointer text-[#005CD7]' onClick={() => handleDeleteReservation(reservation.id)} />
                            </div>
                        </div>
                    );
                })}

                <div className='flex w-full justify-center p-4 items-center'>


                    {totalPages > 1 && (
                        <div className='flex justify-center items-center space-x-4 text-sm'>
                            <button onClick={() => setMainListPage(p => Math.max(1, p - 1))} disabled={mainListPage === 1} className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                                قبلی
                            </button>
                            <span>
                                صفحه {formatNumber(mainListPage)} از {formatNumber(totalPages)}
                            </span>
                            <button onClick={() => setMainListPage(p => Math.min(totalPages, p + 1))} disabled={mainListPage === totalPages} className="px-3 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed">
                                بعدی
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isReservationModalOpen &&

                <AdminReservationModal
                    isOpen={isReservationModalOpen}
                    onClose={() => setIsReservationModalOpen(false)}
                    courts={courts}
                    couches={couches}
                    members={members}
                    category={category}
                    wantsCoach={wantsCoach}
                    setWantsCoach={setWantsCoach}
                    subcategory={subcategory}
                    categorycontent={categorycontent}
                    reservations={reservations}
                    setReservations={setReservations}
                    isEditMode={isEditMode}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    editingReservation={isEditMode ? editingReservation : null}
                    styles={styles}
                    isPackage={false}

                />
            }


        </>
    );
};

export default ReservationDay;
