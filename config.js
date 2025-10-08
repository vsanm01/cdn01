
## 1. **config.js** - Configuration & Constants

```javascript
// Configuration file for the e-commerce system
const ECOM_CONFIG = {
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxZssNUTXM1Or7grmlYUw12U_jcQFgynxST-0brL4LtOZmZkh6ADiG0Zm3yMtYoXMzCoA/exec',
    WHATSAPP_NUMBER: '1234567890', // Change this
    DELIVERY_CHARGE: 50,
    CURRENCY_SYMBOL: '₹',
    MAX_SUGGESTIONS: 5,
    MOBILE_MAX_CATEGORIES: 4,
    DESKTOP_MAX_CATEGORIES: 6
};

// Global state
window.ECOM_STATE = {
    products: [],
    cart: [],
    currentCategory: 'all',
    deliveryType: 'delivery',
    allCategories: []
};

