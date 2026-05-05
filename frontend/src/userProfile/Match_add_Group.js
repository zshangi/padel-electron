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
import { MdOutlineKeyboardArrowDown } from "react-icons/md";


const Match_add_Group = () => {
    const [groupName, setGroupName] = useState("");
    const [playersCount, setPlayersCount] = useState(0);
    const [level, setLevel] = useState("");

    const [players, setPlayers] = useState([]);

    const updatePlayer = (index, field, value) => {
        const updated = [...players];
        updated[index] = { ...updated[index], [field]: value };
        setPlayers(updated);
    };

    // dropdown states
    const [playersOpen, setPlayersOpen] = useState(false);
    const [levelOpen, setLevelOpen] = useState(false);

    const playersRef = useRef(null);
    const levelRef = useRef(null);




    const styles = {
        selectableDay: { backgroundColor: 'rgb(185, 237, 0, 0.2)', color: '#788f2a', border: '0.18px solid #B9ED00 ' },
        selectableHover: { backgroundColor: '#b9ed00', color: '#fff' },
        selectedDay: { backgroundColor: '#b9ed00', color: '#fff' },
        reservedDay: { backgroundColor: '#fafafa', color: '#a6a6a6' },
    };

    return (
        <div className='flex w-[100%]   justify-center items-start body-farsi bg-[#fbfbfb] text-[10px]' style={{ direction: 'rtl' }}>
            <div className='flex flex-col w-full space-y-[10px] mt-[20px]  max-w-[393px] justify-start items-center px-[20px] '>


                <div className='flex flex-col w-full space-y-[10px] h-[50px] justify-center items-center text-[10px]'>
                    <span className='body-farsi-bold'>گروه خودت رو اضافه کن!</span>
                    <span>برای شرکت در بازی های گروهی، گروه خود را اضافه کنید.</span>
                </div>

                <div className='w-[350px] min-h-[200px] h-fit rounded-[12px] bg-white shadow-md p-[20px]'>

                    {/* Input + Two Selects (same row) */}
                    <div className="flex justify-between w-full mt-2">
                        <div className="flex flex-col">

                            <label className="text-[10px] mb-1">نام گروه </label>
                            <input
                                type="text"
                                className="w-[150px] border border-[#eee] rounded bg-[#FAFAFA] text-[10px] h-[25px] py-1 px-2"
                                placeholder="نام گروه را رد کنید"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </div>
                        {/* تعداد نفرات + سطح */}

                        {/* تعداد نفرات */}
                        <div className="flex flex-col">
                            <label className="text-[10px] mb-1">تعداد نفرات</label>

                            {/* Custom Dropdown */}
                            <div ref={playersRef} className="relative">
                                <button
                                    onClick={() => setPlayersOpen(!playersOpen)}
                                    className="flex items-center justify-between body-farsi text-[8px] border border-[#eee] bg-[#FAFAFA] w-[70px] rounded text-[#4E4E4E] py-1 h-[25px] px-2"
                                >
                                    <span>{playersCount || "انتخاب کنید"}</span>
                                    <MdOutlineKeyboardArrowDown
                                        className={`transition-transform duration-200 ${playersOpen ? 'rotate-180' : 'rotate-0'}`}
                                        size={12}
                                    />
                                </button>

                                {playersOpen && (
                                    <>
                                        <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#eee] rounded shadow-md z-10">
                                            {[2, 3, 4, 5, 6, 7, 8].map(num => (
                                                <div
                                                    key={num}
                                                    onClick={() => { setPlayersCount(num); setPlayersOpen(false); }}
                                                    className="px-2 py-1 text-[8px] hover:bg-gray-100 cursor-pointer"
                                                >
                                                    {num}
                                                </div>
                                            ))}
                                        </div>


                                    </>
                                )}
                            </div>
                        </div>

                        {/* سطح */}
                        <div className="flex flex-col">
                            <label className="text-[10px] mb-1">سطح</label>

                            {/* Custom Dropdown */}
                            <div ref={levelRef} className="relative">
                                <button
                                    onClick={() => setLevelOpen(!levelOpen)}
                                    className="flex items-center justify-between body-farsi text-[8px] border border-[#eee] bg-[#FAFAFA] w-[70px] rounded text-[#4E4E4E] py-1 h-[25px] px-2"
                                >
                                    <span>{level || "انتخاب کنید"}</span>
                                    <MdOutlineKeyboardArrowDown
                                        className={`transition-transform duration-200 ${levelOpen ? 'rotate-180' : 'rotate-0'}`}
                                        size={12}
                                    />
                                </button>

                                {levelOpen && (
                                    <div className="absolute left-0 top-full mt-1 w-full bg-white border border-[#eee] rounded shadow-md z-10">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <div
                                                key={num}
                                                onClick={() => { setLevel(num); setLevelOpen(false); }}
                                                className="px-2 py-1 text-[8px] hover:bg-gray-100 cursor-pointer"
                                            >
                                                {num}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Players Inputs */}
{playersCount > 0 && (
  <div className="flex flex-col space-y-[10px] mt-4">

 

    {/* Header labels (only once) */}
    <div className="flex w-full space-x-4 space-x-reverse">
      <div className="flex-1">
        <label className="text-[9px]">نام بازیکنان</label>
      </div>
      <div className="w-[120px]">
        <label className="text-[9px]">شماره تماس</label>
      </div>
    </div>

    {/* Player Inputs */}
    {Array.from({ length: playersCount }).map((_, i) => (
      <div key={i} className="flex w-full space-x-[10px] space-x-reverse">

        {/* Name input */}
        <div className="flex flex-col flex-1">
          <input
            type="text"
            placeholder={`بازیکن ${i + 1}`}
            className="border border-[#eee] bg-[#FAFAFA] rounded text-[10px] py-1 px-2"
            value={players[i]?.name || ""}
            onChange={(e) => updatePlayer(i, "name", e.target.value)}
          />
        </div>

        {/* Mobile input */}
        <div className="flex flex-col w-[150px]">
          <input
            type="text"
            placeholder="موبایل"
            className="border border-[#eee] bg-[#FAFAFA] rounded text-[10px] py-1 px-2"
            value={players[i]?.mobile || ""}
            onChange={(e) => updatePlayer(i, "mobile", e.target.value)}
          />
        </div>

      </div>
    ))}

    {/* Centered Button */}
    <div className="flex justify-center w-full mt-2">
      <Link
        to={'/match-add-group'}
        className="flex justify-center items-center w-[116px] h-[19px] bg-[#ff0200] text-[#fff] rounded-[2px]"
      >
        اضافه کردن
      </Link>
    </div>

  </div>
)}


                </div>

            </div>


        </div>
    )
}

export default Match_add_Group
