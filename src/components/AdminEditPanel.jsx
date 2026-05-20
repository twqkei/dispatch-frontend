/**
 * AdminEditPanel
 * Renders the admin-only controls for updating status, assigning a vehicle
 * and driver, and adding remarks.
 *
 * @param {object}   draft    - Current draft state from the parent modal
 * @param {Function} setDraft - State setter from the parent modal
 */
export default function AdminEditPanel({ draft, setDraft }) {
  const set = (key) => (e) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
        Admin controls
      </p>

      <div className="grid grid-cols-2 gap-3">
        {/* Status */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
            Status
          </p>
          <select
            value={(draft.status || "pending").toLowerCase()}
            onChange={set("status")}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="disapproved">Disapproved</option>
          </select>
        </div>

        {/* Vehicle */}
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
            Vehicle
          </p>
          <input
            type="text"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="e.g. Toyota Hi-Ace"
            value={draft.vehicle || ""}
            onChange={set("vehicle")}
          />
        </div>

        {/* Driver */}
        <div className="col-span-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
            Driver
          </p>
          <input
            type="text"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Driver name"
            value={draft.driver || ""}
            onChange={set("driver")}
          />
        </div>

        {/* Remarks */}
        <div className="col-span-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
            Remarks
          </p>
          <textarea
            rows={3}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            placeholder="Approval notes, instructions…"
            value={draft.adminRemarks || ""}
            onChange={set("adminRemarks")}
          />
        </div>
      </div>
    </div>
  );
}