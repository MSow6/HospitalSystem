import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { CLINIC, formatLeone } from "@/lib/mock-data";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#193841",
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#117c79",
    paddingBottom: 7,
    marginBottom: 8,
  },
  clinicName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#117c79",
  },
  clinicMeta: {
    fontSize: 8,
    color: "#5d7278",
    marginTop: 2,
    lineHeight: 1.3,
  },
  reportLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    letterSpacing: 1,
  },
  reportDate: {
    fontSize: 9,
    color: "#5d7278",
    textAlign: "right",
    marginTop: 3,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e2eae9",
    borderRadius: 3,
    backgroundColor: "#f7fafa",
    paddingVertical: 5,
    paddingHorizontal: 9,
    marginBottom: 9,
  },
  metaCell: {
    width: "25%",
  },
  metaLabel: {
    fontSize: 7,
    letterSpacing: 0.8,
    color: "#8a9ba0",
    marginBottom: 1.5,
  },
  metaValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
  },
  kpiStrip: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e2eae9",
    borderRadius: 3,
    marginBottom: 9,
    overflow: "hidden",
  },
  kpi: {
    flexGrow: 1,
    flexBasis: 0,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: "#eef3f2",
    alignItems: "center",
  },
  kpiLast: {
    borderRightWidth: 0,
  },
  kpiValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#117c79",
  },
  kpiLabel: {
    fontSize: 7,
    letterSpacing: 0.5,
    color: "#7b8e93",
    marginTop: 2,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    color: "#5d7278",
    marginBottom: 4,
  },
  splitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  splitCol: {
    width: "48.5%",
  },
  table: {
    borderWidth: 1,
    borderColor: "#e2eae9",
    borderRadius: 3,
  },
  tableHead: {
    flexDirection: "row",
    backgroundColor: "#f2f7f7",
    borderBottomWidth: 1,
    borderBottomColor: "#e2eae9",
    paddingVertical: 3.5,
    paddingHorizontal: 7,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#eef3f2",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableEmpty: {
    paddingVertical: 8,
    textAlign: "center",
    color: "#a8b6ba",
    fontSize: 8,
  },
  headText: {
    fontSize: 7,
    letterSpacing: 0.5,
    color: "#5d7278",
    fontFamily: "Helvetica-Bold",
  },
  // Collections tables
  colMethod: { width: "45%" },
  colCount: { width: "20%", textAlign: "right" },
  colAmount: { width: "35%", textAlign: "right" },
  // Transactions table
  colReceipt: { width: "14%" },
  colPatient: { width: "34%" },
  colType: { width: "20%" },
  colTxnMethod: { width: "16%" },
  colTxnAmount: { width: "16%", textAlign: "right" },
  txnName: { fontFamily: "Helvetica-Bold" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#117c79",
    borderRadius: 3,
    backgroundColor: "#f2f7f7",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 9,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#117c79",
    letterSpacing: 1,
  },
  grandTotalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#117c79",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
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
    marginTop: 14,
  },
  footerText: {
    fontSize: 7.5,
    color: "#7b8e93",
    lineHeight: 1.3,
  },
});

// The transaction list is capped so the whole report stays on one page no
// matter how busy the day was; any overflow is rolled into a summary line.
const MAX_TXN_ROWS = 16;
const CLAMP_PATIENT = 30;

function clamp(value, max) {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max - 3).trimEnd()}...` : text;
}

function BreakdownTable({ title, rows }) {
  return (
    <View style={styles.splitCol}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.table}>
        <View style={styles.tableHead}>
          <Text style={[styles.headText, styles.colMethod]}>
            {title.includes("METHOD") ? "METHOD" : "TYPE"}
          </Text>
          <Text style={[styles.headText, styles.colCount]}>QTY</Text>
          <Text style={[styles.headText, styles.colAmount]}>AMOUNT</Text>
        </View>
        {rows.length === 0 ? (
          <Text style={styles.tableEmpty}>No collections recorded.</Text>
        ) : (
          rows.map((row, index) => (
            <View
              key={row.name}
              style={[
                styles.tableRow,
                index === rows.length - 1 ? styles.tableRowLast : {},
              ]}
            >
              <Text style={styles.colMethod}>{row.name}</Text>
              <Text style={styles.colCount}>{row.count}</Text>
              <Text style={styles.colAmount}>{formatLeone(row.amount)}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

export default function DailySummaryDocument({
  from,
  to,
  periodText,
  generatedAt,
  cashier,
  newPatients,
  appointments,
  includeQueue,
  waiting,
  seen,
  receiptsCount,
  collected,
  byMethod,
  byType,
  transactions,
}) {
  const shown = transactions.slice(0, MAX_TXN_ROWS);
  const hidden = transactions.slice(MAX_TXN_ROWS);
  const hiddenTotal = hidden.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Document
      author={CLINIC.name}
      creator={CLINIC.name}
      subject={`Operations summary ${periodText}`}
      title={`Operations Summary ${periodText}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={{ width: "58%" }}>
            <Text style={styles.clinicName}>{CLINIC.name}</Text>
            <Text style={styles.clinicMeta}>{CLINIC.address}</Text>
            <Text style={styles.clinicMeta}>
              {CLINIC.phone} · {CLINIC.email}
            </Text>
          </View>
          <View style={{ width: "42%" }}>
            <Text style={styles.reportLabel}>OPERATIONS SUMMARY</Text>
            <Text style={styles.reportDate}>
              {from === to ? "Report date: " : "Reporting period: "}
              {periodText}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>PREPARED BY</Text>
            <Text style={styles.metaValue}>
              {cashier ? cashier.fullName : "Receptionist"}
            </Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>ROLE</Text>
            <Text style={styles.metaValue}>{cashier ? cashier.role : "—"}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>GENERATED AT</Text>
            <Text style={styles.metaValue}>{generatedAt}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>RECEIPTS ISSUED</Text>
            <Text style={styles.metaValue}>{receiptsCount}</Text>
          </View>
        </View>

        <View style={styles.kpiStrip}>
          <View style={styles.kpi}>
            <Text style={styles.kpiValue}>{newPatients}</Text>
            <Text style={styles.kpiLabel}>NEW PATIENTS</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiValue}>{appointments.total}</Text>
            <Text style={styles.kpiLabel}>APPOINTMENTS</Text>
          </View>
          <View style={styles.kpi}>
            <Text style={styles.kpiValue}>{appointments.completed}</Text>
            <Text style={styles.kpiLabel}>COMPLETED</Text>
          </View>
          {includeQueue ? (
            <View style={styles.kpi}>
              <Text style={styles.kpiValue}>{seen}</Text>
              <Text style={styles.kpiLabel}>SEEN IN ROOM</Text>
            </View>
          ) : null}
          {includeQueue ? (
            <View style={styles.kpi}>
              <Text style={styles.kpiValue}>{waiting}</Text>
              <Text style={styles.kpiLabel}>STILL WAITING</Text>
            </View>
          ) : null}
          <View style={[styles.kpi, styles.kpiLast]}>
            <Text style={styles.kpiValue}>{receiptsCount}</Text>
            <Text style={styles.kpiLabel}>RECEIPTS</Text>
          </View>
        </View>

        <View style={styles.splitRow}>
          <BreakdownTable rows={byMethod} title="COLLECTIONS BY METHOD" />
          <BreakdownTable rows={byType} title="COLLECTIONS BY SERVICE TYPE" />
        </View>

        <Text style={styles.sectionTitle}>TRANSACTIONS IN PERIOD</Text>
        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={[styles.headText, styles.colReceipt]}>RECEIPT</Text>
            <Text style={[styles.headText, styles.colPatient]}>PATIENT</Text>
            <Text style={[styles.headText, styles.colType]}>TYPE</Text>
            <Text style={[styles.headText, styles.colTxnMethod]}>METHOD</Text>
            <Text style={[styles.headText, styles.colTxnAmount]}>AMOUNT</Text>
          </View>
          {shown.length === 0 ? (
            <Text style={styles.tableEmpty}>
              No transactions were recorded in this period.
            </Text>
          ) : (
            shown.map((item, index) => (
              <View
                key={item.paymentId}
                style={[
                  styles.tableRow,
                  index === shown.length - 1 && hidden.length === 0
                    ? styles.tableRowLast
                    : {},
                ]}
              >
                <Text style={styles.colReceipt}>
                  {item.receiptId ? `RCP-${item.receiptId}` : "—"}
                </Text>
                <Text style={[styles.colPatient, styles.txnName]}>
                  {clamp(item.patient, CLAMP_PATIENT)}
                </Text>
                <Text style={styles.colType}>{item.type}</Text>
                <Text style={styles.colTxnMethod}>{item.method}</Text>
                <Text style={styles.colTxnAmount}>
                  {formatLeone(item.amount)}
                </Text>
              </View>
            ))
          )}
          {hidden.length > 0 ? (
            <View style={[styles.tableRow, styles.tableRowLast]}>
              <Text style={styles.colReceipt}>—</Text>
              <Text style={[styles.colPatient, styles.txnName]}>
                + {hidden.length} more transaction(s)
              </Text>
              <Text style={styles.colType}>Other</Text>
              <Text style={styles.colTxnMethod}>—</Text>
              <Text style={styles.colTxnAmount}>
                {formatLeone(hiddenTotal)}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>TOTAL COLLECTED</Text>
          <Text style={styles.grandTotalValue}>{formatLeone(collected)}</Text>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>
              Prepared by (Cashier) —{" "}
              {cashier ? cashier.fullName : "Receptionist"}
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>
              Verified by (Supervisor / Admin)
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This operations summary is generated by the {CLINIC.name} system and
            reflects all activity recorded in the reporting period ({periodText}
            ). Figures are subject to verification against the individual
            patient receipts before the shift is closed.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
