// ─── Traduções ───────────────────────────────────────────────────────────────
const i18n = {
  pt: {
    brandEyebrow: "Plataforma de inscrição de treinamentos",
    brandTitle: "Bem-vindo! Vamos começar seu cadastro.",
    brandCopy:
      "Desde 1985, a Full Gauge desenvolve soluções para automação em refrigeração, aquecimento e climatização com padrão internacional de qualidade.",
    featureOne: "Segurança e confiança no cadastro de clientes",
    featureTwo: "Vendedores e consultores técnicos especializados",
    featureThree: "Marca consolidada internacionalmente em 62 países",
    overallProgressLabel: "Progresso geral",
    clearForm: "Limpar cadastro",
    themeToggle: "Tema",
    previous: "Voltar",
    next: "Avançar",
    submit: "Enviar cadastro",
    requiredLegend: "Campos com * são obrigatórios.",
    confirmTitle: "Confirmação",
    confirmCancel: "Cancelar",
    confirmConfirm: "Confirmar",
    submitSuccess: {
      title: "Cadastro enviado com sucesso!",
      message: "Agradecemos o seu interesse! Em breve entraremos em contato com mais informações sobre a sua inscrição.",
      icon: '<svg viewBox="0 0 24 24"><path d="M5 12.5 9.2 16.7 19 7"></path></svg>' // Ícone de checkmark
    },
    submitError: "Erro ao enviar. Tente novamente.",
    loading: "Carregando...",
    invalidToken: "Token inválido.",
    emailBounce: "Este domínio de e-mail não é permitido.",
    selectOption:"Selecione uma opção",
  },
  en: {
    brandEyebrow: "Training Enrollment Platform",
    brandTitle: "Welcome! Let's start your registration.",
    brandCopy:
      "Since 1985, Full Gauge develops solutions for refrigeration, heating and climate control automation with international quality standards.",
    featureOne: "Secure and reliable client registration",
    featureTwo: "Specialized sales and technical consultants",
    featureThree: "Brand established in 62 countries worldwide",
    overallProgressLabel: "Overall Progress",
    clearForm: "Clear form",
    themeToggle: "Theme",
    previous: "Back",
    next: "Next",
    submit: "Submit registration",
    requiredLegend: "Fields marked with * are required.",
    confirmTitle: "Confirmation",
    confirmCancel: "Cancel",
    confirmConfirm: "Confirm",
    submitSuccess: {
      title: "Registration submitted successfully!",
      message: "Thank you for your interest! We will contact you shortly with more information about your enrollment.",
      icon: '<svg viewBox="0 0 24 24"><path d="M5 12.5 9.2 16.7 19 7"></path></svg>'
    },
    submitError: "Error sending. Please try again.",
    loading: "Loading...",
    invalidToken: "Invalid token.",
    emailBounce: "This email domain is not allowed.",
    selectOption:"Select an option"
  },
  es: {
    brandEyebrow: "Plataforma de inscripción a capacitaciones",
    brandTitle: "¡Bienvenido! Comencemos tu registro.",
    brandCopy:
      "Desde 1985, Full Gauge desarrolla soluciones para automatización en refrigeración, calefacción y climatización con estándares de calidad internacionales.",
    featureOne: "Seguridad y confianza en el registro de clientes",
    featureTwo: "Vendedores y consultores técnicos especializados",
    featureThree: "Marca consolidada internacionalmente en 62 países",
    overallProgressLabel: "Progreso general",
    clearForm: "Limpiar registro",
    themeToggle: "Tema",
    previous: "Volver",
    next: "Avanzar",
    submit: "Enviar registro",
    requiredLegend: "Los campos con * son obligatorios.",
    confirmTitle: "Confirmación",
    confirmCancel: "Cancelar",
    confirmConfirm: "Confirmar",
    submitSuccess: {
      title: "¡Registro enviado con éxito!",
      message: "¡Gracias por tu interés! Nos pondremos en contacto contigo en breve con más información sobre tu inscripción.",
      icon: '<svg viewBox="0 0 24 24"><path d="M5 12.5 9.2 16.7 19 7"></path></svg>'
    },
    submitError: "Error al enviar. Inténtalo de nuevo.",
    loading: "Cargando...",
    invalidToken: "Token inválido.",
    emailBounce: "Este dominio de correo no está permitido.",
    selectOption:"Seleccione una opción"
  },
};

// ─── Definição das Etapas ─────────────────────────────────────────────────────
// Lista de domínios que costumam causar bounce ou são temporários
const DISPOSABLE_DOMAINS = [
  "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com", "throwawaymail.com"
];

const STEPS = [
  {
    title: { pt: "Relação conosco", en: "Relationship with us", es: "Relación con nosotros" },
    description: {
      pt: "Informações principais de identificação.",
      en: "Main identification information.",
      es: "Información principal de identificación.",
    },
    fields: [
      {
        id: "relacao",
        label: { pt: "Relação *", en: "Relationship *", es: "Relacion *" },
        type: "radio",
        required: true,
        full: true,
        options: [
          { value: "PARCEIRO", label: { pt: "Parceiro", en: "Partner", es: "Socio" } },
          { value: "GERAL", label: { pt: "Geral",en: "General",es: "General"} },
        ],
      },
      { id: "token", label: { pt: "Qual o token enviado pelo parceiro? *", en: "Which token is sent by the partner? *", es: "¿Qué token es enviado por el socio? *" }, type: "text", required: true, validateToken: true, uppercase: true },
    ],
  },
    {
    title: { pt: "Inscrição", en: "Enrollment", es: "Inscripción" },
    description: {
      pt: "Preencha seus dados pessoais e profissionais.",
      en: "Fill in your personal and professional information.",
      es: "Complete sus datos personales y profesionales.",
    },
    fields: [
      {
        id: "fullName",
        label: { pt: "Nome Completo *", en: "Full Name *", es: "Nombre Completo *" },
        type: "text",
        required: true,
        full: true,
      },
      {
        id: "cpf",
        label: { pt: "CPF *", en: "CPF *", es: "CPF *" },
        type: "text",
        required: true,
        mask: "cpf",
      },
      {
        id: "empresa",
        label: { pt: "Empresa *", en: "Company *", es: "Empresa *" },
        type: "select",
        required: true,
        options: [
          { value: "PAR-0002", label: "Armacell" },
          { value: "PAR-0003", label: "Brahex" },
          { value: "PAR-0004", label: "Bitzer" },
          { value: "PAR-0005", label: "Chemours" },
          { value: "PAR-0006", label: "DuFrio" },
          { value: "PAR-0001", label: "Frigelar" },
          { value: "PAR-0007", label: "Nacional Frio" },
          { value: "PAR-0008", label: "Soma" }
        ],
      },
      {
        id: "segmento",
        label: { pt: "Segmento *", en: "Segment *", es: "Segmento *" },
        type: "select",
        required: true,
        options: ["Aquecimento", "Ventilação", "Ar Condicionado", "Refrigeração"],
      },
      {
        id: "atuacao",
        label: { pt: "Atuação *", en: "Field of Work *", es: "Actuación *" },
        type: "select",
        required: true,
        options: ["Residencial", "Comercial", "Industrial","Saúde/hospitalar"],
      },
      {
        id: "cidade",
        label: { pt: "Cidade *", en: "City *", es: "Ciudad *" },
        type: "text",
        required: true,
      },
      {
        id: "telefone",
        label: { pt: "Telefone / WhatsApp *", en: "Phone / WhatsApp *", es: "Teléfono / WhatsApp *" },
        type: "tel",
        required: true,
        mask: "phone",
      },
      {
        id: "email",
        label: { pt: "E-mail *", en: "E-mail *", es: "Correo electrónico *" },
        type: "email",
        required: true,
        validateEmail: true,
      },
    ],
  },
  {
    title: { pt: "Turmas e módulos", en: "Course classes", es: "Clases del curso" },
    description: {
      pt: "",
      en: "",
      es: "",
    },
    fields: [
      { id: "turmas", label: { pt: "Turmas *", en: "Classes *", es: "Clases *" }, type: "select", options: [], required: true },
      { id: "modulos", label: { pt: "Módulos *", en: "Modules *", es: "Módulos *" }, type: "select", options: [] ,required: true, multiple: true},
    ],
  },
  {
      title: { pt: "Termo de Inscrição", en: "Enrollment Terms", es: "Término de Inscripción" },
      description: {
        pt: "Leia e aceite os termos para concluir sua inscrição.",
        en: "Read and accept the terms to complete your registration.",
        es: "Lea y acepte los términos para completar su registro.",
      },
      fields: [
        // Checkboxes de termos
        {
          id: "termImage",
          label: {
            pt: "Declaro que li e concordo com a cessão de direitos de imagem",
            en: "I declare that I have read and agree to the assignment of image rights",
            es: "Declaro que he leído y acepto la cesión de derechos de imagen"
          },
          type: "checkbox",
          required: true,
          full: true
        },
        {
          id: "termCosts",
          label: {
            pt: "Declaro que li e concordo que o inscrito é responsável pelos seus próprios gastos como passagens, hospedagens e afins.",
            en: "I declare that I have read and agree that the enrollee is responsible for their own expenses.",
            es: "Declaro que he leído y acepto que el inscrito es responsable de sus propios gastos."
          },
          type: "checkbox",
          required: true,
          full: true
        }
      ],
      termsLink: {
        url: "/docs/termo-de-uso.pdf",
        label: { pt: "Leia os Termos de Uso", en: "Read Terms of Use", es: "Leer Términos de Uso" }
    },
  }
];

// ─── Estado ───────────────────────────────────────────────────────────────────
let currentStep = 0;
let currentLang = "pt";
let formData = {};
let pendingAction = null;
let isFetchingTurmas = false;
let isFetchingModulos = false;
let isValidatingToken = false;
let isSubmittingForm = false;

// ─── Utilitários ──────────────────────────────────────────────────────────────
function t(key) {
  return (i18n[currentLang] || i18n.pt)[key] || key;
}

function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}

function applyMask(value, mask) {
  const digits = value.replace(/\D/g, "");
  if (mask === "cpf") {
    return digits
      .slice(0, 11)
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }
  if (mask === "phone") {
    if (digits.length <= 10) {
      return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
    }
    return digits.slice(0, 11).replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
  }
  return value;
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderStepper() {
  const stepper = document.getElementById("stepper");
  if (!stepper) return;
  stepper.innerHTML = STEPS.map((s, i) => {
    const cls = i < currentStep ? "done" : i === currentStep ? "active" : "";
    const label = s.title[currentLang] || s.title.pt;
    return `<div class="step-item ${cls}">
      <span>Etapa ${i + 1}</span>
      <strong>${label}</strong>
    </div>`;
  }).join("");
}

function renderProgress() {
  const pct = Math.round(((currentStep + 1) / STEPS.length) * 100);
  const fill = document.getElementById("progressFill");
  const val = document.getElementById("progressValue");
  const counter = document.getElementById("stepCounter");
  if (fill) { fill.style.width = pct + "%"; fill.setAttribute("aria-valuenow", pct); }
  if (val) val.textContent = pct + "%";
  if (counter) counter.textContent = `Etapa ${currentStep + 1} de ${STEPS.length}`;
}

function renderFields() {
  const step = STEPS[currentStep];
  const container = document.getElementById("formFields");
  const title = document.getElementById("stepTitle");
  const desc = document.getElementById("stepDescription");

  if (title) title.textContent = step.title[currentLang] || step.title.pt;
  if (desc) desc.textContent = step.description[currentLang] || step.description.pt;
  if (!container) return;

  // Verifica se é a etapa de termos e se há um link para exibir
  const isTermsStep = currentStep === STEPS.length - 1;
  let termsLinkHtml = '';
  let checkboxesInitiallyDisabled = false;

  if (isTermsStep && step.termsLink) {
    termsLinkHtml = `<div class="field-wrap full">
      <a href="${step.termsLink.url}" target="_blank" id="termsLink" class="primary-btn" style="text-decoration: none; display: inline-block; margin-bottom: 1rem;">${step.termsLink.label[currentLang] || step.termsLink.label.pt}</a>
    </div>`;
    if (!formData.termsLinkVisited) {
      checkboxesInitiallyDisabled = true;
    }
  }

  container.innerHTML = termsLinkHtml + step.fields
    .map((f) => {
      // O campo token só deve aparecer se a relação for PARCEIRO
      if (f.id === "token" && formData.relacao !== "PARCEIRO") return "";
      const fieldType = (f.id === "empresa" && formData.relacao === "GERAL") ? "text" : f.type;

      const label = f.label[currentLang] || f.label.pt;
      const val = formData[f.id] ?? "";
      const fullClass = f.full ? "full" : "";

      if (fieldType === "select") {
        const isLoading = (f.id === "turmas" && isFetchingTurmas) || (f.id === "modulos" && isFetchingModulos);
        
        if (f.multiple && !isLoading) {
          const chips = (f.options || [])
            .map((o) => {
              const isObj = typeof o === "object" && o !== null;
              const optVal = isObj ? o.value : o;
              let optLabel = isObj ? o.label : o;
              if (optLabel && typeof optLabel === "object") optLabel = optLabel[currentLang] || optLabel.pt || optVal;
              
              const isSelected = Array.isArray(val) ? val.includes(optVal) : false;
              
              return `<label class="checkbox-chip${isSelected ? " checkbox-chip--selected" : ""}">
                <input type="checkbox" name="${f.id}" value="${optVal}"${isSelected ? " checked" : ""}>
                <span>${optLabel}</span>
              </label>`;
            })
            .join("");

          return `<div class="field-wrap ${fullClass}" id="field-wrap-${f.id}">
            <label>${label}</label>
            <div class="checkbox-group" id="${f.id}-group">
              ${chips || `<p class="helper">${currentLang === 'pt' ? 'Nenhum item disponível' : 'No items available'}</p>`}
            </div>
          </div>`;
        }

        const isLocked = f.id === "empresa" && formData.empresaLocked;
        const placeholder = isLoading ? t("loading") : t("selectOption");
        const opts = (f.options || [])
          .map((o) => {
            const isObj = typeof o === "object" && o !== null;
            const optVal = isObj ? o.value : o;
            let optLabel = isObj ? o.label : o;
            
            // Suporte para traduções ou labels simples vindo da API
            if (optLabel && typeof optLabel === "object") optLabel = optLabel[currentLang] || optLabel.pt || optVal;
            return `<option value="${optVal}"${val === optVal ? " selected" : ""}>${optLabel}</option>`;
          })
          .join("");
        return `<div class="field-wrap ${fullClass} ${isLoading ? 'loading-select' : ''}">
          <label for="${f.id}">${label}</label>
          <select id="${f.id}" name="${f.id}"${f.required ? " required" : ""}${isLoading || isLocked ? " disabled" : ""}>
            <option value="">${placeholder}</option>${opts}
          </select>
        </div>`;
      }

      if (fieldType === "radio") {
        const chips = f.options.map((o) => {
          const optLabel = o.label[currentLang] || o.label.pt;
          const checked = val === o.value ? " checked" : "";
          return `<label class="radio-chip${val === o.value ? " radio-chip--selected" : ""}">
            <input type="radio" name="${f.id}" value="${o.value}"${checked}${f.required ? " required" : ""}>
            <span>${optLabel}</span>
          </label>`;
        }).join("");
        return `<div class="field-wrap ${fullClass}" id="field-wrap-${f.id}">
          <label>${label}</label>
          <div class="radio-group" role="group" aria-label="${label}" id="${f.id}-group">
            ${chips}
          </div>
        </div>`;
      }

      if (fieldType === "checkbox") {
        const checked = val === true ? " checked" : "";
        const disabledAttr = checkboxesInitiallyDisabled ? "disabled" : ""; // Aplica o disabled aqui
        return `<div class="field-wrap ${fullClass}" id="field-wrap-${f.id}">
          <div class="checkbox-group">
            <label class="checkbox-chip${val === true ? " checkbox-chip--selected" : ""}" for="${f.id}">
              <input type="checkbox" id="${f.id}" name="${f.id}" ${checked} ${f.required ? "required" : ""} ${disabledAttr}>
              <span>${label}</span>
            </label>
          </div>
        </div>`;
      }

            // Campo normal (text, email, tel, number, etc)
      const errorId = `${f.id}-error`;
      return `<div class="field-wrap ${fullClass}">
        <label for="${f.id}">${label}</label>
        <input
          type="${fieldType}"
          id="${f.id}"
          name="${f.id}"
          value="${f.uppercase ? val.toUpperCase() : val}"
          ${f.required ? "required" : ""}
          ${(f.validateEmail || f.validateToken) ? `aria-describedby="${errorId}"` : ""}
          autocomplete="off"
          ${f.uppercase ? 'style="text-transform: uppercase;"' : ''}>
        ${(f.validateEmail || f.validateToken) ? `<span class="input-error-msg" id="${errorId}" role="alert"></span>` : ""}
      </div>`;
    })
    .join("");

  // === EVENT LISTENERS (corrigido) ===
  step.fields.forEach((f) => {
    const fieldType = (f.id === "empresa" && formData.relacao === "GERAL") ? "text" : f.type;

    if (fieldType === "radio") {
      const group = document.getElementById(`${f.id}-group`);
      if (!group) return;
      group.querySelectorAll(`input[name="${f.id}"]`).forEach((radio) => {
        radio.addEventListener("change", () => {
          if (currentStep === 1) clearStatusIfError();
          const wrap = document.getElementById(`field-wrap-${f.id}`);
          if (wrap) wrap.classList.remove("invalid-group");

          if (f.id === "relacao") {
            // Ao mudar a relação, limpa o formulário mantendo apenas a nova seleção
            formData = { [f.id]: radio.value };
            render();
          } else {
            formData[f.id] = radio.value;
            group.querySelectorAll(".radio-chip").forEach((chip) => {
              chip.classList.toggle("radio-chip--selected", chip.querySelector("input").checked);
            });
          }
        });
      });
      return; // só sai do radio
    }

    if (fieldType === "select" && f.multiple) {
      const group = document.getElementById(`${f.id}-group`);
      if (!group) return;
      group.querySelectorAll(`input[type="checkbox"]`).forEach((cb) => {
        cb.addEventListener("change", () => {
          if (currentStep === 1) clearStatusIfError();
          const wrap = document.getElementById(`field-wrap-${f.id}`);
          if (wrap) wrap.classList.remove("invalid-group");
          const checkedVals = Array.from(group.querySelectorAll("input:checked")).map(i => i.value);
          formData[f.id] = checkedVals;
          cb.closest(".checkbox-chip").classList.toggle("checkbox-chip--selected", cb.checked);
        });
      });
      return;
    }

    // Para todos os outros campos (incluindo token)
    const el = document.getElementById(f.id);
    if (!el) return;

    el.addEventListener(fieldType === "checkbox" ? "change" : "input", () => {
      if (currentStep === 1) clearStatusIfError();
      const wrap = document.getElementById(`field-wrap-${f.id}`);
      if (wrap) wrap.classList.remove("invalid-group"); // Remove o erro ao interagir
      el.classList.remove("invalid");
      let v = el.value;
      if (f.mask) {
        v = applyMask(v, f.mask);
        el.value = v;
      }
      if (f.uppercase) {
        v = v.toUpperCase();
        el.value = v; // Atualiza o valor exibido no campo
      }
      
      if (fieldType === "checkbox") {
        formData[f.id] = el.checked;
        el.closest(".checkbox-chip")?.classList.toggle("checkbox-chip--selected", el.checked);
        
        // Se estivermos na última etapa, atualizamos o estado do botão de submit em tempo real
        const isLast = currentStep === STEPS.length - 1;
        if (isLast) renderButtons();
      } else if (f.id === "turmas" && v) {
        // Lógica específica para turmas: limpa módulos e busca novos dados
        formData["modulos"] = []; 
        fetchModulosData(v);
        // Garante que o valor seja salvo
        formData[f.id] = v;
      } else {
        formData[f.id] = v;
      }

      // Limpa erro de e-mail em tempo real
      if (f.validateEmail) {
        const errSpan = document.getElementById(`${f.id}-error`);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(v.trim()) && !isDisposableEmail(v.trim())) {
          el.classList.remove("invalid");
          if (errSpan) errSpan.textContent = "";
        }
      }

      // Limpa erro de token em tempo real
      if (f.validateToken) {
        const errSpan = document.getElementById(`${f.id}-error`);
        if (v.trim().startsWith("FULLGAUGE-")) {
          el.classList.remove("invalid");
          if (errSpan) errSpan.textContent = "";
        }
      }
    });
  });

  // Add event listener for termsLink if it exists and hasn't been visited yet
  if (isTermsStep && step.termsLink && !formData.termsLinkVisited) {
    const termsLinkEl = document.getElementById("termsLink");
    if (termsLinkEl) {
      termsLinkEl.addEventListener("click", () => {
        formData.termsLinkVisited = true;
        render(); // Re-render to enable checkboxes
      });
    }
  }
}

function renderButtons() {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const isLast = currentStep === STEPS.length - 1;
  const step = STEPS[currentStep];

  if (prevBtn) prevBtn.style.visibility = currentStep === 0 ? "hidden" : "visible";
  if (nextBtn) {
    nextBtn.style.display = isLast ? "none" : "inline-flex";
    if (isValidatingToken) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${t("loading")}`;
    } else {
      nextBtn.disabled = false;
      nextBtn.textContent = t("next");
    }
  }
  
  if (submitBtn) { 
    submitBtn.style.display = isLast ? "inline-flex" : "none";
    if (isSubmittingForm) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner" aria-hidden="true"></span> ${t("loading")}`;
    } else {
      submitBtn.disabled = false;
      submitBtn.textContent = t("submit");
    }
    
    // Desabilita o botão se houver checkboxes obrigatórios não marcados (termos)
    const termsAccepted = step.fields.every(f => f.type !== "checkbox" || !f.required || formData[f.id] === true);
    submitBtn.disabled = isLast && !termsAccepted;
  }
  if (prevBtn) prevBtn.textContent = t("previous");
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (val) el.textContent = val;
  });
}

function render() {
  renderStepper();
  renderProgress();
  renderFields();
  renderButtons();
  applyI18n();
}

// ─── Validação ────────────────────────────────────────────────────────────────
function validateCurrentStep() {
  const step = STEPS[currentStep];
  if (step.isReview) return true;
  let valid = true;
  step.fields.forEach((f) => {
    const fieldType = (f.id === "empresa" && formData.relacao === "GERAL") ? "text" : f.type;

    if (fieldType === "radio") {
      const wrap = document.getElementById(`field-wrap-${f.id}`);
      const group = document.getElementById(`${f.id}-group`);
      if (!group) return;
      const checked = group.querySelector(`input[name="${f.id}"]:checked`);
      if (wrap) wrap.classList.remove("invalid-group");
      if (f.required && !checked) {
        if (wrap) wrap.classList.add("invalid-group");
        valid = false;
      }
      return;
    }

    if (fieldType === "select" && f.multiple) {
      const wrap = document.getElementById(`field-wrap-${f.id}`);
      const group = document.getElementById(`${f.id}-group`);
      if (wrap) wrap.classList.remove("invalid-group");
      
      const isEmpty = !Array.isArray(formData[f.id]) || formData[f.id].length === 0;
      if (f.required && isEmpty) {
        if (wrap) wrap.classList.add("invalid-group");
        valid = false;
      }
      return;
    }

    const el = document.getElementById(f.id);
    if (!el) return;
    el.classList.remove("invalid");
    el.removeAttribute("data-error");

    const wrap = document.getElementById(`field-wrap-${f.id}`);
    if (wrap) wrap.classList.remove("invalid-group"); // Limpa antes de revalidar

    if (fieldType === "checkbox") {
      if (f.required && !el.checked) {
        if (wrap) wrap.classList.add("invalid-group"); // Aplica ao wrap para consistência visual
        valid = false;
      }
    } else {
      const isSelectMultiple = fieldType === "select" && f.multiple;
      const isEmpty = isSelectMultiple 
        ? (!Array.isArray(formData[f.id]) || formData[f.id].length === 0)
        : !el.value.trim();

      if (f.required && isEmpty) {
        el.classList.add("invalid");
        valid = false;
        return;
      }
    }

    if (f.validateEmail && el.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const errSpan = document.getElementById(`${f.id}-error`);
      if (!emailRegex.test(el.value.trim())) {
        el.classList.add("invalid");
        const msg = currentLang === "en"
          ? "Enter a valid e-mail address."
          : currentLang === "es"
          ? "Ingrese un correo electrónico válido."
          : "Informe um e-mail válido.";
        if (errSpan) errSpan.textContent = msg;
        valid = false;
      } else if (isDisposableEmail(el.value.trim())) {
        el.classList.add("invalid");
        if (errSpan) errSpan.textContent = t("emailBounce");
        valid = false;
      } else {
        if (errSpan) errSpan.textContent = "";
      }
    }

    if (f.validateToken && el.value.trim()) {
      const errSpan = document.getElementById(`${f.id}-error`);
      if (!el.value.trim().startsWith("FULLGAUGE-")) {
        el.classList.add("invalid");
        if (errSpan) errSpan.textContent = t("invalidToken");
        valid = false;
      } else {
        if (errSpan) errSpan.textContent = "";
      }
    }
  });
  return valid;
}

// ─── Navegação ────────────────────────────────────────────────────────────────
async function validateEnrollmentName() {
  showStatus(
    currentLang === "pt" ? "Validando nome..." : currentLang === "en" ? "Validating name..." : "Validando nombre...",
    ""
  );

  try {
    const response = await fetch("/api/validate-name-flow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.fullName,
        cpf: formData.cpf,
        email: formData.email,
        empresa: formData.empresa,
        relacao: formData.relacao
      })
    });

    const rawBody = await response.text();
    let result = {};

    try {
      result = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      result = { message: rawBody };
    }

    const validate =
      result?.validate ??
      result?.valid ??
      result?.approved ??
      result?.success ??
      result?.data;

    if (!response.ok) {
      const message =
        result?.message ||
        result?.error ||
        (currentLang === "pt"
          ? "Não foi possível validar o nome."
          : currentLang === "en"
          ? "Name validation failed."
          : "No se pudo validar el nombre.");
      showStatus(message, "error");
      return false;
    }

    if (validate === false) {
      showStatus("CPF já cadastrado em outro(a) usuário/inscrição", "error");
      return false;
    }

    if (validate !== true) {
      const message =
        result?.message ||
        result?.error ||
        (currentLang === "pt"
          ? "Não foi possível validar o nome."
          : currentLang === "en"
          ? "Name validation failed."
          : "No se pudo validar el nombre.");
      showStatus(message, "error");
      return false;
    }

    return true;
  } catch (error) {
    showStatus(
      currentLang === "pt"
        ? `Erro ao validar o nome: ${error.message}`
        : currentLang === "en"
        ? `Error validating name: ${error.message}`
        : `Error al validar el nombre: ${error.message}`,
      "error"
    );
    return false;
  }
}

async function goNext() {
  if (!validateCurrentStep()) {
    showStatus(
      currentLang === "pt"
        ? "Preencha os campos obrigatórios."
        : currentLang === "en"
        ? "Please fill in the required fields."
        : "Por favor, completa los campos obligatorios.",
      "error"
    );
    return;
  }

  // Validação de Token via API na Etapa 1 (se for Parceiro)
  if (currentStep === 0 && formData.relacao === "PARCEIRO") {
    const tokenField = document.getElementById("token");
    const errSpan = document.getElementById("token-error");
    
    showStatus(currentLang === "pt" ? "Validando token..." : "Validating token...", "");
    
    isValidatingToken = true;
    renderButtons();

    try {
      const response = await fetch("/api/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: formData.token })
      });

      const result = await response.json();

      if (!response.ok || result.data === false) {
        if (tokenField) tokenField.classList.add("invalid");
        if (errSpan) errSpan.textContent = t("invalidToken");
        showStatus(t("invalidToken"), "error");
        isValidatingToken = false;
        renderButtons();
        return;
      }

      // Se a API retornar um parceiro vinculado ao token, seleciona a empresa e trava o campo
      if (result.parceiro) {
        formData.empresa = result.parceiro;
        formData.empresaLocked = true;
      } else {
        formData.empresaLocked = false;
      }

      // Se a API retornar uma turma vinculada ao token, seleciona a turma e trava o campo
      if (result.turma) {
        formData.turmas = result.turma;
        formData.turmasLocked = true;
        fetchModulosData(result.turma); // Carrega módulos antecipadamente
      } else {
        formData.turmasLocked = false;
      }
      isValidatingToken = false;
    } catch (error) {
      showStatus(t("submitError"), "error");
      isValidatingToken = false;
      renderButtons();
      return;
    }
  }

  if (currentStep === 1) {
    isSubmittingForm = true;
    renderButtons();

    const nameOk = await validateEnrollmentName();

    isSubmittingForm = false;
    renderButtons();

    if (!nameOk) {
      return;
    }
  }

  clearStatus();
  if (currentStep < STEPS.length - 1) {
    currentStep++;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function goPrev() {
  if (currentStep > 0) {
    currentStep--;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// ─── Status ───────────────────────────────────────────────────────────────────
let statusMessageTimeout;

function showStatus(messageData, type = "", isPermanent = false) {
  const wrapper = document.getElementById("statusMessageWrapper");
  const el = document.getElementById("statusMessage");
  if (!el) return;

  if (wrapper) {
    wrapper.style.display = "block";
  }

  clearTimeout(statusMessageTimeout);
  el.classList.remove('show', 'success', 'error');
  el.innerHTML = '';

  if (type) { // Adiciona a classe apenas se 'type' não for uma string vazia
    el.classList.add(type);
  }

  if (type === 'success' && typeof messageData === 'object' && messageData.title) {
    el.innerHTML = `
      <div class="status-message-content">
        <div class="status-icon-wrapper">${messageData.icon}</div>
        <div class="status-text-wrapper">
          <h3 class="status-title">${messageData.title}</h3>
          <p class="status-description">${messageData.message}</p>
          ${isPermanent ? '<button id="startNewRegistrationBtn" class="primary-btn" style="margin-top: 1rem;">Iniciar Novo Cadastro</button>' : ''}
        </div>
      </div>
    `;
    if (isPermanent) {
      setTimeout(() => {
        document.getElementById("startNewRegistrationBtn")?.addEventListener("click", () => {
          location.reload();
        });
      }, 100);
    }
  } else {
    // Fallback para mensagens simples (strings de erro)
    el.textContent = typeof messageData === 'string' ? messageData : (messageData.message || "Erro");
  }

  // Força o navegador a processar o layout para que a animação de opacidade funcione
  void el.offsetWidth;
  el.classList.add('show');
  if ((type === "error" || type === "success") && wrapper) {
    wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (type !== "error" && !isPermanent) {
    statusMessageTimeout = setTimeout(() => {
      el.classList.remove('show');
    }, 5000);
  }
}

function clearStatus() {
  clearTimeout(statusMessageTimeout);
  const el = document.getElementById("statusMessage");
  if (el) {
    el.classList.remove('show', 'success', 'error');
    el.innerHTML = '';
  }
}

function clearStatusIfError() {
  const el = document.getElementById("statusMessage");
  if (el?.classList.contains("error")) {
    clearStatus();
  }
}

// ─── Modal de confirmação ─────────────────────────────────────────────────────
function openConfirm(message, onConfirm) {
  pendingAction = onConfirm;
  const modal = document.getElementById("confirmModal");
  const msgEl = document.getElementById("confirmMessage");
  if (!modal || !msgEl) return;
  msgEl.textContent = message;
  modal.hidden = false;
  modal.setAttribute("aria-hidden", "false");
}

function closeConfirm() {
  const modal = document.getElementById("confirmModal");
  if (!modal) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  pendingAction = null;
}

// ─── Submit ───────────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!validateCurrentStep()) {
    showStatus(
      currentLang === "pt"
        ? "Preencha os campos obrigatórios."
        : currentLang === "en"
        ? "Please fill in the required fields."
        : "Por favor, completa los campos obligatorios.",
      "error"
    );
    return;
  }

  isSubmittingForm = true;
  renderButtons(); // Mostra o loader no botão de submit

  showStatus(
    currentLang === "pt" ? "Enviando..." : currentLang === "en" ? "Sending..." : "Enviando...",
    ""
  );

  // Garantia: Certifica que campos múltiplos (como módulos) sejam enviados como Array, mesmo se vazios
  const payload = { ...formData };
  if (!Array.isArray(payload.modulos)) payload.modulos = [];

  try {
    // Substitua a URL abaixo pelo seu endpoint real
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      isSubmittingForm = false; // Esconde o loader
      handleSuccessfulSubmission(); // Chama a nova função para lidar com o sucesso
    } else {
      showStatus(t("submitError"), "error");
      isSubmittingForm = false; // Esconde o loader
      renderButtons(); // Re-renderiza para remover o loader
    }
  } catch {
    showStatus(t("submitError"), "error");
    isSubmittingForm = false; // Esconde o loader
    renderButtons(); // Re-renderiza para remover o loader
  }
}

// Nova função para lidar com o envio bem-sucedido: esconde o formulário e mostra a mensagem permanente
function handleSuccessfulSubmission() {
  const wizardContent = document.getElementById("wizardContent");
  const statusMessageWrapper = document.getElementById("statusMessageWrapper");

  if (wizardContent) {
    wizardContent.style.display = 'none'; // Oculta todo o conteúdo do wizard
  }
  if (statusMessageWrapper) {
    statusMessageWrapper.style.display = 'block'; // Garante que o wrapper da mensagem de status esteja visível
    // Pequeno delay para garantir que a transição CSS funcione após a mudança de display
    requestAnimationFrame(() => {
      showStatus(i18n[currentLang].submitSuccess, "success", true); // Exibe a mensagem de sucesso permanentemente

      // Dispara a animação de confete
      if (window.confetti) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#007a47', '#00a15c', '#ffffff'], // Cores da marca
          disableForReducedMotion: true // Respeita usuários que preferem menos movimento
        });
      }
    });
  }
}

// ─── Busca de Dados Externos ──────────────────────────────────────────────────
async function fetchTurmasData() {
  isFetchingTurmas = true;
  // Se o usuário já estiver na etapa das turmas, renderiza o estado de loading
  const turmasStep = STEPS.find(s => s.fields.some(f => f.id === 'turmas'));
  if (STEPS[currentStep] === turmasStep) renderFields();

  try {
    const response = await fetch('/api/turmas?v=' + Date.now());

    if (response.ok && !response.bodyUsed) {
      const data = await response.json();

      const turmasStep = STEPS.find(s => s.fields.some(f => f.id === 'turmas'));
      if (turmasStep) {
        const field = turmasStep.fields.find(f => f.id === 'turmas');
        field.options = Array.isArray(data.data) 
          ? data.data.map(t => ({ value: t.id || t.FG_TRAININGCLASSID, label: (t.id || t.FG_TRAININGCLASSID) + ' - ' + (t.name || t.NAME) })) 
          : [];
        // Se estivermos na etapa das turmas, renderiza novamente
        if (STEPS[currentStep] === turmasStep) renderFields();
      }
    }
  } catch (err) {
    console.error("Erro ao carregar turmas:", err);
  } finally {
    isFetchingTurmas = false;
    if (STEPS[currentStep] === turmasStep) renderFields();
  }
}

async function fetchModulosData(classId) {
  isFetchingModulos = true;
  const modulosStep = STEPS.find(s => s.fields.some(f => f.id === 'modulos'));
  if (STEPS[currentStep] === modulosStep) renderFields();

  try {
    const response = await fetch(`/api/modulos?classId=${classId}&v=${Date.now()}`);

    if (response.ok) {
      const data = await response.json();
      if (modulosStep) {
        const field = modulosStep.fields.find(f => f.id === 'modulos');
        
        // Mapeia os dados vindo da API (ajuste as chaves conforme o retorno do seu backend)
        field.options = Array.isArray(data.data) 
          ? data.data.map(m => ({ 
              value: m.id || m.FG_MODULEID, 
              label: (m.id || m.FG_MODULEID) + " - " + (m.name || m.NAME) 
            })) 
          : [];
          
        if (STEPS[currentStep] === modulosStep) renderFields();
      }
    }
  } catch (err) {
    console.error("Erro ao carregar módulos:", err);
  } finally {
    isFetchingModulos = false;
    if (STEPS[currentStep] === modulosStep) renderFields();
  }
}

// ─── Inicialização ────────────────────────────────────────────────────────────
function init() {
  render();

  // Oculta o wrapper da mensagem de status na inicialização
  const statusMessageWrapper = document.getElementById("statusMessageWrapper");
  if (statusMessageWrapper) {
    statusMessageWrapper.style.display = 'none';
  }
  fetchTurmasData();

  // Navegação
  document.getElementById("nextBtn")?.addEventListener("click", goNext);
  document.getElementById("prevBtn")?.addEventListener("click", goPrev);

  // Submit
  document.getElementById("leadForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const isLast = currentStep === STEPS.length - 1;
    if (isLast) {
      handleSubmit();
    } else {
      goNext();
    }
  });

  // Limpar formulário
  document.getElementById("clearFormBtn")?.addEventListener("click", () => {
    openConfirm(
      currentLang === "pt"
        ? "Tem certeza que deseja limpar todos os dados do cadastro?"
        : currentLang === "en"
        ? "Are you sure you want to clear all registration data?"
        : "¿Estás seguro de que deseas borrar todos los datos del registro?",
      () => {
        formData = {};
        currentStep = 0;
        render();
        closeConfirm();
      }
    );
  });

  // Modal confirmar
  document.getElementById("confirmConfirmBtn")?.addEventListener("click", () => {
    if (pendingAction) pendingAction();
  });
  document.getElementById("confirmCancelBtn")?.addEventListener("click", closeConfirm);

  // Fechar modal clicando fora
  document.getElementById("confirmModal")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeConfirm();
  });

  // Troca de idioma
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentLang = btn.dataset.lang;
      document.querySelectorAll(".lang-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.lang === currentLang);
        b.setAttribute("aria-pressed", b.dataset.lang === currentLang ? "true" : "false");
      });
      render();
    });
  });

  // Tema claro/escuro
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const body = document.body;
    const isDark = body.dataset.theme === "dark";
    body.dataset.theme = isDark ? "light" : "dark";
    localStorage.setItem("fg_theme", body.dataset.theme);
  });

  // Restaurar tema salvo
  const savedTheme = localStorage.getItem("fg_theme");
  if (savedTheme) document.body.dataset.theme = savedTheme;

  // --- Tester Utility: Preenchimento Automático ---
  // Ativado apenas se a URL contiver o parâmetro ?debug (ex: site.com/?debug)
  if (new URLSearchParams(window.location.search).has('debug')) {
    const controlGroup = document.querySelector('.control-group');
    if (controlGroup) {
      const createFillBtn = (label, relType) => {
        const btn = document.createElement('button');
        btn.className = 'ghost-btn';
        btn.style.cssText = 'border-color: var(--fg-green-500); color: var(--fg-green-700); font-weight: 700; margin-right: 4px;';
        btn.innerHTML = `🪄 ${label}`;
        btn.onclick = () => {
          const step = STEPS[currentStep];
          const samples = {
            relacao: relType,
            token: relType === "PARCEIRO" ? "FULLGAUGE-6EY380IL10CCP3ZANSZZ" : "Full Gauge Controls",
            fullName: "Usuário de Teste FG",
            cpf: "123.456.789-00",
            empresa: relType === "PARCEIRO" ? "PAR-0001" : "",
            segmento: "Refrigeração",
            atuacao: "Industrial",
            cidade: "Canoas",
            telefone: "(51) 98888-7777",
            email: "ian.campillay@fullgauge.com.br",
            termImage: true,
            termCosts: true
          };

          // Força a visita aos termos se estiver na última etapa para habilitar os checkboxes
          if (currentStep === STEPS.length - 1) formData.termsLinkVisited = true;

          step.fields.forEach(f => {
            if (samples[f.id] !== undefined) {
              formData[f.id] = samples[f.id];
            } else if (f.type === 'select' && f.options && f.options.length > 0) {
              const opt = f.options[0];
              const val = (typeof opt === 'object') ? opt.value : opt;
              formData[f.id] = f.multiple ? [val] : val;
            }
            // Gatilho para carregar módulos se preencher a turma via tester
            if (f.id === 'turmas' && formData[f.id]) fetchModulosData(formData[f.id]);
          });
          render();
        };
        controlGroup.prepend(btn);
      };

      createFillBtn('Fill General', 'GERAL');
      createFillBtn('Fill Partner', 'PARCEIRO');
    }
  }
}

document.addEventListener("DOMContentLoaded", init);
