import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { tokenUtils } from "@/config/api";
import ModernAuthForm from "../Login/ModernAuthForm";
import CustomDatePicker from "../common/CustomDatePicker";
import { Shield, Loader2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

export default function CheckoutForm({
  contact,
  countries,
  handleBook,
  setLoading,
  flightDetails,
  passengersInfo,
  loading = false,
  validationError,
  handleContactChange,
  passengersInfoChange,
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [showCountryDropdown, setShowCountryDropdown] = React.useState(false);
  const [showResidenceDropdown, setShowResidenceDropdown] = React.useState({});
  const [residenceSearchTerm, setResidenceSearchTerm] = React.useState({});
  const [selectedCountry, setSelectedCountry] = React.useState(null);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState({});
  const searchInputRef = React.useRef(null);

  // Toast notification functions using react-hot-toast
  const showErrorToast = (message) => {
    toast.dismiss();
    toast.error(message);
  };
  const showWarningToast = (message) => {
    toast.dismiss();
    toast(message, { icon: "⚠️" });
  };
  const showInfoToast = (message) => {
    toast.dismiss();
    toast(message, { icon: "ℹ️" });
  };

  const triggerReloadForPayment = () => {
    try {
      localStorage.setItem("openPaymentModal", "1");
    } catch (_) {}
    try {
      if (router && router.reload) {
        router.reload();
      } else if (router && router.asPath) {
        router.replace(router.asPath);
      } else {
        window.location.href = window.location.href;
      }
    } catch (_) {
      try {
        window.location.href = window.location.href;
      } catch (_) {}
    }
  };

  const countriesData = React.useMemo(() => {
    if (countries && countries.length > 0) {
      return countries.map((country) => ({
        code: country.code,
        name: country.name,
        flag: country.flag,
        dialCode: country.dialCode,
      }));
    }
    return [];
  }, [countries]);

  // Sync selectedCountry with contact.dialCode prop
  React.useEffect(() => {
    if (contact?.dialCode && contact.dialCode !== selectedCountry?.dialCode) {
      const matchingCountry = countriesData.find(
        (country) => country.dialCode === contact.dialCode
      );
      if (matchingCountry) {
        setSelectedCountry(matchingCountry);
      }
    } else if (!contact?.dialCode && selectedCountry) {
      setSelectedCountry(null);
    }
  }, [contact?.dialCode, countriesData]);

  // Auto-detect country when user types dial code
  const handleDialCodeChange = (value) => {
    handleContactChange("dialCode", value);
    clearFieldError("contact_dialCode");

    // Update searchTerm to enable dropdown filtering
    setSearchTerm(value);

    // Auto-find matching country
    if (value) {
      const matchingCountry = countriesData.find(
        (country) => country.dialCode === value
      );
      if (matchingCountry) {
        setSelectedCountry(matchingCountry);
        // Keep searchTerm for filtering, only clear when dropdown closes
      } else {
        const partialMatch = countriesData.find((country) =>
          country.dialCode.startsWith(value)
        );
        if (partialMatch) {
          setSelectedCountry(partialMatch);
        } else {
          setSelectedCountry(null);
        }
      }
    } else {
      setSelectedCountry(null);
      setSearchTerm("");
    }
  };

  // Auto-focus search input when dropdown opens
  React.useEffect(() => {
    if (showCountryDropdown && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showCountryDropdown]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountryDropdown && !event.target.closest(".country-dropdown")) {
        setShowCountryDropdown(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
      // Check if any residence dropdown is open and close it if clicked outside
      Object.keys(showResidenceDropdown).forEach((passengerIndex) => {
        if (
          showResidenceDropdown[passengerIndex] &&
          !event.target.closest(`.residence-dropdown-${passengerIndex}`)
        ) {
          setShowResidenceDropdown((prev) => ({
            ...prev,
            [passengerIndex]: false,
          }));
          setResidenceSearchTerm((prev) => ({ ...prev, [passengerIndex]: "" }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCountryDropdown, showResidenceDropdown]);

  // Filter countries based on search term
  const filteredCountries = countriesData.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.dialCode.includes(searchTerm) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (!showCountryDropdown) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredCountries.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCountries.length - 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredCountries[highlightedIndex]) {
          const selectedCountry = filteredCountries[highlightedIndex];
          setSelectedCountry(selectedCountry);
          handleContactChange("dialCode", selectedCountry.dialCode);
          setShowCountryDropdown(false);
          setSearchTerm("");
          setHighlightedIndex(-1);
        }
        break;
      case "Escape":
        setShowCountryDropdown(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
        break;
    }
  };

  // Auto-highlight first matching item when search term changes
  React.useEffect(() => {
    if (searchTerm && filteredCountries.length > 0) {
      // Find the first item that actually contains the search term
      const firstMatchIndex = filteredCountries.findIndex(
        (country) =>
          country.dialCode.includes(searchTerm) ||
          country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          country.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setHighlightedIndex(firstMatchIndex >= 0 ? firstMatchIndex : 0);
    } else if (filteredCountries.length > 0) {
      setHighlightedIndex(0); // No search term, highlight first item
    } else {
      setHighlightedIndex(-1); // No matches
    }
  }, [searchTerm, filteredCountries]);

  // Filter countries for residence dropdown - now takes passenger index
  const getFilteredResidenceCountries = (passengerIndex) => {
    const searchTerm = residenceSearchTerm[passengerIndex] || "";
    return countriesData.filter(
      (country) =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d+$/;
    return phoneRegex.test(phoneNumber);
  };

  const validateDateOfBirth = (dateOfBirth) => {
    if (!dateOfBirth) return false;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1 >= 0;
    }
    return age >= 0;
  };

  const validatePassportExpiry = (passportExpiryDate) => {
    if (!passportExpiryDate) return false;
    const expiryDate = new Date(passportExpiryDate);
    const today = new Date();
    return expiryDate > today;
  };

  const validateForm = () => {
    const errors = {};

    // Validate contact information (main passenger)
    if (!contact.email) {
      errors.contact_email = "Email address is required";
    } else if (!validateEmail(contact.email)) {
      errors.contact_email = "Please enter a valid email address";
    }

    if (!contact.phoneNumber) {
      errors.contact_phone = "Phone number is required";
    } else if (!validatePhoneNumber(contact.phoneNumber)) {
      errors.contact_phone = "Phone number should contain only digits";
    }

    if (!contact.dialCode) {
      errors.contact_dialCode = "Please select a country code";
    }

    // Validate passenger information
    passengersInfo.forEach((passenger, index) => {
      const passengerKey = `passenger_${index}`;

      if (!passenger.firstName?.trim()) {
        errors[`${passengerKey}_firstName`] = "First name is required";
      }

      if (!passenger.lastName?.trim()) {
        errors[`${passengerKey}_lastName`] = "Last name is required";
      }

      if (!passenger.gender) {
        errors[`${passengerKey}_gender`] = "Please select a gender";
      }

      if (!passenger.dateOfBirth) {
        errors[`${passengerKey}_dateOfBirth`] = "Date of birth is required";
      } else if (!validateDateOfBirth(passenger.dateOfBirth)) {
        errors[`${passengerKey}_dateOfBirth`] =
          "Please enter a valid date of birth";
      }

      if (!passenger.cityzenShip) {
        errors[`${passengerKey}_cityzenShip`] =
          "Country of residence is required";
      }

      if (!passenger.passport?.trim()) {
        errors[`${passengerKey}_passport`] = "Passport number is required";
      }

      if (!passenger.passportExpiryDate) {
        errors[`${passengerKey}_passportExpiryDate`] =
          "Passport expiry date is required";
      } else if (!validatePassportExpiry(passenger.passportExpiryDate)) {
        errors[`${passengerKey}_passportExpiryDate`] =
          "Passport must be valid (not expired)";
      }
    });

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      showErrorToast("Please fill in all required fields correctly");
    }

    return Object.keys(errors).length === 0;
  };

  const handleBookWithValidation = async () => {
    if (setLoading) {
      setLoading(true);
    }

    const isValid = validateForm();
    if (!isValid) {
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorField.focus();
      }
      if (setLoading) {
        setLoading(false);
      }
      return;
    }

    // Show processing toast when validation passes
    showInfoToast("Validating your information...");

    // If already authenticated, skip registration and proceed directly
    try {
      if (tokenUtils?.isAuthenticated && tokenUtils.isAuthenticated()) {
        showInfoToast("Processing your booking...");
        handleBook();
        return;
      }
    } catch (_) {
      // Reset loading state on error
      if (setLoading) {
        setLoading(false);
      }
    }

    // Before proceeding, verify/register the contact email, and auto login/register based on response
    try {
      const primaryPassenger = passengersInfo?.[0] || {};
      const basePayload = { email: (contact.email || "").trim() };
      const namePayload = {
        ...basePayload,
        ...(primaryPassenger.firstName && primaryPassenger.lastName
          ? {
              firstName: primaryPassenger.firstName.trim(),
              lastName: primaryPassenger.lastName.trim(),
            }
          : {}),
      };

      // First attempt: try with email only
      const firstResp = await fetch(
        `${
          process.env.NEXT_PUBLIC_API || "http://localhost:5000"
        }/api/users/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(basePayload),
        }
      );
      const firstData = await firstResp.json().catch(() => ({}));

      // Helper to cache OTP meta
      const cacheOtpMeta = (d) => {
        if (d?.data?.email) {
          try {
            localStorage.setItem(
              "otpData",
              JSON.stringify({
                email: d.data.email,
                isLogin: d.data.isLogin,
                expiresIn: d.data.expiresIn,
                timestamp: Date.now(),
              })
            );
          } catch (_) {}
        }
      };

      if (firstResp.ok && firstData.status === "success") {
        cacheOtpMeta(firstData);
        // If backend returns token for existing users, store it
        if (firstData?.data?.token) {
          tokenUtils.setAuthData({
            user: firstData.data.user,
            token: firstData.data.token,
            refreshToken: firstData.data.refreshToken,
          });
          // Flag to auto-open payment modal, then reload
          try {
            localStorage.setItem("openPaymentModal", "1");
          } catch (_) {}
          try {
            window.location.reload();
          } catch (_) {}
          return;
        } else if (firstData?.data?.isLogin === false) {
          // New user case: if token not provided, try registering with names automatically
          if (namePayload.firstName && namePayload.lastName) {
            const secondResp = await fetch(
              `${
                process.env.NEXT_PUBLIC_API || "http://localhost:5000"
              }/api/users/register`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(namePayload),
              }
            );
            const secondData = await secondResp.json().catch(() => ({}));
            if (secondResp.ok && secondData.status === "success") {
              cacheOtpMeta(secondData);
              if (secondData?.data?.token) {
                tokenUtils.setAuthData({
                  user: secondData.data.user,
                  token: secondData.data.token,
                  refreshToken: secondData.data.refreshToken,
                });
                // Flag to auto-open payment modal, then reload
                triggerReloadForPayment();
              } else {
                // OTP required for new user registration
                setShowAuthModal(true);
                return;
              }
            } else {
              setFieldErrors((prev) => ({
                ...prev,
                contact_email:
                  secondData?.message ||
                  "Failed to register user. Please try again.",
              }));
              // Reset loading state on error
              if (setLoading) {
                setLoading(false);
              }
              return;
            }
          } else {
            // Names missing for new user
            setFieldErrors((prev) => ({
              ...prev,
              contact_email:
                "First and last name are required for registration.",
            }));
            // Reset loading state on error
            if (setLoading) {
              setLoading(false);
            }
            return;
          }
        } else {
          // Existing user but no token -> require OTP via modal
          setShowAuthModal(true);
          return;
        }
      } else {
        // If server indicates names required, try again with names
        const needsName =
          firstData?.message ===
          "First name and last name are required for new users";
        if (needsName && namePayload.firstName && namePayload.lastName) {
          const secondResp = await fetch(
            `${
              process.env.NEXT_PUBLIC_API || "http://localhost:5000"
            }/api/users/register`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(namePayload),
            }
          );
          const secondData = await secondResp.json().catch(() => ({}));
          if (secondResp.ok && secondData.status === "success") {
            cacheOtpMeta(secondData);
            if (secondData?.data?.token) {
              tokenUtils.setAuthData({
                user: secondData.data.user,
                token: secondData.data.token,
                refreshToken: secondData.data.refreshToken,
              });
              // Flag to auto-open payment modal, then reload
              try {
                localStorage.setItem("openPaymentModal", "1");
              } catch (_) {}
              try {
                window.location.reload();
              } catch (_) {}
              // Flag to auto-open payment modal, then reload
              try {
                localStorage.setItem("openPaymentModal", "1");
              } catch (_) {}
              try {
                window.location.reload();
              } catch (_) {}
              return;
            } else {
              // Registration succeeded but OTP still required
              setShowAuthModal(true);
              return;
            }
          } else {
            setFieldErrors((prev) => ({
              ...prev,
              contact_email:
                secondData?.message ||
                "Failed to register user. Please try again.",
            }));
            // Reset loading state on error
            if (setLoading) {
              setLoading(false);
            }
            return;
          }
        } else {
          const errorMessage =
            firstData?.message || "Failed to verify email. Please try again.";
          setFieldErrors((prev) => ({
            ...prev,
            contact_email: errorMessage,
          }));
          showErrorToast(errorMessage);
          // Reset loading state on error
          if (setLoading) {
            setLoading(false);
          }
          return;
        }
      }
    } catch (err) {
      const errorMessage = "Network error while verifying email. Please retry.";
      setFieldErrors((prev) => ({
        ...prev,
        contact_email: errorMessage,
      }));
      showErrorToast(errorMessage);
      // Reset loading state on error
      if (setLoading) {
        setLoading(false);
      }
      return;
    }

    // Proceed with booking after successful email verification/registration check
    try {
      await handleBook();
    } catch (error) {
      console.error("Booking error:", error);
      console.error("Error response data:", error?.response?.data);

      // Handle specific API errors
      if (error?.response?.data) {
        const errorData = error.response.data;

        // Handle price change errors - check both error.errors and errors arrays
        const hasPriceChanged =
          errorData.error?.errors?.some(
            (err) => err.code === "price_changed"
          ) || errorData.errors?.some((err) => err.code === "price_changed");

        if (hasPriceChanged) {
          showWarningToast(
            "Flight price has changed. Please search again for updated pricing."
          );
        }
        // Handle offer no longer available
        else if (
          errorData.message?.includes("no longer available") ||
          errorData.message?.includes("retrieve the offer again")
        ) {
          showWarningToast(
            "This flight is no longer available. Please select another option."
          );
        }
        // Handle general API errors
        else {
          // Show the actual error message from API
          const errorMessage =
            errorData.message || "Booking failed. Please try again.";
          showErrorToast(errorMessage);
        }
      } else {
        showErrorToast("Booking failed. Please try again.");
      }

      // Reset loading state
      if (setLoading) {
        setLoading(false);
      }
    }
  };

  const clearFieldError = (fieldKey) => {
    if (fieldErrors[fieldKey]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  return (
    <>
      {showAuthModal && (
        <ModernAuthForm
          setShowAuthModal={setShowAuthModal}
          onAuthSuccess={() => {
            setShowAuthModal(false);
            handleBook();
          }}
          prefilledEmail={(contact.email || "").trim()}
          prefilledUserData={{
            firstName: passengersInfo?.[0]?.firstName || "",
            lastName: passengersInfo?.[0]?.lastName || "",
          }}
        />
      )}

      {flightDetails ? (
        <>
          {/* Passengers Cards */}
          {(passengersInfo && passengersInfo.length > 0
            ? passengersInfo
            : [
                {
                  firstName: "",
                  lastName: "",
                  gender: "",
                  dateOfBirth: "",
                  cityzenShip: "",
                  passport: "",
                  passportExpiryDate: "",
                },
              ]
          ).map((p, i) => (
            <div
              key={i}
              className="bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-xl p-5 space-y-3 mb-6 text-primary-text"
            >
              {i === 0 && (
                <h2 className="text-2xl font-bold text-primary-text">
                  Passenger Details
                </h2>
              )}
              {i === 0 && (
                <div className="border-2 flex flex-row gap-2 border-gray-300 rounded-xl p-6  mb-3">
                  <Image
                    src="/st-images/user2.png"
                    alt="passport"
                    width={100}
                    height={100}
                    className="h-6 w-auto"
                  />
                  <span className=" text-[16px] text-primary-text">
                    These passenger details must match your Passport or Photo ID
                  </span>
                </div>
              )}

              <div className="border-2 border-gray-300 rounded-xl p-3">
                <div className="flex items-center justify-between mb-6 ">
                  <h3 className="text-lg font-bold text-primary-text">
                    {i === 0 ? "Main passenger" : `Passenger ${i + 1}`}
                    {p.age && (
                      <span className="ml-2 text-sm text-gray-600">
                        ({p.ageType} (Age: {p.age}))
                      </span>
                    )}
                    {!p.age && p.type && p.type !== "adult" && (
                      <span className="ml-2 text-sm text-gray-600">
                        (
                        {p.type === "child"
                          ? "Child"
                          : p.type === "infant"
                          ? "Infant"
                          : p.type}
                        )
                      </span>
                    )}
                  </h3>
                </div>

                {/* For main passenger, show contact fields at the top */}
                {i === 0 && (
                  <div className="flex flex-col md:flex-row md:col-span-2 gap-5 mb-4">
                    <div className="w-full max-w-[260px]">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email address
                      </label>
                      <input
                        placeholder="Enter your email address"
                        value={contact?.email || ""}
                        onChange={(e) => {
                          handleContactChange("email", e.target.value);
                          clearFieldError("contact_email");
                        }}
                        disabled={loading}
                        data-error={!!fieldErrors.contact_email}
                        className={`w-full px-3 py-3.5 border text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 ${
                          fieldErrors.contact_email
                            ? "border-red-500 bg-red-50"
                            : "border-gray-100 bg-white"
                        }`}
                      />
                      {fieldErrors.contact_email && (
                        <p className="text-red-500 text-xs mt-1">
                          {fieldErrors.contact_email}
                        </p>
                      )}
                    </div>

                    <div className="w-full ">
                      <div className="flex gap-1">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Dialing code
                          </label>
                          <div className=" w-[125px] relative country-dropdown">
                            {/* Dialing code dropdown */}
                            <div className="relative country-dropdown">
                              <div
                                className={`w-full pl-1 pr-3 h-[50px] border text-sm rounded-xl disabled:bg-gray-50 flex items-center justify-between ${
                                  fieldErrors.contact_dialCode
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-100 bg-white"
                                }`}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  {selectedCountry && (
                                    <>
                                      <img
                                        src={
                                          selectedCountry.flag ||
                                          `https://flagcdn.com/${selectedCountry.code.toLowerCase()}.svg`
                                        }
                                        alt={selectedCountry.name}
                                        className="w-6 h-6 rounded flex-shrink-0"
                                        onError={(e) => {
                                          // Fallback to flagcdn if the flag URL fails
                                          if (
                                            e.target.src !==
                                            `https://flagcdn.com/${selectedCountry.code.toLowerCase()}.svg`
                                          ) {
                                            e.target.src = `https://flagcdn.com/${selectedCountry.code.toLowerCase()}.svg`;
                                          }
                                        }}
                                      />
                                      <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="+123"
                                        className="w-full py-2 border-none outline-none text-sm focus:ring-0 focus:border-transparent bg-transparent"
                                        value={contact.dialCode || ""}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(
                                            /[^+\d]/g,
                                            ""
                                          );
                                          handleDialCodeChange(value);
                                        }}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => {
                                          setShowCountryDropdown(true);
                                          // Initialize searchTerm with current dial code if available
                                          if (
                                            contact?.dialCode &&
                                            !searchTerm
                                          ) {
                                            setSearchTerm(contact.dialCode);
                                          }
                                        }}
                                        disabled={loading}
                                        data-error={
                                          !!fieldErrors.contact_dialCode
                                        }
                                      />
                                    </>
                                  )}
                                  {!selectedCountry && (
                                    <div className="flex items-center gap-3 flex-1">
                                      <div className="w-6 h-6 rounded bg-gray-200 flex-shrink-0"></div>
                                      <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="+123"
                                        className="w-full py-2 border-none outline-none text-sm focus:ring-0 focus:border-transparent bg-transparent"
                                        value={contact.dialCode || ""}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(
                                            /[^+\d]/g,
                                            ""
                                          );
                                          handleDialCodeChange(value);
                                        }}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => {
                                          setShowCountryDropdown(true);
                                          // Initialize searchTerm with current dial code if available
                                          if (
                                            contact?.dialCode &&
                                            !searchTerm
                                          ) {
                                            setSearchTerm(contact.dialCode);
                                          }
                                        }}
                                        disabled={loading}
                                        data-error={
                                          !!fieldErrors.contact_dialCode
                                        }
                                      />
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newState = !showCountryDropdown;
                                    setShowCountryDropdown(newState);
                                    // Initialize searchTerm with current dial code when opening dropdown
                                    if (
                                      newState &&
                                      contact?.dialCode &&
                                      !searchTerm
                                    ) {
                                      setSearchTerm(contact.dialCode);
                                    }
                                  }}
                                  disabled={loading}
                                  className="ml-2 p-1 hover:bg-gray-100 rounded"
                                >
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>

                              {showCountryDropdown && (
                                <div
                                  className="absolute top-full left-0 right-0 z-50 mt-1 w-full min-w-[200px] scrollbar-hide bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                  style={{
                                    scrollbarWidth: "none",
                                    WebkitScrollbarWidth: "none",
                                  }}
                                >
                                  <div className="max-h-48 overflow-y-auto">
                                    {filteredCountries.map((country, index) => (
                                      <button
                                        key={country.code}
                                        type="button"
                                        onClick={() => {
                                          setSelectedCountry(country);
                                          handleDialCodeChange(
                                            country.dialCode
                                          );
                                          setShowCountryDropdown(false);
                                          setSearchTerm("");
                                          setHighlightedIndex(-1);
                                        }}
                                        onMouseEnter={() =>
                                          setHighlightedIndex(index)
                                        }
                                        className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm ${
                                          highlightedIndex === index
                                            ? "bg-blue-50"
                                            : ""
                                        }`}
                                      >
                                        <img
                                          src={
                                            country.flag ||
                                            `https://flagcdn.com/${country.code.toLowerCase()}.svg`
                                          }
                                          alt={country.name}
                                          className="w-5 h-4 rounded"
                                          onError={(e) => {
                                            // Fallback to flagcdn if the flag URL fails
                                            if (
                                              e.target.src !==
                                              `https://flagcdn.com/${country.code.toLowerCase()}.svg`
                                            ) {
                                              e.target.src = `https://flagcdn.com/${country.code.toLowerCase()}.svg`;
                                            }
                                          }}
                                        />
                                        {/* <span className="flex-1">{country.name}</span> */}
                                        <span className="text-gray-500">
                                          {country.dialCode}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          {fieldErrors.contact_dialCode && (
                            <p className="text-red-500 text-xs mt-1">
                              {fieldErrors.contact_dialCode}
                            </p>
                          )}
                        </div>

                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Phone number
                          </label>
                          <input
                            placeholder="Phone number"
                            value={contact.phoneNumber || ""}
                            onChange={(e) => {
                              handleContactChange(
                                "phoneNumber",
                                e.target.value
                              );
                              clearFieldError("contact_phone");
                            }}
                            onFocus={() => {}}
                            disabled={loading}
                            data-error={!!fieldErrors.contact_phone}
                            className={`w-full px-3 py-3.5 border text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 ${
                              fieldErrors.contact_phone
                                ? "border-red-500 bg-red-50"
                                : "border-gray-100 bg-white"
                            }`}
                          />
                          {fieldErrors.contact_phone && (
                            <p className="text-red-500 text-xs mt-1">
                              {fieldErrors.contact_phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 border-gray-300 border-t md:col-span-2 md:pt-6 mb-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`gender-${i}`}
                      checked={p.gender === "Mr"}
                      onChange={() => {
                        passengersInfoChange("Mr", "gender", i);
                        clearFieldError(`passenger_${i}_gender`);
                      }}
                      disabled={loading}
                      className="w-6 h-6 accent-primary-green disabled:opacity-50"
                    />
                    <span className="text-sm">Mr</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`gender-${i}`}
                      checked={p.gender === "Mrs/Ms"}
                      onChange={() => {
                        passengersInfoChange("Mrs/Ms", "gender", i);
                        clearFieldError(`passenger_${i}_gender`);
                      }}
                      disabled={loading}
                      className="w-6 h-6 accent-primary-green disabled:opacity-50"
                    />
                    <span className="text-sm">Mrs/Ms</span>
                  </label>
                </div>
                {fieldErrors[`passenger_${i}_gender`] && (
                  <p className="text-red-500 text-xs mb-4">
                    {fieldErrors[`passenger_${i}_gender`]}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-1.5 mb-4">
                  {/* First Name */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      First name
                    </label>
                    <input
                      type="text"
                      value={p.firstName}
                      onChange={(e) => {
                        passengersInfoChange(e.target.value, "firstName", i);
                        clearFieldError(`passenger_${i}_firstName`);
                      }}
                      placeholder="Enter your first name"
                      disabled={loading}
                      data-error={!!fieldErrors[`passenger_${i}_firstName`]}
                      className={`w-full px-3 py-3.5 border text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 ${
                        fieldErrors[`passenger_${i}_firstName`]
                          ? "border-red-500 bg-red-50"
                          : "border-gray-100 bg-white"
                      }`}
                    />
                    {fieldErrors[`passenger_${i}_firstName`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors[`passenger_${i}_firstName`]}
                      </p>
                    )}
                  </div>
                  {/* Last Name */}
                  <div className="w-full">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={p.lastName}
                      onChange={(e) => {
                        passengersInfoChange(e.target.value, "lastName", i);
                        clearFieldError(`passenger_${i}_lastName`);
                      }}
                      placeholder="Enter your last name"
                      disabled={loading}
                      data-error={!!fieldErrors[`passenger_${i}_lastName`]}
                      className={`w-full px-3 py-3.5 border text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 ${
                        fieldErrors[`passenger_${i}_lastName`]
                          ? "border-red-500 bg-red-50"
                          : "border-gray-100 bg-white"
                      }`}
                    />
                    {fieldErrors[`passenger_${i}_lastName`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors[`passenger_${i}_lastName`]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date of Birth, Passport No, Passport Expiry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Date of Birth */}
                  <div className="w-full">
                    <CustomDatePicker
                      value={p.dateOfBirth}
                      onChange={(date) => {
                        passengersInfoChange(date, "dateOfBirth", i);
                        clearFieldError(`passenger_${i}_dateOfBirth`);
                      }}
                      label="Date of birth"
                      maxDate={new Date().toISOString().split("T")[0]} // Cannot select future dates
                      minDate="1920-01-01" // Reasonable minimum birth year
                      yearOrder="desc" // Descending order (most recent years first)
                      disabled={loading}
                      error={fieldErrors[`passenger_${i}_dateOfBirth`]}
                    />
                    {fieldErrors[`passenger_${i}_dateOfBirth`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors[`passenger_${i}_dateOfBirth`]}
                      </p>
                    )}
                  </div>

                  {/* Country/region of residence */}
                  <div className="w-full ">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Country/region of residence
                    </label>
                    <div className={`relative residence-dropdown-${i}`}>
                      <div className="relative">
                        <input
                          type="text"
                          value={
                            residenceSearchTerm[i] !== undefined &&
                            residenceSearchTerm[i] !== ""
                              ? residenceSearchTerm[i]
                              : p.cityzenShip || ""
                          }
                          onChange={(e) => {
                            setResidenceSearchTerm((prev) => ({
                              ...prev,
                              [i]: e.target.value,
                            }));
                            // If user clears the input, also clear the selected country
                            if (e.target.value === "") {
                              passengersInfoChange("", "cityzenShip", i);
                            }
                            clearFieldError(`passenger_${i}_cityzenShip`);
                          }}
                          onFocus={() => {
                            // When focusing, show current country name as search term for editing
                            if (p.cityzenShip && !residenceSearchTerm[i]) {
                              setResidenceSearchTerm((prev) => ({
                                ...prev,
                                [i]: p.cityzenShip,
                              }));
                            }
                            setShowResidenceDropdown((prev) => ({
                              ...prev,
                              [i]: true,
                            }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const filteredCountries =
                                getFilteredResidenceCountries(i);
                              if (filteredCountries.length > 0) {
                                // Auto-select first country in search results
                                const firstCountry = filteredCountries[0];
                                passengersInfoChange(
                                  firstCountry.name,
                                  "cityzenShip",
                                  i
                                );
                                setShowResidenceDropdown((prev) => ({
                                  ...prev,
                                  [i]: false,
                                }));
                                setResidenceSearchTerm((prev) => ({
                                  ...prev,
                                  [i]: "",
                                }));
                                e.target.blur(); // Remove focus
                              }
                            }
                          }}
                          onBlur={() => {
                            // Clear search term when losing focus
                            setTimeout(() => {
                              setResidenceSearchTerm((prev) => ({
                                ...prev,
                                [i]: "",
                              }));
                            }, 150); // Delay to allow country selection
                          }}
                          disabled={loading}
                          data-error={
                            !!fieldErrors[`passenger_${i}_cityzenShip`]
                          }
                          className={`w-full py-3.5 border text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 ${
                            p.cityzenShip ? "pl-12 pr-3" : "px-3"
                          } ${
                            fieldErrors[`passenger_${i}_cityzenShip`]
                              ? "border-red-500 bg-red-50"
                              : "border-gray-100 bg-white"
                          }`}
                        />
                        {p.cityzenShip &&
                          (() => {
                            const country = countriesData.find(
                              (country) => country.name === p.cityzenShip
                            );
                            return country ? (
                              <img
                                src={
                                  country.flag ||
                                  `https://flagcdn.com/${country.code.toLowerCase()}.svg`
                                }
                                alt={p.cityzenShip}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded"
                                onError={(e) => {
                                  // Fallback to flagcdn if the flag URL fails
                                  if (
                                    e.target.src !==
                                    `https://flagcdn.com/${country.code.toLowerCase()}.svg`
                                  ) {
                                    e.target.src = `https://flagcdn.com/${country.code.toLowerCase()}.svg`;
                                  }
                                }}
                              />
                            ) : null;
                          })()}
                      </div>

                      {showResidenceDropdown[i] && (
                        <div
                          className="absolute top-full left-0 right-0 z-50 mt-1 w-full min-w-[200px] scrollbar-hide bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto p-2"
                          style={{
                            scrollbarWidth: "none",
                            WebkitScrollbarWidth: "none",
                          }}
                        >
                          {getFilteredResidenceCountries(i).map(
                            (country, index) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  passengersInfoChange(
                                    country.name,
                                    "cityzenShip",
                                    i
                                  );
                                  clearFieldError(`passenger_${i}_cityzenShip`);
                                  setShowResidenceDropdown((prev) => ({
                                    ...prev,
                                    [i]: false,
                                  }));
                                  setResidenceSearchTerm((prev) => ({
                                    ...prev,
                                    [i]: "",
                                  }));
                                }}
                                className={`w-full px-3 py-2 text-left flex items-center gap-3 text-sm ${
                                  index === 0
                                    ? "bg-secondary-green text-primary-text hover:bg-secondary-green"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <img
                                  src={
                                    country.flag ||
                                    `https://flagcdn.com/${country.code.toLowerCase()}.svg`
                                  }
                                  alt={country.name}
                                  className="w-5 h-4 rounded"
                                  onError={(e) => {
                                    // Fallback to flagcdn if the flag URL fails
                                    if (
                                      e.target.src !==
                                      `https://flagcdn.com/${country.code.toLowerCase()}.svg`
                                    ) {
                                      e.target.src = `https://flagcdn.com/${country.code.toLowerCase()}.svg`;
                                    }
                                  }}
                                />
                                <span className="flex-1">{country.name}</span>
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    {fieldErrors[`passenger_${i}_cityzenShip`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors[`passenger_${i}_cityzenShip`]}
                      </p>
                    )}
                  </div>

                  {/* Passport No. */}
                  <div className="w-full ">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Passport No.
                    </label>
                    <input
                      type="text"
                      value={p.passport}
                      onChange={(e) => {
                        passengersInfoChange(e.target.value, "passport", i);
                        clearFieldError(`passenger_${i}_passport`);
                      }}
                      placeholder="Enter your passport number"
                      disabled={loading}
                      data-error={!!fieldErrors[`passenger_${i}_passport`]}
                      className={`w-full px-3 py-3.5 border text-sm rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 ${
                        fieldErrors[`passenger_${i}_passport`]
                          ? "border-red-500 bg-red-50"
                          : "border-gray-100 bg-white"
                      }`}
                    />
                    {fieldErrors[`passenger_${i}_passport`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors[`passenger_${i}_passport`]}
                      </p>
                    )}
                  </div>
                  {/* Passport Expiry */}
                  <div className="w-full">
                    <CustomDatePicker
                      value={p.passportExpiryDate}
                      onChange={(date) => {
                        passengersInfoChange(date, "passportExpiryDate", i);
                        clearFieldError(`passenger_${i}_passportExpiryDate`);
                      }}
                      label="Passport Expiry"
                      minDate={new Date().toISOString().split("T")[0]} // Cannot select past dates
                      maxDate={
                        new Date(new Date().getFullYear() + 20, 11, 31)
                          .toISOString()
                          .split("T")[0]
                      } // 20 years from now
                      yearOrder="asc" // Ascending order (earliest years first)
                      disabled={loading}
                      error={fieldErrors[`passenger_${i}_passportExpiryDate`]}
                    />
                    {fieldErrors[`passenger_${i}_passportExpiryDate`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldErrors[`passenger_${i}_passportExpiryDate`]}
                      </p>
                    )}
                  </div>
                </div>
                {/* Save to profile toggle */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between py-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="text-sm text-gray-700">
                        Save these details to your profile
                      </span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={true}
                          readOnly
                          className="sr-only"
                        />
                        <div
                          className={`w-10 py-[2px] rounded-full transition-colors ${
                            true ? "bg-primary-green" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                              true ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 mt-3 border-2 py-4 px-3 rounded-xl border-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]">
                    <Shield size={16} className="text-primary-text" />
                    <span className="text-xs text-primary-text">
                      Your data is safe with us. Want to know more about how we
                      use it?{" "}
                      <a href="#" className="underline">
                        Click here
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <h3 className="text-red-800 font-semibold">
                  Please fix the following errors:
                </h3>
              </div>
              <ul className="mt-2 text-red-700 text-sm space-y-1">
                {Object.keys(fieldErrors).length > 0 ? (
                  Object.values(fieldErrors).map((error, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {error}
                    </li>
                  ))
                ) : (
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    Please fill all required fields
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className=" mt-4 flex items-center justify-between">
            <button className="bg-gray-200 text-primary-text px-6 py-4 rounded-lg font-semibold w-fit  disabled:bg-gray-400 min-w-[130px] disabled:cursor-not-allowed flex items-center justify-center gap-2">
              Back
            </button>
            <button
              onClick={handleBookWithValidation}
              disabled={loading}
              className="bg-primary-text text-primary-green px-6 py-4 cursor-pointer active:scale-95 transition-all duration-300 rounded-lg font-semibold w-fit  disabled:bg-gray-400 min-w-[130px] disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="bg-white shadow-[0_0_30px_0_rgba(0,0,0,0.1)] rounded-xl p-5 space-y-3 mb-6 text-primary-text">
          <h2 className="text-2xl font-bold text-primary-text">
            Passenger Details
          </h2>
          <div className="border-2 flex flex-row gap-2 border-gray-300 rounded-xl p-6 mb-3">
            <Image
              src="/st-images/user2.png"
              alt="passport"
              width={100}
              height={100}
              className="h-6 w-auto"
            />
            <span className="text-[16px] text-primary-text">
              These passenger details must match your Passport or Photo ID
            </span>
          </div>
          <div className="border-2 border-gray-300 rounded-xl p-3">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-primary-text">
                Main passenger
              </h3>
            </div>
            <div className="space-y-4">
              <div className="animate-pulse space-y-3">
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
