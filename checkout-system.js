
## 6. **checkout-system.js** - Checkout & Order Processing

```javascript
// Checkout system
function openCheckout() {
    if (window.ECOM_STATE.cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    document.getElementById('checkout-modal').style.display = 'block';
}

function closeCheckout() {
    document.getElementById('checkout-modal').style.display = 'none';
}

function selectDelivery(element, type) {
    document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    
    const radioInput = element.querySelector('input[type="radio"]');
    radioInput.checked = true;
    
    window.ECOM_STATE.deliveryType = type;
    
    const addressGroup = document.getElementById('address-group');
    if (type === 'delivery') {
        addressGroup.style.display = 'block';
        addressGroup.querySelector('input').setAttribute('required', 'required');
    } else {
        addressGroup.style.display = 'none';
        addressGroup.querySelector('input').removeAttribute('required');
    }
}

function setupMobileValidation() {
    const mobileInput = document.querySelector('input[name="mobile"]');
    const errorDiv = document.getElementById('mobile-error');
    
    mobileInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 10);
        }
        
        if (this.value.length > 0 && this.value.length < 10) {
            errorDiv.style.display = 'block';
            this.style.borderColor = '#dc3545';
        } else {
            errorDiv.style.display = 'none';
            this.style.borderColor = '#dee2e6';
        }
    });
    
    mobileInput.addEventListener('blur', function() {
        if (this.value.length > 0 && this.value.length !== 10) {
            errorDiv.style.display = 'block';
            this.style.borderColor = '#dc3545';
        }
    });
}

function setupCheckoutForm() {
    document.getElementById('checkout-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const mobileNumber = formData.get('mobile');
        
        if (mobileNumber.length !== 10) {
            document.getElementById('mobile-error').style.display = 'block';
            document.querySelector('input[name="mobile"]').style.borderColor = '#dc3545';
            document.querySelector('input[name="mobile"]').focus();
            return;
        }
        
        const orderData = {
            name: formData.get('name'),
            mobile: mobileNumber,
            email: formData.get('email'),
            deliveryType: formData.get('delivery'),
            address: formData.get('address'),
            items: window.ECOM_STATE.cart,
            total: window.ECOM_STATE.cart.reduce((total, item) => 
                total + (item.price * item.quantity), 0) + 
                (formData.get('delivery') === 'delivery' ? ECOM_CONFIG.DELIVERY_CHARGE : 0)
        };
        
        let message = ``;
        message += `Name: ${orderData.name}%0A`;
        message += `Mobile: ${orderData.mobile}%0A`;
        if (orderData.email) message += `Email: ${orderData.email}%0A`;
        message += `Delivery: ${orderData.deliveryType === 'delivery' ? 'Home Delivery' : 'Pickup Myself'}%0A`;
        if (orderData.address) message += `Address: ${orderData.address}%0A`;
        message += `%0A${'─'.repeat(25)}%0A*Order Items:*%0A${'─'.repeat(25)}%0A`;

        window.ECOM_STATE.cart.forEach((item, index) => {
            message += `${index + 1}. ${item.name} x ${item.quantity} = ${ECOM_CONFIG.CURRENCY_SYMBOL}${item.price * item.quantity}%0A`;
        });

        const deliveryCharge = orderData.deliveryType === 'delivery' ? ECOM_CONFIG.DELIVERY_CHARGE : 0;
        const subtotal = window.ECOM_STATE.cart.reduce((total, item) => 
            total + (item.price * item.quantity), 0);

        message += `${'─'.repeat(25)}%0A`;
        message += `Subtotal: ${ECOM_CONFIG.CURRENCY_SYMBOL}${subtotal}%0A`;
        if (deliveryCharge > 0) {
            message += `Delivery Charge: ${ECOM_CONFIG.CURRENCY_SYMBOL}${deliveryCharge}%0A`;
        }
        message += `*Total: ${ECOM_CONFIG.CURRENCY_SYMBOL}${orderData.total}*%0A`;
        message += `${'─'.repeat(25)}%0A`;
        message += `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}%0A`;
        message += `Website: ${window.location.origin}%0A`;
        message += `Generated via WhatsApp Bill System`;

        const whatsappUrl = `https://wa.me/${ECOM_CONFIG.WHATSAPP_NUMBER}?text=${message}`;
        window.open(whatsappUrl, '_blank');
        
        alert('Order details sent to WhatsApp! We will contact you shortly.');
        
        window.ECOM_STATE.cart = [];
        updateCartCount();
        closeCheckout();
        toggleCart();
        
        e.target.reset();
        document.querySelectorAll('.radio-option').forEach(opt => opt.classList.remove('active'));
        document.querySelector('.radio-option').classList.add('active');
        document.getElementById('address-group').style.display = 'block';
        window.ECOM_STATE.deliveryType = 'delivery';
    });
}
```

