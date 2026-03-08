import React from 'react';
import { Check, Plane, Calendar, ChevronDown } from 'lucide-react';

const FlightDetails = () => {
  return (
    <div className="border rounded-xl p-4 py-6 bg-[#F6F6F7]">
      {/* Outbound Flight Summary */}
      <div className=" border-gray-300 border-b pb-5">
        {/* OUTBOUND Tag */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-full">
            <div className="p-1 bg-primary-green rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-text" />
            </div>
            <span className="text-sm font-semibold text-primary-text">OUTBOUND</span>
          </div>
        </div>
        
        {/* Flight Route */}
        <div className="grid grid-cols-3 items-start justify-between mb-4">
          <div className='col-span-1'>
            <div className='flex items-center gap-2'>
            <p className="text-base font-bold text-primary-text">Sat, Jun 28</p>
            <p className="text-base font-bold text-primary-text">9:55 PM</p>
            </div>
            <p className="text-sm text-primary-text">Chios Island</p>
            <p className="text-sm text-primary-text">National Airport (JKH)</p>
          </div>
          
          {/* Duration Line */}
          <div className="flex-1 mx-6 relative flex items-center justify-center translate-y-3">
            <div className="h-0.5 bg-primary-text  min-w-[120px] relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-300">
                <span className="text-sm font-medium text-primary-text">6h:45m</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-base font-bold text-primary-text">9:20 AM</p>
            <p className="text-sm text-primary-text">Milan Malpensa</p>
            <p className="text-sm text-primary-text">Airport (MXP)</p>
            <div className="flex items-center justify-end gap-1">
              <span className="text-sm text-gray-600">(MXP)</span>
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </div>
          </div>
        </div>
        <div className='flex items-start justify-between'>
          <div className='flex flex-col items-start gap-2'>
            <div>logo</div>
            <h2 className='text-sm text-primary-text'>Flight operated by Srilankan Airlines</h2>
            </div>


        <p className="text-sm text-gray-600">12h25m. 1 transfers</p>
        </div>
        
        
        {/* Airline Info */}

      </div>

      {/* Flight Timeline */}
      <div className=" border">
        {/* Date Header */}
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-blue-900" />
          <h3 className="font-bold text-blue-900">Tuesday, July 1, 2025</h3>
        </div>
        
        <div className="relative border">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-red-500 border-l-2 border-dashed border-red-500 bg-amber-400"></div>
          
          <div className="space-y-8">
            {/* Dubai Arrival */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center relative z-10">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-900">05:20</p>
                <p className="font-medium text-blue-900">Dubai</p>
                <p className="text-sm text-gray-600">Dubai (DXB)</p>
              </div>
            </div>

            {/* Flight F3520 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center relative z-10">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-blue-900">Flight F3520 (1h 55min)</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xs">A</span>
                  </div>
                  <span className="text-sm text-gray-600">A Jet</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Flight class Economy</p>
              </div>
            </div>

            {/* Riyadh Arrival */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center relative z-10">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-900">06:15</p>
                <p className="font-medium text-blue-900">Riyadh</p>
                <p className="text-sm text-gray-600">Riyadh (RUH)</p>
              </div>
            </div>

            {/* Riyadh Departure */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center relative z-10">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-900">05:10</p>
                <p className="font-medium text-blue-900">Riyadh</p>
                <p className="text-sm text-gray-600">Riyadh (RUH)</p>
              </div>
            </div>

            {/* Flight PC691 */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center relative z-10">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-bold text-blue-900">Flight PC691 (4h 20min)</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xs">A</span>
                  </div>
                  <span className="text-sm text-gray-600">A Jet</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">Flight class Economy</p>
              </div>
            </div>

            {/* Istanbul Arrival */}
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center relative z-10">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-900">09:30</p>
                <p className="font-medium text-blue-900">Istanbul</p>
                <p className="text-sm text-gray-600">Istanbul Sabiha Gokcen (SAW)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Return Flight */}
      <div className="">
        <div className="flex items-center gap-2 mb-4">
          <Check className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-600">RETURN</span>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-gray-600">Sat, Jul 05 7:25 PM</p>
            <p className="font-medium">Milan Malpensa Airport (MXP)</p>
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-full">
            <span className="text-sm font-medium">6h:45m</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">7:35 AM</p>
            <p className="font-medium">Chios Island National Airport (JKH)</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-3">11h20m. 1 transfers</p>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 font-bold text-sm">A</span>
          </div>
          <span className="font-medium">Austrian</span>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails; 