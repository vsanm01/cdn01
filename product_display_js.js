// Product Display Module
// Handles rendering and displaying products

class ProductDisplay {
  constructor() {
    this.productsContainer = null;
    this.products = [];
  }

  // Initialize
  async init() {
    this.productsContainer = document.getElementById('productsGrid');
    if (!this.productsContainer) {
      console.error('Products container not found');
      return;
    }

    await this.loadProducts();
  }

  // Load products from database
  async loadProducts() {
    if (!window.dbIntegration) {
      console.error('Database integration not loaded');
      return;
    }

    try {
      this.products = await window.dbIntegration.fetchProducts();
      this.renderProducts(this.products);
    } catch (error) {
      console.error('Error loading products:', error);
      this.showError('Failed to load products');
    }
  }

  // Render products
  renderProducts(products) {
    if (!this.productsContainer) return;

    if (products.length === 0) {
      this.productsContainer.innerHTML = '<p style="text-align:center;padding:40px;">No products found</p>';
      return;
    }

    this.productsContainer.innerHTML = products.map(product => this.createProductCard(product)).join('');
    this.attachEventListeners();
  }

  // Create product card HTML
  createProductCard(product) {
    return `
      <div class="product-card" data-product-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" class="product-image" />
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-price">$${product.price.toFixed(2)}</p>
          <button class="add-to-cart-btn" data-product-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  }

  // Attach event listeners to add to cart buttons
  attachEventListeners() {
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = parseInt(e.target.getAttribute('data-product-id'));
        this.addToCart(productId);
      });
    });
  }

  // Add product to cart
  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (product && window.cartManager) {
      window.cartManager.addItem(product);
      this.showAddedToCartAnimation(productId);
    }
  }

  // Show animation when product added to cart
  showAddedToCartAnimation(productId) {
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (card) {
      card.style.transform = 'scale(0.95)';
      setTimeout(() => {
        card.style.transform = '';
      }, 200);
    }
  }

  // Filter products by category
  filterByCategory(category) {
    const filtered = category === 'all' 
      ? this.products 
      : this.products.filter(p => p.category === category);
    this.renderProducts(filtered);
  }

  // Sort products
  sortProducts(sortBy) {
    let sorted = [...this.products];
    
    switch(sortBy) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    this.renderProducts(sorted);
  }

  // Show error message
  showError(message) {
    if (this.productsContainer) {
      this.productsContainer.innerHTML = `
        <div style="text-align:center;padding:40px;color:#dc3545;">
          <p>${message}</p>
        </div>
      `;
    }
  }

  // Get all products
  getAllProducts() {
    return this.products;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.productDisplay = new ProductDisplay();
  window.productDisplay.init();
});

console.log('Product Display loaded');