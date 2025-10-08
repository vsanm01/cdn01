// ========================================
// FILE 7: ui-components.js
// ========================================
// ui-components.js - UI Messages & Components
// CDN Version for ecommerce_blogger_theme

// UI Message Functions
function showLoadingMessage() {
    const grid = document.getElementById('products-grid') || document.getElementById('productsContainer');
    if (!grid) return;
    
    grid.innerHTML = `
        <div class="loading-container" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <div class="loading-spinner" style="font-size: 48px; margin-bottom: 16px; animation: spin 2s linear infinite;">⏳</div>
            <div style="color: #6c757d; font-size: 18px;">Loading products from Google Sheets...</div>
            <div style="color: #999; font-size: 14px; margin-top: 8px;">Please wait...</div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
}

function showDomainErrorMessage(domain) {
    const grid = document.getElementById('products-grid') || document.getElementById('productsContainer');
    if (!grid) return;
    
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #dc3545;">
            <div style="font-size: 48px; margin-bottom: 16px;">🚫</div>
            <h3 style="color: #dc3545; margin-bottom: 8px;">Access Denied</h3>
            <div style="font-size: 16px; margin-bottom: 12px;">
                <strong>Domain not authorized:</strong> <code>${domain || 'Unknown'}</code>
            </div>
            <div style="font-size: 14px; color: #6c757d; max-width: 500px; margin: 0 auto 20px; line-height: 1.5;">
                This website is not authorized to access the Google Sheets data. 
                Please contact the administrator to add this domain to the allowed list.
            </div>
            <div style="font-size: 12px; padding: 15px; background: #f8f9fa; border-radius: 8px; color: #495057; max-width: 450px; margin: 0 auto 20px; border-left: 4px solid #007bff;">
                <strong>📋 Admin Instructions:</strong><br>
                1. Open your Google Sheet<br>
                2. Go to Sheet2, cell B2<br>
                3. Add: <code>${domain || 'this-domain.com'}</code><br>
                4. Save and refresh this page
            </div>
            <button onclick="fetchProductsFromScript ? fetchProductsFromScript() : window.location.reload()" 
                    style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; transition: background 0.3s;">
                🔄 Retry Connection
            </button>
        </div>
    `;
}

function showRateLimitMessage() {
    const grid = document.getElementById('products-grid') || document.getElementById('productsContainer');
    if (!grid) return;
    
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #ffc107;">
            <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
            <h3 style="color: #ffc107; margin-bottom: 8px;">Rate Limit Exceeded</h3>
            <div style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">
                Too many requests. Please wait a moment and try again.
            </div>
            <button onclick="setTimeout(() => fetchProductsFromScript ? fetchProductsFromScript() : window.location.reload(), 5000)" 
                    style="padding: 10px 20px; background: #ffc107; color: #212529; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                ⏳ Retry in 5 seconds
            </button>
        </div>
    `;
}

function showSheetNotFoundMessage() {
    const grid = document.getElementById('products-grid') || document.getElementById('productsContainer');
    if (!grid) return;
    
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #dc3545;">
            <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
            <h3 style="color: #dc3545; margin-bottom: 8px;">Sheet Not Found</h3>
            <div style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">
                The Google Sheet or required sheets are not found. Please check your Google Apps Script configuration.
            </div>
            <button onclick="fetchProductsFromScript ? fetchProductsFromScript() : window.location.reload()" 
                    style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">
                🔄 Try Again
            </button>
        </div>
    `;
}

function showErrorMessage(errorMsg) {
    const grid = document.getElementById('products-grid') || document.getElementById('productsContainer');
    if (!grid) return;
    
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #dc3545;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h3 style="color: #dc3545; margin-bottom: 8px;">Error Loading Products</h3>
            <div style="font-size: 14px; color: #6c757d; margin-bottom: 8px;">${errorMsg}</div>
            <div style="font-size: 12px; color: #999; margin-bottom: 20px;">
                Check your internet connection and Google Apps Script configuration
            </div>
            <button onclick="fetchProductsFromScript ? fetchProductsFromScript() : window.location.reload()" 
                    style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;">
                🔄 Try Again
            </button>
        </div>
    `;
}

function showNoProductsMessage() {
    const grid = document.getElementById('products-grid') || document.getElementById('productsContainer');
    if (!grid) return;
    
    grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6c757d;">
            <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
            <h3 style="color: #6c757d; margin-bottom: 8px;">No Products Found</h3>
            <div style="font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
                No products found in your Google Sheet.<br>
                Add products with columns: <strong>Serial No, Name, Price, Category, Image</strong>
            </div>
            <button onclick="fetchProductsFromScript ? fetchProductsFromScript() : window.location.reload()" 
                    style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer;">
                🔄 Refresh
            </button>
        </div>
    `;
}

// Toast notification system
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    toast.textContent = message;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    if (!document.querySelector('#toast-styles')) {
        style.id = 'toast-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// Confirmation dialog
function showConfirmDialog(message, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9998;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        padding: 24px;
        border-radius: 12px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    `;
    
    dialog.innerHTML = `
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #212529;">${message}</div>
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="cancel-btn" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">Cancel</button>
            <button id="confirm-btn" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">Confirm</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    dialog.querySelector('#confirm-btn').onclick = () => {
        document.body.removeChild(overlay);
        if (onConfirm) onConfirm();
    };
    
    dialog.querySelector('#cancel-btn').onclick = () => {
        document.body.removeChild(overlay);
        if (onCancel) onCancel();
    };
    
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
            if (onCancel) onCancel();
        }
    };
}

// Initialize UI components
function initUIComponents() {
    console.log('✅ UI components initialized');
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUIComponents);
} else {
    initUIComponents();
}

// Export functions
window.showLoadingMessage = showLoadingMessage;
window.showDomainErrorMessage = showDomainErrorMessage;
window.showRateLimitMessage = showRateLimitMessage;
window.showSheetNotFoundMessage = showSheetNotFoundMessage;
window.showErrorMessage = showErrorMessage;
window.showNoProductsMessage = showNoProductsMessage;
window.showToast = showToast;
window.showConfirmDialog = showConfirmDialog;

console.log('✅ ui-components.js loaded successfully');
