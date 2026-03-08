import React from 'react'
import Image from 'next/image'
import { Check } from 'lucide-react'

function Rightbar({children}) {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      {/* Left side - Main Content */}
      <div className="flex-1">
        {children}
      </div>
      
      {/* Right sidebar */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        {/* QR Code Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <Image 
                  src="/st-images/booking/qr.png" 
                  alt="QR Code" 
                  width={120} 
                  height={120} 
                  className='w-28 h-28 object-contain' 
                />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Scan to discover more features and savings in our app
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <Check className='w-5 h-5 text-primary-green flex-shrink-0'/>
                    <span className="text-sm text-gray-700 font-medium">Special in-app offers</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className='w-5 h-5 text-primary-green flex-shrink-0'/>
                    <span className="text-sm text-gray-700 font-medium">Tickets available offline</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className='w-5 h-5 text-primary-green flex-shrink-0'/>
                    <span className="text-sm text-gray-700 font-medium">Live trip updates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Retrieval Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-green/10 to-primary-green/5 px-6 py-5 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Your Travel Companion</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Enter your booking number and email address below and we'll find your ticket for you. We sent your booking number to you in your confirmation email.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Booking number
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all"
                  placeholder="Enter booking number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all"
                  placeholder="Enter email address"
                />
              </div>
              <button className="w-full bg-primary-green text-primary-text px-6 py-3.5 text-base rounded-lg font-semibold hover:bg-primary-green/90 transition-all shadow-sm hover:shadow-md">
                Retrieve booking
              </button>
            </div>
          </div>
        </div>

        {/* Support Chat */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Get help with your booking</h3>
          </div>
          <div className="p-6">
            <button className="w-full bg-gray-900 text-white px-6 py-3.5 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-sm hover:shadow-md">
              Open Support Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rightbar