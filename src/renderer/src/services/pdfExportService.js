/**
 * PDF Export Service
 * 
 * Generates PDF calendar exports with one page per week.
 * Only includes weeks that have exams scheduled.
 * Supports concurrent exams at the same time slot.
 */

import { jsPDF } from 'jspdf';

// Constants
const PAGE_WIDTH = 297; // A4 landscape width in mm
const PAGE_HEIGHT = 210; // A4 landscape height in mm
const TIME_COL_WIDTH = 20;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Calculated for centering
const HEADER_ROW_HEIGHT = 10;
const TABLE_WIDTH = 267; // Fixed table width
const DAY_COL_WIDTH = (TABLE_WIDTH - TIME_COL_WIDTH) / 7;

// Nord colors (converted from hex)
const COLORS = {
    polar1: [15, 17, 21],      // Near-black
    polar2: [24, 27, 33],
    frost3: [129, 161, 193],   // Arctic blue
    frost4: [94, 129, 172],
    aurora0: [191, 97, 106],   // Red for multi-exam badge
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
 * Find ALL exams at specific date/time (supports concurrent exams)
 */
function findExamsAtSlot(exams, date, time) {
    return exams.filter(e => e.date === date && e.time === time);
}

/**
 * Generate dynamic time slots based on actual exam data
 */
function generateTimeSlots(exams) {
    if (!exams || exams.length === 0) {
        return ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    }
    
    // Find earliest and latest hours from exam times
    let minHour = 24;
    let maxHour = 0;
    
    exams.forEach(exam => {
        const hour = parseInt(exam.time.split(':')[0]);
        if (hour < minHour) minHour = hour;
        // Account for exam duration to find true end time
        const endHour = hour + Math.ceil(exam.duration_minutes / 60);
        if (endHour > maxHour) maxHour = endHour;
    });
    
    // Generate hourly slots from min to max
    const slots = [];
    for (let h = minHour; h < maxHour; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
    }
    
    return slots.length > 0 ? slots : ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
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
 * Draw a single week page with dynamic time slots and concurrent exam support
 */
function drawWeekPage(doc, monday, exams, timeSlots, rowHeight, tableHeight, marginY, pageNum, totalPages) {
    const weekDays = getWeekDays(monday);
    const marginX = (PAGE_WIDTH - TABLE_WIDTH) / 2;

    const tableTop = marginY;
    const tableLeft = marginX;

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
    timeSlots.forEach((time, rowIndex) => {
        const y = tableTop + HEADER_ROW_HEIGHT + rowIndex * rowHeight;

        // Row background (alternating)
        if (rowIndex % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(tableLeft, y, TABLE_WIDTH, rowHeight, 'F');
        }

        // Time label
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.polar1);
        doc.text(time, tableLeft + 2, y + rowHeight / 2 + 2);

        // Draw cell borders for each day
        weekDays.forEach((date, dayIndex) => {
            const x = tableLeft + TIME_COL_WIDTH + dayIndex * DAY_COL_WIDTH;
            doc.setDrawColor(220, 220, 220);
            doc.rect(x, y, DAY_COL_WIDTH, rowHeight);
        });
    });

    // Draw outer border
    doc.setDrawColor(...COLORS.frost4);
    doc.rect(tableLeft, tableTop, TABLE_WIDTH, tableHeight);

    // SECOND PASS: Draw all exam cards ON TOP of grid
    timeSlots.forEach((time, rowIndex) => {
        const y = tableTop + HEADER_ROW_HEIGHT + rowIndex * rowHeight;

        weekDays.forEach((date, dayIndex) => {
            const x = tableLeft + TIME_COL_WIDTH + dayIndex * DAY_COL_WIDTH;
            const slotExams = findExamsAtSlot(exams, date, time);

            if (slotExams.length > 0) {
                // Calculate card width based on number of concurrent exams
                const cardWidth = (DAY_COL_WIDTH - 2) / slotExams.length;
                
                slotExams.forEach((exam, examIndex) => {
                    // Calculate height based on duration (60min = rowHeight)
                    const examHeight = Math.round((exam.duration_minutes / 60) * rowHeight);
                    const cardX = x + 1 + examIndex * cardWidth;

                    // Exam card background - height scaled by duration
                    doc.setFillColor(...COLORS.frost3);
                    doc.roundedRect(cardX, y + 1, cardWidth - 1, examHeight - 2, 1, 1, 'F');

                    // Center text vertically in the card
                    const centerY = y + examHeight / 2;
                    const cardCenterX = cardX + cardWidth / 2;

                    // Exam text - centered in card
                    // Adjust font size based on number of concurrent exams
                    const fontSize = slotExams.length > 2 ? 5 : slotExams.length > 1 ? 6 : 8;
                    const subFontSize = slotExams.length > 2 ? 4 : slotExams.length > 1 ? 5 : 6;
                    
                    doc.setFontSize(fontSize);
                    doc.setTextColor(...COLORS.white);
                    doc.text(exam.course_code, cardCenterX, centerY - 1, { align: 'center' });

                    doc.setFontSize(subFontSize);
                    // Show classroom only for multi-exam slots, show both for single exams
                    if (slotExams.length > 1) {
                        doc.text(exam.classroom_id, cardCenterX, centerY + 4, { align: 'center' });
                    } else {
                        doc.text(`${exam.classroom_id} | ${exam.duration_minutes}m`, cardCenterX, centerY + 5, { align: 'center' });
                    }
                });

                // If there are multiple concurrent exams, add a badge indicator
                if (slotExams.length > 1) {
                    // Small badge in top-right corner of the cell
                    const badgeX = x + DAY_COL_WIDTH - 6;
                    const badgeY = y + 3;
                    doc.setFillColor(...COLORS.aurora0);
                    doc.circle(badgeX, badgeY, 3, 'F');
                    doc.setFontSize(5);
                    doc.setTextColor(...COLORS.white);
                    doc.text(String(slotExams.length), badgeX, badgeY + 1.5, { align: 'center' });
                }
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

    // Generate dynamic time slots based on exam data
    const timeSlots = generateTimeSlots(exams);
    
    // Calculate row height to fit page
    const availableHeight = PAGE_HEIGHT - 40; // Leave margin
    const rowHeight = Math.min(20, Math.floor(availableHeight / timeSlots.length));
    const tableHeight = HEADER_ROW_HEIGHT + timeSlots.length * rowHeight;
    const marginY = (PAGE_HEIGHT - tableHeight) / 2;

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
        drawWeekPage(doc, monday, exams, timeSlots, rowHeight, tableHeight, marginY, index + 1, weeksWithExams.length);
    });

    // Save the PDF
    doc.save(`${scheduleName}.pdf`);
}
