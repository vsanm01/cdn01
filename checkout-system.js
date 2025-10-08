// ===== 6. checkout-system.js =====
(function() {
    'use strict';
    
    window.openCheckout = function() {
        if (window.ECOM_STATE.cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        document.getElementById('cart-modal').style.display = 'none';
        document.getElementById('checkout-modal').style.display = 'flex';
    };

    window.closeCheckout = function() {
        document.getElementById('checkout-modal').style.display = 'none';
    };

    window.selectDelivery = function(element, type) {
        document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('active'));
        element.classList.add('active');
        
        const addressGroup = document.getElementById('address-group');
        const addressInput = addressGroup.querySelector('input');
        
        if (type === 'pickup') {
            addressGroup.style.display = 'none';
            addressInput.removeAttribute('required');
        } else {
            addressGroup.style.display = 'flex';
            addressInput.setAttribute('required', 'required');
        }
    };

    window.setupMobileValidation = function() {
        const form = document.getElementById('checkout-form');
        const mobileInput = form?.querySelector('input[name="mobile"]');
        const errorDiv = document.getElementById('mobile-error');
        
        if (!mobileInput || !errorDiv) return;
        
        mobileInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
            
            if (this.value.length === 10) {
                errorDiv.style.display = 'none';
            }
        });
    };

    window.setupCheckoutForm = function() {
        const form = document.getElementById('checkout-form');
        if (!form) return;
        
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const deliveryType = formData.get('delivery');
            const total = window.ECOM_STATE.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const deliveryCharge = deliveryType === 'delivery' ? 50 : 0;
            const finalTotal = total + deliveryCharge;
            
            let message = `*New Order*\n\n`;
            message += `*Customer Details:*\n`;
            message += `Name: ${formData.get('name')}\n`;
            message += `Mobile: ${formData.get('mobile')}\n`;
            if (formData.get('email')) message += `Email: ${formData.get('email')}\n`;
            message += `\n*Delivery:* ${deliveryType === 'delivery' ? 'Home Delivery' : 'Pickup'}\n`;
            if (deliveryType === 'delivery') {
                message += `Address: ${formData.get('address')}\n`;
            }
            message += `\n*Order Items:*\n`;
            
            window.ECOM_STATE.cart.forEach(item => {
                message += `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}\n`;
            });
            
            message += `\n*Subtotal:* ₹${total}`;
            if (deliveryCharge > 0) message += `\n*Delivery Charge:* ₹${deliveryCharge}`;
            message += `\n*Total:* ₹${finalTotal}`;
            
            const whatsappUrl = `https://wa.me/${window.ECOM_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            
            window.ECOM_STATE.cart = [];
            window.updateCartCount();
            window.closeCheckout();
            this.reset();
        });
    };
    
    console.log('✅ checkout-system.js loaded');
})();
