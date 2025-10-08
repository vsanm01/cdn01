// Search Functionality Module
// Handles product search and filtering

class SearchFunctionality {
  constructor() {
    this.searchInput = null;
    this.searchTimeout = null;
    this.minSearchLength = 2;
  }

  // Initialize search
  init() {
    this.searchInput = document.getElementById('searchInput');
    if (!this.searchInput) {
      console.error('Search input not found');
      return;
    }

    this.attachEventListeners();
  }

  // Attach event listeners
  attachEventListeners() {
    // Real-time search with debounce
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.performSearch(e.target.value);
      }, 300);
    });

    // Clear search on ESC key
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });
  }

  // Perform search
  performSearch(query) {
    query = query.trim();

    // If search is empty, show all products
    if (query.length === 0) {
      this.showAllProducts();
      return;
    }

    // Minimum search length
    if (query.length < this.minSearchLength) {
      return;
    }

    const results = this.searchProducts(query);
    this.displayResults(results, query);
  }

  // Search products locally
  searchProducts(query) {
    if (!window.productDisplay || !window.productDisplay.getAllProducts) {
      return [];
    }

    const products = window.productDisplay.getAllProducts();
    const searchTerm = query.toLowerCase();

    return products.filter(product => {
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Display search results
  displayResults(results, query) {
    if (window.productDisplay) {
      window.productDisplay.renderProducts(results);
      
      // Show search info
      this.showSearchInfo(results.length, query);
    }
  }

  // Show search information
  showSearchInfo(count, query) {
    const container = document.getElementById('productsGrid');
    if (!container) return;

    // Remove existing search info
    const existingInfo = document.querySelector('.search-info');
    if (existingInfo) {
      existingInfo.remove();
    }

    // Create search info element
    const searchInfo = document.createElement('div');
    searchInfo.className = 'search-info';
    searchInfo.style.cssText = 'padding:10px;margin-bottom:20px;background:#e3f2fd;border-radius:5px;';
    searchInfo.innerHTML = `
      <p style="margin:0;">
        Found <strong>${count}</strong> result${count !== 1 ? 's' : ''} for "<strong>${query}</strong>"
        <button onclick="window.searchFunctionality.clearSearch()" style="float:right;background:transparent;border:none;cursor:pointer;color:#007bff;">
          Clear ✕
        </button>
      </p>
    `;

    container.parentNode.insertBefore(searchInfo, container);
  }

  // Clear search
  clearSearch() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }

    // Remove search info
    const searchInfo = document.querySelector('.search-info');
    if (searchInfo) {
      searchInfo.remove();
    }

    this.showAllProducts();
  }

  // Show all products
  showAllProducts() {
    if (window.productDisplay) {
      window.productDisplay.loadProducts();
    }
  }

  // Advanced search with filters
  advancedSearch(options) {
    if (!window.productDisplay) return [];

    let products = window.productDisplay.getAllProducts();

    // Apply query filter
    if (options.query) {
      const query = options.query.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (options.category && options.category !== 'all') {
      products = products.filter(p => p.category === options.category);
    }

    // Apply price range filter
    if (options.minPrice !== undefined) {
      products = products.filter(p => p.price >= options.minPrice);
    }
    if (options.maxPrice !== undefined) {
      products = products.filter(p => p.price <= options.maxPrice);
    }

    return products;
  }

  // Get search suggestions
  getSuggestions(query) {
    if (!window.productDisplay) return [];

    const products = window.productDisplay.getAllProducts();
    const searchTerm = query.toLowerCase();
    const suggestions = new Set();

    products.forEach(product => {
      if (product.name.toLowerCase().includes(searchTerm)) {
        suggestions.add(product.name);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.searchFunctionality = new SearchFunctionality();
  window.searchFunctionality.init();
});

console.log('Search Functionality loaded');