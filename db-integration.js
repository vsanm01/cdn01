// ============================================================================
// MODULE 1: DATABASE INTEGRATION
// ============================================================================

const DBIntegration = (function() {
    'use strict';

    let config = {
        scriptUrl: '',
        onDataLoad: null,
        onError: null
    };

    let products = [];
    let categories = [];

    function init(options) {
        config = { ...config, ...options };
        if (!config.scriptUrl) {
            console.error('DBIntegration: Script URL is required');
            return;
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

    function convertGoogleDriveUrl(url) {
        if (url && url.includes('drive.google.com')) {
            let fileId = null;
            const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (match1) fileId = match1[1];
            const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (match2) fileId = match2[1];
            if (fileId) {
                return `https://drive.google.com/thumbnail?id=${fileId}&sz=s400`;
            }
        }
        return url;
    }

    async function fetchProducts() {
        try {
            const response = await fetch(`${config.scriptUrl}?action=getData`);
            const result = await response.json();
            
            if (result.status === 'success' && result.data && result.data.length > 1) {
                const rows = result.data.slice(1);
                products = rows.map((row, index) => ({
                    id: parseInt(row[0]) || index + 1,
                    name: row[1] || '',
                    price: parseInt(row[2]) || 0,
                    category: row[3] || '',
                    image: row[4] || '🛒'
                })).filter(product => product.name && product.price > 0);
                
                categories = [...new Set(products.map(p => p.category))].filter(cat => cat);
                
                if (config.onDataLoad) {
                    config.onDataLoad(products, categories);
                }
                return { success: true, products, categories };
            } else if (result.status === 'success' && result.data.length <= 1) {
                if (config.onError) config.onError('No products found');
                return { success: false, message: 'No products found' };
            } else {
                throw new Error(result.message || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('DBIntegration Error:', error);
            if (config.onError) config.onError(error.message);
            return { success: false, message: error.message };
        }
    }

    function getProducts() { return products; }
    function getCategories() { return categories; }
    function getProductById(id) { return products.find(p => p.id === id); }
    function filterByCategory(category) {
        if (category === 'all') return products;
        return products.filter(p => p.category === category);
    }
    function searchProducts(query) {
        const lowerQuery = query.toLowerCase();
        return products.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) || 
            p.category.toLowerCase().includes(lowerQuery)
        );
    }

    return {
        init, fetchProducts, getProducts, getCategories, 
        getProductById, filterByCategory, searchProducts,
        isValidURL, convertGoogleDriveUrl
    };
})();

