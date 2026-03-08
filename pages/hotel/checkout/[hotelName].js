import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '../../../components/Navbar';
import HotelCheckoutBody from '../../../components/hotels/checkout/HotelCheckoutBody';
import Footer from '../../../components/Footer';
import Container from '@/components/common/Container';

export default function HotelCheckout() {
  const router = useRouter();
  const { hotelName, id, room, rate } = router.query;
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (router.isReady && id) {
      fetchHotelDetails(id);
    }
  }, [router.isReady, id]);

  const fetchHotelDetails = async (hotelId) => {
    try {
      setLoading(true);

      // Call the external API directly instead of using APILINK
      const response = await axios.get(`https://www.oggoair.com/api/hotels/rates/${hotelId}`);

      // Handle different response structures
      let hotelData = null;
      if (response.data.data) {
        hotelData = response.data.data.data || response.data.data;
      } else {
        hotelData = response.data;
      }

      if (!hotelData) {
        throw new Error('No hotel data received from API');
      }

      setHotel(hotelData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching hotel checkout details:', error);

      if (error.response?.status === 404) {
        setError('Hotel not found. Please check the URL and try again.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to fetch hotel details');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading checkout details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-bg min-h-screen">
      <Navbar />
      <Container className='pt-32 lg:pt-50 '>
        <div className='bg-white rounded-lg p-6'>
          hi
        </div>
      </Container>
      <div className="w-full flex justify-center">
        <div className="w-full">
          <HotelCheckoutBody
            hotel={hotel}
            selectedRoom={room}
            selectedRate={rate}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
} 