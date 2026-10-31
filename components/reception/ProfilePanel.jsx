"use client";

import { useState } from "react";
import { CLINIC } from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  LockIcon,
  ReceiptIcon,
  ShieldIcon,
  UsersIcon,
} from "./icons";
import { btn, Card, Field, Input, Select } from "./ui";

function initialsOf(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Reused by every role panel: pass the signed-in user to override the default
// receptionist profile carried by the store.
export default function ProfilePanel({ user = null }) {
  const {
    currentUser: sessionUser,
    patients,
    appointments,
    receipts,
    notify,
  } = useReception();
  const currentUser = user ?? sessionUser;
  const [profile, setProfile] = useState({
    fullName: currentUser.fullName,
    email: currentUser.email,
    phone: currentUser.phone,
    gender: currentUser.gender,
    address: currentUser.address,
  });
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  function updateProfile(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  }

  function updatePassword(event) {
    const { name, value } = event.target;
    setPasswords((current) => ({ ...current, [name]: value }));
  }

  function saveProfile(event) {
    event.preventDefault();
    if (!profile.fullName.trim() || !profile.email.trim()) {
      notify("Full name and email are required.");
      return;
    }
    notify("Profile details updated (not saved to a database yet).");
  }

  function changePassword(event) {
    event.preventDefault();
    if (!passwords.current || !passwords.next) {
      notify("Fill in your current and new password.");
      return;
    }
    if (passwords.next.length < 6) {
      notify("New password must be at least 6 characters.");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      notify("New password and confirmation do not match.");
      return;
    }
    setPasswords({ current: "", next: "", confirm: "" });
    notify(
      "Password change validated — wiring to the server comes with the backend.",
    );
  }

  const facts = [
    { label: "Email", value: currentUser.email },
    { label: "Phone", value: currentUser.phone },
    { label: "Last login", value: currentUser.lastLogin },
  ];

  const activity = [
    {
      label: "Patients",
      value: patients.length,
      Icon: UsersIcon,
      tone: "text-brand-600",
      tint: "bg-brand-50",
    },
    {
      label: "Appointments",
      value: appointments.length,
      Icon: CalendarIcon,
      tone: "text-[#1c6bb0]",
      tint: "bg-[#e8f1fb]",
    },
    {
      label: "Receipts",
      value: receipts.length,
      Icon: ReceiptIcon,
      tone: "text-success",
      tint: "bg-[#e7f6ec]",
    },
  ];

  const rules = [
    { label: "At least 6 characters", ok: passwords.next.length >= 6 },
    {
      label: "New password matches confirmation",
      ok: passwords.next.length > 0 && passwords.next === passwords.confirm,
    },
  ];
  const showRules = Boolean(passwords.next || passwords.confirm);

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="overflow-hidden rounded-panel border border-line bg-white shadow-panel">
        <div className="relative h-[124px] bg-gradient-to-br from-[#0c4f4d] via-[#117c79] to-[#2b9d9a]">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 78% 8%, rgba(255,255,255,0.30) 0, transparent 42%), radial-gradient(circle at 10% 130%, rgba(255,255,255,0.18) 0, transparent 46%)",
            }}
          />

          {/* Woven textile motif: interlocking diamonds laid across the gradient. */}
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full text-white"
          >
            <defs>
              <pattern
                height="26"
                id="profile-weave"
                patternTransform="rotate(45)"
                patternUnits="userSpaceOnUse"
                width="26"
              >
                <path
                  d="M0 13h26M13 0v26"
                  opacity="0.45"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <rect
                  fill="none"
                  height="9"
                  opacity="0.6"
                  stroke="currentColor"
                  strokeWidth="1"
                  width="9"
                  x="8.5"
                  y="8.5"
                />
                <circle
                  cx="13"
                  cy="13"
                  fill="currentColor"
                  opacity="0.7"
                  r="1.5"
                />
              </pattern>
            </defs>
            <rect
              fill="url(#profile-weave)"
              height="100%"
              opacity="0.3"
              width="100%"
            />
          </svg>

          {/* Fade keeps the avatar plate and the name legible over the weave. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0a3f3e]/60 via-transparent to-white/10"
          />

          <div className="relative flex h-full items-start justify-between gap-3 px-5 pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-label text-white backdrop-blur">
              <ShieldIcon size={12} />
              {currentUser.role}
            </span>
            <span className="max-w-[55%] text-right text-[10px] font-semibold uppercase leading-snug tracking-[0.18em] text-white/70">
              {CLINIC.name}
            </span>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="-mt-6 flex items-end justify-between gap-4">
            <div className="grid h-[76px] w-[76px] place-items-center rounded-2xl border-4 border-white bg-[#0a3f3e] font-display text-2xl font-extrabold tracking-tight text-white shadow-panel">
              {initialsOf(currentUser.fullName)}
            </div>
            <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-[#e7f6ec] px-2.5 py-1 text-[11px] font-semibold text-success">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-current"
              />
              {currentUser.status}
            </span>
          </div>

          <h2 className="mt-3 font-display text-[19px] font-extrabold tracking-tight text-ink">
            {currentUser.fullName}
          </h2>
          <p className="mt-0.5 text-[13px] text-muted">
            {currentUser.role} · @{currentUser.username}
          </p>

          <dl className="mt-4 grid gap-2 sm:grid-cols-3">
            {facts.map((fact) => (
              <div
                className="rounded-lg border border-line-soft bg-surface-soft px-3 py-2"
                key={fact.label}
              >
                <dt className="text-[10px] font-semibold uppercase tracking-label text-muted-soft">
                  {fact.label}
                </dt>
                <dd className="mt-0.5 truncate text-[12px] font-medium text-ink-soft">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <form
          className="flex flex-col gap-4 border-t border-line-soft bg-surface-soft/60 px-5 py-5"
          onSubmit={saveProfile}
        >
          <p className="text-[11px] font-semibold uppercase tracking-label text-muted">
            Account details
          </p>

          <Field label="Full Name *">
            <Input
              name="fullName"
              onChange={updateProfile}
              value={profile.fullName}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email *">
              <Input
                name="email"
                onChange={updateProfile}
                type="email"
                value={profile.email}
              />
            </Field>
            <Field label="Phone">
              <Input
                name="phone"
                onChange={updateProfile}
                value={profile.phone}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender">
              <Select
                name="gender"
                onChange={updateProfile}
                value={profile.gender}
              >
                <option>Male</option>
                <option>Female</option>
              </Select>
            </Field>
            <Field label="Address">
              <Input
                name="address"
                onChange={updateProfile}
                value={profile.address}
              />
            </Field>
          </div>

          <div>
            <button className={btn.primary} type="submit">
              <CheckIcon size={15} />
              Save Changes
            </button>
          </div>
        </form>
      </section>

      <div className="flex flex-col gap-5">
        <Card
          subtitle="Change the password used to sign in."
          title={
            <span className="inline-flex items-center gap-2">
              <ShieldIcon className="text-brand-600" size={16} />
              Security
            </span>
          }
        >
          <form className="flex flex-col gap-4" onSubmit={changePassword}>
            <Field label="Current Password">
              <Input
                autoComplete="current-password"
                name="current"
                onChange={updatePassword}
                type="password"
                value={passwords.current}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="New Password">
                <Input
                  autoComplete="new-password"
                  name="next"
                  onChange={updatePassword}
                  type="password"
                  value={passwords.next}
                />
              </Field>
              <Field label="Confirm Password">
                <Input
                  autoComplete="new-password"
                  name="confirm"
                  onChange={updatePassword}
                  type="password"
                  value={passwords.confirm}
                />
              </Field>
            </div>

            {showRules ? (
              <ul className="flex flex-col gap-1.5 rounded-md border border-line-soft bg-surface-soft px-3 py-2.5">
                {rules.map((rule) => (
                  <li
                    className="flex items-center gap-2 text-[12px]"
                    key={rule.label}
                  >
                    <span
                      className={`grid h-4 w-4 flex-none place-items-center rounded-full ${
                        rule.ok
                          ? "bg-[#e7f6ec] text-success"
                          : "bg-[#eef3f2] text-muted-soft"
                      }`}
                    >
                      <CheckIcon size={10} />
                    </span>
                    <span className={rule.ok ? "text-ink-soft" : "text-muted"}>
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div>
              <button className={btn.secondary} type="submit">
                <LockIcon size={15} />
                Update Password
              </button>
            </div>
          </form>
        </Card>

        <Card
          title={
            <span className="inline-flex items-center gap-2">
              <ClockIcon className="text-brand-600" size={16} />
              Today&apos;s Activity
            </span>
          }
        >
          <div className="grid grid-cols-3 gap-3">
            {activity.map((item) => (
              <div
                className="rounded-lg border border-line-soft bg-surface-soft px-3 py-3 text-center"
                key={item.label}
              >
                <span
                  className={`mx-auto grid h-8 w-8 place-items-center rounded-lg ${item.tint} ${item.tone}`}
                >
                  <item.Icon size={16} />
                </span>
                <p
                  className={`mt-2 font-display text-[22px] font-extrabold leading-none tabular-nums ${item.tone}`}
                >
                  {item.value}
                </p>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-label text-muted">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
