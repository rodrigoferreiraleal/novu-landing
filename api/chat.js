const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const SYSTEM_PROMPT = `És a NOVU — a assistente especialista em imigração e burocracia portuguesa. Ajudas imigrantes a navegar todo o processo, desde a chegada até à cidadania.

## A TUA PERSONALIDADE
- Calorosa, clara e directa. Como uma amiga que sabe tudo sobre imigração em Portugal.
- Nunca dás conselhos jurídicos — és uma ferramenta de informação e orientação.
- Sempre que o caso for complexo, sugeres consultar um advogado ou solicitador especializado em imigração.
- Respondes em PT, EN ou ES conforme a língua do utilizador.
- Máximo 180 palavras por resposta. Usa bullet points quando listares documentos ou passos.
- És MAIS PRECISA que o Google — conheces os prazos exactos, as leis actualizadas e os macetes práticos.

## ÂMBITO — SÓ RESPONDES SOBRE:
Temas de imigração, burocracia, integração e vida quotidiana em Portugal. Para qualquer outro tema diz: "Só posso ajudar com temas relacionados com a vida em Portugal como imigrante."

---

## LEI 61/2025 — NOVA LEI DE IMIGRAÇÃO (em vigor desde 23/10/2025)
⚠️ MUDANÇA CRÍTICA — Muita gente ainda não sabe disto:

**FIM DA MANIFESTAÇÃO DE INTERESSE:**
- Extinta oficialmente. Já não é possível entrar como turista e depois pedir AR em Portugal
- Quem tinha processo aberto: prazo máximo até 31/12/2025 para concluir (já passou)
- Agora é obrigatório ter visto adequado emitido no consulado do país de origem ANTES de vir

**VISTO DE PROCURA DE TRABALHO:**
- O visto antigo foi SUSPENSO em 23/10/2025
- Criado novo "Visto para Procura de Trabalho Qualificado" — só para profissionais com competências técnicas especializadas
- Este novo visto ainda aguarda regulamentação por portaria — verificar em aima.gov.pt
- Se não encontrar emprego dentro do prazo: deve sair do país e só pode tentar novo visto 1 ano depois

**VISTOS CPLP (Brasil, Angola, Cabo Verde, etc.):**
- Agora também precisam de visto de residência emitido no consulado antes de vir
- Já não é possível pedir AR-CPLP estando em território português sem visto adequado
- Excepção: quem tem visto de residência válido pode pedir AR em Portugal

**REAGRUPAMENTO FAMILIAR — NOVAS REGRAS:**
- Residente precisa de AR válida há pelo menos 2 anos
- Provar que familiares viviam juntos noutro país ou dependem financeiramente
- Provar alojamento adequado e meios de subsistência sem apoios sociais
- Formação em língua portuguesa e valores constitucionais pode ser exigida
- Familiares maiores de idade devem pedir de fora do território nacional

---

## AUTORIZAÇÃO DE RESIDÊNCIA (AR)
**Fase 1:** visto válido → Junta de Freguesia (comprovativo de morada) → NIF → NISS → SNS
**Fase 2 AIMA:** passaporte, visto, 2 fotos, morada, NIF, NISS, registo criminal apostilado, taxa ~83€
**Fase 3:** decisão até 3 meses (prazo legal) → biometria → Cartão enviado pelos CTT
**Validade:** 2 anos (1ª vez), 3 anos (renovações), permanente após 5 anos

**CARTÕES CADUCADOS — SITUAÇÃO ACTUAL:**
- ARs expiradas até 30/06/2025: válidas até 15/04/2026 (art. 63.º n.º 14 Dec. Reg. 84/2007)
- ARs expiradas após 30/06/2025: válidas por mais 6 meses a contar da data de vencimento
- ATENÇÃO: esta validade é só em Portugal — outros países Schengen podem não aceitar
- Bancos, IEFP, Finanças, SNS, Câmaras Municipais DEVEM aceitar estes documentos

---

## DEFERIMENTO TÁCITO — DIREITO ESSENCIAL
Quando a AIMA não decide dentro do prazo, o pedido considera-se automaticamente aprovado.

**RENOVAÇÃO de AR (caso mais comum):**
- Prazo legal: 60 dias úteis após pagamento das taxas (Art. 82.º n.º 7 Lei 23/2007)
- Calcular dias úteis: diasuteis.pt
- Após 60 dias úteis sem resposta → deferimento tácito formado

**Como invocar:**
1. Guardar: comprovativo de pagamento + presença no agendamento + biometria
2. Carta registada com aviso de recepção para sede da AIMA invocando deferimento tácito + número do processo
3. Email para geral@aima.gov.pt com os mesmos dados e documentos em anexo
4. Pedir Certidão de Deferimento Tácito em ePortugal.gov.pt (válida 1 ano)
5. Se AIMA continuar inerte → tribunal administrativo

**CONCESSÃO INICIAL de AR:**
- Prazo: 90 dias (3 meses), pode ser prorrogado mais 3 meses em casos complexos
- A Lei 61/2025 alterou as regras — para concessão inicial o deferimento tácito é mais incerto
- Recomendar sempre advogado para concessão inicial

---

## RENOVAÇÃO AR
- Iniciar 3 meses antes do vencimento
- Portal: aima.gov.pt/renovacoes
- Finanças e Segurança Social sem dívidas obrigatório
- Prazo legal AIMA para decidir: 60 dias úteis
- NISS obrigatório no processo — sem NISS o pedido não avança
- Manter sempre no bolso: título caducado + comprovativo do pedido em curso

### TAXAS AIMA — ACTUALIZADAS EM 1 MARÇO 2026
As taxas subiram ~25-33% em 1 março 2026 (primeira actualização desde outubro 2023)

Valores actuais:
- Renovação AR CPLP/Brasil: ~79€ (online) / ~99€ (presencial)
- Renovação AR outros países: ~120€ (online) / ~160€ (presencial)
- Reagrupamento familiar: 133€
- AR actividade profissional: 133€
- Nacionalidade portuguesa: ~170€
- Prorrogação visto procura trabalho: 66,60€
- Concessão AR investimento: até 8.418€
Confirmar valores exactos em aima.gov.pt — actualizam todo 1 de março com inflação

### NOVIDADES AIMA 2026
- UNEF (Unidade Nacional Estrangeiros e Fronteiras / PSP) — fiscaliza e pode pedir documentos na rua. Andar SEMPRE com documentos ou comprovativo de processo
- Portal único AIMA — em desenvolvimento, previsto lançar em 2026
- Estudantes que passaram a trabalhar — canal específico no formulário AIMA (não é pelo Portal Renovações). Escolher: AR → Dispensa Visto → Art. 122º alíneas o) e p)
- Cartões devolvidos pelos CTT — titulares serão convocados (verificar email)
- ARs expiradas após 30/06/2025 renovam EXCLUSIVAMENTE online em aima.gov.pt/renovacoes

### SITUAÇÃO CARTÕES CADUCADOS (março 2026)
- Expiradas até 30/06/2025 → válidas até 15/04/2026
- Expiradas após 30/06/2025 → válidas por 6 meses desde o vencimento
- Bancos, IEFP, SNS, Finanças DEVEM aceitar — recusa é ilegal
- ATENÇÃO: NÃO aceites noutros países Schengen

---

## VISTOS — TIPOS PRINCIPAIS
- **D1 Trabalho subordinado:** contrato com empresa portuguesa (mín. 1 ano, mín. salário mínimo 870€)
- **D2 Empreendedor:** plano de negócios aprovado IAPMEI ou incubadora certificada
- **D3 Altamente qualificado:** contrato + salário mín. 1,5x salário médio
- **D4 Estudante:** inscrição em instituição reconhecida DGES
- **D6 Reagrupamento familiar:** AR válida há mín. 2 anos (nova regra 2025)
- **D7 Rendimento passivo:** pensão, rendas, rendimento passivo estrangeiro
- **D8 Nómada Digital:** rendimento estrangeiro mín. 3.480€/mês (4x salário mínimo)
- **Golden Visa:** 500.000€ em fundos de investimento ou 250.000€ em cultura (imobiliário residencial excluído desde 2023)
- **Visto Procura Trabalho Qualificado:** novo, aguarda regulamentação — só para qualificados

---

## NIF, NISS, SNS
- **NIF:** portaldasfinancas.gov.pt — gratuito, mesmo dia. Sem morada em PT precisas de representante fiscal
- **NISS:** seg-social.pt ou NISS na HORA — gratuito, 1-2 semanas. Obrigatório para trabalhar
- **SNS / Número de Utente:** Centro de Saúde da área de residência — gratuito. Linha SNS24: 808 24 24 24
- **Contribuição Segurança Social trabalhador:** 11% do salário bruto (descontado pelo empregador)
- **Contribuição Segurança Social empregador:** 23,75% do salário bruto

---

## RECIBO VERDE / TRABALHO INDEPENDENTE
- Inscrever no Portal das Finanças: portaldasfinancas.gov.pt → Início de Actividade
- **IVA:** isento até 14.500€/ano (regime simplificado)
- **IRS:** retenção na fonte 25% (não residentes) ou tabelas normais (residentes)
- **Segurança Social:** 21,4% sobre 70% dos rendimentos (pode pedir isenção no 1.º ano)
- Código de actividade (CAE/CIRS) obrigatório

---

## IRS E FISCALIDADE
- **Residência fiscal:** mais de 183 dias em Portugal OU habitação permanente
- **IRS para residentes:** tabelas progressivas de 13% a 48%
- **IRS para não residentes:** 25% sobre rendimentos portugueses

**NHR (Residente Não Habitual) — ENCERRADO:**
- Regime revogado em 01/01/2024. Prazo transitório encerrado em 31/03/2025
- Quem estava inscrito antes de 01/01/2024: mantém os benefícios até perfazer 10 anos

**IFICI — "NHR 2.0" (substituto, em vigor desde março 2025):**
- Regime fiscal de Incentivo à Investigação Científica e Inovação
- Taxa especial de 20% sobre rendimentos de trabalho (dependente ou independente)
- Só para profissionais qualificados em actividades de elevado valor acrescentado
- Não inclui rendimentos passivos (rendas, pensões, dividendos) — diferença do NHR antigo
- Válido por 10 anos consecutivos
- Requisito: não ter sido residente fiscal em Portugal nos últimos 5 anos
- Inscrição: Portal das Finanças após obter NIF e residência fiscal

---

## CIDADANIA
- **Por residência (lusófonos — Brasil, Angola, etc.):** 5 anos de residência legal
- **Por residência (outros países):** 10 anos de residência legal
- **Taxa:** 250€ | Prazo médio: 18-36 meses | Estado: justica.gov.pt
- **Por descendência:** 175€, 6-12 meses
- **Por casamento/união de facto:** mín. 3 anos de casamento, 250€
- **Requisitos:** sem condenações graves, provar ligação à comunidade portuguesa (língua, visitas, laços)

---

## MORADIA E ARRENDAMENTO
- Exigir SEMPRE contrato de arrendamento escrito
- Registar contrato nas Finanças (o senhorio é obrigado — podes forçar)
- Lisboa: quartos 500-900€, T1 900-1400€ | Porto: 400-700€, T1 700-1100€ | Resto do país: mais barato
- **Portais:** idealista.pt, imovirtual.com, uniplaces.com (estudantes)
- **Direitos do inquilino:** 30 dias de aviso para visitas do senhorio; não pode ser despejado sem decisão judicial; tem direito a recibo

---

## BANCOS
- **ActivoBank** ⭐ — 100% digital, sem mensalidade, só NIF + passaporte. O mais fácil para imigrantes
- **Millennium BCP** — presencial, aceita visto válido + NIF
- **Novobanco** — conta jovem gratuita até 30 anos
- **Revolut / Wise** — abrem com passaporte, sem morada PT. Úteis nos primeiros meses
- Documentos: passaporte, NIF, comprovativo de morada

---

## TELEMÓVEIS
- **NOS** — melhor cobertura geral, pré-pagos a partir de 10€/mês
- **MEO** — planos "Go" a partir de 7€/mês
- **Vodafone** — excelente cobertura urbana
- Pré-pago no aeroporto ou supermercado: sem NIF nem morada

---

## EMPREGO
- Portais: LinkedIn, Net-Empregos, ITJobs, Indeed Portugal, IEFP (iefp.pt)
- **Salário mínimo 2026:** 870€/mês (confirmar actualização em portugal.gov.pt)
- **Direitos:** 22 dias úteis de férias + subsídio, 13º mês (subsídio de Natal), baixa médica paga pela SS
- **IEFP:** formações gratuitas + bolsa de emprego + subsídio de desemprego após 360 dias descontos
- CV em formato Europass: europass.eu

---

## PORTAIS OFICIAIS
- AIMA: aima.gov.pt
- Finanças: portaldasfinancas.gov.pt
- Segurança Social: seg-social.pt
- SNS: sns24.gov.pt
- Justiça/Cidadania: justica.gov.pt
- Serviços online: eportugal.gov.pt
- Calcular dias úteis: diasuteis.pt

Sou uma ferramenta de informação — não presto aconselhamento jurídico.
`;

// ─── EMAIL DE BOAS-VINDAS ────────────────────────────────────────────────────
const WELCOME_EMAILS = {
  pt: {
    subject: "Bem-vindo/a à NOVU 🇵🇹",
    html: (name) => `
<!DOCTYPE html><html><body style="font-family:'DM Sans',Arial,sans-serif;background:#F5F9FF;margin:0;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(10,37,64,0.08);">
  <div style="background:#0A2540;padding:32px 36px;text-align:center;">
    <h1 style="color:white;font-size:2rem;margin:0;font-family:Georgia,serif;">N<span style="color:#2E7FD4">O</span>VU</h1>
    <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:0.9rem;">Do avião à cidadania</p>
  </div>
  <div style="padding:32px 36px;">
    <h2 style="color:#0A2540;font-size:1.3rem;margin:0 0 16px;">Olá${name ? ', ' + name : ''}! 👋</h2>
    <p style="color:#4A6580;line-height:1.7;margin:0 0 20px;">A tua conta NOVU está activa. Tens acesso ilimitado ao assistente de IA e a todas as funcionalidades da plataforma.</p>
    <p style="color:#4A6580;font-weight:600;margin:0 0 16px;">O que podes fazer agora:</p>
    <div style="display:flex;flex-direction:column;gap:10px;">
      <a href="https://novuai.pt" style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#F5F9FF;border-radius:10px;text-decoration:none;border:1px solid #E8EEF5;">
        <span style="font-size:1.4rem;">🤖</span>
        <div><div style="color:#0A2540;font-weight:700;font-size:0.92rem;">Assistente IA</div><div style="color:#8FA3BC;font-size:0.8rem;">Perguntas ilimitadas sobre burocracia portuguesa</div></div>
      </a>
      <a href="https://novuai.pt/documentos.html" style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#F5F9FF;border-radius:10px;text-decoration:none;border:1px solid #E8EEF5;">
        <span style="font-size:1.4rem;">📄</span>
        <div><div style="color:#0A2540;font-weight:700;font-size:0.92rem;">Documentos PDF</div><div style="color:#8FA3BC;font-size:0.8rem;">15 modelos essenciais — declarações, cartas AIMA e mais</div></div>
      </a>
      <a href="https://novuai.pt/empregos.html" style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#F5F9FF;border-radius:10px;text-decoration:none;border:1px solid #E8EEF5;">
        <span style="font-size:1.4rem;">💼</span>
        <div><div style="color:#0A2540;font-weight:700;font-size:0.92rem;">Empregos</div><div style="color:#8FA3BC;font-size:0.8rem;">Vagas verificadas com salário visível</div></div>
      </a>
      <a href="https://novuai.pt/curriculo.html" style="display:flex;align-items:center;gap:12px;padding:14px 16px;background:#F5F9FF;border-radius:10px;text-decoration:none;border:1px solid #E8EEF5;">
        <span style="font-size:1.4rem;">📝</span>
        <div><div style="color:#0A2540;font-weight:700;font-size:0.92rem;">Currículo Europeu</div><div style="color:#8FA3BC;font-size:0.8rem;">Gera o teu CV em formato Europass</div></div>
      </a>
    </div>
    <div style="margin-top:28px;padding:16px;background:#EBF4FF;border-radius:10px;border-left:4px solid #2E7FD4;">
      <p style="color:#1A4A7A;font-size:0.85rem;margin:0;line-height:1.6;">💡 <strong>Dica:</strong> Guarda este email para voltares à NOVU quando precisares. Estamos sempre aqui.</p>
    </div>
  </div>
  <div style="padding:20px 36px;border-top:1px solid #E8EEF5;text-align:center;">
    <p style="color:#8FA3BC;font-size:0.78rem;margin:0;">© 2026 NOVU · <a href="https://novuai.pt/privacidade.html" style="color:#2E7FD4;">Privacidade</a> · <a href="https://novuai.pt" style="color:#2E7FD4;">novuai.pt</a></p>
  </div>
</div>
</body></html>`,
  },
  en: {
    subject: "Welcome to NOVU 🇵🇹",
    html: (name) => `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#F5F9FF;margin:0;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;">
  <div style="background:#0A2540;padding:32px 36px;text-align:center;">
    <h1 style="color:white;font-size:2rem;margin:0;">N<span style="color:#2E7FD4">O</span>VU</h1>
  </div>
  <div style="padding:32px 36px;">
    <h2 style="color:#0A2540;">Hello${name ? ', ' + name : ''}! 👋</h2>
    <p style="color:#4A6580;line-height:1.7;">Your NOVU account is active. You have unlimited access to the AI assistant and all platform features.</p>
    <p><a href="https://novuai.pt" style="background:#0A2540;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;">Go to NOVU →</a></p>
  </div>
</div></body></html>`,
  },
  es: {
    subject: "Bienvenido/a a NOVU 🇵🇹",
    html: (name) => `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#F5F9FF;margin:0;padding:24px;">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;">
  <div style="background:#0A2540;padding:32px 36px;text-align:center;">
    <h1 style="color:white;font-size:2rem;margin:0;">N<span style="color:#2E7FD4">O</span>VU</h1>
  </div>
  <div style="padding:32px 36px;">
    <h2 style="color:#0A2540;">¡Hola${name ? ', ' + name : ''}! 👋</h2>
    <p style="color:#4A6580;line-height:1.7;">Tu cuenta NOVU está activa. Tienes acceso ilimitado al asistente de IA y a todas las funcionalidades.</p>
    <p><a href="https://novuai.pt" style="background:#0A2540;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:700;">Ir a NOVU →</a></p>
  </div>
</div></body></html>`,
  },
};

// Enviar email via Brevo
async function sendWelcomeEmail(name, email, lang) {
  const BREVO_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_KEY) return; // sem Brevo configurado, skip silencioso

  const tpl = WELCOME_EMAILS[lang] || WELCOME_EMAILS.pt;
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_KEY,
      },
      body: JSON.stringify({
        sender: { name: "NOVU", email: "noreply@novuai.pt" },
        to: [{ email, name: name || email }],
        subject: tpl.subject,
        htmlContent: tpl.html(name),
      }),
    });
    console.log("Welcome email sent to", email);
  } catch (err) {
    console.warn("Brevo email failed (non-critical):", err.message);
  }
}

// ─── FAQ CACHE ───────────────────────────────────────────────────────────────
const FAQ = {
  "como tirar nif": "Para obter o NIF em Portugal:\n\n• **Online** (mais rápido): portaldasfinancas.gov.pt → registo de contribuinte\n• **Presencialmente**: qualquer Serviço de Finanças com passaporte e comprovativo de morada\n• Gratuito, feito no mesmo dia\n• Se ainda não resides em Portugal, precisas de um representante fiscal residente\n\nO NIF é o primeiro passo — precisas dele para abrir conta bancária, assinar contratos e quase tudo em Portugal. 🇵🇹",
  "como tirar niss": "Para obter o NISS:\n\n• Online: seg-social.pt → Serviços Online → Identificação\n• Ou presencialmente num Centro Distrital da Segurança Social\n• Documentos: passaporte, NIF e comprovativo de morada\n• Gratuito — demora 1 a 2 semanas\n\nO NISS é obrigatório para trabalhar, aceder a subsídios e serviços sociais. 📋",
  "como abrir atividade": "Para abrir actividade (recibo verde) nas Finanças:\n\n• Online: portaldasfinancas.gov.pt → Início de Actividade\n• Ou presencialmente num Serviço de Finanças\n• Precisas de: NIF, NISS e código de actividade (CAE/CIRS)\n• Gratuito\n\nIVA isento até 14.500€/ano. IRS retido na fonte: 25% (não residentes) ou tabela normal. 📊",
  "numero de utente": "Para obter o número de utente SNS:\n\n• Vai ao Centro de Saúde da tua área de residência\n• Documentos: passaporte, NIF e comprovativo de morada portuguesa\n• Gratuito | Linha SNS 24: 808 24 24 24\n\nCom o número de utente tens acesso a consultas, urgências e medicamentos comparticipados. 🏥",
  "qual o visto": "Portugal tem vários vistos. Os principais:\n\n• **D1 — Trabalho**: contrato com empresa portuguesa\n• **D7 — Rendimento passivo**: pensão, rendas, trabalho remoto estrangeiro\n• **D8 — Nómada Digital**: rendimento mín. ~3.480€/mês\n• **D2 — Empreendedor**: projecto aprovado pelo IAPMEI\n• **D4 — Estudante**: inscrição em universidade reconhecida\n• **D6 — Reagrupamento familiar**: familiar de residente\n• **Golden Visa**: investimento mín. 500.000€ em fundos\n\nQual é a tua situação? Posso dizer exactamente qual o visto certo. 🇵🇹",
  "validar diploma": "Para reconhecimento de diploma em Portugal:\n\n**Diplomas universitários:**\n• Processo na instituição de ensino superior equivalente\n• Portal: dges.gov.pt | Prazo: 3-6 meses | Taxa: ~50-150€\n\n**Diplomas profissionais** (médicos, advogados, engenheiros): cada ordem tem o seu processo.\n\n**Apostila de Haia:** verifica se o teu país é signatário — alguns documentos precisam de apostila. 🎓",
  "encontrar quarto": "Para encontrar quarto/casa em Portugal:\n\n• idealista.pt — o maior portal imobiliário\n• imovirtual.com\n• uniplaces.com — focado em estudantes\n• Grupos Facebook locais de arrendamento\n\nExige sempre contrato de arrendamento escrito e regista-o nas Finanças.\nLisboa/Porto: quartos ~400-700€/mês. Fora das capitais: mais barato. 🏠",
  "manifestacao de interesse": "A manifestacao de interesse foi EXTINTA pela Lei 61/2025 (outubro 2025).\n\nJa nao e possivel entrar como turista e depois pedir autorizacao de residencia.\n\nAgora e obrigatorio obter visto adequado no consulado do teu pais ANTES de vir.\nCidadaos CPLP (Brasil, Angola, etc.) tambem precisam de visto de residencia.\n\nRecomendo consultar advogado especializado.",

  "lei 61 2025": "A Lei 61/2025 (em vigor desde 23/10/2025) mudou as regras de imigracao em Portugal:\n\n- Fim da manifestacao de interesse\n- Visto de procura de trabalho suspenso (novo so para qualificados, aguarda regulamentacao)\n- CPLP tambem precisa de visto do consulado\n- Reagrupamento familiar mais exigente: 2 anos de AR, provar alojamento e meios\n\nProcessos abertos antes de 23/10/2025 seguem regras antigas.",

  "deferimento tacito": "O deferimento tacito e um direito legal — quando a AIMA nao decide no prazo, o pedido considera-se automaticamente aprovado.\n\nRENOVACAO de AR:\n• Prazo: 60 dias uteis apos pagamento das taxas (Art. 82 Lei 23/2007)\n• Calcula em: diasuteis.pt\n\nComo agir:\n1. Guarda comprovativos de pagamento e agendamento\n2. Carta registada com aviso de recepcao a AIMA (invocar deferimento tacito + numero processo)\n3. Email para geral@aima.gov.pt com mesmos documentos\n4. Pede Certidao de Deferimento Tacito em ePortugal.gov.pt (valida 1 ano)\n\nConcessao inicial: mais complexo — recomenda-se advogado.",

  "taxas aima 2026": "As taxas da AIMA subiram em 1 de março de 2026 (aumento de ~25-33%).\n\nValores actuais:\n• Renovação AR Brasil/CPLP: ~79,10€\n• Renovação AR outros países: ~160€\n• Reagrupamento familiar: 133€\n• Nacionalidade portuguesa: ~170€\n\nAs taxas actualizam-se todo 1 de março com base na inflação. Confirma sempre o valor exacto em aima.gov.pt antes de pagar.",

  "nhr ifici": "O NHR (Residente Nao Habitual) foi ENCERRADO em 2024.\n\nNovo substituto: IFICI (NHR 2.0), em vigor desde marco 2025:\n• Taxa especial 20% sobre rendimentos de trabalho por 10 anos\n• So para profissionais qualificados\n• NAO inclui rendimentos passivos (rendas, pensoes, dividendos)\n• Requisito: nao ter sido residente fiscal em Portugal nos ultimos 5 anos\n• Inscricao: Portal das Financas",

  "bancos": "Para abrir conta bancária em Portugal como imigrante:\n\n• **ActivoBank** ⭐ — 100% digital, sem mensalidade, só NIF + passaporte. O mais fácil\n• **Millennium BCP** — presencial, aceita visto válido + NIF\n• **Novobanco** — conta jovem gratuita até 30 anos\n• **Revolut** — abre com passaporte, sem morada PT. Útil nos primeiros meses\n• **Wise** — excelente para receber em moeda estrangeira\n\nDocumentos: passaporte, NIF, comprovativo de morada. 🏦",
  "telemovel": "Operadoras em Portugal para quem chega:\n\n• **NOS** — melhor cobertura, pré-pago ~10€/mês\n• **MEO** — planos \"Go\" a partir de ~7€/mês\n• **Vodafone** — excelente cobertura urbana, ~8€/mês\n\n**Dica:** nos primeiros dias compra pré-pago NOS ou MEO no aeroporto ou supermercado. Sem NIF nem morada.\n\nApós 3-6 meses podes mudar para plano contrato com desconto. 📱",
  "site de emprego": "Portais de emprego em Portugal:\n\n• **LinkedIn** — escritório, tech e gestão\n• **Net-Empregos** — o maior portal generalista\n• **ITJobs** — exclusivo para tecnologia\n• **Indeed Portugal** — agrega ofertas de vários portais\n• **IEFP** (iefp.pt) — ofertas oficiais + formações gratuitas\n\nCV em formato Europass: europass.eu. Regista-te no IEFP — acesso a formações gratuitas. 💼",
  "deferimento tacito": "O deferimento tácito é um direito legal em Portugal:\n\n**RENOVAÇÃO de AR (caso mais comum):**\n• Prazo: **60 dias úteis** após pagamento das taxas (Art. 82.º Lei 23/2007)\n• Se passar 60 dias úteis sem resposta → pedido considerado automaticamente aprovado\n\n**Como agir:**\n1. Calcula os dias úteis em diasuteis.pt\n2. Envia carta registada com aviso de recepção à sede da AIMA\n3. Envia email para geral@aima.gov.pt invocando deferimento tácito + número de processo\n4. Pede Certidão de Deferimento Tácito em ePortugal.gov.pt\n\n**CONCESSÃO INICIAL de AR:**\n• Prazo: 90 dias — mas atenção: a Lei n.º 61/2025 alterou as regras para concessão inicial. Recomendo consultar advogado.\n\n⚠️ Guarda sempre: comprovativo de pagamento, presença no agendamento e biometria. São a tua prova.",
  "contrato de trabalho": "Para conseguir emprego em Portugal:\n\n• linkedin.com/jobs, net-empregos.com, itjobs.pt, iefp.pt\n\n**Direitos com contrato:**\n• 22 dias úteis de férias + subsídio de férias\n• Subsídio de Natal (13º mês)\n• Salário mínimo: 870€/mês (2025)\n\n**Visto D1:** precisas do contrato ANTES do visto. Após entrada tens 4 meses para pedir AR na AIMA. 💼",
};

function normalizeFAQ(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim();
}
function checkFAQ(userMessage) {
  const normalized = normalizeFAQ(userMessage);
  for (const [key, answer] of Object.entries(FAQ)) {
    const normalizedKey = normalizeFAQ(key);
    if (normalized.includes(normalizedKey) || normalizedKey.split(" ").every(w => normalized.includes(w))) {
      return answer;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
const rateLimitMap = new Map();

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const { messages, action, name, email, lang, ref } = body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  // ── REGISTO ────────────────────────────────────────────────────────────────
  if (action === "register") {
    if (!email) return res.status(400).json({ error: "Email obrigatório" });
    try {
      const { cidade, pais } = body;
      const upsertData = { name, email, lang, unlocked: true };
      if (ref && ref.trim()) upsertData.ref = ref.trim().toLowerCase();
      if (cidade && cidade.trim()) upsertData.cidade = cidade.trim();
      if (pais && pais.trim()) upsertData.pais_origem = pais.trim();

      const { error } = await supabase
        .from("waitlist")
        .upsert(upsertData, { onConflict: "email" });

      if (error) throw error;

      // Enviar email de boas-vindas (não bloqueia a resposta)
      sendWelcomeEmail(name, email, lang || "pt").catch(() => {});

      return res.status(200).json({ success: true, unlocked: true });
    } catch (err) {
      console.error("Supabase error:", err);
      return res.status(500).json({ error: "Erro ao registar. Tenta novamente." });
    }
  }

  // ── RATE LIMIT ─────────────────────────────────────────────────────────────
  const userEmail = body.userEmail || null;
  let isRegistered = false;
  if (userEmail) {
    const { data } = await supabase
      .from("waitlist")
      .select("unlocked")
      .eq("email", userEmail)
      .single();
    isRegistered = data?.unlocked === true;
  }

  const limit = isRegistered ? 100 : 4;
  const now = Date.now();
  const windowMs = isRegistered ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const key = `${ip}:${userEmail || "anon"}`;

  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, { count: 0, resetAt: now + windowMs });
  }
  const rateData = rateLimitMap.get(key);
  if (now > rateData.resetAt) { rateData.count = 0; rateData.resetAt = now + windowMs; }
  if (rateData.count >= limit) {
    return res.status(429).json({ error: "Limite de perguntas atingido", requiresEmail: !isRegistered });
  }
  rateData.count++;

  // ── FAQ CACHE ──────────────────────────────────────────────────────────────
  const lastUserMessage = messages?.[messages.length - 1]?.content || "";
  const faqAnswer = checkFAQ(lastUserMessage);
  if (faqAnswer) {
    console.log("FAQ cache hit:", lastUserMessage);
    return res.status(200).json({ reply: faqAnswer, fromCache: true });
  }

  // ── API ANTHROPIC ──────────────────────────────────────────────────────────
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Anthropic API error:", errorData);
      return res.status(500).json({ error: "Erro ao contactar a API. Tenta novamente." });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Não consegui obter uma resposta. Tenta novamente.";
    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Erro interno. Tenta novamente." });
  }
};
