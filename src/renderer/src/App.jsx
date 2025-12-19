import { NavigationProvider, useNavigation, VIEW_CONFIG } from './contexts/NavigationContext';
import Layout from './components/Layout';
import CalendarGrid from './components/CalendarGrid';
import ClassroomViewComponent from './components/ClassroomView';
import StudentViewComponent from './components/StudentView';
import CourseViewComponent from './components/CourseView';
import Spinner from './components/Spinner';

/**
 * App Component - Main application entry point
 * 
 * Uses NavigationContext for view state management.
 * Renders the appropriate view based on currentView state.
 */

// Real view components
function DashboardView() {
    return (
        <div className="space-y-4">
            <CalendarGrid />
        </div>
    );
}

function ClassroomView() {
    return <ClassroomViewComponent />;
}

function StudentView() {
    return <StudentViewComponent />;
}

function CourseView() {
    return <CourseViewComponent />;
}

function WelcomeView() {
    const { navigateToRoot } = useNavigation();

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
            <div className="card max-w-md w-full text-center">
                <p className="text-nord-polar-3 dark:text-nord-snow-1 mb-4">
                    Welcome screen and recent projects will be implemented in Section 7.
                </p>
                <button
                    onClick={() => navigateToRoot('dashboard')}
                    className="btn btn-primary"
                >
                    Go to Dashboard
                </button>
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

// Inner app that uses navigation context
function AppContent() {
    const { currentView } = useNavigation();

    // Get current view component
    const ViewComponent = VIEWS[currentView] || DashboardView;

    return (
        <Layout>
            <ViewComponent />
        </Layout>
    );
}

// Main app wrapper with providers
export default function App() {
    return (
        <NavigationProvider>
            <AppContent />
        </NavigationProvider>
    );
}
