import React, { useState } from 'react';
import { Shield, Check, ChevronDown, ChevronUp } from 'lucide-react';

const ProtectionSection = ({ selectedProtection, onProtectionChange }) => {
  const [expandedCancellation, setExpandedCancellation] = useState(true);
  const [expandedComprehensive, setExpandedComprehensive] = useState(false);

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Travel with peace of mind</h2>
        </div>
      </div>

      {selectedProtection === 'cancellation' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">Cancellation Protection added for 1 passenger</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Cancellation Protection */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="protection"
                id="cancellation"
                checked={selectedProtection === 'cancellation'}
                onChange={() => onProtectionChange('cancellation')}
                className="w-4 h-4 text-green-600"
              />
              <label htmlFor="cancellation" className="font-medium text-gray-800">
                Cancellation Protection
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">$6.33</span>
              <span className="text-sm text-gray-600">for 1 passenger</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-3">
            You'll receive a refund in the event of delays, cancellations or COVID-19.
          </p>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setExpandedCancellation(!expandedCancellation)}
              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
            >
              Details
              {expandedCancellation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <a href="#" className="text-blue-600 hover:underline text-sm">Learn more</a>
          </div>
          
          {expandedCancellation && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-800">You're covered in case of:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Cancellation due to injury or illness, including COVID-19</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Delays of 12 hours or longer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Involuntary sudden unemployment</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comprehensive Protection */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="protection"
                id="comprehensive"
                checked={selectedProtection === 'comprehensive'}
                onChange={() => onProtectionChange('comprehensive')}
                className="w-4 h-4 text-green-600"
              />
              <label htmlFor="comprehensive" className="font-medium text-gray-800">
                Comprehensive Protection
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">+$22.30</span>
              <span className="text-sm text-gray-600">for 1 passenger</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-3">
            You're covered in the event of delays, cancellations, COVID-19, medical expenses, lost luggage and more.
          </p>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setExpandedComprehensive(!expandedComprehensive)}
              className="text-blue-600 hover:underline text-sm flex items-center gap-1"
            >
              Details
              {expandedComprehensive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <a href="#" className="text-blue-600 hover:underline text-sm">Learn more</a>
          </div>
          
          {expandedComprehensive && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-gray-800">You are covered in case of:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Cancellation due to injury or illness, including COVID-19</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Delays of 12 hours or longer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Involuntary sudden unemployment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Medical expenses during the journey</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Theft or damage to items</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">Lost luggage</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* No Protection */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="protection"
              id="none"
              checked={selectedProtection === 'none'}
              onChange={() => onProtectionChange('none')}
              className="w-4 h-4 text-green-600"
            />
            <label htmlFor="none" className="font-medium text-gray-800">
              I want to travel without protection
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtectionSection; 