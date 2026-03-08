import axios from "axios";
import { APILINK } from "../../../config/api";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const response = await axios.post(`${APILINK}/api/users/verify`, {
      email,
      verificationCode,
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Verification failed",
    });
  }
} 