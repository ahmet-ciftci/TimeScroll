import { NavigationProvider, useNavigation, VIEW_CONFIG } from './contexts/NavigationContext';
import Layout from './components/Layout';
import CalendarGrid from './components/CalendarGrid';
import ClassroomViewComponent from './components/ClassroomView';
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
    const { navigateTo } = useNavigation();

    return (
        <div className="space-y-4">
            <div className="card">
                <p className="text-nord-polar-3 dark:text-nord-snow-1 mb-4">
                    Student search and schedule will be implemented in Section 5.
                </p>
                {/* Demo navigation */}
                <button
                    onClick={() => navigateTo('course', { courseCode: 'PHYS201', courseName: 'Physics II' })}
                    className="btn btn-secondary"
                >
                    Demo: View Student's Course
                </button>
            </div>
        </div>
    );
}

function CourseView() {
    const { viewParams, navigateTo, goBack } = useNavigation();

    return (
        <div className="space-y-4">
            {/* Course Header */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-nord-polar-1 dark:text-nord-snow-2">
                            {viewParams.courseCode}
                        </h3>
                        <p className="text-nord-polar-3 dark:text-nord-snow-1">
                            {viewParams.courseName || 'Course Name'}
                        </p>
                    </div>
                </div>
                <p className="text-nord-polar-4 dark:text-nord-snow-1/70">
                    Course details and enrolled students will be implemented in Section 6.
                </p>
            </div>

            {/* Demo: Click student to navigate */}
            <div className="card">
                <h4 className="font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-3">
                    Enrolled Students (Demo)
                </h4>
                <div className="space-y-2">
                    {['Ahmet Yılmaz', 'Elif Demir', 'Mehmet Kaya'].map(name => (
                        <button
                            key={name}
                            onClick={() => navigateTo('student', { studentId: 'STU001', studentName: name })}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 
                                       text-nord-polar-2 dark:text-nord-snow-1 transition-colors"
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
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
