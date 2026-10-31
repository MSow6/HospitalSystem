import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { CLINIC } from "@/lib/mock-data";
import { reportStyles as S } from "./reportStyles";

const styles = StyleSheet.create({
  // Consultations
  colDate: { width: "14%" },
  colPatient: { width: "26%" },
  colFinding: { width: "60%" },
  // Treatments
  colTreatPeriod: { width: "24%" },
  colTreatPatient: { width: "22%" },
  colTreatDetails: { width: "38%" },
  colTreatStatus: { width: "16%", textAlign: "right" },
  // Prescriptions
  colRxIssued: { width: "13%" },
  colRxPatient: { width: "22%" },
  colRxMedicine: { width: "37%" },
  colRxDosage: { width: "22%" },
  colRxQty: { width: "6%", textAlign: "right" },
  // Laboratory
  colLabRequest: { width: "11%" },
  colLabPatient: { width: "24%" },
  colLabTests: { width: "50%" },
  colLabStatus: { width: "15%", textAlign: "right" },
  strong: { fontFamily: "Helvetica-Bold" },
});

function TableSection({ columns, empty, hidden, renderRow, rows }) {
  return (
    <>
      <Text style={S.sectionTitle}>{columns.title}</Text>
      <View style={S.table}>
        <View style={S.tableHead}>
          {columns.heads.map((head) => (
            <Text key={head.label} style={[S.headText, head.style]}>
              {head.label}
            </Text>
          ))}
        </View>
        {rows.length === 0 ? (
          <Text style={S.tableEmpty}>{empty}</Text>
        ) : (
          rows.map((row, index) => (
            <View
              key={`${columns.title}-${index}`}
              style={[
                S.tableRow,
                index === rows.length - 1 && hidden === 0 ? S.tableRowLast : {},
              ]}
            >
              {renderRow(row)}
            </View>
          ))
        )}
        {hidden > 0 ? (
          <View style={[S.tableRow, S.tableRowLast]}>
            {columns.heads.map((head, index) => (
              <Text
                key={head.label}
                style={[head.style, index === 1 ? styles.strong : {}]}
              >
                {index === 1 ? `+ ${hidden} more` : "—"}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </>
  );
}

// Printable activity report for the signed-in doctor over a chosen period. The
// model is built by buildActivityReport so the sheet mirrors the live records.
export default function DoctorActivityReportDocument({
  periodText,
  generatedAt,
  doctor,
  totals,
  consultations,
  consultationsHidden,
  treatmentRows,
  treatmentsHidden,
  prescriptionRows,
  prescriptionsHidden,
  labRows,
  labsHidden,
}) {
  const consultationColumns = {
    title: "CONSULTATIONS RECORDED",
    heads: [
      { label: "DATE", style: styles.colDate },
      { label: "PATIENT", style: styles.colPatient },
      { label: "DIAGNOSIS", style: styles.colFinding },
    ],
  };
  const treatmentColumns = {
    title: "TREATMENTS STARTED",
    heads: [
      { label: "PERIOD", style: styles.colTreatPeriod },
      { label: "PATIENT", style: styles.colTreatPatient },
      { label: "TREATMENT", style: styles.colTreatDetails },
      { label: "STATUS", style: styles.colTreatStatus },
    ],
  };
  const prescriptionColumns = {
    title: "PRESCRIPTIONS ISSUED",
    heads: [
      { label: "ISSUED", style: styles.colRxIssued },
      { label: "PATIENT", style: styles.colRxPatient },
      { label: "MEDICINE", style: styles.colRxMedicine },
      { label: "DOSAGE", style: styles.colRxDosage },
      { label: "QTY", style: styles.colRxQty },
    ],
  };
  const labColumns = {
    title: "LABORATORY REQUESTS RAISED",
    heads: [
      { label: "REQ", style: styles.colLabRequest },
      { label: "PATIENT", style: styles.colLabPatient },
      { label: "TESTS", style: styles.colLabTests },
      { label: "STATUS", style: styles.colLabStatus },
    ],
  };

  return (
    <Document
      author={CLINIC.name}
      creator={CLINIC.name}
      subject={`Medical activity report ${periodText}`}
      title={`Medical Activity Report ${periodText}`}
    >
      <Page size="A4" style={S.page} wrap={false}>
        <View style={S.header}>
          <View style={{ width: "58%" }}>
            <Text style={S.clinicName}>{CLINIC.name}</Text>
            <Text style={S.clinicMeta}>{CLINIC.address}</Text>
            <Text style={S.clinicMeta}>
              {CLINIC.phone} · {CLINIC.email}
            </Text>
          </View>
          <View style={{ width: "42%" }}>
            <Text style={S.reportLabel}>MEDICAL ACTIVITY REPORT</Text>
            <Text style={S.reportDate}>Period: {periodText}</Text>
          </View>
        </View>

        <View style={S.metaRow}>
          <View style={{ width: "30%" }}>
            <Text style={S.metaLabel}>PHYSICIAN</Text>
            <Text style={S.metaValue}>{doctor.name}</Text>
          </View>
          <View style={{ width: "20%" }}>
            <Text style={S.metaLabel}>ROLE</Text>
            <Text style={S.metaValue}>{doctor.role}</Text>
          </View>
          <View style={{ width: "25%" }}>
            <Text style={S.metaLabel}>SPECIALTY</Text>
            <Text style={S.metaValue}>{doctor.specialty}</Text>
          </View>
          <View style={{ width: "25%" }}>
            <Text style={S.metaLabel}>GENERATED AT</Text>
            <Text style={S.metaValue}>{generatedAt}</Text>
          </View>
        </View>

        <View style={S.kpiStrip}>
          <View style={S.kpi}>
            <Text style={S.kpiValue}>{totals.patientsSeen}</Text>
            <Text style={S.kpiLabel}>PATIENTS SEEN</Text>
          </View>
          <View style={S.kpi}>
            <Text style={S.kpiValue}>{totals.consultations}</Text>
            <Text style={S.kpiLabel}>CONSULTATIONS</Text>
          </View>
          <View style={S.kpi}>
            <Text style={S.kpiValue}>{totals.treatments}</Text>
            <Text style={S.kpiLabel}>TREATMENTS</Text>
          </View>
          <View style={S.kpi}>
            <Text style={S.kpiValue}>{totals.prescriptions}</Text>
            <Text style={S.kpiLabel}>PRESCRIPTIONS</Text>
          </View>
          <View style={S.kpi}>
            <Text style={S.kpiValue}>{totals.labsOrdered}</Text>
            <Text style={S.kpiLabel}>LABS ORDERED</Text>
          </View>
          <View style={[S.kpi, S.kpiLast]}>
            <Text style={S.kpiValue}>{totals.labsCompleted}</Text>
            <Text style={S.kpiLabel}>LABS COMPLETED</Text>
          </View>
        </View>

        <TableSection
          columns={consultationColumns}
          empty="No consultations were finalised in this period."
          hidden={consultationsHidden}
          renderRow={(row) => (
            <>
              <Text style={styles.colDate}>{row.date}</Text>
              <Text style={[styles.colPatient, styles.strong]}>
                {row.patient}
              </Text>
              <Text style={styles.colFinding}>{row.finding}</Text>
            </>
          )}
          rows={consultations}
        />

        <View style={{ height: 9 }} />

        <TableSection
          columns={treatmentColumns}
          empty="No treatments were started in this period."
          hidden={treatmentsHidden}
          renderRow={(row) => (
            <>
              <Text style={styles.colTreatPeriod}>{row.period}</Text>
              <Text style={[styles.colTreatPatient, styles.strong]}>
                {row.patient}
              </Text>
              <Text style={styles.colTreatDetails}>{row.details}</Text>
              <Text style={styles.colTreatStatus}>{row.status}</Text>
            </>
          )}
          rows={treatmentRows}
        />

        <View style={{ height: 9 }} />

        <TableSection
          columns={prescriptionColumns}
          empty="No prescriptions were issued in this period."
          hidden={prescriptionsHidden}
          renderRow={(row) => (
            <>
              <Text style={styles.colRxIssued}>{row.issuedDate}</Text>
              <Text style={[styles.colRxPatient, styles.strong]}>
                {row.patient}
              </Text>
              <Text style={styles.colRxMedicine}>{row.medicine}</Text>
              <Text style={styles.colRxDosage}>{row.dosage}</Text>
              <Text style={styles.colRxQty}>{row.quantity}</Text>
            </>
          )}
          rows={prescriptionRows}
        />

        <View style={{ height: 9 }} />

        <TableSection
          columns={labColumns}
          empty="No laboratory requests were raised in this period."
          hidden={labsHidden}
          renderRow={(row) => (
            <>
              <Text style={styles.colLabRequest}>#{row.requestId}</Text>
              <Text style={[styles.colLabPatient, styles.strong]}>
                {row.patient}
              </Text>
              <Text style={styles.colLabTests}>{row.tests}</Text>
              <Text style={styles.colLabStatus}>{row.status}</Text>
            </>
          )}
          rows={labRows}
        />

        <View style={S.signatureRow}>
          <View style={S.signatureBlock}>
            <Text style={S.signatureLabel}>Physician — {doctor.name}</Text>
          </View>
          <View style={S.signatureBlock}>
            <Text style={S.signatureLabel}>
              Verified by (Supervisor / Admin)
            </Text>
          </View>
        </View>

        <View style={S.footer}>
          <Text style={S.footerText}>
            This medical activity report is generated by the {CLINIC.name}{" "}
            system and covers the clinical work recorded by {doctor.name} across{" "}
            {periodText}. Figures are subject to verification against the
            individual patient records.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
