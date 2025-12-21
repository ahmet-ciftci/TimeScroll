const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    selectFile: () => ipcRenderer.invoke('dialog:openFile'),
    importData: (args) => ipcRenderer.invoke('app:import-data', args),
    generateSchedule: () => ipcRenderer.invoke('app:generate-schedule'),
    getScheduleHistory: () => ipcRenderer.invoke('db:get-schedule-history'),
    getScheduleDetails: (profileName) => ipcRenderer.invoke('db:get-schedule-details', profileName),
    getStudentCourses: (studentId) => ipcRenderer.invoke('db:get-student-courses', studentId),
    getAllStudents: () => ipcRenderer.invoke('db:get-all-students'),
    getSettings: () => ipcRenderer.invoke('db:get-settings'),
    updateSettings: (newSettings) => ipcRenderer.invoke('db:update-settings', newSettings)
});