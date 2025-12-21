import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer - IPC bridge to main process
const api = {
    // Projects
    getRecentProjects: () => ipcRenderer.invoke('get-recent-projects'),

    // Classrooms
    getClassrooms: () => ipcRenderer.invoke('get-classrooms'),
    getClassroomById: (classroomId) => ipcRenderer.invoke('get-classroom-by-id', classroomId),

    // Students
    getStudents: () => ipcRenderer.invoke('get-students'),
    getStudentById: (studentId) => ipcRenderer.invoke('get-student-by-id', studentId),
    searchStudents: (query) => ipcRenderer.invoke('search-students', query),

    // Courses
    getCourses: () => ipcRenderer.invoke('get-courses'),
    getCourseByCode: (courseCode) => ipcRenderer.invoke('get-course-by-code', courseCode),

    // Exams
    getExams: () => ipcRenderer.invoke('get-exams'),
    getExamById: (examId) => ipcRenderer.invoke('get-exam-by-id', examId),
    getExamsByClassroom: (classroomId) => ipcRenderer.invoke('get-exams-by-classroom', classroomId),
    getExamsByStudent: (studentId) => ipcRenderer.invoke('get-exams-by-student', studentId),
    getExamsByCourse: (courseCode) => ipcRenderer.invoke('get-exams-by-course', courseCode),
    getExamDetails: (examId) => ipcRenderer.invoke('get-exam-details', examId),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI);
        contextBridge.exposeInMainWorld('api', api);
    } catch (error) {
        console.error(error);
    }
} else {
    window.electron = electronAPI;
    window.api = api;
}
