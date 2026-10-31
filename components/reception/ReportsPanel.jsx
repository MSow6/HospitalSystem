"use client";

import { useMemo, useState } from "react";
import { formatLeone, todayIso } from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import DailySummaryViewer, { buildSummary } from "./DailySummaryViewer";
import { CalendarIcon } from "./icons";
import { btn, Card, Field, Input } from "./ui";

// Reports hub: pick the period first, glance at what it holds, then open the
// printable summary sheet. Opening this section never prints straight away.
export default function ReportsPanel() {
  const store = useReception();
  const [from, setFrom] = useState(() => todayIso());
  const [to, setTo] = useState(() => todayIso());
  const [showSummary, setShowSummary] = useState(false);

  const summary = useMemo(
    () => buildSummary(store, { from, to }),
    [store, from, to],
  );

  const tiles = [
    { label: "Total Collected", value: formatLeone(summary.collected) },
    { label: "Receipts Issued", value: summary.receiptsCount },
    { label: "Transactions", value: summary.transactions.length },
    { label: "New Patients", value: summary.newPatients },
  ];

  return (
    <div className="grid gap-5">
      <Card
        className="self-start"
        subtitle="Choose the period you want to report on, then preview and print the summary sheet."
        title="Operations Report"
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
            onClick={() => setShowSummary(true)}
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
            ? `Reporting on ${from}.`
            : `Reporting on every transaction recorded between ${from} and ${to}.`}{" "}
          Use the same date for From and To to report on a single day.
        </p>
      </Card>

      {showSummary ? (
        <DailySummaryViewer
          initialFrom={from}
          initialTo={to}
          onClose={() => setShowSummary(false)}
        />
      ) : null}
    </div>
  );
}
