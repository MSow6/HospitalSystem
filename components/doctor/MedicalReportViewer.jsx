"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReception } from "@/lib/reception-store";
import { PrinterIcon, XIcon } from "../reception/icons";
import { btn } from "../reception/ui";

// In-page PDF preview shared by the doctor's printable reports. The sheet is
// built on the client and shown in an iframe, so nothing is ever downloaded to
// disk — the doctor previews it and prints straight from the dialog.
export default function MedicalReportViewer({
  allowPrint = true,
  onClose,
  renderBlob,
  renderKey = "report",
  title,
  toolbar = null,
}) {
  const store = useReception();
  const storeRef = useRef(store);
  storeRef.current = store;

  const renderBlobRef = useRef(renderBlob);
  renderBlobRef.current = renderBlob;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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
        const blob = await renderBlobRef.current(storeRef.current);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (cancelled) return;
        setFailed(true);
        storeRef.current.notify(
          "Could not generate the medical report. Check the browser console.",
        );
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [renderKey]);

  function printReport() {
    const frame = frameRef.current;
    if (!frame || !frame.contentWindow) {
      store.notify(
        "The report preview is still loading. Try again in a moment.",
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
        aria-label={title}
        aria-modal="true"
        className="reception-viewer__dialog"
        role="dialog"
      >
        <header className="reception-viewer__head">
          <p className="reception-viewer__title">{title}</p>
          {toolbar ? (
            <div
              aria-label="Report options"
              className="reception-viewer__filter"
              role="group"
            >
              {toolbar}
            </div>
          ) : null}
          <div className="reception-viewer__actions">
            {allowPrint ? (
              <button
                className={btn.primary}
                onClick={printReport}
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
            title={title}
          />
        ) : (
          <div className="reception-viewer__status">
            {failed
              ? "The medical report could not be displayed."
              : "Preparing medical report..."}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
