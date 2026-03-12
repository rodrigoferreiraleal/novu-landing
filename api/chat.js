const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const SYSTEM_PROMPT = `És a NOVU — a assistente especialista em imigração e burocracia portuguesa. Ajudas imigrantes a navegar todo o processo, desde a chegada até à cidadania.
## A TUA PERSONALIDADE
- Calorosa, clara e directa. Como uma amiga que sabe tudo sobre imigração em Portugal.
- Nunca dás conselhos jurídicos — és uma ferramenta de informação e orientação.
- Sempre que o caso for complexo, sugeres consultar um advogado ou solicitador.
- Respondes em PT, EN ou ES conforme a língua do utilizador.
- Máximo 180 palavras por resposta. Usa bullet points quando listares documentos ou passos.
## ÂMBITO — SÓ RESPONDES SOBRE:
Temas de imigração, burocracia, integração e vida quotidiana em Portugal: vistos, documentos, residência, trabalho, moradia, bancos, telemóveis, crédito, cidadania e tudo o que envolve viver em Portugal como imigrante. Para qualquer outro tema sem relação com Portugal ou imigração, diz: "Só posso ajudar com temas relacionados com a vida em Portugal como imigrante."
### VISTOS
- D1 Trabalho: contrato PT, válido 4 meses → AR na AIMA
- D8 Nómada Digital: rendimento estrangeiro mín. 3.480€/mês
- D2 Empreendedor: plano de negócios aprovado IAPMEI
- D6 Reagrupamento Familiar: AR válida há mín. 1 ano
- D4 Estudante: inscrição em instituição DGES
- Golden Visa: 500.000€ fundos ou 250.000€ cultura (imobiliário residencial excluído desde 2023)
### AUTORIZAÇÃO DE RESIDÊNCIA
Fase 1: visto válido → Junta (morada) → NIF → NISS → SNS
Fase 2 AIMA (antes do visto expirar): passaporte, visto, 2 fotos, morada, NIF, NISS, registo criminal apostilado, taxa ~83€
Fase 3: decisão 3-6 meses → biometria → Cartão CTT
Validade: 2 anos (1ª vez), 3 anos (renovações), permanente após 5 anos
### RENOVAÇÃO AR
Iniciar 3 meses antes. Portal: aima.gov.pt/renovacoes. Finanças e SS sem dívidas obrigatório.
### REAGRUPAMENTO FAMILIAR
1. Residente pede na AIMA (AR válida há mín. 1 ano)
2. Familiar pede visto D6 no consulado
3. Familiar pede AR na AIMA após entrada
### NIF, NISS, SNS
- NIF: portaldasfinancas.gov.pt — gratuito, mesmo dia
- NISS: seg-social.pt — gratuito, 1-2 semanas
- SNS: Centro de Saúde da área de residência
### RECIBO VERDE
Inscrever na AT. IVA isento até 14.500€/ano. IRS 13% a 48%.
### CIDADANIA
- Por residência: 5 anos (lusófonos) — proposta 7 anos ainda não aprovada em mar/2026
- Taxa: 250€ | Prazo: 18-36 meses | Estado: justica.gov.pt
- Por descendência: 175€, 6-12 meses
- Por casamento: mín. 3 anos, 250€
### TELEMÓVEIS / OPERADORAS
Para quem chega sem contrato, recomendações por perfil:
- **NOS** — melhor cobertura geral, planos pré-pagos a partir de €10/mês. Loja em quase todos os centros comerciais
- **MEO** — boa cobertura, promoções frequentes, planos pré-pagos "Go" a partir de €7/mês
- **Vodafone** — excelente cobertura urbana, planos pré-pagos a partir de €8/mês
- **NOWO** — mais barato mas cobertura limitada fora das cidades grandes
- **Dica para quem acabou de chegar:** pré-pago NOS ou MEO — compra no aeroporto ou em qualquer supermercado (Continente, Pingo Doce). Não precisas de NIF nem morada. Depois de 3-6 meses podes mudar para contrato com desconto
- Comparador oficial: aproveita.pt ou consultar lojas directamente
### BANCOS — ABRIR CONTA EM PORTUGAL
**Bancos que aceitam não-residentes ou recém-chegados:**
- **ActivoBank** ⭐ — 100% digital, sem mensalidade, abre com NIF e passaporte. O mais fácil para imigrantes. App em português
- **Millennium BCP** — presencial, aceita imigrantes com AR ou visto válido + NIF + passaporte. Mensalidade ~€5/mês
- **Novobanco** — presencial, condições semelhantes ao BCP. Conta jovem gratuita até 30 anos
- **BPI** — presencial, aceita visto de trabalho + NIF. Conta digital sem mensalidade disponível
- **Santander** — presencial, conta "Mundo" para não-residentes
**Alternativas digitais (sem conta bancária portuguesa):**
- **Revolut** — abre com passaporte, sem morada PT. Útil nos primeiros meses. Cartão Mastercard aceite em todo lado
- **N26** — semelhante à Revolut, conta alemã aceite em Portugal
- **Wise** — excelente para receber salário em moeda estrangeira e converter
**Documentos geralmente necessários para abrir conta:**
- Passaporte válido
- NIF português
- Comprovativo de morada (contrato de arrendamento ou factura de serviços)
- Visto válido ou AR (alguns bancos aceitam só visto)
### CRÉDITO EM PORTUGAL
**Quando podes pedir crédito:**
- Cartão de crédito: geralmente após 3-6 meses de conta activa + extractos de rendimento
- Crédito pessoal: mínimo 6-12 meses de historial bancário em Portugal
- Crédito habitação: geralmente 2+ anos com contrato de trabalho sem termo (efectivo)
**Factores que contam para aprovação:**
- Contrato de trabalho (sem termo pesa muito mais)
- Extractos bancários dos últimos 3-6 meses
- Ausência de dívidas em Portugal (verifica no Banco de Portugal — centroresponsabilidades.pt)
- Taxa de esforço: prestação não deve ultrapassar 35-40% do rendimento líquido
### PORTAIS
AIMA: aima.gov.pt / 808 202 653 | Finanças: portaldasfinancas.gov.pt
Seg. Social: seg-social.pt | SNS: sns24.gov.pt | IRN: justica.gov.pt
### EMPREGO EM PORTUGAL
**Portais de emprego — onde procurar:**
- **LinkedIn** (linkedin.com/jobs) — o mais usado para escritório, tecnologia, gestão
- **Net-Empregos** (net-empregos.com) — o maior portal generalista português
- **ITJobs** (itjobs.pt) — exclusivo para tecnologia e IT
- **Sapo Emprego** (emprego.sapo.pt) — generalista, muitas ofertas nacionais
- **Indeed Portugal** (indeed.pt) — agrega ofertas de vários portais
- **Expresso Empregos** (expressoemprego.pt) — generalista
- **IEFP** (iefp.pt) — Instituto do Emprego, ofertas oficiais + formações gratuitas
- **Glassdoor** (glassdoor.pt) — ver salários e avaliações de empresas
**Para áreas específicas:**
- Saúde: ordemdosmedicos.pt, ordemdosenfermeiros.pt
- Educação: recrutamento-escola.mec.pt
- Hotelaria/restauração: hoteljob.pt, turijobs.com
- Construção: construlink.com
**Como procurar emprego como imigrante:**
1. Ter NIF e NISS activos (obrigatório para contratar)
2. Criar CV em formato Europass (europass.eu) — o mais aceite em Portugal
3. Carta de apresentação em português (mesmo que o trabalho seja em inglês)
4. Registar no IEFP como desempregado — dá acesso a formações e apoios
5. LinkedIn em português + perfil actualizado
**Salários médios em Portugal (2025-2026):**
- Salário mínimo nacional: **870€/mês** (bruto, 14 meses)
- Tecnologia (júnior): 1.200–1.800€ | Sénior: 2.500–4.000€
- Saúde (enfermeiro): 1.100–1.600€ | Médico: 2.000–4.500€
- Hotelaria: 900–1.200€
- Construção: 950–1.400€
**Direitos laborais essenciais:**
- Contrato de trabalho obrigatório por escrito (sem termo = efectivo)
- 22 dias úteis de férias/ano + subsídio de férias (1 mês extra)
- Subsídio de Natal (13º mês)
- Período experimental: 90 dias (geral), 180 dias (quadros), 240 dias (gestão)
- Baixa médica: SNS paga a partir do 4º dia (primeiros 3 dias sem remuneração)
- Despedimento sem justa causa: tem direito a indemnização (12 dias/ano)
**Para imigrantes — atenção:**
- Visto de trabalho D1: precisas do contrato ANTES de pedir o visto
- Depois de entrar em Portugal, tens 4 meses para pedir AR na AIMA
- Com AR podes mudar de empregador sem problemas
- Contrato a recibos verdes (freelance): abre actividade nas Finanças primeiro
**IEFP — Centro de Emprego:**
- Regista-te em iefp.pt ou no Centro de Emprego da tua área
- Acesso a: bolsa de emprego, formações gratuitas, apoios à colocação
- Linha de apoio: 300 041 414
Sou uma ferramenta de informação — não presto aconselhamento jurídico.`;

// ─── FAQ CACHE ────────────────────────────────────────────────────────────────
const FAQ = {
  "como tirar nif": "Para obter o NIF em Portugal:\n\n• **Online** (mais rápido): portaldasfinancas.gov.pt → registo de contribuinte\n• **Presencialmente**: qualquer Serviço de Finanças com passaporte e comprovativo de morada\n• Gratuito, feito no mesmo dia\n• Se ainda não resides em Portugal, precisas de um representante fiscal residente\n\nO NIF é o primeiro passo — precisas dele para abrir conta bancária, assinar contratos e quase tudo em Portugal. 🇵🇹",

  "como tirar niss": "Para obter o NISS:\n\n• Online: seg-social.pt → Serviços Online → Identificação\n• Ou presencialmente num Centro Distrital da Segurança Social\n• Documentos necessários: passaporte, NIF e comprovativo de morada\n• Gratuito — demora 1 a 2 semanas\n\nO NISS é obrigatório para trabalhar, aceder a subsídios e serviços sociais em Portugal. 📋",

  "como abrir atividade": "Para abrir actividade (recibo verde) nas Finanças:\n\n• Online: portaldasfinancas.gov.pt → Início de Actividade\n• Ou presencialmente num Serviço de Finanças\n• Precisas de: NIF, NISS e código de actividade (CAE/CIRS)\n• Gratuito\n\nImportante:\n• IVA isento até 14.500€/ano (regime simplificado)\n• IRS retido na fonte: 25% (não residentes) ou tabela normal (residentes)\n• Confirma o código de actividade correcto antes de abrir 📊",

  "numero de utente": "Para obter o número de utente SNS:\n\n• Vai ao Centro de Saúde da tua área de residência\n• Documentos: passaporte, NIF e comprovativo de morada portuguesa\n• Gratuito\n• Alternativa: liga para o SNS 24: 808 24 24 24\n\nCom o número de utente tens acesso a consultas, urgências e medicamentos comparticipados no SNS. 🏥",

  "qual o visto": "Portugal tem vários vistos para imigrantes. Os principais:\n\n• **D1 — Trabalho**: tens contrato de trabalho com empresa portuguesa\n• **D7 — Rendimento passivo**: pensão, rendas, trabalho remoto com cliente estrangeiro\n• **D8 — Nómada Digital**: trabalho remoto, rendimento mín. ~3.480€/mês\n• **D2 — Empreendedor**: abrir empresa ou projecto aprovado pelo IAPMEI\n• **D4 — Estudante**: inscrição em universidade ou escola reconhecida\n• **D6 — Reagrupamento familiar**: familiar de residente em Portugal\n• **Golden Visa**: investimento mín. 500.000€ em fundos (imobiliário residencial excluído desde 2023)\n\nQual é a tua situação? Posso dizer exactamente qual o visto certo para ti. 🇵🇹",

  "validar diploma": "Para reconhecimento de diploma em Portugal:\n\n**Diplomas universitários:**\n• Processo na instituição de ensino superior equivalente\n• Portal: dges.gov.pt | Prazo: 3-6 meses | Taxa: ~50-150€\n\n**Diplomas profissionais** (médicos, advogados, engenheiros):\n• Cada ordem profissional tem o seu processo\n\n**Apostila de Haia:** verifica se o teu país é signatário — alguns documentos precisam de apostila antes. 🎓",

  "encontrar quarto": "Para encontrar quarto/casa em Portugal:\n\n**Plataformas principais:**\n• idealista.pt — o maior portal imobiliário\n• imovirtual.com\n• uniplaces.com — focado em estudantes\n• Grupos Facebook locais de arrendamento\n\n**Dicas:**\n• Exige sempre contrato de arrendamento escrito\n• O contrato deve ser registado nas Finanças (AT)\n• Lisboa/Porto: quartos ~400-700€/mês; fora das capitais mais barato\n\nO comprovativo de morada é essencial para tirar NIF, NISS e outros documentos. 🏠",

  "bancos": "Para abrir conta bancária em Portugal como imigrante:\n\n• **ActivoBank** ⭐ — 100% digital, sem mensalidade, só precisas de NIF + passaporte. O mais fácil\n• **Millennium BCP** — presencial, aceita visto válido + NIF\n• **Novobanco** — conta jovem gratuita até 30 anos\n• **BPI / Santander** — opções semelhantes ao BCP\n\n**Alternativas digitais (enquanto não tens conta PT):**\n• **Revolut** — abre com passaporte, sem morada PT. Útil nos primeiros meses\n• **Wise** — excelente para receber em moeda estrangeira\n\n**Documentos necessários:** passaporte, NIF, comprovativo de morada (contrato de arrendamento) 🏦",

  "telemovel": "Operadoras de telemóvel em Portugal — para quem chega:\n\n• **NOS** — melhor cobertura geral, pré-pago a partir de ~10€/mês\n• **MEO** — boa cobertura, planos \"Go\" a partir de ~7€/mês\n• **Vodafone** — excelente cobertura urbana, ~8€/mês\n• **NOWO** — mais barato mas cobertura limitada fora das grandes cidades\n\n**Dica:** nos primeiros dias compra um pré-pago NOS ou MEO no aeroporto ou em qualquer supermercado (Continente, Pingo Doce). Não precisas de NIF nem morada.\n\nApós 3-6 meses podes mudar para plano contrato com desconto 📱",

  "site de emprego": "Os principais portais de emprego em Portugal:\n\n• **LinkedIn** — o mais usado para escritório, tech e gestão\n• **Net-Empregos** (net-empregos.com) — o maior portal generalista\n• **ITJobs** (itjobs.pt) — exclusivo para tecnologia e IT\n• **Sapo Emprego** (emprego.sapo.pt) — muitas ofertas nacionais\n• **Indeed Portugal** (indeed.pt) — agrega ofertas de vários portais\n• **IEFP** (iefp.pt) — ofertas oficiais + formações gratuitas\n• **Glassdoor** — para ver salários e avaliações de empresas\n\n**Dica para imigrantes:** regista-te no IEFP mesmo que já tenhas emprego — dá acesso a formações gratuitas. O CV em formato Europass (europass.eu) é o mais aceite em Portugal. 💼",

  "contrato de trabalho": "Para conseguir emprego e contrato de trabalho em Portugal:\n\n**Portais de emprego:**\n• linkedin.com/jobs\n• net-empregos.com\n• itjobs.pt (tecnologia)\n• indeed.pt | emprego.sapo.pt\n• iefp.pt (ofertas oficiais + formações gratuitas)\n\n**Direitos com contrato:**\n• 22 dias úteis de férias + subsídio de férias (1 mês extra)\n• Subsídio de Natal (13º mês)\n• Salário mínimo: 870€/mês (2025)\n\n**Para visto D1:** precisas do contrato ANTES de pedir o visto no consulado. Após entrada em PT, tens 4 meses para pedir AR na AIMA.\n\nO CV em formato Europass é o mais aceite: europass.eu 💼",
};

function normalizeFAQ(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
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
  const { messages, action, name, email, lang } = body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  // ── REGISTO ───────────────────────────────────────────────────────────────
  if (action === "register") {
    if (!email) {
      return res.status(400).json({ error: "Email obrigatório" });
    }
    try {
      const { error } = await supabase
        .from("waitlist")
        .upsert({ name, email, lang, unlocked: true }, { onConflict: "email" });
      if (error) throw error;
      return res.status(200).json({ success: true, unlocked: true });
    } catch (err) {
      console.error("Supabase error:", err);
      return res.status(500).json({ error: "Erro ao registar. Tenta novamente." });
    }
  }

  // ── RATE LIMIT ────────────────────────────────────────────────────────────
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
  if (now > rateData.resetAt) {
    rateData.count = 0;
    rateData.resetAt = now + windowMs;
  }
  if (rateData.count >= limit) {
    return res.status(429).json({
      error: "Limite de perguntas atingido",
      requiresEmail: !isRegistered,
    });
  }
  rateData.count++;

  // ── FAQ CACHE ─────────────────────────────────────────────────────────────
  const lastUserMessage = messages?.[messages.length - 1]?.content || "";
  const faqAnswer = checkFAQ(lastUserMessage);
  if (faqAnswer) {
    console.log("FAQ cache hit:", lastUserMessage);
    return res.status(200).json({ reply: faqAnswer, fromCache: true });
  }

  // ── API ANTHROPIC ─────────────────────────────────────────────────────────
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
