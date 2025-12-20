import { useState, useEffect, useMemo } from 'react';
import { getCourses, getExams } from '../services/dataService';
import { useNavigation } from '../contexts/NavigationContext';
import Spinner from './Spinner';

/**
 * CourseView Component
 * 
 * Shows course details (course_code only), exam information, and list of enrolled students.
 * When accessed from sidebar, shows a course selector.
 * Clicking a student navigates to the Student View with that student selected.
 */

// Helper to highlight matching text
function HighlightedText({ text, query }) {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
        regex.test(part)
            ? <strong key={i} className="font-bold">{part}</strong>
            : part
    );
}

export default function CourseView() {
    const { viewParams, navigateTo } = useNavigation();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [exam, setExam] = useState(null);
    const [enrolledStudentIds, setEnrolledStudentIds] = useState([]);
    const [loading, setLoading] = useState(true);

    // Check if we have a course from navigation params
    const courseFromParams = viewParams.courseCode;

    // Load all data and sync with navigation params
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [coursesData, examsData] = await Promise.all([
                    getCourses(),
                    getExams()
                ]);

                setCourses(coursesData);

                // If we have a courseCode from navigation, select that course
                if (courseFromParams) {
                    const foundCourse = coursesData.find(c => c.course_code === courseFromParams);
                    if (foundCourse) {
                        setSelectedCourse(foundCourse);
                        setEnrolledStudentIds(foundCourse.enrolled_students || []);

                        // Find exam for this course
                        const foundExam = viewParams.examId
                            ? examsData.find(e => e.exam_id === viewParams.examId)
                            : examsData.find(e => e.course_code === courseFromParams);
                        setExam(foundExam);
                    }
                } else {
                    // Clear selection when params are empty (back navigation to cleared state)
                    setSelectedCourse(null);
                    setExam(null);
                    setEnrolledStudentIds([]);
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [courseFromParams, viewParams.examId]);

    // Update enrolled students when course selection changes (sidebar access)
    useEffect(() => {
        if (selectedCourse && !courseFromParams) {
            async function loadCourseDetails() {
                const examsData = await getExams();

                const foundExam = examsData.find(e => e.course_code === selectedCourse.course_code);
                setExam(foundExam);
                setEnrolledStudentIds(selectedCourse.enrolled_students || []);
            }
            loadCourseDetails();
        }
    }, [selectedCourse, courseFromParams]);

    // Filter courses based on search
    const filteredCourses = useMemo(() => {
        if (!searchQuery.trim()) return courses;
        const query = searchQuery.toLowerCase();
        return courses.filter(course =>
            course.course_code.toLowerCase().includes(query)
        );
    }, [courses, searchQuery]);

    // Handle course selection - save to navigation params
    const handleSelectCourse = (course) => {
        setSelectedCourse(course);
        setSearchQuery('');
        setIsDropdownOpen(false);
        // Save selection to navigation state so it persists on back navigation
        navigateTo('course', { courseCode: course.course_code });
    };

    // Handle clearing selection
    const handleClearSelection = () => {
        setSelectedCourse(null);
        setSearchQuery('');
        setExam(null);
        setEnrolledStudentIds([]);
        // Clear from navigation params too
        navigateTo('course', {});
    };

    // Navigate to student view
    const handleStudentClick = (studentId) => {
        navigateTo('student', {
            studentId: studentId
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Course Selector (only show when not navigated with course params) */}
            {!courseFromParams && (
                <div className="flex items-center gap-4">
                    <div className="relative w-72">
                        {/* Search Input */}
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nord-polar-4 dark:text-nord-snow-1/50" />
                            <input
                                type="text"
                                value={selectedCourse ? selectedCourse.course_code : searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSelectedCourse(null);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="Search by course code..."
                                className="input pl-10 pr-10 w-full"
                            />
                            {(selectedCourse || searchQuery) && (
                                <button
                                    onClick={handleClearSelection}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-nord-polar-4 dark:text-nord-snow-1/50 hover:text-nord-polar-2 dark:hover:text-nord-snow-2"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown */}
                        {isDropdownOpen && !selectedCourse && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-nord-polar-2 rounded-lg shadow-lg border border-nord-snow-1 dark:border-nord-polar-3 max-h-60 overflow-y-auto">
                                {filteredCourses.length === 0 ? (
                                    <div className="p-3 text-sm text-nord-polar-4 dark:text-nord-snow-1/60">
                                        No courses found
                                    </div>
                                ) : (
                                    filteredCourses.map(course => (
                                        <button
                                            key={course.course_code}
                                            onClick={() => handleSelectCourse(course)}
                                            className="w-full text-left px-4 py-3 hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 transition-colors border-b border-nord-snow-1/50 dark:border-nord-polar-3/50 last:border-b-0"
                                        >
                                            <div className="font-medium text-nord-polar-1 dark:text-nord-snow-2">
                                                <HighlightedText text={course.course_code} query={searchQuery} />
                                            </div>
                                            <div className="text-xs text-nord-polar-4 dark:text-nord-snow-1/60">
                                                {course.enrolled_students.length} students
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Course Details (when course is selected) */}
            {selectedCourse ? (
                <>
                    {/* Course Header Card */}
                    <div className="card">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 text-sm font-medium bg-nord-frost-3/15 text-nord-frost-4 dark:bg-nord-frost-3/25 dark:text-nord-frost-2 rounded-lg">
                                    {selectedCourse.course_code}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-nord-polar-4 dark:text-nord-snow-1/60">
                                <UsersIcon className="w-4 h-4" />
                                <span>{enrolledStudentIds.length} students</span>
                            </div>
                        </div>
                    </div>

                    {/* Exam Details Card (if exam exists) */}
                    {exam && (
                        <div className="card border-l-4 border-nord-frost-3">
                            <h4 className="font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-3 flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-nord-frost-4 dark:text-nord-frost-2" />
                                Exam Schedule
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-nord-polar-4 dark:text-nord-snow-1/50 mb-1">Date</p>
                                    <p className="font-medium text-nord-polar-2 dark:text-nord-snow-2">
                                        {formatDate(exam.date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-nord-polar-4 dark:text-nord-snow-1/50 mb-1">Time</p>
                                    <p className="font-medium text-nord-polar-2 dark:text-nord-snow-2">
                                        {exam.time}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-nord-polar-4 dark:text-nord-snow-1/50 mb-1">Duration</p>
                                    <p className="font-medium text-nord-polar-2 dark:text-nord-snow-2">
                                        {exam.duration_minutes} minutes
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-nord-polar-4 dark:text-nord-snow-1/50 mb-1">Room</p>
                                    <p className="font-medium text-nord-polar-2 dark:text-nord-snow-2">
                                        {exam.classroom_id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enrolled Students List */}
                    <div className="card">
                        <h4 className="font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-4 flex items-center gap-2">
                            <UsersIcon className="w-4 h-4 text-nord-frost-4 dark:text-nord-frost-2" />
                            Enrolled Students
                        </h4>
                        {enrolledStudentIds.length === 0 ? (
                            <p className="text-sm text-nord-polar-4 dark:text-nord-snow-1/60">
                                No students enrolled in this course.
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {enrolledStudentIds.map(studentId => (
                                    <button
                                        key={studentId}
                                        onClick={() => handleStudentClick(studentId)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg 
                                                   hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 
                                                   transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-nord-frost-3/15 dark:bg-nord-frost-3/25 
                                                            flex items-center justify-center text-xs font-medium 
                                                            text-nord-frost-4 dark:text-nord-frost-2">
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <p className="font-medium text-nord-polar-2 dark:text-nord-snow-2 group-hover:text-nord-frost-4 dark:group-hover:text-nord-frost-2">
                                                {studentId}
                                            </p>
                                        </div>
                                        <ChevronRightIcon className="w-4 h-4 text-nord-polar-4 dark:text-nord-snow-1/40 group-hover:text-nord-frost-4 dark:group-hover:text-nord-frost-2" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Prompt to select course */
                <div className="text-center py-16 text-nord-polar-4 dark:text-nord-snow-1/60">
                    <BookIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a course to view its details and enrolled students</p>
                </div>
            )}

            {/* Click outside to close dropdown */}
            {isDropdownOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsDropdownOpen(false)}
                />
            )}
        </div>
    );
}

// Helper to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Icons
function SearchIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
        </svg>
    );
}

function XIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    );
}

function BookIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    );
}

function UsersIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function UserIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function CalendarIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
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
