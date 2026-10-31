"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatTime, todayIso } from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import { PrinterIcon, XIcon } from "./icons";
import { btn, Input } from "./ui";

// Builds the operations summary model for the selected period from the current
// store snapshot. Kept in one place so the figure on screen matches the figure
// on the printed sheet.
export function buildSummary(
  {
    patients,
    appointments,
    queue,
    payments,
    receipts,
    currentUser,
    getPatient,
    getPayment,
  },
  { from, to },
) {
  const inRange = (value) => Boolean(value) && value >= from && value <= to;

  const rangePayments = payments.filter((payment) => inRange(payment.date));
  const collected = rangePayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const rangeReceipts = receipts.filter((receipt) =>
    inRange(getPayment(receipt.paymentId)?.date),
  );

  const rangeAppointments = appointments.filter((appointment) =>
    inRange(appointment.date),
  );

  const groupBy = (key) => {
    const map = new Map();
    rangePayments.forEach((payment) => {
      const name = payment[key] ?? "Unspecified";
      const entry = map.get(name) ?? { count: 0, amount: 0 };
      entry.count += 1;
      entry.amount += payment.amount;
      map.set(name, entry);
    });
    return [...map.entries()].map(([name, entry]) => ({
      name,
      count: entry.count,
      amount: entry.amount,
    }));
  };

  const transactions = rangePayments.map((payment) => {
    const receipt = rangeReceipts.find(
      (entry) => entry.paymentId === payment.paymentId,
    );
    const patient = getPatient(payment.patientId);
    return {
      paymentId: payment.paymentId,
      receiptId: receipt ? receipt.receiptId : null,
      patient: patient ? patient.fullName : `Patient ${payment.patientId}`,
      type: payment.paymentType,
      method: payment.method,
      amount: payment.amount,
    };
  });

  // The live queue is a point-in-time snapshot, so it only belongs in the
  // report when the selected period covers today.
  const today = todayIso();
  const includeQueue = inRange(today);

  return {
    from,
    to,
    periodText: from === to ? from : `${from} → ${to}`,
    generatedAt: formatTime(new Date()),
    cashier: currentUser,
    newPatients: patients.filter((patient) => inRange(patient.registrationDate))
      .length,
    appointments: {
      total: rangeAppointments.filter((a) => a.status !== "Cancelled").length,
      completed: rangeAppointments.filter((a) => a.status === "Completed")
        .length,
    },
    includeQueue,
    waiting: includeQueue
      ? queue.filter((entry) => entry.status === "Waiting").length
      : 0,
    seen: includeQueue
      ? queue.filter(
          (entry) =>
            entry.status === "In Consultation" || entry.status === "Completed",
        ).length
      : 0,
    receiptsCount: rangeReceipts.length,
    collected,
    byMethod: groupBy("method"),
    byType: groupBy("paymentType"),
    transactions,
  };
}

// In-page PDF viewer for the printable operations summary sheet. Built on the
// client and shown in an iframe so nothing is downloaded to disk. The period
// picker lets the user report on any single day or a from-to range.
export default function DailySummaryViewer({
  allowPrint = true,
  initialFrom,
  initialTo,
  onClose,
}) {
  const store = useReception();
  const storeRef = useRef(store);
  storeRef.current = store;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [from, setFrom] = useState(() => initialFrom ?? todayIso());
  const [to, setTo] = useState(() => initialTo ?? initialFrom ?? todayIso());
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    setUrl(null);
    setFailed(false);

    (async () => {
      try {
        const [{ pdf }, { default: DailySummaryDocument }] = await Promise.all([
          import("@react-pdf/renderer"),
          import("./DailySummaryDocument"),
        ]);
        const summary = buildSummary(storeRef.current, { from, to });
        const blob = await pdf(<DailySummaryDocument {...summary} />).toBlob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (cancelled) return;
        setFailed(true);
        storeRef.current.notify(
          "Could not generate the summary report. Check the browser console.",
        );
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [from, to]);

  function printSummary() {
    const frame = frameRef.current;
    if (!frame || !frame.contentWindow) {
      store.notify(
        "The summary preview is still loading. Try again in a moment.",
      );
      return;
    }
    frame.contentWindow.focus();
    frame.contentWindow.print();
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="reception-viewer" role="presentation">
      <div
        aria-label="Operations summary report"
        aria-modal="true"
        className="reception-viewer__dialog"
        role="dialog"
      >
        <header className="reception-viewer__head">
          <p className="reception-viewer__title">Operations Summary</p>
          <div
            aria-label="Reporting period"
            className="reception-viewer__filter"
            role="group"
          >
            <label htmlFor="summary-from">From</label>
            <Input
              className="!h-9 !w-[150px] !text-[12px]"
              id="summary-from"
              max={to}
              onChange={(event) => setFrom(event.target.value)}
              type="date"
              value={from}
            />
            <label htmlFor="summary-to">To</label>
            <Input
              className="!h-9 !w-[150px] !text-[12px]"
              id="summary-to"
              min={from}
              onChange={(event) => setTo(event.target.value)}
              type="date"
              value={to}
            />
          </div>
          <div className="reception-viewer__actions">
            {allowPrint ? (
              <button
                className={btn.primary}
                onClick={printSummary}
                type="button"
              >
                <PrinterIcon size={15} />
                Print
              </button>
            ) : null}
            <button
              className={btn.secondary}
              onClick={() => onCloseRef.current()}
              type="button"
            >
              <XIcon size={15} />
              Close
            </button>
          </div>
        </header>
        {url ? (
          <iframe
            className="reception-viewer__frame"
            ref={frameRef}
            src={allowPrint ? url : `${url}#toolbar=0`}
            title="Operations summary report"
          />
        ) : (
          <div className="reception-viewer__status">
            {failed
              ? "The summary report could not be displayed."
              : "Preparing summary report..."}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
