import { useState, useEffect, useMemo, useCallback } from 'react';
import { getExams, getCourses } from '../services/dataService';
import { useNavigation } from '../contexts/NavigationContext';
import Spinner from './Spinner';

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
        days.push(day.toISOString().split('T')[0]); // Format: YYYY-MM-DD
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
    const today = new Date().toISOString().split('T')[0];
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
    const { navigateTo } = useNavigation();

    // Get week days for current view
    const weekDays = useMemo(() => getWeekDays(currentMonday), [currentMonday]);

    // Navigation handlers
    const goToPrevWeek = useCallback(() => {
        setCurrentMonday(prev => {
            const newMonday = new Date(prev);
            newMonday.setDate(prev.getDate() - 7);
            return newMonday;
        });
    }, []);

    const goToNextWeek = useCallback(() => {
        setCurrentMonday(prev => {
            const newMonday = new Date(prev);
            newMonday.setDate(prev.getDate() + 7);
            return newMonday;
        });
    }, []);

    const goToToday = useCallback(() => {
        setCurrentMonday(getMonday(new Date()));
    }, []);

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
        const course = getCourseInfo(courses, exam.course_code);
        navigateTo('course', {
            courseCode: exam.course_code,
            courseName: course?.course_name || exam.course_code,
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
        <div className="space-y-4">
            {/* Week Navigation Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPrevWeek}
                        className="p-2 rounded-lg hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 
                                   text-nord-polar-3 dark:text-nord-snow-1 transition-colors"
                        aria-label="Previous week"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goToNextWeek}
                        className="p-2 rounded-lg hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 
                                   text-nord-polar-3 dark:text-nord-snow-1 transition-colors"
                        aria-label="Next week"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-medium text-nord-polar-1 dark:text-nord-snow-2 ml-2">
                        {formatWeekRange(currentMonday)}
                    </h3>
                </div>
                <button
                    onClick={goToToday}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg
                               bg-nord-frost-3/10 text-nord-frost-4 
                               hover:bg-nord-frost-3/20 dark:bg-nord-frost-3/20 
                               dark:text-nord-frost-2 dark:hover:bg-nord-frost-3/30
                               transition-colors"
                >
                    Today
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto">
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
                                <td className="p-2 text-sm font-medium text-nord-polar-4 dark:text-nord-snow-1/60 border-b border-nord-snow-1 dark:border-nord-polar-3 whitespace-nowrap align-middle">
                                    {time}
                                </td>

                                {weekDays.map(date => {
                                    const exam = findExamAtSlot(exams, date, time);
                                    const todayCell = isToday(date);

                                    return (
                                        <td
                                            key={`${time}-${date}`}
                                            className={`p-1 border-b border-nord-snow-1 dark:border-nord-polar-3
                                                ${todayCell ? 'bg-nord-frost-3/5 dark:bg-nord-frost-2/5' : ''}`}
                                        >
                                            {/* Fixed height wrapper to prevent row size changes */}
                                            <div className="h-[72px] overflow-hidden">
                                                {exam ? (
                                                    <button
                                                        onClick={() => handleExamClick(exam)}
                                                        className="w-full h-full text-left p-2 rounded-lg bg-nord-frost-3/15 dark:bg-nord-frost-3/25 
                                                                   hover:bg-nord-frost-3/25 dark:hover:bg-nord-frost-3/35
                                                                   border border-nord-frost-3/30 dark:border-nord-frost-2/30
                                                                   transition-colors cursor-pointer group overflow-hidden"
                                                    >
                                                        <div className="font-medium text-sm text-nord-frost-4 dark:text-nord-frost-2 group-hover:text-nord-frost-3 dark:group-hover:text-nord-frost-1 truncate leading-tight">
                                                            {exam.course_code}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-nord-polar-4/70 dark:text-nord-snow-1/50">
                                                            <span className="flex items-center gap-0.5">
                                                                <RoomIcon className="w-3 h-3 flex-shrink-0" />
                                                                {exam.classroom_id}
                                                            </span>
                                                            <span className="flex items-center gap-0.5">
                                                                <ClockIcon className="w-3 h-3 flex-shrink-0" />
                                                                {exam.duration_minutes}m
                                                            </span>
                                                        </div>
                                                    </button>
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
            </div>
        </div>
    );
}

// Icons
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

function RoomIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M9 8h1M9 12h1M9 16h1M14 8h1M14 12h1M14 16h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        </svg>
    );
}

function ClockIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </svg>
    );
}
