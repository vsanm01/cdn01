// ========================================
// Example: cart-management.js
// ========================================
(function() {
    'use strict';
    
    console.log('✅ cart-management.js loading...');
    
    function addToCart(productId) {
        const product = window.ECOM_STATE.products.find(p => p.id === productId);
        if (!product) return;
        
        const existingItem = window.ECOM_STATE.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            window.ECOM_STATE.cart.push({
                ...product,
                quantity: 1
            });
        }
        
        updateCartCount();
        updateCartDisplay();
        showCartNotification();
        
        // Save to localStorage (if you want persistence)
        localStorage.setItem('cart', JSON.stringify(window.ECOM_STATE.cart));
    }
    
    function removeFromCart(productId) {
        window.ECOM_STATE.cart = window.ECOM_STATE.cart.filter(item => item.id !== productId);
        updateCartDisplay();
        updateCartCount();
        localStorage.setItem('cart', JSON.stringify(window.ECOM_STATE.cart));
    }
    
    function updateQuantity(productId, delta) {
        const item = window.ECOM_STATE.cart.find(i => i.id === productId);
        if (!item) return;
        
        item.quantity += delta;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartDisplay();
            updateCartCount();
            localStorage.setItem('cart', JSON.stringify(window.ECOM_STATE.cart));
        }
    }
    
    function updateCartCount() {
        const count = window.ECOM_STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
        const countEl = document.getElementById('cart-count');
        if (countEl) {
            countEl.textContent = count;
        }
    }
    
    function updateCartDisplay() {
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;
        
        if (window.ECOM_STATE.cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            document.getElementById('total-amount').textContent = '0';
            return;
        }
        
        cartItems.innerHTML = window.ECOM_STATE.cart.map(item => `
            <div class="cart-item">
                <div class="item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '📦'}
                </div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">₹${item.price}</div>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">×</button>
            </div>
        `).join('');
        
        const total = window.ECOM_STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('total-amount').textContent = total.toFixed(2);
    }
    
    function toggleCart() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
        }
    }
    
    function showCartNotification() {
        const notification = document.getElementById('cart-notification');
        if (notification) {
            notification.classList.add('show');
            setTimeout(() => notification.classList.remove('show'), 2000);
        }
    }
    
    // Load cart from localStorage on init
    function loadCart() {
        const saved = localStorage.getItem('cart');
        if (saved) {
            try {
                window.ECOM_STATE.cart = JSON.parse(saved);
                updateCartCount();
            } catch (e) {
                console.error('Error loading cart:', e);
            }
        }
    }
    
    // CRITICAL: Expose to global scope
    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.updateQuantity = updateQuantity;
    window.updateCartCount = updateCartCount;
    window.updateCartDisplay = updateCartDisplay;
    window.toggleCart = toggleCart;
    window.showCartNotification = showCartNotification;
    window.loadCart = loadCart;
    
    // Auto-load cart
    loadCart();
    
    console.log('✅ cart-management.js loaded and executed');
})();
