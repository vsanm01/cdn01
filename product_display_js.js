// Product Display Module
// Handles rendering and displaying products
(function() {
    'use strict';
    
    console.log('✅ product-display.js loading...');
    
    // Your functions here
    function displayProducts(products) {
        const grid = document.getElementById('products-grid');
        if (!grid) return;
        
        if (!products || products.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;">No products found</div>';
            return;
        }
        
        grid.innerHTML = products.map(product => `
            <div class="product-card" onclick="viewProduct(${product.id})">
                <div class="product-image">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '📦'}
                </div>
                <div class="product-info">
                    <div class="product-title">${product.name}</div>
                    <div class="product-price">₹${product.price}</div>
                    <button class="category-tag" onclick="event.stopPropagation(); filterByCategory('${product.category}')">${product.category}</button>
                    <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    function viewProduct(productId) {
        console.log('View product:', productId);
        // Add your logic here
    }
    
    // CRITICAL: Expose to global scope
    window.displayProducts = displayProducts;
    window.viewProduct = viewProduct;
    
    console.log('✅ product-display.js loaded and executed');
})();
