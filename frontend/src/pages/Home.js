import React from 'react'
import { CiLogin } from "react-icons/ci";
import '../styles/PersianCalendar.css';
import Calendar from '../components/Calender'
import { formatNumber } from '../utils/numberUtils'
import { RiMenuUnfold2Line } from "react-icons/ri";
import Header from '../components/Header';
import Box from '../components/Box';

const Home = () => {
    const handleDateSelect = (date) => {
        console.log('Selected date:', date);
    };
    const styles = {
        selectableDay: { backgroundColor: 'rgb(185, 237, 0, 0.2)', color: '#788f2a', border: '0.1px solid #B9ED0070 ' },
        selectableHover: { backgroundColor: '#b9ed00', color: '#fff' },
        selectedDay: { backgroundColor: '#b9ed00', color: '#fff' },
        reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
    };
    return (
        <div
        className='flex w-[100%] h-[calc(100vh-220px)] justify-center items-start body-farsi bg-[#f8f9fa] text-[10px] overflow-x-hidden'
        style={{ direction: 'rtl' }}
      >
        <div className='flex flex-col w-full space-y-[10px] mt-[20px] max-w-[393px] justify-start items-center px-[20px]'>
  


                <div className='flex flex-col w-full   h-[40px]  space-y-[5px] justify-center  items-center  p-[5px]  '>
                    <span className='text-[10px]' >ساعت های کاری</span>
                    <span className='text-[12px]'> همه روزه ۶ صبح- ۱۰شب</span>
                </div>
                <Box width={350} height={330}>

                        <Calendar onDateSelect={handleDateSelect}
                        styles={styles}/></Box>

                    <div className='flex flex-col space-y-[20px] rounded-[12px] justify-center text-[15px] text-[#808080] items-center w-full p-[20px] drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)] h-[200px] border-t-[1px] border-[#f6f6f6] bg-[#fff]'>
                        <div className='flex space-x-[4px] justify-center items-center  w-full h-[30px]'>
                            <span> دنبال همبازی میگردی؟</span>
                        </div>
                        <div className='flex space-x-[5px]  space-x-reverse justify-center w-full h-[120px]'>
                            <div className='w-[80px] h-[80px] rounded-full border border-1 border-[#f6f6f6]'>
                                <img src={'/images/tennis-2.jpg'} className='rounded-full' />
                            </div>
                            <div className='w-[80px] h-[80px] rounded-full border border-1 border-[#f6f6f6]'>
                                <img src={'/images/tennis-3.jpg'} className='rounded-full' />

                            </div>
                            <div className='w-[80px] h-[80px] rounded-full border border-1 border-[#f6f6f6]'>
                                <img src={'/images/tennis-1.jpg'} className='rounded-full' />

                            </div>

                        </div>

                        <div className='flex space-x-[4px] justify-center items-center  w-full h-[30px]'>

                                            <button type="submit" className="w-[150px] h-[24px] text-[#fff] bg-[#005CD7] shadow-sm rounded-[4px] text-[10px]">عضویت</button>

                        </div>

                    </div>



                    <div className=' flex space-x-[10px] space-x-reverse rounded-[12px] justify-center text-[15px] text-[#000] items-center w-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)] h-[150px] border-t-[1px] border-[#f6f6f6] bg-[#fff]'>
      <div className='flex float-right justify-start items-center w-[150px] '>
                            <a href='https://maps.app.goo.gl/nvKjTFNWJKTP4tC49'>
                            <img src={'/images/map.png'} className='w-full h-auto rounded-md' />
                            </a>
                        </div>
                        <div className='flex  flex-col space-y-[10px] float-left w-[150px] text-right text-xs '>
                            <span className='text-[14px] text-[#000] font-extrabold'>پدل وند</span>
                            <span>
                                آجودانیه | روبروی عرش آجودانیه | کوچه فهیمی | پلاک ۱
                            </span>
                        </div>
                  

                    </div>


                <div className='flex flex-col justify-center  text-[9px] text-[#808080] items-center  w-[400px]   h-[30px] px-[20px] border-t-[1px] border-[#f6f6f6] '>
                    2026 PaddelNow, All rights reserved
                </div>

            </div>


        </div>
    )
}

export default Home
