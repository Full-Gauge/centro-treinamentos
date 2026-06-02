const i18n = {
  pt: {
    htmlLang: "pt-BR",
    documentTitle: "Registro de presença de treinamentos - Full Gauge",
    themeToggle: "Tema",
    emailLabel: "E-mail *",
    pageTitle: "Registro de Presença",
    attendanceQuestion: "Confirmar presença?",
    submit: "Registrar presença hoje",
    sending: "Enviando...",
    successTitle: "Presença registrada!",
    successMessage: "Obrigado por confirmar.",
    declinedTitle: "Presença não confirmada!",
    declinedMessage: "Registramos que você não confirmará presença hoje.",
    yes: "Sim",
    no: "Não",
    submitError: "Erro ao registrar presença. Tente novamente.",
    connectionError: "Erro de conexão.",
    invalidEmail: "Informe um e-mail válido.",
    emailBounce: "Este domínio de e-mail não é permitido."
  },
  en: {
    htmlLang: "en",
    documentTitle: "Training attendance register - Full Gauge",
    themeToggle: "Theme",
    emailLabel: "E-mail *",
    pageTitle: "Attendance Register",
    attendanceQuestion: "Confirm attendance?",
    submit: "Register attendance today",
    sending: "Sending...",
    successTitle: "Attendance registered!",
    successMessage: "Thank you for confirming.",
    declinedTitle: "Attendance not confirmed!",
    declinedMessage: "We have registered that you will not be attending today.",
    yes: "Yes",
    no: "No",
    submitError: "Error registering attendance. Please try again.",
    connectionError: "Connection error.",
    invalidEmail: "Enter a valid e-mail address.",
    emailBounce: "This email domain is not allowed."
  },
  es: {
    htmlLang: "es",
    documentTitle: "Registro de asistencia a capacitaciones - Full Gauge",
    themeToggle: "Tema",
    emailLabel: "Correo electrónico *",
    pageTitle: "Registro de Asistencia",
    attendanceQuestion: "¿Confirmar asistencia?",
    submit: "Registrar asistencia hoy",
    sending: "Enviando...",
    successTitle: "¡Asistencia registrada!",
    successMessage: "Gracias por confirmar.",
    declinedTitle: "¡Asistencia no confirmada!",
    declinedMessage: "Hemos registrado que no confirmarás asistencia hoy.",
    yes: "Sí",
    no: "No",
    submitError: "Error al registrar la asistencia. Inténtalo de nuevo.",
    connectionError: "Error de conexão.",
    invalidEmail: "Ingrese un correo electrónico válido.",
    emailBounce: "Este dominio de correo no está permitido."
  }
};

const supportedLangs = Object.keys(i18n);
let currentLang = supportedLangs.includes(localStorage.getItem("fg_attendance_lang"))
  ? localStorage.getItem("fg_attendance_lang")
  : "pt";

const emailInput = document.getElementById("email");
const emailError = document.getElementById("email-error");
const emailSuccessIcon = document.getElementById("email-success-icon");
const attendanceForm = document.getElementById("attendanceForm");
const submitBtn = attendanceForm.querySelector('button[type="submit"]');
let isSubmitting = false;

const DISPOSABLE_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "throwawaymail.com"
];

function t(key) {
  return (i18n[currentLang] || i18n.pt)[key] || i18n.pt[key] || key;
}

function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
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

function validateForm() {
  if (isSubmitting) return;
  const val = emailInput?.value.trim() || "";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = val && emailRegex.test(val) && !isDisposableEmail(val);
  if (submitBtn) submitBtn.disabled = !isEmailValid;
}

emailInput?.addEventListener("input", () => {
  const val = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  emailInput.classList.remove("invalid");

  if (emailError) {
    emailError.classList.remove("visible");
    // Pequeno atraso para limpar o texto somente após a animação de saída
    setTimeout(() => {
      if (!emailError.classList.contains("visible")) emailError.textContent = "";
    }, 200);
  }

  // Validação em tempo real para exibir o ícone de check
  if (val && emailRegex.test(val) && !isDisposableEmail(val)) {
    emailSuccessIcon?.classList.add("visible");
  } else {
    emailSuccessIcon?.classList.remove("visible");
  }

  validateForm();
});

attendanceForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailValue = emailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailValue || !emailRegex.test(emailValue)) {
    emailInput.classList.add("invalid");
    if (emailError) {
      emailError.textContent = t("invalidEmail");
      emailError.classList.add("visible");
    }
    return;
  }

  if (isDisposableEmail(emailValue)) {
    emailInput.classList.add("invalid");
    if (emailError) {
      emailError.textContent = t("emailBounce");
      emailError.classList.add("visible");
    }
    return;
  }

  isSubmitting = true;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${t("sending")}`;

  const attendanceValue = "Sim";

  const payload = {
    email: emailValue,
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
      isSubmitting = false;
      validateForm();
      submitBtn.textContent = t("submit");
    }
  } catch (err) {
    alert(t("connectionError"));
    isSubmitting = false;
    validateForm();
    submitBtn.textContent = t("submit");
  }
});

setTheme(localStorage.getItem("fg_theme") || "light");
applyTranslations();
validateForm();
