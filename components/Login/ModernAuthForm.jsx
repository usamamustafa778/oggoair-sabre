import React, { useState, useEffect } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { tokenUtils } from "@/config/api";
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
  const [currentStep, setCurrentStep] = useState("options"); // options, email, name, otp
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [showOtp, setShowOtp] = useState(false);

  // User flow tracking
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [userData, setUserData] = useState(null);

  // Reset form when modal closes
  const handleClose = () => {
    setShowAuthModal(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep("options");
    setEmail("");
    setFirstName("");
    setLastName("");
    setOtp(["", "", "", ""]);
    setError("");
    setSuccess("");
    setIsExistingUser(false);
    setUserData(null);
    setShowOtp(false);
    localStorage.removeItem("otpData");
  };

  // Check if OTP has expired
  const isOTPExpired = () => {
    const otpData = localStorage.getItem("otpData");
    if (!otpData) return true;

    try {
      const parsed = JSON.parse(otpData);
      const expiresIn = parsed.expiresIn;
      const timestamp = parsed.timestamp;

      // Parse expiresIn (e.g., "10 minutes")
      const minutes = parseInt(expiresIn.split(" ")[0]);
      const expirationTime = timestamp + minutes * 60 * 1000;

      return Date.now() > expirationTime;
    } catch (error) {
      console.error("Error parsing OTP data:", error);
      return true;
    }
  };

  // Handle OTP input change
  const handleOTPChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP input key events
  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
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

  // Handle Google authentication
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Google auth error:", error);
      setError("Google authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Apple authentication
  const handleAppleAuth = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Apple OAuth implementation would go here
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
    setCurrentStep("email");
    setError("");
  };

  // Handle email submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call register API directly
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        localStorage.setItem(
          "otpData",
          JSON.stringify({
            userData: data.data.user,
            isLogin: data.data.isLogin,
            expiresIn: data.data.expiresIn,
            timestamp: Date.now(),
          })
        );

        if (data.data.isLogin) {
          // Existing user - go directly to OTP
          setIsExistingUser(true);
          setCurrentStep("otp");
          setSuccess(data.message || "OTP sent to your email address");
        } else {
          setCurrentStep("name");
          setSuccess(
            "Please enter your first and last name to complete registration."
          );
        }
      } else {
        if (
          data.message === "First name and last name are required for new users"
        ) {
          setCurrentStep("name");
          setSuccess(
            "Please enter your first and last name to complete registration."
          );
        } else {
          setError(data.message || "Failed to register email");
        }
      }
    } catch (error) {
      console.error("Email submission error:", error);
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
      // Call register API with firstName and lastName
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

    try {
      // Call verify OTP API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/users/signup/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            otp: otpString,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        // Store authentication data using the new structure
        if (data.data) {
          // Store complete authentication data
          tokenUtils.setAuthData({
            user: data.data.user,
            token: data.data.token,
            refreshToken: data.data.refreshToken,
          });
        }

        localStorage.removeItem("otpData");

        setSuccess(
          isExistingUser ? "Login successful!" : "Registration successful!"
        );

        // Close modal and trigger success callback
        setTimeout(() => {
          handleClose();
          if (onAuthSuccess) {
            onAuthSuccess();
          }
        }, 1000);
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
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
      case "otp":
        setCurrentStep(isExistingUser ? "email" : "name");
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

  // Check for existing OTP data on component mount
  useEffect(() => {
    const otpData = localStorage.getItem("otpData");
    if (otpData && !isOTPExpired()) {
      try {
        const parsed = JSON.parse(otpData);
        setEmail(parsed.email);
        setIsExistingUser(parsed.isLogin);
        setCurrentStep("otp");
        setSuccess("Please enter the OTP sent to your email");
      } catch (error) {
        console.error("Error parsing stored OTP data:", error);
        localStorage.removeItem("otpData");
      }
    }
  }, []);

  // Handle body scroll when modal is open
  useEffect(() => {
    document.body.classList.add("overflow-hidden", "h-screen");
    return () => document.body.classList.remove("overflow-hidden", "h-screen");
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case "options":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to OggoTrip
              </h2>
              <p className="text-gray-600">
                Choose your preferred sign-in method
              </p>
            </div>

            <div className="space-y-3">
              {/* Google Auth */}
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center cursor-pointer gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
                <span className="font-medium text-gray-700">
                  Continue with Google
                </span>
              </button>

              {/* Apple Auth */}
              <button
                onClick={handleAppleAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center cursor-pointer gap-3 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
                <span className="font-medium">Continue with Apple</span>
              </button>

              {/* Email Auth */}
              <button
                onClick={handleEmailAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center cursor-pointer gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">
                  Continue with Email
                </span>
              </button>
            </div>
          </div>
        );

      case "email":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Enter your email
              </h2>
              <p className="text-gray-600">
                We'll send you a verification code
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
                    Sending...
                  </>
                ) : (
                  "Continue"
                )}
              </button>
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
                Check your email
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
                      // Prepare payload with email and names if available
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
                        // Update OTP data in localStorage
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
        {/* Close button (top-right, like oggo-air) */}
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
                <img
                  src="/image.png"
                  alt="oggoair"
                  className="w-full h-[250px] object-contain"
                />
              </div>
              <h2 className="text-3xl font-semibold text-center text-primary-text mb-3">
                Unlock the Best of oggotrip
              </h2>
              <p className="text-sm text-primary-text text-center leading-relaxed mt-4">
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
                alt="OggoAir"
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

            {/* Dynamic step content (buttons, email form, OTP, etc.) */}
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAuthForm;
