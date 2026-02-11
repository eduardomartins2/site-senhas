// shortcuts.js
// Keyboard shortcuts system

export class ShortcutManager {
    constructor() {
        this.shortcuts = new Map();
        this.globalShortcuts = new Map();
        this.contextShortcuts = new Map();
        this.currentContext = 'global';
        this.isEnabled = true;
        
        this.init();
    }
    
    init() {
        this.setupGlobalShortcuts();
        this.bindEvents();
        this.setupHelpButton();
        console.log('Keyboard shortcuts initialized');
    }
    
    setupHelpButton() {
        const helpBtn = document.getElementById('shortcuts-help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showHelp();
            });
        }
    }
    
    setupGlobalShortcuts() {
        // Gerador de senhas
        this.addShortcut('ctrl+g', 'global', () => {
            this.generatePassword();
        }, 'Gerar nova senha');
        
        this.addShortcut('ctrl+enter', 'global', () => {
            this.generatePassword();
        }, 'Gerar nova senha');
        
        // Copiar senha
        this.addShortcut('ctrl+c', 'global', () => {
            this.copyPassword();
        }, 'Copiar senha');
        
        this.addShortcut('ctrl+shift+c', 'global', () => {
            this.copyPassword();
        }, 'Copiar senha');
        
        // Limpar campos
        this.addShortcut('ctrl+l', 'global', () => {
            this.clearFields();
        }, 'Limpar campos');
        
        this.addShortcut('escape', 'global', () => {
            this.clearFields();
        }, 'Limpar campos');
        
        // Tema
        this.addShortcut('ctrl+shift+t', 'global', () => {
            this.toggleTheme();
        }, 'Alternar tema');
        
        // Ajuda
        this.addShortcut('ctrl+/', 'global', () => {
            this.showHelp();
        }, 'Mostrar ajuda');
        
        this.addShortcut('f1', 'global', () => {
            this.showHelp();
        }, 'Mostrar ajuda');
        
        // Cofre
        this.addShortcut('ctrl+v', 'global', () => {
            this.toggleVault();
        }, 'Alternar cofre');
        
        this.addShortcut('ctrl+shift+v', 'global', () => {
            this.toggleVault();
        }, 'Alternar cofre');
        
        // Foco em campos
        this.addShortcut('ctrl+1', 'global', () => {
            this.focusField('length');
        }, 'Focar comprimento');
        
        this.addShortcut('ctrl+2', 'global', () => {
            this.focusField('password');
        }, 'Focar senha');
        
        // Presets de força
        this.addShortcut('ctrl+alt+1', 'global', () => {
            this.setStrengthPreset('weak');
        }, 'Senha fraca');
        
        this.addShortcut('ctrl+alt+2', 'global', () => {
            this.setStrengthPreset('medium');
        }, 'Senha média');
        
        this.addShortcut('ctrl+alt+3', 'global', () => {
            this.setStrengthPreset('strong');
        }, 'Senha forte');
        
        this.addShortcut('ctrl+alt+4', 'global', () => {
            this.setStrengthPreset('very_strong');
        }, 'Senha muito forte');
        
        // Modos de geração
        this.addShortcut('ctrl+shift+1', 'global', () => {
            this.setGenerationMode('password');
        }, 'Modo senha');
        
        this.addShortcut('ctrl+shift+2', 'global', () => {
            this.setGenerationMode('passphrase');
        }, 'Modo passphrase');
        
        this.addShortcut('ctrl+shift+3', 'global', () => {
            this.setGenerationMode('multiple');
        }, 'Modo múltiplas');
    }
    
    addShortcut(key, context, handler, description = '') {
        const shortcut = {
            key: this.normalizeKey(key),
            context,
            handler,
            description
        };
        
        if (context === 'global') {
            this.globalShortcuts.set(shortcut.key, shortcut);
        } else {
            if (!this.contextShortcuts.has(context)) {
                this.contextShortcuts.set(context, new Map());
            }
            this.contextShortcuts.get(context).set(shortcut.key, shortcut);
        }
        
        this.shortcuts.set(shortcut.key, shortcut);
    }
    
    normalizeKey(key) {
        return key.toLowerCase()
            .replace(/\s+/g, '')
            .replace('ctrl', 'ctrl')
            .replace('alt', 'alt')
            .replace('shift', 'shift')
            .replace('meta', 'meta');
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.isEnabled) return;
            
            // Don't trigger shortcuts when typing in inputs
            if (this.isInputElement(e.target)) {
                // Allow some shortcuts even in inputs
                const allowedInInputs = ['escape', 'enter', 'ctrl+enter', 'ctrl+c', 'ctrl+shift+c'];
                const pressedKey = this.getPressedKey(e);
                
                if (!allowedInInputs.includes(pressedKey)) {
                    return;
                }
            }
            
            this.handleShortcut(e);
        });
    }
    
    isInputElement(element) {
        const inputTypes = ['input', 'textarea', 'select'];
        const contentEditable = element.hasAttribute('contenteditable');
        
        return inputTypes.includes(element.tagName.toLowerCase()) || contentEditable;
    }
    
    getPressedKey(event) {
        const parts = [];
        
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        if (event.metaKey) parts.push('meta');
        
        // Handle special keys
        const specialKeys = {
            'Escape': 'escape',
            'Enter': 'enter',
            'Space': 'space',
            'Tab': 'tab',
            'Backspace': 'backspace',
            'Delete': 'delete',
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'F1': 'f1',
            'F2': 'f2',
            'F3': 'f3',
            'F4': 'f4',
            'F5': 'f5',
            'F6': 'f6',
            'F7': 'f7',
            'F8': 'f8',
            'F9': 'f9',
            'F10': 'f10',
            'F11': 'f11',
            'F12': 'f12'
        };
        
        const key = specialKeys[event.key] || event.key.toLowerCase();
        parts.push(key);
        
        return parts.join('+');
    }
    
    handleShortcut(event) {
        const pressedKey = this.getPressedKey(event);
        const shortcut = this.shortcuts.get(pressedKey);
        
        if (!shortcut) return;
        
        // Check context
        if (shortcut.context !== 'global' && shortcut.context !== this.currentContext) {
            return;
        }
        
        // Prevent default behavior
        event.preventDefault();
        event.stopPropagation();
        
        // Execute handler
        try {
            shortcut.handler();
            console.log(`Shortcut executed: ${pressedKey}`);
        } catch (error) {
            console.error(`Error executing shortcut ${pressedKey}:`, error);
        }
    }
    
    // Action methods
    generatePassword() {
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.click();
        }
    }
    
    copyPassword() {
        const copyBtn = document.getElementById('copy-password');
        if (copyBtn) {
            copyBtn.click();
        }
    }
    
    clearFields() {
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.value = '';
            passwordField.focus();
        }
    }
    
    toggleTheme() {
        const themeButtons = document.querySelectorAll('.theme-toggle-btn');
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        
        let nextTheme;
        switch(currentTheme) {
            case 'light': nextTheme = 'dark'; break;
            case 'dark': nextTheme = 'auto'; break;
            case 'auto': nextTheme = 'light'; break;
            default: nextTheme = 'light';
        }
        
        const targetBtn = document.querySelector(`[data-theme="${nextTheme}"]`);
        if (targetBtn) {
            targetBtn.click();
        }
    }
    
    showHelp() {
        this.createHelpModal();
    }
    
    createHelpModal() {
        // Remove existing modal if present
        const existingModal = document.getElementById('shortcuts-help-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'shortcuts-help-modal';
        modal.className = 'shortcuts-help-modal';
        modal.innerHTML = `
            <div class="shortcuts-help-content">
                <div class="shortcuts-help-header">
                    <h2>Atalhos de Teclado</h2>
                    <button class="shortcuts-help-close" aria-label="Fechar">×</button>
                </div>
                <div class="shortcuts-help-body">
                    <div class="shortcuts-category">
                        <h3>🔐 Gerador de Senhas</h3>
                        <div class="shortcuts-list">
                            ${this.getShortcutHTML('ctrl+g', 'Gerar nova senha')}
                            ${this.getShortcutHTML('ctrl+enter', 'Gerar nova senha')}
                            ${this.getShortcutHTML('ctrl+c', 'Copiar senha')}
                            ${this.getShortcutHTML('ctrl+l', 'Limpar campos')}
                            ${this.getShortcutHTML('escape', 'Limpar campos')}
                        </div>
                    </div>
                    
                    <div class="shortcuts-category">
                        <h3>⚙️ Configurações</h3>
                        <div class="shortcuts-list">
                            ${this.getShortcutHTML('ctrl+shift+t', 'Alternar tema')}
                            ${this.getShortcutHTML('ctrl+v', 'Alternar cofre')}
                        </div>
                    </div>
                    
                    <div class="shortcuts-category">
                        <h3>🎯 Presets de Força</h3>
                        <div class="shortcuts-list">
                            ${this.getShortcutHTML('ctrl+alt+1', 'Senha fraca')}
                            ${this.getShortcutHTML('ctrl+alt+2', 'Senha média')}
                            ${this.getShortcutHTML('ctrl+alt+3', 'Senha forte')}
                            ${this.getShortcutHTML('ctrl+alt+4', 'Senha muito forte')}
                        </div>
                    </div>
                    
                    <div class="shortcuts-category">
                        <h3>🔄 Modos de Geração</h3>
                        <div class="shortcuts-list">
                            ${this.getShortcutHTML('ctrl+shift+1', 'Modo senha')}
                            ${this.getShortcutHTML('ctrl+shift+2', 'Modo passphrase')}
                            ${this.getShortcutHTML('ctrl+shift+3', 'Modo múltiplas')}
                        </div>
                    </div>
                    
                    <div class="shortcuts-category">
                        <h3>🎯 Foco Rápido</h3>
                        <div class="shortcuts-list">
                            ${this.getShortcutHTML('ctrl+1', 'Focar comprimento')}
                            ${this.getShortcutHTML('ctrl+2', 'Focar senha')}
                        </div>
                    </div>
                    
                    <div class="shortcuts-category">
                        <h3>❓ Ajuda</h3>
                        <div class="shortcuts-list">
                            ${this.getShortcutHTML('ctrl+/', 'Mostrar ajuda')}
                            ${this.getShortcutHTML('f1', 'Mostrar ajuda')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        modal.innerHTML += `
            <style>
                .shortcuts-help-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(4px);
                }
                
                .shortcuts-help-content {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow);
                    margin: 20px;
                }
                
                .shortcuts-help-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid var(--border);
                }
                
                .shortcuts-help-header h2 {
                    margin: 0;
                    color: var(--text);
                }
                
                .shortcuts-help-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                
                .shortcuts-help-close:hover {
                    background: var(--bg-soft);
                    color: var(--text);
                }
                
                .shortcuts-help-body {
                    padding: 20px;
                }
                
                .shortcuts-category {
                    margin-bottom: 24px;
                }
                
                .shortcuts-category h3 {
                    margin: 0 0 12px 0;
                    color: var(--text);
                    font-size: 1.1rem;
                }
                
                .shortcuts-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .shortcut-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: var(--bg-soft);
                    border-radius: 6px;
                    border: 1px solid var(--border);
                }
                
                .shortcut-keys {
                    font-family: 'Courier New', monospace;
                    font-weight: 600;
                    color: var(--primary);
                    background: var(--bg);
                    padding: 4px 8px;
                    border-radius: 4px;
                    border: 1px solid var(--border);
                }
                
                .shortcut-description {
                    color: var(--text-muted);
                }
                
                @media (max-width: 768px) {
                    .shortcuts-help-content {
                        margin: 10px;
                        max-height: 90vh;
                    }
                    
                    .shortcut-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }
                }
            </style>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        const closeBtn = modal.querySelector('.shortcuts-help-close');
        closeBtn.addEventListener('click', () => modal.remove());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Close on Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Focus management
        closeBtn.focus();
    }
    
    getShortcutHTML(keys, description) {
        return `
            <div class="shortcut-item">
                <span class="shortcut-keys">${this.formatKeys(keys)}</span>
                <span class="shortcut-description">${description}</span>
            </div>
        `;
    }
    
    formatKeys(keys) {
        return keys.split('+').map(key => {
            const formatted = {
                'ctrl': 'Ctrl',
                'alt': 'Alt',
                'shift': 'Shift',
                'meta': 'Cmd',
                'escape': 'Esc',
                'enter': 'Enter',
                'space': 'Space',
                'tab': 'Tab',
                'backspace': 'Backspace',
                'delete': 'Delete',
                'up': '↑',
                'down': '↓',
                'left': '←',
                'right': '→'
            };
            
            return formatted[key] || key.toUpperCase();
        }).join(' + ');
    }
    
    toggleVault() {
        const toggleBtn = document.getElementById('toggle-vault');
        if (toggleBtn) {
            toggleBtn.click();
        }
    }
    
    focusField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.focus();
            field.select();
        }
    }
    
    setStrengthPreset(preset) {
        const presetBtn = document.querySelector(`[data-strength="${preset}"]`);
        if (presetBtn) {
            presetBtn.click();
        }
    }
    
    setGenerationMode(mode) {
        const modeBtn = document.querySelector(`[data-mode="${mode}"]`);
        if (modeBtn) {
            modeBtn.click();
        }
    }
    
    // Context management
    setContext(context) {
        this.currentContext = context;
    }
    
    // Enable/disable shortcuts
    enable() {
        this.isEnabled = true;
    }
    
    disable() {
        this.isEnabled = false;
    }
    
    // Get all shortcuts for help
    getAllShortcuts() {
        const allShortcuts = [];
        
        // Global shortcuts
        this.globalShortcuts.forEach(shortcut => {
            allShortcuts.push({
                keys: shortcut.key,
                description: shortcut.description,
                context: 'Global'
            });
        });
        
        // Context shortcuts
        this.contextShortcuts.forEach((shortcuts, context) => {
            shortcuts.forEach(shortcut => {
                allShortcuts.push({
                    keys: shortcut.key,
                    description: shortcut.description,
                    context
                });
            });
        });
        
        return allShortcuts;
    }
}

// Global instance
export const shortcuts = new ShortcutManager();

// Initialize shortcuts
export function initShortcuts() {
    console.log('Keyboard shortcuts system initialized');
}
