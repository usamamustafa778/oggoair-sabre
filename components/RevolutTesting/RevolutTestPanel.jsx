import { useState, useEffect } from "react";
import { revolutService } from "../../services/revolutService";
import { useRouter } from "next/router";

export default function RevolutTestPanel() {
  const router = useRouter();
  const { order_id, booking_id } = router.query;

  const [orderStatus, setOrderStatus] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderPayments, setOrderPayments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [currentPath, setCurrentPath] = useState("");

  // Only set path on client side to avoid hydration mismatch
  useEffect(() => {
    if (router.isReady) {
      setCurrentPath(router.asPath);
    }
  }, [router.isReady, router.asPath]);

  // Auto-check order status when order_id is available
  useEffect(() => {
    if (order_id) {
      checkOrderStatus();
    }
  }, [order_id]);

  const checkOrderStatus = async () => {
    if (!order_id) {
      setError("No order ID found in URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const status = await revolutService.getOrderStatus(order_id);
      setOrderStatus(status.data);
      addTestResult("✅ Order Status Retrieved", status.data);
    } catch (err) {
      setError(err.message);
      addTestResult("❌ Order Status Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const getOrderDetails = async () => {
    if (!order_id) {
      setError("No order ID found in URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const details = await revolutService.getOrder(order_id);
      setOrderDetails(details.data);
      addTestResult("✅ Order Details Retrieved", details.data);
    } catch (err) {
      setError(err.message);
      addTestResult("❌ Order Details Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const getOrderPayments = async () => {
    if (!order_id) {
      setError("No order ID found in URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payments = await revolutService.getOrderPayments(order_id);
      setOrderPayments(payments.data);
      addTestResult("✅ Order Payments Retrieved", payments.data);
    } catch (err) {
      setError(err.message);
      addTestResult("❌ Order Payments Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const captureOrder = async () => {
    if (!order_id) {
      setError("No order ID found in URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await revolutService.captureOrder(order_id);
      addTestResult("✅ Order Captured", result.data);
      // Refresh status after capture
      setTimeout(checkOrderStatus, 1000);
    } catch (err) {
      setError(err.message);
      addTestResult("❌ Order Capture Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const monitorOrder = async () => {
    if (!order_id) {
      setError("No order ID found in URL");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      addTestResult("🔄 Monitoring Order...", "Starting monitoring");
      const result = await revolutService.monitorOrderStatus(
        order_id,
        10,
        2000
      );
      addTestResult("✅ Order Monitoring Complete", result);
      setOrderStatus(result);
    } catch (err) {
      setError(err.message);
      addTestResult("❌ Order Monitoring Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTestResult = (action, data) => {
    const result = {
      timestamp: new Date().toLocaleTimeString(),
      action,
      data: typeof data === "object" ? JSON.stringify(data, null, 2) : data,
    };
    setTestResults((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const clearResults = () => {
    setTestResults([]);
  };

  if (!order_id) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <h3 className="font-semibold">Revolut Test Panel</h3>
        <p>
          No order ID found in URL. This panel appears when you have an order_id
          in the URL.
        </p>
        {currentPath && (
          <p className="text-sm mt-1">Current URL: {currentPath}</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-blue-300 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-blue-800">
          🧪 Revolut Test Panel
        </h3>
        <div className="text-sm text-gray-600">
          Order ID:{" "}
          <code className="bg-gray-100 px-2 py-1 rounded">{order_id}</code>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Test Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={checkOrderStatus}
          disabled={loading}
          className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Loading..." : "Check Status"}
        </button>

        <button
          onClick={getOrderDetails}
          disabled={loading}
          className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
        >
          Get Details
        </button>

        <button
          onClick={getOrderPayments}
          disabled={loading}
          className="bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600 disabled:bg-gray-400"
        >
          Get Payments
        </button>

        <button
          onClick={captureOrder}
          disabled={loading}
          className="bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600 disabled:bg-gray-400"
        >
          Capture Order
        </button>

        <button
          onClick={monitorOrder}
          disabled={loading}
          className="bg-indigo-500 text-white px-3 py-2 rounded text-sm hover:bg-indigo-600 disabled:bg-gray-400"
        >
          Monitor Order
        </button>

        <button
          onClick={clearResults}
          className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      {/* Order Status Display */}
      {orderStatus && (
        <div className="bg-gray-50 border rounded p-3 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">📊 Order Status</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <strong>State:</strong>{" "}
              <span
                className={`px-2 py-1 rounded text-xs ${
                  orderStatus.isCompleted
                    ? "bg-green-100 text-green-800"
                    : orderStatus.isAuthorized
                    ? "bg-yellow-100 text-yellow-800"
                    : orderStatus.isFailed
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {orderStatus.state}
              </span>
            </div>
            <div>
              <strong>Amount:</strong> {orderStatus.amount}{" "}
              {orderStatus.currency}
            </div>
            <div>
              <strong>Completed:</strong>{" "}
              {orderStatus.isCompleted ? "✅" : "❌"}
            </div>
            <div>
              <strong>Authorized:</strong>{" "}
              {orderStatus.isAuthorized ? "✅" : "❌"}
            </div>
            <div>
              <strong>Payments:</strong> {orderStatus.payments?.length || 0}
            </div>
            <div>
              <strong>Successful:</strong>{" "}
              {orderStatus.successfulPayments?.length || 0}
            </div>
          </div>
        </div>
      )}

      {/* Order Details Display */}
      {orderDetails && (
        <div className="bg-gray-50 border rounded p-3 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">📋 Order Details</h4>
          <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(orderDetails, null, 2)}
          </pre>
        </div>
      )}

      {/* Order Payments Display */}
      {orderPayments && (
        <div className="bg-gray-50 border rounded p-3 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">
            💳 Order Payments
          </h4>
          <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(orderPayments, null, 2)}
          </pre>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-gray-50 border rounded p-3">
          <h4 className="font-semibold text-gray-800 mb-2">📝 Test Results</h4>
          <div className="space-y-1 max-h-40 overflow-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className="text-xs bg-white p-2 rounded border-l-4 border-blue-400"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{result.action}</span>
                  <span className="text-gray-500">{result.timestamp}</span>
                </div>
                <pre className="mt-1 text-gray-600 overflow-auto">
                  {result.data}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
