"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import {
  appointments as seedAppointments,
  currentUser,
  diagnoses as seedDiagnoses,
  doctorUser,
  doctors,
  inventory,
  labRequests as seedLabRequests,
  labTechnicianUser,
  labTests,
  patients as seedPatients,
  payments as seedPayments,
  prescriptions as seedPrescriptions,
  queueEntries as seedQueue,
  receipts as seedReceipts,
  services,
  treatments as seedTreatments,
} from "./mock-data";
import { formatTime, todayIso } from "./mock-data";

// One live clinic store shared by every role panel. Reception and the Doctor
// dashboard read and write the same patients, appointments, queue and clinical
// records, so an action taken at one desk shows up immediately at the other.
const ReceptionContext = createContext(null);

const MAX_NOTIFICATIONS = 12;

function nextId(list, key) {
  return list.reduce((highest, item) => Math.max(highest, item[key]), 0) + 1;
}

function log(state, message) {
  const entry = `[${formatTime(new Date())}] ${message}`;
  return [entry, ...state.notifications].slice(0, MAX_NOTIFICATIONS);
}

// The queue is automatic. A registered patient belongs on today's queue unless
// they hold an appointment that falls on another day — those patients belong to
// that day's queue and drop onto it by themselves once the day arrives.
function belongsOnTodayQueue(state, patient, today) {
  const elsewhere = state.appointments.some(
    (appointment) =>
      appointment.patientId === patient.patientId &&
      appointment.status !== "Cancelled" &&
      appointment.date !== today,
  );
  return !elsewhere;
}

const initialState = {
  patients: seedPatients,
  appointments: seedAppointments,
  queue: seedQueue,
  payments: seedPayments,
  receipts: seedReceipts,
  diagnoses: seedDiagnoses,
  treatments: seedTreatments,
  prescriptions: seedPrescriptions,
  labRequests: seedLabRequests,
  notifications: [
    `[08:12:44] Welcome to the Receptionist Control Panel.`,
    `[08:12:45] ${seedQueue.filter((entry) => entry.status === "Waiting").length} patient(s) waiting in today's queue.`,
  ],
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD_PATIENT": {
      const patient = {
        ...action.patient,
        patientId: nextId(state.patients, "patientId"),
      };
      return {
        ...state,
        patients: [patient, ...state.patients],
        notifications: log(
          state,
          `Registered new patient ${patient.fullName} (ID ${patient.patientId}).`,
        ),
      };
    }

    case "UPDATE_PATIENT":
      return {
        ...state,
        patients: state.patients.map((patient) =>
          patient.patientId === action.patientId
            ? { ...patient, ...action.changes }
            : patient,
        ),
        notifications: log(
          state,
          `Patient ${action.patientId} details updated.`,
        ),
      };

    case "DELETE_PATIENT": {
      const patient = state.patients.find(
        (entry) => entry.patientId === action.patientId,
      );
      return {
        ...state,
        patients: state.patients.filter(
          (entry) => entry.patientId !== action.patientId,
        ),
        appointments: state.appointments.filter(
          (entry) => entry.patientId !== action.patientId,
        ),
        queue: state.queue.filter(
          (entry) => entry.patientId !== action.patientId,
        ),
        notifications: log(
          state,
          `Patient ${patient ? patient.fullName : action.patientId} removed.`,
        ),
      };
    }

    case "BOOK_APPOINTMENT": {
      const appointment = {
        ...action.appointment,
        appointmentId: nextId(state.appointments, "appointmentId"),
        status: "Scheduled",
      };
      const patient = state.patients.find(
        (entry) => entry.patientId === appointment.patientId,
      );
      return {
        ...state,
        appointments: [appointment, ...state.appointments],
        notifications: log(
          state,
          `Appointment booked for ${patient ? patient.fullName : appointment.patientId} at ${appointment.time}.`,
        ),
      };
    }

    case "SET_APPOINTMENT_STATUS": {
      const appointment = state.appointments.find(
        (entry) => entry.appointmentId === action.appointmentId,
      );
      const patient = state.patients.find(
        (entry) => entry.patientId === appointment?.patientId,
      );
      return {
        ...state,
        appointments: state.appointments.map((entry) =>
          entry.appointmentId === action.appointmentId
            ? { ...entry, status: action.status }
            : entry,
        ),
        notifications: log(
          state,
          `Appointment ${action.appointmentId} marked ${action.status}${
            patient ? ` for ${patient.fullName}` : ""
          }.`,
        ),
      };
    }

    case "SYNC_QUEUE": {
      const today = action.today ?? todayIso();
      // Anything already in the queue (even completed) is left untouched so a
      // patient is never queued twice and finished visits are not resurrected.
      const known = new Set(state.queue.map((entry) => entry.patientId));
      let nextQueueId = nextId(state.queue, "queueId");
      const additions = [];

      state.patients.forEach((patient) => {
        if (known.has(patient.patientId)) return;
        // Money first: a patient only joins the queue once today's payment has
        // been settled, so the queue never holds an unpaid patient.
        const paidToday = state.payments.some(
          (payment) =>
            payment.patientId === patient.patientId && payment.date === today,
        );
        if (!paidToday) return;
        if (!belongsOnTodayQueue(state, patient, today)) return;

        const appointmentToday = state.appointments.find(
          (appointment) =>
            appointment.patientId === patient.patientId &&
            appointment.status !== "Cancelled" &&
            appointment.date === today,
        );

        additions.push({
          queueId: nextQueueId++,
          patientId: patient.patientId,
          appointmentId: appointmentToday?.appointmentId ?? null,
          doctorId: appointmentToday?.doctorId ?? null,
          status: "Waiting",
          paid: true,
          queuedAt: formatTime(new Date()).slice(0, 5),
        });
      });

      if (additions.length === 0) return state;

      return {
        ...state,
        queue: [...state.queue, ...additions],
      };
    }

    case "SET_QUEUE_STATUS": {
      const entry = state.queue.find((item) => item.queueId === action.queueId);
      const patient = state.patients.find(
        (item) => item.patientId === entry?.patientId,
      );
      return {
        ...state,
        queue: state.queue.map((item) =>
          item.queueId === action.queueId
            ? { ...item, status: action.status }
            : item,
        ),
        notifications: log(
          state,
          `${patient ? patient.fullName : `Queue ${action.queueId}`} is now ${action.status}.`,
        ),
      };
    }

    case "REMOVE_FROM_QUEUE":
      return {
        ...state,
        queue: state.queue.filter((entry) => entry.queueId !== action.queueId),
        notifications: log(state, `Queue entry ${action.queueId} removed.`),
      };

    case "RECORD_PAYMENT": {
      const payment = {
        ...action.payment,
        paymentId: nextId(state.payments, "paymentId"),
        date: todayIso(),
        status: "Paid",
        billedBy: currentUser.workerId,
      };
      const receipt = {
        receiptId: nextId(state.receipts, "receiptId"),
        paymentId: payment.paymentId,
        issueDate: `${todayIso()} ${formatTime(new Date())}`,
        printedBy: currentUser.workerId,
      };
      const patient = state.patients.find(
        (entry) => entry.patientId === payment.patientId,
      );
      // The registration fee can arrive bundled inside another payment type,
      // so check the line items as well as the payment type. Once billed, the
      // patient is flagged as registered so it is never charged twice.
      const settledRegistration =
        payment.paymentType === "Registration" ||
        (payment.items ?? []).some((item) => item.type === "Registration");
      return {
        ...state,
        patients: settledRegistration
          ? state.patients.map((entry) =>
              entry.patientId === payment.patientId
                ? {
                    ...entry,
                    registrationPaid: true,
                    registrationPaidAt: payment.date,
                  }
                : entry,
            )
          : state.patients,
        payments: [payment, ...state.payments],
        receipts: [receipt, ...state.receipts],
        notifications: log(
          state,
          `Payment of ${payment.amount} recorded for ${patient ? patient.fullName : payment.patientId} (receipt ${receipt.receiptId}).`,
        ),
      };
    }

    case "SEND_LAB_REQUEST": {
      const request = {
        requestId: nextId(state.labRequests, "requestId"),
        patientId: action.patientId,
        doctorId: action.doctorId,
        appointmentId: action.appointmentId ?? null,
        requestDate: todayIso(),
        status: "Pending",
        // Each test starts with no result; the laboratory fills these in later.
        items: action.items.map((item) => ({
          testId: item.testId,
          testName: item.testName,
          price: item.price,
          result: null,
          technicianId: null,
          resultDate: null,
        })),
      };
      const patient = state.patients.find(
        (entry) => entry.patientId === action.patientId,
      );
      return {
        ...state,
        labRequests: [request, ...state.labRequests],
        notifications: log(
          state,
          `Laboratory request ${request.requestId} sent for ${
            patient ? patient.fullName : action.patientId
          } — ${request.items.length} test(s).`,
        ),
      };
    }

    case "FILE_LAB_RESULTS": {
      const request = state.labRequests.find(
        (entry) => entry.requestId === action.requestId,
      );
      if (!request) return state;

      const patient = state.patients.find(
        (entry) => entry.patientId === request.patientId,
      );
      // Each test keeps its own result row; unfilled tests are left untouched.
      const filedItems = request.items.map((item) => {
        const result = action.results.find(
          (entry) => entry.testId === item.testId,
        );
        if (!result || !result.result.trim()) return item;
        return {
          ...item,
          result: result.result.trim(),
          technicianId: action.technicianId,
          resultDate: todayIso(),
        };
      });

      return {
        ...state,
        labRequests: state.labRequests.map((entry) =>
          entry.requestId === action.requestId
            ? {
                ...entry,
                status: "Completed",
                notes: action.notes?.trim() ?? "",
                completedDate: todayIso(),
                items: filedItems,
              }
            : entry,
        ),
        notifications: log(
          state,
          `Request ${action.requestId} completed for ${
            patient ? patient.fullName : request.patientId
          } — ${filedItems.filter((item) => item.result).length} result(s) filed.`,
        ),
      };
    }

    case "FINALIZE_CONSULTATION": {
      const diagnosisId = nextId(state.diagnoses, "diagnosisId");
      const treatmentId = nextId(state.treatments, "treatmentId");
      let nextPrescriptionId = nextId(state.prescriptions, "prescriptionId");
      const patient = state.patients.find(
        (entry) => entry.patientId === action.patientId,
      );
      const newPrescriptions = (action.prescriptions ?? []).map((item) => ({
        prescriptionId: nextPrescriptionId++,
        treatmentId,
        patientId: action.patientId,
        doctorId: action.doctorId,
        medicineName: item.medicineName,
        dosage: item.dosage,
        quantity: item.quantity,
        status: "Pending",
      }));
      const diagnosis = {
        diagnosisId,
        appointmentId: action.appointmentId ?? null,
        patientId: action.patientId,
        doctorId: action.doctorId,
        details: action.diagnosisDetails,
        date: todayIso(),
      };
      const treatment = {
        treatmentId,
        diagnosisId,
        patientId: action.patientId,
        doctorId: action.doctorId,
        details: action.treatmentDetails,
        startDate: action.startDate,
        endDate: action.endDate,
        status: "Active",
      };
      return {
        ...state,
        diagnoses: [diagnosis, ...state.diagnoses],
        treatments: [treatment, ...state.treatments],
        prescriptions: [...newPrescriptions, ...state.prescriptions],
        // Finishing the consultation completes the appointment and frees the
        // patient from the live queue in one move.
        appointments: action.appointmentId
          ? state.appointments.map((entry) =>
              entry.appointmentId === action.appointmentId
                ? { ...entry, status: "Completed" }
                : entry,
            )
          : state.appointments,
        queue: state.queue.map((entry) =>
          entry.patientId === action.patientId && entry.status !== "Completed"
            ? { ...entry, status: "Completed" }
            : entry,
        ),
        notifications: log(
          state,
          `Consultation finalised for ${
            patient ? patient.fullName : action.patientId
          }. Diagnosis ${diagnosisId} recorded${
            newPrescriptions.length
              ? `, ${newPrescriptions.length} medicine(s) prescribed`
              : ""
          }.`,
        ),
      };
    }

    case "NOTIFY":
      return { ...state, notifications: log(state, action.message) };

    default:
      return state;
  }
}

export function ReceptionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Keep today's queue in sync automatically: recording a payment, registering a
  // patient, booking an appointment for today, or the calendar rolling over to a
  // booked day all pull the affected patients onto the queue without any manual
  // step. Patients stay off the queue until their payment is settled.
  useEffect(() => {
    dispatch({ type: "SYNC_QUEUE" });
  }, [state.patients, state.appointments, state.payments]);

  const value = useMemo(() => {
    const getPatient = (patientId) =>
      state.patients.find((patient) => patient.patientId === patientId) ?? null;
    const getDoctor = (doctorId) =>
      doctors.find((doctor) => doctor.workerId === doctorId) ?? null;
    const getAppointment = (appointmentId) =>
      state.appointments.find(
        (appointment) => appointment.appointmentId === appointmentId,
      ) ?? null;
    const getPayment = (paymentId) =>
      state.payments.find((payment) => payment.paymentId === paymentId) ?? null;
    const getReceipt = (receiptId) =>
      state.receipts.find((receipt) => receipt.receiptId === receiptId) ?? null;
    const getDiagnoses = (patientId) =>
      state.diagnoses.filter((entry) => entry.patientId === patientId);
    const getTreatments = (patientId) =>
      state.treatments.filter((entry) => entry.patientId === patientId);
    const getPrescriptions = (patientId) =>
      state.prescriptions.filter((entry) => entry.patientId === patientId);
    const getLabRequests = (patientId) =>
      state.labRequests.filter((entry) => entry.patientId === patientId);

    return {
      ...state,
      doctors,
      services,
      labTests,
      inventory,
      currentUser,
      currentDoctor: doctorUser,
      currentTechnician: labTechnicianUser,
      getPatient,
      getDoctor,
      getAppointment,
      getPayment,
      getReceipt,
      getDiagnoses,
      getTreatments,
      getPrescriptions,
      getLabRequests,

      addPatient: (patient) => dispatch({ type: "ADD_PATIENT", patient }),
      updatePatient: (patientId, changes) =>
        dispatch({ type: "UPDATE_PATIENT", patientId, changes }),
      deletePatient: (patientId) =>
        dispatch({ type: "DELETE_PATIENT", patientId }),

      bookAppointment: (appointment) =>
        dispatch({ type: "BOOK_APPOINTMENT", appointment }),
      setAppointmentStatus: (appointmentId, status) =>
        dispatch({ type: "SET_APPOINTMENT_STATUS", appointmentId, status }),

      setQueueStatus: (queueId, status) =>
        dispatch({ type: "SET_QUEUE_STATUS", queueId, status }),
      removeFromQueue: (queueId) =>
        dispatch({ type: "REMOVE_FROM_QUEUE", queueId }),

      recordPayment: (payment) => dispatch({ type: "RECORD_PAYMENT", payment }),
      sendLabRequest: (request) =>
        dispatch({ type: "SEND_LAB_REQUEST", ...request }),
      fileLabResults: (results) =>
        dispatch({ type: "FILE_LAB_RESULTS", ...results }),
      finalizeConsultation: (consultation) =>
        dispatch({ type: "FINALIZE_CONSULTATION", ...consultation }),
      notify: (message) => dispatch({ type: "NOTIFY", message }),
    };
  }, [state]);

  return (
    <ReceptionContext.Provider value={value}>
      {children}
    </ReceptionContext.Provider>
  );
}

export function useReception() {
  const context = useContext(ReceptionContext);
  if (!context) {
    throw new Error("useReception must be used inside a ReceptionProvider");
  }
  return context;
}
