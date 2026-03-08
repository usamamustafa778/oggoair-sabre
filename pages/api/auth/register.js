import axios from "axios";
import { APILINK } from "../../../config/api";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const response = await axios.post(`${APILINK}/api/users/register`, {
      email,
      password,
      name,
    });

    res.status(200).json({
      success: true,
      message: "Registration successful. Verification required.",
      data: response.data,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Registration failed",
    });
  }
} 