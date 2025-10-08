/**
 * ProductDisplay - Universal Product Grid Display Library
 * Creates responsive product cards with image handling and i18n support
 * Version: 1.0.0
 * Author: Your Name
 * Repository: https://github.com/vsanm01/cdn01
 * Dependencies: ImageHandler_cdn_lib.js (optional), i18n_lib.js (optional)
 */

(function(global) {
    'use strict';

    const ProductDisplay = {
        version: '1.0.0',
        
        /**
         * Render products in a grid layout
         * @param {Array} products - Array of product objects
         * @param {string|HTMLElement} container - Container element or selector
         * @param {object} options - Configuration options
         */
        render(products, container, options = {}) {
            const config = {
                columns: {
                    desktop: options.desktopColumns || 5,
                    mobile: options.mobileColumns || 2
                },
                currencySymbol: options.currencySymbol || this._getCurrencySymbol(),
                onCategoryClick: options.onCategoryClick || null,
                onAddToCart: options.onAddToCart || null,
                useImageHandler: options.useImageHandler !== false, // Default true
                emptyMessage: options.emptyMessage || 'No products match your search criteria.',
                imageOptions: options.imageOptions || {},
                cardClass: options.cardClass || 'product-card',
                gridClass: options.gridClass || 'products-grid',
                ...options
            };

            // Get container element
            const containerEl = typeof container === 'string' 
                ? document.querySelector(container) 
                : container;

            if (!containerEl) {
                console.error('[ProductDisplay] Container not found');
                return;
            }

            // Apply grid styles
            this._applyGridStyles(containerEl, config);

            // Clear container
            containerEl.innerHTML = '';

            // Handle empty products
            if (!products || products.length === 0) {
                containerEl.innerHTML = this._getEmptyMessage(config.emptyMessage);
                return;
            }

            // Render each product
            products.forEach(product => {
                const card = this._createProductCard(product, config);
                containerEl.appendChild(card);
            });
        },

        /**
         * Create a single product card
         * @private
         */
        _createProductCard(product, config) {
            const card = document.createElement('div');
            card.className = config.cardClass;
            card.dataset.productId = product.id;

            // Generate image HTML
            const imageHTML = this._generateImageHTML(product, config);

            // Generate category HTML
            const categoryHTML = product.category 
                ? `<button class="category-tag" data-category="${product.category}">${product.category}</button>`
                : '';

            card.innerHTML = `
                <div class="product-image">${imageHTML}</div>
                <div class="product-info">
                    <h3 class="product-title">${this._escapeHtml(product.name)}</h3>
                    ${categoryHTML}
                    <div class="product-price">
                        <span class="currency-symbol">${config.currencySymbol}</span>${product.price}
                    </div>
                    <button class="add-to-cart" data-product-id="${product.id}">Add to Cart</button>
                </div>
            `;

            // Attach event listeners
            this._attachEventListeners(card, product, config);

            return card;
        },

        /**
         * Generate image HTML using ImageHandler if available
         * @private
         */
        _generateImageHTML(product, config) {
            // Check if ImageHandler library is available
            if (config.useImageHandler && typeof ImageHandler !== 'undefined') {
                return ImageHandler.generateHTML(
                    product.image, 
                    product.name, 
                    config.imageOptions
                );
            }

            // Fallback to basic image handling
            if (product.image && this._isValidURL(product.image)) {
                return `
                    <img src="${product.image}" alt="${this._escapeHtml(product.name)}" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div style="display: none; font-size: 48px;">🛒</div>
                `;
            } else if (product.image) {
                return `<div style="font-size: 48px;">${product.image}</div>`;
            } else {
                return `<div style="font-size: 48px;">🛒</div>`;
            }
        },

        /**
         * Attach event listeners to card elements
         * @private
         */
        _attachEventListeners(card, product, config) {
            // Category click
            const categoryBtn = card.querySelector('.category-tag');
            if (categoryBtn && config.onCategoryClick) {
                categoryBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    config.onCategoryClick(product.category, product);
                });
            }

            // Add to cart click
            const addToCartBtn = card.querySelector('.add-to-cart');
            if (addToCartBtn && config.onAddToCart) {
                addToCartBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    config.onAddToCart(product, addToCartBtn);
                });
            }
        },

        /**
         * Apply responsive grid styles
         * @private
         */
        _applyGridStyles(container, config) {
            container.className = config.gridClass;
            
            // Check if styles already exist
            if (!document.getElementById('product-display-styles')) {
                const style = document.createElement('style');
                style.id = 'product-display-styles';
                style.textContent = `
                    .${config.gridClass} {
                        display: grid;
                        grid-template-columns: repeat(${config.columns.desktop}, 1fr);
                        gap: 20px;
                        padding: 20px;
                    }
                    
                    @media (max-width: 768px) {
                        .${config.gridClass} {
                            grid-template-columns: repeat(${config.columns.mobile}, 1fr);
                            gap: 15px;
                            padding: 15px;
                        }
                    }
                    
                    .${config.cardClass} {
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        transition: transform 0.3s, box-shadow 0.3s;
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .${config.cardClass}:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                    }
                    
                    .product-image {
                        width: 100%;
                        aspect-ratio: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #f8f9fa;
                        overflow: hidden;
                    }
                    
                    .product-image img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    
                    .product-info {
                        padding: 15px;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                        flex: 1;
                    }
                    
                    .product-title {
                        font-size: 16px;
                        font-weight: 600;
                        color: #333;
                        margin: 0;
                        line-height: 1.4;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    
                    .category-tag {
                        align-self: flex-start;
                        padding: 4px 12px;
                        background: #e9ecef;
                        border: none;
                        border-radius: 20px;
                        font-size: 12px;
                        color: #495057;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    
                    .category-tag:hover {
                        background: #dee2e6;
                    }
                    
                    .product-price {
                        font-size: 24px;
                        font-weight: 700;
                        color: #28a745;
                        margin-top: auto;
                    }
                    
                    .currency-symbol {
                        font-size: 20px;
                        margin-right: 2px;
                    }
                    
                    .add-to-cart {
                        width: 100%;
                        padding: 12px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    
                    .add-to-cart:hover {
                        background: #0056b3;
                    }
                    
                    .add-to-cart:active {
                        transform: scale(0.98);
                    }
                `;
                document.head.appendChild(style);
            }
        },

        /**
         * Get currency symbol from i18n library or default
         * @private
         */
        _getCurrencySymbol() {
            // Check if i18n library is available
            if (typeof i18n !== 'undefined' && typeof i18n.getCurrencySymbol === 'function') {
                return i18n.getCurrencySymbol();
            }
            // Default fallback
            return '₹';
        },

        /**
         * Get empty message HTML
         * @private
         */
        _getEmptyMessage(message) {
            return `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6c757d; font-size: 18px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
                    <div>${message}</div>
                </div>
            `;
        },

        /**
         * Escape HTML to prevent XSS
         * @private
         */
        _escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        /**
         * Check if string is a valid URL
         * @private
         */
        _isValidURL(str) {
            try {
                new URL(str);
                return true;
            } catch {
                return false;
            }
        },

        /**
         * Update existing product display
         * @param {Array} products - Updated product array
         * @param {string|HTMLElement} container - Container element or selector
         * @param {object} options - Configuration options
         */
        update(products, container, options = {}) {
            this.render(products, container, options);
        },

        /**
         * Get library information
         */
        getInfo() {
            return {
                name: 'ProductDisplay - Universal Product Grid Library',
                version: this.version,
                description: 'Responsive product grid with image handling and i18n',
                repository: 'https://github.com/vsanm01/cdn01',
                dependencies: {
                    optional: ['ImageHandler_cdn_lib.js', 'i18n_lib.js']
                },
                features: [
                    'Responsive grid (5 desktop, 2 mobile)',
                    'Automatic image handling',
                    'i18n currency support',
                    'Event callbacks',
                    'XSS protection'
                ]
            };
        }
    };

    // Export for different environments
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ProductDisplay;
    } else if (typeof define === 'function' && define.amd) {
        define([], function() { return ProductDisplay; });
    } else {
        global.ProductDisplay = ProductDisplay;
    }

})(typeof window !== 'undefined' ? window : this);
