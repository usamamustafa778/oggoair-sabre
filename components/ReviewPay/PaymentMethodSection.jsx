import React, { useState } from 'react';
import { CreditCard, ChevronDown, ChevronUp } from 'lucide-react';

const PaymentMethodSection = () => {
  const [showOtherMethods, setShowOtherMethods] = useState(false);

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Select payment method</h2>
      
      <div className="space-y-6">
        {/* Card Payment */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="radio"
              name="paymentMethod"
              id="card"
              defaultChecked
              className="w-4 h-4 text-green-600"
            />
            <label htmlFor="card" className="font-medium text-gray-800">Card</label>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">**** 4987</span>
              <div className="flex gap-1">
                <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MC</span>
                </div>
                <div className="w-8 h-5 bg-orange-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">V</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name on Card
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter cardholder name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card number
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration date
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="DD"
                  />
                  <input
                    type="text"
                    className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="MM"
                  />
                  <input
                    type="text"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="YYYY"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="123"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="saveCard"
                className="w-4 h-4 text-green-600"
              />
              <label htmlFor="saveCard" className="text-sm text-gray-700">
                Save this payment method for future bookings
              </label>
            </div>
          </div>
        </div>

        {/* Other Payment Methods */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => setShowOtherMethods(!showOtherMethods)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <span className="font-medium text-gray-800">OTHER PAYMENT METHODS</span>
            {showOtherMethods ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showOtherMethods && (
            <div className="px-4 pb-4 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  id="debitCard"
                  className="w-4 h-4 text-green-600"
                />
                <label htmlFor="debitCard" className="font-medium text-gray-800">Debit/Credit card</label>
                <div className="flex gap-1 ml-auto">
                  <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">V</span>
                  </div>
                  <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">MC</span>
                  </div>
                  <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">AE</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  id="applePay"
                  className="w-4 h-4 text-green-600"
                />
                <label htmlFor="applePay" className="font-medium text-gray-800">Apple Pay</label>
                <div className="w-8 h-5 bg-black rounded flex items-center justify-center ml-auto">
                  <span className="text-white text-xs font-bold">AP</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  id="googlePay"
                  className="w-4 h-4 text-green-600"
                />
                <label htmlFor="googlePay" className="font-medium text-gray-800">Google Pay</label>
                <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center ml-auto">
                  <span className="text-white text-xs font-bold">GP</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  id="stripe"
                  className="w-4 h-4 text-green-600"
                />
                <label htmlFor="stripe" className="font-medium text-gray-800">Stripe</label>
                <div className="w-8 h-5 bg-purple-600 rounded flex items-center justify-center ml-auto">
                  <span className="text-white text-xs font-bold">S</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSection; 