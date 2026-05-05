import React, { useState, useRef, useEffect } from 'react';
import '../styles/PersianCalendar.css';
import Calendar from '../components/Calender'
import { formatNumber } from '../utils/numberUtils'
import TimeSlot from '../components/TimeSlot'
import Package from '../components/Package';
import CreatePackage from '../components/CreatePackage';
import ConfirmDateTime from '../components/ConfirmDateTime';
import { backendAccessPost, backendAccessGet, backendMe } from '../utils/Authentication'
import { normalizeTimeSlot } from '../utils/numberUtils';
import { Link } from 'react-router-dom';


const ReservedPlayground = () => {




    const styles = {
        selectableDay: { backgroundColor: 'rgb(185, 237, 0, 0.2)', color: '#788f2a', border: '0.18px solid #B9ED00 ' },
        selectableHover: { backgroundColor: '#b9ed00', color: '#fff' },
        selectedDay: { backgroundColor: '#b9ed00', color: '#fff' },
        reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
    };

    return (
        <div className='flex w-[100%]   justify-center items-start body-farsi bg-[#fbfbfb] text-[10px]' style={{ direction: 'rtl' }}>
            <div className='flex flex-col w-full space-y-[10px] mt-[20px]   max-w-[393px] justify-start items-center px-[20px] '>


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
          <Package
                        payload={{
                                subject: 'تورنمنت پاییز  (۲۰ نفره)',
                                discount: 15,
                                color: '#ff0200',
                                data: [{'price':'۲۰ میلیون تومان'}, {'sessionNum':'۱۲'}, {'start': 'شنبه | ۲۲ آبان'}, {'days':'حذفی |دسته ۲'},{'times':'۶:۰۰ تا ۷:۰۰ صبح'}, {'details':'مدیر اجرایی : ارسلان محمدی'}],
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

                <div className='flex flex-col justify-center  text-[9px] text-[#808080] items-center  w-[400px]   h-[30px] px-[20px] border-t-[1px] border-[#f6f6f6] '>
                    2026 PaddelNow, All rights reserved
                </div>

            </div>


        </div>
    )
}

export default ReservedPlayground
