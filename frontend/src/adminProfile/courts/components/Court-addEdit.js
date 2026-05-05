import React, { useState, useEffect } from 'react';
import Box from '../../components/Box';
import DropDown from '../../components/DropDown';
import Input from '../../components/Input';
import { backendAccessPost } from '../../../utils/Authentication';
import { mainCategoryConfig, normalizeNumericFieldsByConfig } from '../../../utils/categoryConfig';
import { weekDays, listTime_ClosedOption } from '../../../utils/calenderUtils'
import { generateWorkingSlots } from "../../../utils/timeSlots";

const courtCategoryConfig = mainCategoryConfig.find(cat => cat.value === '1');
if (!courtCategoryConfig) {
  throw new Error('Court category config (value="1") missing');
}

const CourtModal = ({
  showModal,
  setShowModal,
  fetchCourts,
  category,
  categorycontent,
  setting,
  maincategory_id = '3',
  mode = 'add',
  courtData = null,
  courtId = null
}) => {
  const [courtName, setCourtName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [hasAI, setHasAI] = useState(false);

  const [defaultStartTime, setDefaultStartTime] = useState('6');
  const [defaultEndTime, setDefaultEndTime] = useState('23');
  const [dayTimeStates, setDayTimeStates] = useState({});
  const initialPriceData = {};
  courtCategoryConfig.content.forEach(field => {
    initialPriceData[field.key] = '';
  });
  const [priceData, setPriceData] = useState(initialPriceData);

  const listTime_ClosedOptionOptions = listTime_ClosedOption;

  const filteredCategories = category.filter(cat => cat.maincategory_id === maincategory_id);

  useEffect(() => {
    if (!showModal) return;

    if (mode === 'add' && setting?.length > 0) {
      initWorkingHoursFromSetting(setting[0].data);
    }
  }, [showModal, mode, setting]);

  // Edit mode setup
  useEffect(() => {
    if (!showModal || mode !== 'edit' || !courtData) return;

    setCourtName(courtData.name || '');
    setSelectedCategory(courtData.data.category_id || '');
    setSelectedSubcategory('');
    setHasAI(courtData.data.hasAI || false);

    const newPriceData = { ...initialPriceData };
    if (courtData.data.priceData) {
      courtCategoryConfig.content.forEach(field => {
        if (field.key === 'supportmobile') {
          newPriceData[field.key] = courtData.data.priceData[field.key] || courtData.data.supportMobile || '';
        } else if (field.key === 'time') {
          newPriceData[field.key] = courtData.data.priceData[field.key] || courtData.data.time || '';
        } else {
          newPriceData[field.key] = courtData.data.priceData[field.key] || '';
        }
      });
    }
    setPriceData(newPriceData);

    const start = courtData.data.defaultWorkingHours?.startTime || '6';
    const end = courtData.data.defaultWorkingHours?.endTime || '23';

    setDefaultStartTime(start);
    setDefaultEndTime(end);

    const newDayTimeStates = {};

    weekDays.forEach(day => {
      const dayKey = day.shortKey;
      const slots = courtData.data?.workingHours?.[dayKey] || [];

      if (!slots.length) {
        newDayTimeStates[dayKey] = {
          start: 'closed',
          end: 'closed'
        };
        return;
      }

      // ----- OPEN -----
      const firstSlot = slots[0];
      const lastSlot = slots[slots.length - 1];

      const start = firstSlot.split('-')[0];
      const end = lastSlot.split('-')[1];

      newDayTimeStates[dayKey] = {
        start: start.replace(':00', ''),
        end: end.replace(':00', '')
      };
    });

    setDayTimeStates(newDayTimeStates);


    setDayTimeStates(newDayTimeStates);


    setDayTimeStates(newDayTimeStates);
  }, [showModal, mode, courtData]);

  useEffect(() => {
    const newPriceData = { ...initialPriceData };

    if (selectedCategory) {
      const categoryContentItem = categorycontent.find(
        item => String(item.category_id) === String(selectedCategory)
      );

      if (categoryContentItem?.categorycontent) {
        courtCategoryConfig.content.forEach(field => {
          if (categoryContentItem.categorycontent[field.key] !== undefined) {
            newPriceData[field.key] = categoryContentItem.categorycontent[field.key];
          }
        });
      }

      if (selectedSubcategory && Array.isArray(categoryContentItem?.subcategorycontent)) {
        const subcategoryContent = categoryContentItem.subcategorycontent.find(
          item => String(item.subcategory_id) === String(selectedSubcategory)
        );

        if (subcategoryContent) {
          const subKeys = Object.keys(subcategoryContent).filter(key => key !== 'subcategory_id');
          const hasUsableSubContent = subKeys.some(key => {
            const value = subcategoryContent[key];
            return value !== undefined && value !== null && String(value).trim() !== '';
          });

          // If subcategory has content, override parent values.
          // If not, keep parent content already copied above.
          if (hasUsableSubContent) {
            courtCategoryConfig.content.forEach(field => {
              if (subcategoryContent[field.key] !== undefined && subcategoryContent[field.key] !== null && String(subcategoryContent[field.key]).trim() !== '') {
                newPriceData[field.key] = subcategoryContent[field.key];
              }
            });
          }
        }
      }
    }

    setPriceData(newPriceData);
  }, [selectedCategory, selectedSubcategory, categorycontent]);

  const handlePriceChange = (fieldKey, value) => {
    setPriceData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const initWorkingHoursFromSetting = (settingData) => {
    if (!settingData) return;

    const start = settingData.defaultWorkingHours?.startTime || "6";
    const end = settingData.defaultWorkingHours?.endTime || "23";

    setDefaultStartTime(start);
    setDefaultEndTime(end);

    const newDayTimeStates = {};

    // defaults
    weekDays.forEach(day => {
      newDayTimeStates[day.shortKey] = { start, end };
    });

    // overrides
    if (settingData.workingHours) {
      Object.keys(settingData.workingHours).forEach(day => {
        newDayTimeStates[day] = {
          start: settingData.workingHours[day].startTime,
          end: settingData.workingHours[day].endTime
        };
      });
    }

    setDayTimeStates(newDayTimeStates);
  };


  const resetForm = () => {
    setCourtName('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setHasAI(false);
    setPriceData({ ...initialPriceData });
    setDayTimeStates({});
  };

  const handleSubmit = () => {
    const normalizedPriceData = normalizeNumericFieldsByConfig(priceData, courtCategoryConfig);
    let finalDayStates = dayTimeStates;

    if (!finalDayStates && setting?.length > 0) {
      finalDayStates = {};

      Object.keys(setting[0].data.workingHours).forEach(day => {
        finalDayStates[day] = {
          start: setting[0].data.workingHours[day].startTime,
          end: setting[0].data.workingHours[day].endTime
        };
      });
    }

    const courtData = {
      name: courtName,
      status: 'active',
      data: {
        supportMobile: normalizedPriceData.supportmobile || '',
        category_id: selectedCategory,
        subcategory_id: '',
        hasAI,
        priceData: normalizedPriceData,
        defaultWorkingHours: {          startTime: defaultStartTime,
          endTime: defaultEndTime
        },
        workingHours: {}
      }
    };

    weekDays.forEach(day => {
      const dayKey = day.shortKey;
      const dayTime = dayTimeStates[dayKey];
      if (!dayTime || dayTime.start === "closed") {
        courtData.data.workingHours[dayKey] = [];
        return;
      }

      const start = `${dayTime.start}:00`;
      const end = `${dayTime.end}:00`;

      courtData.data.workingHours[dayKey] =
        generateWorkingSlots(start, end, Number(normalizedPriceData.time));
    });



    const endpoint = mode === 'edit'
      ? `/api/court/update/${courtId}/`
      : "/api/court/add/";

    backendAccessPost(endpoint, courtData)
      .then(data => {
        if (data.success) {
          setShowModal(false);
          fetchCourts();
        } else {
          console.error(`Error ${mode === 'edit' ? 'updating' : 'adding'} court:`, data.error);
          alert(`خطا در ${mode === 'edit' ? 'به‌روزرسانی' : 'افزودن'} زمین`);
        }
      })
      .catch(err => {
        console.error('Error:', err);
        alert("مشکلی پیش آمد. دوباره تلاش کنید.");
      });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (!showModal) return null;

  return (
    <>
      <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-[#4D4D4D]">
        <div className="relative w-[672px] h-[565px]">
          <div className="border-0 rounded-[20px] shadow-lg relative flex flex-col w-[672px] bg-[#F8F8F8] outline-none focus:outline-none p-[15px]">

            <div className="flex flex-col w-full justify-center items-start p-[30px] text-center space-y-[25px]">
              <div className='flex w-full h-[450px] space-x-[10px] space-x-reverse'>
                <Box width={360} height={447}>
                  <div className='flex flex-col space-y-[10px]'>

                    <div className='flex w-full justify-between h-[45px] '>
                      <Input
                        label="نام زمین"
                        value={courtName}
                        onChange={(e) => setCourtName(e.target.value)}
                        placeholder="مثال: زمین شماره ۱"
                        required
                      />
                    </div>

                    <div className='flex w-full justify-between h-[45px] '>
                      <DropDown
                        label={'دسته بندی'}
                        field={selectedCategory}
                        setField={setSelectedCategory}
                        list={filteredCategories.map(cat => ({
                          value: cat.id,
                          label: cat.name
                        }))}
                        width={155}
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-[5px]'>
                      {courtCategoryConfig.content
                        .filter(field => field.key !== 'mainprice')
                        .map(field => (
                        <Input
                          key={field.key}
                          label={field.label}
                          value={priceData[field.key] || ''}
                          onChange={(e) => handlePriceChange(field.key, e.target.value)}
                          type={field.type}
                          disabled={field.key === 'time' || field.key === 'supportmobile'}
                        />
                      ))}
                    </div>
                  </div>
                </Box>

                <div className="flex flex-col space-y-[10px] ">
                  <Box width={232} height={108}>
                    <div className='flex flex-col space-y-[5px] justify-start w-full items-start '>
                      <span className='text-[10px] body-farsi-bold'>ساعات کاری پیش‌فرض زمین</span>
                      <DropDown
                        label={'ساعت شروع:'}
                        field={defaultStartTime}
                        setField={setDefaultStartTime}
                        list={listTime_ClosedOptionOptions}
                        labelPosition="inside"
                        width={100}
                      />
                      <DropDown
                        label={'ساعت پایان:'}
                        field={defaultEndTime}
                        setField={setDefaultEndTime}
                        list={listTime_ClosedOptionOptions}
                        labelPosition="inside"
                        width={100}
                      />
                    </div>
                  </Box>
                  <Box width={232} height={333}>
                    <div className='flex flex-col p-[10px] h-full overflow-y-hidden'>
                      <div className='flex  w-[200px] space-x-[5px] mb-[10px] space-x-reverse text-[10px] h-[30px] items-center'>
                        <span className='flex text-start w-[40px] '>روز</span>
                        <span className='w-[65px]'>ساعت شروع</span>
                        <span className='w-[60px]'>ساعت پایان</span>
                      </div>
                      <div className='flex flex-col space-y-[5px]'>
                        {weekDays.map((day) => {
                          const dayTime = dayTimeStates[day.shortKey];

                          const isClosed = dayTime?.start === 'closed';

                          return (
                            <div key={day.key} className='flex w-[200px] space-x-[5px] space-x-reverse'>
                              <div className='flex w-[40px] justify-between items-center'>
                                <span className='text-[9px] body-farsi-bold'>{day.display}</span>
                              </div>

                              <div className='flex justify-start w-[155px] items-center'>
                                {/* START */}
                                <DropDown
                                  label=""
                                  field={dayTime ? dayTime.start : defaultStartTime}
                                  setField={(value) =>
                                    setDayTimeStates(prev => ({
                                      ...prev,
                                      [day.shortKey]: {
                                        start: value,
                                        end: value === 'closed'
                                          ? 'closed'
                                          : (prev[day.shortKey]?.end ?? defaultEndTime)
                                      }
                                    }))
                                  }
                                  list={listTime_ClosedOptionOptions}
                                  width={60}
                                  labelPosition="inside"
                                />

                                {/* END */}
                                <DropDown
                                  label=""
                                  disabled={isClosed}
                                  field={isClosed ? 'closed' : (dayTime ? dayTime.end : defaultEndTime)}
                                  setField={(value) =>
                                    setDayTimeStates(prev => ({
                                      ...prev,
                                      [day.shortKey]: {
                                        ...prev[day.shortKey],
                                        end: value
                                      }
                                    }))
                                  }
                                  list={listTime_ClosedOptionOptions}
                                  width={60}
                                  labelPosition="inside"
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

              <div className="flex w-full justify-end space-x-[4px] space-x-reverse">
                <button
                  onClick={handleSubmit}
                  className="w-[101px] h-[24px] text-[#000] bg-[#B9ED00] text-[10px] rounded hover:bg-[#a8d400] transition-colors"
                >
                  {mode === 'edit' ? 'به‌روزرسانی' : 'تایید'}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="w-[101px] h-[24px] text-[#B9ED00] bg-[#363740] text-[10px] rounded hover:bg-[#454650] transition-colors"
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

export default CourtModal;
