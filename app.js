const CASAS = [
  "Central",
  "Beira Mar",
  "Cidade Náutica",
  "Gleba II",
  "Ilha Sambaiatuba",
  "Japuí",
  "Jardim Humaitá",
  "Jardim Irmã Dolores",
  "Jardim Quarentenário",
  "Jardim Rio Branco",
  "Jardim Rio Negro",
  "México 70",
  "Náutica III",
  "Parque Continental",
  "Parque das Bandeiras",
  "Ponte do Mar Pequeno",
  "Samaritá",
  "Sambaiatuba",
  "Saquaré",
  "Vila Ema",
  "Vila Fátima",
  "Vila Jockey I",
  "Vila Jockey II",
  "Vila Margarida",
  "Vila Melo",
  "Vila Ponte Nova",
  "Vila Voturuá"
];

const EPIS = [
  "Capacete",
  "Cinto de Segurança",
  "Talabarte",
  "Trava-quedas",
  "Calçado de segurança",
  "Luvas",
  "Óculos de proteção",
  "Protetor auricular"
];

const DOCUMENTOS = [
  "APR",
  "DDS",
  "PTA",
  "Livro de voluntários"
];

const form = document.getElementById("solicitacaoForm");
const casa = document.getElementById("casa");
const data = document.getElementById("data");
const inicio = document.getElementById("inicio");
const termino = document.getElementById("termino");
const servico = document.getElementById("servico");
const responsaveisList = document.getElementById("responsaveisList");
const episList = document.getElementById("episList");
const documentosList = document.getElementById("documentosList");
const previewSection = document.getElementById("previewSection");
const mensagemPreview = document.getElementById("mensagemPreview");
const solicitante = document.getElementById("solicitante");
const funcao = document.getElementById("funcao");
const minutoPensar = document.getElementById("minutoPensar");
const documentosAntes = document.getElementById("documentosAntes");
const outrosEpis = document.getElementById("outrosEpis");
const copyStatus = document.getElementById("copyStatus");

let responsavelCount = 0;
let mensagemAtual = "";

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");
const themeColorMeta = document.getElementById("themeColorMeta");

function aplicarTema(tema) {
  const modoEscuro = tema === "dark";
  document.documentElement.dataset.theme = modoEscuro ? "dark" : "light";
  themeIcon.textContent = modoEscuro ? "☀️" : "🌙";
  themeLabel.textContent = modoEscuro ? "Modo claro" : "Modo escuro";
  themeToggle.setAttribute("aria-label", modoEscuro ? "Ativar modo claro" : "Ativar modo escuro");
  themeToggle.setAttribute("aria-pressed", String(modoEscuro));
  themeColorMeta.setAttribute("content", modoEscuro ? "#101713" : "#14532d");
  localStorage.setItem("solicitacaoAlturaTema", tema);
}

function inicializarTema() {
  const temaSalvo = localStorage.getItem("solicitacaoAlturaTema");
  const temaSistema = window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  aplicarTema(temaSalvo || temaSistema);
}

themeToggle.addEventListener("click", () => {
  const temaAtual = document.documentElement.dataset.theme || "light";
  aplicarTema(temaAtual === "dark" ? "light" : "dark");
});

function populateSelect() {
  CASAS.forEach(nome => {
    const option = document.createElement("option");
    option.value = nome;
    option.textContent = nome;
    casa.appendChild(option);
  });

  EPIS.forEach((epi, index) => {
    episList.insertAdjacentHTML("beforeend", `
      <label class="check-option">
        <input type="checkbox" name="epi" value="${escapeHtml(epi)}">
        <span>${escapeHtml(epi)}</span>
      </label>
    `);
  });

  DOCUMENTOS.forEach((doc, index) => {
    documentosList.insertAdjacentHTML("beforeend", `
      <label>
        <input type="checkbox" name="documento" value="${escapeHtml(doc)}" checked>
        <span>${escapeHtml(doc)}</span>
      </label>
    `);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function addResponsavel(nome = "") {
  responsavelCount += 1;

  const item = document.createElement("div");
  item.className = "dynamic-item";
  item.dataset.id = responsavelCount;
  item.innerHTML = `
    <div class="dynamic-item-header">
      <strong>Irmão ${responsavelCount}</strong>
      ${responsavelCount > 1 ? '<button type="button" class="remove-btn" aria-label="Remover irmão">Remover</button>' : ''}
    </div>

    <label for="nomeResponsavel${responsavelCount}">Nome completo *</label>
    <input
      id="nomeResponsavel${responsavelCount}"
      class="nome-responsavel"
      type="text"
      placeholder="Digite o nome completo"
      value="${escapeHtml(nome)}"
      required
    >

    <div class="inline-checks">
      <label class="check-option">
        <input type="checkbox" class="nr35" checked>
        <span>NR35</span>
      </label>
      <label class="check-option">
        <input type="checkbox" class="aso" checked>
        <span>ASO</span>
      </label>
    </div>
  `;

  item.querySelector(".remove-btn")?.addEventListener("click", () => {
    item.remove();
    renumberResponsaveis();
  });

  responsaveisList.appendChild(item);
}

function renumberResponsaveis() {
  [...responsaveisList.querySelectorAll(".dynamic-item")].forEach((item, index) => {
    const number = index + 1;
    item.querySelector("strong").textContent = `Irmão ${number}`;
  });
}

function getResponsaveis() {
  return [...responsaveisList.querySelectorAll(".dynamic-item")]
    .map(item => {
      const nome = item.querySelector(".nome-responsavel").value.trim();
      const nr35 = item.querySelector(".nr35").checked;
      const aso = item.querySelector(".aso").checked;
      return { nome, nr35, aso };
    })
    .filter(item => item.nome);
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)]
    .map(input => input.value);
}

function formatDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatEpis() {
  const epis = getCheckedValues("epi");
  const outros = outrosEpis.value.trim();

  if (outros) {
    epis.push(...outros.split(",").map(item => item.trim()).filter(Boolean));
  }

  return epis.length ? epis.join(", ") : "Os EPIs adequados ao serviço serão utilizados.";
}

function formatResponsaveis(responsaveis) {
  return responsaveis
    .map(item => {
      const qualificacoes = [];
      if (item.nr35) qualificacoes.push("NR35");
      if (item.aso) qualificacoes.push("ASO");

      const qualificacao = qualificacoes.length
        ? ` — ${qualificacoes.join(" e ")}`
        : "";

      return `${item.nome}${qualificacao}`;
    })
    .join("\n");
}

function gerarMensagem() {
  const documentos = getCheckedValues("documento");
  const responsaveis = getResponsaveis();

  let mensagem = `A paz de Deus aos irmãos do departamento de segurança.

Solicito autorização para trabalho de altura no dia ${formatDate(data.value)}.

Início previsto às ${inicio.value}hs
Término às ${termino.value}hs

Casa de Oração
${casa.value}

Serviço a ser executado
${servico.value.trim()}

${responsaveis.length === 1 ? "01 irmão" : `${String(responsaveis.length).padStart(2, "0")} irmãos`} com NR35 e ASO
${formatResponsaveis(responsaveis)}

Todo trabalho será realizado com total segurança.

Serão utilizados os seguintes EPIs:
${formatEpis()}

Documentos a serem preenchidos
${documentos.length ? documentos.join("\n") : "Conforme necessidade do trabalho."}

${minutoPensar.checked ? "Será realizado o minuto para pensar antes do início do trabalho." : "O minuto para pensar não está previsto nesta solicitação."}

${documentosAntes.checked ? "Os documentos serão assinados e postados antes do início do trabalho." : "Os documentos serão providenciados conforme o procedimento definido pela equipe."}

ATT
${solicitante.value.trim()}
${funcao.value.trim()}`;

  return mensagem;
}

function validarFormulario() {
  const campos = [casa, data, inicio, termino, servico, solicitante, funcao];

  campos.forEach(campo => campo.classList.remove("error"));

  let valido = true;

  campos.forEach(campo => {
    if (!campo.value.trim()) {
      campo.classList.add("error");
      valido = false;
    }
  });

  const responsaveis = getResponsaveis();

  if (!responsaveis.length) {
    responsaveisList.scrollIntoView({ behavior: "smooth", block: "center" });
    alert("Adicione pelo menos um irmão responsável pelo trabalho.");
    valido = false;
  }

  if (inicio.value && termino.value && termino.value <= inicio.value) {
    termino.classList.add("error");
    alert("O horário de término deve ser posterior ao horário de início.");
    valido = false;
  }

  if (!valido) {
    const primeiroErro = document.querySelector(".error");
    primeiroErro?.scrollIntoView({ behavior: "smooth", block: "center" });
    primeiroErro?.focus();
  }

  return valido;
}

function mostrarPreview() {
  mensagemAtual = gerarMensagem();
  mensagemPreview.textContent = mensagemAtual;
  previewSection.classList.remove("hidden");
  previewSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function salvarRascunho() {
  const dados = {
    casa: casa.value,
    data: data.value,
    inicio: inicio.value,
    termino: termino.value,
    servico: servico.value,
    solicitante: solicitante.value,
    funcao: funcao.value,
    outrosEpis: outrosEpis.value,
    minutoPensar: minutoPensar.checked,
    documentosAntes: documentosAntes.checked
  };

  localStorage.setItem("solicitacaoAlturaRascunho", JSON.stringify(dados));
}

function carregarRascunho() {
  const raw = localStorage.getItem("solicitacaoAlturaRascunho");
  if (!raw) return;

  try {
    const dados = JSON.parse(raw);
    casa.value = dados.casa || "";
    data.value = dados.data || "";
    inicio.value = dados.inicio || "";
    termino.value = dados.termino || "";
    servico.value = dados.servico || "";
    solicitante.value = dados.solicitante || "";
    funcao.value = dados.funcao || "Encarregado de segurança";
    outrosEpis.value = dados.outrosEpis || "";
    minutoPensar.checked = dados.minutoPensar ?? true;
    documentosAntes.checked = dados.documentosAntes ?? true;
  } catch {
    localStorage.removeItem("solicitacaoAlturaRascunho");
  }
}

async function copiarMensagem() {
  try {
    await navigator.clipboard.writeText(mensagemAtual);
    copyStatus.textContent = "Mensagem copiada. Agora você pode colar no grupo do WhatsApp.";
  } catch {
    copyStatus.textContent = "Não foi possível copiar automaticamente. Selecione e copie a mensagem manualmente.";
  }

  setTimeout(() => copyStatus.textContent = "", 5000);
}

function abrirWhatsApp() {
  const url = `https://wa.me/?text=${encodeURIComponent(mensagemAtual)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function limparFormulario() {
  if (!confirm("Deseja realmente limpar todos os dados preenchidos?")) return;

  form.reset();
  casa.value = "";
  minutoPensar.checked = true;
  documentosAntes.checked = true;
  responsaveisList.innerHTML = "";
  responsavelCount = 0;
  addResponsavel();
  previewSection.classList.add("hidden");
  mensagemAtual = "";
  localStorage.removeItem("solicitacaoAlturaRascunho");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("addResponsavel").addEventListener("click", () => addResponsavel());
document.getElementById("copiar").addEventListener("click", copiarMensagem);
document.getElementById("whatsapp").addEventListener("click", abrirWhatsApp);
document.getElementById("editar").addEventListener("click", () => {
  previewSection.classList.add("hidden");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});
document.getElementById("limpar").addEventListener("click", limparFormulario);

form.addEventListener("input", salvarRascunho);

form.addEventListener("submit", event => {
  event.preventDefault();

  if (!validarFormulario()) return;

  mostrarPreview();
  salvarRascunho();
});

inicializarTema();
populateSelect();
addResponsavel();
carregarRascunho();

// PWA: registra o service worker se ele existir.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {
    // O projeto continua funcionando normalmente sem service worker.
  });
}
