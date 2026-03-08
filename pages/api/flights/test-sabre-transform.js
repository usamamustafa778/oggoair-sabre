/**
 * Test endpoint to verify Duffel to Sabre transformation
 * GET /api/flights/test-sabre-transform
 * 
 * This endpoint demonstrates the transformation of your exact payload format
 * and shows the exact request that will be sent to Sabre API
 */
import { buildSabreRequest } from "./sabre-bfm-search.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Your exact payload example
  const duffelPayload = {
    slices: [
      {
        origin: "ATL",
        destination: "CHI",
        departure_date: "2025-12-27",
      },
    ],
    cabin_class: "economy",
    flightType: "one-way",
    passengers: [{ type: "adult" }],
  };

  try {
    // Transform to Sabre format using the actual function
    const sabreRequest = buildSabreRequest(
      duffelPayload.slices,
      duffelPayload.passengers,
      duffelPayload.cabin_class,
      duffelPayload.flightType
    );

    return res.status(200).json({
      success: true,
      message: "Transformation successful",
      input: {
        description: "Duffel format payload (exact format you specified)",
        payload: duffelPayload,
      },
      output: {
        description: "Sabre BFM format request (exact format sent to API)",
        sabreRequest: sabreRequest,
        formatted: JSON.stringify(sabreRequest, null, 2),
      },
      verification: {
        hasTarget: sabreRequest.OTA_AirLowFareSearchRQ.Target === "Production",
        hasPOS: !!sabreRequest.OTA_AirLowFareSearchRQ.POS,
        hasPCC: !!sabreRequest.OTA_AirLowFareSearchRQ.POS.Source[0].PseudoCityCode,
        originDestinationCount: sabreRequest.OTA_AirLowFareSearchRQ.OriginDestinationInformation.length,
        passengerCount: sabreRequest.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0].PassengerTypeQuantity.length,
      },
      mapping: {
        "slices[0].origin": "ATL",
        "→ OriginLocation.LocationCode": sabreRequest.OTA_AirLowFareSearchRQ
          .OriginDestinationInformation[0].OriginLocation.LocationCode,
        "slices[0].destination": "CHI",
        "→ DestinationLocation.LocationCode":
          sabreRequest.OTA_AirLowFareSearchRQ.OriginDestinationInformation[0]
            .DestinationLocation.LocationCode,
        "flightType": "one-way",
        "→ OriginDestinationInformation.length": sabreRequest.OTA_AirLowFareSearchRQ.OriginDestinationInformation.length,
        "passengers[0].type": "adult",
        "→ PassengerTypeQuantity[0].Code": sabreRequest.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0].PassengerTypeQuantity[0].Code,
        "→ PassengerTypeQuantity[0].Quantity": sabreRequest.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0].PassengerTypeQuantity[0].Quantity,
      },
      apiDetails: {
        url: "https://api.platform.sabre.com/v5/offers/shop",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer <token>",
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Transformation failed",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

