import React from 'react'
import { formatNumber } from '../utils/numberUtils'

const Package = ({ payload }) => {
  if (!payload) return null

  const {
    subject,
    discount,
    color = '#B9ED00',
    data ,
    buttonText,
    onClick,
  } = payload

  return (


      <div className='flex flex-col space-y-[5px] w-full h-[200px] px-[20px] text-white items-start justify-center bg-[#1E1E1E] rounded-[12px]'>
        <div className='w-full'>
          <span
            className='float-start body-farsi-bold'
            style={{ color }}
            dangerouslySetInnerHTML={{ __html: subject }}
          />
          {discount && (
            <div
              className='flex float-end rounded-[2px] w-[35px] h-[19px] justify-center items-center border'
              style={{ color, borderColor: color }}
            >
              {formatNumber(discount)} %
            </div>
          )}
        </div>

          <span className='body-farsi-bold'>{data[0].price}</span>
          <span className='body-farsi'>تعداد جلسات: <span className='body-farsi-bold'>{data[1].sessionNum}</span></span>
          <span className='body-farsi'>شروع: <span className='body-farsi-bold'>{data[2].start}</span></span>
          <span className='body-farsi'>روزهای: <span className='body-farsi-bold'>{data[3].days}</span></span>
          <span className='body-farsi'>ساعت: <span className='body-farsi-bold'>{data[4].times}</span></span>
          <span className='body-farsi'>{data[5].details}</span>


        <div className='flex w-full justify-center'>
          <button
            onClick={onClick}
            className='w-[116px] h-[19px] text-[#000] rounded-[2px]'
            style={{ backgroundColor: color }}
          >
            {buttonText}
          </button>
        </div>
      </div>
  )
}

export default Package
