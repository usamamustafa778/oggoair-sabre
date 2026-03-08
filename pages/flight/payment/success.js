import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import FullContainer from "@/components/common/FullContainer";
import Container from "@/components/common/Container";
import Footer from "@/components/Footer";

export default function PaymentSuccess() {
  const router = useRouter();
  const { booking_id } = router.query;
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    if (booking_id) {
      // In a real implementation, you would fetch booking details here
      setBookingDetails({
        id: booking_id,
        status: 'confirmed',
        transactionId: `txn_${Date.now()}`,
        amount: '$109.40'
      });
    }
  }, [booking_id]);

  return (
    <>
      <Navbar />
      <FullContainer className="pt-8 bg-primary-bg min-h-screen">
        <Container>
          <div className="max-w-2xl mx-auto text-center py-12">
            {/* Success Icon */}
            <div className="mb-8">
              <CheckCircle className="w-24 h-24 text-green-600 mx-auto" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your flight booking has been confirmed. You will receive a confirmation email shortly.
            </p>

            {/* Booking Details */}
            {bookingDetails && (
              <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Details</h2>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-medium">{bookingDetails.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium">{bookingDetails.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium">{bookingDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">{bookingDetails.status}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">What&apos;s Next?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Check your email for booking confirmation and e-tickets</p>
                <p>• Download your boarding passes 24 hours before departure</p>
                <p>• Arrive at the airport 2-3 hours before your flight</p>
                <p>• Have your passport and travel documents ready</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Book Another Flight
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                View My Bookings
              </button>
            </div>
          </div>
        </Container>
        <Footer />
      </FullContainer>
    </>
  );
} 