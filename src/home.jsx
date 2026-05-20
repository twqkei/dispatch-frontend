import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "./api";

/* ─── date utils ─── */
function startOfDay(date) { const d = new Date(date); d.setHours(0,0,0,0); return d; }
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function sameDay(a,b) {
  return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
}
function addDays(date,n) { const d=new Date(date); d.setDate(d.getDate()+n); return d; }
function getWeekStart(date) { const d=new Date(date); d.setDate(d.getDate()-d.getDay()); return startOfDay(d); }
function parseHour(t) { if(!t) return null; const [h,m]=t.split(":").map(Number); return h+(m||0)/60; }
function fmt12(t) {
  if(!t) return "—";
  const [h,m]=t.split(":").map(Number);
  return `${h%12||12}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"}`;
}
function fmtDate(s) {
  if(!s) return "—";
  return new Date(s+"T00:00:00").toLocaleDateString([],{month:"short",day:"numeric",year:"numeric"});
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_DAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
const HOURS = Array.from({length:24},(_,i)=>i);
const HOUR_HEIGHT = 56;
const DEFAULT_DURATION = 1.5;

/* ─── layout ─── */
function layoutDayTrips(dayTrips) {
  const items = dayTrips.map((t) => {
    const startH = parseHour(t.time_of_travel);
    const top = startH !== null ? startH * HOUR_HEIGHT : 0;
    const height = Math.max(DEFAULT_DURATION * HOUR_HEIGHT, 44);
    return { t, top, bottom: top+height, height, col:0, totalCols:1 };
  });
  items.sort((a,b)=>a.top-b.top);
  const colBottoms=[];
  for(const item of items){
    let placed=false;
    for(let c=0;c<colBottoms.length;c++){
      if(item.top>=colBottoms[c]){ item.col=c; colBottoms[c]=item.bottom; placed=true; break; }
    }
    if(!placed){ item.col=colBottoms.length; colBottoms.push(item.bottom); }
  }
  for(const item of items){
    let maxCol=item.col;
    for(const other of items){
      if(other===item) continue;
      if(item.top<other.bottom && item.bottom>other.top && other.col>maxCol) maxCol=other.col;
    }
    item.totalCols=maxCol+1;
  }
  return items;
}

/* ─── Status config ─── */
const TRIP_STATUS = {
  UPCOMING:  { bg:"#dbeafe", text:"#1e40af", dot:"#3b82f6",  label:"Upcoming"  },
  ONGOING:   { bg:"#fef3c7", text:"#92400e", dot:"#f59e0b",  label:"Ongoing"   },
  COMPLETED: { bg:"#d1fae5", text:"#065f46", dot:"#10b981",  label:"Completed" },
  CANCELLED: { bg:"#f1f5f9", text:"#475569", dot:"#94a3b8",  label:"Cancelled" },
};
const REQ_STATUS = {
  PENDING:     { bg:"#fef3c7", text:"#78350f", dot:"#f59e0b", label:"Pending"     },
  APPROVED:    { bg:"#d1fae5", text:"#065f46", dot:"#10b981", label:"Approved"    },
  DISAPPROVED: { bg:"#fee2e2", text:"#991b1b", dot:"#ef4444", label:"Disapproved" },
};

/* ─── Trip detail modal ─── */
function TripModal({ trip, onClose, onCancel, saving }) {
  const sc = TRIP_STATUS[trip.status] || TRIP_STATUS.UPCOMING;
  const canCancel = trip.status !== "CANCELLED" && trip.status !== "COMPLETED";
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background:"rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e=>e.stopPropagation()}
      >
        <div className="h-2 w-full" style={{ background:sc.dot }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-lg font-bold text-slate-800 leading-tight">{trip.requester || "—"}</p>
              {trip.department && <p className="text-sm text-slate-400 mt-0.5">{trip.department}</p>}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-5"
            style={{ background:sc.bg, color:sc.text }}>
            <span className="w-2 h-2 rounded-full" style={{ background:sc.dot }} />
            {sc.label}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            {[
              { icon:"M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label:"Date", value:fmtDate(trip.date_of_trip) },
              { icon:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", label:"Departure", value:fmt12(trip.time_of_travel) },
              { icon:"M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z", label:"Destination", value:trip.destination || "—" },
              { icon:"M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", label:"Passengers", value:trip.passengers ?? "—" },
              { icon:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", label:"Driver", value:trip.driver_name || "—" },
              { icon:"M8 17H6a2 2 0 01-2-2V9a2 2 0 012-2h1m8 10h2a2 2 0 002-2V9a2 2 0 00-2-2h-1M8 17v1a1 1 0 001 1h6a1 1 0 001-1v-1M8 7V5a1 1 0 011-1h6a1 1 0 011 1v2M8 7h8", label:"Vehicle", value:trip.vehicle_name || "—" },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-2">
                <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon}/>
                </svg>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
                  <p className="text-sm text-slate-700 font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>
          {trip.remarks && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Remarks</p>
              <p className="text-sm text-slate-600 leading-relaxed">{trip.remarks}</p>
            </div>
          )}
          {canCancel && (
            <button
              disabled={saving}
              onClick={() => onCancel(trip.id)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              {saving ? "Cancelling…" : "Cancel Trip"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Request detail modal ─── */
function RequestModal({ req, onClose, onApprove, onDisapprove, saving }) {
  const sc = REQ_STATUS[req.status] || REQ_STATUS.PENDING;
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background:"rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e=>e.stopPropagation()}
      >
        <div className="h-2 w-full" style={{ background:sc.dot }} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-lg font-bold text-slate-800">{req.name || "—"}</p>
              {req.department && <p className="text-sm text-slate-400 mt-0.5">{req.department}</p>}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-5"
            style={{ background:sc.bg, color:sc.text }}>
            <span className="w-2 h-2 rounded-full" style={{ background:sc.dot }} />
            {sc.label}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            {[
              { label:"Travel Date",    value:fmtDate(req.date_of_travel) },
              { label:"Departure",      value:fmt12(req.time_of_departure) },
              { label:"Destination",    value:req.destination || "—" },
              { label:"Passengers",     value:req.passengers ?? "—" },
              { label:"Immediate Head", value:req.immediate_head || "—" },
              { label:"Mobile",         value:req.mobile || "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-sm text-slate-700 font-medium">{value}</p>
              </div>
            ))}
          </div>
          {req.purpose && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Purpose</p>
              <p className="text-sm text-slate-600 leading-relaxed">{req.purpose}</p>
            </div>
          )}
          {req.status === "PENDING" && (
            <div className="flex gap-3">
              <button
                disabled={saving}
                onClick={() => onDisapprove(req.id)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-50"
              >
                Disapprove
              </button>
              <button
                disabled={saving}
                onClick={() => onApprove(req.id)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Approve"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Now line ─── */
function NowLine() {
  const now = new Date();
  const top = (now.getHours()+now.getMinutes()/60)*HOUR_HEIGHT;
  return (
    <div className="absolute left-0 right-0 z-20 flex items-center pointer-events-none" style={{ top }}>
      <div className="w-2 h-2 rounded-full bg-blue-500 -ml-1 shrink-0"/>
      <div className="flex-1 h-[1.5px] bg-blue-500 opacity-70"/>
    </div>
  );
}

/* ─── Trip block on calendar ─── */
function TripBlock({ trip, onClick }) {
  const sc = TRIP_STATUS[trip.status] || TRIP_STATUS.UPCOMING;
  return (
    <div
      onClick={e=>{ e.stopPropagation(); onClick(trip); }}
      className="h-full rounded-lg px-2 py-1.5 cursor-pointer hover:brightness-95 transition-all select-none overflow-hidden flex flex-col"
      style={{
        background: sc.bg,
        border: `1px solid ${sc.dot}33`,
        borderLeftWidth: "3px",
        borderLeftColor: sc.dot,
        opacity: trip.status === "CANCELLED" ? 0.6 : 1,
      }}
    >
      <p className="text-[11px] font-bold leading-tight truncate" style={{ color:sc.text }}>{trip.requester || "—"}</p>
      {trip.destination && (
        <p className="text-[10px] leading-tight truncate mt-0.5 opacity-80" style={{ color:sc.text }}>{trip.destination}</p>
      )}
      {trip.vehicle_name && (
        <p className="text-[10px] leading-tight truncate mt-0.5 opacity-70 font-medium" style={{ color:sc.text }}>
          🚐 {trip.vehicle_name}
        </p>
      )}
      {trip.time_of_travel && (
        <p className="text-[9px] leading-tight mt-auto opacity-60" style={{ color:sc.text }}>{trip.time_of_travel.slice(0,5)}</p>
      )}
    </div>
  );
}

/* ─── Week calendar ─── */
function WeekGrid({ weekStart, trips, today, onDayClick, onTripClick, showCancelled }) {
  const scrollRef = useRef(null);
  useEffect(() => { if(scrollRef.current) scrollRef.current.scrollTop=7*HOUR_HEIGHT; },[]);

  const weekDays = useMemo(()=>Array.from({length:7},(_,i)=>addDays(weekStart,i)),[weekStart]);

  // Filter out cancelled unless showCancelled is true
  const visibleTrips = useMemo(()=>
    showCancelled ? trips : trips.filter(t=>t.status!=="CANCELLED"),
  [trips, showCancelled]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Day headers */}
      <div className="flex shrink-0 border-b border-slate-100">
        <div className="w-14 shrink-0 border-r border-slate-100"/>
        {weekDays.map(day=>{
          const isToday=sameDay(day,today);
          const iso=toISO(day);
          const count=visibleTrips.filter(t=>t.date_of_trip===iso).length;
          return (
            <div key={iso} className="flex-1 flex flex-col items-center py-2 border-r border-slate-100 cursor-pointer group" onClick={()=>onDayClick(day)}>
              <span className={`text-[9px] font-bold uppercase tracking-widest ${isToday?"text-blue-500":"text-slate-400"}`}>
                {SHORT_DAYS[day.getDay()]}
              </span>
              <div className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                isToday ? "bg-blue-600 text-white" : "text-slate-600 group-hover:bg-slate-100"
              }`}>{day.getDate()}</div>
              {count>0 && <span className="mt-0.5 text-[9px] font-semibold text-blue-500">{count}</span>}
            </div>
          );
        })}
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="flex relative" style={{ height:HOUR_HEIGHT*24 }}>
          <div className="w-14 shrink-0 border-r border-slate-100 relative">
            {HOURS.map(h=>(
              <div key={h} className="absolute right-2 -translate-y-1/2 text-[9px] text-slate-400 whitespace-nowrap" style={{ top:h*HOUR_HEIGHT }}>
                {h===0?"":h<12?`${h}a`:h===12?"12p":`${h-12}p`}
              </div>
            ))}
          </div>
          {weekDays.map(day=>{
            const iso=toISO(day);
            const isToday=sameDay(day,today);
            const dayTrips=visibleTrips.filter(t=>t.date_of_trip===iso);
            const laid=layoutDayTrips(dayTrips);
            return (
              <div key={iso} className={`flex-1 border-r border-slate-100 relative ${isToday?"bg-blue-50/20":""}`} onClick={()=>onDayClick(day)}>
                {HOURS.map(h=>(
                  <div key={h} className="absolute left-0 right-0 border-t border-slate-100" style={{ top:h*HOUR_HEIGHT }}/>
                ))}
                {isToday && <NowLine/>}
                {laid.map(({t,top,height,col,totalCols})=>{
                  const colGap=2;
                  const totalGap=colGap*(totalCols-1);
                  const colWidth=`calc((100% - 6px - ${totalGap}px) / ${totalCols})`;
                  const leftOffset=`calc(3px + ${col} * (${colWidth} + ${colGap}px))`;
                  return (
                    <div key={t.id} className="absolute z-10" style={{ top:top+1, height:height-2, width:colWidth, left:leftOffset }} onClick={e=>e.stopPropagation()}>
                      <TripBlock trip={t} onClick={onTripClick}/>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Stat card ─── */
function StatCard({ icon, label, value, color }) {
  const colors = {
    blue:   { bg:"bg-blue-50",    text:"text-blue-600",    val:"text-blue-700"    },
    amber:  { bg:"bg-amber-50",   text:"text-amber-600",   val:"text-amber-700"   },
    emerald:{ bg:"bg-emerald-50", text:"text-emerald-600", val:"text-emerald-700" },
    slate:  { bg:"bg-slate-100",  text:"text-slate-500",   val:"text-slate-700"   },
    rose:   { bg:"bg-rose-50",    text:"text-rose-500",    val:"text-rose-700"    },
  };
  const c = colors[color] || colors.slate;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
        <svg className={`w-5 h-5 ${c.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon}/>
        </svg>
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
      </div>
    </div>
  );
}

/* ─── Pending request row ─── */
function PendingRow({ req, onView, onApprove, onDisapprove, saving }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
        {(req.name||"?")[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{req.name}</p>
        <p className="text-xs text-slate-400 truncate">{req.destination} · {fmtDate(req.date_of_travel)}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button onClick={()=>onView(req)} className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" title="View">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </button>
        <button onClick={()=>onDisapprove(req.id)} disabled={saving} className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors disabled:opacity-50" title="Disapprove">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <button onClick={()=>onApprove(req.id)} disabled={saving} className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50" title="Approve">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ─── Today's trip card ─── */
function TodayTripCard({ trip, onClick }) {
  const sc = TRIP_STATUS[trip.status] || TRIP_STATUS.UPCOMING;
  return (
    <div
      onClick={()=>onClick(trip)}
      className="p-3 rounded-xl border cursor-pointer hover:shadow-sm transition-all"
      style={{ borderColor:`${sc.dot}40`, background:sc.bg }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:`${sc.dot}20`, color:sc.text }}>{sc.label}</span>
        <span className="text-[10px] text-slate-400">{fmt12(trip.time_of_travel)}</span>
      </div>
      <p className="text-sm font-semibold truncate" style={{ color:sc.text }}>{trip.requester || "—"}</p>
      <p className="text-xs truncate opacity-70" style={{ color:sc.text }}>{trip.destination || "—"}</p>
      {trip.driver_name && (
        <p className="text-[11px] mt-1 opacity-60" style={{ color:sc.text }}>👤 {trip.driver_name}</p>
      )}
    </div>
  );
}

/* ─── Main dashboard ─── */
export default function Home() {
  const navigate = useNavigate();
  const [trips, setTrips]       = useState([]);
  const [requests, setRequests] = useState([]);
  const [saving, setSaving]     = useState(false);
  const [activeTripModal, setActiveTripModal] = useState(null);
  const [activeReqModal, setActiveReqModal]   = useState(null);
  const [showCancelled, setShowCancelled]     = useState(false);
  const today = useMemo(()=>startOfDay(new Date()),[]);
  const [weekStart, setWeekStart] = useState(()=>getWeekStart(new Date()));

  const loadAll = useCallback(async () => {
    try {
      const [t, r] = await Promise.all([apiFetch("/trips/"), apiFetch("/requests/")]);
      setTrips(Array.isArray(t) ? t : (t.results??[]));
      setRequests(Array.isArray(r) ? r : (r.results??[]));
    } catch { setTrips([]); setRequests([]); }
  }, []);

  useEffect(()=>{ loadAll(); },[loadAll]);

  const todayISO     = toISO(today);
  const todayTrips   = useMemo(()=>trips.filter(t=>t.date_of_trip===todayISO),[trips,todayISO]);
  const pendingReqs  = useMemo(()=>requests.filter(r=>r.status==="PENDING"),[requests]);
  const upcomingTrips= useMemo(()=>trips.filter(t=>t.status==="UPCOMING"),[trips]);
  const ongoingTrips = useMemo(()=>trips.filter(t=>t.status==="ONGOING"),[trips]);

  const handleApprove = useCallback(async (id) => {
    setSaving(true);
    try {
      await apiFetch(`/requests/${id}/`, { method:"PATCH", body:JSON.stringify({ status:"APPROVED" }) });
      setActiveReqModal(null);
      await loadAll();
    } catch(e){ console.error(e); } finally { setSaving(false); }
  },[loadAll]);

  const handleDisapprove = useCallback(async (id) => {
    setSaving(true);
    try {
      await apiFetch(`/requests/${id}/`, { method:"PATCH", body:JSON.stringify({ status:"DISAPPROVED" }) });
      setActiveReqModal(null);
      await loadAll();
    } catch(e){ console.error(e); } finally { setSaving(false); }
  },[loadAll]);

  const handleCancel = useCallback(async (id) => {
    setSaving(true);
    try {
      await apiFetch(`/trips/${id}/`, { method:"PATCH", body:JSON.stringify({ status:"CANCELLED" }) });
      setActiveTripModal(null);
      await loadAll();
    } catch(e){ console.error(e); } finally { setSaving(false); }
  },[loadAll]);

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(()=>new Date().getFullYear());

  const weekEnd = addDays(weekStart,6);
  const monthLabel = weekStart.getMonth()===weekEnd.getMonth()
    ? `${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
    : `${MONTHS[weekStart.getMonth()].slice(0,3)} – ${MONTHS[weekEnd.getMonth()].slice(0,3)} ${weekEnd.getFullYear()}`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
        <div className="w-8 h-8 rounded-xl shrink-0" style={{ background:"linear-gradient(135deg,#6b8cff,#86ffd0)" }}/>
        <span className="text-base font-bold text-slate-800">Dispatch Dashboard</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={loadAll} className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
          <span className="text-xs text-slate-400">Today: {fmtDate(todayISO)}</span>
        </div>
      </header>

      <div className="px-6 py-5 space-y-5">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" label="Today's Trips" value={todayTrips.length} color="blue"/>
          <StatCard icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" label="Ongoing" value={ongoingTrips.length} color="amber"/>
          <StatCard icon="M5 13l4 4L19 7" label="Upcoming" value={upcomingTrips.length} color="emerald"/>
          <StatCard icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" label="Pending Requests" value={pendingReqs.length} color="rose"/>
          <StatCard icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" label="Total Trips" value={trips.length} color="slate"/>
        </div>

        {/* ── Main content: always side-by-side ── */}
        <div className="grid grid-cols-[1fr_300px] gap-5">

          {/* Calendar */}
          <div className="flex flex-col gap-3" style={{ minHeight:"600px" }}>
            {/* Calendar toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={()=>setWeekStart(w=>addDays(w,-7))} className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-white flex items-center justify-center text-slate-500 transition-colors">‹</button>
              <button onClick={()=>setWeekStart(getWeekStart(new Date()))} className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-white text-xs font-semibold text-slate-500 transition-colors">Today</button>
              <button onClick={()=>setWeekStart(w=>addDays(w,7))} className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-white flex items-center justify-center text-slate-500 transition-colors">›</button>
              <div className="relative">
                <button
                  onClick={()=>{ setPickerYear(weekStart.getFullYear()); setShowMonthPicker(s=>!s); }}
                  className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-white text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {monthLabel}
                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {showMonthPicker && (
                  <>
                    {/* backdrop */}
                    <div className="fixed inset-0 z-40" onClick={()=>setShowMonthPicker(false)}/>
                    <div className="absolute top-10 left-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 w-72">
                      {/* Year nav */}
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={()=>setPickerYear(y=>y-1)}
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
                          </svg>
                        </button>
                        <span className="text-sm font-bold text-slate-800">{pickerYear}</span>
                        <button
                          onClick={()=>setPickerYear(y=>y+1)}
                          className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                          </svg>
                        </button>
                      </div>
                      {/* Month grid */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {MONTHS.map((m, i) => {
                          const isActive = weekStart.getMonth()===i && weekStart.getFullYear()===pickerYear;
                          const isCurrentMonth = new Date().getMonth()===i && new Date().getFullYear()===pickerYear;
                          return (
                            <button
                              key={m}
                              onClick={()=>{
                                const d = new Date(pickerYear, i, 1);
                                setWeekStart(getWeekStart(d));
                                setShowMonthPicker(false);
                              }}
                              className={`py-2 rounded-xl text-xs font-semibold transition-colors ${
                                isActive
                                  ? "bg-blue-600 text-white"
                                  : isCurrentMonth
                                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                                  : "hover:bg-slate-100 text-slate-600"
                              }`}
                            >
                              {m.slice(0,3)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Cancelled toggle */}
              <button
                onClick={()=>setShowCancelled(s=>!s)}
                className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  showCancelled
                    ? "bg-slate-700 border-slate-700 text-white"
                    : "border-slate-200 hover:bg-white text-slate-500"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: showCancelled ? "#fff" : "#94a3b8" }}/>
                {showCancelled ? "Hide Cancelled" : "Show Cancelled"}
              </button>

              <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
                {Object.entries(TRIP_STATUS).map(([k,v])=>(
                  <span key={k} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ background:v.dot }}/>
                    {v.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <WeekGrid
                weekStart={weekStart}
                trips={trips}
                today={today}
                showCancelled={showCancelled}
                onDayClick={day=>navigate(`/requests/${toISO(day)}`)}
                onTripClick={setActiveTripModal}
              />
            </div>
          </div>

          {/* Right sidebar — always visible */}
          <div className="flex flex-col gap-3 min-w-0">

            {/* Today's trips */}
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-800">Today's Trips</h2>
                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">{todayTrips.length}</span>
              </div>
              {todayTrips.length === 0
                ? <p className="text-xs text-slate-400 py-4 text-center">No trips scheduled today</p>
                : <div className="space-y-2 max-h-52 overflow-y-auto">
                    {todayTrips.map(t=><TodayTripCard key={t.id} trip={t} onClick={setActiveTripModal}/>)}
                  </div>
              }
            </div>

            {/* Pending requests */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-800">Pending Requests</h2>
                {pendingReqs.length > 0 && (
                  <span className="text-xs bg-rose-50 text-rose-500 border border-rose-200 px-2 py-0.5 rounded-full font-semibold">{pendingReqs.length}</span>
                )}
              </div>
              {pendingReqs.length === 0
                ? <p className="text-xs text-slate-400 py-4 text-center">No pending requests</p>
                : <div className="max-h-80 overflow-y-auto">
                    {pendingReqs.map(r=>(
                      <PendingRow
                        key={r.id}
                        req={r}
                        saving={saving}
                        onView={setActiveReqModal}
                        onApprove={handleApprove}
                        onDisapprove={handleDisapprove}
                      />
                    ))}
                  </div>
              }
            </div>

          </div>
        </div>
      </div>

      {/* Trip detail modal */}
      {activeTripModal && (
        <TripModal trip={activeTripModal} onClose={()=>setActiveTripModal(null)} onCancel={handleCancel} saving={saving}/>
      )}

      {/* Request detail modal */}
      {activeReqModal && (
        <RequestModal
          req={activeReqModal}
          saving={saving}
          onClose={()=>setActiveReqModal(null)}
          onApprove={handleApprove}
          onDisapprove={handleDisapprove}
        />
      )}
    </div>
  );
}