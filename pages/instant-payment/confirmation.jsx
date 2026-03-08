import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Navbar from "@/components/Navbar";
import FullContainer from "@/components/common/FullContainer";
import Container from "@/components/common/Container";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { Check, Download, Share, Receipt, Mail } from "lucide-react";
import { getBreadcrumbSteps } from "@/utils/breadcrumbUtils";
import { BACKEND_API_URL, getHeaders } from "@/config/api";

export default function InstantPaymentConfirmation() {
  const router = useRouter();
  const { transaction_id } = router.query;

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (router.isReady && transaction_id) {
      const fetchTransactionDetails = async () => {
        try {
          setLoading(true);
          setError(null);

          // Use api.oggotrip.com for transactions API
          const apiBaseUrl = process.env.NEXT_PUBLIC_API;
          const response = await axios.put(
            `${apiBaseUrl}/api/transactions/${transaction_id}`,
            {}, // Request body (empty for this update)
            {
              headers: getHeaders(),
            }
          );

          if (response.data.status === "success" && response.data.data) {
            // Combine transaction and revolut data
            const transaction = response.data.data.transaction || {};
            const revolut = response.data.data.revolut || {};

            const paymentData = {
              // Transaction data
              transaction_id: transaction.transaction_id,
              customerName: transaction.customerName,
              email: transaction.email,
              phone: transaction.phone,
              amount: transaction.amount,
              currency: transaction.currency,
              description: transaction.description,
              bookingRef: transaction.bookingRef,
              product: transaction.product,
              createdAt: transaction.createdAt,
              updatedAt: transaction.updatedAt,

              // Revolut data
              revolut_id: revolut.id,
              revolut_token: revolut.token,
              revolut_type: revolut.type,
              revolut_state: revolut.state,
              revolut_amount: revolut.amount,
              revolut_currency: revolut.currency,
              revolut_created_at: revolut.created_at,
              revolut_updated_at: revolut.updated_at,
              checkout_url: revolut.checkout_url,
            };

            setPaymentDetails(paymentData);
          } else {
            throw new Error(
              response.data.message || "Failed to fetch transaction details"
            );
          }
        } catch (err) {
          console.error("Error fetching transaction details:", err);
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load transaction details."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchTransactionDetails();
    } else if (router.isReady && !transaction_id) {
      setError("Transaction ID is required");
      setLoading(false);
    }
  }, [router.isReady, transaction_id]);

  const formatDate = (dateString) => {
    if (!dateString)
      return new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString)
      return new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatAmount = (amount, currency) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <FullContainer className="py-12 min-h-screen">
          <Container>
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </Container>
        </FullContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <FullContainer className="py-12 min-h-screen">
          <Container>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </Container>
        </FullContainer>
      </div>
    );
  }

  return (
    <FullContainer className="py-10 min-h-screen bg-gray-50">
      <Container className="max-w-screen-md mx-auto">
        <div className="space-y-6">
          {/* Payment Confirmation Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-200/20 border-2 border-green-200 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary-text mb-2">
              Payment Confirmed!
            </h1>
            <p className="text-base text-gray-600 mb-4">
              Your payment has been successfully processed.
            </p>
            {paymentDetails?.transaction_id && (
              <div className="bg-stone-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Receipt className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">
                    Transaction ID
                  </span>
                </div>
                <p className="text-lg font-bold text-primary-text font-mono">
                  {paymentDetails.transaction_id}
                </p>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>
                Payment confirmation email has been sent to your registered
                email address.
              </span>
            </div>
          </div>

          {/* Payment Summary Card */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-xl font-bold text-primary-text mb-6 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Payment Summary
            </h2>
            <div className="space-y-2">
              {paymentDetails?.description && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-gray-600 font-medium">Description</span>
                  <span className="font-semibold text-primary-text">
                    {paymentDetails.description}
                  </span>
                </div>
              )}
              {paymentDetails?.bookingRef && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-gray-600 font-medium">
                    Booking Reference
                  </span>
                  <span className="font-semibold text-primary-text">
                    {paymentDetails.bookingRef}
                  </span>
                </div>
              )}
              {paymentDetails?.product && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-gray-600 font-medium">Product</span>
                  <span className="font-semibold text-primary-text">
                    {paymentDetails.product}
                  </span>
                </div>
              )}
              {paymentDetails?.customerName && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-gray-600 font-medium">Customer</span>
                  <span className="font-semibold text-primary-text">
                    {paymentDetails.customerName}
                  </span>
                </div>
              )}
              {paymentDetails?.email && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-gray-600 font-medium">Email</span>
                  <span className="font-semibold text-primary-text">
                    {paymentDetails.email}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-gray-600 font-medium">Payment Date</span>
                <span className="font-semibold text-primary-text">
                  {formatDate(paymentDetails?.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-gray-600 font-medium">Payment Time</span>
                <span className="font-semibold text-primary-text">
                  {formatTime(paymentDetails?.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-stone-100">
                <span className="text-gray-600 font-medium">Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    paymentDetails?.revolut_state === "COMPLETED" ||
                    paymentDetails?.revolut_state === "AUTHORISED"
                      ? "bg-green-100 text-green-800"
                      : paymentDetails?.revolut_state === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : paymentDetails?.revolut_state === "FAILED" ||
                        paymentDetails?.revolut_state === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {(paymentDetails?.revolut_state || "PENDING").toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 bg-stone-50 rounded-lg px-4 -mx-4">
                <span className="text-lg font-bold text-primary-text">
                  Amount Paid
                </span>
                <span className="text-2xl font-bold text-primary-text">
                  {formatAmount(
                    paymentDetails?.amount,
                    paymentDetails?.currency || "USD"
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Details Card */}
          {(paymentDetails?.revolut_id ||
            paymentDetails?.revolut_type ||
            paymentDetails?.phone) && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
              <h3 className="text-lg font-bold text-primary-text mb-4">
                Payment Details
              </h3>
              <div className="space-y-2">
                {paymentDetails?.revolut_id && (
                  <div className="flex justify-between items-center py-2 border-b border-stone-100">
                    <span className="text-gray-600 font-medium">
                      Revolut Order ID
                    </span>
                    <span className="font-semibold text-primary-text font-mono text-sm">
                      {paymentDetails.revolut_id}
                    </span>
                  </div>
                )}
                {paymentDetails?.revolut_type && (
                  <div className="flex justify-between items-center py-2 border-b border-stone-100">
                    <span className="text-gray-600 font-medium">
                      Payment Type
                    </span>
                    <span className="font-semibold text-primary-text capitalize">
                      {paymentDetails.revolut_type}
                    </span>
                  </div>
                )}
                {paymentDetails?.phone && (
                  <div className="flex justify-between items-center py-2 border-b border-stone-100">
                    <span className="text-gray-600 font-medium">Phone</span>
                    <span className="font-semibold text-primary-text">
                      {paymentDetails.phone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Currency</span>
                  <span className="font-semibold text-primary-text">
                    {paymentDetails?.currency || "USD"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps Card */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-lg font-bold text-primary-text mb-4">
              Next Steps
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-primary-green" />
                </div>
                <span className="text-sm text-gray-700">
                  Check your email for payment confirmation and receipt
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-primary-green" />
                </div>
                <span className="text-sm text-gray-700">
                  Save this page or download the invoice for your records
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-primary-green" />
                </div>
                <span className="text-sm text-gray-700">
                  Need help? Contact our support team
                </span>
              </div>
            </div>

            <div className="flex gap-3 items-center justify-center pt-4 border-t border-stone-200">
              <button className="flex items-center gap-2 bg-primary-green hover:bg-primary-green/90 text-primary-text px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md">
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
              <button className="flex items-center gap-2 bg-primary-text hover:bg-primary-text/90 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md">
                <Share className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Receipt className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Payment Receipt
                </p>
                <p className="text-xs text-blue-800">
                  This is your official payment receipt. Please keep this for
                  your records. You can download or print this page for your
                  accounting purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </FullContainer>
  );
}
