import { useState, useCallback } from 'react';

/**
 * Layout Component - Base split-pane layout shell
 * 
 * Provides the persistent sidebar (left) and dynamic content area (right).
 * Sidebar is collapsible between icon-only and expanded modes.
 */

// Navigation items configuration
const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'classroom', label: 'Classroom', icon: ClassroomIcon },
    { id: 'student', label: 'Student', icon: StudentIcon },
];

// SVG Icons as components
function DashboardIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

function ClassroomIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4" />
            <path d="M5 21V10.5M19 21V10.5" />
        </svg>
    );
}

function StudentIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
    );
}

function ChevronLeftIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
        </svg>
    );
}

function ChevronRightIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
        </svg>
    );
}

function BackIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    );
}

export default function Layout({ children, currentView, onNavigate, canGoBack, onGoBack }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = useCallback(() => {
        setIsSidebarCollapsed(prev => !prev);
    }, []);

    return (
        <div className="flex h-screen bg-nord-snow-3 dark:bg-nord-polar-1">
            {/* Sidebar */}
            <aside
                className={`
                    flex flex-col border-r border-nord-snow-1 dark:border-nord-polar-3
                    bg-white dark:bg-nord-polar-2
                    transition-all duration-300 ease-in-out
                    ${isSidebarCollapsed ? 'w-16' : 'w-56'}
                `}
            >
                {/* Logo/Brand Area */}
                <div className="flex items-center justify-between h-14 px-3 border-b border-nord-snow-1 dark:border-nord-polar-3">
                    {!isSidebarCollapsed && (
                        <h1 className="font-heading text-lg font-semibold text-nord-frost-4 dark:text-nord-frost-2 truncate">
                            TimeScroll
                        </h1>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-lg hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 
                                   text-nord-polar-4 dark:text-nord-snow-1 transition-colors"
                        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isSidebarCollapsed ? (
                            <ChevronRightIcon className="w-5 h-5" />
                        ) : (
                            <ChevronLeftIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-2 space-y-1">
                    {NAV_ITEMS.map(item => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`
                                    nav-item w-full
                                    ${isActive ? 'active' : ''}
                                    ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                                `}
                                title={isSidebarCollapsed ? item.label : undefined}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!isSidebarCollapsed && (
                                    <span className="truncate">{item.label}</span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer area (could be used for settings later) */}
                <div className="p-2 border-t border-nord-snow-1 dark:border-nord-polar-3">
                    {!isSidebarCollapsed && (
                        <p className="text-xs text-nord-polar-4/60 dark:text-nord-snow-1/40 text-center">
                            v1.0.0
                        </p>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header with back button */}
                <header className="flex items-center h-14 px-4 border-b border-nord-snow-1 dark:border-nord-polar-3 bg-white dark:bg-nord-polar-2">
                    {canGoBack && (
                        <button
                            onClick={onGoBack}
                            className="flex items-center gap-2 px-2 py-1.5 -ml-2 rounded-lg
                                       text-nord-polar-3 dark:text-nord-snow-1
                                       hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3
                                       transition-colors"
                        >
                            <BackIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">Back</span>
                        </button>
                    )}
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 scrollbar-frost">
                    {children}
                </div>
            </main>
        </div>
    );
}
