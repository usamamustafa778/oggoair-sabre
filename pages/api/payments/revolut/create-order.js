// Create a Revolut Merchant order securely on the server

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { amount, currency = "GBP", metadata, redirect_url } = req.body || {};

        if (!amount || typeof amount !== "number") {
            return res
                .status(400)
                .json({ message: "amount (number) is required" });
        }

        // Auto-detect base from key if not explicitly set
        const envBase = process.env.REVOLUT_API_BASE;
        const rawKey = process.env.REVOLUT_MERCHANT_API_KEY;
        const apiKey = typeof rawKey === "string" ? rawKey.trim() : rawKey;
        const keyPrefix = apiKey?.slice(0, 12) || "";
        let apiBase = envBase || "https://sandbox-merchant.revolut.com";
        if (!envBase && apiKey) {
            if (apiKey.startsWith("sk_live_")) {
                apiBase = "https://merchant.revolut.com";
            } else if (apiKey.startsWith("sk_sandbox_")) {
                apiBase = "https://sandbox-merchant.revolut.com";
            }
        }

        if (!apiKey) {
            return res.status(500).json({
                message:
                    "Revolut merchant secret key is not configured (REVOLUT_MERCHANT_API_KEY)",
            });
        }

        const revolutApiVersion = process.env.REVOLUT_API_VERSION || "2024-09-01";

        // Optional diagnostics
        if (req.query.debug === "1") {
            return res.status(200).json({
                success: true,
                diagnostics: {
                    apiBase,
                    apiVersion: revolutApiVersion,
                    keySet: !!apiKey,
                    keyEnvPrefix: keyPrefix,
                    envBase,
                    inferredFromKey: !envBase,
                },
            });
        }

        // Build order payload
        const orderPayload = { amount, currency, metadata };
        
        // Add redirect_url if provided (Revolut may support this in some API versions)
        // Note: Check Revolut API documentation for your API version to confirm support
        if (redirect_url) {
            orderPayload.redirect_url = redirect_url;
        }

        const response = await fetch(`${apiBase}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${apiKey}`,
                "Revolut-Api-Version": revolutApiVersion,
            },
            body: JSON.stringify(orderPayload),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const baseHint = apiKey?.startsWith("sk_live_")
                ? "https://merchant.revolut.com"
                : apiKey?.startsWith("sk_sandbox_")
                    ? "https://sandbox-merchant.revolut.com"
                    : undefined;
            const extra = response.status === 401 ? {
                hint:
                    "Authentication failed. Ensure the key matches the environment (live vs sandbox), remove any quotes/spaces, and restart the server.",
                diagnostics: { apiBase, expectedBaseFromKey: baseHint, keyPrefix },
            } : {};
            return res.status(response.status).json({
                message: data?.message || "Failed to create Revolut order",
                error: data,
                ...extra,
            });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Revolut create order error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}


