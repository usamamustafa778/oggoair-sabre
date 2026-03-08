// API endpoint for handling passenger bookings
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      message: "Only POST requests are allowed for this endpoint",
    });
  }

  try {
    const bookingData = req.body;
    
    // Log the incoming payload
    console.log("=== /api/bookings API - Incoming Payload ===");
    console.log("Method:", req.method);
    console.log("Headers:", req.headers);
    console.log("Body:", JSON.stringify(bookingData, null, 2));

    // Validate required fields
    const requiredFields = ["email", "phone", "passengers"];
    const missingFields = requiredFields.filter((field) => !bookingData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        message: `The following fields are required: ${missingFields.join(
          ", "
        )}`,
        missingFields,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      return res.status(400).json({
        error: "Invalid email format",
        message: "Please provide a valid email address",
      });
    }

    // Validate phone structure
    if (!bookingData.phone.dialingCode || !bookingData.phone.number) {
      return res.status(400).json({
        error: "Invalid phone format",
        message: "Phone must include both dialingCode and number",
      });
    }

    // Validate passengers array
    if (
      !Array.isArray(bookingData.passengers) ||
      bookingData.passengers.length === 0
    ) {
      return res.status(400).json({
        error: "Invalid passengers data",
        message: "At least one passenger is required",
      });
    }

    // Validate each passenger
    const passengerRequiredFields = [
      "title",
      "firstName",
      "lastName",
      "dateOfBirth",
      "countryOfResidence",
      "passportNumber",
      "passportExpiry",
    ];

    for (let i = 0; i < bookingData.passengers.length; i++) {
      const passenger = bookingData.passengers[i];
      const missingPassengerFields = passengerRequiredFields.filter(
        (field) => !passenger[field]
      );

      if (missingPassengerFields.length > 0) {
        return res.status(400).json({
          error: `Invalid passenger data for passenger ${i + 1}`,
          message: `Missing fields: ${missingPassengerFields.join(", ")}`,
          missingFields: missingPassengerFields,
        });
      }

      // Validate date of birth structure
      if (
        !passenger.dateOfBirth.day ||
        !passenger.dateOfBirth.month ||
        !passenger.dateOfBirth.year
      ) {
        return res.status(400).json({
          error: `Invalid date of birth for passenger ${i + 1}`,
          message: "Date of birth must include day, month, and year",
        });
      }

      // Validate passport expiry structure
      if (
        !passenger.passportExpiry.day ||
        !passenger.passportExpiry.month ||
        !passenger.passportExpiry.year
      ) {
        return res.status(400).json({
          error: `Invalid passport expiry for passenger ${i + 1}`,
          message: "Passport expiry must include day, month, and year",
        });
      }
    }

    // Log the received booking data for debugging

    // Generate booking ID
    const bookingId = `BK${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;

    // Create booking response
    const bookingResponse = {
      success: true,
      bookingId: bookingId,
      status: "confirmed",
      message: "Booking created successfully",
      data: {
        bookingId: bookingId,
        email: bookingData.email,
        phone: bookingData.phone,
        passengers: bookingData.passengers.map((passenger, index) => ({
          ...passenger,
          passengerId: `P${bookingId}_${index + 1}`,
        })),
        notes: bookingData.notes || "",
        createdAt: new Date().toISOString(),
        status: "confirmed",
      },
    };

    // Log the response before sending
    console.log("=== /api/bookings API - Response ===");
    console.log("Status:", 201);
    console.log("Response:", JSON.stringify(bookingResponse, null, 2));

    // Return successful response
    res.status(201).json(bookingResponse);
  } catch (error) {
    console.error("Booking API Error:", error);
    
    const errorResponse = {
      error: "Internal server error",
      message: "An error occurred while processing your booking",
      ...(process.env.NODE_ENV === "development" && {
        details: error.message,
      }),
    };

    // Log error response
    console.log("=== /api/bookings API - Error Response ===");
    console.log("Status:", 500);
    console.log("Error Response:", JSON.stringify(errorResponse, null, 2));

    res.status(500).json(errorResponse);
  }
}
