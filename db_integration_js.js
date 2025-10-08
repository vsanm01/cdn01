// db-integration.js - Fixed version with global scope
// Make sure ALL functions are attached to window object

(function() {
    'use strict';
    
    console.log('✅ db-integration.js loading...');
    
    // Configuration
    const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1BXWd7iWtSPwPFNWpj-Wh31G_JtPWJGH6Dj_xqo9vHQ4/edit?gid=0#gid=0';
    const SHEET_ID = '1BXWd7iWtSPwPFNWpj-Wh31G_JtPWJGH6Dj_xqo9vHQ4';
    const SHEET_NAME = 'Sheet1';
    
    // Global state - MUST be on window object
    window.ECOM_STATE = window.ECOM_STATE || {
        products: [],
        cart: [],
        filteredProducts: [],
        currentCategory: 'all'
    };
    
    // Parse Google Sheet URL to get data
    function parseGoogleSheetURL(url) {
        try {
            const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
            const gidMatch = url.match(/gid=([0-9]+)/);
            
            if (!sheetIdMatch) {
                console.error('Could not extract Sheet ID from URL');
                return null;
            }
            
            const sheetId = sheetIdMatch[1];
            const gid = gidMatch ? gidMatch[1] : '0';
            
            // Construct CSV export URL
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
            
            console.log('Constructed CSV URL:', csvUrl);
            return csvUrl;
        } catch (error) {
            console.error('Error parsing Google Sheet URL:', error);
            return null;
        }
    }
    
    // Fetch products from Google Sheet
    async function fetchProductsFromSheet() {
        try {
            console.log('🔄 Fetching products from Google Sheet...');
            
            const csvUrl = parseGoogleSheetURL(GOOGLE_SHEET_URL);
            if (!csvUrl) {
                throw new Error('Invalid Google Sheet URL');
            }
            
            // Use CORS proxy
            const proxyUrl = 'https://api.allorigins.win/raw?url=';
            const response = await fetch(proxyUrl + encodeURIComponent(csvUrl));
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            console.log('📄 CSV data received:', csvText.substring(0, 200) + '...');
            
            // Parse CSV
            const products = parseCSV(csvText);
            console.log('✅ Parsed products:', products.length);
            
            return products;
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            throw error;
        }
    }
    
    // Parse CSV data
    function parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            console.warn('CSV has no data rows');
            return [];
        }
        
        // Skip header row
        const products = [];
        
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Simple CSV parsing (handles basic cases)
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            
            if (values.length >= 4) {
                const product = {
                    id: products.length + 1,
                    name: values[0] || 'Unnamed Product',
                    price: parseFloat(values[1]) || 0,
                    category: values[2] || 'Uncategorized',
                    image: values[3] || '',
                    description: values[4] || ''
                };
                
                products.push(product);
            }
        }
        
        return products;
    }
    
    // Main function to fetch and display products
    async function fetchProductsFromScript() {
        try {
            const products = await fetchProductsFromSheet();
            
            if (products.length === 0) {
                throw new Error('No products found in sheet');
            }
            
            window.ECOM_STATE.products = products;
            window.ECOM_STATE.filteredProducts = products;
            
            console.log('✅ Products loaded:', products.length);
            
            // Display products (this function should be in product-display.js)
            if (typeof window.displayProducts === 'function') {
                window.displayProducts(products);
            }
            
            // Update categories (this function should be in ui-components.js)
            if (typeof window.updateCategories === 'function') {
                window.updateCategories();
            }
            
            return products;
        } catch (error) {
            console.error('❌ Error in fetchProductsFromScript:', error);
            showError('Failed to load products. Please try again later.');
            return [];
        }
    }
    
    // Refresh products
    async function refreshProducts() {
        console.log('🔄 Refreshing products...');
        const grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;">Loading products...</div>';
        }
        
        await fetchProductsFromScript();
    }
    
    // Show error message
    function showError(message) {
        const grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #dc3545;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <div style="font-size: 18px; font-weight: 600;">${message}</div>
                    <button onclick="refreshProducts()" style="margin-top: 20px; padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
    
    // CRITICAL: Expose functions to global scope
    window.fetchProductsFromScript = fetchProductsFromScript;
    window.refreshProducts = refreshProducts;
    window.parseGoogleSheetURL = parseGoogleSheetURL;
    window.fetchProductsFromSheet = fetchProductsFromSheet;
    
    console.log('✅ db-integration.js loaded and functions exposed to global scope');
    
})();
