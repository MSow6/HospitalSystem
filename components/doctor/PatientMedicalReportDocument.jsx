import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { CLINIC } from "@/lib/mock-data";
import { prettyDate } from "./reportFormat";
import { reportStyles as S } from "./reportStyles";

const styles = StyleSheet.create({
  // Patient identity strip
  colPatient: { width: "26%" },
  colId: { width: "11%" },
  colDob: { width: "15%" },
  colGender: { width: "12%" },
  colBlood: { width: "12%" },
  colPhone: { width: "24%" },
  // Diagnoses
  colDiagDate: { width: "22%" },
  colDiagDetails: { width: "78%" },
  // Treatments
  colTreatPeriod: { width: "32%" },
  colTreatDetails: { width: "50%" },
  colTreatStatus: { width: "18%", textAlign: "right" },
  // Prescriptions
  colRxMedicine: { width: "33%" },
  colRxDosage: { width: "26%" },
  colRxQty: { width: "10%", textAlign: "right" },
  colRxStatus: { width: "16%" },
  colRxDate: { width: "15%", textAlign: "right" },
  // Laboratory
  colLabTest: { width: "24%" },
  colLabResult: { width: "54%" },
  colLabDate: { width: "22%", textAlign: "right" },
  strong: { fontFamily: "Helvetica-Bold" },
});

// Printable medical report for a single patient. The model is built by
// buildPatientReport so the sheet mirrors the live clinical records exactly.
export default function PatientMedicalReportDocument({
  generatedAt,
  patient,
  totals,
  diagnoses,
  diagnosesHidden,
  treatments,
  treatmentsHidden,
  prescriptions,
  prescriptionsHidden,
  labTests,
  labTestsHidden,
}) {
  return (
    <Document
      author={CLINIC.name}
      creator={CLINIC.name}
      subject={`Patient medical report ${patient.fullName}`}
      title={`Medical Report — ${patient.fullName}`}
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
            <Text style={S.reportLabel}>PATIENT MEDICAL REPORT</Text>
            <Text style={S.reportDate}>Generated {generatedAt}</Text>
          </View>
        </View>

        <View style={S.metaRow}>
          <View style={styles.colPatient}>
            <Text style={S.metaLabel}>PATIENT</Text>
            <Text style={S.metaValue}>{patient.fullName}</Text>
          </View>
          <View style={styles.colId}>
            <Text style={S.metaLabel}>ID</Text>
            <Text style={S.metaValue}>{patient.patientId}</Text>
          </View>
          <View style={styles.colDob}>
            <Text style={S.metaLabel}>DATE OF BIRTH</Text>
            <Text style={S.metaValue}>{prettyDate(patient.dateOfBirth)}</Text>
          </View>
          <View style={styles.colGender}>
            <Text style={S.metaLabel}>GENDER</Text>
            <Text style={S.metaValue}>{patient.gender}</Text>
          </View>
          <View style={styles.colBlood}>
            <Text style={S.metaLabel}>BLOOD GROUP</Text>
            <Text style={S.metaValue}>{patient.bloodGroup}</Text>
          </View>
          <View style={styles.colPhone}>
            <Text style={S.metaLabel}>ATTENDING DOCTOR</Text>
            <Text style={S.metaValue}>{patient.doctor}</Text>
          </View>
        </View>

        <View style={S.kpiStrip}>
          <View style={S.kpi}>
            <Text style={S.kpiValue}>{totals.consultations}</Text>
            <Text style={S.kpiLabel}>CONSULTATIONS</Text>
          </View>
          <View style={S.kpi}>
            <Text style={S.kpiValue}>{totals.activeTreatments}</Text>
            <Text style={S.kpiLabel}>TREATMENTS RUNNING</Text>
          </View>
          <View style={S.kpi}>
            <Text style={S.kpiValue}>{totals.prescriptions}</Text>
            <Text style={S.kpiLabel}>PRESCRIPTIONS</Text>
          </View>
          <View style={[S.kpi, S.kpiLast]}>
            <Text style={S.kpiValue}>{totals.labTests}</Text>
            <Text style={S.kpiLabel}>LABORATORY TESTS</Text>
          </View>
        </View>

        <View style={S.splitRow}>
          <View style={S.splitCol}>
            <Text style={S.sectionTitle}>DIAGNOSES RECORDED</Text>
            <View style={S.table}>
              <View style={S.tableHead}>
                <Text style={[S.headText, styles.colDiagDate]}>DATE</Text>
                <Text style={[S.headText, styles.colDiagDetails]}>FINDING</Text>
              </View>
              {diagnoses.length === 0 ? (
                <Text style={S.tableEmpty}>No diagnoses on record.</Text>
              ) : (
                diagnoses.map((row, index) => (
                  <View
                    key={row.diagnosisId}
                    style={[
                      S.tableRow,
                      index === diagnoses.length - 1 && diagnosesHidden === 0
                        ? S.tableRowLast
                        : {},
                    ]}
                  >
                    <Text style={styles.colDiagDate}>{row.date}</Text>
                    <Text style={styles.colDiagDetails}>{row.details}</Text>
                  </View>
                ))
              )}
              {diagnosesHidden > 0 ? (
                <View style={[S.tableRow, S.tableRowLast]}>
                  <Text style={styles.colDiagDate}>—</Text>
                  <Text style={styles.colDiagDetails}>
                    + {diagnosesHidden} earlier record(s)
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={S.splitCol}>
            <Text style={S.sectionTitle}>TREATMENTS</Text>
            <View style={S.table}>
              <View style={S.tableHead}>
                <Text style={[S.headText, styles.colTreatPeriod]}>PERIOD</Text>
                <Text style={[S.headText, styles.colTreatStatus]}>STATUS</Text>
              </View>
              {treatments.length === 0 ? (
                <Text style={S.tableEmpty}>No treatments on record.</Text>
              ) : (
                treatments.map((row, index) => (
                  <View
                    key={row.treatmentId}
                    style={[
                      S.tableRow,
                      index === treatments.length - 1 && treatmentsHidden === 0
                        ? S.tableRowLast
                        : {},
                    ]}
                  >
                    <Text style={styles.colTreatPeriod}>{row.period}</Text>
                    <Text style={styles.colTreatStatus}>{row.status}</Text>
                  </View>
                ))
              )}
              {treatmentsHidden > 0 ? (
                <View style={[S.tableRow, S.tableRowLast]}>
                  <Text style={styles.colTreatPeriod}>—</Text>
                  <Text style={styles.colTreatStatus}>
                    + {treatmentsHidden} more
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <Text style={S.sectionTitle}>PRESCRIPTIONS ISSUED</Text>
        <View style={S.table}>
          <View style={S.tableHead}>
            <Text style={[S.headText, styles.colRxMedicine]}>MEDICINE</Text>
            <Text style={[S.headText, styles.colRxDosage]}>DOSAGE</Text>
            <Text style={[S.headText, styles.colRxQty]}>QTY</Text>
            <Text style={[S.headText, styles.colRxStatus]}>STATUS</Text>
            <Text style={[S.headText, styles.colRxDate]}>ISSUED</Text>
          </View>
          {prescriptions.length === 0 ? (
            <Text style={S.tableEmpty}>No prescriptions on record.</Text>
          ) : (
            prescriptions.map((row, index) => (
              <View
                key={row.prescriptionId}
                style={[
                  S.tableRow,
                  index === prescriptions.length - 1 &&
                  prescriptionsHidden === 0
                    ? S.tableRowLast
                    : {},
                ]}
              >
                <Text style={[styles.colRxMedicine, styles.strong]}>
                  {row.medicine}
                </Text>
                <Text style={styles.colRxDosage}>{row.dosage}</Text>
                <Text style={styles.colRxQty}>{row.quantity}</Text>
                <Text style={styles.colRxStatus}>{row.status}</Text>
                <Text style={styles.colRxDate}>{row.issuedDate}</Text>
              </View>
            ))
          )}
          {prescriptionsHidden > 0 ? (
            <View style={[S.tableRow, S.tableRowLast]}>
              <Text style={[styles.colRxMedicine, styles.strong]}>—</Text>
              <Text style={styles.colRxDosage}>
                + {prescriptionsHidden} more prescription(s)
              </Text>
              <Text style={styles.colRxQty}>—</Text>
              <Text style={styles.colRxStatus}>—</Text>
              <Text style={styles.colRxDate}>—</Text>
            </View>
          ) : null}
        </View>

        <Text style={[S.sectionTitle, { marginTop: 9 }]}>
          LABORATORY RESULTS
        </Text>
        <View style={S.table}>
          <View style={S.tableHead}>
            <Text style={[S.headText, styles.colLabTest]}>TEST</Text>
            <Text style={[S.headText, styles.colLabResult]}>RESULT</Text>
            <Text style={[S.headText, styles.colLabDate]}>REPORTED</Text>
          </View>
          {labTests.length === 0 ? (
            <Text style={S.tableEmpty}>No laboratory tests on record.</Text>
          ) : (
            labTests.map((row, index) => (
              <View
                key={row.key}
                style={[
                  S.tableRow,
                  index === labTests.length - 1 && labTestsHidden === 0
                    ? S.tableRowLast
                    : {},
                ]}
              >
                <Text style={[styles.colLabTest, styles.strong]}>
                  {row.testName}
                </Text>
                <Text style={styles.colLabResult}>{row.result}</Text>
                <Text style={styles.colLabDate}>{row.resultDate}</Text>
              </View>
            ))
          )}
          {labTestsHidden > 0 ? (
            <View style={[S.tableRow, S.tableRowLast]}>
              <Text style={[styles.colLabTest, styles.strong]}>—</Text>
              <Text style={styles.colLabResult}>
                + {labTestsHidden} more test(s)
              </Text>
              <Text style={styles.colLabDate}>—</Text>
            </View>
          ) : null}
        </View>

        <View style={S.signatureRow}>
          <View style={S.signatureBlock}>
            <Text style={S.signatureLabel}>
              Attending doctor — {patient.doctor}
            </Text>
          </View>
          <View style={S.signatureBlock}>
            <Text style={S.signatureLabel}>
              Clinic stamp / supervising officer
            </Text>
          </View>
        </View>

        <View style={S.footer}>
          <Text style={S.footerText}>
            This medical report is generated by the {CLINIC.name} system from
            the patient&apos;s recorded consultations, treatments, prescriptions
            and laboratory results. It is issued for clinical reference only and
            should be read alongside the attending doctor&apos;s notes.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
