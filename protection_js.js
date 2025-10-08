// Protection Module
// Security and protection features

class Protection {
  constructor() {
    this.initialized = false;
    this.config = {
      disableRightClick: false,
      disableDevTools: false,
      disableCopy: false,
      disableSelection: false,
      watermark: false,
      rateLimit: true
    };
    
    this.rateLimitMap = new Map();
  }

  // Initialize protection
  init(config = {}) {
    this.config = { ...this.config, ...config };
    
    if (this.config.disableRightClick) {
      this.disableRightClick();
    }
    
    if (this.config.disableDevTools) {
      this.disableDevTools();
    }
    
    if (this.config.disableCopy) {
      this.disableCopy();
    }
    
    if (this.config.disableSelection) {
      this.disableSelection();
    }
    
    if (this.config.watermark) {
      this.addWatermark();
    }
    
    this.initCSRFProtection();
    this.sanitizeInputs();
    
    this.initialized = true;
    console.log('Protection initialized with config:', this.config);
  }

  // Disable right click
  disableRightClick() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showProtectionMessage('Right click is disabled');
      return false;
    });
  }

  // Disable dev tools (basic detection)
  disableDevTools() {
    // Detect dev tools opening
    const devtools = {
      isOpen: false,
      orientation: null
    };

    const threshold = 160;
    
    setInterval(() => {
      if (window.outerWidth - window.innerWidth > threshold || 
          window.outerHeight - window.innerHeight > threshold) {
        if (!devtools.isOpen) {
          devtools.isOpen = true;
          this.handleDevToolsOpen();
        }
      } else {
        devtools.isOpen = false;
      }
    }, 500);

    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 123 || // F12
          (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
          (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
          (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
        e.preventDefault();
        this.showProtectionMessage('Dev tools access is restricted');
        return false;
      }
    });
  }

  // Handle dev tools opening
  handleDevToolsOpen() {
    console.clear();
    console.log('%cStop!', 'color:red;font-size:50px;font-weight:bold;');
    console.log('%cThis is a browser feature intended for developers.', 'font-size:20px;');
  }

  // Disable copy
  disableCopy() {
    document.addEventListener('copy', (e) => {
      e.preventDefault();
      this.showProtectionMessage('Copying is disabled');
      return false;
    });
  }

  // Disable text selection
  disableSelection() {
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
  }

  // Add watermark
  addWatermark(text = 'Protected Content') {
    const watermark = document.createElement('div');
    watermark.textContent = text;
    watermark.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 80px;
      color: rgba(0,0,0,0.05);
      pointer-events: none;
      z-index: 9999;
      white-space: nowrap;
      user-select: none;
    `;
    document.body.appendChild(watermark);
  }

  // XSS Protection - Sanitize user inputs
  sanitizeInputs() {
    document.addEventListener('DOMContentLoaded', () => {
      const inputs = document.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.addEventListener('input', (e) => {
          e.target.value = this.sanitizeString(e.target.value);
        });
      });
    });
  }

  // Sanitize string
  sanitizeString(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  // HTML encode
  htmlEncode(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#x27;')
              .replace(/\//g, '&#x2F;');
  }

  // CSRF Protection
  initCSRFProtection() {
    // Generate CSRF token
    if (!this.getCSRFToken()) {
      this.generateCSRFToken();
    }
  }

  // Generate CSRF token
  generateCSRFToken() {
    const token = this.generateRandomToken();
    this.csrfToken = token;
    return token;
  }

  // Get CSRF token
  getCSRFToken() {
    return this.csrfToken;
  }

  // Generate random token
  generateRandomToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  // Rate limiting
  rateLimit(key, limit = 10, timeWindow = 60000) {
    if (!this.config.rateLimit) return true;

    const now = Date.now();
    
    if (!this.rateLimitMap.has(key)) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + timeWindow });
      return true;
    }

    const data = this.rateLimitMap.get(key);
    
    if (now > data.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + timeWindow });
      return true;
    }

    if (data.count >= limit) {
      return false;
    }

    data.count++;
    return true;
  }

  // Validate email
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validate phone
  validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone);
  }

  // Validate URL
  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Detect bot
  detectBot() {
    const botPattern = /(bot|crawler|spider|crawling)/i;
    return botPattern.test(navigator.userAgent);
  }

  // Show protection message
  showProtectionMessage(message) {
    if (window.uiComponents) {
      window.uiComponents.showToast(message, 'warning', 2000);
    } else {
      console.warn(message);
    }
  }

  // Obfuscate email
  obfuscateEmail(email) {
    return email.replace(/./g, (char, index) => {
      if (index < 3 || char === '@' || char === '.') {
        return char;
      }
      return '*';
    });
  }

  // Secure form submission
  secureFormSubmit(form, callback) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {};
      
      formData.forEach((value, key) => {
        data[key] = this.sanitizeString(value);
      });
      
      // Add CSRF token
      data.csrf_token = this.getCSRFToken();
      
      if (callback) {
        callback(data);
      }
    });
  }

  // Check if string contains SQL injection
  detectSQLInjection(str) {
    const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)|(-{2})|(')|(\*)/gi;
    return sqlPattern.test(str);
  }

  // Password strength checker
  checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return {
      score: strength,
      level: levels[Math.min(strength, 5)]
    };
  }

  // Enable protection features
  enable(feature) {
    this.config[feature] = true;
    this.init(this.config);
  }

  // Disable protection features
  disable(feature) {
    this.config[feature] = false;
  }
}

// Initialize and expose globally
window.protection = new Protection();

// Optional: Auto-init with basic protection
// window.protection.init({
//   disableRightClick: false,
//   disableDevTools: false,
//   rateLimit: true
// });

console.log('Protection loaded');