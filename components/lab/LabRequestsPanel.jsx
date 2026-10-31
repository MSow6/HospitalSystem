"use client";

import { useMemo, useState } from "react";
import { useReception } from "@/lib/reception-store";
import { EyeIcon } from "../reception/icons";
import {
  Card,
  Cell,
  Empty,
  Row,
  StatusPill,
  Table,
  btnIcon,
} from "../reception/ui";
import LabRequestDetail from "./LabRequestDetail";

const TABS = [
  { key: "Pending", label: "Pending Requests" },
  { key: "Completed", label: "Completed Reports" },
  { key: "All", label: "All Requests" },
];

const columns = [
  "Request",
  "Patient",
  "ID",
  "Tests",
  "Requested By",
  "Date",
  "Status",
  "Action",
];

export default function LabRequestsPanel() {
  const { labRequests, getDoctor, getPatient } = useReception();
  const [tab, setTab] = useState("Pending");
  const [openId, setOpenId] = useState(null);

  const requests = useMemo(
    () => [...labRequests].sort((a, b) => b.requestId - a.requestId),
    [labRequests],
  );

  const openRequest = openId
    ? (requests.find((request) => request.requestId === openId) ?? null)
    : null;

  if (openRequest) {
    return (
      <LabRequestDetail onClose={() => setOpenId(null)} request={openRequest} />
    );
  }

  const shown =
    tab === "All"
      ? requests
      : requests.filter((request) => request.status === tab);

  const pending = requests.filter((request) => request.status === "Pending");
  const awaiting = pending.reduce(
    (sum, request) => sum + request.items.filter((item) => !item.result).length,
    0,
  );

  const tiles = [
    { label: "Pending Requests", value: pending.length, tone: "text-warning" },
    { label: "Tests Awaiting Result", value: awaiting, tone: "text-ink" },
    {
      label: "Completed Reports",
      value: requests.length - pending.length,
      tone: "text-success",
    },
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
        subtitle="One line per patient — open a request to file results or review a finished report."
        title="Laboratory Request Pack"
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

        {shown.length === 0 ? (
          <Empty>No laboratory requests match this view.</Empty>
        ) : (
          <Table colSpan={columns.length} columns={columns}>
            {shown.map((request) => {
              const patient = getPatient(request.patientId);
              const doctor = getDoctor(request.doctorId);
              return (
                <Row
                  key={request.requestId}
                  onClick={() => setOpenId(request.requestId)}
                >
                  <Cell className="whitespace-nowrap font-semibold text-ink">
                    #{request.requestId}
                  </Cell>
                  <Cell className="whitespace-nowrap text-ink">
                    {patient ? patient.fullName : request.patientId}
                  </Cell>
                  <Cell className="whitespace-nowrap">{request.patientId}</Cell>
                  <Cell className="whitespace-nowrap">
                    {request.items.map((item) => item.testName).join(", ")}
                  </Cell>
                  <Cell className="whitespace-nowrap">
                    {doctor ? doctor.name : "—"}
                  </Cell>
                  <Cell className="whitespace-nowrap">
                    {request.requestDate}
                  </Cell>
                  <Cell>
                    <StatusPill status={request.status} />
                  </Cell>
                  <Cell>
                    <button
                      className={btnIcon}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenId(request.requestId);
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
