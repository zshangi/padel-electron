import React, { useState, useEffect } from 'react';
import '../styles/PersianCalendar.css';

const Couches = () => {
  const [couches, setCouches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect is the correct place to fetch data when the component mounts
  useEffect(() => {
    const loadCouchesData = async () => {
      try {
        setLoading(true);
        setError(null);

        // --- REPLACE THIS WITH YOUR ACTUAL API CALL ---
        // Example using fetch:
        const response = await fetch('api/couch/fetch/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        // The data is nested under the "couchs" key in the response
        setCouches(result.couchs || []); // Use result.couchs to match your JSON structure

        // --- If you use Axios, it would look like this: ---
        /*
        import axios from 'axios';
        const response = await axios.get('YOUR_BACKEND_URL/api/couch/fetch/');
        setCouches(response.data.couchs || []);
        */

      } catch (err) {
        console.error("Failed to fetch couches:", err);
        setError("دریافت اطلاعات مربیان با مشکل مواجه شد. لطفاً دوباره تلاش کنید.");
        setCouches([]); // Clear old data on error
      } finally {
        setLoading(false);
      }
    };

    loadCouchesData();
  }, []); // The empty array [] ensures this effect runs only once

  // Helper function to create initials for the avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.substring(0, 2).toUpperCase(); // Get max 2 initials
  };
  
  // --- Conditional Rendering for Loading and Error States ---
  if (loading) {
    return <div className="flex justify-center items-center h-screen text-[#FF6F00] font-bold">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className='flex w-[100%] justify-center items-start body-farsi bg-[#fbfbfb] text-[10px] px-[10px] h-screen mb' style={{ direction: 'rtl' }}>
      <div className='flex flex-col w-full space-y-[10px] m-[20px] max-w-[393px] justify-start items-center'>
        {couches.length > 0 ? (
          couches.map((couch) => (
            // Use couch.id for a stable and unique key
            <div key={couch.id} className='flex flex-col w-full h-fit rounded-[14px] shadow-md p-[20px] bg-white'>
              <div className='flex w-full h-fit'>
                {/* Avatar instead of image */}
                <div className='flex-shrink-0 w-[70px] h-[70px] rounded-full bg-[#f6f6f6] flex items-center justify-center text-white text-[22px] font-bold shadow-sm'>
                  {getInitials(couch.data.name)}
                </div>
                <div className='flex flex-col justify-center pr-[14px] flex-grow'>
                  {/* Accessing data from the nested 'data' object */}
                  <span className='text-[#FF6F00] font-bold text-[14px]'>{couch.data.name}</span>
                  <span className='text-[12px] text-gray-600'>سطح: {couch.data.level || 'نامشخص'}</span>
                  <span className='text-[12px] text-gray-600'>سابقه: {couch.data.experience || 'نامشخص'}</span>
                </div>
              </div>
              
              {/* Displaying the resume from the nested data */}
              {couch.data.resume && (
                 <div className='mt-[10px] text-[11px] text-gray-700 leading-relaxed'>
                   <span className=" ">درباره مربی:</span> {couch.data.resume}
                 </div>
              )}

              <div className='mt-[15px] pt-[10px] border-t border-gray-200 flex justify-between items-center'>
                 <span className='text-[12px] text-gray-700'>
                    هزینه هر جلسه: {Number(couch.data.price).toLocaleString('fa-IR')} تومان
                 </span>
                 <span className='text-[12px] text-gray-500'>
                   
                 </span>
              </div>
            </div>
          ))
        ) : (
          <div className='text-gray-500 mt-10 font-bold'>هیچ مربی یافت نشد.</div>
        )}
      </div>
    </div>
  );
};

export default Couches;