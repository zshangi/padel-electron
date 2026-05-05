// components/SelectCouch.js
import React from "react";
import { IoArrowBackCircleOutline } from "react-icons/io5";

const SelectCouch = ({
    couchList = [],
    onSelectCouch,
    setShowCouchSelect,
    setShowCalendar,
    selectedCouchId,
    setSelectedCouchId,
    setSelectedCouchName,
    selectedCouchName,
}) => {
    return (
        <div className="flex items-center justify-center w-full h-[251px] bg-[#fff] rounded-[14px] shadow-md">
            <div className="flex flex-col w-full justify-start items-center px-[20px]">
                <div className="w-full items-center mb-[10px] justify-center text-center relative">
                    <span>انتخاب مربی</span>
                    <button
                        className="absolute left-0"
                        onClick={() => {
                            setShowCouchSelect(false);
                            setShowCalendar(true);
                        }}
                    >
                        <IoArrowBackCircleOutline color={"#ccc"} size={15} />
                    </button>
                </div>

                <div className="flex flex-col justify-center items-center space-y-[8px] w-[300px] h-[180px] overflow-y-auto">
                    {couchList.map((couch) => (
                        <div
                            key={couch.id}
                            onClick={() => onSelectCouch(couch)}
                            className="flex w-[200px] justify-center items-center body-farsi rounded-[6px] h-[30px] cursor-pointer bg-[#fff5e6] text-[#ff7a00] border border-[#ff7a00] hover:bg-[#ff7a00] hover:text-white"
                        >
                            {couch.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SelectCouch;
