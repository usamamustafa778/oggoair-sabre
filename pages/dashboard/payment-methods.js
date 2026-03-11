import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/Booking.jsx/DashboardLayout";
import Rightbar from "../../components/Booking.jsx/layout";
import { BACKEND_API_URL, tokenUtils } from "../../config/api";
import Seo from "@/components/Seo";

export default function PaymentMethodsPage() {
  const [activeTab, setActiveTab] = useState("methods");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingMethod, setAddingMethod] = useState(false);
  
  // Form state for adding payment method
  const [newMethod, setNewMethod] = useState({
    paymentMethodId: "",
    provider: "revolut",
    type: "card",
    cardBrand: "visa",
    last4: "",
    expiryMonth: "",
    expiryYear: "",
    nickname: "",
    isDefault: false,
  });

  useEffect(() => {
    if (activeTab === "methods") {
      fetchPaymentMethods();
    } else {
      fetchPaymentHistory();
    }
  }, [activeTab, currentPage, statusFilter]);

  const safeJson = async (response) => {
    const contentType = response.headers?.get?.("content-type") || "";
    if (contentType.includes("application/json")) return response.json();
    const text = await response.text().catch(() => "");
    throw new Error(
      `Expected JSON but got "${contentType || "unknown"}" (status ${
        response.status
      }). ${text ? `Body starts: ${text.slice(0, 80)}` : ""}`
    );
  };

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = tokenUtils.getToken();
      if (!token) {
        setError("Please login to view payment methods");
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_API_URL}/api/payments/methods`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch payment methods");
      }

      const methods =
        data.data?.data?.paymentMethods ||
        data.data?.paymentMethods ||
        data.paymentMethods ||
        [];
      setPaymentMethods(Array.isArray(methods) ? methods : []);
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      setError(err.message || "Failed to load payment methods");
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = tokenUtils.getToken();
      if (!token) {
        setError("Please login to view payment history");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("limit", "10");
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(
        `${BACKEND_API_URL}/api/payments/history?${params.toString()}`,
        {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
      );

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch payment history");
      }

      const txns =
        data.data?.data?.transactions ||
        data.data?.transactions ||
        data.transactions ||
        [];
      const pag =
        data.data?.data?.pagination || data.data?.pagination || data.pagination;

      setTransactions(Array.isArray(txns) ? txns : []);
      setPagination(pag);
    } catch (err) {
      console.error("Error fetching payment history:", err);
      setError(err.message || "Failed to load payment history");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newMethod.paymentMethodId || !newMethod.provider || !newMethod.type) {
      alert("Payment Method ID, Provider, and Type are required");
      return;
    }

    if (newMethod.type === "card") {
      if (!newMethod.last4 || newMethod.last4.length !== 4) {
        alert("Last 4 digits must be exactly 4 characters");
        return;
      }
      if (!newMethod.expiryMonth || !newMethod.expiryYear) {
        alert("Expiry month and year are required for cards");
        return;
      }
    }

    setAddingMethod(true);
    try {
      const token = tokenUtils.getToken();
      const response = await fetch(`${BACKEND_API_URL}/api/payments/methods`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(newMethod),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to add payment method");
      }

      alert("Payment method added successfully!");
      setShowAddModal(false);
      setNewMethod({
        paymentMethodId: "",
        provider: "revolut",
        type: "card",
        cardBrand: "visa",
        last4: "",
        expiryMonth: "",
        expiryYear: "",
        nickname: "",
        isDefault: false,
      });
      fetchPaymentMethods();
    } catch (err) {
      alert(err.message || "Failed to add payment method");
    } finally {
      setAddingMethod(false);
    }
  };

  const handleRemoveMethod = async (methodId) => {
    if (!confirm("Are you sure you want to remove this payment method?"))
      return;

    try {
      const token = tokenUtils.getToken();
      const response = await fetch(
        `${BACKEND_API_URL}/api/payments/methods/${methodId}`,
        {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
      );

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove payment method");
      }

      fetchPaymentMethods();
    } catch (err) {
      alert(err.message || "Failed to remove payment method");
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      const token = tokenUtils.getToken();
      const response = await fetch(
        `${BACKEND_API_URL}/api/payments/methods/${methodId}/default`,
        {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
      );

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to set default payment method");
      }

      fetchPaymentMethods();
    } catch (err) {
      alert(err.message || "Failed to set default payment method");
    }
  };

  const getCardIcon = (brand) => {
    switch (brand?.toLowerCase()) {
      case "visa":
        return "💳";
      case "mastercard":
        return "💳";
      case "amex":
        return "💳";
      default:
        return "💳";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "paid":
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
      case "created":
      case "initiated":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "failed":
      case "canceled":
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <DashboardLayout>
      <Seo title="Payment Methods" noindex />
      <Rightbar>
        <div className="w-full space-y-6">
          {/* Header with Tabs */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveTab("methods");
                  setCurrentPage(1);
                }}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all ${
                  activeTab === "methods"
                    ? "text-primary-text bg-primary-green/5 border-b-3 border-primary-green"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="hidden sm:inline">Saved Payment Methods</span>
                <span className="sm:hidden">Payment Methods</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("history");
                  setCurrentPage(1);
                }}
                className={`flex-1 px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold transition-all ${
                  activeTab === "history"
                    ? "text-primary-text bg-primary-green/5 border-b-3 border-primary-green"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="hidden sm:inline">Payment History</span>
                <span className="sm:hidden">History</span>
              </button>
            </div>
          </div>

          {/* Content */}
          {activeTab === "methods" ? (
            <div className="space-y-4">
              {/* Add Payment Method Button */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <p className="text-gray-600 text-xs sm:text-sm">
                  Manage your saved payment methods for quick checkout
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 bg-primary-green text-primary-text rounded-lg font-semibold hover:bg-primary-green/90 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="hidden sm:inline">Add Payment Method</span>
                  <span className="sm:hidden">Add Method</span>
                </button>
              </div>

              {/* Payment Methods List */}
              {loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="animate-pulse space-y-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <div className="text-red-500 mb-4">
                    <svg
                      className="w-12 h-12 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-red-900 font-semibold mb-2">
                    Failed to Load
                  </p>
                  <p className="text-red-700 text-sm">{error}</p>
                  <button
                    onClick={fetchPaymentMethods}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 md:p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                    No Payment Methods Saved
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 max-w-md mx-auto mb-4">
                    Add a payment method for faster checkout on your next booking.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-primary-green text-primary-text rounded-lg font-semibold hover:bg-primary-green/90 transition-all"
                  >
                    Add Your First Payment Method
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                          <div className="text-3xl sm:text-4xl flex-shrink-0">{getCardIcon(method.cardBrand)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                                {method.nickname ||
                                  `${method.cardBrand?.toUpperCase()} ${method.last4}`}
                              </p>
                              {method.isDefault && (
                                <span className="px-2 py-1 bg-primary-green text-primary-text text-xs font-semibold rounded-full flex-shrink-0">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                              {method.cardBrand && (
                                <span className="font-medium">
                                  {method.cardBrand.toUpperCase()}
                                </span>
                              )}
                              {method.last4 && (
                                <span>•••• {method.last4}</span>
                              )}
                              {method.expiryMonth && method.expiryYear && (
                                <span>
                                  Exp {method.expiryMonth}/{method.expiryYear}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {method.provider?.charAt(0).toUpperCase() +
                                method.provider?.slice(1)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-end sm:justify-start flex-shrink-0">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefault(method.id)}
                            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-primary-green hover:bg-primary-green/10 rounded-lg transition-colors whitespace-nowrap"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMethod(method.id)}
                          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Status Filter */}
              <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Filter by Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setStatusFilter("");
                      setCurrentPage(1);
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === ""
                        ? "bg-primary-green text-primary-text shadow-md"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("completed");
                      setCurrentPage(1);
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === "completed"
                        ? "bg-green-500 text-primary-text shadow-md"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300"
                    }`}
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("pending");
                      setCurrentPage(1);
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === "pending"
                        ? "bg-orange-500 text-primary-text shadow-md"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter("failed");
                      setCurrentPage(1);
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      statusFilter === "failed"
                        ? "bg-red-500 text-primary-text shadow-md"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300"
                    }`}
                  >
                    Failed
                  </button>
                </div>
              </div>

              {/* Payment History List */}
              {loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="animate-pulse space-y-4">
                    <div className="h-24 bg-gray-200 rounded"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <p className="text-red-900 font-semibold mb-2">
                    Failed to Load
                  </p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Transactions Found
                  </h3>
                  <p className="text-gray-500">
                    {statusFilter
                      ? `No ${statusFilter} transactions found.`
                      : "You haven't made any payments yet."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <p className="font-semibold text-gray-900 text-sm sm:text-base break-all">
                                {transaction.transaction_id}
                              </p>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusColor(
                                  transaction.status
                                )} inline-block w-fit`}
                              >
                                {transaction.status}
                              </span>
                            </div>
                            {transaction.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                                {transaction.description}
                              </p>
                            )}
                            {transaction.product && (
                              <p className="text-xs text-gray-500">
                                {transaction.product}
                              </p>
                            )}
                          </div>
                          <div className="text-left sm:text-right flex-shrink-0">
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">
                              {transaction.currency} {transaction.amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>

                        {transaction.bookingRef && (
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-xs sm:text-sm text-gray-600">
                              <span className="font-medium">Booking:</span>{" "}
                              {transaction.bookingRef}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 flex-wrap">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="hidden sm:inline">← Previous</span>
                      <span className="sm:hidden">←</span>
                    </button>

                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first page, last page, current page, and pages around current
                        return page === 1 || 
                               page === pagination.pages || 
                               Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsis && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                            <button
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                page === currentPage
                                  ? "bg-primary-green text-primary-text shadow-md"
                                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      disabled={currentPage === pagination.pages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pagination.pages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="hidden sm:inline">Next →</span>
                      <span className="sm:hidden">→</span>
                    </button>
                  </div>
                )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Add Payment Method Modal - Mobile Responsive */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-primary-green to-primary-green/80 text-primary-text px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0">
                <h2 className="text-lg sm:text-2xl font-bold">Add Payment Method</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-primary-text hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddPaymentMethod} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMethod.paymentMethodId}
                    onChange={(e) => setNewMethod({ ...newMethod, paymentMethodId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                    placeholder="pm_1234567890abcdef"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Provider <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newMethod.provider}
                      onChange={(e) => setNewMethod({ ...newMethod, provider: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                      required
                    >
                      <option value="revolut">Revolut</option>
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newMethod.type}
                      onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                      required
                    >
                      <option value="card">Card</option>
                      <option value="bank_account">Bank Account</option>
                      <option value="wallet">Wallet</option>
                    </select>
                  </div>
                </div>

                {newMethod.type === "card" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Card Brand
                        </label>
                        <select
                          value={newMethod.cardBrand}
                          onChange={(e) => setNewMethod({ ...newMethod, cardBrand: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                        >
                          <option value="visa">Visa</option>
                          <option value="mastercard">Mastercard</option>
                          <option value="amex">American Express</option>
                          <option value="discover">Discover</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last 4 Digits <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newMethod.last4}
                          onChange={(e) => setNewMethod({ ...newMethod, last4: e.target.value.slice(0, 4) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                          placeholder="1234"
                          maxLength={4}
                          pattern="[0-9]{4}"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Expiry Month <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newMethod.expiryMonth}
                          onChange={(e) => setNewMethod({ ...newMethod, expiryMonth: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                        >
                          <option value="">Month</option>
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = String(i + 1).padStart(2, "0");
                            return (
                              <option key={month} value={month}>
                                {month}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Expiry Year <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newMethod.expiryYear}
                          onChange={(e) => setNewMethod({ ...newMethod, expiryYear: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                        >
                          <option value="">Year</option>
                          {Array.from({ length: 15 }, (_, i) => {
                            const year = new Date().getFullYear() + i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nickname (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMethod.nickname}
                    onChange={(e) => setNewMethod({ ...newMethod, nickname: e.target.value.slice(0, 50) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent outline-none text-gray-900 text-sm sm:text-base"
                    placeholder="Personal Visa"
                    maxLength={50}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newMethod.isDefault}
                    onChange={(e) => setNewMethod({ ...newMethod, isDefault: e.target.checked })}
                    className="w-5 h-5 text-primary-green rounded focus:ring-2 focus:ring-primary-green"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">
                    Set as default payment method
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={addingMethod}
                    className="w-full sm:flex-1 px-6 py-3 bg-primary-green text-primary-text rounded-lg font-semibold hover:bg-primary-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {addingMethod ? "Adding..." : "Add Payment Method"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-full sm:flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Rightbar>
    </DashboardLayout>
  );
}

