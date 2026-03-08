import React, { useState } from "react";
import Image from "next/image";
import { X, Heart, ShareNetwork, Clock, CaretUp, CaretDown, Check, Suitcase, AirplaneTilt } from "phosphor-react";
import { CheckIcon, Check as LucideCheck } from "lucide-react";

// Helper for layover info (copy from FlightCard)
function getLayoverInfo(prevSegment, nextSegment) {
    if (!prevSegment || !nextSegment) return null;
    const prevArrival = new Date(prevSegment.arriving_at);
    const nextDeparture = new Date(nextSegment.departing_at);
    const diffMs = nextDeparture - prevArrival;
    if (diffMs <= 0) return null;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    // Day change
    const dayChange = prevArrival.getDate() !== nextDeparture.getDate();
    return { hours, minutes, airport: prevSegment.destination?.name || "Layover", dayChange, nextDate: nextDeparture };
}
const OutBondReturnSidebar = ({ flight, onClose, alwaysOpen = false }) => {
    if (!flight) return null;

    // Handle multiple slices (outbound and return)
    const slices = flight.slices || [];
    const firstSlice = slices[0] || {};
    const secondSlice = slices[1] || {};

    // Extract data from first slice (outbound)
    const firstSegment = firstSlice.segments?.[0] || {};
    const lastSegment = firstSlice.segments?.[firstSlice.segments.length - 1] || {};

    // Extract data from second slice (return) if exists
    const returnFirstSegment = secondSlice.segments?.[0] || {};
    const returnLastSegment = secondSlice.segments?.[secondSlice.segments.length - 1] || {};

    const airlineName = firstSegment.marketing_carrier?.name || flight.owner?.name || "Unknown Airline";
    const airlineLogo = firstSegment.marketing_carrier?.logo_symbol_url || flight.owner?.logo_symbol_url || "/st-images/flightSearch/a.png";

    // Outbound flight details
    const departureAirport = firstSegment.origin?.iata_code || "N/A";
    const departureTime = firstSegment.departing_at ? new Date(firstSegment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";
    const arrivalAirport = lastSegment.destination?.iata_code || "N/A";
    const arrivalTime = lastSegment.arriving_at ? new Date(lastSegment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";

    // Return flight details
    const returnDepartureAirport = returnFirstSegment.origin?.iata_code || "N/A";
    const returnDepartureTime = returnFirstSegment.departing_at ? new Date(returnFirstSegment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";
    const returnArrivalAirport = returnLastSegment.destination?.iata_code || "N/A";
    const returnArrivalTime = returnLastSegment.arriving_at ? new Date(returnLastSegment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A";

    // Calculate duration for outbound flight
    const outboundDuration = firstSegment.duration || "N/A";
    const returnDuration = returnFirstSegment.duration || "N/A";

    // Check if this is BFM data (indicative pricing)
    const isBFMData = flight._isBFMData === true || flight._pricingType === 'indicative';
    const price = `${flight.total_amount || "N/A"} ${flight.total_currency || ""}`;
    const cabinClass = flight.passengers?.[0]?.cabin_class_marketing_name || "Economy";

    // Try to get baggage from API, fallback to defaults if not available
    const baggages = firstSegment.passengers?.[0]?.baggages ||
        flight.passengers?.[0]?.baggages ||
        [
            { type: 'carry_on', quantity: 1 },
            { type: 'hand', quantity: 0 },
            { type: 'checked', quantity: 0 }
        ];

    const segments = firstSlice.segments || [];
    const returnSegments = secondSlice.segments || [];
    // Check if there are alternative airports (compare slice origin/destination with segment origin/destination)
    const hasAltAirport = firstSlice.origin?.iata_code !== firstSegment.origin?.iata_code ||
        firstSlice.destination?.iata_code !== lastSegment.destination?.iata_code ||
        (slices.length > 1 && (secondSlice.origin?.iata_code !== returnFirstSegment.origin?.iata_code ||
            secondSlice.destination?.iata_code !== returnLastSegment.destination?.iata_code));

    // Calculate baggage quantities for each type
    const getBaggageQuantity = (type) => {
        const baggage = baggages.find(b => b.type === type);
        return baggage ? baggage.quantity : 0;
    };

    const [isExpanded, setIsExpanded] = useState(false);
    const [activeSlice, setActiveSlice] = useState(0); // 0 for outbound, 1 for return

    const personalQuantity = getBaggageQuantity('carry_on');
    const handQuantity = getBaggageQuantity('hand');
    const checkedQuantity = getBaggageQuantity('checked');

    // Get current slice data based on activeSlice
    const currentSlice = activeSlice === 0 ? firstSlice : secondSlice;
    const currentSegments = activeSlice === 0 ? segments : returnSegments;
    const currentDuration = activeSlice === 0 ? outboundDuration : returnDuration;
    const currentDepartureTime = activeSlice === 0 ? departureTime : returnDepartureTime;
    const currentArrivalTime = activeSlice === 0 ? arrivalTime : returnArrivalTime;
    const currentDepartureAirport = activeSlice === 0 ? departureAirport : returnDepartureAirport;
    const currentArrivalAirport = activeSlice === 0 ? arrivalAirport : returnArrivalAirport;



    return (
        <>
            <div className="w-full h-full p-4 sm:p-6 lg:p-5 bg-gray-100 shadow-2xl z-50 overflow-y-auto animate-slide-in flex flex-col">
                {/* Header */}

                <div className="w-full flex justify-center">
                 <div className=" bg-white w-fit rounded-full p-2 px-3 flex items-center gap-2">
                    <div className="flex items-center justify-center rounded-full bg-primary-green p-1"><CheckIcon size={20} className="text-primary-text w-4 h-auto" /> </div> <span className="uppercase text-sm font-semibold text-primary-text ">outbound</span>
                 </div>
                </div>
                {/* Mobile Layout */}
                <div className="block lg:hidden border-b border-gray-200 pb-4 mb-4  mt-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-transparent flex items-center justify-center rounded">
                                <Image src={airlineLogo} alt={airlineName} width={50} height={50} className="w-auto h-full" />
                            </div>
                            <span className="text-sm font-medium text-primary-text truncate max-w-[120px]">
                                {airlineName}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-primary-text">
                                {price}
                            </div>
                            <div className="text-xs text-primary-text">Per: Price/ Pax</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div className="text-center">
                            <div className="text-lg font-bold text-primary-text">
                                {departureTime}
                            </div>
                            <div className="text-xs text-primary-text">
                                ({departureAirport})
                            </div>
                        </div>

                        <div className="text-center flex-1 px-2">
                            <div className="text-xs font-medium text-primary-text mb-1">{outboundDuration}</div>
                            <Image src="/st-images/flightSearch/arrow.png" alt="arrow-right" width={100} height={100} className="w-full h-auto max-w-[60px] mx-auto" />
                            <div className="text-xs text-primary-text">{segments.length > 1 ? `${segments.length - 1} Stop(s)` : "Direct"}</div>
                        </div>

                        <div className="text-center">
                            <div className="text-lg font-bold text-primary-text">
                                {arrivalTime}
                            </div>
                            <div className="text-xs text-primary-text">
                                ({arrivalAirport})
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex items-center justify-between gap-6 border-b mt-4 border-gray-200 pb-4 mb-4">
                    {/* Airline logo and name */}
                    <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="w-8 h-8 aspect-square bg-transparent flex items-center justify-center">
                            <Image src={airlineLogo} alt={airlineName} width={50} height={50} className="w-auto h-full" />
                        </div>
                        <span className="text-base font-semibold text-primary-text">{airlineName}</span>
                    </div>
                    {/* Departure */}
                    <div className="text-center min-w-[70px]">
                        <span className="text-xs text-primary-text">{cabinClass}</span>
                        <div className="text-base font-bold text-primary-text pb-1">{returnDepartureTime}</div>
                        <div className="text-xs text-primary-text">({returnDepartureAirport})</div>
                    </div>
                    {/* Duration and stops */}
                    <div className="text-center flex flex-col items-center min-w-[110px]">
                        <div className="text-xs font-medium text-primary-text">{returnDuration}</div>
                        <div className="flex items-center gap-1">
                            <span className="inline-block w-12 border-t border-gray-400"></span>
                            <Image src="/st-images/flightSearch/arrow.png" alt="arrow-right" width={24} height={24} className="w-6 h-auto" />
                            <span className="inline-block w-12 border-t border-gray-400"></span>
                        </div>
                        <div className="text-xs text-primary-text">{returnSegments.length > 1 ? `${returnSegments.length - 1} Stop(s)` : "Direct"}</div>
                    </div>
                    {/* Arrival */}
                    <div className="text-center min-w-[70px]">
                        <div className="text-xs text-primary-text">{returnSegments.slice(0, 1).map(segment => segment.arriving_at ? new Date(segment.arriving_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : "N/A")}</div>
                        <div className="text-base font-bold text-primary-text pb-1">{returnArrivalTime}</div>
                        <div className="text-xs text-primary-text">({returnArrivalAirport})</div>
                    </div>
                </div>

                {/* <div className="mb-4 ">
                    <div className="text-lg sm:text-xl font-medium text-primary-text">
                        Return
                    </div>
                    <div className="text-xs text-primary-text mt-1">
                        Travel time {returnDuration.replace('PT', '')}
                    </div>
                </div> */}

                {/* Timeline */}
                <div className="flex-1 py-2 mt-2 mb-4">
                    <div className="relative flex">
                        {/* Vertical timeline bar */}
                        <div className="flex flex-col items-center mr-5">
                            <div className="w-8 flex flex-col items-center h-full pb-5">
                                <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center mb-1">
                                    <Image src="/st-images/booking/calendar.png" alt="calendar" width={24} height={24} className="w-auto h-full" />
                                </div>
                                <div className="flex-1 border-r-2 border-dotted border-primary-text h-full mb-24" style={{ minHeight: '60px' }}></div>
                            </div>
                        </div>
                        <div className="flex-1 ">
                            {segments.map((segment, idx) => {
                                const isLast = idx === segments.length - 1;
                                const layover = !isLast ? getLayoverInfo(segment, segments[idx + 1]) : null;
                                return (
                                    <div key={idx} className="mb-10">
                                        {/* Date */}
                                        <div className="text-lg font-bold text-primary-text flex items-center gap-2 mb-2">
                                            {segment.departing_at ? new Date(segment.departing_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                                        </div>
                                        {/* Departure */}
                                        <div className="flex flex-col gap-5 relative">
                                            <Image src="/st-images/booking/plainline.png" alt="calendar" width={24} height={24} className=" absolute top-3 h-full pb-20 -left-[48px]" />
                                            <div className="text-lg font-medium text-primary-text ">{segment.departing_at ? new Date(segment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</div>
                                            <div className="">
                                                <div className="font-semibold text-base text-primary-text">{segment.origin?.city_name || segment.origin?.name}</div>
                                                <div className="text-primary-text text-xs">{segment.origin?.name} ({segment.origin?.iata_code})</div>
                                            </div>
                                            {/* Flight info */}
                                            <div className=" flex flex-col gap-2">
                                                <div className="flex  items-center gap-2">
                                                    <span className="font-semibold text-base text-primary-text">Flight {segment.marketing_carrier?.iata_code}{segment.marketing_carrier_flight_number ? ` ${segment.marketing_carrier_flight_number}` : ''}</span>
                                                    <span className="text-primary-text text-sm ">({segment.duration?.replace('PT', '').toLowerCase() || 'N/A'})</span>
                                                </div>
                                                <div className=" flex items-center gap-2">
                                                    <div className="w-8 h-8 aspect-square bg-transparent flex items-center justify-center">
                                                        <Image src={segment.marketing_carrier?.logo_symbol_url || airlineLogo} alt={segment.marketing_carrier?.name || airlineName} width={24} height={24} className="w-auto h-full" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-primary-text">{segment.marketing_carrier?.name || airlineName}</span>
                                                </div>
                                                <div className="text-gray-500 text-sm">Flight class {segment.cabin?.marketing_name || cabinClass}</div>
                                            </div>
                                            {/* Arrival */}
                                            <div className="text-lg font-medium text-primary-text">{segment.arriving_at ? new Date(segment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</div>
                                            <div className="">
                                                <div className="font-semibold text-base text-primary-text">{segment.destination?.city_name || segment.destination?.name}</div>
                                                <div className="text-primary-text text-xs">{segment.destination?.name} ({segment.destination?.iata_code})</div>
                                            </div>
                                        </div>
                                        {/* Layover info (if not last segment) */}
                                        {layover && (
                                            <div className="mt-6 ">
                                                {/* Existing layover/transfer JSX remains unchanged */}
                                                <div className="ml-0 mt-2 rounded-lg p-3 bg-white">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock size={26} className="text-primary-text stroke-2" />
                                                        <span className="font-bold text-base text-primary-text">{layover.hours}h {layover.minutes}min Transfer in {layover.airport}:</span>
                                                    </div>
                                                    <div className=" rounded p-4 bg-secondary-green mb-2 flex flex-col gap-2">
                                                        <div className="font-medium text-sm flex items-center gap-1 text-primary-text"><Suitcase size={14} /> Self-transfer</div>
                                                        <div className="text-xs text-primary-text ">Collect your luggage and proceed to your departure terminal</div>
                                                        <div className="text-xs text-primary-text ">Check in again, re-check your luggage and go through security.</div>
                                                        <div className="text-xs text-red-600 mt-1"><a href="#" className="underline">Connection protected by our Self-Transfer Guarantee.</a></div>
                                                    </div>
                                                    {layover.hours > 8 && (
                                                        <div>
                                                            <div className=" rounded p-4 bg-secondary-green">
                                                                <div className="font-medium text-sm flex items-center gap-1 text-primary-text"><AirplaneTilt size={14} /> Transfer with overnight stay</div>
                                                                <div className="text-xs text-gray-700">Please note that your journey continues the following day. Should you require accommodation in {layover.airport}, this will be at your own expense.</div>
                                                            </div>
                                                            <div className="mt-2 text-sm bg-primary-green w-full text-center px-2 py-3 rounded inline-block font-medium">+1 Day {layover.nextDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>


                <div className="block lg:hidden border-b border-gray-200 pb-4 mb-4 ">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-transparent flex items-center justify-center rounded">
                                <Image src={airlineLogo} alt={airlineName} width={50} height={50} className="w-auto h-full" />
                            </div>
                            <span className="text-sm font-medium text-primary-text truncate max-w-[120px]">
                                {airlineName}
                            </span>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-primary-text">
                                {price}
                            </div>
                            <div className="text-xs text-primary-text">Per: Price/ Pax</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div className="text-center">
                            <div className="text-lg font-bold text-primary-text">
                                {returnDepartureTime}
                            </div>
                            <div className="text-xs text-primary-text">
                                ({returnDepartureAirport})
                            </div>
                        </div>

                        <div className="text-center flex-1 px-2">
                            <div className="text-xs font-medium text-primary-text mb-1">{returnDuration}</div>
                            <Image src="/st-images/flightSearch/arrow.png" alt="arrow-right" width={100} height={100} className="w-full h-auto max-w-[60px] mx-auto" />
                            <div className="text-xs text-primary-text">{returnSegments.length > 1 ? `${returnSegments.length - 1} Stop(s)` : "Direct"}</div>
                        </div>

                        <div className="text-center">
                            <div className="text-lg font-bold text-primary-text">
                                {returnArrivalTime}
                            </div>
                            <div className="text-xs text-primary-text">
                                ({returnArrivalAirport})
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex items-center justify-between gap-6 border-b border-gray-200 pb-4 mb-4">
                    {/* Airline logo and name */}
                    <div className="flex items-center gap-2 min-w-[120px]">
                        <div className="w-8 h-8 aspect-square bg-transparent flex items-center justify-center">
                            <Image src={airlineLogo} alt={airlineName} width={50} height={50} className="w-auto h-full" />
                        </div>
                        <span className="text-base font-semibold text-primary-text">{airlineName}</span>
                    </div>
                    {/* Departure */}
                    <div className="text-center min-w-[70px]">
                        <span className="text-xs text-primary-text">{cabinClass}</span>
                        <div className="text-base font-bold text-primary-text pb-1">{departureTime}</div>
                        <div className="text-xs text-primary-text">({departureAirport})</div>
                    </div>
                    {/* Duration and stops */}
                    <div className="text-center flex flex-col items-center min-w-[110px]">
                        <div className="text-xs font-medium text-primary-text">{outboundDuration}</div>
                        <div className="flex items-center gap-1">
                            <span className="inline-block w-12 border-t border-gray-400"></span>
                            <Image src="/st-images/flightSearch/arrow.png" alt="arrow-right" width={24} height={24} className="w-6 h-auto" />
                            <span className="inline-block w-12 border-t border-gray-400"></span>
                        </div>
                        <div className="text-xs text-primary-text">{segments.length > 1 ? `${segments.length - 1} Stop(s)` : "Direct"}</div>
                    </div>
                    {/* Arrival */}
                    <div className="text-center min-w-[70px]">
                        <div className="text-xs text-primary-text">{segments.slice(0, 1).map(segment => segment.arriving_at ? new Date(segment.arriving_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : "N/A")}</div>
                        <div className="text-base font-bold text-primary-text pb-1">{arrivalTime}</div>
                        <div className="text-xs text-primary-text">({arrivalAirport})</div>
                    </div>
                </div>

                  
                <div className="w-full flex justify-center">
                 <div className=" bg-white w-fit rounded-full p-2 px-3 flex items-center gap-2">
                    <div className="flex items-center justify-center rounded-full bg-primary-green p-1"><CheckIcon size={20} className="text-primary-text w-4 h-auto" /> </div> <span className="uppercase text-sm font-semibold text-primary-text ">return</span>
                 </div>
                </div>
                {/* Timeline */}
                <div className="flex-1 py-2 mt-2 mb-4">
                    <div className="relative flex">
                        {/* Vertical timeline bar */}
                        <div className="flex flex-col items-center mr-5">
                            <div className="w-8 flex flex-col items-center h-full pb-5">
                                <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center mb-1">
                                    <Image src="/st-images/booking/calendar.png" alt="calendar" width={24} height={24} className="w-auto h-full" />
                                </div>
                                <div className="flex-1 border-r-2 border-dotted border-primary-text h-full mb-24" style={{ minHeight: '60px' }}></div>
                            </div>
                        </div>
                        <div className="flex-1 ">
                            {returnSegments.map((segment, idx) => {
                                const isLast = idx === returnSegments.length - 1;
                                const layover = !isLast ? getLayoverInfo(segment, returnSegments[idx + 1]) : null;
                                return (
                                    <div key={idx} className="mb-10">
                                        {/* Date */}
                                        <div className="text-lg font-bold text-primary-text flex items-center gap-2 mb-2">
                                            {segment.departing_at ? new Date(segment.departing_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "N/A"}
                                        </div>
                                        {/* Departure */}
                                        <div className="flex flex-col gap-5 relative">
                                            <Image src="/st-images/booking/plainline.png" alt="calendar" width={24} height={24} className=" absolute top-3 h-full pb-20 -left-[48px]" />
                                            <div className="text-lg font-medium text-primary-text ">{segment.departing_at ? new Date(segment.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</div>
                                            <div className="">
                                                <div className="font-semibold text-base text-primary-text">{segment.origin?.city_name || segment.origin?.name}</div>
                                                <div className="text-primary-text text-xs">{segment.origin?.name} ({segment.origin?.iata_code})</div>
                                            </div>
                                            {/* Flight info */}
                                            <div className=" flex flex-col gap-2">
                                                <div className="flex  items-center gap-2">
                                                    <span className="font-semibold text-base text-primary-text">Flight {segment.marketing_carrier?.iata_code}{segment.marketing_carrier_flight_number ? ` ${segment.marketing_carrier_flight_number}` : ''}</span>
                                                    <span className="text-primary-text text-sm ">({segment.duration?.replace('PT', '').toLowerCase() || 'N/A'})</span>
                                                </div>
                                                <div className=" flex items-center gap-2">
                                                    <div className="w-8 h-8 aspect-square bg-transparent flex items-center justify-center">
                                                        <Image src={segment.marketing_carrier?.logo_symbol_url || airlineLogo} alt={segment.marketing_carrier?.name || airlineName} width={24} height={24} className="w-auto h-full" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-primary-text">{segment.marketing_carrier?.name || airlineName}</span>
                                                </div>
                                                <div className="text-gray-500 text-sm">Flight class {segment.cabin?.marketing_name || cabinClass}</div>
                                            </div>
                                            {/* Arrival */}
                                            <div className="text-lg font-medium text-primary-text">{segment.arriving_at ? new Date(segment.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</div>
                                            <div className="">
                                                <div className="font-semibold text-base text-primary-text">{segment.destination?.city_name || segment.destination?.name}</div>
                                                <div className="text-primary-text text-xs">{segment.destination?.name} ({segment.destination?.iata_code})</div>
                                            </div>
                                        </div>
                                        {/* Layover info (if not last segment) */}
                                        {layover && (
                                            <div className="mt-6 ">
                                                {/* Existing layover/transfer JSX remains unchanged */}
                                                <div className="ml-0 mt-2 rounded-lg p-3 bg-white">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock size={26} className="text-primary-text stroke-2" />
                                                        <span className="font-bold text-base text-primary-text">{layover.hours}h {layover.minutes}min Transfer in {layover.airport}:</span>
                                                    </div>
                                                    <div className=" rounded p-4 bg-secondary-green mb-2 flex flex-col gap-2">
                                                        <div className="font-medium text-sm flex items-center gap-1 text-primary-text"><Suitcase size={14} /> Self-transfer</div>
                                                        <div className="text-xs text-primary-text ">Collect your luggage and proceed to your departure terminal</div>
                                                        <div className="text-xs text-primary-text ">Check in again, re-check your luggage and go through security.</div>
                                                        <div className="text-xs text-red-600 mt-1"><a href="#" className="underline">Connection protected by our Self-Transfer Guarantee.</a></div>
                                                    </div>
                                                    {layover.hours > 8 && (
                                                        <div>
                                                            <div className=" rounded p-4 bg-secondary-green">
                                                                <div className="font-medium text-sm flex items-center gap-1 text-primary-text"><AirplaneTilt size={14} /> Transfer with overnight stay</div>
                                                                <div className="text-xs text-gray-700">Please note that your journey continues the following day. Should you require accommodation in {layover.airport}, this will be at your own expense.</div>
                                                            </div>
                                                            <div className="mt-2 text-sm bg-primary-green w-full text-center px-2 py-3 rounded inline-block font-medium">+1 Day {layover.nextDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>





                {/* Luggage Section - Redesigned to match screenshot and use all API data */}
                {/* <div className="bg-secondary-green rounded-sm">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <div>
                            <div className="text-sm font-medium text-primary-text">Luggage</div>
                            <div className="text-xs text-primary-text ">per person</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-primary-text">{personalQuantity}</span>
                                <Image src="/st-images/bags/personal.png" alt="personal" width={22} height={22} className="opacity-100 h-[16px] w-auto" />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-primary-text">{handQuantity}</span>
                                <Image src="/st-images/bags/hand.png" alt="hand" width={22} height={22} className="opacity-100 h-[16px] w-auto" />
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-primary-text">{checkedQuantity}</span>
                                <Image src="/st-images/bags/checked.png" alt="checked" width={22} height={22} className="opacity-100 h-[16px] w-auto" />
                            </div>
                            <button className="ml-2 focus:outline-none cursor-pointer" tabIndex={-1} type="button" onClick={() => setIsExpanded(!isExpanded)}>
                                {isExpanded ? <CaretUp size={12} className="text-primary-text font-bold stroke-2" /> : <CaretDown size={12} className="text-primary-text font-bold stroke-2" />}
                            </button>
                        </div>
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>

                        <div className="border-t border-gray-300 mx-4" />
                        <div className="flex flex-col p-4">
                            <div className="grid grid-cols-2 items-start">
                                <div className="flex  items-center gap-2">
                                    <span className=" rounded-full border-2 p-0.5 border-primary-text">
                                        <LucideCheck size={12} className="text-primary-text " />
                                    </span>
                                    <span className="text-sm font-medium text-primary-text">Included</span>
                                </div>
                                <div className="flex items-center gap-2 ">
                                    <span className=" rounded-full border-2 p-0.5 border-primary-text">
                                        <LucideCheck size={12} className="text-primary-text " />
                                    </span>
                                    <span className="text-sm font-medium text-primary-text">Possible to add in<br className='md:hidden' /> the next step</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2">
                                <div className="flex flex-col gap-2 mt-2 text-primary-text text-sm">
                                    {baggages.length > 0 ? baggages.map((b, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            {b.type === 'carry_on' ? (
                                                <Image src="/st-images/bags/personal.png" alt="personal" width={18} height={18} className="opacity-100 h-[14px] w-auto" />
                                            ) : b.type === 'hand' ? (
                                                <Image src="/st-images/bags/hand.png" alt="hand" width={18} height={18} className="opacity-100 h-[14px] w-auto" />
                                            ) : b.type === 'checked' ? (
                                                <Image src="/st-images/bags/checked.png" alt="checked" width={18} height={18} className="opacity-100 h-[14px] w-auto" />
                                            ) : (
                                                <Image src="/st-images/bags/personal.png" alt="personal" width={18} height={18} className="opacity-100 h-[14px] w-auto" />
                                            )}
                                            <span className="text-xs">{b.quantity}X{b.type.charAt(0).toUpperCase() + b.type.slice(1)} item</span>
                                        </div>
                                    )) : (
                                        <div className="flex items-center gap-2">
                                            <Image src="/st-images/bags/personal.png" alt="personal" width={18} height={18} className="opacity-100 h-[14px] w-auto" />
                                            <span className="text-xs">1XPersonal item</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 mt-2 text-primary-text text-sm">
                                    <div className="flex items-center gap-2">
                                        <Image src="/st-images/bags/hand.png" alt="hand" width={18} height={18} className="opacity-100 h-[14px] w-auto" />
                                        <span className="text-xs">Hand luggage<br />( 55 x 40 x 20 ) - 8 kg</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Image src="/st-images/bags/checked.png" alt="checked" width={18} height={18} className="opacity-100 h-[14px] w-auto" />
                                        <span className="text-xs">Checked baggage</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-300 mx-4" />
                        <div className="p-4 text-[11px] text-primary-text ">
                            Other baggage allowances may apply; we display the minimum baggage allowance. See route description for more information on baggage.
                        </div>
                    </div>
                </div> */}
                {/* Price info */}
                <div className=" ">
                    <div className="text-base text-black font-medium py-3">
                        {isBFMData ? "From (estimated price)" : "Round trip total price for 1 adult"}
                    </div>
                    <div className="bg-primary-green w-fit p-2 rounded mb-4 flex gap-2 justify-between items-center">
                        <div className="font-semibold text-base">{isBFMData ? `From ${price}` : price}</div>
                        <div className="text-xs text-primary-text">{isBFMData ? "Est. price" : "Price/ Pax"}</div>
                    </div>
                    {isBFMData && (
                        <div className="text-xs text-gray-500 mb-2">
                            Estimated price – final pricing available after selection
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default OutBondReturnSidebar; 