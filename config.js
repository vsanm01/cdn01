// ========================================
// FILE 1: config.js
// ========================================
 // welcome_message.js
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    const message = document.createElement("div");
    message.textContent = "👋 Welcome to our website!";
    message.style.position = "fixed";
    message.style.bottom = "20px";
    message.style.right = "20px";
    message.style.background = "#333";
    message.style.color = "#fff";
    message.style.padding = "12px 20px";
    message.style.borderRadius = "8px";
    message.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
    message.style.fontFamily = "Arial, sans-serif";
    message.style.zIndex = "9999";
    message.style.transition = "opacity 0.5s ease";
    document.body.appendChild(message);

    setTimeout(() => {
      message.style.opacity = "0";
      setTimeout(() => message.remove(), 1000);
    }, 4000);
  });
})();

(function() {
    window.ECOM_CONFIG = {
        SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxZssNUTXM1Or7grmlYUw12U_jcQFgynxST-0brL4LtOZmZkh6ADiG0Zm3yMtYoXMzCoA/exec',
        WHATSAPP_NUMBER: '1234567890'
    };

    window.ECOM_STATE = {
        products: [],
        cart: [],
        currentCategory: 'all'
    };

    console.log('✅ config.js loaded and executed');
})();

