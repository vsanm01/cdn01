// ===== 3. product-display.js =====
(function() {
    'use strict';
    
    window.displayProducts = function(products) {
        const grid = document.getElementById('products-grid');
        if (!grid) return;
        
        if (!products || products.length === 0) {
            window.showNoProductsMessage();
            return;
        }
        
        grid.innerHTML = products.map(product => {
            const imageUrl = window.convertGoogleDriveUrl(product.image);
            const isImageUrl = window.isValidURL(imageUrl);
            
            return `
                <div class="product-card">
                    <div class="product-image">
                        ${isImageUrl ? 
                            `<img src="${imageUrl}" alt="${product.name}" onerror="this.parentElement.innerHTML='🛒'">` : 
                            product.image
                        }
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">
                            <span class="currency-symbol">₹</span>${product.price}
                        </div>
                        <button class="category-tag" onclick="window.filterProducts('${product.category}', this)">
                            ${product.category}
                        </button>
                        <button class="add-to-cart" onclick="window.addToCart(${product.id})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    };

    window.filterProducts = function(category, element) {
        window.ECOM_STATE.currentCategory = category;
        
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        
        if (element) {
            const categoryItem = Array.from(document.querySelectorAll('.category-item'))
                .find(item => item.textContent.trim() === category || 
                             (category === 'all' && item.textContent.trim() === 'All'));
            if (categoryItem) {
                categoryItem.classList.add('active');
            }
        }
        
        if (category === 'all') {
            window.displayProducts(window.ECOM_STATE.products);
        } else {
            const filtered = window.ECOM_STATE.products.filter(p => 
                p.category.toLowerCase() === category.toLowerCase()
            );
            window.displayProducts(filtered);
        }
    };

    window.updateCategories = function() {
        const categoriesContainer = document.getElementById('categories');
        if (!categoriesContainer) return;
        
        const allCat = categoriesContainer.querySelector('.always-visible');
        const categories = [...new Set(window.ECOM_STATE.products.map(p => p.category))];
        
        const isMobile = window.innerWidth <= 768;
        const displayCategories = isMobile ? categories.slice(0, 5) : categories.slice(0, 8);
        
        categoriesContainer.innerHTML = allCat.outerHTML + displayCategories.map(cat => 
            `<a class="category-item" href="#" onclick="window.filterProducts('${cat}', this); return false;">${cat}</a>`
        ).join('');
    };
    
    console.log('✅ product-display.js loaded');
})();

