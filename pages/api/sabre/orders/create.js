import axios from "axios";

// Sabre API Configuration
const SABRE_BASE_URL = process.env.SABRE_BASE_URL?.trim() || "https://api.cert.platform.sabre.com";
const SABRE_ORDERS_CREATE_URL = `${SABRE_BASE_URL}/v1/orders/create`;

// Token caching
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get Sabre OAuth2 access token
 */
async function getSabreToken() {
  // Option 1: Use access token from environment if provided
  const accessTokenFromEnv = process.env.SABRE_ACCESS_TOKEN?.trim();
  
  if (accessTokenFromEnv) {
    return accessTokenFromEnv;
  }

  // Option 2: Use cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // Option 3: Use pre-encoded Basic Auth if available
  const basicAuth = process.env.SABRE_BASIC_AUTH?.trim();
  let credentials;
  
  if (basicAuth) {
    credentials = basicAuth;
  } else {
    // Option 4: Get new token via OAuth2
    const clientId = process.env.SABRE_CLIENT_ID?.trim();
    const clientSecret = process.env.SABRE_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
      throw new Error(
        "Missing required environment variables: SABRE_CLIENT_ID and SABRE_CLIENT_SECRET. " +
        "OR set SABRE_ACCESS_TOKEN or SABRE_BASIC_AUTH directly."
      );
    }

    credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  }

  const SABRE_AUTH_URL = `${SABRE_BASE_URL}/v2/auth/token`;

  try {
    const authResponse = await axios.post(
      SABRE_AUTH_URL,
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        timeout: 15000,
      }
    );

    if (authResponse.data?.access_token) {
      cachedToken = authResponse.data.access_token;
      const expiresIn = authResponse.data.expires_in || 3600;
      tokenExpiry = Date.now() + (expiresIn - 300) * 1000;
      return cachedToken;
    }

    throw new Error("No access token in Sabre auth response");
  } catch (error) {
    console.error("Sabre authentication error:", error.message);
    throw new Error(`Sabre authentication failed: ${error.message}`);
  }
}

/**
 * API endpoint to create Sabre NDC Order
 * POST /api/sabre/orders/create
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ 
      success: false,
      message: "Method not allowed" 
    });
  }

  try {
    // Validate request body
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    const orderPayload = req.body;

    // Validate required fields (Sabre Orders/Create format)
    if (!orderPayload.contactInfos || !Array.isArray(orderPayload.contactInfos) || orderPayload.contactInfos.length === 0) {
      return res.status(400).json({
        success: false,
        message: "contactInfos array is required in request body",
      });
    }

    if (!orderPayload.createOrders || !Array.isArray(orderPayload.createOrders) || orderPayload.createOrders.length === 0) {
      return res.status(400).json({
        success: false,
        message: "createOrders array is required in request body",
      });
    }

    if (!orderPayload.passengers || !Array.isArray(orderPayload.passengers) || orderPayload.passengers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "passengers array is required in request body",
      });
    }

    // Extract offerId from createOrders for logging
    const offerId = orderPayload.createOrders[0]?.offerId;

    console.log("📦 Creating Sabre NDC Order:", {
      url: SABRE_ORDERS_CREATE_URL,
      offerId: offerId,
      passengersCount: orderPayload.passengers?.length || 0,
      contactInfosCount: orderPayload.contactInfos?.length || 0,
    });

    // Get Sabre token
    const sabreToken = await getSabreToken();

    // Get client IP for X-Originating-IP header
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.connection?.remoteAddress || 
                     '127.0.0.1';

    // Call Sabre Orders/Create API
    const response = await axios.post(
      SABRE_ORDERS_CREATE_URL,
      orderPayload,
      {
        headers: {
          "Authorization": `Bearer ${sabreToken}`,
          "Content-Type": "application/json",
          "X-Originating-IP": clientIP,
        },
        timeout: 30000,
      }
    );

    console.log("✅ Sabre Orders/Create success:", {
      status: response.status,
      sabreOrderID: response.data?.orderID,
      recordLocator: response.data?.recordLocator,
    });

    // Return the response data
    return res.status(200).json({
      success: true,
      ...response.data,
    });

  } catch (error) {
    console.error("❌ Sabre Orders/Create Error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    // Handle specific error cases
    if (error.response) {
      const errorData = error.response.data;
      const errorMessage = errorData?.message || 
                          errorData?.error?.message || 
                          errorData?.error || 
                          error.response.statusText ||
                          "Sabre Orders/Create API error";
      
      return res.status(error.response.status || 500).json({
        success: false,
        message: errorMessage,
        error: errorData || error.message,
      });
    }

    // Network or other errors
    return res.status(500).json({
      success: false,
      message: "Failed to create Sabre NDC Order",
      error: error.message,
    });
  }
}
