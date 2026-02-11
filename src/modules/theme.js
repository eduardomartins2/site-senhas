// theme.js
// Theme management functionality

export function initTheme() {
    const themeButtons = document.querySelectorAll('.theme-toggle-btn');
    const htmlElement = document.documentElement;
    
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Add click handlers to theme buttons
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);
            saveTheme(theme);
        });
    });
    
    // Listen for system theme changes if auto mode is active
    if (savedTheme === 'auto') {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (htmlElement.getAttribute('data-theme') === 'auto') {
                // Force update by re-setting the theme
                setTheme('auto');
            }
        });
    }
}

function setTheme(theme) {
    const htmlElement = document.documentElement;
    const themeButtons = document.querySelectorAll('.theme-toggle-btn');
    
    // Remove all theme attributes
    htmlElement.removeAttribute('data-theme');
    
    // Set new theme
    if (theme === 'auto') {
        htmlElement.setAttribute('data-theme', 'auto');
    } else {
        htmlElement.setAttribute('data-theme', theme);
    }
    
    // Update button states
    themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
    
    console.log(`Theme set to: ${theme}`);
}

function saveTheme(theme) {
    localStorage.setItem('theme', theme);
    console.log(`Theme saved: ${theme}`);
}

// Get current theme
export function getCurrentTheme() {
    const htmlElement = document.documentElement;
    return htmlElement.getAttribute('data-theme') || 'light';
}

// Toggle between light and dark themes
export function toggleTheme() {
    const current = getCurrentTheme();
    const newTheme = current === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
    return newTheme;
}

// Check if dark theme is active
export function isDarkTheme() {
    const current = getCurrentTheme();
    if (current === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return current === 'dark';
}

// Listen for theme changes
export function onThemeChange(callback) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                callback(getCurrentTheme());
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
    
    // Also listen for system theme changes in auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
        if (getCurrentTheme() === 'auto') {
            callback('auto');
        }
    });
    
    return observer;
}
