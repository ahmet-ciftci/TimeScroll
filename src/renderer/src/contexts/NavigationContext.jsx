import { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Navigation Context
 * 
 * Provides centralized navigation state management across the app.
 * Handles view switching, history management, sidebar state persistence,
 * and current schedule profile tracking.
 */

const NavigationContext = createContext(null);

// View configuration with titles
export const VIEW_CONFIG = {
    dashboard: { title: 'Schedule Overview', showInNav: true },
    classroom: { title: 'Classroom View', showInNav: true },
    student: { title: 'Student View', showInNav: true },
    course: { title: 'Course View', showInNav: true },
    welcome: { title: 'Welcome', showInNav: true },
};

const STORAGE_KEYS = {
    SIDEBAR_COLLAPSED: 'timescroll_sidebar_collapsed',
    CURRENT_PROFILE: 'timescroll_current_profile',
};

export function NavigationProvider({ children }) {
    // Current view state
    const [currentView, setCurrentView] = useState('welcome');
    const [viewParams, setViewParams] = useState({});
    const [viewHistory, setViewHistory] = useState([{ view: 'welcome', params: {} }]);

    // Current schedule profile
    const [currentProfile, setCurrentProfileState] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE) || null;
        } catch {
            return null;
        }
    });

    // Sidebar state with localStorage persistence
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
            return stored === 'true';
        } catch {
            return false;
        }
    });

    // Persist sidebar state
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(isSidebarCollapsed));
        } catch {
            // localStorage not available
        }
    }, [isSidebarCollapsed]);

    // Persist current profile
    useEffect(() => {
        try {
            if (currentProfile) {
                localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, currentProfile);
            } else {
                localStorage.removeItem(STORAGE_KEYS.CURRENT_PROFILE);
            }
        } catch {
            // localStorage not available
        }
    }, [currentProfile]);

    // Set current profile with navigation
    const setCurrentProfile = useCallback((profileName) => {
        setCurrentProfileState(profileName);
    }, []);

    // Open a schedule (set profile and navigate to dashboard)
    const openSchedule = useCallback((profileName) => {
        setCurrentProfileState(profileName);
        setViewHistory([{ view: 'dashboard', params: {} }]);
        setCurrentView('dashboard');
        setViewParams({});
    }, []);

    // Toggle sidebar
    const toggleSidebar = useCallback(() => {
        setIsSidebarCollapsed(prev => !prev);
    }, []);

    // Navigate to a view (with optional params)
    const navigateTo = useCallback((viewId, params = {}) => {
        setViewHistory(prev => [...prev, { view: viewId, params }]);
        setCurrentView(viewId);
        setViewParams(params);
    }, []);

    // Navigate and reset history (for sidebar navigation)
    const navigateToRoot = useCallback((viewId) => {
        setViewHistory([{ view: viewId, params: {} }]);
        setCurrentView(viewId);
        setViewParams({});
    }, []);

    // Go back in history
    const goBack = useCallback(() => {
        if (viewHistory.length > 1) {
            const newHistory = viewHistory.slice(0, -1);
            const previousEntry = newHistory[newHistory.length - 1];
            setViewHistory(newHistory);
            setCurrentView(previousEntry.view);
            setViewParams(previousEntry.params);
        }
    }, [viewHistory]);

    // Go back N steps in history (for breadcrumb navigation)
    const goBackN = useCallback((steps) => {
        if (steps <= 0 || viewHistory.length <= steps) return;

        const newHistory = viewHistory.slice(0, -steps);
        const targetEntry = newHistory[newHistory.length - 1];
        setViewHistory(newHistory);
        setCurrentView(targetEntry.view);
        setViewParams(targetEntry.params);
    }, [viewHistory]);

    // Check if can go back
    const canGoBack = viewHistory.length > 1;

    // Get current view config
    const currentViewConfig = VIEW_CONFIG[currentView] || { title: 'Unknown' };

    // Get the "base" view for sidebar highlighting
    // When in course view, we came from somewhere - highlight that
    const activeNavItem = (() => {
        // If current view is in nav, use it
        if (VIEW_CONFIG[currentView]?.showInNav) {
            return currentView;
        }
        // Otherwise find the last nav-visible view in history
        for (let i = viewHistory.length - 1; i >= 0; i--) {
            if (VIEW_CONFIG[viewHistory[i].view]?.showInNav) {
                return viewHistory[i].view;
            }
        }
        return 'dashboard';
    })();

    const value = {
        // View state
        currentView,
        viewParams,
        viewHistory,
        currentViewConfig,
        activeNavItem,
        canGoBack,

        // Current schedule profile
        currentProfile,

        // Sidebar state
        isSidebarCollapsed,

        // Actions
        navigateTo,
        navigateToRoot,
        goBack,
        goBackN,
        toggleSidebar,
        setCurrentProfile,
        openSchedule,
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}
