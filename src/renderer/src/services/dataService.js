/**
 * Data Service Layer
 *
 * This service abstracts data fetching via IPC calls to the main process.
 * Components should only call these functions, never access window.api directly.
 */

/**
 * Get list of recent projects for Welcome Screen
 * @returns {Promise<Array>} Recent projects sorted by last modified
 */
export async function getRecentProjects() {
    return window.api.getRecentProjects();
}

/**
 * Get all classrooms
 * @returns {Promise<Array>} List of classrooms with id and capacity
 */
export async function getClassrooms() {
    return window.api.getClassrooms();
}

/**
 * Get classroom by ID
 * @param {string} classroomId
 * @returns {Promise<Object|null>} Classroom object or null if not found
 */
export async function getClassroomById(classroomId) {
    return window.api.getClassroomById(classroomId);
}

/**
 * Get all students
 * @returns {Promise<Array>} List of all students
 */
export async function getStudents() {
    return window.api.getStudents();
}

/**
 * Get student by ID
 * @param {string} studentId
 * @returns {Promise<Object|null>} Student object or null if not found
 */
export async function getStudentById(studentId) {
    return window.api.getStudentById(studentId);
}

/**
 * Search students by ID (for autocomplete)
 * @param {string} query Search query
 * @returns {Promise<Array>} Matching students
 */
export async function searchStudents(query) {
    return window.api.searchStudents(query);
}

/**
 * Get all courses
 * @returns {Promise<Array>} List of all courses with enrollment data
 */
export async function getCourses() {
    return window.api.getCourses();
}

/**
 * Get course by code
 * @param {string} courseCode
 * @returns {Promise<Object|null>} Course object with enrolled_students array
 */
export async function getCourseByCode(courseCode) {
    return window.api.getCourseByCode(courseCode);
}

/**
 * Get all exams
 * @returns {Promise<Array>} List of all scheduled exams
 */
export async function getExams() {
    return window.api.getExams();
}

/**
 * Get exam by ID
 * @param {string} examId
 * @returns {Promise<Object|null>} Exam object or null if not found
 */
export async function getExamById(examId) {
    return window.api.getExamById(examId);
}

/**
 * Get exams for a specific classroom
 * @param {string} classroomId
 * @returns {Promise<Array>} Exams scheduled in that classroom
 */
export async function getExamsByClassroom(classroomId) {
    return window.api.getExamsByClassroom(classroomId);
}

/**
 * Get exams for a specific student
 * @param {string} studentId
 * @returns {Promise<Array>} Exams the student is enrolled in
 */
export async function getExamsByStudent(studentId) {
    return window.api.getExamsByStudent(studentId);
}

/**
 * Get exams for a specific course
 * @param {string} courseCode
 * @returns {Promise<Array>} Exams for that course
 */
export async function getExamsByCourse(courseCode) {
    return window.api.getExamsByCourse(courseCode);
}

/**
 * Get full exam details including course and classroom info
 * @param {string} examId
 * @returns {Promise<Object|null>} Enriched exam object
 */
export async function getExamDetails(examId) {
    return window.api.getExamDetails(examId);
}
