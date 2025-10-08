// ============================================================================
// MODULE 3: SEARCH FUNCTIONALITY
// ============================================================================

const SearchFunctionality = (function() {
    'use strict';

    let config = {
        inputSelector: '#search-input',
        suggestionsSelector: '#search-suggestions',
        onSearch: null,
        onSuggestionSelect: null,
        maxSuggestions: 5,
        minQueryLength: 2
    };

    let products = [];

    function init(options) {
        config = { ...config, ...options };
        setupEventListeners();
    }

    function setProducts(productList) {
        products = productList;
    }

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function setupEventListeners() {
        const input = document.querySelector(config.inputSelector);
        const searchBtn = document.querySelector('#search-button');
        
        if (input) {
            input.addEventListener('input', handleInput);
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') performSearch();
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }
        
        document.addEventListener('click', function(event) {
            const suggestionsDiv = document.querySelector(config.suggestionsSelector);
            if (input && suggestionsDiv && 
                !input.contains(event.target) && 
                !suggestionsDiv.contains(event.target)) {
                hideSuggestions();
            }
        });
    }

    function handleInput(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < config.minQueryLength) {
            hideSuggestions();
            return;
        }
        
        const suggestions = products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        ).slice(0, config.maxSuggestions);
        
        displaySuggestions(suggestions);
    }

    function displaySuggestions(suggestions) {
        const suggestionsDiv = document.querySelector(config.suggestionsSelector);
        if (!suggestionsDiv) return;
        
        if (suggestions.length === 0) {
            hideSuggestions();
            return;
        }
        
        suggestionsDiv.innerHTML = suggestions.map(product => {
            let suggestionIcon = '🛒';
            if (product.image && DBIntegration.isValidURL(product.image)) {
                suggestionIcon = '🖼️';
            } else if (product.image && product.image.trim() !== '') {
                suggestionIcon = product.image;
            }
            
            return `<div class="suggestion-item" data-product-id="${product.id}" data-product-name="${escapeHtml(product.name)}">
                <span>${suggestionIcon}</span>
                <div style="flex: 1;">
                    <div><strong>${escapeHtml(product.name)}</strong></div>
                    <small>₹${product.price}</small>
                </div>
                <span class="suggestion-label">${escapeHtml(product.category)}</span>
            </div>`;
        }).join('');
        
        suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                selectSuggestion(
                    this.getAttribute('data-product-name'),
                    parseInt(this.getAttribute('data-product-id'))
                );
            });
        });
        
        suggestionsDiv.style.display = 'block';
    }

    function hideSuggestions() {
        const suggestionsDiv = document.querySelector(config.suggestionsSelector);
        if (suggestionsDiv) suggestionsDiv.style.display = 'none';
    }

    function selectSuggestion(productName, productId) {
        const input = document.querySelector(config.inputSelector);
        if (input) input.value = productName;
        hideSuggestions();
        
        if (config.onSuggestionSelect) {
            config.onSuggestionSelect(productId);
        } else {
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                productCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                productCard.style.border = '2px solid #007bff';
                setTimeout(() => { productCard.style.border = '1px solid #f1f3f4'; }, 2000);
            }
        }
    }

    function performSearch() {
        const input = document.querySelector(config.inputSelector);
        if (!input) return;
        
        const query = input.value.toLowerCase().trim();
        hideSuggestions();
        
        if (config.onSearch) config.onSearch(query);
    }

    function clearSearch() {
        const input = document.querySelector(config.inputSelector);
        if (input) input.value = '';
        hideSuggestions();
    }

    return { init, setProducts, performSearch, clearSearch, hideSuggestions };
})();
