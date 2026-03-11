import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_API_URL, tokenUtils } from "../../config/api";
import DashboardLayout from "../../components/Booking.jsx/DashboardLayout";
import Rightbar from "../../components/Booking.jsx/layout";
import Seo from "@/components/Seo";

export default function PassengerDetailsPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    passportNumber: "",
    countryOfBirth: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });
  const [formErrors, setFormErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Get password age text
  const getPasswordAge = () => {
    // Use user's updatedAt as fallback
    if (userData?.updatedAt) {
      const now = new Date();
      const lastUpdated = new Date(userData.updatedAt);
      const diffTime = Math.abs(now - lastUpdated);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) return `Profile updated ${diffDays} days ago`;
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `Profile updated ${months} month${months > 1 ? "s" : ""} ago`;
      }
    }

    return "Last update unknown";
  };

  const openEditModal = () => {
    if (userData) {
      const formData = {
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        dateOfBirth: userData.dateOfBirth 
          ? new Date(userData.dateOfBirth).toISOString().split('T')[0] 
          : "",
        passportNumber: userData.passportNumber || "",
        countryOfBirth: userData.countryOfBirth || "",
        address: {
          street: userData.address?.street || "",
          city: userData.address?.city || "",
          state: userData.address?.state || "",
          country: userData.address?.country || "",
          postalCode: userData.address?.postalCode || "",
        },
      };

      setEditFormData(formData);
      setFormErrors({});
      setShowEditModal(true);
    } else {
      console.error("❌ No userData available to populate form");
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      passportNumber: "",
      countryOfBirth: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
      },
    });
    setFormErrors({});
  };

  const handleEditInputChange = (field, value) => {
    // Handle nested address fields
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setEditFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!editFormData.firstName || editFormData.firstName.trim().length < 1) {
      errors.firstName = "First name is required";
    } else if (editFormData.firstName.trim().length > 50) {
      errors.firstName = "First name must not exceed 50 characters";
    }
    
    if (!editFormData.lastName || editFormData.lastName.trim().length < 1) {
      errors.lastName = "Last name is required";
    } else if (editFormData.lastName.trim().length > 50) {
      errors.lastName = "Last name must not exceed 50 characters";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editFormData.email || !emailRegex.test(editFormData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    // Phone validation (optional but must be valid if provided)
    if (editFormData.phone && editFormData.phone.trim()) {
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(editFormData.phone.replace(/\s/g, ""))) {
        errors.phone = "Phone number must start with + and country code (e.g., +1234567890)";
      }
    }
    
    // Passport validation (optional but must be alphanumeric if provided)
    if (editFormData.passportNumber && editFormData.passportNumber.trim()) {
      const passportRegex = /^[A-Za-z0-9]+$/;
      if (!passportRegex.test(editFormData.passportNumber)) {
        errors.passportNumber = "Passport number must contain only letters and numbers";
      } else if (editFormData.passportNumber.length > 20) {
        errors.passportNumber = "Passport number must not exceed 20 characters";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password Modal Functions
  const openPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordError("");
    setPasswordFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordError("");
    setPasswordFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmation("");
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (passwordError) {
      setPasswordError("");
    }
  };

  const changePassword = async () => {
    // Validation
    if (
      !passwordFormData.currentPassword ||
      !passwordFormData.newPassword ||
      !passwordFormData.confirmPassword
    ) {
      setPasswordError("Please fill in all fields");
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordFormData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    try {
      setIsChangingPassword(true);
      const token = tokenUtils.getToken();

      if (!token) {
        setPasswordError("Authentication token not found");
        return;
      }

      const response = await axios.put(
        `${BACKEND_API_URL}/api/users/change-password`,
        {
          currentPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      closePasswordModal();
      // Show success message (you can add a toast notification here)
      alert("Password changed successfully!");
    } catch (err) {
      console.error("❌ Error changing password:", err);
      setPasswordError(
        err.response?.data?.message ||
          "Failed to change password. Please check your current password."
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const updateUser = async () => {
    if (!userData?.id) {
      return;
    }

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    try {
      setIsUpdating(true);
      const token = tokenUtils.getToken();

      if (!token) {
        return;
      }

      const response = await axios.put(
        `${BACKEND_API_URL}/api/users/${userData.id}`,
        {
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          email: editFormData.email,
          phone: editFormData.phone || undefined,
          dateOfBirth: editFormData.dateOfBirth || undefined,
          passportNumber: editFormData.passportNumber || undefined,
          countryOfBirth: editFormData.countryOfBirth || undefined,
          address: editFormData.address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh user data after successful update
      await fetchUserData();

      // Update localStorage userData with new information
      const currentLocalUserData = tokenUtils.getUserData();

      if (currentLocalUserData) {
        const updatedLocalUserData = {
          ...currentLocalUserData,
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          email: editFormData.email,
          phone: editFormData.phone,
        };
        tokenUtils.setUserData(updatedLocalUserData);
      } else {
        // If no localStorage userData exists, create new one with updated info
        const newLocalUserData = {
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          email: editFormData.email,
          phone: editFormData.phone,
        };
        tokenUtils.setUserData(newLocalUserData);
      }

      closeEditModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setError(null);

      const token = tokenUtils.getToken();

      const response = await axios.get(`${BACKEND_API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setUserData(response.data.data.user);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch user data"
      );

      // Don't use localStorage fallback as requested
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      alert("Please type 'DELETE' to confirm account deletion.");
      return;
    }

    setIsDeleting(true);
    try {
      const token = tokenUtils.getToken();
      const userRole = userData.role;
      if (userRole !== "admin") {
        alert("You are not authorized to delete this account.");
        return;
      }

      const response = await axios.delete(
        `${BACKEND_API_URL}/api/users/${userData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Clear user data from localStorage
      tokenUtils.removeToken();
      tokenUtils.removeUserData();

      // Show success message
      alert(
        "Account deleted successfully. You will be redirected to the homepage."
      );

      // Redirect to homepage
      window.location.href = "/";
    } catch (err) {
      console.error("❌ Error deleting account:", err);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Error state (only show error if no data loaded)
  if (error && !userData && !loading) {
    return (
      <DashboardLayout>
        <Seo title="Passenger Details" noindex />
        <Rightbar>
          <div className="w-full space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading User Data</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={fetchUserData}
                  className="px-6 py-3 bg-primary-green text-primary-text rounded-lg hover:bg-primary-green/90 transition-all shadow-sm hover:shadow-md font-semibold"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </Rightbar>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Seo title="Passenger Details" noindex />
      <Rightbar>
        <div className="w-full space-y-6">
          {/* Loading indicator banner */}
          {loading && (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="ml-3 text-sm text-blue-800">
                  Loading your profile data...
                </p>
              </div>
            </div>
          )}

          {/* Error banner if error occurred but still showing data */}
          {error && userData && (
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-amber-800">
                  Using cached data. API Error: {error}
                </p>
              </div>
            </div>
          )}

          {/* Main passenger section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-green/10 to-primary-green/5 px-6 py-5 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">Main passenger</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-green to-primary-green/80 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4 shadow-lg">
                  {loading && !userData ? (
                    <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    userData?.firstName?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {loading && !userData ? (
                      <span className="text-gray-400">Loading...</span>
                    ) : userData?.firstName && userData?.lastName ? (
                      `${userData.firstName} ${userData.lastName}`
                    ) : userData?.email ? (
                      userData.email
                    ) : (
                      "User"
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Account holder</p>
                </div>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-blue-800 font-medium">
                    These details must match your passport or ID card for travel purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Basic info section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-text bg-primary-green rounded-lg hover:bg-primary-green/90 transition-all shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</p>
                  <p className="text-base font-semibold text-gray-900">{userData?.email || "-"}</p>
                </div>
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">First Name</p>
                  <p className="text-base font-semibold text-gray-900">
                    {userData?.firstName || "-"}
                  </p>
                </div>
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Last Name</p>
                  <p className="text-base font-semibold text-gray-900">{userData?.lastName || "-"}</p>
                </div>
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Date of Birth</p>
                  <p className="text-base font-semibold text-gray-900">
                    {userData?.dateOfBirth
                      ? new Date(userData.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : "-"}
                  </p>
                </div>
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Country/Region of Birth
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {userData?.countryOfBirth || "-"}
                  </p>
                </div>
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Passport Number</p>
                  <p className="text-base font-semibold text-gray-900">
                    {userData?.passportNumber || "-"}
                  </p>
                </div>
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Phone Number</p>
                  <p className="text-base font-semibold text-gray-900">
                    {userData?.phone || "-"}
                  </p>
                </div>
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Account Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      userData?.isActive 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {userData?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="md:col-span-2 pb-4 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Address</p>
                  <p className="text-base font-semibold text-gray-900">
                    {userData?.address
                      ? [
                          userData.address.street,
                          userData.address.city,
                          userData.address.state,
                          userData.address.postalCode,
                          userData.address.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "-"
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Discount cards section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Discount Cards</h2>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-text rounded-lg hover:bg-primary-text/90 transition-all shadow-sm hover:shadow-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Card
              </button>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">
                  You haven&apos;t added any Discount Cards yet.
                </p>
                <p className="text-sm text-gray-400 mt-1">Add a discount card to save on your bookings</p>
              </div>
            </div>
          </div>
          {/* Privacy Settings section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Privacy & Security</h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold text-green-700">Secured</span>
              </div>
            </div>
            <div className="p-6">

              <div className="space-y-4">
                {/* Password Section */}
                <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary-green/30 transition-all bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-green/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m0 0a2 2 0 01-2 2m2-2H9m6 0V9a2 2 0 00-2-2M9 7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Password</h3>
                        <p className="text-xs text-gray-500 mt-1">{getPasswordAge()}</p>
                      </div>
                    </div>
                    <button
                      onClick={openPasswordModal}
                      className="px-4 py-2 text-sm font-semibold text-primary-text bg-primary-green rounded-lg hover:bg-primary-green/90 transition-all shadow-sm hover:shadow-md"
                    >
                      Change
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg px-4 py-2 border border-gray-200">
                    <span className="font-mono">••••••••••••</span>
                    <span className="text-xs text-gray-400">(Hidden for security)</span>
                  </div>
                </div>

                {/* Login Sessions */}
                <div className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary-green/30 transition-all bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Active Sessions</h3>
                        <p className="text-xs text-gray-500 mt-1">Manage your active login sessions</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all">
                      View All
                    </button>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-3 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-900">Current session: Chrome on macOS</span>
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">Active now</span>
                    </div>
                  </div>
                </div>

                {/* Account Deletion */}
                <div className="border-2 border-red-200 rounded-xl p-5 bg-gradient-to-br from-red-50 to-red-100/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-red-900">Delete Account</h3>
                        <p className="text-xs text-red-700 mt-1">Permanently remove your account and data</p>
                      </div>
                    </div>
                    <button
                      onClick={openDeleteModal}
                      className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-sm hover:shadow-md"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit User Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 my-8">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">
                    Edit Passenger Details
                  </h3>
                  <button
                    onClick={closeEditModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Close modal"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* First Name Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.firstName}
                        onChange={(e) =>
                          handleEditInputChange("firstName", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg transition-all text-gray-900 ${
                          formErrors.firstName
                            ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                        }`}
                        placeholder="Enter first name"
                        maxLength={50}
                      />
                      {formErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                      )}
                    </div>

                    {/* Last Name Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.lastName}
                        onChange={(e) =>
                          handleEditInputChange("lastName", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg transition-all text-gray-900 ${
                          formErrors.lastName
                            ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                        }`}
                        placeholder="Enter last name"
                        maxLength={50}
                      />
                      {formErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                      )}
                    </div>

                    {/* Email Input */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) =>
                          handleEditInputChange("email", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg transition-all text-gray-900 ${
                          formErrors.email
                            ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Phone Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) =>
                          handleEditInputChange("phone", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg transition-all text-gray-900 ${
                          formErrors.phone
                            ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                        }`}
                        placeholder="+1234567890"
                      />
                      {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Include country code (e.g., +1234567890)</p>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={editFormData.dateOfBirth}
                        onChange={(e) =>
                          handleEditInputChange("dateOfBirth", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all text-gray-900"
                      />
                    </div>

                    {/* Passport Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        value={editFormData.passportNumber}
                        onChange={(e) =>
                          handleEditInputChange("passportNumber", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg transition-all text-gray-900 ${
                          formErrors.passportNumber
                            ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                        }`}
                        placeholder="AB123456"
                        maxLength={20}
                      />
                      {formErrors.passportNumber && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.passportNumber}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">Letters and numbers only</p>
                    </div>

                    {/* Country of Birth */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country of Birth
                      </label>
                      <input
                        type="text"
                        value={editFormData.countryOfBirth}
                        onChange={(e) =>
                          handleEditInputChange("countryOfBirth", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all text-gray-900"
                        placeholder="Enter country"
                        maxLength={100}
                      />
                    </div>

                    {/* Address Section */}
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-2">Address</h3>
                    </div>

                    {/* Street Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={editFormData.address.street}
                        onChange={(e) =>
                          handleEditInputChange("address.street", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all text-gray-900"
                        placeholder="123 Main St"
                        maxLength={200}
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={editFormData.address.city}
                        onChange={(e) =>
                          handleEditInputChange("address.city", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all text-gray-900"
                        placeholder="New York"
                        maxLength={100}
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={editFormData.address.state}
                        onChange={(e) =>
                          handleEditInputChange("address.state", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all text-gray-900"
                        placeholder="NY"
                        maxLength={100}
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={editFormData.address.postalCode}
                        onChange={(e) =>
                          handleEditInputChange("address.postalCode", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all text-gray-900"
                        placeholder="10001"
                        maxLength={20}
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={editFormData.address.country}
                        onChange={(e) =>
                          handleEditInputChange("address.country", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-primary-green transition-all text-gray-900"
                        placeholder="USA"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Note:</span> These details must match your passport or ID card for travel purposes.
                    </p>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={closeEditModal}
                    disabled={isUpdating}
                    className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      updateUser();
                    }}
                    disabled={isUpdating}
                    className="px-6 py-2.5 bg-primary-green text-primary-text rounded-lg hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-2 font-semibold transition-all shadow-sm"
                  >
                    {isUpdating && (
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Change Password
                  </h3>
                  <button
                    onClick={closePasswordModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Error Message */}
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{passwordError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Current Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordFormData.currentPassword}
                      onChange={(e) =>
                        handlePasswordInputChange("currentPassword", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent text-gray-900"
                      placeholder="Enter current password"
                    />
                  </div>

                  {/* New Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordFormData.newPassword}
                      onChange={(e) =>
                        handlePasswordInputChange("newPassword", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent text-gray-900"
                      placeholder="Enter new password"
                    />
                  </div>

                  {/* Confirm New Password Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordFormData.confirmPassword}
                      onChange={(e) =>
                        handlePasswordInputChange("confirmPassword", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent text-gray-900"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {/* Password Requirements */}
                  <div className="text-xs text-gray-500">
                    <p>Password requirements:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li
                        className={
                          passwordFormData.newPassword?.length >= 8
                            ? "text-green-600"
                            : ""
                        }
                      >
                        At least 8 characters long
                      </li>
                      <li
                        className={
                          /[a-z]/.test(passwordFormData.newPassword)
                            ? "text-green-600"
                            : ""
                        }
                      >
                        Contains lowercase letters
                      </li>
                      <li
                        className={
                          /[A-Z]/.test(passwordFormData.newPassword)
                            ? "text-green-600"
                            : ""
                        }
                      >
                        Contains uppercase letters
                      </li>
                      <li
                        className={
                          /\d/.test(passwordFormData.newPassword)
                            ? "text-green-600"
                            : ""
                        }
                      >
                        Contains numbers
                      </li>
                      <li
                        className={
                          /[!@#$%^&*(),.?":{}|<>]/.test(
                            passwordFormData.newPassword
                          )
                            ? "text-green-600"
                            : ""
                        }
                      >
                        Contains special characters
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closePasswordModal}
                    disabled={isChangingPassword}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={changePassword}
                    disabled={isChangingPassword}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isChangingPassword && (
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-red-900">
                    Delete Account
                  </h3>
                  <button
                    onClick={closeDeleteModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <svg
                      className="w-8 h-8 text-red-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <h4 className="font-medium text-red-900">
                        Warning: This action cannot be undone
                      </h4>
                      <p className="text-sm text-red-700">
                        Deleting your account will permanently remove all your data,
                        bookings, and personal information.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-700">
                      This will permanently delete:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Your profile and personal information</li>
                      <li>• All booking history and travel records</li>
                      <li>• Saved preferences and settings</li>
                      <li>• Any stored payment methods</li>
                    </ul>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type <span className="font-bold text-red-600">DELETE</span>{" "}
                        to confirm:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeDeleteModal}
                    disabled={isDeleting}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteAccount}
                    disabled={isDeleting || deleteConfirmation !== "DELETE"}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isDeleting && (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    {isDeleting ? "Deleting Account..." : "Delete Account Forever"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Rightbar>
    </DashboardLayout>
  );
}

