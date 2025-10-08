// checkout-system.js - Checkout & Order Processing
// CDN Version for ecommerce_blogger_theme

let deliveryType = 'delivery';

// Open checkout
function openCheckout() {
    if (!window.cart || window.cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const checkoutModal = document.getElementById('checkout-modal');
    if (!checkoutModal) {
        console.warn('Checkout modal not found');
        return;
    }
    
    checkoutModal.style.display = 'block';
}

// Close checkout
function closeCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    if (checkoutModal) {
        checkoutModal.style.display = 'none';
    }
}

// Select delivery option
function selectDelivery(element, type) {
    document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    
    const radioInput = element.querySelector('input[type="radio"]');
    if (radioInput) radioInput.checked = true;
    
    deliveryType = type;
    
    const addressGroup = document.getElementById('address-group');
    if (addressGroup) {
        if (type === 'delivery') {
            addressGroup.style.display = 'block';
            const addressInput = addressGroup.querySelector('input');
            if (addressInput) addressInput.setAttribute('required', 'required');
        } else {
            addressGroup.style.display = 'none';
            const addressInput = addressGroup.querySelector('input');
            if (addressInput) addressInput.removeAttribute('required');
        }
    }
}

// Setup mobile number validation
function setupMobileValidation() {
    const mobileInput = document.querySelector('input[name="mobile"]');
    const errorDiv = document.getElementById('mobile-error');
    
    if (!mobileInput) return;
    
    mobileInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
        
        if (errorDiv) {
            if (this.value.length > 0 && this.value.length < 10) {
                errorDiv.style.display = 'block';
                this.style.borderColor = '#dc3545';
            } else {
                errorDiv.style.display = 'none';
                this.style.borderColor = '#dee2e6';
            }
        }
    });
    
    mobileInput.addEventListener('blur', function() {
        if (errorDiv && this.value.length > 0 && this.value.length !== 10) {
            errorDiv.style.display = 'block';
            this.style.borderColor = '#dc3545';
        }
    });
}

// Process checkout and create WhatsApp message
function processCheckout(formData) {
    const cartData = window.getCartData ? window.getCartData() : {
        items: window.cart || [],
        total: 0
    };
    
    if (cartData.items.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const orderData = {
        name: formData.get('name'),
        mobile: formData.get('mobile'),
        email: formData.get('email'),
        deliveryType: formData.get('delivery'),
        address: formData.get('address'),
        items: cartData.items,
        total: cartData.total + (formData.get('delivery') === 'delivery' ? 50 : 0)
    };
    
    // Create WhatsApp message
    let message = ``;
    
    message += `Name: ${orderData.name}%0A`;
    message += `Mobile: ${orderData.mobile}%0A`;
    if (orderData.email) {
        message += `Email: ${orderData.email}%0A`;
    }
    message += `Delivery: ${orderData.deliveryType === 'delivery' ? 'Home Delivery' : 'Pickup Myself'}%0A`;
    if (orderData.address) {
        message += `Address: ${orderData.address}%0A`;
    }
    message += `%0A${'─'.repeat(25)}%0A`;
    message += `*Order Items:*%0A`;
    message += `${'─'.repeat(25)}%0A`;
    
    cartData.items.forEach((item, index) => {
        message += `${index + 1}. ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}%0A`;
    });
    
    const deliveryCharge = orderData.deliveryType === 'delivery' ? 50 : 0;
    const subtotal = cartData.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    message += `${'─'.repeat(25)}%0A`;
    message += `Subtotal: ₹${subtotal}%0A`;
    if (deliveryCharge > 0) {
        message += `Delivery Charge: ₹${deliveryCharge}%0A`;
    }
    message += `*Total: ₹${orderData.total}*%0A`;
    message += `${'─'.repeat(25)}%0A`;
    
    message += `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}%0A`;
    message += `Website: ${window.location.origin}%0A`;
    message += `Generated via WhatsApp Bill System`;
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/1234567890?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Show success message
    alert('Order details sent to WhatsApp! We will contact you shortly.');
    
    // Reset cart and close modals
    if (window.clearCart) window.clearCart();
    closeCheckout();
    if (window.toggleCart) window.toggleCart();
    
    return true;
}

// Initialize checkout form
function initCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    
    if (!checkoutForm) {
        console.warn('Checkout form not found');
        return;
    }
    
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const mobileNumber = formData.get('mobile');
        
        // Validate mobile number
        if (mobileNumber.length !== 10) {
            const errorDiv = document.getElementById('mobile-error');
            const mobileInput = document.querySelector('input[name="mobile"]');
            
            if (errorDiv) errorDiv.style.display = 'block';
            if (mobileInput) {
                mobileInput.style.borderColor = '#dc3545';
                mobileInput.focus();
            }
            return;
        }
        
        processCheckout(formData);
        
        // Reset form
        e.target.reset();
        document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('active'));
        const firstRadioOption = document.querySelector('.radio-option');
        if (firstRadioOption) firstRadioOption.classList.add('active');
        
        const addressGroup = document.getElementById('address-group');
        if (addressGroup) addressGroup.style.display = 'block';
        deliveryType = 'delivery';
    });
}

// Close modals when clicking outside
function setupModalCloseHandlers() {
    window.onclick = function(event) {
        const cartModal = document.getElementById('cart-modal');
        const checkoutModal = document.getElementById('checkout-modal');
        
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (event.target === checkoutModal) {
            checkoutModal.style.display = 'none';
        }
    };
}

// Initialize checkout system
function initCheckout() {
    setupMobileValidation();
    initCheckoutForm();
    setupModalCloseHandlers();
    console.log('✅ Checkout system initialized');
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckout);
} else {
    initCheckout();
}

// Export functions
window.openCheckout = openCheckout;
window.closeCheckout = closeCheckout;
window.selectDelivery = selectDelivery;
window.setupMobileValidation = setupMobileValidation;
window.processCheckout = processCheckout;

console.log('✅ checkout-system.js loaded successfully');
