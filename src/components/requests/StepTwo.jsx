import { Field, TripDurationBadge, DangerAlert, inputCls, chipBtn } from "../ui/FormHelpers";
import { countPassengerNames } from "../../utils/validators";

export default function StepTwo({ form, errors, set, onSubmit, submitting }) {

  const formatPHT = (timeStr) => {
    if (!timeStr) return "—";
    try {
      const [hours, minutes] = timeStr.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0);
      return date.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Manila",
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-1">
          Step 2 of 2
        </p>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Passengers &amp; Confirmation
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

          {/* ── Google Drive attachment input ── */}
          <Field
            label="Supporting Documents"
            hint="Paste your Google Drive file or folder link"
            error={errors.attachmentLink}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 87.3 78" fill="currentColor">
                  <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                  <path d="M43.65 25L29.9 1.2C28.55.4 27 0 25.45 0c-1.55 0-3.1.4-4.5 1.2L6.6 25z" fill="#00ac47"/>
                  <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.65 10.35z" fill="#ea4335"/>
                  <path d="M43.65 25L57.4 1.2C56 .4 54.45 0 52.9 0H34.4c-1.55 0-3.1.4-4.5 1.2z" fill="#00832d"/>
                  <path d="M59.8 53H27.5L13.75 76.8c1.4.8 2.95 1.2 4.5 1.2h50.8c1.55 0 3.1-.4 4.5-1.2z" fill="#2684fc"/>
                  <path d="M73.4 26.5l-13.75-23.8c-1.35-.8-2.9-1.2-4.45-1.2h-.35L43.65 25l16.15 28H87.3c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                </svg>
              </div>
              <input
                type="url"
                className={inputCls(errors.attachmentLink) + " pl-9"}
                placeholder="https://drive.google.com/..."
                value={form.attachmentLink || ""}
                onChange={(e) => set("attachmentLink", e.target.value)}
              />
            </div>
          </Field>
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
                ["Departure",      formatPHT(form.departureTime)],
                ["Return Time",    formatPHT(form.expectedReturn)],
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
                {"I certify that the information provided is accurate and I understand that vehicle availability is subject to approval."}
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
                {"Submitting…"}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {"Submit Request"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}