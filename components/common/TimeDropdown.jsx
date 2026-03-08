import { useState, useRef, useEffect } from 'react';
import { CaretUp, CaretDown } from 'phosphor-react';

const TimeDropdown = ({ value, onChange, placeholder = "Time" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState(value || '');
    const dropdownRef = useRef(null);

    // Generate time options in 15-minute increments
    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                times.push(timeString);
            }
        }
        return times;
    };

    const timeOptions = generateTimeOptions();

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        onChange?.(time);
        setIsOpen(false);
    };

    const handleScroll = (direction) => {
        const container = dropdownRef.current;
        if (container) {
            const scrollAmount = 100;
            if (direction === 'up') {
                container.scrollTop -= scrollAmount;
            } else {
                container.scrollTop += scrollAmount;
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className="flex flex-row px-4 bg-primary-gray h-full min-h-[50px] items-center rounded-md cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <input
                    type="text"
                    value={selectedTime}
                    placeholder={placeholder}
                    readOnly
                    className="text-sm md:text-base font-medium text-primary-text shrink-0 flex-1 px-2 text-start md:text-center bg-transparent border-none outline-none cursor-pointer"
                />
                <CaretDown size={16} className="text-[#b2b2b2]" />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64">
                    <div className="p-2">
                        <div className="text-xs text-gray-500 mb-2 px-2">{placeholder}</div>
                        <div className="relative">
                            {/* Scroll buttons */}
                            <div className="absolute right-2 top-0 z-10 flex flex-col">
                                <button
                                    onClick={() => handleScroll('up')}
                                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
                                >
                                    <CaretUp size={12} />
                                </button>
                                <button
                                    onClick={() => handleScroll('down')}
                                    className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
                                >
                                    <CaretDown size={12} />
                                </button>
                            </div>

                            {/* Time list */}
                            <div className="max-h-48 overflow-y-auto pr-8">
                                {timeOptions.map((time) => (
                                    <div
                                        key={time}
                                        onClick={() => handleTimeSelect(time)}
                                        className={`px-4 py-2 cursor-pointer text-sm font-medium text-primary-text hover:bg-gray-50 ${
                                            selectedTime === time ? 'bg-green-100' : ''
                                        }`}
                                    >
                                        {time}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeDropdown; 