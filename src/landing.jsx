import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Topbar */}
      <header className="bg-white border-b border-slate-100 px-6 md:px-10 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-800">Motor Pool Services Unit</p>
            <p className="text-[10px] text-slate-400 hidden sm:block">Davao del Norte State College</p>
          </div>
        </div>
        <a
          href="/login"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="hidden sm:inline">Admin Login</span>
          <span className="sm:hidden">Login</span>
        </a>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>

        {/* Text */}
        <p className="text-xs font-semibold text-emerald-500 uppercase tracking-widest mb-2">
          Davao del Norte State College
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight mb-3">
          Motor Pool Services
        </h1>
        <p className="text-sm text-slate-400 max-w-sm mb-10 leading-relaxed">
          Request a vehicle for official travel. Submit your trip details and track your request status online.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            to="/request"
            className="flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Submit a Vehicle Request
          </Link>
          <Link
            to="/status"
            className="flex items-center gap-2 px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-full border border-slate-200 hover:border-slate-300 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Track My Request
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-4 px-8 text-center">
        <p className="text-[11px] text-slate-300">DNSC Motorpool System · For concerns, contact the Motorpool Office</p>
      </footer>

    </div>
  );
}