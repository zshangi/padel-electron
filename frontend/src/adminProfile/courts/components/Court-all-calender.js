import React, { useEffect, useState } from 'react';
import Box from '../../components/Box';
import DropDown from '../../components/DropDown';
import { backendAccessPost, backendAccessGet } from '../../../utils/Authentication';
import Input from '../../components/Input';
import {weekDays,listTime_ClosedOption} from '../../../utils/calenderUtils'
import ReusableCalendar from '../../../components/ReusableCalendar';



const CourtAllCalender = ({setShowCourtAllCalender}) => {
    const [setting, setSetting] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddMode, setIsAddMode] = useState(true);
    const [selectedDateReservations, setSelectedDateReservations] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    // State for Default Working Hours (saved separately)
    const [defaultStartTime, setDefaultStartTime] = useState('6');
    const [defaultEndTime, setDefaultEndTime] = useState('21');

    // State for individual day's hours (also saved separately)
    const [dayTimeStates, setDayTimeStates] = useState({
        saturday: { start: '6', end: '23' },
        sunday: { start: '6', end: '23' },
        monday: { start: '6', end: '23' },
        tuesday: { start: '6', end: '23' },
        wednesday: { start: '6', end: '23' },
        thursday: { start: '6', end: '23' },
        friday: { start: '6', end: '23' }
    });

    // State for Contact Information
    const [name, setName] = useState('');
    const [tell, setTell] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState('');
    const [email, setEmail] = useState('');
    const [linkedin, setLInkedin] = useState('');
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');

    
    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const response = await backendAccessGet('/api/setting/fetch/');
                const settings = response["settings"];
                setSetting(settings || []);
                
                if (settings && settings.length > 0) {
                    const settingsData = settings[0];
                    setIsAddMode(false);
                    
                    // Populate Contact Info
                    if (settingsData.data && settingsData.data.contactInfo) {
                        const { contactInfo } = settingsData.data;
                        setName(contactInfo.name || '');
                        setTell(contactInfo.tell || '');
                        setAddress(contactInfo.address || '');
                        setLocation(contactInfo.location || '');
                        setEmail(contactInfo.email || '');
                        setLInkedin(contactInfo.linkedin || '');
                        setInstagram(contactInfo.instagram || '');
                        setFacebook(contactInfo.facebook || '');
                    }

                    // Populate Default Working Hours
                    if (settingsData.data && settingsData.data.defaultWorkingHours) {
                        const { startTime, endTime } = settingsData.data.defaultWorkingHours;
                        setDefaultStartTime(startTime);
                        setDefaultEndTime(endTime);
                    }
                    
                    // Populate working hours from the 'workingHours' structure
                    if (settingsData.data && settingsData.data.workingHours) {
                        const fetchedWorkingHours = settingsData.data.workingHours;
                        const newDayTimeStates = {};
                        
                        weekDays.forEach(day => {
                            const dayData = fetchedWorkingHours[day.shortKey];
                            if (dayData) {
                                newDayTimeStates[day.key] = {
                                    start: dayData.startTime,
                                    end: dayData.endTime
                                };
                            }
                        });
                        setDayTimeStates(newDayTimeStates);
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load setting");
            } finally {
                setLoading(false);
            }
        };

        fetchSetting();
    }, []);

    // Handle start time change with automatic end time update for "تعطیل"
    const handleStartTimeChange = (dayKey, value) => {
        setDayTimeStates(prev => {
            const newState = { ...prev };
            newState[dayKey] = { ...newState[dayKey], start: value };
            
            // If "تعطیل" is selected, automatically set end time to "تعطیل"
            if (value === 'closed') {
                newState[dayKey].end = 'closed';
            }
            
            return newState;
        });
    };

    // Handle end time change
    const handleEndTimeChange = (dayKey, value) => {
        setDayTimeStates(prev => ({
            ...prev,
            [dayKey]: { ...prev[dayKey], end: value }
        }));
    };

    // ============= PREPARE DATA FOR SAVING ============
    const settingData = {
        id: setting.length > 0 ? setting[0].id : null,
        data: {
            // 1. Add contact info
            contactInfo: {
                name,
                tell,
                address,
                location,
                email,
                linkedin,
                instagram,
                facebook
            },
            // 2. Add default working hours
            defaultWorkingHours: {
                startTime: defaultStartTime,
                endTime: defaultEndTime
            },
            // 3. Add the specific working hours for each day
            workingHours: {}
        }
    };

    // Populate the workingHours object from the state
    weekDays.forEach(day => {
        const dayTime = dayTimeStates[day.key];
        settingData.data.workingHours[day.shortKey] = {
            startTime: dayTime.start,
            endTime: dayTime.end
        };
    });

    const saveSetting = () => {
        const url = setting.length == 0 ? "/api/setting/add/" : "/api/setting/update/";

        backendAccessPost(url, settingData)
            .then(data => {
                if (data.success) {
                    alert("تنظیمات با موفقیت ذخیره شد.");
                } else {
                    console.error("Error:", data.error);
                    alert("خطا در ذخیره تنظیمات");
                }
            })
            .catch(err => {
                console.error("Error:", err);
                alert("مشکلی پیش آمد. دوباره تلاش کنید.");
            });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };
    return (
        <>
            <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-[#4D4D4D]">
                <div className="relative w-[672px] h-[465px]">
                    <div className="border-0 rounded-[20px] shadow-lg relative flex flex-col w-[672px] bg-[#F8F8F8] outline-none focus:outline-none p-[15px]">

                        {/* Modal Body */}
                        <div className="flex flex-col w-full justify-center items-start p-[30px] text-center space-y-[25px]">
                            <div className='flex w-full h-[370px] space-x-[10px] space-x-reverse'>
                                {/* Left Column - Form Fields */}
                                <Box width={400} height={375}>
                                    <div className='m-[20px] text-[12px]'>تقویم ماهانه زمین ها</div>
                             <ReusableCalendar
                                currentDate={new Date()}
                                setCurrentDate={() => {}}
                                selectedDate={selectedDate}
                                setSelectedDate={setSelectedDate}
                                onDateSelect={handleDateSelect}

                                typeCategory="court"
                                selectedCouchId={null}
                                subjectCategory="همه زمین ها"
                                setShowCalendar={() => {}}
                                setShowTimeSlots={() => {}}
                                setShowConfirmDateTime={() => {}}
                                setSelectedCourtName={() => {}}
                                setSelectedCouchName={() => {}}
                                setSelectedReserved={() => {}}
                                setIs_reserved_before={() => {}}
                                is_reserved_before={false}
                                mode="single"
                                selectedSlots={[]}
                                onAddSlot={() => {}}
                                onRemoveSlot={() => {}}
                                dropdownOpen={false}
                                setDropdownOpen={() => {}}
                                dropdownRef={{ current: null }}
                                hoveredDay={null}
                                setHoveredDay={() => {}}
                            />
                                </Box>

                                <div className="flex flex-col space-y-[10px]">
                                <Box width={220} height={108}>
                        <div className='flex flex-col space-y-[5px] justify-center w-full items-center '>
                            <span className='w-full text-start text-[9px] body-farsi-bold p-[5px]'>ساعات کاری پیش‌فرض</span>
                            <DropDown
                                label={'ساعت شروع:'}
                                field={defaultStartTime}
                                setField={setDefaultStartTime}
                                list={listTime_ClosedOption}
                                labelPosition="inside"
                                width={100}
                            />
                            <DropDown
                                label={'ساعت پایان:'}
                                field={defaultEndTime}
                                setField={setDefaultEndTime}
                                list={listTime_ClosedOption}
                                labelPosition="inside"
                                width={100}
                            />
                        </div>
                    </Box>
                    
                    {/* Weekly Hours Box */}
                    <Box width={220} height={258}>
                        <div className='flex flex-col w-full items-center justify-center  p-[10px] h-full overflow-y-auto'>
                            <div className='flex text-center w-full space-x-[5px] mb-[10px] space-x-reverse text-[10px] h-[30px] items-center'>
                                <span className='flex w-[40px] '>روز</span>
                                <span className='w-[65px]'>شروع</span>
                                <span className='w-[60px]'>پایان</span>
                            </div>
                            <div className='flex flex-col  w-full  items-center justify-center  space-y-[5px] '>
                                {weekDays.map((day) => {
                                    const dayTime = dayTimeStates[day.key];
                                    return (
                                        <div key={day.key} className='flex w-full space-x-[5px] justify-center space-x-reverse '>
                                            <div className='flex w-[40px] justify-between items-center '>
                                                <span className='text-[9px] body-farsi-bold'>{day.display}</span>
                                            </div>
                                            <div className='flex justify-start w-[155px] items-center  '>
                                                <DropDown
                                                    label={''}
                                                    field={dayTime.start}
                                                    setField={(value) => handleStartTimeChange(day.key, value)}
                                                    list={listTime_ClosedOption}
                                                    labelPosition="inside"
                                                    width={60}
                                                />
                                                <DropDown
                                                    label={''}
                                                    field={dayTime.end}
                                                    setField={(value) => handleEndTimeChange(day.key, value)}
                                                    list={listTime_ClosedOption}
                                                    labelPosition="inside"
                                                    width={60}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Box>
                                </div>
                            </div>

                            {/* Modal Footer - Buttons */}
                            <div className="flex w-full justify-end space-x-[4px] space-x-reverse">
                            <button className='bg-[#B9ED00] w-[90px] h-[25px] text-[#fff] text-[9px] rounded-[2px]' onClick={saveSetting}>تایید </button>

                                <button
                                  onClick={() => setShowCourtAllCalender(false)}
                                    className="w-[101px] h-[24px] text-[#fff] bg-[#363740] text-[10px] rounded hover:bg-[#454650] transition-colors"
                                >
                                    بستن
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
        </>
    );
};

export default CourtAllCalender;