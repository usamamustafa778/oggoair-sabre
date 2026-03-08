import React, { useState } from "react";
import { X, Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/router";
import { buildGetSeatsPayload } from "@/utils/sabreRevalidate";

export default function ViewDataModal({
    isOpen,
    onClose,
    onProceedToPayment,
    bookingDetails,
    contact,
    passengersInfo,
    loading,
    revalidateResponse,
    flightDetails,
    passengerCounts
}) {
    const router = useRouter();
    const [seatsLoading, setSeatsLoading] = useState(false);
    const [seatsError, setSeatsError] = useState(null);

    if (!isOpen) return null;

    const handleGetSeats = async () => {
        console.log("🪑 Get Seats button clicked!");
        console.log("📋 Props check:", {
            hasRevalidateResponse: !!revalidateResponse,
            hasFlightDetails: !!flightDetails,
            hasPassengerCounts: !!passengerCounts,
            hasPassengersInfo: !!passengersInfo,
            hasContact: !!contact,
            revalidateResponse,
            flightDetails,
            passengerCounts
        });

        try {
            setSeatsLoading(true);
            setSeatsError(null);

            // Validate required props
            if (!flightDetails) {
                throw new Error("Flight details are required.");
            }

            if (!passengersInfo || passengersInfo.length === 0) {
                throw new Error("Passenger information is required.");
            }

            // Note: revalidateResponse is optional - buildGetSeatsPayload can work without it
            if (!revalidateResponse) {
                console.warn("⚠️ Revalidate response not available, using flightDetails.id as flightOfferId");
            }

            // Use passenger counts from props, fallback to passengersInfo
            const counts = passengerCounts || {
                adults: passengersInfo?.filter(p => p.type === 'adult' || p.type === 'ADT').length || 1,
                child: passengersInfo?.filter(p => p.type === 'child' || p.type === 'CNN').length || 0,
                infant: passengersInfo?.filter(p => p.type === 'infant' || p.type === 'INF').length || 0,
            };

            console.log("👥 Passenger counts:", counts);

            // Get flight ID for storage
            const flightId = flightDetails?.id || 
                           flightDetails?.offer_id || 
                           router.query?.id || 
                           `flight_${Date.now()}`;
            
            // Check if we already have an order ID (created by Continue button)
            const sabreOrderId = localStorage.getItem(`sabre_order_${flightId}`);

            // Get PCC (required for Sabre NDC GetSeats)
            const pccResponse = await fetch("/api/flights/sabre-pcc", {
                method: "GET",
            });

            let pcc = "";
            if (pccResponse.ok) {
                const pccData = await pccResponse.json();
                pcc = pccData.pcc || "";
            }

            if (!pcc) {
                throw new Error("Failed to get PCC (PseudoCityCode). PCC is required for GetSeats API.");
            }

            // Build GetSeats payload (Sabre NDC format)
            console.log("🔨 Building Sabre NDC GetSeats payload...");
            let getSeatsPayload;
            try {
                getSeatsPayload = buildGetSeatsPayload(revalidateResponse, flightDetails, counts, pcc);
                console.log("✅ Sabre NDC payload built successfully:", JSON.stringify(getSeatsPayload, null, 2));
                
                // Validate Sabre NDC payload structure
                if (!getSeatsPayload.requestType) {
                    throw new Error("Payload is missing requestType");
                }
                if (!getSeatsPayload.party?.sender?.travelAgency?.pseudoCityID) {
                    throw new Error("Payload is missing party.sender.travelAgency.pseudoCityID");
                }
                if (!getSeatsPayload.party?.sender?.travelAgency?.agencyID) {
                    throw new Error("Payload is missing party.sender.travelAgency.agencyID");
                }
                if (!getSeatsPayload.request?.paxSegmentRefIds || getSeatsPayload.request.paxSegmentRefIds.length === 0) {
                    throw new Error("Payload is missing request.paxSegmentRefIds array");
                }
                if (!getSeatsPayload.request?.originDest?.paxJourney?.paxSegments || 
                    getSeatsPayload.request.originDest.paxJourney.paxSegments.length === 0) {
                    throw new Error("Payload is missing request.originDest.paxJourney.paxSegments array");
                }
                if (!getSeatsPayload.request?.paxes || getSeatsPayload.request.paxes.length === 0) {
                    throw new Error("Payload is missing request.paxes array");
                }
            } catch (payloadError) {
                console.error("❌ Error building Sabre NDC payload:", payloadError);
                setSeatsError(`Failed to build request: ${payloadError.message}`);
                setSeatsLoading(false);
                return;
            }

            console.log("🪑 Calling GetSeats API with Sabre NDC payload:", {
                url: "/api/v1/offers/getseats",
                requestType: getSeatsPayload.requestType,
                pcc: getSeatsPayload.party?.sender?.travelAgency?.pseudoCityID,
                paxSegmentRefIdsCount: getSeatsPayload.request?.paxSegmentRefIds?.length || 0,
                paxSegmentsCount: getSeatsPayload.request?.originDest?.paxJourney?.paxSegments?.length || 0,
                paxesCount: getSeatsPayload.request?.paxes?.length || 0,
            });

            // Call GetSeats API using localhost:3000 as base URL
            const getSeatsUrl = "/api/v1/offers/getseats";

            const response = await fetch(getSeatsUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(getSeatsPayload),
            });

            // Check if response is JSON before parsing
            const contentType = response.headers.get("content-type");
            let data;
            
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error("❌ Non-JSON response received:", text.substring(0, 200));
                throw new Error(`Expected JSON but received ${contentType}. Status: ${response.status}`);
            }

            // Handle non-200 responses
            if (!response.ok || !data.success) {
                // Extract detailed error message
                const errorMessage = data?.message || 
                                   data?.error?.message || 
                                   (typeof data?.error === 'string' ? data.error : null) ||
                                   data?.error ||
                                   `API returned status ${response.status}`;
                
                console.error("❌ GetSeats API Error Details:", {
                    status: response.status,
                    data: data,
                    errorMessage: errorMessage,
                    errorCode: data?.error?.errorCode,
                    payload: getSeatsPayload,
                });
                
                // Handle validation errors (400 Bad Request)
                if (response.status === 400) {
                    setSeatsError(errorMessage || "Invalid request. Please check the flight details and try again.");
                    setSeatsLoading(false);
                    return;
                }
                
                // Handle specific Sabre error codes
                if (data?.error?.errorCode === "ERR.2SG.SEC.NOT_AUTHORIZED" || 
                    response.status === 403 ||
                    errorMessage.includes("no access privileges") ||
                    errorMessage.includes("Authorization failed")) {
                    setSeatsError("Seat selection is currently not available for this flight. This feature requires additional API permissions that may not be enabled in your Sabre account.");
                    setSeatsLoading(false);
                    return;
                }
                
                throw new Error(errorMessage);
            }

            // API returned 200 OK - ALWAYS redirect to Extra Services page
            // Seat maps path: response.response.seatMaps (nested in response object)
            // Handle both nested and root level seatMaps for compatibility
            const seatMapsData = data.response?.seatMaps || data.seatMaps || [];
            
            console.log("✅ GetSeats API success:", {
                status: response.status,
                hasResponse: !!data.response,
                hasSeatMapsInResponse: !!data.response?.seatMaps,
                hasSeatMapsAtRoot: !!data.seatMaps,
                seatMapsCount: seatMapsData.length,
                seatMapsPath: data.response?.seatMaps ? 'data.response.seatMaps' : data.seatMaps ? 'data.seatMaps' : 'not found',
                fullResponse: data
            });

            // Use flightId that was already declared above (in STEP 1)
            const seatMapStorageKey = `seatMaps_${flightId}`;
            
            // Store full API response in localStorage for Extra Services page
            try {
                localStorage.setItem(seatMapStorageKey, JSON.stringify({
                    seatMaps: seatMapsData,
                    fullResponse: data,
                    timestamp: Date.now(),
                    flightId: flightId,
                    paxSegmentRefIds: getSeatsPayload?.request?.paxSegmentRefIds || [],
                    sabreOrderId: sabreOrderId || null, // Include order ID for ancillaries
                }));
                console.log("✅ Seat maps stored in localStorage:", seatMapStorageKey, {
                    seatMapsCount: seatMapsData.length,
                    hasNestedResponse: !!data.response,
                    hasRootSeatMaps: !!data.seatMaps,
                    hasSabreOrderId: !!sabreOrderId,
                });
            } catch (storageError) {
                console.error("⚠️ Failed to store seat maps in localStorage:", storageError);
                // Continue with redirect - page can read from router state if needed
            }

            // Close modal first
            setSeatsLoading(false);
            onClose();
            
            // Redirect to Extra Services page using router
            router.push(`/flight/extraService?id=${flightId}`);
        } catch (error) {
            console.error("❌ Error calling GetSeats API:", error);
            
            // Provide more helpful error messages
            let errorMessage = error.message || "Failed to load seat maps. Please try again.";
            
            if (error.message?.includes("Authorization failed") || error.message?.includes("no access privileges")) {
                errorMessage = "Seat selection is not available for this flight. This may be due to airline restrictions or API limitations.";
            } else if (error.message?.includes("Failed to fetch")) {
                errorMessage = "Network error. Please check your connection and try again.";
            }
            
            setSeatsError(errorMessage);
        } finally {
            setSeatsLoading(false);
        }
    };

    const formatPassengerType = (type) => {
        switch (type) {
            case 'adult':
                return 'Adult';
            case 'child':
                return 'Child';
            case 'infant':
                return 'Infant';
            default:
                return type;
        }
    };


    return (
        <div className="fixed w-full h-screen top-0 left-0 bg-black/60 z-[3000] p-5 flex items-center justify-center">
            <div className="max-w-[600px] w-full bg-white rounded-[20px] p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-primary-text">View your data</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Introduction Message */}
                    <p className="text-xs text-primary-text leading-4.5 border-b border-gray-200 pb-4">
                        Please take a moment to review your contact details and ensure your name aligns precisely with your passport/ID, as any discrepancy could lead to boarding denial. Once you confirm, please note that no further changes can be made.
                    </p>

                <div className="space-y-2">
                    {/* Contact Details Section */}
                    <div className="border-b border-gray-200 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-primary-text">Contact details</h3>
                            <button className="text-red-500 underline hover:text-red-700 text-sm font-medium">
                                Change
                            </button>
                        </div>
                        <p className="text-xs text-primary-text mb-4 font-light">
                            All booking confirmations and updates will be sent to the following email address:
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center text-primary-text gap-3">
                                <Mail className="w-4 h-4 " />
                                <span className="text-xs ">
                                    <span className="text-sm font-semibold ">Email address:</span> {contact?.email || bookingDetails?.bookingEmail || 'Not provided'}
                                </span>
                            </div>
                            <div className="flex items-center text-primary-text gap-3">
                                <Phone className="w-4 h-4 " />
                                <span className="text-xs ">
                                    <span className="text-sm font-semibold ">Phone number:</span> {contact?.dialCode || ''}{contact?.phoneNumber || bookingDetails?.leadPassenger?.phoneNumber || 'Not provided'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Travelers Information Section */}
                    <div className="  py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">Travelers information</h3>
                            <button className="text-red-500 underline hover:text-red-700 text-sm font-medium">
                                Change
                            </button>
                        </div>
                        <div className="space-y-2">
                            {passengersInfo && passengersInfo.length > 0 ? (
                                passengersInfo.map((passenger, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-700">
                                            {passenger.firstName} {passenger.lastName} - {formatPassengerType(passenger.type)}
                                        </span>
                                    </div>
                                ))
                            ) : bookingDetails?.bookingDetails?.passengers ? (
                                bookingDetails.bookingDetails.passengers.map((passenger, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-700">
                                            {passenger.name} - {formatPassengerType(passenger.type)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-sm text-gray-500">No passenger information available</span>
                            )}
                        </div>
                    </div>

                    {/* Confirmation Statement */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-primary-text text-center font-light ">
                            By proceeding, you confirm the accuracy of the information provided.
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("🖱️ Get Seats button clicked", {
                                    seatsLoading,
                                    hasRevalidateResponse: !!revalidateResponse,
                                    hasFlightDetails: !!flightDetails
                                });
                                if (!flightDetails) {
                                    alert("Flight details are missing. Please refresh the page.");
                                    return;
                                }
                                handleGetSeats();
                            }}
                            disabled={seatsLoading}
                            className="bg-primary-green hover:bg-primary-green/80 disabled:bg-gray-400 disabled:cursor-not-allowed text-primary-text cursor-pointer font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                            type="button"
                        >
                            {seatsLoading ? 'Loading seats...' : 'Get Seats'}
                        </button>
                    </div>

                    {/* Debug Info (only in development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-2 text-xs text-gray-500">
                            Debug: {!revalidateResponse ? '⚠️ No revalidate (will use flightDetails.id)' : '✅ Has revalidate'} | 
                            {!flightDetails ? '❌ No flight details' : '✅ Has flight details'}
                        </div>
                    )}

                    {/* Error Message */}
                    {seatsError && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {seatsError}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 