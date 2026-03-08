import React, { useState } from 'react'
import Layout from './layout'

function Notifications() {
  const [emailNotifications, setEmailNotifications] = useState(true)

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Promotions section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Promotions</h2>
          <p className="text-gray-600 mb-6">
            Receive coupons, promotions, surveys, product updates, and travel inspiration from Omio and our partners.
          </p>
          
          {/* Email toggle */}
          <div className="flex items-center justify-between">
            <label className="text-gray-900 font-medium">Email</label>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                emailNotifications ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Notifications
