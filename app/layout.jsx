import "./globals.css";
import "../components/styles.css";
import { ReceptionProvider } from "@/lib/reception-store";

export const metadata = {
  title: "Hospital Management System",
  description: "Staff portal for the Physical Health Clinic",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* One clinic store for every role panel, mounted above the routes so
            state survives navigation between the reception and doctor desks. */}
        <ReceptionProvider>{children}</ReceptionProvider>
      </body>
    </html>
  );
}
