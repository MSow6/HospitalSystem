"use client";

import { useReception } from "@/lib/reception-store";
import { XIcon } from "../reception/icons";
import { btn, Card, Cell, Row, StatusPill, Table } from "../reception/ui";

export default function DoctorPatientLabView({ patientId, requests, onClose }) {
  const { getDoctor, getPatient } = useReception();
  const patient = getPatient(patientId);

  const facts = [
    { label: "Patient ID", value: patientId },
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
            Back to Lab Requests
          </button>
        }
        className="self-start"
        subtitle={`${requests.length} laboratory request(s) on record`}
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

      {requests.map((request) => (
        <Card
          actions={<StatusPill status={request.status} />}
          key={request.requestId}
          subtitle={`Raised ${request.requestDate} by ${
            getDoctor(request.doctorId)?.name ?? "—"
          }`}
          title={`Request #${request.requestId}`}
        >
          <Table columns={["Test", "Result", "Filed"]}>
            {request.items.map((item) => (
              <Row key={item.testId}>
                <Cell className="whitespace-nowrap text-ink">
                  {item.testName}
                </Cell>
                <Cell className={item.result ? "text-ink-soft" : "text-warning"}>
                  {item.result ?? "Awaiting result"}
                </Cell>
                <Cell className="whitespace-nowrap">{item.resultDate ?? "—"}</Cell>
              </Row>
            ))}
          </Table>

          {request.notes ? (
            <p className="mt-4 rounded-md border border-line-soft bg-surface-soft px-3 py-2.5 text-[12px] text-ink-soft">
              <span className="font-semibold text-muted">
                Technician notes:{" "}
              </span>
              {request.notes}
            </p>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
