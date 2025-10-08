// ============================================================================
// MODULE 4: CART MANAGEMENT
// ============================================================================
// cart-management.js - Shopping Cart Management
// CDN Version for ecommerce_blogger_theme

let cart = [];

// Add to cart with notification
function addToCart(productId, buttonElement) {
    if (!window.products || window.products.length === 0) {
        console.error('Products not loaded');
        return;
    }
    
    const product = window.products.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    // Show cart notification
    showCartNotification();
    
    // Add visual feedback to button
    if (buttonElement) {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Added!';
        buttonElement.style.background = '#28a745';
        
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.style.background = '#28a745';
        }, 1000);
    }
    
    updateCartCount();
    updateCartDisplay();
}

// Show cart notification
function showCartNotification() {
    const notification = document.getElementById('cart-notification');
    if (!notification) return;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count, #cartCount, .cart-count');
    
    cartCountElements.forEach(element => {
        if (element) element.textContent = count;
    });
}

// Toggle cart modal
function toggleCart() {
    const modal = document.getElementById('cart-modal') || document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    if (!modal) {
        console.warn('Cart modal not found');
        return;
    }
    
    const isActive = modal.classList.contains('active');
    
    if (isActive) {
        modal.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    } else {
        modal.classList.add('active');
        if (overlay) overlay.classList.add('active');
        updateCartDisplay();
    }
}

// Update cart display with fixed image handling
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items') || document.getElementById('cartItems');
    const totalAmount = document.getElementById('total-amount');
    
    if (!cartItems) {
        console.warn('Cart items container not found');
        return;
    }
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty<br/>Add some items to get started!</div>';
        if (totalAmount) totalAmount.textContent = '0';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
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
                <div class="item-price">₹${item.price}</div>
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
    
    if (totalAmount) totalAmount.textContent = total;
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
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

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    updateCartDisplay();
}

// Get cart data for checkout
function getCartData() {
    return {
        items: cart,
        total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        itemCount: cart.reduce((total, item) => total + item.quantity, 0)
    };
}

// Clear cart
function clearCart() {
    cart = [];
    updateCartCount();
    updateCartDisplay();
}

// Helper function
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Initialize cart
function initCart() {
    updateCartCount();
    console.log('✅ Cart management initialized');
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}

// Export functions
window.cart = cart;
window.addToCart = addToCart;
window.showCartNotification = showCartNotification;
window.updateCartCount = updateCartCount;
window.toggleCart = toggleCart;
window.updateCartDisplay = updateCartDisplay;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.getCartData = getCartData;
window.clearCart = clearCart;

console.log('✅ cart-management.js loaded successfully');
