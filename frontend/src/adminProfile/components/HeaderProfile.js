import React, { useState, useEffect } from 'react';
import { RiMenuUnfold2Line } from "react-icons/ri";
import { CiLogin } from "react-icons/ci";
import { useNavigate, useLocation } from "react-router-dom"; // <-- import useLocation
import { MdKeyboardArrowDown } from "react-icons/md";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
    const [selectedTopItem, setSelectedTopItem] = useState('');

  const navigate = useNavigate();
  const location = useLocation(); // <-- hook to detect current URL

  const menuTopItems = [
    { key: 'packages', label: 'پکیج ها', path: '/packages', image: 'playmate-icon.svg', color:'#005CD7', back_img:'playmate-selected-menu-item.svg' },
    { key: 'matches', label: 'مسابقات', path: '/matches', image: 'match-icon.svg', color:'#FF000A', back_img:'match-selected-menu-item.svg' },
  ];

    const menuItems = [
    { key: 'reserve', label: 'رزرو زمین پدل', path: '/user-home', image: 'reserve-menu-icon.svg', color:'#B9ED00', back_img:'reserve-selected-menu-item.svg' },
    { key: 'couch', label: 'زمین و مربی', path: '/reserved-playgroundCouch', image: 'reserve-couch-icon.svg', color:'#FF6F00', back_img:'couch-selected-menu-item.svg' },
    { key: 'palymate', label: 'همبازی', path: '/palymate', image: 'playmate-icon.svg', color:'#005CD7', back_img:'playmate-selected-menu-item.svg' },
    { key: 'match', label: 'مسابقه', path: '/reserve-match', image: 'match-icon.svg', color:'#FF000A', back_img:'match-selected-menu-item.svg' },
  ];
  useEffect(() => {
    const currentItem = menuItems.find(item => location.pathname.startsWith(item.path));
    if (currentItem) {
      setSelectedItem(currentItem.key);
    } else {
      setSelectedItem('');
    }
  }, [location.pathname]);

  const handleItemClick = (item) => {
    setSelectedItem(item.key);
    setShowMenu(false)
    navigate(item.path);
  };
    const handleTopItemClick = (item) => {
    setSelectedTopItem(item.key);
    navigate(item.path);
  };

  return (
    <div className='flex w-[100%] h-fit justify-center items-start body-farsi bg-[#fbfbfb]' style={{ direction: 'rtl' }}>
      <div className='flex flex-col w-full max-w-[393px] justify-start bg-[#1e1e1e]'>
        <div className='flex w-full h-[70px] justify-between items-center px-[30px] bg-[#1e1e1e]'>
          <RiMenuUnfold2Line
            className="cursor-pointer"
            onClick={() => setShowMenu(!showMenu)}
            color={'#d6fe3d'}
            size={30}
          />
          <img onClick={() => navigate('/')} src={'/images/padelvand-logo.svg'} className='w-[123px] h-auto cursor-pointer' />
          <CiLogin color={'#d6fe3d'} size={30} />
        </div>
  {showMenu && (
          <div className='flex space-x-[30px] space-x-reverse w-full h-[50px] justify-center items-start px-[20px] bg-[#1e1e1e] body-farsi text-[#d6fe3d] relative'>
            {menuTopItems.map((item) => (
              <div key={item.key} className="flex flex-col items-center relative">
                <button
                  onClick={() => handleTopItemClick(item)}
                  className={`bg-transparent border-none cursor-pointer text-[11px] focus:outline-none ${selectedTopItem === item.key ? 'text-[#d6fe3d]' : 'text-[#fff]'}`}
                >
                  {item.label}
                </button>
                {selectedTopItem === item.key && (
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
     
      <div className='flex flex-col w-full max-w-[393px] justify-start bg-[#fbfbfb]'>

        <div className='flex flex-col w-full h-[60px] space-y-[5px] justify-center items-center p-[5px] bg-[#fbfbfb]'>
          <span className='text-[10px]'>ساعت های کاری</span>
          <span className='text-[12px]'>همه روزه ۶ صبح- ۱۰شب</span>
        </div>

          <div className='flex space-x-[5px] space-x-reverse   w-full h-[100px] justify-center items-start  body-farsi relative bg-[#fbfbfb]'>
            {menuItems.map((item) => (
              <div
                key={item.key}
                className="flex flex-col items-center relative w-[75px] h-[100px]"
              >
                <button
                  onClick={() => handleItemClick(item)}
                  className="relative w-[75px] h-[75px] rounded-full border cursor-pointer text-[11px] bg-white focus:outline-none"
                  style={{border:'0.1px solid',
                    borderColor: selectedItem === item.key ? item.color : '#B3B5B880',
                    color: selectedItem === item.key ? item.color : '#B3B5B880',
                  }}
                >
                  <img
                    src={
                      selectedItem === item.key
                        ? `/images/${item.back_img}`
                        : '/images/back-menu-item.svg'
                    }
                    className="w-[55px]  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    alt=""
                  />

                  {/* Icon image */}
                  <img
                    src={`/images/${item.image}`}
                    className="absolute top-1/2 left-1/2  transform -translate-x-1/2 -translate-y-1/2"
                    alt={item.label}
                  />
                </button>

                <div
                  className="text-[11px] font-[500] mt-1"
                  style={{ color: selectedItem === item.key ? item.color : '#000' }}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
       
      </div>
      </div>
    </div>
  );
};

export default Header;
