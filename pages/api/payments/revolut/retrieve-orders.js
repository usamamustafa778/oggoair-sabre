// Retrieve list of Revolut orders with filtering and pagination

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const {
            from_created_date,
            to_created_date,
            customer_id,
            email,
            merchant_order_ext_ref,
            state,
            limit = 50,
            created_before
        } = req.query;

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

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (from_created_date) queryParams.append('from_created_date', from_created_date);
        if (to_created_date) queryParams.append('to_created_date', to_created_date);
        if (customer_id) queryParams.append('customer_id', customer_id);
        if (email) queryParams.append('email', email);
        if (merchant_order_ext_ref) queryParams.append('merchant_order_ext_ref', merchant_order_ext_ref);
        if (state) queryParams.append('state', state);
        if (limit) queryParams.append('limit', limit);
        if (created_before) queryParams.append('created_before', created_before);

        const queryString = queryParams.toString();
        const url = `${apiBase}/api/orders${queryString ? `?${queryString}` : ''}`;

        // Retrieve orders from Revolut API
        const response = await fetch(url, {
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
                message: data?.message || "Failed to retrieve Revolut orders",
                error: data,
            });
        }

        return res.status(200).json({
            success: true,
            data,
            filters: {
                from_created_date,
                to_created_date,
                customer_id,
                email,
                merchant_order_ext_ref,
                state,
                limit,
                created_before
            }
        });
    } catch (error) {
        console.error("Revolut retrieve orders error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}
