import { formatNumber,formatJalaliDateString, formatGregorianToJalaliDateTime } from '../../../utils/numberUtils';
import { useState, useEffect } from 'react';
import Box from '../../../components/Box';
import DropDown from '../../components/DropDown';
import Input from '../../components/Input';
import { backendAccessPost, backendAccessGet } from '../../../utils/Authentication';
import { PiTrashLight } from "react-icons/pi";
import { AiOutlinePlus } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر',
  'مرداد', 'شهریور', 'مهر', 'آبان',
  'آذر', 'دی', 'بهمن', 'اسفند'
];

const ReservationDay = ({ reservations, setReservations, members }) => {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  const [showSettled, setShowSettled] = useState(false);
  const [showNotSettled, setShowNotSettled] = useState(false);


  console.log(reservations)



  return (
    <>
      <div className="flex flex-col w-[1071px] space-y-[2px] rounded-[14px] border-[0.3px] border-[#9C9C9C]">
        {/* Header with filters and date */}
        <div className='w-full border-b-[0.3px] border-[#9C9C9C]'>
          <div className="flex w-[300px] float-start items-center justify-start p-4 space-x-[15px] space-x-reverse">
            <label className="flex items-center text-[12px] text-[#7F7F7F]">
              <input
                type="checkbox"
                checked={showSettled}
                onChange={(e) => setShowSettled(e.target.checked)}
                className="ml-[4px]"
              />
              تسویه شده
            </label>
            <label className="flex items-center text-[12px] text-[#7F7F7F]">
              <input
                type="checkbox"
                checked={showNotSettled}
                onChange={(e) => setShowNotSettled(e.target.checked)}
                className="ml-[4px]"
              />
              تسویه نشده
            </label>
          </div>

          <div className='flex w-[calc(100%-600px)] items-center h-[54px] text-[12px] text-[#7F7F7F]'>

          </div>
          <div className='w-[300px] float-end'></div>
        </div>

        {/* Table header */}
        <div className='flex w-full items-center h-[54px] bg-[#fff] text-[12px] text-[#7F7F7F]'>

          <div className='flex justify-center w-[300px]'>بازیکن</div>
          <div className='flex justify-center w-[150px]'>تاریخ</div>

          <div className='flex justify-center w-[150px]'>زمان</div>
          <div className='flex justify-center w-[100px]'>قابل دریافت</div>
          <div className='flex justify-center w-[100px]'>دریافت شده</div>
          <div className='flex justify-center w-[100px]'>مانده</div>
          <div className='flex justify-center w-[calc(100%-900px)]'></div>
        </div>

        {/* Reservation rows */}
        {reservations?.map((reservation, index) => {
          const member = members.find(m => m.id === reservation.user_id);
const lastRow = index === reservations.length -1
          const memberName = member?.fullname || member?.name || 'نامشخص';

          return (
            <div key={index} className={`flex w-full items-center h-[54px] bg-[#fff] text-[12px]
            ${lastRow ? 'rounded-b-[14px]' : null}
            text-[#7F7F7F]`}>
              <div className='flex justify-center w-[300px]'>{ memberName}</div>
              <div className='flex justify-center w-[150px]'>

              {formatJalaliDateString(reservation.selected_day)} 

              </div>

              <div className='flex justify-center w-[150px]'>{reservation.selected_time}</div>
            
              <div className='flex justify-center w-[100px]'>{formatNumber(reservation.data?.payable || 0)}</div>
              <div className='flex justify-center w-[100px]'>{formatNumber(reservation.data?.paid || 0)}</div>
              <div className='flex justify-center w-[100px]'>
                {formatNumber((reservation.data?.payable || 0) - (reservation.data?.paid || 0))}
              </div>
              <div className='flex justify-end  w-[calc(100%-900px)] px-[20px] space-x-2 space-x-reverse'>
                <FiEdit2 color={'#777777'} />
                <PiTrashLight color={'#FF6F00'} />
              </div>
            </div>
          );
        })}


      </div>


    </>
  );
};

export default ReservationDay;