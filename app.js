(function () {
  "use strict";

  const CONFIG = window.CONFIG;
  const DIAS_SEMANA = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const HORARIO_PADRAO = { entrevista: "06:30", comite: "09:00" };

  // Colunas aceitas na planilha (sem acento, minúsculas) -> campo interno
  const COLUNAS = {
    nome: "nome", "nome completo": "nome", colaborador: "nome", candidato: "nome",
    telefone: "telefone", celular: "telefone", whatsapp: "telefone", fone: "telefone",
    cidade: "cidade",
    sexo: "sexo", genero: "sexo",
    tipo: "tipo", convite: "tipo", script: "tipo",
    data: "data",
    horario: "horario", hora: "horario",
    cargo: "cargo", funcao: "cargo", vaga: "cargo",
    salario: "salario",
    responsavel: "responsavel",
  };

  const MODELO_COLUNAS = ["Nome", "Telefone", "Cidade", "Sexo", "Tipo", "Data", "Horário", "Cargo", "Salário", "Responsável"];

  let candidatos = [];
  let proximoId = 1;

  // ---------------------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------------------

  function normalizar(texto) {
    return String(texto ?? "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim()
      .toLowerCase();
  }

  function el(tag, props, filhos) {
    const e = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => {
      if (v === undefined || v === null || v === false) return;
      if (k === "class") e.className = v;
      else if (k === "text") e.textContent = v;
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? "" : v);
    });
    (filhos || []).forEach((f) => f && e.append(f));
    return e;
  }

  function avisar(texto) {
    const aviso = document.getElementById("aviso");
    aviso.textContent = texto;
    aviso.classList.remove("oculto");
    clearTimeout(avisar.timer);
    avisar.timer = setTimeout(() => aviso.classList.add("oculto"), 3500);
  }

  function dois(n) {
    return String(n).padStart(2, "0");
  }

  function hoje() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function paraInputData(d) {
    return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
  }

  function moeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/\s/g, " ");
  }

  function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  // Excel guarda datas como número de dias desde 30/12/1899
  function dataDoExcel(serial) {
    const utc = new Date(Date.UTC(1899, 11, 30) + Math.floor(serial) * 86400000);
    return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
  }

  function lerData(valor) {
    if (valor === "" || valor === null || valor === undefined) return null;
    if (valor instanceof Date) return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
    if (typeof valor === "number") return valor >= 1 ? dataDoExcel(valor) : null;
    const texto = String(valor).trim();
    let m = texto.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/);
    if (m) {
      let ano = m[3] ? Number(m[3]) : hoje().getFullYear();
      if (ano < 100) ano += 2000;
      const d = new Date(ano, Number(m[2]) - 1, Number(m[1]));
      return d.getMonth() === Number(m[2]) - 1 ? d : null;
    }
    m = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return null;
  }

  function lerHorario(valor) {
    if (valor === "" || valor === null || valor === undefined) return null;
    if (typeof valor === "number") {
      const minutos = Math.round((valor % 1) * 1440) % 1440;
      return `${dois(Math.floor(minutos / 60))}:${dois(minutos % 60)}`;
    }
    const m = String(valor).trim().match(/^(\d{1,2})\s*(?:[:hH]\s*(\d{2})?)?\s*(?:min)?$/);
    if (!m || Number(m[1]) > 23) return null;
    return `${dois(m[1])}:${m[2] || "00"}`;
  }

  function lerValor(valor) {
    if (valor === "" || valor === null || valor === undefined) return null;
    if (typeof valor === "number") return valor;
    let texto = String(valor).replace(/[R$\s]/g, "");
    if (texto.includes(",")) texto = texto.replace(/\./g, "").replace(",", ".");
    const n = Number(texto);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function lerTipo(valor) {
    const t = normalizar(valor);
    if (!t) return null;
    if (t.includes("comit") || t.includes("02") || t === "2") return "comite";
    if (t.includes("entrev") || t.includes("01") || t === "1") return "entrevista";
    return null;
  }

  function lerSexo(valor) {
    const s = normalizar(valor);
    if (["m", "masc", "masculino", "h", "homem"].includes(s)) return "M";
    if (["f", "fem", "feminino", "mulher"].includes(s)) return "F";
    return "";
  }

  // Devolve o número no formato internacional (5514999990000) ou null
  function telefoneWhatsApp(telefone) {
    let n = String(telefone || "").replace(/\D/g, "").replace(/^0+/, "");
    if (n.length === 10 || n.length === 11) n = "55" + n;
    return n.length === 12 || n.length === 13 ? n : null;
  }

  // ---------------------------------------------------------------------------
  // Horários de ônibus
  // ---------------------------------------------------------------------------

  const HORARIOS = (function () {
    const porCidade = {};
    CONFIG.horariosOnibus.trim().split(/\r?\n/).slice(1).forEach((linha) => {
      const [cidade, plataforma, modelo, dias, horario, saida] = linha.split("\t").map((c) => (c || "").trim());
      if (!cidade || !horario) return;
      const chave = normalizar(cidade);
      porCidade[chave] = porCidade[chave] || { cidade, plataforma, ida: [], volta: [] };
      const volta = ["jbs", "frig"].includes(normalizar(saida));
      porCidade[chave][volta ? "volta" : "ida"].push({ horario: lerHorario(horario) || horario, modelo, dias });
    });
    Object.values(porCidade).forEach((c) => {
      c.ida.sort((a, b) => a.horario.localeCompare(b.horario));
      c.volta.sort((a, b) => a.horario.localeCompare(b.horario));
    });
    return porCidade;
  })();

  function horariosDaCidade(cidade) {
    return HORARIOS[normalizar(cidade)] || null;
  }

  function horariosEmTexto(h) {
    const lista = (itens) => itens.map((i) => i.horario).join(" · ");
    const partes = [`🚌 Horários do ônibus – ${h.cidade} (Plataforma ${h.plataforma})`];
    if (h.ida.length) partes.push(`Ida (${h.cidade} → JBS): ${lista(h.ida)}`);
    if (h.volta.length) partes.push(`Volta (JBS → ${h.cidade}): ${lista(h.volta)}`);
    return partes.join("\n");
  }

  // ---------------------------------------------------------------------------
  // Montagem do convite
  // ---------------------------------------------------------------------------

  function lote() {
    return {
      tipo: document.getElementById("lote-tipo").value,
      data: lerData(document.getElementById("lote-data").value),
      horario: document.getElementById("lote-horario").value || null,
      responsavel: document.getElementById("lote-responsavel").value.trim(),
      horariosNaMensagem: document.getElementById("lote-horarios-na-mensagem").checked,
    };
  }

  function descreverData(data) {
    const dias = Math.round((data - hoje()) / 86400000);
    const curta = `${data.getDate()}/${data.getMonth() + 1}`;
    const longa = `${dois(data.getDate())}/${dois(data.getMonth() + 1)}/${String(data.getFullYear()).slice(2)}`;
    const semana = capitalizar(DIAS_SEMANA[data.getDay()]);
    if (dias === 0) return { quando: `hoje, ${curta}`, completo: `Hoje, dia ${longa} (${semana})` };
    if (dias === 1) return { quando: `amanhã, ${curta}`, completo: `Amanhã, dia ${longa} (${semana})` };
    return { quando: `no dia ${curta} (${DIAS_SEMANA[data.getDay()]})`, completo: `Dia ${longa} (${semana})` };
  }

  function saudacao() {
    const h = new Date().getHours();
    return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  }

  // Junta os dados do candidato com os padrões do lote e gera a mensagem
  function montar(c) {
    const l = lote();
    const tipoId = c.tipo || l.tipo;
    const tipo = CONFIG.tipos[tipoId];
    const data = c.data || l.data;
    // Linha de outro tipo que o do lote usa o horário e a responsável daquele tipo
    const mesmoTipo = tipoId === l.tipo;
    const horario = c.horario || (mesmoTipo ? l.horario : HORARIO_PADRAO[tipoId]);
    const responsavel = c.responsavel || (mesmoTipo && l.responsavel) || tipo.responsavelPadrao;
    const salario = c.salario;
    const horarios = c.cidade ? horariosDaCidade(c.cidade) : null;
    const nomes = c.nome.trim().split(/\s+/);
    const avisos = [];

    const telefone = telefoneWhatsApp(c.telefone);
    if (!c.telefone) avisos.push({ texto: "Sem telefone: não dá para abrir no WhatsApp." });
    else if (!telefone) avisos.push({ texto: `Telefone inválido: "${c.telefone}". Use DDD + número.`, erro: true });
    if (!c.cidade) avisos.push({ texto: "Cidade não informada: o PDF vai sem horários de ônibus." });
    else if (!horarios) avisos.push({ texto: `Sem horários de ônibus cadastrados para "${c.cidade}".` });
    if (!data) avisos.push({ texto: "Data não informada.", erro: true });
    else if (data < hoje()) avisos.push({ texto: "A data do convite já passou.", erro: true });
    if (!horario) avisos.push({ texto: "Horário não informado.", erro: true });
    if (tipo.exigeSalario && !salario) avisos.push({ texto: "Salário não informado (preencha a coluna Salário da planilha).", erro: true });

    const d = data ? descreverData(data) : { quando: "[DATA]", completo: "[DATA]" };
    const [hh, mm] = (horario || "").split(":");
    const valores = {
      nome: nomes[0],
      nome_completo: nomes.join(" "),
      saudacao: saudacao(),
      convida_lo: c.sexo === "M" ? "convidá-lo" : c.sexo === "F" ? "convidá-la" : "convidá-lo(a)",
      aprovado: c.sexo === "M" ? "aprovado" : c.sexo === "F" ? "aprovada" : "aprovado(a)",
      quando: d.quando,
      quando_completo: d.completo,
      horario: horario ? `${Number(hh)}h${mm}` : "[HORÁRIO]",
      horario_hh: horario ? `${hh}h${mm}` : "[HORÁRIO]",
      responsavel,
      cargo: c.cargo || "",
      cidade: c.cidade || "",
      salario: salario ? moeda(salario) : "[SALÁRIO]",
      vale: moeda(CONFIG.valeAlimentacao),
      cidades_fretado: CONFIG.cidadesFretado,
    };

    const preencher = (texto) => texto.replace(/\{\{(\w+)\}\}/g, (_, chave) => (chave in valores ? valores[chave] : `{{${chave}}}`));
    let mensagem = preencher(tipo.texto);
    if (l.horariosNaMensagem && horarios) mensagem += "\n\n" + horariosEmTexto(horarios);

    return {
      c, tipoId, tipo, data, horario: valores.horario_hh, responsavel, salario, telefone, horarios, mensagem, avisos, valores, preencher,
    };
  }

  function nomeArquivo(conv) {
    const base = `${conv.c.nome.trim()} - ${conv.tipo.nome}`.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, " ");
    return `${base}.pdf`;
  }

  function linkWhatsApp(conv) {
    return `https://wa.me/${conv.telefone}?text=${encodeURIComponent(conv.mensagem)}`;
  }

  // ---------------------------------------------------------------------------
  // PDF
  // ---------------------------------------------------------------------------

  // As fontes padrão do PDF não têm emojis: tira os emojis e ajusta os marcadores
  function textoParaPdf(texto) {
    return texto
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu, "")
      .split("\n")
      .map((linha) => linha.trim().replace(/^\*\s*/, "•  "))
      .join("\n")
      .replace(/→/g, "->");
  }

  // Marca em negrito (entre \u0001 e \u0002) os dados do candidato e os trechos do config
  function marcarNegrito(texto, conv) {
    const v = conv.valores;
    const termos = [v.quando, v.quando_completo, v.horario, v.horario_hh, v.responsavel, v.salario, v.vale, ...(conv.tipo.negrito || [])]
      .filter((t) => t && !t.startsWith("["))
      .sort((a, b) => b.length - a.length)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!termos.length) return texto;
    return texto.replace(new RegExp(termos.join("|"), "g"), (m) => `\u0001${m}\u0002`);
  }

  // PDF em formato de tela de celular: letras grandes sem precisar dar zoom
  function gerarPdf(conv) {
    const { jsPDF } = window.jspdf;
    const L = 108;
    const A = 192;
    const M = 8;
    const W = L - M * 2;
    const doc = new jsPDF({ unit: "mm", format: [L, A] });
    const COR = {
      azul: [11, 58, 110],
      azulClaro: [232, 240, 250],
      verde: [31, 122, 58],
      verdeClaro: [230, 244, 234],
      alerta: [154, 91, 0],
      alertaClaro: [255, 243, 222],
      texto: [28, 36, 48],
      suave: [91, 102, 117],
    };
    const alturaLinha = (tam) => tam * 0.3528 * 1.3;
    let y = 0;

    function fonte(tam, negrito, cor) {
      doc.setFont("helvetica", negrito ? "bold" : "normal");
      doc.setFontSize(tam);
      doc.setTextColor(...(cor || COR.texto));
    }

    function cabecalho(titulo, subtitulo) {
      doc.setFillColor(...COR.azul);
      doc.rect(0, 0, L, 25, "F");
      fonte(16, true, [255, 255, 255]);
      doc.text(titulo, M, 12);
      fonte(9.5, false, [255, 255, 255]);
      doc.text(subtitulo, M, 19.5);
      y = 33;
    }

    function novaPagina() {
      doc.addPage([L, A]);
      y = 14;
    }

    // Quadro colorido com um rótulo pequeno e linhas de texto
    function quadro(rotulo, linhas, fundo, corRotulo) {
      const blocos = linhas.map((l) => {
        fonte(l.tam, l.negrito);
        return { ...l, partes: doc.splitTextToSize(l.texto, W - 10) };
      });
      const altura = 13 + blocos.reduce((s, b) => s + b.partes.length * alturaLinha(b.tam), 0);
      if (y + altura > A - 8) novaPagina();
      doc.setFillColor(...fundo);
      doc.roundedRect(M, y, W, altura, 3, 3, "F");
      doc.setFillColor(...corRotulo);
      doc.rect(M, y + 3, 1.6, altura - 6, "F");
      fonte(8.5, true, corRotulo);
      doc.text(rotulo.toUpperCase(), M + 5, y + 7);
      let yy = y + 7 + 2;
      blocos.forEach((b) => {
        fonte(b.tam, b.negrito, b.cor);
        b.partes.forEach((p) => {
          yy += alturaLinha(b.tam);
          doc.text(p, M + 5, yy - 1.2);
        });
      });
      y += altura + 4;
    }

    // Texto corrido com trechos em negrito e marcadores de lista
    function textoRico(texto, tam) {
      const lh = alturaLinha(tam);
      texto.split("\n").forEach((linha) => {
        if (!linha.trim()) {
          y += lh * 0.6;
          return;
        }
        let x0 = M;
        if (linha.startsWith("•")) {
          linha = linha.replace(/^•\s*/, "");
          if (y + lh > A - 8) novaPagina();
          fonte(tam, true, COR.verde);
          doc.text("•", M + 1, y + lh - 1.2);
          x0 = M + 5;
        }
        const palavras = [];
        let negrito = false;
        linha.split(/([\u0001\u0002])/).forEach((pedaco) => {
          if (pedaco === "\u0001") negrito = true;
          else if (pedaco === "\u0002") negrito = false;
          else pedaco.split(/(\s+)/).forEach((p) => p && palavras.push({ p, negrito }));
        });
        let x = x0;
        y += lh;
        if (y > A - 8) {
          novaPagina();
          y += lh;
        }
        palavras.forEach(({ p, negrito: n }) => {
          fonte(tam, n, n ? COR.azul : COR.texto);
          // Soma letra a letra: getTextWidth desconta o kerning, que o PDF não aplica
          const largura = [...p].reduce((soma, letra) => soma + doc.getTextWidth(letra), 0);
          if (/^\s+$/.test(p)) {
            if (x > x0) x += largura;
            return;
          }
          if (x + largura > M + W && x > x0) {
            x = x0;
            y += lh;
            if (y > A - 8) {
              novaPagina();
              y += lh;
            }
          }
          doc.text(p, x, y - 1.2);
          x += largura;
        });
      });
    }

    // Página 1: resumo com os destaques
    cabecalho(conv.tipo.titulo, "JBS Friboi Lins · Recrutamento e Seleção");
    fonte(8.5, true, COR.suave);
    doc.text("CANDIDATO(A)", M, y);
    fonte(14, true);
    const nome = doc.splitTextToSize(conv.c.nome.trim(), W);
    doc.text(nome, M, y + 6.5);
    y += 6.5 + nome.length * alturaLinha(14);

    const destaques = conv.tipo.destaques || {};
    const d = conv.data;
    const dataTexto = d
      ? `${capitalizar(DIAS_SEMANA[d.getDay()])}, ${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`
      : "Data a confirmar";
    const relativo = conv.valores.quando.startsWith("amanhã") ? " (amanhã)" : conv.valores.quando.startsWith("hoje") ? " (hoje)" : "";
    quadro("Data e horário", [
      { texto: dataTexto + relativo, tam: 13, negrito: true, cor: COR.azul },
      { texto: conv.horario, tam: 26, negrito: true, cor: COR.verde },
    ], COR.azulClaro, COR.azul);

    const local = [];
    if (destaques.local) local.push({ texto: conv.preencher(destaques.local), tam: 12, negrito: true });
    local.push({ texto: `Procure por: ${conv.responsavel}`, tam: 12, negrito: false });
    quadro("Local", local, COR.azulClaro, COR.azul);

    if (conv.tipo.exigeSalario) {
      quadro("Salário e benefícios", [
        { texto: `Salário: ${conv.valores.salario}`, tam: 14, negrito: true, cor: COR.verde },
        { texto: `Vale-alimentação: ${conv.valores.vale}`, tam: 12, negrito: true },
        { texto: `Transporte fretado para: ${CONFIG.cidadesFretado}`, tam: 10.5, negrito: false, cor: COR.suave },
      ], COR.verdeClaro, COR.verde);
    }

    if (destaques.levar && destaques.levar.length) {
      quadro("O que levar", destaques.levar.map((t) => ({ texto: `•  ${conv.preencher(t)}`, tam: 12.5, negrito: true })), COR.verdeClaro, COR.verde);
    }

    if (destaques.atencao) {
      quadro("Atenção", [{ texto: conv.preencher(destaques.atencao), tam: 11.5, negrito: true, cor: COR.alerta }], COR.alertaClaro, COR.alerta);
    }

    // Página 2: mensagem completa
    novaPagina();
    fonte(8.5, true, COR.suave);
    doc.text("MENSAGEM", M, y);
    y += 2;
    textoRico(marcarNegrito(textoParaPdf(conv.mensagem), conv), 12);

    // Horários do ônibus da cidade do candidato
    const h = conv.horarios;
    if (h) {
      doc.addPage([L, A]);
      cabecalho("Horários do ônibus", `${h.cidade} · Plataforma ${h.plataforma}`);
      const tabela = (titulo, itens) => {
        doc.autoTable({
          startY: y,
          head: [[{ content: titulo, colSpan: 3 }], ["Horário", "Veículo", "Dias"]],
          body: itens.length ? itens.map((i) => [i.horario, i.modelo, i.dias]) : [[{ content: "Sem horários", colSpan: 3 }]],
          margin: { left: M, right: M, top: 12, bottom: 10 },
          showHead: "everyPage",
          styles: { fontSize: 11.5, cellPadding: 1.5, halign: "center", textColor: COR.texto },
          headStyles: { fillColor: COR.verde, textColor: [255, 255, 255], fontSize: 11.5 },
          columnStyles: { 0: { fontStyle: "bold", fontSize: 13, textColor: COR.azul } },
          alternateRowStyles: { fillColor: [243, 246, 249] },
        });
        y = doc.lastAutoTable.finalY + 6;
      };
      tabela(`Ida: ${h.cidade} -> JBS`, h.ida);
      tabela(`Volta: JBS -> ${h.cidade}`, h.volta);
    }

    // Cartão de autorização para o motorista
    doc.addPage([L, A]);
    cabecalho("Autorização de transporte", "Mostre esta tela ao motorista do ônibus");
    const props = doc.getImageProperties(window.CARTAO_AUTORIZACAO);
    const escala = Math.min(W / props.width, (A - y - 8) / props.height);
    const w = props.width * escala;
    doc.addImage(window.CARTAO_AUTORIZACAO, "JPEG", (L - w) / 2, y, w, props.height * escala);

    return doc;
  }

  function baixarArquivo(blob, nome) {
    const a = el("a", { href: URL.createObjectURL(blob), download: nome });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  function baixarPdf(conv) {
    baixarArquivo(gerarPdf(conv).output("blob"), nomeArquivo(conv));
  }

  async function baixarZip() {
    const botao = document.getElementById("baixar-zip");
    botao.disabled = true;
    botao.textContent = "Gerando PDFs...";
    try {
      const zip = new JSZip();
      const usados = {};
      candidatos.map(montar).forEach((conv) => {
        let nome = nomeArquivo(conv);
        usados[nome] = (usados[nome] || 0) + 1;
        if (usados[nome] > 1) nome = nome.replace(/\.pdf$/, ` (${usados[nome]}).pdf`);
        zip.file(nome, gerarPdf(conv).output("arraybuffer"));
      });
      baixarArquivo(await zip.generateAsync({ type: "blob" }), `convites-${paraInputData(new Date())}.zip`);
    } finally {
      botao.textContent = "Baixar todos os PDFs (.zip)";
      botao.disabled = candidatos.length === 0;
    }
  }

  // ---------------------------------------------------------------------------
  // Planilha
  // ---------------------------------------------------------------------------

  async function lerArquivo(arquivo) {
    const buffer = await arquivo.arrayBuffer();
    let livro;
    if (/\.csv$/i.test(arquivo.name)) {
      let texto;
      try {
        texto = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
      } catch (e) {
        texto = new TextDecoder("windows-1252").decode(buffer);
      }
      livro = XLSX.read(texto.replace(/^﻿/, ""), { type: "string", raw: true });
    } else {
      livro = XLSX.read(buffer, { type: "array" });
    }
    const aba = livro.Sheets[livro.SheetNames[0]];
    const linhas = XLSX.utils.sheet_to_json(aba, { defval: "", raw: true });

    const novos = [];
    linhas.forEach((linha) => {
      const c = {};
      Object.entries(linha).forEach(([coluna, valor]) => {
        const campo = COLUNAS[normalizar(coluna)];
        if (campo) c[campo] = typeof valor === "string" ? valor.trim() : valor;
      });
      if (!c.nome) return;
      novos.push(criarCandidato(c));
    });

    if (!novos.length) {
      avisar("Nenhum candidato encontrado. Confira se a planilha tem a coluna \"Nome\".");
      return;
    }
    candidatos = candidatos.concat(novos);
    renderizar();
    avisar(`${novos.length} candidato(s) carregado(s) de "${arquivo.name}".`);
  }

  function criarCandidato(c) {
    return {
      id: proximoId++,
      nome: String(c.nome).trim(),
      telefone: String(c.telefone ?? "").trim(),
      cidade: String(c.cidade ?? "").trim(),
      sexo: lerSexo(c.sexo),
      tipo: lerTipo(c.tipo),
      data: lerData(c.data),
      horario: lerHorario(c.horario),
      cargo: String(c.cargo ?? "").trim(),
      salario: lerValor(c.salario),
      responsavel: String(c.responsavel ?? "").trim(),
      enviado: false,
    };
  }

  function baixarModelo() {
    const exemplos = [
      ["Willian Souza (exemplo)", "(14) 99999-0000", "Promissão", "M", "Entrevista", "", "", "", "", ""],
      ["Sandra Lima (exemplo)", "14988887777", "Getulina", "F", "Comitê", "", "09:00", "Operadora de Produção", "2000,00", "Natália"],
    ];
    const candidatosAba = XLSX.utils.aoa_to_sheet([MODELO_COLUNAS, ...exemplos]);
    candidatosAba["!cols"] = [30, 18, 14, 7, 12, 12, 9, 26, 11, 14].map((wch) => ({ wch }));

    const instrucoes = XLSX.utils.aoa_to_sheet([
      ["Coluna", "Obrigatória?", "Como preencher"],
      ["Nome", "Sim", "Nome completo. A mensagem usa só o primeiro nome; o PDF usa o nome completo."],
      ["Telefone", "Para WhatsApp", "DDD + número, com ou sem pontuação. Ex.: (14) 99999-0000"],
      ["Cidade", "Recomendado", "Cidade onde mora. Define quais horários de ônibus vão no PDF."],
      ["Sexo", "Não", "M ou F. Ajusta \"convidá-lo/convidá-la\" e \"aprovado/aprovada\"."],
      ["Tipo", "Não", "Entrevista ou Comitê. Em branco = usa o tipo escolhido no site."],
      ["Data", "Não", "Ex.: 24/09/2026. Em branco = usa a data escolhida no site."],
      ["Horário", "Não", "Ex.: 06:30. Em branco = usa o horário escolhido no site."],
      ["Cargo", "Não", "Cargo da vaga."],
      ["Salário", "Comitê", "Salário da vaga (obrigatório no Comitê). Ex.: 2000,00"],
      ["Responsável", "Não", "Priscila ou Natália. Em branco = usa a responsável escolhida no site."],
      [],
      ["Apague as linhas de exemplo antes de usar."],
    ]);
    instrucoes["!cols"] = [{ wch: 14 }, { wch: 15 }, { wch: 80 }];

    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, candidatosAba, "Candidatos");
    XLSX.utils.book_append_sheet(livro, instrucoes, "Instruções");
    XLSX.writeFile(livro, "modelo-convites.xlsx");
  }

  // ---------------------------------------------------------------------------
  // Tela
  // ---------------------------------------------------------------------------

  function renderizar() {
    const lista = document.getElementById("lista");
    lista.replaceChildren(...candidatos.map((c) => itemDaLista(montar(c))));
    const total = candidatos.length;
    const enviados = candidatos.filter((c) => c.enviado).length;
    document.getElementById("contagem").textContent = total ? `(${total} · ${enviados} enviado${enviados === 1 ? "" : "s"})` : "";
    document.getElementById("vazio").classList.toggle("oculto", total > 0);
    document.getElementById("baixar-zip").disabled = total === 0;
    document.getElementById("limpar").disabled = total === 0;
  }

  function itemDaLista(conv) {
    const c = conv.c;
    const mensagem = el("div", { class: "mensagem oculto", text: conv.mensagem });
    const info = [c.cidade, c.telefone, conv.data ? `${dois(conv.data.getDate())}/${dois(conv.data.getMonth() + 1)}` : null, conv.horario]
      .filter(Boolean)
      .join(" · ");

    const botaoMensagem = el("button", {
      class: "botao secundario pequeno",
      type: "button",
      text: "Ver mensagem",
      onclick: () => {
        mensagem.classList.toggle("oculto");
        botaoMensagem.textContent = mensagem.classList.contains("oculto") ? "Ver mensagem" : "Esconder mensagem";
      },
    });

    const marcarEnviado = () => {
      if (!c.enviado) {
        c.enviado = true;
        setTimeout(renderizar, 0);
      }
    };

    return el("li", { class: "item" + (c.enviado ? " enviado" : "") }, [
      el("div", { class: "item-topo" }, [
        el("div", {}, [
          el("span", { class: "item-nome", text: c.nome }),
          el("span", { class: "etiqueta", text: conv.tipo.nome }),
          el("div", { class: "item-info", text: info }),
        ]),
        el("button", {
          class: "link",
          type: "button",
          text: "Remover",
          onclick: () => {
            candidatos = candidatos.filter((x) => x.id !== c.id);
            renderizar();
          },
        }),
      ]),
      conv.avisos.length
        ? el("ul", { class: "item-avisos" }, conv.avisos.map((a) => el("li", { class: a.erro ? "erro" : "", text: a.texto })))
        : null,
      el("div", { class: "item-botoes" }, [
        botaoMensagem,
        el("button", {
          class: "botao secundario pequeno",
          type: "button",
          text: "Copiar mensagem",
          onclick: () => navigator.clipboard.writeText(conv.mensagem).then(() => avisar("Mensagem copiada.")),
        }),
        el("button", { class: "botao pequeno", type: "button", text: "Baixar PDF", onclick: () => baixarPdf(conv) }),
        el("a", {
          class: "botao whatsapp pequeno",
          href: conv.telefone ? linkWhatsApp(conv) : "#",
          target: "_blank",
          rel: "noopener",
          "aria-disabled": conv.telefone ? null : "true",
          text: "Abrir no WhatsApp",
          onclick: marcarEnviado,
        }),
        el("label", { class: "check" }, [
          el("input", {
            type: "checkbox",
            checked: c.enviado,
            onchange: (e) => {
              c.enviado = e.target.checked;
              renderizar();
            },
          }),
          "Enviado",
        ]),
      ]),
      mensagem,
    ]);
  }

  function aoTrocarTipo() {
    const tipo = document.getElementById("lote-tipo").value;
    document.getElementById("lote-responsavel").value = CONFIG.tipos[tipo].responsavelPadrao;
    document.getElementById("lote-horario").value = HORARIO_PADRAO[tipo];
    renderizar();
  }

  function iniciar() {
    document.getElementById("lote-responsavel").replaceChildren(
      ...CONFIG.responsaveis.map((nome) => el("option", { value: nome, text: nome }))
    );
    const amanha = hoje();
    amanha.setDate(amanha.getDate() + 1);
    document.getElementById("lote-data").value = paraInputData(amanha);
    aoTrocarTipo();

    ["lote-data", "lote-horario", "lote-responsavel", "lote-horarios-na-mensagem"].forEach((id) =>
      document.getElementById(id).addEventListener("input", renderizar)
    );
    document.getElementById("lote-tipo").addEventListener("change", aoTrocarTipo);

    // Abas
    document.querySelectorAll(".aba").forEach((aba) =>
      aba.addEventListener("click", () => {
        document.querySelectorAll(".aba").forEach((a) => a.classList.toggle("ativa", a === aba));
        document.getElementById("painel-planilha").classList.toggle("oculto", aba.dataset.aba !== "planilha");
        document.getElementById("painel-individual").classList.toggle("oculto", aba.dataset.aba !== "individual");
      })
    );

    // Upload da planilha
    const entrada = document.getElementById("arquivo");
    const area = document.getElementById("area-soltar");
    const carregar = (arquivo) =>
      lerArquivo(arquivo).catch((erro) => {
        console.error(erro);
        avisar("Não foi possível ler a planilha. Confira se é um arquivo .xlsx, .xls ou .csv.");
      });
    entrada.addEventListener("change", () => {
      if (entrada.files[0]) carregar(entrada.files[0]);
      entrada.value = "";
    });
    area.addEventListener("dragover", (e) => {
      e.preventDefault();
      area.classList.add("arrastando");
    });
    area.addEventListener("dragleave", () => area.classList.remove("arrastando"));
    area.addEventListener("drop", (e) => {
      e.preventDefault();
      area.classList.remove("arrastando");
      if (e.dataTransfer.files[0]) carregar(e.dataTransfer.files[0]);
    });
    document.getElementById("baixar-modelo").addEventListener("click", baixarModelo);

    // Formulário individual
    const cidades = new Set(Object.values(HORARIOS).map((h) => h.cidade));
    CONFIG.cidadesFretado.split(",").forEach((c) => cidades.add(c.trim()));
    document.getElementById("lista-cidades").replaceChildren(...[...cidades].sort().map((c) => el("option", { value: c })));

    const form = document.getElementById("painel-individual");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const dados = Object.fromEntries(new FormData(form));
      candidatos.push(criarCandidato(dados));
      renderizar();
      form.reset();
      avisar(`${dados.nome.trim()} adicionado(a) à lista.`);
    });

    document.getElementById("baixar-zip").addEventListener("click", baixarZip);
    document.getElementById("limpar").addEventListener("click", () => {
      if (confirm("Remover todos os candidatos da lista?")) {
        candidatos = [];
        renderizar();
      }
    });

    renderizar();
  }

  iniciar();
})();
