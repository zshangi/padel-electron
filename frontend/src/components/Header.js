import React, { useState } from 'react';
import { RiMenuUnfold2Line } from "react-icons/ri";
import { CiLogin } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";

const Header = () => {
  const [showMenu, setShowMenu] = useState(true);
  const [selectedItem, setSelectedItem] = useState('home'); // e.g., 'reserve', 'teammate', 'contact'
  const navigate = useNavigate();

  const menuItems = [
    { key: 'home', label: 'صفحه اصلی', path: '/' },
    { key: 'login', label: 'ورود', path: '/login' },
    // { key: 'contact', label: 'تماس با ما', path: '/contact' },
  ];

  const handleItemClick = (item) => {
    setSelectedItem(item.key);
    navigate(item.path);
    // Optionally close menu after selection:
    // setShowMenu(false);
  };

  return (
    <div className='flex w-[100%] justify-center items-start body-farsi bg-[#f6f6f6]' style={{ direction: 'rtl' }}>
      <div className='flex flex-col w-full max-w-[450px] justify-start'>
        <div className='flex w-full h-[70px] justify-between items-center px-[30px] bg-[#1e1e1e]'>
          <RiMenuUnfold2Line
            className="cursor-pointer"
            onClick={() => setShowMenu(!showMenu)}
            color={'#d6fe3d'}
            size={30}
          />
          <img onClick={() => navigate('/')} src={'./images/padelvand-logo.svg'} className='w-[123px] h-auto cursor-pointer' />
          <CiLogin color={'#d6fe3d'} size={30} />
        </div>

        {showMenu && (
          <div className='flex space-x-[30px] space-x-reverse w-full h-[50px] justify-center items-start px-[20px] bg-[#1e1e1e] body-farsi text-[#d6fe3d] relative'>
            {menuItems.map((item) => (
              <div key={item.key} className="flex flex-col items-center relative">
                <button
                  onClick={() => handleItemClick(item)}
                  className={`bg-transparent border-none cursor-pointer text-[11px] focus:outline-none ${selectedItem === item.key ? 'text-[#d6fe3d]' : 'text-[#fff]'}`}
                >
                  {item.label}
                </button>
                {selectedItem === item.key && (
                  <MdKeyboardArrowDown
                    color={'#d6fe3d'}
                    size={20}
                    className="mt-1" 
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
