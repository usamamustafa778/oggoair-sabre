/**
 * Price Converter Utility
 * Converts USD prices to EUR/GBP/USD for display purposes using live exchange rates
 */

// Currency constants
export const CURRENCIES = {
    EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
    GBP: { code: 'GBP', symbol: '£', name: 'Pound' },
    USD: { code: 'USD', symbol: '$', name: 'Dollar' },
};

// Default currency
const DEFAULT_CURRENCY = 'EUR';

// localStorage key for selected currency
const CURRENCY_STORAGE_KEY = 'oggoair_selected_currency';

// Fallback exchange rates (used if API fails or is not configured)
const FALLBACK_RATES = {
    EUR: 0.92, // 1 USD = 0.92 EUR
    GBP: 0.79, // 1 USD = 0.79 GBP
    USD: 1.0,  // 1 USD = 1.0 USD
};

// Cache for exchange rates to avoid too many API calls
// Structure: { currency: { rate, timestamp, source } }
let exchangeRateCache = {
    EUR: {
        rate: FALLBACK_RATES.EUR,
        timestamp: 0,
        source: 'fallback',
    },
    GBP: {
        rate: FALLBACK_RATES.GBP,
        timestamp: 0,
        source: 'fallback',
    },
    USD: {
        rate: FALLBACK_RATES.USD,
        timestamp: 0,
        source: 'fallback',
    },
};

// Cache duration: 1 hour (3600000 ms)
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * Get selected currency from localStorage or return default
 * @returns {string} Currency code (EUR, GBP, or USD)
 */
export const getSelectedCurrency = () => {
    if (typeof window === 'undefined') return DEFAULT_CURRENCY;
    try {
        const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
        if (stored && (stored === 'EUR' || stored === 'GBP' || stored === 'USD')) {
            return stored;
        }
    } catch (error) {
        console.warn('Failed to read currency from localStorage:', error);
    }
    return DEFAULT_CURRENCY;
};

/**
 * Set selected currency in localStorage and dispatch event for components to update
 * @param {string} currency - Currency code (EUR, GBP, or USD)
 */
export const setSelectedCurrency = (currency) => {
    if (typeof window === 'undefined') return;
    if (currency !== 'EUR' && currency !== 'GBP' && currency !== 'USD') {
        console.warn('Invalid currency:', currency);
        return;
    }
    try {
        localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
        // Dispatch custom event to notify components of currency change
        window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency } }));
    } catch (error) {
        console.warn('Failed to save currency to localStorage:', error);
    }
};

/**
 * Fetch latest USD to target currency exchange rate from API
 * @param {string} currency - Currency code (EUR, GBP, or USD)
 * @returns {Promise<number>} The exchange rate
 */
async function fetchExchangeRate(currency = 'EUR') {
    // USD always returns 1.0
    if (currency === 'USD') {
        return 1.0;
    }

    // Check if we have a valid cached rate for this currency
    const now = Date.now();
    const cache = exchangeRateCache[currency] || { rate: FALLBACK_RATES[currency], timestamp: 0, source: 'fallback' };

    if (
        cache.timestamp &&
        now - cache.timestamp < CACHE_DURATION &&
        cache.source === 'api'
    ) {
        return cache.rate;
    }

    try {
        // Fetch from our API route (which keeps the API key secure)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        let response;
        try {
            response = await fetch(`/api/exchange-rates/latest?currency=${currency}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal,
                cache: 'no-cache',
            });
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error('Request timeout - API took too long to respond');
            }
            throw fetchError;
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Failed to fetch exchange rate: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.rate) {
            // Update cache for this currency
            exchangeRateCache[currency] = {
                rate: data.rate,
                timestamp: now,
                source: data.source || 'api',
            };
            return data.rate;
        } else {
            throw new Error('Invalid response from exchange rate API');
        }
    } catch (error) {
        // If we have a cached rate (even if expired), use it
        if (cache.rate && cache.rate !== FALLBACK_RATES[currency]) {
            return cache.rate;
        }
        // Otherwise use fallback
        return FALLBACK_RATES[currency] || FALLBACK_RATES.EUR;
    }
}

/**
 * Get current exchange rate (synchronous - uses cache)
 * @param {string} currency - Currency code (EUR, GBP, or USD). If not provided, uses selected currency
 * @returns {number} Current USD to target currency exchange rate
 */
export const getExchangeRate = (currency = null) => {
    const targetCurrency = currency || getSelectedCurrency();
    const cache = exchangeRateCache[targetCurrency] || { rate: FALLBACK_RATES[targetCurrency] };
    return cache.rate || FALLBACK_RATES[targetCurrency] || FALLBACK_RATES.EUR;
};

/**
 * Initialize exchange rate by fetching from API
 * Call this on app load or when you need fresh rates
 * @param {string} currency - Currency code (EUR, GBP, or USD). If not provided, uses selected currency
 * @returns {Promise<number>} The exchange rate
 */
export const initializeExchangeRate = async (currency = null) => {
    const targetCurrency = currency || getSelectedCurrency();
    const rate = await fetchExchangeRate(targetCurrency);
    return rate;
};

/**
 * Convert USD amount to target currency
 * @param {number|string} usdAmount - The amount in USD
 * @param {object} options - Conversion options
 * @param {boolean} options.useLiveRate - Whether to fetch latest rate (default: false, uses cache)
 * @param {string} options.currency - Target currency (EUR, GBP, USD). If not provided, uses selected currency
 * @returns {Promise<number>} The converted amount in target currency
 */
export const convertUsdToCurrency = async (usdAmount, options = {}) => {
    const { useLiveRate = false, currency = null } = options;

    if (!usdAmount && usdAmount !== 0) {
        return 0;
    }

    const usd = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;

    if (isNaN(usd)) {
        return 0;
    }

    const targetCurrency = currency || getSelectedCurrency();

    // Get exchange rate (fetch fresh if requested, otherwise use cache)
    const rate = useLiveRate ? await fetchExchangeRate(targetCurrency) : getExchangeRate(targetCurrency);

    return usd * rate;
};

/**
 * Synchronous version of convertUsdToCurrency (uses cached rate)
 * Use this for immediate conversions without waiting for API
 * @param {number|string} usdAmount - The amount in USD
 * @param {string} currency - Target currency (EUR, GBP, USD). If not provided, uses selected currency
 * @returns {number} The converted amount in target currency
 */
export const convertUsdToCurrencySync = (usdAmount, currency = null) => {
    if (!usdAmount && usdAmount !== 0) {
        return 0;
    }

    const usd = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;

    if (isNaN(usd)) {
        return 0;
    }

    const targetCurrency = currency || getSelectedCurrency();
    const rate = getExchangeRate(targetCurrency);
    return usd * rate;
};

// Legacy functions for backward compatibility
export const convertUsdToEur = async (usdAmount, useLiveRate = false) => {
    return convertUsdToCurrency(usdAmount, { useLiveRate, currency: 'EUR' });
};

export const convertUsdToEurSync = (usdAmount) => {
    return convertUsdToCurrencySync(usdAmount, 'EUR');
};

/**
 * Format price in selected currency with proper currency symbol and formatting
 * @param {number|string} usdAmount - The amount in USD
 * @param {object} options - Formatting options
 * @param {number} options.decimals - Number of decimal places (default: 2)
 * @param {boolean} options.showSymbol - Whether to show currency symbol (default: true)
 * @param {boolean} options.useLiveRate - Whether to fetch latest rate (default: false)
 * @param {string} options.currency - Target currency (EUR, GBP, USD). If not provided, uses selected currency
 * @param {boolean} options.debug - Log conversion details (default: false)
 * @returns {Promise<string>|string} Formatted price string (Promise if useLiveRate is true)
 */
export const formatPriceInEur = (usdAmount, options = {}) => {
    const {
        decimals = 2,
        showSymbol = true,
        useLiveRate = false,
        currency = null,
        debug = false,
    } = options;

    const targetCurrency = currency || getSelectedCurrency();
    const currencyInfo = CURRENCIES[targetCurrency] || CURRENCIES.EUR;
    const symbol = currencyInfo.symbol;

    // If useLiveRate is true, return a Promise
    if (useLiveRate) {
        return convertUsdToCurrency(usdAmount, { useLiveRate: true, currency: targetCurrency }).then((convertedAmount) => {
            const formatted = convertedAmount.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            });
            return showSymbol ? `${symbol}${formatted}` : formatted;
        });
    }

    // Otherwise, use synchronous conversion with cached rate
    const rate = getExchangeRate(targetCurrency);
    const convertedAmount = convertUsdToCurrencySync(usdAmount, targetCurrency);
    const cache = exchangeRateCache[targetCurrency] || { source: 'fallback' };

    // Only log if explicitly requested via debug option
    if (debug) {
        console.log('[Price Converter] Conversion:', {
            usd: usdAmount,
            converted: convertedAmount,
            currency: targetCurrency,
            rate: rate,
            source: cache.source,
        });
    }

    const formatted = convertedAmount.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    return showSymbol ? `${symbol}${formatted}` : formatted;
};

