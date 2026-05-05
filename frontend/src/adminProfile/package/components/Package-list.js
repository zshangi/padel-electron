

import { useState, useEffect } from 'react';
import { backendAccessPost, backendAccessGet } from '../../../utils/Authentication';
import { PiTrashLight } from "react-icons/pi";
import { AiOutlinePlus } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { formatNumber, formatPersianTimeSlot } from '../../../utils/numberUtils';
import AdminReservationModal from '../../components/Add-reservation-modal';
import { Link } from 'react-router-dom';
import Box from '../../components/Box'

const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر',
    'مرداد', 'شهریور', 'مهر', 'آبان',
    'آذر', 'دی', 'بهمن', 'اسفند'
];





const ReservationDay = ({ reservations, setReservations, courts, couches, members, selectedDate, setSelectedDate, category, subcategory, categorycontent, styles }) => {
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingReservation, setEditingReservation] = useState(null);
    const [showSettled, setShowSettled] = useState(false);
    const [showNotSettled, setShowNotSettled] = useState(false);
    const [isWaitingListOpen, setIsWaitingListOpen] = useState(false);
    const [wantsCoach, setWantsCoach] = useState(false)
    const [isPackage, setIsPackage] = useState(true)

    const [mainListPage, setMainListPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setMainListPage(1);
    }, [selectedDate, showSettled, showNotSettled]);





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

    const handleDeleteReservation = async (package_id) => {
        if (!window.confirm("آیا مطمئن هستید که می‌خواهید این رزرو را حذف کنید؟")) return;

        backendAccessPost('/api/reserved/remove-with-package-id/', { package_id: package_id }, { 'Content-Type': 'application/json' }).then(res => {
            try {
                setReservations(res.reserved || []);
                alert("رزرو با موفقیت حذف شد.");

            } catch (error) {
                console.error('Error fetching data:', error);
                setReservations([]);
            }
        })


    };

    const groupByPackage = (reservations) => {
        const map = {};

        reservations
            .filter(r => r.package_id)
            .forEach(res => {

                const pid = res.package_id;

                if (!map[pid]) {
                    map[pid] = {
                        package_id: pid,
                        reservations: [],
                        payable: 0,
                        paid: 0,
                        packagesName: res?.data?.packagesName || "-"
                    };
                }

                map[pid].reservations.push(res);

                map[pid].payable += Number(res?.data?.payable || 0);
                map[pid].paid += Number(res?.data?.paid || 0);
            });

        return Object.values(map);
    };

    const groupedPackages = groupByPackage(reservations);
    const totalPages = Math.ceil(groupedPackages.length / itemsPerPage);
    const startIndex = (mainListPage - 1) * itemsPerPage;
    const paginatedPackages = groupedPackages.slice(startIndex, startIndex + itemsPerPage);
    return (
        <>
                {/* <div className='flex w-full justify-end items-center h-[50px]  p-4'>
      <button onClick={handleAddReservation} className='flex justify-center items-center space-x-2 space-x-reverse text-[#005CD7]'>
                        <AiOutlinePlus /><span> اضافه کردن </span>
                    </button>


                </div> */}

<div className='flex w-full'>
                <div className='flex space-x-[8px] space-x-reverse w-full overflow-x-auto  pb-[10px]'>

                    {groupedPackages.map(pkg => {
                        const sessionCount = pkg.reservations.length;

                        const datesWithTime = pkg.reservations
                            .map(r => {
                                if (!r.selected_day) return null;

                                const [year, month, day] = r.selected_day.split("/").map(Number);
                                const formattedDate = `${formatNumber(day)} ${persianMonths[month - 1]} ${formatNumber(year)}`;
                                const time = r.selected_time ? `(${formatPersianTimeSlot(r.selected_time)})` : '';
                                return (
                                    <div className='flex flex-col '>
                                 <span> {formattedDate} {time} </span> 
                                    </div>
                                );
                                
                            })
                            // .filter(Boolean)
                            // .sort((a, b) => {
                            //     // Optional: sort by the original date
                            //     const getTime = str => {
                            //         const match = str.match(/(\d+) (\S+) (\d+)/); // day month year
                            //         if (!match) return 0;
                            //         const day = parseInt(match[1]);
                            //         const month = persianMonths.indexOf(match[2]) + 1;
                            //         const year = parseInt(match[3]);
                            //         return year * 10000 + month * 100 + day;
                            //     };
                            //     return getTime(a) - getTime(b);
                            // })
                            // .join(" | ");
                            
                            


                        return (
                                <Box width={250} height={300}>

                            <div key={pkg.package_id} className="flex flex-col w-full p-[20px] items-start h-[300px] text-[12px] ">

                                <div className='flex justify-start w-full text-[#4951FF] body-farsi-bold h-[40px]'>
                                    {pkg.reservations[0].data?.packagesName || "-"}
                                </div>

                                <div className='flex justify-start w-full space-x-[5px] space-x-reverse h-[30px]'>
                                    <span className='body-farsi-bold'>تعداد جلسات:</span>
                                    <span> {formatNumber(sessionCount)}</span>
                                    <span className='body-farsi-bold'>جلسه</span>
                                </div>

                                <div className='flex flex-col space-y-[15px] justify-start  w-full truncate h-[150px] '>
                                    {datesWithTime}

                                </div>

                                <div className='flex justify-end space-x-[5px] space-x-reverse w-[100%] h-[40px]'>
                                    <span className='body-farsi-bold'>
                                        قیمت پکیج:</span>
                                   <span>{formatNumber(pkg.payable)}</span> 
                                    <span>تومان</span>
                                </div>

                                <div className='flex justify-end items-end w-full space-x-2 space-x-reverse  h-[20px]'>
                                    <FiEdit2 color={'#4951FF80'} onClick={() => handleEditReservation(pkg.reservations[0])} />
                                    <PiTrashLight color={'#4951FF'} onClick={() => handleDeleteReservation(pkg.reservations[0].package_id)} />
                                </div>
                            </div>
                            </Box>
                        );
                    })}

                </div>
</div>
                <div className='flex w-full justify-between p-4 items-center'>
              

                </div>
        

            {isReservationModalOpen &&
                <AdminReservationModal {...{
                    isOpen: isReservationModalOpen,
                    onClose: () => setIsReservationModalOpen(false),
                    courts, couches, members, category, subcategory, categorycontent,
                    reservations, setReservations, isEditMode, selectedDate,
                    setSelectedDate, editingReservation, styles, wantsCoach, setWantsCoach, isPackage
                }} />}
        </>
    );
};

export default ReservationDay;
