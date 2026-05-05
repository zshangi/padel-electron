// Box.jsx
import React from 'react';

const Box = ({ width, height, children }) => {
  return (
    <div
      className="rounded-[15px] bg-white shadow-md p-[10px]"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {children}
    </div>
  );
};

export default Box;