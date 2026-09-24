import { test, expect } from "@playwright/test";

async function mockApis(page, { status = "confirmed" } = {}) {
  await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.turnstile={render:function(_,o){o.callback("playwright-turnstile-token");return "test-widget"},reset:function(){}};`
    })
  );

  await page.route("**/api/public-config", (route) =>
    route.fulfill({ json: { turnstileSiteKey: "playwright-site-key" } })
  );
  await page.route("**/api/turmas**", (route) =>
    route.fulfill({ json: { data: [
      { id: "TURMA-001", name: "Turma Playwright", availableSlots: 16 },
      { id: "TURMA-0002", name: "Turma sem vagas", availableSlots: -1 }
    ] } })
  );
  await page.route("**/api/modulos**", (route) =>
    route.fulfill({ json: [{ id: "MOD-001", name: "Módulo Playwright", description: "Teste" }] })
  );
  await page.route("**/api/parceiros**", (route) =>
    route.fulfill({ json: { data: [] } })
  );
  await page.route("**/api/payment-status**", (route) =>
    route.fulfill({ json: { success: true, status, confirmed: status === "confirmed" } })
  );
  await page.route("https://viacep.com.br/ws/*/json/", (route) =>
    route.fulfill({
      json: {
        cep: "92010-000",
        logradouro: "Rua ViaCEP",
        bairro: "Centro",
        localidade: "Canoas",
        uf: "RS"
      }
    })
  );
}

async function selectRegistrationType(page, label) {
  await page.getByRole("radio", { name: label }).check();
  await page.getByRole("button", { name: "Avançar" }).click();
}

async function fillCommonRegistration(page, { legalEntity = false } = {}) {
  if (legalEntity) {
    await page.getByLabel("Nome do responsável *").fill("Responsável Playwright");
    await page.getByLabel("Razão Social *").fill("Empresa Playwright Ltda");
  } else {
    await page.getByLabel("Nome Completo *").fill("Pessoa Playwright");
  }

  await page.locator("#cpf").fill(legalEntity ? "04.252.011/0001-10" : "956.863.230-11");
  if (!legalEntity) await expect(page.locator("#empresa")).toHaveCount(0);
  await page.getByLabel("Segmento *").selectOption({ label: "Refrigeração" });
  await page.getByLabel("Atuação *").selectOption({ label: "Industrial" });
  await page.getByLabel("Cidade *").first().fill("Canoas");
  await page.getByLabel("Telefone / WhatsApp *").fill("(51) 98888-7777");
  await page.getByLabel("E-mail *").fill("playwright@example.com");
  await page.getByLabel("CEP *").fill("92010-000");
  await expect(page.getByLabel("Rua / Logradouro *")).toHaveValue("Rua ViaCEP");
  await expect(page.getByLabel("País *")).toHaveValue("BR");
  await page.getByLabel("Rua / Logradouro *").fill("Rua dos Testes");
  await page.getByLabel("Número *").fill("100");
  await page.getByLabel("Bairro *").fill("Centro");
  await page.getByLabel("Complemento").fill("Sala 2");
  await page.getByLabel("Cidade *").last().fill("Canoas");
  await page.getByLabel("Estado *").selectOption("RS");
  await page.getByLabel("País *").selectOption("BR");

  await page.getByRole("button", { name: "Avançar" }).click();
}

async function completeCourseAndTerms(page, { legalEntity = false } = {}) {
  await page.getByLabel("Turmas *").selectOption("TURMA-001");
  await expect(page.locator("#turma-availability-helper")).toHaveText("16 vagas disponíveis");
  if (legalEntity) {
    await expect(page.getByLabel("Vagas desejadas *").locator("option")).toHaveCount(17);
    await page.getByLabel("Vagas desejadas *").selectOption("2");
  }
  await page.getByRole("button", { name: "Avançar" }).click();

  const termsLink = page.getByRole("link", { name: /Leia os Termos de Uso|Baixar Termos de Uso/ });
  await termsLink.click({ noWaitAfter: true }).catch(() => {});
  await page.getByRole("checkbox").all().then(async (checkboxes) => {
    for (const checkbox of checkboxes) await checkbox.check();
  });
  await page.getByRole("button", { name: "Avançar" }).click();
}

test.describe("fluxo de pagamento", () => {
  test("limpar cadastro reinicia o fluxo na primeira etapa", async ({ page }) => {
    await mockApis(page);
    await page.goto("/?debug");
    await page.getByRole("button", { name: /Fill Individual/ }).click();
    await expect(page.getByRole("radio", { name: "Pessoa Física" })).toBeChecked();

    await page.getByRole("button", { name: "Limpar cadastro" }).click();
    await page.getByRole("button", { name: "Confirmar" }).click();

    await expect(page.getByText("Etapa 1 de 5")).toBeVisible();
    await expect(page.getByRole("radio", { name: "Pessoa Física" })).not.toBeChecked();
    await expect(page.locator("#fullName")).toHaveCount(0);
  });

  test("botões de debug selecionam perfis válidos", async ({ page }) => {
    await mockApis(page);
    await page.goto("/?debug");

    await expect(page.getByRole("button", { name: /Fill Individual/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Fill Legal Entity/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Fill Partner/ })).toBeVisible();

    await page.getByRole("button", { name: /Fill Individual/ }).click();
    await expect(page.getByRole("radio", { name: "Pessoa Física" })).toBeChecked();

    await page.getByRole("button", { name: /Fill Legal Entity/ }).click();
    await expect(page.getByRole("radio", { name: "Pessoa Jurídica" })).toBeChecked();

    await page.getByRole("button", { name: /Fill Partner/ }).click();
    await expect(page.getByRole("radio", { name: "Parceiro" })).toBeChecked();
    await expect(page.locator("#token")).toHaveValue("FULLGAUGE-6EY380IL10CCP3ZANSZZ");

    await page.getByRole("button", { name: /Fill Legal Entity/ }).click();
    await page.getByRole("button", { name: "Avançar" }).click();
    await page.getByRole("button", { name: /Fill Legal Entity/ }).click();
    await expect(page.locator("#cpf")).toHaveValue("04.252.011/0001-10");
  });

  test("Pessoa Física envia endereço, gera link e conclui após confirmação", async ({ page }) => {
    await mockApis(page, { status: "pending" });
    let paymentPayload;
    let registrationPayload;

    await page.route("**/api/payment-link", async (route) => {
      paymentPayload = route.request().postDataJSON();
      await route.fulfill({
        json: {
          success: true,
          link: "https://sandbox.ipag.com.br/link/playwright",
          paymentReference: "FG-PLAYWRIGHT-001"
        }
      });
    });
    await page.route("**/api/register", async (route) => {
      registrationPayload = route.request().postDataJSON();
      await route.fulfill({ json: { success: true } });
    });

    await page.goto("/");
    await selectRegistrationType(page, "Pessoa Física");
    await fillCommonRegistration(page);
  await completeCourseAndTerms(page);

    await page.getByRole("radio", { name: "Pix" }).check();
    const paymentPopupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: "Ir para o iPag" }).click();
    const paymentPopup = await paymentPopupPromise;
    await expect.poll(() => paymentPopup.url()).toBe("https://sandbox.ipag.com.br/link/playwright");
    await paymentPopup.close();
    await expect(page.getByRole("heading", { name: "Aguardando pagamento" })).toBeVisible();
    await expect(page.locator(".payment-awaiting-loader-wrap")).toBeVisible();
    await expect(page.locator(".payment-awaiting-link")).toHaveAttribute("href", "https://sandbox.ipag.com.br/link/playwright");
    await expect(page.locator("#wizardContent")).toBeHidden();
    await page.unroute("**/api/payment-status**");
    await page.route("**/api/payment-status**", (route) =>
      route.fulfill({ json: { success: true, status: "confirmed", confirmed: true } })
    );
    expect(paymentPayload.turnstileToken).toBe("playwright-turnstile-token");
    expect(paymentPayload.enderecoCobranca).toBe("Rua dos Testes");
    expect(paymentPayload.cepCobranca).toBe("92010-000");
    expect(paymentPayload.paisCobranca).toBe("BR");

    await expect(page.getByRole("heading", { name: "Cadastro enviado com sucesso!" })).toBeVisible({ timeout: 10000 });
    expect(registrationPayload.paymentReference).toBe("FG-PLAYWRIGHT-001");
  });

  test("Pessoa Jurídica exibe vagas desejadas e país adicional", async ({ page }) => {
    await mockApis(page, { status: "pending" });
    await page.route("https://pay.test/link", (route) =>
      route.fulfill({ contentType: "text/html", body: "<title>iPag checkout</title>" })
    );
    let paymentPayload;
    let registrationPayload;
    await page.route("**/api/payment-link", async (route) => {
      paymentPayload = route.request().postDataJSON();
      await route.fulfill({ json: { success: true, link: "https://pay.test/link", paymentReference: "FG-PJ-001", amount: "2000.00" } });
    });
    await page.route("**/api/register", async (route) => {
      registrationPayload = route.request().postDataJSON();
      await route.fulfill({ json: { success: true } });
    });

    await page.goto("/");
    await selectRegistrationType(page, "Pessoa Jurídica");
    await fillCommonRegistration(page, { legalEntity: true });
    await expect(page.locator('#turmas option[value="TURMA-0002"]')).toHaveCount(0);
    await page.getByLabel("Turmas *").selectOption("TURMA-001");
    await completeCourseAndTerms(page, { legalEntity: true });

    await expect(page.getByText("Turma Playwright")).toBeVisible();
    await expect(page.getByText("R$ 2.000,00")).toBeVisible();
    await expect(page.getByText("Os tokens dos participantes serão liberados após a confirmação do pagamento.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ir para o iPag" })).toBeVisible();
    await page.getByRole("radio", { name: "Pix" }).check();
    const paymentPopupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: "Ir para o iPag" }).click();
    const paymentPopup = await paymentPopupPromise;
    await paymentPopup.close();
    await expect(page.locator("#statusMessage .payment-awaiting-legal-entity-notice")).toHaveText("Os tokens dos participantes serão liberados após a confirmação do pagamento.");
    await expect(page.getByRole("heading", { name: "Aguardando pagamento" })).toBeVisible();
    await expect(page.locator(".payment-awaiting-link")).toHaveAttribute("href", "https://pay.test/link");
    expect(registrationPayload).toBeUndefined();
    expect(paymentPayload.businessName).toBe("Empresa Playwright Ltda");
    expect(paymentPayload.vagasDesejadas).toBe("2");
  });

  test("turma sem vagas permite solicitar lista de espera sem abrir pagamento", async ({ page }) => {
    let registerPayload;
    await mockApis(page, { status: "pending" });
    await page.route("**/api/register", async (route) => {
      registerPayload = route.request().postDataJSON();
      await route.fulfill({ json: { success: true } });
    });
    await page.route("**/api/payment-link", (route) =>
      route.fulfill({ json: { success: true, link: "https://pay.test/link" } })
    );

    await page.goto("/");
    await selectRegistrationType(page, "Pessoa Física");
    await fillCommonRegistration(page);
    await page.getByLabel("Turmas *").selectOption("TURMA-0002");
    await page.getByLabel(/Esta turma está sem vagas/).check();
    await page.getByRole("button", { name: "Avançar" }).click();

    const termsLink = page.getByRole("link", { name: /Leia os Termos de Uso|Baixar Termos de Uso/ });
    await termsLink.click({ noWaitAfter: true }).catch(() => {});
    await page.getByRole("checkbox").all().then(async (checkboxes) => {
      for (const checkbox of checkboxes) await checkbox.check();
    });
    await page.getByRole("button", { name: "Avançar" }).click();

    await expect(page.getByRole("heading", { name: "Solicitação enviada com sucesso!" })).toBeVisible();
    expect(registerPayload.listaEspera).toBe(true);
    expect(registerPayload.turmas).toBe("TURMA-0002");
  });
});
