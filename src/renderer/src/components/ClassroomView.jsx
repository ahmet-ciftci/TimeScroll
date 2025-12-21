import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getClassrooms } from '../services/dataService';
import { useNavigation } from '../contexts/NavigationContext';
import { Search, X, MapPin } from 'lucide-react';
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
 * ClassroomView Component
 * 
 * Shows a searchable room selector and filtered calendar grid.
 * Select a classroom to see only exams scheduled in that room.
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

export default function ClassroomView() {
    const { viewParams, navigateTo, currentProfile } = useNavigation();
    const [classrooms, setClassrooms] = useState([]);
    // Initialize from viewParams if available (restores state on back navigation)
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load classrooms on mount and sync with navigation params
    useEffect(() => {
        async function loadClassrooms() {
            setLoading(true);
            try {
                const data = await getClassrooms(currentProfile);
                setClassrooms(data);

                // Restore selected room from viewParams after classrooms load
                if (viewParams.classroomId) {
                    const room = data.find(r => r.classroom_id === viewParams.classroomId);
                    if (room) {
                        setSelectedRoom(room);
                    }
                } else {
                    // Clear selection when params are empty (back navigation to cleared state)
                    setSelectedRoom(null);
                }
            } catch (error) {
                console.error('Failed to load classrooms:', error);
            } finally {
                setLoading(false);
            }
        }
        loadClassrooms();
    }, [viewParams.classroomId, currentProfile]);

    // Filter classrooms based on search
    const filteredClassrooms = useMemo(() => {
        if (!searchQuery.trim()) return classrooms;
        const query = searchQuery.toLowerCase();
        return classrooms.filter(room =>
            room.classroom_id.toLowerCase().includes(query)
        );
    }, [classrooms, searchQuery]);

    // Handle room selection - save to navigation params
    const handleSelectRoom = (room) => {
        setSelectedRoom(room);
        setSearchQuery('');
        setIsDropdownOpen(false);
        // Save selection to navigation state so it persists on back navigation
        navigateTo('classroom', { classroomId: room.classroom_id });
    };

    // Handle clearing selection
    const handleClearSelection = () => {
        setSelectedRoom(null);
        setSearchQuery('');
        // Clear from navigation params too
        navigateTo('classroom', {});
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
            {/* Room Selector */}
            <div className="flex items-center gap-4">
                <div className="relative w-72">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nord-polar-4 dark:text-nord-snow-1/50" />
                        <input
                            type="text"
                            value={selectedRoom ? selectedRoom.classroom_id : searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setSelectedRoom(null);
                                setIsDropdownOpen(true);
                            }}
                            onFocus={() => setIsDropdownOpen(true)}
                            placeholder="Search classroom..."
                            className="input pl-10 pr-10 w-full"
                        />
                        {(selectedRoom || searchQuery) && (
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
                        {isDropdownOpen && !selectedRoom && (
                            <motion.div
                                variants={dropdownVariants}
                                initial="initial"
                                animate="enter"
                                exit="exit"
                                className="absolute z-10 w-full mt-1 bg-white dark:bg-nord-polar-2 rounded-lg shadow-lg border border-nord-snow-1 dark:border-nord-polar-3 max-h-60 overflow-y-auto"
                            >
                                {filteredClassrooms.length === 0 ? (
                                    <div className="p-3 text-sm text-nord-polar-4 dark:text-nord-snow-1/60">
                                        No classrooms found
                                    </div>
                                ) : (
                                    <motion.div variants={staggerContainer} initial="initial" animate="enter">
                                        {filteredClassrooms.map((room, index) => (
                                            <motion.button
                                                key={room.classroom_id}
                                                variants={staggerItem}
                                                whileHover={{ backgroundColor: 'rgba(136, 192, 208, 0.1)', x: 4 }}
                                                onClick={() => handleSelectRoom(room)}
                                                className="w-full text-left px-4 py-3 border-b border-nord-snow-1/50 dark:border-nord-polar-3/50 last:border-b-0"
                                            >
                                                <div className="font-medium text-nord-polar-1 dark:text-nord-snow-2">
                                                    <HighlightedText text={room.classroom_id} query={searchQuery} />
                                                </div>
                                                <div className="text-xs text-nord-polar-4 dark:text-nord-snow-1/60">
                                                    Capacity: {room.capacity} seats
                                                </div>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Selected Room Info */}
                <AnimatePresence>
                    {selectedRoom && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: -20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex items-center gap-2 px-3 py-2 bg-nord-frost-3/10 dark:bg-nord-frost-3/20 rounded-lg border border-nord-frost-3/30"
                        >
                            <MapPin className="w-4 h-4 text-nord-frost-4 dark:text-nord-frost-2" />
                            <span className="text-sm font-medium text-nord-frost-4 dark:text-nord-frost-2">
                                {selectedRoom.classroom_id}
                            </span>
                            <span className="text-xs text-nord-polar-4 dark:text-nord-snow-1/60">
                                ({selectedRoom.capacity} seats)
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Calendar Grid or Prompt */}
            {selectedRoom ? (
                <CalendarGrid filterByClassroom={selectedRoom.classroom_id} />
            ) : (
                <div className="text-center py-16 text-nord-polar-4 dark:text-nord-snow-1/60">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a classroom to view its exam schedule</p>
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
