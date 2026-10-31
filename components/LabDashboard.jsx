"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./dashboard.css";
import { formatDate, formatTime } from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import ProfilePanel from "./reception/ProfilePanel";
import {
  ClipboardPlusIcon,
  HospitalIcon,
  InfoIcon,
  LogoutIcon,
  UserIcon,
} from "./reception/icons";
import LabRequestsPanel from "./lab/LabRequestsPanel";

const navigation = [
  {
    label: "Lab Requests",
    key: "requests",
    title: "Laboratory Request Pack",
    Icon: ClipboardPlusIcon,
  },
  { label: "My Profile", key: "profile", title: "My Profile", Icon: UserIcon },
];

function PopupMessage({ entry, onClose }) {
  const match = entry.match(/^\[(\d{2}:\d{2}:\d{2})\]\s*(.*)$/);
  const label = match ? match[1] : "Notification";
  const message = match ? match[2] : entry;

  return (
    <div className="reception-popup" role="presentation">
      <div
        aria-labelledby="lab-popup-title"
        aria-modal="true"
        className="reception-popup__dialog"
        role="alertdialog"
      >
        <span className="reception-popup__icon">
          <InfoIcon size={22} />
        </span>
        <h2 className="reception-popup__title" id="lab-popup-title">
          Notification
        </h2>
        <p className="reception-popup__label">{label}</p>
        <p className="reception-popup__message">{message}</p>
        <button
          autoFocus
          className="reception-popup__ok"
          onClick={onClose}
          type="button"
        >
          OK
        </button>
      </div>
    </div>
  );
}

function LabShell() {
  const router = useRouter();
  const { notifications, currentTechnician, labRequests } = useReception();
  const [section, setSection] = useState("requests");
  const [clock, setClock] = useState(null);
  const [popup, setPopup] = useState(null);
  const seenRef = useRef(null);

  useEffect(() => {
    setClock(new Date());
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Every new log entry becomes a pop-up that stays until acknowledged.
  useEffect(() => {
    if (seenRef.current === null) {
      seenRef.current = notifications;
      return;
    }
    const previous = seenRef.current;
    seenRef.current = notifications;
    const fresh = notifications.filter((entry) => !previous.includes(entry));
    if (fresh.length === 0) return;

    setPopup({ id: `${fresh[0]}-${Date.now()}`, entry: fresh[0] });
  }, [notifications]);

  const active =
    navigation.find((item) => item.key === section) ?? navigation[0];

  const pending = labRequests.filter(
    (request) => request.status === "Pending",
  ).length;

  const initials = currentTechnician.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  function signOut() {
    if (window.confirm("Are you sure you want to exit the Laboratory Panel?")) {
      router.push("/");
    }
  }

  return (
    <div className="reception-dashboard">
      <aside className="reception-sidebar">
        <div className="reception-sidebar__brand">
          <span className="reception-sidebar__mark">
            <HospitalIcon size={19} />
          </span>
          <span className="reception-sidebar__name">
            Laboratory
            <span className="reception-sidebar__sub">Diagnostics Panel</span>
          </span>
        </div>

        <nav
          aria-label="Laboratory panel navigation"
          className="reception-navigation"
        >
          {navigation.map((item) => (
            <button
              aria-current={item.key === section ? "page" : undefined}
              className={`reception-navigation__item ${item.key === section ? "is-active" : ""}`}
              key={item.key}
              onClick={() => setSection(item.key)}
              type="button"
            >
              <item.Icon size={17} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="reception-sidebar__footer">
          <div className="reception-sidebar__user">
            <strong>{currentTechnician.fullName}</strong>
            <span>{currentTechnician.role}</span>
          </div>
          <button className="reception-logout" onClick={signOut} type="button">
            <LogoutIcon size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="reception-main">
        <div className="reception-content">
          <header className="reception-header">
            <div>
              <h1>{active.title}</h1>
              <p className="reception-subtitle">
                Signed in as {currentTechnician.fullName} ·{" "}
                {currentTechnician.room}
                {pending > 0 ? ` · ${pending} request(s) pending` : ""}
              </p>
            </div>
            <div className="reception-header__meta">
              <div aria-hidden="true" className="reception-avatar">
                {initials}
              </div>
              <div aria-live="off" className="reception-clock">
                <strong>{clock ? formatDate(clock) : "—"}</strong>
                <span>{clock ? formatTime(clock) : "--:--:--"}</span>
              </div>
            </div>
          </header>

          {section === "requests" ? <LabRequestsPanel /> : null}
          {section === "profile" ? (
            <ProfilePanel user={currentTechnician} />
          ) : null}
        </div>
      </main>

      {popup ? <PopupMessage entry={popup.entry} onClose={() => setPopup(null)} /> : null}
    </div>
  );
}

export default function LabDashboard() {
  return <LabShell />;
}
