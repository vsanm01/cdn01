// ========================================
// FILE 7: ui-components.js
// ========================================
(function() {
    window.setupCategoryScroll = function() {
        var container = document.querySelector('.categories');
        var leftBtn = document.getElementById('scroll-left');
        var rightBtn = document.getElementById('scroll-right');
        
        if (!container || !leftBtn || !rightBtn) return;
        
        function updateButtons() {
            var isAtStart = container.scrollLeft <= 0;
            var isAtEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 1;
            
            leftBtn.disabled = isAtStart;
            rightBtn.disabled = isAtEnd;
            
            leftBtn.style.display = isAtStart ? 'none' : 'flex';
            rightBtn.style.display = isAtEnd ? 'none' : 'flex';
        }
        
        container.addEventListener('scroll', updateButtons);
        updateButtons();
    };

    window.scrollCategories = function(direction) {
        var container = document.querySelector('.categories');
        if (!container) return;
        
        var scrollAmount = 200;
        container.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    };

    window.setupModalClosing = function() {
        var cartModal = document.getElementById('cart-modal');
        var checkoutModal = document.getElementById('checkout-modal');
        
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

    console.log('✅ ui-components.js loaded and executed');
})();

