// services/authService.js (Oggo-Air style, reused for Sabre)
import { BACKEND_API_URL } from "@/config/api";

class AuthService {
  /**
   * Check if email exists in the system
   * @param {string} email - User's email address
   * @returns {Promise<{success: boolean, exists: boolean, data?: any}>}
   */
  async checkEmail(email) {
    try {
      // Backend route is mounted under /api/users
      const response = await fetch(
        `${BACKEND_API_URL}/api/users/auth/check-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Support both { exists } and { accountExists, hasPassword }
        const exists =
          typeof data.exists === "boolean"
            ? data.exists
            : !!data.accountExists;

        return {
          success: true,
          exists,
          data,
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
   * Uses unified /api/users/register endpoint.
   * For existing users, only email is required.
   * For new users, firstName/lastName can be passed via extraData.
   */
  async sendOTP(email, extraData = {}) {
    try {
      const response = await fetch(`${BACKEND_API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          ...extraData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || "OTP sent successfully",
          data,
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
   * Verify OTP for login / registration
   * @param {string} email - User's email address
   * @param {string} otp - OTP code
   */
  async verifyOTP(email, otp) {
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/users/signup/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        return {
          success: true,
          token: data.data?.token,
          user: data.data?.user,
          refreshToken: data.data?.refreshToken,
          message: data.message || "Login successful",
          data,
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
   * Convenience wrapper kept for compatibility
   */
  async register(userData, otp) {
    try {
      const verification = await this.verifyOTP(userData.email, otp);

      if (verification.success) {
        return verification;
      }

      return {
        success: false,
        error: verification.error || "Registration failed",
      };
    } catch (error) {
      console.error("Error registering user:", error);
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  }

  /**
   * Google OAuth login - backend handles token issuance
   */
  async googleLogin(accessToken) {
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/users/auth/login/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accessToken }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        return {
          success: true,
          data: data.data,
        };
      } else {
        return {
          success: false,
          error: data.message || "Google login failed",
        };
      }
    } catch (error) {
      console.error("Error with Google login:", error);
      return {
        success: false,
        error: "Could not sign in with Google. Please try again.",
      };
    }
  }

  /**
   * Apple OAuth login placeholder
   */
  async appleLogin() {
    try {
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

