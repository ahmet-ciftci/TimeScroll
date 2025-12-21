/**
 * IPC Handlers
 * 
 * Registers all IPC handlers that bridge the frontend (renderer) to backend services.
 * This file connects the preload API calls to the actual backend functionality.
 * All data operations are scoped by profile_name for complete schedule isolation.
 */

import { ipcMain, dialog, shell, app } from 'electron';
import path from 'path';
import DBManager from './database/DatabaseManager';
import CSVParser from './services/CSVParser';
import Scheduler from './services/Scheduler';

/**
 * Initialize all IPC handlers
 */
export function registerIpcHandlers() {
    console.log('[IPC] Registering IPC handlers...');

    // ==================== DIALOG HANDLERS ====================

    /**
     * Open file dialog for selecting CSV files
     */
    ipcMain.handle('dialog:openFile', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'CSV Files', extensions: ['csv'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        return result.canceled ? null : result.filePaths[0];
    });

    // ==================== DATA IMPORT HANDLERS ====================

    /**
     * Import data from CSV files (scoped to a profile)
     * @param {Object} args - { profileName, classroomsPath, enrollmentsPath }
     */
    ipcMain.handle('app:import-data', async (event, args) => {
        try {
            const { profileName, classroomsPath, enrollmentsPath } = args;

            if (!profileName) {
                return { success: false, error: 'Profile name is required' };
            }

            if (classroomsPath) {
                const classrooms = CSVParser.parseClassrooms(classroomsPath);
                DBManager.saveClassrooms(profileName, classrooms);
            }

            if (enrollmentsPath) {
                const enrollmentData = CSVParser.parseEnrollments(enrollmentsPath);
                DBManager.saveEnrollmentData(profileName, enrollmentData);
            }

            return { success: true };
        } catch (error) {
            console.error('[IPC] Import error:', error);
            return { success: false, error: error.message };
        }
    });

    // ==================== SCHEDULE GENERATION ====================

    /**
     * Generate exam schedule using the scheduling algorithm
     * @param {Object} args - { scheduleName, settings }
     */
    ipcMain.handle('app:generate-schedule', async (event, args) => {
        try {
            const { scheduleName, settings } = args;

            // Create the profile name
            const profileName = scheduleName && scheduleName.trim()
                ? scheduleName.trim()
                : `Schedule_${new Date().toISOString().split('T')[0]}_${Date.now()}`;

            // Create the profile with settings
            DBManager.createProfile(profileName, settings);

            // Get profile settings for scheduler
            const profileSettings = DBManager.getProfileSettings(profileName);
            const scheduler = new Scheduler(profileSettings);

            const { courses, students } = DBManager.getAllDataForScheduler(profileName);
            const classrooms = DBManager.getAllClassrooms(profileName);

            if (courses.length === 0) {
                return { success: false, error: 'No courses found. Please import enrollment data first.' };
            }

            if (classrooms.length === 0) {
                return { success: false, error: 'No classrooms found. Please import classroom data first.' };
            }

            const result = scheduler.generateSchedule(courses, students, classrooms);

            // Save the schedule
            DBManager.saveSchedule(profileName, result.slots);

            return {
                success: true,
                profileName,
                usedDays: result.usedDays,
                totalExams: result.slots.length
            };
        } catch (error) {
            console.error('[IPC] Schedule generation error:', error);
            return { success: false, error: error.message };
        }
    });

    // ==================== CLASSROOM HANDLERS ====================

    /**
     * Get all classrooms for a profile
     */
    ipcMain.handle('db:get-classrooms', async (event, profileName) => {
        try {
            const classrooms = DBManager.getAllClassrooms(profileName);
            return classrooms.map(c => ({
                classroom_id: c.roomName,
                capacity: c.capacity
            }));
        } catch (error) {
            console.error('[IPC] Error getting classrooms:', error);
            return [];
        }
    });

    /**
     * Get classroom by ID for a profile
     */
    ipcMain.handle('db:get-classroom-by-id', async (event, { profileName, classroomId }) => {
        try {
            const classrooms = DBManager.getAllClassrooms(profileName);
            const classroom = classrooms.find(c => c.roomName === classroomId);
            if (!classroom) return null;
            return {
                classroom_id: classroom.roomName,
                capacity: classroom.capacity
            };
        } catch (error) {
            console.error('[IPC] Error getting classroom:', error);
            return null;
        }
    });

    // ==================== STUDENT HANDLERS ====================

    /**
     * Get all students for a profile
     */
    ipcMain.handle('db:get-all-students', async (event, profileName) => {
        try {
            const students = DBManager.getAllStudents(profileName);
            return students.map(s => ({
                student_id: s.student_id
            }));
        } catch (error) {
            console.error('[IPC] Error getting students:', error);
            return [];
        }
    });

    /**
     * Get student by ID for a profile
     */
    ipcMain.handle('db:get-student-by-id', async (event, { profileName, studentId }) => {
        try {
            const students = DBManager.getAllStudents(profileName);
            const student = students.find(s => s.student_id === studentId);
            return student ? { student_id: student.student_id } : null;
        } catch (error) {
            console.error('[IPC] Error getting student:', error);
            return null;
        }
    });

    /**
     * Search students by ID for a profile
     */
    ipcMain.handle('db:search-students', async (event, { profileName, query }) => {
        try {
            const students = DBManager.getAllStudents(profileName);
            if (!query) return students.map(s => ({ student_id: s.student_id }));

            const lowerQuery = query.toLowerCase();
            return students
                .filter(s => s.student_id.toLowerCase().includes(lowerQuery))
                .map(s => ({ student_id: s.student_id }));
        } catch (error) {
            console.error('[IPC] Error searching students:', error);
            return [];
        }
    });

    /**
     * Get courses for a specific student in a profile
     */
    ipcMain.handle('db:get-student-courses', async (event, { profileName, studentId }) => {
        try {
            return DBManager.getStudentCourses(profileName, studentId);
        } catch (error) {
            console.error('[IPC] Error getting student courses:', error);
            return [];
        }
    });

    // ==================== COURSE HANDLERS ====================

    /**
     * Get all courses with enrollment data for a profile
     */
    ipcMain.handle('db:get-courses', async (event, profileName) => {
        try {
            const { courses, students } = DBManager.getAllDataForScheduler(profileName);

            return courses.map(course => {
                // Find all students enrolled in this course
                const enrolledStudents = students
                    .filter(s => s.enrolledCourses.includes(course.courseCode))
                    .map(s => s.studentId);

                return {
                    course_code: course.courseCode,
                    student_count: course.studentCount,
                    enrolled_students: enrolledStudents
                };
            });
        } catch (error) {
            console.error('[IPC] Error getting courses:', error);
            return [];
        }
    });

    /**
     * Get course by code for a profile
     */
    ipcMain.handle('db:get-course-by-code', async (event, { profileName, courseCode }) => {
        try {
            const { courses, students } = DBManager.getAllDataForScheduler(profileName);
            const course = courses.find(c => c.courseCode === courseCode);

            if (!course) return null;

            const enrolledStudents = students
                .filter(s => s.enrolledCourses.includes(courseCode))
                .map(s => s.studentId);

            return {
                course_code: course.courseCode,
                student_count: course.studentCount,
                enrolled_students: enrolledStudents
            };
        } catch (error) {
            console.error('[IPC] Error getting course:', error);
            return null;
        }
    });

    // ==================== EXAM HANDLERS ====================

    /**
     * Calculate duration in minutes from start and end time strings
     */
    function calculateDurationMinutes(startTime, endTime) {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        return (endH * 60 + endM) - (startH * 60 + startM);
    }

    /**
     * Get all exams for a profile
     */
    ipcMain.handle('db:get-exams', async (event, profileName) => {
        try {
            const targetProfile = profileName || DBManager.getLatestProfileName();
            if (!targetProfile) return [];

            const exams = DBManager.getSchedule(targetProfile);

            return exams.map(exam => ({
                exam_id: exam.id,
                course_code: exam.course_code,
                classroom_id: exam.room_name,
                date: exam.exam_date,
                time: exam.start_time,
                end_time: exam.end_time,
                duration_minutes: calculateDurationMinutes(exam.start_time, exam.end_time),
                profile_name: exam.profile_name
            }));
        } catch (error) {
            console.error('[IPC] Error getting exams:', error);
            return [];
        }
    });

    /**
     * Get exam by ID for a profile
     */
    ipcMain.handle('db:get-exam-by-id', async (event, { profileName, examId }) => {
        try {
            const targetProfile = profileName || DBManager.getLatestProfileName();
            if (!targetProfile) return null;

            const exams = DBManager.getSchedule(targetProfile);
            const exam = exams.find(e => e.id === examId);

            if (!exam) return null;

            return {
                exam_id: exam.id,
                course_code: exam.course_code,
                classroom_id: exam.room_name,
                date: exam.exam_date,
                time: exam.start_time,
                end_time: exam.end_time,
                duration_minutes: calculateDurationMinutes(exam.start_time, exam.end_time),
                profile_name: exam.profile_name
            };
        } catch (error) {
            console.error('[IPC] Error getting exam:', error);
            return null;
        }
    });

    /**
     * Get exams by classroom for a profile
     */
    ipcMain.handle('db:get-exams-by-classroom', async (event, { profileName, classroomId }) => {
        try {
            const targetProfile = profileName || DBManager.getLatestProfileName();
            if (!targetProfile) return [];

            const exams = DBManager.getSchedule(targetProfile);

            return exams
                .filter(exam => exam.room_name === classroomId)
                .map(exam => ({
                    exam_id: exam.id,
                    course_code: exam.course_code,
                    classroom_id: exam.room_name,
                    date: exam.exam_date,
                    time: exam.start_time,
                    end_time: exam.end_time,
                    duration_minutes: calculateDurationMinutes(exam.start_time, exam.end_time)
                }));
        } catch (error) {
            console.error('[IPC] Error getting exams by classroom:', error);
            return [];
        }
    });

    /**
     * Get exams for a specific student (based on their enrolled courses)
     */
    ipcMain.handle('db:get-exams-by-student', async (event, { profileName, studentId }) => {
        try {
            const targetProfile = profileName || DBManager.getLatestProfileName();
            if (!targetProfile) return [];

            const studentCourses = DBManager.getStudentCourses(targetProfile, studentId);
            if (studentCourses.length === 0) return [];

            const exams = DBManager.getSchedule(targetProfile);

            return exams
                .filter(exam => studentCourses.includes(exam.course_code))
                .map(exam => ({
                    exam_id: exam.id,
                    course_code: exam.course_code,
                    classroom_id: exam.room_name,
                    date: exam.exam_date,
                    time: exam.start_time,
                    end_time: exam.end_time,
                    duration_minutes: calculateDurationMinutes(exam.start_time, exam.end_time)
                }));
        } catch (error) {
            console.error('[IPC] Error getting exams by student:', error);
            return [];
        }
    });

    /**
     * Get exams for a specific course in a profile
     */
    ipcMain.handle('db:get-exams-by-course', async (event, { profileName, courseCode }) => {
        try {
            const targetProfile = profileName || DBManager.getLatestProfileName();
            if (!targetProfile) return [];

            const exams = DBManager.getSchedule(targetProfile);

            return exams
                .filter(exam => exam.course_code === courseCode)
                .map(exam => ({
                    exam_id: exam.id,
                    course_code: exam.course_code,
                    classroom_id: exam.room_name,
                    date: exam.exam_date,
                    time: exam.start_time,
                    end_time: exam.end_time,
                    duration_minutes: calculateDurationMinutes(exam.start_time, exam.end_time)
                }));
        } catch (error) {
            console.error('[IPC] Error getting exams by course:', error);
            return [];
        }
    });

    /**
     * Get full exam details with course and classroom info
     */
    ipcMain.handle('db:get-exam-details', async (event, { profileName, examId }) => {
        try {
            const targetProfile = profileName || DBManager.getLatestProfileName();
            if (!targetProfile) return null;

            const exams = DBManager.getSchedule(targetProfile);
            const exam = exams.find(e => e.id === examId);

            if (!exam) return null;

            // Get classroom details
            const classrooms = DBManager.getAllClassrooms(targetProfile);
            const classroom = classrooms.find(c => c.roomName === exam.room_name);

            // Get course details
            const { courses, students } = DBManager.getAllDataForScheduler(targetProfile);
            const course = courses.find(c => c.courseCode === exam.course_code);
            const enrolledStudents = students
                .filter(s => s.enrolledCourses.includes(exam.course_code))
                .map(s => s.studentId);

            return {
                exam_id: exam.id,
                course_code: exam.course_code,
                classroom_id: exam.room_name,
                date: exam.exam_date,
                time: exam.start_time,
                end_time: exam.end_time,
                duration_minutes: calculateDurationMinutes(exam.start_time, exam.end_time),
                classroom: classroom ? {
                    classroom_id: classroom.roomName,
                    capacity: classroom.capacity
                } : null,
                course: course ? {
                    course_code: course.courseCode,
                    student_count: course.studentCount,
                    enrolled_students: enrolledStudents
                } : null
            };
        } catch (error) {
            console.error('[IPC] Error getting exam details:', error);
            return null;
        }
    });

    // ==================== SCHEDULE HISTORY HANDLERS ====================

    /**
     * Get schedule history (list of all generated schedules)
     */
    ipcMain.handle('db:get-schedule-history', async () => {
        try {
            return DBManager.getAllProfiles();
        } catch (error) {
            console.error('[IPC] Error getting schedule history:', error);
            return [];
        }
    });

    /**
     * Get specific schedule by profile name
     */
    ipcMain.handle('db:get-schedule-details', async (event, profileName) => {
        try {
            const exams = DBManager.getSchedule(profileName);
            return exams.map(exam => ({
                exam_id: exam.id,
                course_code: exam.course_code,
                classroom_id: exam.room_name,
                date: exam.exam_date,
                time: exam.start_time,
                end_time: exam.end_time,
                duration_minutes: calculateDurationMinutes(exam.start_time, exam.end_time)
            }));
        } catch (error) {
            console.error('[IPC] Error getting schedule details:', error);
            return [];
        }
    });

    /**
     * Delete a schedule profile
     */
    ipcMain.handle('db:delete-profile', async (event, profileName) => {
        try {
            DBManager.deleteProfile(profileName);
            return { success: true };
        } catch (error) {
            console.error('[IPC] Error deleting profile:', error);
            return { success: false, error: error.message };
        }
    });

    // ==================== SETTINGS HANDLERS ====================

    /**
     * Get settings for a profile (or latest profile)
     */
    ipcMain.handle('db:get-settings', async (event, profileName) => {
        try {
            const targetProfile = profileName || DBManager.getLatestProfileName();
            if (!targetProfile) {
                return {
                    exam_duration: 90,
                    min_exam_days: 5,
                    max_exam_days: 30,
                    day_start_time: '09:00',
                    day_end_time: '18:00'
                };
            }
            return DBManager.getProfileSettings(targetProfile);
        } catch (error) {
            console.error('[IPC] Error getting settings:', error);
            return {};
        }
    });

    /**
     * Update settings - deprecated, settings are set during profile creation
     */
    ipcMain.handle('db:update-settings', async (event, newSettings) => {
        console.log('[IPC] db:update-settings is deprecated. Settings are now set during schedule creation.');
        return { success: true };
    });

    // ==================== RECENT PROJECTS ====================

    /**
     * Get recent projects (schedules) for the welcome screen
     */
    ipcMain.handle('app:get-recent-projects', async () => {
        try {
            const profiles = DBManager.getAllProfiles();
            console.log('[IPC] Found profiles:', profiles);

            // Transform profiles into recent projects format
            const projects = profiles.map(profile => ({
                id: profile.profile_name,
                name: profile.profile_name,
                createdAt: profile.created_at,
                profileName: profile.profile_name,
                examDuration: profile.exam_duration,
                dayStartTime: profile.day_start_time,
                dayEndTime: profile.day_end_time
            }));

            console.log('[IPC] Returning projects:', projects);
            return projects;
        } catch (error) {
            console.error('[IPC] Error getting recent projects:', error);
            return [];
        }
    });

    // ==================== HELP ====================

    /**
     * Open the Help PDF document
     */
    ipcMain.handle('app:open-help', async () => {
        try {
            // In development, the file is in docs/Help.pdf relative to project root
            // In production, it should be in resources/Help.pdf
            let helpPath;

            if (app.isPackaged) {
                // Production: look in resources folder
                helpPath = path.join(process.resourcesPath, 'Help.pdf');
            } else {
                // Development: look in docs folder
                helpPath = path.join(app.getAppPath(), 'docs', 'Help.pdf');
            }

            console.log('[IPC] Opening help file:', helpPath);
            const result = await shell.openPath(helpPath);

            if (result) {
                // shell.openPath returns an error string if it fails, empty string on success
                console.error('[IPC] Error opening help:', result);
                return { success: false, error: result };
            }

            return { success: true };
        } catch (error) {
            console.error('[IPC] Error opening help:', error);
            return { success: false, error: error.message };
        }
    });

    console.log('[IPC] All handlers registered successfully.');
}
