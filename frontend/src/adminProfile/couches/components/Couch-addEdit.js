import React, { useState, useEffect } from 'react';
import Box from '../../components/Box';
import DropDown from '../../components/DropDown';
import Input from '../../components/Input';
import { backendAccessPost,backendAccessGet } from '../../../utils/Authentication';
import { mainCategoryConfig } from '../../../utils/categoryConfig';
import { weekDays, listTime_ClosedOption } from '../../../utils/calenderUtils'

// ✅ Extract court-specific config
const courtCategoryConfig = mainCategoryConfig.find(cat => cat.value === '3');
if (!courtCategoryConfig) {
  throw new Error('Court category config (value="1") missing');
}
const levelList = [
  { value: '1', label: '۱' },
  { value: '2', label: '۲' },
  { value: '3', label: '۳' }
];
const CouchModal = ({
  showModal,
  setShowModal,
  category,
  subcategory,
  categorycontent,
  setting,
  maincategory_id = '3',
  mode = 'add',
  couchData = null,
  couchId = null,
  setCouches
}) => {
  const [couchName, setCouchName] = useState('');
  const [tel, setTel] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [dateBirth, setDateBirth] = useState('')
  const [mobile, setMobile] = useState('')
  const [level, setLevel] = useState('')
  const [resume, setResume] = useState('')
  const [experience, setExperience] = useState('')
  const initialPriceData = {};
  courtCategoryConfig.content.forEach(field => {
    initialPriceData[field.key] = '';
  });
  const [priceData, setPriceData] = useState(initialPriceData);


  const filteredCategories = category.filter(cat => cat.maincategory_id === maincategory_id);
  const filteredSubcategories = selectedCategory
    ? subcategory.filter(sub => Number(sub.category_id) === selectedCategory)
    : [];

  useEffect(() => {
    if (!showModal) return;

    if (mode === 'add' && setting?.length > 0) {
      initWorkingHoursFromSetting(setting[0].data);
    }
  }, [showModal, mode, setting]);

  useEffect(() => {
    if (!showModal || mode !== 'edit' || !couchData) return;

    setCouchName(couchData.name || '');
    setDateBirth(couchData.data.dateBirth || '');
    setLevel(couchData.data.level || '');
    setMobile(couchData.data.mobile || '');
    setSelectedCategory(couchData.data.category_id || '');
    setSelectedSubcategory(couchData.data.subcategory_id || '');
    setResume(couchData.data.resume || '')
    setExperience(couchData.data.experience || '')

    const newPriceData = { ...initialPriceData };
    if (couchData.data.priceData) {
      courtCategoryConfig.content.forEach(field => {
        newPriceData[field.key] = couchData.data.priceData[field.key] || '';
      });
    }
    setPriceData(newPriceData);


  }, [showModal, mode, couchData]);

  useEffect(() => {
    const newPriceData = { ...initialPriceData };

    if (selectedSubcategory) {
      const categoryContentItem = categorycontent.find(
        item => item.category_id === selectedCategory
      );

      if (categoryContentItem?.subcategorycontent) {
        const subcategoryContent = categoryContentItem.subcategorycontent.find(
          item => item.subcategory_id === selectedSubcategory
        );

        if (subcategoryContent) {
          courtCategoryConfig.content.forEach(field => {
            if (subcategoryContent[field.key] !== undefined) {
              newPriceData[field.key] = subcategoryContent[field.key];
            }
          });
        }
      }
    } else if (selectedCategory) {
      const categoryContentItem = categorycontent.find(
        item => item.category_id === selectedCategory
      );

      if (categoryContentItem?.categorycontent) {
        courtCategoryConfig.content.forEach(field => {
          if (categoryContentItem.categorycontent[field.key] !== undefined) {
            newPriceData[field.key] = categoryContentItem.categorycontent[field.key];
          }
        });
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

    const start = settingData.defaultWorkingHours?.startTime || '6';
    const end = settingData.defaultWorkingHours?.endTime || '23';

  };

  const resetForm = () => {
    setCouchName('');
    setTel('');
    setDateBirth('')
    setLevel('')
    setSelectedCategory('');
    setSelectedSubcategory('');
    setPriceData({ ...initialPriceData });
  };

  const handleSubmit  = async () =>  {
    const couchData = {
      name: couchName,
      status: 'active',
      data: {
        mobile,
        dateBirth,
        level,
        category_id: selectedCategory,
        subcategory_id: selectedSubcategory,
        priceData,
        resume,
        experience
      }
    };

    const endpoint = mode === 'edit'
      ? `/api/couch/update/${couchId}/`
      : "/api/couch/add/";
    backendAccessPost(endpoint, couchData)
      .then(res => {
            try {
                setCouches(res.couchs || [])
    

            } catch (error) {
                console.error('Error fetching data:', error);
                
            } finally {
                 setShowModal(false);
   
            }
        })
  
 

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
                        label="نام و نام خانوادگی:"
                        value={couchName}
                        onChange={(e) => setCouchName(e.target.value)}
                        required
                      />

                      <Input
                        label="تلفن تماس:"
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                      />
                    </div>
                    <div className='flex w-full justify-between h-[45px] '>
                      <Input
                        label="تاریخ تولد:"
                        value={dateBirth}
                        onChange={(e) => setDateBirth(e.target.value)}
                        placeholder="مثال:  ۱۳۶۵/۰۲/۱۰"
                        required
                      />
                      <DropDown
                        label={'سطح :'}
                        field={level}
                        setField={setLevel}
                        list={levelList}
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

                      <DropDown
                        label={'زیر دسته بندی'}
                        field={selectedSubcategory}
                        setField={setSelectedSubcategory}
                        list={filteredSubcategories.map(sub => ({
                          value: sub.id,
                          label: sub.name
                        }))}
                        width={155}
                      />
                    </div>

                    <div className='grid grid-cols-2 gap-[5px]'>
                      {courtCategoryConfig.content.map(field => (
                        <Input
                          key={field.key}
                          label={field.label}
                          value={priceData[field.key] || ''}
                          onChange={(e) => handlePriceChange(field.key, e.target.value)}
                          type={field.type === 'currency' ? 'text' : field.type}
                        />
                      ))}
                    </div>
                  </div>
                </Box>

                <div className="flex flex-col space-y-[10px]">
                  <Box width={232} height={100}>

                  </Box>
                  <Box width={232} height={254}>
                    <div className='flex flex-col space-y-[20px] p-[10px] h-full overflow-y-auto'>
                      <div className='text-start' >
                        <span className='text-[10px] text-start'>رزومه (معرفی)</span>
                        <textarea
                          label="رزومه (معرفی)"
                          type="textarea"
                          value={resume}
                          onChange={(e) => setResume(e.target.value)}

                          style={{ width: '200px', height: '120px', padding: '10px' }}
                          required
                          className={`
                                                                flex items-center rounded-[4px] border-[1px]  text-[10px]
                                                              `}

                        />
                      </div>
                      <Input
                        label="سابقه مربی"
                        type="text"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        required
                        width={200}

                      />
                    </div>
                  </Box>
                </div>
              </div>

              <div className="flex w-full justify-end space-x-[4px] space-x-reverse">
                <button
                  onClick={handleSubmit}
                  className="w-[101px] h-[24px] text-[#fff] bg-[#FF6F00] text-[10px] rounded hover:bg-[#FF6F00] transition-colors"
                >
                  {mode === 'edit' ? 'به‌روزرسانی' : 'تایید'}
                </button>
                <button
                  onClick={handleCloseModal}
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

export default CouchModal;