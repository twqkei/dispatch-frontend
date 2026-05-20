import { Link } from "react-router-dom";

/**
 * SuccessScreen
 * Full-page confirmation shown after a request is successfully submitted.
 *
 * @param {Function} onReset - Called when "Submit Another Request" is clicked
 */
export default function SuccessScreen({ onReset }) {
  return (
    <div className="flex-1 flex items-center justify-center p-10">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-md p-10 text-center">
        {/* Checkmark icon */}
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-8 h-8 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted!</h2>
        <p className="text-sm text-slate-500 mb-1">
          Your request is{" "}
          <span className="font-semibold text-amber-600">pending admin approval</span>.
        </p>
        <p className="text-xs text-slate-400 mb-6">
          Once approved, your trip will be automatically added to the schedule.
        </p>

        {/* Quick links */}
        <div className="bg-slate-50 rounded-xl p-4 text-left mb-5 space-y-2.5 text-xs text-slate-500">
          <p>
            📋{" "}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSct44Weo1ea8Zj0m7gxb-ByQ6YWoah8FCS9t7Rk6Ey4nodhXg/viewform"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 underline font-medium"
            >
              DNSC Client Satisfaction Measurement Survey
            </a>
          </p>
          <p>
            🔗{" "}
            <Link to="/status" className="text-emerald-600 underline font-medium">
              Check Status of Vehicle Request
            </Link>
          </p>
        </div>

        <button
          onClick={onReset}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-emerald-200"
        >
          Submit Another Request
        </button>
      </div>
    </div>
  );
}