// CourtList.js
import React, { useState, useEffect } from 'react';
import { FiEdit2 } from "react-icons/fi";
import { PiTrashLight } from "react-icons/pi";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { backendAccessPost, backendAccessGet } from '../../../utils/Authentication';
import { IoIosClose } from "react-icons/io";
import { weekDays, formatJalaali, getDayOfWeek } from '../../../utils/calenderUtils';
import CouchModal from './Couch-addEdit'; // Import the new component
import { Link, useParams } from 'react-router-dom';

const listTimeEn = {
    '6': '6:00', '7': '7:00', '8': '8:00', '9': '9:00', '10': '10:00',
    '11': '11:00', '12': '12:00', '13': '13:00', '14': '14:00',
    '15': '15:00', '16': '16:00', '17': '17:00', '18': '18:00',
    '19': '19:00', '20': '20:00', '21': '21:00', '22': '22:00', '23': '23:00'
};

// Persian digits (for display only)
const enToFaDigits = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
};

const toPersianDigits = (str) => {
    return str.replace(/\d/g, d => enToFaDigits[d]);
};

// Optional: precomputed Persian display labels
const listTimeFa = {};
for (const [hour, timeStr] of Object.entries(listTimeEn)) {
    listTimeFa[hour] = toPersianDigits(timeStr);
}
const CouchList = ({
    onCouchSelect,
    couches,
    setCouches,
    category,
    subcategory,
    categorycontent
}) => {
    // Court list state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [maincategory_id, setMaincategory_id] = useState('3')
    const [workingHours, setWorkingHours] = useState({});
    const [openDropdown, setOpenDropdown] = useState(null);

    const [expandedItem, setExpandedItem] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [editingcouchId, setEditingcouchId] = useState(null);
    const [editingCouchData, setEditingCouchData] = useState(null);



    useEffect(() => {



                const initialWorkingHours = {};

                couches.forEach(couch => {
                    if (couch.data?.workingHours) {
                        Object.keys(couch.data.workingHours).forEach(day => {
                            const itemKey = `${couch.id}-${day}`;
                            initialWorkingHours[itemKey] = couch.data.workingHours[day] || [];
                        });
                    }
                });

                setWorkingHours(initialWorkingHours);


       

    }, [couches]);



    const handleCouchClick = (couchId) => {
        console.log('Couch clicked:', couchId);
        console.log('onCouchSelect function:', typeof onCouchSelect);

        if (typeof onCouchSelect === 'function') {
            console.log('Calling onCouchSelect with:', couchId);
            onCouchSelect(couchId);
        } else {
            console.error('onCouchSelect is not a function or is undefined');
        }
    };

    const handleDayClick = (couchId, dayKey) => {
        const itemKey = `${couchId}-${dayKey}`;
        setExpandedItem(prevExpandedItem => (prevExpandedItem === itemKey ? null : itemKey));
        setOpenDropdown(null);
    };

    const updateWorkingHoursInBackend = async (couchId, dayKey, hours) => {
        setWorkingHours(prev => {
            const updated = { ...prev };

            const merged = {};

            Object.keys(updated).forEach(key => {
                const [id, day] = key.split('-');
                if (parseInt(id) === couchId) {
                    merged[day] = updated[key];
                }
            });

            merged[dayKey] = hours;

            const payload = {
                id: couchId,
                workingHours: merged
            };

            backendAccessPost('/api/couch/update-working-hours/', payload).then(res=>
            {
                setCouches(res.couchs)
            }
            )

            return updated;
        });
    };


    const handleAddHour = (couchId, dayKey, startHour) => {
        const startEn = listTimeEn[startHour];
        const endHour = parseInt(startHour) + 1;
        const endEn = listTimeEn[endHour] || '24:00';
        const timeRangeEn = `${startEn}-${endEn}`;

        const itemKey = `${couchId}-${dayKey}`;
        setWorkingHours(prev => {
            const current = prev[itemKey] || [];
            if (!current.includes(timeRangeEn)) {
                const newHours = [...current, timeRangeEn].sort((a, b) => {
                    const aStart = parseInt(a.split(':')[0]);
                    const bStart = parseInt(b.split(':')[0]);
                    return aStart - bStart;
                });
                updateWorkingHoursInBackend(couchId, dayKey, newHours);
                return { ...prev, [itemKey]: newHours };
            }
            return prev;
        });
        setOpenDropdown(null);
    };

    const handleRemoveHour = (couchId, dayKey, timeRangeEn) => {
        const confirmDelete = window.confirm(
            "آیا مطمئن هستید که می‌خواهید این بازه زمانی حذف شود؟"
        );

        if (!confirmDelete) return;

        const itemKey = `${couchId}-${dayKey}`;

        setWorkingHours(prev => {
            const currentHours = prev[itemKey] || [];
            const newHours = currentHours.filter(h => h !== timeRangeEn);

            updateWorkingHoursInBackend(couchId, dayKey, newHours);

            return {
                ...prev,
                [itemKey]: newHours
            };
        });
    };


    const toggleDropdown = (e, itemKey) => {
        e.stopPropagation();
        setOpenDropdown(openDropdown === itemKey ? null : itemKey);
    };





    const handleOpenAddModal = () => {
        setModalMode('add');
        setEditingcouchId(null);
        setEditingCouchData(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (couchId) => {
        const couch = couches.find(c => c.id === couchId);
        if (couch) {
            setEditingcouchId(couchId);
            setEditingCouchData(couch);
            setModalMode('edit');
            setShowModal(true);
        }
    };






    const handleDeleteCouch = async (couchId) => {
        if (!window.confirm("آیا مطمئن هستید که می‌خواهید این مربی را حذف کنید؟")) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const response = await fetch('/api/couch/remove/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: couchId })
            });

            const data = await response.json();

            if (data.success) {
                // Remove from UI without refetching
                setCouches(prev => prev.filter(c => c.id !== couchId));
            } else {
                alert("خطا در حذف مربی");
            }

        } catch (err) {
            console.error(err);
            alert("مشکلی پیش آمد. دوباره تلاش کنید.");
        }
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
                    {couches.length === 0 ? (
                        <p>هیچ مربی یافت نشد.</p>
                    ) : (
                        couches.map(couch => (
                            <div key={couch.id} className=' mb-[2px]'>
                                {/* Main Row: Couch Name and Days */}
                                <div className="couch-row flex items-center space-x-[2px] rtl:space-x-reverse">
                                    <div className="w-[80px] text-right cursor-pointer hover:text-[#719100]" onClick={() => handleCouchClick(couch.id)}>
                                        {couch.name}
                                    </div>
                                    <div className="w-[362px] flex space-x-reverse space-x-[2px] flex-wrap">
                                        {weekDays.map(day => {
                                            const itemKey = `${couch.id}-${day.shortKey}`;
                                            const isExpanded = expandedItem === itemKey;
                                            const hasWorkingHours = workingHours[itemKey] && workingHours[itemKey].length > 0;
                                            return (
                                                <button
                                                    key={day.shortKey}
                                                    onClick={() => handleDayClick(couch.id, day.shortKey)}
                                                    className={`flex items-center justify-center w-[50px] h-[25px] rounded-[2px] transition-colors ${isExpanded
                                                        ? 'bg-[#FFE6D3] text-[#FF6F00]'
                                                        : hasWorkingHours
                                                            ? 'bg-[#FFE6D3] text-[#FF6F00]'
                                                            : 'bg-[#525565] text-white hover:bg-[#FF6F00] hover:text-[#fff]'
                                                        }`}
                                                >
                                                    {day.display}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className='w-[40px]'></div>
                                    <Link to={`/admin-couch/${couch.id}`} className="flex w-[80px] items-center justify-center rounded-[2px] bg-[#fff] border-[0.5px] border-[#525565] h-[25px]">

                                        همه کلاس ها
                                    </Link>
                                    <div className="flex w-[50px] rounded-[2px] bg-[#363740] border-[00.5px] border-[#fff] h-[25px]">
                                        <div
                                            className='flex w-[25px] h-[25px] items-center justify-center border-l-[0.5px] border-[#fff] cursor-pointer'
                                            onClick={() => handleOpenEditModal(couch.id)}
                                        >
                                            <FiEdit2 color={'#fff'} />
                                        </div>
                                        <div
                                            className='flex w-[25px] h-[25px] items-center justify-center cursor-pointer'
                                            onClick={() => handleDeleteCouch(couch.id)}
                                        >
                                            <PiTrashLight color={'#fff'} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Detail Rows for Interactive Hours */}
                                {weekDays.map(day => {
                                    const itemKey = `${couch.id}-${day.shortKey}`;
                                    const isExpanded = expandedItem === itemKey;
                                    if (!isExpanded) return null;

                                    const currentWorkingHours = workingHours[itemKey] || [];
                                    const hasHours = currentWorkingHours.length > 0;

                                    return (
                                        <div key={itemKey} className="hours-detail-row">
                                            <div className="flex items-center w-full my-[4px] pr-[80px] relative">
                                                {hasHours ? (
                                                    // Show existing working hours with remove icons
                                                    <div className="flex flex-wrap space-x-[2px] space-x-reverse">
                                                        {currentWorkingHours.map(timeRangeEn => (
                                                            <div
                                                                key={timeRangeEn}
                                                                className="relative flex items-center justify-center w-[50px] h-[25px] hour-button rounded-[2px] m-[1px] bg-[#FFE6D3] text-[#FF6F00]"
                                                            >
                                                                <span>{toPersianDigits(timeRangeEn)}</span>
                                                                <IoIosClose
                                                                    className='absolute top-0 left-0'
                                                                    onClick={() => handleRemoveHour(couch.id, day.shortKey, timeRangeEn)}
                                                                    color={'#FF6F00'}
                                                                    size={12}
                                                                />
                                                            </div>
                                                        ))}
                                                        {/* Add button for adding more hours */}
                                                        <div className="relative">
                                                            <button
                                                                className="flex items-center justify-center w-[50px] h-[25px] rounded-[2px] m-[1px] border border-[#FF6F00] text-[8px] text-[#FF6F00] bg-transparent"
                                                                onClick={(e) => toggleDropdown(e, itemKey)}
                                                            >
                                                                اضافه کردن <AiOutlinePlus size={8} />
                                                            </button>

                                                            {/* Dropdown */}
                                                            {openDropdown === itemKey && (
                                                                <div className="absolute top-full right-0 mt-1 z-10 w-[50px] bg-white border border-gray-300 rounded shadow-lg">
                                                                    <div className="max-h-[120px] overflow-y-auto">
                                                                        {Array.from({ length: 17 }, (_, i) => i + 6).map(hour => {
                                                                            const hourStr = hour.toString();
                                                                            const isAlreadySelected = currentWorkingHours.some(range =>
                                                                                range.startsWith(listTimeEn[hourStr])
                                                                            );

                                                                            // Display Persian range
                                                                            const startFa = listTimeFa[hourStr];
                                                                            const endFa = listTimeFa[hour + 1] || toPersianDigits('24:00');
                                                                            const displayLabel = `${startFa} - ${endFa}`;

                                                                            return (
                                                                                <button
                                                                                    key={hourStr}
                                                                                    disabled={isAlreadySelected}
                                                                                    onClick={() => !isAlreadySelected && handleAddHour(couch.id, day.shortKey, hourStr)}
                                                                                >
                                                                                    {displayLabel}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Show only the add button when no working hours exist
                                                    <div className="relative">
                                                        <button
                                                            className="flex items-center justify-center w-[50px] h-[25px] rounded-[2px] m-[1px] border border-[#FF6F00] text-[8px] text-[#FF6F00] bg-transparent"
                                                            onClick={(e) => toggleDropdown(e, itemKey)}
                                                        >
                                                            اضافه کردن <AiOutlinePlus size={8} />
                                                        </button>

                                                        {/* Dropdown */}
                                                        {openDropdown === itemKey && (
                                                            <div className="absolute top-full right-0 mt-1 z-10 w-[50px] bg-white border border-gray-300 rounded shadow-lg">
                                                                <div className="max-h-[120px] overflow-y-auto">
                                                                    {Array.from({ length: 17 }, (_, i) => i + 6).map(hour => {
                                                                        const hourStr = hour.toString();
                                                                        const slot = `${listTimeEn[hourStr]}-${listTimeEn[hour + 1] || '24:00'}`;

                                                                        const isAlreadySelected = currentWorkingHours.includes(slot);

                                                                        const startFa = listTimeFa[hourStr];
                                                                        const endFa = listTimeFa[hour + 1] || toPersianDigits('24:00');
                                                                        const displayLabel = `${startFa} - ${endFa}`;

                                                                        if (isAlreadySelected) return null;   // 👉 hide already used slots

                                                                        return (
                                                                            <button
                                                                                key={hourStr}
                                                                                onClick={() => handleAddHour(couch.id, day.shortKey, hourStr)}
                                                                                className="block w-full text-center py-1 text-[9px]"
                                                                            >
                                                                                {displayLabel}
                                                                            </button>
                                                                        );
                                                                    })}

                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}


                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>
                <div className="flex w-full  justify-center space-x-[4px] space-x-reverse">
                    <button
                        onClick={handleOpenAddModal}
                        className="w-[101px] h-[24px] text-[#fff] bg-[#FF6F00] text-[10px] rounded hover:bg-[#FF6F00] transition-colors"
                    >
                        افزودن مربی
                    </button>                 </div>
            </div>

            <CouchModal
                showModal={showModal}
                setShowModal={setShowModal}
                category={category}
                setCouches={setCouches}
                subcategory={subcategory}
                categorycontent={categorycontent}
                maincategory_id={maincategory_id}
                mode={modalMode}
                couchData={editingCouchData}
                couchId={editingcouchId}
            />


        </>
    );
};

export default CouchList;