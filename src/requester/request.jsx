import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api"; // adjust path if needed

const STEPS = ["Requester & Travel Details", "Passengers & Confirmation"];

const initialForm = {
  email: "", name: "", department: "", immediateHead: "", mobile: "",
  dateOfTravel: "", dateReturned: "", destination: "", purpose: "", waitingArea: "",
  departureTime: "", expectedReturn: "", numPassengers: "", passengerNames: "",
  projectBased: "", fundingType: "", acknowledgement: false, notes: "", attachments: [],
};

/* ── Validation helpers ── */
const isValidMobile = (v) => /^\d{11}$/.test(v.replace(/[-\s]/g, ""));
const isValidEmail  = (v) => v === "" || /^[^\s@]+@gmail\.com$/i.test(v.trim());

const countPassengerNames = (text) =>
  text.split("\n").map((l) => l.replace(/^\d+\.\s*/, "").trim()).filter(Boolean).length;

/* ── Field wrapper ── */
const Field = ({ label, required, error, hint, children, className = "" }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-[10px] text-slate-400 italic">{hint}</span>}
    </div>
    {children}
    {error && <DangerAlert message={error} />}
  </div>
);

/* ── Danger alert ── */
const DangerAlert = ({ message }) => (
  <div className="flex items-start gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg">
    <svg className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
    <p className="text-rose-600 text-xs font-medium leading-snug">{message}</p>
  </div>
);

/* ── Trip duration badge ── */
const TripDurationBadge = ({ from, to }) => {
  if (!from || !to) return null;
  const diff = Math.round((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24));
  if (diff < 0) return null;
  if (diff === 0) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full text-[10px] font-semibold text-blue-600">
      📅 Same-day trip
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-semibold text-emerald-700">
      🗓 {diff} day{diff !== 1 ? "s" : ""} trip
    </span>
  );
};

const inputCls = (err) =>
  `w-full px-3.5 py-2.5 text-sm rounded-xl border focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60 text-slate-700 bg-white placeholder-slate-300 transition-all duration-200 ${
    err ? "border-rose-300 bg-rose-50 focus:ring-rose-100 focus:border-rose-400" : "border-slate-200 hover:border-slate-300"
  }`;

const chipBtn = (active) =>
  `px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer select-none ${
    active
      ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
  }`;

/* ── Topbar ── */
function Topbar() {
  return (
    <header className="bg-white border-b border-slate-100 px-6 md:px-10 h-14 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-800">Motor Pool Services Unit</p>
          <p className="text-[10px] text-slate-400 hidden sm:block">Davao del Norte State College</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/status"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="hidden sm:inline">Track My Request</span>
          <span className="sm:hidden">Track</span>
        </Link>
        <a
          href="/login"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="hidden sm:inline">Admin Login</span>
          <span className="sm:hidden">Login</span>
        </a>
      </div>
    </header>
  );
}

/* ── Department autocomplete ── */
function DepartmentInput({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const ref = useRef(null);

  const departments = [
    "IAAS","IADS","ILEGG","IC","ITED","OSDS","Cashier","REP","HRMO","PSU","Supply",
    "PRMO","QA","PIO","Record Management Office","BASD","VPAA","VPAF","VPREP","Extension Division",
    "Research Development Division","Production Division","Carmen Campus","TBI","Engineering Office",
    "GAD","Internalization","Office of the President","Quality Assurance","GASSO","Faculty Association",
    "Admin Services","Registrar","Accounting Office","GSU","Other Agency","OP","Budget","BOARD SEC",
    "External Visitors","Samal Campus","BAC","SETBI","Admission Office",
  ];

  const filtered = query.trim()
    ? departments.filter((d) => d.toLowerCase().includes(query.toLowerCase()))
    : departments;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setQuery(value || ""); }, [value]);

  return (
    <div ref={ref} className="relative">
      <input
        className={inputCls(error)}
        placeholder="e.g. ICT Department"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.map((d) => (
            <li
              key={d}
              onMouseDown={() => { onChange(d); setQuery(d); setOpen(false); }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${
                value === d ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-700"
              }`}
            >
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Step indicator ── */
function StepBar({ step, back }) {
  return (
    <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex items-center gap-4 shrink-0">
      <div className="flex items-center gap-3 shrink-0">
        {step > 1 ? (
          <button
            onClick={back}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            go back
          </button>
        ) : <div className="w-6" />}
        <span className="text-xs text-slate-400 font-medium">Step {step} of {STEPS.length}</span>
      </div>
      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>
      <div className="hidden sm:flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              i + 1 === step
                ? "bg-emerald-500 text-white"
                : i + 1 < step
                ? "bg-emerald-100 text-emerald-600"
                : "bg-slate-100 text-slate-400"
            }`}>
              {i + 1 < step ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
              {label}
            </div>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-slate-200" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function RequestPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const next = { ...e }; delete next[key]; return next; });
  };

  const validateStep = () => {
    const e = {};

    if (step === 1) {
      if (!form.name.trim())          e.name          = "Full name is required.";
      if (!form.department.trim())    e.department    = "Department is required.";
      if (!form.immediateHead.trim()) e.immediateHead = "Immediate head is required.";

      if (!form.mobile.trim()) {
        e.mobile = "Mobile number is required.";
      } else if (!isValidMobile(form.mobile)) {
        e.mobile = "Mobile number must be exactly 11 digits (e.g. 09171234567).";
      }

      if (form.email.trim() && !isValidEmail(form.email)) {
        e.email = "Email must be a valid Gmail address ending in @gmail.com.";
      }

      if (!form.dateOfTravel)  e.dateOfTravel  = "Date of travel is required.";
      if (!form.dateReturned)  e.dateReturned  = "Date of return is required.";
      if (form.dateOfTravel && form.dateReturned && form.dateReturned < form.dateOfTravel) {
        e.dateReturned = "Return date cannot be earlier than the travel date.";
      }

      if (!form.destination.trim()) e.destination   = "Destination is required.";
      if (!form.purpose.trim())     e.purpose       = "Purpose of travel is required.";
      if (!form.waitingArea.trim()) e.waitingArea   = "Waiting / pickup area is required.";
      if (!form.departureTime)      e.departureTime = "Departure time is required.";
      if (!form.expectedReturn)     e.expectedReturn = "Expected return time is required.";
    }

    if (step === 2) {
      const declared = parseInt(form.numPassengers, 10);

      if (!form.numPassengers) {
        e.numPassengers = "Number of passengers is required.";
      } else if (isNaN(declared) || declared < 1) {
        e.numPassengers = "Please enter a valid number of passengers (at least 1).";
      }

      if (!form.passengerNames.trim()) {
        e.passengerNames = "Passenger names are required.";
      } else if (!isNaN(declared) && declared >= 1) {
        const listed = countPassengerNames(form.passengerNames);
        if (listed !== declared) {
          e.passengerNames = `You declared ${declared} passenger${declared !== 1 ? "s" : ""} but listed ${listed} name${listed !== 1 ? "s" : ""}. Please make them match.`;
        }
      }

      if (!form.projectBased)    e.projectBased   = "Please indicate if this is project-based travel.";
      if (!form.acknowledgement) e.acknowledgement = "You must acknowledge to submit.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(2); };
  const back = () => { setErrors({}); setStep(1); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await apiFetch("/requests/", {
        method: "POST",
        body: JSON.stringify({
          name:              form.name,
          email:             form.email || "",
          department:        form.department,
          immediate_head:    form.immediateHead,
          mobile:            form.mobile,
          date_of_travel:    form.dateOfTravel,
          date_returned:     form.dateReturned,
          destination:       form.destination,
          purpose:           form.purpose,
          waiting_area:      form.waitingArea,
          time_of_departure: form.departureTime || null,
          expected_return:   form.expectedReturn || null,
          passengers:        form.numPassengers ? parseInt(form.numPassengers, 10) : 0,
          passenger_names:   form.passengerNames,
          project_based:     form.projectBased === "Yes" ? true : form.projectBased === "No" ? false : null,
          funding_type:      form.projectBased === "Yes" ? (form.fundingType || "") : "",
          notes:             form.notes || "",
        }),
      }, { auth: false });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Submission failed:\n" + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── SUCCESS ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Topbar />
        <div className="flex-1 flex items-center justify-center p-10">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-md p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted!</h2>
            <p className="text-sm text-slate-500 mb-1">
              Your request is <span className="font-semibold text-amber-600">pending admin approval</span>.
            </p>
            <p className="text-xs text-slate-400 mb-6">Once approved, your trip will be automatically added to the schedule.</p>
            <div className="bg-slate-50 rounded-xl p-4 text-left mb-5 space-y-2.5 text-xs text-slate-500">
              <p>📋 <a href="https://docs.google.com/forms/d/e/1FAIpQLSct44Weo1ea8Zj0m7gxb-ByQ6YWoah8FCS9t7Rk6Ey4nodhXg/viewform" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">DNSC Client Satisfaction Measurement Survey</a></p>
              <p>🔗 <Link to="/status" className="text-emerald-600 underline font-medium">Check Status of Vehicle Request</Link></p>
            </div>
            <button
              onClick={() => { setSubmitted(false); setStep(1); setForm(initialForm); }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-emerald-200"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Topbar />
      <StepBar step={step} back={back} />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8">

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-1">Step 1 of 2</p>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Request & Travel Information</h1>
              <p className="text-sm text-slate-400 mt-1">Fill in your details and where you're headed.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* LEFT: Requester Info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-slate-700">Requester Information</h2>
                </div>

                <Field label="Email" error={errors.email} hint="Must be @gmail.com">
                  <input className={inputCls(errors.email)} placeholder="your@gmail.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </Field>
                <Field label="Full Name" required error={errors.name}>
                  <input className={inputCls(errors.name)} placeholder="Juan dela Cruz" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </Field>
                <Field label="Department / Office" required error={errors.department}>
                  <DepartmentInput
                    value={form.department}
                    onChange={(val) => set("department", val)}
                    error={errors.department}
                  />
                </Field>
                <Field label="Immediate Head" required error={errors.immediateHead}>
                  <input className={inputCls(errors.immediateHead)} placeholder="Name of your direct supervisor" value={form.immediateHead} onChange={(e) => set("immediateHead", e.target.value)} />
                </Field>
                <Field label="Mobile Number" required error={errors.mobile} hint="11 digits · e.g. 09171234567">
                  <input className={inputCls(errors.mobile)} placeholder="09171234567" maxLength={13} value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
                </Field>
              </div>

              {/* RIGHT: Travel Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-slate-700">Travel Details</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date of Travel" required error={errors.dateOfTravel}>
                    <input
                      type="date"
                      className={inputCls(errors.dateOfTravel)}
                      value={form.dateOfTravel}
                      onChange={(e) => set("dateOfTravel", e.target.value)}
                    />
                  </Field>
                  <Field label="Date of Return" required error={errors.dateReturned}>
                    <input
                      type="date"
                      className={inputCls(errors.dateReturned)}
                      min={form.dateOfTravel || undefined}
                      value={form.dateReturned}
                      onChange={(e) => set("dateReturned", e.target.value)}
                    />
                  </Field>
                </div>

                {form.dateOfTravel && form.dateReturned && (
                  <div className="-mt-1">
                    <TripDurationBadge from={form.dateOfTravel} to={form.dateReturned} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Waiting / Pickup Area" required error={errors.waitingArea}>
                    <input className={inputCls(errors.waitingArea)} placeholder="e.g. Main Gate" value={form.waitingArea} onChange={(e) => set("waitingArea", e.target.value)} />
                  </Field>
                  <Field label="Travel Destination" required error={errors.destination}>
                    <input className={inputCls(errors.destination)} placeholder="e.g. Manila, NCR" value={form.destination} onChange={(e) => set("destination", e.target.value)} />
                  </Field>
                </div>

                <Field label="Purpose of Travel" required error={errors.purpose}>
                  <textarea rows={3} className={inputCls(errors.purpose) + " resize-none"} placeholder="Describe the purpose of your trip…" value={form.purpose} onChange={(e) => set("purpose", e.target.value)} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Departure Time" required error={errors.departureTime}>
                    <input type="time" className={inputCls(errors.departureTime)} value={form.departureTime} onChange={(e) => set("departureTime", e.target.value)} />
                  </Field>
                  <Field label="Expected Return Time" required error={errors.expectedReturn}>
                    <input type="time" className={inputCls(errors.expectedReturn)} value={form.expectedReturn} onChange={(e) => set("expectedReturn", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={next}
                className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-200"
              >
                Continue
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-1">Step 2 of 2</p>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Passengers & Confirmation</h1>
              <p className="text-sm text-slate-400 mt-1">List who's coming and review your request before submitting.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* LEFT: Passengers */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-slate-700">Passenger Details</h2>
                </div>

                <Field label="Number of Passengers" required error={errors.numPassengers}>
                  <input
                    type="number"
                    min="1"
                    className={inputCls(errors.numPassengers)}
                    placeholder="e.g. 4"
                    value={form.numPassengers}
                    onChange={(e) => set("numPassengers", e.target.value)}
                  />
                </Field>

                <Field
                  label="Passenger Names"
                  required
                  error={errors.passengerNames}
                  hint={
                    form.numPassengers && !isNaN(parseInt(form.numPassengers, 10))
                      ? `${countPassengerNames(form.passengerNames)} / ${form.numPassengers} listed`
                      : "One per line"
                  }
                >
                  <textarea
                    rows={5}
                    className={inputCls(errors.passengerNames) + " resize-none"}
                    placeholder={"1. Juan dela Cruz\n2. Maria Santos\n3. Pedro Reyes"}
                    value={form.passengerNames}
                    onChange={(e) => set("passengerNames", e.target.value)}
                  />
                </Field>

                <Field label="Project Based Travel?" required error={errors.projectBased}>
                  <div className="flex gap-3">
                    {["Yes", "No"].map((opt) => (
                      <button key={opt} type="button" onClick={() => set("projectBased", opt)} className={chipBtn(form.projectBased === opt) + " flex-1"}>{opt}</button>
                    ))}
                  </div>
                </Field>

                {form.projectBased === "Yes" && (
                  <Field label="Funding Type">
                    <div className="flex gap-3 flex-wrap">
                      {["Externally Funded", "Internally Funded"].map((opt) => (
                        <button key={opt} type="button" onClick={() => set("fundingType", opt)} className={chipBtn(form.fundingType === opt) + " flex-1"}>{opt}</button>
                      ))}
                    </div>
                  </Field>
                )}

                <Field label="Additional Notes" hint="Optional">
                  <textarea
                    rows={3}
                    className={inputCls(false) + " resize-none"}
                    placeholder="Any additional information, special instructions, or requests…"
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                  />
                </Field>

                {/* Attachment reminder */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3">
                  <span className="text-base leading-none shrink-0">📎</span>
                  <div className="text-xs text-blue-800 leading-relaxed">
                    <span className="font-semibold block mb-0.5">Have attachments?</span>
                    If you have supporting documents (authorization letters, itineraries, etc.),
                    please upload them to our shared folder and include your name and travel date
                    in the filename so we can match them to your request.{" "}
                    <a
                      href="https://drive.google.com/drive/folders/12ZfJ337ToBpRh7jmZSGv6QLctv2zF929?usp=sharing"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800 transition"
                    >
                      Upload here
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* RIGHT: Review + Acknowledge */}
              <div className="flex flex-col gap-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-0">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h2 className="text-sm font-bold text-slate-700">Request Summary</h2>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[
                      ["Name",           form.name],
                      ["Email",          form.email],
                      ["Department",     form.department],
                      ["Imm. Head",      form.immediateHead],
                      ["Mobile",         form.mobile],
                      ["Date of Travel", form.dateOfTravel],
                      ["Date of Return", form.dateReturned],
                      ["Destination",    form.destination],
                      ["Waiting Area",   form.waitingArea],
                      ["Departure",      form.departureTime],
                      ["Return Time",    form.expectedReturn],
                      ["Passengers",     form.numPassengers],
                      ["Notes",          form.notes],
                      ["Project Based",  form.projectBased],
                      ...(form.projectBased === "Yes" ? [["Funding", form.fundingType]] : []),
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between gap-4 py-2">
                        <span className="text-xs text-slate-400 shrink-0">{label}</span>
                        <span className="text-xs font-semibold text-slate-700 text-right truncate max-w-[180px]">{val || "—"}</span>
                      </div>
                    ))}
                  </div>
                  {form.dateOfTravel && form.dateReturned && (
                    <div className="pt-3 mt-1 border-t border-slate-50">
                      <TripDurationBadge from={form.dateOfTravel} to={form.dateReturned} />
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
                  <span className="text-base leading-none shrink-0">⏳</span>
                  <span>Your request will be <strong>pending admin approval</strong>. Once approved, your trip will be automatically added to the calendar.</span>
                </div>

                <div className={`rounded-xl border p-4 ${errors.acknowledgement ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-0.5 w-4 h-4 accent-emerald-500 shrink-0"
                      checked={form.acknowledgement}
                      onChange={(e) => set("acknowledgement", e.target.checked)}
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-700">Acknowledgement *</span><br />
                      I certify that the information provided is accurate and I understand that vehicle availability is subject to approval.
                    </span>
                  </label>
                  {errors.acknowledgement && (
                    <div className="mt-2 ml-7">
                      <DangerAlert message={errors.acknowledgement} />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-100 py-3 px-8 shrink-0">
        <p className="text-[11px] text-slate-300">DNSC Motorpool System · For concerns, contact the Motorpool Office</p>
      </footer>
    </div>
  );
}