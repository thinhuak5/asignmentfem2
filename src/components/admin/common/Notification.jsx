import React, {useEffect, useRef, useState} from 'react';

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleItemClick = (e) => {
    e.preventDefault();
    // Add logic for handling notification item clicks
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="dropdown">
      <button 
        className="nav-link bg-transparent border-0" 
        onClick={toggleDropdown}
        aria-expanded={isOpen}
      >
      </button>
      
      <div className={`dropdown-menu dropdown-menu-animate-up ${isOpen ? 'show' : ''}`}>
        <div className="message-body">
          <button 
            className="dropdown-item bg-transparent border-0 w-100 text-start"
            onClick={handleItemClick}
          >
            Item 1
          </button>
          <button 
            className="dropdown-item bg-transparent border-0 w-100 text-start"
            onClick={handleItemClick}
          >
            Item 2
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;