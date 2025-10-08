// Database Integration Module
// Handles all database operations and data fetching

class DatabaseIntegration {
  constructor() {
    this.apiEndpoint = 'https://api.example.com'; // Replace with your API
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // Fetch all products
  async fetchProducts() {
    const cacheKey = 'all_products';
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${this.apiEndpoint}/products`);
      const data = await response.json();
      
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
      });
      
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return this.getSampleProducts();
    }
  }

  // Fetch single product by ID
  async fetchProductById(id) {
    try {
      const response = await fetch(`${this.apiEndpoint}/products/${id}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  // Search products
  async searchProducts(query) {
    try {
      const response = await fetch(`${this.apiEndpoint}/products/search?q=${encodeURIComponent(query)}`);
      return await response.json();
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Save order
  async saveOrder(orderData) {
    try {
      const response = await fetch(`${this.apiEndpoint}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error saving order:', error);
      return { success: false, error: error.message };
    }
  }

  // Get sample products (fallback)
  getSampleProducts() {
    return [
      {
        id: 1,
        name: 'Wireless Headphones',
        price: 79.99,
        image: 'https://via.placeholder.com/250x200?text=Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        category: 'Electronics'
      },
      {
        id: 2,
        name: 'Smart Watch',
        price: 199.99,
        image: 'https://via.placeholder.com/250x200?text=Smart+Watch',
        description: 'Feature-rich smartwatch with fitness tracking',
        category: 'Electronics'
      },
      {
        id: 3,
        name: 'Laptop Backpack',
        price: 49.99,
        image: 'https://via.placeholder.com/250x200?text=Backpack',
        description: 'Durable laptop backpack with multiple compartments',
        category: 'Accessories'
      },
      {
        id: 4,
        name: 'USB-C Hub',
        price: 34.99,
        image: 'https://via.placeholder.com/250x200?text=USB+Hub',
        description: 'Multi-port USB-C hub for connectivity',
        category: 'Electronics'
      },
      {
        id: 5,
        name: 'Wireless Mouse',
        price: 29.99,
        image: 'https://via.placeholder.com/250x200?text=Mouse',
        description: 'Ergonomic wireless mouse with precision tracking',
        category: 'Electronics'
      },
      {
        id: 6,
        name: 'Phone Stand',
        price: 15.99,
        image: 'https://via.placeholder.com/250x200?text=Phone+Stand',
        description: 'Adjustable phone stand for desk',
        category: 'Accessories'
      }
    ];
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Initialize and expose globally
window.dbIntegration = new DatabaseIntegration();
console.log('Database Integration loaded');