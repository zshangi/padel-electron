import { formatNumber, formatGregorianToJalaliDateTime } from '../../../utils/numberUtils';
import { useState, useEffect } from 'react';
import Box from '../../../components/Box';
import DropDown from '../../components/DropDown';
import Input from '../../components/Input';
import { backendAccessPost, backendAccessGet } from '../../../utils/Authentication';
import { PiTrashLight } from "react-icons/pi";
import { AiOutlinePlus } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { Link, useParams } from 'react-router-dom';
const buildCouchStats = (reservations = []) => {
  const stats = {};

  reservations.forEach(res => {
    const id = res.couch_id;

    if (!stats[id]) {
      stats[id] = {
        sessions: 0,
        payable: 0,
        paid: 0,
        remain: 0
      };
    }

    const payable = Number(res.data?.payable || 0);
    const paid = Number(res.data?.paid || 0);

    stats[id].sessions += 1;
    stats[id].payable += payable;
    stats[id].paid += paid;
    stats[id].remain = stats[id].payable - stats[id].paid;
  });

  return stats;
};

const CouchAll = ({ reservations, couches,with_add_modal }) => {
  const couchStats = buildCouchStats(reservations);

  return (
    <>
      <div className="flex flex-col w-[100%] space-y-[2px] rounded-[14px] border-[0.3px] border-[#9C9C9C]">
      <div className='w-full border-b-[0.3px] border-[#9C9C9C]'>
          <div className="flex w-[300px] float-start items-center justify-start p-4 space-x-[15px] space-x-reverse">
            <label className="flex items-center text-[12px] text-[#7F7F7F]">
              <input
                type="checkbox"
                className="ml-[4px]"
              />
              فعال
            </label>
            <label className="flex items-center text-[12px] text-[#7F7F7F]">
              <input
                type="checkbox"
                className="ml-[4px]"
              />
               غیرفعال
            </label>
          </div>

          <div className='flex w-[calc(100%-600px)] items-center h-[54px] text-[12px] text-[#7F7F7F]'>
              <div className="flex w-full justify-center text-sm text-center">
              </div>
            
          </div>
          <div className='w-[300px] float-end'></div>
        </div>

        {/* Table header */}
        <div className='flex w-full items-center h-[54px] bg-[#fff] text-[12px] text-[#7F7F7F]'>
        <div className='flex justify-center w-[200px]'>نام مربی</div>

          <div className='flex justify-center w-[150px]'>شماره تماس</div>
          <div className='flex justify-center w-[100px]'>جلسات</div>
          <div className='flex justify-center w-[150px]'>قابل پرداخت</div>
          <div className='flex justify-center w-[150px]'> پرداخت شده</div>
          <div className='flex justify-center w-[150px]'>مانده </div>

          <div className='flex justify-center w-[calc(100%-800px)]'></div>
        </div>

        {couches?.map((cocuh, index) => {
  const isLastRow = index === couches.length - 1;

  const stats = couchStats[cocuh.id] || {
    sessions: 0,
    payable: 0,
    paid: 0,
    remain: 0,
  };

  return (
    <div
      key={index}
      className={
        `flex w-full items-center h-[54px] bg-[#fff] text-[12px] text-[#7F7F7F]
        ${!with_add_modal && isLastRow ? 'rounded-b-[14px]' : ''}`
      }
    >
      <div className='flex justify-center w-[200px]'>
        <Link to={`/admin-couch/${cocuh.id}`}>
          {cocuh.name}
        </Link>
      </div>

      <div className='flex justify-center w-[150px]'>
        {cocuh?.data?.mobile}
      </div>

      <div className='flex justify-center w-[100px]'>
        {formatNumber(stats.sessions)}
      </div>

      <div className='flex justify-center w-[150px]'>
        {formatNumber(stats.payable)}
      </div>

      <div className='flex justify-center w-[150px]'>
        {formatNumber(stats.paid)}
      </div>

      <div className='flex justify-center w-[150px]'>
        {formatNumber(stats.remain)}
      </div>

      <div className='flex items-center justify-center w-[calc(100%-800px)] space-x-2 space-x-reverse'>
        <button className='flex justify-center items-center bg-[#FF6F00] w-[100px] h-[25px] rounded-[2px] text-[9px] text-[#fff]'>
          صورتحساب
        </button>
        <FiEdit2 color={'#777777'} />
        <PiTrashLight color={'#FF6F00'} />
      </div>
    </div>
  );
})}



        {with_add_modal &&
         <div className='flex w-full justify-start py-[10px] px-[30px]'>
          <button
          
            className='flex justify-center items-center space-x-2 space-x-reverse text-[#FF6F00]'
          >
            <AiOutlinePlus /><span> اضافه کردن </span>
          </button>
        </div> 
}
      
      </div>



    </>
  );
};

export default CouchAll;