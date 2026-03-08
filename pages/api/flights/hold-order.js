import axios from "axios";

const DUFFEL_API_TOKEN = process.env.DUFFEL_ACCESS_TOKEN || "";
const DUFFEL_API_URL = "https://api.duffel.com/air/orders";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const payload = req.body;
    
    // Log the incoming payload
    console.log("=== /api/flights/hold-order API - Incoming Payload ===");
    console.log("Method:", req.method);
    console.log("Headers:", req.headers);
    console.log("Body:", JSON.stringify(payload, null, 2));

    if (
      !payload ||
      !payload.data ||
      !Array.isArray(payload.data.selected_offers)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid payload: data.selected_offers is required" });
    }

    const response = await axios.post(DUFFEL_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${DUFFEL_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Duffel-Version": "v2",
      },
    });

    const data = response.data;
    
    // Log the Duffel API response
    console.log("=== /api/flights/hold-order API - Duffel API Response ===");
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));

    if (response.status !== 200) {
      const message =
        data?.errors?.[0]?.message || `Duffel error ${response.status}`;
      const errorResponse = { message, errors: data.errors || [] };
      
      // Log error response
      console.log("=== /api/flights/hold-order API - Error Response ===");
      console.log("Status:", response.status);
      console.log("Error Response:", JSON.stringify(errorResponse, null, 2));
      
      return res
        .status(response.status)
        .json(errorResponse);
    }

    // Log successful response
    console.log("=== /api/flights/hold-order API - Success Response ===");
    console.log("Status:", 200);
    console.log("Response:", JSON.stringify(data, null, 2));

    return res.status(200).json(data);
  } catch (err) {
    console.error("Hold order error:", err);

    // If it's an axios error, extract the response data
    if (err.response) {
      console.error("Duffel API error response:", err.response.data);
      const errorResponse = {
        message: err.response.data?.errors?.[0]?.message || "Duffel API error",
        error: err.response.data,
        status: err.response.status,
      };
      
      // Log error response
      console.log("=== /api/flights/hold-order API - Axios Error Response ===");
      console.log("Status:", err.response.status);
      console.log("Error Response:", JSON.stringify(errorResponse, null, 2));
      
      return res.status(err.response.status).json(errorResponse);
    }

    const errorResponse = { message: "Internal server error", error: err.message };
    
    // Log error response
    console.log("=== /api/flights/hold-order API - Internal Error Response ===");
    console.log("Status:", 500);
    console.log("Error Response:", JSON.stringify(errorResponse, null, 2));

    return res
      .status(500)
      .json(errorResponse);
  }
}
