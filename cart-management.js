// 5.cart-management.js
// Cart management functions
function addToCart(productId, buttonElement) {
    const product = window.ECOM_STATE.products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = window.ECOM_STATE.cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        window.ECOM_STATE.cart.push({ ...product, quantity: 1 });
    }
    
    showCartNotification();
    
    const originalText = buttonElement.textContent;
    buttonElement.textContent = 'Added!';
    buttonElement.style.background = '#28a745';
    
    setTimeout(() => {
        buttonElement.textContent = originalText;
        buttonElement.style.background = '#28a745';
    }, 1000);
    
    updateCartCount();
    updateCartDisplay();
}

function showCartNotification() {
    const notification = document.getElementById('cart-notification');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

function updateCartCount() {
    const count = window.ECOM_STATE.cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
}

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    if (modal.style.display === 'block') {
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const totalAmount = document.getElementById('total-amount');
    
    if (window.ECOM_STATE.cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty<br/>Add some items to get started!</div>';
        totalAmount.textContent = '0';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    window.ECOM_STATE.cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        let cartImageContent;
        if (item.image && isValidURL(item.image)) {
            cartImageContent = `<img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div style="display: none; font-size: 24px;">🛒</div>`;
        } else if (item.image && item.image.trim() !== '') {
            cartImageContent = `<div style="font-size: 24px;">${item.image}</div>`;
        } else {
            cartImageContent = `<div style="font-size: 24px;">🛒</div>`;
        }
        
        cartItem.innerHTML = `
            <div class="item-image">${cartImageContent}</div>
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${ECOM_CONFIG.CURRENCY_SYMBOL}${item.price}</div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    totalAmount.textContent = total;
}

function updateQuantity(productId, change) {
    const item = window.ECOM_STATE.cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartCount();
            updateCartDisplay();
        }
    }
}

function removeFromCart(productId) {
    window.ECOM_STATE.cart = window.ECOM_STATE.cart.filter(item => item.id !== productId);
    updateCartCount();
    updateCartDisplay();
}
