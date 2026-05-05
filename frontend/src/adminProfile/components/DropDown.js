import React, { useRef, useEffect, useLayoutEffect, useMemo, useState, useId } from "react";
import { createPortal } from "react-dom";

const DropDown = ({
  label,
  field,
  setField,
  list,
  labelPosition = "above",
  width = "155",
  height = "25",
  disabled = false,
}) => {
  const uid = useId();
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, w: 0, openUp: false });

  const selectedLabel = useMemo(() => {
    if (field === null || field === undefined) return "";
    const found = list?.find((item) => item.value === field);
    return found?.label || "";
  }, [field, list]);

  const close = () => setDropdownOpen(false);

  const updatePosition = () => {
    const el = buttonRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const w = rect.width;

    const menuMaxHeight = 200;
    const padding = 8;

    const spaceBelow = window.innerHeight - rect.bottom - padding;
    const spaceAbove = rect.top - padding;

    const openUp = spaceBelow < menuMaxHeight && spaceAbove > spaceBelow;
    const top = openUp ? rect.top - 4 : rect.bottom + 4;

    setMenuPos((prev) => {
      if (
        prev.top === top &&
        prev.left === rect.left &&
        prev.w === w &&
        prev.openUp === openUp
      ) {
        return prev;
      }
      return { top, left: rect.left, w, openUp };
    });
  };

  // click outside: support multiple dropdowns (no duplicated ids)
  useEffect(() => {
    const onDown = (e) => {
      const wrapper = wrapperRef.current;
      const menu = menuRef.current;
      if (!wrapper) return;

      if (!wrapper.contains(e.target) && !(menu && menu.contains(e.target))) {
        close();
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // update menu position on open + scroll/resize
  useLayoutEffect(() => {
    if (!dropdownOpen) return;
    updatePosition();

    const onScroll = (e) => {
      const menuEl = menuRef.current;
      if (menuEl && e?.target && menuEl.contains(e.target)) return;
      updatePosition();
    };
    const onResize = () => updatePosition();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [dropdownOpen]);

 useEffect(() => {
  if (!dropdownOpen) return;

  const menuEl = menuRef.current;
  if (!menuEl) return;

  const onWheel = (e) => {
    e.stopPropagation();

    const delta = e.deltaY;
    const atTop = menuEl.scrollTop <= 0;
    const atBottom = menuEl.scrollTop + menuEl.clientHeight >= menuEl.scrollHeight - 1;

    if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
      e.preventDefault(); // stop scroll chaining to modal
    }
  };

  menuEl.addEventListener("wheel", onWheel, { passive: false });

  return () => menuEl.removeEventListener("wheel", onWheel);
}, [dropdownOpen]);

  const DropdownButton = () => (
    <div
      ref={buttonRef}
      className={`w-full rounded-[4px] px-[4px] h-[26px] flex justify-between items-center border-[0.5px] border-[#c4c4c4] bg-white
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={(e) => {
        if (disabled) return;
        e.stopPropagation();
        setDropdownOpen((prev) => !prev);
      }}
    >
      <span className="text-[10px] text-[#4D4D4D]">
        {selectedLabel || "انتخاب کنید"}
      </span>

      <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );

  const menuStyle = {
    position: "fixed",
    left: menuPos.left,
    width: menuPos.w,
    zIndex: 999999,
    top: menuPos.openUp ? undefined : menuPos.top,
    bottom: menuPos.openUp ? window.innerHeight - menuPos.top : undefined,
    maxHeight: 200,
    overflowY: "auto",
    overscrollBehavior: "contain",
    WebkitOverflowScrolling: "touch",
  };


  return (
    <div
      ref={wrapperRef}
      className={`relative ${labelPosition === "inside" ? "h-[25px]" : "h-[45px]"}`}
    >
      {labelPosition === "inside" ? (
        <div className="flex items-center space-x-reverse space-x-2">
          <div className={`text-[10px] text-[#4D4D4D] body-farsi-bold ${label ? "w-[80px]" : "w-0"}`}>
            {label}
          </div>
          <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
            <DropdownButton />
          </div>
        </div>
      ) : (
        <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
          <div className="text-[10px] mb-1 body-farsi-bold">{label}</div>
          <DropdownButton />
        </div>
      )}

      {dropdownOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="rounded-[2px] shadow-md bg-white border border-[#e5e5e5] pointer-events-auto"
          >
            <ul className="flex flex-col">
              {list?.length ? (
                list.map((option) => (
                  <li
                    key={option.value}
                    className={`px-[10px] py-[2px] cursor-pointer text-[10px]
                ${option.value === field ? "bg-[#9d9d9d] text-white" : "hover:bg-[#9d9d9d] hover:text-white"}`}
                    onClick={() => {
                      setField(option.value);
                      close();
                    }}
                  >
                    {option.label}
                  </li>
                ))
              ) : (
                <li className="px-3 py-1 text-gray-400 text-[12px]">No results</li>
              )}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
};

export default DropDown;
