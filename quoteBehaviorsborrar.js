document.addEventListener("DOMContentLoaded", () => {
  const savedMode = localStorage.getItem("lastInteractionType");
  const modeSelect = document.getElementById("interactionType");

  if (savedMode && modeSelect) {
    modeSelect.value = savedMode;
    switchEvaluatorMode(); // ← Esto activa el modo guardado al cargar
  }


  // R&R Toggle
  document.querySelectorAll('input[name="rrOption"]').forEach(radio => {
    radio.addEventListener("change", toggleRRCost);
  });

  // FMV Toggle
  document.querySelectorAll('input[name="fmvOption"]').forEach(radio => {
    radio.addEventListener("change", toggleFMVDetails);
  });

  // Quote Total Update
  ["quoteAmount", "rrAmount"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateQuoteTotal);
  });

  // Settlement trigger (solo calcula monto)
  ["lolValueQuote", "remainingLOLQuote", "quoteTotal", "fmvAmountQuote"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", handleSettlementAmount);
  });

  document.querySelectorAll('input[name="lolTypeQuote"]').forEach(radio => {
    radio.addEventListener("change", handleSettlementAmount);
  });

  document.querySelectorAll('input[name="fmvOption"]').forEach(radio => {
    radio.addEventListener("change", () => {
      toggleFMVDetails();
      handleSettlementAmount();
    });
  });

  document.getElementById("resolutionQuote").addEventListener("change", () => {
    handleSettlementAmount();
    updateAgentDrivenRecommendation();
  });

  document.getElementById("replacementReason").addEventListener("change", updateAgentDrivenRecommendation);
  document.getElementById("settlementAmountQuote").addEventListener("input", updateAgentDrivenRecommendation);
  document.getElementById("expirationDate").addEventListener("input", updateAgentDrivenRecommendation);

  // Initial Render
  toggleRRCost();
  toggleFMVDetails();
  updateQuoteTotal();
});

function toggleRRCost() {
  const showRR = radio("rrOption") === "yes";
  document.getElementById("rrAmountContainer").style.display = showRR ? "block" : "none";
}

function toggleFMVDetails() {
  const showFMV = radio("fmvOption") === "yes";
  document.getElementById("fmvDetailsContainer").style.display = showFMV ? "block" : "none";
}

function updateQuoteTotal() {
  const base = parseFloat(val("quoteAmount")) || 0;
  const rr = radio("rrOption") === "yes" ? parseFloat(val("rrAmount")) || 0 : 0;
  document.getElementById("quoteTotal").value = (base + rr).toFixed(2);
}

function handleSettlementAmount() {
  const resolution = val("resolutionQuote");
  const lolType = radio("lolTypeQuote");
  const lol = parseFloat(val("lolValueQuote")) || 0;
  const remLOL = parseFloat(val("remainingLOLQuote")) || 0;
  const totalQuote = parseFloat(val("quoteTotal")) || 0;
  const rrAmount = parseFloat(val("rrAmount")) || 0;
  const fmvEnabled = radio("fmvOption") === "yes";
  const fmvAmount = parseFloat(val("fmvAmountQuote")) || 0;

  const container = document.getElementById("settlementContainerQuote");
  const field = document.getElementById("settlementAmountQuote");

  const triggerResolutions = ["Approve Replacement", "Store Credit", "Cash Settlement"];
  if (!triggerResolutions.includes(resolution)) {
    container.style.display = "none";
    field.value = "";
    return;
  }

  container.style.display = "block";

  const baseLOL = lolType === "FV-C" ? remLOL : lol;
  let approvedAmount = 0;

  if (fmvEnabled) {
    approvedAmount = fmvAmount;
    field.value = approvedAmount.toFixed(2);
    return;
  }

  if (resolution === "Approve Replacement") {
    approvedAmount = totalQuote;
    const totalExcludingRR = totalQuote - rrAmount;
    if (totalExcludingRR > baseLOL) {
      field.value = "";
      alert("Unable to process replacement for amount higher than Remaining LOL (excluding R&R).");
      return;
    }
  } else {
    approvedAmount = baseLOL;
  }

  field.value = approvedAmount.toFixed(2);
}

function generateFinalRecommendationQuote() {
  const resolution = val("resolutionQuote");
  const reason = val("replacementReason");
  const monthsRemaining = calculateESPMonthsLeft() || 0;

  const nationwide = radio("nationwideOption") === "yes";
  const fmvEnabled = radio("fmvOption") === "yes";

  const quoteAmount = parseFloat(val("quoteAmount")) || 0;
  const rrAmount = parseFloat(val("rrAmount")) || 0;
  const totalQuote = quoteAmount + rrAmount;

  const lolType = radio("lolTypeQuote");
  const lol = parseFloat(val("lolValueQuote")) || 0;
  const remainingLOL = parseFloat(val("remainingLOLQuote")) || 0;
  const baseLOL = lolType === "FV-C" ? remainingLOL : lol;
  const fmvAmount = parseFloat(val("fmvAmountQuote")) || 0;

  // Casos especiales
  if (resolution === "Second Dispatch") {
    document.getElementById("finalDecisionQuote").value = "Final recommendation is to approve second dispatch.";
    showConfirmation();
    return;
  }

  if (resolution === "Denied") {
    document.getElementById("finalDecisionQuote").value = "Final recommendation is to not cover claim.";
    showConfirmation();
    return;
  }

  let finalRes = resolution;
  let approvedAmount = parseFloat(val("settlementAmountQuote")) || 0;

  // Si no hay resolución seleccionada, usar lógica del sistema
  if (!resolution || !reason || approvedAmount <= 0) {
    if (fmvEnabled) {
      finalRes = "Cash Settlement";
      approvedAmount = fmvAmount;
    } else if (nationwide) {
      if (totalQuote <= baseLOL) {
        finalRes = "Dealer Replacement";
        approvedAmount = totalQuote;
      } else {
        finalRes = "Cash Settlement";
        approvedAmount = baseLOL;
      }
    } else {
      if (totalQuote <= baseLOL) {
        finalRes = "Dealer Replacement";
        approvedAmount = totalQuote;
      } else {
        finalRes = "Store Credit";
        approvedAmount = baseLOL;
      }
    }
  }

  const resText = finalRes.toLowerCase();
  const decision = `Final recommendation is to approve ${resText} for $${approvedAmount.toFixed(2)}, ${reason}, with ${monthsRemaining} months left on ESP, ${resText} is the best option available.`;

  document.getElementById("finalDecisionQuote").value = decision;
  showConfirmation();
}

function updateAgentDrivenRecommendation() {
  const resolution = val("resolutionQuote");
  const reason = val("replacementReason");
  const monthsRemaining = calculateESPMonthsLeft() || 0;
  const amount = parseFloat(val("settlementAmountQuote")) || 0;

  if (resolution === "Second Dispatch") {
    document.getElementById("finalDecisionQuote").value = "Final recommendation is to approve second dispatch.";
    return;
  }

  if (resolution === "Denied") {
    document.getElementById("finalDecisionQuote").value = "Final recommendation is to not cover claim.";
    return;
  }

  if (!resolution || !reason || amount <= 0) return;

  const resText = resolution.toLowerCase();
  const decision = `Final recommendation is to approve ${resText} for $${amount.toFixed(2)}, ${reason}, with ${monthsRemaining} months left on ESP, ${resText} is the best option available.`;
  document.getElementById("finalDecisionQuote").value = decision;
}
function showConfirmation() {
  const bar = document.getElementById("recommendationConfirmation");
  if (!bar) return;
  bar.textContent = "✅ Recommendation generated";
  bar.style.display = "inline";
  setTimeout(() => {
    bar.style.display = "none";
  }, 2000);
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function radio(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  return selected ? selected.value : "";
}