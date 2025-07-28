// Theme toggle functionality
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.querySelector('.theme-icon');
        this.currentTheme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }
    
    init() {
        // Set initial theme
        this.setTheme(this.currentTheme);
        
        // Add event listener
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        
        // Update icon
        this.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Update DNA canvas colors if it exists
        if (window.dnaAnimation) {
            window.dnaAnimation.updateColors(theme);
        }
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});
