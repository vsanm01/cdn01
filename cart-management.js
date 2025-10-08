// ===== 5. cart-management.js =====
(function() {
    'use strict';
    
    window.addToCart = function(productId) {
        const product = window.ECOM_STATE.products.find(p => p.id === productId);
        if (!product) return;
        
        const existingItem = window.ECOM_STATE.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            window.ECOM_STATE.cart.push({...product, quantity: 1});
        }
        
        window.updateCartCount();
        window.showCartNotification();
    };

    window.updateCartCount = function() {
        const count = window.ECOM_STATE.cart.reduce((sum, item) => sum + item.quantity, 0);
        const countEl = document.getElementById('cart-count');
        if (countEl) countEl.textContent = count;
    };

    window.showCartNotification = function() {
        const notification = document.getElementById('cart-notification');
        if (!notification) return;
        
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), 2000);
    };

    window.toggleCart = function() {
        const modal = document.getElementById('cart-modal');
        if (!modal) return;
        
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        } else {
            window.renderCart();
            modal.style.display = 'flex';
        }
    };

    window.renderCart = function() {
        const container = document.getElementById('cart-items');
        const totalEl = document.getElementById('total-amount');
        
        if (!container || !totalEl) return;
        
        if (window.ECOM_STATE.cart.length === 0) {
            container.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            totalEl.textContent = '0';
            return;
        }
        
        container.innerHTML = window.ECOM_STATE.cart.map(item => {
            const imageUrl = window.convertGoogleDriveUrl(item.image);
            const isImageUrl = window.isValidURL(imageUrl);
            
            return `
                <div class="cart-item">
                    <div class="item-image">
                        ${isImageUrl ? 
                            `<img src="${imageUrl}" alt="${item.name}">` : 
                            item.image
                        }
                    </div>
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">₹${item.price}</div>
                    </div>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="window.updateQuantity(${item.id}, -1)">-</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" onclick="window.updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-item" onclick="window.removeFromCart(${item.id})">×</button>
                </div>
            `;
        }).join('');
        
        const total = window.ECOM_STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalEl.textContent = total;
    };

    window.updateQuantity = function(productId, change) {
        const item = window.ECOM_STATE.cart.find(i => i.id === productId);
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            window.removeFromCart(productId);
        } else {
            window.renderCart();
            window.updateCartCount();
        }
    };

    window.removeFromCart = function(productId) {
        window.ECOM_STATE.cart = window.ECOM_STATE.cart.filter(item => item.id !== productId);
        window.renderCart();
        window.updateCartCount();
    };
    
    console.log('✅ cart-management.js loaded');
})();
