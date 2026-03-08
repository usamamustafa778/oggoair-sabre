import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Container from '@/components/common/Container';
import { 
    Check, 
    X, 
    ChevronRight, 
    Bus, 
    Clock, 
    MapPin, 
    Power, 
    Wifi, 
    Snowflake,
    User,
    Share2,
    ArrowLeft
} from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function BusTicketOptions() {
    const router = useRouter();
    const [selectedFareClass, setSelectedFareClass] = useState('2nd Class / Tourist');
    const [selectedFareConditions, setSelectedFareConditions] = useState('Standard');
    const [cancelForAnyReason, setCancelForAnyReason] = useState(false);
    const [seatPreference, setSeatPreference] = useState('No preference');

    // Extract parameters from URL
    const {
        busId,
        from,
        to,
        date,
        time,
        passengers,
        fare,
        company,
        departureTime,
        arrivalTime,
        duration,
        price,
        departureStation,
        arrivalStation
    } = router.query;

    const handleContinue = () => {
        // Navigate to passenger details page
        const params = new URLSearchParams({
            busId,
            from,
            to,
            date,
            time,
            passengers,
            fare,
            company,
            departureTime,
            arrivalTime,
            duration,
            price,
            departureStation,
            arrivalStation,
            fareClass: selectedFareClass,
            fareConditions: selectedFareConditions,
            cancelForAnyReason: cancelForAnyReason.toString(),
            seatPreference
        });

        router.push(`/bus/busPassengerDetails?${params.toString()}`);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <>
            <Navbar />

                         <Breadcrumbs
         steps={[
           { id: "home", label: "Home", href: "/" },
           { id: "bus", label: "Busses", href: "/bus/busSearch" },
           { id: "ticket", label: "Ticket options", href: "/bus/busTicketOptions" }
         ]}
         currentStep="ticket"
       />
            

            <div className="bg-gray-50 min-h-screen py-8">
                <Container>
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column - Ticket Options */}
                        <div className="lg:w-2/3 space-y-6">
                            {/* Select Your Fare */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-semibold text-primary-text mb-6">Select Your Fare</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div 
                                        className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                                            selectedFareClass === '2nd Class / Tourist' 
                                                ? 'border-primary-green bg-green-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedFareClass('2nd Class / Tourist')}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-primary-text">2nd Class / Tourist</h4>
                                            <span className="text-xl font-bold text-primary-text">+€0</span>
                                        </div>
                                        <div className="space-y-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Wifi className="w-4 h-4" />
                                                <span>Free Wi-Fi</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>🍽️</span>
                                                <span>Meals to buy</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>🍿</span>
                                                <span>Snacks to buy</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>🚽</span>
                                                <span>WC</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Snowflake className="w-4 h-4" />
                                                <span>Air-conditioned</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div 
                                        className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                                            selectedFareClass === '1st Class / Comfort' 
                                                ? 'border-primary-green bg-green-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedFareClass('1st Class / Comfort')}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-primary-text">1st Class / Comfort</h4>
                                            <span className="text-xl font-bold text-primary-text">€33.00</span>
                                        </div>
                                        <div className="space-y-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Wifi className="w-4 h-4" />
                                                <span>Free Wi-Fi</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Power className="w-4 h-4" />
                                                <span>Power plugs</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>🦵</span>
                                                <span>Extra legroom</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>🍽️</span>
                                                <span>Meals to buy</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>🍿</span>
                                                <span>Snacks to buy</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span>🚽</span>
                                                <span>WC</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Snowflake className="w-4 h-4" />
                                                <span>Air-conditioned</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                    <p className="text-sm text-gray-600">There is only 1 fare available for this journey</p>
                                </div>
                            </div>

                            {/* Fare Conditions */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-semibold text-primary-text mb-6">Fare conditions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div 
                                        className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                                            selectedFareConditions === 'Standard' 
                                                ? 'border-primary-green bg-green-50' 
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedFareConditions('Standard')}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-semibold text-primary-text">Normal Fare</h4>
                                            <span className="text-xl font-bold text-primary-text">+€0</span>
                                        </div>
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-500" />
                                                <span>Fully refundable</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                                    <p className="text-sm text-gray-600">There is only 1 fare available for this journey</p>
                                </div>
                            </div>

                            {/* Fare Terms */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-semibold text-primary-text mb-6">Fare terms</h3>
                                <div className="space-y-4 text-sm text-gray-700">
                                    <p>Normal Fare tickets can be refunded without a fee up to 15 minutes before departure. After this period, tickets are non-refundable.</p>
                                </div>
                            </div>

                            {/* Seat reservation */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="text-xl">💺</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-primary-text">Seat reservation</h4>
                                            <p className="text-sm text-gray-600">Reservations added for {passengers} passenger{passengers > 1 ? 's' : ''}!</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-primary-text">+€0</span>
                                </div>
                            </div>

                            {/* Seat preferences */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-primary-text">Seat preferences</h4>
                                        <p className="text-sm text-gray-600">{seatPreference}</p>
                                    </div>
                                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                                        Change seating preferences
                                    </button>
                                </div>
                            </div>

                            {/* Continue Button */}
                            <button
                                onClick={handleContinue}
                                className="w-full bg-primary-green text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-lg"
                            >
                                Go to passenger details
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Right Column - Journey Summary */}
                        <div className="lg:w-1/3 space-y-6">
                            {/* Outbound Journey */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <Check className="w-5 h-5 text-green-500" />
                                    <span className="font-semibold text-primary-text text-lg">OUTBOUND</span>
                                </div>
                                
                                <div className="flex items-center justify-between mb-6">
                                    <div className="text-center">
                                        <div className="text-sm text-gray-600">{formatDate(date)}</div>
                                        <div className="text-xl font-bold">{formatTime(departureTime)}</div>
                                        <div className="text-sm text-gray-600">{departureStation}</div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="text-sm text-gray-600">{duration}</div>
                                        <div className="w-16 h-0.5 bg-gray-300 my-2"></div>
                                        <div className="text-xs text-gray-500">0 transfers</div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="text-xl font-bold">{formatTime(arrivalTime)}</div>
                                        <div className="text-sm text-gray-600">{arrivalStation}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <Bus className="w-5 h-5 text-primary-green" />
                                    <span className="text-sm text-gray-600">{company}</span>
                                </div>

                                {/* Additional journey info */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{departureTime} {departureStation}</span>
                                        <span className="text-gray-600">{arrivalTime} {arrivalStation}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Duration: {duration}</span>
                                        <span className="text-gray-600">0 transfers</span>
                                    </div>
                                </div>
                            </div>

                            {/* Travelling with someone */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h4 className="font-semibold text-primary-text mb-3">Travelling with someone?</h4>
                                <p className="text-sm text-gray-600 mb-4">Share your journey details with them now.</p>
                                <button className="w-full bg-red-500 text-white py-3 px-4 rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                                    <Share2 className="w-4 h-4" />
                                    Share ticket details
                                </button>
                                <div className="mt-4 text-center">
                                    <span className="text-4xl">👥</span>
                                </div>
                            </div>

                            {/* Cost Summary */}
                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold text-primary-text">{passengers} passenger{passengers > 1 ? 's' : ''}</h4>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Tickets x {passengers}</span>
                                        <span className="font-medium">${price}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Agency fee</span>
                                        <span className="font-medium">$5.00</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-primary-text">Total (taxes included)</span>
                                            <span className="font-bold text-lg">$109.40</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="text-xs text-gray-500 space-y-2">
                                <p>Prices include taxes and may change depending on availability. Price will be finalized once the purchase is completed. Any additional fees can be reviewed before payment.</p>
                                <p>
                                    <a href="#" className="hover:underline">Our small print</a>,{' '}
                                    <a href="#" className="hover:underline">Terms of use</a> and{' '}
                                    <a href="#" className="hover:underline">Privacy Policy</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </>
    );
} 