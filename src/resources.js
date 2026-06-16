import { useEffect, useState } from "react";
import { apiFetch } from "./api";

/* ── Avatar color ── */
const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
];
const avatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const initials = (name = "") => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

/* ── Icons ── */
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.11 4.18 2 2 0 0 1 4.09 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

/* ── Condition/Availability badge config ── */
const CONDITION_CFG = {
  READY_TO_USE:  { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Ready to Use" },
  FOR_REPAIR:    { badge: "bg-amber-50 text-amber-700 border-amber-200",       label: "For Repair" },
  FOR_DISPOSAL:  { badge: "bg-red-50 text-red-700 border-red-200",             label: "For Disposal" },
};
const AVAILABILITY_CFG = {
  AVAILABLE:   { dot: "bg-emerald-400", label: "Available" },
  UNAVAILABLE: { dot: "bg-red-400",     label: "Unavailable" },
};

/* ══════════════════════════════════════════
   ADD DRIVER MODAL
══════════════════════════════════════════ */
const AddDriverModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({ name: "", phone_number: "" });
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicture(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setErrors({ name: "Name is required." }); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("phone_number", form.phone_number.trim());
      if (picture) fd.append("picture", picture);
      const newDriver = await apiFetch("/drivers/", { method: "POST", body: fd});
      onSaved(newDriver);
      onClose();
    } catch (err) {
      alert("Failed to save driver: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-800">Add New Driver</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-4">
          {/* Photo */}
          <div className="flex flex-col items-center gap-2">
            <div className={`w-20 h-20 rounded-xl border-2 border-dashed overflow-hidden flex items-center justify-center bg-slate-50 ${preview ? "border-emerald-300" : "border-slate-200 text-slate-300"}`}>
              {preview
                ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                : <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              }
            </div>
            <label className="text-xs text-emerald-600 font-medium cursor-pointer hover:underline">
              {preview ? "Change Photo" : "Upload Photo"}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </label>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Full Name <span className="text-red-400">*</span></label>
            <input
              type="text" placeholder="Juan dela Cruz" value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={`w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 transition ${errors.name ? "border-red-300 bg-red-50 focus:ring-red-200" : "border-slate-200 bg-slate-50 focus:ring-emerald-200 focus:border-emerald-300"}`}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Phone Number</label>
            <input
              type="text" placeholder="09171234567" value={form.phone_number}
              onChange={(e) => set("phone_number", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-emerald-200">
              {saving ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : "Save Driver"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   ADD VEHICLE MODAL
══════════════════════════════════════════ */
const AddVehicleModal = ({ drivers, onClose, onSaved }) => {
  const [form, setForm] = useState({
    plate_number: "", model: "", condition: "READY_TO_USE",
    driver: "", assistant_driver: "",
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.plate_number.trim()) e.plate_number = "Plate number is required.";
    if (!form.model.trim()) e.model = "Model is required.";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = {
        plate_number: form.plate_number.trim().toUpperCase(),
        model: form.model.trim(),
        condition: form.condition,
        driver: form.driver ? Number(form.driver) : null,
        assistant_driver: form.assistant_driver ? Number(form.assistant_driver) : null,
      };
      const newVehicle = await apiFetch("/vehicles/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onSaved(newVehicle);
      onClose();
    } catch (err) {
      alert("Failed to save vehicle: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (err) =>
    `w-full px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 transition ${err ? "border-red-300 bg-red-50 focus:ring-red-200" : "border-slate-200 bg-slate-50 focus:ring-emerald-200 focus:border-emerald-300"}`;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-sky-400 to-blue-500" />
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center">
              <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-800">Add New Vehicle</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-4">

          {/* Plate Number */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Plate Number <span className="text-red-400">*</span></label>
            <input
              type="text" placeholder="e.g. ABC 1234" value={form.plate_number}
              onChange={(e) => set("plate_number", e.target.value)}
              className={inputCls(errors.plate_number)}
            />
            {errors.plate_number && <p className="text-xs text-red-500">{errors.plate_number}</p>}
          </div>

          {/* Model */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Model <span className="text-red-400">*</span></label>
            <input
              type="text" placeholder="e.g. Toyota Hi-Ace" value={form.model}
              onChange={(e) => set("model", e.target.value)}
              className={inputCls(errors.model)}
            />
            {errors.model && <p className="text-xs text-red-500">{errors.model}</p>}
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => set("condition", e.target.value)}
              className={inputCls(false)}
            >
              <option value="READY_TO_USE">Ready to Use</option>
              <option value="FOR_REPAIR">For Repair</option>
              <option value="FOR_DISPOSAL">For Disposal</option>
            </select>
          </div>

          {/* Driver */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Assigned Driver</label>
            <select value={form.driver} onChange={(e) => set("driver", e.target.value)} className={inputCls(false)}>
              <option value="">— None —</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {/* Assistant Driver */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Assistant Driver</label>
            <select value={form.assistant_driver} onChange={(e) => set("assistant_driver", e.target.value)} className={inputCls(false)}>
              <option value="">— None —</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm shadow-sky-200">
              {saving ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : "Save Vehicle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   DRIVER CARD
══════════════════════════════════════════ */
const DriverCard = ({ driver }) => {
  const av = avatarColor(driver.name);
  const pictureUrl = driver.picture
    ? driver.picture.startsWith("http") ? driver.picture : `${import.meta.env.VITE_API_BASE_URL || ""}${driver.picture}`
    : null;

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] flex flex-col overflow-hidden transition-all duration-150 hover:-translate-y-px hover:border-[#d1d5db] hover:shadow-sm">
      <div className="h-10 bg-gradient-to-r from-[#f0fdf6] to-[#ecfdf5]" />
      <div className="px-3 -mt-6 mb-2">
        <div className={`w-12 h-12 rounded-xl border-4 border-white shadow-sm overflow-hidden flex items-center justify-center text-sm font-bold ${av}`}>
          {pictureUrl ? <img src={pictureUrl} alt={driver.name} className="w-full h-full object-cover" /> : initials(driver.name)}
        </div>
      </div>
      <div className="px-3 pb-3 flex flex-col gap-[6px]">
        <p className="font-semibold text-[14px] text-[#111827] leading-tight">{driver.name}</p>
        <div className="border-t border-[#f3f4f6] pt-2 flex flex-col gap-1.5">
          {driver.phone_number ? (
            <a href={`tel:${driver.phone_number}`} className="flex items-center gap-1.5 text-[11px] text-[#6b7280] hover:text-emerald-600 transition-colors">
              <span className="text-[#9ca3af]"><PhoneIcon /></span>
              <span>{driver.phone_number}</span>
            </a>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-[#9ca3af]">
              <PhoneIcon /><span>No phone number</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   VEHICLE CARD
══════════════════════════════════════════ */
const VehicleCard = ({ vehicle, drivers }) => {
  const condCfg = CONDITION_CFG[vehicle.condition] || { badge: "bg-slate-50 text-slate-500 border-slate-200", label: vehicle.condition };
  const availCfg = AVAILABILITY_CFG[vehicle.availability] || { dot: "bg-slate-300", label: vehicle.availability };
  const driverName = drivers.find((d) => d.id === vehicle.driver)?.name || null;
  const assistantName = drivers.find((d) => d.id === vehicle.assistant_driver)?.name || null;

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] flex flex-col overflow-hidden transition-all duration-150 hover:-translate-y-px hover:border-[#d1d5db] hover:shadow-sm">
      {/* Banner */}
      <div className="h-10 bg-gradient-to-r from-sky-50 to-blue-50 flex items-end px-3 pb-1.5">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${condCfg.badge}`}>
          {condCfg.label}
        </span>
      </div>

      {/* Icon */}
      <div className="px-3 -mt-5 mb-2">
        <div className="w-12 h-12 rounded-xl border-4 border-white shadow-sm bg-sky-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
      </div>

      <div className="px-3 pb-3 flex flex-col gap-1.5">
        {/* Plate */}
        <p className="font-bold text-[14px] text-[#111827] leading-tight tracking-wide">{vehicle.plate_number}</p>
        <p className="text-[11px] text-slate-500">{vehicle.model}</p>

        <div className="border-t border-[#f3f4f6] pt-2 flex flex-col gap-1">
          {/* Availability */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className={`w-2 h-2 rounded-full shrink-0 ${availCfg.dot}`} />
            {availCfg.label}
          </div>

          {/* Driver */}
          {driverName && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {driverName}
            </div>
          )}

          {/* Assistant */}
          {assistantName && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {assistantName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function FleetAndDrivers() {
  const [tab, setTab] = useState("drivers");
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  const loadData = async () => {
    try {
      const [d, v] = await Promise.all([apiFetch("/drivers/"), apiFetch("/vehicles/")]);
      setDrivers(d);
      setVehicles(v);
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="p-5 bg-[#f6f7fb] min-h-screen">

      {showAddDriver && (
        <AddDriverModal
          onClose={() => setShowAddDriver(false)}
          onSaved={(d) => setDrivers((prev) => [...prev, d])}
        />
      )}

      {showAddVehicle && (
        <AddVehicleModal
          drivers={drivers}
          onClose={() => setShowAddVehicle(false)}
          onSaved={(v) => setVehicles((prev) => [...prev, v])}
        />
      )}

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827]">Fleet & Drivers</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your drivers and vehicle fleet</p>
        </div>
        <button
          onClick={() => tab === "drivers" ? setShowAddDriver(true) : setShowAddVehicle(true)}
          className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-xl shadow-sm transition
            ${tab === "drivers"
              ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
              : "bg-sky-500 hover:bg-sky-600 shadow-sky-200"
            }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          {tab === "drivers" ? "Add Driver" : "Add Vehicle"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
        <button
          onClick={() => setTab("drivers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === "drivers"
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Drivers
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === "drivers" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
            {drivers.length}
          </span>
        </button>
        <button
          onClick={() => setTab("vehicles")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
            tab === "vehicles"
              ? "bg-sky-500 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Vehicles
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === "vehicles" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
            {vehicles.length}
          </span>
        </button>
      </div>

      {/* Drivers Grid */}
      {tab === "drivers" && (
        drivers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[10px]">
            {drivers.map((d) => <DriverCard key={d.id} driver={d} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-sm">No drivers yet.</p>
            <button onClick={() => setShowAddDriver(true)} className="mt-3 text-xs text-emerald-600 font-semibold hover:underline">+ Add your first driver</button>
          </div>
        )
      )}

      {/* Vehicles Grid */}
      {tab === "vehicles" && (
        vehicles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[10px]">
            {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} drivers={drivers} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p className="text-sm">No vehicles yet.</p>
            <button onClick={() => setShowAddVehicle(true)} className="mt-3 text-xs text-sky-600 font-semibold hover:underline">+ Add your first vehicle</button>
          </div>
        )
      )}
    </div>
  );
}