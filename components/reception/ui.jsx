"use client";

import { ChevronDownIcon } from "./icons";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/35 focus-visible:ring-offset-1";

export const btn = {
  primary: `inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-[13px] font-semibold text-white shadow-control transition hover:bg-brand-700 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${focusRing}`,
  secondary: `inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-[13px] font-semibold text-ink shadow-control transition hover:border-brand-300 hover:bg-surface active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${focusRing}`,
  success: `inline-flex h-10 items-center justify-center gap-2 rounded-md bg-success px-4 text-[13px] font-semibold text-white shadow-control transition hover:bg-[#26824b] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${focusRing}`,
  danger: `inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#f0c7c7] bg-[#fdf2f2] px-4 text-[13px] font-semibold text-danger transition hover:bg-[#fbe4e4] active:translate-y-px disabled:pointer-events-none disabled:opacity-50 ${focusRing}`,
  ghost: `inline-flex h-10 items-center justify-center gap-2 rounded-md px-3 text-[13px] font-medium text-muted transition hover:bg-surface hover:text-ink ${focusRing}`,
};

// Compact action button used inside table rows.
export const btnIcon =
  "inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-[11px] font-semibold text-ink-soft transition hover:border-brand-300 hover:bg-surface disabled:pointer-events-none disabled:opacity-40";

export const btnIconDanger =
  "inline-flex items-center gap-1.5 rounded-md border border-[#f0c7c7] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-danger transition hover:bg-[#fdf2f2] disabled:pointer-events-none disabled:opacity-40";

const controlBase =
  "h-10 w-full rounded-md border border-line bg-white text-[13px] text-ink shadow-control outline-none transition placeholder:text-muted-soft hover:border-[#cfdcda] focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15 disabled:bg-surface disabled:text-muted";

export function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-label text-muted">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="text-[11px] leading-snug text-muted-soft">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return <input className={`${controlBase} px-3 ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }) {
  return (
    <span className={`relative block ${className}`}>
      <select
        className={`${controlBase} cursor-pointer appearance-none pl-3 pr-9`}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        size={15}
      />
    </span>
  );
}

export function Card({ title, subtitle, actions, children, className = "" }) {
  return (
    <section
      className={`rounded-panel border border-line bg-white p-5 shadow-panel ${className}`}
    >
      {(title || actions) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-line-soft pb-3">
          <div className="min-w-0">
            {title ? (
              <h2 className="font-display text-[15px] font-bold tracking-tight text-ink">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-1 text-[12px] text-muted">{subtitle}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </header>
      )}
      {children}
    </section>
  );
}

export function Table({ columns, children, empty, colSpan }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-line bg-surface-soft text-left">
            {columns.map((column) => (
              <th
                className="whitespace-nowrap px-3 py-2.5 text-[10px] font-bold uppercase tracking-label text-muted"
                key={column}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empty ? (
            <tr>
              <td
                className="px-3 py-8 text-center text-muted-soft"
                colSpan={colSpan}
              >
                {empty}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Row({ children, onClick, selected = false }) {
  return (
    <tr
      className={`border-b border-line-soft transition-colors last:border-b-0 ${
        onClick ? "cursor-pointer hover:bg-surface-soft" : ""
      } ${selected ? "bg-brand-50" : ""}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function Cell({ children, className = "", ...props }) {
  return (
    <td
      className={`px-3 py-2.5 align-middle text-ink-soft ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}

const statusStyles = {
  Scheduled: "bg-[#e8f1fb] text-[#1c6bb0]",
  Completed: "bg-[#e7f6ec] text-success",
  Cancelled: "bg-[#fdeceb] text-danger",
  Waiting: "bg-[#fff4e5] text-warning",
  Called: "bg-[#e8f1fb] text-[#1c6bb0]",
  "In Consultation": "bg-[#efe8fb] text-[#6b3fbf]",
  Paid: "bg-[#e7f6ec] text-success",
  Pending: "bg-[#fff4e5] text-warning",
  Settled: "bg-[#e7f6ec] text-success",
  Outstanding: "bg-[#fdeceb] text-danger",
};

export function StatusPill({ status }) {
  const style = statusStyles[status] ?? "bg-surface text-muted";
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${style}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current"
      />
      {status}
    </span>
  );
}

export function Empty({ children }) {
  return (
    <div className="rounded-md border border-dashed border-line bg-surface-soft px-4 py-8 text-center text-[13px] text-muted-soft">
      {children}
    </div>
  );
}
