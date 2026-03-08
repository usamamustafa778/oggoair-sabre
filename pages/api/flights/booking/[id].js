import { getBookingProtection } from "./storage.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Booking ID is required" });
  }

  try {
    // Get stored protection option for this booking
    const storedProtection = getBookingProtection(id);

    // Mock booking details - in a real implementation, you would fetch from database
    const bookingDetails = {
      _id: id,
      bookingDetails: {
        total_amount: "109.40",
        passengers: [
          {
            type: "adult",
            given_name: "John",
            family_name: "Doe",
            born_on: "1990-01-01",
            title: "mr",
            gender: "m",
          },
          {
            type: "adult",
            given_name: "Jane",
            family_name: "Doe",
            born_on: "1992-05-15",
            title: "ms",
            gender: "f",
          },
          {
            type: "child",
            given_name: "Baby",
            family_name: "Doe",
            born_on: "2015-08-20",
            title: "mr",
            gender: "m",
          },
        ],
        slices: [
          {
            id: "sli_0000Awn5hXHlToaAUnx7nN",
            segments: [
              {
                id: "seg_0000Awn5hXHlToaAUnx7nO",
                departing_at: "2025-06-28T21:55:00Z",
                arriving_at: "2025-07-01T09:20:00Z",
                duration: "PT12H25M",
                origin: {
                  city_name: "Chios Island",
                  name: "Chios Island National Airport",
                  iata_code: "JKH",
                },
                destination: {
                  city_name: "Milan",
                  name: "Milan Malpensa Airport",
                  iata_code: "MXP",
                },
                marketing_carrier: {
                  logo_symbol_url:
                    "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/SR.svg",
                  name: "Srilankan Airlines",
                  iata_code: "SR",
                },
                operating_carrier: {
                  logo_symbol_url:
                    "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/SR.svg",
                  name: "Srilankan Airlines",
                  iata_code: "SR",
                },
                marketing_carrier_flight_number: "SR123",
                operating_carrier_flight_number: "SR123",
              },
            ],
          },
          {
            id: "sli_0000Awn5hXHlToaAUnx7nQ",
            segments: [
              {
                id: "seg_0000Awn5hXHlToaAUnx7nS",
                departing_at: "2025-07-06T19:25:00Z",
                arriving_at: "2025-07-07T07:36:00Z",
                duration: "PT11H20M",
                origin: {
                  city_name: "Milan",
                  name: "Milan Malpensa Airport",
                  iata_code: "MXP",
                },
                destination: {
                  city_name: "Chios Island",
                  name: "Chios Island National Airport",
                  iata_code: "JKH",
                },
                marketing_carrier: {
                  logo_symbol_url:
                    "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/OS.svg",
                  name: "Austrian Airlines",
                  iata_code: "OS",
                },
                operating_carrier: {
                  logo_symbol_url:
                    "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/OS.svg",
                  name: "Austrian Airlines",
                  iata_code: "OS",
                },
                marketing_carrier_flight_number: "OS456",
                operating_carrier_flight_number: "OS456",
              },
            ],
          },
        ],
      },
      payment: {
        comissionAmount: "5.00",
      },
      selectedProtection: storedProtection,
      leadPassenger: {
        given_name: "John",
        family_name: "Doe",
        email: "john.doe@example.com",
      },
      bookingEmail: "john.doe@example.com",
    };

    res.status(200).json({
      success: true,
      data: bookingDetails,
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking details",
    });
  }
}
