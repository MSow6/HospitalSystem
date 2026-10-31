"use client";

import { useMemo } from "react";
import { useReception } from "@/lib/reception-store";
import { todayIso } from "@/lib/mock-data";
import {
  CalendarIcon,
  ClockIcon,
  ClipboardIcon,
  StethoscopeIcon,
} from "../reception/icons";
import {
  btn,
  Card,
  Cell,
  Empty,
  Row,
  StatusPill,
  Table,
} from "../reception/ui";

function StatCard({ Icon, title, value, color }) {
  return (
    <div
      className="dashboard-stat"
      style={{ "--stat-color": color, cursor: "default" }}
    >
      <div className="dashboard-stat__icon">
        <Icon size={17} />
      </div>
      <div className="dashboard-stat__title">{title}</div>
      <strong className="dashboard-stat__value">{value}</strong>
    </div>
  );
}

export default function DoctorOverviewPanel({ onNavigate }) {
  const {
    appointments,
    queue,
    labRequests,
    patients,
    diagnoses,
    currentDoctor,
    getPatient,
    getDoctor,
  } = useReception();

  const today = todayIso();
  const workerId = currentDoctor.workerId;

  const todaysAppointments = useMemo(
    () =>
      appointments
        .filter((entry) => entry.doctorId === workerId && entry.date === today)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, workerId, today],
  );

  const activeQueue = queue.filter((entry) => {
    const appointment = entry.appointmentId
      ? appointments.find((a) => a.appointmentId === entry.appointmentId)
      : null;
    const patient = getPatient(entry.patientId);
    const doctorId =
      appointment?.doctorId ??
      entry.doctorId ??
      patient?.assignedDoctorId ??
      null;
    return doctorId === workerId && entry.status !== "Completed";
  });

  const pendingLabs = labRequests.filter(
    (request) => request.doctorId === workerId && request.status === "Pending",
  ).length;

  const completedToday = todaysAppointments.filter(
    (entry) => entry.status === "Completed",
  ).length;

  const assignedPatients = patients.filter(
    (patient) => patient.assignedDoctorId === workerId,
  );

  const recentDiagnoses = diagnoses
    .filter((entry) => entry.doctorId === workerId)
    .slice(0, 6);

  return (
    <div className="grid gap-5">
      <section aria-label="Doctor statistics" className="reception-stats">
        <StatCard
          Icon={CalendarIcon}
          title="Today's Appointments"
          value={todaysAppointments.length}
          color="#2f6b8f"
        />
        <StatCard
          Icon={ClockIcon}
          title="In My Queue"
          value={activeQueue.length}
          color="#b9761a"
        />
        <StatCard
          Icon={ClipboardIcon}
          title="Lab Results Pending"
          value={pendingLabs}
          color="#9c6b1a"
        />
        <StatCard
          Icon={StethoscopeIcon}
          title="Consultations Completed"
          value={completedToday}
          color="#2e9e5b"
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card
          actions={
            <button
              className={btn.secondary}
              onClick={() => onNavigate("queue")}
              type="button"
            >
              <StethoscopeIcon size={15} />
              Open My Queue
            </button>
          }
          className="self-start"
          subtitle="Patients booked with you today, in time order."
          title="Today's Schedule"
        >
          {todaysAppointments.length === 0 ? (
            <Empty>No appointments booked with you today.</Empty>
          ) : (
            <Table columns={["Time", "Patient", "Status"]}>
              {todaysAppointments.map((entry) => {
                const patient = getPatient(entry.patientId);
                return (
                  <Row key={entry.appointmentId}>
                    <Cell className="whitespace-nowrap font-bold text-ink">
                      {entry.time}
                    </Cell>
                    <Cell>
                      {patient ? patient.fullName : entry.patientId}
                      <span className="block text-[11px] text-muted-soft">
                        ID {entry.patientId}
                      </span>
                    </Cell>
                    <Cell>
                      <StatusPill status={entry.status} />
                    </Cell>
                  </Row>
                );
              })}
            </Table>
          )}
        </Card>

        <Card
          className="self-start"
          subtitle="Patients currently under your care."
          title="Assigned Patients"
        >
          {assignedPatients.length === 0 ? (
            <Empty>No patients are assigned to you.</Empty>
          ) : (
            <Table columns={["Patient", "Gender", "Blood", "Last Seen"]}>
              {assignedPatients.map((patient) => (
                <Row key={patient.patientId}>
                  <Cell>
                    <span className="font-medium text-ink">
                      {patient.fullName}
                    </span>
                    <span className="block text-[11px] text-muted-soft">
                      ID {patient.patientId} · {patient.phoneNumber}
                    </span>
                  </Cell>
                  <Cell>{patient.gender}</Cell>
                  <Cell>{patient.bloodGroup ?? "—"}</Cell>
                  <Cell className="whitespace-nowrap">
                    {patient.registrationDate}
                  </Cell>
                </Row>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Card
        className="self-start"
        subtitle="The most recent diagnoses you have recorded."
        title="Recent Diagnoses"
      >
        {recentDiagnoses.length === 0 ? (
          <Empty>You have not recorded any diagnoses yet.</Empty>
        ) : (
          <Table columns={["Date", "Patient", "Diagnosis"]}>
            {recentDiagnoses.map((entry) => {
              const patient = getPatient(entry.patientId);
              return (
                <Row key={entry.diagnosisId}>
                  <Cell className="whitespace-nowrap">{entry.date}</Cell>
                  <Cell className="text-ink">
                    {patient ? patient.fullName : entry.patientId}
                  </Cell>
                  <Cell className="text-ink-soft">{entry.details}</Cell>
                </Row>
              );
            })}
          </Table>
        )}
      </Card>

      <p className="text-[11px] text-muted-soft">
        Signed in as {getDoctor(workerId)?.name ?? currentDoctor.fullName} ·{" "}
        {currentDoctor.specialty} · {currentDoctor.room}
      </p>
    </div>
  );
}
