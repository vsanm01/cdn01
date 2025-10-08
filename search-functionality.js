
## 4. **search-functionality.js** - Search & Suggestions

```javascript
// Search functionality
function setupSearchSuggestions() {
    const searchInput = document.getElementById('search-input');
    const suggestionsDiv = document.getElementById('search-suggestions');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length < 2) {
            suggestionsDiv.style.display = 'none';
            return;
        }
        
        const suggestions = window.ECOM_STATE.products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        ).slice(0, ECOM_CONFIG.MAX_SUGGESTIONS);
        
        if (suggestions.length > 0) {
            suggestionsDiv.innerHTML = suggestions.map(product => {
                let suggestionIcon = product.image && isValidURL(product.image) ? '🖼️' : 
                                    (product.image && product.image.trim() !== '' ? product.image : '🛒');
                
                return `
                    <div class="suggestion-item" onclick="selectSuggestion('${product.name}', ${product.id})">
                        <span>${suggestionIcon}</span>
                        <div style="flex: 1;">
                            <div><strong>${product.name}</strong></div>
                            <small>${ECOM_CONFIG.CURRENCY_SYMBOL}${product.price}</small>
                        </div>
                        <span class="suggestion-label">${product.category}</span>
                    </div>
                `;
            }).join('');
            suggestionsDiv.style.display = 'block';
        } else {
            suggestionsDiv.style.display = 'none';
        }
    });
    
    document.addEventListener('click', function(event) {
        if (!searchInput.contains(event.target) && !suggestionsDiv.contains(event.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });
}

function selectSuggestion(productName, productId) {
    document.getElementById('search-input').value = productName;
    document.getElementById('search-suggestions').style.display = 'none';
    
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

function searchProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = window.ECOM_STATE.products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );
    displayProducts(filtered);
    document.getElementById('search-suggestions').style.display = 'none';
}
```

