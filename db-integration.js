// ========================================
// FILE 2: db-integration.js
// ========================================
(function() {
    window.isValidURL = function(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    window.convertGoogleDriveUrl = function(url) {
        if (url && url.includes('drive.google.com')) {
            var fileId = null;
            
            var match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
            if (match1) fileId = match1[1];
            
            var match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (match2) fileId = match2[1];
            
            if (fileId) {
                return 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=s400';
            }
        }
        return url;
    };

    window.showLoadingMessage = function() {
        var grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6c757d; font-size: 18px;"><div style="font-size: 48px; margin-bottom: 16px;">⏳</div><div>Loading products...</div></div>';
        }
    };

    window.showErrorMessage = function(errorMsg) {
        var grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #dc3545; font-size: 18px;"><div style="font-size: 48px; margin-bottom: 16px;">⚠️</div><div>Failed to load products</div><div style="font-size: 14px; margin-top: 8px; color: #6c757d;">' + errorMsg + '</div><button onclick="window.fetchProductsFromScript()" style="margin-top: 16px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Try Again</button></div>';
        }
    };

    window.showNoProductsMessage = function() {
        var grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6c757d; font-size: 18px;"><div style="font-size: 48px; margin-bottom: 16px;">📦</div><div>No products found in your Google Sheet</div><div style="font-size: 14px; margin-top: 8px;">Add products to your Google Sheet</div><button onclick="window.fetchProductsFromScript()" style="margin-top: 16px; padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh</button></div>';
        }
    };

    window.fetchProductsFromScript = function() {
        console.log('📦 Fetching products...');
        window.showLoadingMessage();
        
        fetch(window.ECOM_CONFIG.SCRIPT_URL + '?action=getData')
            .then(function(response) {
                return response.json();
            })
            .then(function(result) {
                if (result.status === 'success' && result.data && result.data.length > 1) {
                    var rows = result.data.slice(1);
                    window.ECOM_STATE.products = rows.map(function(row, index) {
                        return {
                            id: parseInt(row[0]) || index + 1,
                            name: row[1] || '',
                            price: parseInt(row[2]) || 0,
                            category: row[3] || '',
                            image: row[4] || '🛒'
                        };
                    }).filter(function(product) {
                        return product.name && product.price > 0;
                    });
                    
                    console.log('✅ Loaded ' + window.ECOM_STATE.products.length + ' products');
                    window.displayProducts(window.ECOM_STATE.products);
                    window.updateCategories();
                    window.setupCategoryScroll();
                } else if (result.status === 'success' && result.data.length <= 1) {
                    window.showNoProductsMessage();
                } else {
                    throw new Error(result.message || 'Failed to fetch data');
                }
            })
            .catch(function(error) {
                console.error('❌ Error:', error);
                window.showErrorMessage(error.message);
            });
    };

    window.refreshProducts = function() {
        window.fetchProductsFromScript();
    };

    console.log('✅ db-integration.js loaded and executed');
})();


