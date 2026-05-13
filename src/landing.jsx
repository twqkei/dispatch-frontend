import React from "react";
import { useNavigate } from "react-router-dom";

const CarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h12l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
    <circle cx="7.5" cy="17.5" r="2.5" />
    <circle cx="16.5" cy="17.5" r="2.5" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const Card = ({ onClick, icon, label, labelMuted, title, desc, cta }) => (
  <div
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    className="group relative bg-white border-2 border-gray-100 rounded-2xl p-8 w-64 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-[#38ED93] hover:shadow-[0_20px_40px_rgba(56,237,147,0.15)] overflow-hidden"
  >
    {/* top accent bar */}
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#38ED93] rounded-t-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    {/* icon */}
    <div className="w-12 h-12 rounded-xl bg-green-50 border-2 border-green-100 flex items-center justify-center mb-5 text-[#10b96a] transition-all duration-300 group-hover:bg-[#38ED93] group-hover:border-[#38ED93] group-hover:text-white">
      {icon}
    </div>

    <p className={`text-[10px] font-semibold tracking-widest uppercase mb-1.5 ${labelMuted ? "text-gray-400" : "text-[#10b96a]"}`}>
      {label}
    </p>
    <h2 className="text-xl font-bold text-gray-900 mb-2 leading-snug">{title}</h2>
    <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>

    <div className="mt-6 flex items-center justify-between">
      <span className="text-sm font-semibold text-[#10b96a]">{cta}</span>
      <span className="text-[#10b96a]"><ArrowIcon /></span>
    </div>
  </div>
);

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f0fdf6] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">

      {/* background blobs */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#38ED93]/10 -top-44 -right-44 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#38ED93]/10 -bottom-24 -left-20 pointer-events-none" />

      {/* header */}
      <div className="text-center mb-14 relative z-10">
        <div className="inline-flex items-center gap-2.5 mb-7">
          <div className="w-11 h-11 bg-[#38ED93] rounded-xl flex items-center justify-center text-white">
            <CarIcon />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">FleetMS</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight mb-3">
          Vehicle Request<br />
          <span className="text-[#10b96a]">Made Simple</span>
        </h1>
        <p className="text-gray-500 text-[15px] max-w-sm mx-auto leading-relaxed">
          Submit vehicle requests or manage your school's fleet — all in one place.
        </p>
      </div>

      {/* cards */}
      <div className="flex flex-wrap gap-5 justify-center relative z-10">
        <Card
          onClick={() => navigate("/status")}
          icon={<CarIcon />}
          label="For everyone"
          title="Request a Vehicle"
          desc="Need a vehicle for a trip or event? Submit your request quickly and track its status."
          cta="Get started"
        />
        <Card
          onClick={() => navigate("/login")}
          icon={<LockIcon />}
          label="Staff only"
          labelMuted
          title="Admin Login"
          desc="Manage requests, assign vehicles, and view fleet reports from the admin panel."
          cta="Sign in"
        />
      </div>

      {/* footer */}
      <p className="mt-12 text-xs text-gray-300 relative z-10">
        © 2026 School Vehicle Management System
      </p>
    </div>
  );
};

export default Landing;