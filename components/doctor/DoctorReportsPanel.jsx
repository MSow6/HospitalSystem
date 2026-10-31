"use client";

import { useMemo, useState } from "react";
import { todayIso } from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import { CalendarIcon } from "../reception/icons";
import { btn, Card, Field, Input } from "../reception/ui";
import MedicalReportViewer from "./MedicalReportViewer";
import { buildActivityReport } from "./reportModels";

// Medical Report hub. The doctor picks the period, sees what it holds, and only
// then opens the printable activity sheet — tapping the sidebar never prints
// straight away.
export default function DoctorReportsPanel() {
  const store = useReception();
  const [from, setFrom] = useState(() => todayIso());
  const [to, setTo] = useState(() => todayIso());
  const [showReport, setShowReport] = useState(false);

  const report = useMemo(
    () => buildActivityReport(store, { from, to }),
    [store, from, to],
  );

  const tiles = [
    { label: "Patients Seen", value: report.totals.patientsSeen },
    { label: "Consultations", value: report.totals.consultations },
    { label: "Prescriptions", value: report.totals.prescriptions },
    { label: "Labs Ordered", value: report.totals.labsOrdered },
  ];

  async function renderBlob(liveStore) {
    const [{ pdf }, { default: DoctorActivityReportDocument }] =
      await Promise.all([
        import("@react-pdf/renderer"),
        import("./DoctorActivityReportDocument"),
      ]);
    const model = buildActivityReport(liveStore, { from, to });
    return pdf(<DoctorActivityReportDocument {...model} />).toBlob();
  }

  return (
    <div className="grid gap-5">
      <Card
        className="self-start"
        subtitle="Choose the period you want to report on, then preview and print the medical activity sheet."
        title="Medical Report"
      >
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <Field label="From">
            <Input
              max={to}
              onChange={(event) => setFrom(event.target.value)}
              type="date"
              value={from}
            />
          </Field>
          <Field label="To">
            <Input
              min={from}
              onChange={(event) => setTo(event.target.value)}
              type="date"
              value={to}
            />
          </Field>
          <button
            className={btn.primary}
            onClick={() => setShowReport(true)}
            type="button"
          >
            <CalendarIcon size={15} />
            Preview Report
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {tiles.map((tile) => (
            <div
              className="rounded-lg border border-line-soft bg-surface px-4 py-3"
              key={tile.label}
            >
              <dt className="text-[11px] font-semibold uppercase tracking-label text-muted">
                {tile.label}
              </dt>
              <dd className="mt-1 text-xl font-bold text-ink">{tile.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-[11px] leading-snug text-muted-soft">
          {from === to
            ? `Reporting on the clinical work you recorded on ${from}.`
            : `Reporting on every consultation, treatment, prescription and laboratory request you recorded between ${from} and ${to}.`}{" "}
          Use the same date for From and To to report on a single day.
        </p>
      </Card>

      {showReport ? (
        <MedicalReportViewer
          onClose={() => setShowReport(false)}
          renderBlob={renderBlob}
          renderKey={`${from}|${to}`}
          title="Medical Activity Report"
          toolbar={
            <>
              <label htmlFor="doctor-report-from">From</label>
              <Input
                className="!h-9 !w-[150px] !text-[12px]"
                id="doctor-report-from"
                max={to}
                onChange={(event) => setFrom(event.target.value)}
                type="date"
                value={from}
              />
              <label htmlFor="doctor-report-to">To</label>
              <Input
                className="!h-9 !w-[150px] !text-[12px]"
                id="doctor-report-to"
                min={from}
                onChange={(event) => setTo(event.target.value)}
                type="date"
                value={to}
              />
            </>
          }
        />
      ) : null}
    </div>
  );
}
