// Capture an authorized Revolut order

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { orderId, amount } = req.body;

        if (!orderId) {
            return res.status(400).json({
                message: "orderId is required"
            });
        }

        // Auto-detect base from key if not explicitly set
        const envBase = process.env.REVOLUT_API_BASE;
        const rawKey = process.env.REVOLUT_MERCHANT_API_KEY;
        const apiKey = typeof rawKey === "string" ? rawKey.trim() : rawKey;
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
                message: "Revolut merchant secret key is not configured (REVOLUT_MERCHANT_API_KEY)",
            });
        }

        const revolutApiVersion = process.env.REVOLUT_API_VERSION || "2024-09-01";

        // Prepare capture payload
        const capturePayload = {};
        if (amount) {
            capturePayload.amount = amount;
        }

        // Capture the order via Revolut API
        const response = await fetch(`${apiBase}/api/orders/${orderId}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${apiKey}`,
                "Revolut-Api-Version": revolutApiVersion,
            },
            body: JSON.stringify(capturePayload),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            return res.status(response.status).json({
                message: data?.message || "Failed to capture Revolut order",
                error: data,
            });
        }

        return res.status(200).json({
            success: true,
            data,
            orderId,
            captured: true
        });
    } catch (error) {
        console.error("Revolut capture order error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}
