import { Field, TripDurationBadge, DangerAlert, inputCls, chipBtn } from "../ui/FormHelpers";
import { countPassengerNames } from "../../utils/validators";

/**
 * StepTwo
 * Renders the "Passengers & Confirmation" form (Step 2).
 *
 * @param {object}   form        - Current form state from RequestPage
 * @param {object}   errors      - Validation error map from RequestPage
 * @param {Function} set         - (key, value) setter from RequestPage
 * @param {Function} onSubmit    - Called when the Submit button is clicked
 * @param {boolean}  submitting  - Disables submit button when true
 */
export default function StepTwo({ form, errors, set, onSubmit, submitting }) {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Heading */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-1">
          Step 2 of 2
        </p>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Passengers & Confirmation
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          List who's coming and review your request before submitting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: Passengers ── */}
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
                <button
                  key={opt}
                  type="button"
                  onClick={() => set("projectBased", opt)}
                  className={chipBtn(form.projectBased === opt) + " flex-1"}
                >
                  {opt}
                </button>
              ))}
            </div>
          </Field>

          {form.projectBased === "Yes" && (
            <Field label="Funding Type">
              <div className="flex gap-3 flex-wrap">
                {["Externally Funded", "Internally Funded"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set("fundingType", opt)}
                    className={chipBtn(form.fundingType === opt) + " flex-1"}
                  >
                    {opt}
                  </button>
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
              If you have supporting documents (authorization letters, itineraries, etc.), please
              upload them to our shared folder and include your name and travel date in the filename
              so we can match them to your request.{" "}
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

        {/* ── Right: Review + Acknowledge ── */}
        <div className="flex flex-col gap-5">

          {/* Summary card */}
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
                  <span className="text-xs font-semibold text-slate-700 text-right truncate max-w-[180px]">
                    {val || "—"}
                  </span>
                </div>
              ))}
            </div>

            {form.dateOfTravel && form.dateReturned && (
              <div className="pt-3 mt-1 border-t border-slate-50">
                <TripDurationBadge from={form.dateOfTravel} to={form.dateReturned} />
              </div>
            )}
          </div>

          {/* Pending notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
            <span className="text-base leading-none shrink-0">⏳</span>
            <span>
              Your request will be{" "}
              <strong>pending admin approval</strong>. Once approved, your trip will be
              automatically added to the calendar.
            </span>
          </div>

          {/* Acknowledgement */}
          <div
            className={`rounded-xl border p-4 ${
              errors.acknowledgement
                ? "border-rose-300 bg-rose-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 accent-emerald-500 shrink-0"
                checked={form.acknowledgement}
                onChange={(e) => set("acknowledgement", e.target.checked)}
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-700">Acknowledgement *</span>
                <br />
                I certify that the information provided is accurate and I understand that vehicle
                availability is subject to approval.
              </span>
            </label>
            {errors.acknowledgement && (
              <div className="mt-2 ml-7">
                <DangerAlert message={errors.acknowledgement} />
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            onClick={onSubmit}
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
  );
}