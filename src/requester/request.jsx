   import { useState } from "react";
import { Link } from "react-router-dom";

const STEPS = [
  "Requester Info",
  "Travel Details",
  "Passengers & Files",
  "Confirmation",
];

const initialForm = {
  email: "", name: "", department: "", immediateHead: "", mobile: "",
  dateOfTravel: "", destination: "", purpose: "", waitingArea: "",
  departureTime: "", expectedReturn: "", numPassengers: "", passengerNames: "",
  projectBased: "", fundingType: "", acknowledgement: false, attachments: [],
};

const Field = ({ label, required, error, hint, children }) => (
  <div className="mb-5">
    <div className="flex items-center justify-between mb-1.5">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {hint && <span className="text-[10px] text-slate-400 italic">{hint}</span>}
    </div>
    {children}
    {error && (
      <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const inputCls = (err) =>
  `w-full px-4 py-3 text-sm rounded-xl border focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/60 text-slate-700 bg-white placeholder-slate-300 transition-all duration-200 ${
    err ? "border-rose-300 bg-rose-50 focus:ring-rose-100 focus:border-rose-400" : "border-slate-200 hover:border-slate-300"
  }`;

const chipBtn = (active) =>
  `px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer select-none ${
    active
      ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
      : "border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50"
  }`;

/* ── Track My Request modal ── */
function TrackModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-800">Track My Request</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Check the status of your vehicle request using the link below.
        </p>
      <Link to="/status" className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-emerald-200">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Request Status Sheet
        </Link>
        <button onClick={onClose} className="w-full mt-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition">
          Close
        </button>
      </div>
    </div>
  );
}


/* ── Topbar ── */
function Topbar({ onTrack }) {
  return (
    <header className="bg-white border-b border-slate-100 px-6 md:px-10 h-14 flex items-center justify-between shrink-0 z-10">
      {/* Left: brand */}
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

      {/* Right: Track + Admin Login */}
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

/* ── Sidebar ── */
function Sidebar({ step }) {
  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-white border-r border-slate-100 px-6 py-8 shrink-0">
      {/* <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-200">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-800">Vehicle Request Form</p>
          <p className="text-xs text-slate-400">Vehicle Request System</p>
        </div>
      </div> */}

      {/* Step list */}
      <div className="space-y-1 flex-1">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div
              key={label}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                active ? "bg-emerald-50" : ""
              }`}
            >
              {/* Step number / check */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                done
                  ? "bg-emerald-400 text-white"
                  : active
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                  : "bg-slate-100 text-slate-400"
              }`}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : n}
              </div>
              <span className={`text-sm font-semibold transition-colors duration-200 ${
                active ? "text-emerald-800" : done ? "text-slate-400" : "text-slate-400"
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom hint */}
      <div className="pt-6 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 leading-relaxed">
        Need help? Contact the{" "}
        <a
            href="tel:+639618773980"
            className="text-emerald-600 font-medium hover:underline"
        >
            Motorpool Office
        </a>{" "}
        for assistance.
        </p>
      </div>
    </aside>
  );
}

/* ── Main page ── */
export default function RequestPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTrack, setShowTrack] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!form.name.trim()) e.name = "Required";
      if (!form.department.trim()) e.department = "Required";
      if (!form.immediateHead.trim()) e.immediateHead = "Required";
      if (!form.mobile.trim()) e.mobile = "Required";
    }
    if (step === 2) {
      if (!form.dateOfTravel) e.dateOfTravel = "Required";
      if (!form.destination.trim()) e.destination = "Required";
      if (!form.purpose.trim()) e.purpose = "Required";
      if (!form.waitingArea.trim()) e.waitingArea = "Required";
      if (!form.departureTime) e.departureTime = "Required";
      if (!form.expectedReturn) e.expectedReturn = "Required";
    }
    if (step === 3) {
      if (!form.numPassengers) e.numPassengers = "Required";
      if (!form.passengerNames.trim()) e.passengerNames = "Required";
      if (!form.projectBased) e.projectBased = "Required";
    }
    if (step === 4) {
      if (!form.acknowledgement) e.acknowledgement = "You must acknowledge to submit.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const back = () => { setErrors({}); setStep((s) => s - 1); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const payload = {
        "Email": form.email,
        "Name:": form.name,
        "Department / Office": form.department,
        "Immediate Head": form.immediateHead,
        "Mobile Number": form.mobile,
        "Date of Travel": form.dateOfTravel,
        "Travel Destination": form.destination,
        "Purpose of Travel": form.purpose,
        "Waiting Area": form.waitingArea,
        "Time of Departure": form.departureTime,
        "Expected Return": form.expectedReturn,
        "Number of Passengers": form.numPassengers,
        "Name of Passengers": form.passengerNames,
        "Project Based Travel": form.projectBased,
        "Funding Type": form.projectBased === "Yes" ? form.fundingType : "N/A",
        "STATUS": "Pending",
        "Timestamp": new Date().toLocaleString(),
      };
      await fetch("https://sheetdb.io/api/v1/cyqjdv9avucvn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload }),
      });
      setSubmitted(true);
    } catch {
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── SUCCESS ── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Topbar onTrack={() => setShowTrack(true)} />
        <div className="flex flex-1">
          <Sidebar step={STEPS.length + 1} />
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
                <p>🔗 <a href="https://docs.google.com/spreadsheets/d/1oWoyC43lvf3cwr46_aylenjpj6X1WYpkxhV7I5DG-Dw/edit?usp=sharing" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">Check Status of Vehicle Request</a></p>
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
        {showTrack && <TrackModal onClose={() => setShowTrack(false)} />}
      </div>
    );
  }

  const progressPct = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── TOPBAR — full width ── */}
      <Topbar onTrack={() => setShowTrack(true)} />

      {/* ── BODY: sidebar + content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <Sidebar step={step} />

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {/* Sub-header: step counter + progress bar (like inspo) */}
          <div className="bg-white border-b border-slate-100 px-8 md:px-12 py-3 flex items-center gap-4 shrink-0">
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
              ) :   (
                <div className="w-6" />
              )}  
              <span className="text-xs text-slate-400 font-medium">Step {step} of {STEPS.length}</span>
            </div>
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Form content */}
          <main className="flex-1 flex flex-col items-center px-6 md:px-10 py-12">
            <div className="w-full max-w-lg">

              {/* Step heading */}
              <div className="mb-8">
                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-1">{STEPS[step - 1]}</p>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1 tracking-tight">
                  {step === 1 && "Who's requesting?"}
                  {step === 2 && "Where are you headed?"}
                  {step === 3 && "Who's coming along?"}
                  {step === 4 && "Review & confirm."}
                </h1>
                <p className="text-sm text-slate-400">
                  {step === 1 && "Fill in your basic information below."}
                  {step === 2 && "Provide the travel details for this trip."}
                  {step === 3 && "List passengers and upload any attachments."}
                  {step === 4 && "Double-check everything before submitting."}
                </p>
              </div>

              {/* ── STEP 1 ── */}
              {step === 1 && (
                <div>
                  <Field label="Email">
                    <input className={inputCls(errors.email)} placeholder="your@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </Field>
                  <Field label="Full Name" required error={errors.name}>
                    <input className={inputCls(errors.name)} placeholder="Juan dela Cruz" value={form.name} onChange={(e) => set("name", e.target.value)} />
                  </Field>
                  <Field label="Department / Office" required error={errors.department}>
                    <input className={inputCls(errors.department)} placeholder="e.g. ICT Department" value={form.department} onChange={(e) => set("department", e.target.value)} />
                  </Field>
                  <Field label="Immediate Head" required error={errors.immediateHead}>
                    <input className={inputCls(errors.immediateHead)} placeholder="Name of your direct supervisor" value={form.immediateHead} onChange={(e) => set("immediateHead", e.target.value)} />
                  </Field>
                  <Field label="Mobile Number" required error={errors.mobile} hint="Requester's contact">
                    <input className={inputCls(errors.mobile)} placeholder="09xx-xxx-xxxx" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
                  </Field>
                </div>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <div>
                  <Field label="Date of Travel" required error={errors.dateOfTravel}>
                    <input type="date" className={inputCls(errors.dateOfTravel)} value={form.dateOfTravel} onChange={(e) => set("dateOfTravel", e.target.value)} />
                  </Field>
                  <Field label="Travel Destination" required error={errors.destination}>
                    <input className={inputCls(errors.destination)} placeholder="e.g. Manila, NCR" value={form.destination} onChange={(e) => set("destination", e.target.value)} />
                  </Field>
                  <Field label="Purpose of Travel" required error={errors.purpose}>
                    <textarea rows={3} className={inputCls(errors.purpose) + " resize-none"} placeholder="Describe the purpose of your trip…" value={form.purpose} onChange={(e) => set("purpose", e.target.value)} />
                  </Field>
                  <Field label="Waiting Area" required error={errors.waitingArea} hint="Where will passengers board?">
                    <input className={inputCls(errors.waitingArea)} placeholder="e.g. Main Gate / Admin Building" value={form.waitingArea} onChange={(e) => set("waitingArea", e.target.value)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Time of Departure" required error={errors.departureTime}>
                      <input type="time" className={inputCls(errors.departureTime)} value={form.departureTime} onChange={(e) => set("departureTime", e.target.value)} />
                    </Field>
                    <Field label="Expected Return" required error={errors.expectedReturn}>
                      <input type="time" className={inputCls(errors.expectedReturn)} value={form.expectedReturn} onChange={(e) => set("expectedReturn", e.target.value)} />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── STEP 3 ── */}
              {step === 3 && (
                <div>
                  <Field label="Number of Passengers" required error={errors.numPassengers}>
                    <input type="number" min="1" className={inputCls(errors.numPassengers)} placeholder="e.g. 4" value={form.numPassengers} onChange={(e) => set("numPassengers", e.target.value)} />
                  </Field>
                  <Field label="Passenger Names" required error={errors.passengerNames} hint="One per line">
                    <textarea rows={4} className={inputCls(errors.passengerNames) + " resize-none"} placeholder={"1. Juan dela Cruz\n2. Maria Santos\n3. Pedro Reyes"} value={form.passengerNames} onChange={(e) => set("passengerNames", e.target.value)} />
                  </Field>
                  <Field label="Attachments" hint="Optional · Max 10 MB each">
                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-200 text-slate-400 text-xs group">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                        <svg className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <span className="font-medium text-slate-500 group-hover:text-emerald-600 transition-colors">Click to upload files</span>
                      <span>Up to 10 files accepted</span>
                      <input type="file" multiple accept="*/*" className="hidden" onChange={(e) => set("attachments", Array.from(e.target.files))} />
                    </label>
                    {form.attachments.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {form.attachments.map((f, i) => (
                          <li key={i} className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 rounded-lg px-3 py-2">
                            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            {f.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Field>
                  <Field label="Project Based Travel?" required error={errors.projectBased}>
                    <div className="flex gap-3">
                      {["Yes", "No"].map((opt) => (
                        <button key={opt} type="button" onClick={() => set("projectBased", opt)} className={chipBtn(form.projectBased === opt) + " flex-1"}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </Field>
                  {form.projectBased === "Yes" && (
                    <Field label="Funding Type">
                      <div className="flex gap-3 flex-wrap">
                        {["Externally Funded", "Internally Funded"].map((opt) => (
                          <button key={opt} type="button" onClick={() => set("fundingType", opt)} className={chipBtn(form.fundingType === opt) + " flex-1"}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </Field>
                  )}
                </div>
              )}

              {/* ── STEP 4 ── */}
              {step === 4 && (
                <div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3 text-sm text-amber-800">
                    <span className="text-base leading-none shrink-0">⏳</span>
                    <span>Your request will be <strong>pending admin approval</strong>. Once approved, your trip will be automatically added to the calendar.</span>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-xl p-5 mb-5 divide-y divide-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-3">Request Summary</p>
                    {[
                      ["Name", form.name], ["Email", form.email], ["Department", form.department],
                      ["Immediate Head", form.immediateHead], ["Mobile", form.mobile],
                      ["Date of Travel", form.dateOfTravel], ["Destination", form.destination],
                      ["Waiting Area", form.waitingArea], ["Departure", form.departureTime],
                      ["Return", form.expectedReturn], ["Passengers", form.numPassengers],
                      ["Project Based", form.projectBased],
                      form.projectBased === "Yes" && ["Funding", form.fundingType],
                    ].filter(Boolean).map(([label, val]) => (
                      <div key={label} className="flex justify-between gap-4 py-2.5">
                        <span className="text-xs text-slate-400 shrink-0">{label}</span>
                        <span className="text-xs font-semibold text-slate-700 text-right">{val || "—"}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-emerald-50 rounded-xl p-4 mb-5 space-y-2 text-xs text-emerald-700">
                    <p>📋 <a href="https://docs.google.com/forms/d/e/1FAIpQLSct44Weo1ea8Zj0m7gxb-ByQ6YWoah8FCS9t7Rk6Ey4nodhXg/viewform" target="_blank" rel="noreferrer" className="underline font-semibold">DNSC Client Satisfaction Measurement Survey</a></p>
                    <p>🔗 <a href="https://docs.google.com/spreadsheets/d/1oWoyC43lvf3cwr46_aylenjpj6X1WYpkxhV7I5DG-Dw/edit?usp=sharing" target="_blank" rel="noreferrer" className="underline font-semibold">Check Status of Vehicle Request</a></p>
                  </div>

                  <div className={`rounded-xl border p-4 ${errors.acknowledgement ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
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
                    {errors.acknowledgement && <p className="text-rose-400 text-xs mt-2 ml-7">{errors.acknowledgement}</p>}
                  </div>
                </div>
              )}

              {/* ── NEXT / SUBMIT ── */}
              <div className="mt-8 flex justify-start">
                {step < STEPS.length ? (
                  <button
                    onClick={next}
                    className="px-8 py-3 rounded-full text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-200"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
                )}
              </div>

            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-100 py-4 px-8 shrink-0">
            <p className="text-[11px] text-slate-300">DNSC Motorpool System · For concerns, contact the Motorpool Office</p>
          </footer>
        </div>
      </div>

      {showTrack && <TrackModal onClose={() => setShowTrack(false)} />}
    </div>
  );
}