import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { CiHeart } from 'react-icons/ci';
import { PiShareFatThin } from 'react-icons/pi';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import { MdInfo } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import {
  WiWifi,
  FaCar,
  FaParking,
  FaMotorcycle,
  FaStairs,
  FaShoppingBag,
  FaDumbbell,
  FaSwimmingPool,
  FaUtensils,
  FaSpa,
  FaBusinessTime,
  FaConciergeBell,
  FaWheelchair,
  FaBed,
  FaClock,
  FaDoorOpen,
  FaGlassMartini,
  FaCreditCard,
  FaBaby,
  FaCheck,
  FaPlus,
  FaInfo,
  FaCog
} from 'react-icons/fa';
import {
  WashingMachine,
  Building2,
  Car,
  Wifi,
  Dumbbell,
  Waves,
  UtensilsCrossed,
  Sparkles,
  Briefcase,
  Bell,
  Wheelchair,
  Bed,
  Clock,
  DoorOpen,
  Wine,
  Utensils,
  RefreshCcw
} from 'lucide-react';
import { createHotelDetailsUrl } from '../../../utils/urlUtils';

export default function HotelCardComponent({ hotel }) {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Log hotel data for debugging

  const goToHotelDetails = () => {
    // Try different possible ID fields - prioritize search result ID for Duffel API
    let hotelId = hotel.id || // This is the search result ID (srr_...)
      hotel.accommodation?.id ||
      hotel.accommodation?.rate_id ||
      hotel.accommodation?.rateId ||
      hotel.rate_id ||
      hotel.rateId ||
      hotel.rate?.id ||
      hotel.rate?.rate_id;

    // Log which ID type we're using
    if (hotelId) {
    }


    if (!hotelId) {
      console.error('No hotel ID found in hotel data:', hotel);
      alert('Unable to view hotel details. Please try again.');
      return;
    }

    // Create clean URL with hotel name
    const hotelName = hotel.accommodation?.name || hotel.name || 'hotel';
    const hotelUrl = createHotelDetailsUrl(hotelName, hotelId);

    router.push(hotelUrl);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const nextImage = () => {
    const totalImages = hotel.accommodation?.photos?.length || 0;
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    const totalImages = hotel.accommodation?.photos?.length || 0;
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const getAmenityIcon = (type) => {
    switch (type) {
      case 'wifi':
        return <Wifi className="w-4 h-4 text-primary-text" />;
      case 'parking':
        return <FaParking className="w-4 h-4 text-primary-text" />;
      case 'pool':
        return <FaSwimmingPool className="w-4 h-4 text-primary-text" />;
      case 'gym':
        return <FaDumbbell className="w-4 h-4 text-primary-text" />;
      case 'restaurant':
        return <FaUtensils className="w-4 h-4 text-primary-text" />;
      case 'spa':
        return <FaSpa className="w-4 h-4 text-primary-text" />;
      case 'laundry':
        return <WashingMachine className="w-4 h-4 text-primary-text" />;
      case 'business_centre':
        return <FaBusinessTime className="w-4 h-4 text-primary-text" />;
      case '24_hour_front_desk':
        return <FaClock className="w-4 h-4 text-primary-text" />;
      case 'concierge':
        return <FaConciergeBell className="w-4 h-4 text-primary-text" />;
      case 'room_service':
        return <FaBed className="w-4 h-4 text-primary-text" />;
      case 'lounge':
        return <FaGlassMartini className="w-4 h-4 text-primary-text" />;
      case 'accessibility_mobility':
        return <FaWheelchair className="w-4 h-4 text-primary-text" />;
      case 'cash_machine':
        return <FaCreditCard className="w-4 h-4 text-primary-text" />;
      case 'childcare_service':
        return <FaBaby className="w-4 h-4 text-primary-text" />;
      default:
        // Random default icons for unknown amenity types
        const defaultIcons = [
          <FaStar className="w-4 h-4 text-primary-text" />,
          <FaCheck className="w-4 h-4 text-primary-text" />,
          <FaPlus className="w-4 h-4 text-primary-text" />,
          <FaCog className="w-4 h-4 text-primary-text" />,
          <FaInfo className="w-4 h-4 text-primary-text" />,
          <Wifi className="w-4 h-4 text-primary-text" />
        ];
        // Use the amenity type as a seed for consistent icon selection
        const hash = type.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const iconIndex = Math.abs(hash) % defaultIcons.length;
        return defaultIcons[iconIndex];
    }
  };

  const getAmenityName = (type) => {
    switch (type) {
      case 'wifi':
        return 'WiFi';
      case 'parking':
        return 'Parking';
      case 'pool':
        return 'Pool';
      case 'gym':
        return 'Gym';
      case 'restaurant':
        return 'Restaurant';
      case 'spa':
        return 'Spa';
      case 'laundry':
        return 'Laundry';
      case 'business_centre':
        return 'Business Centre';
      case '24_hour_front_desk':
        return '24-Hour Front Desk';
      case 'concierge':
        return 'Concierge';
      case 'room_service':
        return 'Room Service';
      case 'lounge':
        return 'Lounge';
      case 'accessibility_mobility':
        return 'Wheelchair Access';
      case 'cash_machine':
        return 'Cash Machine';
      case 'childcare_service':
        return 'Childcare Services';
      default:
        return 'Amenity';
    }
  };

  const totalImages = hotel.accommodation?.photos?.length || 0;
  const currentImage = hotel.accommodation?.photos?.[currentImageIndex];

  return (
    <div className="w-full bg-white rounded-xl shadow-lg  border border-gray-200">
      <div className="flex flex-col sm:flex-row">
        {/* Left Section - Image */}
        <div className="sm:w-[36.5%] sm:aspect-[16/15] h-auto relative">
          {currentImage ? (
            <div className="relative h-64 lg:h-full">
              <Image
                src={currentImage.url}
                width={400}
                height={300}
                unoptimized
                alt={`${hotel.accommodation?.name || 'Hotel'} - Image ${currentImageIndex + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Favorite Button */}
              <button className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors">
                <CiHeart className="text-gray-600 text-xl" />
              </button>

              {/* Image Navigation */}
              {totalImages > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                  >
                    <IoArrowBack className="text-gray-600" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                  >
                    <IoArrowForward className="text-gray-600" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/6500 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1}/{totalImages}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-64 lg:h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>

        {/* Right Section - Information */}
        <div className="sm:w-[63.5%] p-4 py-6 flex flex-col justify-between gap-2">
          {/* Hotel Details */}
          <div>
            <span className="text-base font-semibold text-primary-text mb-2">
              {hotel.accommodation?.location?.address?.country_code || 'Country code not available'} {" : "}
            </span>
            {hotel.accommodation?.name && <span className="text-base font-semibold text-primary-text">
              {hotel.accommodation?.name || 'Hotel'}
            </span>
            }
          </div>
          
          <div className="">

            <div className="flex flex-row gap-4">
              {hotel.accommodation?.location?.address?.city_name && <p className="text-blue-600 text-sm mb-2">
                City : {hotel.accommodation?.location?.address?.city_name || 'City not available'}
              </p>
              }
              {hotel.accommodation?.location?.address?.line_one && <p className="text-blue-600 text-sm mb-2">
                Address : {hotel.accommodation?.location?.address?.line_one || 'Address not available'}
              </p>
              }
            </div>
            <div className="flex flex-row justify-between gap-4 ">
              <div>

                {hotel.accommodation?.location?.address?.postal_code && <p className="text-gray-600 text-sm">
                  Postal Code : {hotel.accommodation?.location?.address?.postal_code || 'Postal code not available'}
                </p>
                }

              </div>
              {/* Amenities Icons */}
              <div className="flex flex-wrap gap-3 rounded-lg">
                {hotel.accommodation?.amenities?.slice(0, 6).map((amenity, index) => (
                  <div
                    key={index}
                    className="group relative  bg-white rounded hover:bg-gray-50 transition-colors"
                  >
                    {getAmenityIcon(amenity.type)}

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      {amenity.description || getAmenityName(amenity.type) || 'Amenity'}
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Room Details */}
          <div className=' flex-col flex gap-2'>

          <div className="bg-secondary-green grid grid-cols-3 rounded-lg p-2">
            <div className="flex justify-between items-start gap-2">
              <div className="flex flex-row items-start text-xs gap-1 text-gray-600 ">
                <p className="font-medium text-gray-800">Rooms :</p>
                <p className="text-medium text-gray-600">{hotel.rooms}</p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-1.5 text-xs text-gray-600 ">
              <div className="flex items-center gap-1">
                <span className="text-primary-text"><Utensils className='w-3 h-3'/></span>
                <span>No meals</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-primary-text"><RefreshCcw className='w-3 h-3'/></span>
                <span>Free cancellation</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-primary-text">
                $ {formatPrice(hotel.cheapest_rate_total_amount || 0)}
              </span>
              <MdInfo className="text-primary-text text-base" />
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-row justify-between items-center">

            <div className="bg-secondary-green rounded-lg px-3 h-fit py-0.5">
              <div className="flex items-center gap-2">
                <FaStar className="text-orange-500" />
                <span className="text-primary-text font-medium">
                  {hotel.accommodation?.review_score || 'N/A'} ({hotel.accommodation?.rating || 'N/A'})
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={goToHotelDetails}
              className="w-fit h-fit bg-primary-green text-sm text-primary-text  py-3 px-4 rounded-full  hover:bg-secondary-green/50 transition-colors"
            >
              Show all rooms
            </button>
          </div>
          </div>

        </div>
      </div>
    </div>
  );
} 