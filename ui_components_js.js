// UI Components Module
// Reusable UI components and utilities

class UIComponents {
  constructor() {
    this.notifications = [];
  }

  // Show toast notification
  showToast(message, type = 'info', duration = 3000) {
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#007bff'
    };

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
      position: fixed;
      top: ${20 + (this.notifications.length * 70)}px;
      right: 20px;
      background: ${colors[type] || colors.info};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      min-width: 250px;
      animation: slideInRight 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
    `;

    const icon = this.getIcon(type);
    toast.innerHTML = `
      <span style="font-size:20px;">${icon}</span>
      <span style="flex:1;">${message}</span>
      <button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:white;cursor:pointer;font-size:20px;padding:0;margin-left:10px;">×</button>
    `;

    document.body.appendChild(toast);
    this.notifications.push(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        toast.remove();
        this.notifications = this.notifications.filter(n => n !== toast);
      }, 300);
    }, duration);
  }

  // Get icon for notification type
  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  // Show loading spinner
  showLoader(container, message = 'Loading...') {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (!container) return;

    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;">
        <div class="spinner" style="border:4px solid #f3f3f3;border-top:4px solid #007bff;border-radius:50%;width:50px;height:50px;animation:spin 1s linear infinite;"></div>
        <p style="margin-top:20px;color:#666;">${message}</p>
      </div>
    `;
  }

  // Show modal dialog
  showModal(options) {
    const {
      title = 'Modal',
      content = '',
      width = '500px',
      onConfirm = null,
      onCancel = null,
      confirmText = 'OK',
      cancelText = 'Cancel',
      showCancel = true
    } = options;

    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
      <div style="background:white;padding:0;border-radius:10px;max-width:${width};width:90%;max-height:90vh;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.3);">
        <div style="padding:20px;border-bottom:1px solid #e0e0e0;">
          <h3 style="margin:0;">${title}</h3>
        </div>
        <div style="padding:20px;max-height:60vh;overflow-y:auto;">
          ${content}
        </div>
        <div style="padding:20px;border-top:1px solid #e0e0e0;display:flex;gap:10px;justify-content:flex-end;">
          ${showCancel ? `<button class="modal-cancel" style="padding:10px 20px;background:#6c757d;color:white;border:none;border-radius:5px;cursor:pointer;">${cancelText}</button>` : ''}
          <button class="modal-confirm" style="padding:10px 20px;background:#007bff;color:white;border:none;border-radius:5px;cursor:pointer;">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    const confirmBtn = modal.querySelector('.modal-confirm');
    const cancelBtn = modal.querySelector('.modal-cancel');

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (onConfirm) onConfirm();
        this.closeModal(modal);
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (onCancel) onCancel();
        this.closeModal(modal);
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });

    return modal;
  }

  // Close modal
  closeModal(modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      modal.remove();
    }, 300);
  }

  // Show confirmation dialog
  showConfirm(message, onConfirm, onCancel) {
    return this.showModal({
      title: 'Confirm',
      content: `<p>${message}</p>`,
      onConfirm: onConfirm,
      onCancel: onCancel,
      confirmText: 'Yes',
      cancelText: 'No'
    });
  }

  // Show alert dialog
  showAlert(message, title = 'Alert') {
    return this.showModal({
      title: title,
      content: `<p>${message}</p>`,
      showCancel: false
    });
  }

  // Create button
  createButton(text, onClick, style = 'primary') {
    const colors = {
      primary: '#007bff',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      secondary: '#6c757d'
    };

    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      padding: 10px 20px;
      background: ${colors[style] || colors.primary};
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: opacity 0.2s;
    `;

    button.addEventListener('mouseenter', () => {
      button.style.opacity = '0.9';
    });

    button.addEventListener('mouseleave', () => {
      button.style.opacity = '1';
    });

    if (onClick) {
      button.addEventListener('click', onClick);
    }

    return button;
  }

  // Create badge
  createBadge(text, color = '#007bff') {
    const badge = document.createElement('span');
    badge.textContent = text;
    badge.style.cssText = `
      display: inline-block;
      padding: 4px 8px;
      background: ${color};
      color: white;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    `;
    return badge;
  }

  // Create progress bar
  createProgressBar(percent, height = '20px') {
    const container = document.createElement('div');
    container.style.cssText = `
      width: 100%;
      height: ${height};
      background: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
    `;

    const bar = document.createElement('div');
    bar.style.cssText = `
      height: 100%;
      width: ${percent}%;
      background: linear-gradient(90deg, #007bff, #0056b3);
      transition: width 0.3s ease;
    `;

    container.appendChild(bar);
    return container;
  }

  // Create skeleton loader
  createSkeleton(width = '100%', height = '20px') {
    const skeleton = document.createElement('div');
    skeleton.style.cssText = `
      width: ${width};
      height: ${height};
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
    `;
    return skeleton;
  }

  // Add animations to document
  initAnimations() {
    if (document.getElementById('ui-animations')) return;

    const style = document.createElement('style');
    style.id = 'ui-animations';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize and expose globally
window.uiComponents = new UIComponents();
window.uiComponents.initAnimations();

console.log('UI Components loaded');