// Cart Management Module
// Handles shopping cart operations

class CartManager {
  constructor() {
    this.cart = [];
    this.cartData = null; // In-memory storage
  }

  // Initialize cart UI
  init() {
    this.loadCart();
    this.setupEventListeners();
    this.updateCartUI();
  }

  // Setup event listeners
  setupEventListeners() {
    const cartIcon = document.getElementById('cartIcon');
    const closeCart = document.getElementById('closeCart');
    const overlay = document.getElementById('overlay');

    if (cartIcon) {
      cartIcon.addEventListener('click', () => this.openCart());
    }

    if (closeCart) {
      closeCart.addEventListener('click', () => this.closeCart());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.closeCart());
    }
  }

  // Add item to cart
  addItem(product, quantity = 1) {
    const existingItem = this.cart.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }

    this.saveCart();
    this.updateCartUI();
    this.showNotification(`${product.name} added to cart`);
  }

  // Remove item from cart
  removeItem(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartUI();
  }

  // Update item quantity
  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
        this.updateCartUI();
      }
    }
  }

  // Get cart items
  getItems() {
    return this.cart;
  }

  // Get cart total
  getTotal() {
    return this.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  // Get cart count
  getCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  // Clear cart
  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartUI();
  }

  // Save cart to memory
  saveCart() {
    try {
      this.cartData = JSON.stringify(this.cart);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  // Load cart from memory
  loadCart() {
    try {
      if (this.cartData) {
        this.cart = JSON.parse(this.cartData);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      this.cart = [];
    }
  }

  // Update cart UI
  updateCartUI() {
    this.updateCartCount();
    this.updateCartItems();
    this.updateCartTotal();
  }

  // Update cart count badge
  updateCartCount() {
    const countElement = document.getElementById('cartCount');
    if (countElement) {
      const count = this.getCount();
      countElement.textContent = count;
      countElement.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // Update cart items display
  updateCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;

    if (this.cart.length === 0) {
      cartItemsContainer.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">Your cart is empty</p>';
      return;
    }

    cartItemsContainer.innerHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
    this.attachCartItemListeners();
  }

  // Create cart item HTML
  createCartItemHTML(item) {
    return `
      <div class="cart-item" style="display:flex;gap:15px;margin-bottom:15px;padding:15px;border:1px solid #e0e0e0;border-radius:5px;">
        <img src="${item.image}" alt="${item.name}" style="width:80px;height:80px;object-fit:cover;border-radius:5px;" />
        <div style="flex:1;">
          <h4 style="margin:0 0 5px 0;font-size:14px;">${item.name}</h4>
          <p style="margin:0;color:#007bff;font-weight:bold;">$${item.price.toFixed(2)}</p>
          <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
            <button class="qty-btn" data-action="decrease" data-id="${item.id}" style="width:25px;height:25px;border:1px solid #ddd;background:white;cursor:pointer;border-radius:3px;">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" data-action="increase" data-id="${item.id}" style="width:25px;height:25px;border:1px solid #ddd;background:white;cursor:pointer;border-radius:3px;">+</button>
            <button class="remove-btn" data-id="${item.id}" style="margin-left:auto;color:#dc3545;border:none;background:transparent;cursor:pointer;">Remove</button>
          </div>
        </div>
      </div>
    `;
  }

  // Attach event listeners to cart items
  attachCartItemListeners() {
    const qtyButtons = document.querySelectorAll('.qty-btn');
    qtyButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        const id = parseInt(e.target.getAttribute('data-id'));
        const item = this.cart.find(item => item.id === id);
        
        if (item) {
          if (action === 'increase') {
            this.updateQuantity(id, item.quantity + 1);
          } else if (action === 'decrease') {
            this.updateQuantity(id, item.quantity - 1);
          }
        }
      });
    });

    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        this.removeItem(id);
      });
    });
  }

  // Update cart total
  updateCartTotal() {
    const totalElement = document.getElementById('cartTotal');
    if (totalElement) {
      totalElement.textContent = this.getTotal().toFixed(2);
    }
  }

  // Open cart sidebar
  openCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    
    if (cartSidebar) {
      cartSidebar.classList.add('open');
    }
    if (overlay) {
      overlay.classList.add('active');
    }
  }

  // Close cart sidebar
  closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    
    if (cartSidebar) {
      cartSidebar.classList.remove('open');
    }
    if (overlay) {
      overlay.classList.remove('active');
    }
  }

  // Show notification
  showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 3000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.cartManager = new CartManager();
  window.cartManager.init();
});

console.log('Cart Management loaded');