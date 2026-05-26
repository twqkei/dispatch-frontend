/**
 * generateTripTicket.js
 *
 * Fills the DNSC Motor Pool Driver's Trip Ticket (tp_and_fuel_consumption.xlsx)
 * with travel request data and triggers a browser download.
 *
 * Cell addresses are confirmed from the actual template:
 *   Sheet: "Trip Ticket"
 *
 * Usage:
 *   import { generateTripTicket } from "./generateTripTicket";
 *   await generateTripTicket(selectedRequests, driversMap, vehiclesMap, templateUrl);
 *
 * Dependencies:  npm install xlsx
 */

import * as XLSX from "xlsx";

// ── Confirmed cell map (from tp_and_fuel_consumption.xlsx) ─────────────────
//
//  Section A – filled by authorizing officer
//    C11  → Date of travel
//    J11  → Vehicle plate + model  (merged J11:K11)
//    C12  → Driver name            (merged C12:E12)
//    D14  → Passenger 1            (rows 14-21, col D)
//    D15  → Passenger 2
//    D16  → Passenger 3
//    D17  → Passenger 4
//    D18  → Passenger 5  (note: I18:K18 is also merged — write to D18)
//    D19  → Passenger 6
//    D20  → Passenger 7
//    D21  → Passenger 8
//    D22  → Destination            (merged D22:K22)
//    D23  → Purpose of Travel      (merged D23:K23)
//
//  Bottom section
//    C52  → Date (repeated at bottom)
//    I53  → Driver name (Certified True and Correct — merged I53:K54)
//
const CELL_MAP = {
  date:        "C11",
  plateNo:     "J11",
  driver:      "C12",
  passengers:  ["D14","D15","D16","D17","D18","D19","D20","D21"],
  destination: "D22",
  purpose:     "D23",
  dateBottom:  "C52",   // mirrors the date at the bottom of the form
  driverCert:  "I53",   // "Certified True and Correct" driver name
};

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(dateStr) {
  if (!dateStr) return "";
  // Handle both "2026-01-15" strings and Date objects
  const d = typeof dateStr === "string"
    ? new Date(dateStr + "T00:00:00")
    : new Date(dateStr);
  if (isNaN(d)) return String(dateStr);
  return d.toLocaleDateString("en-PH", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function safeStr(v) {
  return v == null ? "" : String(v);
}

async function loadTemplate(templateUrl) {
console.log("Loading template from:", templateUrl); // ← add this
const res = await fetch(templateUrl);
console.log("Content-Type:", res.headers.get("content-type")); // ← add this

  if (!res.ok) {
    throw new Error(`Could not load template: ${res.status} ${res.statusText}\nURL: ${templateUrl}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return XLSX.read(arrayBuffer, { type: "array", cellStyles: true });
}

/**
 * Deep-clone a worksheet object safely.
 */
function cloneSheet(ws) {
  const cloned = {};
  for (const key of Object.keys(ws)) {
    if (key === "!merges" && Array.isArray(ws[key])) {
      cloned[key] = ws[key].map((m) => ({ ...m, s: { ...m.s }, e: { ...m.e } }));
    } else if (key === "!cols" || key === "!rows") {
      cloned[key] = ws[key] ? ws[key].map((c) => ({ ...(c || {}) })) : ws[key];
    } else if (typeof ws[key] === "object" && ws[key] !== null && key !== "!ref") {
      // individual cell object
      cloned[key] = { ...ws[key] };
      if (ws[key].s) cloned[key].s = { ...ws[key].s };
    } else {
      cloned[key] = ws[key];
    }
  }
  return cloned;
}

/**
 * Write a value into a cell, preserving existing border/style metadata.
 * For merged cells, always write to the top-left cell of the range.
 */
function writeCell(ws, cellRef, value) {
  const existing = ws[cellRef] || {};
  ws[cellRef] = {
    ...existing,
    v: value,
    t: value instanceof Date ? "d" : typeof value === "number" ? "n" : "s",
    w: undefined, // clear cached formatted text so XLSX re-renders
  };
}

/**
 * Fill one Trip Ticket worksheet with data from a single request.
 */
function fillSheet(ws, request, driversMap, vehiclesMap) {
  // ── Resolve display values ───────────────────────────────────────────────
  const driverId    = request.driver;
  const vehicleId   = request.vehicle;

  const driverName  = driversMap?.[driverId]
    ?? safeStr(driverId);

  const vehicleLabel = vehiclesMap?.[vehicleId]
    ?? safeStr(vehicleId);

  // Your dropdown format is "PLATE — Model", keep it as-is for the plate field
  const plateDisplay = vehicleLabel || "—";

  // Date of travel
  const travelDate = fmtDate(
    request.date_of_travel ?? request.dateOfTravel ?? ""
  );

  // Passenger names — split by newline or comma, up to 8 slots
  const rawPax = safeStr(
    request.passenger_names ?? request.passengerNames ?? ""
  );
  const paxList = rawPax
    .split(/[\n,]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 8);

  // ── Write cells ──────────────────────────────────────────────────────────
  writeCell(ws, CELL_MAP.date,        travelDate);
  writeCell(ws, CELL_MAP.plateNo,     plateDisplay);
  writeCell(ws, CELL_MAP.driver,      driverName);
  writeCell(ws, CELL_MAP.destination, safeStr(request.destination ?? ""));
  writeCell(ws, CELL_MAP.purpose,     safeStr(request.purpose ?? ""));
  writeCell(ws, CELL_MAP.dateBottom,  travelDate);
  writeCell(ws, CELL_MAP.driverCert,  driverName);

  CELL_MAP.passengers.forEach((cellRef, i) => {
    writeCell(ws, cellRef, paxList[i] ?? "");
  });
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate and download filled trip ticket(s).
 *
 * @param {Array}  requests      Raw request objects from your component state
 * @param {Object} driversMap    { [id]: "Driver Name" }
 * @param {Object} vehiclesMap   { [id]: "PLATE — Model" }
 * @param {string} templateUrl   Path to tp_and_fuel_consumption.xlsx in /public
 * @param {Object} [options]
 * @param {boolean} [options.oneFilePerRequest]
 *   true  → one .xlsx download per request
 *   false (default) → all on separate sheets in one .xlsx
 */
export async function generateTripTicket(
  requests,
  driversMap = {},
  vehiclesMap = {},
  templateUrl = "/templates/tp_and_fuel_consumption.xlsx",
  { oneFilePerRequest = false } = {}
) {
  if (!requests?.length) return;

  // Load the template workbook once
  const templateWb = await loadTemplate(templateUrl);
  const SHEET_NAME = "Trip Ticket";

  if (!templateWb.SheetNames.includes(SHEET_NAME)) {
    throw new Error(`Sheet "${SHEET_NAME}" not found in template. Available: ${templateWb.SheetNames.join(", ")}`);
  }

  // Snapshot the original template sheet data before any writes
  const templateSnapshot = cloneSheet(templateWb.Sheets[SHEET_NAME]);

  if (oneFilePerRequest || requests.length === 1) {
    // ── One file per request ──────────────────────────────────────────────
    for (const request of requests) {
      const wb = await loadTemplate(templateUrl);
      fillSheet(wb.Sheets[SHEET_NAME], request, driversMap, vehiclesMap);

      const refNo    = `VR-${String(request.id).padStart(4, "0")}`;
      const safeName = safeStr(request.name ?? "Unknown").replace(/[^a-zA-Z0-9]/g, "_");
      XLSX.writeFile(wb, `TripTicket_${refNo}_${safeName}.xlsx`);
    }

  } else {
    // ── Multiple requests → one workbook, one sheet per request ──────────
    const wb = { SheetNames: [], Sheets: {}, Props: templateWb.Props };

    requests.forEach((request, idx) => {
      const ws     = idx === 0
        ? cloneSheet(templateWb.Sheets[SHEET_NAME])
        : cloneSheet(templateSnapshot);

      fillSheet(ws, request, driversMap, vehiclesMap);

      const refNo    = `VR-${String(request.id).padStart(4, "0")}`;
      const safeName = safeStr(request.name ?? "").replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
      // Excel sheet name max 31 chars
      const sheetLabel = `${refNo}_${safeName}`.slice(0, 31);

      wb.SheetNames.push(sheetLabel);
      wb.Sheets[sheetLabel] = ws;
    });

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `TripTickets_${today}.xlsx`);
  }
}