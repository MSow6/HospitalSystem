"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReception } from "@/lib/reception-store";
import { PrinterIcon, XIcon } from "./icons";
import { btn } from "./ui";

// In-page PDF receipt viewer. The document is built on the client and shown in
// an iframe, so nothing is ever downloaded or saved to disk. When printing is
// not allowed the embedded viewer's own toolbar is hidden as well.
export default function ReceiptViewer({
  receipt,
  allowPrint = false,
  onClose,
}) {
  const store = useReception();
  const storeRef = useRef(store);
  storeRef.current = store;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);
  const frameRef = useRef(null);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;
    const { getPayment, getPatient, currentUser, notify } = storeRef.current;

    const payment = getPayment(receipt.paymentId);
    if (!payment) {
      notify("Payment record could not be found for this receipt.");
      onCloseRef.current();
      return undefined;
    }

    (async () => {
      try {
        const [{ pdf }, { default: ReceiptDocument }] = await Promise.all([
          import("@react-pdf/renderer"),
          import("./ReceiptDocument"),
        ]);
        const blob = await pdf(
          <ReceiptDocument
            breakdown={payment.items}
            cashier={currentUser}
            patient={getPatient(payment.patientId)}
            payment={payment}
            receipt={receipt}
          />,
        ).toBlob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (cancelled) return;
        setFailed(true);
        notify(
          "Could not generate the PDF receipt. Check the browser console.",
        );
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [receipt]);

  function printReceipt() {
    const frame = frameRef.current;
    if (!frame || !frame.contentWindow) {
      store.notify(
        "The receipt preview is still loading. Try again in a moment.",
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
        aria-label={`Receipt RCP-${receipt.receiptId}`}
        aria-modal="true"
        className="reception-viewer__dialog"
        role="dialog"
      >
        <header className="reception-viewer__head">
          <p className="reception-viewer__title">
            Receipt RCP-{receipt.receiptId}
          </p>
          <div className="reception-viewer__actions">
            {allowPrint ? (
              <button
                className={btn.primary}
                onClick={printReceipt}
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
            title={`Receipt RCP-${receipt.receiptId}`}
          />
        ) : (
          <div className="reception-viewer__status">
            {failed
              ? "The receipt could not be displayed."
              : "Preparing receipt..."}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
