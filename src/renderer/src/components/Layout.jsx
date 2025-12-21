import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation, VIEW_CONFIG } from '../contexts/NavigationContext';
import { useTheme } from '../contexts/ThemeContext';
import { exportCalendarToPDF } from '../services/pdfExportService';
import { getExams } from '../services/dataService';
import {
    sidebarVariants,
    sidebarTextVariants,
    staggerContainer,
    staggerItem,
    buttonHover,
    buttonTap,
    breadcrumbVariants,
    smoothSpring,
} from '../lib/animations';
import {
    Home,
    LayoutGrid,
    MapPin,
    User,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Sun,
    Moon,
    Upload,
    HelpCircle,
} from 'lucide-react';

/**
 * Layout Component - Base split-pane layout shell
 * 
 * Provides the persistent sidebar (left) and dynamic content area (right).
 * Sidebar is collapsible between icon-only and expanded modes.
 * Uses NavigationContext for state management.
 */

// Navigation items configuration (only items marked showInNav)
const NAV_ITEMS = [
    { id: 'welcome', label: 'Home', icon: Home, requiresProject: false },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, requiresProject: true },
    { id: 'classroom', label: 'Classroom', icon: MapPin, requiresProject: true },
    { id: 'student', label: 'Student', icon: User, requiresProject: true },
    { id: 'course', label: 'Course', icon: BookOpen, requiresProject: true },
];

export default function Layout({ children }) {
    const {
        activeNavItem,
        currentViewConfig,
        viewParams,
        viewHistory,
        isSidebarCollapsed,
        canGoBack,
        navigateToRoot,
        goBack,
        goBackN,
        toggleSidebar,
    } = useNavigation();
    const { isDarkMode, toggleTheme } = useTheme();

    // Theme transition overlay state
    const [transitionOverlay, setTransitionOverlay] = useState({
        active: false,
        x: 0,
        y: 0,
        theme: 'light'
    });

    // TODO: Get project name from project context
    const projectName = null;

    // Helper to get label from history entry params
    const getParamLabel = (params) => {
        if (params.courseCode) return params.courseCode;
        if (params.studentId) return params.studentId;
        if (params.classroomId) return `Room ${params.classroomId}`;
        return null;
    };

    // Build breadcrumbs from navigation history
    const getBreadcrumbs = useCallback(() => {
        const crumbs = [];

        // Skip if on welcome screen
        if (activeNavItem === 'welcome') return crumbs;

        // Process navigation history
        viewHistory.forEach((entry, index) => {
            // Skip welcome entries
            if (entry.view === 'welcome') return;

            const paramLabel = getParamLabel(entry.params);

            if (paramLabel) {
                // Only add if this label isn't already the last crumb (avoid duplicates)
                const lastCrumb = crumbs[crumbs.length - 1];
                if (!lastCrumb || lastCrumb.label !== paramLabel) {
                    crumbs.push({
                        label: paramLabel,
                        historyIndex: index
                    });
                }
            } else if (crumbs.length === 0) {
                // First entry without params - show the view name as starting point
                const viewConfig = VIEW_CONFIG[entry.view];
                if (viewConfig?.title) {
                    crumbs.push({
                        label: viewConfig.title,
                        historyIndex: index
                    });
                }
            }
        });

        return crumbs;
    }, [activeNavItem, viewHistory]);

    // Breadcrumb overflow detection
    const breadcrumbContainerRef = useRef(null);
    const [hiddenCount, setHiddenCount] = useState(0);
    const allCrumbs = getBreadcrumbs();
    const prevCrumbsLengthRef = useRef(allCrumbs.length);

    // Reset hiddenCount when breadcrumbs decrease (navigation back)
    useEffect(() => {
        if (allCrumbs.length < prevCrumbsLengthRef.current) {
            // Navigated back - reset to 0, let overflow detection build it up again
            setHiddenCount(0);
        }
        prevCrumbsLengthRef.current = allCrumbs.length;
    }, [allCrumbs.length]);

    useEffect(() => {
        const container = breadcrumbContainerRef.current;
        if (!container) return;

        let rafId = null;

        const checkOverflow = () => {
            // Cancel any pending RAF
            if (rafId) cancelAnimationFrame(rafId);

            rafId = requestAnimationFrame(() => {
                // Only increase hiddenCount when overflowing
                // Never decrease automatically (prevents oscillation)
                if (container.scrollWidth > container.clientWidth + 5) { // 5px buffer
                    setHiddenCount(prev => Math.min(prev + 1, allCrumbs.length - 1));
                }
            });
        };

        // Initial check after render
        const timeout = setTimeout(checkOverflow, 50);

        // Watch for size changes
        const observer = new ResizeObserver(checkOverflow);
        observer.observe(container);

        return () => {
            observer.disconnect();
            clearTimeout(timeout);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [allCrumbs.length, hiddenCount]);

    return (
        <div className="flex h-screen bg-nord-snow-3 dark:bg-nord-polar-1">
            {/* Sidebar */}
            <motion.aside
                variants={sidebarVariants}
                animate={isSidebarCollapsed ? 'collapsed' : 'expanded'}
                className="flex flex-col border-r border-nord-snow-1 dark:border-nord-polar-3
                    bg-white dark:bg-nord-polar-2 overflow-hidden"
            >
                {/* Logo/Brand Area */}
                <div className="flex items-center justify-between h-14 px-3 border-b border-nord-snow-1 dark:border-nord-polar-3">
                    <AnimatePresence mode="wait">
                        {!isSidebarCollapsed && (
                            <motion.h1
                                key="logo"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="font-heading text-lg font-semibold text-nord-frost-4 dark:text-nord-frost-2 truncate"
                            >
                                TimeScroll
                            </motion.h1>
                        )}
                    </AnimatePresence>
                    <motion.button
                        onClick={toggleSidebar}
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                        className="p-1.5 rounded-lg hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 
                                   text-nord-polar-4 dark:text-nord-snow-1"
                        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <motion.div
                            animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
                            transition={smoothSpring}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.div>
                    </motion.button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 p-2 space-y-1">
                    {NAV_ITEMS
                        .filter(item => !item.requiresProject || activeNavItem !== 'welcome')
                        .map((item) => {
                            const Icon = item.icon;
                            const isActive = activeNavItem === item.id;

                            return (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => navigateToRoot(item.id)}
                                    className={`
                                    nav-item w-full
                                    ${isActive ? 'active' : ''}
                                    ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                                `}
                                    title={isSidebarCollapsed ? item.label : undefined}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    <AnimatePresence mode="wait">
                                        {!isSidebarCollapsed && (
                                            <motion.span
                                                key={item.id + '-label'}
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: 'auto' }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className="truncate"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            );
                        })}
                </nav>


                {/* Footer with theme toggle, export, and help */}
                <div className="p-2 border-t border-nord-snow-1 dark:border-nord-polar-3 space-y-1">
                    {/* Export Button - only show when project is loaded */}
                    <AnimatePresence>
                        {activeNavItem !== 'welcome' && (
                            <motion.button
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                whileHover={buttonHover}
                                whileTap={buttonTap}
                                onClick={async () => {
                                    try {
                                        const exams = await getExams();
                                        await exportCalendarToPDF(exams, 'exam-schedule');
                                    } catch (error) {
                                        console.error('Export failed:', error);
                                    }
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                    text-nord-polar-3 hover:bg-nord-snow-1 hover:text-nord-polar-1
                                    dark:text-nord-snow-1 dark:hover:bg-nord-polar-3 dark:hover:text-nord-snow-2
                                    cursor-pointer
                                    ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                                `}
                                title={isSidebarCollapsed ? 'Export' : undefined}
                                aria-label="Export schedule"
                            >
                                <Upload className="w-5 h-5 flex-shrink-0" />
                                <AnimatePresence mode="wait">
                                    {!isSidebarCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{ opacity: 1, width: 'auto' }}
                                            exit={{ opacity: 0, width: 0 }}
                                            className="truncate"
                                        >
                                            Export
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Help Button */}
                    <motion.button
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                        onClick={() => {/* TODO: Help functionality */ }}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                            text-nord-polar-3 hover:bg-nord-snow-1 hover:text-nord-polar-1
                            dark:text-nord-snow-1 dark:hover:bg-nord-polar-3 dark:hover:text-nord-snow-2
                            cursor-pointer
                            ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                        `}
                        title={isSidebarCollapsed ? 'Help' : undefined}
                        aria-label="Help"
                    >
                        <HelpCircle className="w-5 h-5 flex-shrink-0" />
                        <AnimatePresence mode="wait">
                            {!isSidebarCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="truncate"
                                >
                                    Help
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {/* Theme Toggle */}
                    <motion.button
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                        onClick={toggleTheme}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                            text-nord-polar-3 hover:bg-nord-snow-1 hover:text-nord-polar-1
                            dark:text-nord-snow-1 dark:hover:bg-nord-polar-3 dark:hover:text-nord-snow-2
                            cursor-pointer
                            ${isSidebarCollapsed ? 'justify-center px-0' : ''}
                        `}
                        title={isSidebarCollapsed ? (isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode') : undefined}
                        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isDarkMode ? 'sun' : 'moon'}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                {isDarkMode ? (
                                    <Sun className="w-5 h-5 flex-shrink-0" />
                                ) : (
                                    <Moon className="w-5 h-5 flex-shrink-0" />
                                )}
                            </motion.div>
                        </AnimatePresence>
                        <AnimatePresence mode="wait">
                            {!isSidebarCollapsed && (
                                <motion.span
                                    key={isDarkMode ? 'light-text' : 'dark-text'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className="truncate"
                                >
                                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header with back button, project name, and breadcrumbs */}
                <header className="flex items-center gap-4 h-14 px-4 border-b border-nord-snow-1 dark:border-nord-polar-3 bg-white dark:bg-nord-polar-2">
                    <motion.button
                        onClick={canGoBack ? goBack : undefined}
                        disabled={!canGoBack}
                        whileHover={canGoBack ? { scale: 1.02, x: -2 } : {}}
                        whileTap={canGoBack ? { scale: 0.98 } : {}}
                        className={`flex items-center gap-2 px-2 py-1.5 -ml-2 rounded-lg flex-shrink-0
                            ${canGoBack
                                ? 'text-nord-polar-3 dark:text-nord-snow-1 hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 cursor-pointer'
                                : 'text-nord-polar-4/40 dark:text-nord-snow-1/30 cursor-not-allowed'
                            }`}
                    >
                        <motion.div
                            animate={{ x: canGoBack ? 0 : 0 }}
                            whileHover={{ x: -3 }}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </motion.div>
                        <span className="text-sm font-medium">Back</span>
                    </motion.button>

                    {/* Divider */}
                    {projectName && (
                        <div className="w-px h-6 bg-nord-snow-1 dark:bg-nord-polar-3" />
                    )}

                    {/* Project Name & Breadcrumbs */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {projectName && (
                            <span className="font-medium text-nord-polar-2 dark:text-nord-snow-2 flex-shrink-0">
                                {projectName}
                            </span>
                        )}

                        {allCrumbs.length > 0 && projectName && (
                            <ChevronRight className="w-4 h-4 text-nord-polar-4/50 dark:text-nord-snow-1/40 flex-shrink-0" />
                        )}

                        {/* Breadcrumb items with dynamic overflow */}
                        <div ref={breadcrumbContainerRef} className="flex items-center gap-2 min-w-0 overflow-hidden">
                            {/* Show ellipsis if there are hidden crumbs */}
                            {hiddenCount > 0 && (
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-sm text-nord-polar-4/60 dark:text-nord-snow-1/40">...</span>
                                    <ChevronRight className="w-4 h-4 text-nord-polar-4/50 dark:text-nord-snow-1/40" />
                                </div>
                            )}

                            {allCrumbs.slice(hiddenCount).map((crumb, index, visibleArr) => {
                                const isLast = index === visibleArr.length - 1;
                                // The actual index in allCrumbs = hiddenCount + index
                                const actualIndex = hiddenCount + index;
                                // Steps to go back = total crumbs - 1 - actualIndex
                                const stepsBack = allCrumbs.length - 1 - actualIndex;

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-center gap-2 flex-shrink-0"
                                    >
                                        {index > 0 && (
                                            <ChevronRight className="w-4 h-4 text-nord-polar-4/50 dark:text-nord-snow-1/40" />
                                        )}
                                        {!isLast ? (
                                            <motion.button
                                                onClick={() => goBackN(stepsBack)}
                                                whileHover={{ scale: 1.02, color: '#88C0D0' }}
                                                whileTap={{ scale: 0.98 }}
                                                className="text-sm text-nord-polar-4 dark:text-nord-snow-1/70 whitespace-nowrap"
                                            >
                                                {crumb.label}
                                            </motion.button>
                                        ) : (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-sm font-medium text-nord-polar-2 dark:text-nord-snow-2 whitespace-nowrap"
                                            >
                                                {crumb.label}
                                            </motion.span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 scrollbar-frost">
                    {children}
                </div>
            </main>
        </div>
    );
}
