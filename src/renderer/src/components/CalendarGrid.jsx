import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExams, getCourses, getSettings } from '../services/dataService';
import { useNavigation } from '../contexts/NavigationContext';
import { ChevronLeft, ChevronRight, MapPin, Clock, X } from 'lucide-react';
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
 * Rows = Time slots (dynamic based on settings), Columns = Days of the week (Mon-Sun).
 * Can be filtered by classroom or student.
 * Supports week navigation with Prev/Next buttons.
 */

// Default time slots (fallback if settings not loaded)
const DEFAULT_TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

// Generate time slots based on settings
// Matches the Scheduler's generateTimeSlots logic exactly
function generateTimeSlots(startTime, endTime, durationMinutes) {
    const slots = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentTotalMinutes = startHour * 60 + startMin;
    const endTotalMinutes = endHour * 60 + endMin;

    // Only add slot if the full exam duration fits before end time
    while (currentTotalMinutes + durationMinutes <= endTotalMinutes) {
        const hours = Math.floor(currentTotalMinutes / 60);
        const mins = currentTotalMinutes % 60;
        const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        slots.push(timeStr);

        // Advance by exam duration
        currentTotalMinutes += durationMinutes;
    }

    return slots.length > 0 ? slots : DEFAULT_TIME_SLOTS;
}

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

// Helper to find ALL exams at specific date/time slot
// Returns array of exams that start at the exact slot time
function findExamsAtSlot(exams, date, slotTime) {
    return exams.filter(e => {
        if (e.date !== date) return false;
        // Compare time slot to exam start time (compare hours and minutes)
        const [slotHour, slotMin] = slotTime.split(':').map(Number);
        const [examHour, examMin] = e.time.split(':').map(Number);
        return slotHour === examHour && slotMin === examMin;
    });
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
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));
    const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
    const [popoverData, setPopoverData] = useState(null); // { exams, x, y } for popover
    const popoverRef = useRef(null);
    const { navigateTo, currentProfile } = useNavigation();

    // Close popover when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setPopoverData(null);
            }
        }
        if (popoverData) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [popoverData]);

    // Handle showing popover for multiple exams
    const handleShowMore = useCallback((exams, event) => {
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        setPopoverData({
            exams,
            x: rect.left + rect.width / 2,
            y: rect.bottom + 8
        });
    }, []);

    // Generate time slots based on settings
    const timeSlots = useMemo(() => {
        if (!settings) return DEFAULT_TIME_SLOTS;
        const startTime = settings.day_start_time || '09:00';
        const endTime = settings.day_end_time || '17:00';
        const duration = parseInt(settings.exam_duration, 10) || 60;
        console.log('[CalendarGrid] Generating time slots with:', { startTime, endTime, duration });
        return generateTimeSlots(startTime, endTime, duration);
    }, [settings]);

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
                const [examsResult, coursesResult, settingsResult] = await Promise.all([
                    examsData ? Promise.resolve(examsData) : getExams(currentProfile),
                    getCourses(currentProfile),
                    getSettings(currentProfile)
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
                setSettings(settingsResult);
            } catch (error) {
                console.error('Failed to load calendar data:', error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [filterByClassroom, filterByStudent, examsData, currentProfile]);

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
                                {timeSlots.map(time => (
                                    <tr key={time} className="h-20 hover:bg-nord-snow-2/30 dark:hover:bg-nord-polar-3/20">
                                        <td className="p-2 text-sm font-medium text-nord-polar-4 dark:text-nord-snow-1/60 border-b border-nord-snow-1 dark:border-nord-polar-3 whitespace-nowrap align-top pt-3">
                                            {time}
                                        </td>

                                        {weekDays.map(date => {
                                            const slotExams = findExamsAtSlot(exams, date, time);
                                            const primaryExam = slotExams[0];
                                            const additionalCount = slotExams.length - 1;
                                            const todayCell = isToday(date);

                                            // Calculate height based on duration relative to slot duration
                                            // Each row represents one slot (exam_duration minutes)
                                            // Base height of 72px = one slot
                                            const slotDuration = settings?.exam_duration ? parseInt(settings.exam_duration) : 60;
                                            const baseHeight = 72;
                                            const examHeight = primaryExam
                                                ? Math.round((primaryExam.duration_minutes / slotDuration) * baseHeight)
                                                : baseHeight;

                                            return (
                                                <td
                                                    key={`${time}-${date}`}
                                                    className={`p-1 border-b border-nord-snow-1 dark:border-nord-polar-3 relative
                                                ${todayCell ? 'bg-nord-frost-3/5 dark:bg-nord-frost-2/5' : ''}`}
                                                >
                                                    {/* Container for exam card - relative positioning base */}
                                                    <div className="h-[72px]">
                                                        {primaryExam ? (
                                                            <motion.button
                                                                onClick={() => handleExamClick(primaryExam)}
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
                                                                    {primaryExam.course_code}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 mt-1 text-xs text-white/80 dark:text-nord-snow-1/80">
                                                                    <span className="flex items-center gap-0.5">
                                                                        <MapPin className="w-3 h-3 flex-shrink-0" />
                                                                        {primaryExam.classroom_id}
                                                                    </span>
                                                                    <span className="flex items-center gap-0.5">
                                                                        <Clock className="w-3 h-3 flex-shrink-0" />
                                                                        {primaryExam.duration_minutes}m
                                                                    </span>
                                                                </div>
                                                                {/* Badge showing additional concurrent exams */}
                                                                {additionalCount > 0 && (
                                                                    <motion.span
                                                                        onClick={(e) => handleShowMore(slotExams, e)}
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5
                                                                                   flex items-center justify-center
                                                                                   bg-nord-frost-4 dark:bg-nord-snow-2 
                                                                                   text-white dark:text-nord-polar-1
                                                                                   text-xs font-bold rounded-full
                                                                                   shadow-md border-2 border-white dark:border-nord-polar-2
                                                                                   cursor-pointer hover:bg-nord-frost-3 dark:hover:bg-nord-snow-1
                                                                                   transition-colors z-20"
                                                                    >
                                                                        +{additionalCount}
                                                                    </motion.span>
                                                                )}
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

            {/* Popover for concurrent exams */}
            <AnimatePresence>
                {popoverData && (
                    <motion.div
                        ref={popoverRef}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'fixed',
                            left: popoverData.x,
                            top: popoverData.y,
                            transform: 'translateX(-50%)',
                            zIndex: 50
                        }}
                        className="bg-white dark:bg-nord-polar-2 rounded-xl shadow-2xl 
                                   border border-nord-snow-1 dark:border-nord-polar-3
                                   p-3 min-w-[240px] max-w-[320px]"
                    >
                        {/* Popover header */}
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-nord-snow-1 dark:border-nord-polar-3">
                            <span className="text-sm font-medium text-nord-polar-2 dark:text-nord-snow-1">
                                {popoverData.exams.length} Concurrent Exams
                            </span>
                            <button
                                onClick={() => setPopoverData(null)}
                                className="p-1 rounded-md hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3
                                           text-nord-polar-4 dark:text-nord-snow-2 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Exam list */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {popoverData.exams.map((exam, index) => (
                                <motion.button
                                    key={exam.exam_id || index}
                                    onClick={() => {
                                        handleExamClick(exam);
                                        setPopoverData(null);
                                    }}
                                    whileHover={{ x: 4 }}
                                    className="w-full text-left p-2 rounded-lg
                                               bg-nord-frost-3/10 dark:bg-nord-frost-4/20
                                               hover:bg-nord-frost-3/20 dark:hover:bg-nord-frost-4/30
                                               border border-transparent hover:border-nord-frost-3/30
                                               transition-colors cursor-pointer"
                                >
                                    <div className="font-medium text-sm text-nord-polar-1 dark:text-nord-snow-1">
                                        {exam.course_code}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-nord-polar-4 dark:text-nord-snow-2/70">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {exam.classroom_id}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {exam.time} • {exam.duration_minutes}m
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Arrow pointer */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 
                                        w-0 h-0 border-l-8 border-r-8 border-b-8 
                                        border-l-transparent border-r-transparent 
                                        border-b-white dark:border-b-nord-polar-2" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
