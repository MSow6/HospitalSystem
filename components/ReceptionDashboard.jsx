"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./dashboard.css";
import { formatDate, formatTime } from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import AppointmentsPanel from "./reception/AppointmentsPanel";
import OverviewPanel from "./reception/OverviewPanel";
import PatientsPanel from "./reception/PatientsPanel";
import PaymentsPanel from "./reception/PaymentsPanel";
import ProfilePanel from "./reception/ProfilePanel";
import QueuePanel from "./reception/QueuePanel";
import ReceiptsPanel from "./reception/ReceiptsPanel";
import ReportsPanel from "./reception/ReportsPanel";
import {
  CalendarIcon,
  ClipboardIcon,
  CreditCardIcon,
  HomeIcon,
  HospitalIcon,
  InfoIcon,
  LogoutIcon,
  PrinterIcon,
  ReceiptIcon,
  UserIcon,
  UsersIcon,
} from "./reception/icons";

const navigation = [
  {
    label: "Dashboard",
    key: "dashboard",
    title: "Reception Dashboard",
    Icon: HomeIcon,
  },
  {
    label: "Patients",
    key: "patients",
    title: "Patient Management",
    Icon: UsersIcon,
  },
  {
    label: "Appointments",
    key: "appointments",
    title: "Appointment Scheduling",
    Icon: CalendarIcon,
  },
  {
    label: "Queue Management",
    key: "queue",
    title: "Queue Management",
    Icon: ClipboardIcon,
  },
  {
    label: "Payments",
    key: "payments",
    title: "Payments & Billing",
    Icon: CreditCardIcon,
  },
  {
    label: "Receipts",
    key: "receipts",
    title: "Issued Receipts",
    Icon: ReceiptIcon,
  },
  {
    label: "Reports",
    key: "reports",
    title: "Reports & Summaries",
    Icon: PrinterIcon,
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
        aria-labelledby="reception-popup-title"
        aria-modal="true"
        className="reception-popup__dialog"
        role="alertdialog"
      >
        <span className="reception-popup__icon">
          <InfoIcon size={22} />
        </span>
        <h2 className="reception-popup__title" id="reception-popup-title">
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

function ReceptionShell() {
  const router = useRouter();
  const { notifications, currentUser, queue } = useReception();
  const [section, setSection] = useState("dashboard");
  const [clock, setClock] = useState(null);
  const [popup, setPopup] = useState(null);
  const seenRef = useRef(null);

  useEffect(() => {
    setClock(new Date());
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Turn every newly added log entry into a pop-up message. It stays on
  // screen until the receptionist acknowledges it with OK.
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
  const waitingCount = queue.filter(
    (entry) => entry.status === "Waiting",
  ).length;
  const initials = currentUser.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  function closePopup() {
    setPopup(null);
  }

  function signOut() {
    if (window.confirm("Are you sure you want to exit the Reception Panel?")) {
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
            Reception
            <span className="reception-sidebar__sub">Control Panel</span>
          </span>
        </div>

        <nav
          aria-label="Reception panel navigation"
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
            <strong>{currentUser.fullName}</strong>
            <span>{currentUser.role}</span>
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
                Signed in as {currentUser.fullName}
                {waitingCount > 0
                  ? ` · ${waitingCount} patient(s) waiting`
                  : ""}
              </p>
            </div>
            <div className="reception-header__meta">
              <div aria-hidden="true" className="reception-avatar">
                {initials}
              </div>
              <div className="reception-clock" aria-live="off">
                <strong>{clock ? formatDate(clock) : "—"}</strong>
                <span>{clock ? formatTime(clock) : "--:--:--"}</span>
              </div>
            </div>
          </header>

          {section === "dashboard" ? (
            <OverviewPanel onNavigate={setSection} />
          ) : null}
          {section === "patients" ? <PatientsPanel /> : null}
          {section === "appointments" ? <AppointmentsPanel /> : null}
          {section === "queue" ? <QueuePanel /> : null}
          {section === "payments" ? <PaymentsPanel /> : null}
          {section === "receipts" ? <ReceiptsPanel /> : null}
          {section === "reports" ? <ReportsPanel /> : null}
          {section === "profile" ? <ProfilePanel /> : null}
        </div>
      </main>

      {popup ? <PopupMessage entry={popup.entry} onClose={closePopup} /> : null}
    </div>
  );
}

export default function ReceptionDashboard() {
  return <ReceptionShell />;
}
