// ============================================================================
// MODULE 4: CART MANAGEMENT
// ============================================================================

const CartManagement = (function() {
    'use strict';

    let config = {
        modalSelector: '#cart-modal',
        itemsSelector: '#cart-items',
        countSelector: '#cart-count',
        totalSelector: '#total-amount',
        notificationSelector: '#cart-notification',
        checkoutButtonSelector: '.checkout-btn',
        onCheckout: null,
        currencySymbol: '₹',
        storageKey: 'shopping_cart'
    };

    let cart = [];

    function init(options) {
        config = { ...config, ...options };
        loadCartFromStorage();
        updateCartUI();
        setupEventListeners();
    }

    function setupEventListeners() {
        const checkoutBtn = document.querySelector(config.checkoutButtonSelector);
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', handleCheckout);
        }

        const modal = document.querySelector(config.modalSelector);
        if (modal) {
            window.addEventListener('click', function(event) {
                if (event.target === modal) toggleCart();
            });
        }
    }

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function createImageContent(item) {
        if (item.image && DBIntegration.isValidURL(item.image)) {
            const imageUrl = DBIntegration.convertGoogleDriveUrl(item.image);
            return `<img src="${imageUrl}" alt="${escapeHtml(item.name)}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div style="display: none; font-size: 24px;">🛒</div>`;
        } else if (item.image && item.image.trim() !== '') {
            return `<div style="font-size: 24px;">${item.image}</div>`;
        } else {
            return `<div style="font-size: 24px;">🛒</div>`;
        }
    }

    function createCartItem(item) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.setAttribute('data-product-id', item.id);
        const imageContent = createImageContent(item);
        
        cartItem.innerHTML = `
            <div class="item-image">${imageContent}</div>
            <div class="item-details">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-price">${config.currencySymbol}${item.price}</div>
            </div>
            <div class="qty-controls">
                <button class="qty-btn" data-action="decrease" data-product-id="${item.id}">-</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" data-action="increase" data-product-id="${item.id}">+</button>
            </div>
            <button class="remove-item" data-product-id="${item.id}">×</button>
        `;
        
        cartItem.querySelector('[data-action="decrease"]').addEventListener('click', () => updateQuantity(item.id, -1));
        cartItem.querySelector('[data-action="increase"]').addEventListener('click', () => updateQuantity(item.id, 1));
        cartItem.querySelector('.remove-item').addEventListener('click', () => removeFromCart(item.id));
        
        return cartItem;
    }

    function addToCart(productId) {
        const product = DBIntegration.getProductById(productId);
        if (!product) return false;
        
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        saveCartToStorage();
        updateCartUI();
        showNotification();
        return true;
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCartToStorage();
        updateCartUI();
    }

    function updateQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCartToStorage();
                updateCartUI();
            }
        }
    }

    function getCart() { return cart; }
    function getTotal() {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    function getCount() {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }

    function clearCart() {
        cart = [];
        saveCartToStorage();
        updateCartUI();
    }

    function updateCartUI() {
        updateCartCount();
        updateCartDisplay();
    }

    function updateCartCount() {
        const countElement = document.querySelector(config.countSelector);
        if (countElement) countElement.textContent = getCount();
    }

    function updateCartDisplay() {
        const itemsContainer = document.querySelector(config.itemsSelector);
        const totalElement = document.querySelector(config.totalSelector);
        if (!itemsContainer) return;
        
        if (cart.length === 0) {
            itemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty<br/>Add some items to get started!</div>';
            if (totalElement) totalElement.textContent = '0';
            return;
        }
        
        itemsContainer.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            total += item.price * item.quantity;
            itemsContainer.appendChild(createCartItem(item));
        });
        
        if (totalElement) totalElement.textContent = total;
    }

    function toggleCart() {
        const modal = document.querySelector(config.modalSelector);
        if (modal) {
            modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
            if (modal.style.display === 'block') updateCartDisplay();
        }
    }

    function showNotification() {
        const notification = document.querySelector(config.notificationSelector);
        if (notification) {
            notification.classList.add('show');
            setTimeout(() => notification.classList.remove('show'), 2000);
        }
    }

    function handleCheckout() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        if (config.onCheckout) config.onCheckout(cart, getTotal());
    }

    function saveCartToStorage() {
        try {
            localStorage.setItem(config.storageKey, JSON.stringify(cart));
        } catch (e) {
            console.warn('Failed to save cart:', e);
        }
    }

    function loadCartFromStorage() {
        try {
            const stored = localStorage.getItem(config.storageKey);
            if (stored) cart = JSON.parse(stored);
        } catch (e) {
            console.warn('Failed to load cart:', e);
            cart = [];
        }
    }

    return {
        init, addToCart, removeFromCart, updateQuantity,
        getCart, getTotal, getCount, clearCart, toggleCart
    };
})();
