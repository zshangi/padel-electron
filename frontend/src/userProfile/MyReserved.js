import React, { useState, useEffect } from 'react';
import { backendAccessGet } from '../utils/Authentication';
import { 
  formatJalaliDateString,
  formatPersianTime,
  formatNumber 
} from '../utils/numberUtils';

const MyReserved = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const loadReservedData = async () => {
      try {
        const response = await backendAccessGet("api/reserved/fetch_user/");
        const reservations = response.reserved || [];
        console.log('reservations',reservations)
        const grouped = new Map();
        reservations.forEach(res => {
          const key = res.package_id || `single_${res.id}`;
          if (!grouped.has(key)) {
            grouped.set(key, []);
          }
          grouped.get(key).push(res);
        });

        const sortedGroups = Array.from(grouped.values()).sort((a, b) => {
          const maxIdA = Math.max(...a.map(r => r.id));
          const maxIdB = Math.max(...b.map(r => r.id));
          return maxIdB - maxIdA;
        });

        setGroups(sortedGroups);
      } catch (error) {
        console.error('Failed to fetch reserved ', error);
      }
    };

    loadReservedData();
  }, []);

  return (
    <div className='flex w-full justify-center items-start body-farsi bg-[#fbfbfb] text-[10px] px-[10px] mb-[20xp]' style={{ direction: 'rtl' }}>
      <div className='flex flex-col w-full space-y-[10px] mt-[20px] max-w-[393px] justify-start items-center'>
             <div
                
                className='flex flex-col items-center justify-center bg-[#f6f6f6] w-full space-y-[5px] rounded-[14px] shadow-md p-[20px] '
              >
                <span> شماره پشتیبانی جهت امور رزرو و پرداخت :۰۹۱۲۱۵۳۹۱۸۳ </span>
               
                <span>شماره کارت جهت پرداخت:  ۶۲۱۹-۸۶۱۹-۴۹۱۰-۱۲۱۲</span>
            
              </div> 
        {groups.length === 0 ? (
          <p className="text-gray-500 py-6">هیچ رزروی یافت نشد.</p>
        ) : (
          groups.map((group, groupIndex) => {
            const isPackage = group.length > 1 || group[0].package_id;
            const courtId = group[0].court_id; // All have same court_id in a package
            const couchId = group[0].couch_id;
            return (
              <div
                key={groupIndex}
                className='flex flex-col w-full  space-y-[10px] text-[12px] rounded-[14px] shadow-md p-[20px] bg-white'
              >
                {/* Package header */}
                {isPackage && (
                  <div className="pb-2 ">
                    <span className="font-bold text-[12px] body-farsi-bold">
                      پکیج {formatNumber(group.length)} جلسه ای
                        {couchId ?
                    <>(با مربی)</> 
                    :
                    <>(بدون مربی)</>   
                    }
                    </span>
                  </div>
                )}
               {isPackage && (
                  <div className="text-gray-600 ">
                         تعداد جلسات : {formatNumber(group.length)}
                        </div>           
          )}
                {/* List of time slots */}
                <div className="space-y-2">
                  {group.map((res, idx) => (
                    <div key={res.id}>
         
                      <div className="font-bold text-[12px] body-farsi-bold" >
                        {formatJalaliDateString(res.selected_day)} |  {formatPersianTime(res.selected_time)}
                      </div>
                     

                      {/* Only show court_id for standalone items */}
                      {!isPackage && (
                        <div className="text-gray-600 mt-1">
                          <span className='body-farsi-bold'>زمین:</span> {res.data.court_name}
                        </div>
                      )}
                               {!isPackage && (
                        <div className="text-gray-600 mt-1">
                          <span className='body-farsi-bold'>مبلغ قابل پرداخت:</span>{formatNumber(res.data.totalPrice)}
                        </div>
                      )}
                                  {!isPackage && (
                        <div className="text-gray-600 mt-1">
                          <span className='body-farsi-bold'>مبلغ پرداخت شده:</span> {formatNumber(res.data.payment)}
                        </div>
                      )}
                                     {!isPackage && (
                        <div className="text-gray-600 mt-1">
                          <span className='body-farsi-bold'>مبلغ باقیمانده:</span> {formatNumber(Number(res.data.totalPrice-res.data.payment))}
                        </div>
                      )}

                      {res.couch_id && (
                        <div className="text-gray-600 mt-1">
                           <span className='body-farsi-bold'>مربی:</span> {res.data.couch_name}
                        </div>
                      )}
                
                    </div>
                  ))}
                          <button className='bg-black mt-[5px] text-white w-[100px] h-[20px] rounded-[2px] text-[10px] justify-center items-center flex'>
درخواست پشتیبانی                </button>
                </div>

                {/* Show court_id ONCE for packages */}
                {isPackage && courtId != null && (
                  <div className=" text-gray-600 text-[12px] body-farsi-bold pt-2">
                    زمین: {formatNumber(courtId)}
                  </div>
                )}
              </div>
            );
          })
        )}

      </div>
    </div>
  );
};

export default MyReserved;