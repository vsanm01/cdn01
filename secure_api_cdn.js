/**
 * SecureAPI.js - Reusable Security & API Functions
 * Version: 1.0.0
 * Dependencies: CryptoJS (https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js)
 * 
 * Usage:
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
 * <script src="path/to/SecureAPI.js"></script>
 * <script src="your-config.js"></script> <!-- Your config file -->
 * <script>
 *   // Use the functions
 *   const data = await makeSecureRequest({ action: 'getData' });
 * </script>
 */
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
(function(global) {
    'use strict';

    // Validate CryptoJS dependency
    if (typeof CryptoJS === 'undefined') {
        console.error('SecureAPI requires CryptoJS library. Please include: https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js');
        throw new Error('CryptoJS is required');
    }

    // ============================================
    // SECURITY FUNCTIONS
    // ============================================

    /**
     * Computes HMAC-SHA256 hash
     * @param {string} params - String to hash
     * @param {string} secret - Secret key
     * @returns {string} HMAC hash
     */
    function computeHMAC(params, secret) {
        return CryptoJS.HmacSHA256(params, secret).toString();
    }

    /**
     * Creates signature from parameters object
     * @param {Object} params - Parameters to sign
     * @param {string} secret - Secret key
     * @returns {string} HMAC signature
     */
    function createSignature(params, secret) {
        const sortedKeys = Object.keys(params).sort();
        const signatureString = sortedKeys
            .map(key => `${key}=${params[key]}`)
            .join('&');
        return computeHMAC(signatureString, secret);
    }

    // ============================================
    // MAIN API FUNCTION
    // ============================================

    /**
     * Makes a secure authenticated request to API
     * @param {Object} params - Request parameters
     * @param {Object} customConfig - Optional config override
     * @returns {Promise<Object>} API response data
     */
    async function makeSecureRequest(params, customConfig = null) {
        // Use custom config or global GSRCDN_CONFIG
        const config = customConfig || global.GSRCDN_CONFIG;
        
        if (!config) {
            console.error('ERROR: GSRCDN_CONFIG is not defined. Please create a config object.');
            throw new Error('API configuration not found');
        }

        if (!config.scriptUrl || !config.apiToken || !config.hmacSecret) {
            console.error('ERROR: Please configure scriptUrl, apiToken, and hmacSecret!');
            throw new Error('API configuration incomplete');
        }

        try {
            // Add required security parameters
            params.token = config.apiToken;
            params.timestamp = Date.now().toString();
            params.referrer = window.location.origin;
            params.origin = window.location.origin;

            // Create HMAC signature
            params.signature = createSignature(params, config.hmacSecret);

            // Build URL with query parameters
            const url = new URL(config.scriptUrl);
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });

            if (config.debug) {
                console.log('Making secure request to:', url.toString());
            }

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'success') {
                if (config.debug) {
                    console.log('Request successful:', data);
                }
                return data;
            } else {
                throw new Error(data.message || 'Request failed');
            }

        } catch (error) {
            console.error('Secure request error:', error);
            throw error;
        }
    }

    // ============================================
    // EXPORT TO GLOBAL SCOPE
    // ============================================
    global.computeHMAC = computeHMAC;
    global.createSignature = createSignature;
    global.makeSecureRequest = makeSecureRequest;

    // Also export as module if available
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            computeHMAC,
            createSignature,
            makeSecureRequest
        };
    }

    console.log('SecureAPI.js loaded successfully');

})(typeof window !== 'undefined' ? window : this);
