// ========================================
// FILE 3: product-display.js
// ========================================
(function() {
    window.displayProducts = function(products) {
        var grid = document.getElementById('products-grid');
        if (!grid) return;
        
        if (!products || products.length === 0) {
            window.showNoProductsMessage();
            return;
        }
        
        grid.innerHTML = products.map(function(product) {
            var imageUrl = window.convertGoogleDriveUrl(product.image);
            var isImageUrl = window.isValidURL(imageUrl);
            
            return '<div class="product-card"><div class="product-image">' + 
                (isImageUrl ? '<img src="' + imageUrl + '" alt="' + product.name + '" onerror="this.parentElement.innerHTML=\'🛒\'">' : product.image) +
                '</div><div class="product-info"><h3 class="product-title">' + product.name + '</h3>' +
                '<div class="product-price"><span class="currency-symbol">₹</span>' + product.price + '</div>' +
                '<button class="category-tag" onclick="window.filterProducts(\'' + product.category + '\', this)">' + product.category + '</button>' +
                '<button class="add-to-cart" onclick="window.addToCart(' + product.id + ')">Add to Cart</button></div></div>';
        }).join('');
    };

    window.filterProducts = function(category, element) {
        window.ECOM_STATE.currentCategory = category;
        
        document.querySelectorAll('.category-item').forEach(function(item) {
            item.classList.remove('active');
        });
        
        if (element) {
            var categoryItems = document.querySelectorAll('.category-item');
            for (var i = 0; i < categoryItems.length; i++) {
                var item = categoryItems[i];
                if (item.textContent.trim() === category || (category === 'all' && item.textContent.trim() === 'All')) {
                    item.classList.add('active');
                    break;
                }
            }
        }
        
        if (category === 'all') {
            window.displayProducts(window.ECOM_STATE.products);
        } else {
            var filtered = window.ECOM_STATE.products.filter(function(p) {
                return p.category.toLowerCase() === category.toLowerCase();
            });
            window.displayProducts(filtered);
        }
    };

    window.updateCategories = function() {
        var categoriesContainer = document.getElementById('categories');
        if (!categoriesContainer) return;
        
        var allCat = categoriesContainer.querySelector('.always-visible');
        var categories = [];
        
        window.ECOM_STATE.products.forEach(function(p) {
            if (categories.indexOf(p.category) === -1) {
                categories.push(p.category);
            }
        });
        
        var isMobile = window.innerWidth <= 768;
        var displayCategories = isMobile ? categories.slice(0, 5) : categories.slice(0, 8);
        
        categoriesContainer.innerHTML = allCat.outerHTML + displayCategories.map(function(cat) {
            return '<a class="category-item" href="#" onclick="window.filterProducts(\'' + cat + '\', this); return false;">' + cat + '</a>';
        }).join('');
    };

    console.log('✅ product-display.js loaded and executed');
})();

