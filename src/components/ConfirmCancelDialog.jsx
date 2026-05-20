/**
 * ConfirmCancelDialog
 * Overlaid confirmation prompt asking the user to confirm request cancellation.
 *
 * @param {Function} onConfirm  - Called when the user confirms cancellation
 * @param {Function} onDismiss  - Called when the user clicks "Keep it"
 * @param {boolean}  loading    - When true, disables buttons and shows loading text
 */
export default function ConfirmCancelDialog({ onConfirm, onDismiss, loading }) {
  return (
    <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-6 rounded-2xl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-5 flex flex-col gap-4">
        {/* Warning icon */}
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        {/* Copy */}
        <div className="text-center">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">
            Cancel this request?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            This cannot be undone. The request will be marked as cancelled.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            disabled={loading}
            className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-60"
          >
            {loading ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}