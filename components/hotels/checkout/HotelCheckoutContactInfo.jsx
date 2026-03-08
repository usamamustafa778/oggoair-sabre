import React from 'react';

export default function HotelCheckoutContactInfo({ 
  userData, 
  changeValue, 
  countries, 
  toggleGender 
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <select
            value={userData.title}
            onChange={(e) => changeValue(e.target.value, 'title')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Title</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
            <option value="Dr">Dr</option>
          </select>
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={userData.name}
            onChange={(e) => changeValue(e.target.value, 'name')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter first name"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={userData.surename}
            onChange={(e) => changeValue(e.target.value, 'surename')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter last name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={userData.email}
            onChange={(e) => changeValue(e.target.value, 'email')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email address"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="flex">
            <select
              value={userData.dialCode}
              onChange={(e) => changeValue(e.target.value, 'dialCode')}
              className="w-24 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Code</option>
              {countries.map((country) => (
                <option key={country.name} value={country.dialCode}>
                  {country.dialCode}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={userData.phoneNumber}
              onChange={(e) => changeValue(e.target.value, 'phoneNumber')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={userData.birthDay}
            onChange={(e) => changeValue(e.target.value, 'birthDay')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={userData.gender === 'male'}
                onChange={(e) => toggleGender(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Male</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={userData.gender === 'female'}
                onChange={(e) => toggleGender(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">Female</span>
            </label>
          </div>
        </div>

        {/* Citizenship */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Citizenship
          </label>
          <select
            value={userData.cityzenship}
            onChange={(e) => changeValue(e.target.value, 'cityzenship')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.name} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          * Required fields. This information will be used for your hotel booking and may be shared with the hotel.
        </p>
      </div>
    </div>
  );
} 