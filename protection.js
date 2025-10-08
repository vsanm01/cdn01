// ===== 8. protection.js =====
(function() {
    'use strict';
    
    window.initContentProtection = function() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('copy', e => e.preventDefault());
        document.addEventListener('cut', e => e.preventDefault());
        document.addEventListener('selectstart', e => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keydown', e => {
            if ((e.ctrlKey || e.metaKey) && 
                (e.key === 'c' || e.key === 'x' || e.key === 'u' || e.key === 's' || e.key === 'p')) {
                e.preventDefault();
            }
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
            }
        });
    };
    
    console.log('✅ protection.js loaded');
})();
