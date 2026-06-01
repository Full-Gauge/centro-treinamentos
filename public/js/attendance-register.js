const i18n = {
  pt: {
    htmlLang: "pt-BR",
    documentTitle: "Registro de presença de treinamentos - Full Gauge",
    themeToggle: "Tema",
    pageTitle: "Registro de Presença",
    submit: "Registrar presença hoje",
    sending: "Enviando...",
    successTitle: "Presença registrada!",
    successMessage: "Obrigado por confirmar.",
    submitError: "Erro ao registrar presença. Tente novamente.",
    connectionError: "Erro de conexão."
  },
  en: {
    htmlLang: "en",
    documentTitle: "Training attendance register - Full Gauge",
    themeToggle: "Theme",
    pageTitle: "Attendance Register",
    submit: "Register attendance today",
    sending: "Sending...",
    successTitle: "Attendance registered!",
    successMessage: "Thank you for confirming.",
    submitError: "Error registering attendance. Please try again.",
    connectionError: "Connection error."
  },
  es: {
    htmlLang: "es",
    documentTitle: "Registro de asistencia a capacitaciones - Full Gauge",
    themeToggle: "Tema",
    pageTitle: "Registro de Asistencia",
    submit: "Registrar asistencia hoy",
    sending: "Enviando...",
    successTitle: "¡Asistencia registrada!",
    successMessage: "Gracias por confirmar.",
    submitError: "Error al registrar la asistencia. Inténtalo de nuevo.",
    connectionError: "Error de conexión."
  }
};

const supportedLangs = Object.keys(i18n);
let currentLang = supportedLangs.includes(localStorage.getItem("fg_attendance_lang"))
  ? localStorage.getItem("fg_attendance_lang")
  : "pt";

const emailInput = document.getElementById("email");
const attendanceForm = document.getElementById("attendanceForm");
const submitBtn = attendanceForm.querySelector('button[type="submit"]');

function t(key) {
  return (i18n[currentLang] || i18n.pt)[key] || i18n.pt[key] || key;
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
}

function setTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.body.dataset.theme = nextTheme;
  localStorage.setItem("fg_theme", nextTheme);
}

function renderSuccessMessage() {
  attendanceForm.innerHTML = `
    <div style="text-align:center; padding: 2rem;">
      <h3>${t("successTitle")}</h3>
      <p>${t("successMessage")}</p>
    </div>
  `;
}

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

  const emailValue = emailInput.value.trim();
  if (!emailValue) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${t("sending")}`;

  const payload = {
    email: emailValue
  };

  try {
    const response = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      renderSuccessMessage();
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
