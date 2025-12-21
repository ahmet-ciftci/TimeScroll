import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExams, getCourses } from '../services/dataService';
import { useNavigation } from '../contexts/NavigationContext';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import Spinner from './Spinner';
import {
    buttonHover,
    buttonTap,
    staggerContainer,
    staggerItem,
    examCardVariants,
    smoothSpring,
    calendarSlideVariants,
    elegantEase,
    slideHeaderVariants,
} from '../lib/animations';

/**
 * CalendarGrid Component
 * 
 * Displays exams in a calendar-style grid.
 * Rows = Time slots (09:00-17:00), Columns = Days of the week (Mon-Sun).
 * Can be filtered by classroom or student.
 * Supports week navigation with Prev/Next buttons.
 */

// All time slots from 9AM to 5PM (1-hour intervals)
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

// Days of week labels
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Helper to get Monday of a given week
function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
}

// Helper to get all 7 days of a week starting from Monday
function getWeekDays(monday) {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        // Use local date formatting to avoid timezone issues
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const dayNum = String(day.getDate()).padStart(2, '0');
        days.push(`${year}-${month}-${dayNum}`); // Format: YYYY-MM-DD
    }
    return days;
}

// Helper to format date for header (e.g., "Mon 20")
function formatDayHeader(dateString) {
    const date = new Date(dateString);
    const dayName = DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1];
    return `${dayName} ${date.getDate()}`;
}

// Helper to format week range (e.g., "Dec 16 - Dec 22, 2024")
function formatWeekRange(monday) {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const options = { month: 'short', day: 'numeric' };
    const startStr = monday.toLocaleDateString('en-US', options);
    const endStr = sunday.toLocaleDateString('en-US', { ...options, year: 'numeric' });

    return `${startStr} - ${endStr}`;
}

// Helper to find exam at specific date/time
function findExamAtSlot(exams, date, time) {
    return exams.find(e => e.date === date && e.time === time);
}

// Check if a date is today
function isToday(dateString) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    return dateString === today;
}

export default function CalendarGrid({
    filterByClassroom = null,
    filterByStudent = null,
    examsData = null,
    showEmptyMessage = true
}) {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));
    const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
    const { navigateTo } = useNavigation();

    // Get week days for current view
    const weekDays = useMemo(() => getWeekDays(currentMonday), [currentMonday]);

    // Navigation handlers
    const goToPrevWeek = useCallback(() => {
        setDirection(-1);
        setCurrentMonday(prev => {
            const newMonday = new Date(prev);
            newMonday.setDate(prev.getDate() - 7);
            return newMonday;
        });
    }, []);

    const goToNextWeek = useCallback(() => {
        setDirection(1);
        setCurrentMonday(prev => {
            const newMonday = new Date(prev);
            newMonday.setDate(prev.getDate() + 7);
            return newMonday;
        });
    }, []);

    const goToToday = useCallback(() => {
        const today = getMonday(new Date());
        if (today > currentMonday) setDirection(1);
        else if (today < currentMonday) setDirection(-1);
        else setDirection(0);
        setCurrentMonday(today);
    }, [currentMonday]);

    // Load data
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [examsResult, coursesResult] = await Promise.all([
                    examsData ? Promise.resolve(examsData) : getExams(),
                    getCourses()
                ]);

                let filteredExams = examsResult;

                if (filterByClassroom) {
                    filteredExams = filteredExams.filter(e => e.classroom_id === filterByClassroom);
                }

                if (filterByStudent) {
                    const enrolledCourses = coursesResult
                        .filter(c => c.enrolled_students.includes(filterByStudent))
                        .map(c => c.course_code);
                    filteredExams = filteredExams.filter(e => enrolledCourses.includes(e.course_code));
                }

                setExams(filteredExams);
                setCourses(coursesResult);
            } catch (error) {
                console.error('Failed to load calendar data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [filterByClassroom, filterByStudent, examsData]);

    // Handle exam cell click
    const handleExamClick = (exam) => {
        navigateTo('course', {
            courseCode: exam.course_code,
            examId: exam.exam_id
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
        >
            {/* Week Navigation Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <motion.button
                        onClick={goToPrevWeek}
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                        className="p-2 rounded-lg hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 
                                   text-nord-polar-3 dark:text-nord-snow-1"
                        aria-label="Previous week"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        onClick={goToNextWeek}
                        whileHover={buttonHover}
                        whileTap={buttonTap}
                        className="p-2 rounded-lg hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 
                                   text-nord-polar-3 dark:text-nord-snow-1"
                        aria-label="Next week"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </motion.button>
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.h3
                            key={currentMonday.toISOString()}
                            custom={direction}
                            variants={slideHeaderVariants}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                            className="text-lg font-medium text-nord-polar-1 dark:text-nord-snow-2 ml-2"
                        >
                            {formatWeekRange(currentMonday)}
                        </motion.h3>
                    </AnimatePresence>
                </div>
                <motion.button
                    onClick={goToToday}
                    disabled={currentMonday.toDateString() === getMonday(new Date()).toDateString()}
                    whileHover={currentMonday.toDateString() !== getMonday(new Date()).toDateString() ? { scale: 1.05 } : {}}
                    whileTap={currentMonday.toDateString() !== getMonday(new Date()).toDateString() ? { scale: 0.95 } : {}}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                               ${currentMonday.toDateString() === getMonday(new Date()).toDateString()
                            ? 'bg-nord-snow-1 text-nord-polar-3/40 dark:bg-nord-polar-3 dark:text-nord-snow-1/30 cursor-not-allowed'
                            : 'bg-nord-frost-3/10 text-nord-frost-4 hover:bg-nord-frost-3/20 dark:bg-nord-frost-3/20 dark:text-nord-frost-2 dark:hover:bg-nord-frost-3/30'
                        }`}
                >
                    Today
                </motion.button>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-hidden relative min-h-[500px] border border-transparent rounded-xl">
                <AnimatePresence mode="popLayout" custom={direction} initial={false}>
                    <motion.div
                        key={currentMonday.toISOString()}
                        custom={direction}
                        variants={calendarSlideVariants}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        className="w-full overflow-x-auto scrollbar-frost"
                    >
                        <table className="w-full table-fixed border-collapse min-w-[900px]">
                            {/* Header row with dates */}
                            <thead>
                                <tr>
                                    <th className="p-3 text-left text-sm font-medium text-nord-polar-3 dark:text-nord-snow-1/70 border-b border-nord-snow-1 dark:border-nord-polar-3 w-[60px]">
                                        Time
                                    </th>
                                    {weekDays.map(date => (
                                        <th
                                            key={date}
                                            className={`p-3 text-center text-sm font-medium border-b border-nord-snow-1 dark:border-nord-polar-3
                                        ${isToday(date)
                                                    ? 'text-nord-frost-3 dark:text-nord-frost-2 bg-nord-frost-3/5 dark:bg-nord-frost-2/10'
                                                    : 'text-nord-polar-3 dark:text-nord-snow-1/70'
                                                }`}
                                        >
                                            {formatDayHeader(date)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Body rows with time slots */}
                            <tbody>
                                {TIME_SLOTS.map(time => (
                                    <tr key={time} className="h-20 hover:bg-nord-snow-2/30 dark:hover:bg-nord-polar-3/20">
                                        <td className="p-2 text-sm font-medium text-nord-polar-4 dark:text-nord-snow-1/60 border-b border-nord-snow-1 dark:border-nord-polar-3 whitespace-nowrap align-top pt-3">
                                            {time}
                                        </td>

                                        {weekDays.map(date => {
                                            const exam = findExamAtSlot(exams, date, time);
                                            const todayCell = isToday(date);

                                            // Calculate height based on duration (60min = 76px)
                                            const baseHeight = 76;
                                            const examHeight = exam
                                                ? Math.round((exam.duration_minutes / 60) * baseHeight)
                                                : baseHeight;

                                            return (
                                                <td
                                                    key={`${time}-${date}`}
                                                    className={`p-1 border-b border-nord-snow-1 dark:border-nord-polar-3 relative
                                                ${todayCell ? 'bg-nord-frost-3/5 dark:bg-nord-frost-2/5' : ''}`}
                                                >
                                                    {/* Container for exam card - relative positioning base */}
                                                    <div className="h-[72px]">
                                                        {exam ? (
                                                            <motion.button
                                                                onClick={() => handleExamClick(exam)}
                                                                style={{ height: `${examHeight}px` }}
                                                                initial={{ opacity: 0, scale: 0.9 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                whileHover={{
                                                                    scale: 1.02,
                                                                    y: -2,
                                                                    boxShadow: '0 8px 25px -5px rgba(136, 192, 208, 0.4)'
                                                                }}
                                                                whileTap={{ scale: 0.98 }}
                                                                transition={smoothSpring}
                                                                className="absolute left-1 right-1 text-left p-2 rounded-lg 
                                                                   bg-nord-frost-3 dark:bg-nord-frost-4
                                                                   hover:bg-nord-frost-4 dark:hover:bg-nord-frost-3
                                                                   border border-nord-frost-4/30 dark:border-nord-frost-3
                                                                   cursor-pointer group overflow-hidden z-10 shadow-sm"
                                                            >
                                                                <div className="font-medium text-sm text-white dark:text-nord-snow-2 truncate leading-tight">
                                                                    {exam.course_code}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 mt-1 text-xs text-white/80 dark:text-nord-snow-1/80">
                                                                    <span className="flex items-center gap-0.5">
                                                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                                                        {exam.classroom_id}
                                                                    </span>
                                                                    <span className="flex items-center gap-0.5">
                                                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                                                        {exam.duration_minutes}m
                                                                    </span>
                                                                </div>
                                                            </motion.button>
                                                        ) : (
                                                            <div className="w-full h-full rounded-lg border border-dashed border-nord-snow-1/50 dark:border-nord-polar-3/30" />
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
