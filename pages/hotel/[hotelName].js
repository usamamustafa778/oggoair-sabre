import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import HotelDetailsBody from '../../components/hotels/details/HotelDetailsBody';
import Footer from '../../components/Footer';
import Container from '@/components/common/Container';

export default function HotelDetails() {
  const router = useRouter();
  const { hotelName, id } = router.query;
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
      
      // Use the same data structure as the working version
      const hotelData = response.data.data.data;
      
      if (!hotelData) {
        throw new Error('No hotel data received from API');
      }
      
      setHotel(hotelData);
      setLoading(false);
        } catch (error) {
      console.error('Error fetching hotel details:', error);
      setLoading(false);
      
      // Use the same error handling as the working version
      let errorMessage = 'Failed to fetch hotel details';
      
      if (error.response?.data?.message) {
        // Handle array messages from API (like in the working version)
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message[0].title || error.response.data.message[0].message;
        } else {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading hotel details...</p>
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
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Hotel Not Found</h2>
              <p className="text-red-500 text-sm mb-6">{error}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button 
                onClick={() => router.push('/hotelSearch')}
                className="px-4 py-2 bg-primary-green text-white rounded-md hover:bg-secondary-green transition-colors"
              >
                Search Hotels
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-bg min-h-screen">
      <Navbar />
      <div className="w-full flex justify-center px-3 pt-20">
        <Container className="w-full  mt-5">
          <HotelDetailsBody hotel={hotel} />
        </Container>
      </div>
      <Footer/>
    </div>
  );
} 