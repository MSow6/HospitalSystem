"use client";

import { useMemo, useState } from "react";
import { useReception } from "@/lib/reception-store";
import { EyeIcon, SearchIcon } from "../reception/icons";
import { btnIcon, Card, Cell, Empty, Input, Row, Table } from "../reception/ui";
import DoctorPatientHistoryView from "./DoctorPatientHistoryView";

const columns = [
  "Patient",
  "ID",
  "Diagnoses",
  "Treatments",
  "Prescriptions",
  "Lab Requests",
  "Action",
];

function Metric({ label, value }) {
  return (
    <div className="rounded-panel border border-line bg-white px-4 py-3 shadow-panel">
      <p className="text-[10px] font-semibold uppercase tracking-label text-muted-soft">
        {label}
      </p>
      <p className="mt-1 text-[22px] font-semibold leading-none text-ink-soft">
        {value}
      </p>
    </div>
  );
}

export default function DoctorHistoryPanel() {
  const {
    patients,
    currentDoctor,
    getDiagnoses,
    getTreatments,
    getPrescriptions,
    getLabRequests,
  } = useReception();

  const [search, setSearch] = useState("");
  const [openPatientId, setOpenPatientId] = useState(null);

  const mine = useMemo(
    () =>
      patients.filter(
        (patient) => patient.assignedDoctorId === currentDoctor.workerId,
      ),
    [patients, currentDoctor.workerId],
  );

  // One line per patient: their record counts are summarised here and the
  // full consolidated history is one click away.
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return mine
      .filter((patient) => {
        if (!term) return true;
        return (
          String(patient.patientId).includes(term) ||
          patient.fullName.toLowerCase().includes(term) ||
          patient.phoneNumber.toLowerCase().includes(term)
        );
      })
      .map((patient) => {
        const diagnoses = getDiagnoses(patient.patientId);
        const treatments = getTreatments(patient.patientId);
        const prescriptions = getPrescriptions(patient.patientId);
        const labRequests = getLabRequests(patient.patientId);
        return {
          patient,
          diagnoses: diagnoses.length,
          treatments: treatments.length,
          prescriptions: prescriptions.length,
          labRequests: labRequests.length,
        };
      });
  }, [
    mine,
    search,
    getDiagnoses,
    getTreatments,
    getPrescriptions,
    getLabRequests,
  ]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          diagnoses: acc.diagnoses + row.diagnoses,
          treatments: acc.treatments + row.treatments,
          prescriptions: acc.prescriptions + row.prescriptions,
          labRequests: acc.labRequests + row.labRequests,
        }),
        { diagnoses: 0, treatments: 0, prescriptions: 0, labRequests: 0 },
      ),
    [rows],
  );

  if (openPatientId) {
    return (
      <DoctorPatientHistoryView
        onClose={() => setOpenPatientId(null)}
        patientId={openPatientId}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Patients" value={mine.length} />
        <Metric label="Diagnoses" value={totals.diagnoses} />
        <Metric label="Treatments" value={totals.treatments} />
        <Metric label="Prescriptions" value={totals.prescriptions} />
      </div>

      <Card
        actions={
          <div className="relative w-full sm:w-72">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft"
              size={15}
            />
            <Input
              className="pl-9"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, ID or phone"
              value={search}
            />
          </div>
        }
        subtitle="Only patients assigned to you are listed."
        title="Medical History"
      >
        {rows.length === 0 ? (
          <Empty>No patients match your search.</Empty>
        ) : (
          <Table columns={columns}>
            {rows.map((row) => (
              <Row
                key={row.patient.patientId}
                onClick={() => setOpenPatientId(row.patient.patientId)}
              >
                <Cell className="whitespace-nowrap text-ink">
                  {row.patient.fullName}
                </Cell>
                <Cell className="whitespace-nowrap">
                  {row.patient.patientId}
                </Cell>
                <Cell className="whitespace-nowrap">{row.diagnoses}</Cell>
                <Cell className="whitespace-nowrap">{row.treatments}</Cell>
                <Cell className="whitespace-nowrap">{row.prescriptions}</Cell>
                <Cell className="whitespace-nowrap">{row.labRequests}</Cell>
                <Cell>
                  <button
                    className={btnIcon}
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenPatientId(row.patient.patientId);
                    }}
                    type="button"
                  >
                    <EyeIcon size={14} />
                    View
                  </button>
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
