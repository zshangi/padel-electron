import React, { useRef, useEffect, useState } from 'react';
import { PiEyeSlashThin, PiEyeThin } from "react-icons/pi";

const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  disabled = false,
  error = '',
  className = '',
  width = '155',
  height = '25',
  fontSize = '10px',
  padding = '4px',
  id,
  required = false,
  labelPosition = 'above',
  labelAlign = 'start',
  ...restProps
}) => {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [displayValue, setDisplayValue] = useState('');

  const persianToEnglishDigits = (str) => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    let result = str;
    for (let i = 0; i < 10; i++) {
      result = result.replace(new RegExp(persianDigits[i], 'g'), i.toString());
      result = result.replace(new RegExp(arabicDigits[i], 'g'), i.toString());
    }
    return result;
  };

  const sanitizeCurrencyInput = (str) => {
    return str.replace(/[^0-9.,]/g, '');
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    const cleanValue = value.toString().replace(/\D/g, '');
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  useEffect(() => {
    if (type === 'currency') {
      setDisplayValue(formatCurrency(value));
    } else {
      setDisplayValue(value);
    }
  }, [value, type]);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const finalType = type === "password" && showPassword ? "text" : type;

  const handleInputChange = (e) => {
    if (type === 'currency') {
      const input = inputRef.current;
      if (!input) return;

      let newValue = e.target.value;

      const start = input.selectionStart;
      const end = input.selectionEnd;

      newValue = persianToEnglishDigits(newValue);

      newValue = sanitizeCurrencyInput(newValue);

      const cleanValue = newValue.replace(/\D/g, '');

      setDisplayValue(newValue);

      setTimeout(() => {
        if (input) {
          input.setSelectionRange(start, end);
        }
      }, 0);

      if (onChange) {
        onChange({
          target: {
            ...e.target,
            value: cleanValue
          }
        });
      }
    } else {
      setDisplayValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (type === 'currency') {
      setDisplayValue(value?.toString() || '');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (type === 'currency') {
      setDisplayValue(formatCurrency(value));
    }
  };

  return (
    <div className={`flex px-[2px] ${labelPosition === 'above' ? 'flex-col ' : ''}`} >
      <div className={`flex body-farsi-bold items-center ${labelPosition === 'above' ? 'w-full' : 'w-[150px]'} ${labelAlign === 'start' ? 'justify-start' : 'justify-center'}  text-start mb-1`} style={{ fontSize }}>
        {label}
        {required && <span className="text-[#9d9d9d9] mr-1">*</span>}
      </div>

      <div
        className={`
          flex items-center rounded-[4px] border-[1px] relative 
          ${error ? 'border-red-500' : isFocused ? 'border-[#9d9d9d80]' : 'border-[#c4c4c490]'}
          ${disabled ? 'bg-[#f6f6f6]' : 'bg-white'}
        `}
        style={{ width: `${width}px`, height: `${height}px`, fontSize: `${fontSize}px` }}
      >
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="ml-1 text-[#777] hover:text-black absolute left-0"
          >
            {showPassword ? <PiEyeThin size={10} /> : <PiEyeSlashThin size={10} />}
          </button>
        )}
        <input
          ref={inputRef}
          id={id}
          type={finalType}
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`bg-transparent px-[4px]  ${type === 'currency' || type === 'number' ? 'text-left' : 'text-right'} outline-none text-[#4D4D4D] ${type === 'password' ? 'pl-6' : ''}`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ fontSize, width: `${width}px`, height: `${height}px`,direction:(type === 'currency'|| type === 'number') ? 'ltr' : 'rtl' }}
          {...restProps}
          
        />
      </div>

      {error && (
        <div className="text-red-500 text-xs mt-1">
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;