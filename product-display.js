//3. **product-display.js** - Product Display & Filtering
// Product display and filtering functions
function displayProducts(productList) {
    const grid = document.getElementById('products-grid');
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
            const imageUrl = convertGoogleDriveUrl(product.image);
            imageContent = `
                <img src="${imageUrl}" alt="${product.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
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
                    <span class="currency-symbol">${ECOM_CONFIG.CURRENCY_SYMBOL}</span>${product.price}
                </div>
                <button class="add-to-cart" onclick="addToCart(${product.id}, this)">Add to Cart</button>
            </div>
        `;
        grid.appendChild(productCard);
    });
}

function filterProducts(category, element) {
    document.querySelectorAll('.category-item').forEach(item => {
        item.classList.remove('active');
    });
    
    element.classList.add('active');
    
    window.ECOM_STATE.currentCategory = category;
    const filtered = category === 'all' ? window.ECOM_STATE.products : 
                     window.ECOM_STATE.products.filter(p => p.category === category);
    displayProducts(filtered);
}

function filterByCategory(category, element) {
    const categoryTabs = document.querySelectorAll('.category-item');
    categoryTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase() === category.toLowerCase()) {
            tab.classList.add('active');
        }
    });
    
    window.ECOM_STATE.currentCategory = category;
    const filtered = window.ECOM_STATE.products.filter(p => p.category === category);
    displayProducts(filtered);
}
