import { APILINK } from '../config/api';

// Error handling utility
export const handleApiError = (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        switch (status) {
            case 400:
                return { message: 'Bad request. Please check your input.', status };
            case 401:
                return { message: 'Unauthorized. Please login again.', status };
            case 403:
                return { message: 'Forbidden. You don\'t have permission.', status };
            case 404:
                return { message: 'Resource not found.', status };
            case 500:
                return { message: 'Server error. Please try again later.', status };
            default:
                return { message: data?.message || 'An error occurred.', status };
        }
    } else if (error.request) {
        // Network error
        return { message: 'Network error. Please check your connection.', status: 0 };
    } else {
        // Other error
        return { message: error.message || 'An unexpected error occurred.', status: 0 };
    }
};

// Loading state utility
export const createLoadingState = () => ({
    loading: false,
    error: null,
    data: null,
});

// API response formatter
export const formatApiResponse = (response) => {
    if (response && response.data) {
        return {
            success: true,
            data: response.data,
            message: response.message || 'Success',
        };
    }
    return {
        success: false,
        data: null,
        message: 'Invalid response format',
    };
};

// URL builder utility
export const buildApiUrl = (endpoint, params = {}) => {
    const url = new URL(`${APILINK}${endpoint}`);
    
    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key]);
        }
    });
    
    return url.toString();
};

// Request timeout utility
export const createTimeoutPromise = (timeout = 10000) => {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('Request timeout'));
        }, timeout);
    });
};

// Retry utility for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await requestFn();
        } catch (error) {
            if (i === maxRetries - 1) {
                throw error;
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
};

// Cache utility for API responses
export const createApiCache = () => {
    const cache = new Map();
    
    return {
        get: (key) => {
            const item = cache.get(key);
            if (item && Date.now() < item.expiry) {
                return item.data;
            }
            cache.delete(key);
            return null;
        },
        
        set: (key, data, ttl = 5 * 60 * 1000) => { // 5 minutes default
            cache.set(key, {
                data,
                expiry: Date.now() + ttl,
            });
        },
        
        clear: () => cache.clear(),
        
        delete: (key) => cache.delete(key),
    };
};

// Form data utility
export const createFormData = (data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
            if (data[key] instanceof File) {
                formData.append(key, data[key]);
            } else if (typeof data[key] === 'object') {
                formData.append(key, JSON.stringify(data[key]));
            } else {
                formData.append(key, data[key]);
            }
        }
    });
    
    return formData;
}; 