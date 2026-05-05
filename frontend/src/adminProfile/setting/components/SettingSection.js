import React, { useEffect, useState } from 'react';
import Box from '../../components/Box';
import DropDown from '../../components/DropDown';
import { backendAccessPost, backendAccessGet } from '../../../utils/Authentication';
import Input from '../../components/Input';
import {weekDays,listTime_ClosedOption} from '../../../utils/calenderUtils'



const Setting = () => {
    const [setting, setSetting] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddMode, setIsAddMode] = useState(true);

    const [defaultStartTime, setDefaultStartTime] = useState('6');
    const [defaultEndTime, setDefaultEndTime] = useState('21');

    const [dayTimeStates, setDayTimeStates] = useState({
        saturday: { start: '6', end: '23' },
        sunday: { start: '6', end: '23' },
        monday: { start: '6', end: '23' },
        tuesday: { start: '6', end: '23' },
        wednesday: { start: '6', end: '23' },
        thursday: { start: '6', end: '23' },
        friday: { start: '6', end: '23' }
    });

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

                    if (settingsData.data && settingsData.data.defaultWorkingHours) {
                        const { startTime, endTime } = settingsData.data.defaultWorkingHours;
                        setDefaultStartTime(startTime);
                        setDefaultEndTime(endTime);
                    }
                    
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

    const handleStartTimeChange = (dayKey, value) => {
        setDayTimeStates(prev => {
            const newState = { ...prev };
            newState[dayKey] = { ...newState[dayKey], start: value };
            
            if (value === 'closed') {
                newState[dayKey].end = 'closed';
            }
            
            return newState;
        });
    };

    const handleEndTimeChange = (dayKey, value) => {
        setDayTimeStates(prev => ({
            ...prev,
            [dayKey]: { ...prev[dayKey], end: value }
        }));
    };

    const settingData = {
        id: setting.length > 0 ? setting[0].id : null,
        data: {
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
            defaultWorkingHours: {
                startTime: defaultStartTime,
                endTime: defaultEndTime
            },
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

    return (
        <div className='flex flex-col space-y-[15px] w-full '>
            <div className='flex space-x-[15px] space-x-reverse'>
                <div className='flex flex-col space-y-[15px] w-[360px] h-[373px]'>
                    {/* Default Working Hours Box */}
                    <Box width={360} height={108}>
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
                    <Box width={360} height={460}>
                        <div className='flex flex-col w-full items-center justify-center p-[10px] h-full '>
                            <div className='flex text-center w-[200px] space-x-[5px] mb-[10px] space-x-reverse text-[10px] h-[30px] items-center'>
                                <span className='flex w-[40px] '>روز</span>
                                <span className='w-[65px]'>شروع</span>
                                <span className='w-[60px]'>پایان</span>
                            </div>
                            <div className='flex flex-col space-y-[5px] '>
                                {weekDays.map((day) => {
                                    const dayTime = dayTimeStates[day.key];
                                    return (
                                        <div key={day.key} className='flex w-[200px] space-x-[5px] space-x-reverse '>
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

                {/* Contact Information Box */}
                <Box width={701} height={400}>
                    <div className='flex flex-col p-[10px] space-y-[10px] h-full overflow-y-auto'>
                        <div className='flex flex-col gap-x-[15px] gap-y-[5px]'>
                            <Input label="نام:" value={name} onChange={(e) => setName(e.target.value)} required />
                            <span className='flex w-full text-start body-farsi-bold py-[10px] text-[10px]'>اطلاعات تماس</span>

                            <Input label="تلفن تماس:" value={tell} onChange={(e) => setTell(e.target.value)} width={560} labelPosition='inside' required />
                            <Input label="آدرس ایمیل:" value={email} onChange={(e) => setEmail(e.target.value)}  width={560} labelPosition='inside' />
                            <Input label="آدرس:" value={address} onChange={(e) => setAddress(e.target.value)}  width={560} labelPosition='inside' />
                            <Input label="موقعیت مکانی:" value={location} onChange={(e) => setLocation(e.target.value)}  width={560} labelPosition='inside' />
                            <Input label="لینک لینکدین:" value={linkedin} onChange={(e) => setLInkedin(e.target.value)}  width={560} labelPosition='inside'/>
                            <Input label="لینک اینستاگرام:" value={instagram} onChange={(e) => setInstagram(e.target.value)}  width={560} labelPosition='inside'/>
                            <Input label="لینک فیسبوک:" value={facebook} onChange={(e) => setFacebook(e.target.value)}  width={560} labelPosition='inside' />
                        </div>
                    </div>
                </Box>
            </div>
            <div className='flex justify-end px-[20px]'>
                <button className='bg-[#000] w-[90px] h-[25px] text-[#fff] text-[9px] rounded-[2px]' onClick={saveSetting}>ذخیره تغییرات</button>
            </div>
        </div>
    )
}

export default Setting;