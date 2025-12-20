import { useNavigation, VIEW_CONFIG } from '../contexts/NavigationContext';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Layout Component - Base split-pane layout shell
 * 
 * Provides the persistent sidebar (left) and dynamic content area (right).
 * Sidebar is collapsible between icon-only and expanded modes.
 * Uses NavigationContext for state management.
 */

// Navigation items configuration (only items marked showInNav)
const NAV_ITEMS = [
    { id: 'welcome', label: 'Home', icon: HomeIcon },
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'classroom', label: 'Classroom', icon: ClassroomIcon },
    { id: 'student', label: 'Student', icon: StudentIcon },
    { id: 'course', label: 'Course', icon: CourseIcon },
];

// SVG Icons as components
function HomeIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );
}

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

function CourseIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M8 7h8M8 11h8M8 15h5" />
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

function SunIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
    );
}

function MoonIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    );
}

function ExportIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    );
}

function HelpIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

export default function Layout({ children }) {
    const {
        activeNavItem,
        currentViewConfig,
        viewParams,
        isSidebarCollapsed,
        canGoBack,
        navigateToRoot,
        goBack,
        toggleSidebar,
    } = useNavigation();
    const { isDarkMode, toggleTheme } = useTheme();

    // Build the page title
    const getPageTitle = () => {
        let title = currentViewConfig.title;
        // Add context for specific views
        if (viewParams.courseCode) {
            title = `${viewParams.courseCode}`;
        }
        if (viewParams.studentName) {
            title = viewParams.studentName;
        }
        if (viewParams.classroomId) {
            title = `Room ${viewParams.classroomId}`;
        }
        return title;
    };

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
                        const isActive = activeNavItem === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigateToRoot(item.id)}
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

                {/* Footer with theme toggle, export, and help */}
                <div className="p-2 border-t border-nord-snow-1 dark:border-nord-polar-3 space-y-1">
                    {/* Export Button */}
                    <button
                        onClick={() => {/* TODO: Export functionality */ }}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                            text-nord-polar-3 hover:bg-nord-snow-1 hover:text-nord-polar-1
                            dark:text-nord-snow-1 dark:hover:bg-nord-polar-3 dark:hover:text-nord-snow-2
                            transition-all duration-200 cursor-pointer
                            ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                        `}
                        title={isSidebarCollapsed ? 'Export' : undefined}
                        aria-label="Export schedule"
                    >
                        <ExportIcon className="w-5 h-5 flex-shrink-0" />
                        {!isSidebarCollapsed && (
                            <span className="truncate">Export</span>
                        )}
                    </button>

                    {/* Help Button */}
                    <button
                        onClick={() => {/* TODO: Help functionality */ }}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                            text-nord-polar-3 hover:bg-nord-snow-1 hover:text-nord-polar-1
                            dark:text-nord-snow-1 dark:hover:bg-nord-polar-3 dark:hover:text-nord-snow-2
                            transition-all duration-200 cursor-pointer
                            ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                        `}
                        title={isSidebarCollapsed ? 'Help' : undefined}
                        aria-label="Help"
                    >
                        <HelpIcon className="w-5 h-5 flex-shrink-0" />
                        {!isSidebarCollapsed && (
                            <span className="truncate">Help</span>
                        )}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                            text-nord-polar-3 hover:bg-nord-snow-1 hover:text-nord-polar-1
                            dark:text-nord-snow-1 dark:hover:bg-nord-polar-3 dark:hover:text-nord-snow-2
                            transition-all duration-200 cursor-pointer
                            ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                        `}
                        title={isSidebarCollapsed ? (isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode') : undefined}
                        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDarkMode ? (
                            <SunIcon className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <MoonIcon className="w-5 h-5 flex-shrink-0" />
                        )}
                        {!isSidebarCollapsed && (
                            <span className="truncate">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header with back button and page title */}
                <header className="flex items-center gap-4 h-14 px-4 border-b border-nord-snow-1 dark:border-nord-polar-3 bg-white dark:bg-nord-polar-2">
                    {canGoBack && (
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 px-2 py-1.5 -ml-2 rounded-lg
                                       text-nord-polar-3 dark:text-nord-snow-1
                                       hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3
                                       transition-colors"
                        >
                            <BackIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">Back</span>
                        </button>
                    )}
                    <h2 className="font-heading text-lg font-medium text-nord-polar-1 dark:text-nord-snow-2 truncate">
                        {getPageTitle()}
                    </h2>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 scrollbar-frost">
                    {children}
                </div>
            </main>
        </div>
    );
}
