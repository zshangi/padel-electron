import { useNavigate } from 'react-router-dom';
import { useState } from "react"
import { backendAccessPostNoAuth } from '../utils/Authentication' // Import this
import { Link } from 'react-router-dom';

import { AiOutlineUser } from "react-icons/ai";
import { BiLockAlt } from "react-icons/bi";
import Box from '../components/Box'
import DropDown from '../adminProfile/components/DropDown'
import Input from '../adminProfile/components/Input'

export default function SignUP() {
    const [name, setName] = useState("")
    const [mobile, setMobile] = useState("")
    const [level, setLevel] = useState("")
    const [birthDate, setDateBirth] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState("")
    const [hasError, setHasError] = useState(false)

    let navigate = useNavigate()
    const listLevel = [
        { value: '1', label: '۱' },
        { value: '2', label: '۲' },
        { value: '3', label: '۳' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setHasError(false);
        setSubmitMessage("");
        
        try {
            const response = await backendAccessPostNoAuth('/api/members/request/', {
                name,
                mobile,
                level_id: level,
                birth_date: birthDate
            });
            
            if (response.success) {
                setSubmitMessage("درخواست عضویت شما با موفقیت ثبت شد. پس از بررسی و تایید رمز عبور یکبار مصرف برای شما پیامک خواهد شد.");
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
    const keyPress = (e) => {
        if (e.charCode == 11) {
            handleSubmit(e)
        }
    }

    return (
        <div
            className='flex w-[100%] h-[calc(100%-220px)] min-h-screen justify-center items-start body-farsi bg-[#f8f9fa] text-[10px] overflow-x-hidden'
            style={{ direction: 'rtl' }}
        >
            <div className='flex flex-col w-full space-y-[10px] mt-[20px] max-w-[393px] justify-start items-center px-[20px]'>
                <div className='flex flex-col w-full h-[40px] space-y-[5px] justify-center items-center p-[5px]'>
                    <span className='text-[10px]'>ساعت های کاری</span>
                    <span className='text-[12px]'>همه روزه ۶ صبح- ۱۰شب</span>
                </div>
                <Box width={360} height={347}>
                    <form onSubmit={handleSubmit} className='flex flex-col space-y-[10px] w-full items-center h-fit p-[20px]'>
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
                        
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-[101px] h-[24px] text-[#000] bg-[#B9ED00] text-[10px] rounded hover:bg-[#a8d400] transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "در حال ثبت..." : "درخواست عضویت"}
                        </button>
                        <div className='w-[150px] float-start'>
                            <Link to="/login" className='body-farsi-fa text-[#000]'> عضو باشگاه هستید اینجا کلیک کنید  </Link>
                        </div>
                    </form>
                </Box>
            </div>
        </div>
    )
}