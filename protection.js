// ========================================
// FILE 8: protection.js
// ========================================
(function() {
    window.initContentProtection = function() {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
        
        document.addEventListener('copy', function(e) {
            e.preventDefault();
        });
        
        document.addEventListener('cut', function(e) {
            e.preventDefault();
        });
        
        document.addEventListener('selectstart', function(e) {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && 
                (e.key === 'c' || e.key === 'x' || e.key === 'u' || e.key === 's' || e.key === 'p')) {
                e.preventDefault();
            }
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
            }
        });
    };

    console.log('✅ protection.js loaded and executed');
})();
