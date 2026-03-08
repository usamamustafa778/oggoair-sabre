import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";

export default function OTPVerificationModal({
  isOpen,
  onClose,
  onVerify,
  onResend,
  email,
  loading,
}) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (isOpen) {
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", ""]);
      // Focus first input when modal opens
      setTimeout(() => {
        if (inputRefs[0]?.current) {
          inputRefs[0].current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, timer]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "");
    if (digit.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 3) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
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
      // Focus last filled input
      if (digits.length > 0 && digits.length <= 4) {
        inputRefs[Math.min(digits.length - 1, 3)]?.current?.focus();
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleVerify = () => {
    const otpValue = otp.join("");
    if (otpValue.length === 4) {
      onVerify(otpValue);
    }
  };

  const handleResend = async () => {
    if (canResend && !loading) {
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", ""]);
      await onResend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 p-4">
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
                disabled={loading}
                className="w-16 h-16 sm:w-20 sm:h-10 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-200 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              />
            ))}
          </div>

          {/* Paste Code Button */}
          <div className="text-right mb-6">
            <button
              onClick={handlePaste}
              disabled={loading}
              className="text-lime-500 hover:text-lime-600 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Paste Code
            </button>
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== 4}
          className="w-full bg-lime-300 hover:bg-lime-400 text-gray-800 font-semibold py-4 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {loading ? (
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
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={loading}
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
