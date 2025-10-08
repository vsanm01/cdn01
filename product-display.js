// ============================================================================
// MODULE 2: PRODUCT DISPLAY
// ============================================================================
// product-display.js - Product Display & Categories
// CDN Version for ecommerce_blogger_theme

let currentCategory = 'all';
let allCategories = [];

// Display products with fixed image handling
function displayProducts(productList) {
    const grid = document.getElementById('products-grid') || document.getElementById('productsContainer');
    if (!grid) {
        console.error('Products grid container not found');
        return;
    }
    
    grid.innerHTML = '';
    
    if (productList.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6c757d; font-size: 18px;">No products match your search criteria.</div>';
        return;
    }
    
    productList.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        let imageContent;
        if (product.image && isValidURL(product.image)) {
            imageContent = `
                <img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display: none; font-size: 48px;">🛒</div>
            `;
        } else if (product.image && product.image.trim() !== '') {
            imageContent = `<div style="font-size: 48px;">${product.image}</div>`;
        } else {
            imageContent = `<div style="font-size: 48px;">🛒</div>`;
        }
        
        productCard.innerHTML = `
            <div class="product-image">${imageContent}</div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <button class="category-tag" onclick="filterByCategory('${product.category}', this)">${product.category}</button>
                <div class="product-price">
                    <span class="currency-symbol">₹</span>${product.price}
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id}, this)">Add to Cart</button>
            </div>
        `;
        grid.appendChild(productCard);
    });
}

// Function to update categories dynamically
function updateCategories() {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) return;
    
    const uniqueCategories = [...new Set(window.products.map(p => p.category))].filter(cat => cat);
    allCategories = uniqueCategories;
    
    categoriesContainer.innerHTML = `
        <a href="#" class="category-item active always-visible" onclick="filterProducts('all', this)">All</a>
    `;
    
    const isMobile = window.innerWidth <= 768;
    const maxCategories = isMobile ? 4 : 6;
    const visibleCategories = uniqueCategories.slice(0, maxCategories);
    const hiddenCategories = uniqueCategories.slice(maxCategories);
    
    visibleCategories.forEach(category => {
        const categoryLink = document.createElement('a');
        categoryLink.href = '#';
        categoryLink.className = 'category-item';
        categoryLink.textContent = category;
        categoryLink.onclick = function() { filterProducts(category, this); };
        categoriesContainer.appendChild(categoryLink);
    });
    
    if (hiddenCategories.length > 0) {
        const moreButton = document.createElement('button');
        moreButton.className = 'category-item more-btn';
        moreButton.textContent = `+${hiddenCategories.length} More`;
        moreButton.onclick = showAllCategories;
        categoriesContainer.appendChild(moreButton);
    }
}

// Function to show all categories
function showAllCategories() {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = `
        <a href="#" class="category-item active always-visible" onclick="filterProducts('all', this)">All</a>
    `;
    
    allCategories.forEach(category => {
        const categoryLink = document.createElement('a');
        categoryLink.href = '#';
        categoryLink.className = 'category-item';
        categoryLink.textContent = category;
        categoryLink.onclick = function() { filterProducts(category, this); };
        categoriesContainer.appendChild(categoryLink);
    });
    
    const lessButton = document.createElement('button');
    lessButton.className = 'category-item less-btn';
    lessButton.textContent = 'Show Less';
    lessButton.onclick = updateCategories;
    categoriesContainer.appendChild(lessButton);
    
    if (typeof setupCategoryScroll === 'function') setupCategoryScroll();
}

// Function to setup category scrolling
function setupCategoryScroll() {
    const categoriesContainer = document.getElementById('categories');
    const leftBtn = document.getElementById('scroll-left');
    const rightBtn = document.getElementById('scroll-right');
    
    if (!categoriesContainer) return;
    
    if (categoriesContainer.scrollWidth > categoriesContainer.clientWidth) {
        if (leftBtn) leftBtn.style.display = 'flex';
        if (rightBtn) rightBtn.style.display = 'flex';
        updateScrollButtons();
    } else {
        if (leftBtn) leftBtn.style.display = 'none';
        if (rightBtn) rightBtn.style.display = 'none';
    }
    
    categoriesContainer.addEventListener('scroll', updateScrollButtons);
}

// Function to update scroll button states
function updateScrollButtons() {
    const categoriesContainer = document.getElementById('categories');
    const leftBtn = document.getElementById('scroll-left');
    const rightBtn = document.getElementById('scroll-right');
    
    if (!categoriesContainer) return;
    
    if (leftBtn) leftBtn.disabled = categoriesContainer.scrollLeft <= 0;
    
    if (rightBtn) {
        rightBtn.disabled = categoriesContainer.scrollLeft >= 
            (categoriesContainer.scrollWidth - categoriesContainer.clientWidth);
    }
}

// Function to scroll categories
function scrollCategories(direction) {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) return;
    
    const scrollAmount = 200;
    
    if (direction === 'left') {
        categoriesContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        categoriesContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// Filter products by category
function filterProducts(category, element) {
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    
    element.classList.add('active');
    
    currentCategory = category;
    const filtered = category === 'all' ? window.products : window.products.filter(p => p.category === category);
    displayProducts(filtered);
}

// Filter by category from product tag
function filterByCategory(category, element) {
    const categoryTabs = document.querySelectorAll('.category-item');
    categoryTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase() === category.toLowerCase()) {
            tab.classList.add('active');
        }
    });
    
    currentCategory = category;
    const filtered = window.products.filter(p => p.category === category);
    displayProducts(filtered);
}

// Helper function (shared)
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Export functions
window.displayProducts = displayProducts;
window.updateCategories = updateCategories;
window.showAllCategories = showAllCategories;
window.setupCategoryScroll = setupCategoryScroll;
window.scrollCategories = scrollCategories;
window.filterProducts = filterProducts;
window.filterByCategory = filterByCategory;

console.log('✅ product-display.js loaded successfully');
