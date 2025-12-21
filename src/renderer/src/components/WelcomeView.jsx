import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../contexts/NavigationContext';
import { Calendar, Plus, Clock, Folder, ChevronRight, X, Upload, Check, Loader2, Trash2 } from 'lucide-react';
import {
    heroContainerVariants,
    heroItemVariants,
    staggerContainer,
    cardVariants,
    cardHover,
    cardTap,
    primaryButtonHover,
    buttonTap,
    modalOverlayVariants,
    modalContentVariants,
    staggerItem,
} from '../lib/animations';

/**
 * WelcomeView Component
 * 
 * Landing page shown when no project is loaded.
 * Features:
 * - App branding
 * - Recent projects as cards
 * - New Schedule dialog
 */

export default function WelcomeView() {
    const { openSchedule } = useNavigation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [recentProjects, setRecentProjects] = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(true);

    // Fetch recent projects on mount
    useEffect(() => {
        async function loadRecentProjects() {
            try {
                console.log('[WelcomeView] Fetching recent projects...');
                const projects = await window.api.getRecentProjects();
                console.log('[WelcomeView] Received projects:', projects);
                setRecentProjects(projects);
            } catch (error) {
                console.error('Failed to load recent projects:', error);
            } finally {
                setLoadingProjects(false);
            }
        }
        loadRecentProjects();
    }, []);

    // Handle opening a recent project
    const handleOpenProject = (project) => {
        // Set the current profile and navigate to dashboard
        openSchedule(project.profileName);
    };

    // Handle deleting a project
    const handleDeleteProject = async (e, project) => {
        e.stopPropagation(); // Don't trigger the card click

        if (confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) {
            try {
                await window.api.deleteProfile(project.profileName);
                // Refresh the projects list
                const projects = await window.api.getRecentProjects();
                setRecentProjects(projects);
            } catch (error) {
                console.error('Failed to delete project:', error);
            }
        }
    };

    console.log('[WelcomeView] Render - loadingProjects:', loadingProjects, 'recentProjects:', recentProjects);

    return (
        <div className="min-h-full flex flex-col">
            {/* Hero Section */}
            <motion.div
                variants={heroContainerVariants}
                initial="initial"
                animate="enter"
                className="text-center py-12"
            >
                <motion.div
                    variants={heroItemVariants}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-nord-frost-3 to-nord-frost-4 dark:from-nord-frost-2 dark:to-nord-frost-3 mb-4 shadow-lg"
                >
                    <Calendar className="w-8 h-8 text-white" />
                </motion.div>
                <motion.h1
                    variants={heroItemVariants}
                    className="font-heading text-3xl font-semibold text-nord-polar-1 dark:text-nord-snow-2 mb-2"
                >
                    TimeScroll
                </motion.h1>
                <motion.p
                    variants={heroItemVariants}
                    className="text-nord-polar-4 dark:text-nord-snow-1/70"
                >
                    Examination Schedule Automation
                </motion.p>
            </motion.div>

            {/* New Schedule Button */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex justify-center mb-8"
            >
                <motion.button
                    onClick={() => setIsDialogOpen(true)}
                    whileHover={primaryButtonHover}
                    whileTap={buttonTap}
                    className="flex items-center gap-3 px-6 py-3 bg-nord-frost-3 hover:bg-nord-frost-4 
                               dark:bg-nord-frost-2 dark:hover:bg-nord-frost-1
                               text-white dark:text-nord-polar-1 font-medium rounded-xl
                               shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Create New Schedule
                </motion.button>
            </motion.div>

            {/* Recent Projects Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex-1 pb-8"
            >
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-lg font-medium text-nord-polar-2 dark:text-nord-snow-2 flex items-center gap-2 mb-4"
                >
                    <Clock className="w-5 h-5 text-nord-frost-4 dark:text-nord-frost-2" />
                    Recent Projects
                </motion.h2>

                {loadingProjects ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card text-center py-12 text-nord-polar-4 dark:text-nord-snow-1/60"
                    >
                        <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-nord-frost-3" />
                        <p>Loading projects...</p>
                    </motion.div>
                ) : recentProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentProjects.map((project, index) => (
                            <div
                                key={project.id}
                                className="card text-left group relative"
                            >
                                <button
                                    onClick={() => handleOpenProject(project)}
                                    className="w-full text-left"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-nord-frost-3/15 dark:bg-nord-frost-3/25 
                                                        flex items-center justify-center flex-shrink-0"
                                        >
                                            <Calendar className="w-6 h-6 text-nord-frost-4 dark:text-nord-frost-2" />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-8">
                                            <p className="font-medium text-nord-polar-2 dark:text-nord-snow-2 
                                                          group-hover:text-nord-frost-4 dark:group-hover:text-nord-frost-2
                                                          truncate">
                                                {project.name}
                                            </p>
                                            <p className="text-sm text-nord-polar-4 dark:text-nord-snow-1/60 mt-1">
                                                {formatDate(project.createdAt)}
                                            </p>
                                        </div>
                                        <div className="group-hover:opacity-0 transition-opacity duration-200">
                                            <ChevronRight className="w-5 h-5 text-nord-polar-4/50 dark:text-nord-snow-1/30 
                                                                          flex-shrink-0 mt-1" />
                                        </div>
                                    </div>
                                </button>
                                {/* Delete button */}
                                <button
                                    onClick={(e) => handleDeleteProject(e, project)}
                                    className="absolute top-3 right-3 p-2 rounded-lg opacity-0 group-hover:opacity-100
                                               text-nord-polar-4 hover:text-nord-aurora-0 
                                               dark:text-nord-snow-1/50 dark:hover:text-nord-aurora-0
                                               hover:bg-nord-aurora-0/10 dark:hover:bg-nord-aurora-0/20
                                               transition-all duration-200"
                                    title="Delete project"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="card text-center py-12 text-nord-polar-4 dark:text-nord-snow-1/60"
                    >
                        <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No recent projects</p>
                        <p className="text-sm mt-1">Create a new schedule to get started</p>
                    </motion.div>
                )}
            </motion.div>

            {/* New Schedule Dialog */}
            <AnimatePresence>
                {isDialogOpen && (
                    <NewScheduleDialog onClose={() => setIsDialogOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}

// New Schedule Dialog Component
function NewScheduleDialog({ onClose }) {
    const { openSchedule } = useNavigation();
    const [scheduleName, setScheduleName] = useState('');
    const [classroomFilePath, setClassroomFilePath] = useState(null);
    const [enrollmentFilePath, setEnrollmentFilePath] = useState(null);
    const [examDuration, setExamDuration] = useState('');
    const [minScheduleDays, setMinScheduleDays] = useState('');
    const [maxScheduleDays, setMaxScheduleDays] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Use Electron dialog to select files
    const handleSelectClassroomFile = async () => {
        const filePath = await window.api.selectFile();
        if (filePath) {
            setClassroomFilePath(filePath);
        }
    };

    const handleSelectEnrollmentFile = async () => {
        const filePath = await window.api.selectFile();
        if (filePath) {
            setEnrollmentFilePath(filePath);
        }
    };

    const handleCreate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Generate the profile name first
            const profileName = scheduleName && scheduleName.trim()
                ? scheduleName.trim()
                : `Schedule_${new Date().toISOString().split('T')[0]}_${Date.now()}`;

            // Import data from CSV files (scoped to this profile)
            const importResult = await window.api.importData({
                profileName,
                classroomsPath: classroomFilePath,
                enrollmentsPath: enrollmentFilePath
            });

            if (!importResult.success) {
                throw new Error(importResult.error || 'Failed to import data');
            }

            // Generate the schedule with settings
            const scheduleResult = await window.api.generateSchedule({
                scheduleName: profileName,
                settings: {
                    exam_duration: parseInt(examDuration) || 90,
                    min_exam_days: parseInt(minScheduleDays) || 5,
                    max_exam_days: parseInt(maxScheduleDays) || 30,
                    day_start_time: startTime || '09:00',
                    day_end_time: endTime || '18:00'
                }
            });

            if (!scheduleResult.success) {
                throw new Error(scheduleResult.error || 'Failed to generate schedule');
            }

            console.log('Schedule created successfully:', scheduleResult);

            // Close dialog and open the new schedule
            onClose();
            openSchedule(scheduleResult.profileName);

        } catch (err) {
            console.error('Schedule creation failed:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Regex for HH:MM format (24-hour)
    const isValidTime = (timeStr) => {
        const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return regex.test(timeStr);
    };

    const handleTimeChange = (e, setter) => {
        let value = e.target.value;
        // Remove any non-digit characters
        const digits = value.replace(/\D/g, '');

        // Prevent more than 4 digits
        if (digits.length > 4) return;

        // Check hour validity
        if (digits.length >= 2) {
            const hours = parseInt(digits.substring(0, 2));
            if (hours > 23) return;
        }

        // Check minute validity
        if (digits.length === 4) {
            const minutes = parseInt(digits.substring(2, 4));
            if (minutes > 59) return;
        }

        // Format with colon
        let formattedValue = digits;
        if (digits.length > 2) {
            formattedValue = `${digits.substring(0, 2)}:${digits.substring(2)}`;
        }

        setter(formattedValue);
    };

    const isFormValid =
        scheduleName.trim() &&
        classroomFilePath &&
        enrollmentFilePath &&
        examDuration &&
        minScheduleDays &&
        maxScheduleDays &&
        isValidTime(startTime) &&
        isValidTime(endTime) &&
        // Ensure start time is before end time
        (parseInt(startTime.replace(':', '')) < parseInt(endTime.replace(':', '')));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            {/* Backdrop */}
            <motion.div
                variants={modalOverlayVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                className="absolute inset-0 bg-nord-polar-1/50 dark:bg-black/60"
                style={{ backdropFilter: 'blur(8px)' }}
                onClick={onClose}
            />

            {/* Dialog */}
            <motion.div
                variants={modalContentVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                className="relative bg-white dark:bg-nord-polar-2 rounded-2xl shadow-2xl 
                            w-full max-w-lg p-6 space-y-6 max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between"
                >
                    <h2 className="text-xl font-heading font-semibold text-nord-polar-1 dark:text-nord-snow-2">
                        New Schedule
                    </h2>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 
                                   text-nord-polar-4 dark:text-nord-snow-1/70"
                    >
                        <X className="w-5 h-5" />
                    </motion.button>
                </motion.div>

                {/* Form */}
                <div className="space-y-5">
                    {/* Schedule Name */}
                    <div>
                        <label className="block text-sm font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-2">
                            Schedule Name
                        </label>
                        <input
                            type="text"
                            value={scheduleName}
                            onChange={(e) => setScheduleName(e.target.value)}
                            className="input"
                        />
                    </div>

                    {/* Classroom Data CSV */}
                    <div>
                        <label className="block text-sm font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-2">
                            Classroom Data (CSV)
                        </label>
                        <p className="text-xs text-nord-polar-4 dark:text-nord-snow-1/50 mb-2">
                            Columns: Room Name, Capacity
                        </p>
                        <button
                            onClick={handleSelectClassroomFile}
                            disabled={isLoading}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed
                                transition-colors text-left
                                ${classroomFilePath
                                    ? 'border-nord-aurora-green bg-nord-aurora-green/10 dark:bg-nord-aurora-green/20'
                                    : 'border-nord-snow-1 dark:border-nord-polar-3 hover:border-nord-frost-3/50'}`}
                        >
                            {classroomFilePath ? (
                                <>
                                    <Check className="w-5 h-5 text-nord-aurora-green" />
                                    <span className="text-nord-polar-2 dark:text-nord-snow-2 truncate">
                                        {classroomFilePath.split('/').pop()}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5 text-nord-polar-4 dark:text-nord-snow-1/50" />
                                    <span className="text-nord-polar-4 dark:text-nord-snow-1/60">
                                        Select classroom CSV...
                                    </span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Enrollment Data CSV */}
                    <div>
                        <label className="block text-sm font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-2">
                            Enrollment Data (CSV)
                        </label>
                        <p className="text-xs text-nord-polar-4 dark:text-nord-snow-1/50 mb-2">
                            Columns: Course Code, Student ID
                        </p>
                        <button
                            onClick={handleSelectEnrollmentFile}
                            disabled={isLoading}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed
                                transition-colors text-left
                                ${enrollmentFilePath
                                    ? 'border-nord-aurora-green bg-nord-aurora-green/10 dark:bg-nord-aurora-green/20'
                                    : 'border-nord-snow-1 dark:border-nord-polar-3 hover:border-nord-frost-3/50'}`}
                        >
                            {enrollmentFilePath ? (
                                <>
                                    <Check className="w-5 h-5 text-nord-aurora-green" />
                                    <span className="text-nord-polar-2 dark:text-nord-snow-2 truncate">
                                        {enrollmentFilePath.split('/').pop()}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5 text-nord-polar-4 dark:text-nord-snow-1/50" />
                                    <span className="text-nord-polar-4 dark:text-nord-snow-1/60">
                                        Select enrollment CSV...
                                    </span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Exam Duration */}
                    <div>
                        <label className="block text-sm font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-2">
                            Exam Duration (min)
                        </label>
                        <input
                            type="number"
                            value={examDuration}
                            onChange={(e) => setExamDuration(e.target.value === '' ? '' : (parseInt(e.target.value) || 0))}
                            min={15}
                            max={300}
                            className="input"
                        />
                    </div>

                    {/* Min & Max Schedule Days */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-2">
                                Shortest Schedule (Days)
                            </label>
                            <input
                                type="number"
                                value={minScheduleDays}
                                onChange={(e) => setMinScheduleDays(e.target.value === '' ? '' : (parseInt(e.target.value) || 0))}
                                min={1}
                                max={maxScheduleDays || 60}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-2">
                                Longest Schedule (Days)
                            </label>
                            <input
                                type="number"
                                value={maxScheduleDays}
                                onChange={(e) => setMaxScheduleDays(e.target.value === '' ? '' : (parseInt(e.target.value) || 0))}
                                min={minScheduleDays || 1}
                                max={60}
                                className="input"
                            />
                        </div>
                    </div>

                    {/* Start & End Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-2">
                                Start Time <span className="text-xs text-nord-polar-4 font-normal ml-1">(HH:MM)</span>
                            </label>
                            <input
                                type="text"
                                value={startTime}
                                onChange={(e) => handleTimeChange(e, setStartTime)}
                                className={`input ${!isValidTime(startTime) && startTime ? 'border-red-500 focus:border-red-500' : ''}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-2">
                                End Time <span className="text-xs text-nord-polar-4 font-normal ml-1">(HH:MM)</span>
                            </label>
                            <input
                                type="text"
                                value={endTime}
                                onChange={(e) => handleTimeChange(e, setEndTime)}
                                className={`input ${!isValidTime(endTime) && endTime ? 'border-red-500 focus:border-red-500' : ''}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3 pt-2"
                >
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg text-nord-polar-3 dark:text-nord-snow-1
                                       hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 disabled:opacity-50"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={isFormValid && !isLoading ? primaryButtonHover : {}}
                            whileTap={isFormValid && !isLoading ? buttonTap : {}}
                            onClick={handleCreate}
                            disabled={!isFormValid || isLoading}
                            className={`px-5 py-2 rounded-lg font-medium flex items-center gap-2
                                ${isFormValid && !isLoading
                                    ? 'bg-nord-frost-3 hover:bg-nord-frost-4 dark:bg-nord-frost-2 dark:hover:bg-nord-frost-1 text-white dark:text-nord-polar-1'
                                    : 'bg-nord-snow-1 dark:bg-nord-polar-3 text-nord-polar-4/50 dark:text-nord-snow-1/30 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Schedule'
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

// Helper to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
