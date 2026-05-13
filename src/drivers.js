import { useEffect, useState } from "react";
import { apiFetch } from "./api";

/* ── Avatar fallback color from name ── */
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
];

const avatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const initials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

/* ── Icons ── */
const PhoneIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-3.5 h-3.5 shrink-0"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.11 4.18 2 2 0 0 1 4.09 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

/* ── Driver Card ── */
const DriverCard = ({ driver }) => {
  const av = avatarColor(driver.name);

  // Handle image URL
  const pictureUrl = driver.picture
    ? driver.picture.startsWith("http")
      ? driver.picture
      : `${import.meta.env.VITE_API_BASE_URL || ""}${driver.picture}`
    : null;

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] flex flex-col overflow-hidden transition-all duration-150 hover:-translate-y-px hover:border-[#d1d5db] hover:shadow-sm">

      {/* Top banner */}
      <div className="h-10 bg-gradient-to-r from-[#f0fdf6] to-[#ecfdf5]" />

      {/* Avatar */}
      <div className="px-3 -mt-6 mb-2">
        <div
          className={`w-12 h-12 rounded-xl border-4 border-white shadow-sm overflow-hidden flex items-center justify-center text-sm font-bold ${av}`}
        >
          {pictureUrl ? (
            <img
              src={pictureUrl}
              alt={driver.name}
              className="w-full h-full object-cover"
            />
          ) : (
            initials(driver.name)
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-3 pb-3 flex flex-col gap-[6px]">

        {/* Name */}
        <p className="font-semibold text-[14px] text-[#111827] leading-tight">
          {driver.name}
        </p>

        <div className="border-t border-[#f3f4f6] pt-2 flex flex-col gap-1.5">

          {/* Phone Number */}
          {driver.phone_number ? (
            <a
              href={`tel:${driver.phone_number}`}
              className="flex items-center gap-1.5 text-[11px] text-[#6b7280] hover:text-emerald-600 transition-colors"
            >
              <span className="text-[#9ca3af]">
                <PhoneIcon />
              </span>
              <span>{driver.phone_number}</span>
            </a>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-[#9ca3af]">
              <PhoneIcon />
              <span>No phone number</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

/* ── Main ── */
export default function Dashboard() {
  const [drivers, setDrivers] = useState([]);

  const loadData = async () => {
    try {
      const d = await apiFetch("/drivers/");
      setDrivers(d);
    } catch (err) {
      console.error("Failed to load drivers:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-5 bg-[#f6f7fb] min-h-screen">

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-[20px] font-semibold text-[#111827]">
          2026 | DRIVERS LOG
        </h1>
      </div>

      {/* Grid */}
      {drivers.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[10px]">
          {drivers.map((d) => (
            <DriverCard key={d.id} driver={d} />
          ))}
        </div>
      ) : (
        <div className="p-5 text-[#6b7280]">
          No drivers found.
        </div>
      )}
    </div>
  );
}