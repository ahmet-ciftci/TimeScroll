import { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Theme Context
 * 
 * Provides centralized theme state management across the app.
 * Handles dark/light mode switching with localStorage persistence.
 * Respects system preference on first load.
 */

const ThemeContext = createContext(null);

const STORAGE_KEY = 'timescroll_theme';

export function ThemeProvider({ children }) {
    // Initialize theme from localStorage or system preference
    const [isDarkMode, setIsDarkMode] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored !== null) {
                return stored === 'dark';
            }
            // Default to system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch {
            return false;
        }
    });

    // Apply dark class to document root and persist preference
    useEffect(() => {
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        try {
            localStorage.setItem(STORAGE_KEY, isDarkMode ? 'dark' : 'light');
        } catch {
            // localStorage not available
        }
    }, [isDarkMode]);

    // Toggle theme
    const toggleTheme = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    const value = {
        isDarkMode,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
