import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCourses, getExams } from '../services/dataService';
import { useNavigation } from '../contexts/NavigationContext';
import { Search, X, BookOpen, Users, User, Calendar, ChevronRight } from 'lucide-react';
import Spinner from './Spinner';
import {
    dropdownVariants,
    staggerContainer,
    staggerItem,
    cardVariants,
    listItemHover,
    buttonHover,
    buttonTap,
} from '../lib/animations';

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
    const { viewParams, navigateTo, currentProfile } = useNavigation();
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
                    getCourses(currentProfile),
                    getExams(currentProfile)
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
    }, [courseFromParams, viewParams.examId, currentProfile]);

    // Update enrolled students when course selection changes (sidebar access)
    useEffect(() => {
        if (selectedCourse && !courseFromParams) {
            async function loadCourseDetails() {
                const examsData = await getExams(currentProfile);

                const foundExam = examsData.find(e => e.course_code === selectedCourse.course_code);
                setExam(foundExam);
                setEnrolledStudentIds(selectedCourse.enrolled_students || []);
            }
            loadCourseDetails();
        }
    }, [selectedCourse, courseFromParams, currentProfile]);

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
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nord-polar-4 dark:text-nord-snow-1/50" />
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
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown */}
                        <AnimatePresence>
                            {isDropdownOpen && !selectedCourse && (
                                <motion.div
                                    variants={dropdownVariants}
                                    initial="initial"
                                    animate="enter"
                                    exit="exit"
                                    className="absolute z-10 w-full mt-1 bg-white dark:bg-nord-polar-2 rounded-lg shadow-lg border border-nord-snow-1 dark:border-nord-polar-3 max-h-60 overflow-y-auto"
                                >
                                    {filteredCourses.length === 0 ? (
                                        <div className="p-3 text-sm text-nord-polar-4 dark:text-nord-snow-1/60">
                                            No courses found
                                        </div>
                                    ) : (
                                        <motion.div variants={staggerContainer} initial="initial" animate="enter">
                                            {filteredCourses.map(course => (
                                                <motion.button
                                                    key={course.course_code}
                                                    variants={staggerItem}
                                                    whileHover={{ backgroundColor: 'rgba(136, 192, 208, 0.1)', x: 4 }}
                                                    onClick={() => handleSelectCourse(course)}
                                                    className="w-full text-left px-4 py-3 border-b border-nord-snow-1/50 dark:border-nord-polar-3/50 last:border-b-0"
                                                >
                                                    <div className="font-medium text-nord-polar-1 dark:text-nord-snow-2">
                                                        <HighlightedText text={course.course_code} query={searchQuery} />
                                                    </div>
                                                    <div className="text-xs text-nord-polar-4 dark:text-nord-snow-1/60">
                                                        {course.enrolled_students.length} students
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                                <Users className="w-4 h-4" />
                                <span>{enrolledStudentIds.length} students</span>
                            </div>
                        </div>
                    </div>

                    {/* Exam Details Card (if exam exists) */}
                    {exam && (
                        <div className="card border-l-4 border-nord-frost-3">
                            <h4 className="font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-nord-frost-4 dark:text-nord-frost-2" />
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
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="card"
                    >
                        <h4 className="font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-nord-frost-4 dark:text-nord-frost-2" />
                            Enrolled Students
                        </h4>
                        {enrolledStudentIds.length === 0 ? (
                            <p className="text-sm text-nord-polar-4 dark:text-nord-snow-1/60">
                                No students enrolled in this course.
                            </p>
                        ) : (
                            <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                animate="enter"
                                className="space-y-1"
                            >
                                {enrolledStudentIds.map((studentId, index) => (
                                    <motion.button
                                        key={studentId}
                                        variants={staggerItem}
                                        whileHover={{ scale: 1.01, x: 4, backgroundColor: 'rgba(136, 192, 208, 0.1)' }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => handleStudentClick(studentId)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-nord-frost-3/15 dark:bg-nord-frost-3/25 
                                                            flex items-center justify-center text-xs font-medium 
                                                            text-nord-frost-4 dark:text-nord-frost-2">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <p className="font-medium text-nord-polar-2 dark:text-nord-snow-2 group-hover:text-nord-frost-4 dark:group-hover:text-nord-frost-2">
                                                {studentId}
                                            </p>
                                        </div>
                                        <motion.div
                                            initial={{ x: 0 }}
                                            whileHover={{ x: 4 }}
                                        >
                                            <ChevronRight className="w-4 h-4 text-nord-polar-4 dark:text-nord-snow-1/40 group-hover:text-nord-frost-4 dark:group-hover:text-nord-frost-2" />
                                        </motion.div>
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </>
            ) : (
                /* Prompt to select course */
                <div className="text-center py-16 text-nord-polar-4 dark:text-nord-snow-1/60">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
