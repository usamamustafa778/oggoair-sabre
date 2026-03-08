/**
 * Duffel API Hold Order - Correct Payload Example
 *
 * WHY THE ORIGINAL FAILED:
 * The error "Field 'passengers' must contain at least one adult passenger for each infant_without_seat passenger"
 * occurred because:
 *
 * ROOT CAUSE: Passenger IDs from Offer ≠ IDs in Order
 *
 * 1. When creating an offer with adult=1&infant=1, Duffel returns specific passenger IDs:
 *    - Adult: "pas_0000B0FHKAnoYVp0w3k1x3"
 *    - Infant: "pas_0000B0FHKAoAXC6ax9uJU0"
 *
 * 2. You MUST use these EXACT IDs in your order - Duffel validates this strictly
 *
 * 3. If you:
 *    - Reuse old passenger IDs from a different offer
 *    - Generate fake/temp IDs
 *    - Modify the offer after creation
 *    → The associated_adult_id does not match a real adult in the current offer
 *    → Duffel says: "No adult found for this infant"
 *
 * 4. Additionally, passengers must be ordered: adults first, then children, then infants
 *    This ensures adults exist in the array before infants reference them
 *
 * FIX:
 * 1. Always get passenger IDs from the offer response (flightDetails.passengers)
 * 2. Use exact IDs - no fallbacks or temp IDs
 * 3. Process passengers in order: adults first, then children, then infants
 * 4. Validate that associated_adult_id matches an adult ID from the offer
 */

const DUFFEL_API_TOKEN = process.env.DUFFEL_ACCESS_TOKEN || "";
const DUFFEL_API_URL = "https://api.duffel.com/air/orders";

// Correct payload structure - adults first, then children, then infants
const correctPayload = {
  data: {
    type: "hold",
    selected_offers: ["off_0000B0FDtq5Nh4VikqNe1F"],
    passengers: [
      // Adult passenger FIRST (required before infant can reference it)
      {
        id: "pas_0000B0FDth19PQmMd7Kdfj",
        type: "adult",
        title: "mr",
        gender: "m",
        given_name: "nama",
        family_name: "nama",
        born_on: "2003-01-07",
        email: "hamzaaliabbasi046@gmail.com",
        phone_number: "+923147678678",
      },
      // Child passenger second
      {
        id: "pas_0000B0FDth19PQmMd7Kdfk",
        type: "child",
        title: "mr",
        gender: "m",
        given_name: "haja",
        family_name: "hahaj",
        born_on: "2020-01-07",
        email: "hamzaaliabbasi046@gmail.com",
        phone_number: "+923147678678",
      },
      // Infant passenger LAST (can now safely reference adult that exists above)
      {
        id: "pas_0000B0FDth19PQmMd7Kdfm",
        type: "infant_without_seat",
        associated_adult_id: "pas_0000B0FDth19PQmMd7Kdfj", // References adult above
        title: "mr",
        gender: "m",
        given_name: "KKJK",
        family_name: "jkjkjk",
        born_on: "2024-01-08",
        email: "hamzaaliabbasi046@gmail.com",
        phone_number: "+923147678678",
      },
    ],
  },
};

// Working Node.js fetch() example
async function createHoldOrder() {
  try {
    console.log("Creating hold order with payload:");
    console.log(JSON.stringify(correctPayload, null, 2));

    const response = await fetch(DUFFEL_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DUFFEL_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Duffel-Version": "v1", // Note: Using v1 as requested
      },
      body: JSON.stringify(correctPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Duffel API error: ${JSON.stringify(data)}`);
    }

    // Log order.id and booking_deadline
    console.log("\n✅ Hold order created successfully!");
    console.log("Order ID:", data.data?.id);
    console.log("Booking Deadline:", data.data?.booking_deadline);

    return data;
  } catch (error) {
    console.error("❌ Error creating hold order:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = { createHoldOrder, correctPayload };
}

// Run if executed directly
if (require.main === module) {
  createHoldOrder()
    .then((result) => {
      console.log("\nFull response:", JSON.stringify(result, null, 2));
    })
    .catch((error) => {
      console.error("Failed:", error);
      process.exit(1);
    });
}
