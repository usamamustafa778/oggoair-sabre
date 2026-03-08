import { useState } from "react";
import { revolutService } from "../services/revolutService";

export default function TestRevolut() {
    const [orderId, setOrderId] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testCreateOrder = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await revolutService.createOrder(100.00, 'GBP', {
                test: true,
                timestamp: new Date().toISOString()
            });
            setResults({ type: 'create', data: result });
            setOrderId(result.data?.id || '');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testGetOrder = async () => {
        if (!orderId) {
            setError("Please enter an order ID");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await revolutService.getOrder(orderId);
            setResults({ type: 'get', data: result });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testGetOrderStatus = async () => {
        if (!orderId) {
            setError("Please enter an order ID");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await revolutService.getOrderStatus(orderId);
            setResults({ type: 'status', data: result });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testGetOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await revolutService.getOrders({ limit: 10 });
            setResults({ type: 'list', data: result });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testGetOrderPayments = async () => {
        if (!orderId) {
            setError("Please enter an order ID");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await revolutService.getOrderPayments(orderId);
            setResults({ type: 'payments', data: result });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testCaptureOrder = async () => {
        if (!orderId) {
            setError("Please enter an order ID");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await revolutService.captureOrder(orderId);
            setResults({ type: 'capture', data: result });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const testMonitorOrder = async () => {
        if (!orderId) {
            setError("Please enter an order ID");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await revolutService.monitorOrderStatus(orderId, 5, 2000);
            setResults({ type: 'monitor', data: result });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        🧪 Revolut API Testing
                    </h1>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Order ID (for testing specific order)
                            </label>
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Enter order ID"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={testCreateOrder}
                                disabled={loading}
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                            >
                                {loading ? "Loading..." : "Create Test Order"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        <button
                            onClick={testGetOrder}
                            disabled={loading || !orderId}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
                        >
                            Get Order
                        </button>

                        <button
                            onClick={testGetOrderStatus}
                            disabled={loading || !orderId}
                            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 disabled:bg-gray-400"
                        >
                            Get Status
                        </button>

                        <button
                            onClick={testGetOrders}
                            disabled={loading}
                            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 disabled:bg-gray-400"
                        >
                            List Orders
                        </button>

                        <button
                            onClick={testGetOrderPayments}
                            disabled={loading || !orderId}
                            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:bg-gray-400"
                        >
                            Get Payments
                        </button>

                        <button
                            onClick={testCaptureOrder}
                            disabled={loading || !orderId}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-gray-400"
                        >
                            Capture Order
                        </button>

                        <button
                            onClick={testMonitorOrder}
                            disabled={loading || !orderId}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:bg-gray-400"
                        >
                            Monitor Order
                        </button>
                    </div>

                    {results && (
                        <div className="bg-gray-50 border rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                📊 Test Results - {results.type.toUpperCase()}
                            </h3>
                            <pre className="bg-white p-3 rounded border overflow-auto max-h-96 text-sm">
                                {JSON.stringify(results.data, null, 2)}
                            </pre>
                        </div>
                    )}

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">
                            💡 Testing Tips
                        </h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Start by creating a test order</li>
                            <li>• Use the order ID to test other endpoints</li>
                            <li>• Check the confirmation page for real order IDs</li>
                            <li>• Monitor orders to see status changes</li>
                            <li>• Test with different payment methods</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
