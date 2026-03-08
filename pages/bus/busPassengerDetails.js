import React from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Container from '@/components/common/Container';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';

export default function BusPassengerDetails() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <>
            <Navbar />

            <Breadcrumbs
        steps={[
          { id: "home", label: "Home", href: "/" },
          { id: "bus", label: "Busses", href: "/bus/busSearch" },
          { id: "ticket", label: "Ticket options", href: "/bus/busTicketOptions" },
          { id: "detail", label: "Passenger Details", href: "/bus/busPassengerDetails" }
        ]}
        currentStep="detail"
      />
          

            <div className="bg-gray-50 min-h-screen py-8">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        {/* Content */}
                        <div className="bg-white rounded-lg p-8 shadow-sm">
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🚌</div>
                                <h2 className="text-xl font-semibold text-primary-text mb-2">
                                    Bus Passenger Details
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    This page will contain the passenger details form for bus bookings.
                                </p>
                                <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-500">
                                    <p>Form components for passenger information will be implemented here.</p>
                                    <p>This includes: name, passport details, contact information, etc.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        </>
    );
} 