"use client";

import { useMemo, useState } from "react";
import { useReception } from "@/lib/reception-store";
import {
  CheckIcon,
  ChevronDownIcon,
  SpeakerIcon,
  StethoscopeIcon,
  XIcon,
} from "./icons";
import {
  btn,
  btnIcon,
  btnIconDanger,
  Card,
  Cell,
  Empty,
  Row,
  StatusPill,
  Table,
} from "./ui";

const columns = ["#", "Patient", "Doctor", "Status", "Actions"];

export default function QueuePanel() {
  const {
    queue,
    setQueueStatus,
    removeFromQueue,
    getPatient,
    getAppointment,
    getDoctor,
    notify,
  } = useReception();

  const [showCompleted, setShowCompleted] = useState(false);

  const ordered = useMemo(() => {
    const rank = { Waiting: 0, Called: 1, "In Consultation": 2, Completed: 3 };
    return [...queue].sort((a, b) => {
      if (rank[a.status] !== rank[b.status])
        return rank[a.status] - rank[b.status];
      return a.queuedAt.localeCompare(b.queuedAt);
    });
  }, [queue]);

  const active = ordered.filter((entry) => entry.status !== "Completed");
  const completed = ordered.filter((entry) => entry.status === "Completed");
  const waiting = active.filter((entry) => entry.status === "Waiting");
  const inProgress = active.filter(
    (entry) => entry.status === "In Consultation",
  );
  const standing = active.filter(
    (entry) => entry.status === "Waiting" || entry.status === "Called",
  );

  function positionOf(entry) {
    const index = standing.findIndex((item) => item.queueId === entry.queueId);
    return index === -1 ? null : index + 1;
  }

  function doctorNameFor(entry) {
    const appointment = entry.appointmentId
      ? getAppointment(entry.appointmentId)
      : null;
    const patient = getPatient(entry.patientId);
    return (
      getDoctor(
        appointment?.doctorId ?? entry.doctorId ?? patient?.assignedDoctorId,
      )?.name ?? "Unassigned"
    );
  }

  function callNext() {
    const next = waiting[0];
    if (!next) {
      notify("No patients are waiting in the queue.");
      return;
    }
    setQueueStatus(next.queueId, "Called");
  }

  function callEntry(entry) {
    setQueueStatus(entry.queueId, "Called");
  }

  function routeToDoctor(entry) {
    setQueueStatus(entry.queueId, "In Consultation");
  }

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-3 gap-3 self-start">
        <div className="rounded-panel border border-line bg-white px-4 py-3 shadow-panel">
          <dt className="text-[11px] uppercase tracking-label text-muted">
            Waiting
          </dt>
          <dd className="text-2xl font-bold text-warning">{waiting.length}</dd>
        </div>
        <div className="rounded-panel border border-line bg-white px-4 py-3 shadow-panel">
          <dt className="text-[11px] uppercase tracking-label text-muted">
            In Room
          </dt>
          <dd className="text-2xl font-bold text-[#6b3fbf]">
            {inProgress.length}
          </dd>
        </div>
        <div className="rounded-panel border border-line bg-white px-4 py-3 shadow-panel">
          <dt className="text-[11px] uppercase tracking-label text-muted">
            Completed
          </dt>
          <dd className="text-2xl font-bold text-success">
            {completed.length}
          </dd>
        </div>
      </dl>

      <Card
        className="self-start"
        actions={
          <button className={btn.success} onClick={callNext} type="button">
            <SpeakerIcon size={15} />
            Call Next Patient
          </button>
        }
        subtitle="Patients appear here automatically once their payment is settled — on their appointment day or after registering today."
        title="Queue Management"
      >
        {active.length === 0 ? (
          <Empty>No patients are waiting right now.</Empty>
        ) : (
          <Table colSpan={columns.length} columns={columns}>
            {active.map((entry) => {
              const patient = getPatient(entry.patientId);
              const position = positionOf(entry);
              const canRoute =
                entry.status === "Waiting" || entry.status === "Called";
              return (
                <Row key={entry.queueId}>
                  <Cell className="whitespace-nowrap">
                    <span className="text-sm font-bold text-ink">
                      {position ? `#${position}` : "—"}
                    </span>
                    <span className="block text-[11px] text-muted-soft">
                      {entry.queuedAt}
                    </span>
                  </Cell>
                  <Cell>
                    <span className="font-medium text-ink">
                      {patient ? patient.fullName : entry.patientId}
                    </span>
                    {patient ? (
                      <span className="block text-[11px] text-muted-soft">
                        ID {patient.patientId}
                      </span>
                    ) : null}
                  </Cell>
                  <Cell>{doctorNameFor(entry)}</Cell>
                  <Cell>
                    <StatusPill status={entry.status} />
                  </Cell>
                  <Cell>
                    <div className="flex items-center gap-1.5">
                      <button
                        aria-label="Call patient"
                        className={`${btnIcon} !px-2`}
                        disabled={entry.status !== "Waiting"}
                        onClick={() => callEntry(entry)}
                        title="Call patient"
                        type="button"
                      >
                        <SpeakerIcon size={14} />
                      </button>
                      <button
                        aria-label="Send in to doctor"
                        className={`${btnIcon} !px-2`}
                        disabled={!canRoute}
                        onClick={() => routeToDoctor(entry)}
                        title="Send in to doctor"
                        type="button"
                      >
                        <StethoscopeIcon size={14} />
                      </button>
                      <button
                        aria-label="Mark completed"
                        className={`${btnIcon} !px-2`}
                        onClick={() =>
                          setQueueStatus(entry.queueId, "Completed")
                        }
                        title="Mark completed"
                        type="button"
                      >
                        <CheckIcon size={14} />
                      </button>
                      <button
                        aria-label="Remove from queue"
                        className={`${btnIconDanger} !px-2`}
                        onClick={() => removeFromQueue(entry.queueId)}
                        title="Remove from queue"
                        type="button"
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  </Cell>
                </Row>
              );
            })}
          </Table>
        )}

        {completed.length > 0 ? (
          <div className="mt-4 border-t border-line-soft pt-3">
            <button
              className="flex w-full items-center justify-between text-[12px] font-semibold text-muted transition hover:text-ink"
              onClick={() => setShowCompleted((current) => !current)}
              type="button"
            >
              <span>Completed today ({completed.length})</span>
              <ChevronDownIcon
                className={`transition-transform ${
                  showCompleted ? "rotate-180" : ""
                }`}
                size={15}
              />
            </button>
            {showCompleted ? (
              <ul className="mt-2 flex flex-col divide-y divide-line-soft">
                {completed.map((entry) => {
                  const patient = getPatient(entry.patientId);
                  return (
                    <li
                      className="flex items-center justify-between gap-3 py-2 text-[12px]"
                      key={entry.queueId}
                    >
                      <span className="text-ink">
                        {patient ? patient.fullName : entry.patientId}
                        <span className="ml-2 text-muted-soft">
                          {doctorNameFor(entry)}
                        </span>
                      </span>
                      <button
                        aria-label="Remove from list"
                        className={btnIconDanger}
                        onClick={() => removeFromQueue(entry.queueId)}
                        type="button"
                      >
                        <XIcon size={13} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
