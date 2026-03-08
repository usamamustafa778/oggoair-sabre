import axios from "axios";
import { APILINK } from "../../../config/api";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const response = await axios.post(`${APILINK}/api/users/forget-password`, {
      email,
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Failed to send reset email",
    });
  }
} 