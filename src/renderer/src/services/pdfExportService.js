/**
 * PDF Export Service
 * 
 * Generates PDF calendar exports with one page per week.
 * Only includes weeks that have exams scheduled.
 */

import { jsPDF } from 'jspdf';

// Constants
const PAGE_WIDTH = 297; // A4 landscape width in mm
const PAGE_HEIGHT = 210; // A4 landscape height in mm
const TIME_COL_WIDTH = 20;
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Calculated for centering
const HEADER_ROW_HEIGHT = 10;
const ROW_HEIGHT = 20; // Increased for better fill
const TABLE_HEIGHT = HEADER_ROW_HEIGHT + TIME_SLOTS.length * ROW_HEIGHT;
const TABLE_WIDTH = 267; // Fixed table width
const MARGIN_X = (PAGE_WIDTH - TABLE_WIDTH) / 2; // Horizontal centering
const MARGIN_Y = (PAGE_HEIGHT - TABLE_HEIGHT) / 2; // Vertical centering
const DAY_COL_WIDTH = (TABLE_WIDTH - TIME_COL_WIDTH) / 7;

// Nord colors (converted from hex)
const COLORS = {
    polar1: [15, 17, 21],      // Near-black
    polar2: [24, 27, 33],
    frost3: [129, 161, 193],   // Arctic blue
    frost4: [94, 129, 172],
    snow2: [229, 233, 240],
    white: [255, 255, 255],
};

/**
 * Get Monday of a given week
 */
function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

/**
 * Get all 7 days of a week starting from Monday
 */
function getWeekDays(monday) {
    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const dayNum = String(day.getDate()).padStart(2, '0');
        days.push(`${year}-${month}-${dayNum}`);
    }
    return days;
}

/**
 * Format week range for page header
 */
function formatWeekRange(monday) {
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const options = { month: 'short', day: 'numeric' };
    const startStr = monday.toLocaleDateString('en-US', options);
    const endStr = sunday.toLocaleDateString('en-US', { ...options, year: 'numeric' });

    return `${startStr} - ${endStr}`;
}

/**
 * Format day header (e.g., "Mon 20")
 */
function formatDayHeader(dateString) {
    const date = new Date(dateString);
    const dayName = DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1];
    return `${dayName} ${date.getDate()}`;
}

/**
 * Find exam at specific date/time
 */
function findExamAtSlot(exams, date, time) {
    return exams.find(e => e.date === date && e.time === time);
}

/**
 * Get unique weeks that contain exams
 */
function getWeeksWithExams(exams) {
    const weekMap = new Map();

    exams.forEach(exam => {
        const examDate = new Date(exam.date);
        const monday = getMonday(examDate);
        const weekKey = monday.toISOString().split('T')[0];

        if (!weekMap.has(weekKey)) {
            weekMap.set(weekKey, monday);
        }
    });

    // Sort weeks chronologically
    return Array.from(weekMap.values()).sort((a, b) => a - b);
}

/**
 * Draw a single week page
 */
function drawWeekPage(doc, monday, exams, pageNum, totalPages) {
    const weekDays = getWeekDays(monday);

    const tableTop = MARGIN_Y;
    const tableLeft = MARGIN_X;

    // Draw header row
    doc.setFillColor(...COLORS.frost3);
    doc.rect(tableLeft, tableTop, TABLE_WIDTH, HEADER_ROW_HEIGHT, 'F');

    doc.setFontSize(9);
    doc.setTextColor(...COLORS.white);
    doc.text('Time', tableLeft + 2, tableTop + 7);

    weekDays.forEach((date, i) => {
        const x = tableLeft + TIME_COL_WIDTH + i * DAY_COL_WIDTH;
        doc.text(formatDayHeader(date), x + DAY_COL_WIDTH / 2, tableTop + 7, { align: 'center' });
    });

    // FIRST PASS: Draw all grid lines and backgrounds
    TIME_SLOTS.forEach((time, rowIndex) => {
        const y = tableTop + HEADER_ROW_HEIGHT + rowIndex * ROW_HEIGHT;

        // Row background (alternating)
        if (rowIndex % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(tableLeft, y, TABLE_WIDTH, ROW_HEIGHT, 'F');
        }

        // Time label
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.polar1);
        doc.text(time, tableLeft + 2, y + ROW_HEIGHT / 2 + 2);

        // Draw cell borders for each day
        weekDays.forEach((date, dayIndex) => {
            const x = tableLeft + TIME_COL_WIDTH + dayIndex * DAY_COL_WIDTH;
            doc.setDrawColor(220, 220, 220);
            doc.rect(x, y, DAY_COL_WIDTH, ROW_HEIGHT);
        });
    });

    // Draw outer border
    doc.setDrawColor(...COLORS.frost4);
    doc.rect(tableLeft, tableTop, TABLE_WIDTH, TABLE_HEIGHT);

    // SECOND PASS: Draw all exam cards ON TOP of grid
    TIME_SLOTS.forEach((time, rowIndex) => {
        const y = tableTop + HEADER_ROW_HEIGHT + rowIndex * ROW_HEIGHT;

        weekDays.forEach((date, dayIndex) => {
            const x = tableLeft + TIME_COL_WIDTH + dayIndex * DAY_COL_WIDTH;
            const exam = findExamAtSlot(exams, date, time);

            if (exam) {
                // Calculate height based on duration (60min = ROW_HEIGHT)
                const examHeight = Math.round((exam.duration_minutes / 60) * ROW_HEIGHT);

                // Exam card background - height scaled by duration
                doc.setFillColor(...COLORS.frost3);
                doc.roundedRect(x + 1, y + 1, DAY_COL_WIDTH - 2, examHeight - 2, 2, 2, 'F');

                // Center text vertically in the card
                const centerY = y + examHeight / 2;

                // Exam text - centered in card
                doc.setFontSize(8);
                doc.setTextColor(...COLORS.white);
                doc.text(exam.course_code, x + DAY_COL_WIDTH / 2, centerY - 2, { align: 'center' });

                doc.setFontSize(6);
                doc.text(`${exam.classroom_id} | ${exam.duration_minutes}m`, x + DAY_COL_WIDTH / 2, centerY + 5, { align: 'center' });
            }
        });
    });
}

/**
 * Export exams to PDF
 * @param {Array} exams - Array of exam objects
 * @param {string} scheduleName - Name for the PDF file
 */
export async function exportCalendarToPDF(exams, scheduleName = 'exam-schedule') {
    if (!exams || exams.length === 0) {
        console.warn('No exams to export');
        return;
    }

    const weeksWithExams = getWeeksWithExams(exams);

    if (weeksWithExams.length === 0) {
        console.warn('No weeks with exams found');
        return;
    }

    // Create PDF (A4 landscape)
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // Draw each week on a new page
    weeksWithExams.forEach((monday, index) => {
        if (index > 0) {
            doc.addPage();
        }
        drawWeekPage(doc, monday, exams, index + 1, weeksWithExams.length);
    });

    // Save the PDF
    doc.save(`${scheduleName}.pdf`);
}
