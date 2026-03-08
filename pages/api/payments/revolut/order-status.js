// Check order status and completion for Revolut orders

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

        // Get order details and payments
        const [orderResponse, paymentsResponse] = await Promise.all([
            fetch(`${apiBase}/api/orders/${orderId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${apiKey}`,
                    "Revolut-Api-Version": revolutApiVersion,
                },
            }),
            fetch(`${apiBase}/api/orders/${orderId}/payments`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${apiKey}`,
                    "Revolut-Api-Version": revolutApiVersion,
                },
            })
        ]);

        const orderData = await orderResponse.json().catch(() => ({}));
        const paymentsData = await paymentsResponse.json().catch(() => ({}));

        if (!orderResponse.ok) {
            return res.status(orderResponse.status).json({
                message: orderData?.message || "Failed to retrieve order status",
                error: orderData,
            });
        }

        // Determine order status and completion
        const order = orderData;
        const payments = paymentsData.data || [];

        const status = {
            orderId,
            state: order.state,
            type: order.type,
            amount: order.amount,
            currency: order.currency,
            created_at: order.created_at,
            updated_at: order.updated_at,
            metadata: order.metadata,
            payments: payments,
            isCompleted: order.state === 'COMPLETED',
            isAuthorized: order.state === 'AUTHORISED',
            isProcessing: order.state === 'PROCESSING',
            isFailed: order.state === 'FAILED',
            isCancelled: order.state === 'CANCELLED',
            hasPayments: payments.length > 0,
            successfulPayments: payments.filter(p => p.state === 'COMPLETED'),
            failedPayments: payments.filter(p => p.state === 'FAILED')
        };

        return res.status(200).json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error("Revolut order status error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}
