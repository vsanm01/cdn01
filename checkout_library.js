/**
 * CheckoutJS - A lightweight, reusable checkout process library
 * Version: 1.0.0
 * Author: Your Name
 * License: MIT
 */

(function(window) {
    'use strict';

    /**
     * CheckoutJS Constructor
     * @param {Object} options - Configuration options
     */
    function CheckoutJS(options) {
        this.config = {
            currency: '₹',
            deliveryCharge: 50,
            whatsappNumber: '',
            whatsappMessage: true,
            emailNotification: false,
            validateMobile: true,
            mobileLength: 10,
            requiredFields: ['name', 'mobile'],
            deliveryOptions: [
                { value: 'delivery', label: 'Home Delivery', charge: 50, description: 'Delivered to your doorstep' },
                { value: 'pickup', label: 'Pickup Myself', charge: 0, description: 'Collect from our store' }
            ],
            onSubmit: null,
            onValidationError: null,
            onSuccess: null,
            language: 'en',
            dateFormat: 'default',
            ...options
        };

        this.cart = [];
        this.formData = {};
        this.deliveryType = 'delivery';
        this.isModalOpen = false;
        
        this.init();
    }

    /**
     * Initialize the checkout system
     */
    CheckoutJS.prototype.init = function() {
        this.createCheckoutModal();
        this.attachEventListeners();
        this.injectStyles();
    };

    /**
     * Inject CSS styles for checkout modal
     */
    CheckoutJS.prototype.injectStyles = function() {
        if (document.getElementById('checkoutjs-styles')) return;

        const styles = `
            .checkoutjs-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 9999;
                backdrop-filter: blur(2px);
                overflow-y: auto;
            }

            .checkoutjs-modal.active {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .checkoutjs-content {
                background: white;
                width: 90%;
                max-width: 500px;
                border-radius: 12px;
                padding: 32px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                position: relative;
                margin: 20px;
                max-height: 90vh;
                overflow-y: auto;
            }

            .checkoutjs-header {
                margin-bottom: 24px;
            }

            .checkoutjs-header h3 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                color: #212529;
            }

            .checkoutjs-close {
                position: absolute;
                top: 16px;
                right: 16px;
                background: none;
                border: none;
                font-size: 32px;
                cursor: pointer;
                color: #6c757d;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: all 0.3s;
                font-weight: bold;
                line-height: 1;
            }

            .checkoutjs-close:hover {
                background: #e9ecef;
                color: #495057;
            }

            .checkoutjs-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }

            .checkoutjs-form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
                position: relative;
            }

            .checkoutjs-form-group.has-title {
                margin-top: 8px;
            }

            .checkoutjs-form-group.has-title label {
                position: absolute;
                top: -8px;
                left: 12px;
                background: white;
                padding: 0 8px;
                font-size: 12px;
                font-weight: 600;
                color: #495057;
                z-index: 1;
            }

            .checkoutjs-form-group label {
                font-weight: 600;
                color: #495057;
                font-size: 14px;
            }

            .checkoutjs-form-group input,
            .checkoutjs-form-group select,
            .checkoutjs-form-group textarea {
                padding: 12px 16px;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                outline: none;
                font-size: 16px;
                transition: border-color 0.3s;
                font-family: inherit;
            }

            .checkoutjs-form-group input:focus,
            .checkoutjs-form-group select:focus,
            .checkoutjs-form-group textarea:focus {
                border-color: #007bff;
                box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
            }

            .checkoutjs-form-group input::placeholder,
            .checkoutjs-form-group textarea::placeholder {
                color: #6c757d;
            }

            .checkoutjs-form-group.error input,
            .checkoutjs-form-group.error textarea {
                border-color: #dc3545;
            }

            .checkoutjs-error-message {
                color: #dc3545;
                font-size: 12px;
                margin-top: 4px;
                display: none;
            }

            .checkoutjs-error-message.show {
                display: block;
            }

            .checkoutjs-delivery-options {
                display: flex;
                gap: 16px;
                position: relative;
                flex-wrap: wrap;
            }

            .checkoutjs-delivery-title {
                position: absolute;
                top: -8px;
                left: 12px;
                background: white;
                padding: 0 8px;
                font-size: 12px;
                font-weight: 600;
                color: #495057;
                z-index: 1;
            }

            .checkoutjs-radio-option {
                flex: 1;
                min-width: 200px;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                border: 2px solid #dee2e6;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
                background: white;
            }

            .checkoutjs-radio-option:hover {
                border-color: #b3d9ff;
                background: #f8f9ff;
            }

            .checkoutjs-radio-option.active {
                border-color: #007bff;
                background: #f8f9ff;
            }

            .checkoutjs-radio-option input[type="radio"] {
                width: 18px;
                height: 18px;
                accent-color: #007bff;
                margin: 0;
                cursor: pointer;
            }

            .checkoutjs-radio-content {
                flex: 1;
            }

            .checkoutjs-radio-content strong {
                display: block;
                margin-bottom: 2px;
                color: #212529;
                font-size: 14px;
            }

            .checkoutjs-radio-content small {
                color: #6c757d;
                font-size: 12px;
            }

            .checkoutjs-submit-btn {
                background: #28a745;
                color: white;
                border: none;
                padding: 16px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                transition: all 0.3s;
            }

            .checkoutjs-submit-btn:hover {
                background: #218838;
                transform: translateY(-1px);
            }

            .checkoutjs-submit-btn:disabled {
                background: #6c757d;
                cursor: not-allowed;
                transform: none;
            }

            .checkoutjs-cart-summary {
                background: #f8f9fa;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .checkoutjs-cart-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #dee2e6;
            }

            .checkoutjs-cart-item:last-child {
                border-bottom: none;
            }

            .checkoutjs-cart-total {
                display: flex;
                justify-content: space-between;
                font-weight: 700;
                font-size: 18px;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 2px solid #dee2e6;
                color: #212529;
            }

            @media (max-width: 768px) {
                .checkoutjs-content {
                    padding: 24px;
                    margin: 10px;
                }

                .checkoutjs-delivery-options {
                    flex-direction: column;
                    gap: 8px;
                }

                .checkoutjs-radio-option {
                    min-width: 100%;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'checkoutjs-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    };

    /**
     * Create checkout modal HTML
     */
    CheckoutJS.prototype.createCheckoutModal = function() {
        const modal = document.createElement('div');
        modal.id = 'checkoutjs-modal';
        modal.className = 'checkoutjs-modal';
        modal.innerHTML = `
            <div class="checkoutjs-content">
                <button class="checkoutjs-close" aria-label="Close">&times;</button>
                <div class="checkoutjs-header">
                    <h3>Checkout</h3>
                </div>
                <div id="checkoutjs-cart-summary" class="checkoutjs-cart-summary"></div>
                <form class="checkoutjs-form" id="checkoutjs-form">
                    <div class="checkoutjs-form-group has-title">
                        <label>Full Name</label>
                        <input type="text" name="name" placeholder="Enter your full name" required />
                    </div>

                    <div class="checkoutjs-form-group has-title">
                        <label>Mobile Number</label>
                        <input type="tel" name="mobile" placeholder="Enter ${this.config.mobileLength}-digit mobile number" maxlength="${this.config.mobileLength}" required />
                        <div class="checkoutjs-error-message" id="mobile-error">
                            Please enter a valid ${this.config.mobileLength}-digit mobile number
                        </div>
                    </div>

                    <div class="checkoutjs-form-group has-title">
                        <label>Email Address (Optional)</label>
                        <input type="email" name="email" placeholder="Enter your email address" />
                    </div>

                    <div class="checkoutjs-form-group">
                        <div class="checkoutjs-delivery-options">
                            <span class="checkoutjs-delivery-title">Delivery Options</span>
                            ${this.config.deliveryOptions.map((option, index) => `
                                <div class="checkoutjs-radio-option ${index === 0 ? 'active' : ''}" data-delivery="${option.value}">
                                    <input type="radio" name="delivery" value="${option.value}" ${index === 0 ? 'checked' : ''} />
                                    <div class="checkoutjs-radio-content">
                                        <strong>${option.label}</strong>
                                        <small>${this.config.currency}${option.charge} - ${option.description}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="checkoutjs-form-group has-title" id="address-group">
                        <label>Delivery Address</label>
                        <textarea name="address" placeholder="Enter your full delivery address" rows="3" required></textarea>
                    </div>

                    <button type="submit" class="checkoutjs-submit-btn">Place Order</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
    };

    /**
     * Attach event listeners
     */
    CheckoutJS.prototype.attachEventListeners = function() {
        const modal = document.getElementById('checkoutjs-modal');
        const closeBtn = modal.querySelector('.checkoutjs-close');
        const form = document.getElementById('checkoutjs-form');
        const mobileInput = form.querySelector('input[name="mobile"]');
        const deliveryOptions = modal.querySelectorAll('.checkoutjs-radio-option');

        // Close button
        closeBtn.addEventListener('click', () => this.close());

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });

        // Mobile validation
        if (this.config.validateMobile) {
            this.setupMobileValidation(mobileInput);
        }

        // Delivery options
        deliveryOptions.forEach(option => {
            option.addEventListener('click', () => {
                deliveryOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                const radio = option.querySelector('input[type="radio"]');
                radio.checked = true;
                this.deliveryType = radio.value;
                this.toggleAddressField();
                this.updateCartSummary();
            });
        });

        // Form submission
        form.addEventListener('submit', (e) => this.handleSubmit(e));
    };

    /**
     * Setup mobile number validation
     */
    CheckoutJS.prototype.setupMobileValidation = function(input) {
        const errorDiv = document.getElementById('mobile-error');
        const formGroup = input.closest('.checkoutjs-form-group');

        input.addEventListener('input', () => {
            input.value = input.value.replace(/[^0-9]/g, '');
            
            if (input.value.length > this.config.mobileLength) {
                input.value = input.value.slice(0, this.config.mobileLength);
            }

            if (input.value.length > 0 && input.value.length < this.config.mobileLength) {
                formGroup.classList.add('error');
                errorDiv.classList.add('show');
            } else {
                formGroup.classList.remove('error');
                errorDiv.classList.remove('show');
            }
        });

        input.addEventListener('blur', () => {
            if (input.value.length > 0 && input.value.length !== this.config.mobileLength) {
                formGroup.classList.add('error');
                errorDiv.classList.add('show');
            }
        });
    };

    /**
     * Toggle address field based on delivery type
     */
    CheckoutJS.prototype.toggleAddressField = function() {
        const addressGroup = document.getElementById('address-group');
        const addressInput = addressGroup.querySelector('textarea');
        
        const selectedOption = this.config.deliveryOptions.find(opt => opt.value === this.deliveryType);
        
        if (selectedOption && selectedOption.charge > 0) {
            addressGroup.style.display = 'block';
            addressInput.setAttribute('required', 'required');
        } else {
            addressGroup.style.display = 'none';
            addressInput.removeAttribute('required');
        }
    };

    /**
     * Set cart items
     */
    CheckoutJS.prototype.setCart = function(cartItems) {
        this.cart = cartItems;
        return this;
    };

    /**
     * Update cart summary display
     */
    CheckoutJS.prototype.updateCartSummary = function() {
        const summaryDiv = document.getElementById('checkoutjs-cart-summary');
        
        if (!this.cart || this.cart.length === 0) {
            summaryDiv.style.display = 'none';
            return;
        }

        const selectedOption = this.config.deliveryOptions.find(opt => opt.value === this.deliveryType);
        const deliveryCharge = selectedOption ? selectedOption.charge : 0;
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + deliveryCharge;

        summaryDiv.style.display = 'block';
        summaryDiv.innerHTML = `
            ${this.cart.map(item => `
                <div class="checkoutjs-cart-item">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>${this.config.currency}${item.price * item.quantity}</span>
                </div>
            `).join('')}
            ${deliveryCharge > 0 ? `
                <div class="checkoutjs-cart-item">
                    <span>Delivery Charge</span>
                    <span>${this.config.currency}${deliveryCharge}</span>
                </div>
            ` : ''}
            <div class="checkoutjs-cart-total">
                <span>Total</span>
                <span>${this.config.currency}${total}</span>
            </div>
        `;
    };

    /**
     * Validate form
     */
    CheckoutJS.prototype.validateForm = function(formData) {
        const errors = [];

        // Validate required fields
        this.config.requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                errors.push(`${field} is required`);
            }
        });

        // Validate mobile
        if (this.config.validateMobile && formData.mobile) {
            if (formData.mobile.length !== this.config.mobileLength) {
                errors.push(`Mobile number must be ${this.config.mobileLength} digits`);
            }
        }

        // Validate email if provided
        if (formData.email && formData.email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.push('Invalid email address');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    };

    /**
     * Handle form submission
     */
    CheckoutJS.prototype.handleSubmit = function(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        
        this.formData = {
            name: formData.get('name'),
            mobile: formData.get('mobile'),
            email: formData.get('email'),
            deliveryType: formData.get('delivery'),
            address: formData.get('address')
        };

        // Validate
        const validation = this.validateForm(this.formData);
        
        if (!validation.isValid) {
            if (this.config.onValidationError) {
                this.config.onValidationError(validation.errors);
            } else {
                alert('Validation Error:\n' + validation.errors.join('\n'));
            }
            return;
        }

        // Calculate totals
        const selectedOption = this.config.deliveryOptions.find(opt => opt.value === this.deliveryType);
        const deliveryCharge = selectedOption ? selectedOption.charge : 0;
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const total = subtotal + deliveryCharge;

        const orderData = {
            ...this.formData,
            cart: this.cart,
            subtotal: subtotal,
            deliveryCharge: deliveryCharge,
            total: total,
            timestamp: new Date().toISOString(),
            deliveryOption: selectedOption
        };

        // Call custom submit handler
        if (this.config.onSubmit) {
            this.config.onSubmit(orderData);
        }

        // Send to WhatsApp if enabled
        if (this.config.whatsappMessage && this.config.whatsappNumber) {
            this.sendWhatsApp(orderData);
        }

        // Call success handler
        if (this.config.onSuccess) {
            this.config.onSuccess(orderData);
        }

        // Reset and close
        form.reset();
        this.close();
    };

    /**
     * Generate WhatsApp message
     */
    CheckoutJS.prototype.sendWhatsApp = function(orderData) {
        let message = `*New Order*%0A`;
        message += `${'═'.repeat(25)}%0A`;
        message += `Name: ${orderData.name}%0A`;
        message += `Mobile: ${orderData.mobile}%0A`;
        if (orderData.email) {
            message += `Email: ${orderData.email}%0A`;
        }
        message += `Delivery: ${orderData.deliveryOption.label}%0A`;
        if (orderData.address) {
            message += `Address: ${orderData.address}%0A`;
        }
        message += `%0A${'═'.repeat(25)}%0A`;
        message += `*Order Items:*%0A`;
        message += `${'═'.repeat(25)}%0A`;

        orderData.cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} × ${item.quantity} = ${this.config.currency}${item.price * item.quantity}%0A`;
        });

        message += `${'═'.repeat(25)}%0A`;
        message += `Subtotal: ${this.config.currency}${orderData.subtotal}%0A`;
        if (orderData.deliveryCharge > 0) {
            message += `Delivery: ${this.config.currency}${orderData.deliveryCharge}%0A`;
        }
        message += `*Total: ${this.config.currency}${orderData.total}*%0A`;
        message += `${'═'.repeat(25)}%0A`;
        message += `Date: ${new Date().toLocaleString()}`;

        const whatsappUrl = `https://wa.me/${this.config.whatsappNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    /**
     * Open checkout modal
     */
    CheckoutJS.prototype.open = function() {
        if (!this.cart || this.cart.length === 0) {
            alert('Your cart is empty!');
            return this;
        }

        const modal = document.getElementById('checkoutjs-modal');
        modal.classList.add('active');
        this.isModalOpen = true;
        this.updateCartSummary();
        this.toggleAddressField();
        
        return this;
    };

    /**
     * Close checkout modal
     */
    CheckoutJS.prototype.close = function() {
        const modal = document.getElementById('checkoutjs-modal');
        modal.classList.remove('active');
        this.isModalOpen = false;
        
        return this;
    };

    /**
     * Destroy instance
     */
    CheckoutJS.prototype.destroy = function() {
        const modal = document.getElementById('checkoutjs-modal');
        const styles = document.getElementById('checkoutjs-styles');
        
        if (modal) modal.remove();
        if (styles) styles.remove();
    };

    // Expose to global scope
    window.CheckoutJS = CheckoutJS;

})(window);