/**
 * CartManager - Universal Shopping Cart System
 * Version: 1.0.0
 * A lightweight, standalone cart management library for e-commerce applications
 * 
 * Usage:
 * <script src="cart-manager.js"></script>
 * <script>
 *   const cart = new CartManager({
 *     currency: '₹',
 *     storageKey: 'my_cart',
 *     onUpdate: (cart) => console.log('Cart updated:', cart)
 *   });
 * </script>
 */

(function(window) {
  'use strict';

  class CartManager {
    constructor(options = {}) {
      // Configuration
      this.config = {
        currency: options.currency || '$',
        storageKey: options.storageKey || 'shopping_cart',
        enableLocalStorage: options.enableLocalStorage !== false,
        notificationDuration: options.notificationDuration || 2000,
        animationDuration: options.animationDuration || 1000,
        onUpdate: options.onUpdate || null,
        onAdd: options.onAdd || null,
        onRemove: options.onRemove || null,
        onClear: options.onClear || null,
        deliveryCharge: options.deliveryCharge || 0
      };

      // Cart state
      this.items = [];
      
      // Load cart from storage if enabled
      if (this.config.enableLocalStorage) {
        this.loadFromStorage();
      }

      // Initialize notification system
      this.initNotificationSystem();
    }

    /**
     * Initialize notification system
     */
    initNotificationSystem() {
      if (typeof document === 'undefined') return;

      // Create notification element if it doesn't exist
      let notification = document.getElementById('cart-notification');
      if (!notification) {
        notification = document.createElement('div');
        notification.id = 'cart-notification';
        notification.className = 'cart-notification';
        notification.innerHTML = 'Item added to cart! 🛒';
        document.body.appendChild(notification);

        // Add CSS if not already present
        if (!document.getElementById('cart-notification-styles')) {
          const style = document.createElement('style');
          style.id = 'cart-notification-styles';
          style.textContent = `
            .cart-notification {
              position: fixed;
              top: 100px;
              right: 20px;
              color: #28a745;
              padding: 12px 20px;
              border-radius: 8px;
              z-index: 2000;
              transform: translateX(350px);
              transition: transform 0.3s ease;
              font-weight: 600;
              font-size: 16px;
              background: transparent;
              pointer-events: none;
            }
            .cart-notification.show {
              transform: translateX(0);
            }
            @media (max-width: 768px) {
              .cart-notification {
                right: 10px;
                top: 80px;
                font-size: 14px;
                padding: 10px 16px;
              }
            }
          `;
          document.head.appendChild(style);
        }
      }
      this.notification = notification;
    }

    /**
     * Add item to cart
     * @param {Object} product - Product object with id, name, price, image, etc.
     * @param {number} quantity - Quantity to add (default: 1)
     * @param {HTMLElement} buttonElement - Optional button element for visual feedback
     */
    addToCart(product, quantity = 1, buttonElement = null) {
      if (!product || !product.id) {
        console.error('Invalid product: Product must have an id');
        return false;
      }

      const existingItem = this.items.find(item => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items.push({
          id: product.id,
          name: product.name || 'Unnamed Product',
          price: product.price || 0,
          image: product.image || '',
          category: product.category || '',
          quantity: quantity
        });
      }

      // Save to storage
      this.saveToStorage();

      // Show notification
      this.showNotification();

      // Add button feedback
      if (buttonElement) {
        this.addButtonFeedback(buttonElement);
      }

      // Trigger callbacks
      if (this.config.onAdd) {
        this.config.onAdd(product, this.items);
      }
      if (this.config.onUpdate) {
        this.config.onUpdate(this.items);
      }

      return true;
    }

    /**
     * Update item quantity
     * @param {number|string} productId - Product ID
     * @param {number} change - Quantity change (can be negative)
     */
    updateQuantity(productId, change) {
      const item = this.items.find(item => item.id == productId);
      
      if (!item) {
        console.error('Item not found in cart');
        return false;
      }

      item.quantity += change;

      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveToStorage();
        if (this.config.onUpdate) {
          this.config.onUpdate(this.items);
        }
      }

      return true;
    }

    /**
     * Set item quantity directly
     * @param {number|string} productId - Product ID
     * @param {number} quantity - New quantity
     */
    setQuantity(productId, quantity) {
      const item = this.items.find(item => item.id == productId);
      
      if (!item) {
        console.error('Item not found in cart');
        return false;
      }

      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.saveToStorage();
        if (this.config.onUpdate) {
          this.config.onUpdate(this.items);
        }
      }

      return true;
    }

    /**
     * Remove item from cart
     * @param {number|string} productId - Product ID
     */
    removeFromCart(productId) {
      const initialLength = this.items.length;
      this.items = this.items.filter(item => item.id != productId);

      if (this.items.length < initialLength) {
        this.saveToStorage();
        
        if (this.config.onRemove) {
          this.config.onRemove(productId, this.items);
        }
        if (this.config.onUpdate) {
          this.config.onUpdate(this.items);
        }
        return true;
      }

      return false;
    }

    /**
     * Clear entire cart
     */
    clearCart() {
      this.items = [];
      this.saveToStorage();

      if (this.config.onClear) {
        this.config.onClear();
      }
      if (this.config.onUpdate) {
        this.config.onUpdate(this.items);
      }
    }

    /**
     * Get cart items
     * @returns {Array} Cart items
     */
    getItems() {
      return [...this.items];
    }

    /**
     * Get item by ID
     * @param {number|string} productId - Product ID
     * @returns {Object|null} Cart item or null
     */
    getItem(productId) {
      return this.items.find(item => item.id == productId) || null;
    }

    /**
     * Get total item count
     * @returns {number} Total quantity of all items
     */
    getTotalCount() {
      return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * Get subtotal (without delivery)
     * @returns {number} Subtotal amount
     */
    getSubtotal() {
      return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    /**
     * Get total (with delivery charge)
     * @returns {number} Total amount
     */
    getTotal() {
      return this.getSubtotal() + this.config.deliveryCharge;
    }

    /**
     * Check if cart is empty
     * @returns {boolean}
     */
    isEmpty() {
      return this.items.length === 0;
    }

    /**
     * Check if product is in cart
     * @param {number|string} productId - Product ID
     * @returns {boolean}
     */
    hasItem(productId) {
      return this.items.some(item => item.id == productId);
    }

    /**
     * Show notification
     */
    showNotification(message = 'Item added to cart! 🛒') {
      if (!this.notification) return;

      this.notification.textContent = message;
      this.notification.classList.add('show');

      setTimeout(() => {
        this.notification.classList.remove('show');
      }, this.config.notificationDuration);
    }

    /**
     * Add visual feedback to button
     * @param {HTMLElement} buttonElement - Button element
     */
    addButtonFeedback(buttonElement) {
      if (!buttonElement) return;

      const originalText = buttonElement.textContent;
      const originalBg = buttonElement.style.backgroundColor;

      buttonElement.textContent = 'Added!';
      buttonElement.style.backgroundColor = '#28a745';

      setTimeout(() => {
        buttonElement.textContent = originalText;
        buttonElement.style.backgroundColor = originalBg;
      }, this.config.animationDuration);
    }

    /**
     * Save cart to localStorage
     */
    saveToStorage() {
      if (!this.config.enableLocalStorage || typeof localStorage === 'undefined') {
        return;
      }

      try {
        localStorage.setItem(this.config.storageKey, JSON.stringify(this.items));
      } catch (e) {
        console.error('Failed to save cart to localStorage:', e);
      }
    }

    /**
     * Load cart from localStorage
     */
    loadFromStorage() {
      if (!this.config.enableLocalStorage || typeof localStorage === 'undefined') {
        return;
      }

      try {
        const stored = localStorage.getItem(this.config.storageKey);
        if (stored) {
          this.items = JSON.parse(stored);
        }
      } catch (e) {
        console.error('Failed to load cart from localStorage:', e);
        this.items = [];
      }
    }

    /**
     * Export cart data
     * @returns {Object} Cart data with items and totals
     */
    exportData() {
      return {
        items: this.getItems(),
        count: this.getTotalCount(),
        subtotal: this.getSubtotal(),
        deliveryCharge: this.config.deliveryCharge,
        total: this.getTotal(),
        currency: this.config.currency
      };
    }

    /**
     * Import cart data
     * @param {Array} items - Array of cart items
     */
    importData(items) {
      if (!Array.isArray(items)) {
        console.error('Invalid import data: Expected array');
        return false;
      }

      this.items = items;
      this.saveToStorage();

      if (this.config.onUpdate) {
        this.config.onUpdate(this.items);
      }

      return true;
    }

    /**
     * Generate order summary for WhatsApp/Email
     * @param {Object} customerInfo - Customer information
     * @returns {string} Formatted order summary
     */
    generateOrderSummary(customerInfo = {}) {
      let summary = `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      summary += `📦 ORDER SUMMARY\n`;
      summary += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      if (customerInfo.name) summary += `👤 Name: ${customerInfo.name}\n`;
      if (customerInfo.mobile) summary += `📱 Mobile: ${customerInfo.mobile}\n`;
      if (customerInfo.email) summary += `📧 Email: ${customerInfo.email}\n`;
      if (customerInfo.address) summary += `📍 Address: ${customerInfo.address}\n`;

      summary += `\n━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      summary += `🛒 ITEMS:\n`;
      summary += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      this.items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        summary += `${index + 1}. ${item.name}\n`;
        summary += `   ${item.quantity} × ${this.config.currency}${item.price} = ${this.config.currency}${itemTotal}\n\n`;
      });

      summary += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      summary += `Subtotal: ${this.config.currency}${this.getSubtotal()}\n`;
      
      if (this.config.deliveryCharge > 0) {
        summary += `Delivery: ${this.config.currency}${this.config.deliveryCharge}\n`;
      }
      
      summary += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      summary += `💰 TOTAL: ${this.config.currency}${this.getTotal()}\n`;
      summary += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

      return summary;
    }

    /**
     * Generate WhatsApp URL
     * @param {string} phoneNumber - WhatsApp phone number (with country code)
     * @param {Object} customerInfo - Customer information
     * @returns {string} WhatsApp URL
     */
    generateWhatsAppURL(phoneNumber, customerInfo = {}) {
      const message = this.generateOrderSummary(customerInfo);
      const encodedMessage = encodeURIComponent(message);
      return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    }
  }

  // Expose to global scope
  window.CartManager = CartManager;

  // AMD support
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return CartManager;
    });
  }

  // CommonJS support
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
  }

})(typeof window !== 'undefined' ? window : this);
