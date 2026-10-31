import { StyleSheet } from "@react-pdf/renderer";

// Sheet furniture shared by the doctor's printable reports, so the per-patient
// report and the activity report read as one family of documents.
export const reportStyles = StyleSheet.create({
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
