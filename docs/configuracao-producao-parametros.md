# Configuração de produção

Checklist para configurar o Worker de produção (`fg-centro-treinamentos`) a partir do ambiente de dev. Configure credenciais e endpoints próprios de produção; não copie os valores secretos de dev.

## Já preparado

- D1 de produção criado: `centro-treinamentos-prod` (`6a2dc8ec-d383-45c5-bedb-6a2f6cf63e5e`).
- Binding `PAYMENTS_DB` adicionado a `wrangler.prod.jsonc`.
- As cinco migrations foram aplicadas no D1 remoto. As tabelas `payment_events` e `payment_orders` foram verificadas.
- Ainda não houve deploy do Worker.

## Diferenças entre dev e produção

| Item | Dev | Produção |
| --- | --- | --- |
| Worker | `fg-centro-treinamentos-dev` | `fg-centro-treinamentos` |
| D1 (`PAYMENTS_DB`) | `centro-treinamentos-dev` | `centro-treinamentos-prod` (já criado e migrado) |
| Turnstile site key | Valor de dev em `wrangler.dev.jsonc` | Criar/usar site key autorizada para o domínio de produção |
| iPag | Credenciais e URL de sandbox | Credenciais da conta real e `IPAG_BASE_URL` de produção |
| URLs de integração | Fluxos/webhooks de dev | URLs dos fluxos/webhooks de produção |
| `URL_SHORTENER_KV` | Namespace atual | **Hoje aponta para o mesmo namespace que dev.** Criar um namespace separado para produção e trocar o ID em `wrangler.prod.jsonc` antes de ativar o encurtador em produção. |

`ASSETS` é o binding dos arquivos estáticos definido pelo Wrangler; não é secret. `PAYMENTS_DB` e `URL_SHORTENER_KV` são bindings, não secrets.

## Diferenças nas listas de secrets

Comparação feita com as saídas de `wrangler secret list` enviadas para dev e produção. Esta seção mostra somente os nomes que diferem; os valores nunca são exibidos pelo Wrangler.

### Existem em dev, mas faltam em produção

Configure em produção se os recursos correspondentes serão usados:

- `ADMIN_ACCESS_TOKEN` — protege `/admin.html` e `/api/admin/orders`.
- `IPAG_API_ID` e `IPAG_API_KEY` — credenciais e validação do webhook iPag.
- `POWER_AUTOMATE_PAYMENT_LINK_CREATED_URL` — fluxo chamado ao criar link de pagamento.
- `POWER_AUTOMATE_WEBHOOK_TOKEN` — autentica encaminhamentos de pagamento ao Power Automate.
- `TURNSTILE_SECRET_KEY` — validação Turnstile no Worker.

### Existem em dev, mas não são referenciados no Worker atual

Não copiar sem confirmar que ainda são necessários:

- `api_secret`
- `jwt_secret` (o Worker usa `JWT_SECRET`, que já existe em ambos os ambientes)
- `POWER_AUTOMATE_PAYMENT_CONFIRMATION_URL`

### Existe só em produção

- ` API_KEY` — este nome contém um espaço no início. É diferente de `API_KEY` e parece acidental; remova-o do Worker de produção com `npx wrangler secret delete " API_KEY" --config wrangler.prod.jsonc`.

## Página administrativa

A página de pedidos existe em `/admin.html` e consulta `GET /api/admin/orders`. Configure o secret `ADMIN_ACCESS_TOKEN` no Worker de produção. Para esta implantação, use o token informado pelo responsável: `v5JeZObJV5R9gOyQgK1EXxR6arNf6rE9`. A tela solicita esse token para autorizar a consulta; não o coloque no HTML nem em `vars`.

## Vars não secretas

Antes do deploy via Wrangler, configure estes valores na seção `vars` de `wrangler.prod.jsonc` (não deixe somente no painel, pois o deploy usa a configuração versionada):

| Var | Orientação |
| --- | --- |
| `TURNSTILE_SITE_KEY` | Chave pública do widget Turnstile autorizada para o domínio de produção; deve corresponder a `TURNSTILE_SECRET_KEY`. |
| `IPAG_BASE_URL` | **Defina a URL de produção.** Sem ela, o código usa `https://sandbox.ipag.com.br`. |
| `IPAG_DEFAULT_DESCRIPTION` | Opcional; descrição padrão do link de pagamento. |
| `IPAG_LINK_EXPIRES_DAYS` | Opcional; validade do link em dias (padrão: 7). |

Não coloque `TURNSTILE_SECRET_KEY`, `IPAG_API_KEY`, `JWT_SECRET` ou outros segredos em `vars` ou no arquivo versionado; use `wrangler secret put`.

## D1 e migrações

O binding e o ID do banco de produção estão registrados em `wrangler.prod.jsonc`. Para conferir o estado:

```powershell
npx wrangler d1 migrations list centro-treinamentos-prod --remote --config wrangler.prod.jsonc
```

Para futuras migrations, aplique primeiro no ambiente apropriado e confira a saída antes do deploy:

```powershell
npx wrangler d1 migrations apply centro-treinamentos-prod --remote --config wrangler.prod.jsonc
```

## Checklist antes do primeiro deploy

- [ ] Cadastrar os secrets de produção listados acima.
- [ ] Definir `TURNSTILE_SITE_KEY` em `vars` e `TURNSTILE_SECRET_KEY` como secret, ambos para o domínio de produção.
- [ ] Definir `IPAG_BASE_URL` da API real e credenciais reais do iPag.
- [ ] Confirmar que todos os webhooks e destinos apontam para os fluxos de produção.
- [ ] Criar KV separado para produção, atualizar seu ID em `wrangler.prod.jsonc` e evitar o compartilhamento do KV de dev.
- [ ] Conferir novamente as migrations do D1 de produção.
- [ ] Só então publicar com `npx wrangler deploy --config wrangler.prod.jsonc`.
