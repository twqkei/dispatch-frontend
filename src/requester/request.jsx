  import { useState } from "react";
import { apiFetch } from "../api";

import { validateStep1, validateStep2 } from "../utils/validators";

import Topbar from "../components/layout/topbar";
import StepBar from "../components/layout/stepbar";
import DataPrivacyStep from "../components/requests/dataprivacy";
import StepOne from "../components/requests/StepOne";
import StepTwo from "../components/requests/StepTwo";
import SuccessScreen from "../components/requests/SuccessScreen";

// ─── Initial form state ───────────────────────────────────────────────────────
const initialForm = {
  email: "", name: "", department: "", immediateHead: "", mobile: "",
  dateOfTravel: "", dateReturned: "", destination: "", purpose: "", waitingArea: "",
  departureTime: "", expectedReturn: "", numPassengers: "", passengerNames: "",
  projectBased: "", fundingType: "", acknowledgement: false, notes: "", attachments: [],
};

// ─── RequestPage ──────────────────────────────────────────────────────────────
/**
 * RequestPage
 * Orchestrates the multi-step vehicle request form.
 * Step 0 = Data Privacy, Step 1 = Requester & Travel Info, Step 2 = Passengers & Submit.
 * All state lives here; child step components are purely presentational.
 */
export default function RequestPage() {
  const [step, setStep] = useState(0); // 0 = privacy, 1 = step one, 2 = step two
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /** Update a single form field and clear its error. */
  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const next = { ...e }; delete next[key]; return next; });
  };

  const validateStep = () => {
    const e = step === 1 ? validateStep1(form) : validateStep2(form);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(2); };
  const back = () => { setErrors({}); setStep(step === 2 ? 1 : 0); };

  const reset = () => { setSubmitted(false); setStep(0); setForm(initialForm); };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await apiFetch(
        "/requests/",
        {
          method: "POST",
          body: JSON.stringify({
            name:              form.name,
            email:             form.email || "",
            department:        form.department,
            immediate_head:    form.immediateHead,
            mobile:            form.mobile,
            date_of_travel:    form.dateOfTravel,
            date_returned:     form.dateReturned,
            destination:       form.destination,
            purpose:           form.purpose,
            waiting_area:      form.waitingArea,
            time_of_departure: form.departureTime || null,
            expected_return:   form.expectedReturn || null,
            passengers:        form.numPassengers ? parseInt(form.numPassengers, 10) : 0,
            passenger_names:   form.passengerNames,
            project_based:
              form.projectBased === "Yes"
                ? true
                : form.projectBased === "No"
                ? false
                : null,
            funding_type: form.projectBased === "Yes" ? form.fundingType || "" : "",
            notes:        form.notes || "",
          }),
        },
        { auth: false }
      );
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Submission failed:\n" + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  // Success screen after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Topbar />
        <SuccessScreen onReset={reset} />
      </div>
    );
  }

  // Data privacy screen — no StepBar shown
  if (step === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          <DataPrivacyStep onAgree={() => setStep(1)} />
        </main>
        <footer className="border-t border-slate-100 py-3 px-8 shrink-0">
          <p className="text-[11px] text-slate-300">
            DNSC Motorpool System · For concerns, contact the Motorpool Office
          </p>
        </footer>
      </div>
    );
  }

  // Step 1 & 2 — with StepBar
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Topbar />
      <StepBar step={step} back={back} />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
        {step === 1 && (
          <StepOne form={form} errors={errors} set={set} onNext={next} />
        )}
        {step === 2 && (
          <StepTwo
            form={form}
            errors={errors}
            set={set}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </main>

      <footer className="border-t border-slate-100 py-3 px-8 shrink-0">
        <p className="text-[11px] text-slate-300">
          DNSC Motorpool System · For concerns, contact the Motorpool Office
        </p>
      </footer>
    </div>
  );
}