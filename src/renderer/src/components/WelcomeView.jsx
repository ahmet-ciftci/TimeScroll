import { useState, useRef } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

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
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-nord-frost-3 to-nord-frost-4 dark:from-nord-frost-2 dark:to-nord-frost-3 mb-4 shadow-lg">
                    <CalendarIcon className="w-8 h-8 text-white" />
                </div>
                <h1 className="font-heading text-3xl font-semibold text-nord-polar-1 dark:text-nord-snow-2 mb-2">
                    TimeScroll
                </h1>
                <p className="text-nord-polar-4 dark:text-nord-snow-1/70">
                    Examination Schedule Automation
                </p>
            </div>

            {/* New Schedule Button */}
            <div className="flex justify-center mb-8">
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-3 px-6 py-3 bg-nord-frost-3 hover:bg-nord-frost-4 
                               dark:bg-nord-frost-2 dark:hover:bg-nord-frost-1
                               text-white dark:text-nord-polar-1 font-medium rounded-xl
                               shadow-lg hover:shadow-xl transition-all"
                >
                    <PlusIcon className="w-5 h-5" />
                    Create New Schedule
                </button>
            </div>

            {/* Recent Projects Section */}
            <div className="flex-1 pb-8">
                <h2 className="text-lg font-medium text-nord-polar-2 dark:text-nord-snow-2 flex items-center gap-2 mb-4">
                    <ClockIcon className="w-5 h-5 text-nord-frost-4 dark:text-nord-frost-2" />
                    Recent Projects
                </h2>

                {recentProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentProjects.map(project => (
                            <button
                                key={project.id}
                                onClick={() => navigateToRoot('dashboard')}
                                className="card hover:bg-nord-snow-0 dark:hover:bg-nord-polar-3 
                                           transition-all hover:shadow-lg text-left group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-nord-frost-3/15 dark:bg-nord-frost-3/25 
                                                    flex items-center justify-center flex-shrink-0">
                                        <FolderIcon className="w-6 h-6 text-nord-frost-4 dark:text-nord-frost-2" />
                                    </div>
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
                                    <ChevronRightIcon className="w-5 h-5 text-nord-polar-4/50 dark:text-nord-snow-1/30 
                                                                  group-hover:text-nord-frost-4 dark:group-hover:text-nord-frost-2
                                                                  flex-shrink-0 mt-1" />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12 text-nord-polar-4 dark:text-nord-snow-1/60">
                        <FolderIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No recent projects</p>
                        <p className="text-sm mt-1">Create a new schedule to get started</p>
                    </div>
                )}
            </div>

            {/* New Schedule Dialog */}
            {isDialogOpen && (
                <NewScheduleDialog onClose={() => setIsDialogOpen(false)} />
            )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-nord-polar-1/50 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-white dark:bg-nord-polar-2 rounded-2xl shadow-2xl 
                            w-full max-w-lg p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-heading font-semibold text-nord-polar-1 dark:text-nord-snow-2">
                        New Schedule
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 
                                   text-nord-polar-4 dark:text-nord-snow-1/70 transition-colors"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

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
                                    <CheckIcon className="w-5 h-5 text-nord-aurora-green" />
                                    <span className="text-nord-polar-2 dark:text-nord-snow-2 truncate">
                                        {classroomFile.name}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <UploadIcon className="w-5 h-5 text-nord-polar-4 dark:text-nord-snow-1/50" />
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
                                    <CheckIcon className="w-5 h-5 text-nord-aurora-green" />
                                    <span className="text-nord-polar-2 dark:text-nord-snow-2 truncate">
                                        {enrollmentFile.name}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <UploadIcon className="w-5 h-5 text-nord-polar-4 dark:text-nord-snow-1/50" />
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
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-nord-polar-3 dark:text-nord-snow-1
                                   hover:bg-nord-snow-1 dark:hover:bg-nord-polar-3 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!isFormValid}
                        className={`px-5 py-2 rounded-lg font-medium transition-colors
                            ${isFormValid
                                ? 'bg-nord-frost-3 hover:bg-nord-frost-4 dark:bg-nord-frost-2 dark:hover:bg-nord-frost-1 text-white dark:text-nord-polar-1'
                                : 'bg-nord-snow-1 dark:bg-nord-polar-3 text-nord-polar-4/50 dark:text-nord-snow-1/30 cursor-not-allowed'
                            }`}
                    >
                        Create Schedule
                    </button>
                </div>
            </div>
        </div>
    );
}

// Helper to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Icons
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

function PlusIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function ClockIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function FolderIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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

function XIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

function UploadIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    );
}

function CheckIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
