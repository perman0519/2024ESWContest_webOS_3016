import React, { useEffect, useRef } from 'react';

export const Dialog = ({ isOpen, onOpenChange, children }) => {
  const dialogRef = useRef(null);

console.log(isOpen);
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onOpenChange();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'visible';
    };
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-40 flex">
      <div
        className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg"
        ref={dialogRef}
      >
        <button
          className="absolute top-0 right-0 mt-4 mr-4 text-gray-400 hover:text-gray-600"
          onClick={onOpenChange}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ children }) => {
  return <div className="mt-4">{children}</div>;
};

export const DialogHeader = ({ children }) => {
  return <div className="text-lg font-medium leading-6 text-gray-900">{children}</div>;
};

export const DialogTitle = ({ children }) => {
  return <h3 className="text-lg font-medium leading-6 text-gray-900">{children}</h3>;
};
