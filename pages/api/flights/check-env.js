import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const clientId = process.env.SABRE_CLIENT_ID;
  const clientSecret = process.env.SABRE_CLIENT_SECRET;
  const accessToken = process.env.SABRE_ACCESS_TOKEN;
  const pcc = process.env.SABRE_PCC;
  const baseUrl = process.env.SABRE_BASE_URL?.trim() || "https://api.cert.platform.sabre.com";
  const authUrl = `${baseUrl}/v2/auth/token`;

  const envCheck = {
    SABRE_ACCESS_TOKEN: {
      exists: !!accessToken,
      length: accessToken?.length || 0,
      value: accessToken ? `${accessToken.substring(0, 10)}...${accessToken.substring(accessToken.length - 10)}` : "NOT SET",
      note: "If set, this token will be used directly (for testing). OAuth2 will be skipped.",
    },
    SABRE_CLIENT_ID: {
      exists: !!clientId,
      length: clientId?.length || 0,
      value: clientId ? `${clientId.substring(0, 4)}...${clientId.substring(clientId.length - 4)}` : "NOT SET",
      trimmed: clientId?.trim() || "",
      hasWhitespace: clientId && clientId !== clientId.trim(),
      note: accessToken ? "Not needed if SABRE_ACCESS_TOKEN is set" : "Required for OAuth2",
    },
    SABRE_CLIENT_SECRET: {
      exists: !!clientSecret,
      length: clientSecret?.length || 0,
      value: clientSecret ? `${clientSecret.substring(0, 4)}...${clientSecret.substring(clientSecret.length - 4)}` : "NOT SET",
      trimmed: clientSecret?.trim() || "",
      hasWhitespace: clientSecret && clientSecret !== clientSecret.trim(),
      note: accessToken ? "Not needed if SABRE_ACCESS_TOKEN is set" : "Required for OAuth2",
    },
    SABRE_PCC: {
      exists: !!pcc,
      length: pcc?.length || 0,
      value: pcc || "NOT SET",
      trimmed: pcc?.trim() || "",
      hasWhitespace: pcc && pcc !== pcc.trim(),
    },
    SABRE_BASE_URL: {
      exists: !!baseUrl,
      value: baseUrl || "https://api.platform.sabre.com (default)",
    },
  };

  const validation = {
    allSet: !!accessToken || (!!clientId && !!clientSecret),
    usingDirectToken: !!accessToken,
    issues: [],
    warnings: [],
  };

  if (accessToken) {
    validation.warnings.push("Using SABRE_ACCESS_TOKEN directly. This is for testing only. Token will expire and need to be refreshed manually.");
  } else {
    if (!clientId) {
      validation.issues.push("SABRE_CLIENT_ID is missing (required for OAuth2)");
    } else {
      if (clientId.length < 15) {
        validation.warnings.push(`SABRE_CLIENT_ID is very short (${clientId.length} chars). Sabre Client IDs are typically 20+ characters.`);
      }
      if (clientId !== clientId.trim()) {
        validation.issues.push("SABRE_CLIENT_ID has leading/trailing whitespace. Remove spaces.");
      }
    }

    if (!clientSecret) {
      validation.issues.push("SABRE_CLIENT_SECRET is missing");
    } else {
      if (clientSecret.length < 20) {
        validation.issues.push(`SABRE_CLIENT_SECRET is critically short (${clientSecret.length} chars). Sabre Client Secrets are typically 40+ characters. This will cause authentication to fail.`);
      } else if (clientSecret.length < 40) {
        validation.warnings.push(`SABRE_CLIENT_SECRET might be incomplete (${clientSecret.length} chars). Sabre Client Secrets are typically 40+ characters.`);
      }
      if (clientSecret !== clientSecret.trim()) {
        validation.issues.push("SABRE_CLIENT_SECRET has leading/trailing whitespace. Remove spaces.");
      }
    }
  }

  if (!pcc) {
    validation.warnings.push("SABRE_PCC is not set. This is optional but recommended for proper Sabre API functionality.");
  } else if (pcc !== pcc.trim()) {
    validation.issues.push("SABRE_PCC has leading/trailing whitespace. Remove spaces.");
  }

  const envFileTips = [];
  if (clientId && clientId.includes('"')) {
    envFileTips.push("SABRE_CLIENT_ID contains quotes. Remove quotes from .env.local file.");
  }
  if (clientSecret && clientSecret.includes('"')) {
    envFileTips.push("SABRE_CLIENT_SECRET contains quotes. Remove quotes from .env.local file.");
  }

  // STEP 1: Test credentials by attempting OAuth2 authentication
  let credentialTest = null;
  if (!accessToken && clientId && clientSecret) {
    try {
      const credentials = Buffer.from(`${clientId.trim()}:${clientSecret.trim()}`).toString("base64");
      const testResponse = await axios.post(
        authUrl,
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${credentials}`,
          },
          timeout: 10000,
        }
      );
      
      if (testResponse.data?.access_token) {
        credentialTest = {
          success: true,
          message: "✅ Credentials are valid! OAuth2 authentication successful.",
          tokenLength: testResponse.data.access_token.length,
          expiresIn: testResponse.data.expires_in,
          tokenType: testResponse.data.token_type,
        };
      } else {
        credentialTest = {
          success: false,
          message: "⚠️ Authentication returned no access token",
          response: testResponse.data,
        };
      }
    } catch (testError) {
      credentialTest = {
        success: false,
        message: "❌ Credentials test failed",
        error: {
          status: testError.response?.status,
          statusText: testError.response?.statusText,
          errorCode: testError.response?.data?.error?.errorCode,
          errorType: testError.response?.data?.error?.type,
          errorMessage: testError.response?.data?.error?.message || testError.message,
          fullError: testError.response?.data,
        },
        troubleshooting: {
          step1: "Verify SABRE_CLIENT_ID and SABRE_CLIENT_SECRET are correct",
          step2: "Check if credentials match the environment (CERT vs PROD)",
          step3: "Ensure credentials are from Sabre Developer Portal",
          step4: "Verify SABRE_BASE_URL matches your credentials' environment",
        },
      };
    }
  } else if (accessToken) {
    credentialTest = {
      success: true,
      message: "✅ Using SABRE_ACCESS_TOKEN (direct token - not tested)",
      note: "Token validity cannot be tested without making an API call. Token will be validated on first API request.",
    };
  } else {
    credentialTest = {
      success: false,
      message: "⚠️ Cannot test credentials - missing CLIENT_ID or CLIENT_SECRET",
    };
  }

  return res.status(200).json({
    success: validation.allSet && validation.issues.length === 0,
    message:
      validation.issues.length > 0
        ? "Environment variables have issues that need to be fixed"
        : validation.warnings.length > 0
        ? "Environment variables are set but have warnings"
        : "All environment variables are configured correctly",
    envCheck,
    validation,
    envFileTips,
    credentialTest,
    instructions: {
      fileLocation: ".env.local file should be in the project root (same level as package.json)",
      format: [
        "SABRE_ACCESS_TOKEN=your_access_token_here (for testing - optional)",
        "SABRE_CLIENT_ID=your_client_id_here (required if no access token)",
        "SABRE_CLIENT_SECRET=your_client_secret_here (required if no access token)",
        "SABRE_PCC=your_pcc_code_here (optional but recommended)",
      ],
      important: [
        "No spaces around the = sign",
        "No quotes around values (unless value contains spaces)",
        "Each variable on its own line",
        "Restart server after updating .env.local",
      ],
    },
    nextSteps: validation.issues.length > 0
      ? [
          "Fix the issues listed above",
          "Update your .env.local file",
          "Restart your Next.js server",
          "Check this endpoint again to verify",
        ]
      : validation.warnings.length > 0
      ? [
          "Review the warnings above",
          "Consider adding SABRE_PCC if not set",
          "Verify credentials are complete",
        ]
      : [
          "Environment variables look good!",
          "If you're still getting errors, the credentials themselves might be incorrect",
          "Verify credentials in Sabre Developer Portal",
        ],
  });
}
