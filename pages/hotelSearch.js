import React from 'react';
import Navbar from '../components/Navbar';
import HotelListBody from '../components/hotels/search/HotelListBody';
import Footer from '../components/Footer';

export default function HotelSearch() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HotelListBody />
      <Footer />
    </div>
  );
} 