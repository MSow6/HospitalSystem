"use client";

import { useMemo, useState } from "react";
import { todayIso } from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import { CalendarPlusIcon, CheckIcon, XIcon } from "./icons";
import {
  btn,
  btnIcon,
  btnIconDanger,
  Card,
  Cell,
  Empty,
  Field,
  Input,
  Row,
  Select,
  StatusPill,
  Table,
} from "./ui";

const columns = ["ID", "Patient", "Doctor", "When", "Status", "Actions"];

// Fixed 30-minute consultation slots. A slot is free for a doctor when no
// non-cancelled appointment already occupies it on the chosen date.
const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

export default function AppointmentsPanel() {
  const {
    appointments,
    patients,
    doctors,
    bookAppointment,
    setAppointmentStatus,
    getPatient,
    getDoctor,
    notify,
  } = useReception();

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: todayIso(),
    time: "",
    reason: "",
  });
  const [filterDate, setFilterDate] = useState(todayIso());
  const [statusFilter, setStatusFilter] = useState("All");

  const visible = useMemo(() => {
    return appointments
      .filter((appointment) =>
        filterDate ? appointment.date === filterDate : true,
      )
      .filter((appointment) =>
        statusFilter === "All" ? true : appointment.status === statusFilter,
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, filterDate, statusFilter]);

  const takenSlots = useMemo(
    () =>
      appointments
        .filter(
          (appointment) =>
            appointment.doctorId === Number(form.doctorId) &&
            appointment.date === form.date &&
            appointment.status !== "Cancelled",
        )
        .map((appointment) => appointment.time),
    [appointments, form.doctorId, form.date],
  );
  const freeSlotCount = TIME_SLOTS.filter(
    (slot) => !takenSlots.includes(slot),
  ).length;

  const selectedPatient = patients.find(
    (patient) => patient.patientId === Number(form.patientId),
  );

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "patientId") {
        const patient = patients.find(
          (entry) => entry.patientId === Number(value),
        );
        if (patient?.assignedDoctorId)
          next.doctorId = String(patient.assignedDoctorId);
      }
      return next;
    });
  }

  function handleBook(event) {
    event.preventDefault();
    if (!form.patientId || !form.doctorId || !form.date || !form.time) {
      notify(
        "Patient, doctor, date, and time are required to book an appointment.",
      );
      return;
    }
    const clash = appointments.find(
      (appointment) =>
        appointment.doctorId === Number(form.doctorId) &&
        appointment.date === form.date &&
        appointment.time === form.time &&
        appointment.status !== "Cancelled",
    );
    if (clash) {
      notify("That doctor already has an appointment at this date and time.");
      return;
    }

    bookAppointment({
      patientId: Number(form.patientId),
      doctorId: Number(form.doctorId),
      date: form.date,
      time: form.time,
      reason: form.reason.trim(),
    });

    setForm((current) => ({
      ...current,
      patientId: "",
      doctorId: "",
      reason: "",
    }));
    setFilterDate(form.date);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <Card
        className="self-start"
        subtitle="Schedule a clinical appointment for a registered patient."
        title="Book Appointment"
      >
        <form className="flex flex-col gap-3.5" onSubmit={handleBook}>
          <Field
            label="Patient *"
            hint={
              selectedPatient
                ? `Assigned to ${selectedPatient.fullName}'s doctor automatically.`
                : undefined
            }
          >
            <Select
              name="patientId"
              onChange={updateField}
              value={form.patientId}
            >
              <option value="">Select a patient...</option>
              {patients.map((patient) => (
                <option key={patient.patientId} value={patient.patientId}>
                  {patient.patientId} — {patient.fullName}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Doctor *">
            <Select
              name="doctorId"
              onChange={updateField}
              value={form.doctorId}
            >
              <option value="">Select a doctor...</option>
              {doctors.map((doctor) => (
                <option key={doctor.workerId} value={doctor.workerId}>
                  {doctor.name} — {doctor.specialty}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Date *">
            <Input
              name="date"
              onChange={updateField}
              type="date"
              value={form.date}
            />
          </Field>

          <Field
            hint={
              !form.doctorId
                ? undefined
                : freeSlotCount === 0
                  ? "No free slots left for this doctor on this date."
                  : `${freeSlotCount} free slot(s) available for this doctor.`
            }
            label="Time *"
          >
            {form.doctorId ? (
              <div className="grid grid-cols-4 gap-1.5">
                {TIME_SLOTS.map((slot) => {
                  const taken = takenSlots.includes(slot);
                  const active = form.time === slot;
                  return (
                    <button
                      className={`inline-flex h-8 items-center justify-center rounded-md border text-[11px] font-semibold tabular-nums transition ${
                        taken
                          ? "cursor-not-allowed border-line-soft bg-surface-soft text-muted-soft line-through opacity-60"
                          : active
                            ? "border-brand-600 bg-brand-600 text-white shadow-control"
                            : "border-line bg-white text-ink-soft hover:border-brand-300 hover:bg-surface"
                      }`}
                      disabled={taken}
                      key={slot}
                      onClick={() =>
                        setForm((current) => ({ ...current, time: slot }))
                      }
                      type="button"
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-line bg-surface-soft px-3 py-3 text-[12px] text-muted-soft">
                Select a doctor to see their free times.
              </p>
            )}
          </Field>

          <Field label="Reason / Notes">
            <Input
              name="reason"
              onChange={updateField}
              placeholder="e.g. Follow-up consultation"
              value={form.reason}
            />
          </Field>

          <div className="pt-1">
            <button className={btn.primary} type="submit">
              <CalendarPlusIcon size={15} />
              Book Appointment
            </button>
          </div>
        </form>
      </Card>

      <Card
        className="self-start"
        subtitle={`${visible.length} appointment(s)${filterDate ? ` on ${filterDate}` : ""}`}
        title="Appointment Schedule"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Input
            aria-label="Filter by date"
            className="!w-44"
            onChange={(event) => setFilterDate(event.target.value)}
            type="date"
            value={filterDate}
          />
          <Select
            aria-label="Filter by status"
            className="!w-40"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
          >
            {["All", "Scheduled", "Completed", "Cancelled"].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </Select>
          <button
            className={btn.ghost}
            onClick={() => setFilterDate("")}
            type="button"
          >
            All Dates
          </button>
        </div>
        {visible.length === 0 ? (
          <Empty>No appointments match the current filter.</Empty>
        ) : (
          <Table colSpan={columns.length} columns={columns}>
            {visible.map((appointment) => {
              const patient = getPatient(appointment.patientId);
              return (
                <Row key={appointment.appointmentId}>
                  <Cell className="font-semibold">
                    {appointment.appointmentId}
                  </Cell>
                  <Cell>
                    {patient ? patient.fullName : appointment.patientId}
                    {patient ? (
                      <span className="block text-xs text-[#8a9ba0]">
                        ID {patient.patientId}
                      </span>
                    ) : null}
                  </Cell>
                  <Cell>
                    {getDoctor(appointment.doctorId)?.name ?? "Unassigned"}
                  </Cell>
                  <Cell>
                    <span className="block font-medium text-ink">
                      {appointment.date}
                    </span>
                    <span className="block text-xs text-muted-soft">
                      {appointment.time}
                    </span>
                  </Cell>
                  <Cell>
                    <StatusPill status={appointment.status} />
                  </Cell>
                  <Cell>
                    <div className="flex items-center gap-1.5">
                      <button
                        aria-label="Mark completed"
                        className={`${btnIcon} !px-2`}
                        disabled={appointment.status !== "Scheduled"}
                        onClick={() =>
                          setAppointmentStatus(
                            appointment.appointmentId,
                            "Completed",
                          )
                        }
                        title="Mark completed"
                        type="button"
                      >
                        <CheckIcon size={14} />
                      </button>
                      <button
                        aria-label="Cancel appointment"
                        className={`${btnIconDanger} !px-2`}
                        disabled={appointment.status === "Cancelled"}
                        onClick={() =>
                          setAppointmentStatus(
                            appointment.appointmentId,
                            "Cancelled",
                          )
                        }
                        title="Cancel appointment"
                        type="button"
                      >
                        <XIcon size={14} />
                      </button>
                    </div>
                  </Cell>
                </Row>
              );
            })}
          </Table>
        )}
      </Card>
    </div>
  );
}
