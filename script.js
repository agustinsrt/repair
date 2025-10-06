
let startTime = null;
let timerInterval = null;

function startTimer() {
  if (!startTime) {
    startTime = performance.now();
    timerInterval = setInterval(updateTimerDisplay, 1000);
  }
}

function stopTimerAndGetDuration() {
  if (startTime !== null) {
    const elapsed = Math.floor((performance.now() - startTime) / 1000);
    clearInterval(timerInterval);
    timerInterval = null;
    startTime = null;

    const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
    const seconds = (elapsed % 60).toString().padStart(2, "0");
    document.getElementById("timerDisplay").textContent = "00:00";

    return `${minutes}:${seconds}`;
  }
  return null;
}

function updateTimerDisplay() {
  const elapsed = Math.floor((performance.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const seconds = (elapsed % 60).toString().padStart(2, "0");
  document.getElementById("timerDisplay").textContent = `${minutes}:${seconds}`;
}

document.getElementById("approveSvcButton").addEventListener("click", () => {
  selectedDecision = "Approved SVC";
  selectedAmount = parseFloat(document.getElementById("approveSvcAmount").value) || 0;
  guardarLog(); // 👈 tu función actual de guardado
});

document.getElementById("approveCtrButton").addEventListener("click", () => {
  selectedDecision = "Approved CTR";
  selectedAmount = parseFloat(document.getElementById("approveCtrAmount").value) || 0;
  guardarLog();
});

document.getElementById("closeForDiagButton").addEventListener("click", () => {
  selectedDecision = "Closed for Diag";
  selectedAmount = parseFloat(document.getElementById("closeForDiagAmount").value) || 0;
  guardarLog();
});

document.getElementById("authNumber").addEventListener("input", startTimer);

//NUEVO BOTON SAVE AND NEW
let selectedDecision = null;
  let selectedAmount = null;

  // Escucha los botones de decisión
  document.getElementById("approveSvcButton").addEventListener("click", () => {
    selectedDecision = "Approved SVC";
    selectedAmount = parseFloat(document.getElementById("approveSvcAmount").value) || 0;
  });

  document.getElementById("approveCtrButton").addEventListener("click", () => {
    selectedDecision = "Approved CTR";
    selectedAmount = parseFloat(document.getElementById("approveCtrAmount").value) || 0;
  });

  document.getElementById("closeForDiagButton").addEventListener("click", () => {
    selectedDecision = "Closed for Diag";
    selectedAmount = parseFloat(document.getElementById("closeForDiagAmount").value) || 0;
  });

  // Botón final de guardado
  document.getElementById("saveAndNewButton").addEventListener("click", async () => {
    const user = await getAgentUsername();
    const authNumber = document.getElementById("authNumber")?.value.trim() || "";
    const resultsText = document.getElementById("results")?.value.trim() || "";
    const resultsHtml = document.getElementById("lolResults")?.innerHTML || "";
    const duration = stopTimerAndGetDuration();

    

    if (!selectedDecision) {
      alert("⚠️ Primero presiona uno de los botones: Approve SVC, CTR o Close for Diag.");
      return;
    }

    if (!authNumber) {
      alert("⚠️ Falta el campo Auth Number.");
      return;
    }

    const logEntry = {
  authNumber,
  timestamp: new Date().toISOString(),
  resultsText,
  resultsHtml,
  decision: selectedDecision,
  amount: selectedAmount,
  duration // se guarda como "mm:ss"
};

    const saveRes = await fetch(`/logs/${user}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(logEntry)
    });

    if (saveRes.ok) {
  alert("✅ Log guardado correctamente.");

  // Scroll al top de forma suave
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Esperar hasta que la animación termine antes de hacer reload
  setTimeout(() => {
    window.location.reload();
  }, 700); // ajusta este valor si tu página es muy corta o muy larga
} else {
  alert("⚠️ Error al guardar log.");
}
  });

  async function getAgentUsername() {
    const res = await fetch("/get_agent_info");
    if (res.ok) {
      const data = await res.json();
      return data.name;
    } else {
      return "unknown";
    }
  }



document.addEventListener("input", (event) => {
    if ((event.target.tagName === "INPUT" && event.target.type === "text") || event.target.tagName === "TEXTAREA") {
        const current = event.target.value;
        const upper = current.toUpperCase();
        if (current !== upper) {
            const start = event.target.selectionStart;
            event.target.value = upper;
            event.target.selectionStart = event.target.selectionEnd = start;
        }
    }
});

// Función para formatear valores generados por el sistema
function formatToUpperCase(text) {
    return text.toUpperCase();
}

// Inicializar variables clave al cargar la página
let currentLogDate = new Date().toLocaleDateString(); // Fecha actual
let savedLogDate = localStorage.getItem('currentLogDate') || ""; // Fecha guardada previamente
let dailyLog = localStorage.getItem('dailyLog') || ""; // Log acumulado guardado previamente

// Verificar si ha cambiado el día al cargar la página
if (currentLogDate !== savedLogDate) {
    dailyLog = ""; // Reinicia el log si el día ha cambiado
    localStorage.setItem('dailyLog', dailyLog); // Guardar el nuevo log vacío en LocalStorage
    localStorage.setItem('currentLogDate', currentLogDate); // Guardar la nueva fecha actual en LocalStorage
    console.log("El log fue reiniciado automáticamente al cargar la página.");
}

// Inicializar valores con verificación en LocalStorage
const initializeStorage = (key, defaultValue) => {
    if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, defaultValue);
    }
};

// Inicializar las variables necesarias
initializeStorage("totalTimeSpent", "0");
initializeStorage("claimsProcessed", "0");
initializeStorage("compQuoteRequests", "0");
initializeStorage("svcApprovals", "0");
initializeStorage("svcTotalAmount", "0");
initializeStorage("ctrApprovals", "0");
initializeStorage("ctrTotalAmount", "0");

// Variables globales acumulativas
let totalTimeSpent = parseFloat(localStorage.getItem("totalTimeSpent"));
let claimsProcessed = parseInt(localStorage.getItem("claimsProcessed"));
let compQuoteRequests = parseInt(localStorage.getItem("compQuoteRequests"));
let svcApprovals = parseInt(localStorage.getItem("svcApprovals"));
let svcTotalAmount = parseFloat(localStorage.getItem("svcTotalAmount"));
let ctrApprovals = parseInt(localStorage.getItem("ctrApprovals"));
let ctrTotalAmount = parseFloat(localStorage.getItem("ctrTotalAmount"));
let totalRepair = svcTotalAmount + ctrTotalAmount;    

window.onload = function () {
    // Ejecutar las funciones existentes
    toggleField('mileageCost', 'noMileage');
    toggleField('rrCost', 'noRR');
    updateTotals(); // Actualizar los cálculos

    // Precargar montos de SVC, CTR y Labor
    document.getElementById("approveSvcAmount").value = parseFloat(document.getElementById("svcSubtotal").textContent.replace("$", "")) || 0;
        document.getElementById("approveCtrAmount").value = parseFloat(document.getElementById("ctrSubtotal").textContent.replace("$", "")) || 0;
        document.getElementById("closeForDiagAmount").value = parseFloat(document.getElementById("laborCost").value) || 0;
    

};


//quitar espacios en blanco del campo de correo electrónico
document.getElementById("svcEmail").addEventListener("input", function() {
    this.value = this.value.replace(/\s+/g, "");
});



document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener("input", () => {
        if (!input.value.match(/^\d*\.?\d*$/)) { // 🔥 Permite números con punto decimal
            input.value = input.value.replace(",", "."); // 🔥 Corrige comas a puntos si es necesario
        }
    });
});

function loadAgentInfo() {
    // Llama al servidor para obtener el nombre del agente
    fetch('/get_agent_info')
        .then(response => response.json())
        .then(agentData => {
            const agentNameElement = document.getElementById("agentName");
            agentNameElement.textContent = agentData.name || "Unknown Agent"; // Actualiza dinámicamente el nombre
        })
        .catch(error => {
            console.error("Error fetching agent info:", error);
        });
}

// Ejecutar la función al cargar la página
document.addEventListener("DOMContentLoaded", loadAgentInfo);



function openPopup(url, title) {
  // Configuración de la ventana emergente
  const width = 800;  // Ancho de la ventana
  const height = 600; // Altura de la ventana
  const left = (window.screen.width - width) / 2; // Centrar horizontalmente
  const top = (window.screen.height - height) / 2; // Centrar verticalmente

  // Abrir la ventana emergente
  const popup = window.open(url, title, `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`);

  // Verificar que la ventana se abrió correctamente
  if (!popup) {
    alert("No se pudo abrir la ventana del recurso. Verifica los permisos del navegador.");
  }
}



function openContract() {
  const authNumber = document.getElementById('authNumber').value.trim(); // Obtén el valor y elimina espacios

  if (authNumber && authNumber.length >= 7) {
    const firstSevenChars = authNumber.slice(0, 7); // Toma los primeros 7 caracteres
    const url = `http://www.bankerswarrantygroup.com/WebServices/TandCWeb/PopupTandC.aspx?P=${encodeURIComponent(firstSevenChars)}`;
    
    // Abrir el vínculo en una nueva ventana con dimensiones específicas
    window.open(url, '_blank', 'width=800,height=600,resizable=yes');
  } else {
    alert("Por favor, ingresa al menos 7 caracteres en el Authorization Number."); // Mensaje de advertencia si no cumple el requisito
  }
}

// Formatear automáticamente el valor de authNumber
document.getElementById('authNumber').addEventListener('input', () => {
  const input = document.getElementById('authNumber');
  const value = input.value.replace(/\s+/g, ''); // Elimina espacios existentes

  if (value.length > 7) {
    // Separar en dos partes: primeros 7 caracteres y el resto
    const firstPart = value.substring(0, 7);
    const secondPart = value.substring(7);
    input.value = `${firstPart} ${secondPart}`; // Actualizar el campo con el formato correcto
  }
});

// muestra la info del svc
async function getSVCInfo() {
    const svcNameInput = document.getElementById('svcName');
    const query = svcNameInput.value.trim();
    
    try {
        const response = await fetch(`/svc?query=${encodeURIComponent(query)}`);
        const resultsContainer = document.createElement('div'); // Popup container

        if (response.ok) {
            const svcList = await response.json();

            if (svcList.length === 1) {
                // Si hay una coincidencia exacta, muestra su información
                const svc = svcList[0];
                resultsContainer.innerHTML = `
                    <h2>${svc.svc_name} (${svc.svc_code})</h2>
                    <p><strong>Preauthorization Amount:</strong> ${svc.preauthorization_amount}</p>
                    <p><strong>Diagnostic Fee:</strong> ${svc.diagnostic_fee}</p>
                    <p><strong>Labor:</strong> ${svc.labor}</p>
                    <p><strong>Major/Sealed System Labor:</strong> ${svc.major_sealed_system_labor}</p>
                    <p><strong>Shipping Address:</strong> ${svc.shipping_address}</p>
                                    `;
            } else {
                // Si no hay coincidencias exactas, muestra la lista completa
                resultsContainer.innerHTML = `
                    <h2>Select an SVC</h2>
                    <ul>
                        ${svcList.map(svc => `
                            <li>
                                <button onclick="loadSVCDetails('${svc.svc_code}')">
                                    ${svc.svc_name} (${svc.svc_code})
                                </button>
                            </li>
                        `).join('')}
                    </ul>
                    
                `;
            }
        } else {
            alert("An error occurred while searching for SVCs.");
        }

        // Mostrar el popup con los resultados
        showPopup(resultsContainer);
    } catch (error) {
        console.error("Error fetching SVCs:", error);
        alert("An error occurred while searching for SVCs.");
    }
}

// Muestra un popup en la pantalla
function showPopup(content) {
  const existingPopup = document.getElementById('popup');
  if (existingPopup) existingPopup.remove();

  const popup = document.createElement('div');
  popup.id = 'popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.background = '#fff';
  popup.style.border = '1px solid #ddd';
  popup.style.padding = '0';
  popup.style.zIndex = '1000';
  popup.style.width = '600px';
  popup.style.maxWidth = '90vw';
  popup.style.maxHeight = '70vh';
  popup.style.display = 'flex';
  popup.style.flexDirection = 'column';
  popup.style.borderRadius = '8px';
  popup.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';

  // Contenedor desplazable del contenido
  const scrollable = document.createElement('div');
  scrollable.style.overflowY = 'auto';
  scrollable.style.padding = '20px';
  scrollable.style.flex = '1';
  scrollable.innerHTML = content.innerHTML;

  // Botón de cierre fijo abajo
  const footer = document.createElement('div');
  footer.style.borderTop = '1px solid #eee';
  footer.style.padding = '10px 20px';
  footer.style.textAlign = 'right';
  footer.style.background = '#f9f9f9';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'orange';
  closeBtn.textContent = 'Close';
  closeBtn.onclick = closePopup;

  footer.appendChild(closeBtn);
  popup.appendChild(scrollable);
  popup.appendChild(footer);

  document.body.appendChild(popup);
}

// Cierra el popup
function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.remove(); // Elimina el elemento del DOM directamente
    }
}

// Carga los detalles completos de un SVC específico (cuando el usuario selecciona de la lista)
async function loadSVCDetails(svcCode) {
    try {
        const response = await fetch(`/svc/${svcCode}`);
        if (response.ok) {
            const svc = await response.json();
            const svcDetails = document.createElement('div');
            svcDetails.innerHTML = `
                <h2>${svc.svc_name} (${svc.svc_code})</h2>
                <p><strong>Preauthorization Amount:</strong> ${svc.preauthorization_amount}</p>
                <p><strong>Diagnostic Fee:</strong> ${svc.diagnostic_fee}</p>
                <p><strong>Labor:</strong> ${svc.labor}</p>
                <p><strong>Major/Sealed System Labor:</strong> ${svc.major_sealed_system_labor}</p>
                <p><strong>Shipping Address:</strong> ${svc.shipping_address}</p>
                            `;

            showPopup(svcDetails);
        } else {
            alert("Failed to load SVC details.");
        }
    } catch (error) {
        console.error("Error loading SVC details:", error);
    }
}

function searchModel() {
  const model = document.getElementById('model').value; // Toma el valor del campo "model"
  if (model) {
    const query = `${model} manual`; // Construye el término de búsqueda

    // Abre la búsqueda en una nueva ventana con dimensiones específicas
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      '_blank',
      'width=800,height=600,resizable=yes'
    );
  } else {
    alert("Please enter a model number."); // Mensaje si no se ingresa un modelo
  }
}

// Función para eliminar una fila
function updateTotals() {
    // Variables para SVC
    let svcLabor = parseFloat(document.getElementById('laborCost').value) || 0;
    let svcMileage = parseFloat(document.getElementById('mileageCost').value) || 0;
    let svcRR = parseFloat(document.getElementById('rrCost').value) || 0;
    
    let svcTotal = svcLabor + svcMileage + svcRR;
    let svcPartsTotal = 0;

    // Recolectar partes en SVC y calcular el costo total
    const svcRows = document.querySelectorAll("#svcTable tbody tr");
    svcRows.forEach((row) => {
        const partCostField = row.querySelector("td input[placeholder='Cost']");
        const qtyField = row.querySelector("td input[placeholder='Qty']");
        const totalCostField = row.querySelector("td input[placeholder='Total Cost']");

        const partCost = parseFloat(partCostField?.value) || 0;
        const quantity = parseInt(qtyField?.value) || 1;

        const totalPartCost = partCost * quantity;
        svcPartsTotal += totalPartCost;

        // Actualizar el campo de Total Cost automáticamente
        totalCostField.value = totalPartCost.toFixed(2);
    });

    svcTotal += svcPartsTotal;

    // Actualizar el subtotal de SVC en el DOM
    const svcSubtotal = document.getElementById("svcSubtotal");
    svcSubtotal.innerHTML = `$${svcTotal.toFixed(2)}   SVC TOTAL <span style="font-size: 0.9em;">($${svcPartsTotal.toFixed(2)} parts)</span>`;

    // Variables para CTR
    let ctrLabor = svcLabor; 
    let ctrMileage = svcMileage; 
    let ctrRR = svcRR;
    let ctrPartsTotal = 0;

    const ctrRows = document.querySelectorAll("#ctrTable tbody tr");
    ctrRows.forEach((row) => {
        const partCostField = row.querySelector("td input[placeholder='Cost']");
        const qtyField = row.querySelector("td input[placeholder='Qty']");
        const totalCostField = row.querySelector("td input[placeholder='Total Cost']");

        const partCost = parseFloat(partCostField?.value) || 0;
        const quantity = parseInt(qtyField?.value) || 1;

        const totalPartCost = partCost * quantity;
        ctrPartsTotal += totalPartCost;

        // Actualizar el campo de Total Cost automáticamente
        totalCostField.value = totalPartCost.toFixed(2);
    });

    const ctrTotal = ctrPartsTotal + ctrLabor + ctrMileage + ctrRR;

    // Actualizar el subtotal de CTR en el DOM
    const ctrSubtotal = document.getElementById("ctrSubtotal");
    ctrSubtotal.innerHTML = `$${ctrTotal.toFixed(2)}   CTR TOTAL <span style="font-size: 0.9em;">($${ctrPartsTotal.toFixed(2)} parts)</span>`;

    // 🔹 Precargar los valores en los inputs de aprobación 🔹
    document.getElementById("approveSvcAmount").value = svcTotal.toFixed(2);
    document.getElementById("approveCtrAmount").value = ctrTotal.toFixed(2);
    document.getElementById("closeForDiagAmount").value = document.getElementById("laborCost").value || 0;
}

document.addEventListener("DOMContentLoaded", () => {
    toggleField('mileageCost', 'noMileage');
    toggleField('rrCost', 'noRR');
});

function toggleField(fieldId, checkboxId) {
    const field = document.getElementById(fieldId);
    const checkbox = document.getElementById(checkboxId);

    if (checkbox.checked) {
        field.disabled = true;
        field.value = ""; // Opcional: limpiar el valor si se deshabilita
    } else {
        field.disabled = false;
    }
}

/// Generar 3 filas por defecto en SVC y CTR al cargar la página
window.onload = function() {
    for (let i = 0; i < 3; i++) {
        addRow('svc');
        addRow('ctr');
    }
};

// Función para agregar una fila en SVC o CTR
function addRow(tableId) {
    const tableBody = document.querySelector(`#${tableId}Table tbody`);
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td><input type="number" placeholder="Cost" style="width: 90%;" oninput="updateTotals()" min="0"></td>
        <td><input type="number" placeholder="Qty" style="width: 50px;" oninput="updateTotals()" min="1" max="99" value="1"></td>
        <td><input type="number" placeholder="Total Cost" style="width: 90%;" readonly></td>
        <td><input type="text" placeholder="Number" style="width: 90%;"></td>
        <td><input type="text" placeholder="Name" style="width: 90%;"></td>
        <td style="display: flex; gap: 5px; justify-content: flex-start;">
            <button class="orange" onclick="searchEncompass(this)">Encompass</button>
            <button class="dark-gray" onclick="deleteRow(this)">Delete</button>
        </td>
    `;

    tableBody.appendChild(newRow);
}

// Función para eliminar una fila y actualizar los totales
function deleteRow(button) {
    const row = button.closest('tr');
    row.remove();
    updateTotals();
}

function addSVCTaxes() {
    const tableBody = document.querySelector(`#svcTable tbody`);
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td><input type="number" placeholder="Cost" style="width: 90%;" oninput="updateTotals()" min="0"></td>
        <td><input type="number" placeholder="Qty" style="width: 50px;" oninput="updateTotals()" min="1" max="99" value="1"></td>
        <td><input type="number" placeholder="Total Cost" style="width: 90%;" readonly></td>
        <td><input type="text" placeholder="Number" style="width: 90%;" value="Taxes" readonly></td> <!-- Número predefinido -->
        <td><input type="text" placeholder="Name" style="width: 90%;"></td> <!-- Nombre editable -->
        <td style="display: flex; gap: 5px; justify-content: flex-start;">
            <button class="dark-gray" onclick="deleteRow(this)">Delete</button> <!-- Botón de eliminar -->
        </td>
    `;

    tableBody.appendChild(newRow);
}

// Función para buscar una parte en Encompass
function searchEncompass(button) {
  const row = button.closest('tr'); // Encuentra la fila del botón clicado
  const partNumber = row.querySelector('td:nth-child(4) input').value; // Toma el valor del campo "Part Number"

  if (partNumber) {
    const url = `https://encompass.com/search?searchTerm=${encodeURIComponent(partNumber)}`;
    
    // Abrir en una nueva ventana con dimensiones específicas
    window.open(url, '_blank', 'width=800,height=600,resizable=yes');
  } else {
    alert("Por favor ingresa un número de parte antes de buscar.");
  }
}

function addShippingHandling() {
    const tableBody = document.querySelector(`#ctrTable tbody`);
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>
            <input 
                type="number" 
                placeholder="Cost" 
                style="width: 90%;" 
                oninput="updateTotals()" 
                min="0" 
                value="11.95"> <!-- Precargado con $11.95 -->
        </td>
        <td>
            <input 
                type="number" 
                placeholder="Qty" 
                style="width: 50px;" 
                oninput="updateTotals()" 
                min="1" 
                max="99" 
                value="1"> <!-- Valor predeterminado para Qty -->
        </td>
        <td>
            <input 
                type="number" 
                placeholder="Total Cost" 
                style="width: 90%;" 
                readonly> <!-- Solo lectura -->
        </td>
        <td>
            <input 
                type="text" 
                placeholder="Number" 
                style="width: 90%;" 
                value="S&H" 
                readonly> <!-- Número predefinido -->
        </td>
        <td>
            <input 
                type="text" 
                placeholder="Name" 
                style="width: 90%;"> <!-- Nombre editable -->
        </td>
        <td style="display: flex; gap: 5px; justify-content: flex-start;">
            <button class="dark-gray" onclick="deleteRow(this)">Delete</button> <!-- Botón de eliminar -->
        </td>
    `;

    tableBody.appendChild(newRow);

    // Llamar a updateTotals() inmediatamente después de agregar S&H
    updateTotals();
}

function addTaxes() {
    const tableBody = document.querySelector(`#ctrTable tbody`);
    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td><input type="number" placeholder="Cost" style="width: 90%;" oninput="updateTotals()" min="0"></td>
        <td><input type="number" placeholder="Qty" style="width: 50px;" oninput="updateTotals()" min="1" max="99" value="1"></td>
        <td><input type="number" placeholder="Total Cost" style="width: 90%;" readonly></td>
        <td><input type="text" placeholder="Number" style="width: 90%;" value="Taxes" readonly></td> <!-- Número predefinido -->
        <td><input type="text" placeholder="Name" style="width: 90%;"></td> <!-- Nombre editable -->
        <td style="display: flex; gap: 5px; justify-content: flex-start;">
            <button class="dark-gray" onclick="deleteRow(this)">Delete</button> <!-- Botón de eliminar -->
        </td>
    `;

    tableBody.appendChild(newRow);
}

function updateRepairPercentageWithLOL() {
  const previousRepairs = parseFloat(document.getElementById('previousClaims').value) || 0;
  const applianceValue = parseFloat(document.getElementById('applianceValue').value) || 0;

  if (applianceValue <= 0) {
    console.warn("El valor del electrodoméstico (LOL Value) no es válido. Deteniendo la ejecución.");
    document.getElementById('repairResults').textContent = "Enter a valid LOL Value to calculate.";
    return;
  }

  // Calcular el porcentaje de reparaciones previas respecto al valor del electrodoméstico
  const repairPercentage = (previousRepairs / applianceValue) * 100;
  console.log("Porcentaje de reparaciones calculado:", repairPercentage);

  // Mostrar el resultado de manera clara y manejando valores inválidos
  document.getElementById('repairResults').textContent = `${Math.round(repairPercentage)}%`;
}

async function calculateRepairPercentage() {
    console.log("Iniciando cálculo de reparación basado en valores dinámicos...");

    // Validar valores necesarios
    const previousClaims = parseFloat(document.getElementById('previousClaims').value) || 0; // Labor
    const lolValue = parseFloat(document.getElementById('applianceValue').value) || 0; // LOL

    if (lolValue <= 0) {
        console.warn("LOL Value está vacío o es inválido. Deteniendo el cálculo.");
        document.getElementById('repairResults').textContent = "Enter a valid LOL Value to calculate.";
        return;
    }

    const repairPercentage = (previousClaims / lolValue) * 100;
    console.log("Porcentaje de reparación calculado:", repairPercentage);

    try {
        console.log("Consultando el backend para obtener configuraciones dinámicas...");
        const response = await fetch("http://localhost:5000/configurations"); // Endpoint correcto
        if (!response.ok) {
            throw new Error(`Error en la respuesta del backend: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Respuesta completa del backend:", data);

        // Ajustar claves según el formato esperado del backend
        const lessThanOneYearPercentage = parseFloat(data['lessThanOneYearPercentage']);
        const moreThanOneYearPercentage = parseFloat(data['moreThanOneYearPercentage']);

        // Validación de valores dinámicos
        if (isNaN(lessThanOneYearPercentage) || isNaN(moreThanOneYearPercentage)) {
            console.error("Valores dinámicos obtenidos son inválidos:", {
                lessThanOneYearPercentage,
                moreThanOneYearPercentage,
            });
            document.getElementById('repairResults').textContent = "Error fetching dynamic percentages.";
            return;
        }

        console.log("Configuraciones dinámicas obtenidas:", {
            lessThanOneYearPercentage,
            moreThanOneYearPercentage,
        });

        // Calcular meses restantes en ESP
        const espMonthsLeft = calculateESPMonthsLeft(); // Función externa que calcula meses restantes
        let lolLimit;

        if (espMonthsLeft > 12) {
            lolLimit = moreThanOneYearPercentage; // Más de un año
        } else if (espMonthsLeft !== null && espMonthsLeft >= 0) {
            lolLimit = lessThanOneYearPercentage; // Menos de un año
        } else {
            console.warn("Fecha de expiración faltante o inválida.");
            document.getElementById('repairResults').textContent = "Missing or invalid expiration date. Please check.";
            return;
        }

        console.log("Límite dinámico aplicado (lolLimit):", lolLimit);

        // Generar recomendación final
        let finalRecommendation = "";
        let color = "";

        if (repairPercentage > lolLimit) {
            finalRecommendation = "REPLACEMENT RECOMMENDED";
            color = "red";
        } else {
            finalRecommendation = "REPAIR RECOMMENDED";
            color = "green";
        }

        document.getElementById('repairResults').innerHTML = `
            Repair Percentage: ${repairPercentage.toFixed(2)}%<br>
            <span style="color: ${color}; font-weight: bold;">${finalRecommendation}</span>
        `;
        console.log("Recomendación final mostrada:", finalRecommendation);
    } catch (error) {
        console.error("Error durante el proceso de cálculo:", error);
        document.getElementById('repairResults').textContent = "Error fetching configuration.";
    }
}
// Complemento: Calcular meses restantes en ESP
function calculateESPMonthsLeft() {
    const expirationDate = document.getElementById('expirationDate').value;
    if (!expirationDate) {
        console.warn("Fecha de expiración no proporcionada.");
        return null;
    }

    const today = new Date();
    const espDate = new Date(expirationDate);

    const monthsLeft = (espDate.getFullYear() - today.getFullYear()) * 12 + (espDate.getMonth() - today.getMonth());
    return monthsLeft >= 0 ? monthsLeft : 0; // Si ya expiró, retorna 0
}
// Complemento: Calcular meses restantes en ESP
function calculateESPMonthsLeft() {
    const expirationDate = document.getElementById('expirationDate').value;
    if (!expirationDate) {
        console.warn("Fecha de expiración no proporcionada.");
        return null;
    }

    const today = new Date();
    const espDate = new Date(expirationDate);

    const monthsLeft = (espDate.getFullYear() - today.getFullYear()) * 12 + (espDate.getMonth() - today.getMonth());
    return monthsLeft >= 0 ? monthsLeft : 0; // Si ya expiró, retorna 0
}
function formatExpirationDate() {
  const input = document.getElementById('expirationDate');
  let value = input.value.replace(/\D/g, ''); // Eliminar cualquier carácter que no sea número
  if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2); // Agregar el primer "/"
  if (value.length >= 5) value = value.slice(0, 5) + '/' + value.slice(5); // Agregar el segundo "/"
  input.value = value.slice(0, 8); // Limitar la entrada al formato MM/DD/YY
  calculateMonthsRemaining(); // Llamar a la función para calcular meses restantes
}

function calculateMonthsRemaining() {
  const dateInput = document.getElementById('expirationDate').value;

  // Validar el formato MM/DD/YY usando una expresión regular
  const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])\/\d{2}$/; // MM/DD/YY
  if (!datePattern.test(dateInput)) {
    document.getElementById('remainingMonths').textContent = "Enter a valid date in MM/DD/YY format.";
    return;
  }

  // Convertir MM/DD/YY a una fecha completa
  const [month, day, year] = dateInput.split('/').map(Number);
  const fullYear = year >= 70 ? year + 1900 : year + 2000; // Asumir año en formato 1900+ para valores >=70 y 2000+ para menores
  const expDate = new Date(fullYear, month - 1, day); // Date usa meses de 0-11

  const currentDate = new Date();

  // Calcular diferencia en meses
  const diffTime = expDate - currentDate;
  const diffMonths = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24 * 30))); // Convierte ms a meses redondeados

  document.getElementById('remainingMonths').textContent = `${diffMonths} MONTHS REMAINING`;
}

function calculateESPMonthsLeft() {
  const dateInput = document.getElementById('expirationDate').value;

  if (!dateInput) {
    console.warn("Fecha de expiración no proporcionada.");
    return null; // Indica que faltan datos
  }

  const expirationDate = new Date(dateInput); // Fecha de expiración del acuerdo
  const currentDate = new Date();

  // Validar que la fecha sea válida
  if (isNaN(expirationDate.getTime())) {
    console.warn("Fecha de expiración inválida.");
    return null;
  }

  // Calcular la diferencia en meses entre la fecha actual y la de expiración
  const monthsLeft = (expirationDate.getFullYear() - currentDate.getFullYear()) * 12 +
                     (expirationDate.getMonth() - currentDate.getMonth());

  // Devolver el número de meses restantes o indicar que ya expiró
  return monthsLeft >= 0 ? monthsLeft : 0; // Si ya expiró, devuelve 0
}

async function calculateLOLPercentage() {
    console.log("Iniciando cálculo de LOL basado en valores dinámicos...");

    const previousClaims = parseFloat(document.getElementById('previousClaims').value) || 0;
    const applianceValue = parseFloat(document.getElementById('applianceValue').value) || 0;
    if (applianceValue <= 0) {
        document.getElementById('lolResults').textContent = "Enter a valid LOL Value to calculate.";
        return;
    }

    const espMonthsLeft = calculateESPMonthsLeft();
    if (espMonthsLeft === null) {
        document.getElementById('lolResults').textContent = "Missing or invalid expiration date.";
        return;
    }

    const svcTotal = parseFloat(document.getElementById('svcSubtotal').textContent.replace(/[^0-9.]/g, '')) || 0;
    const ctrTotal = parseFloat(document.getElementById('ctrSubtotal').textContent.replace(/[^0-9.]/g, '')) || 0;
    let approvedAmount = parseFloat(document.getElementById('approvedAmount')?.value) || svcTotal;

    const lolType = document.querySelector('input[name="lolType"]:checked')?.value || "FV";
    const remainingLOL = lolType === "FV-C" ? applianceValue - previousClaims : applianceValue;

    let svcLOLPercentage = remainingLOL > 0 ? ((previousClaims + approvedAmount) / applianceValue) * 100 : 0;
    let ctrLOLPercentage = remainingLOL > 0 ? ((previousClaims + ctrTotal) / applianceValue) * 100 : 0;

    try {
        const configResponse = await fetch("/configurations");
        const configData = await configResponse.json();
        const lolLimit = espMonthsLeft > 12
            ? parseFloat(configData.moreThanOneYearPercentage)
            : parseFloat(configData.lessThanOneYearPercentage);

        const markupResponse = await fetch("/config/svc_markup_tolerance");
        const markupData = await markupResponse.json();
        const svcMarkupTolerance = parseFloat(markupData.svc_markup_tolerance);

        let finalRecommendation = "";
        if (svcLOLPercentage <= lolLimit && ctrLOLPercentage <= lolLimit) {
            finalRecommendation = approvedAmount <= ctrTotal + svcMarkupTolerance
                ? `Approve SVC repairs for $${approvedAmount.toFixed(2)}. Repairs will reach ${Math.round(svcLOLPercentage)}% LOL, ${espMonthsLeft === 0 ? "agreement already expired," : `with ${espMonthsLeft} months left,`} Repair is the best option.`
                : `Approve CTR repairs for $${ctrTotal.toFixed(2)}. Repairs will reach ${Math.round(ctrLOLPercentage)}% LOL, ${espMonthsLeft === 0 ? "agreement already expired," : `with ${espMonthsLeft} months left,`} Repair is the best option.`;
        } else if (svcLOLPercentage <= lolLimit) {
            finalRecommendation = `Approve SVC repairs for $${approvedAmount.toFixed(2)}. Repairs will reach ${Math.round(svcLOLPercentage)}% LOL, ${espMonthsLeft === 0 ? "agreement already expired," : `with ${espMonthsLeft} months left,`} Repair is the best option.`;
        } else if (ctrLOLPercentage <= lolLimit) {
            finalRecommendation = `Approve CTR repairs for $${ctrTotal.toFixed(2)}. Repairs will reach ${Math.round(ctrLOLPercentage)}% LOL, ${espMonthsLeft === 0 ? "agreement already expired," : `with ${espMonthsLeft} months left,`} Repair is the best option.`;
        } else {
            const minPct = Math.min(svcLOLPercentage, ctrLOLPercentage);
            const svcEmail = document.getElementById('svcEmail')?.value.replace(/\s+/g, "") || "____________";
            finalRecommendation = `
Repairs will reach ${Math.round(minPct)}% LOL, ${espMonthsLeft === 0 ? "agreement already expired," : `with ${espMonthsLeft} months left,`} Best option is to evaluate alternate resolution, request comparable replacement quote to DLR.
(Internal Claims notes only: Email sent to: ${svcEmail} on ${new Date().toLocaleDateString('en-US')})
***REPLACEMENT IS NOT GUARANTEED***`.trim();
        }

        document.getElementById('finalRecommendation').value = finalRecommendation;

        
        // Mostrar resultados
        document.getElementById('lolResults').innerHTML = `
<strong>LOL Percentages:</strong><br>
- SVC LOL: <span style="${svcLOLPercentage > lolLimit ? 'color: red;' : 'color: green;'}">${Math.round(svcLOLPercentage)}%</span><br>
- CTR LOL: <span style="${ctrLOLPercentage > lolLimit ? 'color: red;' : 'color: green;'}">${Math.round(ctrLOLPercentage)}%</span><br>
${lolType === "FV-C" ? `- REMAINING LOL: <span>$${remainingLOL.toFixed(2)}</span><br>` : ""}`;

        // Botones de aprobación rápida
        document.getElementById('approveSvcButton').addEventListener('click', () => {
            approvedAmount = parseFloat(document.getElementById('approveSvcAmount').value) || 0;
            svcLOLPercentage = ((previousClaims + approvedAmount) / applianceValue) * 100;
            document.getElementById('finalRecommendation').value = `Approve SVC repairs for $${approvedAmount.toFixed(2)}. Repairs will reach ${Math.round(svcLOLPercentage)}% LOL, ${espMonthsLeft === 0 ? "agreement already expired," : `with ${espMonthsLeft} months left,`} Repair is the best option.`;
        });

        document.getElementById('approveCtrButton').addEventListener('click', () => {
            approvedAmount = parseFloat(document.getElementById('approveCtrAmount').value) || 0;
            ctrLOLPercentage = ((previousClaims + approvedAmount) / applianceValue) * 100;
            document.getElementById('finalRecommendation').value = `Approve CTR repairs for $${approvedAmount.toFixed(2)}. Repairs will reach ${Math.round(ctrLOLPercentage)}% LOL, ${espMonthsLeft === 0 ? "agreement already expired," : `with ${espMonthsLeft} months left,`} Repair is the best option.`;
        });

    } catch (error) {
        console.error("Error durante el proceso de cálculo:", error);
        document.getElementById('lolResults').textContent = "Error fetching configuration.";
    }
}


function sendCompQuoteEmail() {
  // Obtener los valores dinámicos
  const authNumber = document.getElementById('authNumber').value || "[AUTH_NUMBER]";
  const firstSevenChars = authNumber.substring(0, 7); // Primeros 7 caracteres del Auth Number
  const dealerName = "[Dealer name]"; // Cambiar por un valor dinámico si es necesario

  // Template del correo
  const subject = encodeURIComponent(`REQUESTED COMP QUOTE FROM DEALER. REPLACEMENT IS NOT GUARANTEED: [AGREEMENT# ${firstSevenChars} / DLR ORDER #     `);
  const body = encodeURIComponent(`Hello Team,

Could you kindly provide us with a comparable replacement quote for our mutual customer while we await the diagnostic report from the servicer? (Please include R&R if applicable)

We are requesting this ahead of adjudication to ensure we have all the necessary documentation to make the best claims decision.



Please note that a replacement is not guaranteed at this time.
Thank you



`);

// Obtener el correo del SVC

const svcEmail = document.getElementById('svcEmail')?.value || ''; // Si no hay correo, dejar vacío

  // Generar el enlace mailto
const mailtoLink = `mailto:${svcEmail}?subject=${subject}&body=${body}`;
  
  // Abrir Outlook usando el enlace
  window.location.href = mailtoLink;
}
function wrapText(text, maxWidth = 66) {
  return text
    .split("\n")
    .map(line => {
      if (line.length <= maxWidth) return line;
      const words = line.split(" ");
      let wrapped = "";
      let currentLine = "";

      for (const word of words) {
        if ((currentLine + word).length <= maxWidth) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          wrapped += currentLine + "\n";
          currentLine = word;
        }
      }

      wrapped += currentLine;
      return wrapped;
    })
    .join("\n");
}


function showResults() {
  const authNumber = document.getElementById('authNumber').value || "";
  const svcName = document.getElementById('svcName').value || "";
  const model = document.getElementById('model').value || "";
  const serial = document.getElementById('serial').value || "";

  const physicalDamage = document.querySelector('input[name="physicalDamage"]:checked')?.value === "yes"
    ? "PHYSICAL DAMAGE / ABUSE: YES"
    : "NO PHYSICAL DAMAGE / ABUSE";

  const complaint = document.getElementById('complaint').value || "";
  const techDiag = document.getElementById('techDiag').value || "";

  const laborType = document.querySelector('input[name="laborType"]:checked')?.value || "Labor";
  const laborCost = parseFloat(document.getElementById('laborCost')?.value) || 0;
  const laborFormatted = `$${laborCost.toFixed(2)}`.padEnd(12) + laborType;

  const rrCost = parseFloat(document.getElementById('rrCost')?.value) || 0;
  const mileageCost = parseFloat(document.getElementById('mileageCost')?.value) || 0;
  const taxesCost = parseFloat(document.getElementById('taxes')?.value) || 0;
  const shCost = parseFloat(document.getElementById('shCost')?.value) || 0;

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

  const lolType = document.querySelector('input[name="lolType"]:checked')?.value || "No LOL Type selected";
  const lolValue = parseFloat(document.getElementById('applianceValue').value) || 0;
  const previousClaims = parseFloat(document.getElementById('previousClaims').value) || 0;
  const remainingLOL = lolType === "FV-C" ? (lolValue - previousClaims) : null;

  const mfgCoverage = document.getElementById('noMfgCoverage').checked
    ? "NO ADDITIONAL MFG COVERAGE"
    : document.getElementById('mfgCoverage').value || "";

  const finalRecommendation = document.getElementById('finalRecommendation').value || "";

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

  const resultsBox = document.getElementById('results');
resultsBox.style.fontFamily = 'Courier New, monospace';
resultsBox.value = results; // <-- usa el contenido original sin envoltorio

updateLineNumbers();
autoResizeTextarea();
}

function updateLineNumbers() {
  const textarea = document.getElementById("results");
  const lineNumbers = document.getElementById("lineNumbers");

  const lineCount = textarea.value.split("\n").length || 1;
  lineNumbers.textContent = Array.from({ length: lineCount }, (_, i) => `${i + 1}.`).join("\n");

  // sincroniza scroll
  lineNumbers.scrollTop = textarea.scrollTop;
}

document.getElementById("results").addEventListener("scroll", () => {
  document.getElementById("lineNumbers").scrollTop = document.getElementById("results").scrollTop;
});

function autoResizeTextarea() {
  const textarea = document.getElementById("results");
  textarea.style.height = "auto"; // reset to shrink if needed
  textarea.style.height = textarea.scrollHeight + "px"; // expand to fit content
}



function copyToClipboard() {
    const resultsBox = document.getElementById('results'); // Referencia al área de texto
    resultsBox.select(); // Seleccionar el texto del área de texto
    resultsBox.setSelectionRange(0, 99999); // Para dispositivos móvilesz
    document.execCommand('copy'); // Copiar el texto al portapapeles

    // Cambiar dinámicamente el texto del botón
    const copyButton = document.getElementById('copyButton');
    if (copyButton) {
        const originalText = copyButton.textContent; // Guarda el texto original
        copyButton.textContent = "Copied"; // Cambia el texto a "Copied"

        setTimeout(() => {
            copyButton.textContent = originalText; // Regresa al texto original después de 3 segundos
        }, 3000);
    } else {
        console.error("No se encontró el botón con ID 'copyButton'.");
    }
}

function aprobarSvc() {
  selectedDecision = "Approved SVC";
  selectedAmount = parseFloat(document.getElementById("approveSvcAmount")?.value) || 0;
  // guardarLog(); // Descomentá si ya tenés esta función

  const btn = document.getElementById("approveSvcButton");
  const originalText = btn.textContent;
  btn.textContent = "✔️ Approved!";
  setTimeout(() => {
    btn.textContent = originalText;
  }, 30000);
}

function aprobarCtr() {
  selectedDecision = "Approved CTR";
  selectedAmount = parseFloat(document.getElementById("approveCtrAmount")?.value) || 0;
  // guardarLog();

  const btn = document.getElementById("approveCtrButton");
  const originalText = btn.textContent;
  btn.textContent = "✔️ Approved!";
  setTimeout(() => {
    btn.textContent = originalText;
  }, 30000);
}

function cerrarParaDiag() {
  selectedDecision = "Closed for Diag";
  selectedAmount = parseFloat(document.getElementById("closeForDiagAmount")?.value) || 0;
  // guardarLog();

  const btn = document.getElementById("closeForDiagButton");
  const originalText = btn.textContent;
  btn.textContent = "✔️ Closed!";
  setTimeout(() => {
    btn.textContent = originalText;
  }, 30000);
}

// Desactivar flechas para inputs al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  // Desactivar flechas para todos los inputs actuales con placeholder="Cost"
  document.querySelectorAll("input[placeholder='Cost']").forEach(disableArrowKeys);

  // Desactivar flechas para campos específicos: Labor Cost, Mileage Cost y R&R
  ["laborCost", "mileageCost", "rrCost"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      disableArrowKeys(input);
    }
  });

  // Desactivar flechas para nuevos inputs dinámicos al agregar filas
  const addButtons = ["svc", "ctr"];
  addButtons.forEach((tableId) => {
    document
      .querySelector(`button[onclick="addRow('${tableId}')"]`)
      .addEventListener("click", () => {
        setTimeout(() => {
          const newCostInputs = document.querySelectorAll(`#${tableId}Table tbody input[placeholder='Cost']`);
          newCostInputs.forEach(disableArrowKeys); // Aplicar lógica a nuevos inputs
        }, 50); // Breve retraso para asegurar que la fila ya se haya agregado
      });
  });
});

function disableArrowKeys(input) {
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault(); // Bloquear el incremento/decremento
    }
  });
}

//Cambiar comportamiento tecla Tab para inputs de las tablas SVC y CTR
document.addEventListener("DOMContentLoaded", () => {
  configureColumnTabbing("#svcTable");
  configureColumnTabbing("#ctrTable");
});

function configureColumnTabbing(tableSelector) {
  const table = document.querySelector(tableSelector);

  // Delegación de eventos para capturar la tecla Tab
  table.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault(); // Evitar comportamiento predeterminado

      // Agrupar inputs por columna
      const columns = [];
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      rows.forEach(row => {
        Array.from(row.children).forEach((cell, columnIndex) => {
          columns[columnIndex] = columns[columnIndex] || [];
          const input = cell.querySelector("input");
          if (input) columns[columnIndex].push(input);
        });
      });

      // Crear una lista ordenada por columna y luego por filas dentro de cada columna
      const orderedInputs = columns.flat(); // Los elementos están en orden columna por columna

      // Identificar el índice actual en la lista ordenada
      const currentInput = event.target;
      const currentIndex = orderedInputs.indexOf(currentInput);

      // Determinar el próximo elemento según Shift
      const nextIndex = event.shiftKey ? currentIndex - 1 : currentIndex + 1;
      if (orderedInputs[nextIndex]) {
        orderedInputs[nextIndex].focus();
      }
    }
  });
}



// 🔹 Ajuste para registrar SVC o CTR approvals basado en la recomendación definitiva
document.getElementById("approveSvcButton").addEventListener("click", () => {
    let svcAmount = parseFloat(document.getElementById("approveSvcAmount").value) || 0;
    registerSvcApproval(svcAmount);
});

document.getElementById("approveCtrButton").addEventListener("click", () => {
    let ctrAmount = parseFloat(document.getElementById("approveCtrAmount").value) || 0;
    registerCtrApproval(ctrAmount);
});

document.getElementById("closeForDiagButton").addEventListener("click", () => {
    registerCompQuote();
});


function updateRepairPercentage() {
  const previousClaims = parseFloat(document.getElementById('previousClaims').value) || 0;
  const applianceValue = parseFloat(document.getElementById('applianceValue').value) || 0;

  // Calcular el % de LOL basado en Previous Claims
  const repairPercentage = applianceValue > 0 ? (previousClaims / applianceValue) * 100 : 0;

  // Mostrar el resultado en el elemento <p>
  document.getElementById('repairResults').textContent = `${Math.round(repairPercentage)}%`;
}

// Función para agregar o actualizar filas dinámicamente
// Referencias a los elementos del DOM
const copyTableButton = document.getElementById('copyTableButton');
const authInput = document.getElementById('authNumber');
const svcInput = document.getElementById('svcName');
const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
// Objeto de registro para gestionar filas únicas por clave
const rowRegistry = {};
// Función para agregar o actualizar filas dinámicamente
// Función principal para manejar la tabla
function updateTable() {
    const authValue = authInput.value.trim();
    const svcValue = svcInput.value.trim();

    console.log("Intentando actualizar fila con valores:", { authValue, svcValue });

    if (!authValue || !svcValue) {
        console.log("Campos vacíos, nada que actualizar.");
        return;
    }

    // Capturar valores de SVC y CTR actualizados
    const svcSubtotalElement = document.getElementById('svcSubtotal');
    const ctrSubtotalElement = document.getElementById('ctrSubtotal');

    if (!svcSubtotalElement || !ctrSubtotalElement) {
        console.error("Los elementos svcSubtotal o ctrSubtotal no están disponibles en el DOM.");
        return;
    }

    const svcTotal = parseFloat(svcSubtotalElement.textContent.replace(/[^0-9.]/g, '')) || 0;
    const ctrTotal = parseFloat(ctrSubtotalElement.textContent.replace(/[^0-9.]/g, '')) || 0;

    const svcTotalValue = `$${svcTotal.toFixed(2)}`;
    const ctrTotalValue = `$${ctrTotal.toFixed(2)}`;
    const differenceValue = `$${(svcTotal - ctrTotal).toFixed(2)}`;

    console.log("Valores capturados para la tabla:", {
        svcTotal: svcTotalValue,
        ctrTotal: ctrTotalValue,
        difference: differenceValue
    });

    // Eliminar fila previa si ya existe en el registro
    if (rowRegistry[authValue]) {
        console.log("Eliminando fila existente con Authorization:", authValue);
        rowRegistry[authValue].remove();
        delete rowRegistry[authValue];
    }

    // Crear nueva fila
    const newRow = dataTable.insertRow();
    rowRegistry[authValue] = newRow;

    // Lista de valores para la fila
    const agentName = document.getElementById("agentName")?.textContent || "Unknown Agent";

    const cellValues = [
        authValue.slice(0, 7),  
        "",                     
        new Date().toLocaleDateString(),  
        agentName,              
        "",                     
        authValue.slice(-5),    
        new Date().toLocaleDateString(),  
        svcValue,               
        "",                     
        "",                     
        "T",                    
        "NO",                   
        "",                     
        "0",                    
        svcTotalValue,          
        ctrTotalValue,          
        differenceValue,        
        "",                     // ❌ Deja "Amount Approved" vacío hasta que se seleccione una opción
        "true"                  
    ];

    // Crear celdas con inputs editables
    cellValues.forEach((value, index) => {
        const cell = newRow.insertCell();
        const input = document.createElement("input");
        input.type = "text";
        input.value = value;
        input.style.width = "100%";
        cell.appendChild(input);

        console.log(`Celda ${index} añadida con valor: ${value}`);
    });

    console.log("✅ Fila añadida o actualizada correctamente.");
}
document.getElementById('approveSvcButton').addEventListener('click', () => {
    updateApprovedAmount("approveSvcAmount");
});

document.getElementById('approveCtrButton').addEventListener('click', () => {
    updateApprovedAmount("approveCtrAmount");
});

function updateApprovedAmount(selectedInputId) {
    const selectedValue = parseFloat(document.getElementById(selectedInputId)?.value) || 0;
    const approvedAmount = `$${selectedValue.toFixed(2)}`;

    // 🚀 Actualizar "Amount Approved" en la tabla
    const rows = document.querySelectorAll("#dataTable tbody tr");
    rows.forEach(row => {
        const amountApprovedCell = row.querySelector("td:nth-child(18) input"); // Amount Approved
        if (amountApprovedCell) {
            amountApprovedCell.value = approvedAmount;
        }
    });

    console.log(`✅ "Amount Approved" actualizado con ${approvedAmount} según el botón presionado.`);
}
// **Implementación en tiempo real con MutationObserver**
function setupRealtimeUpdates() {
    const svcSubtotalElement = document.getElementById('svcSubtotal');
    const ctrSubtotalElement = document.getElementById('ctrSubtotal');

    if (!svcSubtotalElement || !ctrSubtotalElement) {
        console.error("Los elementos svcSubtotal o ctrSubtotal no están disponibles para la observación.");
        return;
    }

    const observer = new MutationObserver(() => {
        console.log("Cambio detectado en SVC o CTR. Actualizando tabla...");
        // Al detectar cambios, actualizamos la tabla para reflejar los nuevos valores
        updateTable();
    });

    // Configuración del MutationObserver para detectar cambios en los valores de subtotales
    observer.observe(svcSubtotalElement, { childList: true, characterData: true });
    observer.observe(ctrSubtotalElement, { childList: true, characterData: true });

    console.log("Se han configurado las actualizaciones en tiempo real.");
}
// Inicializar las actualizaciones en tiempo real
setupRealtimeUpdates();
// Función para copiar datos de la tabla sin encabezados
copyTableButton.addEventListener('click', function () {
    console.log("Copiando datos de la tabla...");
    let textToCopy = "";
    const rows = dataTable.querySelectorAll("tr");

    rows.forEach(row => {
        const cells = row.querySelectorAll("td input");
        let rowText = Array.from(cells).map(input => input.value).join("\t"); // Separa por tabulación
        textToCopy += rowText + "\n";
    });

    navigator.clipboard.writeText(textToCopy).then(() => {
        console.log("Datos copiados al portapapeles.");
        const originalText = copyTableButton.textContent; // Guarda el texto original del botón
        copyTableButton.textContent = "Copied!"; // Cambia el texto del botón
        setTimeout(() => {
            copyTableButton.textContent = originalText; // Regresa al texto original después de 3 segundos
        }, 3000); // Tiempo de espera: 3 segundos
    }).catch(err => {
        console.error("Error al copiar datos: ", err);
    });
});
// Detectar cambios en los inputs y agregar filas automáticamente
authInput.addEventListener('blur', updateTable);
svcInput.addEventListener('blur', updateTable);
function clearDateCompletedOnCompRequest() {
    const rows = document.querySelectorAll("#dataTable tbody tr");

    rows.forEach(row => {
        const dateCompletedCell = row.querySelector("td:nth-child(11) input"); // Date Completed

        // ✅ Eliminar "T" si existe
        if (dateCompletedCell && dateCompletedCell.value.trim() === "T") {
            dateCompletedCell.value = ""; // Dejar vacío al solicitar el comp
        }
    });

    console.log("✅ 'Date Completed' eliminado (vacío) al solicitar el comp.");
}
function clearDoneOnCompRequest() {
    const rows = document.querySelectorAll("#dataTable tbody tr");

    rows.forEach(row => {
        const doneCell = row.querySelector("td:nth-child(19) input"); // Done

        // ✅ Si Done es "true", eliminarlo cuando se solicita el comp
        if (doneCell && doneCell.value.trim() === "true") {
            doneCell.value = ""; // Vacío al solicitar el comp
        }
    });

    console.log("✅ 'Done' borrado en todas las filas al solicitar el comp.");
}
function updateTableOnButtonClick() {
    const rows = document.querySelectorAll("#dataTable tbody tr");

    rows.forEach(row => {
        const reqCompCell = row.querySelector("td:nth-child(10) input[type='text']"); // Req Comp
        const commentsCell = row.querySelector("td:nth-child(9) input"); // Comments
        const statusCell = row.querySelector("td:nth-child(5) input"); // Status
        const doneCell = row.querySelector("td:nth-child(19) input"); // Done

        // Bandera de modificación
        let rowModified = false;

        // ✅ Req Comp: Si está vacío, asignamos "true"
        if (reqCompCell && reqCompCell.value.trim() === "") {
            reqCompCell.value = "true";
            rowModified = true; // Marcamos que hubo modificación
        }

        // ✅ Comments: Si está vacío, asignamos "CQ Requested"
        if (commentsCell && commentsCell.value.trim() === "") {
            commentsCell.value = "CQ Requested";
            rowModified = true; // Marcamos que hubo modificación
        }

        // ✅ Status: Si está vacío, asignamos "Comp Quote -Pending"
        if (statusCell && statusCell.value.trim() === "") {
            statusCell.value = "Comp Quote -Pending";
            rowModified = true; // Marcamos que hubo modificación
        }

        // ✅ Done: Queda vacío si hubo modificaciones, "true" por defecto si no
        if (doneCell) {
            doneCell.value = rowModified ? "" : "true"; // Aplicamos lógica inversa
        }
    });

    console.log("✅ Todas las filas fueron procesadas correctamente con 'Comp Quote - Pending' en Status.");
}

document.getElementById('approveSvcButton').addEventListener('click', () => {
    resetTable();
    updateTableStatus("Repair Approved", false);
});

document.getElementById('approveCtrButton').addEventListener('click', () => {
    resetTable();
    updateTableStatus("Repair Approved", false);
});



document.getElementById('closeForDiagButton').addEventListener('click', () => {
  const svcAmt = parseFloat(document.getElementById('approveSvcAmount').value) || 0;
  const ctrAmt = parseFloat(document.getElementById('approveCtrAmount').value) || 0;
  const applianceValue = parseFloat(document.getElementById('applianceValue').value) || 1;
  const previousClaims = parseFloat(document.getElementById('previousClaims').value) || 0;

  const svcPct = ((previousClaims + svcAmt) / applianceValue) * 100;
  const ctrPct = ((previousClaims + ctrAmt) / applianceValue) * 100;
  const minRepairPct = Math.min(svcPct, ctrPct).toFixed(0);

  const diagAmount = parseFloat(document.getElementById('closeForDiagAmount')?.value) || 0;
  const formattedDiag = `$${diagAmount.toFixed(2)}`;
  const espMonthsLeft = calculateESPMonthsLeft();
  const svcEmail = document.getElementById('svcEmail')?.value.replace(/\s+/g, "") || "____________";

  const diagText = `
Repairs will reach ${minRepairPct}% LOL, ${
    espMonthsLeft === 0 ? "agreement already expired," : `with ${espMonthsLeft} months left,`
  } Best option is to evaluate alternate resolution, request comparable replacement quote to DLR.
(Internal Claims notes only: Email sent to: ${svcEmail} on ${new Date().toLocaleDateString('en-US')})
***REPLACEMENT IS NOT GUARANTEED***
Closed for diag for ${formattedDiag}.`.trim();

  document.getElementById('finalRecommendation').value = diagText;

  // 💸 Aquí se actualiza el Amount Approved en child 18 sin tocar status
  updateApprovedAmountFromLabor();
});

document.getElementById('requestCompQuoteButton').addEventListener('click', () => {
    resetTable();
    updateTableStatus("Comp Quote - Pending", false, true);
});

function resetTable() {
    const rows = document.querySelectorAll("#dataTable tbody tr");
    
    rows.forEach(row => {
        row.querySelector("td:nth-child(5) input").value = ""; // Status
        row.querySelector("td:nth-child(10) input").value = ""; // Requested Comp Quote (T)
        row.querySelector("td:nth-child(11) input").value = "T"; // Comments
        console.log("✅ Tabla reseteada antes de aplicar nueva acción.");
    });
}

function updateTableStatus(statusText, clearAll, markCompQuote) {
    const rows = document.querySelectorAll("#dataTable tbody tr");

    rows.forEach(row => {
        const statusCell = row.querySelector("td:nth-child(5) input"); // Status
        const requestedCompQuoteCell = row.querySelector("td:nth-child(10) input"); // Requested Comp Quote (T)
        const dateCompletedCell = row.querySelector("td:nth-child(11) input"); // Date completed
        const commentsCell = row.querySelector("td:nth-child(9) input"); // Comments

        if (statusCell) {
            statusCell.value = statusText;
            console.log(`✅ Status actualizado a "${statusText || "BLANCO"}".`);
        }

        if (clearAll) {
            requestedCompQuoteCell.value = "";
            commentsCell.value = "";
            console.log("✅ Campos 'Requested Comp Quote' y 'Comments' limpiados.");
        } else if (markCompQuote) {
            requestedCompQuoteCell.value = "T";
            commentsCell.value = "Comp Quote Requested";
            console.log("✅ 'T' y Comments actualizados por Request Comp Quote.");
        }
    });
}


// Función para normalizar cadenas de texto
function normalizeString(str) {
  return str
    .toLowerCase() // Convertir a minúsculas
    .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
    .trim(); // Eliminar espacios al principio y al final
}



function openCoverageSelector() {
  fetch('/coverages')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('coverageOptions');
      container.innerHTML = '';

     const selected = document.getElementById("mfgCoverage").value
  .split("\n").map(s => s.trim()).filter(Boolean);

      const normalize = str => str.normalize("NFD").replace(/\s+/g, " ").trim();

      // 1. Sección de coberturas estándar
      const genericCoverages = ["1 Year: expired", "2 Year: expired"];
      const genericSection = document.createElement("div");
      const genericTitle = document.createElement("h4");
      genericTitle.textContent = "Standard Coverage";
      genericSection.appendChild(genericTitle);

      genericCoverages.forEach(line => {
        const p = document.createElement("p");
        p.textContent = line;
        p.style.cursor = "pointer";
        p.style.margin = "4px 0 8px";
        p.style.color = "#333";

        if (selected.map(normalize).includes(normalize(line))) {
          p.style.backgroundColor = "#e0ffe0";
        }

        p.onclick = () => {
          const field = document.getElementById("mfgCoverage");
          const current = field.value.split("\n").map(s => normalize(s)).filter(Boolean);
          const normalizedLine = normalize(line);
          const index = current.indexOf(normalizedLine);

          if (index !== -1) {
            current.splice(index, 1);
            p.style.backgroundColor = "";
          } else {
            current.push(normalizedLine);
            p.style.backgroundColor = "#e0ffe0";
          }

          field.value = current.join("\n");
        };

        genericSection.appendChild(p);
      });

      container.appendChild(genericSection);
      container.appendChild(document.createElement("hr"));

      // 2. Selectores dinámicos
      const applianceSelect = document.createElement('select');
      applianceSelect.id = 'applianceSelect';
      applianceSelect.innerHTML = '<option value="">-- Select appliance --</option>';

      const manufacturerSelect = document.createElement('select');
      manufacturerSelect.id = 'manufacturerSelect';
      manufacturerSelect.disabled = true;
      manufacturerSelect.innerHTML = '<option value="">-- Select brand --</option>';

      const coverageList = document.createElement('div');
      coverageList.id = 'coverageList';
      coverageList.style.marginTop = '16px';

      container.appendChild(applianceSelect);
      container.appendChild(document.createElement('br'));
      container.appendChild(document.createElement('br'));
      container.appendChild(manufacturerSelect);
      container.appendChild(document.createElement('br'));
      container.appendChild(document.createElement('br'));
      container.appendChild(coverageList);

      // Llenar appliances
      data.forEach(group => {
        const opt = document.createElement("option");
        opt.value = group.category;
        opt.textContent = group.category;
        applianceSelect.appendChild(opt);
      });

      applianceSelect.onchange = () => {
        const selectedCategory = applianceSelect.value;
        manufacturerSelect.innerHTML = '<option value="">-- Select brand --</option>';
        manufacturerSelect.disabled = !selectedCategory;
        coverageList.innerHTML = '';

        const group = data.find(g => g.category === selectedCategory);
        if (!group) return;

        group.entries.forEach(entry => {
          const opt = document.createElement("option");
          opt.value = entry.manufacturer;
          opt.textContent = entry.manufacturer;
          manufacturerSelect.appendChild(opt);
        });
      };

      manufacturerSelect.onchange = () => {
        const selectedCategory = applianceSelect.value;
        const selectedBrand = manufacturerSelect.value;
        coverageList.innerHTML = '';

        const group = data.find(g => g.category === selectedCategory);
        const entry = group?.entries.find(e => e.manufacturer === selectedBrand);
        if (!entry) return;

        entry.coverage.forEach(line => {
          const p = document.createElement("p");
          p.textContent = line;
          p.style.cursor = "pointer";
          p.style.margin = "4px 0 8px";
          p.style.color = "#333";

          if (selected.map(normalize).includes(normalize(line))) {
            p.style.backgroundColor = "#e0ffe0";
          }

          p.onclick = () => {
            const field = document.getElementById("mfgCoverage");
            const current = field.value.split("\n").map(s => normalize(s)).filter(Boolean);
            const normalizedLine = normalize(line);
            const index = current.indexOf(normalizedLine);

            if (index !== -1) {
              current.splice(index, 1);
              p.style.backgroundColor = "";
            } else {
              current.push(normalizedLine);
              p.style.backgroundColor = "#e0ffe0";
            }

            field.value = current.join("\n");
          };

          coverageList.appendChild(p);
        });
      };

      const modal = document.getElementById("coverageModal");
      modal.style.display = "block";
    })
    .catch(err => console.error("Error al cargar coverages:", err));
}

function closeCoverageSelector() {
  document.getElementById("coverageModal").style.display = "none";
}

window.openCoverageSelector = openCoverageSelector;
window.closeCoverageSelector = closeCoverageSelector;

