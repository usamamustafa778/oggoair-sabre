  import React, { useState } from 'react';
  import Image from 'next/image';
  import { useRouter } from 'next/router';
  import { Star, MapPin, Heart, Filter, RefreshCw, ChevronRight, Info, Dot, Search, ArrowUpRight } from 'lucide-react';
  import { createHotelCheckoutUrl } from '../../../utils/urlUtils';
  import { FaStar } from 'react-icons/fa';

  export default function HotelDetailsBody({ hotel }) {
    const router = useRouter();
    const [selectedBeds, setSelectedBeds] = useState('all');
    const [selectedMeals, setSelectedMeals] = useState('all');
    const [selectedCancellation, setSelectedCancellation] = useState('all');

    if (!hotel) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Hotel not found.</p>
        </div>
      );
    }

    // Extract hotel data
    const hotelData = hotel.accommodation || hotel;
    const hotelName = hotelData?.name || 'Hotel Name Not Available';
    const hotelRating = hotelData?.review_score || 4.0;
    const hotelAddress = hotelData?.location?.address || {};
    const hotelPhotos = hotelData?.photos || [];
    const hotelPrice = hotel?.cheapest_rate_total_amount || 0;
    const hotelPriceCurrency = hotel?.cheapest_rate_public_currency;


    // Extract dates and guests
    const checkInDate = hotel?.check_in_date || '2025-07-12';
    const checkOutDate = hotel?.check_out_date || '2025-07-17';
    const adults = hotel?.guests?.length || 2;
    const nights = 1;

    const renderStars = (rating) => {
      return Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ));
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US').format(price);
    };

    const formatCurrency = (currency) => {
      switch (currency) {
        case 'AED': return 'AED';
        case 'USD': return '$';
        case 'EUR': return '€';
        default: return currency;
      }
    };

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        weekday: 'short'
      });
    };

    const getBoardTypeText = (boardType) => {
      switch (boardType) {
        case 'room_only': return 'Meals are not included';
        case 'breakfast': return 'Breakfast included';
        case 'half_board': return 'Breakfast + dinner or lunch included';
        default: return 'Meals are not included';
      }
    };

    const getCancellationText = (cancellationTimeline) => {
      if (!cancellationTimeline || cancellationTimeline.length === 0) {
        return 'No cancellation';
      }
      const firstCancellation = cancellationTimeline[0];
      const date = new Date(firstCancellation.before);
      return `Free until ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    const getPaymentTypeText = (paymentType) => {
      switch (paymentType) {
        case 'pay_now': return 'Pay now';
        case 'pay_at_accommodation': return 'Pay at hotel';
        default: return 'Pay now';
      }
    };

    return (
      <div className="w-full flex flex-col gap-4 pt-25 px-3">
        {/* Navigation Bar */}
        <div className="bg-white w-fit border border-gray-300 rounded-xl">
          <div className="mx-auto px-3 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm sm:text-base">

              <button onClick={() => router.push('/')} className="text-[#197AE4] font-semibold flex items-center gap-2">
                <Search className='w-4 h-4 sm:w-6 sm:h-6 ' />
                <span className=''>Main page</span>
              </button>
              <span className='text-[#197AE4] font-semibold'>{hotelAddress.city_name || 'Dubai'}</span>
              <Dot className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 hidden sm:block" />
              <span className='text-gray-400 text-xs sm:text-base'>{formatDate(checkInDate)} - {formatDate(checkOutDate)}</span>
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 hidden sm:block" />
              <span className="font-medium text-primary-text text-xs sm:text-base truncate">{hotelName}</span>
            </div>

          </div>
        </div>

        {/* Hotel Overview */}
        <div className="bg-white flex flex-col lg:flex-row lg:justify-between rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-8 mb-4 lg:mb-0">
            <div className="h-full flex justify-center items-center">
              <div className='rounded-full p-3 bg-gray-100'>
                <Heart className="w-6 h-6 sm:w-9 sm:h-9 text-primary-text" />
              </div>
            </div>
            <div className='h-full border-l border-gray-400 hidden sm:block'></div>
            <div className="flex-1">
              <div className="bg-secondary-green rounded-lg px-3 h-fit w-fit py-0.5 mb-4">
                <div className="flex items-center gap-2">
                  <FaStar className="text-orange-500" />
                  <span className="text-primary-text font-medium text-sm sm:text-base">
                    {hotel.accommodation?.review_score || 'N/A'} ({hotel.accommodation?.rating || 'N/A'})
                  </span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-sm sm:text-base font-semibold text-primary-text">{hotelName}</h1>
                <div className="bg-primary-green text-primary-text px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                  <span>Top</span>
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
              {/* <div className="flex items-center gap-2 mb-2 border">
                {renderStars(hotelRating)}
                <span className="text-gray-600 font-medium">
                  {hotelRating}.{Math.floor(Math.random() * 9) + 1} (Very Good)
                </span>
                <span className="text-gray-500 border">
                  {Math.floor(Math.random() * 2000) + 1000} reviews
                </span>
              </div> */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                <div className="flex items-center gap-1 sm:gap-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>
                    at {hotelAddress.line_one || 'Address'}, {hotelAddress.city_name || 'Dubai'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <button className="text-blue-600 hover:text-blue-700">Show on the map</button>
                  <span className="hidden sm:inline">|</span>
                  <button className="text-blue-600 hover:text-blue-700">What else is nearby?</button>
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 space-y-1 mt-2">
                <div>1.3km from the city center | 260m from the nearest | 1.8km from Al Badrah Beach</div>
              </div>
            </div>
          </div>

          <div className="text-center lg:text-right flex flex-col justify-center gap-4 w-full lg:w-fit">
            <div className="text-xl sm:text-2xl font-semibold text-primary-text">
              from {formatCurrency(hotelPriceCurrency)} {formatPrice(hotelPrice)}
            </div>
            <button className="text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-primary-green text-primary-text">
              Show all rooms
            </button>
          </div>

          {/* Hotel Images Grid */}
          {/* <div className="grid grid-cols-6 gap-2 mb-4">
            {hotelPhotos.slice(0, 6).map((photo, index) => (
              <div key={index} className="relative h-24 rounded-lg overflow-hidden">
                <Image
                  src={photo.url}
                  fill
                  alt={`Hotel photo ${index + 1}`}
                  className="object-cover"
                />
              </div>
            ))}
          </div> */}

          {/* Reviews Section */}

        </div>


        <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
          <div className="w-full lg:w-[80%] grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 lg:mb-0">
            {hotelPhotos.slice(0, 6).map((photo, index) => (
              <div key={index} className={`relative aspect-16/14 overflow-hidden ${index === 1 || index === 4 ? 'sm:rounded-r-xl' : ''} ${index === 2 || index === 5 ? 'lg:rounded-r-xl' : ''}`}>
                <Image
                  src={photo.url}
                  fill
                  alt={`Hotel photo ${index + 1}`}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
          <div className='w-full lg:w-[20%]'>
            <div className="text-xs sm:text-sm text-gray-600 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span>🇬🇧</span>
                <span>Great location and friendly staff</span>
              </div>
              <button className="text-blue-600 hover:underline">Read full reviews</button>
            </div>
          </div>
        </div>

        {/* Important Information Banner */}
        <div className="bg-white border-2 border-gray-300 rounded-xl p-3 sm:p-4 mb-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 sm:w-6 sm:h-6 text-primary-text mt-0.5 flex-shrink-0" />
            <div className="text-sm sm:text-base text-primary-text font-medium">
              Please note: hotel rates and the price of accommodation may vary depending on the guests' citizenship and the hotel's pricing policy. When searching, you selected guests' citizenship: Australia.
            </div>
          </div>
        </div>

        {/* Check-in/Check-out Dates */}
        <div className="bg-gray-100 border-[6px] border-white rounded-xl p-3 sm:p-4 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-28">
              <div>
                <div className="text-lg sm:text-xl text-primary-text font-semibold mb-2">Check-in</div>
                <div className="text-sm sm:text-base text-blue-600">{formatDate(checkInDate)}, Sat <span className='text-primary-text'>After 14:00</span></div>
              </div>
              <div>
                <div className="text-lg sm:text-xl text-primary-text font-semibold mb-2">Check-out</div>
                <div className="text-sm sm:text-base text-blue-600">{formatDate(checkOutDate)}, Sun <span className='text-primary-text'>Before 12:00</span></div>
              </div>
            </div>
            <button className="text-primary-text bg-primary-green px-6 sm:px-12 py-3 sm:py-4 rounded-xl text-lg sm:text-xl font-medium w-full sm:w-auto">
              Change
            </button>
          </div>
        </div>

        {/* Available Rooms Section */}
        <div className="bg-white rounded-xl px-3 sm:px-6 py-4 sm:py-5 border-2 border-gray-300">
          <div className="flex flex-col items-start justify-between mb-4 sm:mb-7 gap-1">
            <h2 className="text-lg sm:text-[23px] font-semibold text-primary-text">
              Available rooms
            </h2>
            <div className="text-sm sm:text-base font-medium text-primary-text">
              For {nights} night{nights > 1 ? 's' : ''}, for {adults} adult{adults > 1 ? 's' : ''}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col items-center gap-4 sm:gap-6 mb-4">
            <div className='grid w-full grid-cols-1 sm:grid-cols-3 p-4 sm:p-8 rounded-xl bg-secondary-green items-center gap-4'>
              <div className="flex flex-col items-center bg-white px-3 border border-gray-200 rounded-sm py-2">
                <span className='text-primary-text text-sm w-full pl-1 '>Beds</span>
                <select
                  value={selectedBeds}
                  onChange={(e) => setSelectedBeds(e.target.value)}
                  className="w-full text-primary-text rounded-md text-sm"
                >
                  <option value="all">all options</option>
                  <option value="king">King bed</option>
                  <option value="single">Single bed</option>
                  <option value="twin">Twin beds</option>
                  <option value="double">Double bed</option>
                </select>
              </div>
              <div className="flex flex-col items-center bg-white px-3 border border-gray-200 rounded-sm py-2">
                <span className='text-primary-text w-full text-sm pl-1'>Meals</span>
                <select
                  value={selectedMeals}
                  onChange={(e) => setSelectedMeals(e.target.value)}
                  className="w-full text-primary-text rounded-md  text-sm"
                >
                  <option value="all">all options</option>
                  <option value="breakfast">Breakfast included</option>
                  <option value="half_board">Half board</option>
                  <option value="full_board">Full board</option>
                  <option value="room_only">Room only</option>
                </select>
              </div>
              <div className="flex flex-col items-center bg-white px-3 border border-gray-200 rounded-sm py-2">
                <span className='text-primary-text w-full text-sm pl-1'>Cancellation</span>
                <select
                  value={selectedCancellation}
                  onChange={(e) => setSelectedCancellation(e.target.value)}
                  className="w-full text-primary-text rounded-md text-sm"
                >
                  <option value="all">all options</option>
                  <option value="free">Free cancellation</option>
                  <option value="partial">Partial refund</option>
                  <option value="none">No refund</option>
                </select>
              </div>
            </div>


            <button className="flex items-center gap-2 bg-secondary-green text-primary-text px-4 py-3 sm:py-4 rounded-xl hover:bg-secondary-green/80 text-lg sm:text-2xl font-medium w-full justify-center">
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 font-bold" />
              Reload Rates
            </button>
          </div>

                  {/* Room Listings */}
        <div className="space-y-4 sm:space-y-6">
          {hotelData?.rooms
            ?.filter(room => {
              // Filter by beds
              if (selectedBeds !== 'all') {
                const hasMatchingBed = room.beds?.some(bed => bed.type === selectedBeds);
                if (!hasMatchingBed) return false;
              }
              
              // Filter by meals
              if (selectedMeals !== 'all') {
                const hasMatchingMeal = room.rates?.some(rate => {
                  return rate.board_type === selectedMeals;
                });
                if (!hasMatchingMeal) return false;
              }
              
              // Filter by cancellation
              if (selectedCancellation !== 'all') {
                const hasMatchingCancellation = room.rates?.some(rate => {
                  if (selectedCancellation === 'free') return rate.cancellation_timeline && rate.cancellation_timeline.length > 0;
                  if (selectedCancellation === 'partial') return rate.cancellation_timeline && rate.cancellation_timeline.length > 0 && rate.cancellation_timeline[0].refund_amount !== rate.total_amount;
                  if (selectedCancellation === 'none') return !rate.cancellation_timeline || rate.cancellation_timeline.length === 0;
                  return true;
                });
                if (!hasMatchingCancellation) return false;
              }
              
              return true;
            })
            .map((room, roomIndex) => (
              <div key={roomIndex} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Room Details Section */}
                <div className="flex flex-col sm:flex-row border-b border-gray-100">
                                      {/* Room Image */}
                    <div className="relative w-full sm:w-58 h-48 sm:h-36 overflow-hidden flex-shrink-0 sm:mr-5">
                      {room.photos && room.photos[0] && (
                        <>
                          <Image
                            src={room.photos[0].url}
                            fill
                            alt={room.name}
                            className="object-cover"
                          />
                          <div className="absolute bottom-3 right-3 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium">
                            {room.photos.length} Photos
                          </div>
                        </>
                      )}
                    </div>

                  {/* Room Information */}
                  <div className="flex-1 flex flex-col justify-center p-4 sm:p-0">
                    <h3 className="text-base sm:text-lg font-semibold text-primary-text mb-2">
                      {room.name}
                    </h3>
                    <p className="text-primary-text mb-4 text-sm sm:text-base">
                      {room.beds?.map(bed => `${bed.count} ${bed.type} bed${bed.count > 1 ? 's' : ''}`).join(', ') || 'Bed information not available'}
                    </p>
                    
                    {/* Amenities Tags */}
                    <div className="flex flex-wrap gap-1 sm:gap-0.5">
                      <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 text-primary-text rounded-sm text-xs px-1 py-0.5 ">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                        </svg>
                        40 m²
                      </span>
                      <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 text-primary-text rounded-sm text-xs px-1 py-0.5 ">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
                        </svg>
                        Private bathroom
                      </span>
                      <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 text-primary-text rounded-sm text-xs px-1 py-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Sauna
                      </span>
                      <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 text-primary-text rounded-sm text-xs px-1 py-0.5 ">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 8A6 6 0 006 8c0 7-3 9-3 9s3 2 9 2 9-2 9-2-3-2-3-9a6 6 0 00-6-6zm-2 6a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd"/>
                        </svg>
                        Safe
                      </span>
                      <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 text-primary-text rounded-sm text-xs px-1 py-0.5 ">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                        </svg>
                        Minibar
                      </span>
                      <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 text-primary-text rounded-sm text-xs px-1 py-0.5 b">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
                        </svg>
                        High speed internet access
                      </span>
                      <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 text-primary-text rounded-sm text-xs px-1 py-0.5 ">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Gym access
                      </span>
                      <span className="flex items-center gap-1 sm:gap-2 bg-gray-100 text-primary-text rounded-sm text-xs px-1 py-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd"/>
                        </svg>
                        Air conditioning
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Table */}
                <div className="overflow-x-auto mt-4">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-700 text-white text-xs sm:text-sm">
                        <th className="text-left py-2 px-2 sm:px-3 font-medium min-w-[350px]">Room</th>
                        <th className="text-left py-2 px-2 sm:px-3 font-medium min-w-[200px] border-r border-gray-300">Meal</th>
                        <th className="text-left py-2 px-2 sm:px-3 font-medium min-w-[200px] border-r border-gray-300">Cancellation</th>
                        <th className="text-left py-2 px-2 sm:px-3 font-medium min-w-[200px] border-r border-gray-300">NET price</th>
                        <th className="text-left py-2 px-2 sm:px-3 font-medium min-w-[200px] border-r border-gray-300">PaymentType</th>
                        <th className="text-left py-2 px-2 sm:px-3 font-medium min-w-[200px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {room.rates?.slice(0, 3).map((rate, rateIndex) => (
                        <tr key={rateIndex} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 sm:py-4 px-3 sm:px-6 border-r border-gray-300">
                            <div className="flex flex-col items-start gap-2 sm:gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                <Image src="/st-images/bed.png" alt="info" width={24} height={24} />
                              </div>
                              <div>
                                <div className="text-gray-600 text-xs sm:text-sm mb-1 line-clamp-1">
                                  {room.name}
                                </div>
                                <div className="text-blue-600 text-xs sm:text-sm font-medium">
                                  {room.beds?.map(bed => `${bed.count} ${bed.type} bed${bed.count > 1 ? 's' : ''}`).join(', ')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-300">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 font-medium text-xs sm:text-sm">
                                {getBoardTypeText(rate.board_type)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-300">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 font-medium text-xs sm:text-sm">
                                {getCancellationText(rate.cancellation_timeline)}
                              </span>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">i</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-3 border-r border-gray-300">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 font-semibold text-sm sm:text-lg">
                                {formatCurrency(rate.public_currency)} {formatPrice(rate.public_amount)}
                              </span>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">i</span>
                              </div>
                            </div>
                            {rate.due_at_accommodation_amount && rate.due_at_accommodation_amount !== "0.00" && (
                              <div className="text-blue-600 text-xs sm:text-sm mt-1">
                                On the spot: {formatCurrency(rate.due_at_accommodation_currency)} {formatPrice(rate.due_at_accommodation_amount)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-3">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 font-medium text-xs sm:text-sm">
                                {getPaymentTypeText(rate.payment_type)}
                              </span>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">i</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 sm:py-4 px-2 sm:px-3 border border-gray-300 ">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => {
                                  const hotelUrl = createHotelCheckoutUrl(hotelName, hotel.id, roomIndex, rateIndex);
                                  router.push(hotelUrl);
                                }}
                                className="bg-lime-500 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-medium hover:bg-lime-600 transition-colors text-xs sm:text-sm"
                              >
                                Choose
                              </button>
                              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors">
                                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                              </button>
                              <button className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
                                <div className="flex flex-col gap-1">
                                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                </div>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {room.rates && room.rates.length > 3 && (
                  <div className="p-4 text-center border-t border-gray-100">
                    <button className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">
                      Show {room.rates.length - 3} more rates
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* No Results Message */}
            {hotelData?.rooms?.filter(room => {
              // Filter by beds
              if (selectedBeds !== 'all') {
                const hasMatchingBed = room.beds?.some(bed => bed.type === selectedBeds);
                if (!hasMatchingBed) return false;
              }
              
              // Filter by meals
              if (selectedMeals !== 'all') {
                const hasMatchingMeal = room.rates?.some(rate => {
                  return rate.board_type === selectedMeals;
                });
                if (!hasMatchingMeal) return false;
              }
              
              // Filter by cancellation
              if (selectedCancellation !== 'all') {
                const hasMatchingCancellation = room.rates?.some(rate => {
                  if (selectedCancellation === 'free') return rate.cancellation_timeline && rate.cancellation_timeline.length > 0;
                  if (selectedCancellation === 'partial') return rate.cancellation_timeline && rate.cancellation_timeline.length > 0 && rate.cancellation_timeline[0].refund_amount !== rate.total_amount;
                  if (selectedCancellation === 'none') return !rate.cancellation_timeline || rate.cancellation_timeline.length === 0;
                  return true;
                });
                if (!hasMatchingCancellation) return false;
              }
              
              return true;
            }).length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg mb-2">No rooms found</div>
                <div className="text-gray-400 text-sm">Try adjusting your filters to see more options</div>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">
              Please note: hotel rates and the price of accommodations may vary depending on the guests' citizenship and the hotel's pricing policy. When searching, you selected guests' citizenship: Australia.
            </p>
          </div>
        </div>
      </div>
    );
  } 