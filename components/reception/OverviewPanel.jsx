"use client";

import { useState } from "react";
import { formatLeone } from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import {
  CalendarIcon,
  CalendarPlusIcon,
  ClipboardIcon,
  ClockIcon,
  CreditCardIcon,
  ReceiptIcon,
  SearchIcon,
  SpeakerIcon,
  UsersIcon,
} from "./icons";

function StatCard({ Icon, title, value, color, onClick }) {
  return (
    <button className="dashboard-stat" onClick={onClick} type="button">
      <div className="dashboard-stat__icon" style={{ "--stat-color": color }}>
        <Icon size={17} />
      </div>
      <div className="dashboard-stat__title">{title}</div>
      <strong className="dashboard-stat__value">{value}</strong>
    </button>
  );
}

function DashboardTable({ title, columns, rows, className = "" }) {
  return (
    <section className={`dashboard-panel table-panel ${className}`}>
      <h2 className="panel-title">{title}</h2>
      <div className="dashboard-table-scroll">
        <table className="dashboard-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </section>
  );
}

export default function OverviewPanel({ onNavigate }) {
  const {
    patients,
    appointments,
    queue,
    payments,
    receipts,
    notifications,
    getPatient,
    getDoctor,
  } = useReception();
  const [search, setSearch] = useState("");

  const waiting = queue.filter((entry) => entry.status === "Waiting");
  const activeQueue = queue.filter((entry) => entry.status !== "Completed");
  const todaysPayments = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const searchResults = search.trim()
    ? patients.filter((patient) => {
        const term = search.trim().toLowerCase();
        return (
          String(patient.patientId).includes(term) ||
          patient.fullName.toLowerCase().includes(term) ||
          patient.phoneNumber.toLowerCase().includes(term)
        );
      })
    : patients.slice(0, 4);

  const latestPatients = [...patients]
    .sort((a, b) => b.patientId - a.patientId)
    .slice(0, 5);

  const todaysAppointments = [...appointments].sort((a, b) =>
    a.time.localeCompare(b.time),
  );

  return (
    <>
      <section aria-label="Dashboard statistics" className="reception-stats">
        <StatCard
          Icon={UsersIcon}
          title="Total Patients"
          value={patients.length}
          color="#117c79"
          onClick={() => onNavigate("patients")}
        />
        <StatCard
          Icon={CalendarIcon}
          title="Today's Appointments"
          value={
            appointments.filter((entry) => entry.status !== "Cancelled").length
          }
          color="#2f6b8f"
          onClick={() => onNavigate("appointments")}
        />
        <StatCard
          Icon={ClockIcon}
          title="Waiting Patients"
          value={waiting.length}
          color="#b9761a"
          onClick={() => onNavigate("queue")}
        />
        <StatCard
          Icon={CreditCardIcon}
          title="Today's Payments"
          value={formatLeone(todaysPayments)}
          color="#2e9e5b"
          onClick={() => onNavigate("payments")}
        />
        <StatCard
          Icon={ReceiptIcon}
          title="Receipts Generated Today"
          value={receipts.length}
          color="#6b57c4"
          onClick={() => onNavigate("receipts")}
        />
      </section>

      <section className="dashboard-panel quick-actions">
        <h2 className="panel-title">Quick Action Center</h2>
        <div className="quick-actions__buttons">
          <button onClick={() => onNavigate("patients")} type="button">
            <UsersIcon size={15} />
            Register Patient
          </button>
          <button onClick={() => onNavigate("appointments")} type="button">
            <CalendarPlusIcon size={15} />
            Book Appointment
          </button>
          <button onClick={() => onNavigate("payments")} type="button">
            <CreditCardIcon size={15} />
            Record Payment
          </button>
          <button onClick={() => onNavigate("receipts")} type="button">
            <ReceiptIcon size={15} />
            Generate Receipt
          </button>
          <button onClick={() => onNavigate("queue")} type="button">
            <ClipboardIcon size={15} />
            Manage Queue
          </button>
        </div>
      </section>

      <section className="dashboard-panel patient-search">
        <div className="patient-search__header">
          <label htmlFor="overview-patient-search">
            <SearchIcon size={14} />
            Patient Quick Search:
          </label>
          <input
            id="overview-patient-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Enter Patient ID, Full Name, or Phone Number..."
            value={search}
          />
          <button
            className="button-secondary"
            onClick={() => setSearch("")}
            type="button"
          >
            Clear Search
          </button>
        </div>
        <div className="search-results">
          <table className="dashboard-table">
            <thead>
              <tr>
                {[
                  "ID",
                  "Full Name",
                  "Gender",
                  "Phone Number",
                  "Assigned Doctor",
                ].map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {searchResults.length > 0 ? (
                searchResults.map((patient) => (
                  <tr key={patient.patientId}>
                    <td>{patient.patientId}</td>
                    <td>{patient.fullName}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.phoneNumber}</td>
                    <td>
                      {getDoctor(patient.assignedDoctorId)?.name ??
                        "Unassigned"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="table-empty" colSpan="5">
                    No patient matches “{search}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="reception-tables-grid">
        <div className="reception-tables-grid__column">
          <DashboardTable
            className="appointments-table"
            columns={[
              "ID",
              "Patient Name",
              "Assigned Doctor",
              "Time",
              "Status",
            ]}
            title="Today's Appointments Calendar"
            rows={todaysAppointments.map((appointment) => (
              <tr key={appointment.appointmentId}>
                <td>{appointment.appointmentId}</td>
                <td>
                  {getPatient(appointment.patientId)?.fullName ??
                    appointment.patientId}
                </td>
                <td>{getDoctor(appointment.doctorId)?.name ?? "Unassigned"}</td>
                <td>{appointment.time}</td>
                <td>{appointment.status}</td>
              </tr>
            ))}
          />

          <section className="dashboard-panel queue-panel">
            <h2 className="panel-title">Today's Waiting Patient Queue</h2>
            <div className="dashboard-table-scroll">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    {[
                      "Queue ID",
                      "Patient Name",
                      "App. Time",
                      "Payment",
                      "Status",
                    ].map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeQueue.length > 0 ? (
                    activeQueue.map((entry) => (
                      <tr key={entry.queueId}>
                        <td>{entry.queueId}</td>
                        <td>
                          {getPatient(entry.patientId)?.fullName ??
                            entry.patientId}
                        </td>
                        <td>{entry.queuedAt}</td>
                        <td>{entry.paid ? "Settled" : "Outstanding"}</td>
                        <td>{entry.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="table-empty" colSpan="5">
                        No patients are currently waiting.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="queue-actions">
              <button
                className="button-success"
                onClick={() => onNavigate("queue")}
                type="button"
              >
                <SpeakerIcon size={15} />
                Open Queue Management
              </button>
            </div>
          </section>
        </div>

        <div className="reception-tables-grid__column">
          <DashboardTable
            columns={["ID", "Full Name", "Gender", "Phone Number", "Reg Date"]}
            title="Latest Registered Patients"
            rows={latestPatients.map((patient) => (
              <tr key={patient.patientId}>
                <td>{patient.patientId}</td>
                <td>{patient.fullName}</td>
                <td>{patient.gender}</td>
                <td>{patient.phoneNumber}</td>
                <td>{patient.registrationDate}</td>
              </tr>
            ))}
          />
          <DashboardTable
            columns={["ID", "Patient Name", "Amount", "Method", "Date"]}
            title="Recent Payments Processed"
            rows={payments.slice(0, 5).map((payment) => (
              <tr key={payment.paymentId}>
                <td>{payment.paymentId}</td>
                <td>
                  {getPatient(payment.patientId)?.fullName ?? payment.patientId}
                </td>
                <td>{formatLeone(payment.amount)}</td>
                <td>{payment.method}</td>
                <td>{payment.date}</td>
              </tr>
            ))}
          />
          <section className="dashboard-panel activity-panel">
            <h2 className="panel-title">Waiting Alert &amp; Activity Log</h2>
            <div aria-live="polite" className="activity-log">
              {notifications.map((entry, index) => (
                <p key={`${entry}-${index}`}>{entry}</p>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
