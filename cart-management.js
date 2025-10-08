// ========================================
// FILE 5: cart-management.js
// ========================================
(function() {
    window.addToCart = function(productId) {
        var product = window.ECOM_STATE.products.find(function(p) {
            return p.id === productId;
        });
        if (!product) return;
        
        var existingItem = window.ECOM_STATE.cart.find(function(item) {
            return item.id === productId;
        });
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            window.ECOM_STATE.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                image: product.image,
                quantity: 1
            });
        }
        
        window.updateCartCount();
        window.showCartNotification();
    };

    window.updateCartCount = function() {
        var count = window.ECOM_STATE.cart.reduce(function(sum, item) {
            return sum + item.quantity;
        }, 0);
        var countEl = document.getElementById('cart-count');
        if (countEl) countEl.textContent = count;
    };

    window.showCartNotification = function() {
        var notification = document.getElementById('cart-notification');
        if (!notification) return;
        
        notification.classList.add('show');
        setTimeout(function() {
            notification.classList.remove('show');
        }, 2000);
    };

    window.toggleCart = function() {
        var modal = document.getElementById('cart-modal');
        if (!modal) return;
        
        if (modal.style.display === 'flex') {
            modal.style.display = 'none';
        } else {
            window.renderCart();
            modal.style.display = 'flex';
        }
    };

    window.renderCart = function() {
        var container = document.getElementById('cart-items');
        var totalEl = document.getElementById('total-amount');
        
        if (!container || !totalEl) return;
        
        if (window.ECOM_STATE.cart.length === 0) {
            container.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            totalEl.textContent = '0';
            return;
        }
        
        container.innerHTML = window.ECOM_STATE.cart.map(function(item) {
            var imageUrl = window.convertGoogleDriveUrl(item.image);
            var isImageUrl = window.isValidURL(imageUrl);
            
            return '<div class="cart-item"><div class="item-image">' + 
                (isImageUrl ? '<img src="' + imageUrl + '" alt="' + item.name + '">' : item.image) +
                '</div><div class="item-details"><div class="item-name">' + item.name + '</div>' +
                '<div class="item-price">₹' + item.price + '</div></div>' +
                '<div class="qty-controls">' +
                '<button class="qty-btn" onclick="window.updateQuantity(' + item.id + ', -1)">-</button>' +
                '<span class="qty-display">' + item.quantity + '</span>' +
                '<button class="qty-btn" onclick="window.updateQuantity(' + item.id + ', 1)">+</button></div>' +
                '<button class="remove-item" onclick="window.removeFromCart(' + item.id + ')">×</button></div>';
        }).join('');
        
        var total = window.ECOM_STATE.cart.reduce(function(sum, item) {
            return sum + (item.price * item.quantity);
        }, 0);
        totalEl.textContent = total;
    };

    window.updateQuantity = function(productId, change) {
        var item = window.ECOM_STATE.cart.find(function(i) {
            return i.id === productId;
        });
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
        window.ECOM_STATE.cart = window.ECOM_STATE.cart.filter(function(item) {
            return item.id !== productId;
        });
        window.renderCart();
        window.updateCartCount();
    };

    console.log('✅ cart-management.js loaded and executed');
})();

