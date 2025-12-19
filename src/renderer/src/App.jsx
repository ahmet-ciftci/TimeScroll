import { useState, useCallback } from 'react';
import Layout from './components/Layout';
import Spinner from './components/Spinner';

/**
 * App Component - Main application entry point
 * 
 * Manages view state and navigation history.
 * Currently renders placeholder views - these will be built in subsequent sections.
 */

// Placeholder view components (to be replaced with actual implementations)
function DashboardView() {
    return (
        <div className="space-y-4">
            <h2 className="font-heading text-2xl text-nord-polar-1 dark:text-nord-snow-2">
                Schedule Overview
            </h2>
            <div className="card">
                <p className="text-nord-polar-3 dark:text-nord-snow-1">
                    Calendar grid will be implemented in Section 3.
                </p>
            </div>
        </div>
    );
}

function ClassroomView() {
    return (
        <div className="space-y-4">
            <h2 className="font-heading text-2xl text-nord-polar-1 dark:text-nord-snow-2">
                Classroom View
            </h2>
            <div className="card">
                <p className="text-nord-polar-3 dark:text-nord-snow-1">
                    Room selection and timetable will be implemented in Section 4.
                </p>
            </div>
        </div>
    );
}

function StudentView() {
    return (
        <div className="space-y-4">
            <h2 className="font-heading text-2xl text-nord-polar-1 dark:text-nord-snow-2">
                Student View
            </h2>
            <div className="card">
                <p className="text-nord-polar-3 dark:text-nord-snow-1">
                    Student search and schedule will be implemented in Section 5.
                </p>
            </div>
        </div>
    );
}

function CourseView({ courseCode, onBack }) {
    return (
        <div className="space-y-4">
            <h2 className="font-heading text-2xl text-nord-polar-1 dark:text-nord-snow-2">
                Course: {courseCode}
            </h2>
            <div className="card">
                <p className="text-nord-polar-3 dark:text-nord-snow-1">
                    Course details and enrolled students will be implemented in Section 6.
                </p>
            </div>
        </div>
    );
}

function WelcomeView({ onCreateProject, onLoadProject }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="text-center">
                <h1 className="font-heading text-4xl font-semibold text-nord-frost-4 dark:text-nord-frost-2 mb-2">
                    TimeScroll
                </h1>
                <p className="text-nord-polar-3 dark:text-nord-snow-1">
                    Examination Schedule Automation
                </p>
            </div>
            <div className="card max-w-md w-full">
                <p className="text-nord-polar-3 dark:text-nord-snow-1 text-center">
                    Welcome screen and recent projects will be implemented in Section 7.
                </p>
            </div>
        </div>
    );
}

// View registry
const VIEWS = {
    welcome: WelcomeView,
    dashboard: DashboardView,
    classroom: ClassroomView,
    student: StudentView,
    course: CourseView,
};

export default function App() {
    // Navigation state
    const [currentView, setCurrentView] = useState('dashboard');
    const [viewHistory, setViewHistory] = useState(['dashboard']);
    const [viewParams, setViewParams] = useState({});

    // Navigate to a view
    const navigateTo = useCallback((viewId, params = {}) => {
        setViewHistory(prev => [...prev, viewId]);
        setCurrentView(viewId);
        setViewParams(params);
    }, []);

    // Go back in history
    const goBack = useCallback(() => {
        if (viewHistory.length > 1) {
            const newHistory = viewHistory.slice(0, -1);
            setViewHistory(newHistory);
            setCurrentView(newHistory[newHistory.length - 1]);
            setViewParams({});
        }
    }, [viewHistory]);

    // Check if we can go back
    const canGoBack = viewHistory.length > 1;

    // Get current view component
    const ViewComponent = VIEWS[currentView] || DashboardView;

    return (
        <Layout
            currentView={currentView}
            onNavigate={navigateTo}
            canGoBack={canGoBack}
            onGoBack={goBack}
        >
            <ViewComponent {...viewParams} onNavigate={navigateTo} onBack={goBack} />
        </Layout>
    );
}
