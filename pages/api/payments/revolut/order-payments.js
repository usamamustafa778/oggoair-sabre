// Retrieve payments for a specific Revolut order

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { orderId } = req.query;

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

        // Retrieve payments for the order from Revolut API
        const response = await fetch(`${apiBase}/api/orders/${orderId}/payments`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${apiKey}`,
                "Revolut-Api-Version": revolutApiVersion,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            return res.status(response.status).json({
                message: data?.message || "Failed to retrieve payments for order",
                error: data,
            });
        }

        return res.status(200).json({
            success: true,
            data,
            orderId
        });
    } catch (error) {
        console.error("Revolut order payments error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}
