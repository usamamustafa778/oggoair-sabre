// Revolut Payment Service - Comprehensive API wrapper
import axios from 'axios';

class RevolutService {
    constructor() {
        this.baseURL = '/api/payments/revolut';
    }

    // Create a new order
    async createOrder(amount, currency = 'GBP', metadata = {}) {
        try {
            const response = await axios.post(`${this.baseURL}/create-order`, {
                amount,
                currency,
                metadata
            });
            return response.data;
        } catch (error) {
            console.error('Error creating Revolut order:', error);
            throw error;
        }
    }

    // Retrieve a specific order
    async getOrder(orderId) {
        try {
            const response = await axios.get(`${this.baseURL}/retrieve-order?orderId=${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error retrieving Revolut order:', error);
            throw error;
        }
    }

    // Retrieve list of orders with filtering
    async getOrders(filters = {}) {
        try {
            const queryParams = new URLSearchParams();
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    queryParams.append(key, filters[key]);
                }
            });

            const response = await axios.get(`${this.baseURL}/retrieve-orders?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error retrieving Revolut orders:', error);
            throw error;
        }
    }

    // Get payments for a specific order
    async getOrderPayments(orderId) {
        try {
            const response = await axios.get(`${this.baseURL}/order-payments?orderId=${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error retrieving order payments:', error);
            throw error;
        }
    }

    // Capture an authorized order
    async captureOrder(orderId, amount = null) {
        try {
            const response = await axios.post(`${this.baseURL}/capture-order`, {
                orderId,
                amount
            });
            return response.data;
        } catch (error) {
            console.error('Error capturing Revolut order:', error);
            throw error;
        }
    }

    // Check order status and completion
    async getOrderStatus(orderId) {
        try {
            const response = await axios.get(`${this.baseURL}/order-status?orderId=${orderId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking order status:', error);
            throw error;
        }
    }

    // Process Apple Pay payment
    async payWithApple(orderId, token, amount, currency = 'GBP', metadata = {}) {
        try {
            const response = await axios.post(`${this.baseURL}/pay-with-apple`, {
                orderId,
                token,
                amount,
                currency,
                metadata
            });
            return response.data;
        } catch (error) {
            console.error('Error processing Apple Pay payment:', error);
            throw error;
        }
    }

    // Process Google Pay payment
    async payWithGoogle(orderId, token, amount, currency = 'GBP', metadata = {}) {
        try {
            const response = await axios.post(`${this.baseURL}/pay-with-google`, {
                orderId,
                token,
                amount,
                currency,
                metadata
            });
            return response.data;
        } catch (error) {
            console.error('Error processing Google Pay payment:', error);
            throw error;
        }
    }

    // Utility methods for common operations
    async isOrderCompleted(orderId) {
        try {
            const status = await this.getOrderStatus(orderId);
            return status.data?.isCompleted || false;
        } catch (error) {
            console.error('Error checking order completion:', error);
            return false;
        }
    }

    async isOrderAuthorized(orderId) {
        try {
            const status = await this.getOrderStatus(orderId);
            return status.data?.isAuthorized || false;
        } catch (error) {
            console.error('Error checking order authorization:', error);
            return false;
        }
    }

    async getOrderSummary(orderId) {
        try {
            const [order, payments, status] = await Promise.all([
                this.getOrder(orderId),
                this.getOrderPayments(orderId),
                this.getOrderStatus(orderId)
            ]);

            return {
                order: order.data,
                payments: payments.data,
                status: status.data,
                summary: {
                    totalAmount: order.data?.amount,
                    currency: order.data?.currency,
                    state: order.data?.state,
                    paymentCount: payments.data?.length || 0,
                    isCompleted: status.data?.isCompleted,
                    hasSuccessfulPayments: status.data?.successfulPayments?.length > 0
                }
            };
        } catch (error) {
            console.error('Error getting order summary:', error);
            throw error;
        }
    }

    // Monitor order status with polling
    async monitorOrderStatus(orderId, maxAttempts = 30, intervalMs = 2000) {
        return new Promise((resolve, reject) => {
            let attempts = 0;

            const checkStatus = async () => {
                try {
                    attempts++;
                    const status = await this.getOrderStatus(orderId);

                    if (status.data?.isCompleted) {
                        resolve(status.data);
                        return;
                    }

                    if (status.data?.isFailed || status.data?.isCancelled) {
                        reject(new Error(`Order ${orderId} failed or was cancelled`));
                        return;
                    }

                    if (attempts >= maxAttempts) {
                        reject(new Error(`Order ${orderId} monitoring timeout after ${maxAttempts} attempts`));
                        return;
                    }

                    setTimeout(checkStatus, intervalMs);
                } catch (error) {
                    reject(error);
                }
            };

            checkStatus();
        });
    }
}

// Export singleton instance
export const revolutService = new RevolutService();
export default revolutService;
