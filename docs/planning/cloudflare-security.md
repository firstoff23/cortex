# Planeamento: Cloudflare DNS + WAF + Turnstile

> Branch: `feature/cloudflare-security` | Issue: #10

## Estado

- [ ] Em desenvolvimento

## Componentes

- **DNS** — migrar registo A/CNAME para Cloudflare
- **WAF** — regras para bloquear SQLi, XSS, bots
- **Turnstile** — CAPTCHA amigável no chat
- **Rate Limiting** — máx 60 req/min por IP nas rotas `/api/*`

## Ficheiros a criar

- `src/components/TurnstileWidget.jsx`
- `middleware/rateLimiter.js` — atualizar
- `cloudflare/waf-rules.json` — regras exportadas

## Notas

Ver issue #10 para detalhes completos das tarefas.
