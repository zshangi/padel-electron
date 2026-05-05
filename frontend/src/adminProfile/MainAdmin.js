import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { RiMenuUnfold2Line } from "react-icons/ri";
import { CiLogin } from "react-icons/ci";
import { MdKeyboardArrowDown } from "react-icons/md";
import { RxDashboard } from "react-icons/rx";

const Main = ({ children }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');
    const [selectedTopItem, setSelectedTopItem] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { key: 'reserve', label: 'داشبورد', path: '/admin-courts', image: 'menu-icon-dashboard.svg', color: '#B9ED00', back_img: 'reserve-selected-menu-item.svg' },
        { key: 'court', label: 'تقویم زمین ها', path: '/admin-courts', image: 'menu-icon-calender.svg', color: '#FF6F00', back_img: 'couch-selected-menu-item.svg' },
        { key: 'couch', label: 'مربی ها', path: '/admin-couches', image: 'menu-icon-couch.svg', color: '#005CD7', back_img: 'playmate-selected-menu-item.svg' },
        { key: 'package', label: 'پکیج ها', path: '/admin-packages', image: 'menu-icon-calender.svg', color: '#FF6F00', back_img: 'couch-selected-menu-item.svg' },
        { key: 'member', label: 'اعضا', path: '/admin-members', image: 'menu-icon-member.svg', color: '#FF000A', back_img: 'match-selected-menu-item.svg' },
        { key: 'setting', label: 'تظیمات', path: '/admin-setting', image: 'menu-icon-setting.svg', color: '#FF000A', back_img: 'match-selected-menu-item.svg' },
        { key: 'logout', label: 'خروج', path: '#', image: 'menu-icon-logout.svg', color: '#FF000A', back_img: 'match-selected-menu-item.svg' },
    ];

    const handleItemClick = (item) => {
        setSelectedItem(item.key);
        setShowMenu(false);
        if (item.path === '#') {
            return;
        }
        navigate(item.path);
    };

    useEffect(() => {
        const checkScreenSize = () => {
            setIsCollapsed(window.innerWidth < 1300);
        };

        checkScreenSize();

        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <div className="w-full  min-h-screen h-[100%] " style={{ direction: 'rtl' }}>
            <div
                className={`bg-[#363740] min-h-screen h-[100%] overflow-y-scroll float-start pt-[63px] ${isCollapsed?  'px-0' : 'px-[27px]'} transition-all duration-200`}
                style={{
                    width: isCollapsed ? '50px' : '210px',
                }}
            >
                {!isCollapsed && (
                    <div className="text-[24px] font-[900] text-white mb-6">پدلوند</div>
                )}

                <div className="flex flex-col space-y-[30px] pt-[50px]   bg-[#363740]">
                    {menuItems.map((item) => (
                        <div
                            key={item.key}
                            onClick={() => handleItemClick(item)}
                            className={`flex space-x-[10px] space-x-reverse justify-start items-center text-[14px] font-[500] cursor-pointer transition-opacity ${
                                isCollapsed ? 'justify-center' : ''
                            }`}
                            style={{ color: selectedItem === item.key ? '#fff' : '#A9A9A9' }}
                        >
                            <img
                                src={`/images/admin/${item.image}`}
                                alt=""
                                className={isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}
                            />
                            {!isCollapsed && <span>{item.label}</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div
                className="float-end min-h-screen h-[100%] bg-[#f6f6f6]  flex justify-center items-start"
                style={{
                    width: `calc(100% - ${isCollapsed ? '50px' : '210px'})`,
                }}
            >
                <div className="w-[1088px]  max-w-[100%] h-full py-[27px] px-[10px]">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Main;