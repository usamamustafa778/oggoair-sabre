// services/authService.js
import { BACKEND_API_URL } from "@/config/api";

class AuthService {
  /**
   * Check if email exists in the system
   * @param {string} email - User's email address
   * @returns {Promise<{success: boolean, exists: boolean, data?: any}>}
   */
  async checkEmail(email) {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          exists: data.exists || false,
          data: data,
        };
      } else {
        return {
          success: false,
          exists: false,
          error: data.message || "Failed to check email",
        };
      }
    } catch (error) {
      console.error("Error checking email:", error);
      return {
        success: false,
        exists: false,
        error: "Network error. Please try again.",
      };
    }
  }

  /**
   * Send OTP to user's email
   * @param {string} email - User's email address
   * @returns {Promise<{success: boolean, message?: string, error?: string}>}
   */
  async sendOTP(email) {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || "OTP sent successfully",
        };
      } else {
        return {
          success: false,
          error: data.message || "Failed to send OTP",
        };
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  }

  /**
   * Verify OTP for login
   * @param {string} email - User's email address
   * @param {string} otp - OTP code
   * @returns {Promise<{success: boolean, token?: string, user?: any, error?: string}>}
   */
  async verifyOTP(email, otp) {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          token: data.token,
          user: data.user,
          message: data.message || "Login successful",
        };
      } else {
        return {
          success: false,
          error: data.message || "Invalid OTP",
        };
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  }

  /**
   * Register new user with OTP verification
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's full name
   * @param {string} userData.email - User's email address
   * @param {string} otp - OTP code
   * @returns {Promise<{success: boolean, token?: string, user?: any, error?: string}>}
   */
  async register(userData, otp) {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          token: data.token,
          user: data.user,
          message: data.message || "Registration successful",
        };
      } else {
        return {
          success: false,
          error: data.message || "Registration failed",
        };
      }
    } catch (error) {
      console.error("Error registering user:", error);
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  }

  /**
   * Google OAuth login
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async googleLogin() {
    try {
      // This would typically redirect to Google OAuth
      // For now, we'll return a placeholder response
      return {
        success: false,
        error: "Google OAuth not implemented yet",
      };
    } catch (error) {
      console.error("Error with Google login:", error);
      return {
        success: false,
        error: "Google login failed",
      };
    }
  }

  /**
   * Apple OAuth login
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async appleLogin() {
    try {
      // This would typically redirect to Apple OAuth
      // For now, we'll return a placeholder response
      return {
        success: false,
        error: "Apple OAuth not implemented yet",
      };
    } catch (error) {
      console.error("Error with Apple login:", error);
      return {
        success: false,
        error: "Apple login failed",
      };
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
export default authService;
