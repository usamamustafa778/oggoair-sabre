import React, { useState } from "react";
import ModernAuthForm from "@/components/Login/ModernAuthForm";

export default function AuthDemo() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthSuccess = () => {
    console.log("Authentication successful!");
    // You can add additional logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Modern Auth Form Demo
        </h1>
        <p className="text-gray-600 mb-6">
          Click the button below to test the new OTP-based authentication flow.
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="bg-primary-green text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-green/90 transition-colors"
        >
          Open Auth Modal
        </button>
      </div>

      {showAuthModal && (
        <ModernAuthForm
          setShowAuthModal={setShowAuthModal}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
