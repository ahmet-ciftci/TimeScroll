import { useState } from 'react';
import { useNavigation } from '../contexts/NavigationContext';

/**
 * WelcomeView Component
 * 
 * Landing page shown when no project is loaded.
 * Features:
 * - App branding
 * - Recent projects list
 * - CSV upload area
 * - Quick start actions
 */

export default function WelcomeView() {
    const { navigateToRoot } = useNavigation();
    const [isDragOver, setIsDragOver] = useState(false);

    // Mock recent projects (will come from electron-store later)
    const recentProjects = [
        { id: 1, name: 'Fall 2024 Finals', lastOpened: '2024-12-18' },
        { id: 2, name: 'Midterm Exams', lastOpened: '2024-12-10' },
        { id: 3, name: 'Spring 2024', lastOpened: '2024-06-15' },
    ];

    // Handle file drop
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        // TODO: Handle CSV file upload
        const files = Array.from(e.dataTransfer.files);
        console.log('Dropped files:', files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    // Handle file input
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        console.log('Selected files:', files);
        // TODO: Handle CSV file upload
    };

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

            {/* Main Content Grid */}
            <div className="flex-1 grid md:grid-cols-2 gap-6 pb-8">
                {/* Left Column - Upload Area */}
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-nord-polar-2 dark:text-nord-snow-2 flex items-center gap-2">
                        <UploadIcon className="w-5 h-5 text-nord-frost-4 dark:text-nord-frost-2" />
                        New Schedule
                    </h2>

                    {/* Drop Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`
                            relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                            ${isDragOver
                                ? 'border-nord-frost-3 bg-nord-frost-3/10 dark:bg-nord-frost-3/20'
                                : 'border-nord-snow-1 dark:border-nord-polar-3 hover:border-nord-frost-3/50 dark:hover:border-nord-frost-2/50'
                            }
                        `}
                    >
                        <input
                            type="file"
                            accept=".csv"
                            multiple
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="space-y-3">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-nord-snow-1 dark:bg-nord-polar-3">
                                <FileIcon className="w-6 h-6 text-nord-polar-4 dark:text-nord-snow-1/70" />
                            </div>
                            <div>
                                <p className="font-medium text-nord-polar-2 dark:text-nord-snow-2">
                                    Drop CSV files here
                                </p>
                                <p className="text-sm text-nord-polar-4 dark:text-nord-snow-1/60 mt-1">
                                    or click to browse
                                </p>
                            </div>
                            <p className="text-xs text-nord-polar-4/70 dark:text-nord-snow-1/40">
                                Supports: exams.csv, courses.csv, students.csv, classrooms.csv
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Recent Projects */}
                <div className="space-y-4">
                    <h2 className="text-lg font-medium text-nord-polar-2 dark:text-nord-snow-2 flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-nord-frost-4 dark:text-nord-frost-2" />
                        Recent Projects
                    </h2>

                    {recentProjects.length > 0 ? (
                        <div className="space-y-2">
                            {recentProjects.map(project => (
                                <button
                                    key={project.id}
                                    onClick={() => navigateToRoot('dashboard')}
                                    className="w-full card hover:bg-nord-snow-0 dark:hover:bg-nord-polar-2 transition-colors text-left group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-nord-frost-3/15 dark:bg-nord-frost-3/25 flex items-center justify-center">
                                                <FolderIcon className="w-5 h-5 text-nord-frost-4 dark:text-nord-frost-2" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-nord-polar-2 dark:text-nord-snow-2 group-hover:text-nord-frost-4 dark:group-hover:text-nord-frost-2">
                                                    {project.name}
                                                </p>
                                                <p className="text-xs text-nord-polar-4 dark:text-nord-snow-1/60">
                                                    Last opened {formatDate(project.lastOpened)}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRightIcon className="w-4 h-4 text-nord-polar-4/50 dark:text-nord-snow-1/30 group-hover:text-nord-frost-4 dark:group-hover:text-nord-frost-2" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center py-8 text-nord-polar-4 dark:text-nord-snow-1/60">
                            <FolderIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No recent projects</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Helper to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

function UploadIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    );
}

function FileIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
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

function PlayIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3" />
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
