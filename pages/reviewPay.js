import React, { useState } from 'react';
import BookingLayout from '../components/common/BookingLayout';
import PassengerDetailsBox from '../components/ReviewPay/PassengerDetailsBox';
import ProtectionSection from '../components/ReviewPay/ProtectionSection';
import PaymentMethodSection from '../components/ReviewPay/PaymentMethodSection';

const breadcrumbSteps = [
  { id: 'search', label: 'Search Option', href: '/search' },
  { id: 'passenger', label: 'Passenger details', href: '/passengerDetails' },
  { id: 'extra', label: 'Extra Service', href: '/extraService' },
  { id: 'review', label: 'Review and pay', href: '/reviewPay' },
  { id: 'confirmation', label: 'Confirmation', href: '/confirmation' }
];

const passenger = {
  firstName: 'KHURRAM',
  lastName: 'IQBAL',
  email: 'khurramiqbal2449@gmail.com',
  ageType: 'ADULT'
};

export default function ReviewPay() {
  const [selectedProtection, setSelectedProtection] = useState('cancellation');

  const leftColumn = (
    <div className="space-y-6">
      <PassengerDetailsBox passenger={passenger} />
      <ProtectionSection selectedProtection={selectedProtection} onProtectionChange={setSelectedProtection} />
      <PaymentMethodSection />
      {/* Add more sections as needed for billing address, discounts, summary, etc. */}
      <div className="bg-white rounded-lg p-6 flex flex-col gap-4">
        <button className="w-full bg-lime-300 hover:bg-lime-400 text-lg font-semibold text-gray-900 rounded-lg py-3 transition">Pay</button>
        <div className="text-xs text-gray-500 text-center">
          By clicking pay you accept the terms and conditions of Oggoair and privacy policy.
        </div>
      </div>
    </div>
  );

  return (
    <BookingLayout
      breadcrumbSteps={breadcrumbSteps}
      currentStep="review"
      leftColumn={leftColumn}
      footer={null}
    />
  );
}
