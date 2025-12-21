/**
 * Export Service
 * 
 * Provides JSON and CSV export functionality for exam schedules.
 */

/**
 * Export exams to JSON file
 * @param {Array} exams - Array of exam objects
 * @param {string} scheduleName - Name for the file
 */
export function exportToJSON(exams, scheduleName = 'exam-schedule') {
    if (!exams || exams.length === 0) {
        console.warn('No exams to export');
        return;
    }

    // Format the data nicely
    const exportData = {
        scheduleName,
        exportedAt: new Date().toISOString(),
        totalExams: exams.length,
        exams: exams.map(exam => ({
            id: exam.id,
            courseCode: exam.course_code,
            date: exam.date,
            time: exam.time,
            durationMinutes: exam.duration_minutes,
            classroomId: exam.classroom_id,
            classroomName: exam.classroom_name || exam.classroom_id,
            classroomCapacity: exam.classroom_capacity
        }))
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadBlob(blob, `${scheduleName}.json`);
}

/**
 * Export exams to CSV file
 * @param {Array} exams - Array of exam objects
 * @param {string} scheduleName - Name for the file
 */
export function exportToCSV(exams, scheduleName = 'exam-schedule') {
    if (!exams || exams.length === 0) {
        console.warn('No exams to export');
        return;
    }

    // CSV headers
    const headers = [
        'ID',
        'Course Code',
        'Date',
        'Time',
        'Duration (minutes)',
        'Classroom ID',
        'Classroom Name',
        'Classroom Capacity'
    ];

    // Build CSV rows
    const rows = exams.map(exam => [
        exam.id,
        exam.course_code,
        exam.date,
        exam.time,
        exam.duration_minutes,
        exam.classroom_id,
        exam.classroom_name || exam.classroom_id,
        exam.classroom_capacity || ''
    ]);

    // Escape CSV values (handle commas, quotes, newlines)
    const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // Build CSV string
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${scheduleName}.csv`);
}

/**
 * Helper to trigger file download
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
