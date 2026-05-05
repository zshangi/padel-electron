import React, { useState, useEffect } from 'react';
import jalaali from 'jalaali-js';
import { formatNumber } from '../../utils/numberUtils';
import Box from '../components/Box';
import {persianMonths} from '../../utils/calenderUtils'

const MonthlyStatsCalculator = ({ courts, reservations, loading,color,title }) => {
    const [monthlyStats, setMonthlyStats] = useState({
        totalAvailableHours: 0,
        totalReservedHours: 0,
        weeklyPercentages: [0, 0, 0, 0, 0, 0, 0]
    });



    const persianWeekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

    const getDayCountInMonth = (year, month) => {
        const dayCounts = [0, 0, 0, 0, 0, 0, 0]; 
        const daysInMonth = jalaali.jalaaliMonthLength(year, month);
        for (let day = 1; day <= daysInMonth; day++) {
            const date = jalaali.toGregorian(year, month, day);
            const jsWeekday = new Date(date.gy, date.gm - 1, date.gd).getDay();
            const persianWeekday = (jsWeekday + 1) % 7;
            dayCounts[persianWeekday]++;
        }
        return dayCounts;
    };

    const calculateMonthlyStats = () => {
        if (loading || courts.length === 0) {
            return { totalAvailableHours: 0, totalReservedHours: 0, weeklyPercentages: [0, 0, 0, 0, 0, 0, 0] };
        }

        const today = new Date();
        const { jy, jm } = jalaali.toJalaali(today);

        const dayCounts = getDayCountInMonth(jy, jm);
        const weekdayKeys = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

        let totalAvailableHours = 0;
        
        courts.forEach(court => {
            const wh = court?.data?.workingHours || {};
        
            for (let i = 0; i < 7; i++) {
                const key = weekdayKeys[i];
                const slots = Array.isArray(wh[key]) ? wh[key] : [];
        
                totalAvailableHours += slots.length * dayCounts[i];
            }
        });
        

        let totalReservedHours = 0;
        reservations.forEach(reservation => {
            if (!reservation.selected_day) return;
            const [resYear, resMonth] = reservation.selected_day.split('/').map(Number);
            if (resYear === jy && resMonth === jm) {
                const [startTime, endTime] = reservation.selected_time.split('-');
                const [startHour] = startTime.split(':').map(Number);
                const [endHour] = endTime.split(':').map(Number);
                totalReservedHours += (endHour - startHour);
            }
        });

        const daysWithReservationsCount = [0, 0, 0, 0, 0, 0, 0];
        const uniqueDates = new Set();

        reservations.forEach(reservation => {
            if (!reservation.selected_day) return;
            const [resYear, resMonth] = reservation.selected_day.split('/').map(Number);
            if (resYear === jy && resMonth === jm) {
                uniqueDates.add(reservation.selected_day);
            }
        });

        uniqueDates.forEach(dateString => {
            const [year, month, day] = dateString.split('/').map(Number);
            const date = jalaali.toGregorian(year, month, day);
            const jsWeekday = new Date(date.gy, date.gm - 1, date.gd).getDay();
            const persianWeekday = (jsWeekday + 1) % 7;
            daysWithReservationsCount[persianWeekday]++;
        });

        const weeklyPercentages = daysWithReservationsCount.map((count, index) => {
            return dayCounts[index] > 0 ? (count / dayCounts[index]) * 100 : 0;
        });

        return {
            totalAvailableHours,
            totalReservedHours,
            weeklyPercentages
        };
    };

    useEffect(() => {
        const stats = calculateMonthlyStats();
        setMonthlyStats(stats);
    }, [courts, reservations, loading]);

    const today = new Date();
    const { jy, jm } = jalaali.toJalaali(today);
    const currentMonthName = persianMonths[jm - 1]; // jm is 1-based, array is 0-based

    return (
        <Box width={697} height={153}>
            <div className='flex w-[660px]'>
                <div className='flex flex-col justify-center items-center w-[330px]'>
                    <span className='mb-[20px] text-[12px] text-[#4E4E4E]'>{currentMonthName} {formatNumber(jy)}</span>
                    <div className='flex w-[269px] h-[62px]'>
                        <div className='flex flex-col justify-center items-center w-[88px] h-[62px] border-l '>
                            <span className='text-[30px]'> {formatNumber(courts.length)}</span>
                            <span className='text-[10px]'> {title}</span>
                        </div>

                        <div className='flex flex-col justify-center items-center w-[88px] h-[62px] border-l '>
                            <span className='text-[30px]'> {formatNumber(monthlyStats.totalAvailableHours)}</span>
                            <span className='text-[10px]'>ساعات قابل رزرو</span>
                        </div>
                        <div className='flex flex-col justify-center items-center w-[88px] h-[62px] border-l '>
                            <span className='text-[30px]'> {formatNumber(monthlyStats.totalReservedHours)}</span>
                            <span className='text-[10px]'> ساعات رزرو شده</span>
                        </div>
                    </div>
                </div>
                <div className='flex flex-col items-center justify-center h-[143px]  p-[10px] w-[330px]'>
                    <div className='flex justify-between items-end w-full h-[100px]'>
                        {monthlyStats.weeklyPercentages.map((percentage, index) => {
                            const barHeight = percentage > 0 ? (percentage / 100) * 80 : 0;

                            return (
                                <div key={index} className='flex flex-col items-center justify-end h-full'>
                                    <div className='relative w-[25px] h-[80px] bg-[#f6f6f6] rounded-[12px]'>
                                        <div
                                            className='absolute bottom-0 w-full  rounded-[12px] transition-all duration-300'
                                            style={{ height: `${barHeight}px`,backgroundColor : color }}
                                        ></div>
                                    </div>
                                    <div className='text-[10px] mt-1'>{persianWeekDays[index]}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Box>
    );
};

export default MonthlyStatsCalculator;