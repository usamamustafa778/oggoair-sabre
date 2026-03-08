import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Flight ID is required" });
  }

  try {
    const mockFlightDetails = {
      id: id,
      total_amount: "507.50",
      total_currency: "EUR",
      base_amount: "341.00",
      tax_amount: "166.50",
      slices: [
        {
          id: "sli_0000Awn5hXHlToaAUnx7nN",
          origin: {
            iata_code: "LHE",
            name: "Allama Iqbal International Airport",
            city_name: "Lahore",
            iata_city_code: "LHE",
            iata_country_code: "PK",
          },
          destination: {
            iata_code: "BAH",
            name: "Bahrain International Airport",
            city_name: "Bahrain",
            iata_city_code: "BAH",
            iata_country_code: "BH",
          },
          segments: [
            {
              id: "seg_0000Awn5hXHlToaAUnx7nO",
              origin: {
                iata_code: "LHE",
                name: "Allama Iqbal International Airport",
              },
              destination: {
                iata_code: "BAH",
                name: "Bahrain International Airport",
              },
              departing_at: "2025-08-04T15:10:00",
              arriving_at: "2025-08-04T16:40:00",
              duration: "PT3H30M",
              marketing_carrier: {
                iata_code: "GF",
                name: "Gulf Air Bahrain",
                logo_symbol_url:
                  "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/GF.svg",
              },
              operating_carrier: {
                iata_code: "GF",
                name: "Gulf Air Bahrain",
              },
              marketing_carrier_flight_number: "765",
              operating_carrier_flight_number: "765",
            },
          ],
        },
        {
          id: "sli_0000Awn5hXHlToaAUnx7nQ",
          origin: {
            iata_code: "BAH",
            name: "Bahrain International Airport",
            city_name: "Bahrain",
            iata_city_code: "BAH",
            iata_country_code: "BH",
          },
          destination: {
            iata_code: "DXB",
            name: "Dubai International Airport",
            city_name: "Dubai",
            iata_city_code: "DXB",
            iata_country_code: "AE",
          },
          segments: [
            {
              id: "seg_0000Awn5hXHlToaAUnx7nS",
              origin: {
                iata_code: "BAH",
                name: "Bahrain International Airport",
              },
              destination: {
                iata_code: "DXB",
                name: "Dubai International Airport",
              },
              departing_at: "2025-08-05T13:30:00",
              arriving_at: "2025-08-05T15:55:00",
              duration: "PT1H25M",
              marketing_carrier: {
                iata_code: "GF",
                name: "Gulf Air Bahrain",
                logo_symbol_url:
                  "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/GF.svg",
              },
              operating_carrier: {
                iata_code: "GF",
                name: "Gulf Air Bahrain",
              },
              marketing_carrier_flight_number: "506",
              operating_carrier_flight_number: "506",
            },
          ],
        },
      ],
      passengers: [
        {
          type: "adult",
          cabin_class: "economy",
          cabin_class_marketing_name: "Economy",
        },
      ],
      conditions: {
        refund_before_departure: null,
        change_before_departure: null,
      },
      owner: {
        iata_code: "GF",
        name: "Gulf Air Bahrain",
        logo_symbol_url:
          "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/GF.svg",
      },
    };

    return res.status(200).json({
      success: true,
      data: mockFlightDetails,
      message: "Flight details fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching flight details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch flight details",
      error: error.message,
    });
  }
}
