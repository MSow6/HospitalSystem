"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./dashboard.css";
import { formatDate, formatTime } from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import ProfilePanel from "./reception/ProfilePanel";
import {
  ClipboardIcon,
  ClipboardPlusIcon,
  HomeIcon,
  HospitalIcon,
  InfoIcon,
  LogoutIcon,
  PrinterIcon,
  StethoscopeIcon,
  UserIcon,
} from "./reception/icons";
import DoctorHistoryPanel from "./doctor/DoctorHistoryPanel";
import DoctorLabPanel from "./doctor/DoctorLabPanel";
import DoctorOverviewPanel from "./doctor/DoctorOverviewPanel";
import DoctorQueuePanel from "./doctor/DoctorQueuePanel";
import DoctorReportsPanel from "./doctor/DoctorReportsPanel";

const navigation = [
  {
    label: "My Day",
    key: "dashboard",
    title: "Doctor Dashboard",
    Icon: HomeIcon,
  },
  {
    label: "My Queue",
    key: "queue",
    title: "My Consultation Queue",
    Icon: StethoscopeIcon,
  },
  {
    label: "Lab Requests",
    key: "lab",
    title: "Laboratory Requests & Results",
    Icon: ClipboardPlusIcon,
  },
  {
    label: "Medical History",
    key: "history",
    title: "Patient Medical History",
    Icon: ClipboardIcon,
  },
  {
    label: "Medical Report",
    key: "reports",
    title: "Medical Report",
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
        aria-labelledby="doctor-popup-title"
        aria-modal="true"
        className="reception-popup__dialog"
        role="alertdialog"
      >
        <span className="reception-popup__icon">
          <InfoIcon size={22} />
        </span>
        <h2 className="reception-popup__title" id="doctor-popup-title">
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

function DoctorShell() {
  const router = useRouter();
  const { notifications, currentDoctor, queue, appointments, getPatient } =
    useReception();
  const [section, setSection] = useState("dashboard");
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

  const myWaiting = queue.filter((entry) => {
    if (entry.status !== "Waiting" && entry.status !== "Called") return false;
    const appointment = entry.appointmentId
      ? appointments.find((a) => a.appointmentId === entry.appointmentId)
      : null;
    const patient = getPatient(entry.patientId);
    const doctorId =
      appointment?.doctorId ??
      entry.doctorId ??
      patient?.assignedDoctorId ??
      null;
    return doctorId === currentDoctor.workerId;
  }).length;

  const initials = currentDoctor.fullName
    .replace(/^Dr\.?\s*/, "")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  function closePopup() {
    setPopup(null);
  }

  function signOut() {
    if (window.confirm("Are you sure you want to exit the Doctor Panel?")) {
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
            Doctor
            <span className="reception-sidebar__sub">Clinical Panel</span>
          </span>
        </div>

        <nav
          aria-label="Doctor panel navigation"
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
            <strong>{currentDoctor.fullName}</strong>
            <span>{currentDoctor.role}</span>
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
                Signed in as {currentDoctor.fullName} · {currentDoctor.room}
                {myWaiting > 0 ? ` · ${myWaiting} patient(s) waiting` : ""}
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

          {section === "dashboard" ? (
            <DoctorOverviewPanel onNavigate={setSection} />
          ) : null}
          {section === "queue" ? <DoctorQueuePanel /> : null}
          {section === "lab" ? <DoctorLabPanel /> : null}
          {section === "history" ? <DoctorHistoryPanel /> : null}
          {section === "reports" ? <DoctorReportsPanel /> : null}
          {section === "profile" ? <ProfilePanel user={currentDoctor} /> : null}
        </div>
      </main>

      {popup ? <PopupMessage entry={popup.entry} onClose={closePopup} /> : null}
    </div>
  );
}

export default function DoctorDashboard() {
  return <DoctorShell />;
}
