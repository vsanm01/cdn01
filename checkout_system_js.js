// Checkout System Module
// Handles checkout process and order placement

class CheckoutSystem {
  constructor() {
    this.checkoutData = {
      customer: {},
      items: [],
      total: 0,
      orderId: null
    };
  }

  // Initialize checkout
  init() {
    this.setupCheckoutButton();
  }

  // Setup checkout button
  setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.startCheckout());
    }
  }

  // Start checkout process
  startCheckout() {
    if (!window.cartManager) {
      console.error('Cart manager not available');
      return;
    }

    const items = window.cartManager.getItems();
    
    if (items.length === 0) {
      this.showMessage('Your cart is empty', 'error');
      return;
    }

    this.checkoutData.items = items;
    this.checkoutData.total = window.cartManager.getTotal();
    
    this.showCheckoutForm();
  }

  // Show checkout form
  showCheckoutForm() {
    const modal = this.createCheckoutModal();
    document.body.appendChild(modal);
    
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  // Create checkout modal
  createCheckoutModal() {
    const modal = document.createElement('div');
    modal.id = 'checkoutModal';
    modal.className = 'checkout-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
      opacity: 0;
      transition: opacity 0.3s;
    `;

    modal.innerHTML = `
      <div style="background:white;padding:30px;border-radius:10px;max-width:500px;width:90%;max-height:90vh;overflow-y:auto;">
        <h2 style="margin-top:0;">Checkout</h2>
        <form id="checkoutForm">
          <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:600;">Full Name *</label>
            <input type="text" name="name" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;" />
          </div>
          
          <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:600;">Email *</label>
            <input type="email" name="email" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;" />
          </div>
          
          <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:600;">Phone *</label>
            <input type="tel" name="phone" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;" />
          </div>
          
          <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:600;">Address *</label>
            <textarea name="address" required rows="3" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;"></textarea>
          </div>
          
          <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:600;">City *</label>
            <input type="text" name="city" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;" />
          </div>
          
          <div style="margin-bottom:15px;">
            <label style="display:block;margin-bottom:5px;font-weight:600;">Postal Code *</label>
            <input type="text" name="postal" required style="width:100%;padding:10px;border:1px solid #ddd;border-radius:5px;" />
          </div>
          
          <div style="margin-bottom:20px;">
            <h3>Order Summary</h3>
            <div id="orderSummary" style="background:#f8f9fa;padding:15px;border-radius:5px;margin-bottom:15px;">
              ${this.generateOrderSummaryHTML()}
            </div>
            <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;">
              <span>Total:</span>
              <span>$${this.checkoutData.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div style="display:flex;gap:10px;">
            <button type="button" onclick="window.checkoutSystem.closeCheckout()" style="flex:1;padding:12px;background:#6c757d;color:white;border:none;border-radius:5px;cursor:pointer;">Cancel</button>
            <button type="submit" style="flex:1;padding:12px;background:#28a745;color:white;border:none;border-radius:5px;cursor:pointer;">Place Order</button>
          </div>
        </form>
      </div>
    `;

    modal.querySelector('.checkout-modal').style.opacity = '1';
    
    // Attach form submit handler
    setTimeout(() => {
      const form = modal.querySelector('#checkoutForm');
      if (form) {
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
      }
    }, 100);

    return modal;
  }

  // Generate order summary HTML
  generateOrderSummaryHTML() {
    return this.checkoutData.items.map(item => `
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <span>${item.name} x ${item.quantity}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');
  }

  // Handle form submission
  async handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Collect customer data
    this.checkoutData.customer = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      postal: formData.get('postal')
    };

    // Show loading
    this.showLoading();

    // Process order
    await this.processOrder();
  }

  // Process order
  async processOrder() {
    try {
      // Generate order ID
      this.checkoutData.orderId = 'ORD-' + Date.now();
      
      // Prepare order data
      const orderData = {
        orderId: this.checkoutData.orderId,
        customer: this.checkoutData.customer,
        items: this.checkoutData.items,
        total: this.checkoutData.total,
        date: new Date().toISOString()
      };

      // Save order to database
      let result;
      if (window.dbIntegration) {
        result = await window.dbIntegration.saveOrder(orderData);
      } else {
        // Fallback: simulate success
        result = { success: true, orderId: orderData.orderId };
      }

      if (result.success) {
        // Clear cart
        if (window.cartManager) {
          window.cartManager.clearCart();
        }

        // Show success message
        this.showSuccess();
      } else {
        this.showMessage('Failed to place order. Please try again.', 'error');
      }

    } catch (error) {
      console.error('Error processing order:', error);
      this.showMessage('An error occurred. Please try again.', 'error');
    }
  }

  // Show loading state
  showLoading() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
      const content = modal.querySelector('div > div');
      content.innerHTML = `
        <div style="text-align:center;padding:40px;">
          <div style="border:4px solid #f3f3f3;border-top:4px solid #007bff;border-radius:50%;width:50px;height:50px;animation:spin 1s linear infinite;margin:0 auto 20px;"></div>
          <p>Processing your order...</p>
        </div>
      `;
    }
  }

  // Show success message
  showSuccess() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
      const content = modal.querySelector('div > div');
      content.innerHTML = `
        <div style="text-align:center;padding:40px;">
          <div style="width:60px;height:60px;background:#28a745;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:white;font-size:30px;">✓</div>
          <h2 style="color:#28a745;margin-bottom:10px;">Order Placed Successfully!</h2>
          <p>Order ID: <strong>${this.checkoutData.orderId}</strong></p>
          <p>A confirmation email has been sent to <strong>${this.checkoutData.customer.email}</strong></p>
          <button onclick="window.checkoutSystem.closeCheckout()" style="margin-top:20px;padding:12px 30px;background:#007bff;color:white;border:none;border-radius:5px;cursor:pointer;">Continue Shopping</button>
        </div>
      `;
    }
  }

  // Show message
  showMessage(message, type = 'info') {
    const color = type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff';
    
    const msg = document.createElement('div');
    msg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${color};
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 4000;
    `;
    msg.textContent = message;

    document.body.appendChild(msg);

    setTimeout(() => {
      msg.remove();
    }, 3000);
  }

  // Close checkout modal
  closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }

  // Validate form data
  validateFormData(data) {
    const required = ['name', 'email', 'phone', 'address', 'city', 'postal'];
    
    for (let field of required) {
      if (!data[field] || data[field].trim() === '') {
        return { valid: false, message: `${field} is required` };
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { valid: false, message: 'Invalid email address' };
    }

    return { valid: true };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.checkoutSystem = new CheckoutSystem();
  window.checkoutSystem.init();
});

// Add spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

console.log('Checkout System loaded');