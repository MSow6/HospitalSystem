"use client";

import { useState } from "react";
import { formatLeone } from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import { CheckIcon, XIcon } from "../reception/icons";
import {
  btn,
  Card,
  Cell,
  Field,
  Input,
  Row,
  StatusPill,
  Table,
} from "../reception/ui";

export default function LabRequestDetail({ request, onClose }) {
  const { currentTechnician, fileLabResults, getDoctor, getPatient } =
    useReception();
  const patient = getPatient(request.patientId);
  const doctor = getDoctor(request.doctorId);
  const isPending = request.status === "Pending";

  const [values, setValues] = useState(() =>
    Object.fromEntries(
      request.items.map((item) => [item.testId, item.result ?? ""]),
    ),
  );
  const [notes, setNotes] = useState(request.notes ?? "");

  const allFiled = request.items.every(
    (item) => (values[item.testId] ?? "").trim().length > 0,
  );

  function save() {
    fileLabResults({
      requestId: request.requestId,
      technicianId: currentTechnician.workerId,
      notes,
      results: request.items.map((item) => ({
        testId: item.testId,
        result: values[item.testId] ?? "",
      })),
    });
    onClose();
  }

  const facts = [
    { label: "Patient ID", value: request.patientId },
    { label: "Gender", value: patient?.gender ?? "—" },
    { label: "Date of Birth", value: patient?.dateOfBirth ?? "—" },
    { label: "Phone", value: patient?.phoneNumber ?? "—" },
    { label: "Blood Group", value: patient?.bloodGroup ?? "Unknown" },
    { label: "Address", value: patient?.address ?? "—" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Card
        actions={
          <button className={btn.secondary} onClick={onClose} type="button">
            <XIcon size={15} />
            Back to Requests
          </button>
        }
        className="self-start"
        subtitle={`Request #${request.requestId} · Raised ${request.requestDate}`}
        title={patient ? patient.fullName : `Patient ${request.patientId}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={request.status} />
          <span className="text-[12px] text-muted">
            Requested by {doctor ? doctor.name : "—"}
            {request.completedDate
              ? ` · Completed ${request.completedDate}`
              : ""}
          </span>
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
        subtitle={
          isPending
            ? "Enter the findings for every test, then save to complete the request."
            : "Results filed by the laboratory."
        }
        title="Tests & Results"
      >
        <Table columns={["Test", "Fee", "Result", "Filed"]}>
          {request.items.map((item) => (
            <Row key={item.testId}>
              <Cell className="whitespace-nowrap text-ink">
                {item.testName}
              </Cell>
              <Cell className="whitespace-nowrap">
                {formatLeone(item.price)}
              </Cell>
              <Cell>
                {isPending ? (
                  <Input
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [item.testId]: event.target.value,
                      }))
                    }
                    placeholder="Enter clinical findings..."
                    value={values[item.testId] ?? ""}
                  />
                ) : (
                  item.result ?? "—"
                )}
              </Cell>
              <Cell className="whitespace-nowrap">
                {item.resultDate ?? "—"}
              </Cell>
            </Row>
          ))}
        </Table>

        {isPending ? (
          <div className="mt-4 grid gap-4">
            <Field
              hint="Optional clinical notes that are stored with the report."
              label="Technician Observations / Notes"
            >
              <textarea
                className="min-h-20 w-full rounded-md border border-line bg-white px-3 py-2 text-[13px] text-ink shadow-control outline-none transition placeholder:text-muted-soft focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional laboratory notes..."
                value={notes}
              />
            </Field>

            <button
              className={`${btn.success} h-11 w-full`}
              disabled={!allFiled}
              onClick={save}
              type="button"
            >
              <CheckIcon size={16} />
              Save Results &amp; Complete Request
            </button>

            {!allFiled ? (
              <p className="text-[11px] text-muted-soft">
                Every test needs a result before the request can be completed.
              </p>
            ) : null}
          </div>
        ) : notes ? (
          <p className="mt-4 rounded-md border border-line-soft bg-surface-soft px-3 py-2.5 text-[12px] text-ink-soft">
            <span className="font-semibold text-muted">Technician notes: </span>
            {notes}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
