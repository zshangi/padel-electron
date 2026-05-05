// Box.jsx
import React from 'react';

const Box = ({ width, height, children,background='#fff',textcolor='#000' }) => {
  return (
    <div
      className={`rounded-[15px] bg-[${background}] text-[${textcolor}] shadow-md p-[10px]`}
      style={{ width: `${width}px`, height: `${height}` }}
    >
      {children}
    </div>
  );
};

export default Box;