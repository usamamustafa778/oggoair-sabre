import axios from "axios";

// Sabre API Configuration - Read from environment variables
// Default to CERT environment (can be overridden with SABRE_BASE_URL)
const SABRE_BASE_URL = process.env.SABRE_BASE_URL?.trim() || "https://api.cert.platform.sabre.com";
const SABRE_AUTH_URL = `${SABRE_BASE_URL}/v2/auth/token`;
const SABRE_SHOP_URL = `${SABRE_BASE_URL}/v5/offers/shop`;

// Log Sabre endpoint configuration (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("🔧 Sabre API Configuration:", {
    baseUrl: SABRE_BASE_URL,
    authUrl: SABRE_AUTH_URL,
    shopUrl: SABRE_SHOP_URL,
    hasBaseUrlEnv: !!process.env.SABRE_BASE_URL,
  });
}

// Token caching
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get Sabre OAuth2 access token
 * Uses SABRE_ACCESS_TOKEN if set, otherwise uses OAuth2 flow
 */
async function getSabreToken() {
  // Option 1: Use access token from environment if provided (highest priority)
  // This ALWAYS reads fresh from process.env, so new tokens are used immediately after server restart
  const accessTokenFromEnv = process.env.SABRE_ACCESS_TOKEN?.trim();
  
  // Always log what we're detecting (helps debug .env.local issues)
  console.log("🔍 Checking environment variables:", {
    hasAccessToken: !!process.env.SABRE_ACCESS_TOKEN,
    accessTokenLength: process.env.SABRE_ACCESS_TOKEN?.length || 0,
    accessTokenPrefix: process.env.SABRE_ACCESS_TOKEN ? process.env.SABRE_ACCESS_TOKEN.substring(0, 20) + "..." : "N/A",
    hasClientId: !!process.env.SABRE_CLIENT_ID,
    hasClientSecret: !!process.env.SABRE_CLIENT_SECRET,
    clientSecretLength: process.env.SABRE_CLIENT_SECRET?.length || 0,
    baseUrl: SABRE_BASE_URL,
  });
  
  if (accessTokenFromEnv) {
    // Clear any cached OAuth tokens when using direct access token from env
    // This ensures we always use the token from .env.local, not a stale cached token
    if (cachedToken) {
      console.log("🔄 Clearing cached OAuth token (using SABRE_ACCESS_TOKEN from .env.local instead)");
      cachedToken = null;
      tokenExpiry = null;
    }
    
    console.log("✅ Using SABRE_ACCESS_TOKEN from .env.local file (OAuth2 skipped)");
    console.log("🔑 Token details:", {
      length: accessTokenFromEnv.length,
      prefix: accessTokenFromEnv.substring(0, 20) + "...",
      suffix: "..." + accessTokenFromEnv.substring(accessTokenFromEnv.length - 10),
      note: "Token is read directly from process.env.SABRE_ACCESS_TOKEN",
    });
    console.log("💡 To use a new token: Update SABRE_ACCESS_TOKEN in .env.local and restart the server");
    return accessTokenFromEnv;
  }

  // If no access token, warn user
  console.warn("⚠️  SABRE_ACCESS_TOKEN not found. Will attempt OAuth2 with CLIENT_ID/CLIENT_SECRET.");

  // Option 2: Use cached token if still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log("✅ Using cached Sabre token");
    return cachedToken;
  }

  // Option 3: Get new token via OAuth2
  const clientId = process.env.SABRE_CLIENT_ID?.trim();
  const clientSecret = process.env.SABRE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    const missingVars = [];
    if (!clientId) missingVars.push("SABRE_CLIENT_ID");
    if (!clientSecret) missingVars.push("SABRE_CLIENT_SECRET");
    
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}. ` +
      `Add them to your .env.local file and restart your server. ` +
      `OR set SABRE_ACCESS_TOKEN directly to skip OAuth2. ` +
      `Visit http://localhost:3000/api/flights/check-env to verify your configuration.`
    );
  }

  // Validate credentials format and provide specific error messages
  const credentialIssues = [];
  
  if (clientId.length < 15) {
    credentialIssues.push(`SABRE_CLIENT_ID is too short (${clientId.length} chars). Expected 20+ characters.`);
  }
  if (clientId !== process.env.SABRE_CLIENT_ID) {
    credentialIssues.push("SABRE_CLIENT_ID has leading/trailing whitespace. Remove spaces from .env.local file.");
  }
  
  if (clientSecret.length < 20) {
    credentialIssues.push(`SABRE_CLIENT_SECRET is critically short (${clientSecret.length} chars). Expected 40+ characters. This will cause authentication to fail.`);
  } else if (clientSecret.length < 40) {
    console.warn(`⚠️  SABRE_CLIENT_SECRET might be incomplete (${clientSecret.length} chars). Expected 40+ characters.`);
  }
  if (clientSecret !== process.env.SABRE_CLIENT_SECRET) {
    credentialIssues.push("SABRE_CLIENT_SECRET has leading/trailing whitespace. Remove spaces from .env.local file.");
  }

  if (credentialIssues.length > 0) {
    throw new Error(
      `Invalid credentials format: ${credentialIssues.join(" ")} ` +
      `Visit http://localhost:3000/api/flights/check-env to verify your .env.local configuration.`
    );
  }

  // Create Basic Auth header
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    console.log("🔐 Attempting Sabre OAuth2 authentication...");
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
      // Cache token for slightly less than expiry time (default 1 hour, cache for 55 minutes)
      const expiresIn = authResponse.data.expires_in || 3600;
      tokenExpiry = Date.now() + (expiresIn - 300) * 1000; // Subtract 5 minutes for safety
      console.log("✅ Sabre OAuth2 authentication successful");
      return cachedToken;
    }

    throw new Error("No access token in Sabre auth response");
  } catch (error) {
    if (error.response?.status === 401) {
      console.error("❌ Sabre OAuth2 authentication failed (401):", {
        authUrl: SABRE_AUTH_URL,
        clientIdLength: clientId.length,
        clientSecretLength: clientSecret.length,
        errorResponse: error.response?.data,
      });
      throw new Error(
        "Sabre authentication failed: Invalid client ID or client secret. " +
        "Please check your SABRE_CLIENT_ID and SABRE_CLIENT_SECRET in .env.local file. " +
        "OR use SABRE_ACCESS_TOKEN directly to skip OAuth2."
      );
    }
    console.error("❌ Sabre OAuth2 authentication error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(`Sabre authentication failed: ${error.message}`);
  }
}

/**
 * Transform Sabre BFM response to Duffel format for frontend compatibility
 */
function transformSabreToDuffel(sabreResponse) {
  const offers = [];

  try {
    // Handle both array and single object responses
    let pricedItineraries = sabreResponse?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary;
    
    // Normalize to array
    if (!pricedItineraries) {
      console.warn("⚠️  transformSabreToDuffel: No PricedItineraries found in response");
      return { data: { offers: [] } };
    }
    
    if (!Array.isArray(pricedItineraries)) {
      pricedItineraries = [pricedItineraries];
    }
    
    console.log(`🔄 transformSabreToDuffel: Processing ${pricedItineraries.length} priced itineraries`);

    pricedItineraries.forEach((itinerary, index) => {
      const airItinerary = itinerary.AirItinerary;
      const airItineraryPricingInfo = itinerary.AirItineraryPricingInfo;

      if (!airItinerary || !airItineraryPricingInfo) {
        return;
      }

      // Extract slices from origin destination options
      const originDestinationOptions =
        airItinerary.OriginDestinationOptions?.OriginDestinationOption || [];
      const slices = [];

      originDestinationOptions.forEach((option) => {
        const flightSegments = option.FlightSegment || [];
        const segments = [];

        flightSegments.forEach((segment) => {
          // Convert ElapsedTime to ISO 8601 duration format (PT2H5M)
          let duration = segment.ElapsedTime || "PT0H0M";
          if (duration && !duration.startsWith("PT")) {
            // If duration is in minutes (number), convert to PT format
            const minutes = parseInt(duration, 10);
            if (!isNaN(minutes)) {
              const hours = Math.floor(minutes / 60);
              const mins = minutes % 60;
              duration = `PT${hours}H${mins}M`;
            }
          } else if (typeof duration === "number") {
            // If duration is a number (minutes), convert to PT format
            const hours = Math.floor(duration / 60);
            const mins = duration % 60;
            duration = `PT${hours}H${mins}M`;
          }

          segments.push({
            departing_at: segment.DepartureDateTime,
            arriving_at: segment.ArrivalDateTime,
            origin: {
              iata_code: segment.DepartureAirport?.LocationCode,
              name: segment.DepartureAirport?.LocationCode || segment.DepartureAirport?.TerminalID || "Unknown",
              city_name: segment.DepartureAirport?.CityName || null,
            },
            destination: {
              iata_code: segment.ArrivalAirport?.LocationCode,
              name: segment.ArrivalAirport?.LocationCode || segment.ArrivalAirport?.TerminalID || "Unknown",
              city_name: segment.ArrivalAirport?.CityName || null,
            },
            marketing_carrier: {
              iata_code: segment.MarketingAirline?.Code,
              name: segment.MarketingAirline?.Code || "Unknown",
            },
            operating_carrier: {
              iata_code: segment.OperatingAirline?.Code || segment.MarketingAirline?.Code,
              name: segment.OperatingAirline?.Code || segment.MarketingAirline?.Code || "Unknown",
            },
            marketing_carrier_flight_number: segment.FlightNumber,
            operating_carrier_flight_number: segment.FlightNumber,
            flight_number: segment.FlightNumber,
            aircraft: {
              iata_code: segment.Equipment?.AirEquipType || "Unknown",
              name: segment.Equipment?.AirEquipType || "Unknown",
            },
            duration: duration,
          });
        });

        if (segments.length > 0) {
          // Calculate total duration from first departure to last arrival
          const firstDeparture = new Date(segments[0].departing_at);
          const lastArrival = new Date(segments[segments.length - 1].arriving_at);
          const totalMinutes = Math.floor((lastArrival - firstDeparture) / (1000 * 60));
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          const totalDuration = `PT${hours}H${minutes}M`;

          slices.push({
            segments: segments,
            origin: segments[0]?.origin?.iata_code,
            destination: segments[segments.length - 1]?.destination?.iata_code,
            duration: totalDuration, // ISO 8601 format for UI
          });
        }
      });

      // Extract pricing information from Sabre response
      const pricingInfo = airItineraryPricingInfo;
      const itinTotalFare = pricingInfo?.ItinTotalFare || {};
      
      // Extract total fare (full price including base + taxes)
      const totalFare = itinTotalFare.TotalFare || {};
      const totalAmount = totalFare.Amount || "0";
      const currency = totalFare.CurrencyCode || "USD";
      
      // Extract base fare
      const baseFare = itinTotalFare.BaseFare || {};
      const baseAmount = baseFare.Amount || totalAmount; // Fallback to total if base not available
      
      // Extract taxes (can be array or single object)
      let taxAmount = "0";
      if (itinTotalFare.Taxes) {
        const taxes = itinTotalFare.Taxes.Tax || [];
        const taxArray = Array.isArray(taxes) ? taxes : [taxes];
        taxAmount = taxArray.reduce((sum, tax) => {
          return sum + parseFloat(tax.Amount || 0);
        }, 0).toFixed(2);
      }
      
      // Log pricing for debugging
      if (index === 0) {
        console.log(`💰 Pricing for first itinerary:`, {
          totalAmount,
          baseAmount,
          taxAmount,
          currency,
          itinTotalFareKeys: Object.keys(itinTotalFare),
        });
      }

      // Extract passenger information from TravelerInfoSummary if available
      const passengerTypeQuantities = airItineraryPricingInfo.TravelerInfoSummary?.AirTravelerAvail?.[0]?.PassengerTypeQuantity || [];
      const passengers = [];
      passengerTypeQuantities.forEach(ptq => {
        for (let i = 0; i < ptq.Quantity; i++) {
          if (ptq.Code === "ADT") passengers.push({ type: "adult" });
          else if (ptq.Code === "CNN") passengers.push({ type: "child" });
          else if (ptq.Code === "INF") passengers.push({ type: "infant_without_seat" });
        }
      });

      // Get airline info from first segment (for owner field)
      const firstSegment = slices[0]?.segments?.[0];
      const airlineCode = firstSegment?.marketing_carrier?.iata_code || "UNKNOWN";
      const airlineName = firstSegment?.marketing_carrier?.name || airlineCode;

      // Build offer in Duffel format (matching Duffel structure for UI compatibility)
      const offer = {
        id: `sabre_offer_${index}_${Date.now()}`,
        slices: slices,
        total_amount: totalAmount.toString(), // Full price (base + taxes)
        total_currency: currency,
        base_amount: baseAmount.toString(), // Base fare only
        tax_amount: taxAmount.toString(), // Taxes only
        owner: {
          iata_code: airlineCode,
          name: airlineName,
        },
        passengers: passengers.length > 0 ? passengers : [{ type: "adult" }], // Default to adult if not found
        passenger_identities: [],
        conditions: {
          change_before_departure: {
            allowed: false,
            penalty_currency: currency,
            penalty_amount: "0",
          },
          refund_before_departure: {
            allowed: false,
            penalty_currency: currency,
            penalty_amount: "0",
          },
        },
        live_mode: true,
        private_fares: [],
      };

      offers.push(offer);
    });
  } catch (error) {
    console.error("Error transforming Sabre response:", error);
  }

  return {
    data: {
      offers: offers,
    },
  };
}

/**
 * Helper function to parse ISO 8601 duration to minutes
 */
function parseDurationToMinutes(durationStr) {
  if (!durationStr || !durationStr.startsWith("PT")) return 0;
  
  const hours = parseInt(durationStr.match(/(\d+)H/)?.[1] || "0", 10);
  const minutes = parseInt(durationStr.match(/(\d+)M/)?.[1] || "0", 10);
  
  return hours * 60 + minutes;
}

/**
 * Main API handler
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
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

    // ============================================
    // SABRE BFM API - STRICT VALIDATION
    // ============================================
    // Request body MUST contain OTA_AirLowFareSearchRQ
    // Request body MUST NOT contain slices, cabin_class, or type: "adult"
    // ============================================
    
    const sabrePayload = req.body;

    // Validate: Request body MUST contain OTA_AirLowFareSearchRQ
    if (!sabrePayload.OTA_AirLowFareSearchRQ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request: OTA_AirLowFareSearchRQ is required",
        error: "Request must be in Sabre BFM format. No Duffel format allowed.",
      });
    }

    // Validate: Request body MUST NOT contain slices
    if (sabrePayload.slices) {
      return res.status(400).json({
        success: false,
        message: "Invalid request: slices field is not allowed",
        error: "Request must use Sabre format (OriginDestinationInformation), not Duffel format (slices)",
      });
    }

    // Validate: Request body MUST NOT contain cabin_class
    if (sabrePayload.cabin_class) {
      return res.status(400).json({
        success: false,
        message: "Invalid request: cabin_class field is not allowed",
        error: "Request must use Sabre format only",
      });
    }

    const otaRequest = sabrePayload.OTA_AirLowFareSearchRQ;

    // Validate required Sabre fields
    if (!otaRequest.OriginDestinationInformation || !Array.isArray(otaRequest.OriginDestinationInformation) || otaRequest.OriginDestinationInformation.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid request: OriginDestinationInformation is required",
        error: "At least one origin-destination pair is required",
      });
    }

    if (!otaRequest.TravelerInfoSummary || !otaRequest.TravelerInfoSummary.AirTravelerAvail) {
      return res.status(400).json({
        success: false,
        message: "Invalid request: TravelerInfoSummary.AirTravelerAvail is required",
        error: "Passenger information is required",
      });
    }

    // Get Sabre access token from environment variables
    let accessToken;
    try {
      accessToken = await getSabreToken();
    } catch (authError) {
      console.error("Sabre Authentication Error:", authError.message);
      return res.status(401).json({
        success: false,
        message: "Flight search failed: Authentication error",
        error: authError.message,
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            hint: "Check your .env.local file in the project root",
            requiredEnvVars: {
              option1: "SABRE_ACCESS_TOKEN (direct token - recommended for testing)",
              option2: "SABRE_CLIENT_ID + SABRE_CLIENT_SECRET (for OAuth2)",
            },
            envCheck: {
              hasAccessToken: !!process.env.SABRE_ACCESS_TOKEN,
              hasClientId: !!process.env.SABRE_CLIENT_ID,
              hasClientSecret: !!process.env.SABRE_CLIENT_SECRET,
              baseUrl: SABRE_BASE_URL,
            },
            instructions: [
              "1. Create or edit .env.local in project root (same level as package.json)",
              "2. Add: SABRE_ACCESS_TOKEN=your_token_here",
              "   OR add: SABRE_CLIENT_ID=your_id and SABRE_CLIENT_SECRET=your_secret",
              "3. Add: SABRE_PCC=your_pcc_code (optional)",
              "4. Restart your Next.js server (Ctrl+C then npm run dev)",
            ],
          },
        }),
      });
    }

    // Update PseudoCityCode from environment (required for CERT environment)
    const sabreRequest = { ...sabrePayload };
    const pccFromEnv = process.env.SABRE_PCC?.trim();
    
    if (pccFromEnv) {
      if (sabreRequest.OTA_AirLowFareSearchRQ.POS?.Source?.[0]) {
        sabreRequest.OTA_AirLowFareSearchRQ.POS.Source[0].PseudoCityCode = pccFromEnv;
        console.log(`✅ Using PseudoCityCode from environment: ${pccFromEnv}`);
      }
    } else {
      // Default to 51FL if not set in environment
      if (sabreRequest.OTA_AirLowFareSearchRQ.POS?.Source?.[0]) {
        sabreRequest.OTA_AirLowFareSearchRQ.POS.Source[0].PseudoCityCode = "51FL";
        console.warn("⚠️  SABRE_PCC not set in environment, using default: 51FL");
      }
    }
    
    // Log final PCC being used
    const finalPCC = sabreRequest.OTA_AirLowFareSearchRQ.POS?.Source?.[0]?.PseudoCityCode;
    console.log(`🔑 Final PseudoCityCode: ${finalPCC}`);

    // Call Sabre BFM API
    let response;
    try {
      // Debug log: Final Sabre payload and PCC
      console.log("🚀 Calling Sabre BFM API:", {
        endpoint: SABRE_SHOP_URL,
        originDestinations: sabreRequest.OTA_AirLowFareSearchRQ.OriginDestinationInformation.length,
        passengers: sabreRequest.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0]?.PassengerTypeQuantity?.length || 0,
        pcc: finalPCC,
      });
      console.log("📤 Final Sabre Request Payload:", JSON.stringify(sabreRequest, null, 2));
      console.log(`🔑 PseudoCityCode being used: ${finalPCC}`);
      
      // STEP 2: Validate headers before making request
      const requestHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      };
      
      // STEP 5: Log full API request details
      console.log("📤 STEP 2: Request Headers Validation:", {
        hasContentType: !!requestHeaders["Content-Type"],
        contentType: requestHeaders["Content-Type"],
        hasAuthorization: !!requestHeaders.Authorization,
        authorizationPrefix: requestHeaders.Authorization.substring(0, 20) + "...",
        tokenLength: accessToken.length,
        endpoint: SABRE_SHOP_URL,
      });
      
      // STEP 3: Log minimal test payload structure
      console.log("📤 STEP 3: Request Payload Structure:", {
        hasOTA_AirLowFareSearchRQ: !!sabreRequest.OTA_AirLowFareSearchRQ,
        originDestinations: sabreRequest.OTA_AirLowFareSearchRQ?.OriginDestinationInformation?.length || 0,
        firstOrigin: sabreRequest.OTA_AirLowFareSearchRQ?.OriginDestinationInformation?.[0]?.DepartureDateTime?.Date || "N/A",
        firstOriginCode: sabreRequest.OTA_AirLowFareSearchRQ?.OriginDestinationInformation?.[0]?.DepartureAirport?.LocationCode || "N/A",
        firstDestCode: sabreRequest.OTA_AirLowFareSearchRQ?.OriginDestinationInformation?.[0]?.ArrivalAirport?.LocationCode || "N/A",
        passengers: sabreRequest.OTA_AirLowFareSearchRQ?.TravelerInfoSummary?.AirTravelerAvail?.[0]?.PassengerTypeQuantity?.length || 0,
        pcc: finalPCC,
      });
      
      response = await axios.post(SABRE_SHOP_URL, sabreRequest, {
        headers: requestHeaders,
        timeout: 60000,
      });
      
      // STEP 5: Comprehensive response logging
      console.log("📥 STEP 5: Sabre API Response Status:", response.status);
      console.log("📥 STEP 5: Sabre Response Structure:", {
        status: response.status,
        statusText: response.statusText,
        hasOTA_AirLowFareSearchRS: !!response.data?.OTA_AirLowFareSearchRS,
        hasPricedItineraries: !!response.data?.OTA_AirLowFareSearchRS?.PricedItineraries,
        pricedItinerariesCount: Array.isArray(response.data?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary) 
          ? response.data.OTA_AirLowFareSearchRS.PricedItineraries.PricedItinerary.length 
          : 0,
        hasErrors: !!response.data?.OTA_AirLowFareSearchRS?.Errors,
        hasWarnings: !!response.data?.OTA_AirLowFareSearchRS?.Warnings,
        hasGroupedItineraryResponse: !!response.data?.OTA_AirLowFareSearchRS?.groupedItineraryResponse,
        hasScheduleDescs: !!response.data?.OTA_AirLowFareSearchRS?.groupedItineraryResponse?.scheduleDescs,
        scheduleDescsCount: Array.isArray(response.data?.OTA_AirLowFareSearchRS?.groupedItineraryResponse?.scheduleDescs)
          ? response.data.OTA_AirLowFareSearchRS.groupedItineraryResponse.scheduleDescs.length
          : 0,
        responseKeys: response.data ? Object.keys(response.data) : [],
        rsKeys: response.data?.OTA_AirLowFareSearchRS ? Object.keys(response.data.OTA_AirLowFareSearchRS) : [],
      });
      
      // STEP 4 & 5: Log full response in development for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("📥 STEP 5: Full Sabre Response:", JSON.stringify(response.data, null, 2));
        
        // STEP 4: Debug "No Flights Found" - log search criteria
        console.log("📋 STEP 4: Search Criteria Debug:", {
          originDestinations: sabreRequest.OTA_AirLowFareSearchRQ.OriginDestinationInformation.map(odi => ({
            departureDate: odi.DepartureDateTime?.Date,
            departureTime: odi.DepartureDateTime?.Time,
            origin: odi.DepartureAirport?.LocationCode,
            destination: odi.ArrivalAirport?.LocationCode,
          })),
          passengers: sabreRequest.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0]?.PassengerTypeQuantity?.map(ptq => ({
            code: ptq.Code,
            quantity: ptq.Quantity,
          })),
          cabinClass: sabreRequest.OTA_AirLowFareSearchRQ.TravelerInfoSummary.AirTravelerAvail[0]?.CabinPref?.[0]?.Cabin,
          pcc: finalPCC,
        });
      }
    } catch (apiError) {
      // STEP 1 & 2: Enhanced error logging for authentication issues
      console.error("❌ Sabre API Request Error:", {
        message: apiError.message,
        status: apiError.response?.status,
        statusText: apiError.response?.statusText,
        errorCode: apiError.response?.data?.error?.errorCode,
        errorType: apiError.response?.data?.error?.type,
        errorMessage: apiError.response?.data?.error?.message,
        fullErrorData: apiError.response?.data,
        requestHeaders: {
          hasAuthorization: !!apiError.config?.headers?.Authorization,
          authorizationPrefix: apiError.config?.headers?.Authorization?.substring(0, 20) + "...",
          contentType: apiError.config?.headers?.["Content-Type"],
        },
        requestUrl: apiError.config?.url,
        requestMethod: apiError.config?.method,
      });

      // STEP 1: Handle 401 authentication errors specifically
      if (apiError.response?.status === 401) {
        // Clear cached token on 401
        cachedToken = null;
        tokenExpiry = null;
        
        const errorData = apiError.response?.data?.error || apiError.response?.data;
        const errorCode = errorData?.errorCode || "UNKNOWN";
        const errorMessage = errorData?.message || "Authentication failed";
        
        console.error("🔐 AUTHENTICATION FAILED (401):", {
          errorCode: errorCode,
          errorType: errorData?.type,
          errorMessage: errorMessage,
          timestamp: errorData?.timeStamp,
          troubleshooting: {
            step1: "Check if SABRE_ACCESS_TOKEN is valid and not expired",
            step2: "If using OAuth2, verify SABRE_CLIENT_ID and SABRE_CLIENT_SECRET are correct",
            step3: "Ensure credentials match the environment (CERT vs PROD)",
            step4: "Check if token has required permissions for BFM API",
            step5: "Verify SABRE_BASE_URL matches your credentials' environment",
          },
        });
        
        return res.status(401).json({
          success: false,
          message: "Flight search failed",
          error: {
            status: errorData?.status || "NotProcessed",
            type: errorData?.type || "Validation",
            errorCode: errorCode,
            timeStamp: errorData?.timeStamp || new Date().toISOString(),
            message: errorMessage,
          },
          ...(process.env.NODE_ENV === "development" && {
            debug: {
              hint: "Invalid credentials detected. Follow these steps:",
              step1: "Validate API Credentials - Check .env.local file",
              step2: "If using SABRE_ACCESS_TOKEN, verify it's not expired",
              step3: "If using OAuth2, verify SABRE_CLIENT_ID and SABRE_CLIENT_SECRET",
              step4: "Test credentials at: http://localhost:3000/api/flights/check-env",
              step5: "Request new OAuth token if current one is invalid",
              envCheck: {
                hasAccessToken: !!process.env.SABRE_ACCESS_TOKEN,
                accessTokenLength: process.env.SABRE_ACCESS_TOKEN?.length || 0,
                hasClientId: !!process.env.SABRE_CLIENT_ID,
                hasClientSecret: !!process.env.SABRE_CLIENT_SECRET,
                clientSecretLength: process.env.SABRE_CLIENT_SECRET?.length || 0,
                baseUrl: SABRE_BASE_URL,
                authUrl: SABRE_AUTH_URL,
              },
            },
          }),
        });
      }

      const errorStatus = apiError.response?.status || 500;
      const errorData = apiError.response?.data?.error || apiError.response?.data || apiError.message;
      
      return res.status(errorStatus).json({
        success: false,
        message: "Flight search failed",
        error: errorData,
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            requestUrl: apiError.config?.url,
            requestMethod: apiError.config?.method,
            requestPayload: JSON.stringify(sabreRequest).substring(0, 500),
          },
        }),
      });
    }

    // Check for Sabre API errors in response
    if (response.data?.OTA_AirLowFareSearchRS?.Errors) {
      const errors = response.data.OTA_AirLowFareSearchRS.Errors.Error || [];
      const errorArray = Array.isArray(errors) ? errors : [errors];
      if (errorArray.length > 0) {
        const errorMessages = errorArray.map((e) => e.ShortText || e.Message || e.Code || JSON.stringify(e));
        console.error("❌ Sabre API returned errors:", errorMessages);
        console.error("❌ Full error details:", JSON.stringify(errorArray, null, 2));
        // Return empty offers with error info
        return res.status(200).json({ 
          data: { offers: [] },
          ...(process.env.NODE_ENV === "development" && {
            sabreErrors: errorArray,
            errorMessages: errorMessages,
          }),
        });
      }
    }

    // Check for warnings in response
    if (response.data?.OTA_AirLowFareSearchRS?.Warnings) {
      const warnings = response.data.OTA_AirLowFareSearchRS.Warnings.Warning || [];
      const warningArray = Array.isArray(warnings) ? warnings : [warnings];
      if (warningArray.length > 0) {
        const warningMessages = warningArray.map((w) => w.ShortText || w.Message || JSON.stringify(w));
        console.warn("⚠️  Sabre API returned warnings:", warningMessages);
      }
    }

    // Check if response has PricedItineraries
    const pricedItineraries = response.data?.OTA_AirLowFareSearchRS?.PricedItineraries?.PricedItinerary;
    const itineraryArray = Array.isArray(pricedItineraries) 
      ? pricedItineraries 
      : pricedItineraries 
        ? [pricedItineraries] 
        : [];
    
    if (itineraryArray.length === 0) {
      console.warn("⚠️  Sabre API returned no PricedItineraries");
      console.warn("📋 Response structure analysis:", {
        hasResponse: !!response.data,
        hasOTA_AirLowFareSearchRS: !!response.data?.OTA_AirLowFareSearchRS,
        rsKeys: response.data?.OTA_AirLowFareSearchRS ? Object.keys(response.data.OTA_AirLowFareSearchRS) : [],
        fullRS: process.env.NODE_ENV === "development" ? response.data?.OTA_AirLowFareSearchRS : "hidden",
      });
      // Return empty offers with debug info
      return res.status(200).json({ 
        data: { offers: [] },
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            message: "No PricedItineraries in Sabre response",
            responseStructure: {
              hasOTA_AirLowFareSearchRS: !!response.data?.OTA_AirLowFareSearchRS,
              rsKeys: response.data?.OTA_AirLowFareSearchRS ? Object.keys(response.data.OTA_AirLowFareSearchRS) : [],
              fullResponse: response.data,
            },
          },
        }),
      });
    }

    // Transform Sabre response to Duffel format
    try {
      console.log("🔄 Transforming Sabre response...");
      console.log("📊 PricedItineraries count:", itineraryArray.length);
      
      const transformedResponse = transformSabreToDuffel(response.data);
      
      if (!transformedResponse || !transformedResponse.data) {
        throw new Error("Transformation returned invalid structure");
      }
      
      console.log("✅ Transformation successful. Offers count:", transformedResponse.data.offers?.length || 0);
      
      // ============================================
      // INCLUDE groupedItineraryResponse FOR FRONTEND
      // ============================================
      // Frontend expects scheduleDescs from groupedItineraryResponse
      // Include it in the response if it exists in Sabre response
      // ============================================
      const groupedItineraryResponse = response.data?.OTA_AirLowFareSearchRS?.groupedItineraryResponse;
      const scheduleDescs = groupedItineraryResponse?.scheduleDescs;
      
      if (scheduleDescs) {
        console.log("✅ Found scheduleDescs in groupedItineraryResponse:", scheduleDescs.length);
        // Include groupedItineraryResponse in the response for frontend
        transformedResponse.groupedItineraryResponse = groupedItineraryResponse;
      } else {
        console.warn("⚠️  No scheduleDescs found in groupedItineraryResponse");
        // Check if it's in a different location
        const altScheduleDescs = response.data?.groupedItineraryResponse?.scheduleDescs;
        if (altScheduleDescs) {
          console.log("✅ Found scheduleDescs in alternate location:", altScheduleDescs.length);
          transformedResponse.groupedItineraryResponse = {
            scheduleDescs: altScheduleDescs,
          };
        }
      }
      
      // Also include full response in debug mode for troubleshooting
      if (process.env.NODE_ENV === "development") {
        transformedResponse.debug = {
          ...transformedResponse.debug,
          responseStructure: {
            hasOTA_AirLowFareSearchRS: !!response.data?.OTA_AirLowFareSearchRS,
            hasGroupedItineraryResponse: !!groupedItineraryResponse,
            hasScheduleDescs: !!scheduleDescs,
            scheduleDescsCount: scheduleDescs?.length || 0,
            rsKeys: response.data?.OTA_AirLowFareSearchRS ? Object.keys(response.data.OTA_AirLowFareSearchRS) : [],
            fullResponse: response.data,
          },
        };
      }
      
      res.status(200).json(transformedResponse);
    } catch (transformError) {
      console.error("❌ Error transforming Sabre response:", transformError);
      console.error("❌ Transformation error details:", {
        message: transformError.message,
        stack: transformError.stack,
      });
      // Return empty offers on transformation error with debug info
      res.status(200).json({ 
        data: { offers: [] },
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            transformationError: transformError.message,
            responseSample: JSON.stringify(response.data).substring(0, 2000),
          },
        }),
      });
    }
  } catch (error) {
    console.error("Unexpected Error in flight search:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      success: false,
      message: "Flight search failed",
      error: error.message || "An unexpected error occurred",
    });
  }
}

