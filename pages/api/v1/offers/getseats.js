import axios from "axios";

// Sabre API Configuration
const SABRE_BASE_URL = process.env.SABRE_BASE_URL?.trim() || "https://api.cert.platform.sabre.com";
const SABRE_GETSEATS_URL = `${SABRE_BASE_URL}/v1/offers/getseats`;

// Token caching
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get Sabre OAuth2 access token
 * Uses same logic as other Sabre API routes
 */
async function getSabreToken() {
  // Option 1: Use access token from environment if provided (highest priority)
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
    // Option 4: Get new token via OAuth2 with client ID/secret
    const clientId = process.env.SABRE_CLIENT_ID?.trim();
    const clientSecret = process.env.SABRE_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
      throw new Error(
        `Missing required environment variables: SABRE_CLIENT_ID and SABRE_CLIENT_SECRET. ` +
        `OR set SABRE_ACCESS_TOKEN or SABRE_BASIC_AUTH directly.`
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
    if (error.response?.status === 401) {
      console.error("Sabre authentication failed (401):", {
        authUrl: SABRE_AUTH_URL,
        hasBasicAuth: !!basicAuth,
        hasClientId: !!process.env.SABRE_CLIENT_ID,
        errorResponse: error.response?.data,
      });
      throw new Error(
        "Sabre authentication failed: Invalid credentials. " +
        "Please check your SABRE_BASIC_AUTH, SABRE_CLIENT_ID, and SABRE_CLIENT_SECRET in .env.local file."
      );
    }
    console.error("Sabre authentication error:", error.message);
    throw new Error(`Sabre authentication failed: ${error.message}`);
  }
}

/**
 * API endpoint to call Sabre GetSeats API
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
        error: "Missing request body",
      });
    }

    const getSeatsPayload = req.body;

    // Log the received payload for debugging
    console.log("📥 Received Sabre NDC GetSeats payload:", JSON.stringify(getSeatsPayload, null, 2));

    // Validate Sabre NDC payload structure
    if (!getSeatsPayload.party?.sender?.travelAgency?.pseudoCityID) {
      return res.status(400).json({
        success: false,
        message: "party.sender.travelAgency.pseudoCityID is required",
        error: "Missing party.sender.travelAgency.pseudoCityID in request body",
      });
    }

    if (!getSeatsPayload.request?.paxSegmentRefIds || !Array.isArray(getSeatsPayload.request.paxSegmentRefIds) || getSeatsPayload.request.paxSegmentRefIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "request.paxSegmentRefIds array is required",
        error: "Missing or empty request.paxSegmentRefIds array in request body",
      });
    }

    if (!getSeatsPayload.request?.originDest?.paxJourney?.paxSegments || 
        !Array.isArray(getSeatsPayload.request.originDest.paxJourney.paxSegments) || 
        getSeatsPayload.request.originDest.paxJourney.paxSegments.length === 0) {
      return res.status(400).json({
        success: false,
        message: "request.originDest.paxJourney.paxSegments array is required",
        error: "Missing or empty request.originDest.paxJourney.paxSegments array in request body",
      });
    }

    if (!getSeatsPayload.request?.paxes || !Array.isArray(getSeatsPayload.request.paxes) || getSeatsPayload.request.paxes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "request.paxes array is required",
        error: "Missing or empty request.paxes array in request body",
      });
    }

    // Get Sabre token
    const sabreToken = await getSabreToken();

    // Get client IP for X-Originating-IP header
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.headers['x-real-ip'] || 
                     req.connection?.remoteAddress || 
                     '127.0.0.1';

    console.log("🪑 Calling Sabre NDC GetSeats API:", {
      url: SABRE_GETSEATS_URL,
      pcc: getSeatsPayload.party?.sender?.travelAgency?.pseudoCityID,
      requestType: getSeatsPayload.requestType,
      paxSegmentRefIdsCount: getSeatsPayload.request?.paxSegmentRefIds?.length || 0,
      paxSegmentsCount: getSeatsPayload.request?.originDest?.paxJourney?.paxSegments?.length || 0,
      paxesCount: getSeatsPayload.request?.paxes?.length || 0,
      clientIP: clientIP,
    });

    // Log final outgoing payload for debugging
    console.log("📤 Final Sabre GetSeats payload:", JSON.stringify(getSeatsPayload, null, 2));

    // Call Sabre GetSeats API with required headers
    const response = await axios.post(
      SABRE_GETSEATS_URL,
      getSeatsPayload,
      {
        headers: {
          "Authorization": `Bearer ${sabreToken}`,
          "Content-Type": "application/json",
          "X-Originating-IP": clientIP,
        },
        timeout: 30000,
      }
    );

    // Check for seat maps at nested path: response.response.seatMaps
    const seatMaps = response.data?.response?.seatMaps || response.data?.seatMaps || [];
    
    console.log("✅ Sabre GetSeats API success:", {
      status: response.status,
      hasResponse: !!response.data?.response,
      hasSeatMapsInResponse: !!response.data?.response?.seatMaps,
      hasSeatMapsAtRoot: !!response.data?.seatMaps,
      seatMapsCount: Array.isArray(seatMaps) ? seatMaps.length : 0,
      seatMapsPath: response.data?.response?.seatMaps ? 'response.response.seatMaps' : 
                    response.data?.seatMaps ? 'response.seatMaps' : 'not found',
    });

    // Return the response data
    // Sabre returns: { response: { seatMaps: [...] } }
    // So we spread response.data which contains the response object
    return res.status(200).json({
      success: true,
      ...response.data,
    });

  } catch (error) {
    console.error("❌ Sabre GetSeats API Error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: SABRE_GETSEATS_URL,
    });

    // Handle specific error cases
    if (error.response) {
      // Sabre API returned an error response
      const errorData = error.response.data;
      const errorMessage = errorData?.message || 
                          errorData?.error?.message || 
                          errorData?.error || 
                          errorData?.description ||
                          error.response.statusText ||
                          "Sabre GetSeats API error";
      
      return res.status(error.response.status || 500).json({
        success: false,
        message: errorMessage,
        error: errorData || error.message,
        status: error.response.status,
        statusText: error.response.statusText,
      });
    }

    // Network or other errors
    return res.status(500).json({
      success: false,
      message: "Failed to call Sabre GetSeats API",
      error: error.message,
    });
  }
}

