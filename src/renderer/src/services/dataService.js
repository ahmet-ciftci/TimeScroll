/**
 * Data Service Layer
 *
 * This service abstracts data fetching via IPC calls to the main process.
 * Components should only call these functions, never access window.api directly.
 * All data operations are scoped by profileName for complete schedule isolation.
 */

/**
 * Get list of recent projects for Welcome Screen
 * @returns {Promise<Array>} Recent projects sorted by last modified
 */
export async function getRecentProjects() {
    return window.api.getRecentProjects();
}

/**
 * Get all classrooms for a profile
 * @param {string} profileName - The schedule profile name
 * @returns {Promise<Array>} List of classrooms with id and capacity
 */
export async function getClassrooms(profileName) {
    return window.api.getClassrooms(profileName);
}

/**
 * Get classroom by ID
 * @param {string} profileName - The schedule profile name
 * @param {string} classroomId
 * @returns {Promise<Object|null>} Classroom object or null if not found
 */
export async function getClassroomById(profileName, classroomId) {
    return window.api.getClassroomById(profileName, classroomId);
}

/**
 * Get all students for a profile
 * @param {string} profileName - The schedule profile name
 * @returns {Promise<Array>} List of all students
 */
export async function getStudents(profileName) {
    return window.api.getStudents(profileName);
}

/**
 * Get student by ID
 * @param {string} profileName - The schedule profile name
 * @param {string} studentId
 * @returns {Promise<Object|null>} Student object or null if not found
 */
export async function getStudentById(profileName, studentId) {
    return window.api.getStudentById(profileName, studentId);
}

/**
 * Search students by ID (for autocomplete)
 * @param {string} profileName - The schedule profile name
 * @param {string} query Search query
 * @returns {Promise<Array>} Matching students
 */
export async function searchStudents(profileName, query) {
    return window.api.searchStudents(profileName, query);
}

/**
 * Get all courses for a profile
 * @param {string} profileName - The schedule profile name
 * @returns {Promise<Array>} List of all courses with enrollment data
 */
export async function getCourses(profileName) {
    return window.api.getCourses(profileName);
}

/**
 * Get course by code
 * @param {string} profileName - The schedule profile name
 * @param {string} courseCode
 * @returns {Promise<Object|null>} Course object with enrolled_students array
 */
export async function getCourseByCode(profileName, courseCode) {
    return window.api.getCourseByCode(profileName, courseCode);
}

/**
 * Get all exams for a profile
 * @param {string} profileName - The schedule profile name
 * @returns {Promise<Array>} List of all scheduled exams
 */
export async function getExams(profileName) {
    return window.api.getExams(profileName);
}

/**
 * Get exam by ID
 * @param {string} profileName - The schedule profile name
 * @param {string} examId
 * @returns {Promise<Object|null>} Exam object or null if not found
 */
export async function getExamById(profileName, examId) {
    return window.api.getExamById(profileName, examId);
}

/**
 * Get exams for a specific classroom
 * @param {string} profileName - The schedule profile name
 * @param {string} classroomId
 * @returns {Promise<Array>} Exams scheduled in that classroom
 */
export async function getExamsByClassroom(profileName, classroomId) {
    return window.api.getExamsByClassroom(profileName, classroomId);
}

/**
 * Get exams for a specific student
 * @param {string} profileName - The schedule profile name
 * @param {string} studentId
 * @returns {Promise<Array>} Exams the student is enrolled in
 */
export async function getExamsByStudent(profileName, studentId) {
    return window.api.getExamsByStudent(profileName, studentId);
}

/**
 * Get exams for a specific course
 * @param {string} profileName - The schedule profile name
 * @param {string} courseCode
 * @returns {Promise<Array>} Exams for that course
 */
export async function getExamsByCourse(profileName, courseCode) {
    return window.api.getExamsByCourse(profileName, courseCode);
}

/**
 * Get full exam details including course and classroom info
 * @param {string} profileName - The schedule profile name
 * @param {string} examId
 * @returns {Promise<Object|null>} Enriched exam object
 */
export async function getExamDetails(profileName, examId) {
    return window.api.getExamDetails(profileName, examId);
}

/**
 * Get settings for a profile
 * @param {string} profileName - The schedule profile name (optional, uses latest if not provided)
 * @returns {Promise<Object>} Settings object with exam_duration, day_start_time, etc.
 */
export async function getSettings(profileName) {
    return window.api.getSettings(profileName);
}

/**
 * Delete a schedule profile
 * @param {string} profileName - The schedule profile name to delete
 * @returns {Promise<Object>} Result with success boolean
 */
export async function deleteProfile(profileName) {
    return window.api.deleteProfile(profileName);
}
