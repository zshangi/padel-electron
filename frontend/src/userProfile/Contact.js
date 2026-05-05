import React from 'react'
import { CiLogin } from "react-icons/ci";
import '../styles/PersianCalendar.css';
import Calendar from '../components/Calender'
import { formatNumber } from '../utils/numberUtils'
import { RiMenuUnfold2Line } from "react-icons/ri";
import Header from '../components/Header';

const Home = () => {
    const handleDateSelect = (date) => {
        console.log('Selected date:', date);
    };
    return (
        <div className='flex w-[100%]   justify-center items-start body-farsi bg-[#f6f6f6]' style={{ direction: 'rtl' }}>
            <div className='flex flex-col space-y-[30px] w-full max-w-[450px] justify-start  '>



                <div className='flex w-full   h-[400px]  mb-[20px]  justify-center  items-start  '>
                    <img src='/images/contact-1.png'/>
                </div>

                    <div className='flex w-full shadow-md mt-[20px]   h-[200px]  p-[10px]   justify-center  items-start  '>
                    <img src='/images/contact-2.png ' className='rounded-[4px]'/>
                </div>
                      <div className='flex  flex-col space-y-[10px] justify-center  w-full text-center text-xs '>
                            <span className='text-[14px] text-[#000] font-extrabold'>پدل وند</span>
                            <span>
                                آجودانیه | روبروی عرش آجودانیه | کوچه فهیمی | پلاک ۱
                            </span>
                        </div>

              
    

{/* 
                <div className='flex flex-col justify-center  text-[9px] text-[#808080] items-center  w-[400px]   h-[30px] px-[20px] border-t-[1px] border-[#f6f6f6] '>
                    2026 PaddelNow, All rights reserved
                </div> */}

            </div>


        </div>
    )
}

export default Home
