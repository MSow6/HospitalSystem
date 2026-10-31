"use client";

import { useMemo, useState } from "react";
import { useReception } from "@/lib/reception-store";
import { formatLeone, isoDaysAgo } from "@/lib/mock-data";
import {
  CheckIcon,
  ClipboardPlusIcon,
  PlusIcon,
  StethoscopeIcon,
  TrashIcon,
  XIcon,
} from "../reception/icons";
import {
  btn,
  btnIconDanger,
  Card,
  Cell,
  Empty,
  Field,
  Input,
  Row,
  Select,
  StatusPill,
  Table,
} from "../reception/ui";

const TABS = [
  { key: "details", label: "Patient Details" },
  { key: "diagnoses", label: "Previous Diagnoses" },
  { key: "medication", label: "Previous Medication" },
  { key: "lab", label: "Laboratory Requests & Results" },
  { key: "diagnosis", label: "Diagnosis & Treatment Plan" },
];

const textareaClass =
  "w-full rounded-md border border-line bg-white px-3 py-2 text-[13px] leading-relaxed text-ink shadow-control outline-none transition placeholder:text-muted-soft hover:border-[#cfdcda] focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15";

function formatDay(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function ConsultationWorkspace({
  patientId,
  appointmentId,
  onClose,
}) {
  const {
    currentDoctor,
    getPatient,
    getDoctor,
    getDiagnoses,
    getTreatments,
    getPrescriptions,
    getLabRequests,
    labTests,
    inventory,
    sendLabRequest,
    finalizeConsultation,
    notify,
  } = useReception();

  const [tab, setTab] = useState("details");
  const patient = getPatient(patientId);
  const diagnoses = useMemo(
    () => getDiagnoses(patientId),
    [getDiagnoses, patientId],
  );
  const treatments = useMemo(
    () => getTreatments(patientId),
    [getTreatments, patientId],
  );
  const prescriptions = useMemo(
    () => getPrescriptions(patientId),
    [getPrescriptions, patientId],
  );
  const labRequests = useMemo(
    () => getLabRequests(patientId),
    [getLabRequests, patientId],
  );
  // Informational only: a pending test never blocks the consultation, since not
  // every patient needs laboratory work to be diagnosed and treated.
  const pendingLabs = labRequests.some(
    (request) => request.status === "Pending",
  );

  const [selectedTests, setSelectedTests] = useState({});
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [startDate, setStartDate] = useState(() => isoDaysAgo(0));
  const [endDate, setEndDate] = useState(() => isoDaysAgo(-7));
  const [medDraft, setMedDraft] = useState({
    medicineName: inventory[0]?.medicineName ?? "",
    dosage: "1 tablet daily",
    quantity: "10",
  });
  const [prescDraft, setPrescDraft] = useState([]);

  if (!patient) {
    return (
      <Card title="Consultation Workspace">
        <Empty>This patient record could not be found.</Empty>
      </Card>
    );
  }

  function toggleTest(testId) {
    setSelectedTests((current) => ({
      ...current,
      [testId]: !current[testId],
    }));
  }

  function sendLab() {
    const chosen = labTests.filter((test) => selectedTests[test.testId]);
    if (chosen.length === 0) {
      notify("Select at least one laboratory test to request.");
      return;
    }
    sendLabRequest({
      patientId,
      doctorId: currentDoctor.workerId,
      appointmentId,
      items: chosen.map((test) => ({
        testId: test.testId,
        testName: test.testName,
        price: test.price,
      })),
    });
    setSelectedTests({});
  }

  function addMedicine() {
    const quantity = Number(medDraft.quantity);
    if (!medDraft.medicineName) {
      notify("Choose a medicine to prescribe.");
      return;
    }
    if (!medDraft.dosage.trim()) {
      notify("Add the dosage instructions.");
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      notify("Quantity must be a positive whole number.");
      return;
    }
    setPrescDraft((current) => [...current, { ...medDraft, quantity }]);
    setMedDraft((current) => ({
      ...current,
      dosage: "1 tablet daily",
      quantity: "10",
    }));
  }

  function removeMedicine(index) {
    setPrescDraft((current) => current.filter((_, i) => i !== index));
  }

  function finalize() {
    if (!diagnosis.trim()) {
      notify("Please provide the diagnosis details.");
      return;
    }
    if (!treatment.trim()) {
      notify("Please provide treatment advice.");
      return;
    }
    if (!startDate || !endDate) {
      notify("Start and end dates are required.");
      return;
    }
    if (endDate < startDate) {
      notify("End date cannot be before the start date.");
      return;
    }
    finalizeConsultation({
      patientId,
      doctorId: currentDoctor.workerId,
      appointmentId,
      diagnosisDetails: diagnosis.trim(),
      treatmentDetails: treatment.trim(),
      startDate,
      endDate,
      prescriptions: prescDraft,
    });
    onClose();
  }

  return (
    <Card
      actions={
        <button className={btn.danger} onClick={onClose} type="button">
          <XIcon size={15} />
          Close Workspace
        </button>
      }
      subtitle={`${patient.fullName} · ID ${patient.patientId} · ${currentDoctor.room}`}
      title={
        <span className="inline-flex items-center gap-2">
          <StethoscopeIcon className="text-brand-600" size={16} />
          Consultation Workspace
        </span>
      }
    >
      <div className="mb-4 flex flex-wrap gap-1.5 rounded-lg border border-line-soft bg-surface-soft p-1">
        {TABS.map((item) => (
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

      {tab === "details" ? (
        <section className="rounded-lg border border-line-soft bg-surface-soft px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-label text-muted">
            Patient Demographics
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Date of Birth",
                value: formatDay(patient.dateOfBirth),
              },
              { label: "Gender", value: patient.gender },
              { label: "Phone", value: patient.phoneNumber },
              {
                label: "Blood Group",
                value: patient.bloodGroup ?? "Unknown",
              },
              { label: "Address", value: patient.address },
              {
                label: "Assigned Doctor",
                value:
                  getDoctor(patient.assignedDoctorId)?.name ?? "Unassigned",
              },
            ].map((fact) => (
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
        </section>
      ) : null}

      {tab === "diagnoses" ? (
        <section>
          <h3 className="mb-2 text-[12px] font-bold uppercase tracking-label text-muted">
            Previous Diagnoses
          </h3>
          {diagnoses.length === 0 ? (
            <Empty>No recorded diagnoses for this patient.</Empty>
          ) : (
            <Table columns={["Date", "Details", "Doctor"]}>
              {diagnoses.map((entry) => (
                <Row key={entry.diagnosisId}>
                  <Cell className="whitespace-nowrap">
                    {formatDay(entry.date)}
                  </Cell>
                  <Cell className="text-ink">{entry.details}</Cell>
                  <Cell>{getDoctor(entry.doctorId)?.name ?? "—"}</Cell>
                </Row>
              ))}
            </Table>
          )}
        </section>
      ) : null}

      {tab === "medication" ? (
        <div className="grid gap-4">
          <section>
            <h3 className="mb-2 text-[12px] font-bold uppercase tracking-label text-muted">
              Treatments &amp; Prescriptions
            </h3>
            {treatments.length === 0 ? (
              <Empty>No recorded treatments for this patient.</Empty>
            ) : (
              <Table columns={["Period", "Details", "Status"]}>
                {treatments.map((entry) => (
                  <Row key={entry.treatmentId}>
                    <Cell className="whitespace-nowrap">
                      {formatDay(entry.startDate)}
                      <span className="block text-[11px] text-muted-soft">
                        to {formatDay(entry.endDate)}
                      </span>
                    </Cell>
                    <Cell className="text-ink">{entry.details}</Cell>
                    <Cell>
                      <StatusPill status={entry.status} />
                    </Cell>
                  </Row>
                ))}
              </Table>
            )}
          </section>

          {prescriptions.length > 0 ? (
            <section>
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-label text-muted">
                Prescription History
              </h3>
              <Table columns={["Medicine", "Dosage", "Qty", "Status"]}>
                {prescriptions.map((entry) => (
                  <Row key={entry.prescriptionId}>
                    <Cell className="text-ink">{entry.medicineName}</Cell>
                    <Cell>{entry.dosage}</Cell>
                    <Cell>{entry.quantity}</Cell>
                    <Cell>
                      <StatusPill status={entry.status} />
                    </Cell>
                  </Row>
                ))}
              </Table>
            </section>
          ) : null}
        </div>
      ) : null}

      {tab === "lab" ? (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section>
            <h3 className="mb-2 text-[12px] font-bold uppercase tracking-label text-muted">
              Laboratory Request Log
            </h3>
            {labRequests.length === 0 ? (
              <Empty>No laboratory requests for this patient yet.</Empty>
            ) : (
              <div className="grid gap-3">
                {labRequests.map((request) => (
                  <div
                    className="rounded-lg border border-line-soft bg-white px-4 py-3"
                    key={request.requestId}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-semibold text-ink">
                        Request #{request.requestId}
                        <span className="ml-2 text-muted-soft">
                          {formatDay(request.requestDate)}
                        </span>
                      </span>
                      <StatusPill status={request.status} />
                    </div>
                    <ul className="mt-2 flex flex-col divide-y divide-line-soft">
                      {request.items.map((item) => (
                        <li className="py-2 text-[12px]" key={item.testId}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-ink-soft">
                              {item.testName}
                            </span>
                            <span className="text-muted-soft">
                              {formatLeone(item.price)}
                            </span>
                          </div>
                          <p
                            className={`mt-0.5 ${
                              item.result ? "text-ink-soft" : "text-warning"
                            }`}
                          >
                            {item.result ??
                              "Awaiting result from the laboratory"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-line-soft bg-surface-soft px-4 py-3">
            <h3 className="text-[12px] font-bold uppercase tracking-label text-muted">
              Create Laboratory Request
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {labTests.map((test) => (
                <label
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-line-soft bg-white px-3 py-2 text-[12px]"
                  key={test.testId}
                >
                  <span className="flex items-center gap-2">
                    <input
                      checked={Boolean(selectedTests[test.testId])}
                      className="h-4 w-4 accent-brand-600"
                      onChange={() => toggleTest(test.testId)}
                      type="checkbox"
                    />
                    <span className="font-medium text-ink-soft">
                      {test.testName}
                    </span>
                  </span>
                  <span className="text-muted-soft">
                    {formatLeone(test.price)}
                  </span>
                </label>
              ))}
            </div>
            <button
              className={`${btn.secondary} mt-3 w-full`}
              onClick={sendLab}
              type="button"
            >
              <ClipboardPlusIcon size={15} />
              Send Lab Request
            </button>
            <p
              className={`mt-3 rounded-md px-3 py-2 text-[11px] font-semibold ${
                pendingLabs
                  ? "bg-[#fff4e5] text-warning"
                  : "bg-[#e7f6ec] text-success"
              }`}
            >
              {pendingLabs
                ? "Laboratory results are still pending. You can finalise now — results will be added to the record."
                : "No laboratory tests are pending for this patient."}
            </p>
          </section>
        </div>
      ) : null}

      {tab === "diagnosis" ? (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="flex flex-col gap-4">
            <Field label="Diagnosis Details">
              <textarea
                className={textareaClass}
                onChange={(event) => setDiagnosis(event.target.value)}
                placeholder="Describe the clinical findings and diagnosis…"
                rows={4}
                value={diagnosis}
              />
            </Field>
            <Field label="Treatment Advice / Plan">
              <textarea
                className={textareaClass}
                onChange={(event) => setTreatment(event.target.value)}
                placeholder="Advice, medication plan, follow-up instructions…"
                rows={4}
                value={treatment}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <Input
                  onChange={(event) => setStartDate(event.target.value)}
                  type="date"
                  value={startDate}
                />
              </Field>
              <Field label="End Date">
                <Input
                  min={startDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  type="date"
                  value={endDate}
                />
              </Field>
            </div>

            <button
              className={`${btn.success} h-11 w-full`}
              onClick={finalize}
              type="button"
            >
              <CheckIcon size={16} />
              Finalise Consultation
            </button>
          </section>

          <section className="rounded-lg border border-line-soft bg-surface-soft px-4 py-3">
            <h3 className="text-[12px] font-bold uppercase tracking-label text-muted">
              Prescribe Medications
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              <Field label="Medicine (from stock)">
                <Select
                  onChange={(event) =>
                    setMedDraft((current) => ({
                      ...current,
                      medicineName: event.target.value,
                    }))
                  }
                  value={medDraft.medicineName}
                >
                  {inventory.map((medicine) => (
                    <option
                      key={medicine.medicineId}
                      value={medicine.medicineName}
                    >
                      {medicine.medicineName} — stock {medicine.quantity}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Dosage">
                  <Input
                    onChange={(event) =>
                      setMedDraft((current) => ({
                        ...current,
                        dosage: event.target.value,
                      }))
                    }
                    value={medDraft.dosage}
                  />
                </Field>
                <Field label="Quantity">
                  <Input
                    min="1"
                    onChange={(event) =>
                      setMedDraft((current) => ({
                        ...current,
                        quantity: event.target.value,
                      }))
                    }
                    type="number"
                    value={medDraft.quantity}
                  />
                </Field>
              </div>
              <button
                className={btn.secondary}
                onClick={addMedicine}
                type="button"
              >
                <PlusIcon size={15} />
                Add Medicine
              </button>

              {prescDraft.length === 0 ? (
                <Empty>No medicines added to this prescription yet.</Empty>
              ) : (
                <ul className="flex flex-col divide-y divide-line-soft rounded-md border border-line-soft bg-white">
                  {prescDraft.map((item, index) => (
                    <li
                      className="flex items-center justify-between gap-3 px-3 py-2"
                      key={`${item.medicineName}-${index}`}
                    >
                      <span className="text-[12px]">
                        <span className="font-medium text-ink">
                          {item.medicineName}
                        </span>
                        <span className="ml-2 text-muted-soft">
                          {item.dosage} · ×{item.quantity}
                        </span>
                      </span>
                      <button
                        aria-label="Remove medicine"
                        className={btnIconDanger}
                        onClick={() => removeMedicine(index)}
                        type="button"
                      >
                        <TrashIcon size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </Card>
  );
}
