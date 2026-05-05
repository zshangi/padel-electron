import React, { useState, useEffect } from 'react'
import Box from '../../components/Box'

const Header = ({showsetting,setshowsetting,showcategory,setshowcategory}) => {

    return (
        <>
            <div className='flex flex-col space-y-[15px] w-full'>
                <div className='flex space-x-[15px] space-x-reverse'>
                    <Box width={173} height={153}>
                    <div className='flex justify-center items-center p-[20px]'>
                            <div className="flex flex-col items-center relative">
                                <button onClick={() => [setshowsetting(true), setshowcategory(false)]} className="relative w-[85px] h-[85px] rounded-full border-[0.5px] cursor-pointer text-[11px] bg-white focus:outline-none">
                                    <img
                                        src={`${showsetting ? '/images/back-menu-purple.svg' : '/images/back-menu-item.svg'}`}
                                        className="w-[55px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                        alt=""
                                    />
                                    <img
                                        src={`/images/admin/setting-icon-setting.svg`}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    />
                                </button>
                                <div className="text-[11px] font-[500] mt-1">
                                    تنظیمات
                                </div>
                            </div>
                        </div>
                    </Box>
                    
                    <Box width={173} height={153}>
                    <div className='flex justify-center items-center p-[20px]'>
                            <div className="flex flex-col items-center relative">
                                <button onClick={() => [setshowsetting(false), setshowcategory(true)]} className="relative w-[85px] h-[85px] rounded-full border-[0.5px] cursor-pointer text-[11px] bg-white focus:outline-none">
                                    <img
                                        src={`${showcategory ? '/images/back-menu-purple.svg' : '/images/back-menu-item.svg'}`}
                                        className="w-[55px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                        alt=""
                                    />
                                    <img
                                        src={`/images/admin/setting-icon-category.svg`}
                                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                    />
                                </button>
                                <div className="text-[11px] font-[500] mt-1">
                                    دسته بندی
                                </div>
                            </div>
                        </div>
                    </Box>
                    
                    <Box width={173} height={153}>
                    
                    </Box>
                </div>

              
                
           
            </div>


        </>
    )
}

export default Header