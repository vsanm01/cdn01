// ===== 4. search-functionality.js =====
(function() {
    'use strict';
    
    window.setupSearchSuggestions = function() {
        const searchInput = document.getElementById('search-input');
        const suggestions = document.getElementById('search-suggestions');
        
        if (!searchInput || !suggestions) return;
        
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            if (query.length < 2) {
                suggestions.style.display = 'none';
                return;
            }
            
            const matches = window.ECOM_STATE.products.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query)
            ).slice(0, 5);
            
            if (matches.length > 0) {
                suggestions.innerHTML = matches.map(p => `
                    <div class="suggestion-item" onclick="window.selectSuggestion('${p.name.replace(/'/g, "\\'")}')">
                        <span>${p.name}</span>
                        <span class="suggestion-label">${p.category}</span>
                    </div>
                `).join('');
                suggestions.style.display = 'block';
            } else {
                suggestions.style.display = 'none';
            }
        });
        
        document.addEventListener('click', function(e) {
            if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
                suggestions.style.display = 'none';
            }
        });
    };

    window.selectSuggestion = function(productName) {
        const searchInput = document.getElementById('search-input');
        const suggestions = document.getElementById('search-suggestions');
        
        if (searchInput) searchInput.value = productName;
        if (suggestions) suggestions.style.display = 'none';
        
        window.searchProducts();
    };

    window.searchProducts = function() {
        const query = document.getElementById('search-input').value.toLowerCase().trim();
        
        if (!query) {
            window.displayProducts(window.ECOM_STATE.products);
            return;
        }
        
        const results = window.ECOM_STATE.products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        );
        
        window.displayProducts(results);
        document.getElementById('search-suggestions').style.display = 'none';
    };
    
    console.log('✅ search-functionality.js loaded');
})();

