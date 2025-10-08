// ============================================================================
// MODULE 2: PRODUCT DISPLAY
// ============================================================================

const ProductDisplay = (function() {
    'use strict';

    let config = {
        containerSelector: '#products-grid',
        categoryContainerSelector: '#categories',
        onAddToCart: null,
        onCategoryFilter: null,
        currencySymbol: '₹'
    };

    let allCategories = [];

    function init(options) {
        config = { ...config, ...options };
    }

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function createImageContent(product) {
        if (product.image && DBIntegration.isValidURL(product.image)) {
            const imageUrl = DBIntegration.convertGoogleDriveUrl(product.image);
            return `<img src="${imageUrl}" alt="${escapeHtml(product.name)}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div style="display: none; font-size: 48px;">🛒</div>`;
        } else if (product.image && product.image.trim() !== '') {
            return `<div style="font-size: 48px;">${product.image}</div>`;
        } else {
            return `<div style="font-size: 48px;">🛒</div>`;
        }
    }

    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-product-id', product.id);
        const imageContent = createImageContent(product);

        card.innerHTML = `
            <div class="product-image">${imageContent}</div>
            <div class="product-info">
                <h3 class="product-title">${escapeHtml(product.name)}</h3>
                <button class="category-tag" data-category="${escapeHtml(product.category)}">
                    ${escapeHtml(product.category)}
                </button>
                <div class="product-price">
                    <span class="currency-symbol">${config.currencySymbol}</span>${product.price}
                </div>
                <button class="add-to-cart" data-product-id="${product.id}">Add to Cart</button>
            </div>
        `;

        card.querySelector('.add-to-cart').addEventListener('click', function() {
            if (config.onAddToCart) config.onAddToCart(product.id);
            const originalText = this.textContent;
            this.textContent = 'Added!';
            this.style.background = '#28a745';
            setTimeout(() => { this.textContent = originalText; }, 1000);
        });

        card.querySelector('.category-tag').addEventListener('click', function() {
            filterByCategory(product.category);
        });

        return card;
    }

    function displayProducts(productList) {
        const container = document.querySelector(config.containerSelector);
        if (!container) return;
        container.innerHTML = '';
        
        if (productList.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #6c757d;">No products found</div>';
            return;
        }
        
        productList.forEach(product => {
            container.appendChild(createProductCard(product));
        });
    }

    function displayCategories(categories) {
        const container = document.querySelector(config.categoryContainerSelector);
        if (!container) return;
        allCategories = categories;
        const isMobile = window.innerWidth <= 768;
        const maxCategories = isMobile ? 4 : 6;
        const visibleCategories = categories.slice(0, maxCategories);
        
        container.innerHTML = '<a href="#" class="category-item active always-visible" data-category="all">All</a>';
        
        visibleCategories.forEach(category => {
            const categoryLink = document.createElement('a');
            categoryLink.href = '#';
            categoryLink.className = 'category-item';
            categoryLink.textContent = category;
            categoryLink.setAttribute('data-category', category);
            categoryLink.addEventListener('click', function(e) {
                e.preventDefault();
                filterByCategory(category);
            });
            container.appendChild(categoryLink);
        });
    }

    function filterByCategory(category) {
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-category') === category) {
                item.classList.add('active');
            }
        });
        if (config.onCategoryFilter) config.onCategoryFilter(category);
    }

    function showLoading() {
        const container = document.querySelector(config.containerSelector);
        if (container) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6c757d; font-size: 18px;">
                <div style="font-size: 48px; margin-bottom: 16px; animation: spin 1s linear infinite;">⏳</div>
                <div>Loading products...</div></div>`;
        }
    }

    function showError(message) {
        const container = document.querySelector(config.containerSelector);
        if (container) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #dc3545; font-size: 18px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <div>Failed to load products</div>
                <div style="font-size: 14px; margin-top: 8px; color: #6c757d;">${escapeHtml(message)}</div></div>`;
        }
    }

    return { init, displayProducts, displayCategories, filterByCategory, showLoading, showError };
})();
