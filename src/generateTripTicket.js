/**
 * generateTripTicket.js
 *
 * Overlays travel request data onto the original
 * tripticket.pdf template using pdf-lib.
 *
 * The original PDF (with logo, layout, signatures) is used as the background —
 * nothing gets stripped. Text is drawn on top at calibrated coordinates.
 *
 * Usage:
 *   import { generateTripTicket } from "./generateTripTicket";
 *   await generateTripTicket(selectedRequests, driversMap, vehiclesMap, templateUrl);
 *
 * Dependencies:  npm install pdf-lib
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// ── Coordinate map (x, y from bottom-left, in PDF points) ─────────────────
//
// Page size from template: ~595 x 842 pt (A4)
// Calibrated by visual inspection of the PDF layout.
//
const COORDS = {
  date:        { x: 90, y: 693  },   // Section A - Date:
  plateNo:     { x: 430, y: 696 },   // Vehicle Plate No.:
  driver:      { x: 90, y: 678  },   // Driver:
  // Authorized Passengers 1–8 (rows spaced ~18pt apart)
  passengers: [
    { x: 190, y: 650 },
    { x: 190, y: 637 },
    { x: 190, y: 630 },
    { x: 220, y: 596 },
    { x: 220, y: 578 },
    { x: 220, y: 560 },
    { x: 220, y: 500 },
    { x: 220, y: 482 },
  ],
  destination: { x: 180, y: 540 },   // Destination:
  purpose:     { x: 180, y: 525 },   // Purpose of Travel:
  dateBottom:  { x: 90, y: 128 },   // Date: at bottom (Section C)
  driverCert:  { x: 450, y: 110 },   // Certified True and Correct:
};

const FONT_SIZE = 9;

// ── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(dateStr) {
  if (!dateStr) return "";
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

async function loadTemplatePdf(templateUrl) {
  const res = await fetch(templateUrl);
  if (!res.ok) {
    throw new Error(`Could not load template: ${res.status} ${res.statusText}\nURL: ${templateUrl}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    throw new Error(`Template not found at: ${templateUrl}\nMake sure tripticket.pdf is in your /public/templates/ folder.`);
  }
  return res.arrayBuffer();
}

/**
 * Fill one page (copy of template) with a single request's data.
 */
async function fillPage(templateBytes, request, driversMap, vehiclesMap) {
  const pdfDoc   = await PDFDocument.load(templateBytes);
  const font     = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page     = pdfDoc.getPages()[0]; // Trip Ticket is page 1
  const black    = rgb(0, 0, 0);

  const draw = (coord, text) => {
    if (!text) return;
    page.drawText(String(text), {
      x:    coord.x,
      y:    coord.y,
      size: FONT_SIZE,
      font,
      color: black,
    });
  };

  // ── Resolve values ───────────────────────────────────────────────────────
  const driverName   = driversMap?.[request.driver]   ?? safeStr(request.driver);
  const vehicleLabel = vehiclesMap?.[request.vehicle] ?? safeStr(request.vehicle);
  const travelDate   = fmtDate(request.date_of_travel ?? request.dateOfTravel ?? "");

  const rawPax = safeStr(request.passenger_names ?? request.passengerNames ?? "");
  const paxList = rawPax
    .split(/[\n,]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 8);

  // ── Draw fields ──────────────────────────────────────────────────────────
  draw(COORDS.date,        travelDate);
  draw(COORDS.plateNo,     vehicleLabel);
  draw(COORDS.driver,      driverName);
  draw(COORDS.destination, safeStr(request.destination ?? ""));
  draw(COORDS.purpose,     safeStr(request.purpose ?? ""));
  draw(COORDS.dateBottom,  travelDate);
  draw(COORDS.driverCert,  driverName);

  paxList.forEach((name, i) => {
    draw(COORDS.passengers[i], name);
  });

  return pdfDoc.save();
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate and download filled trip ticket(s) as PDF.
 *
 * @param {Array}  requests      Raw request objects
 * @param {Object} driversMap    { [id]: "Driver Name" }
 * @param {Object} vehiclesMap   { [id]: "PLATE — Model" }
 * @param {string} templateUrl   Path to tripticket.pdf in /public
 * @param {Object} [options]
 * @param {boolean} [options.oneFilePerRequest]  true = separate PDF per request
 */
export async function generateTripTicket(
  requests,
  driversMap = {},
  vehiclesMap = {},
  templateUrl = "/templates/tripticket.pdf",
  { oneFilePerRequest = false } = {}
) {
  if (!requests?.length) return;

  const templateBytes = await loadTemplatePdf(templateUrl);

  if (oneFilePerRequest || requests.length === 1) {
    // ── One PDF per request ───────────────────────────────────────────────
    for (const request of requests) {
      const pdfBytes = await fillPage(templateBytes, request, driversMap, vehiclesMap);
      const refNo    = `VR-${String(request.id).padStart(4, "0")}`;
      const safeName = safeStr(request.name ?? "Unknown").replace(/[^a-zA-Z0-9]/g, "_");
      triggerDownload(pdfBytes, `TripTicket_${refNo}_${safeName}.pdf`);
    }

  } else {
    // ── Multiple requests → merged into one PDF ───────────────────────────
    const mergedDoc = await PDFDocument.create();

    for (const request of requests) {
      const pdfBytes  = await fillPage(templateBytes, request, driversMap, vehiclesMap);
      const filledDoc = await PDFDocument.load(pdfBytes);
      const [page]    = await mergedDoc.copyPages(filledDoc, [0]);
      mergedDoc.addPage(page);
    }

    const mergedBytes = await mergedDoc.save();
    const today = new Date().toISOString().slice(0, 10);
    triggerDownload(mergedBytes, `TripTickets_${today}.pdf`);
  }
}

function triggerDownload(pdfBytes, filename) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}