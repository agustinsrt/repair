document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.getElementById("copyButton");
  if (trigger) {
    trigger.addEventListener("click", copyToClipboard);
  }
});

function showResults() {
  const mode = document.getElementById("interactionType").value;
  let resultsText = "";

  if (mode === "estimate") {
    resultsText = generateEstimateResults();
  } else if (mode === "phone") {
    resultsText = generateInteractionResults("Phone");
  } else if (mode === "email") {
    resultsText = generateInteractionResults("Email");
  } else if (mode === "quote") {
    resultsText = generateQuoteResults();
  }

  const resultsField = document.getElementById("results");
  resultsField.value = resultsText;
  updateLineNumbers(resultsText);
}

// 🧮 Estimate Mode (estructura original preservada)
function generateEstimateResults() {
  const authNumber = val("authNumber") || "";
  const svcName = val("svcName") || "";
  const model = val("model") || "";
  const serial = val("serial") || "";

  const physicalDamage = radio("physicalDamage") === "yes"
    ? "PHYSICAL DAMAGE / ABUSE: YES"
    : "NO PHYSICAL DAMAGE / ABUSE";

  const complaint = val("complaint") || "";
  const techDiag = val("techDiag") || "";

  const laborType = radio("laborType") || "Labor";
  const laborCost = parseFloat(val("laborCost")) || 0;
  const laborFormatted = `$${laborCost.toFixed(2)}`.padEnd(12) + laborType;

  const rrCost = parseFloat(val("rrCost")) || 0;
  const mileageCost = parseFloat(val("mileageCost")) || 0;
  const taxesCost = parseFloat(val("taxes")) || 0;
  const shCost = parseFloat(val("shCost")) || 0;

  let svcPartsTotal = 0;
  let svcRows = Array.from(document.querySelectorAll('#svcTable tbody tr')).map(row => {
    const partCost = parseFloat(row.querySelector("td input[placeholder='Cost']")?.value) || 0;
    const quantity = parseInt(row.querySelector("td input[placeholder='Qty']")?.value) || 1;
    const partNumber = row.querySelector("td input[placeholder='Number']")?.value || "";
    const partName = row.querySelector("td input[placeholder='Name']")?.value || "";

    svcPartsTotal += partCost * quantity;
    const quantityStr = quantity > 1 ? ` (${quantity}pc $${partCost.toFixed(2)} each)` : "";
    return `$${(partCost * quantity).toFixed(2)}`.padEnd(12) + partNumber.padEnd(15) + partName + quantityStr;
  }).join("\n");

  const svcTotal = svcPartsTotal + laborCost + rrCost + mileageCost + taxesCost + shCost;

  let ctrPartsTotal = 0;
  let ctrRows = Array.from(document.querySelectorAll('#ctrTable tbody tr')).map(row => {
    const partCost = parseFloat(row.querySelector("td input[placeholder='Cost']")?.value) || 0;
    const quantity = parseInt(row.querySelector("td input[placeholder='Qty']")?.value) || 1;
    const partNumber = row.querySelector("td input[placeholder='Number']")?.value || "";
    const partName = row.querySelector("td input[placeholder='Name']")?.value || "";

    ctrPartsTotal += partCost * quantity;
    const quantityStr = quantity > 1 ? ` (${quantity}pc $${partCost.toFixed(2)} each)` : "";
    return `$${(partCost * quantity).toFixed(2)}`.padEnd(12) + partNumber.padEnd(15) + partName + quantityStr;
  }).join("\n");

  const ctrTotal = ctrPartsTotal + laborCost + rrCost + mileageCost + taxesCost + shCost;

  const lolType = radio("lolType") || "No LOL Type selected";
  const lolValue = parseFloat(val("applianceValue")) || 0;
  const previousClaims = parseFloat(val("previousClaims")) || 0;
  const remainingLOL = lolType === "FV-C" ? (lolValue - previousClaims) : null;

  const mfgCoverage = document.getElementById("noMfgCoverage").checked
    ? "NO ADDITIONAL MFG COVERAGE"
    : val("mfgCoverage");

  const finalRecommendation = val("finalRecommendation") || "";

  let formattedRecommendation = finalRecommendation.includes("Best option is to evaluate alternate resolution")
    ? finalRecommendation
    : `FINAL RECOMMENDATION IS TO ${finalRecommendation}`.trim();

  let results = `
AUTH: ${authNumber}
RECEIVED AN RFA FROM ${svcName}
MODEL: ${model}
SERIAL: ${serial}
${physicalDamage}
COMPLAINT: ${complaint}
TECH'S DIAG: ${techDiag}
${(radio("unrepairable") === "yes" && val("techlineCase"))
  ? `Techline Case #: ${val("techlineCase")}`
  : ""}
SVC ESTIMATE:
${laborFormatted}
${rrCost > 0 ? `$${rrCost.toFixed(2)}`.padEnd(12) + "RR" : ""}
${mileageCost > 0 ? `$${mileageCost.toFixed(2)}`.padEnd(12) + "MILEAGE" : ""}
${taxesCost > 0 ? `$${taxesCost.toFixed(2)}`.padEnd(12) + "TAXES" : ""}
${shCost > 0 ? `$${shCost.toFixed(2)}`.padEnd(12) + "S&H" : ""}
${svcRows}
$${svcTotal.toFixed(2).padEnd(12)} TOTAL SVC ($${svcPartsTotal.toFixed(2)} PARTS)

CTR ESTIMATE:
${laborFormatted}
${rrCost > 0 ? `$${rrCost.toFixed(2)}`.padEnd(12) + "RR" : ""}
${mileageCost > 0 ? `$${mileageCost.toFixed(2)}`.padEnd(12) + "MILEAGE" : ""}
${taxesCost > 0 ? `$${taxesCost.toFixed(2)}`.padEnd(12) + "TAXES" : ""}
${shCost > 0 ? `$${shCost.toFixed(2)}`.padEnd(12) + "S&H" : ""}
${ctrRows}
$${ctrTotal.toFixed(2).padEnd(12)} TOTAL CTR ($${ctrPartsTotal.toFixed(2)} PARTS)

LOL: ${lolType}
LOL VALUE: $${lolValue.toFixed(2)}
PREVIOUS CLAIMS: $${previousClaims.toFixed(2)}
${remainingLOL !== null ? `Remaining LOL: $${remainingLOL.toFixed(2)}` : ""}
MFG COVERAGE:
${mfgCoverage}

${formattedRecommendation}`.replace(/\n{2,}/g, "\n").trim();

  return results;
}
// ☎️ or 📧 Interaction Mode
function generateInteractionResults(mode) {
  const auth = val("authNumberInteraction") || val("authNumber");
  const svc = val("svcName");
  const model = val("model");
  const serial = val("serial");
  const contactReason = val("contactReason");
  const notes = val("agentNotesInteraction");

  if (mode === "Phone") {
    const callerName = val("callerName");
    return `AUTH: ${auth}
Received Call From ${callerName} with ${svc}
Reason: ${contactReason}
MODEL: ${model}
SERIAL: ${serial}

NOTES:
${notes}`;
  }

  // Email mode
  return `AUTH: ${auth}
Received email From ${svc}
Reason: ${contactReason}
MODEL: ${model}
SERIAL: ${serial}

NOTES:
${notes}`;
}

// 🧾 Quote Mode
function generateQuoteResults() {
  const receivedFrom = val("receivedFrom");
  const model = val("replacementModel");
  const quoteAmount = val("quoteAmount");
  const rrOption = radio("rrOption");
  const rrAmount = val("rrAmount");
  const total = val("quoteTotal");
  const lolType = val("lolTypeQuote");
  const lolVal = val("lolValueQuote");
  const prevClaims = val("previousClaimsQuote");
  const remLOL = val("remainingLOLQuote");
  const finalRec = val("finalDecisionQuote");

  let result = `Received Replacement Quote from: ${receivedFrom}
Replacement Model: ${model}
Replacement Quote: $${quoteAmount}`;

  if (rrOption === "yes") {
    result += `\nR&R: $${rrAmount}`;
  }

  result += `\nTotal: $${total}
LOL Type: ${lolType}
LOL Value: $${lolVal}
Previous Claims: $${prevClaims}`;

  if (lolType.toUpperCase().includes("FV-C")) {
    result += `\nRemaining LOL: $${remLOL}`;
  }

  result += `\n\nFinal Decision:\n${finalRec}`;

  return result;
}

// 🧠 Helpers
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function radio(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : "";
}

function updateLineNumbers(text) {
  const lines = text.split("\n").length;
  const numberField = document.getElementById("lineNumbers");
  if (numberField) {
    numberField.textContent = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
  }
}

function copyToClipboard() {
  const textarea = document.getElementById("results");
  if (!textarea) return;

  textarea.select();
  document.execCommand("copy");

  const confirm = document.getElementById("saveConfirmation");
  if (confirm) {
    confirm.style.display = "inline";
    setTimeout(() => (confirm.style.display = "none"), 1500);
  }
}