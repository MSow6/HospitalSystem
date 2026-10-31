"use client";

import { useMemo, useState } from "react";
import { useReception } from "@/lib/reception-store";
import { EyeIcon } from "../reception/icons";
import {
  btnIcon,
  Card,
  Cell,
  Empty,
  Row,
  Select,
  StatusPill,
  Table,
} from "../reception/ui";
import DoctorPatientLabView from "./DoctorPatientLabView";

const columns = [
  "Patient",
  "ID",
  "Requests",
  "Tests",
  "Last Request",
  "Status",
  "Action",
];

export default function DoctorLabPanel() {
  const { labRequests, currentDoctor, getPatient } = useReception();
  const [filter, setFilter] = useState("All");
  const [openPatientId, setOpenPatientId] = useState(null);

  const mine = useMemo(
    () =>
      labRequests.filter(
        (request) => request.doctorId === currentDoctor.workerId,
      ),
    [labRequests, currentDoctor.workerId],
  );

  // One line per patient: their requests are gathered together and the row
  // summarises them, with the full detail one click away.
  const patients = useMemo(() => {
    const grouped = new Map();
    mine
      .filter((request) => filter === "All" || request.status === filter)
      .forEach((request) => {
        const entry = grouped.get(request.patientId) ?? {
          patientId: request.patientId,
          requests: [],
        };
        entry.requests.push(request);
        grouped.set(request.patientId, entry);
      });

    return [...grouped.values()]
      .map((entry) => ({
        ...entry,
        requests: [...entry.requests].sort((a, b) => b.requestId - a.requestId),
      }))
      .sort((a, b) => b.requests[0].requestId - a.requests[0].requestId);
  }, [mine, filter]);

  if (openPatientId) {
    return (
      <DoctorPatientLabView
        onClose={() => setOpenPatientId(null)}
        patientId={openPatientId}
        requests={mine
          .filter((request) => request.patientId === openPatientId)
          .sort((a, b) => b.requestId - a.requestId)}
      />
    );
  }

  const pending = mine.filter((request) => request.status === "Pending").length;
  const completed = mine.filter(
    (request) => request.status === "Completed",
  ).length;
  const testCount = mine.reduce(
    (sum, request) => sum + request.items.length,
    0,
  );

  const tiles = [
    { label: "Pending Requests", value: pending, tone: "text-warning" },
    { label: "Completed Requests", value: completed, tone: "text-success" },
    { label: "Tests Ordered", value: testCount, tone: "text-ink" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <dl className="grid grid-cols-3 gap-3 self-start">
        {tiles.map((tile) => (
          <div
            className="rounded-panel border border-line bg-white px-4 py-3 shadow-panel"
            key={tile.label}
          >
            <dt className="text-[11px] uppercase tracking-label text-muted">
              {tile.label}
            </dt>
            <dd className={`text-2xl font-bold ${tile.tone}`}>{tile.value}</dd>
          </div>
        ))}
      </dl>

      <Card
        actions={
          <Select
            onChange={(event) => setFilter(event.target.value)}
            value={filter}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Completed</option>
          </Select>
        }
        subtitle="One line per patient — open a patient to see every request and result filed for them."
        title="Laboratory Requests & Results"
      >
        {patients.length === 0 ? (
          <Empty>No laboratory requests match this view.</Empty>
        ) : (
          <Table colSpan={columns.length} columns={columns}>
            {patients.map((entry) => {
              const patient = getPatient(entry.patientId);
              const latest = entry.requests[0];
              const totalTests = entry.requests.reduce(
                (sum, request) => sum + request.items.length,
                0,
              );
              const hasPending = entry.requests.some(
                (request) => request.status === "Pending",
              );
              return (
                <Row
                  key={entry.patientId}
                  onClick={() => setOpenPatientId(entry.patientId)}
                >
                  <Cell className="whitespace-nowrap text-ink">
                    {patient ? patient.fullName : entry.patientId}
                  </Cell>
                  <Cell className="whitespace-nowrap">{entry.patientId}</Cell>
                  <Cell className="whitespace-nowrap">
                    {entry.requests.length}
                  </Cell>
                  <Cell className="whitespace-nowrap">{totalTests}</Cell>
                  <Cell className="whitespace-nowrap">
                    {latest.requestDate}
                  </Cell>
                  <Cell>
                    <StatusPill status={hasPending ? "Pending" : "Completed"} />
                  </Cell>
                  <Cell>
                    <button
                      className={btnIcon}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenPatientId(entry.patientId);
                      }}
                      type="button"
                    >
                      <EyeIcon size={14} />
                      View
                    </button>
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
