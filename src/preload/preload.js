const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // ==================== DIALOG ====================
    selectFile: () => ipcRenderer.invoke('dialog:openFile'),
    
    // ==================== DATA IMPORT ====================
    // args: { profileName, classroomsPath, enrollmentsPath }
    importData: (args) => ipcRenderer.invoke('app:import-data', args),
    
    // ==================== SCHEDULE GENERATION ====================
    // args: { scheduleName, settings }
    generateSchedule: (args) => ipcRenderer.invoke('app:generate-schedule', args),
    
    // ==================== CLASSROOMS ====================
    getClassrooms: (profileName) => ipcRenderer.invoke('db:get-classrooms', profileName),
    getClassroomById: (profileName, classroomId) => ipcRenderer.invoke('db:get-classroom-by-id', { profileName, classroomId }),
    
    // ==================== STUDENTS ====================
    getStudents: (profileName) => ipcRenderer.invoke('db:get-all-students', profileName),
    getAllStudents: (profileName) => ipcRenderer.invoke('db:get-all-students', profileName),
    getStudentById: (profileName, studentId) => ipcRenderer.invoke('db:get-student-by-id', { profileName, studentId }),
    searchStudents: (profileName, query) => ipcRenderer.invoke('db:search-students', { profileName, query }),
    getStudentCourses: (profileName, studentId) => ipcRenderer.invoke('db:get-student-courses', { profileName, studentId }),
    
    // ==================== COURSES ====================
    getCourses: (profileName) => ipcRenderer.invoke('db:get-courses', profileName),
    getCourseByCode: (profileName, courseCode) => ipcRenderer.invoke('db:get-course-by-code', { profileName, courseCode }),
    
    // ==================== EXAMS ====================
    getExams: (profileName) => ipcRenderer.invoke('db:get-exams', profileName),
    getExamById: (profileName, examId) => ipcRenderer.invoke('db:get-exam-by-id', { profileName, examId }),
    getExamsByClassroom: (profileName, classroomId) => ipcRenderer.invoke('db:get-exams-by-classroom', { profileName, classroomId }),
    getExamsByStudent: (profileName, studentId) => ipcRenderer.invoke('db:get-exams-by-student', { profileName, studentId }),
    getExamsByCourse: (profileName, courseCode) => ipcRenderer.invoke('db:get-exams-by-course', { profileName, courseCode }),
    getExamDetails: (profileName, examId) => ipcRenderer.invoke('db:get-exam-details', { profileName, examId }),
    
    // ==================== SCHEDULE HISTORY ====================
    getScheduleHistory: () => ipcRenderer.invoke('db:get-schedule-history'),
    getScheduleDetails: (profileName) => ipcRenderer.invoke('db:get-schedule-details', profileName),
    deleteProfile: (profileName) => ipcRenderer.invoke('db:delete-profile', profileName),
    
    // ==================== SETTINGS ====================
    getSettings: (profileName) => ipcRenderer.invoke('db:get-settings', profileName),
    updateSettings: (newSettings) => ipcRenderer.invoke('db:update-settings', newSettings),
    
    // ==================== RECENT PROJECTS ====================
    getRecentProjects: () => ipcRenderer.invoke('app:get-recent-projects')
});