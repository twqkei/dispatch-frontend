/**
 * Visual configuration for each request status.
 * dot     – Tailwind class for the colored indicator dot
 * badge   – Tailwind classes for the status badge pill
 * label   – Human-readable display label
 */
export const STATUS_CFG = {
  approved: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Approved",
  },
  pending: {
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Pending",
  },
  disapproved: {
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Disapproved",
  },
  rejected: {
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Rejected",
  },
  cancelled: {
    dot: "bg-slate-300",
    badge: "bg-slate-100 text-slate-500 border-slate-200",
    label: "Cancelled",
  },
};