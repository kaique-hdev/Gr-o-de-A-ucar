// ===== CONFIGURAÇÃO =====
// DDI 55 + DDD + número, só dígitos.
const WHATSAPP_NUMERO = "5531995531324"; // NÚMERO DE TESTE: troque pelo real
const MENSAGEM_PADRAO = "Olá! Gostaria de pedir um orçamento.";
const DIAS_ANTECEDENCIA = 3;

// ===== MENU MOBILE =====
const toggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("menu");

if (toggle && nav) {
  const setMenu = (aberto) => {
    nav.classList.toggle("is-open", aberto);
    toggle.setAttribute("aria-expanded", String(aberto));
    toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-aberto", aberto);
  };

  toggle.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });

  document.addEventListener("click", (e) => {
    if (nav.classList.contains("is-open") && !e.target.closest(".header")) {
      setMenu(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  matchMedia("(min-width: 1025px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });
}

// ===== WHATSAPP =====
const numero = WHATSAPP_NUMERO.replace(/\D/g, "");
const valido = /^55\d{10,11}$/.test(numero);
const linkWhats = (texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

if (valido) {
  document.querySelectorAll("[data-whatsapp]").forEach((link) => {
    link.href = linkWhats(MENSAGEM_PADRAO);
    link.target = "_blank";
    link.rel = "noopener";
  });
}

// ===== FORMULÁRIO DE ORÇAMENTO =====
const form = document.getElementById("form-orcamento");
const erro = document.getElementById("f-erro");

if (form && erro) {
  const campos = form.elements;
  const minData = new Date();
  minData.setDate(minData.getDate() + DIAS_ANTECEDENCIA);
  campos.data.min = minData.toLocaleDateString("sv-SE"); // AAAA-MM-DD

  document.querySelectorAll("[data-categoria]").forEach((link) => {
    link.addEventListener("click", () => {
      campos.produto.value = link.dataset.categoria;
      campos.produto.removeAttribute("aria-invalid");
    });
  });

  form.addEventListener("input", (e) => {
    if (e.target.validity.valid) e.target.removeAttribute("aria-invalid");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const invalidos = [...form.querySelectorAll(":invalid")];
    if (invalidos.length) {
      invalidos.forEach((el) => el.setAttribute("aria-invalid", "true"));
      const primeiro = invalidos[0];

      erro.textContent = primeiro.validity.rangeUnderflow && primeiro === campos.data
        ? `Pedidos exigem pelo menos ${DIAS_ANTECEDENCIA} dias de antecedência.`
        : "Preencha corretamente os campos destacados antes de enviar.";

      primeiro.focus();
      return;
    }

    if (!valido) {
      erro.textContent = "WhatsApp indisponível. Fale pelo Instagram @graodeacucar.bh.";
      return;
    }

    erro.textContent = "";
    const f = new FormData(form);
    const data = new Date(`${f.get("data")}T12:00`).toLocaleDateString("pt-BR");

    let msg =
      `Olá! Sou ${f.get("nome").trim()} e gostaria de um orçamento.\n` +
      `• Produto: ${f.get("produto")}\n` +
      `• Data: ${data}\n` +
      `• Quantidade: ${f.get("qtd")} pessoas\n` +
      `• ${f.get("entrega")}`;

    const obs = f.get("obs").trim();
    if (obs) msg += `\n• Observações: ${obs}`;

    window.open(linkWhats(msg), "_blank", "noopener");
  });
}

// ===== BOTÃO FLUTUANTE =====
const flutuante = document.querySelector(".wa-float");

if (flutuante && "IntersectionObserver" in window) {
  const visiveis = { topo: true, orcamento: false, rodape: false };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      visiveis[en.target.id] = en.isIntersecting;
    });
    const ocultar = visiveis.topo || visiveis.orcamento || visiveis.rodape;
    flutuante.classList.toggle("is-visible", !ocultar);
  });

  ["topo", "orcamento", "rodape"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}
