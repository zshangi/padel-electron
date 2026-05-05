import React, { useState, useEffect } from 'react';
import { backendAccessPost, backendAccessGet, backendMe, backendAccessPostNoAuth } from '../utils/Authentication'
import { PiTrashLight } from "react-icons/pi";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import DropDown from './components/DropDown'
import Input from './components/Input'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FiEdit2 } from "react-icons/fi";
import Box from './components/Box';

const MembershipRequests = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [name, setName] = useState("")
    const [mobile, setMobile] = useState("")
    const [level, setLevel] = useState("")
    const [birthDate, setDateBirth] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState("")
    const [hasError, setHasError] = useState(false)
    const [editingMemberId, setEditingMemberId] = useState(null)
    let navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([
                fetchPendingRequests(),
                fetchApprovedRequests()
            ]);
            setLoading(false);
        };

        fetchData();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            const response = await backendAccessGet('/api/members/pending/');
            if (response.success) {
                setPendingRequests(response.data);
            } else {
                setMessage('خطا در دریافت درخواست‌ها');
            }
        } catch (error) {
            setMessage('خطا در ارتباط با سرور');
            console.error('Error fetching pending requests:', error);
        }
    };

    const fetchApprovedRequests = async () => {
        try {
            const response = await backendAccessGet('/api/members/approved/');
            setApprovedRequests(response["approved_members"] || []);
        } catch (error) {
            setMessage('خطا در ارتباط با سرور');
            console.error('Error fetching approved requests:', error);
        }
    };

    const handleApprove = async (memberId) => {
        try {
            const response = await backendAccessPost(`/api/members/approve/${memberId}/`);
            if (response.success) {
                setMessage('عضویت با موفقیت تایید شد');
                // Refresh both lists
                await Promise.all([
                    fetchPendingRequests(),
                    fetchApprovedRequests()
                ]);
            } else {
                setMessage('خطا در تایید عضویت: ' + response.message);
            }
        } catch (error) {
            setMessage('خطا در ارتباط با سرور');
            console.error('Error approving membership:', error);
        }
    };

    const handleReject = async (memberId) => {
        try {
            const response = await backendAccessPost(`/api/members/reject/${memberId}/`);
            if (response.success) {
                setMessage('عضویت با موفقیت رد شد');
                fetchPendingRequests();
                fetchApprovedRequests();
            } else {
                setMessage('خطا در رد عضویت: ' + response.message);
            }
        } catch (error) {
            setMessage('خطا در ارتباط با سرور');
            console.error('Error rejecting membership:', error);
        }
    };

    const handleEdit = (member) => {
        setEditingMemberId(member.id);
        setName(member.name);
        setMobile(member.mobile);
        setLevel(member.level_id);
        setDateBirth(member.birth_date);
        setShowEditModal(true);
    };

    if (loading) {
        return <div>در حال بارگذاری...</div>;
    }

    const listLevel = [
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: '+C', label: '+C' },
        { value: 'C', label: 'C' },
        { value: '-C', label: '-C' },
        { value: '+D', label: '+D' },
        { value: 'D', label: 'D' },
        { value: '-D', label: '-D' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setHasError(false);
        setSubmitMessage("");

        try {
            const response = await backendAccessPost('/api/members/add-Approved-member/', {
                name,
                mobile,
                level_id: level,
                birth_date: birthDate,
            });

            if (response.success) {
                fetchApprovedRequests()
                setShowAddModal(false)
                // Reset form
                setName("");
                setMobile("");
                setLevel("");
                setDateBirth("");
            } else {
                setHasError(true);
                setSubmitMessage(response.message || "خطا در ثبت درخواست. لطفا دوباره تلاش کنید.");
            }
        } catch (error) {
            setHasError(true);
            setSubmitMessage("خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.");
            console.error("Error submitting membership request:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setHasError(false);
        setSubmitMessage("");

        try {
            const response = await backendAccessPost(`/api/members/update/${editingMemberId}/`, {
                name,
                mobile,
                level_id: level,
                birth_date: birthDate,
            });

            if (response.success) {
                fetchApprovedRequests()
                setShowEditModal(false)
                // Reset form
                setName("");
                setMobile("");
                setLevel("");
                setDateBirth("");
                setEditingMemberId(null);
            } else {
                setHasError(true);
                setSubmitMessage(response.message || "خطا در ویرایش اطلاعات. لطفا دوباره تلاش کنید.");
            }
        } catch (error) {
            setHasError(true);
            setSubmitMessage("خطا در ارتباط با سرور. لطفا دوباره تلاش کنید.");
            console.error("Error editing member:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col ">

                <div className='flex p-[10px] text-[#4E4E4E] text-[13px]'>درخواست های جدید عضویت</div>

                <div className="flex flex-col bg-white rounded-[14px] border-[0.5px] border-[#9C9C9C] mb-6">
                    <div className='flex w-full  items-center h-[54px] bg-[#f6f6f6] rounded-t-[14px] text-[12px] text-[#7F7F7F]'>
                        <div className=' flex justify-center w-[300px]'>نام و نام خانوادگی </div>
                        <div className='flex justify-center w-[200px]'>شماره تماس </div>
                        <div className='flex justify-center w-[100px]'> سطح</div>
                        <div className='flex justify-center w-[200px]'>تاریخ تولد </div>
                        <div className='flex justify-center w-[200px]'>تاریخ درخواست </div>
                        <div className='flex justify-center w-[200px] bg-black'>  </div>
                    </div>

                    {pendingRequests.length === 0 ? (
                        <div className='flex w-full justify-center items-center h-[54px] text-[12px] text-[#7F7F7F]'>
                            هیچ درخواست عضویتی وجود ندارد
                        </div>
                    ) : (
                        pendingRequests.map((request) => (
                            <div key={request.id} className='flex w-full  items-center h-[54px]  rounded-t-[14px] text-[12px] text-[#7F7F7F]'>
                                <div className=' flex justify-center w-[300px]'>{request.name}</div>
                                <div className=' flex justify-center w-[200px]'>{request.mobile}</div>
                                <div className=' flex justify-center w-[100px]'>{request.level_id}</div>
                                <div className=' flex justify-center w-[200px]'>{request.birth_date}</div>
                                <div className=' flex justify-center w-[200px]'>{new Date(request.created_at).toLocaleDateString('fa-IR')}</div>
                                <div className=' flex space-x-[10px] space-x-reverse justify-center items-center w-[200px] text-[10px]'>
                                    <button
                                        onClick={() => handleApprove(request.id)}
                                        className="bg-[#005CD7] hover:bg-green-700 text-white  py-1 px-3 rounded-[2px] mr-2"
                                    >
                                        تایید
                                    </button>
                                    <button
                                        onClick={() => handleReject(request.id)}
                                        className="bg-[#000] hover:bg-red-700 text-white  py-1 px-3 rounded-[2px] "
                                    >
                                        حذف
                                    </button>
                                    <FiEdit2 size={15} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className='flex p-[10px] text-[#4E4E4E] text-[13px]'>اعضای تایید شده</div>

                <div className="flex flex-col bg-white rounded-[14px] border-[0.5px] border-[#9C9C9C]">
                    <div className='flex w-full  items-center h-[54px] bg-[#f6f6f6] rounded-t-[14px] text-[12px] text-[#7F7F7F]'>
                        <div className=' flex justify-center w-[300px]'>نام و نام خانوادگی </div>
                        <div className='flex justify-center w-[200px]'>شماره تماس </div>
                        <div className='flex justify-center w-[100px]'> سطح</div>
                        <div className='flex justify-center w-[200px]'>تاریخ تولد </div>
                        <div className='flex justify-end w-[250px] '>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className='flex justify-center items-center  space-x-2 space-x-reverse text-[#005CD7]'
                            >
                                <AiOutlinePlus /><span> اضافه کردن </span>
                            </button>
                        </div>
                    </div>

                    {approvedRequests.length === 0 ? (
                        <div className='flex w-full justify-center items-center h-[54px] text-[12px] text-[#7F7F7F]'>
                            هیچ عضو تایید شده‌ای وجود ندارد
                        </div>
                    ) : (
                        approvedRequests.map((request) => (
                            <div key={request.id} className='flex w-full  items-center h-[54px]  rounded-t-[14px] text-[12px] text-[#7F7F7F]'>
                                <div className=' flex justify-center w-[300px]'>{request.name}</div>
                                <div className=' flex justify-center w-[200px]'>{request.mobile}</div>
                                <div className=' flex justify-center w-[100px]'>{request.level_id}</div>
                                <div className=' flex justify-center w-[200px]'>{request.birth_date}</div>
                                <div className=' flex space-x-[4px] space-x-reverse justify-center items-center w-[250px] text-[10px]'>
                                    <div className=' flex space-x-[20px] space-x-reverse justify-center items-center w-[200px] text-[10px]'>
                                        <button
                                            className="bg-[#005CD7] hover:bg-green-700 text-white  py-1 px-3 rounded-[2px] mr-2"
                                        >
                                            صورت حساب
                                        </button>

                                        <FiEdit2 
                                            size={15} 
                                            onClick={() => handleEdit(request)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                        <PiTrashLight onClick={() => handleReject(request.id)}
                                            size={15} color={'#005CD7'} style={{ cursor: 'pointer' }} />

                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <>
                    <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-[#4D4D4D]">
                        <div className="relative w-[450px]">
                            <div className="border-0 rounded-[20px] shadow-lg relative flex flex-col w-full bg-[#F8F8F8] outline-none focus:outline-none p-[20px]">
                                <Box widht={300} height={300}>
                                    <div className='flex flex-col space-y-[10px] w-full items-center h-fit p-[20px]'>
                                        <Input
                                            label="نام و نام خانوادگی :"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />

                                        <Input
                                            label="تلفن همراه :"
                                            type="text"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            required
                                        />

                                        <Input
                                            label=" تاریخ تولد:"
                                            value={birthDate}
                                            onChange={(e) => setDateBirth(e.target.value)}
                                            placeholder="مثال: ۱۳۷۰/۰۹/۲۱"
                                            required
                                        />

                                        <DropDown
                                            label={'سطح :'}
                                            field={level}
                                            setField={setLevel}
                                            list={listLevel}
                                        />

                                        {submitMessage && (
                                            <div className={`text-center p-2 rounded ${hasError ? 'bg-red-100 text-red-700' : 'bg-[#000] text-[#fff]'}`}>
                                                {submitMessage}
                                            </div>
                                        )}
                                    </div>
                                </Box>
                                <div className='w-full  space-x-[10px] space-x-reverse justify-center p-[20px] flex'>
                                    <button
                                        disabled={isSubmitting}
                                        onClick={handleSubmit}
                                        className="w-[101px] h-[24px] text-[#fff] bg-[#005CD7] text-[10px] rounded hover:bg-[##005CD7] transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? "در حال ثبت..." : "درخواست عضویت"}
                                    </button>

                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="w-[101px] h-[24px] text-[#fff] bg-[#000] text-[10px] rounded hover:bg-[##005CD7] transition-colors disabled:opacity-50"
                                    >
                                        بستن
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
                </>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <>
                    <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none text-[#4D4D4D]">
                        <div className="relative w-[450px]">
                            <div className="border-0 rounded-[20px] shadow-lg relative flex flex-col w-full bg-[#F8F8F8] outline-none focus:outline-none p-[20px]">
                                <Box widht={300} height={300}>
                                    <div className='flex flex-col space-y-[10px] w-full items-center h-fit p-[20px]'>
                                        <Input
                                            label="نام و نام خانوادگی :"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />

                                        <Input
                                            label="تلفن همراه :"
                                            type="text"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            required
                                        />

                                        <Input
                                            label=" تاریخ تولد:"
                                            value={birthDate}
                                            onChange={(e) => setDateBirth(e.target.value)}
                                            placeholder="مثال: ۱۳۷۰/۰۹/۲۱"
                                            required
                                        />

                                        <DropDown
                                            label={'سطح :'}
                                            field={level}
                                            setField={setLevel}
                                            list={listLevel}
                                        />

                                        {submitMessage && (
                                            <div className={`text-center p-2 rounded ${hasError ? 'bg-red-100 text-red-700' : 'bg-[#000] text-[#fff]'}`}>
                                                {submitMessage}
                                            </div>
                                        )}
                                    </div>
                                </Box>
                                <div className='w-full  space-x-[10px] space-x-reverse justify-center p-[20px] flex'>
                                    <button
                                        disabled={isSubmitting}
                                        onClick={handleEditSubmit}
                                        className="w-[101px] h-[24px] text-[#fff] bg-[#005CD7] text-[10px] rounded hover:bg-[##005CD7] transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? "در حال ویرایش..." : "ویرایش اطلاعات"}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingMemberId(null);
                                            setName("");
                                            setMobile("");
                                            setLevel("");
                                            setDateBirth("");
                                        }}
                                        className="w-[101px] h-[24px] text-[#fff] bg-[#000] text-[10px] rounded hover:bg-[##005CD7] transition-colors disabled:opacity-50"
                                    >
                                        بستن
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
                </>
            )}
        </>
    );
};

export default MembershipRequests;