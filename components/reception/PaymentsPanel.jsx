"use client";

import { useEffect, useRef, useState } from "react";
import {
  clinicFees,
  formatLeone,
  paymentMethods,
  paymentTypes,
} from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import { CreditCardIcon, ReceiptIcon } from "./icons";
import ReceiptViewer from "./ReceiptViewer";
import {
  btn,
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

const columns = [
  "Payment",
  "Patient",
  "Type",
  "Amount",
  "Method",
  "Date",
  "Receipt",
];

// Searchable patient selector. Replaces the plain dropdown so the receptionist
// can type a name/ID/phone, and each match shows whether the person is a new
// or returning patient (i.e. whether the registration fee still applies).
function PatientPicker({ patients, selectedId, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected =
    patients.find(
      (patient) => String(patient.patientId) === String(selectedId),
    ) ?? null;

  const term = query.trim().toLowerCase();
  const matches = term
    ? patients.filter(
        (patient) =>
          String(patient.patientId).includes(term) ||
          patient.fullName.toLowerCase().includes(term) ||
          patient.phoneNumber.toLowerCase().includes(term),
      )
    : patients;

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {selected.fullName}
          </p>
          <p className="text-xs text-muted-soft">
            ID {selected.patientId} · {selected.phoneNumber}
          </p>
        </div>
        <button
          className={btn.secondary}
          onClick={() => onSelect("")}
          type="button"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={boxRef}>
      <Input
        aria-label="Search patient"
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search name, ID, or phone..."
        value={query}
      />
      {open ? (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-line bg-white shadow-panel">
          {matches.length === 0 ? (
            <p className="px-3 py-3 text-[13px] text-muted-soft">
              No patient matches “{query}”. Register them under Patients first.
            </p>
          ) : (
            matches.map((patient) => (
              <button
                className="flex w-full items-center justify-between gap-3 border-b border-line-soft px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-surface-soft"
                key={patient.patientId}
                onClick={() => {
                  onSelect(String(patient.patientId));
                  setQuery("");
                  setOpen(false);
                }}
                type="button"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-ink">
                    {patient.fullName}
                  </span>
                  <span className="block text-[11px] text-muted-soft">
                    ID {patient.patientId} · {patient.phoneNumber}
                  </span>
                </span>
                {patient.registrationPaid ? (
                  <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-label text-muted-soft">
                    Returning
                  </span>
                ) : (
                  <span className="whitespace-nowrap rounded-full bg-[#fff4e5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-label text-warning">
                    New
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function PaymentsPanel() {
  const {
    patients,
    payments,
    receipts,
    labTests,
    services,
    recordPayment,
    getPatient,
    notify,
  } = useReception();

  const [form, setForm] = useState({
    patientId: "",
    paymentType: "Consultation",
    method: "Cash",
    note: "",
  });
  const [selectedTests, setSelectedTests] = useState([]);
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);

  const testKey = selectedTests.join(",");

  const selectedPatient =
    patients.find((patient) => patient.patientId === Number(form.patientId)) ??
    null;
  const registrationFee = clinicFees.registration;
  // The durable flag on the patient record decides this — not the payment
  // history — so a returning patient is never charged the registration fee
  // twice, even when the fee was bundled into another payment type.
  const isNewPatient = selectedPatient
    ? !selectedPatient.registrationPaid
    : false;
  const includeRegistration =
    isNewPatient && form.paymentType !== "Registration" && registrationFee > 0;

  useEffect(() => {
    const registration = includeRegistration ? registrationFee : 0;
    if (form.paymentType === "Laboratory") {
      const total = labTests
        .filter((test) => selectedTests.includes(test.testId))
        .reduce((sum, test) => sum + test.price, 0);
      setAmount(String(total + registration));
      return;
    }
    const service = services.find(
      (entry) => entry.serviceName === form.paymentType,
    );
    setAmount(String((service ? service.price : 0) + registration));
  }, [
    form.paymentType,
    testKey,
    labTests,
    services,
    selectedTests,
    includeRegistration,
    registrationFee,
  ]);

  const visible = search.trim()
    ? payments.filter((payment) => {
        const term = search.trim().toLowerCase();
        const patient = getPatient(payment.patientId);
        return (
          String(payment.paymentId).includes(term) ||
          (patient ? patient.fullName.toLowerCase().includes(term) : false)
        );
      })
    : payments;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleTest(testId) {
    setSelectedTests((current) =>
      current.includes(testId)
        ? current.filter((id) => id !== testId)
        : [...current, testId],
    );
  }

  function buildItems() {
    const items = [];
    if (includeRegistration) {
      items.push({
        description: "Registration fee (new patient)",
        type: "Registration",
        amount: registrationFee,
      });
    }
    if (form.paymentType === "Laboratory") {
      labTests
        .filter((test) => selectedTests.includes(test.testId))
        .forEach((test) => {
          items.push({
            description: test.testName,
            type: "Laboratory",
            amount: test.price,
          });
        });
      return items;
    }
    items.push({
      description: form.note.trim() || `${form.paymentType} service`,
      type: form.paymentType,
      amount: Math.max(
        0,
        (Number(amount) || 0) - (includeRegistration ? registrationFee : 0),
      ),
    });
    return items;
  }

  function handleRecord(event) {
    event.preventDefault();
    if (!form.patientId) {
      notify("Select the patient this payment belongs to.");
      return;
    }
    if (form.paymentType === "Laboratory" && selectedTests.length === 0) {
      notify("Select at least one laboratory test.");
      return;
    }

    const items = buildItems();
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    if (total <= 0) {
      notify("Enter a payment amount greater than zero.");
      return;
    }

    recordPayment({
      patientId: Number(form.patientId),
      paymentType: form.paymentType,
      amount: total,
      method: form.method,
      note:
        form.note.trim() ||
        (includeRegistration
          ? `${form.paymentType} and registration`
          : form.paymentType === "Laboratory"
            ? `${selectedTests.length} laboratory test(s)`
            : items[0].description),
      items,
    });

    setForm((current) => ({ ...current, patientId: "", note: "" }));
    setSelectedTests([]);
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayTotal = payments
    .filter((payment) => payment.date === today)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = payments.filter((payment) => payment.status !== "Paid");

  const previewItems = buildItems();
  const previewTotal = previewItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <Card
        subtitle="Record money received from a patient. A receipt is issued automatically."
        title="Record Payment"
      >
        <form className="flex flex-col gap-4" onSubmit={handleRecord}>
          <Field label="Patient *">
            <PatientPicker
              onSelect={(patientId) =>
                setForm((current) => ({ ...current, patientId }))
              }
              patients={patients}
              selectedId={form.patientId}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Payment Type">
              <Select
                name="paymentType"
                onChange={updateField}
                value={form.paymentType}
              >
                {paymentTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </Select>
            </Field>
            <Field label="Method">
              <Select name="method" onChange={updateField} value={form.method}>
                {paymentMethods.map((method) => (
                  <option key={method}>{method}</option>
                ))}
              </Select>
            </Field>
          </div>

          {form.paymentType === "Laboratory" ? (
            <Field label="Laboratory Tests">
              <div className="flex flex-col gap-2 rounded-md border border-line p-3">
                {labTests.map((test) => (
                  <label
                    className="flex items-center justify-between text-sm text-ink-soft"
                    key={test.testId}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        checked={selectedTests.includes(test.testId)}
                        onChange={() => toggleTest(test.testId)}
                        type="checkbox"
                      />
                      {test.testName}
                    </span>
                    <span className="text-muted-soft">
                      {formatLeone(test.price)}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          ) : null}

          <Field
            hint="Auto-calculated from the selected service — override if needed."
            label="Amount"
          >
            <Input
              min="0"
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              value={amount}
            />
          </Field>

          <Field label="Note">
            <Input
              name="note"
              onChange={updateField}
              placeholder="e.g. Consultation fee"
              value={form.note}
            />
          </Field>

          <div className="rounded-md border border-line-soft bg-surface px-3 py-2.5 text-sm text-ink-soft">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-label text-muted">
              This receipt
            </p>
            <ul className="flex flex-col gap-1">
              {previewItems.map((item, index) => (
                <li
                  className="flex items-center justify-between gap-3"
                  key={`${item.type}-${index}`}
                >
                  <span className="min-w-0 truncate">{item.description}</span>
                  <span className="tabular-nums text-muted">
                    {formatLeone(item.amount)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t border-line pt-2 font-semibold text-ink">
              <span>Amount to charge</span>
              <span className="text-brand-600 tabular-nums">
                {formatLeone(previewTotal)}
              </span>
            </div>
          </div>

          <div className="pt-1">
            <button className={btn.primary} type="submit">
              <CreditCardIcon size={15} />
              Record Payment
            </button>
          </div>
        </form>
      </Card>

      <Card
        actions={
          <>
            <Input
              aria-label="Search payments"
              className="!w-56"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search payment or patient..."
              value={search}
            />
            <span className="rounded-md bg-[#e7f6ec] px-3 py-2 text-sm font-semibold text-success">
              Collected today: {formatLeone(todayTotal)}
            </span>
          </>
        }
        subtitle={`${visible.length} payment(s) recorded · ${outstanding.length} outstanding`}
        title="Payment Records"
      >
        {visible.length === 0 ? (
          <Empty>No payments match the current search.</Empty>
        ) : (
          <Table colSpan={columns.length} columns={columns}>
            {visible.map((payment) => {
              const patient = getPatient(payment.patientId);
              const receipt = receipts.find(
                (entry) => entry.paymentId === payment.paymentId,
              );
              return (
                <Row key={payment.paymentId}>
                  <Cell className="font-semibold">PAY-{payment.paymentId}</Cell>
                  <Cell>
                    {patient ? patient.fullName : payment.patientId}
                    <span className="block text-xs text-muted-soft">
                      {payment.note}
                    </span>
                  </Cell>
                  <Cell>{payment.paymentType}</Cell>
                  <Cell className="font-semibold text-brand-600">
                    {formatLeone(payment.amount)}
                  </Cell>
                  <Cell>{payment.method}</Cell>
                  <Cell>
                    <StatusPill status={payment.status ?? "Paid"} />
                    <span className="mt-1 block text-xs text-muted-soft">
                      {payment.date}
                    </span>
                  </Cell>
                  <Cell>
                    {receipt ? (
                      <button
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-600 hover:underline"
                        onClick={() => setViewing(receipt)}
                        type="button"
                      >
                        <ReceiptIcon size={13} />
                        RCP-{receipt.receiptId}
                      </button>
                    ) : (
                      <span className="text-xs text-muted-soft">—</span>
                    )}
                  </Cell>
                </Row>
              );
            })}
          </Table>
        )}
      </Card>

      {viewing ? (
        <ReceiptViewer onClose={() => setViewing(null)} receipt={viewing} />
      ) : null}
    </div>
  );
}
