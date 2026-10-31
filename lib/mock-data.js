// Temporary in-memory data for the frontend build.
// Everything here will be replaced by PostgreSQL queries once the backend is added.
// Shapes intentionally mirror the future database tables so the swap is a drop-in.

export const currentUser = {
  usersId: 3,
  workerId: 3,
  username: "receptionist",
  fullName: "Receptionist Staff",
  role: "Receptionist",
  email: "receptionist@clinic.com",
  phone: "+232-76-000002",
  gender: "Female",
  address: "Clinic Campus, Freetown",
  status: "Active",
  lastLogin: "2026-10-30 08:12:44",
};

export const roles = [
  "Administrator",
  "Receptionist",
  "Doctor",
  "Laboratory Technician",
  "Pharmacist",
  "Accountant",
];

export const doctors = [
  {
    workerId: 2,
    name: "Dr. Alhaji Mawiya Sow",
    specialty: "General Medicine",
    room: "Room 1",
  },
  {
    workerId: 7,
    name: "Dr. Aminata Kamara",
    specialty: "Pediatrics",
    room: "Room 2",
  },
  {
    workerId: 8,
    name: "Dr. Ibrahim Conteh",
    specialty: "Internal Medicine",
    room: "Room 3",
  },
  {
    workerId: 9,
    name: "Dr. Fatmata Sesay",
    specialty: "Obstetrics & Gynecology",
    room: "Room 4",
  },
];

// Fixed clinic fees. These will be editable from the Admin dashboard later,
// so every screen must read the prices from here instead of hard-coding them.
export const clinicFees = {
  registration: 50000,
  consultation: 100000,
};

export const services = [
  { serviceId: 1, serviceName: "Registration", price: clinicFees.registration },
  { serviceId: 2, serviceName: "Consultation", price: clinicFees.consultation },
  { serviceId: 3, serviceName: "X-Ray", price: 250000 },
  { serviceId: 4, serviceName: "ECG", price: 300000 },
];

export const labTests = [
  { testId: 1, testName: "Malaria Test", price: 30000 },
  { testId: 2, testName: "Blood Sugar", price: 40000 },
  { testId: 3, testName: "Urine Test", price: 20000 },
  { testId: 4, testName: "Stool Test", price: 20000 },
  { testId: 5, testName: "Full Blood Count", price: 80000 },
];

export const paymentMethods = [
  "Cash",
  "Orange Money",
  "Afrimoney",
  "Bank Transfer",
  "Insurance",
];

export const paymentTypes = [
  "Registration",
  "Consultation",
  "Laboratory",
  "Medicines",
];

// Patients who already have billing history in the seed ledger, so their
// one-off registration fee has been settled already.
const SETTLED_REGISTRATION_IDS = [1001, 1002, 1003, 1004];

export const patients = [
  {
    patientId: 1001,
    fullName: "Mohamed Sesay",
    dateOfBirth: "1987-04-12",
    gender: "Male",
    phoneNumber: "+232-76-112233",
    address: "12 Kissy Road, Freetown",
    bloodGroup: "O+",
    assignedDoctorId: 2,
    registrationDate: isoDaysAgo(2),
  },
  {
    patientId: 1002,
    fullName: "Isatu Bangura",
    dateOfBirth: "1994-09-03",
    gender: "Female",
    phoneNumber: "+232-77-445566",
    address: "5 Wilberforce Street, Freetown",
    bloodGroup: "A+",
    assignedDoctorId: 7,
    registrationDate: isoDaysAgo(2),
  },
  {
    patientId: 1003,
    fullName: "Abu Bakarr Koroma",
    dateOfBirth: "1975-01-27",
    gender: "Male",
    phoneNumber: "+232-78-778899",
    address: "34 Circular Road, Freetown",
    bloodGroup: "B+",
    assignedDoctorId: 8,
    registrationDate: isoDaysAgo(1),
  },
  {
    patientId: 1004,
    fullName: "Mariama Jalloh",
    dateOfBirth: "2003-06-15",
    gender: "Female",
    phoneNumber: "+232-76-334455",
    address: "9 Sanders Street, Freetown",
    bloodGroup: "AB+",
    assignedDoctorId: 9,
    registrationDate: isoDaysAgo(1),
  },
  {
    patientId: 1005,
    fullName: "Samuel Kargbo",
    dateOfBirth: "1969-11-08",
    gender: "Male",
    phoneNumber: "+232-80-223344",
    address: "77 Bai Bureh Road, Freetown",
    bloodGroup: "O-",
    assignedDoctorId: 2,
    registrationDate: isoDaysAgo(0),
  },
  {
    patientId: 1006,
    fullName: "Zainab Turay",
    dateOfBirth: "1998-02-19",
    gender: "Female",
    phoneNumber: "+232-79-556677",
    address: "21 Pademba Road, Freetown",
    bloodGroup: "A-",
    assignedDoctorId: 7,
    registrationDate: isoDaysAgo(0),
  },
  {
    patientId: 1007,
    fullName: "Ibrahim Fofanah",
    dateOfBirth: "1983-07-30",
    gender: "Male",
    phoneNumber: "+232-76-889900",
    address: "3 Spur Loop, Freetown",
    bloodGroup: "B-",
    assignedDoctorId: 8,
    registrationDate: isoDaysAgo(0),
  },
  {
    patientId: 1008,
    fullName: "Aminata Dumbuya",
    dateOfBirth: "2011-03-22",
    gender: "Female",
    phoneNumber: "+232-77-110022",
    address: "48 Old Railway Line, Freetown",
    bloodGroup: "O+",
    assignedDoctorId: 9,
    registrationDate: isoDaysAgo(0),
  },
].map((patient) => ({
  ...patient,
  // Mirrors the future patients.registration_fee_paid / registration_paid_at
  // columns: the flag is the durable signal that decides whether the one-off
  // registration fee still applies to this patient.
  registrationPaid: SETTLED_REGISTRATION_IDS.includes(patient.patientId),
  registrationPaidAt: SETTLED_REGISTRATION_IDS.includes(patient.patientId)
    ? patient.registrationDate
    : null,
}));

export const appointments = [
  {
    appointmentId: 501,
    patientId: 1001,
    doctorId: 2,
    date: isoDaysAgo(0),
    time: "09:00",
    status: "Completed",
  },
  {
    appointmentId: 502,
    patientId: 1002,
    doctorId: 7,
    date: isoDaysAgo(0),
    time: "09:30",
    status: "Completed",
  },
  {
    appointmentId: 503,
    patientId: 1003,
    doctorId: 8,
    date: isoDaysAgo(0),
    time: "10:15",
    status: "Scheduled",
  },
  {
    appointmentId: 504,
    patientId: 1004,
    doctorId: 9,
    date: isoDaysAgo(0),
    time: "11:00",
    status: "Scheduled",
  },
  {
    appointmentId: 505,
    patientId: 1005,
    doctorId: 2,
    date: isoDaysAgo(0),
    time: "11:45",
    status: "Scheduled",
  },
  {
    appointmentId: 506,
    patientId: 1006,
    doctorId: 7,
    date: isoDaysAgo(0),
    time: "13:30",
    status: "Scheduled",
  },
  {
    appointmentId: 507,
    patientId: 1007,
    doctorId: 8,
    date: isoDaysAgo(0),
    time: "14:15",
    status: "Scheduled",
  },
];

export const queueEntries = [
  {
    queueId: 1,
    patientId: 1003,
    appointmentId: 503,
    status: "Waiting",
    paid: true,
    queuedAt: "10:10",
  },
  {
    queueId: 2,
    patientId: 1004,
    appointmentId: 504,
    status: "Waiting",
    paid: true,
    queuedAt: "10:55",
  },
  {
    queueId: 3,
    patientId: 1007,
    appointmentId: 507,
    status: "Waiting",
    paid: false,
    queuedAt: "14:02",
  },
  {
    queueId: 4,
    patientId: 1005,
    appointmentId: 505,
    status: "In Consultation",
    paid: true,
    queuedAt: "11:38",
  },
];

export const payments = [
  {
    paymentId: 9001,
    patientId: 1001,
    paymentType: "Consultation",
    amount: 150000,
    method: "Cash",
    date: isoDaysAgo(0),
    status: "Paid",
    billedBy: 3,
    note: "Consultation + registration",
  },
  {
    paymentId: 9002,
    patientId: 1002,
    paymentType: "Consultation",
    amount: 130000,
    method: "Orange Money",
    date: isoDaysAgo(0),
    status: "Paid",
    billedBy: 3,
    note: "Consultation fee",
  },
  {
    paymentId: 9003,
    patientId: 1003,
    paymentType: "Registration",
    amount: 100000,
    method: "Cash",
    date: isoDaysAgo(0),
    status: "Paid",
    billedBy: 3,
    note: "Walk-in registration",
  },
  {
    paymentId: 9004,
    patientId: 1004,
    paymentType: "Laboratory",
    amount: 180000,
    method: "Afrimoney",
    date: isoDaysAgo(0),
    status: "Paid",
    billedBy: 3,
    note: "Malaria + Full Blood Count",
  },
];

export const receipts = [
  {
    receiptId: 7001,
    paymentId: 9001,
    issueDate: `${isoDaysAgo(0)} 09:12`,
    printedBy: 3,
  },
  {
    receiptId: 7002,
    paymentId: 9002,
    issueDate: `${isoDaysAgo(0)} 09:44`,
    printedBy: 3,
  },
  {
    receiptId: 7003,
    paymentId: 9003,
    issueDate: `${isoDaysAgo(0)} 10:20`,
    printedBy: 3,
  },
  {
    receiptId: 7004,
    paymentId: 9004,
    issueDate: `${isoDaysAgo(0)} 11:05`,
    printedBy: 3,
  },
];

// The signed-in doctor. Mirrors the future Health_Workers row plus the session
// info carried over from the login screen for the Doctor dashboard.
export const doctorUser = {
  usersId: 2,
  workerId: 2,
  username: "doctor",
  fullName: "Dr. Alhaji Mawiya Sow",
  role: "Doctor",
  specialty: "General Medicine",
  room: "Room 1",
  email: "doctor_sow@clinic.com",
  phone: "+232-76-987654",
  gender: "Male",
  address: "Clinic Campus, Freetown",
  status: "Active",
  lastLogin: "2026-10-31 08:02:11",
};

export const labTechnicianUser = {
  usersId: 5,
  workerId: 5,
  username: "lab",
  fullName: "Fatmata Koroma",
  role: "Laboratory Technician",
  specialty: "Medical Laboratory Science",
  room: "Laboratory",
  email: "lab_koroma@clinic.com",
  phone: "+232-76-334455",
  gender: "Female",
  address: "Clinic Campus, Freetown",
  status: "Active",
  lastLogin: "2026-11-01 07:58:02",
};

// Pharmacy stock the doctor draws from when prescribing. Mirrors Inventory.
export const inventory = [
  {
    medicineId: 1,
    medicineName: "Artemether/Lumefantrine 20/120mg",
    quantity: 84,
    sellingPrice: 25000,
  },
  {
    medicineId: 2,
    medicineName: "Amlodipine 5mg",
    quantity: 3,
    sellingPrice: 18000,
  },
  {
    medicineId: 3,
    medicineName: "Paracetamol 500mg",
    quantity: 240,
    sellingPrice: 5000,
  },
  {
    medicineId: 4,
    medicineName: "Amoxicillin 500mg",
    quantity: 60,
    sellingPrice: 22000,
  },
  {
    medicineId: 5,
    medicineName: "Metformin 500mg",
    quantity: 40,
    sellingPrice: 15000,
  },
  {
    medicineId: 6,
    medicineName: "Ciprofloxacin 500mg",
    quantity: 4,
    sellingPrice: 26000,
  },
];

// Clinical records. Shapes mirror the Diagnosis / Treatment / Prescription tables.
export const diagnoses = [
  {
    diagnosisId: 1,
    appointmentId: null,
    patientId: 1001,
    doctorId: 2,
    details: "Acute uncomplicated malaria (P. falciparum).",
    date: isoDaysAgo(40),
  },
  {
    diagnosisId: 2,
    appointmentId: null,
    patientId: 1005,
    doctorId: 2,
    details: "Stage 1 hypertension, no end-organ damage.",
    date: isoDaysAgo(20),
  },
  {
    diagnosisId: 3,
    appointmentId: 501,
    patientId: 1001,
    doctorId: 2,
    details: "Follow-up: malaria resolved. Mild iron-deficiency anaemia.",
    date: isoDaysAgo(2),
  },
];

export const treatments = [
  {
    treatmentId: 1,
    diagnosisId: 1,
    patientId: 1001,
    doctorId: 2,
    details:
      "Artemether/Lumefantrine 6 doses over 3 days, oral rehydration and rest.",
    startDate: isoDaysAgo(40),
    endDate: isoDaysAgo(37),
    status: "Completed",
  },
  {
    treatmentId: 2,
    diagnosisId: 2,
    patientId: 1005,
    doctorId: 2,
    details:
      "Amlodipine 5mg once daily, low-salt diet and a 30-minute daily walk.",
    startDate: isoDaysAgo(20),
    endDate: isoDaysAgo(-70),
    status: "Active",
  },
  {
    treatmentId: 3,
    diagnosisId: 3,
    patientId: 1001,
    doctorId: 2,
    details:
      "Ferrous sulphate 200mg twice daily for 30 days; repeat FBC in 4 weeks.",
    startDate: isoDaysAgo(2),
    endDate: isoDaysAgo(-28),
    status: "Active",
  },
];

export const prescriptions = [
  {
    prescriptionId: 1,
    treatmentId: 1,
    patientId: 1001,
    doctorId: 2,
    medicineName: "Artemether/Lumefantrine 20/120mg",
    dosage: "4 tablets twice daily",
    quantity: 24,
    status: "Dispensed",
  },
  {
    prescriptionId: 2,
    treatmentId: 2,
    patientId: 1005,
    doctorId: 2,
    medicineName: "Amlodipine 5mg",
    dosage: "1 tablet daily",
    quantity: 30,
    status: "Pending",
  },
  {
    prescriptionId: 3,
    treatmentId: 3,
    patientId: 1001,
    doctorId: 2,
    medicineName: "Ferrous sulphate 200mg",
    dosage: "1 tablet twice daily",
    quantity: 60,
    status: "Dispensed",
  },
];

// Laboratory requests and their per-test results. One request carries several
// tests, mirroring Laboratory_Requests with Laboratory_Results line items.
export const labRequests = [
  {
    requestId: 2,
    patientId: 1001,
    doctorId: 2,
    appointmentId: 501,
    requestDate: isoDaysAgo(2),
    status: "Completed",
    items: [
      {
        testId: 1,
        testName: "Malaria Test",
        price: 30000,
        result: "Positive — P. falciparum trophozoites seen.",
        technicianId: 5,
        resultDate: isoDaysAgo(2),
      },
      {
        testId: 5,
        testName: "Full Blood Count",
        price: 80000,
        result: "Hb 10.4 g/dL (low), WBC 6.1, platelets 210.",
        technicianId: 5,
        resultDate: isoDaysAgo(2),
      },
    ],
  },
  {
    requestId: 1,
    patientId: 1005,
    doctorId: 2,
    appointmentId: 505,
    requestDate: isoDaysAgo(0),
    status: "Pending",
    items: [
      {
        testId: 5,
        testName: "Full Blood Count",
        price: 80000,
        result: null,
        technicianId: null,
        resultDate: null,
      },
      {
        testId: 2,
        testName: "Blood Sugar",
        price: 40000,
        result: null,
        technicianId: null,
        resultDate: null,
      },
    ],
  },
];

export const CLINIC = {
  name: "Physical Health Clinic",
  address: "24 Siaka Stevens Street, Freetown, Sierra Leone",
  phone: "+232-76-000000",
  email: "billing@physicalhealthclinic.com",
};

export function formatLeone(amount) {
  return `Le ${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatTime(date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Seed dates are generated relative to the current day so the "today" filters
// and the daily summary always have data to work with, whatever day it is.
export function isoDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}
