"use client";

import { useState } from "react";
import { todayIso } from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import { EraserIcon, PencilIcon, TrashIcon, UserPlusIcon } from "./icons";
import { btn, Card, Cell, Empty, Field, Input, Row, Select, Table } from "./ui";

const emptyForm = {
  fullName: "",
  dateOfBirth: "",
  gender: "Male",
  phoneNumber: "",
  address: "",
  bloodGroup: "O+",
  assignedDoctorId: "",
};

const bloodGroups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const columns = [
  "ID",
  "Full Name",
  "Age",
  "Gender",
  "Phone",
  "Blood",
  "Assigned Doctor",
];

function ageFrom(dateOfBirth) {
  const born = new Date(dateOfBirth);
  if (Number.isNaN(born.getTime())) return "—";
  const diff = Date.now() - born.getTime();
  return `${Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))} yrs`;
}

export default function PatientsPanel() {
  const {
    patients,
    doctors,
    addPatient,
    updatePatient,
    deletePatient,
    notify,
  } = useReception();

  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const selected =
    patients.find((patient) => patient.patientId === selectedId) ?? null;

  const visible = search.trim()
    ? patients.filter((patient) => {
        const term = search.trim().toLowerCase();
        return (
          String(patient.patientId).includes(term) ||
          patient.fullName.toLowerCase().includes(term) ||
          patient.phoneNumber.toLowerCase().includes(term) ||
          patient.address.toLowerCase().includes(term)
        );
      })
    : patients;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setSelectedId(null);
  }

  function handleAdd(event) {
    event.preventDefault();
    if (!form.fullName.trim() || !form.dateOfBirth) {
      notify("Full Name and Date of Birth are required.");
      return;
    }
    if (!form.assignedDoctorId) {
      notify("Please assign a doctor before registering the patient.");
      return;
    }

    const nextId =
      Math.max(0, ...patients.map((patient) => patient.patientId)) + 1;
    const patient = {
      patientId: nextId,
      fullName: form.fullName.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      phoneNumber: form.phoneNumber.trim() || "—",
      address: form.address.trim() || "—",
      bloodGroup: form.bloodGroup,
      assignedDoctorId: Number(form.assignedDoctorId),
      registrationDate: todayIso(),
      registrationPaid: false,
      registrationPaidAt: null,
    };

    addPatient(patient);

    resetForm();
  }

  function handleUpdate() {
    if (!selected) {
      notify("Select a patient from the table first.");
      return;
    }
    if (!form.fullName.trim()) {
      notify("Enter the updated details in the form, then press Update.");
      return;
    }
    updatePatient(selected.patientId, {
      fullName: form.fullName.trim(),
      dateOfBirth: form.dateOfBirth || selected.dateOfBirth,
      gender: form.gender,
      phoneNumber: form.phoneNumber.trim() || selected.phoneNumber,
      address: form.address.trim() || selected.address,
      bloodGroup: form.bloodGroup,
      assignedDoctorId:
        Number(form.assignedDoctorId) || selected.assignedDoctorId,
    });
    resetForm();
  }

  function handleDelete() {
    if (!selected) {
      notify("Select a patient from the table first.");
      return;
    }
    if (
      !window.confirm(`Remove ${selected.fullName} (ID ${selected.patientId})?`)
    )
      return;
    deletePatient(selected.patientId);
    resetForm();
  }

  function selectRow(patient) {
    setSelectedId(patient.patientId);
    setForm({
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phoneNumber: patient.phoneNumber === "—" ? "" : patient.phoneNumber,
      address: patient.address === "—" ? "" : patient.address,
      bloodGroup: patient.bloodGroup,
      assignedDoctorId: String(patient.assignedDoctorId ?? ""),
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <Card
        subtitle="Register a new patient and assign them to a doctor."
        title="Patient Registration"
      >
        <form className="flex flex-col gap-4" onSubmit={handleAdd}>
          <Field label="Full Name *">
            <Input
              autoComplete="name"
              name="fullName"
              onChange={updateField}
              placeholder="e.g. Mohamed Sesay"
              value={form.fullName}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date of Birth *">
              <Input
                name="dateOfBirth"
                onChange={updateField}
                type="date"
                value={form.dateOfBirth}
              />
            </Field>
            <Field label="Gender *">
              <Select name="gender" onChange={updateField} value={form.gender}>
                <option>Male</option>
                <option>Female</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone Number">
              <Input
                autoComplete="tel"
                name="phoneNumber"
                onChange={updateField}
                placeholder="+232-76-000000"
                value={form.phoneNumber}
              />
            </Field>
            <Field label="Blood Group">
              <Select
                name="bloodGroup"
                onChange={updateField}
                value={form.bloodGroup}
              >
                {bloodGroups.map((group) => (
                  <option key={group}>{group}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Address">
            <Input
              autoComplete="street-address"
              name="address"
              onChange={updateField}
              placeholder="Street, City"
              value={form.address}
            />
          </Field>

          <Field label="Assign Doctor *">
            <Select
              name="assignedDoctorId"
              onChange={updateField}
              value={form.assignedDoctorId}
            >
              <option value="">Select a doctor...</option>
              {doctors.map((doctor) => (
                <option key={doctor.workerId} value={doctor.workerId}>
                  {doctor.name} — {doctor.specialty}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <button className={btn.primary} type="submit">
              <UserPlusIcon size={15} />
              Register
            </button>
            <button
              className={btn.secondary}
              onClick={handleUpdate}
              type="button"
            >
              <PencilIcon size={15} />
              Update
            </button>
            <button className={btn.secondary} onClick={resetForm} type="button">
              <EraserIcon size={15} />
              Clear
            </button>
            <button className={btn.danger} onClick={handleDelete} type="button">
              <TrashIcon size={15} />
              Delete
            </button>
          </div>
        </form>
      </Card>

      <Card
        actions={
          <>
            <Input
              aria-label="Search patients"
              className="!w-64"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, ID, or phone..."
              value={search}
            />
            <button
              className={btn.secondary}
              onClick={() => setSearch("")}
              type="button"
            >
              Clear
            </button>
          </>
        }
        subtitle={`${visible.length} of ${patients.length} patient records`}
        title="Patient Records"
      >
        {selected ? (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#cfdcda] bg-[#f2f7f7] px-3 py-2 text-sm">
            <span className="text-[#2b4a52]">
              Selected: <strong>{selected.fullName}</strong> (ID{" "}
              {selected.patientId})
            </span>
          </div>
        ) : null}

        {visible.length === 0 ? (
          <Empty>No patient matches “{search}”.</Empty>
        ) : (
          <Table columns={columns} colSpan={columns.length}>
            {visible.map((patient) => (
              <Row
                key={patient.patientId}
                onClick={() => selectRow(patient)}
                selected={patient.patientId === selectedId}
              >
                <Cell className="font-semibold">{patient.patientId}</Cell>
                <Cell>{patient.fullName}</Cell>
                <Cell>{ageFrom(patient.dateOfBirth)}</Cell>
                <Cell>{patient.gender}</Cell>
                <Cell>{patient.phoneNumber}</Cell>
                <Cell>{patient.bloodGroup}</Cell>
                <Cell>
                  {doctors.find(
                    (doctor) => doctor.workerId === patient.assignedDoctorId,
                  )?.name ?? "Unassigned"}
                </Cell>
              </Row>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
