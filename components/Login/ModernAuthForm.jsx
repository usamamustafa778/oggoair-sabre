import React, { useState, useEffect } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { tokenUtils } from "@/config/api";
import authService from "@/services/authService";
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

const ModernAuthForm = ({ setShowAuthModal, onAuthSuccess }) => {
  // Main flow states
  const [currentStep, setCurrentStep] = useState("options"); // options, email, password, otp, setPassword, name
  const [authMode, setAuthMode] = useState("signin"); // signin | forgot
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [showOtp, setShowOtp] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // User flow tracking
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [otpFlow, setOtpFlow] = useState(null); // "newUser" | "legacySetPassword" | "forgotPassword"
  const [userData, setUserData] = useState(null);

  // Reset form when modal closes
  const handleClose = () => {
    setShowAuthModal(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep("options");
    setAuthMode("signin");
    setEmail("");
    setFirstName("");
    setLastName("");
    setOtp(["", "", "", ""]);
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setIsExistingUser(false);
    setHasPassword(false);
    setOtpFlow(null);
    setUserData(null);
    setShowOtp(false);
    localStorage.removeItem("otpData");
  };

  // Handle OTP input change
  const handleOTPChange = (index, value) => {
    const digit = value.replace(/\D/g, "");
    if (digit.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP input key events
  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      if (otp[index]) {
        // Clear current digit first
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous input when current is already empty
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
      }
      return;
    }

    // Prevent non-digit character input
    if (
      e.key.length === 1 &&
      !/[0-9]/.test(e.key) &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      e.preventDefault();
    }
  };

  // Handle OTP paste
  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    const newOtp = ["", "", "", ""];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus the last filled input or the first empty one
    const focusIndex = Math.min(pastedData.length, 3);
    const nextInput = document.getElementById(`otp-${focusIndex}`);
    if (nextInput) nextInput.focus();
  };

  // Google auth: reuse existing NextAuth flow for Sabre
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      console.error("Google auth error:", err);
      setError("Google Sign-In failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Apple authentication placeholder
  const handleAppleAuth = async () => {
    setIsLoading(true);
    setError("");
    try {
      setError("Apple authentication is not yet available.");
    } catch (error) {
      console.error("Apple auth error:", error);
      setError("Apple authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email authentication flow
  const handleEmailAuth = () => {
    setAuthMode("signin");
    setCurrentStep("email");
    setError("");
    setSuccess("");
  };

  // Handle email submission (decide existing/new + password/OTP flow)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1) Check email to determine flow
      const checkResult = await authService.checkEmail(email.trim());

      if (!checkResult.success) {
        setError(checkResult.error || "Failed to check email. Please try again.");
        return;
      }

      const exists =
        typeof checkResult.exists === "boolean"
          ? checkResult.exists
          : !!checkResult?.data?.exists ||
            !!checkResult?.data?.accountExists;

      // Backend may provide hasPassword; if missing but account exists,
      // assume password-based account and let login API correct us.
      const backendHasPassword =
        checkResult?.data?.hasPassword !== undefined
          ? checkResult.data.hasPassword
          : exists;

      setIsExistingUser(exists);
      setHasPassword(backendHasPassword);

      // SIGN-IN FLOW
      if (authMode === "signin") {
        if (!exists) {
          // New user: collect name first, then send OTP using register API
          setOtpFlow("newUser");
          setCurrentStep("name");
          setSuccess(
            "Please enter your first and last name to continue with verification."
          );
        } else if (exists && backendHasPassword) {
          // Existing user with password: go to password login
          setCurrentStep("password");
        } else {
          // Legacy user without password: OTP login then force set password
          const otpResult = await authService.sendOTP(email.trim());

          if (!otpResult.success) {
            setError(otpResult.error || "Failed to send verification code.");
            return;
          }

          setOtp(["", "", "", ""]);
          setOtpFlow("legacySetPassword");
          setCurrentStep("otp");
          setSuccess(
            otpResult.message ||
              "OTP sent to your email. Verify to set your password."
          );
        }
      } else {
        // FORGOT PASSWORD FLOW
        if (!exists || !backendHasPassword) {
          setError(
            "We couldn't find an existing account with a password for this email."
          );
          return;
        }

        const otpResult = await authService.sendOTP(email.trim());

        if (!otpResult.success) {
          setError(otpResult.error || "Failed to send verification code.");
          return;
        }

        setOtp(["", "", "", ""]);
        setOtpFlow("forgotPassword");
        setCurrentStep("otp");
        setSuccess(
          otpResult.message ||
            "OTP sent to your email. Verify to reset your password."
        );
      }
    } catch (error) {
      console.error("Email submission error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password login for existing users with password
  const handlePasswordLoginSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success" && data.data) {
        tokenUtils.setAuthData({
          user: data.data.user,
          token: data.data.token,
          refreshToken: data.data.refreshToken,
        });

        setSuccess("Login successful!");

        setTimeout(() => {
          handleClose();
          if (onAuthSuccess) {
            onAuthSuccess();
          }
        }, 800);
      } else if (
        data?.message &&
        data.message
          .toLowerCase()
          .includes("does not have a password set")
      ) {
        // Legacy user discovered at login time: fall back to OTP + force set password
        try {
          const otpResult = await authService.sendOTP(email.trim());

          if (!otpResult.success) {
            setError(
              otpResult.error || "Failed to send verification code. Please try OTP login."
            );
            return;
          }

          setOtp(["", "", "", ""]);
          setOtpFlow("legacySetPassword");
          setCurrentStep("otp");
          setSuccess(
            otpResult.message ||
              "This account uses OTP login. Enter the code we sent to your email."
          );
        } catch (otpError) {
          console.error("Fallback OTP login error:", otpError);
          setError("Failed to switch to OTP login. Please try again.");
        }
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Password login error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle name submission for new users
  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setError("Please enter your first name");
      return;
    }
    if (!lastName.trim()) {
      setError("Please enter your last name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call existing register API with firstName and lastName (sends OTP)
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API || "http://localhost:5000"
        }/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        // Store OTP data in localStorage
        localStorage.setItem(
          "otpData",
          JSON.stringify({
            email: data.data.email,
            isLogin: data.data.isLogin,
            expiresIn: data.data.expiresIn,
            timestamp: Date.now(),
          })
        );

        // Registration successful - go to OTP step
        setUserData({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email,
        });
        setOtp(["", "", "", ""]);
        setOtpFlow("newUser");
        setCurrentStep("otp");
        setSuccess(data.message || "OTP sent to your email address");
      } else {
        setError(data.message || "Failed to register user");
      }
    } catch (error) {
      console.error("Name submission error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 4) {
      setError("Please enter the complete 4-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // All OTP verification uses existing /api/users/signup/verify-otp API
      const result = await authService.verifyOTP(email.trim(), otpString);

      if (!result.success) {
        setError(result.error || "Invalid code. Please try again.");
        return;
      }

      if (result.token || result.user) {
        tokenUtils.setAuthData({
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
        });
      }

      if (
        otpFlow === "newUser" ||
        otpFlow === "legacySetPassword" ||
        otpFlow === "forgotPassword"
      ) {
        setSuccess(
          otpFlow === "forgotPassword"
            ? "Code verified. Set a new password to continue."
            : "Code verified. Set a password to continue."
        );
        setCurrentStep("setPassword");
      } else {
        // Simple OTP login without password setting
        setSuccess("Login successful!");
        setTimeout(() => {
          handleClose();
          if (onAuthSuccess) {
            onAuthSuccess();
          }
        }, 800);
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle setting or resetting password after OTP flows
  const handleSetPasswordSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please enter and confirm your password");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setError("Passwords do not match");
      return;
    }

    const token = tokenUtils.getToken();

    if (!token) {
      setError("Authentication error. Please restart the login process.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      let endpoint = "";
      let body = {};

      if (otpFlow === "forgotPassword") {
        // User already has a password; update it via change-password
        endpoint = `${process.env.NEXT_PUBLIC_API}/api/users/change-password`;
        body = {
          newPassword: password.trim(),
        };
      } else {
        // New users or legacy users without password: set-password
        endpoint = `${process.env.NEXT_PUBLIC_API}/api/users/set-password`;
        body = {
          password: password.trim(),
        };
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // If set-password says "Password already set", gracefully fall back to change-password
      if (
        !response.ok &&
        data?.message &&
        data.message
          .toLowerCase()
          .includes("password already set")
      ) {
        const fallbackResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/users/change-password`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              newPassword: password.trim(),
            }),
          }
        );

        const fallbackData = await fallbackResponse.json();

        if (fallbackResponse.ok && fallbackData.status === "success") {
          setSuccess("Password updated. You're now logged in.");

          setTimeout(() => {
            handleClose();
            if (onAuthSuccess) {
              onAuthSuccess();
            }
          }, 800);
          return;
        }

        setError(
          fallbackData.message ||
            "Failed to update password. Please try again or restart the flow."
        );
        return;
      }

      if (response.ok && data.status === "success") {
        setSuccess(
          otpFlow === "forgotPassword"
            ? "Password updated. You're now logged in."
            : "Password set successfully. You're now logged in."
        );

        setTimeout(() => {
          handleClose();
          if (onAuthSuccess) {
            onAuthSuccess();
          }
        }, 800);
      } else {
        setError(
          data.message ||
            "Failed to set password. Please try again or restart the flow."
        );
      }
    } catch (error) {
      console.error("Set password error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    switch (currentStep) {
      case "email":
        setCurrentStep("options");
        break;
      case "name":
        setCurrentStep("email");
        break;
      case "password":
        setCurrentStep("email");
        setPassword("");
        break;
      case "otp":
        if (otpFlow === "newUser") {
          setCurrentStep("email");
        } else if (otpFlow === "legacySetPassword" || otpFlow === "forgotPassword") {
          setCurrentStep("email");
        } else {
          setCurrentStep(isExistingUser ? "email" : "name");
        }
        break;
      case "setPassword":
        if (otpFlow) {
          setCurrentStep("otp");
        } else {
          setCurrentStep("email");
        }
        break;
      default:
        setCurrentStep("options");
    }
    setError("");
    setSuccess("");
  };

  // Auto-focus OTP input when step changes
  useEffect(() => {
    if (currentStep === "otp") {
      const otpInput = document.getElementById("otp-0");
      if (otpInput) {
        setTimeout(() => otpInput.focus(), 100);
      }
    }
  }, [currentStep]);

  // Handle body scroll when modal is open
  useEffect(() => {
    document.body.classList.add("overflow-hidden", "h-screen");
    return () => document.body.classList.remove("overflow-hidden", "h-screen");
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case "options":
        return (
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              {/* Email first */}
              <button
                onClick={handleEmailAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-between cursor-pointer gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-800">
                    Connect with Email
                  </span>
                </div>
              </button>

              {/* Apple */}
              <button
                onClick={handleAppleAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-between cursor-pointer gap-3 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Image
                      src="/st-images/apple.png"
                      alt="Apple"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  )}
                  <span className="font-medium">Connect with Apple</span>
                </div>
              </button>

              {/* Google */}
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-between cursor-pointer gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Image
                      src="/st-images/google.png"
                      alt="Google"
                      width={20}
                      height={20}
                      className="w-5 h-5"
                    />
                  )}
                  <span className="font-medium text-gray-800">
                    Connect with Google
                  </span>
                </div>
              </button>
            </div>
          </div>
        );

      case "email":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {authMode === "forgot" ? "Reset your password" : "Enter your email"}
              </h2>
              <p className="text-gray-600">
                {authMode === "forgot"
                  ? "Enter your email to receive a reset code"
                  : "We'll send you a verification code"}
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-green text-primary-text cursor-pointer py-3 rounded-lg font-medium hover:bg-primary-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {authMode === "forgot" ? "Sending code..." : "Sending..."}
                  </>
                ) : (
                  authMode === "forgot" ? "Send reset code" : "Continue"
                )}
              </button>
            </form>
          </div>
        );

      case "password":
        return (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                Sign In
              </h2>
            </div>

            <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
              {/* Email field (pre-filled from previous step) */}
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-colors"
                  required
                />
              </div>

              {/* Password field */}
              <div>
                <label
                  htmlFor="signin-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D4FF5A] text-primary-text cursor-pointer py-3 rounded-lg font-semibold hover:bg-[#c4f24f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Continue"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("forgot");
                    setCurrentStep("email");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </form>
          </div>
        );

      case "name":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                What's your name?
              </h2>
              <p className="text-gray-600">
                We'll use this to personalize your experience
              </p>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-green text-primary-text cursor-pointer py-3 rounded-lg font-medium hover:bg-primary-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          </div>
        );

      case "otp":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {authMode === "forgot"
                  ? "Check your email to reset"
                  : "Check your email"}
              </h2>
              <p className="text-gray-600">
                We sent a 4-digit code to{" "}
                <span className="font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Enter verification code
                </label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type={showOtp ? "text" : "password"}
                      value={digit}
                      onChange={(e) =>
                        handleOTPChange(
                          index,
                          e.target.value.replace(/\D/g, "")
                        )
                      }
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      onPaste={index === 0 ? handleOTPPaste : undefined}
                      className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green outline-none transition-all duration-200 bg-white"
                      maxLength={1}
                      required
                    />
                  ))}
                </div>
                <div className="flex justify-center mt-3">
                  <button
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showOtp ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Hide code
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        Show code
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.join("").length !== 4}
                className="w-full bg-primary-green text-primary-text py-3 rounded-lg font-medium hover:bg-primary-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : otpFlow === "forgotPassword" ? (
                  "Verify & Continue"
                ) : otpFlow === "newUser" ? (
                  "Verify & Continue"
                ) : otpFlow === "legacySetPassword" ? (
                  "Verify & Continue"
                ) : isExistingUser ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    setError("");

                    try {
                      // Prepare payload with email and names if available (for new users)
                      const payload = { email: email.trim() };
                      if (userData?.firstName && userData?.lastName) {
                        payload.firstName = userData.firstName;
                        payload.lastName = userData.lastName;
                      }

                      const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API}/api/users/register`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(payload),
                        }
                      );

                      const data = await response.json();

                      if (response.ok && data.status === "success") {
                        localStorage.setItem(
                          "otpData",
                          JSON.stringify({
                            email: data.data.email,
                            isLogin: data.data.isLogin,
                            expiresIn: data.data.expiresIn,
                            timestamp: Date.now(),
                          })
                        );
                        setSuccess(data.message || "New code sent!");
                      } else {
                        setError(data.message || "Failed to resend code");
                      }
                    } catch (error) {
                      console.error("Resend OTP error:", error);
                      setError("Network error. Please try again.");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="text-sm text-primary-text"
                >
                  Didn't receive the code?{" "}
                  <span className="text-underline font-medium cursor-pointer">
                    Resend
                  </span>
                </button>
              </div>
            </form>
          </div>
        );

      case "setPassword":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {authMode === "forgot"
                  ? "Set a new password"
                  : "Create your password"}
              </h2>
              <p className="text-gray-600">
                {authMode === "forgot"
                  ? "Choose a strong password you haven't used before."
                  : "Use this password for future logins with your email."}
              </p>
            </div>

            <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-green text-primary-text cursor-pointer py-3 rounded-lg font-medium hover:bg-primary-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save password"
                )}
              </button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white shadow-2xl w-full max-w-4xl mx-auto relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-primary-text hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left promotional panel (desktop) */}
          <div className="hidden md:flex md:w-1/2 bg-[#F8FBFF] border-r border-gray-100 px-10 py-10">
            <div className="flex flex-col justify-center">
              <div>
                <img src="/image.png" alt="oggoair" className="w-full h-[250px]  object-contain" />
              </div>

              <h2 className="text-3xl font-semibold text-center text-primary-text mb-3">
                Unlock the Best of oggotrip
              </h2>
              <p className="text-sm text-primary-text text-centerleading-relaxed mt-4">
                Sign up for quick, seamless booking, fast refunds, and exclusive
                discounts via our referral program.
              </p>
            </div>
          </div>

          {/* Right auth / signup content */}
          <div className="w-full md:w-1/2 px-6 sm:px-8 py-8">
            {/* Back button appears only for inner steps, not on options */}
            {currentStep !== "options" && (
              <button
                onClick={handleBack}
                className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {/* Logo at top of right column */}
            <div className="mb-6 flex justify-center md:justify-center">
              <Image
                src="/logo.png"
                alt="OggoTrip"
                width={160}
                height={160}
                className="h-12 w-auto md:h-20"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {/* Dynamic step content */}
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAuthForm;

