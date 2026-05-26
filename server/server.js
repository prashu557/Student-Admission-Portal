import express from "express";
import cors from "cors";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import crypto from "crypto";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const uploadsRoot = path.join(__dirname, "uploads");
const studentDocumentsRoot = path.join(uploadsRoot, "student-documents");
const notificationsJsonPath = path.join(dataDir, "notifications.json");
const queriesJsonPath = path.join(dataDir, "queries.json");
const documentsJsonPath = path.join(dataDir, "documents.json");
const paymentsJsonPath = path.join(dataDir, "payments.json");

// IMPORTANT: Backend must use the restored backend students.csv file.
const csvFilePath = path.join(__dirname, "students.csv");

// In-memory Database & Indexing State
const studentsLines = [];
const emailToLineIndex = new Map();
const legacyIdToLineIndex = new Map();
let maxLegacyIdNum = 1000000;

// Ensure students.csv exists with correct headers (only on first run).
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(
    csvFilePath,
    `${[
      "Legacy_ID",
      "Enquiry_Date",
      "Student_Name",
      "Phone",
      "Email",
      "City",
      "State",
      "Interested_Course",
      "Lead_Source",
      "Counsellor_Name",
      "Counsellor_Phone",
      "Old_Status",
      "CRM_Status",
      "Follow_Up_Date",
      "Priority",
      "Data_Quality_Flag",
      "Remarks",
      "Password",
      "Campus_Preference",
      "Intake_Session",
      "Mode_of_Study",
      "Tenth_Percentage",
      "Twelfth_Percentage",
      "Graduation_Percentage",
      "Eligibility_Status",
      "Eligibility_Criteria",
      "Father_Name",
      "Mother_Name",
      "Category",
      "Nationality",
      "Address",
      "Pincode",
    ].join(",")}\n`,
    { encoding: "utf8" }
  );
}

const csvHeaders = [
  "Legacy_ID",
  "Enquiry_Date",
  "Student_Name",
  "Phone",
  "Email",
  "City",
  "State",
  "Interested_Course",
  "Lead_Source",
  "Counsellor_Name",
  "Counsellor_Phone",
  "Old_Status",
  "CRM_Status",
  "Follow_Up_Date",
  "Priority",
  "Data_Quality_Flag",
  "Remarks",
  "Password",
  "Campus_Preference",
  "Intake_Session",
  "Mode_of_Study",
  "Tenth_Percentage",
  "Twelfth_Percentage",
  "Graduation_Percentage",
  "Eligibility_Status",
  "Eligibility_Criteria",
  "Father_Name",
  "Mother_Name",
  "Category",
  "Nationality",
  "Address",
  "Pincode",
];

const counsellors = [
  { name: "Amit Sharma", phone: "9876543210" },
  { name: "Priya Singh", phone: "9876543211" },
  { name: "Neha Verma", phone: "9876543212" },
  { name: "Rahul Mehta", phone: "9876543213" },
  { name: "Sneha Gupta", phone: "9876543214" },
];

const allowedDocumentTypes = new Set([
  "image/jpeg",
  "image/png",
  "application/pdf",
]);

const documentTypes = [
  "10th marksheet",
  "12th marksheet",
  "graduation certificate",
  "transfer certificate",
  "migration certificate",
  "aadhaar card",
  "passport photo",
  "signature",
  "other required documents",
];

const editableProfileFields = new Set([
  "Student_Name",
  "Phone",
  "Email",
  "Address",
  "City",
  "State",
  "Father_Name",
  "Mother_Name",
  "Category",
  "Nationality",
  "Interested_Course",
  "Campus_Preference",
  "Intake_Session",
  "Mode_of_Study",
  "Pincode",
  "Remarks",
]);

app.use(cors());
app.use(express.json());

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(studentDocumentsRoot, { recursive: true });

function ensureJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]\n", { encoding: "utf8" });
  }
}

ensureJsonFile(notificationsJsonPath);
ensureJsonFile(queriesJsonPath);
ensureJsonFile(documentsJsonPath);
ensureJsonFile(paymentsJsonPath);

function normalizeNoWhitespace(value) {
  // Requirements: case-insensitive + trim spaces before comparison.
  // Keep inner characters as-is (do NOT remove all whitespace),
  // so Legacy_ID values like "OLD0000001" still match exactly.
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeLoginValue(value) {
  return String(value || "").trim().toLowerCase();
}

function rowToStudent(rowValues) {
  const student = {};
  csvHeaders.forEach((header, index) => {
    student[header] = rowValues[index] || "";
  });
  return student;
}

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    console.log("Initializing in-memory database from CSV...");
    console.time("Database Initialization");

    const inputStream = fs.createReadStream(csvFilePath);
    const rl = readline.createInterface({
      input: inputStream,
      crlfDelay: Infinity
    });

    let isHeader = true;

    rl.on("line", (line) => {
      if (isHeader) {
        isHeader = false;
        return;
      }
      const index = studentsLines.length;
      studentsLines.push(line);

      // Fast split by custom character scanning up to the 5th field (Email)
      const fields = [];
      let cur = '';
      let inQuotes = false;
      let fieldCount = 0;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          if (inQuotes && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          fields.push(cur);
          cur = '';
          fieldCount++;
          if (fieldCount > 4) break;
        } else {
          cur += c;
        }
      }
      if (fieldCount <= 4) {
        fields.push(cur);
      }

      const legacyId = fields[0];
      const email = fields[4];

      if (legacyId) {
        const normId = normalizeNoWhitespace(legacyId);
        legacyIdToLineIndex.set(normId, index);
        const match = legacyId.match(/^OLD(\d+)$/i);
        if (match) {
          maxLegacyIdNum = Math.max(maxLegacyIdNum, Number(match[1]));
        }
      }
      if (email) {
        const normEmail = normalizeNoWhitespace(email);
        emailToLineIndex.set(normEmail, index);
      }
    });

    rl.on("close", () => {
      inputStream.destroy(); // Release Windows file lock immediately
      console.timeEnd("Database Initialization");
      console.log("CSV loaded successfully");
      console.log("Total students:", studentsLines.length);
      console.log(`Initial max Legacy_ID number: ${maxLegacyIdNum}`);
      resolve();
    });

    rl.on("error", (err) => {
      inputStream.destroy(); // Release lock on error
      console.error("Failed to load database:", err);
      reject(err);
    });
  });
}

function escapeCsvValue(value) {

  const stringValue = value === undefined || value === null ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function studentToCsvRow(student) {
  return csvHeaders
    .map((header) => {
      const v = student?.[header];
      return escapeCsvValue(v);
    })
    .join(",");
}

function assignRandomCounsellor() {
  return counsellors[Math.floor(Math.random() * counsellors.length)];
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function readJsonArray(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`READ_JSON_ERROR ${filePath}:`, error);
    return [];
  }
}

function writeJsonArray(filePath, rows) {
  fs.writeFileSync(filePath, `${JSON.stringify(rows, null, 2)}\n`, {
    encoding: "utf8",
  });
}

function appendJsonRow(filePath, row) {
  const rows = readJsonArray(filePath);
  rows.unshift(row);
  writeJsonArray(filePath, rows);
  return row;
}

function safeLegacyId(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "");
}

async function requireKnownStudent(req, res) {
  const legacyId = req.body?.legacyId || req.query?.legacyId || req.params?.legacyId;
  const email = req.body?.email || req.query?.email;

  const student = await findStudent({
    legacyId,
    email,
  });

  if (!student) {
    res.status(401).json({ success: false, message: "Unauthorized student access" });
    return null;
  }

  return student;
}

function createNotification({ legacyId, title, message, source = "System", type = "general" }) {
  if (!legacyId || !title) return null;

  return appendJsonRow(notificationsJsonPath, {
    id: crypto.randomUUID(),
    legacyId,
    title,
    message: message || title,
    source,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

function findStudent(criteria) {
  const enteredEmail = criteria?.email ? normalizeNoWhitespace(criteria.email) : "";
  const enteredLegacyId = criteria?.legacyId ? normalizeNoWhitespace(criteria.legacyId) : "";

  console.log("FIND STUDENT entered:", {
    email: enteredEmail,
    legacyId: enteredLegacyId,
  });

  let lineIndex;
  if (enteredLegacyId) {
    lineIndex = legacyIdToLineIndex.get(enteredLegacyId);
  }
  if (lineIndex === undefined && enteredEmail) {
    lineIndex = emailToLineIndex.get(enteredEmail);
  }

  if (lineIndex !== undefined) {
    const rawLine = studentsLines[lineIndex];
    const parsedValues = parseCsvLine(rawLine);
    const student = rowToStudent(parsedValues);
    console.log("FIND STUDENT done (instant):", {
      totalStudentsLoaded: studentsLines.length,
      matched: true,
      matchedStudentLegacyId: student.Legacy_ID,
      matchedStudentEmail: student.Email,
    });
    return Promise.resolve(student);
  }

  console.log("FIND STUDENT done (instant):", {
    totalStudentsLoaded: studentsLines.length,
    matched: false,
  });
  return Promise.resolve(null);
}

function getStudentLineIndex({ email, legacyId }) {
  const enteredEmail = email ? normalizeNoWhitespace(email) : "";
  const enteredLegacyId = legacyId ? normalizeNoWhitespace(legacyId) : "";

  if (enteredLegacyId && legacyIdToLineIndex.has(enteredLegacyId)) {
    return legacyIdToLineIndex.get(enteredLegacyId);
  }

  if (enteredEmail && emailToLineIndex.has(enteredEmail)) {
    return emailToLineIndex.get(enteredEmail);
  }

  return undefined;
}

function findStudentByLoginInput(input) {
  const loginInput = normalizeLoginValue(input);

  if (!loginInput) return null;

  const indexedLine =
    legacyIdToLineIndex.get(loginInput) ??
    emailToLineIndex.get(loginInput);

  if (indexedLine !== undefined) {
    return rowToStudent(parseCsvLine(studentsLines[indexedLine]));
  }

  for (const line of studentsLines) {
    const student = rowToStudent(parseCsvLine(line));
    const legacyId = normalizeLoginValue(student["Legacy_ID"]);
    const email = normalizeLoginValue(student["Email"]);

    if (legacyId === loginInput || email === loginInput) {
      return student;
    }
  }

  return null;
}


function getNextLegacyId() {
  return Promise.resolve(`OLD${maxLegacyIdNum + 1}`);
}

function updateInMemoryIndexes(student, lineIndex) {
  if (student.Legacy_ID) {
    legacyIdToLineIndex.set(normalizeNoWhitespace(student.Legacy_ID), lineIndex);
  }
  if (student.Email) {
    emailToLineIndex.set(normalizeNoWhitespace(student.Email), lineIndex);
  }
}

async function rewriteStudentsCsvSafely() {
  backupStudentsCsvOnce();

  const tempPath = `${csvFilePath}.tmp`;

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(tempPath, { encoding: "utf8" });

    output.on("error", reject);
    output.on("finish", resolve);

    output.write(`${csvHeaders.join(",")}\n`);

    for (const line of studentsLines) {
      output.write(`${line}\n`);
    }

    output.end();
  });

  fs.renameSync(tempPath, csvFilePath);
}

async function updateStudentProfileRow(legacyId, updates) {
  const lineIndex = getStudentLineIndex({ legacyId });

  if (lineIndex === undefined) {
    return null;
  }

  const currentStudent = rowToStudent(parseCsvLine(studentsLines[lineIndex]));
  const updatedStudent = { ...currentStudent };

  Object.entries(updates || {}).forEach(([key, value]) => {
    if (editableProfileFields.has(key)) {
      updatedStudent[key] = value === undefined || value === null ? "" : String(value).trim();
    }
  });

  if (!updatedStudent.Student_Name || !updatedStudent.Email) {
    throw new Error("Student name and email are required");
  }

  const normalizedNewEmail = normalizeNoWhitespace(updatedStudent.Email);
  const existingEmailIndex = emailToLineIndex.get(normalizedNewEmail);
  if (existingEmailIndex !== undefined && existingEmailIndex !== lineIndex) {
    throw new Error("Email already belongs to another student");
  }

  studentsLines[lineIndex] = studentToCsvRow(updatedStudent);

  // Rebuild small lookup maps after the row changes, including email changes.
  emailToLineIndex.clear();
  legacyIdToLineIndex.clear();
  studentsLines.forEach((line, index) => {
    const student = rowToStudent(parseCsvLine(line));
    updateInMemoryIndexes(student, index);
  });

  writeQueue = writeQueue.then(() => rewriteStudentsCsvSafely());
  await writeQueue;

  return updatedStudent;
}

// --------------------
// Append-only write safety
// --------------------
let writeQueue = Promise.resolve();

function backupStudentsCsvOnce() {
  const backupPath = path.join(__dirname, "students_backup.csv");
  if (!fs.existsSync(backupPath)) {
    // Create backup before any write
    fs.copyFileSync(csvFilePath, backupPath);
    console.log(`BACKUP: Created ${backupPath}`);
  }
  return backupPath;
}

async function appendNewStudentRowOnly(student) {
  // Backup MUST exist before write
  backupStudentsCsvOnce();

  const normalized = {};
  csvHeaders.forEach((h) => {
    normalized[h] = student?.[h] ?? "";
  });

  const line = studentToCsvRow(normalized);

  writeQueue = writeQueue
    .then(
      () =>
        new Promise((resolve, reject) => {
          fs.appendFile(csvFilePath, line + "\n", { encoding: "utf8" }, (err) => {
            if (err) return reject(err);

            // Update in-memory state
            const newIndex = studentsLines.length;
            studentsLines.push(line);

            if (normalized.Legacy_ID) {
              const normId = normalizeNoWhitespace(normalized.Legacy_ID);
              legacyIdToLineIndex.set(normId, newIndex);
              const match = normalized.Legacy_ID.match(/^OLD(\d+)$/i);
              if (match) {
                maxLegacyIdNum = Math.max(maxLegacyIdNum, Number(match[1]));
              }
            }
            if (normalized.Email) {
              const normEmail = normalizeNoWhitespace(normalized.Email);
              emailToLineIndex.set(normEmail, newIndex);
            }

            resolve();
          });
        })
    )
    .catch((err) => {
      console.error("APPEND_QUEUE_ERROR:", err);
      throw err;
    });

  return writeQueue;
}

// --------------------
// LOGIN API
// --------------------
app.post("/login", async (req, res) => {
  try {
    console.log("Incoming Login:", req.body);

    const { input, email, password } = req.body || {};
    const loginInput = normalizeLoginValue(input || email);

    console.log("Students Loaded:", studentsLines.length);

    const student = findStudentByLoginInput(loginInput);

    console.log("Matched Student:", student);

    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const enteredPassword = normalizeLoginValue(password);
    const storedPassword = normalizeLoginValue(student["Password"]);

    const passwordValid = storedPassword
      ? storedPassword === enteredPassword
      : enteredPassword === "123456";

    console.log("Password Match:", passwordValid);

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    console.log("LOGIN RESULT: Successful authentication for", student["Legacy_ID"]);
    res.json({ success: true, student });
  } catch (error) {
    // TASK 8: Log detailed error using console.error
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// --------------------
// SIGNUP API
// --------------------
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    console.log("SIGNUP request:", { name, email });

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "name, email, and password are required",
      });
    }

    const existingStudent = await findStudent({ email });
    if (existingStudent) {
      return res.json({ success: false, message: "Email already exists" });
    }

    const newStudent = {
      Legacy_ID: await getNextLegacyId(),
      Enquiry_Date: today(),
      Student_Name: name,
      Email: email,
      Password: password,
      Phone: "",
      City: "",
      State: "",
      Interested_Course: "",
      Lead_Source: "Website",
      CRM_Status: "New Lead",
      Old_Status: "NEW",
      Priority: "Normal",
      Remarks: "Signed up from portal",
      Data_Quality_Flag: "Pending",
    };

    await appendNewStudentRowOnly(newStudent);

    res.json({ success: true, message: "Signup successful", student: newStudent });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------
// SUBMIT APPLICATION API (append-only, never rewrite)
// --------------------
app.post("/submit-application", async (req, res) => {
  try {
    console.log("SUBMIT_APPLICATION incoming body:", req.body);

    const body = req.body || {};
    const hasLegacy = Boolean(body.Legacy_ID);
    const hasEmail = Boolean(body.Email);

    if (!hasLegacy && !hasEmail) {
      return res.status(400).json({
        success: false,
        message: "Legacy_ID or Email is required to submit application",
      });
    }

    // Find if student exists. IMPORTANT: we will NOT rewrite existing records.
    const existingStudent = await findStudent({
      email: hasLegacy ? null : body.Email,
      legacyId: body.Legacy_ID,
    });

    console.log("SUBMIT_APPLICATION student found?:", Boolean(existingStudent));

    if (existingStudent) {
      const assignedCounsellor = assignRandomCounsellor();
      const updatedStudentRow = {
        ...existingStudent,
        ...body,
        CRM_Status: "Application Submitted",
        Old_Status: existingStudent.Old_Status || "NEW",
        Data_Quality_Flag: "Clean",
        Follow_Up_Date: today(),
        Counsellor_Name: existingStudent.Counsellor_Name || assignedCounsellor.name,
        Counsellor_Phone: existingStudent.Counsellor_Phone || assignedCounsellor.phone,
      };

      await appendNewStudentRowOnly(updatedStudentRow);
      createNotification({
        legacyId: updatedStudentRow.Legacy_ID,
        title: "Your application has been submitted",
        message: "Admission team received your application and will review it soon.",
        source: "Admissions",
        type: "application",
      });

      return res.json({
        success: true,
        message: "Application Submitted Successfully",
        student: updatedStudentRow,
        skipped: false,
      });
    }

    const assignedCounsellor = assignRandomCounsellor();

    const newStudentRow = {
      // generate unique ID safely for new rows only
      Legacy_ID: body.Legacy_ID || (await getNextLegacyId()),
      Enquiry_Date: body.Enquiry_Date || today(),
      // merge submitted fields
      ...body,

      // required/updated fields
      CRM_Status: "Application Submitted",
      Old_Status: "NEW",
      Data_Quality_Flag: "Clean",
      Follow_Up_Date: today(),
      Counsellor_Name: assignedCounsellor.name,
      Counsellor_Phone: assignedCounsellor.phone,
    };

    await appendNewStudentRowOnly(newStudentRow);
    createNotification({
      legacyId: newStudentRow.Legacy_ID,
      title: "Your application has been submitted",
      message: "Admission team received your application and will review it soon.",
      source: "Admissions",
      type: "application",
    });

    res.json({
      success: true,
      message: "Application Submitted Successfully",
      student: newStudentRow,
      skipped: false,
    });
  } catch (error) {
    console.error("SUBMIT_APPLICATION ERROR:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Server error",
    });
  }
});

// --------------------
// GET SINGLE STUDENT
// --------------------
app.get("/student", async (req, res) => {
  try {
    const student = await findStudent({
      email: req.query.email,
      legacyId: req.query.legacyId,
    });

    if (!student) {
      return res.json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, student });
  } catch (error) {
    console.error("GET STUDENT ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/student/profile", async (req, res) => {
  try {
    const { legacyId, updates } = req.body || {};

    if (!legacyId) {
      return res.status(400).json({ success: false, message: "Legacy_ID is required" });
    }

    const updatedStudent = await updateStudentProfileRow(legacyId, updates || {});

    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    createNotification({
      legacyId: updatedStudent.Legacy_ID,
      title: "Profile updated successfully",
      message: "Your admission profile details were saved.",
      source: "Profile",
      type: "profile",
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    console.error("UPDATE_PROFILE_ERROR:", error);
    res.status(400).json({
      success: false,
      message: error?.message || "Profile update failed",
    });
  }
});

app.get("/application-status", async (req, res) => {
  try {
    const student = await requireKnownStudent(req, res);
    if (!student) return;

    const documents = readJsonArray(documentsJsonPath).filter(
      (item) => item.legacyId === student.Legacy_ID
    );
    const payments = readJsonArray(paymentsJsonPath).filter(
      (item) => item.legacyId === student.Legacy_ID
    );

    const hasApplication = student.CRM_Status === "Application Submitted" || Boolean(student.Interested_Course);
    const documentsVerified = documents.length > 0 && documents.every((doc) => doc.status === "Verified");
    const paidAmount = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const isPaid = paidAmount > 0 || student.Old_Status === "Fee Paid" || student.Old_Status === "PAID";
    const statusText = student.CRM_Status || "New Lead";
    const approved = /approved|admission confirmed|accepted/i.test(statusText);
    const rejected = /rejected|lost/i.test(statusText);

    const steps = [
      { key: "submitted", label: "Application Submitted", complete: hasApplication },
      { key: "review", label: "Under Review", complete: hasApplication && !rejected },
      { key: "documents", label: "Documents Verified", complete: documentsVerified },
      { key: "counselor", label: "Counselor Review", complete: Boolean(student.Counsellor_Name) },
      { key: "fee", label: "Fee Pending", complete: isPaid, pending: !isPaid },
      { key: "approved", label: "Approved", complete: approved },
      { key: "rejected", label: "Rejected", complete: rejected, negative: rejected },
      { key: "confirmed", label: "Admission Confirmed", complete: /confirmed/i.test(statusText) && isPaid },
    ];

    res.json({
      success: true,
      application: {
        legacyId: student.Legacy_ID,
        status: statusText,
        course: student.Interested_Course,
        counsellorName: student.Counsellor_Name,
        counsellorPhone: student.Counsellor_Phone,
        submittedAt: student.Follow_Up_Date || student.Enquiry_Date,
        updatedAt: student.Follow_Up_Date || student.Enquiry_Date,
        remarks: student.Remarks,
        steps,
      },
    });
  } catch (error) {
    console.error("APPLICATION_STATUS_ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/payments", async (req, res) => {
  try {
    const student = await requireKnownStudent(req, res);
    if (!student) return;

    const allPayments = readJsonArray(paymentsJsonPath)
      .filter((item) => item.legacyId === student.Legacy_ID)
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    const feeByCourse = {
      "B.Tech CSE": 150000,
      BCA: 85000,
      "B.Com": 75000,
      MBA: 180000,
    };
    const totalFees = feeByCourse[student.Interested_Course] || 100000;
    const actualPaidAmount = allPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const isMarkedPaid = student.Old_Status === "Fee Paid" || student.Old_Status === "PAID";
    const paidAmount = isMarkedPaid && actualPaidAmount === 0 ? totalFees : actualPaidAmount;
    const remainingAmount = Math.max(totalFees - paidAmount, 0);
    const status =
      paidAmount >= totalFees || isMarkedPaid
        ? "Paid"
        : paidAmount > 0
          ? "Partial"
          : "Pending";

    res.json({
      success: true,
      payment: {
        legacyId: student.Legacy_ID,
        status,
        totalFees,
        paidAmount,
        remainingAmount,
        feeBreakdown: [
          { label: "Tuition Fee", amount: Math.round(totalFees * 0.75) },
          { label: "Registration Fee", amount: Math.round(totalFees * 0.1) },
          { label: "Library & Lab Fee", amount: Math.round(totalFees * 0.1) },
          { label: "Student Services", amount: totalFees - Math.round(totalFees * 0.95) },
        ],
        history: allPayments,
      },
    });
  } catch (error) {
    console.error("PAYMENTS_ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------
// GET STUDENTS PREVIEW (debug)
// --------------------
app.get("/students", (req, res) => {
  try {
    const limit = Number(req.query.limit || 100);
    const rows = [];
    const count = Math.min(limit, studentsLines.length);
    for (let i = 0; i < count; i++) {
      const parsed = parseCsvLine(studentsLines[i]);
      rows.push(rowToStudent(parsed));
    }
    res.json(rows);
  } catch (error) {
    console.error("GET STUDENTS PREVIEW ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------
// TEST API
// --------------------
app.get("/", (req, res) => {
  res.send("Admission CRM Backend Running");
});

// --------------------
// NOTIFICATIONS API
// --------------------
app.get("/notifications", async (req, res) => {
  try {
    const student = await requireKnownStudent(req, res);
    if (!student) return;

    const notifications = readJsonArray(notificationsJsonPath)
      .filter((item) => item.legacyId === student.Legacy_ID)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
    });
  } catch (error) {
    console.error("GET_NOTIFICATIONS_ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/notifications/:id/read", async (req, res) => {
  try {
    const student = await requireKnownStudent(req, res);
    if (!student) return;

    const rows = readJsonArray(notificationsJsonPath);
    const updatedRows = rows.map((item) =>
      item.id === req.params.id && item.legacyId === student.Legacy_ID
        ? { ...item, read: true, readAt: new Date().toISOString() }
        : item
    );

    writeJsonArray(notificationsJsonPath, updatedRows);
    res.json({ success: true });
  } catch (error) {
    console.error("MARK_NOTIFICATION_READ_ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/notifications/read-all", async (req, res) => {
  try {
    const student = await requireKnownStudent(req, res);
    if (!student) return;

    const now = new Date().toISOString();
    const rows = readJsonArray(notificationsJsonPath);
    const updatedRows = rows.map((item) =>
      item.legacyId === student.Legacy_ID ? { ...item, read: true, readAt: now } : item
    );

    writeJsonArray(notificationsJsonPath, updatedRows);
    res.json({ success: true });
  } catch (error) {
    console.error("MARK_ALL_NOTIFICATIONS_READ_ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------
// APPLICATION QUERIES API
// --------------------
app.get("/queries", async (req, res) => {
  try {
    const student = await requireKnownStudent(req, res);
    if (!student) return;

    const queries = readJsonArray(queriesJsonPath)
      .filter((item) => item.legacyId === student.Legacy_ID)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, queries });
  } catch (error) {
    console.error("GET_QUERIES_ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/queries", async (req, res) => {
  try {
    const student = await requireKnownStudent(req, res);
    if (!student) return;

    const { subject, message, priority } = req.body || {};

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required",
      });
    }

    const query = appendJsonRow(queriesJsonPath, {
      id: crypto.randomUUID(),
      legacyId: student.Legacy_ID,
      name: student.Student_Name,
      email: student.Email,
      subject: String(subject).trim(),
      message: String(message).trim(),
      priority: priority || "Normal",
      status: "Pending",
      response: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    createNotification({
      legacyId: student.Legacy_ID,
      title: "Your admission query was submitted",
      message: "Counselor/admin team will respond to your application query.",
      source: "Support",
      type: "query",
    });

    res.json({ success: true, query });
  } catch (error) {
    console.error("CREATE_QUERY_ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------
// DOCUMENT UPLOAD API
// --------------------
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const legacyId = safeLegacyId(req.body?.legacyId);
    const destination = path.join(studentDocumentsRoot, legacyId || "unknown");
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const typeSlug = String(req.body?.documentType || "document")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    cb(null, `${typeSlug}-${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

const uploadDocument = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedDocumentTypes.has(file.mimetype)) {
      cb(new Error("Only PDF, JPG, and PNG files are allowed"));
      return;
    }
    cb(null, true);
  },
});

app.get("/documents", async (req, res) => {
  try {
    const student = await requireKnownStudent(req, res);
    if (!student) return;

    const documents = readJsonArray(documentsJsonPath)
      .filter((item) => item.legacyId === student.Legacy_ID)
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json({ success: true, documentTypes, documents });
  } catch (error) {
    console.error("GET_DOCUMENTS_ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/documents/upload", uploadDocument.single("document"), async (req, res) => {
  try {
    const student = await requireKnownStudent(req, res);
    if (!student) {
      if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return;
    }

    const documentType = String(req.body?.documentType || "").trim().toLowerCase();

    if (!documentTypes.includes(documentType)) {
      if (req.file?.path) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Invalid document type",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    const documents = readJsonArray(documentsJsonPath);
    const withoutOldSameType = documents.filter(
      (item) => !(item.legacyId === student.Legacy_ID && item.documentType === documentType)
    );

    const document = {
      id: crypto.randomUUID(),
      legacyId: student.Legacy_ID,
      documentType,
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      status: "Pending",
      uploadedAt: new Date().toISOString(),
    };

    writeJsonArray(documentsJsonPath, [document, ...withoutOldSameType]);

    createNotification({
      legacyId: student.Legacy_ID,
      title: "Document uploaded successfully",
      message: `${req.file.originalname} is uploaded and pending verification.`,
      source: "Documents",
      type: "document",
    });

    res.json({ success: true, message: "Document uploaded successfully", document });
  } catch (error) {
    console.error("UPLOAD_DOCUMENT_ERROR:", error);
    res.status(500).json({ success: false, message: error?.message || "Upload failed" });
  }
});

app.get("/documents/file/:legacyId/:filename", async (req, res) => {
  try {
    const student = await requireKnownStudent(req, res);
    if (!student) return;

    if (student.Legacy_ID !== req.params.legacyId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const documents = readJsonArray(documentsJsonPath);
    const document = documents.find(
      (item) =>
        item.legacyId === student.Legacy_ID &&
        item.filename === req.params.filename
    );

    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    const filePath = path.join(studentDocumentsRoot, safeLegacyId(student.Legacy_ID), document.filename);
    res.sendFile(filePath);
  } catch (error) {
    console.error("GET_DOCUMENT_FILE_ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --------------------
// TICKETS API
// --------------------
const ticketsCsvPath = path.join(__dirname, "tickets.csv");

function escapeCsvValueTickets(value) {
  const stringValue = value === undefined || value === null ? "" : String(value);
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function ticketsRowFrom(t) {
  const headers = [
    "Ticket_ID",
    "Created_At",
    "Name",
    "Email",
    "Phone",
    "Subject",
    "Message",
    "Priority",
    "Status",
    "Legacy_ID",
  ];
  const map = {
    "Ticket_ID": t.ticketId,
    "Created_At": t.createdAt,
    "Name": t.name,
    "Email": t.email,
    "Phone": t.phone,
    "Subject": t.subject,
    "Message": t.message,
    "Priority": t.priority,
    "Status": t.status,
    "Legacy_ID": t.legacyId,
  };
  return headers.map((h) => escapeCsvValueTickets(map[h])).join(",");
}

app.post("/raise-ticket", async (req, res) => {
  try {
    const { name, email, phone, subject, message, priority, legacyId } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, and Message are required",
      });
    }

    const ticketId = `TCKT${Date.now()}`;
    const createdAt = new Date().toISOString();
    const status = "Open";
    const pr = priority || "Normal";

    const line = `${ticketsRowFrom({
      ticketId,
      createdAt,
      name,
      email,
      phone: phone || "",
      subject: subject || "Admission Support",
      message,
      priority: pr,
      status,
      legacyId: legacyId || "",
    })}\n`;

    fs.appendFileSync(ticketsCsvPath, line, { encoding: "utf8" });
    if (legacyId) {
      appendJsonRow(queriesJsonPath, {
        id: ticketId,
        legacyId,
        name,
        email,
        subject: subject || "Admission Support",
        message,
        priority: pr,
        status: "Pending",
        response: "",
        createdAt,
        updatedAt: createdAt,
      });
      createNotification({
        legacyId,
        title: "Your support ticket was submitted",
        message: "Counselor/admin team will review your admission query.",
        source: "Support",
        type: "query",
      });
    }

    res.json({
      success: true,
      message: "Ticket raised successfully",
      ticket: { ticketId, createdAt, status },
    });
  } catch (error) {
    console.error("RAISE_TICKET ERROR:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError || error?.message?.includes("PDF")) {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "File size must be 5MB or less"
          : error.message,
    });
  }

  next(error);
});

// --------------------
// START SERVER
// --------------------
initializeDatabase()
  .then(() => {
    app.listen(5000, () => {
      console.log("Backend server running on port 5000");
      console.log("Using students.csv at:", csvFilePath);
    });
  })
  .catch((err) => {
    console.error("Failed to start server due to database error:", err);
    process.exit(1);
  });
