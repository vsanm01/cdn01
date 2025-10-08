// ========================================
// Example: search-functionality.js
// ========================================
(function() {
    'use strict';
    
    console.log('✅ search-functionality.js loading...');
    
    function searchProducts() {
        const input = document.getElementById('search-input');
        if (!input) return;
        
        const query = input.value.toLowerCase().trim();
        
        if (!query) {
            window.ECOM_STATE.filteredProducts = window.ECOM_STATE.products;
        } else {
            window.ECOM_STATE.filteredProducts = window.ECOM_STATE.products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }
        
        if (typeof window.displayProducts === 'function') {
            window.displayProducts(window.ECOM_STATE.filteredProducts);
        }
    }
    
    function setupSearchSuggestions() {
        const input = document.getElementById('search-input');
        const suggestions = document.getElementById('search-suggestions');
        
        if (!input || !suggestions) return;
        
        input.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            if (!query) {
                suggestions.style.display = 'none';
                return;
            }
            
            const matches = window.ECOM_STATE.products
                .filter(p => p.name.toLowerCase().includes(query))
                .slice(0, 5);
            
            if (matches.length === 0) {
                suggestions.style.display = 'none';
                return;
            }
            
            suggestions.innerHTML = matches.map(p => `
                <div class="suggestion-item" onclick="selectSuggestion('${p.name.replace(/'/g, "\\'")}')">
                    ${p.name}
                    <span class="suggestion-label">${p.category}</span>
                </div>
            `).join('');
            
            suggestions.style.display = 'block';
        });
        
        // Close suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!input.contains(e.target) && !suggestions.contains(e.target)) {
                suggestions.style.display = 'none';
            }
        });
    }
    
    function selectSuggestion(name) {
        const input = document.getElementById('search-input');
        if (input) {
            input.value = name;
            searchProducts();
        }
        
        const suggestions = document.getElementById('search-suggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }
    
    function filterByCategory(category) {
        window.ECOM_STATE.currentCategory = category;
        
        if (category === 'all') {
            window.ECOM_STATE.filteredProducts = window.ECOM_STATE.products;
        } else {
            window.ECOM_STATE.filteredProducts = window.ECOM_STATE.products.filter(p =>
                p.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        if (typeof window.displayProducts === 'function') {
            window.displayProducts(window.ECOM_STATE.filteredProducts);
        }
    }
    
    // CRITICAL: Expose to global scope
    window.searchProducts = searchProducts;
    window.setupSearchSuggestions = setupSearchSuggestions;
    window.selectSuggestion = selectSuggestion;
    window.filterByCategory = filterByCategory;
    
    console.log('✅ search-functionality.js loaded and executed');
})();

