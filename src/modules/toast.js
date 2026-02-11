// toast.js
// Toast notification system

export class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.toastId = 0;
        this.defaultOptions = {
            duration: 5000,
            position: 'top-right',
            closable: true,
            pauseOnHover: true,
            showProgress: true,
            compact: false
        };
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.setupStyles();
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-label', 'Notificações');
        document.body.appendChild(this.container);
    }
    
    setupStyles() {
        // Styles are already loaded via toast.css
        // This method can be used for dynamic styling if needed
    }
    
    show(message, type = 'info', options = {}) {
        const config = { ...this.defaultOptions, ...options };
        const id = ++this.toastId;
        
        const toast = this.createToast(id, message, type, config);
        this.addToastToContainer(toast, config);
        
        // Auto-hide if duration is set
        if (config.duration > 0) {
            this.startAutoHide(id, config.duration);
        }
        
        return id;
    }
    
    createToast(id, message, type, config) {
        const toast = document.createElement('div');
        toast.className = `toast ${type} ${config.compact ? 'compact' : ''}`;
        toast.setAttribute('data-toast-id', id);
        toast.setAttribute('role', 'alert');
        
        // Icon based on type
        const icon = this.getIcon(type);
        
        // Content structure
        const content = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${this.getTitle(type)}</div>
                <div class="toast-message">${message}</div>
                ${config.actions ? this.createActions(config.actions) : ''}
            </div>
            ${config.closable ? '<button class="toast-close" aria-label="Fechar">×</button>' : ''}
            ${config.showProgress && config.duration > 0 ? '<div class="toast-progress"></div>' : ''}
        `;
        
        toast.innerHTML = content;
        
        // Store reference
        this.toasts.set(id, {
            element: toast,
            config,
            timer: null,
            progressTimer: null
        });
        
        // Event listeners
        this.setupToastEvents(toast, id);
        
        return toast;
    }
    
    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
    
    getTitle(type) {
        const titles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Aviso',
            info: 'Informação'
        };
        return titles[type] || titles.info;
    }
    
    createActions(actions) {
        if (!Array.isArray(actions)) return '';
        
        return `
            <div class="toast-actions">
                ${actions.map(action => 
                    `<button class="toast-action" data-action="${action.id}">${action.text}</button>`
                ).join('')}
            </div>
        `;
    }
    
    setupToastEvents(toast, id) {
        const toastData = this.toasts.get(id);
        
        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide(id));
        }
        
        // Action buttons
        const actionBtns = toast.querySelectorAll('.toast-action');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const actionId = e.target.dataset.action;
                const action = toastData.config.actions?.find(a => a.id === actionId);
                if (action && action.handler) {
                    action.handler();
                }
                if (action?.closeOnClick !== false) {
                    this.hide(id);
                }
            });
        });
        
        // Pause on hover
        if (toastData.config.pauseOnHover) {
            toast.addEventListener('mouseenter', () => this.pauseAutoHide(id));
            toast.addEventListener('mouseleave', () => this.resumeAutoHide(id));
        }
    }
    
    addToastToContainer(toast, config) {
        // Update container position if needed
        if (this.container.className !== `toast-container ${config.position}`) {
            this.container.className = `toast-container ${config.position}`;
        }
        
        this.container.appendChild(toast);
        
        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    }
    
    startAutoHide(id, duration) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;
        
        const startTime = Date.now();
        const progressBar = toastData.element.querySelector('.toast-progress');
        
        // Update progress bar
        if (progressBar) {
            const updateProgress = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.max(0, 100 - (elapsed / duration) * 100);
                progressBar.style.width = `${progress}%`;
                
                if (progress > 0 && toastData.timer) {
                    toastData.progressTimer = requestAnimationFrame(updateProgress);
                }
            };
            updateProgress();
        }
        
        // Set timer to hide
        toastData.timer = setTimeout(() => {
            this.hide(id);
        }, duration);
    }
    
    pauseAutoHide(id) {
        const toastData = this.toasts.get(id);
        if (!toastData || !toastData.timer) return;
        
        clearTimeout(toastData.timer);
        toastData.timer = null;
        
        if (toastData.progressTimer) {
            cancelAnimationFrame(toastData.progressTimer);
            toastData.progressTimer = null;
        }
    }
    
    resumeAutoHide(id) {
        const toastData = this.toasts.get(id);
        if (!toastData || toastData.timer) return;
        
        const progressBar = toastData.element.querySelector('.toast-progress');
        if (progressBar) {
            const currentWidth = parseFloat(progressBar.style.width) || 0;
            const remainingPercentage = currentWidth / 100;
            const remainingDuration = toastData.config.duration * remainingPercentage;
            
            this.startAutoHide(id, remainingDuration);
        }
    }
    
    hide(id) {
        const toastData = this.toasts.get(id);
        if (!toastData) return;
        
        // Clear timers
        if (toastData.timer) {
            clearTimeout(toastData.timer);
        }
        if (toastData.progressTimer) {
            cancelAnimationFrame(toastData.progressTimer);
        }
        
        // Add hide animation
        toastData.element.classList.add('hide');
        
        // Remove after animation
        setTimeout(() => {
            if (toastData.element.parentNode) {
                toastData.element.remove();
            }
            this.toasts.delete(id);
        }, 300);
    }
    
    // Convenience methods
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }
    
    error(message, options = {}) {
        return this.show(message, 'error', { ...options, duration: 0 }); // Errors don't auto-hide
    }
    
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }
    
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }
    
    // Clear all toasts
    clear() {
        this.toasts.forEach((_, id) => this.hide(id));
    }
    
    // Update container position
    setPosition(position) {
        this.container.className = `toast-container ${position}`;
    }
    
    // Check if any toasts are visible
    hasActiveToasts() {
        return this.toasts.size > 0;
    }
    
    // Get count of active toasts
    getActiveToastCount() {
        return this.toasts.size;
    }
}

// Global instance
export const toast = new ToastManager();

// Export convenience functions
export const showToast = (message, type, options) => toast.show(message, type, options);
export const showSuccess = (message, options) => toast.success(message, options);
export const showError = (message, options) => toast.error(message, options);
export const showWarning = (message, options) => toast.warning(message, options);
export const showInfo = (message, options) => toast.info(message, options);
export const clearToasts = () => toast.clear();

// Initialize toast system
export function initToast() {
    // Toast system is auto-initialized when imported
    console.log('Toast notification system initialized');
}
