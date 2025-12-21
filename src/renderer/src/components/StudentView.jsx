import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStudents } from '../services/dataService';
import { useNavigation } from '../contexts/NavigationContext';
import { Search, X, User } from 'lucide-react';
import CalendarGrid from './CalendarGrid';
import Spinner from './Spinner';
import {
    dropdownVariants,
    staggerContainer,
    staggerItem,
    buttonHover,
    buttonTap,
} from '../lib/animations';

/**
 * StudentView Component
 * 
 * Shows a searchable student selector (by ID only) and filtered calendar grid.
 * Select a student to see only exams for courses they're enrolled in.
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

export default function StudentView() {
    const { viewParams, navigateTo, currentProfile } = useNavigation();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if we have a student from navigation params
    const studentFromParams = viewParams.studentId;

    // Load students on mount and sync with navigation params
    useEffect(() => {
        async function loadStudents() {
            setLoading(true);
            try {
                const data = await getStudents(currentProfile);
                setStudents(data);

                // If we have a studentId from navigation, pre-select that student
                if (studentFromParams) {
                    const foundStudent = data.find(s => s.student_id === studentFromParams);
                    if (foundStudent) {
                        setSelectedStudent(foundStudent);
                    }
                } else {
                    // Clear selection when params are empty (back navigation to cleared state)
                    setSelectedStudent(null);
                }
            } catch (error) {
                console.error('Failed to load students:', error);
            } finally {
                setLoading(false);
            }
        }
        loadStudents();
    }, [studentFromParams, currentProfile]);

    // Filter students based on search (by ID only)
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const query = searchQuery.toLowerCase();
        return students.filter(student =>
            student.student_id.toLowerCase().includes(query)
        );
    }, [students, searchQuery]);

    // Handle student selection - save to navigation params
    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setSearchQuery('');
        setIsDropdownOpen(false);
        // Save selection to navigation state so it persists on back navigation
        navigateTo('student', { studentId: student.student_id });
    };

    // Handle clearing selection
    const handleClearSelection = () => {
        setSelectedStudent(null);
        setSearchQuery('');
        // Clear from navigation params too
        navigateTo('student', {});
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
            {/* Student Selector (only show when not navigated with student params) */}
            {!studentFromParams && (
                <div className="flex items-center gap-4">
                    <div className="relative w-72">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nord-polar-4 dark:text-nord-snow-1/50" />
                            <input
                                type="text"
                                value={selectedStudent ? selectedStudent.student_id : searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSelectedStudent(null);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                placeholder="Search by student ID..."
                                className="input pl-10 pr-10 w-full"
                            />
                            {(selectedStudent || searchQuery) && (
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
                            {isDropdownOpen && !selectedStudent && (
                                <motion.div
                                    variants={dropdownVariants}
                                    initial="initial"
                                    animate="enter"
                                    exit="exit"
                                    className="absolute z-10 w-full mt-1 bg-white dark:bg-nord-polar-2 rounded-lg shadow-lg border border-nord-snow-1 dark:border-nord-polar-3 max-h-60 overflow-y-auto"
                                >
                                    {filteredStudents.length === 0 ? (
                                        <div className="p-3 text-sm text-nord-polar-4 dark:text-nord-snow-1/60">
                                            No students found
                                        </div>
                                    ) : (
                                        <motion.div variants={staggerContainer} initial="initial" animate="enter">
                                            {filteredStudents.slice(0, 10).map(student => (
                                                <motion.button
                                                    key={student.student_id}
                                                    variants={staggerItem}
                                                    whileHover={{ backgroundColor: 'rgba(136, 192, 208, 0.1)', x: 4 }}
                                                    onClick={() => handleSelectStudent(student)}
                                                    className="w-full text-left px-4 py-3 border-b border-nord-snow-1/50 dark:border-nord-polar-3/50 last:border-b-0"
                                                >
                                                    <div className="font-medium text-nord-polar-1 dark:text-nord-snow-2">
                                                        <HighlightedText text={student.student_id} query={searchQuery} />
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                    {filteredStudents.length > 10 && (
                                        <div className="px-4 py-2 text-xs text-nord-polar-4 dark:text-nord-snow-1/50 bg-nord-snow-1/50 dark:bg-nord-polar-3/50">
                                            Showing 10 of {filteredStudents.length} results
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Selected Student Info */}
                    <AnimatePresence>
                        {selectedStudent && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-2 px-3 py-2 bg-nord-frost-3/10 dark:bg-nord-frost-3/20 rounded-lg border border-nord-frost-3/30"
                            >
                                <User className="w-4 h-4 text-nord-frost-4 dark:text-nord-frost-2" />
                                <span className="text-sm font-medium text-nord-frost-4 dark:text-nord-frost-2">
                                    {selectedStudent.student_id}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Selected student badge when navigated from course */}
            {studentFromParams && selectedStudent && (
                <div className="flex items-center gap-2 px-3 py-2 bg-nord-frost-3/10 dark:bg-nord-frost-3/20 rounded-lg border border-nord-frost-3/30 w-fit">
                    <User className="w-4 h-4 text-nord-frost-4 dark:text-nord-frost-2" />
                    <span className="text-sm font-medium text-nord-frost-4 dark:text-nord-frost-2">
                        {selectedStudent.student_id}
                    </span>
                </div>
            )}

            {/* Calendar Grid or Prompt */}
            {selectedStudent ? (
                <CalendarGrid filterByStudent={selectedStudent.student_id} />
            ) : (
                <div className="text-center py-16 text-nord-polar-4 dark:text-nord-snow-1/60">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a student to view their exam schedule</p>
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
