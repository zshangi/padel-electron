import React from 'react'
import { Link } from 'react-router-dom'

const CreatePackage = ({color,link}) => {
  return (
      

               <div className='flex flex-col space-y-[5px] w-full h-[80px] bg-white rounded-[12px]  items-center justify-center shadow-md'>
        <span>پکیج خودت رو بساز</span>
          <span> با انتخاب تاریخ و ساعت های مورد نظرت از همین حالا زمینت رو رزرو کن!</span>
                <Link to={link} className={`flex justify-center items-center w-[116px] h-[19px]  text-[#fff] rounded-[2px]`} style={{backgroundColor : color}}>ساخت پکیج</Link>

    </div>
  )
}

export default CreatePackage
