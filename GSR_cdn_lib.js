/**
 * Google Sheets API CDN Library
 * Version: 3.2.0
 * License: MIT
 * 
 * CDN Usage:
 * <script src="https://your-cdn.com/google-sheets-api-v3.2.0.min.js"></script>
 * 
 * Or use unpkg/jsdelivr after publishing to npm:
 * <script src="https://unpkg.com/google-sheets-api@3.2.0/dist/google-sheets-api.min.js"></script>
 * <script src="https://cdn.jsdelivr.net/npm/google-sheets-api@3.2.0/dist/google-sheets-api.min.js"></script>
 */

(function(root, factory) {
    'use strict';
    
    // UMD (Universal Module Definition)
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // CommonJS
        module.exports = factory();
    } else {
        // Browser global
        root.GoogleSheetsAPI = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    // ============================================================================
    // ERROR HANDLER
    // ============================================================================
    class ErrorHandler {
        static ERROR_CODES = {
            ERR_AUTH_001: { message: 'Authentication failed', severity: 'high', canRetry: false },
            ERR_AUTH_002: { message: 'Domain not authorized', severity: 'high', canRetry: false },
            ERR_AUTH_003: { message: 'Invalid API token', severity: 'high', canRetry: false },
            ERR_AUTH_004: { message: 'Token expired', severity: 'medium', canRetry: false },
            ERR_AUTH_005: { message: 'Invalid HMAC signature - MANDATORY in v3.2.0', severity: 'critical', canRetry: false },
            ERR_NET_001: { message: 'Request timeout', severity: 'medium', canRetry: true },
            ERR_NET_002: { message: 'Connection failed', severity: 'medium', canRetry: true },
            ERR_NET_003: { message: 'Script loading failed', severity: 'high', canRetry: true },
            ERR_RATE_001: { message: 'Rate limit exceeded', severity: 'medium', canRetry: true },
            ERR_RATE_002: { message: 'Too many requests', severity: 'medium', canRetry: true },
            ERR_VAL_001: { message: 'Invalid configuration', severity: 'high', canRetry: false },
            ERR_VAL_002: { message: 'Invalid URL format', severity: 'high', canRetry: false },
            ERR_VAL_003: { message: 'CSP violation detected', severity: 'high', canRetry: false },
            ERR_VAL_004: { message: 'Origin validation failed', severity: 'high', canRetry: false },
            ERR_SRV_001: { message: 'Server error', severity: 'high', canRetry: true },
            ERR_SRV_002: { message: 'Data processing error', severity: 'medium', canRetry: false },
            ERR_SEC_001: { message: 'Security violation detected', severity: 'critical', canRetry: false },
            ERR_SEC_002: { message: 'HMAC secret not configured - MANDATORY', severity: 'critical', canRetry: false },
            ERR_SEC_003: { message: 'Honeypot triggered', severity: 'critical', canRetry: false },
            ERR_SEC_004: { message: 'Data integrity checksum mismatch', severity: 'critical', canRetry: false }
        };

        static createError(code, developerMessage = '', context = {}) {
            const errorDef = this.ERROR_CODES[code] || {
                message: 'Unknown error',
                severity: 'medium',
                canRetry: false
            };

            return {
                code: code,
                userMessage: errorDef.message,
                developerMessage: developerMessage,
                severity: errorDef.severity,
                canRetry: errorDef.canRetry,
                timestamp: Date.now(),
                context: context
            };
        }

        static sanitizeForClient(error) {
            return {
                code: error.code,
                message: error.userMessage,
                canRetry: error.canRetry,
                timestamp: error.timestamp
            };
        }

        static logError(error, debug = false) {
            if (debug) {
                console.error('[GoogleSheetsAPI Error]', {
                    code: error.code,
                    user: error.userMessage,
                    developer: error.developerMessage,
                    severity: error.severity,
                    context: error.context
                });
            }
        }
    }

    // ============================================================================
    // CRYPTO UTILITIES
    // ============================================================================
    class CryptoUtils {
        static async generateHMAC(message, secret) {
            try {
                const encoder = new TextEncoder();
                const keyData = encoder.encode(secret);
                const messageData = encoder.encode(message);
                
                const key = await crypto.subtle.importKey(
                    'raw',
                    keyData,
                    { name: 'HMAC', hash: 'SHA-256' },
                    false,
                    ['sign']
                );
                
                const signature = await crypto.subtle.sign('HMAC', key, messageData);
                
                return Array.from(new Uint8Array(signature))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            } catch (e) {
                console.error('HMAC generation failed:', e);
                return this.simpleHash(message + secret);
            }
        }

        static async computeChecksum(data) {
            try {
                const canonicalJson = JSON.stringify(data, Object.keys(data).sort());
                const encoder = new TextEncoder();
                const dataBuffer = encoder.encode(canonicalJson);
                const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
                
                return Array.from(new Uint8Array(hashBuffer))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');
            } catch (e) {
                console.error('Checksum computation failed:', e);
                return this.simpleHash(JSON.stringify(data));
            }
        }

        static async verifyChecksum(data, expectedChecksum) {
            if (!expectedChecksum) {
                return { valid: true, warning: 'No checksum provided by server' };
            }

            try {
                const computedChecksum = await this.computeChecksum(data);
                const isValid = computedChecksum === expectedChecksum;
                
                return {
                    valid: isValid,
                    computed: computedChecksum.substring(0, 16) + '...',
                    expected: expectedChecksum.substring(0, 16) + '...',
                    algorithm: 'SHA-256'
                };
            } catch (e) {
                return {
                    valid: false,
                    error: 'Checksum verification failed: ' + e.message
                };
            }
        }

        static simpleHash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16);
        }

        static generateNonce() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        }
    }

    // ============================================================================
    // RATE LIMITER
    // ============================================================================
    class RateLimiter {
        constructor(config) {
            this.maxRequests = config.maxRequests || 100;
            this.timeWindow = config.timeWindow || 3600000;
            this.requests = [];
        }

        canMakeRequest() {
            const now = Date.now();
            this.requests = this.requests.filter(time => now - time < this.timeWindow);
            
            if (this.requests.length >= this.maxRequests) {
                return {
                    allowed: false,
                    retryAfter: this.timeWindow - (now - this.requests[0]),
                    remaining: 0
                };
            }
            
            this.requests.push(now);
            return {
                allowed: true,
                remaining: this.maxRequests - this.requests.length
            };
        }

        reset() {
            this.requests = [];
        }

        getStatus() {
            const now = Date.now();
            this.requests = this.requests.filter(time => now - time < this.timeWindow);
            return {
                requests: this.requests.length,
                limit: this.maxRequests,
                remaining: this.maxRequests - this.requests.length,
                resetAt: this.requests.length > 0 ? this.requests[0] + this.timeWindow : null
            };
        }
    }

    // ============================================================================
    // DATA MASKER
    // ============================================================================
    class DataMasker {
        static maskEmail(email) {
            if (!email || typeof email !== 'string') return email;
            const parts = email.split('@');
            if (parts.length !== 2) return email;
            
            const username = parts[0];
            const domain = parts[1];
            const maskedUsername = username.length > 2 
                ? username[0] + '***' 
                : username[0] + '*';
            
            return `${maskedUsername}@${domain}`;
        }

        static maskPhone(phone) {
            if (!phone || typeof phone !== 'string') return phone;
            const digits = phone.replace(/\D/g, '');
            if (digits.length < 4) return '***';
            
            return phone.replace(/\d(?=\d{3})/g, '*');
        }

        static maskSSN(ssn) {
            if (!ssn || typeof ssn !== 'string') return ssn;
            
            const digits = ssn.replace(/\D/g, '');
            
            if (digits.length === 9) {
                return '***-**-' + digits.substring(5);
            } else if (digits.length === 4) {
                return '****' + digits;
            } else {
                return ssn.substring(0, 1) + '***' + ssn.substring(ssn.length - 2);
            }
        }

        static maskCreditCard(card) {
            if (!card || typeof card !== 'string') return card;
            const digits = card.replace(/\D/g, '');
            
            if (digits.length >= 13 && digits.length <= 19) {
                return '**** **** **** ' + digits.substring(digits.length - 4);
            }
            
            return '****' + digits.substring(digits.length - 4);
        }

        static maskName(name) {
            if (!name || typeof name !== 'string') return name;
            const parts = name.split(' ');
            return parts.map(part => {
                if (part.length <= 1) return part;
                return part[0] + '***';
            }).join(' ');
        }

        static maskPartial(value) {
            if (!value || typeof value !== 'string') return value;
            if (value.length <= 4) return '***';
            
            return value.substring(0, 2) + '***' + value.substring(value.length - 2);
        }

        static maskField(value, type) {
            switch(type) {
                case 'email': return this.maskEmail(value);
                case 'phone': return this.maskPhone(value);
                case 'card': 
                case 'credit': 
                case 'creditCard': return this.maskCreditCard(value);
                case 'ssn': 
                case 'social': return this.maskSSN(value);
                case 'name': return this.maskName(value);
                case 'partial': return this.maskPartial(value);
                default: return value;
            }
        }

        static maskData(data, maskConfig = {}) {
            if (!data || !maskConfig.enabled) return data;
            
            const fields = maskConfig.fields || [];
            const maskType = maskConfig.maskType || 'partial';
            
            if (Array.isArray(data)) {
                return data.map(item => this.maskData(item, maskConfig));
            }
            
            if (typeof data === 'object' && data !== null) {
                const masked = { ...data };
                
                fields.forEach(field => {
                    if (masked.hasOwnProperty(field)) {
                        let type = maskType;
                        if (typeof masked[field] === 'string') {
                            if (masked[field].includes('@')) type = 'email';
                            else if (/^\+?\d[\d\s\-()]{7,}$/.test(masked[field])) type = 'phone';
                            else if (/^\d{3}-?\d{2}-?\d{4}$/.test(masked[field])) type = 'ssn';
                            else if (/^\d{13,19}$/.test(masked[field].replace(/\D/g, ''))) type = 'card';
                        }
                        
                        masked[field] = this.maskField(masked[field], type);
                    }
                });
                
                return masked;
            }
            
            return data;
        }
    }

    // ============================================================================
    // SECURITY VALIDATOR
    // ============================================================================
    class SecurityValidator {
        static ALLOWED_GOOGLE_DOMAINS = [
            'script.google.com',
            'script.googleusercontent.com'
        ];

        static ALLOWED_GOOGLE_PATTERNS = [
            /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/,
            /^https:\/\/script\.googleusercontent\.com\/macros\/echo\?user_content_key=.+$/
        ];

        static validateGoogleUrl(url) {
            try {
                const urlObj = new URL(url);
                
                if (urlObj.protocol !== 'https:') {
                    return {
                        valid: false,
                        error: ErrorHandler.createError('ERR_VAL_002', 'URL must use HTTPS protocol')
                    };
                }
                
                if (!this.ALLOWED_GOOGLE_DOMAINS.includes(urlObj.hostname)) {
                    return {
                        valid: false,
                        error: ErrorHandler.createError('ERR_VAL_002', `Domain ${urlObj.hostname} is not a valid Google Apps Script domain`)
                    };
                }
                
                const matchesPattern = this.ALLOWED_GOOGLE_PATTERNS.some(pattern => pattern.test(url));
                if (!matchesPattern) {
                    return {
                        valid: false,
                        error: ErrorHandler.createError('ERR_VAL_002', 'URL does not match expected Google Apps Script format')
                    };
                }
                
                return { valid: true };
            } catch (e) {
                return {
                    valid: false,
                    error: ErrorHandler.createError('ERR_VAL_002', 'Invalid URL format: ' + e.message)
                };
            }
        }

        static validateOrigin() {
            try {
                const location = window.location;
                
                if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
                    return {
                        valid: false,
                        error: ErrorHandler.createError('ERR_VAL_004', 'Application must be served over HTTPS')
                    };
                }
                
                return {
                    valid: true,
                    origin: {
                        protocol: location.protocol,
                        hostname: location.hostname,
                        port: location.port,
                        pathname: location.pathname,
                        href: location.href
                    }
                };
            } catch (e) {
                return {
                    valid: false,
                    error: ErrorHandler.createError('ERR_VAL_004', 'Failed to validate origin: ' + e.message)
                };
            }
        }

        static checkCSP() {
            try {
                const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                
                if (!cspMeta) {
                    return {
                        warning: true,
                        message: 'No CSP meta tag found. Consider adding CSP for enhanced security.'
                    };
                }
                
                const cspContent = cspMeta.getAttribute('content');
                
                if (cspContent && cspContent.includes('script-src')) {
                    const hasGoogleDomain = this.ALLOWED_GOOGLE_DOMAINS.some(domain => 
                        cspContent.includes(domain)
                    );
                    
                    if (!hasGoogleDomain) {
                        return {
                            valid: false,
                            error: ErrorHandler.createError('ERR_VAL_003', 'CSP does not allow Google Apps Script domains')
                        };
                    }
                }
                
                return { valid: true, csp: cspContent };
            } catch (e) {
                return {
                    warning: true,
                    message: 'Could not validate CSP: ' + e.message
                };
            }
        }
    }

    // ============================================================================
    // MAIN API CLASS
    // ============================================================================
    class GoogleSheetsAPI {
        constructor() {
            this.version = '3.2.0';
            this.serverVersion = '3.2.0';
            
            this.config = {
                scriptUrl: '',
                apiToken: '',
                hmacSecret: '',
                enforceHttps: true,
                validateGoogleUrl: true,
                checkCSP: true,
                rateLimitEnabled: true,
                maxRequests: 100,
                timeWindow: 3600000,
                dataMasking: {
                    enabled: false,
                    fields: [],
                    maskType: 'partial'
                },
                checksumValidation: true,
                debug: false,
                timeout: 15000,
                retryAttempts: 3,
                retryDelay: 1000
            };
            
            this.isLoading = false;
            this.data = null;
            this.rateLimiter = null;
            this.securityLog = [];
        }

        init(options) {
            if (!options.scriptUrl) {
                throw ErrorHandler.createError('ERR_VAL_001', 'scriptUrl is required');
            }
            if (!options.apiToken) {
                throw ErrorHandler.createError('ERR_VAL_001', 'apiToken is required');
            }
            if (!options.hmacSecret) {
                throw ErrorHandler.createError('ERR_SEC_002', 'hmacSecret is MANDATORY in v3.2.0');
            }
            
            this.config = Object.assign({}, this.config, options);
            
            if (this.config.validateGoogleUrl) {
                const urlValidation = SecurityValidator.validateGoogleUrl(this.config.scriptUrl);
                if (!urlValidation.valid) {
                    ErrorHandler.logError(urlValidation.error, this.config.debug);
                    throw urlValidation.error;
                }
            }
            
            const originValidation = SecurityValidator.validateOrigin();
            if (!originValidation.valid) {
                ErrorHandler.logError(originValidation.error, this.config.debug);
                throw originValidation.error;
            }
            
            if (this.config.checkCSP) {
                const cspCheck = SecurityValidator.checkCSP();
                if (cspCheck.warning) {
                    this.log('CSP Warning:', cspCheck.message);
                } else if (!cspCheck.valid) {
                    ErrorHandler.logError(cspCheck.error, this.config.debug);
                    if (this.config.enforceCSP) {
                        throw cspCheck.error;
                    }
                }
            }
            
            if (this.config.rateLimitEnabled) {
                this.rateLimiter = new RateLimiter({
                    maxRequests: this.config.maxRequests,
                    timeWindow: this.config.timeWindow
                });
            }
            
            this.log('GoogleSheetsAPI v' + this.version + ' initialized');
            this.log('✓ HMAC-SHA256 signing: ENABLED (MANDATORY)');
            this.log('✓ Data integrity checksums: ' + (this.config.checksumValidation ? 'ENABLED' : 'DISABLED'));
            
            return this;
        }

        async fetchData(onSuccess, onError) {
            try {
                if (this.isLoading) {
                    const error = ErrorHandler.createError('ERR_NET_002', 'Request already in progress');
                    throw error;
                }
                
                if (!this.config.scriptUrl || !this.config.apiToken) {
                    const error = ErrorHandler.createError('ERR_VAL_001', 'API not initialized');
                    throw error;
                }
                
                if (!this.config.hmacSecret) {
                    const error = ErrorHandler.createError('ERR_SEC_002', 'HMAC secret not configured');
                    throw error;
                }
                
                if (this.rateLimiter) {
                    const rateCheck = this.rateLimiter.canMakeRequest();
                    if (!rateCheck.allowed) {
                        const error = ErrorHandler.createError('ERR_RATE_001', 
                            `Rate limit exceeded. Retry after ${Math.ceil(rateCheck.retryAfter / 1000)}s`);
                        throw error;
                    }
                    this.log('Rate limit status:', rateCheck);
                }
                
                const result = await this._fetchWithRetry();
                
                if (this.config.checksumValidation && result.checksum) {
                    this.log('Verifying data integrity checksum...');
                    const checksumResult = await CryptoUtils.verifyChecksum(result.data, result.checksum);
                    
                    if (!checksumResult.valid) {
                        const error = ErrorHandler.createError('ERR_SEC_004', 
                            'Data integrity check failed');
                        this.log('✗ Checksum verification failed:', checksumResult);
                        throw error;
                    }
                    
                    this.log('✓ Data integrity verified:', checksumResult);
                }
                
                let processedData = result.data;
                if (this.config.dataMasking.enabled) {
                    processedData = DataMasker.maskData(result.data, this.config.dataMasking);
                    this.log('✓ Client-side data masking applied');
                }
                
                this.data = processedData;
                this.log('✓ Data fetched successfully');
                
                if (result.masked) {
                    this.log('✓ Server-side masking applied to fields:', result.maskedFields);
                }
                
                if (onSuccess) onSuccess(processedData);
                return processedData;
                
            } catch (error) {
                const sanitized = ErrorHandler.sanitizeForClient(error);
                ErrorHandler.logError(error, this.config.debug);
                
                if (onError) onError(sanitized);
                throw sanitized;
            }
        }

        async _fetchWithRetry() {
            const maxAttempts = this.config.retryAttempts;
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    this.log(`Fetch attempt ${attempt}/${maxAttempts}`);
                    
                    const result = await this._makeSecureRequest(
                        this.config.timeout + (attempt - 1) * 5000
                    );
                    
                    if (result.status === 'success') {
                        return result;
                    } else if (result.status === 'error') {
                        const error = this._mapServerError(result);
                        
                        if (!error.canRetry || attempt === maxAttempts) {
                            throw error;
                        }
                        
                        await this._sleep(this.config.retryDelay * attempt);
                    }
                } catch (error) {
                    if (!error.canRetry || attempt === maxAttempts) {
                        throw error;
                    }
                    await this._sleep(this.config.retryDelay * attempt);
                }
            }
        }

        async _makeSecureRequest(timeout) {
            return new Promise(async (resolve, reject) => {
                this.isLoading = true;
                
                const callbackName = 'jsonp_' + CryptoUtils.generateNonce();
                const timestamp = Date.now();
                const nonce = CryptoUtils.generateNonce();
                
                const params = {
                    action: 'getData',
                    callback: callbackName,
                    token: this.config.apiToken,
                    referrer: window.location.href,
                    origin: window.location.origin,
                    timestamp: timestamp,
                    nonce: nonce
                };
                
                if (!this.config.hmacSecret) {
                    reject(ErrorHandler.createError('ERR_SEC_002', 'HMAC secret not configured'));
                    return;
                }
                
                try {
                    const signatureString = Object.keys(params)
                        .sort()
                        .map(key => `${key}=${params[key]}`)
                        .join('&');
                    
                    params.signature = await CryptoUtils.generateHMAC(
                        signatureString, 
                        this.config.hmacSecret
                    );
                    
                    this.log('✓ Request signed with HMAC-SHA256');
                } catch (hmacError) {
                    reject(ErrorHandler.createError('ERR_AUTH_005', 'HMAC signature generation failed'));
                    return;
                }
                
                const timeoutId = setTimeout(() => {
                    cleanup();
                    reject(ErrorHandler.createError('ERR_NET_001', 'Request timeout'));
                }, timeout);
                
                const cleanup = () => {
                    if (script && script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    delete window[callbackName];
                    clearTimeout(timeoutId);
                    this.isLoading = false;
                };
                
                window[callbackName] = (data) => {
                    cleanup();
                    resolve(data);
                };
                
                const urlParams = new URLSearchParams(params);
                const script = document.createElement('script');
                script.src = `${this.config.scriptUrl}?${urlParams.toString()}`;
                script.onerror = () => {
                    cleanup();
                    reject(ErrorHandler.createError('ERR_NET_003', 'Script loading failed'));
                };
                
                document.head.appendChild(script);
            });
        }

        _mapServerError(result) {
            const message = (result.message || '').toLowerCase();
            
            if (message.includes('unauthorized') || message.includes('invalid token')) {
                return ErrorHandler.createError('ERR_AUTH_003', result.message);
            }
            if (message.includes('domain not authorized')) {
                return ErrorHandler.createError('ERR_AUTH_002', result.message);
            }
            if (message.includes('signature') || message.includes('hmac')) {
                return ErrorHandler.createError('ERR_AUTH_005', result.message);
            }
            if (message.includes('rate limit')) {
                return ErrorHandler.createError('ERR_RATE_001', result.message);
            }
            
            return ErrorHandler.createError('ERR_SRV_001', result.message || 'Server error');
        }

        _sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        getRateLimitStatus() {
            if (!this.rateLimiter) {
                return { enabled: false };
            }
            return {
                enabled: true,
                ...this.rateLimiter.getStatus()
            };
        }

        processData(rawData, options = {}) {
            const defaults = {
                skipRows: 1,
                columns: ['id', 'name', 'price', 'category', 'image'],
                validate: true,
                mask: false
            };
            
            const opts = Object.assign({}, defaults, options);
            const dataRows = rawData.slice(opts.skipRows);
            
            let processed = dataRows.map((row, index) => {
                const item = {};
                opts.columns.forEach((col, colIndex) => {
                    item[col] = row[colIndex];
                });
                if (!item.id) item.id = index + 1;
                if (opts.validate && !this._validateItem(item)) return null;
                return item;
            }).filter(item => item !== null);
            
            if (opts.mask && this.config.dataMasking.enabled) {
                processed = DataMasker.maskData(processed, this.config.dataMasking);
            }
            
            return processed;
        }

        _validateItem(item) {
            return item.name && item.name.trim().length > 0;
        }

        log(...args) {
            if (this.config.debug) {
                console.log('[GoogleSheetsAPI v3.2.0]', ...args);
            }
        }

        getCachedData() {
            return this.data;
        }

        clearCache() {
            this.data = null;
        }

        getSecurityLog() {
            return this.securityLog;
        }

        getStatus() {
            return {
                version: this.version,
                serverCompatibility: this.serverVersion,
                initialized: !!(this.config.scriptUrl && this.config.apiToken && this.config.hmacSecret),
                security: {
                    hmacEnabled: !!this.config.hmacSecret,
                    checksumValidation: this.config.checksumValidation,
                    httpsEnforced: this.config.enforceHttps,
                    urlValidation: this.config.validateGoogleUrl,
                    cspCheck: this.config.checkCSP
                },
                rateLimiting: this.rateLimiter ? this.rateLimiter.getStatus() : { enabled: false },
                dataMasking: {
                    clientSide: this.config.dataMasking.enabled,
                    fields: this.config.dataMasking.fields
                },
                isLoading: this.isLoading,
                hasCachedData: !!this.data
            };
        }
    }

    // Return a singleton instance
    return new GoogleSheetsAPI();
}));
