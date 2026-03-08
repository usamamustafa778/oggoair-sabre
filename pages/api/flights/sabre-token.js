import axios from "axios";

// Sabre API Configuration
const SABRE_BASE_URL = process.env.SABRE_BASE_URL?.trim() || "https://api.cert.platform.sabre.com";
const SABRE_AUTH_URL = `${SABRE_BASE_URL}/v2/auth/token`;

// Token caching
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get Sabre OAuth2 access token
 * Uses same logic as search API - supports SABRE_BASIC_AUTH, SABRE_ACCESS_TOKEN, or OAuth2
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
 * API endpoint to get Sabre token
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const token = await getSabreToken();
    return res.status(200).json({
      success: true,
      token: token,
    });
  } catch (error) {
    console.error("Sabre Token Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get Sabre token",
      error: error.message,
    });
  }
}

