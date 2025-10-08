// ===== 7. ui-components.js =====
(function() {
    'use strict';
    
    window.setupCategoryScroll = function() {
        const container = document.querySelector('.categories');
        const leftBtn = document.getElementById('scroll-left');
        const rightBtn = document.getElementById('scroll-right');
        
        if (!container || !leftBtn || !rightBtn) return;
        
        function updateButtons() {
            const isAtStart = container.scrollLeft <= 0;
            const isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 1;
            
            leftBtn.disabled = isAtStart;
            rightBtn.disabled = isAtEnd;
            
            leftBtn.style.display = isAtStart ? 'none' : 'flex';
            rightBtn.style.display = isAtEnd ? 'none' : 'flex';
        }
        
        container.addEventListener('scroll', updateButtons);
        updateButtons();
    };

    window.scrollCategories = function(direction) {
        const container = document.querySelector('.categories');
        if (!container) return;
        
        const scrollAmount = 200;
        container.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    };

    window.setupModalClosing = function() {
        const cartModal = document.getElementById('cart-modal');
        const checkoutModal = document.getElementById('checkout-modal');
        
        if (cartModal) {
            cartModal.addEventListener('click', function(e) {
                if (e.target === this) window.toggleCart();
            });
        }
        
        if (checkoutModal) {
            checkoutModal.addEventListener('click', function(e) {
                if (e.target === this) window.closeCheckout();
            });
        }
    };
    
    console.log('✅ ui-components.js loaded');
})();
