//7. **ui-components.js** - UI Components & Categories
// UI components and category management
function updateCategories() {
    const categoriesContainer = document.getElementById('categories');
    const uniqueCategories = [...new Set(window.ECOM_STATE.products.map(p => p.category))].filter(cat => cat);
    window.ECOM_STATE.allCategories = uniqueCategories;
    
    categoriesContainer.innerHTML = `
        <a href="#" class="category-item active always-visible" onclick="filterProducts('all', this)">All</a>
    `;
    
    const isMobile = window.innerWidth <= 768;
    const maxCategories = isMobile ? ECOM_CONFIG.MOBILE_MAX_CATEGORIES : ECOM_CONFIG.DESKTOP_MAX_CATEGORIES;
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

function showAllCategories() {
    const categoriesContainer = document.getElementById('categories');
    categoriesContainer.innerHTML = `
        <a href="#" class="category-item active always-visible" onclick="filterProducts('all', this)">All</a>
    `;
    
    window.ECOM_STATE.allCategories.forEach(category => {
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
    
    setupCategoryScroll();
}

function setupCategoryScroll() {
    const categoriesContainer = document.getElementById('categories');
    const leftBtn = document.getElementById('scroll-left');
    const rightBtn = document.getElementById('scroll-right');
    
    if (categoriesContainer.scrollWidth > categoriesContainer.clientWidth) {
        leftBtn.style.display = 'flex';
        rightBtn.style.display = 'flex';
        updateScrollButtons();
    } else {
        leftBtn.style.display = 'none';
        rightBtn.style.display = 'none';
    }
    
    categoriesContainer.addEventListener('scroll', updateScrollButtons);
}

function updateScrollButtons() {
    const categoriesContainer = document.getElementById('categories');
    const leftBtn = document.getElementById('scroll-left');
    const rightBtn = document.getElementById('scroll-right');
    
    leftBtn.disabled = categoriesContainer.scrollLeft <= 0;
    rightBtn.disabled = categoriesContainer.scrollLeft >= 
        (categoriesContainer.scrollWidth - categoriesContainer.clientWidth);
}

function scrollCategories(direction) {
    const categoriesContainer = document.getElementById('categories');
    const scrollAmount = 200;
    
    if (direction === 'left') {
        categoriesContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        categoriesContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

function setupModalClosing() {
    window.onclick = function(event) {
        const cartModal = document.getElementById('cart-modal');
        const checkoutModal = document.getElementById('checkout-modal');
        
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (event.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    };
}
