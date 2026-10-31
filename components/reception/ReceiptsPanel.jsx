"use client";
import { useState } from "react";
import { formatLeone } from "@/lib/mock-data";
import { useReception } from "@/lib/reception-store";
import { EyeIcon } from "./icons";
import ReceiptViewer from "./ReceiptViewer";
import {
  btnIcon,
  Card,
  Cell,
  Empty,
  Input,
  Row,
  StatusPill,
  Table,
} from "./ui";

const columns = [
  "Receipt",
  "Patient",
  "Type",
  "Amount",
  "Method",
  "Issued",
  "Preview",
];

export default function ReceiptsPanel() {
  const { receipts, getPatient, getPayment, notify } = useReception();

  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);

  const visible = search.trim()
    ? receipts.filter((receipt) => {
        const term = search.trim().toLowerCase();
        const payment = getPayment(receipt.paymentId);
        const patient = payment ? getPatient(payment.patientId) : null;
        return (
          String(receipt.receiptId).includes(term) ||
          String(receipt.paymentId).includes(term) ||
          (patient ? patient.fullName.toLowerCase().includes(term) : false)
        );
      })
    : receipts;

  function viewReceipt(receipt) {
    if (!getPayment(receipt.paymentId)) {
      notify("Payment record could not be found for this receipt.");
      return;
    }
    setViewing(receipt);
  }

  return (
    <Card
      actions={
        <Input
          aria-label="Search receipts"
          className="!w-56"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search receipt or patient..."
          value={search}
        />
      }
      subtitle={`${visible.length} receipt(s) issued · open to view or print`}
      title="Issued Receipts"
    >
      {visible.length === 0 ? (
        <Empty>No receipts match the current search.</Empty>
      ) : (
        <Table colSpan={columns.length} columns={columns}>
          {visible.map((receipt) => {
            const payment = getPayment(receipt.paymentId);
            const patient = payment ? getPatient(payment.patientId) : null;
            return (
              <Row key={receipt.receiptId}>
                <Cell className="font-semibold">RCP-{receipt.receiptId}</Cell>
                <Cell>
                  {patient ? patient.fullName : payment?.patientId}
                  <span className="block text-xs text-muted-soft">
                    Payment PAY-{receipt.paymentId}
                  </span>
                </Cell>
                <Cell>{payment?.paymentType}</Cell>
                <Cell className="font-semibold text-brand-600">
                  {payment ? formatLeone(payment.amount) : "—"}
                </Cell>
                <Cell>{payment?.method}</Cell>
                <Cell>
                  <StatusPill status={payment?.status ?? "Paid"} />
                  <span className="mt-1 block text-xs text-muted-soft">
                    {receipt.issueDate}
                  </span>
                </Cell>
                <Cell>
                  <button
                    className={btnIcon}
                    onClick={() => viewReceipt(receipt)}
                    type="button"
                  >
                    <EyeIcon size={13} />
                    View
                  </button>
                </Cell>
              </Row>
            );
          })}
        </Table>
      )}

      {viewing ? (
        <ReceiptViewer
          allowPrint
          onClose={() => setViewing(null)}
          receipt={viewing}
        />
      ) : null}
    </Card>
  );
}
