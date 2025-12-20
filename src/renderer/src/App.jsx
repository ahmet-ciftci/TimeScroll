import { NavigationProvider, useNavigation, VIEW_CONFIG } from './contexts/NavigationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import CalendarGrid from './components/CalendarGrid';
import ClassroomViewComponent from './components/ClassroomView';
import StudentViewComponent from './components/StudentView';
import CourseViewComponent from './components/CourseView';
import WelcomeViewComponent from './components/WelcomeView';
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
    return <WelcomeViewComponent />;
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
        <ThemeProvider>
            <NavigationProvider>
                <AppContent />
            </NavigationProvider>
        </ThemeProvider>
    );
}
