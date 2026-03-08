import axios from "axios";
import { BACKEND_API_URL } from "../../../config/api";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get authorization token from headers
    const authToken =
      req.headers.authorization?.replace("Bearer ", "") ||
      req.headers.authorization?.replace("bearer ", "");

    if (!authToken) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required",
      });
    }

    // Call the backend API
    const response = await axios.get(
      `${BACKEND_API_URL}/api/bookings/my-bookings`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("My bookings API error:", error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Failed to fetch bookings",
      error: error.response?.data || error.message,
    });
  }
}
