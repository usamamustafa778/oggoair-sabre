import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { tokenUtils, BACKEND_API_URL } from "@/config/api";
import { DivideCircleIcon } from "lucide-react";
import Image from "next/image";

export default function EmailVerification({
  setShowAuthModal,
  signupUserEmail,
  signupUserData,
  onAuthSuccess,
}) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [email, setEmail] = useState("");
  const [codeResentClicked, setCodeResentClicked] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    console.log(
      "EmailVerification component mounted with email:",
      signupUserEmail
    );
    console.log("BACKEND_API_URL:", BACKEND_API_URL);
    setEmail(signupUserEmail);
    // Focus first input
    setTimeout(() => {
      if (inputRefs[0]?.current) {
        inputRefs[0].current.focus();
      }
    }, 100);
  }, [signupUserEmail]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCodeResentClicked(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "");
    if (digit.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = text.replace(/\D/g, "").slice(0, 4);
      const newOtp = [...otp];
      for (let i = 0; i < digits.length && i < 4; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      if (digits.length > 0 && digits.length <= 4) {
        inputRefs[Math.min(digits.length - 1, 3)]?.current?.focus();
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleVerify = async () => {
    const verificationCode = otp.join("");
    console.log("🔍 handleVerify called");
    console.log("Email:", email);
    console.log("Verification Code:", verificationCode);
    console.log("Code Length:", verificationCode.length);

    if (!verificationCode || !email) {
      console.log("❌ Missing code or email");
      toast.error("Please enter the verification code");
      return;
    }

    if (verificationCode.length !== 4) {
      console.log("❌ Code length is not 4");
      toast.error("Please enter a valid 4-digit code");
      return;
    }

    console.log("✅ Validation passed, calling API...");
    console.log("API URL:", `${BACKEND_API_URL}/api/users/signup/verify-otp`);
    console.log("Request body:", { email: email, otp: verificationCode });

    setIsLoading(true);
    try {
      // Call the verify-otp API
      const res = await axios.post(
        `${BACKEND_API_URL}/api/users/signup/verify-otp`,
        {
          email: email,
          otp: verificationCode,
        }
      );

      console.log("✅ Verification response:", res.data);

      // Check if verification was successful
      if (res.data?.status === "success" || res.status === 200) {
        toast.success("Email verified successfully!");

        // Extract authentication data from response if available
        const authData = res.data?.data || res.data;
        if (authData) {
          tokenUtils.setAuthData({
            user: authData.user,
            token: authData.token,
            refreshToken: authData.refreshToken
          });
          console.log("Auth data saved:", authData);
        }

        // Save or update user data
        const existingUserData = tokenUtils.getUserData();
        if (existingUserData) {
          console.log("Using existing user data:", existingUserData);
        } else {
          // If no user data exists, save basic info
          tokenUtils.setUserData({
            name: "",
            email: email,
            phone: "",
          });
        }

        // Clear verification code
        setOtp(["", "", "", ""]);

        // Close modal and trigger success callback
        setShowAuthModal(false);
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      } else {
        toast.error(res.data?.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);

      // Handle different error scenarios
      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.data?.error;

        switch (status) {
          case 400:
            toast.error(message || "Invalid verification code");
            break;
          case 404:
            toast.error("Verification code not found or expired");
            break;
          case 410:
            toast.error(
              "Verification code has expired. Please request a new one"
            );
            break;
          default:
            toast.error(message || "Verification failed. Please try again");
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email address not found");
      return;
    }

    if (codeResentClicked) {
      return;
    }

    if (!signupUserData) {
      toast.error("Signup data not found. Please try signing up again.");
      return;
    }

    console.log("🔄 Resending OTP by calling signup API again");
    console.log("Signup data:", signupUserData);
    setCodeResentClicked(true);
    setTimer(59);

    try {
      // Call the signup API again to generate a new OTP
      const res = await axios.post(
        `${BACKEND_API_URL}/api/users/signup`,
        signupUserData
      );

      console.log("✅ Resend (signup) response:", res.data);

      if (res.data?.status === "success" || res.status === 201) {
        toast.success("New OTP sent to your email!");
      } else {
        toast.error(res.data?.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("❌ Resend error:", error);

      // Handle error scenarios
      if (error.response) {
        const status = error.response.status;
        const message =
          error.response.data?.message || error.response.data?.error;

        // If user already exists, that's fine - OTP should still be sent
        if (status === 409 || message?.includes("already exists")) {
          toast.success("New OTP sent to your email!");
          console.log("User exists but OTP should be sent");
        } else {
          toast.error(message || "Failed to resend OTP");
        }
      } else {
        toast.error("Network error. Please try again");
      }

      // Reset the resend button if there was a serious error
      if (!error.response || error.response.status !== 409) {
        setCodeResentClicked(false);
        setTimer(0);
      }
    }
  };

  const handleClose = () => {
    setShowAuthModal(false);
    setOtp(["", "", "", ""]);
  };

  return (
    <div className="fixed inset-0 z-[3500] flex items-center justify-center bg-black/50 bg-opacity-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-full inline-flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="oggoair"
              width={500}
              height={500}
              className="w-[80px] min-[400px]:w-[90px] sm:w-[120px] md:w-[140px] lg:w-[165px]"
            />
          </div>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">OTP Code</h2>
          <div className="text-gray-600 text-sm flex flex-col">
            <p>Enter the Code that we have sent to</p>
            <p>{email}</p>
          </div>
        </div>

        {/* OTP Input Boxes */}
        <div className="mb-4">
          <div className="flex justify-center gap-3 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
                className="w-16 h-16 sm:w-20 sm:h-10 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              />
            ))}
          </div>

          {/* Paste Code Button */}
          <div className="text-right mb-6">
            <button
              onClick={handlePaste}
              disabled={isLoading}
              className="text-lime-500 hover:text-lime-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Paste Code
            </button>
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isLoading || otp.join("").length !== 4}
          className="w-full bg-lime-300 hover:bg-lime-400 text-gray-800 font-semibold py-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
              <span>Verifying...</span>
            </div>
          ) : (
            "Verify Code"
          )}
        </button>

        {/* Resend Code */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Didn't receive code?{" "}
            {!codeResentClicked || timer === 0 ? (
              <button
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-lime-500 hover:text-lime-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend Code
              </button>
            ) : (
              <span className="text-gray-400">Resend Code ({timer}s)</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
