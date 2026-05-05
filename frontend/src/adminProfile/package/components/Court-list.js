// CourtList.js
import React, { useState, useEffect, useRef } from 'react';
import { FiEdit2 } from "react-icons/fi";
import { PiTrashLight } from "react-icons/pi";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import CourtAllCalender from './Court-all-calender'
import { getDefaultSlots, generateWorkingSlots } from '../../../utils/timeSlots';
import CourtModal from './Court-addEdit'; // Import the new component
import { formatPersianTimeSlot } from '../../../utils/numberUtils';
import { weekDays } from '../../../utils/calenderUtils';
import useClickOutside from "../../../hooks/useClickOutside";
import { backendAccessGet, backendAccessPost } from '../../../utils/Authentication'



const CourtList = ({
    onCourtSelect,
    courts,
    setCourts,
    setting,
    category,
    subcategory,
    categorycontent
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [maincategory_id, setMaincategory_id] = useState('1')
    const dropdownRef = useRef();
    useClickOutside(dropdownRef, () => setAddDropdownOpen(null));

    const [expandedItem, setExpandedItem] = useState(null);

    const [addDropdownOpen, setAddDropdownOpen] = useState(null);





    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingCourtId, setEditingCourtId] = useState(null);
    const [editingCourtData, setEditingCourtData] = useState(null);
    const [showCourtAllCalender, setShowCourtAllCalender] = useState(false);



    const fetchCourts = async () => {
        try {
            const courtsResponse = await backendAccessGet("api/court/fetch/");
            const courtsData = Array.isArray(courtsResponse) ? courtsResponse : courtsResponse.courts || [];
            setCourts(courtsResponse["courts"] || []);
        } catch (err) {
            setError('Failed to load courts. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (courts) {
            setLoading(false);
        }
    }, [courts]);




    const handleCourtClick = (courtId) => { if (typeof onCourtSelect === 'function') onCourtSelect(courtId); };

    const handleDayClick = (courtId, dayKey) => {
        const itemKey = `${courtId}-${dayKey}`;
        setExpandedItem(prev => (prev === itemKey ? null : itemKey));
        setAddDropdownOpen(null); 
    };

    const toggleAddDropdown = (e, itemKey) => {
        e.stopPropagation(); 
        setAddDropdownOpen(prev => (prev === itemKey ? null : itemKey));
    };

    const updateWorkingHoursInBackend = async (payload) => {
        try {
            const data = await backendAccessPost(
                '/api/court/update-working-hours/',
                payload,
                { 'Content-Type': 'application/json' }
            );

            if (data.success) {
                setCourts(prev =>
                    prev.map(court => {
                        if (court.id !== payload.id) return court;

                        const newData = { ...court.data };
                        if (!newData.workingHours[payload.dayKey])
                            newData.workingHours[payload.dayKey] = [];

                        if (payload.action === "remove") {
                            newData.workingHours[payload.dayKey] =
                                newData.workingHours[payload.dayKey].filter(s => s !== payload.slot);
                        }

                        if (payload.action === "add") {
                            if (!newData.workingHours[payload.dayKey].includes(payload.slot)) {
                                newData.workingHours[payload.dayKey].push(payload.slot);

                                // keep ordered
                                newData.workingHours[payload.dayKey].sort(
                                    (a, b) => a.split(':')[0] - b.split(':')[0]
                                );
                            }
                        }

                        return { ...court, data: newData };
                    })
                );
            } else {
                alert("خطا در به‌روزرسانی");
            }
        } catch (err) {
            console.error(err);
            alert("مشکلی پیش آمد.");
        }
    };

    const handleRemoveSlot = (courtId, dayKey, slot) => {
        const ok = window.confirm("آیا مطمئن هستید که می‌خواهید این بازه زمانی حذف شود؟");

        if (!ok) return;

        updateWorkingHoursInBackend({
            id: courtId,
            dayKey,
            slot,
            action: "remove"
        });
    };

    const handleAddSlot = (courtId, dayKey, slot) => {
        updateWorkingHoursInBackend({
            id: courtId,
            dayKey,
            slot,
            action: "add"
        });
    };


    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditingCourtId(null);
        setEditingCourtData(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (courtId) => {
        const court = courts.find(c => c.id === courtId);
        if (court) {
            setEditingCourtId(courtId);
            setEditingCourtData(court);
            setModalMode('edit');
            setShowModal(true);
        }
    };





    const handleDeleteCourt = async (courtId) => {
        if (!window.confirm("آیا مطمئن هستید که می‌خواهید این زمین را حذف کنید؟")) return;
        try {
            const response = await backendAccessPost('/api/court/remove/', { id: courtId }, { 'Content-Type': 'application/json' });
            if (response.success) {
                const res = await backendAccessGet("api/court/fetch/");
                setCourts(res["courts"] || []);
                alert("زمین با موفقیت حذف شد.");
            } else { throw new Error(response.error_message); }
        } catch (err) { alert("مشکلی پیش آمد: " + err.message); }



    };

    if (loading) {
        return <div className="text-center p-4">در حال بارگذاری...</div>;
    }

    if (error) {
        return <div className="text-center p-4 text-red-500">خطا: {error}</div>;
    }

    return (
        <>
            <div className="flex flex-col items-center  w-[680px] text-[10px] px-[10px]  ">
                <div className="flex w-full justify-start  items-center h-[30px] ">
                    <h2 className='body-farsi-bold'>ساعات کاری زمین ها</h2>

                </div>
                <div className='w-full  h-[230px]'>
                    {courts.length === 0 ? (
                        <p>هیچ زمینی یافت نشد.</p>
                    ) : (
                        courts.map(court => (
                            <div key={court.id} className='w-full  mb-[2px]'>
                                <div className="flex items-center w-full space-x-[2px] rtl:space-x-reverse">

                                    <div className="w-[90px] text-right cursor-pointer hover:text-[#719100]" onClick={() => handleCourtClick(court.id)}>{court.name}</div>

                                    <div className="w-[390px] flex space-x-reverse   space-x-[2px] flex-wrap">
                                        {weekDays.map(day => {
                                            const itemKey = `${court.id}-${day.shortKey}`;
                                            const isExpanded = expandedItem === itemKey;

                                            const slots = court.data.workingHours?.[day.shortKey] || [];

                                            return (
                                                <button
                                                    key={day.key}
                                                    onClick={() => handleDayClick(court.id, day.shortKey)}
                                                    className={`flex items-center justify-center w-[50px] h-[25px] rounded-[2px] transition-colors ${isExpanded
                                                        ? 'bg-[#B9ED00] text-[#525565]'
                                                        : slots.length === 0
                                                            ? 'bg-[#e4e3e3] text-white'
                                                            : 'bg-[#525565] text-white hover:bg-[#B9ED00] hover:text-[#525565]'
                                                        }`}
                                                >
                                                    {day.display}
                                                </button>
                                            );
                                        })}

                                    </div>

                                    <div className='w-[50px]'></div>

                                    <div className="w-[100px]">
                                        <button onClick={() => [setEditingCourtId(court.id)]}
                                            className='flex w-[101px] h-[25px] bg-[#363740] text-[#fff] rounded-[2px] items-center justify-center'>تقویم ماهانه</button></div>
                                    <div className="flex w-[50px] rounded-[2px] bg-[#363740] border-[00.5px] border-[#fff] h-[25px]">
                                        <div className='flex w-[25px] h-[25px] items-center justify-center border-l-[0.5px] border-[#fff] cursor-pointer' onClick={() => handleOpenEditModal(court.id)}><FiEdit2 color={'#fff'} /></div>
                                        <div className='flex w-[25px] h-[25px] items-center justify-center cursor-pointer' onClick={() => handleDeleteCourt(court.id)}><PiTrashLight color={'#fff'} /></div>
                                    </div>
                                </div>

                                {weekDays.map(day => {
                                    const itemKey = `${court.id}-${day.shortKey}`;
                                    const isExpanded = expandedItem === itemKey;

                                    if (!isExpanded) return null;

                                    const slots = court.data.workingHours?.[day.shortKey] || [];
                                    console.log('court.data.workingHours', court.data.workingHours)
                                    return (
                                        <div key={itemKey} className="hours-detail-row">
                                            <div className="flex items-center w-full pr-[85px] ">

                                                <div className="flex flex-wrap">

                                                    {/* SHOW CURRENT SLOTS */}
                                                    {slots.map((slot, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => handleRemoveSlot(court.id, day.shortKey, slot)}
                                                            className="flex items-center justify-center w-[50px] h-[25px] px-[1px] py-1 text-[8px] rounded-[2px] m-[1px] bg-[#F0FBC7] text-[#719100] hover:bg-[#719100] hover:text-white cursor-pointer"
                                                        >
                                                            {formatPersianTimeSlot(slot)}

                                                        </div>
                                                    ))}

                                                    <div className='relative' ref={dropdownRef}>
                                                        <button
                                                            onClick={(e) => toggleAddDropdown(e, itemKey)}
                                                            className="flex  items-center justify-center w-[50px] h-[25px] rounded-[2px] m-1 border border-[#719100] text-[#719100]"
                                                        >
                                                            <AiOutlinePlus size={12} />
                                                        </button>

                                                        {addDropdownOpen === itemKey && (
                                                            <div className="absolute z-10 top-8 left-0 bg-white border rounded shadow-lg">
                                                                <div className="max-h-60 overflow-y-auto w-[55px]">
                                                                    {generateWorkingSlots(
                                                                        court.data.defaultWorkingHours.startTime + ":00",
                                                                        court.data.defaultWorkingHours.endTime + ":00",
                                                                        60
                                                                    )
                                                                        // Show only slots NOT in workingHours
                                                                        .filter(slot => !court.data.workingHours[day.shortKey]?.includes(slot))
                                                                        .map(slot => (
                                                                            <button
                                                                                key={slot}
                                                                                onClick={() => handleAddSlot(court.id, day.shortKey, slot)}
                                                                                className="block w-full text-center py-1 text-[9px] hover:bg-gray-100"
                                                                            >
                                                                                {formatPersianTimeSlot(slot)}
                                                                            </button>
                                                                        ))}




                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                            </div>
                        ))
                    )}
                </div>
                <div className="flex w-full  justify-center space-x-[4px] space-x-reverse">
                    <button onClick={handleOpenAddModal} className="w-[101px] h-[24px] text-[#000] bg-[#B9ED00] text-[10px] rounded hover:bg-[#a8d400] transition-colors">افزودن زمین</button>
                    <button onClick={() => setShowCourtAllCalender(true)}
                        className="w-[101px] h-[24px] text-[#B9ED00] bg-[#363740] text-[10px] rounded hover:bg-[#454650] transition-colors">تقویم همه زمین ها</button>
                </div>
            </div>

            <CourtModal
                showModal={showModal}
                setShowModal={setShowModal}
                fetchCourts={fetchCourts}
                category={category}
                subcategory={subcategory}
                categorycontent={categorycontent}
                setting={setting}
                maincategory_id={maincategory_id}
                mode={modalMode}
                courtData={editingCourtData}
                courtId={editingCourtId}
            />
            {showCourtAllCalender &&
                <CourtAllCalender setShowCourtAllCalender={setShowCourtAllCalender} />
            }

        </>
    );
};

export default CourtList;
