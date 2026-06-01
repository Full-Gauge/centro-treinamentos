const i18n = {
  pt: {
    htmlLang: "pt-BR",
    documentTitle: "Registro de presença de treinamentos - Full Gauge",
    themeToggle: "Tema",
    pageTitle: "Registro de Presença",
    registeringFor: "Registrando presença para:",
    classLabel: "Turma:",
    attendanceQuestion: "Confirmar presença?",
    yes: "Sim",
    no: "Não",
    invalidLink: "Link de acesso inválido. Por favor, utilize o link enviado oficialmente.",
    submit: "Confirmar Registro",
    sending: "Enviando...",
    successTitle: "Presença registrada!",
    successMessage: "Obrigado por confirmar sua presença. Sua resposta foi enviada com sucesso.",
    declinedTitle: "Presença não confirmada!",
    declinedMessage: "Obrigado pelo retorno. Registramos que você não confirmou presença para esta turma.",
    submitError: "Erro ao registrar presença. Tente novamente.",
    connectionError: "Erro de conexão."
  },
  en: {
    htmlLang: "en",
    documentTitle: "Training attendance register - Full Gauge",
    themeToggle: "Theme",
    pageTitle: "Attendance Register",
    registeringFor: "Registering attendance for:",
    classLabel: "Class:",
    attendanceQuestion: "Confirm attendance?",
    yes: "Yes",
    no: "No",
    invalidLink: "Invalid access link. Please use the official link that was sent to you.",
    submit: "Confirm Registration",
    sending: "Sending...",
    successTitle: "Attendance registered!",
    successMessage: "Thank you for confirming your attendance. Your response was sent successfully.",
    declinedTitle: "Attendance not confirmed!",
    declinedMessage: "Thank you for your response. We registered that you did not confirm attendance for this class.",
    submitError: "Error registering attendance. Please try again.",
    connectionError: "Connection error."
  },
  es: {
    htmlLang: "es",
    documentTitle: "Registro de asistencia a capacitaciones - Full Gauge",
    themeToggle: "Tema",
    pageTitle: "Registro de Asistencia",
    registeringFor: "Registrando asistencia para:",
    classLabel: "Clase:",
    attendanceQuestion: "¿Confirmar asistencia?",
    yes: "Sí",
    no: "No",
    invalidLink: "Enlace de acceso inválido. Por favor, utiliza el enlace enviado oficialmente.",
    submit: "Confirmar Registro",
    sending: "Enviando...",
    successTitle: "¡Asistencia registrada!",
    successMessage: "Gracias por confirmar tu asistencia. Tu respuesta fue enviada correctamente.",
    declinedTitle: "¡Asistencia no confirmada!",
    declinedMessage: "Gracias por tu respuesta. Registramos que no confirmaste asistencia para esta clase.",
    submitError: "Error al registrar la asistencia. Inténtalo de nuevo.",
    connectionError: "Error de conexión."
  }
};

const supportedLangs = Object.keys(i18n);
let currentLang = supportedLangs.includes(localStorage.getItem("fg_attendance_lang"))
  ? localStorage.getItem("fg_attendance_lang")
  : "pt";

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("t");

const jwtTokenInput = document.getElementById("jwtToken");
const displayEmail = document.getElementById("displayEmail");
const userInfo = document.getElementById("userInfo");
const displayClassId = document.getElementById("displayClassId");
const attendanceForm = document.getElementById("attendanceForm");
const formError = document.getElementById("formError");
const submitBtn = attendanceForm.querySelector('button[type="submit"]');

let emailForDisplay = null;
let classIdForDisplay = null;

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

  if (submitBtn.disabled && !jwtTokenInput.value) {
    submitBtn.textContent = t("submit");
  }
}

function setTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;
  localStorage.setItem("fg_theme", nextTheme);
}

function isAttendanceConfirmed(value) {
  return value === "Sim";
}

function renderSuccessMessage(attendanceValue) {
  const confirmed = isAttendanceConfirmed(attendanceValue);
  const title = confirmed ? t("successTitle") : t("declinedTitle");
  const message = confirmed ? t("successMessage") : t("declinedMessage");
  const iconPath = confirmed
    ? "M5 12.5 9.2 16.7 19 7"
    : "M7 7 17 17M17 7 7 17";

  attendanceForm.innerHTML = `
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
  }
} catch (e) {
  console.error("Erro ao decodificar payload do JWT para exibição:", e);
}

if (token && emailForDisplay && classIdForDisplay) {
  jwtTokenInput.value = token;
  displayEmail.textContent = emailForDisplay;
  displayClassId.textContent = classIdForDisplay;
  userInfo.style.display = "block";

  const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
  window.history.replaceState({ path: newUrl }, "", newUrl);
} else {
  submitBtn.disabled = true;
  formError.style.display = "block";
}

document.querySelectorAll('input[name="attendance"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    document.querySelectorAll(".radio-chip").forEach((chip) => {
      chip.classList.toggle("radio-chip--selected", chip.querySelector("input").checked);
    });
  });
});

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentLang = btn.dataset.lang;
    localStorage.setItem("fg_attendance_lang", currentLang);
    applyTranslations();
  });
});

document.getElementById("themeToggle")?.addEventListener("click", () => {
  setTheme(document.body.dataset.theme === "dark" ? "light" : "dark");
});

attendanceForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const attendanceValue = attendanceForm.querySelector('input[name="attendance"]:checked')?.value;
  if (!attendanceValue) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${t("sending")}`;

  const payload = {
    token: jwtTokenInput.value,
    attendance: attendanceValue
  };

  try {
    const response = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      renderSuccessMessage(attendanceValue);
    } else {
      alert(t("submitError"));
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
