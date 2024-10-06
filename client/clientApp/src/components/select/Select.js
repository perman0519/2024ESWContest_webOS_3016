import React, { useState, useRef, useEffect } from 'react';

export const Select = ({ onValueChange, defaultValue, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (value) => {
    setSelectedValue(value);
    onValueChange(value);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="relative">
      <SelectTrigger onClick={handleToggle}>
        <SelectValue placeholder="선택하세요" value={selectedValue} />
      </SelectTrigger>
      {isOpen && (
        <SelectContent>
          {React.Children.map(children, child =>
            React.cloneElement(child, {
              onClick: () => handleSelect(child.props.value)
            })
          )}
        </SelectContent>
      )}
    </div>
  );
};

export const SelectTrigger = ({ children, onClick }) => {
  return (
    <div
      className="w-[300px] bg-white border border-gray-300 text-base text-gray-800 rounded px-3 py-2 flex justify-between items-center cursor-pointer"
      onClick={onClick}
    >
      {children}
      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </div>
  );
};

export const SelectContent = ({ children }) => {
  return (
    <div className="absolute mt-1 w-[300px] bg-white border border-gray-300 rounded shadow-lg z-10">
      {children}
    </div>
  );
};

export const SelectValue = ({ placeholder, value }) => {
  return (
    <span className="block truncate">
      {value || placeholder}
    </span>
  );
};

export const SelectItem = ({ value, children, onClick }) => (
  <div
    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
    onClick={() => onClick(value)}
  >
    {children}
  </div>
);
