import React, { useState } from 'react'
import Layout from './layout'

function ReferAFriend() {
  const [emailAddresses, setEmailAddresses] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const handleCopyLink = () => {
    navigator.clipboard.writeText('go-refer.omio.com/FouqQl')
  }

  return (
    <Layout>
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Refer a Friend section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-700 mb-6">
            KHURRAM, you'll get a €10 in Refer a Friend credits for each friend you invite to use Omio. They'll also get €10 off their first booking, so everyone wins.
          </p>
          
          {/* Email invitation */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Enter email addresses"
                  value={emailAddresses}
                  onChange={(e) => setEmailAddresses(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium transition-colors">
                Send Invites
              </button>
            </div>
          </div>

          {/* Share invite link */}
          <div className="mb-6">
            <p className="text-gray-700 mb-3">Or share an invite link</p>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value="go-refer.omio.com/FouqQl"
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Copy link
              </button>
            </div>
          </div>

          {/* Social media sharing */}
          <div className="flex items-center space-x-3">
            <button className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
              <span className="text-white font-bold text-sm">W</span>
            </button>
            <button className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
              <span className="text-white font-bold text-sm">f</span>
            </button>
            <button className="w-10 h-10 bg-blue-400 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
              <span className="text-white font-bold text-sm">t</span>
            </button>
          </div>
        </div>

        {/* Received an invite section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Received an invite link or code?</h3>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="→ Enter invite link or code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ReferAFriend
