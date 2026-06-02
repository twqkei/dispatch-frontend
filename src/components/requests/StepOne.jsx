import { Field, TripDurationBadge, inputCls } from "../ui/FormHelpers";
import DepartmentInput from "../ui/DepartmentInput";

/**
 * StepOne
 * Renders the "Requester & Travel Details" form (Step 1).
 *
 * @param {object}   form    - Current form state from RequestPage
 * @param {object}   errors  - Validation error map from RequestPage
 * @param {Function} set     - (key, value) setter from RequestPage
 * @param {Function} onNext  - Called when the Continue button is clicked
 */
export default function StepOne({ form, errors, set, onNext }) {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Heading */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-1">
          Step 1 of 2
        </p>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Request & Travel Information
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Fill in your details and where you're headed.
        </p>
      </div>

      {/* ── Data Privacy Statement ── */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-blue-800 mb-1">Data Privacy Statement</h3>
            <p className="text-xs text-blue-700 leading-relaxed mb-3">
              By accomplishing this Vehicle Requisitioning Form, you acknowledge and consent to the collection and processing of your personal information by the Motor Pool Services Unit solely for the purpose of evaluating, approving, and documenting vehicle requests.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  ),
                  title: "Purpose of Collection",
                  desc: "Information will be used strictly for administrative and operational requirements related to vehicle requisitioning.",
                },
                {
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ),
                  title: "Data Protection",
                  desc: "All personal data shall be stored securely and accessed only by authorized personnel.",
                },
                {
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ),
                  title: "Non-Disclosure",
                  desc: "Your information will not be shared with third parties without your consent, except as required by law.",
                },
                {
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  title: "Retention Period",
                  desc: "Records will be retained only for as long as necessary to fulfill the stated purposes and comply with institutional policies.",
                },
                {
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ),
                  title: "Rights of the Data Subject",
                  desc: "You have the right to access, correct, and request deletion of your personal data, as well as to withdraw consent at any time, subject to applicable laws.",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-2 bg-white/60 rounded-xl px-3 py-2.5 border border-blue-100">
                  <span className="text-blue-500 mt-0.5 shrink-0">{icon}</span>
                  <div>
                    <p className="text-[11px] font-semibold text-blue-800 mb-0.5">{title}</p>
                    <p className="text-[11px] text-blue-600 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: Requester Info ── */}
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
            <input
              className={inputCls(errors.email)}
              placeholder="your@gmail.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>

          <Field label="Full Name" required error={errors.name}>
            <input
              className={inputCls(errors.name)}
              placeholder="Juan dela Cruz"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>

          <Field label="Department / Office" required error={errors.department}>
            <DepartmentInput
              value={form.department}
              onChange={(val) => set("department", val)}
              error={errors.department}
            />
          </Field>

          <Field label="Immediate Head" required error={errors.immediateHead}>
            <input
              className={inputCls(errors.immediateHead)}
              placeholder="Name of your direct supervisor"
              value={form.immediateHead}
              onChange={(e) => set("immediateHead", e.target.value)}
            />
          </Field>

          <Field label="Mobile Number" required error={errors.mobile} hint="11 digits · e.g. 09171234567">
            <input
              className={inputCls(errors.mobile)}
              placeholder="09171234567"
              maxLength={13}
              value={form.mobile}
              onChange={(e) => set("mobile", e.target.value)}
            />
          </Field>
        </div>

        {/* ── Right: Travel Details ── */}
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
              <input
                className={inputCls(errors.waitingArea)}
                placeholder="e.g. Main Gate"
                value={form.waitingArea}
                onChange={(e) => set("waitingArea", e.target.value)}
              />
            </Field>
            <Field label="Travel Destination" required error={errors.destination}>
              <input
                className={inputCls(errors.destination)}
                placeholder="e.g. Manila, NCR"
                value={form.destination}
                onChange={(e) => set("destination", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Purpose of Travel" required error={errors.purpose}>
            <textarea
              rows={3}
              className={inputCls(errors.purpose) + " resize-none"}
              placeholder="Describe the purpose of your trip…"
              value={form.purpose}
              onChange={(e) => set("purpose", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Departure Time" required error={errors.departureTime}>
              <input
                type="time"
                className={inputCls(errors.departureTime)}
                value={form.departureTime}
                onChange={(e) => set("departureTime", e.target.value)}
              />
            </Field>
            <Field label="Expected Return Time" required error={errors.expectedReturn}>
              <input
                type="time"
                className={inputCls(errors.expectedReturn)}
                value={form.expectedReturn}
                onChange={(e) => set("expectedReturn", e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-200"
        >
          Continue
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}