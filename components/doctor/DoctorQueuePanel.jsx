"use client";

import { useMemo, useState } from "react";
import { useReception } from "@/lib/reception-store";
import { CheckIcon, SpeakerIcon, StethoscopeIcon } from "../reception/icons";
import {
  btn,
  btnIcon,
  Card,
  Cell,
  Empty,
  Row,
  StatusPill,
  Table,
} from "../reception/ui";
import ConsultationWorkspace from "./ConsultationWorkspace";

const columns = ["#", "Patient", "Status", "Actions"];

export default function DoctorQueuePanel() {
  const {
    queue,
    currentDoctor,
    getPatient,
    getAppointment,
    setQueueStatus,
    notify,
  } = useReception();

  const [active, setActive] = useState(null);

  function doctorIdFor(entry) {
    const appointment = entry.appointmentId
      ? getAppointment(entry.appointmentId)
      : null;
    const patient = getPatient(entry.patientId);
    return (
      appointment?.doctorId ??
      entry.doctorId ??
      patient?.assignedDoctorId ??
      null
    );
  }

  const mine = useMemo(() => {
    const rank = { Waiting: 0, Called: 1, "In Consultation": 2, Completed: 3 };
    return queue
      .filter((entry) => doctorIdFor(entry) === currentDoctor.workerId)
      .sort((a, b) => {
        if (rank[a.status] !== rank[b.status])
          return rank[a.status] - rank[b.status];
        return a.queuedAt.localeCompare(b.queuedAt);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, currentDoctor.workerId]);

  const standing = mine.filter(
    (entry) => entry.status === "Waiting" || entry.status === "Called",
  );
  const inRoom = mine.filter((entry) => entry.status === "In Consultation");
  const completed = mine.filter((entry) => entry.status === "Completed");

  function positionOf(entry) {
    const index = standing.findIndex((item) => item.queueId === entry.queueId);
    return index === -1 ? null : index + 1;
  }

  function openRoom(entry) {
    if (entry.status === "Waiting" || entry.status === "Called") {
      setQueueStatus(entry.queueId, "In Consultation");
    }
    setActive({
      patientId: entry.patientId,
      appointmentId: entry.appointmentId ?? null,
    });
  }

  function callNext() {
    if (!standing[0]) {
      notify("No patients are waiting in your queue.");
      return;
    }
    setQueueStatus(standing[0].queueId, "Called");
  }

  if (active) {
    return (
      <ConsultationWorkspace
        appointmentId={active.appointmentId}
        onClose={() => setActive(null)}
        patientId={active.patientId}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-3 gap-3 self-start">
        <div className="rounded-panel border border-line bg-white px-4 py-3 shadow-panel">
          <dt className="text-[11px] uppercase tracking-label text-muted">
            Waiting
          </dt>
          <dd className="text-2xl font-bold text-warning">{standing.length}</dd>
        </div>
        <div className="rounded-panel border border-line bg-white px-4 py-3 shadow-panel">
          <dt className="text-[11px] uppercase tracking-label text-muted">
            In Room
          </dt>
          <dd className="text-2xl font-bold text-[#6b3fbf]">{inRoom.length}</dd>
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
        actions={
          <button className={btn.success} onClick={callNext} type="button">
            <SpeakerIcon size={15} />
            Call Next Patient
          </button>
        }
        className="self-start"
        subtitle="Patients who paid and are assigned to you or hold an appointment with you today."
        title="My Consultation Queue"
      >
        {mine.length === 0 ? (
          <Empty>No patients are assigned to you in today&apos;s queue.</Empty>
        ) : (
          <Table colSpan={columns.length} columns={columns}>
            {mine.map((entry) => {
              const patient = getPatient(entry.patientId);
              const position = positionOf(entry);
              const isDone = entry.status === "Completed";
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
                        ID {patient.patientId} · {patient.gender}
                      </span>
                    ) : null}
                  </Cell>
                  <Cell>
                    <StatusPill status={entry.status} />
                  </Cell>
                  <Cell>
                    <div className="flex items-center gap-1.5">
                      <button
                        className={btnIcon}
                        disabled={isDone}
                        onClick={() => openRoom(entry)}
                        title="Open consultation room"
                        type="button"
                      >
                        <StethoscopeIcon size={14} />
                        Open Room
                      </button>
                      <button
                        aria-label="Mark completed"
                        className={`${btnIcon} !px-2`}
                        disabled={isDone}
                        onClick={() =>
                          setQueueStatus(entry.queueId, "Completed")
                        }
                        title="Mark completed"
                        type="button"
                      >
                        <CheckIcon size={14} />
                      </button>
                    </div>
                  </Cell>
                </Row>
              );
            })}
          </Table>
        )}
      </Card>
    </div>
  );
}
