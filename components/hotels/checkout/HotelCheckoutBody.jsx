import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Star, MapPin, Calendar, Users, Info, Plus, X, ChevronDown, UserPlus } from 'lucide-react';
import { countries, getCountryByCode } from '../../../data/countries';
import Container from '@/components/common/Container';
import { PiStarFill } from 'react-icons/pi';

export default function HotelCheckoutBody({ hotel, selectedRoom, selectedRate }) {
  const router = useRouter();

  // State for guest information
  const [guestInfo, setGuestInfo] = useState({
    country: 'Australia',
    phoneNumber: '350506505253',
    clientGroup: 'not chosen',
    additionalPoints: false,
    pointsBundle: '1 Point for $3.00',
    paymentMethod: 'book_now_pay_later',
    clientPrice: '90',
    commission: '8% - 0.005',
    agreeToTerms: false
  });

  // State for room guests
  const [roomGuests, setRoomGuests] = useState([
    {
      roomNumber: 1,
      roomType: 'Standard Double room (full double bed) (bed type is subject to availability) for 2 adults',
      guests: [
        { firstName: '', lastName: '' },
        { firstName: '', lastName: '' }
      ]
    },
    {
      roomNumber: 2,
      roomType: 'Standard Double room (full double bed) (bed type is subject to availability) for 2 adults',
      guests: [
        { firstName: '', lastName: '' },
        { firstName: '', lastName: '' }
      ]
    }
  ]);

  const [specialRequests, setSpecialRequests] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('IT');
  const [selectedDialCode, setSelectedDialCode] = useState('+39');

  // Handle guest name changes
  const handleGuestNameChange = (roomIndex, guestIndex, field, value) => {
    const updatedRooms = [...roomGuests];
    updatedRooms[roomIndex].guests[guestIndex][field] = value;
    setRoomGuests(updatedRooms);
  };

  // Add more guests to a room
  const addGuestToRoom = (roomIndex) => {
    const updatedRooms = [...roomGuests];
    updatedRooms[roomIndex].guests.push({ firstName: '', lastName: '' });
    setRoomGuests(updatedRooms);
  };

  // Remove guest from room
  const removeGuestFromRoom = (roomIndex, guestIndex) => {
    if (roomGuests[roomIndex].guests.length > 1) {
      const updatedRooms = [...roomGuests];
      updatedRooms[roomIndex].guests.splice(guestIndex, 1);
      setRoomGuests(updatedRooms);
    }
  };

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setGuestInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Set country code based on hotel location when component mounts
  useEffect(() => {
    if (hotel && hotel.accommodation?.location?.address?.country_code) {
      const hotelCountryCode = hotel.accommodation.location.address.country_code;
      const countryData = getCountryByCode(hotelCountryCode);

      if (countryData) {
        setSelectedCountry(hotelCountryCode);
        setSelectedDialCode(countryData.dialCode);
      }
    }
  }, [hotel]);


  if (!hotel) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Hotel information not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Handle different hotel data structures
  const hotelData = hotel.accommodation || hotel;
  const hotelName = hotelData.name || hotelData.hotel_name || 'Millennium Central Downtown Hotel';
  const hotelCheckOutTime = hotelData.check_in_information.check_out_before_time || '12:00';
  const hotelCheckInTime = hotelData.check_in_information.check_in_after_time || '15:00';
  const hotelRating = hotelData.rating || 4.8;
  const hotelAddress = hotelData.location?.address || {};
  const hotelPhotos = hotelData.photos || [];
  const hotelPrice = hotel.cheapest_rate_total_amount || hotel.total_amount || 80;
  const checkInDate = hotel.check_in_date || '2025-08-02';
  const checkOutDate = hotel.check_out_date || '2025-08-03';
  const adults = hotel.adults || 2;
  const rooms = hotel.rooms || 2;

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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleProceedToPayment = () => {
    // Handle payment processing
  };

  return (
    <div className="w-full bg-primary-bg min-h-screen py-4">
      <Container className="">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left Column - Forms and Inputs */}
          <div className="w-full lg:w-[53%] space-y-6">
            {/* Information about guests */}
            <div className="bg-white border border-gray-300 rounded-xl shadow-sm px-3 sm:px-5 py-4 sm:py-6">
              <h2 className="text-sm sm:text-base font-semibold text-primary-text mb-4 sm:mb-6">Information about guests</h2>

              {/* Country Input */}
              <div>
                <p className='text-xs sm:text-sm text-primary-text pb-2 font-medium'>{guestInfo.country}</p>
              </div>
              <div className="mb-4 sm:mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={guestInfo.country}
                    onChange={(e) => handleFieldChange('country', e.target.value)}
                    className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green border border-gray-100 focus:border-primary-text text-xs sm:text-sm"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <X className="w-4 h-4 text-primary-text" />
                  </button>
                </div>
              </div>

              {/* Room Details */}
              {roomGuests.map((room, roomIndex) => (
                <div key={roomIndex} className="">
                  <div className='flex justify-between items-start pb-3 sm:pb-5'>

                    <p className="text-xs sm:text-base text-primary-text font-medium">{room.roomType}</p>
                    <h3 className="mb-3 min-w-[75px] text-xs sm:text-base text-gray-500 h-full text-end">Room {room.roomNumber}</h3>

                  </div>
                  {room.guests.map((guest, guestIndex) => (
                    <div key={guestIndex} className="flex gap-2 sm:gap-3 mb-3">
                      <div className='grid grid-cols-2 gap-3 sm:gap-6 w-full'>
                        <div className='w-full'>
                          <label htmlFor="firstName" className="text-xs sm:text-sm text-primary-text font-medium">Guest's name</label>
                          <input
                            type="text"
                            value={guest.firstName}
                            onChange={(e) => handleGuestNameChange(roomIndex, guestIndex, 'firstName', e.target.value)}
                            placeholder="Guest's name"
                            className="flex-1 px-2 sm:px-3 py-3 sm:py-3.5 bg-gray-100 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green border border-gray-100 focus:border-primary-text text-xs sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="text-xs sm:text-sm text-primary-text font-medium mb-1">Guest's last name</label>
                          <input
                            type="text"
                            value={guest.lastName}
                            onChange={(e) => handleGuestNameChange(roomIndex, guestIndex, 'lastName', e.target.value)}
                            placeholder="Guest's last name"
                            className="flex-1 px-2 sm:px-3 py-3 sm:py-3.5 bg-gray-100 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green border border-gray-100 focus:border-primary-text text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                      {room.guests.length > 1 && (
                        <button
                          onClick={() => removeGuestFromRoom(roomIndex, guestIndex)}
                          className="px-2 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => addGuestToRoom(roomIndex)}
                    className="text-primary-text text-sm sm:text-lg font-medium flex items-center gap-1 py-2"
                  >
                    <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-xs sm:text-sm">Add names of other guests</span>
                  </button>
                </div>
              ))}

              {/* Special Requests */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-start gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="specialRequests"
                    className="mt-1"
                  />
                  <label htmlFor="specialRequests" className="text-xs sm:text-sm text-gray-700">
                    I agree to the discretion of the hotel and subject to availability. Please contact our Customer Support if you'd like to add guaranteed services.
                  </label>
                </div>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Add your special requests here..."
                  maxLength={3000}
                  className="w-full px-3 sm:px-4 py-3 border border-primary-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green h-32 resize-none text-xs sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">3000 symbols limit</p>
              </div>
            </div>

            {/* Booking details */}
            <div className="bg-white border border-gray-300 rounded-xl shadow-sm py-4 sm:py-6 px-3 sm:px-5">
              <h2 className="text-sm sm:text-base font-semibold text-primary-text mb-4 sm:mb-6">Booking details</h2>

              {/* Phone Number */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Your phone number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-2 border border-gray-300 rounded-lg">
                    <span className="text-xs sm:text-sm">🇮🇹</span>
                    <span className="text-xs sm:text-sm font-medium">+39</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={guestInfo.phoneNumber}
                    onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
                    className="flex-1 px-2 sm:px-3 py-2 border border-primary-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Group of clients */}
              <div className="mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Group of clients</label>
                <input
                  type="text"
                  value={guestInfo.clientGroup}
                  onChange={(e) => handleFieldChange('clientGroup', e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 border border-primary-text rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green text-xs sm:text-sm"
                />
              </div>
            </div>
            <div className='flex flex-col bg-white border border-gray-300 rounded-xl shadow-sm'>


              {/* Add points */}
              <div className="py-4 sm:py-6 px-3 sm:px-5">
                <h2 className="text-sm sm:text-base font-semibold text-primary-text mb-4 sm:mb-6">Add points</h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">
                  You can buy a bundle of additional points - they will be counted with your ordinary points.
                </p>

                <div className="flex items-center justify-between gap-2 sm:gap-3 border rounded-md p-2 sm:p-3 border-primary-text">
                  <div className='flex items-center gap-2'>
                    <input
                      type="checkbox"
                      id="additionalPoints"
                      checked={guestInfo.additionalPoints}
                      onChange={(e) => handleFieldChange('additionalPoints', e.target.checked)}
                    />
                    <label htmlFor="additionalPoints" className="text-xs sm:text-sm font-medium text-gray-700">
                      Additional points
                    </label>
                  </div>
                  <button className="flex items-center gap-2 px-2 sm:px-3 py-2 border border-primary-text rounded-md text-xs sm:text-sm">
                    {guestInfo.pointsBundle}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Payment method */}
              <div className="py-4 sm:py-6 px-3 sm:px-5">
                <h2 className="text-sm sm:text-base font-semibold text-primary-text mb-4 sm:mb-6">Payment method</h2>
                <div className="border border-primary-text rounded-md overflow-hidden">
                  <label className={`flex flex-col items-start gap-2 p-2 sm:p-3 ${guestInfo.paymentMethod === 'book_now_pay_later' ? 'bg-secondary-green text-white' : ''}`}>
                    <div className='flex flex-row items-center gap-1'>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="book_now_pay_later"
                        checked={guestInfo.paymentMethod === 'book_now_pay_later'}
                        onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                        className=""
                      />
                      <div className="text-xs sm:text-sm text-primary-text">Book now, pay later</div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      After booking, you can create an invoice and pay via bank transfer, or bank card, or payment link directly in your account. Please remember that bookings and invoices paid by bank card are not going to be indicated in closing documents.
                      <br />
                      Insufficient credit limit. For more information, contact your account manager
                    </div>
                  </label>

                  <label className={`flex flex-col items-start gap-2 p-2 sm:p-3 ${guestInfo.paymentMethod === 'pay_now_card' ? 'bg-secondary-green text-white' : ''}`}>
                    <div className='flex flex-row items-center gap-1'>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pay_now_card"
                        checked={guestInfo.paymentMethod === 'pay_now_card'}
                        onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                        className=""
                      />
                      <div className="text-xs sm:text-sm text-primary-text">Book now, pay later</div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      The cost of the booking will be charged to the bank card you provided during the reservation.
                    </div>
                  </label>

                  <label className={`flex flex-col items-start gap-2 p-2 sm:p-3 ${guestInfo.paymentMethod === 'pay_now_client' ? 'bg-secondary-green text-white' : ''}`}>
                    <div className='flex flex-row items-center gap-1'>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pay_now_client"
                        checked={guestInfo.paymentMethod === 'pay_now_client'}
                        onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                        className=""
                      />
                      <div className="text-xs sm:text-sm text-primary-text">Pay now by client's card (OGGO price suits the commission)</div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Used for payment by the client's bank card. The amount that you enter below, in the Client price and the commission section, will be withdrawn from the specified card, then, according to the contract terms and conditions, you'll get the commission.
                    </div>
                  </label>

                  <label className={`flex flex-col items-start gap-2 p-2 sm:p-3 ${guestInfo.paymentMethod === 'pay_at_hotel' ? 'bg-secondary-green text-white' : ''}`}>
                    <div className='flex flex-row items-center gap-1 '>

                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pay_at_hotel"
                        checked={guestInfo.paymentMethod === 'pay_at_hotel'}
                        onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
                        className=""
                      />
                      <div>
                      </div>
                      <div className="text-xs sm:text-sm text-primary-text">Pay to the accommodation facility</div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      This payment method is only available for the rates with the corresponding payment conditions
                    </div>
                  </label>
                </div>
              </div>

              {/* Client price and commission */}
              <div className="py-4 sm:py-6 px-3 sm:px-5">
                <h2 className="text-sm sm:text-base font-semibold text-primary-text mb-4 sm:mb-6">Client price and the commission</h2>
                <p className="text-xs sm:text-sm text-primary-text mb-4">
                  Enter the client price. This price will be saved in your back office in the booking data for informational purposes.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-primary-text mb-2">Client price</label>
                    <input
                      type="text"
                      value={guestInfo.clientPrice}
                      onChange={(e) => handleFieldChange('clientPrice', e.target.value)}
                      className="w-full px-2 sm:px-3 py-3 sm:py-3.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green border border-gray-100 focus:border-primary-text text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-primary-text mb-2">Commission</label>
                    <input
                      type="text"
                      value={guestInfo.commission}
                      onChange={(e) => handleFieldChange('commission', e.target.value)}
                      className="w-full px-2 sm:px-3 py-3 sm:py-3.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green border border-gray-100 focus:border-primary-text text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Just one more step */}
              <div className="py-4 sm:py-6 px-3 sm:px-5">
                <h2 className="text-sm sm:text-base font-semibold text-primary-text mb-4 sm:mb-6">Just one more step!</h2>

                <div className="flex items-start gap-3 mb-4 sm:mb-6">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={guestInfo.agreeToTerms}
                    onChange={(e) => handleFieldChange('agreeToTerms', e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="agreeToTerms" className="text-xs sm:text-sm text-primary-text">
                    I consent to the booking and cancellation terms, I agree that non-refundable costs will not be refunded, and I consent to the processing of personal data in accordance with the personal data processing policy.
                  </label>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={!guestInfo.agreeToTerms}
                  className="w-full bg-green-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Proceed to payment
                </button>
              </div>
            </div>

          </div>

          {/* Right Column - Hotel and Price Details */}
          <div className="w-full lg:w-[47%] space-y-6">
            {/* Hotel Information */}
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="bg-primary-green text-white p-3 sm:p-5">

                <div className="flex items-center gap-2 mb-3 bg-gray-100 w-fit rounded-full px-3 sm:px-4 p-1.5">
                  {renderStars(hotelRating)}
                  <span className="text-sm sm:text-base text-primary-text font-medium">{hotelRating}</span>
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-primary-text mb-1">{hotelName}</h3>

                <div className="flex items-start gap-2 text-xs sm:text-sm text-blue-500">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-text" />
                  <span>{hotelAddress.line_one || 'Al Asayel St, Business Bay, Dubai'}</span>
                </div>
              </div>
              <div className="p-3 sm:p-5">

                {/* Check-in/Check-out details */}
                <div className="s text-xs sm:text-sm text-gray-600 mb-4 " >
                  <div className='grid grid-cols-2  p-1 sm:p-2 border-b-2 border-dashed-4'>
                    <div className=' flex flex-row item justify-center border-r border-gray-300 '>
                      <div className='flex flex-col  text-start w-fit'>
                        <span className='text-xs sm:text-sm lg:text-base text-primary-text'>Check-in</span>
                        <span className='text-xs sm:text-sm text-primary-text font-medium lg:text-base'>{formatDate(checkInDate)}</span>
                        <span className='text-xs sm:text-sm text-primary-text lg:text-base'>from {hotelCheckInTime}</span>
                      </div>
                    </div>
                    <div className=' flex flex-row item justify-center'>
                      <div className='flex flex-col text-start'>
                        <span className='text-xs sm:text-sm lg:text-base text-primary-text '>Check-out</span>
                        <span className='text-xs sm:text-sm text-primary-text font-medium lg:text-base'>{formatDate(checkOutDate)} </span>
                        <span className='text-xs sm:text-sm text-primary-text lg:text-base'>from {hotelCheckOutTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 lg:gap-2 border-b border-dashed-4 relative py-4 lg:py-6  border-gray-300'>
                    <div className='text-xs sm:text-sm lg:text-base text-primary-text '>Meals are not included, no meals for children included</div>
                    <div className='text-xs sm:text-sm lg:text-base text-primary-text  '>Non-refundable</div>
                    <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      Important information
                    </button>
                    <div className='absolute bg-primary-bg h-6 w-6 translate-y-1/2 bottom-0 right-[-30px] rounded-full'></div>
                    <div className='absolute bg-primary-bg h-6 w-6 translate-y-1/2 bottom-0 left-[-30px] rounded-full'></div>

                  </div>
                </div>

                {/* Room Details */}
                <div className="">
                  {roomGuests.map((room, index) => (
                    <div key={index} className="border-b border-dashed-4 py-4 lg:py-6 border-gray-300 flex flex-col gap-2">
                      <div className="text-xs sm:text-sm lg:text-base text-primary-text mb-2 ">{room.roomType}</div>
                      <div className="text-xs sm:text-sm  text-gray-400 mb-1 lg:text-base">STANDARD ROOM</div>
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-primary-text ">
                        <Users className="w-4 h-4" />
                        {room.guests.length} adults
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="">
                  <div className="flex flex-col gap-2 border-b border-dashed-4 py-4 lg:py-6 border-gray-300 ">

                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm lg:text-base  text-primary-text">Price of {rooms} rooms for 1 night</span>
                      <span className=" text-primary-text text-sm sm:text-base">${formatPrice(hotelPrice)}.00</span>
                    </div>

                    <div className="text-xs sm:text-sm lg:text-base text-primary-text">VAT is not applicable</div>
                  </div>
                  <div className='border-b border-dashed-4 py-4 lg:py-6 border-gray-300'>

                    <button className="w-full text-primary-text text-xs sm:text-sm font-medium py-2 sm:py-3 lg:py-4 border border-primary-text rounded-lg">
                      Enter Promo Code
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-b border-dashed-4 py-4 lg:py-6 border-gray-300">
                    <div className='flex items-center gap-2'>
                      <input type="checkbox" id="payWithPoints" />
                      <label htmlFor="payWithPoints" className="text-xs sm:text-sm text-gray-700">Pay with points</label>
                    </div>
                    <button className="flex items-center gap-1 px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm">
                      Choose
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
              <div className='flex flex-row py-4 lg:py-6 items-center justify-between gap-2'>

                  <div className="flex flex-col  items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm lg:text-base text-primary-text">Currency</span>
                    <button className="flex items-center gap-1 px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm">
                      USD
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col justify-between items-center pt-3 py-4 lg:py-6 ">
                    <span className="text-primary-text text-xs sm:text-sm lg:text-base">Payment total</span>
                    <span className="text-xs sm:text-sm lg:text-base text-primary-text">${formatPrice(hotelPrice)}.00</span>
                  </div>
              </div>

                  {/* Included in the price */}
                  <div className="pt-3 border-t border-dashed-4 py-4 lg:py-6 border-gray-300">
                    <h4 className="text-xs sm:text-sm lg:text-base text-primary-text mb-2">Included in the price</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs sm:text-sm lg:text-base">
                        <span className="text-primary-text">Occupancy fee</span>
                        <span className="text-primary-text">$15.12</span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm lg:text-base">
                        <span className="text-primary-text">Service fee</span>
                        <span className="text-primary-text">$0.08</span>
                      </div>
                    </div>
                  </div>

                  {/* To pay upon arrival */}
                  <div className="pt-3 py-4 lg:py-6">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs sm:text-sm lg:text-base text-primary-text">To pay upon arrival (Not included in the price)</span>
                      <span className="text-xs sm:text-sm lg:text-base font-medium text-primary-text">AED 30.00</span>
                    </div>
                    <div className="text-xs text-gray-500">City tax</div>
                  </div>

                  <div className="flex items-center gap-1 text-xs sm:text-sm lg:text-base text-primary-text border-t border-dashed-4 py-4 lg:py-6 border-gray-300">
                    <span>You will get 1 point</span>
                    <Info className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
} 