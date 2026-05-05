import React from 'react'
import { CiLogin } from "react-icons/ci";
import '../styles/PersianCalendar.css';
import Calendar from '../components/Calender'
import { formatNumber } from '../utils/numberUtils'
import { RiMenuUnfold2Line } from "react-icons/ri";
import Header from '../components/Header';

const Contact = () => {
    const handleDateSelect = (date) => {
        console.log('Selected date:', date);
    };
    return (
        <div className='flex w-[100%] h-[100%] justify-center items-start body-farsi bg-[#f6f6f6]' style={{ direction: 'rtl' }}>
            <div className='flex flex-col w-full max-w-[450px] justify-start  '>



   

                <div className='flex flex-col justify-center  text-[9px] text-[#808080] items-center  w-[400px]   h-[30px] px-[20px] border-t-[1px] border-[#f6f6f6] '>
                    2026 PaddelNow, All rights reserved
                </div>

            </div>


        </div>
    )
}

export default Contact
