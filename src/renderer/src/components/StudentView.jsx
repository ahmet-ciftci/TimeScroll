import { useState, useEffect, useMemo } from 'react';
import { getStudents } from '../services/dataService';
import { useNavigation } from '../contexts/NavigationContext';
import CalendarGrid from './CalendarGrid';
import Spinner from './Spinner';

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
    const { viewParams } = useNavigation();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check if we have a student from navigation params
    const studentFromParams = viewParams.studentId;

    // Load students on mount
    useEffect(() => {
        async function loadStudents() {
            setLoading(true);
            try {
                const data = await getStudents();
                setStudents(data);

                // If we have a studentId from navigation, pre-select that student
                if (studentFromParams) {
                    const foundStudent = data.find(s => s.student_id === studentFromParams);
                    if (foundStudent) {
                        setSelectedStudent(foundStudent);
                    }
                }
            } catch (error) {
                console.error('Failed to load students:', error);
            } finally {
                setLoading(false);
            }
        }
        loadStudents();
    }, [studentFromParams]);

    // Filter students based on search (by ID only)
    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const query = searchQuery.toLowerCase();
        return students.filter(student =>
            student.student_id.toLowerCase().includes(query)
        );
    }, [students, searchQuery]);

    // Handle student selection
    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setSearchQuery('');
        setIsDropdownOpen(false);
    };

    // Handle clearing selection
    const handleClearSelection = () => {
        setSelectedStudent(null);
        setSearchQuery('');
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
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nord-polar-4 dark:text-nord-snow-1/50" />
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
                                    <XIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown */}
                        {isDropdownOpen && !selectedStudent && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-nord-polar-2 rounded-lg shadow-lg border border-nord-snow-1 dark:border-nord-polar-3 max-h-60 overflow-y-auto">
                                {filteredStudents.length === 0 ? (
                                    <div className="p-3 text-sm text-nord-polar-4 dark:text-nord-snow-1/60">
                                        No students found
                                    </div>
                                ) : (
                                    filteredStudents.slice(0, 10).map(student => (
                                        <button
                                            key={student.student_id}
                                            onClick={() => handleSelectStudent(student)}
                                            className="w-full text-left px-4 py-3 hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 transition-colors border-b border-nord-snow-1/50 dark:border-nord-polar-3/50 last:border-b-0"
                                        >
                                            <div className="font-medium text-nord-polar-1 dark:text-nord-snow-2">
                                                <HighlightedText text={student.student_id} query={searchQuery} />
                                            </div>
                                        </button>
                                    ))
                                )}
                                {filteredStudents.length > 10 && (
                                    <div className="px-4 py-2 text-xs text-nord-polar-4 dark:text-nord-snow-1/50 bg-nord-snow-1/50 dark:bg-nord-polar-3/50">
                                        Showing 10 of {filteredStudents.length} results
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected Student Info */}
                    {selectedStudent && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-nord-frost-3/10 dark:bg-nord-frost-3/20 rounded-lg border border-nord-frost-3/30">
                            <UserIcon className="w-4 h-4 text-nord-frost-4 dark:text-nord-frost-2" />
                            <span className="text-sm font-medium text-nord-frost-4 dark:text-nord-frost-2">
                                {selectedStudent.student_id}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Selected student badge when navigated from course */}
            {studentFromParams && selectedStudent && (
                <div className="flex items-center gap-2 px-3 py-2 bg-nord-frost-3/10 dark:bg-nord-frost-3/20 rounded-lg border border-nord-frost-3/30 w-fit">
                    <UserIcon className="w-4 h-4 text-nord-frost-4 dark:text-nord-frost-2" />
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
                    <UserIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
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

function UserIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}
