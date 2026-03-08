/**
 * API Route to fetch latest USD to target currency exchange rate
 * This keeps the API key secure on the server-side
 * Supports EUR, GBP, and USD (returns 1.0 for USD)
 */
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get currency from query parameter, default to EUR
    const currency = (req.query.currency || 'EUR').toUpperCase();
    
    // USD always returns 1.0
    if (currency === 'USD') {
        return res.status(200).json({
            success: true,
            rate: 1.0,
            source: 'static',
            timestamp: new Date().toISOString(),
            currency: 'USD',
        });
    }

    // Validate currency
    if (currency !== 'EUR' && currency !== 'GBP') {
        return res.status(400).json({ 
            error: 'Invalid currency. Supported: EUR, GBP, USD' 
        });
    }

    const API_KEY = process.env.EXCHANGE_RATES_API_KEY;
    const API_BASE_URL = 'https://api.exchangeratesapi.io/v1';

    // Fallback rates
    const fallbackRates = {
        EUR: 0.92,
        GBP: 0.79,
    };

    if (!API_KEY) {
        // Return fallback rate if API key is not configured
        return res.status(200).json({
            success: true,
            rate: fallbackRates[currency] || fallbackRates.EUR,
            source: 'fallback',
            timestamp: new Date().toISOString(),
            currency: currency,
        });
    }

    try {
        const apiUrl = `${API_BASE_URL}/latest?access_key=${API_KEY}&base=USD&symbols=${currency}`;

        // Fetch latest rates from Exchange Rates API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, 10000); // 10 second timeout

        let response;
        try {
            response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                signal: controller.signal,
            });
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error('External API request timeout');
            }
            throw fetchError;
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Check if API returned an error
        if (data.error) {
            throw new Error(data.error.info || 'Exchange rate API error');
        }

        // Extract rate from response
        const rate = data.rates?.[currency];

        if (!rate || typeof rate !== 'number') {
            throw new Error('Invalid rate data received from API');
        }

        const responseData = {
            success: true,
            rate: rate,
            source: 'api',
            timestamp: data.date || new Date().toISOString(),
            base: data.base || 'USD',
            currency: currency,
        };

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(responseData);
        return;
    } catch (error) {
        // Return fallback rate on error
        const fallbackData = {
            success: true,
            rate: fallbackRates[currency] || fallbackRates.EUR,
            source: 'fallback',
            timestamp: new Date().toISOString(),
            currency: currency,
        };

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(fallbackData);
        return;
    }
}

