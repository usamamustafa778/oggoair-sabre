export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { origin } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Booking ID is required' });
  }

  try {
    // Mock payment links data - in a real implementation, this would come from your payment gateway
    const paymentLinks = [
      {
        bank: "paystack",
        link: `${origin}/api/payment/paystack/${id}`,
        description: "Pay with Paystack"
      },
      {
        bank: "stripe",
        link: `${origin}/api/payment/stripe/${id}`,
        description: "Pay with Stripe"
      },
      {
        bank: "paypal",
        link: `${origin}/api/payment/paypal/${id}`,
        description: "Pay with PayPal"
      },
      {
        bank: "gtpay",
        link: `${origin}/api/payment/gtpay/${id}`,
        description: "Pay with GTPay"
      },
      {
        bank: "calpay",
        link: `${origin}/api/payment/calpay/${id}`,
        description: "Pay with CalPay"
      },
      {
        bank: "myghpay",
        link: `${origin}/api/payment/myghpay/${id}`,
        description: "Pay with MyGHPay"
      },
      {
        bank: "theteller",
        link: `${origin}/api/payment/theteller/${id}`,
        description: "Pay with TheTeller"
      },
      {
        bank: "hubtel",
        link: `${origin}/api/payment/hubtel/${id}`,
        description: "Pay with Hubtel"
      }
    ];


    res.status(200).json({
      success: true,
      data: paymentLinks
    });
  } catch (error) {
    console.error('Error generating payment links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payment links'
    });
  }
} 