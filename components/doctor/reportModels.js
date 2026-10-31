import { formatTime, todayIso } from "@/lib/mock-data";
import { clamp, prettyDate } from "./reportFormat";

// Row caps keep every report on a single A4 sheet no matter how long the
// history or the reporting period runs; the overflow rolls into a "+n more"
// row instead of spilling onto a second page.
const PATIENT_MAX_ROWS = 6;
const PATIENT_MAX_LAB_TESTS = 8;
const ACTIVITY_MAX_ROWS = 5;
// Free text is trimmed to what fits on one printed line at these column widths.
const CLAMP_DIAGNOSIS = 34;
const CLAMP_FINDING = 58;
const CLAMP_TREATMENT = 38;
const CLAMP_MEDICINE = 30;
const CLAMP_RESULT = 60;
const CLAMP_TESTS = 46;

function stamp() {
  return `${prettyDate(todayIso())} ${formatTime(new Date())}`;
}

// Builds the medical report model for one patient straight from the live store
// snapshot, so the sheet always agrees with what the doctor sees on screen.
export function buildPatientReport(store, patientId) {
  const {
    getPatient,
    getDoctor,
    getDiagnoses,
    getTreatments,
    getPrescriptions,
    getLabRequests,
  } = store;

  const patient = getPatient(patientId);
  const patientTreatments = getTreatments(patientId);
  const treatmentById = new Map(
    patientTreatments.map((entry) => [entry.treatmentId, entry]),
  );

  const diagnoses = [...getDiagnoses(patientId)].sort((a, b) =>
    String(b.date).localeCompare(String(a.date)),
  );
  const treatments = [...patientTreatments].sort((a, b) =>
    String(b.startDate).localeCompare(String(a.startDate)),
  );
  const prescriptions = [...getPrescriptions(patientId)]
    .map((entry) => ({
      ...entry,
      issuedDate: treatmentById.get(entry.treatmentId)?.startDate ?? null,
    }))
    .sort((a, b) => String(b.issuedDate).localeCompare(String(a.issuedDate)));
  const labTests = getLabRequests(patientId)
    .flatMap((request) =>
      request.items.map((item) => ({
        testName: item.testName,
        result: item.result ?? "Awaiting result",
        resultDate: item.resultDate ?? request.requestDate,
      })),
    )
    .sort((a, b) => String(b.resultDate).localeCompare(String(a.resultDate)));

  const doctor = getDoctor(patient?.assignedDoctorId);

  return {
    generatedAt: stamp(),
    patient: {
      patientId,
      fullName: patient ? patient.fullName : `Patient ${patientId}`,
      dateOfBirth: patient?.dateOfBirth ?? null,
      gender: patient?.gender ?? "—",
      bloodGroup: patient?.bloodGroup ?? "Unknown",
      phoneNumber: patient?.phoneNumber ?? "—",
      address: patient?.address ?? "—",
      doctor: doctor?.name ?? "Unassigned",
    },
    totals: {
      consultations: diagnoses.length,
      activeTreatments: treatments.filter((entry) => entry.status === "Active")
        .length,
      prescriptions: prescriptions.length,
      labTests: labTests.length,
    },
    diagnoses: diagnoses.slice(0, PATIENT_MAX_ROWS).map((entry) => ({
      diagnosisId: entry.diagnosisId,
      date: prettyDate(entry.date),
      details: clamp(entry.details, CLAMP_DIAGNOSIS),
    })),
    diagnosesHidden: Math.max(diagnoses.length - PATIENT_MAX_ROWS, 0),
    treatments: treatments.slice(0, PATIENT_MAX_ROWS).map((entry) => ({
      treatmentId: entry.treatmentId,
      period: `${prettyDate(entry.startDate)} → ${prettyDate(entry.endDate)}`,
      status: entry.status,
    })),
    treatmentsHidden: Math.max(treatments.length - PATIENT_MAX_ROWS, 0),
    prescriptions: prescriptions.slice(0, PATIENT_MAX_ROWS).map((entry) => ({
      prescriptionId: entry.prescriptionId,
      medicine: clamp(entry.medicineName, CLAMP_MEDICINE),
      dosage: entry.dosage,
      quantity: entry.quantity,
      status: entry.status,
      issuedDate: prettyDate(entry.issuedDate),
    })),
    prescriptionsHidden: Math.max(prescriptions.length - PATIENT_MAX_ROWS, 0),
    labTests: labTests.slice(0, PATIENT_MAX_LAB_TESTS).map((entry, index) => ({
      key: `${entry.testName}-${index}`,
      testName: entry.testName,
      result: clamp(entry.result, CLAMP_RESULT),
      resultDate: prettyDate(entry.resultDate),
    })),
    labTestsHidden: Math.max(labTests.length - PATIENT_MAX_LAB_TESTS, 0),
  };
}

// Builds the activity model for the signed-in doctor over the chosen period.
// Figures come from the same store snapshot the screens read, so the printed
// sheet and the dashboard never disagree.
export function buildActivityReport(store, { from, to }) {
  const { currentDoctor, diagnoses, treatments, prescriptions, labRequests } =
    store;
  const doctorId = currentDoctor.workerId;
  const inRange = (value) => Boolean(value) && value >= from && value <= to;
  const nameOf = (patientId) =>
    store.getPatient(patientId)?.fullName ?? `Patient ${patientId}`;

  const treatmentById = new Map(
    treatments.map((entry) => [entry.treatmentId, entry]),
  );

  const periodDiagnoses = diagnoses
    .filter((entry) => entry.doctorId === doctorId && inRange(entry.date))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const periodTreatments = treatments
    .filter((entry) => entry.doctorId === doctorId && inRange(entry.startDate))
    .sort((a, b) => String(b.startDate).localeCompare(String(a.startDate)));

  const periodPrescriptions = prescriptions
    .filter((entry) => entry.doctorId === doctorId)
    .map((entry) => ({
      ...entry,
      issuedDate: treatmentById.get(entry.treatmentId)?.startDate ?? null,
    }))
    .filter((entry) => inRange(entry.issuedDate))
    .sort((a, b) => String(b.issuedDate).localeCompare(String(a.issuedDate)));

  const periodLabRequests = labRequests
    .filter(
      (entry) => entry.doctorId === doctorId && inRange(entry.requestDate),
    )
    .sort((a, b) => b.requestId - a.requestId);

  const completedLabs = labRequests.filter(
    (entry) => entry.doctorId === doctorId && inRange(entry.completedDate),
  );

  const patientIds = new Set([
    ...periodDiagnoses.map((entry) => entry.patientId),
    ...periodTreatments.map((entry) => entry.patientId),
  ]);

  return {
    periodText:
      from === to
        ? prettyDate(from)
        : `${prettyDate(from)} → ${prettyDate(to)}`,
    generatedAt: stamp(),
    doctor: {
      name: currentDoctor.fullName,
      role: currentDoctor.role,
      specialty: currentDoctor.specialty,
      room: currentDoctor.room,
    },
    totals: {
      patientsSeen: patientIds.size,
      consultations: periodDiagnoses.length,
      treatments: periodTreatments.length,
      prescriptions: periodPrescriptions.length,
      labsOrdered: periodLabRequests.length,
      labsCompleted: completedLabs.length,
    },
    consultations: periodDiagnoses.slice(0, ACTIVITY_MAX_ROWS).map((entry) => ({
      diagnosisId: entry.diagnosisId,
      date: prettyDate(entry.date),
      patient: nameOf(entry.patientId),
      finding: clamp(entry.details, CLAMP_FINDING),
    })),
    consultationsHidden: Math.max(
      periodDiagnoses.length - ACTIVITY_MAX_ROWS,
      0,
    ),
    treatmentRows: periodTreatments
      .slice(0, ACTIVITY_MAX_ROWS)
      .map((entry) => ({
        treatmentId: entry.treatmentId,
        period: `${prettyDate(entry.startDate)} → ${prettyDate(entry.endDate)}`,
        patient: nameOf(entry.patientId),
        details: clamp(entry.details, CLAMP_TREATMENT),
        status: entry.status,
      })),
    treatmentsHidden: Math.max(periodTreatments.length - ACTIVITY_MAX_ROWS, 0),
    prescriptionRows: periodPrescriptions
      .slice(0, ACTIVITY_MAX_ROWS)
      .map((entry) => ({
        prescriptionId: entry.prescriptionId,
        issuedDate: prettyDate(entry.issuedDate),
        patient: nameOf(entry.patientId),
        medicine: clamp(entry.medicineName, CLAMP_MEDICINE),
        dosage: entry.dosage,
        quantity: entry.quantity,
      })),
    prescriptionsHidden: Math.max(
      periodPrescriptions.length - ACTIVITY_MAX_ROWS,
      0,
    ),
    labRows: periodLabRequests.slice(0, ACTIVITY_MAX_ROWS).map((entry) => ({
      requestId: entry.requestId,
      date: prettyDate(entry.requestDate),
      patient: nameOf(entry.patientId),
      tests: clamp(
        entry.items.map((item) => item.testName).join(", "),
        CLAMP_TESTS,
      ),
      status: entry.status,
    })),
    labsHidden: Math.max(periodLabRequests.length - ACTIVITY_MAX_ROWS, 0),
  };
}
