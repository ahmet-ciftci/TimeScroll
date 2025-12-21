import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../contexts/NavigationContext';
import { Calendar, Plus, Clock, Folder, ChevronRight, X, Upload, Check } from 'lucide-react';
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
    const { navigateToRoot } = useNavigation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Mock recent projects (will come from electron-store later)
    const recentProjects = [
        { id: 1, name: 'Fall 2024 Finals', createdAt: '2024-12-18' },
        { id: 2, name: 'Midterm Exams', createdAt: '2024-12-10' },
        { id: 3, name: 'Spring 2024', createdAt: '2024-06-15' },
    ];

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

                {recentProjects.length > 0 ? (
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="enter"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {recentProjects.map((project, index) => (
                            <motion.button
                                key={project.id}
                                variants={cardVariants}
                                whileHover={cardHover}
                                whileTap={cardTap}
                                onClick={() => navigateToRoot('dashboard')}
                                className="card text-left group"
                            >
                                <div className="flex items-start gap-4">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.8 + index * 0.1 }}
                                        className="w-12 h-12 rounded-xl bg-nord-frost-3/15 dark:bg-nord-frost-3/25 
                                                    flex items-center justify-center flex-shrink-0"
                                    >
                                        <Folder className="w-6 h-6 text-nord-frost-4 dark:text-nord-frost-2" />
                                    </motion.div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-nord-polar-2 dark:text-nord-snow-2 
                                                      group-hover:text-nord-frost-4 dark:group-hover:text-nord-frost-2
                                                      truncate">
                                            {project.name}
                                        </p>
                                        <p className="text-sm text-nord-polar-4 dark:text-nord-snow-1/60 mt-1">
                                            {formatDate(project.createdAt)}
                                        </p>
                                    </div>
                                    <motion.div
                                        initial={{ x: 0 }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <ChevronRight className="w-5 h-5 text-nord-polar-4/50 dark:text-nord-snow-1/30 
                                                                      group-hover:text-nord-frost-4 dark:group-hover:text-nord-frost-2
                                                                      flex-shrink-0 mt-1" />
                                    </motion.div>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
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
    const [scheduleName, setScheduleName] = useState('');
    const [classroomFile, setClassroomFile] = useState(null);
    const [enrollmentFile, setEnrollmentFile] = useState(null);
    const [examDuration, setExamDuration] = useState(90);
    const [maxExamPeriod, setMaxExamPeriod] = useState(14);

    const classroomInputRef = useRef(null);
    const enrollmentInputRef = useRef(null);

    const handleCreate = () => {
        // TODO: Implement schedule creation
        console.log('Creating schedule:', {
            scheduleName,
            classroomFile,
            enrollmentFile,
            examDuration,
            maxExamPeriod
        });
        onClose();
    };

    const isFormValid = scheduleName.trim() && classroomFile && enrollmentFile;

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
                            w-full max-w-lg p-6 space-y-6"
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
                            placeholder="e.g., Fall 2024 Finals"
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
                        <input
                            ref={classroomInputRef}
                            type="file"
                            accept=".csv"
                            onChange={(e) => setClassroomFile(e.target.files[0] || null)}
                            className="hidden"
                        />
                        <button
                            onClick={() => classroomInputRef.current?.click()}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed
                                transition-colors text-left
                                ${classroomFile
                                    ? 'border-nord-aurora-green bg-nord-aurora-green/10 dark:bg-nord-aurora-green/20'
                                    : 'border-nord-snow-1 dark:border-nord-polar-3 hover:border-nord-frost-3/50'}`}
                        >
                            {classroomFile ? (
                                <>
                                    <Check className="w-5 h-5 text-nord-aurora-green" />
                                    <span className="text-nord-polar-2 dark:text-nord-snow-2 truncate">
                                        {classroomFile.name}
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
                        <input
                            ref={enrollmentInputRef}
                            type="file"
                            accept=".csv"
                            onChange={(e) => setEnrollmentFile(e.target.files[0] || null)}
                            className="hidden"
                        />
                        <button
                            onClick={() => enrollmentInputRef.current?.click()}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed
                                transition-colors text-left
                                ${enrollmentFile
                                    ? 'border-nord-aurora-green bg-nord-aurora-green/10 dark:bg-nord-aurora-green/20'
                                    : 'border-nord-snow-1 dark:border-nord-polar-3 hover:border-nord-frost-3/50'}`}
                        >
                            {enrollmentFile ? (
                                <>
                                    <Check className="w-5 h-5 text-nord-aurora-green" />
                                    <span className="text-nord-polar-2 dark:text-nord-snow-2 truncate">
                                        {enrollmentFile.name}
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

                    {/* Exam Duration & Max Period Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-2">
                                Exam Duration (min)
                            </label>
                            <input
                                type="number"
                                value={examDuration}
                                onChange={(e) => setExamDuration(parseInt(e.target.value) || 0)}
                                min={15}
                                max={300}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-nord-polar-2 dark:text-nord-snow-2 mb-2">
                                Max Exam Period (days)
                            </label>
                            <input
                                type="number"
                                value={maxExamPeriod}
                                onChange={(e) => setMaxExamPeriod(parseInt(e.target.value) || 0)}
                                min={1}
                                max={60}
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-end gap-3 pt-2"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-nord-polar-3 dark:text-nord-snow-1
                                   hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        whileHover={isFormValid ? primaryButtonHover : {}}
                        whileTap={isFormValid ? buttonTap : {}}
                        onClick={handleCreate}
                        disabled={!isFormValid}
                        className={`px-5 py-2 rounded-lg font-medium
                            ${isFormValid
                                ? 'bg-nord-frost-3 hover:bg-nord-frost-4 dark:bg-nord-frost-2 dark:hover:bg-nord-frost-1 text-white dark:text-nord-polar-1'
                                : 'bg-nord-snow-1 dark:bg-nord-polar-3 text-nord-polar-4/50 dark:text-nord-snow-1/30 cursor-not-allowed'
                            }`}
                    >
                        Create Schedule
                    </motion.button>
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
