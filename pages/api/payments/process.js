export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { bookingId, paymentMethod, protection, amount } = req.body;

  if (!bookingId || !paymentMethod || !amount) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: bookingId, paymentMethod, amount' 
    });
  }

  try {
    // Simulate payment processing
    // In a real implementation, this would integrate with payment gateways
    const isSuccess = Math.random() > 0.1; // 90% success rate for testing

    if (isSuccess) {
      // Simulate successful payment
      const paymentResult = {
        success: true,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        currency: 'USD',
        paymentMethod: paymentMethod,
        protection: protection,
        status: 'completed',
        timestamp: new Date().toISOString(),
        bookingId: bookingId
      };

      return res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        data: paymentResult
      });
    } else {
      // Simulate payment failure
      return res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.',
        error: 'INSUFFICIENT_FUNDS'
      });
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during payment processing',
      error: error.message
    });
  }
} 