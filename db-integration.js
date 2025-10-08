// ============================================================================
// MODULE 1: DATABASE INTEGRATION
// ============================================================================
// db-integration.js - Google Sheets Integration
// CDN Version for ecommerce_blogger_theme

// Google Apps Script Web Service Configuration
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxwriYfxvUUryvzvDAZ31FRgjDfcXQv6eQRGSbFaittSOx9ncWl0YSoDpi7sDbcfKO46Q/exec';

// Application state
let products = [];
let isLoading = false;

// Utility Functions
function getCurrentDomain() {
    try {
        return window.location.hostname;
    } catch (error) {
        console.error('Error getting current domain:', error);
        return 'localhost';
    }
}

function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// JSONP implementation function
function makeJSONPRequest(currentDomain, timeout = 15000) {
    return new Promise((resolve, reject) => {
        const callbackName = 'jsonp_callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('Request timeout after ' + timeout + 'ms'));
        }, timeout);
        
        const cleanup = () => {
            if (script && script.parentNode) {
                script.parentNode.removeChild(script);
            }
            delete window[callbackName];
            clearTimeout(timeoutId);
        };
        
        window[callbackName] = function(data) {
            cleanup();
            resolve(data);
        };
        
        const params = new URLSearchParams({
            action: 'getData',
            callback: callbackName,
            referrer: window.location.href,
            origin: window.location.origin,
            timestamp: Date.now()
        });
        
        const script = document.createElement('script');
        script.src = `${SCRIPT_URL}?${params.toString()}`;
        
        script.onerror = function() {
            cleanup();
            reject(new Error('Script loading failed - Network error or CORS issue'));
        };
        
        document.head.appendChild(script);
    });
}

// Fetch products from Google Apps Script with retry logic
async function fetchProductsFromScript(maxRetries = 3) {
    if (isLoading) {
        console.log('Already loading products...');
        return;
    }
    
    isLoading = true;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (attempt === 1 && typeof showLoadingMessage === 'function') {
                showLoadingMessage();
            }
            
            const currentDomain = getCurrentDomain();
            console.log(`Fetching data for domain: ${currentDomain} (Attempt ${attempt}/${maxRetries})`);
            
            const timeout = 10000 + (attempt - 1) * 5000;
            const result = await makeJSONPRequest(currentDomain, timeout);
            
            console.log('Response from Google Apps Script:', result);
            
            if (result.status === 'success') {
                if (result.data && Array.isArray(result.data) && result.data.length > 1) {
                    processProductData(result.data);
                    console.log(`✅ Successfully loaded ${products.length} products`);
                    isLoading = false;
                    return;
                } else {
                    if (typeof showNoProductsMessage === 'function') showNoProductsMessage();
                    isLoading = false;
                    return;
                }
            } else if (result.status === 'error') {
                if (attempt === maxRetries) {
                    handleScriptError(result, currentDomain);
                    isLoading = false;
                    return;
                } else {
                    console.log(`Server error on attempt ${attempt}, retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                }
            } else {
                throw new Error('Unexpected response format from server');
            }
            
        } catch (error) {
            console.error(`❌ Error on attempt ${attempt}:`, error);
            
            if (attempt === maxRetries) {
                if (error.message.includes('timeout')) {
                    if (typeof showErrorMessage === 'function') {
                        showErrorMessage('Request timeout. Please check your internet connection and try again.');
                    }
                } else if (error.message.includes('Domain not authorized')) {
                    if (typeof showDomainErrorMessage === 'function') {
                        showDomainErrorMessage(getCurrentDomain());
                    }
                } else if (error.message.includes('Network error') || error.message.includes('Script loading failed')) {
                    if (typeof showErrorMessage === 'function') {
                        showErrorMessage('Network error. Please check your internet connection and try again.');
                    }
                } else {
                    if (typeof showErrorMessage === 'function') {
                        showErrorMessage(`Error: ${error.message}`);
                    }
                }
            } else {
                console.log(`Retrying in ${attempt} seconds...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }
    
    isLoading = false;
}

// Google Drive URL Converter Function
function convertGoogleDriveUrl(url) {
    if (url && url.includes('drive.google.com')) {
        let fileId = null;

        const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match1) fileId = match1[1];

        const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match2) fileId = match2[1];

        const match3 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match3) fileId = match3[1];

        if (fileId) {
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=s400`;
        }
    }
    return url;
}

// Check if string is an emoji
function isEmoji(str) {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(str);
}

// Process the raw data from Google Sheets into product objects
function processProductData(rawData) {
    try {
        const dataRows = rawData.slice(1);
        
        products = dataRows.map((row, index) => {
            const product = {
                id: parseInt(row[0]) || (index + 1),
                name: (row[1] || '').toString().trim(),
                price: parseFloat(row[2]) || 0,
                category: (row[3] || '').toString().trim(),
                image: (row[4] || '🛒').toString().trim()
            };
            
            if (product.image) {
                if (isValidURL(product.image)) {
                    product.image = convertGoogleDriveUrl(product.image);
                } else if (isEmoji(product.image)) {
                    product.image = product.image;
                } else {
                    product.image = '🛒';
                }
            } else {
                product.image = '🛒';
            }

            return product;
        }).filter(product => 
            product.name && 
            product.name.length > 0 && 
            product.price > 0 && 
            product.category
        );
        
        if (products.length > 0) {
            if (typeof displayProducts === 'function') displayProducts(products);
            if (typeof updateCategories === 'function') updateCategories();
            if (typeof setupCategoryScroll === 'function') setupCategoryScroll();
        } else {
            if (typeof showNoProductsMessage === 'function') showNoProductsMessage();
        }
        
    } catch (error) {
        console.error('Error processing product data:', error);
        if (typeof showErrorMessage === 'function') {
            showErrorMessage('Error processing product data. Please check your Google Sheet format.');
        }
    }
}

// Handle specific errors from the Google Apps Script
function handleScriptError(result, currentDomain) {
    const errorMessage = result.message || 'Unknown error';
    
    if (errorMessage.includes('Domain not authorized')) {
        if (typeof showDomainErrorMessage === 'function') showDomainErrorMessage(currentDomain);
    } else if (errorMessage.includes('Rate limit exceeded')) {
        if (typeof showRateLimitMessage === 'function') showRateLimitMessage();
    } else if (errorMessage.includes('Sheet') && errorMessage.includes('not found')) {
        if (typeof showSheetNotFoundMessage === 'function') showSheetNotFoundMessage();
    } else {
        if (typeof showErrorMessage === 'function') showErrorMessage(errorMessage);
    }
}

// Utility functions for manual data refresh
function refreshProducts() {
    console.log('🔄 Manual refresh triggered');
    fetchProductsFromScript();
}

function forceRefreshProducts() {
    products = [];
    fetchProductsFromScript();
}

// Export functions
window.fetchProductsFromScript = fetchProductsFromScript;
window.refreshProducts = refreshProducts;
window.forceRefreshProducts = forceRefreshProducts;
window.products = products;

console.log('✅ db-integration.js loaded successfully');
