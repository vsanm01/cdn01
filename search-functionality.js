// ============================================================================
// MODULE 3: SEARCH FUNCTIONALITY
// ============================================================================
// search-functionality.js - Search & Suggestions
// CDN Version for ecommerce_blogger_theme

// Setup search suggestions
function setupSearchSuggestions() {
    const searchInput = document.getElementById('search-input') || document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('search-suggestions');
    
    if (!searchInput) {
        console.warn('Search input not found');
        return;
    }
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            if (suggestionsDiv) suggestionsDiv.style.display = 'none';
            return;
        }
        
        if (!window.products || window.products.length === 0) {
            console.warn('No products available for search');
            return;
        }
        
        const suggestions = window.products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        ).slice(0, 5);
        
        if (suggestions.length > 0 && suggestionsDiv) {
            suggestionsDiv.innerHTML = suggestions.map(product => {
                let suggestionIcon;
                if (product.image && isValidURL(product.image)) {
                    suggestionIcon = '🖼️';
                } else if (product.image && product.image.trim() !== '') {
                    suggestionIcon = product.image;
                } else {
                    suggestionIcon = '🛒';
                }
                
                return `
                    <div class="suggestion-item" onclick="selectSuggestion('${product.name.replace(/'/g, "\\'")}', ${product.id})">
                        <span>${suggestionIcon}</span>
                        <div style="flex: 1;">
                            <div><strong>${product.name}</strong></div>
                            <small>₹${product.price}</small>
                        </div>
                        <span class="suggestion-label">${product.category}</span>
                    </div>
                `;
            }).join('');
            suggestionsDiv.style.display = 'block';
        } else {
            if (suggestionsDiv) suggestionsDiv.style.display = 'none';
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(event) {
        if (searchInput && suggestionsDiv && 
            !searchInput.contains(event.target) && 
            !suggestionsDiv.contains(event.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });
    
    // Search on Enter key
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });
}

// Select suggestion
function selectSuggestion(productName, productId) {
    const searchInput = document.getElementById('search-input') || document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('search-suggestions');
    
    if (searchInput) searchInput.value = productName;
    if (suggestionsDiv) suggestionsDiv.style.display = 'none';
    
    // Scroll to product
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        if (card.innerHTML.includes(productName)) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.border = '2px solid #007bff';
            setTimeout(() => {
                card.style.border = '1px solid #f1f3f4';
            }, 2000);
        }
    });
}

// Search products
function searchProducts() {
    const searchInput = document.getElementById('search-input') || document.getElementById('searchInput');
    const suggestionsDiv = document.getElementById('search-suggestions');
    
    if (!searchInput) {
        console.warn('Search input not found');
        return;
    }
    
    const query = searchInput.value.toLowerCase();
    
    if (!window.products || window.products.length === 0) {
        console.warn('No products available for search');
        return;
    }
    
    const filtered = window.products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );
    
    if (typeof displayProducts === 'function') {
        displayProducts(filtered);
    }
    
    if (suggestionsDiv) suggestionsDiv.style.display = 'none';
}

// Helper function
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Initialize search functionality
function initSearch() {
    setupSearchSuggestions();
    console.log('✅ Search functionality initialized');
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}

// Export functions
window.setupSearchSuggestions = setupSearchSuggestions;
window.selectSuggestion = selectSuggestion;
window.searchProducts = searchProducts;

console.log('✅ search-functionality.js loaded successfully');
