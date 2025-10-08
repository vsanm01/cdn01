// 2. **db-integration.js** - Database & Data Fetching
// Database integration functions
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

async function fetchProductsFromScript() {
    try {
        showLoadingMessage();
        
        const response = await fetch(`${ECOM_CONFIG.SCRIPT_URL}?action=getData`);
        const result = await response.json();
        
        if (result.status === 'success' && result.data && result.data.length > 1) {
            const rows = result.data.slice(1);
            window.ECOM_STATE.products = rows.map((row, index) => ({
                id: parseInt(row[0]) || index + 1,
                name: row[1] || '',
                price: parseInt(row[2]) || 0,
                category: row[3] || '',
                image: row[4] || '🛒'
            })).filter(product => product.name && product.price > 0);
            
            console.log(`Loaded ${window.ECOM_STATE.products.length} products`);
            displayProducts(window.ECOM_STATE.products);
            updateCategories();
            setupCategoryScroll();
        } else if (result.status === 'success' && result.data.length <= 1) {
            showNoProductsMessage();
        } else {
            throw new Error(result.message || 'Failed to fetch data');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        showErrorMessage(error.message);
    }
}

function refreshProducts() {
    fetchProductsFromScript();
}

function showLoadingMessage() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6c757d; font-size: 18px;">
            <div style="font-size: 48px; margin-bottom: 16px; animation: spin 1s linear infinite;">⏳</div>
            <div>Loading products...</div>
        </div>
    `;
}

function showErrorMessage(errorMsg) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #dc3545; font-size: 18px;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <div>Failed to load products</div>
            <div style="font-size: 14px; margin-top: 8px; color: #6c757d;">${errorMsg}</div>
            <button onclick="fetchProductsFromScript()" style="margin-top: 16px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Try Again</button>
        </div>
    `;
}

function showNoProductsMessage() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6c757d; font-size: 18px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
            <div>No products found in your Google Sheet</div>
            <div style="font-size: 14px; margin-top: 8px;">Add products to your Google Sheet</div>
            <button onclick="fetchProductsFromScript()" style="margin-top: 16px; padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh</button>
        </div>
    `;
}
