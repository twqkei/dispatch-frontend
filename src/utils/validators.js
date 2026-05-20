// ─── Primitive validators ─────────────────────────────────────────────────────

export const isValidMobile = (v) => /^\d{11}$/.test(v.replace(/[-\s]/g, ""));

export const isValidEmail = (v) =>
  v === "" || /^[^\s@]+@gmail\.com$/i.test(v.trim());

export const countPassengerNames = (text) =>
  text
    .split("\n")
    .map((l) => l.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean).length;

// ─── Step validators ──────────────────────────────────────────────────────────

/**
 * Validates Step 1 fields (requester + travel details).
 * @param {object} form - Current form state
 * @returns {object} errors - Key/message pairs; empty means valid
 */
export const validateStep1 = (form) => {
  const e = {};

  if (!form.name.trim())          e.name          = "Full name is required.";
  if (!form.department.trim())    e.department    = "Department is required.";
  if (!form.immediateHead.trim()) e.immediateHead = "Immediate head is required.";

  if (!form.mobile.trim()) {
    e.mobile = "Mobile number is required.";
  } else if (!isValidMobile(form.mobile)) {
    e.mobile = "Mobile number must be exactly 11 digits (e.g. 09171234567).";
  }

  if (form.email.trim() && !isValidEmail(form.email)) {
    e.email = "Email must be a valid Gmail address ending in @gmail.com.";
  }

  if (!form.dateOfTravel)  e.dateOfTravel  = "Date of travel is required.";
  if (!form.dateReturned)  e.dateReturned  = "Date of return is required.";
  if (
    form.dateOfTravel &&
    form.dateReturned &&
    form.dateReturned < form.dateOfTravel
  ) {
    e.dateReturned = "Return date cannot be earlier than the travel date.";
  }

  if (!form.destination.trim()) e.destination    = "Destination is required.";
  if (!form.purpose.trim())     e.purpose        = "Purpose of travel is required.";
  if (!form.waitingArea.trim()) e.waitingArea    = "Waiting / pickup area is required.";
  if (!form.departureTime)      e.departureTime  = "Departure time is required.";
  if (!form.expectedReturn)     e.expectedReturn = "Expected return time is required.";

  return e;
};

/**
 * Validates Step 2 fields (passengers + acknowledgement).
 * @param {object} form - Current form state
 * @returns {object} errors - Key/message pairs; empty means valid
 */
export const validateStep2 = (form) => {
  const e = {};
  const declared = parseInt(form.numPassengers, 10);

  if (!form.numPassengers) {
    e.numPassengers = "Number of passengers is required.";
  } else if (isNaN(declared) || declared < 1) {
    e.numPassengers = "Please enter a valid number of passengers (at least 1).";
  }

  if (!form.passengerNames.trim()) {
    e.passengerNames = "Passenger names are required.";
  } else if (!isNaN(declared) && declared >= 1) {
    const listed = countPassengerNames(form.passengerNames);
    if (listed !== declared) {
      e.passengerNames = `You declared ${declared} passenger${declared !== 1 ? "s" : ""} but listed ${listed} name${listed !== 1 ? "s" : ""}. Please make them match.`;
    }
  }

  if (!form.projectBased)    e.projectBased    = "Please indicate if this is project-based travel.";
  if (!form.acknowledgement) e.acknowledgement = "You must acknowledge to submit.";

  return e;
};