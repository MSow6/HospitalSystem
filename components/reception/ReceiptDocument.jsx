import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { CLINIC, formatLeone } from "@/lib/mock-data";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#193841",
    paddingHorizontal: 26,
    paddingVertical: 10,
  },
  // One A4 portrait sheet carries two identical copies stacked vertically: the
  // patient tears off the top one, the clinic files the bottom one.
  sheet: {
    flexDirection: "column",
    flexGrow: 1,
  },
  copy: {
    flexGrow: 1,
  },
  cutLine: {
    marginVertical: 4,
    borderTopWidth: 1,
    borderTopStyle: "dashed",
    borderTopColor: "#c9d6d5",
  },
  copyTag: {
    alignSelf: "flex-end",
    marginBottom: 2,
    borderWidth: 1,
    borderColor: "#117c79",
    borderRadius: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    color: "#117c79",
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 0.9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#117c79",
    paddingBottom: 6,
    marginBottom: 6,
  },
  clinicName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#117c79",
  },
  clinicMeta: {
    fontSize: 8,
    color: "#5d7278",
    marginTop: 2,
    lineHeight: 1.3,
  },
  receiptLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    letterSpacing: 1,
  },
  receiptNo: {
    fontSize: 8,
    color: "#5d7278",
    textAlign: "right",
    marginTop: 3,
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  metaBlock: {
    width: "48%",
  },
  metaTitle: {
    fontSize: 7.5,
    letterSpacing: 1,
    color: "#8a9ba0",
    marginBottom: 2,
  },
  metaLine: {
    fontSize: 9,
    marginBottom: 1.5,
  },
  metaStrong: {
    fontFamily: "Helvetica-Bold",
  },
  table: {
    borderWidth: 1,
    borderColor: "#e2eae9",
    borderRadius: 3,
    marginBottom: 5,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#f2f7f7",
    borderBottomWidth: 1,
    borderBottomColor: "#e2eae9",
    paddingVertical: 3,
    paddingHorizontal: 7,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#eef3f2",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  colDescription: { width: "55%" },
  colType: { width: "20%" },
  colAmount: { width: "25%", textAlign: "right" },
  headText: {
    fontSize: 7.5,
    letterSpacing: 0.6,
    color: "#5d7278",
    fontFamily: "Helvetica-Bold",
  },
  totals: {
    alignItems: "flex-end",
    marginBottom: 4,
  },
  totalRow: {
    flexDirection: "row",
    width: "48%",
    justifyContent: "space-between",
    paddingVertical: 1,
  },
  grandTotalRow: {
    flexDirection: "row",
    width: "48%",
    justifyContent: "space-between",
    borderTopWidth: 1.4,
    borderTopColor: "#117c79",
    marginTop: 2,
    paddingTop: 3,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#117c79",
  },
  grandTotalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#117c79",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  signatureBlock: {
    width: "45%",
    borderTopWidth: 1,
    borderTopColor: "#c9d6d5",
    paddingTop: 3,
  },
  signatureLabel: {
    fontSize: 7.5,
    color: "#7b8e93",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e2eae9",
    paddingTop: 5,
    marginTop: 2,
  },
  footerText: {
    fontSize: 7.5,
    color: "#7b8e93",
    lineHeight: 1.3,
  },
  watermarkNote: {
    fontSize: 7,
    color: "#a8b6ba",
    marginTop: 3,
    textAlign: "center",
  },
});

// Hard limits that keep the receipt on a single page no matter what is
// entered: every text block is clamped to one line and the item list is
// capped, with any overflow rolled into a summary row.
const MAX_ITEM_ROWS = 7;
const CLAMP_DESCRIPTION = 58;
const CLAMP_NAME = 34;
const CLAMP_CONTACT = 26;

function clamp(value, max) {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max - 3).trimEnd()}...` : text;
}

export default function ReceiptDocument({
  receipt,
  payment,
  patient,
  cashier,
  breakdown,
}) {
  const lines =
    breakdown && breakdown.length > 0
      ? breakdown
      : [
          {
            description: payment.note || `${payment.paymentType} service`,
            type: payment.paymentType,
            amount: payment.amount,
          },
        ];

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const total = payment.amount;

  const shownLines = lines.slice(0, MAX_ITEM_ROWS);
  const hiddenLines = lines.slice(MAX_ITEM_ROWS);
  const showSummary = hiddenLines.length > 0;
  const summaryTotal = hiddenLines.reduce((sum, line) => sum + line.amount, 0);

  // Rendered twice so the patient and the clinic each get a copy from the
  // same A4 sheet.
  function renderCopy(copyLabel) {
    return (
      <View style={styles.copy}>
        <Text style={styles.copyTag}>{copyLabel}</Text>

        <View style={styles.header}>
          <View style={{ width: "60%" }}>
            <Text style={styles.clinicName}>{CLINIC.name}</Text>
            <Text style={styles.clinicMeta}>{CLINIC.address}</Text>
            <Text style={styles.clinicMeta}>
              {CLINIC.phone} · {CLINIC.email}
            </Text>
          </View>
          <View style={{ width: "40%" }}>
            <Text style={styles.receiptLabel}>PAYMENT RECEIPT</Text>
            <Text style={styles.receiptNo}>
              Receipt No: {receipt.receiptId}
            </Text>
            <Text style={styles.receiptNo}>
              Payment ID: {payment.paymentId}
            </Text>
          </View>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaTitle}>BILLED TO</Text>
            <Text style={[styles.metaLine, styles.metaStrong]}>
              {clamp(
                patient ? patient.fullName : `Patient ${payment.patientId}`,
                CLAMP_NAME,
              )}
            </Text>
            <Text style={styles.metaLine}>Patient ID: {payment.patientId}</Text>
            <Text style={styles.metaLine}>
              Phone: {clamp(patient ? patient.phoneNumber : "—", CLAMP_CONTACT)}
            </Text>
            <Text style={styles.metaLine}>
              Address:{" "}
              {clamp(patient ? patient.address : "—", CLAMP_DESCRIPTION)}
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaTitle}>PAYMENT DETAILS</Text>
            <Text style={styles.metaLine}>Issued: {receipt.issueDate}</Text>
            <Text style={styles.metaLine}>Method: {payment.method}</Text>
            <Text style={styles.metaLine}>Status: {payment.status}</Text>
            <Text style={styles.metaLine}>
              Cashier:{" "}
              {clamp(cashier ? cashier.fullName : "Receptionist", CLAMP_NAME)}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.headText, styles.colDescription]}>
              DESCRIPTION
            </Text>
            <Text style={[styles.headText, styles.colType]}>TYPE</Text>
            <Text style={[styles.headText, styles.colAmount]}>AMOUNT</Text>
          </View>
          {shownLines.map((line, index) => (
            <View
              key={`${line.description}-${index}`}
              style={[
                styles.tableRow,
                index === shownLines.length - 1 && !showSummary
                  ? styles.tableRowLast
                  : {},
              ]}
            >
              <Text style={styles.colDescription}>
                {clamp(line.description, CLAMP_DESCRIPTION)}
              </Text>
              <Text style={styles.colType}>
                {clamp(line.type, CLAMP_CONTACT)}
              </Text>
              <Text style={styles.colAmount}>{formatLeone(line.amount)}</Text>
            </View>
          ))}
          {showSummary ? (
            <View style={[styles.tableRow, styles.tableRowLast]}>
              <Text style={styles.colDescription}>
                + {hiddenLines.length} more item(s)
              </Text>
              <Text style={styles.colType}>Other</Text>
              <Text style={styles.colAmount}>{formatLeone(summaryTotal)}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatLeone(subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Amount Paid</Text>
            <Text>{formatLeone(total)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>BALANCE</Text>
            <Text style={styles.grandTotalValue}>
              {formatLeone(Math.max(total - subtotal, 0))}
            </Text>
          </View>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Received by (Cashier)</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>
              Patient / Guardian signature
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for choosing {CLINIC.name}. This receipt is proof of
            payment and should be kept for your records. Please present it for
            any service queries or refunds.
          </Text>
          <Text style={styles.watermarkNote}>
            System generated document · No signature required where signed
            electronically
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Document
      author={CLINIC.name}
      creator={CLINIC.name}
      subject={`Receipt ${receipt.receiptId}`}
      title={`Receipt ${receipt.receiptId}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.sheet}>
          {renderCopy("PATIENT COPY")}
          <View style={styles.cutLine} />
          {renderCopy("CLINIC COPY")}
        </View>
      </Page>
    </Document>
  );
}
