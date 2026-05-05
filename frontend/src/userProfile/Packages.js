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
        <div className='flex w-[100%]   justify-center items-start body-farsi bg-[#fbfbfb] overflow-x-hidden text-[10px]' style={{ direction: 'rtl' }}>
            <div className='flex flex-col w-full space-y-[10px] mt-[20px]   max-w-[393px] justify-start items-center px-[20px] '>


                <Package
                    payload={{
                        subject: 'پکیـــج ۳ماهه <span>(بدون مربی)</span>',
                        discount: 10,
                        color: '#B9ED00',
                        data: [{ 'price': '۱۸ میلیون تومان' }, { 'sessionNum': '۱۲' }, { 'start': 'شنبه | ۱۲ آبان' }, { 'days': 'شنبه' }, { 'times': '۶:۰۰ تا ۷:۰۰ صبح' }, { 'details': 'این پکیج شامل مربی نمی باشد.' }],
                        buttonText: 'خرید',
                        onClick: () => alert('Package purchased!')
                    }}
                />

                <Package
                    payload={{
                        subject: 'پکیـــج ۳ماهه <span>(همراه با مربی)</span>',
                        discount: 5,
                        color: '#FE7A15',
                        data: [
                            { price: '۴۰ میلیون تومان' },
                            { sessionNum: '۱۲' },
                            { start: 'شنبه | ۱۲ آبان' },
                            { days: 'شنبه' },
                            { times: '۶:۰۰ تا ۷:۰۰ صبح' },
                            { details: 'مربی : ارسلان' },
                        ],
                        buttonText: 'خرید',
                        onClick: () => alert('Package purchased!'),
                    }}
                />

                <div className='flex items-center justify-center w-full h-[100px]  '>
                    <div className='flex flex-col space-y-[5px] w-full h-[100px] bg-white rounded-[12px]  items-center justify-center shadow-md'>
                        <span>پکیج خودت رو بساز</span>
                        <span> با انتخاب تاریخ و ساعت های مورد نظرت از همین حالا زمینت رو رزرو کن!</span>
                <Link to={'/create-package-couch'} className={`flex justify-center items-center w-[116px] h-[19px] bg-[#FE7A15]  text-[#fff] rounded-[2px]`} >ساخت  پکیج همراه با مربی</Link>
                <Link to={'/create-package'} className={`flex justify-center items-center w-[116px] h-[19px] bg-[#B9ED00]  text-[#fff] rounded-[2px]`} >ساخت  پکیج بدون مربی</Link>

   
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
