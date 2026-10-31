"use client";
// Minimal monochrome line-icon set. Icons inherit `currentColor` so they take on
// the colour of whatever they sit inside.
function Icon({ children, size = 18, className = "", ...props }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {children}
    </svg>
  );
}
export function HomeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.8V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.8" />
      <path d="M10 20v-5h4v5" />
    </Icon>
  );
}
export function UsersIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="9.5" cy="8.5" r="3" />
      <path d="M3.8 19c.4-3.1 2.8-5 5.7-5s5.3 1.9 5.7 5" />
      <path d="M16.5 6.3a2.8 2.8 0 0 1 0 5.4" />
      <path d="M18.2 14.4c1.3.7 2.2 2 2.4 3.6" />
    </Icon>
  );
}
export function UserIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.4 19c.4-3.1 2.9-5.1 6.6-5.1s6.2 2 6.6 5.1" />
    </Icon>
  );
}
export function UserPlusIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="9.5" cy="8.5" r="3" />
      <path d="M3.8 19c.4-3.1 2.8-5 5.7-5 1 0 1.9.2 2.7.6" />
      <path d="M16.5 12v6M13.5 15h6" />
    </Icon>
  );
}
export function CalendarIcon(props) {
  return (
    <Icon {...props}>
      <rect height="14.5" rx="2" width="16.5" x="3.75" y="5.5" />
      <path d="M3.75 10h16.5M8 3.5V7M16 3.5V7" />
    </Icon>
  );
}
export function CalendarPlusIcon(props) {
  return (
    <Icon {...props}>
      <rect height="14.5" rx="2" width="16.5" x="3.75" y="5.5" />
      <path d="M3.75 10h16.5M8 3.5V7M16 3.5V7" />
      <path d="M12 12.5v4M10 14.5h4" />
    </Icon>
  );
}
export function ClipboardIcon(props) {
  return (
    <Icon {...props}>
      <rect height="15" rx="2" width="12.5" x="5.75" y="5" />
      <path d="M9.3 5V3.9A1 1 0 0 1 10.3 3h3.4a1 1 0 0 1 1 1V5" />
      <path d="M9.2 11h5.6M9.2 14.5h3.6" />
    </Icon>
  );
}
export function ClipboardPlusIcon(props) {
  return (
    <Icon {...props}>
      <rect height="15" rx="2" width="12.5" x="5.75" y="5" />
      <path d="M9.3 5V3.9A1 1 0 0 1 10.3 3h3.4a1 1 0 0 1 1 1V5" />
      <path d="M12 10.8v4.4M9.8 13h4.4" />
    </Icon>
  );
}
export function ReceiptIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 3.5h12v16.2l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z" />
      <path d="M9.2 8h5.6M9.2 11.6h5.6" />
    </Icon>
  );
}
export function CreditCardIcon(props) {
  return (
    <Icon {...props}>
      <rect height="13" rx="2.2" width="17.5" x="3.25" y="5.5" />
      <path d="M3.25 10h17.5" />
      <path d="M7 14.4h3" />
    </Icon>
  );
}
export function StethoscopeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5.5 4v5.2a3.4 3.4 0 0 0 6.8 0V4" />
      <path d="M4 4h3M10.8 4h3" />
      <path d="M8.9 12.6v1.9a4 4 0 0 0 4 4h.9a3.6 3.6 0 0 0 3.6-3.6v-2" />
      <circle cx="17.4" cy="11.4" r="1.9" />
    </Icon>
  );
}
export function ClockIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.3" />
      <path d="M12 7.6V12l3 1.8" />
    </Icon>
  );
}
export function BoltIcon(props) {
  return (
    <Icon {...props}>
      <path d="M13.2 3 5.6 13.4h5.1L10.8 21l7.6-10.4h-5.1z" />
    </Icon>
  );
}
export function SearchIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.2" />
      <path d="m15.6 15.6 3.4 3.4" />
    </Icon>
  );
}
export function BellIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6.4 10.2a5.6 5.6 0 0 1 11.2 0c0 4 1.4 5.3 1.4 5.3H5s1.4-1.3 1.4-5.3Z" />
      <path d="M10.3 18.4a1.9 1.9 0 0 0 3.4 0" />
    </Icon>
  );
}
export function SpeakerIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4.5 9.6h3L12 5.7v12.6l-4.5-3.9h-3z" />
      <path d="M15.4 9.6a3.4 3.4 0 0 1 0 4.8" />
      <path d="M17.9 7.3a6.8 6.8 0 0 1 0 9.4" />
    </Icon>
  );
}
export function PlusIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 5.5v13M5.5 12h13" />
    </Icon>
  );
}
export function PencilIcon(props) {
  return (
    <Icon {...props}>
      <path d="M16.2 4.6a1.9 1.9 0 0 1 2.7 2.7L8.4 17.8l-3.6.8.8-3.6z" />
      <path d="m14.6 6.2 3.2 3.2" />
    </Icon>
  );
}
export function TrashIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4.8 6.8h14.4M9.6 6.8V5.2a1 1 0 0 1 1-1h2.8a1 1 0 0 1 1 1v1.6" />
      <path d="M6.6 6.8 7.6 19a1 1 0 0 0 1 .9h6.8a1 1 0 0 0 1-.9l1-12.2" />
      <path d="M10.4 10.4v5.6M13.6 10.4v5.6" />
    </Icon>
  );
}
export function EraserIcon(props) {
  return (
    <Icon {...props}>
      <path d="M8.4 19.5H19.5" />
      <path d="m12.6 4.9 6.5 6.5a1.4 1.4 0 0 1 0 2l-4.6 4.6a1.4 1.4 0 0 1-2 0l-6.5-6.5a1.4 1.4 0 0 1 0-2l4.6-4.6a1.4 1.4 0 0 1 2 0Z" />
      <path d="m8.2 9.3 6.5 6.5" />
    </Icon>
  );
}
export function CheckIcon(props) {
  return (
    <Icon {...props}>
      <path d="m5.4 12.6 4.2 4.2 9-9.4" />
    </Icon>
  );
}
export function XIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6" />
    </Icon>
  );
}
export function LockIcon(props) {
  return (
    <Icon {...props}>
      <rect height="9.6" rx="2" width="13.4" x="5.3" y="10.4" />
      <path d="M8.4 10.4V7.6a3.6 3.6 0 0 1 7.2 0v2.8" />
      <path d="M12 14.2v2.1" />
    </Icon>
  );
}
export function LogoutIcon(props) {
  return (
    <Icon {...props}>
      <path d="M14.5 5.6V4.8a1.3 1.3 0 0 0-1.3-1.3H5.8a1.3 1.3 0 0 0-1.3 1.3v14.4a1.3 1.3 0 0 0 1.3 1.3h7.4a1.3 1.3 0 0 0 1.3-1.3v-.8" />
      <path d="M9.6 12h10.1" />
      <path d="m16.6 8.9 3.1 3.1-3.1 3.1" />
    </Icon>
  );
}
export function AlertIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 4.6 20 18.4H4z" />
      <path d="M12 9.6v3.9M12 16.1v.1" />
    </Icon>
  );
}
export function InfoIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.3" />
      <path d="M12 11v5.2M12 7.9v.1" />
    </Icon>
  );
}
export function ShieldIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.6 19 6.3v5.2c0 4.2-2.8 7.1-7 8.9-4.2-1.8-7-4.7-7-8.9V6.3z" />
      <path d="m9.2 11.9 2 2 3.6-3.9" />
    </Icon>
  );
}
export function ChevronDownIcon(props) {
  return (
    <Icon {...props}>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    </Icon>
  );
}
export function EyeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M2.8 12S6.4 5.9 12 5.9 21.2 12 21.2 12 17.6 18.1 12 18.1 2.8 12 2.8 12Z" />
      <circle cx="12" cy="12" r="3.1" />
    </Icon>
  );
}
export function PrinterIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6.6 9.4V4.4h10.8v5" />
      <path d="M6.6 17.6H4.9A1.9 1.9 0 0 1 3 15.7v-4.4a1.9 1.9 0 0 1 1.9-1.9h14.2A1.9 1.9 0 0 1 21 11.3v4.4a1.9 1.9 0 0 1-1.9 1.9h-1.7" />
      <path d="M6.6 13.6h10.8v6H6.6z" />
    </Icon>
  );
}
export function HospitalIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4.5 20V6.4a1.4 1.4 0 0 1 1.4-1.4h12.2a1.4 1.4 0 0 1 1.4 1.4V20" />
      <path d="M3 20h18" />
      <path d="M12 7.8v4.4M9.8 10h4.4" />
    </Icon>
  );
}
