import { useState } from "react";

const STEPS = ["Requester Info", "Travel Details", "Passengers & Files", "Confirmation"];

const initialForm = {
  email: "",
  name: "",
  department: "",
  immediateHead: "",
  mobile: "",
  dateOfTravel: "",
  destination: "",
  purpose: "",
  waitingArea: "",
  departureTime: "",
  expectedReturn: "",
  numPassengers: "",
  passengerNames: "",
  projectBased: "",
  fundingType: "",
  acknowledgement: false,
  attachments: [],
};

// ── Defined OUTSIDE the modal so React never recreates them ──

const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-300 text-slate-700 bg-slate-50 placeholder-slate-400 transition ${
    err ? "border-red-300 bg-red-50" : "border-slate-200"
  }`;

const Field = ({ label, required, error, children }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────

export default function SendRequestModal({ onClose, onSubmitted }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

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
      onSubmitted && onSubmitted();
    } catch {
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (step / STEPS.length) * 100;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Request Submitted!</h2>
          <p className="text-sm text-slate-500 mb-4">Your vehicle request has been received and is pending approval.</p>
          <div className="bg-slate-50 rounded-xl p-4 text-left mb-5 space-y-2 text-xs text-slate-500">
            <p>📋 <a href="https://docs.google.com/forms/d/e/1FAIpQLSct44Weo1ea8Zj0m7gxb-ByQ6YWoah8FCS9t7Rk6Ey4nodhXg/viewform" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">DNSC Client Satisfaction Measurement Survey</a></p>
            <p>🔗 <a href="https://docs.google.com/spreadsheets/d/1oWoyC43lvf3cwr46_aylenjpj6X1WYpkxhV7I5DG-Dw/edit?usp=sharing" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-medium">Check Status of Vehicle Request</a></p>
          </div>
          <button onClick={onClose} className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-500 text-emerald-900 font-semibold text-sm rounded-xl transition">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Step {step} of {STEPS.length}
            </span>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">{STEPS[step - 1]}</h2>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">

          {/* Step 1 */}
          {step === 1 && (
            <>
              <Field label="Email" required>
                <input className={inputCls(errors.email)} placeholder="Your email address" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Name" required error={errors.name}>
                <input className={inputCls(errors.name)} placeholder="Your full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="Department / Office" required error={errors.department}>
                <input className={inputCls(errors.department)} placeholder="e.g. ICT Department" value={form.department} onChange={(e) => set("department", e.target.value)} />
              </Field>
              <Field label="Immediate Head" required error={errors.immediateHead}>
                <input className={inputCls(errors.immediateHead)} placeholder="Name of your immediate supervisor" value={form.immediateHead} onChange={(e) => set("immediateHead", e.target.value)} />
              </Field>
              <Field label="Mobile Number (Requester)" required error={errors.mobile}>
                <input className={inputCls(errors.mobile)} placeholder="e.g. 09xx-xxx-xxxx" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
              </Field>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <Field label="Date of Travel" required error={errors.dateOfTravel}>
                <input type="date" className={inputCls(errors.dateOfTravel)} value={form.dateOfTravel} onChange={(e) => set("dateOfTravel", e.target.value)} />
              </Field>
              <Field label="Travel Destination" required error={errors.destination}>
                <input className={inputCls(errors.destination)} placeholder="e.g. Manila, NCR" value={form.destination} onChange={(e) => set("destination", e.target.value)} />
              </Field>
              <Field label="Purpose of Travel" required error={errors.purpose}>
                <textarea rows={3} className={inputCls(errors.purpose) + " resize-none"} placeholder="Describe the purpose…" value={form.purpose} onChange={(e) => set("purpose", e.target.value)} />
              </Field>
              <Field label="Waiting Area" required error={errors.waitingArea}>
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
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <Field label="Number of Passengers" required error={errors.numPassengers}>
                <input type="number" min="1" className={inputCls(errors.numPassengers)} placeholder="e.g. 4" value={form.numPassengers} onChange={(e) => set("numPassengers", e.target.value)} />
              </Field>
              <Field label="Name of Passengers" required error={errors.passengerNames}>
                <textarea rows={4} className={inputCls(errors.passengerNames) + " resize-none"} placeholder="List all passengers, one per line" value={form.passengerNames} onChange={(e) => set("passengerNames", e.target.value)} />
              </Field>
              <Field label="Attachments (If any)">
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-5 cursor-pointer hover:bg-slate-50 transition text-slate-400 text-xs">
                  <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Upload up to 10 files · Max 10 MB each</span>
                  <input type="file" multiple accept="*/*" className="hidden" onChange={(e) => set("attachments", Array.from(e.target.files))} />
                </label>
                {form.attachments.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {form.attachments.map((f, i) => (
                      <li key={i} className="text-xs text-slate-500 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {f.name}
                      </li>
                    ))}
                  </ul>
                )}
              </Field>
              <Field label="Project Based Travel" required error={errors.projectBased}>
                <div className="flex gap-3">
                  {["Yes", "No"].map((opt) => (
                    <button key={opt} type="button" onClick={() => set("projectBased", opt)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition ${form.projectBased === opt ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </Field>
              {form.projectBased === "Yes" && (
                <Field label="If yes, is it:">
                  <div className="flex gap-3">
                    {["Externally Funded", "Internally Funded"].map((opt) => (
                      <button key={opt} type="button" onClick={() => set("fundingType", opt)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition ${form.fundingType === opt ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
            </>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <>
              <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2">
                {[
                  ["Email", form.email],
                  ["Name", form.name],
                  ["Department", form.department],
                  ["Immediate Head", form.immediateHead],
                  ["Mobile", form.mobile],
                  ["Date of Travel", form.dateOfTravel],
                  ["Destination", form.destination],
                  ["Waiting Area", form.waitingArea],
                  ["Departure", form.departureTime],
                  ["Return", form.expectedReturn],
                  ["Passengers", form.numPassengers],
                  ["Project Based", form.projectBased],
                  form.projectBased === "Yes" && ["Funding", form.fundingType],
                ].filter(Boolean).map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-slate-400 text-xs shrink-0">{label}</span>
                    <span className="text-slate-700 text-xs font-medium text-right">{val || "—"}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-5 space-y-2 text-xs text-blue-700">
                <p>📋 <a href="https://docs.google.com/forms/d/e/1FAIpQLSct44Weo1ea8Zj0m7gxb-ByQ6YWoah8FCS9t7Rk6Ey4nodhXg/viewform" target="_blank" rel="noreferrer" className="underline font-semibold">DNSC Client Satisfaction Measurement Survey</a></p>
                <p>🔗 <a href="https://docs.google.com/spreadsheets/d/1oWoyC43lvf3cwr46_aylenjpj6X1WYpkxhV7I5DG-Dw/edit?usp=sharing" target="_blank" rel="noreferrer" className="underline font-semibold">Status of Vehicle Request</a></p>
              </div>

              <div className={`rounded-xl border p-4 ${errors.acknowledgement ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 w-4 h-4 accent-emerald-500 shrink-0"
                    checked={form.acknowledgement}
                    onChange={(e) => set("acknowledgement", e.target.checked)} />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-700">Acknowledgement *</span><br />
                    I certify that the information provided is accurate and I understand that vehicle availability is subject to approval.
                  </span>
                </label>
                {errors.acknowledgement && <p className="text-red-500 text-xs mt-2 ml-7">{errors.acknowledgement}</p>}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center shrink-0">
          {step > 1 ? (
            <button onClick={back} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : <div />}

          {step < STEPS.length ? (
            <button onClick={next} className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-400 hover:bg-emerald-500 text-emerald-900 transition">
              Next
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-emerald-400 hover:bg-emerald-500 text-emerald-900 transition disabled:opacity-60 disabled:cursor-not-allowed">
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
    </div>
  );
}