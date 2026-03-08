import React, { useState, useEffect } from 'react';
import { CaretDown, CaretUp, Clock, MapPin } from 'phosphor-react';
import axios from 'axios';
import { APILINK } from '../../config/api';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ChevronDown, User } from 'lucide-react';

const BusResults = ({ filters, searchParams }) => {
    const router = useRouter();
    const [busResults, setBusResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        fetchBusResults();
    }, [filters, searchParams]);

    const fetchBusResults = async () => {
        try {
            setLoading(true);
            const requestData = {
                from: searchParams?.from || 'Porto',
                to: searchParams?.to || 'Lisbon',
                date: searchParams?.date || '2025-07-12',
                time: searchParams?.time || '',
                passengers: searchParams?.passengers || 1
            };


            const response = await axios.post(`/api/buses/search`, requestData);


            // Apply filters to the results
            let filteredResults = response.data.data;

            // Filter by stops
            if (filters.stops.length > 0) {
                filteredResults = filteredResults.filter(bus => {
                    if (filters.stops.includes('direct')) {
                        return bus.type === 'Direct';
                    }
                    if (filters.stops.includes('1-transfer')) {
                        return bus.type !== 'Direct';
                    }
                    return true;
                });
            }

            // Filter by price
            filteredResults = filteredResults.filter(bus => {
                const price = parseInt(bus.price.replace('€', '').trim());
                return price >= filters.price[0] && price <= filters.price[1];
            });

            // Filter by companies
            if (filters.companies.length > 0) {
                filteredResults = filteredResults.filter(bus => {
                    const companyName = bus.company.toLowerCase();
                    return filters.companies.some(company =>
                        companyName.includes(company.replace('-', ' '))
                    );
                });
            }

            setBusResults(filteredResults);
        } catch (error) {
            console.error('Error fetching bus results:', error);
            // Fallback to mock data
            setBusResults([
                {
                    id: 1,
                    company: "BebaCar Bus",
                    departureTime: "03:30",
                    departureStation: "Porto, Terminal Intermodal de Campanhã",
                    arrivalTime: "07:20",
                    arrivalStation: "Lisbon - Oriente",
                    duration: "4h 15m",
                    price: "€ 263",
                    type: "Direct",
                    tripType: "3. One-way"
                },
                {
                    id: 2,
                    company: "FLIXBUS",
                    departureTime: "15:30",
                    departureStation: "Porto, Terminal Intermodal de Campanhã",
                    arrivalTime: "19:45",
                    arrivalStation: "Lisboa, Oriente",
                    duration: "4h 15m",
                    price: "€ 263",
                    type: "Direct",
                    tripType: "3. One-way"
                },
                {
                    id: 3,
                    company: "rede expressos",
                    departureTime: "08:15",
                    departureStation: "Porto, Terminal Intermodal de Campanhã",
                    arrivalTime: "12:05",
                    arrivalStation: "Lisboa, Oriente",
                    duration: "4h 15m",
                    price: "€ 263",
                    type: "Direct",
                    tripType: "3. One-way"
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectBus = (bus) => {
        const params = new URLSearchParams({
            busId: bus.id.toString(),
            from: searchParams?.from || '',
            to: searchParams?.to || '',
            date: searchParams?.date || '',
            time: searchParams?.time || '',
            passengers: searchParams?.passengers || '1',
            company: bus.company,
            departureTime: bus.departureTime,
            arrivalTime: bus.arrivalTime,
            duration: bus.duration,
            price: bus.price,
            departureStation: bus.departureStation,
            arrivalStation: bus.arrivalStation
        });

        router.push(`/bus/busTicketOptions?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="space-y-4 text-primary-text border">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Select outbound</h2>
                    <div className="text-sm">Loading...</div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                </div>
                                <div className="text-center">
                                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                                </div>
                                <div className="text-center">
                                    <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                                </div>
                                <div className="text-right">
                                    <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 text-primary-text">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Select outbound</h2>
                <div className="text-sm">
                    {busResults.length} buses found
                </div>
            </div>

            <div className="space-y-4">
                {busResults.map((bus, index) => (
                    <div key={bus.id} className="bg-white border border-gray-300 rounded-xl px-6 py-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-xs text-primary-text">Cheapest, Fastest</div>
                            <div className="text-sm font-medium text-primary-text">{bus.company}</div>
                        </div>

                        <div className="flex items-center justify-between">

                            <div className='flex  flex-col items-start gap-2 w-full'>
                                <div className="text-lg font-bold text-green-400">
                                    {(() => {
                                        const words = bus.company.split(' ');
                                        if (words.length >= 2) {
                                            const firstChar = words[0].charAt(0).toUpperCase();
                                            const secondWord = words[1].toUpperCase();
                                            return (
                                                <span>
                                                    <span className="bg-gray-100 px-2 mr-2 rounded">{firstChar}</span>
                                                    {secondWord}
                                                </span>
                                            );
                                        } else if (words.length === 1) {
                                            return words[0].substring(0, 2).toUpperCase();
                                        }
                                        return bus.company.substring(0, 2).toUpperCase();
                                    })()}
                                </div>
                                <button
                                    onClick={() => setExpandedCard(expandedCard === bus.id ? null : bus.id)}
                                    className="text-primary-text  text-xs flex justify-between bg-gray-200 px-2 py-1 rounded-full items-center gap-1"
                                >
                                    <div>
                                        Direct
                                    </div>
                                    <div>
                                        {expandedCard === bus.id ?
                                            (
                                                <CaretUp />
                                            ) : (
                                                <CaretDown />
                                            )}
                                    </div>
                                </button>
                            </div>


                            <div className="text-start  w-full">
                                <div className="text-lg font-bold">{bus.departureTime}</div>
                                <div className="text-xs text-gray-600 max-w-[150px]">{bus.departureStation}</div>
                            </div>

                            <div className="text-center  w-full flex flex-col items-center justify-center">
                                <div className="text-smtext-gray-600">{bus.duration}</div>
                                <Image src="/st-images/flightSearch/arrow.png" alt="arrow-right" width={100} height={100} className="w-full max-w-20 h-auto" />
                                <div className="text-xs ">{bus.type}</div>
                            </div>

                            <div className="text-right r w-full">
                                <div className="text-lg font-bold">{bus.arrivalTime}</div>
                                <div className="text-xs 0 max-w-[150px]">{bus.arrivalStation}</div>
                            </div>
                            <div className='flex flex-col items-center justify-center w-full'>
                                <div className="text-lg font-bold">{bus.price}</div>
                                <div className="text-xs  mb-2 flex items-center gap-1"><span><User className='w-4 h-4'/></span>{bus.tripType}</div>
                            </div>

                            <div className="text-right  w-fit">
                                
                                <div className="relative flex flex-col items-end justify-end">
                                    <button
                                        className="bg-primary-green text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-green/80 cursor-pointer flex items-center gap-1"
                                        onClick={() => handleSelectBus(bus)}
                                    >
                                        Select <ChevronDown
                                            className='w-4 h-4'
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {expandedCard === bus.id && (
                            <div className="mt-4 py-5 border border-gray-300 rounded-xl text-primary-text ">

                                <div className='flex gap-8 px-6  min-h-[200px]'>
                                    <div className='min-w-[fit] flex flex-col justify-between'>
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium">{bus.departureTime}</div>
                                            <div className="text-xs ">{bus.duration}</div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium">{bus.arrivalTime}</div>
                                        </div>
                                        <div className='min-h-8'>

                                        </div>
                                    </div>
                                    <div className='min-w-[fit] flex flex-col justify-between'>
                                        <div className=' flex items-center justify-center '>
                                            <Image src="/st-images/bus.png" alt="arrow-right" width={100} height={100} className="w-full max-w-6 h-auto" />
                                        </div>
                                        <div className='h-full flex items-center justify-center'>
                                            <div className='bg-primary-text w-[2px] h-full border-dotted'></div>
                                        </div>
                                        <div className=' flex items-center justify-center'>
                                            <Image src="/st-images/location.png" alt="arrow-right" width={100} height={100} className="w-full max-w-6 h-auto" />
                                        </div>
                                        <div className=' h-full flex items-center justify-center'>
                                            <div className='bg-primary-text w-[2px] h-full'></div>
                                        </div>
                                        <div className=' flex items-center justify-center'>
                                            <Image src="/st-images/bed2.png" alt="arrow-right" width={100} height={100} className="w-full max-w-5 h-auto" />
                                        </div>
                                    </div>
                                    <div className='min-w-[fit] flex flex-col justify-between'>
                                        <div className="flex flex-col">
                                            <div className="text-sm  font-medium">{bus.departureStation}</div>
                                            <div className="text-sm ">{bus.company}</div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="text-sm  font-medium">{bus.arrivalStation}</div>
                                            <div className="text-sm">{bus.company} </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="text-sm  font-medium">Staying in {searchParams?.to || 'Lisbon'}</div>
                                            <div className="text-sm">Rooms from €13 per night on oggoair.com</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* <div className="mt-4 text-center">
                                    <button
                                        onClick={() => setExpandedCard(expandedCard === bus.id ? null : bus.id)}
                                        className="text-blue-600 hover:text-blue-700 text-sm"
                                    >
                                        {expandedCard === bus.id ? 'Show less' : 'Show more details'}
                                    </button>
                                </div> */}
                    </div>
                ))}
            </div>

            {busResults.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">No buses found</div>
                    <div className="text-sm text-gray-400">Try adjusting your filters or search criteria</div>
                </div>
            )}
        </div>
    );
};

export default BusResults; 