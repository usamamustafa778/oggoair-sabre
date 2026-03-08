import React, { useState } from 'react';
import { X, Clock, MapPin, Bus, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';

const BusBookingSidebar = ({ isOpen, onClose, selectedBus, currentView }) => {
    const router = useRouter();
    const [selectedFare, setSelectedFare] = useState('basic');

    if (!isOpen || !selectedBus) return null;

    const handleContinue = () => {
        // Navigate to ticket options page with bus and fare details
        const params = new URLSearchParams({
            busId: selectedBus.id.toString(),
            from: router.query.from || '',
            to: router.query.to || '',
            date: router.query.date || '',
            time: router.query.time || '',
            passengers: router.query.passengers || '1',
            fare: selectedFare,
            company: selectedBus.company,
            departureTime: selectedBus.departureTime,
            arrivalTime: selectedBus.arrivalTime,
            duration: selectedBus.duration,
            price: selectedBus.price,
            departureStation: selectedBus.departureStation,
            arrivalStation: selectedBus.arrivalStation
        });

        router.push(`/bus/busTicketOptions?${params.toString()}`);
    };

    const fareOptions = [
        {
            id: 'basic',
            name: 'Basic',
            price: selectedBus.price,
            features: ['Standard seat', 'Basic luggage allowance', 'No refunds'],
            description: 'Standard fare with basic amenities'
        },
        {
            id: 'standard',
            name: 'Standard',
            price: selectedBus.price,
            features: ['Comfortable seat', 'Luggage allowance', 'Semi-refundable'],
            description: 'Comfortable travel with flexibility'
        },
        {
            id: 'premium',
            name: 'Premium',
            price: selectedBus.price,
            features: ['Premium seat', 'Extra luggage', 'Fully refundable', 'Priority boarding'],
            description: 'Premium experience with maximum flexibility'
        }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-primary-text">Select your fare</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Bus Journey Summary */}
                <div className="p-4 border-b border-gray-100">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Bus className="w-5 h-5 text-primary-green" />
                                <span className="font-medium text-primary-text">{selectedBus.company}</span>
                            </div>
                            <span className="text-sm text-gray-500">{selectedBus.type}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <div className="text-lg font-bold">{selectedBus.departureTime}</div>
                                <div className="text-xs text-gray-600 max-w-[120px]">{selectedBus.departureStation}</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-sm text-gray-600">{selectedBus.duration}</div>
                                <div className="w-16 h-0.5 bg-gray-300 mt-1"></div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-lg font-bold">{selectedBus.arrivalTime}</div>
                                <div className="text-xs text-gray-600 max-w-[120px]">{selectedBus.arrivalStation}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fare Options */}
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-primary-text mb-4">Choose your fare</h3>
                    
                    <div className="space-y-3">
                        {fareOptions.map((fare) => (
                            <div
                                key={fare.id}
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                    selectedFare === fare.id
                                        ? 'border-primary-green bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setSelectedFare(fare.id)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-primary-text">{fare.name}</h4>
                                        <p className="text-sm text-gray-600">{fare.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-primary-text">{fare.price}</div>
                                        <div className="text-xs text-gray-500">per passenger</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    {fare.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="w-1.5 h-1.5 bg-primary-green rounded-full"></div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Continue Button */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                    <button
                        onClick={handleContinue}
                        className="w-full bg-primary-green text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                        Continue to passenger details
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusBookingSidebar; 