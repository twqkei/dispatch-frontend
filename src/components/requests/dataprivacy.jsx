/**
 * DataPrivacyStep
 * Shown before Step 1. User must click "I Agree & Continue" to proceed.
 *
 * @param {Function} onAgree - Called when the user accepts and wants to proceed
 */
export default function DataPrivacyStep({ onAgree }) {
  return (
    <div className="max-w-2xl mx-auto">

      {/* Shield icon */}
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Data Privacy Statement</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          Please read and acknowledge the following before filling out the Vehicle Requisitioning Form.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Blue top banner */}
        <div className="bg-blue-600 px-6 py-4">
          <p className="text-xs font-semibold text-blue-100 uppercase tracking-widest mb-1">
            Motor Pool Services Unit · Davao del Norte State College
          </p>
          <p className="text-sm text-white leading-relaxed">
            By accomplishing this Vehicle Requisitioning Form, you acknowledge and consent to the collection and processing of your personal information by the Motor Pool Services Unit solely for the purpose of evaluating, approving, and documenting vehicle requests.
          </p>
        </div>

        {/* Bullet points */}
        <div className="divide-y divide-slate-100">
          {[
            {
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ),
              color: "bg-emerald-100 text-emerald-600",
              title: "Purpose of Collection",
              desc: "Information provided will be used strictly for administrative and operational requirements related to vehicle requisitioning.",
            },
            {
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              color: "bg-blue-100 text-blue-600",
              title: "Data Protection",
              desc: "All personal data shall be stored securely and accessed only by authorized personnel.",
            },
            {
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              ),
              color: "bg-amber-100 text-amber-600",
              title: "Non-Disclosure",
              desc: "Your information will not be shared with third parties without your consent, except as required by law.",
            },
            {
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              color: "bg-purple-100 text-purple-600",
              title: "Retention Period",
              desc: "Records will be retained only for as long as necessary to fulfill the stated purposes and comply with institutional policies.",
            },
            {
              icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ),
              color: "bg-rose-100 text-rose-600",
              title: "Rights of the Data Subject",
              desc: "You have the right to access, correct, and request deletion of your personal data, as well as to withdraw consent at any time, subject to applicable laws.",
            },
          ].map(({ icon, color, title, desc }) => (
            <div key={title} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                {icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-0.5">{title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer / action */}
        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            By clicking <span className="font-semibold text-slate-600">I Agree &amp; Continue</span>, you confirm that you have read and understood this statement.
          </p>
          <button
            onClick={onAgree}
            className="flex items-center gap-2 px-7 py-2.5 rounded-full text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-200 shrink-0"
          >
            I Agree &amp; Continue
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}