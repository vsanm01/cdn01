/**
 * GSR - Google Sheets Reader Library (Integrated with GoogleSheetsAPI v3.2.0)
 * A wrapper library that integrates with the secure GoogleSheetsAPI connection library
 * Version: 2.0.0
 * Author: Your Name
 * Repository: https://github.com/vsanm01/cdn01
 * 
 * Dependencies:
 * - GoogleSheetsAPI v3.2.0 (GSR_Conct_cdn_lib.js)
 * 
 * Usage:
 * 1. Load GoogleSheetsAPI CDN first
 * 2. Load this GSR library
 * 3. Initialize and fetch products
 */

(function(global) {
    'use strict';

    const GSR = {
        version: '2.0.0',
        _initialized: false,
        _api: null,
        
        /**
         * Initialize GSR with GoogleSheetsAPI connection
         * @param {object} config - Configuration object
         * @returns {object} - GSR instance
         */
        init(config) {
            // Check if GoogleSheetsAPI is loaded
            if (typeof GoogleSheetsAPI === 'undefined') {
                throw new Error('[GSR] GoogleSheetsAPI library not found. Please load GSR_Conct_cdn_lib.js first.');
            }

            // Validate required configuration
            if (!config.scriptUrl) {
                throw new Error('[GSR] scriptUrl is required');
            }
            if (!config.apiToken) {
                throw new Error('[GSR] apiToken is required');
            }
            if (!config.hmacSecret) {
                throw new Error('[GSR] hmacSecret is MANDATORY (required by GoogleSheetsAPI v3.2.0)');
            }

            try {
                // Initialize the GoogleSheetsAPI
                this._api = GoogleSheetsAPI.init({
                    scriptUrl: config.scriptUrl,
                    apiToken: config.apiToken,
                    hmacSecret: config.hmacSecret,
                    enforceHttps: config.enforceHttps !== false,
                    validateGoogleUrl: config.validateGoogleUrl !== false,
                    checkCSP: config.checkCSP !== false,
                    rateLimitEnabled: config.rateLimitEnabled !== false,
                    maxRequests: config.maxRequests || 100,
                    timeWindow: config.timeWindow || 3600000,
                    dataMasking: config.dataMasking || {
                        enabled: false,
                        fields: [],
                        maskType: 'partial'
                    },
                    checksumValidation: config.checksumValidation !== false,
                    debug: config.debug || false,
                    timeout: config.timeout || 15000,
                    retryAttempts: config.retryAttempts || 3,
                    retryDelay: config.retryDelay || 1000
                });

                this._initialized = true;
                console.log('[GSR] ✅ Initialized with GoogleSheetsAPI v3.2.0');
                console.log('[GSR] ✅ HMAC-SHA256 authentication enabled');
                console.log('[GSR] ✅ Data integrity checksums enabled');
                
                return this;
            } catch (error) {
                console.error('[GSR] ❌ Initialization failed:', error);
                throw error;
            }
        },

        /**
         * Check if GSR is initialized
         * @returns {boolean}
         */
        isInitialized() {
            return this._initialized && this._api !== null;
        },

        /**
         * Fetch products from Google Apps Script
         * @param {string} scriptUrl - Optional override script URL (uses init config if not provided)
         * @param {object} options - Optional configuration
         * @returns {Promise<object>} - Returns {success: boolean, products: array, message: string}
         */
        async fetchProducts(scriptUrl, options = {}) {
            // If scriptUrl is actually an options object, handle it
            if (typeof scriptUrl === 'object' && scriptUrl !== null) {
                options = scriptUrl;
                scriptUrl = null;
            }

            // Check if initialized
            if (!this.isInitialized()) {
                return {
                    success: false,
                    products: [],
                    message: 'GSR not initialized. Call GSR.init() first with required configuration.',
                    error: {
                        code: 'ERR_NOT_INITIALIZED',
                        details: 'Missing scriptUrl, apiToken, or hmacSecret'
                    }
                };
            }

            try {
                console.log('[GSR] 🔄 Fetching products with secure authentication...');
                
                // Fetch data using GoogleSheetsAPI
                const rawData = await this._api.fetchData();
                
                // Process the data into product format
                const result = this._processResponse(rawData, options);
                
                console.log(`[GSR] ✅ Successfully loaded ${result.products.length} products`);
                
                return result;

            } catch (error) {
                console.error('[GSR] ❌ Error fetching products:', error);
                
                return {
                    success: false,
                    products: [],
                    message: error.message || 'Failed to fetch products',
                    error: error
                };
            }
        },

        /**
         * Process raw data into product objects
         * @private
         */
        _processResponse(rawData, options = {}) {
            // Check if data exists
            if (!rawData || !Array.isArray(rawData)) {
                return {
                    success: true,
                    products: [],
                    message: 'No data available'
                };
            }

            // Check if only header row exists (length <= 1)
            if (rawData.length <= 1) {
                return {
                    success: true,
                    products: [],
                    message: 'No products found in sheet'
                };
            }

            // Transform rows to product objects (skip header row)
            const rows = rawData.slice(1);
            const products = rows
                .map((row, index) => this._rowToProduct(row, index, options))
                .filter(product => this._isValidProduct(product));

            return {
                success: true,
                products: products,
                message: `Successfully loaded ${products.length} products`
            };
        },

        /**
         * Convert a row array to a product object
         * @private
         */
        _rowToProduct(row, index, options = {}) {
            const columnMapping = options.columnMapping || {
                id: 0,      // Column A: Serial No
                name: 1,    // Column B: Product Name
                price: 2,   // Column C: Price
                category: 3,// Column D: Category
                image: 4    // Column E: Image URL or emoji
            };

            return {
                id: parseInt(row[columnMapping.id]) || index + 1,
                name: row[columnMapping.name] || '',
                price: parseInt(row[columnMapping.price]) || 0,
                category: row[columnMapping.category] || '',
                image: row[columnMapping.image] || '🛒'
            };
        },

        /**
         * Validate if a product object is valid
         * @private
         */
        _isValidProduct(product) {
            return product.name && product.name.trim() !== '' && product.price > 0;
        },

        /**
         * Get cached data from GoogleSheetsAPI
         * @returns {array|null}
         */
        getCachedData() {
            if (!this.isInitialized()) {
                return null;
            }
            return this._api.getCachedData();
        },

        /**
         * Clear cached data
         */
        clearCache() {
            if (this.isInitialized()) {
                this._api.clearCache();
            }
        },

        /**
         * Get rate limit status
         * @returns {object}
         */
        getRateLimitStatus() {
            if (!this.isInitialized()) {
                return { enabled: false, error: 'Not initialized' };
            }
            return this._api.getRateLimitStatus();
        },

        /**
         * Get comprehensive status
         * @returns {object}
         */
        getStatus() {
            if (!this.isInitialized()) {
                return {
                    gsrVersion: this.version,
                    initialized: false,
                    message: 'GSR not initialized'
                };
            }

            const apiStatus = this._api.getStatus();
            
            return {
                gsrVersion: this.version,
                googleSheetsAPIVersion: apiStatus.version,
                initialized: this._initialized,
                security: {
                    hmacAuthentication: apiStatus.security.hmacEnabled,
                    checksumValidation: apiStatus.security.checksumValidation,
                    httpsEnforced: apiStatus.security.httpsEnforced,
                    urlValidation: apiStatus.security.urlValidation
                },
                rateLimiting: apiStatus.rateLimiting,
                dataMasking: apiStatus.dataMasking,
                isLoading: apiStatus.isLoading,
                hasCachedData: apiStatus.hasCachedData
            };
        },

        /**
         * Get library information
         */
        getInfo() {
            return {
                name: 'GSR - Google Sheets Reader',
                version: this.version,
                description: 'Wrapper library for GoogleSheetsAPI v3.2.0 with product data processing',
                repository: 'https://github.com/vsanm01/cdn01',
                dependencies: {
                    'GoogleSheetsAPI': '3.2.0 (GSR_Conct_cdn_lib.js)'
                },
                features: [
                    'HMAC-SHA256 authentication',
                    'Data integrity checksums',
                    'Rate limiting',
                    'Client-side data masking',
                    'Automatic retry with exponential backoff',
                    'CSP validation',
                    'Product data processing'
                ],
                initialized: this._initialized
            };
        },

        /**
         * Reset GSR (for re-initialization)
         */
        reset() {
            this._initialized = false;
            this._api = null;
            console.log('[GSR] Reset completed');
        }
    };

    // Export for different environments
    if (typeof module !== 'undefined' && module.exports) {
        // Node.js
        module.exports = GSR;
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define([], function() { return GSR; });
    } else {
        // Browser global
        global.GSR = GSR;
    }

})(typeof window !== 'undefined' ? window : this);
