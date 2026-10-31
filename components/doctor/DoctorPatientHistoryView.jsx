"use client";

import { useState } from "react";
import { useReception } from "@/lib/reception-store";
import { PrinterIcon, XIcon } from "../reception/icons";
import {
  btn,
  Card,
  Cell,
  Empty,
  Row,
  StatusPill,
  Table,
} from "../reception/ui";
import MedicalReportViewer from "./MedicalReportViewer";
import { buildPatientReport } from "./reportModels";

const RECORD_TABS = [
  { key: "diagnoses", label: "Diagnoses" },
  { key: "treatments", label: "Treatments" },
  { key: "prescriptions", label: "Prescriptions" },
  { key: "laboratory", label: "Laboratory" },
];

export default function DoctorPatientHistoryView({ patientId, onClose }) {
  const store = useReception();
  const {
    getDiagnoses,
    getDoctor,
    getLabRequests,
    getPatient,
    getPrescriptions,
    getTreatments,
  } = store;
  const patient = getPatient(patientId);
  const [tab, setTab] = useState("diagnoses");
  const [showReport, setShowReport] = useState(false);

  const diagnoses = getDiagnoses(patientId);
  const treatments = getTreatments(patientId);
  const prescriptions = getPrescriptions(patientId);
  const labRequests = getLabRequests(patientId);

  // The printable sheet is built from the same live store the screen reads, so
  // the report and the tabs on this page always tell the same story.
  async function renderBlob(liveStore) {
    const [{ pdf }, { default: PatientMedicalReportDocument }] =
      await Promise.all([
        import("@react-pdf/renderer"),
        import("./PatientMedicalReportDocument"),
      ]);
    const model = buildPatientReport(liveStore, patientId);
    return pdf(<PatientMedicalReportDocument {...model} />).toBlob();
  }

  const facts = [
    { label: "Patient ID", value: patientId },
    { label: "Gender", value: patient?.gender ?? "—" },
    { label: "Date of Birth", value: patient?.dateOfBirth ?? "—" },
    { label: "Phone", value: patient?.phoneNumber ?? "—" },
    { label: "Blood Group", value: patient?.bloodGroup ?? "Unknown" },
    {
      label: "Assigned Doctor",
      value: getDoctor(patient?.assignedDoctorId)?.name ?? "Unassigned",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Card
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={btn.primary}
              onClick={() => setShowReport(true)}
              type="button"
            >
              <PrinterIcon size={15} />
              Print Medical Report
            </button>
            <button className={btn.secondary} onClick={onClose} type="button">
              <XIcon size={15} />
              Back to Patients
            </button>
          </div>
        }
        className="self-start"
        subtitle={patient?.address ?? `Patient ID ${patientId}`}
        title={patient ? patient.fullName : `Patient ${patientId}`}
      >
        <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-[10px] font-semibold uppercase tracking-label text-muted-soft">
                {fact.label}
              </dt>
              <dd className="mt-0.5 text-[13px] font-medium text-ink-soft">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card
        subtitle="Switch between record types for this patient."
        title="Clinical Records"
      >
        <div className="mb-4 flex flex-wrap gap-1.5 rounded-lg border border-line-soft bg-surface-soft p-1">
          {RECORD_TABS.map((item) => (
            <button
              className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition ${
                tab === item.key
                  ? "bg-white text-brand-700 shadow-control"
                  : "text-muted hover:text-ink"
              }`}
              key={item.key}
              onClick={() => setTab(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "diagnoses" ? (
          diagnoses.length === 0 ? (
            <Empty>No recorded diagnoses.</Empty>
          ) : (
            <Table columns={["Date", "Details", "Doctor"]}>
              {diagnoses.map((entry) => (
                <Row key={entry.diagnosisId}>
                  <Cell className="whitespace-nowrap">{entry.date}</Cell>
                  <Cell className="text-ink">{entry.details}</Cell>
                  <Cell className="whitespace-nowrap">
                    {getDoctor(entry.doctorId)?.name ?? "—"}
                  </Cell>
                </Row>
              ))}
            </Table>
          )
        ) : null}

        {tab === "treatments" ? (
          treatments.length === 0 ? (
            <Empty>No recorded treatments.</Empty>
          ) : (
            <Table columns={["Start", "End", "Details", "Status"]}>
              {treatments.map((entry) => (
                <Row key={entry.treatmentId}>
                  <Cell className="whitespace-nowrap">{entry.startDate}</Cell>
                  <Cell className="whitespace-nowrap">{entry.endDate}</Cell>
                  <Cell className="text-ink">{entry.details}</Cell>
                  <Cell>
                    <StatusPill status={entry.status} />
                  </Cell>
                </Row>
              ))}
            </Table>
          )
        ) : null}

        {tab === "prescriptions" ? (
          prescriptions.length === 0 ? (
            <Empty>No prescriptions on record.</Empty>
          ) : (
            <Table columns={["Medicine", "Dosage", "Qty", "Status"]}>
              {prescriptions.map((entry) => (
                <Row key={entry.prescriptionId}>
                  <Cell className="text-ink">{entry.medicineName}</Cell>
                  <Cell className="whitespace-nowrap">{entry.dosage}</Cell>
                  <Cell className="whitespace-nowrap">{entry.quantity}</Cell>
                  <Cell>
                    <StatusPill status={entry.status} />
                  </Cell>
                </Row>
              ))}
            </Table>
          )
        ) : null}

        {tab === "laboratory" ? (
          labRequests.length === 0 ? (
            <Empty>No laboratory requests on record.</Empty>
          ) : (
            <Table columns={["Request", "Date", "Tests", "Status"]}>
              {labRequests.map((request) => (
                <Row key={request.requestId}>
                  <Cell className="whitespace-nowrap">
                    #{request.requestId}
                  </Cell>
                  <Cell className="whitespace-nowrap">
                    {request.requestDate}
                  </Cell>
                  <Cell className="text-ink">
                    {request.items.map((item) => item.testName).join(", ")}
                  </Cell>
                  <Cell>
                    <StatusPill status={request.status} />
                  </Cell>
                </Row>
              ))}
            </Table>
          )
        ) : null}
      </Card>

      {showReport ? (
        <MedicalReportViewer
          onClose={() => setShowReport(false)}
          renderBlob={renderBlob}
          renderKey={`patient-${patientId}`}
          title="Patient Medical Report"
        />
      ) : null}
    </div>
  );
}
