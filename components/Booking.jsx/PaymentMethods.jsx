import React from 'react'
import Layout from './layout'

function PaymentMethods() {
  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Adding payment methods alert box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">
              !
            </div>
            <div>
              <p className="text-blue-800 font-semibold">Adding payment methods</p>
              <p className="text-blue-700 text-sm mt-1">You can add payment methods during the booking process</p>
            </div>
          </div>
        </div>

        {/* Payment methods section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment methods</h2>
          
          {/* Payment method card */}
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <p className="font-medium text-gray-900">MasterCard</p>
                  <p className="text-sm text-gray-500">****4987</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* MasterCard logo */}
                <div className="flex items-center space-x-1">
                  <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                  </div>
                  <div className="w-8 h-5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                  </div>
                </div>
                
                {/* Chevron down icon */}
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PaymentMethods
