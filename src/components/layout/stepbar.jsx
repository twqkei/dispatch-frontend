const STEPS = ["Requester & Travel Details", "Passengers & Confirmation"];

/**
 * StepBar
 * Progress bar + step labels shown between the Topbar and the form body.
 *
 * @param {number}   step - Current step number (1-based)
 * @param {Function} back - Called when the user clicks "go back"
 */
export default function StepBar({ step, back }) {
  return (
    <div className="bg-white border-b border-slate-100 px-6 md:px-10 py-3 flex items-center gap-4 shrink-0">
      {/* Back button / spacer */}
      <div className="flex items-center gap-3 shrink-0">
        {step > 1 ? (
          <button
            onClick={back}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            go back
          </button>
        ) : (
          <div className="w-6" />
        )}
        <span className="text-xs text-slate-400 font-medium">
          Step {step} of {STEPS.length}
        </span>
      </div>

      {/* Progress track */}
      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: step === 1 ? "50%" : "100%" }}
        />
      </div>

      {/* Step pills (hidden on mobile) */}
      <div className="hidden sm:flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                i + 1 === step
                  ? "bg-emerald-500 text-white"
                  : i + 1 < step
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {i + 1 < step ? (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
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