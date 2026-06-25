const i18n = {
  pt: {
    htmlLang: "pt-BR",
    documentTitle: "Cancelamento de inscrição de treinamentos - Full Gauge",
    themeToggle: "Tema",
    pageTitle: "Cancelamento de Inscrição",
    cancelingFor: "Cancelando inscrição para:",
    classLabel: "Turma:",
    modulesLabel: "Módulos",
    modulesHint: "Escolha o módulo que deseja cancelar ou selecione todos os módulos.",
    allModules: "Todos os módulos",
    cancellationQuestion: "Confirma cancelamento da inscrição?",
    yes: "Sim",
    no: "Não",
    invalidLink: "Link de acesso inválido. Por favor, utilize o link enviado oficialmente.",
    submit: "Confirmar Cancelamento",
    sending: "Enviando...",
    successTitle: "Cancelamento confirmado!",
    successMessage: "Seu cancelamento foi registrado com sucesso.",
    declinedTitle: "Cancelamento não confirmado!",
    declinedMessage: "Obrigado pelo retorno. Registramos que você não confirmou o cancelamento da inscrição.",
    submitError: "Erro ao confirmar cancelamento. Tente novamente.",
    connectionError: "Erro de conexão."
  },
  en: {
    htmlLang: "en",
    documentTitle: "Training enrollment cancellation - Full Gauge",
    themeToggle: "Theme",
    pageTitle: "Enrollment Cancellation",
    cancelingFor: "Canceling enrollment for:",
    classLabel: "Class:",
    modulesLabel: "Modules",
    modulesHint: "Choose the module you want to cancel or select all modules.",
    allModules: "All modules",
    cancellationQuestion: "Do you confirm enrollment cancellation?",
    yes: "Yes",
    no: "No",
    invalidLink: "Invalid access link. Please use the official link that was sent to you.",
    submit: "Confirm Cancellation",
    sending: "Sending...",
    successTitle: "Cancellation confirmed!",
    successMessage: "Your cancellation has been successfully registered.",
    declinedTitle: "Cancellation not confirmed!",
    declinedMessage: "Thank you for your response. We registered that you did not confirm the enrollment cancellation.",
    submitError: "Error confirming cancellation. Please try again.",
    connectionError: "Connection error."
  },
  es: {
    htmlLang: "es",
    documentTitle: "Cancelación de inscripción a capacitaciones - Full Gauge",
    themeToggle: "Tema",
    pageTitle: "Cancelación de Inscripción",
    cancelingFor: "Cancelando inscripción para:",
    classLabel: "Clase:",
    modulesLabel: "Módulos",
    modulesHint: "Elige el módulo que deseas cancelar o selecciona todos los módulos.",
    allModules: "Todos los módulos",
    cancellationQuestion: "¿Confirma la cancelación de la inscripción?",
    yes: "Sí",
    no: "No",
    invalidLink: "Enlace de acceso inválido. Por favor, utiliza el enlace enviado oficialmente.",
    submit: "Confirmar Cancelación",
    sending: "Enviando...",
    successTitle: "¡Cancelación confirmada!",
    successMessage: "Tu cancelación fue registrada con éxito.",
    declinedTitle: "¡Cancelación no confirmada!",
    declinedMessage: "Gracias por tu respuesta. Registramos que no confirmaste la cancelación de la inscripción.",
    submitError: "Error al confirmar la cancelación. Inténtalo de nuevo.",
    connectionError: "Error de conexión."
  }
};

const supportedLangs = Object.keys(i18n);
let currentLang = supportedLangs.includes(localStorage.getItem("fg_cancellation_lang"))
  ? localStorage.getItem("fg_cancellation_lang")
  : "pt";

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("t");

const jwtTokenInput = document.getElementById("jwtToken");
const displayEmail = document.getElementById("displayEmail");
const userInfo = document.getElementById("userInfo");
const displayClassId = document.getElementById("displayClassId");
const modulesSection = document.getElementById("modulesSection");
const modulesGroup = document.getElementById("modulesGroup");
const cancellationForm = document.getElementById("cancellationForm");
const formError = document.getElementById("formError");
const submitBtn = cancellationForm.querySelector('button[type="submit"]');

let emailForDisplay = null;
let classIdForDisplay = null;
let modulesForDisplay = [];
let selectedModuleChoice = "all";

function t(key) {
  return (i18n[currentLang] || i18n.pt)[key] || i18n.pt[key] || key;
}

function decodeJwtPayload(jwt) {
  const payloadBase64 = jwt.split(".")[1];
  if (!payloadBase64) return null;

  const normalizedPayload = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
  const decodedPayload = atob(normalizedPayload);
  const bytes = Uint8Array.from(decodedPayload, (char) => char.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

function normalizeModuleOption(moduleItem, index) {
  if (!moduleItem) return null;

  if (typeof moduleItem === "string") {
    const value = moduleItem.trim();
    return value ? { value, label: value } : null;
  }

  const value =
    moduleItem.value ||
    moduleItem.modulo ||
    moduleItem.id ||
    moduleItem.moduleId ||
    moduleItem.MODULEID ||
    moduleItem.code ||
    moduleItem.CODE ||
    moduleItem.name ||
    moduleItem.NAME ||
    `module-${index + 1}`;

  const labelSource =
    moduleItem.label ||
    moduleItem.name ||
    moduleItem.NAME ||
    moduleItem.title ||
    moduleItem.TITLE ||
    value;

  const label = typeof labelSource === "object"
    ? labelSource[currentLang] || labelSource.pt || labelSource.en || labelSource.es || value
    : labelSource;

  return { value: String(value), label: String(label) };
}

function getSelectedModules() {
  if (!modulesForDisplay.length) return [];
  if (selectedModuleChoice === "all") {
    return modulesForDisplay.map((moduleItem) => moduleItem.value);
  }
  const selected = modulesForDisplay.find((moduleItem) => moduleItem.value === selectedModuleChoice);
  return [selected?.value || selectedModuleChoice];
}

function renderModulesSection() {
  if (!modulesSection || !modulesGroup) return;

  if (!modulesForDisplay.length) {
    modulesSection.style.display = "none";
    modulesGroup.innerHTML = "";
    return;
  }

  modulesSection.style.display = "block";
  modulesGroup.innerHTML = [
    `<label class="radio-chip${selectedModuleChoice === "all" ? " radio-chip--selected" : ""}">
      <input type="radio" name="moduleChoice" value="all"${selectedModuleChoice === "all" ? " checked" : ""}>
      <span>${t("allModules")}</span>
    </label>`,
    ...modulesForDisplay.map((moduleItem) => {
      const isSelected = selectedModuleChoice === moduleItem.value;
      return `<label class="radio-chip${isSelected ? " radio-chip--selected" : ""}">
        <input type="radio" name="moduleChoice" value="${moduleItem.value}"${isSelected ? " checked" : ""}>
        <span>${moduleItem.label}</span>
      </label>`;
    })
  ].join("");

  modulesGroup.querySelectorAll('input[name="moduleChoice"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      selectedModuleChoice = radio.value;
      modulesGroup.querySelectorAll(".radio-chip").forEach((chip) => {
        chip.classList.toggle("radio-chip--selected", chip.querySelector("input").checked);
      });
    });
  });
}

function applyTranslations() {
  document.documentElement.lang = t("htmlLang");
  document.title = t("documentTitle");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll(".lang-btn").forEach((btn) => {
    const isActive = btn.dataset.lang === currentLang;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  renderModulesSection();

  if (submitBtn.disabled && !jwtTokenInput.value) {
    submitBtn.textContent = t("submit");
  }
}

function setTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;
  localStorage.setItem("fg_theme", nextTheme);
}

function isCancellationConfirmed(value) {
  return value === "Sim";
}

function renderSuccessMessage(cancellationValue) {
  const confirmed = isCancellationConfirmed(cancellationValue);
  const title = confirmed ? t("successTitle") : t("declinedTitle");
  const message = confirmed ? t("successMessage") : t("declinedMessage");
  const iconPath = confirmed
    ? "M5 12.5 9.2 16.7 19 7"
    : "M7 7 17 17M17 7 7 17";

  cancellationForm.innerHTML = `
    <div class="attendance-success${confirmed ? "" : " attendance-success--declined"}" role="status" aria-live="polite">
      <div class="attendance-success-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="${iconPath}"></path></svg>
      </div>
      <h3>${title}</h3>
      <p>${message}</p>
    </div>
  `;
}

try {
  if (token) {
    const decodedPayload = decodeJwtPayload(token);
    emailForDisplay = decodedPayload?.email;
    classIdForDisplay = decodedPayload?.classId;
    modulesForDisplay = Array.isArray(decodedPayload?.modules)
      ? decodedPayload.modules.map(normalizeModuleOption).filter(Boolean)
      : [];
    selectedModuleChoice = "all";
  }
} catch (e) {
  console.error("Erro ao decodificar payload do JWT para exibição:", e);
}

if (token && emailForDisplay && classIdForDisplay) {
  jwtTokenInput.value = token;
  displayEmail.textContent = emailForDisplay;
  displayClassId.textContent = classIdForDisplay;
  userInfo.style.display = "block";
  renderModulesSection();

  const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
  window.history.replaceState({ path: newUrl }, "", newUrl);
} else {
  submitBtn.disabled = true;
  formError.style.display = "block";
}

document.querySelectorAll('input[name="cancellation"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    document.querySelectorAll(".radio-chip").forEach((chip) => {
      chip.classList.toggle("radio-chip--selected", chip.querySelector("input").checked);
    });
  });
});

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentLang = btn.dataset.lang;
    localStorage.setItem("fg_cancellation_lang", currentLang);
    applyTranslations();
  });
});

document.getElementById("themeToggle")?.addEventListener("click", () => {
  setTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
});

cancellationForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cancellationValue = cancellationForm.querySelector('input[name="cancellation"]:checked')?.value;
  if (!cancellationValue) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${t("sending")}`;

  const payload = {
    token: jwtTokenInput.value,
    cancellation: cancellationValue
  };

  if (modulesForDisplay.length) {
    payload.modules = getSelectedModules();
    payload.all_modules = selectedModuleChoice === "all";
  }

  try {
    const response = await fetch("/api/cancellation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      renderSuccessMessage(cancellationValue);
    } else {
      let errorDetails = "";
      try {
        const errorBody = await response.json();
        errorDetails = errorBody?.error || errorBody?.upstreamBody || "";
      } catch (_) {
        // noop
      }

      alert(`${t("submitError")}${errorDetails ? `\n${errorDetails}` : ""}`);
      submitBtn.disabled = false;
      submitBtn.textContent = t("submit");
    }
  } catch (err) {
    alert(t("connectionError"));
    submitBtn.disabled = false;
    submitBtn.textContent = t("submit");
  }
});

setTheme(localStorage.getItem("fg_theme") || "light");
applyTranslations();
