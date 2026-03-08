import { DUFFEL_CONFIG } from "../../../config/api";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      status: false,
      message: "Method not allowed",
    });
  }

  try {
    const {
      selected_offers,
      passengers,
      payments,
      origin,
      bookingEmail,
      leadPassenger,
      selectedPlan,
    } = req.body;

    if (!selected_offers || !passengers || !payments) {
      return res.status(400).json({
        success: false,
        status: false,
        message: "Missing required fields",
        details: "selected_offers, passengers, and payments are required",
      });
    }


    // Check if this offer has already been booked (simulate business logic)
    // In a real implementation, you would check your database
    const isOfferAlreadyBooked = Math.random() < 0.1; // 10% chance of being already booked for testing

    if (isOfferAlreadyBooked) {
      return res.status(400).json({
        success: false,
        status: false,
        message: "offer_request_already_booked",
        details:
          "This flight offer has already been booked by another customer",
      });
    }

    // Simulate validation required (like the old project)
    const requiresValidation = Math.random() < 0.3; // 30% chance of requiring validation

    if (requiresValidation) {
      return res.status(400).json({
        success: false,
        status: false,
        message: "validation_required",
        details: "Additional validation is required for this booking",
      });
    }

    // For now, create a mock booking without calling Duffel API
    // This allows us to test the flow while Duffel API is not configured
    const mockBookingId = `booking_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create local booking record
    const localBookingData = {
      _id: mockBookingId,
      duffel_order_id: null, // Will be set when Duffel API is configured
      selected_offers,
      passengers,
      payments,
      origin,
      bookingEmail,
      leadPassenger,
      selectedPlan: selectedPlan || "economic",
      status: "pending", // Will be 'confirmed' when Duffel API is configured
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bookingDetails: {
        total_amount: payments[0]?.amount || "0",
        passengers: passengers.map((p) => ({
          type: "adult",
          name: `${p.given_name} ${p.family_name}`,
        })),
        slices: [
          {
            segments: [
              {
                departing_at: new Date(
                  Date.now() + 24 * 60 * 60 * 1000
                ).toISOString(), // Tomorrow
                arriving_at: new Date(
                  Date.now() + 48 * 60 * 60 * 1000
                ).toISOString(), // Day after tomorrow
                origin: {
                  city_name: "Sample City",
                  name: "Sample Airport",
                  iata_code: "SMP",
                },
                destination: {
                  city_name: "Destination City",
                  name: "Destination Airport",
                  iata_code: "DST",
                },
              },
            ],
          },
        ],
      },
      payment: {
        comissionAmount: "5.00",
      },
    };


    // Return success response
    return res.status(200).json({
      success: true,
      status: true,
      data: localBookingData,
      message: "Flight booking created successfully",
    });
  } catch (error) {
    console.error("Error creating flight booking:", error);
    return res.status(500).json({
      success: false,
      status: false,
      message: "Internal server error",
      details: error.message,
    });
  }
}
