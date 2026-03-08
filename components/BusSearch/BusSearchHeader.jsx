import React, { useState, useEffect } from 'react';
import { CaretLeft, CaretRight } from 'phosphor-react';
import Container from '../common/Container';
import Image from 'next/image';
import { useRouter } from 'next/router';

const BusSearchHeader = ({ searchParams, busResults }) => {
    const [selectedDate, setSelectedDate] = useState('Fri,27');
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();
    
    // Extract search parameters from URL or props
    const from = searchParams?.from || router.query.from || 'Porto';
    const to = searchParams?.to || router.query.to || 'Lisbon';
    const date = searchParams?.date || router.query.date || '2025-07-12';
    const time = searchParams?.time || router.query.time || '';
    const passengers = searchParams?.passengers || router.query.passengers || '1';
    const tripType = searchParams?.tripType || router.query.tripType || 'one-way';
    
    // Format date for display
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'Wed, 10 Sept';
        try {
            const date = new Date(dateString);
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
        } catch (error) {
            return 'Wed, 10 Sept';
        }
    };

    // Generate dynamic date cards based on search date
    const generateDateCards = () => {
        let baseDate;
        try {
            baseDate = new Date(date);
            if (isNaN(baseDate.getTime())) {
                baseDate = new Date(); // Fallback to today if invalid date
            }
        } catch (error) {
            baseDate = new Date(); // Fallback to today if error
        }
        
        const cards = [];
        
        for (let i = 0; i < 14; i++) {
            const cardDate = new Date(baseDate);
            cardDate.setDate(baseDate.getDate() + i);
            
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const day = days[cardDate.getDay()];
            const dateNum = cardDate.getDate();
            
            // Calculate dynamic price based on date (weekends more expensive)
            let price = '€55';
            if (cardDate.getDay() === 0 || cardDate.getDay() === 6) {
                price = '€65';
            } else if (i === 0) {
                price = '€45'; // Today
            }
            
            cards.push({
                day: day,
                date: dateNum,
                price: price,
                active: i === 0, // First date is active
                fullDate: cardDate.toISOString().split('T')[0]
            });
        }
        
        return cards;
    };

    const dateCards = generateDateCards();

    const handleDateChange = (direction) => {
        if (direction === 'prev' && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else if (direction === 'next' && currentIndex < dateCards.length - 7) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleDateSelect = (selectedCard) => {
        setSelectedDate(`${selectedCard.day},${selectedCard.date}`);
        
        // Update URL with new date
        const newParams = new URLSearchParams(router.query);
        newParams.set('date', selectedCard.fullDate);
        router.push(`${router.pathname}?${newParams.toString()}`, undefined, { shallow: true });
    };

    const visibleCards = dateCards.slice(currentIndex, currentIndex + 7);

    // Format time for display
    const formatTimeForDisplay = (timeString) => {
        if (!timeString) return '';
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch (error) {
            return '';
        }
    };

    const displayTime = formatTimeForDisplay(time);
    const displayDate = formatDateForDisplay(date);

    return (
        <div className="bg-primary-bg pt-8 ">
            <Container>
                {/* Current Search Cards */}
                <div className="flex flex-col gap-6 mb-6 ">
                    {/* First card - One way */}
                    <div className="bg-white p-1.5 rounded-2xl ">
                        <div className="bg-gray-100 rounded-xl pt-4 pb-2.5 px-5 flex justify-between items-center ">
                            <div className="flex items-center gap-4">
                                <Image src="/st-images/flightSearch/bus.svg" alt="Bus" width={26} height={26} className="text-gray-800 w-[24px] h-auto" />
                                <div>
                                    <div className="font-semibold text-xl text-primary-text mb-1.5">{from} → {to}</div>
                                    <div className=" text-primary-text">
                                        {displayDate}
                                        {displayTime && ` | ${displayTime}`}
                                        {` | ${passengers} Passenger${passengers !== '1' ? 's' : ''} | Economy`}
                                    </div>
                                </div>
                            </div>
                            <button 
                                className="bg-primary-green text-xl text-gray-800 px-6 py-3.5 rounded-lg font-medium flex items-center gap-3 hover:bg-green-400 transition"
                                onClick={() => router.push('/?type=eurobus')}
                            >
                                <Image src="/st-images/flightSearch/edit.png" alt="Edit" width={100} height={100} className="text-primary-text w-[20px] h-auto" />
                                Edit
                            </button>
                        </div>
                    </div>
                    
                    {/* Second card - Round trip (only show if it's a round trip) */}
                    {tripType === 'round-trip' && (
                        <div className="bg-white p-1.5 rounded-2xl ">
                            <div className="bg-gray-100 rounded-xl pt-4 pb-2.5 px-5 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <Image src="/st-images/flightSearch/bus.svg" alt="Bus" width={26} height={26} className="text-gray-800 w-[24px] h-auto" />
                                    <div>
                                        <div className="font-semibold text-xl text-primary-text mb-1.5">{from} → {to}</div>
                                        <div className=" text-primary-text">
                                            {displayDate} - {formatDateForDisplay(router.query.returnDate)}
                                            {` | ${passengers} Passenger${passengers !== '1' ? 's' : ''} | Economy`}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    className="bg-primary-green text-gray-800 px-6 py-3.5 text-xl rounded-lg font-medium flex items-center gap-3 hover:bg-green-400 transition"
                                    onClick={() => router.push('/?type=eurobus')}
                                >
                                    <Image src="/st-images/flightSearch/edit.png" alt="Edit" width={100} height={100} className="text-primary-text w-[20px] h-auto" />
                                    Edit
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Date Selection */}
                <div className="flex items-center gap-3 h-full ">
                    <button 
                        onClick={() => handleDateChange('prev')}
                        disabled={currentIndex === 0}
                        className={`py-5 px-1 rounded-sm transition  border h-full ${
                            currentIndex === 0 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-primary-text text-white hover:bg-blue-700'
                        }`}
                    >
                        <CaretLeft size={20} />
                    </button>
                    
                    <div className="flex gap-2 flex-1  justify-center">
                        {visibleCards.map((card, index) => (
                            <button
                                key={currentIndex + index}
                                onClick={() => handleDateSelect(card)}
                                className={`px-12 py-2 rounded-md text-lg font-medium  w-full h-full ${
                                    card.active 
                                        ? 'bg-primary-green text-gray-800' 
                                        : 'bg-white text-gray-800 hover:bg-gray-50'
                                }`}
                            >
                                <div className="text-center ">
                                    <div className="font-mono text-primary-text text-[14px] ">{card.day},{card.date}</div>
                                    <div className="text-[16px] text-primary-text font-mono">{card.price}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => handleDateChange('next')}
                        disabled={currentIndex >= dateCards.length - 7}
                        className={`py-5 px-1 rounded-lg transition ${
                            currentIndex >= dateCards.length - 7 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-primary-text text-white hover:bg-blue-700'
                        }`}
                    >
                        <CaretRight size={20} />
                    </button>
                </div>
            </Container>
        </div>
    );
};

export default BusSearchHeader; 