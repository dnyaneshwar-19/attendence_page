// Global variables to store application state
let totalClassStrength = 0;
let presentStudents = [];
let allStudents = [];

/**
 * Initialize attendance process after total strength is entered
 */
function startAttendance() {
  const strengthInput = document.getElementById("totalStrength");
  const strength = parseInt(strengthInput.value);

  // Validate input
  if (!strength || strength < 1) {
    showMessage(
      "Please enter a valid positive number for class strength.",
      "error"
    );
    return;
  }

  // Store total strength and generate full student list
  totalClassStrength = strength;
  allStudents = Array.from({ length: strength }, (_, i) => i + 1);

  // Show attendance input section
  document.getElementById("setup-section").classList.add("hidden");
  document.getElementById("attendance-section").classList.remove("hidden");

  showMessage(
    `Class strength set to ${strength} students. Now enter roll numbers of present students.`,
    "success"
  );

  // Focus on the textarea for better UX
  document.getElementById("rollNumbers").focus();
}

/**
 * Process attendance input and generate results
 */
function endAttendance() {
  const rollNumbersInput = document.getElementById("rollNumbers").value.trim();

  if (!rollNumbersInput) {
    showMessage("Please enter at least one roll number.", "error");
    return;
  }

  // Process and validate roll numbers
  const processedRollNumbers = processRollNumbers(rollNumbersInput);

  if (processedRollNumbers === null) {
    return; // Error message already shown by processRollNumbers
  }

  // Store present students and generate attendance report
  presentStudents = processedRollNumbers;
  generateAttendanceReport();

  // Show results section
  document.getElementById("attendance-section").classList.add("hidden");
  document.getElementById("results-section").classList.remove("hidden");
}

/**
 * Enable editing of attendance
 */
function editAttendance() {
  // Populate edit textarea with current present students
  document.getElementById("editRollNumbers").value = presentStudents.join(", ");

  // Show edit section
  document.getElementById("results-section").classList.add("hidden");
  document.getElementById("edit-section").classList.remove("hidden");

  // Focus on edit textarea
  document.getElementById("editRollNumbers").focus();
}

/**
 * Save attendance changes
 */
function saveChanges() {
  const editedRollNumbers = document
    .getElementById("editRollNumbers")
    .value.trim();

  if (!editedRollNumbers) {
    showMessage("Please enter at least one roll number.", "error");
    return;
  }

  // Process and validate edited roll numbers
  const processedRollNumbers = processRollNumbers(editedRollNumbers);

  if (processedRollNumbers === null) {
    return; // Error message already shown by processRollNumbers
  }

  // Update present students and regenerate report
  presentStudents = processedRollNumbers;
  generateAttendanceReport();

  // Show updated results
  document.getElementById("edit-section").classList.add("hidden");
  document.getElementById("results-section").classList.remove("hidden");

  showMessage("Attendance updated successfully!", "success");
}

/**
 * Process and validate roll numbers from input string
 * @param {string} input - Raw input string containing roll numbers
 * @returns {Array|null} - Array of valid roll numbers or null if error
 */
function processRollNumbers(input) {
  // Split by commas and/or newlines, then clean up
  const rollNumberStrings = input
    .split(/[,\n]+/)
    .map((str) => str.trim())
    .filter((str) => str.length > 0);

  const rollNumbers = [];
  const invalidNumbers = [];

  // Validate each roll number
  for (let str of rollNumberStrings) {
    const num = parseInt(str);

    // Check if it's a valid integer
    if (isNaN(num) || !Number.isInteger(parseFloat(str))) {
      invalidNumbers.push(str);
      continue;
    }

    // Automatically filter out-of-range numbers (no error message)
    if (num >= 1 && num <= totalClassStrength) {
      rollNumbers.push(num);
    }
  }

  // Only show error for non-numeric inputs
  if (invalidNumbers.length > 0) {
    showMessage(
      `Invalid roll numbers (non-numeric): ${invalidNumbers.join(", ")}`,
      "error"
    );
    return null;
  }

  // Remove duplicates and sort (automatic deduplication)
  const uniqueRollNumbers = [...new Set(rollNumbers)].sort((a, b) => a - b);

  return uniqueRollNumbers;
}

/**
 * Generate and display attendance report
 */
function generateAttendanceReport() {
  const absentStudents = allStudents.filter(
    (rollNo) => !presentStudents.includes(rollNo)
  );

  // Calculate statistics
  const totalPresent = presentStudents.length;
  const totalAbsent = absentStudents.length;
  const attendancePercentage = (
    (totalPresent / totalClassStrength) *
    100
  ).toFixed(1);

  // Generate HTML for results
  let html = `
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-number present">${totalPresent}</div>
                        <div class="stat-label">Present</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number absent">${totalAbsent}</div>
                        <div class="stat-label">Absent</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number total">${attendancePercentage}%</div>
                        <div class="stat-label">Attendance</div>
                    </div>
                </div>
                
                <div class="attendance-list">
            `;

  // Generate columns of 20 students each
  const studentsPerColumn = 20;
  const totalColumns = Math.ceil(totalClassStrength / studentsPerColumn);

  for (let col = 0; col < totalColumns; col++) {
    const startRoll = col * studentsPerColumn + 1;
    const endRoll = Math.min((col + 1) * studentsPerColumn, totalClassStrength);

    html += `
                    <div class="attendance-column">
                        <div class="column-header">
                            Roll No. ${startRoll} - ${endRoll}
                        </div>
                `;

    // Generate student items for this column
    for (let rollNo = startRoll; rollNo <= endRoll; rollNo++) {
      const isPresent = presentStudents.includes(rollNo);
      const status = isPresent ? "Present ✓" : "Absent ✗";
      const statusClass = isPresent ? "present" : "absent";

      html += `
                        <div class="student-item ${statusClass}">
                            <div class="roll-number">Roll No. ${rollNo}</div>
                            <div class="status ${statusClass}">${status}</div>
                        </div>
                    `;
    }

    html += "</div>"; // Close attendance-column
  }

  html += "</div>"; // Close attendance-list

  document.getElementById("attendanceResults").innerHTML = html;
}

/**
 * Display messages to user
 * @param {string} message - Message to display
 * @param {string} type - Message type ('success' or 'error')
 */
function showMessage(message, type) {
  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML = `<div class="${type}">${message}</div>`;

  // Auto-hide success messages after 5 seconds
  if (type === "success") {
    setTimeout(() => {
      messagesDiv.innerHTML = "";
    }, 5000);
  }
}

/**
 * Download attendance as PNG image
 */
function downloadAttendance() {
  // Create a new canvas element
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Calculate dimensions based on columns
  const studentsPerColumn = 20;
  const totalColumns = Math.ceil(totalClassStrength / studentsPerColumn);
  const columnWidth = 400;
  const width = Math.max(800, totalColumns * columnWidth + 100);
  const height = 200 + studentsPerColumn * 35 + 100; // Header + max students per column + footer

  canvas.width = width;
  canvas.height = height;

  // Set background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Set font
  ctx.font = "24px Arial, sans-serif";
  ctx.textAlign = "center";

  // Header
  ctx.fillStyle = "#4facfe";
  ctx.fillText("Class Attendance Report", width / 2, 40);

  // Date and stats
  ctx.font = "16px Arial, sans-serif";
  ctx.fillStyle = "#666666";
  const now = new Date();
  const dateStr = now.toLocaleDateString() + " " + now.toLocaleTimeString();
  ctx.fillText(`Generated on: ${dateStr}`, width / 2, 70);

  const totalPresent = presentStudents.length;
  const totalAbsent = totalClassStrength - totalPresent;
  const attendancePercentage = (
    (totalPresent / totalClassStrength) *
    100
  ).toFixed(1);

  ctx.fillText(
    `Total Students: ${totalClassStrength} | Present: ${totalPresent} | Absent: ${totalAbsent} | Attendance: ${attendancePercentage}%`,
    width / 2,
    95
  );

  // Draw columns
  ctx.font = "16px Arial, sans-serif";
  ctx.textAlign = "left";

  for (let col = 0; col < totalColumns; col++) {
    const startRoll = col * studentsPerColumn + 1;
    const endRoll = Math.min((col + 1) * studentsPerColumn, totalClassStrength);
    const xPos = 50 + col * columnWidth;

    // Column header
    ctx.fillStyle = "#4facfe";
    ctx.fillRect(xPos, 130, columnWidth - 50, 30);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(
      `Roll No. ${startRoll} - ${endRoll}`,
      xPos + (columnWidth - 50) / 2,
      150
    );
    ctx.textAlign = "left";

    let yPos = 180;

    // Draw students for this column
    for (let rollNo = startRoll; rollNo <= endRoll; rollNo++) {
      const isPresent = presentStudents.includes(rollNo);
      const status = isPresent ? "Present ✓" : "Absent ✗";

      // Background rectangle for each student
      ctx.fillStyle = isPresent ? "#e6ffe6" : "#ffe6e6";
      ctx.fillRect(xPos, yPos - 15, columnWidth - 50, 25);

      // Border
      ctx.strokeStyle = isPresent ? "#28a745" : "#dc3545";
      ctx.lineWidth = 2;
      ctx.strokeRect(xPos, yPos - 15, columnWidth - 50, 25);

      // Roll number
      ctx.fillStyle = "#333333";
      ctx.font = "14px Arial, sans-serif";
      ctx.fillText(`Roll ${rollNo}`, xPos + 10, yPos);

      // Status
      ctx.fillStyle = isPresent ? "#28a745" : "#dc3545";
      ctx.textAlign = "right";
      ctx.fillText(status, xPos + columnWidth - 60, yPos);
      ctx.textAlign = "left";

      yPos += 30;
    }
  }

  // Convert canvas to blob and download
  canvas.toBlob(function (blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showMessage("Attendance downloaded successfully!", "success");
  }, "image/png");
}

// Allow Enter key to trigger actions
document
  .getElementById("totalStrength")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      startAttendance();
    }
  });

// Clear messages when user starts typing
document.getElementById("totalStrength").addEventListener("input", function () {
  document.getElementById("messages").innerHTML = "";
});

document.getElementById("rollNumbers").addEventListener("input", function () {
  document.getElementById("messages").innerHTML = "";
});

document
  .getElementById("editRollNumbers")
  .addEventListener("input", function () {
    document.getElementById("messages").innerHTML = "";
  });
// ... (rest of the script.js code) ...

/**
 * Download attendance as CSV file (compatible with Excel)
 */

/**
 * Download attendance as a CSV file with columns (max 10 rows per column).
 * NOTE: CSV format does not support colors (red/green).
 */
function downloadAttendanceCsv() {
  if (totalClassStrength === 0) {
    showMessage("Please start and end attendance before downloading.", "error");
    return;
  }

  const students = allStudents.map((rollNo) => ({
    rollNo: rollNo,
    status: presentStudents.includes(rollNo) ? "Present" : "Absent",
  }));

  const rowsPerColumn = 20;
  const totalColumns = Math.ceil(totalClassStrength / rowsPerColumn);

  let csvContent = "";

  // 1. Generate Header Row (e.g., "Roll No.,Status,Roll No.,Status,..." )
  for (let col = 0; col < totalColumns; col++) {
    csvContent += `"Roll No.","Status"`;
    if (col < totalColumns - 1) {
      csvContent += ",";
    }
  }
  csvContent += "\n"; // End of header row

  // 2. Generate Data Rows
  // Iterate up to the max number of rows (10)
  for (let row = 0; row < rowsPerColumn; row++) {
    let rowData = [];

    // Iterate through each column slot
    for (let col = 0; col < totalColumns; col++) {
      const index = col * rowsPerColumn + row;

      if (index < totalClassStrength) {
        // Student exists for this row/column slot
        const student = students[index];
        rowData.push(`"${student.rollNo}","${student.status}"`);
      } else {
        // Add empty cells for columns that run out of students
        rowData.push(`,`);
      }
    }

    csvContent += rowData.join(",");
    csvContent += "\n";
  }

  // 3. Create a Blob and a download link
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  const filename = `attendance_report_${dateStr}.csv`;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Trigger the download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showMessage(
    `Attendance data downloaded as ${filename}! You can set the colors in your spreadsheet app.`,
    "success"
  );
}
