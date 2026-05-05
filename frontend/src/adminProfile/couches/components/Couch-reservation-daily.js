import { useState, useEffect } from 'react';
import { backendAccessPost, backendAccessGet } from '../../../utils/Authentication';
import { PiTrashLight } from "react-icons/pi";
import { AiOutlinePlus } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { formatNumber, formatPersianTimeSlot, formatJalaliDateString } from '../../../utils/numberUtils';
import AdminReservationModal from '../../components/Add-reservation-modal';
import { Link } from 'react-router-dom';

const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر',
    'مرداد', 'شهریور', 'مهر', 'آبان',
    'آذر', 'دی', 'بهمن', 'اسفند'
];





const ReservationDay = ({ allReservations,setAllReservations,reservations, setReservations, courts, couches, members, selectedDate, setSelectedDate, category, subcategory, categorycontent, styles }) => {
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [showSettled, setShowSettled] = useState(false);
    const [showNotSettled, setShowNotSettled] = useState(false);
    const [wantsCoach, setWantsCoach] = useState(true)
    const [mainListPage, setMainListPage] = useState(1);
    const itemsPerPage = 5;
    useEffect(() => {
        setMainListPage(1);
    }, [selectedDate, showSettled, showNotSettled, reservations]);

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
  
    const handleGetAllReservations = () => {
        backendAccessGet("api/reserved/fetch-with-couch/").then(res => {
            try {
                setReservations(res.reserved || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setReservations([]);
            }
        });
    };




    return (
        <>
            <div className="flex flex-col w-[1071px] space-y-[2px] rounded-[14px] border-[0.3px] text-[#808080] border-[#9C9C9C]">
                <div className='flex w-full justify-between items-center border-b-[0.3px] border-[#9C9C9C] p-4'>
                    <div className="flex items-center space-x-[15px] space-x-reverse relative">
                        {/* <Link to={'/admin-courts-waiting-list'} className='flex  space-x-2 w-[80px] h-[25px]  text-[9px] space-x-reverse bg-[#005CD7] text-white justify-center items-center rounded-[2px] shadow-md'>
                            <span>لیست انتظار</span>
                        </Link> */}
                        <label className="flex items-center text-xs"><input type="checkbox" checked={showSettled} onChange={(e) => setShowSettled(e.target.checked)} className="ml-1" />تسویه شده</label>
                        <label className="flex items-center text-xs"><input type="checkbox" checked={showNotSettled} onChange={(e) => setShowNotSettled(e.target.checked)} className="ml-1" />تسویه نشده</label>
                    </div>
                    <div className='text-center   text-sm'>
                        {formatJalaliDateString(selectedDate)}
                    </div>
                    <div className='w-[300px] flex justify-end'>
                        <button onClick={handleGetAllReservations} className="text-xs">نمایش همه رزروها</button>
                    </div>
                </div>

                <div className='flex w-full items-center h-[54px] bg-[#fff] text-[12px] text-[#7F7F7F]'>
                    <div className='flex justify-center w-[200px]'>مربی</div>
                    <div className='flex justify-center w-[200px]'>بازیکن</div>
                    <div className='flex justify-center w-[150px]'>زمین</div>
                    <div className='flex justify-center w-[150px]'>زمان</div>

                    <div className='flex justify-center w-[150px]'>قابل دریافت</div>
                    <div className='flex justify-center w-[150px]'>دریافت شده</div>
                    <div className='flex justify-center w-[150px]'>مانده</div>
                    <div className='flex justify-center w-[100px]'></div>
                </div>

                {paginatedReservations.map((reservation) => {
                    const member = members.find(m => m.id === reservation.user_id);
                    const court = courts.find(c => c.id === reservation.court_id);
                    const couch = couches.find(c => c.id === reservation.couch_id);

                    return (
                        <div key={reservation.id} className='flex w-full items-center h-[54px] text-[12px] bg-white'>
                            <div className='flex justify-center w-[200px]'>{couch?.name || 'نامشخص'}</div>
                            <div className='flex justify-center w-[200px]'>{member?.name || 'نامشخص'}</div>
                            <div className='flex justify-center w-[150px]'>{court?.name || 'زمین نامشخص'}</div>

                            <div className='flex justify-center w-[150px]'>{formatPersianTimeSlot(reservation.selected_time)}</div>
                            <div className='flex justify-center w-[150px]'>{formatNumber(reservation.data?.payable || 0)}</div>
                            <div className='flex justify-center w-[150px]'>{formatNumber(reservation.data?.paid || 0)}</div>
                            <div className='flex justify-center w-[150px]'>{formatNumber((reservation.data?.payable || 0) - (reservation.data?.paid || 0))}</div>
                            <div className='flex justify-center w-[100px] space-x-2 space-x-reverse'>
                                <FiEdit2 className='cursor-pointer text-gray-500' onClick={() => handleEditReservation(reservation)} />
                                <PiTrashLight className='cursor-pointer text-red-500' onClick={() => handleDeleteReservation(reservation.id)} />
                            </div>
                        </div>
                    );
                })}

                <div className='flex w-full justify-between p-4 items-center'>
                    <button onClick={handleAddReservation} className='flex justify-center items-center space-x-2 space-x-reverse text-[#005CD7]'>
                        <AiOutlinePlus /><span> اضافه کردن </span>
                    </button>

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
