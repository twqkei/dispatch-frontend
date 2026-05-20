import { fmt12 } from "./formatters";

/**
 * generateVehicleRequestPDF
 * Opens a print-ready HTML page in a new tab so the user can save it as PDF.
 *
 * @param {object} src    - The request data object
 * @param {string} status - Normalised lowercase status string
 */
export function generateVehicleRequestPDF(src, status) {
  const content = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>Vehicle Request – ${src.name || "Request"}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}@page{size:A4;margin:24mm 20mm}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;background:white;font-size:12px}
  .header{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:16px;border-bottom:2px solid #3b82f6;margin-bottom:20px}
  .header-left h1{font-size:18px;font-weight:700;color:#1d4ed8;margin-bottom:2px}
  .header-left p{font-size:10px;color:#64748b}.header-right{text-align:right}
  .ref{font-family:monospace;font-size:10px;color:#64748b;margin-bottom:4px}
  .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:10px;font-weight:700;text-transform:uppercase}
  .badge.approved{background:#d1fae5;color:#065f46}.badge.pending{background:#fef3c7;color:#92400e}
  .badge.disapproved,.badge.rejected{background:#fee2e2;color:#991b1b}.badge.cancelled{background:#f1f5f9;color:#475569}
  .section{margin-top:18px;margin-bottom:6px;display:flex;align-items:center;gap:8px}
  .section-title{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#3b82f6;white-space:nowrap}
  .section-line{flex:1;height:1px;background:#dbeafe}
  table{width:100%;border-collapse:collapse}
  td{padding:5px 4px;font-size:11px;border-bottom:1px dashed #e2e8f0;vertical-align:top}
  td.lbl{color:#94a3b8;font-weight:600;text-transform:uppercase;font-size:9.5px;letter-spacing:.06em;width:38%;white-space:nowrap;padding-right:12px}
  td.val{color:#1e293b;font-weight:500}
  .footer{margin-top:28px;padding-top:10px;border-top:1px solid #e2e8f0;text-align:center;font-size:9px;color:#94a3b8}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="header">
  <div class="header-left">
    <h1>Vehicle Request</h1>
    <p>DNSC Motor Pool Services Unit</p>
  </div>
  <div class="header-right">
    <div class="ref">REF# ${src.referenceNo || "N/A"}</div>
    <div class="ref">Submitted: ${src.timestamp || "—"}</div>
    <span class="badge ${status}">${src.status || "Pending"}</span>
  </div>
</div>

<div class="section"><span class="section-title">Requester Information</span><div class="section-line"></div></div>
<table>
  <tr><td class="lbl">Name</td><td class="val">${src.name || "—"}</td></tr>
  <tr><td class="lbl">Email</td><td class="val">${src.email || "—"}</td></tr>
  <tr><td class="lbl">Department</td><td class="val">${src.department || "—"}</td></tr>
  <tr><td class="lbl">Immediate Head</td><td class="val">${src.immediateHead || "—"}</td></tr>
  <tr><td class="lbl">Mobile</td><td class="val">${src.mobile || "—"}</td></tr>
</table>

<div class="section"><span class="section-title">Travel Details</span><div class="section-line"></div></div>
<table>
  <tr><td class="lbl">Date of Travel</td><td class="val">${src.dateOfTravel || "—"}</td></tr>
  <tr><td class="lbl">Destination</td><td class="val">${src.destination || "—"}</td></tr>
  <tr><td class="lbl">Waiting Area</td><td class="val">${src.waitingArea || "—"}</td></tr>
  <tr><td class="lbl">Departure</td><td class="val">${fmt12(src.departureTime)}</td></tr>
  <tr><td class="lbl">Expected Return</td><td class="val">${fmt12(src.expectedReturn)}</td></tr>
  <tr><td class="lbl">Purpose</td><td class="val">${src.purpose || "—"}</td></tr>
</table>

<div class="section"><span class="section-title">Passengers</span><div class="section-line"></div></div>
<table>
  <tr><td class="lbl">Count</td><td class="val">${src.numPassengers || "—"}</td></tr>
  <tr><td class="lbl">Names</td><td class="val">${(src.passengerNames || "—").replace(/\n/g, ", ")}</td></tr>
  <tr><td class="lbl">Project Based</td><td class="val">${src.projectBased || "—"}</td></tr>
  ${
    src.projectBased === "Yes"
      ? `<tr><td class="lbl">Funding Type</td><td class="val">${src.fundingType || "—"}</td></tr>`
      : ""
  }
</table>

${
  src.adminRemarks
    ? `<div style="margin-top:18px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px 16px">
        <p style="color:#1d4ed8;font-size:11px;font-weight:700;margin-bottom:4px">Admin Remarks</p>
        <p style="color:#1e40af;font-size:10px;line-height:1.6">${src.adminRemarks}</p>
       </div>`
    : ""
}

${
  status === "approved" && (src.driver || src.vehicle)
    ? `<div style="margin-top:18px;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;padding:12px 16px">
        <p style="color:#065f46;font-size:11px;font-weight:700;margin-bottom:8px">Request Approved</p>
        <div style="display:flex;gap:24px">
          ${src.vehicle ? `<div><p style="font-size:9px;text-transform:uppercase;color:#64748b;font-weight:700">Vehicle</p><p style="font-size:12px;font-weight:700;color:#065f46">${src.vehicle}</p></div>` : ""}
          ${src.driver ? `<div><p style="font-size:9px;text-transform:uppercase;color:#64748b;font-weight:700">Driver</p><p style="font-size:12px;font-weight:700;color:#065f46">${src.driver}</p></div>` : ""}
        </div>
       </div>`
    : ""
}

<div class="footer">Generated by DNSC Vehicle Scheduling System · Official vehicle request document.</div>
<script>window.onload = function(){ window.print(); }</script>
</body></html>`;

  const blob = new Blob([content], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (!win) alert("Please allow pop-ups to download the PDF.");
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}