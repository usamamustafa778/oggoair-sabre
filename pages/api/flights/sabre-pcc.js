/**
 * API endpoint to get Sabre PCC (PseudoCityCode)
 * Returns PCC from environment variable (server-side only)
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const PCC = process.env.SABRE_PCC?.trim();
    
    if (!PCC) {
      return res.status(500).json({
        success: false,
        message: "SABRE_PCC environment variable is not set",
      });
    }

    return res.status(200).json({
      success: true,
      pcc: PCC,
    });
  } catch (error) {
    console.error("Sabre PCC Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get Sabre PCC",
      error: error.message,
    });
  }
}

