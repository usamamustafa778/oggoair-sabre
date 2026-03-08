import React, { useState } from 'react';
import BookingLayout from '../components/common/BookingLayout';
import UserInfoBox from '../components/PassengerDetails/UserInfoBox';
import InstructionBox from '../components/PassengerDetails/InstructionBox';
import PassengerForm from '../components/PassengerDetails/PassengerForm';
import ReviewButton from '../components/PassengerDetails/ReviewButton';
import PassengerDetailsFooter from '../components/PassengerDetails/PassengerDetailsFooter';

const PassengerDetails = () => {
  const [passengers, setPassengers] = useState([
    {
      id: 1,
      type: 'Main passenger',
      age: null,
      gender: 'Mr',
      firstName: 'KHURRAM',
      lastName: 'IQBAL',
      email: 'khurramiqbal2449@gmail.com',
      phone: '+351 919998598',
      dateOfBirth: { day: '', month: '', year: '' },
      country: 'Notherland',
      passportNo: '9333',
      passportExpiry: { day: '', month: '', year: '' },
      saveToProfile: true
    },
    {
      id: 2,
      type: 'Passenger 2',
      age: 8,
      ageType: 'Child',
      gender: 'Mr',
      firstName: 'KHURRAM',
      lastName: 'IQBAL',
      email: '',
      phone: '',
      dateOfBirth: { day: '', month: '', year: '' },
      country: 'Notherland',
      passportNo: '9333',
      passportExpiry: { day: '', month: '', year: '' },
      saveToProfile: true
    },
    {
      id: 3,
      type: 'Passenger 3',
      age: 1,
      ageType: 'Infant',
      gender: 'Mr',
      firstName: 'KHURRAM',
      lastName: 'IQBAL',
      email: '',
      phone: '',
      dateOfBirth: { day: '', month: '', year: '' },
      country: 'Notherland',
      passportNo: '9333',
      passportExpiry: { day: '', month: '', year: '' },
      saveToProfile: true
    }
  ]);

  const breadcrumbSteps = [
    { id: 'search', label: 'Search Option', href: '/search' },
    { id: 'passenger', label: 'Passenger details', href: '/passengerDetails' },
    { id: 'extra', label: 'Extra Service', href: '/extraService' },
    { id: 'review', label: 'Review and pay', href: '/reviewPay' },
    { id: 'confirmation', label: 'Confirmation', href: '/confirmation' }
  ];

  const updatePassenger = (id, field, value) => {
    setPassengers(prev => prev.map(passenger => 
      passenger.id === id ? { ...passenger, [field]: value } : passenger
    ));
  };

  const updateDateField = (id, dateType, field, value) => {
    setPassengers(prev => prev.map(passenger => 
      passenger.id === id ? {
        ...passenger,
        [dateType]: { ...passenger[dateType], [field]: value }
      } : passenger
    ));
  };

  const handleReviewJourney = () => {
  };

  const leftColumn = (
    <div className="space-y-6">
      
      {passengers.map((passenger) => (
        <PassengerForm
          key={passenger.id}
          passenger={passenger}
          onUpdate={updatePassenger}
          onDateUpdate={updateDateField}
        />
      ))}
      <ReviewButton onClick={handleReviewJourney} />
    </div>
  );

  return (
    <BookingLayout
      breadcrumbSteps={breadcrumbSteps}
      currentStep="passenger"
      leftColumn={leftColumn}
      footer={<PassengerDetailsFooter />}
    />
  );
};

export default PassengerDetails;