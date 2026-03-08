// Handle Revolut webhook notifications for payment events

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const webhookData = req.body;
        const signature = req.headers['revolut-signature'];

        console.log("Revolut Webhook Received:", {
            timestamp: new Date().toISOString(),
            signature: signature,
            eventType: webhookData.type,
            orderId: webhookData.order_id,
            paymentId: webhookData.payment_id
        });

        // Verify webhook signature (implement based on Revolut documentation)
        // const isValidSignature = verifyRevolutSignature(req.body, signature);
        // if (!isValidSignature) {
        //     return res.status(401).json({ message: "Invalid signature" });
        // }

        const { type, order_id, payment_id, data } = webhookData;

        // Handle different webhook event types
        switch (type) {
            case 'OrderCreated':
                console.log(`Order created: ${order_id}`);
                // Handle order creation
                break;

            case 'OrderAuthorised':
                console.log(`Order authorised: ${order_id}`);
                // Handle order authorization
                break;

            case 'OrderCompleted':
                console.log(`Order completed: ${order_id}`);
                // Handle order completion
                // Update your database, send confirmation emails, etc.
                break;

            case 'OrderCancelled':
                console.log(`Order cancelled: ${order_id}`);
                // Handle order cancellation
                break;

            case 'PaymentCreated':
                console.log(`Payment created: ${payment_id} for order: ${order_id}`);
                // Handle payment creation
                break;

            case 'PaymentAuthorised':
                console.log(`Payment authorised: ${payment_id} for order: ${order_id}`);
                // Handle payment authorization
                break;

            case 'PaymentCompleted':
                console.log(`Payment completed: ${payment_id} for order: ${order_id}`);
                // Handle payment completion
                // Update booking status, send confirmation, etc.
                break;

            case 'PaymentFailed':
                console.log(`Payment failed: ${payment_id} for order: ${order_id}`);
                // Handle payment failure
                break;

            case 'PaymentCancelled':
                console.log(`Payment cancelled: ${payment_id} for order: ${order_id}`);
                // Handle payment cancellation
                break;

            default:
                console.log(`Unknown webhook event type: ${type}`);
        }

        // Log webhook data for debugging
        console.log("Webhook Data:", JSON.stringify(webhookData, null, 2));

        // Here you would typically:
        // 1. Update your database with the new status
        // 2. Send notifications to customers
        // 3. Update booking status
        // 4. Trigger other business logic

        return res.status(200).json({
            success: true,
            message: "Webhook processed successfully",
            received: true
        });
    } catch (error) {
        console.error("Revolut webhook error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

// Helper function to verify Revolut webhook signature
// function verifyRevolutSignature(payload, signature) {
//     // Implement signature verification based on Revolut documentation
//     // This is a placeholder - implement according to Revolut's webhook security requirements
//     return true;
// }
