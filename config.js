// =============================================================================
// CONFIGURAÇÃO DOS CONVITES
// Tudo o que muda com frequência fica aqui: textos, vagas, vale, responsáveis
// e horários de ônibus. Edite direto no GitHub (ícone de lápis) e salve.
// =============================================================================

window.CONFIG = {
  // Valor do vale-alimentação (igual para todos)
  valeAlimentacao: 520,

  // Cidades atendidas pelo transporte fretado (aparece no script 02)
  cidadesFretado: "Lins, Promissão, Getulina, Sabino, Guaimbê, Cafelândia, Guarantã, Pirajuí",

  tipos: {
    entrevista: {
      nome: "Entrevista",
      titulo: "Convite para Entrevista",
      responsavelPadrao: "Priscila",
      // Quadros de destaque do PDF (aceitam os mesmos marcadores do texto)
      destaques: {
        local: "JBS Friboi Lins (ao lado do Recinto de Exposições)",
        levar: ["Currículo impresso"],
        atencao: "Venha sem brincos, piercings, cílios, maquiagem, barba ou bigode, pois, se {{aprovado}}, poderá realizar o teste no mesmo dia.",
      },
      // Trechos que ficam em negrito na mensagem do PDF
      negrito: ["Vagas disponíveis:", "Masculina:", "Feminina:", "Favor trazer currículo impresso", "confirme sua presença"],
      // Marcadores disponíveis:
      // {{nome}} primeiro nome · {{nome_completo}} · {{saudacao}} Bom dia/Boa tarde/Boa noite
      // {{convida_lo}} convidá-lo / convidá-la · {{aprovado}} aprovado / aprovada
      // {{quando}} "amanhã, 24/9" · {{quando_completo}} "Amanhã, dia 24/09/26 (Quinta-feira)"
      // {{horario}} "6h30" · {{horario_hh}} "06h30" · {{responsavel}} · {{cargo}}
      // {{salario}} "R$ 2.000,00" · {{vale}} "R$ 520,00" · {{cidades_fretado}} · {{cidade}}
      texto: `Olá, {{nome}}
Tudo bem? 😊

Gostaria de {{convida_lo}} para uma entrevista presencial {{quando}}, às {{horario}}, na JBS Friboi Lins (ao lado do Recinto de Exposições).

📌 Vagas disponíveis:
👨 Masculina:
* Operador de Produção – Charque.
* Operador de Produção – Desossa.
* Operador de Armazenagem e Expedição.
* Operador de Empilhadeira – certificado e experiência obrigatórios.

👩 Feminina:
* Operadora de Produção – Refile (aprender a trabalhar com faca).
* Operadora de Produção – Áreas produtivas.
* Refilador Dianteiro e Traseiro.

👩‍💼 Ao chegar, procure pela {{responsavel}}.
👔🤝🤝Favor trazer currículo impresso 🤝🤝👔

⚠️ Venha sem brincos, piercings, cílios, maquiagem, barba ou bigode, pois, se {{aprovado}}, poderá realizar o teste no mesmo dia.

Se tiver interesse, confirme sua presença! 😊`,
    },

    comite: {
      nome: "Comitê",
      titulo: "Convite para o Comitê",
      responsavelPadrao: "Natália",
      destaques: {
        local: "JBS Friboi Lins (ao lado do Recinto de Exposições)",
        levar: ["RG/CPF ou CNH"],
      },
      negrito: ["última fase do processo seletivo", "Trazer RG/CPF ou CNH", "Caso não seja possível, favor avisar"],
      exigeSalario: true,
      texto: `{{saudacao}}, {{nome}}

Tudo bem?

🚀👏🏻Você foi {{aprovado}} nas etapas anteriores do processo (RH e testes) e gostaríamos de te convidar para a última fase do processo seletivo, que é o Comitê.

O comitê é um bate-papo com alguns gestores para conhecer um pouco mais sobre sua trajetória e motivação.

📌 {{quando_completo}}, às {{horario_hh}}.

Salário: {{salario}}
Vale-alimentação: {{vale}}
Transporte fretado para as cidades: {{cidades_fretado}}.

A responsável pela condução será a {{responsavel}}.

Contamos com sua presença! Caso não seja possível, favor avisar.

(Trazer RG/CPF ou CNH)

Qualquer dúvida, estamos à disposição.`,
    },
  },

  // ---------------------------------------------------------------------------
  // HORÁRIOS DOS ÔNIBUS
  // Para atualizar: copie as linhas da planilha de horários (com o cabeçalho)
  // e cole aqui entre as crases, substituindo o conteúdo.
  // Colunas: Cidade | Plataforma | Modelo | Linha | Horário | Saída | Destino
  // Linhas com Saída "JBS" ou "FRIG" são a volta (JBS → cidade).
  // ---------------------------------------------------------------------------
  horariosOnibus: `
Cidade	Plataforma	Modelo	Linha	Horário	Saída	Destino
Sabino	7	PLENA Van	Seg a Sex	05:10	SABINO	JBS
Sabino	7	GOLD	Seg a Sex	05:20	SABINO	JBS
Sabino	7	GOLD	Seg a Sex	12:50	SABINO	JBS
Sabino	7	GOLD	Seg a Sex	15:50	SABINO	JBS
Sabino	7	GOLD	Seg a Sex	20:45	SABINO	JBS
Sabino	7	GOLD	Seg a Sex	06:40	JBS	SABINO
Sabino	7	GOLD	Seg a Sex	14:40	JBS	SABINO
Sabino	7	Plena Van	Seg a Sex	15:30	JBS	SABINO
Sabino	7	GOLD	Seg a Sex	16:40	JBS	SABINO
Sabino	7	GOLD	Seg a Sex	17:20	JBS	SABINO
Sabino	7	Plena Van	Seg a Sex	17:50	JBS	SABINO
Sabino	7	Plena Van	Seg a Sex	18:20	JBS	SABINO
Sabino	7	GOLD	Seg a Sex	22:50	JBS	SABINO
Promissão	1	GOLD	Seg a Sex	01:00	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	04:20	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	04:30	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	04:40	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	05:20	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	05:45	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	05:50	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	06:50	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	13:05	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	14:40	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	15:50	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	16:00	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	16:40	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	17:20	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	21:00	PROMISSAO	JBS
Promissão	1	GOLD	Seg a Sex	01:45	JBS	PROMISSÃO
Promissão	1	GOLD	Seg a Sex	02:35	JBS	PROMISSÃO
Promissão	1	GOLD	Seg a Sex	05:05	JBS	PROMISSÃO
Promissão	1	GOLD	Seg a Sex	06:10	JBS	PROMISSAO
Promissão	1	GOLD	Seg a Sex	06:40	JBS	PROMISSÃO
Promissão	1	GOLD	Seg a Sex	07:40	JBS	PROMISSÃO
Promissão	1	GOLD	Seg a Sex	14:40	JBS	PROMISSÃO
Promissão	1	Plena Van	Seg a Sex	15:30	JBS	PROMISSÃO
Promissão	1	GOLD	Seg a Sex	16:00	JBS	PROMISSÃO
Promissão	1	GOLD	Seg a Sex	16:40	JBS	PROMISSAO
Promissão	1	GOLD	Seg a Sex	17:20	JBS	PROMISSÃO
Promissão	1	GOLD	Seg a Sex	17:30	JBS	PROMISSÃO
Promissão	1	GOLD	Seg a Sex	17:50	JBS	PROMISSÃO
Promissão	1	GOLD	Seg a Sex	18:20	JBS	PROMISSÃO
Promissão	1	GOLD	Seg a Sex	22:50	JBS	PROMISSÃO
Guaimbê	4	GOLD	Seg a Sex	00:10	GUAIMBÊ	JBS
Guaimbê	4	GOLD	Seg a Sex	04:35	GUAIMBÊ	JBS
Guaimbê	4	GOLD	Seg a Sex	04:45	GUAIMBÊ	JBS
Guaimbê	4	GOLD	Seg a Sex	05:30	GUAIMBÊ	JBS
Guaimbê	4	GOLD	Seg a Sex	05:50	GUAIMBÊ	JBS
Guaimbê	4	GOLD	Seg a Sex	13:00	GUAIMBÊ	JBS
Guaimbê	4	GOLD	Seg a Sex	14:30	GUAIMBÊ	JBS
Guaimbê	4	GOLD	Seg a Sex	15:45	GUAIMBÊ	JBS
Guaimbê	4	GOLD	Seg a Sex	16:10	GUAIMBÊ	JBS
Guaimbê	4	GOLD	Seg a Sex	16:15	GUAIMBÊ	JBS
Guaimbê	4	GOLD	Seg a Sex	16:45	GUAIMBÊ	JBS
Guaimbê	4	GOLD	Seg a Sex	21:00	GUAIMBÊ	JBS
Guaimbê	4	GOLD	Seg a Sex	01:45	JBS	GUAIMBÊ
Guaimbê	4	Plena Van	Seg a Sex	02:30	JBS	GUAIMBÊ
Guaimbê	4	GOLD	Seg a Sex	05:10	JBS	GUAIMBÊ
Guaimbê	4	GOLD	Seg a Sex	05:25	JBS	GUAIMBÊ
Guaimbê	4	GOLD	Seg a Sex	06:30	JBS	GUAIMBÊ
Guaimbê	4	GOLD	Seg a Sex	14:40	JBS	GUAIMBÊ
Guaimbê	4	GOLD	Seg a Sex	15:40	JBS	GUAIMBÊ
Guaimbê	4	GOLD	Seg a Sex	16:20	JBS	GUAIMBÊ
Guaimbê	4	GOLD	Seg a Sex	16:40	JBS	GUAIMBÊ
Guaimbê	4	GOLD	Seg a Sex	17:10	JBS	GUAIMBÊ
Guaimbê	4	GOLD	Seg a Sex	17:20	JBS	GUAIMBÊ
Guaimbê	4	GOLD	Seg a Sex	17:50	JBS	GUAIMBÊ
Guaimbê	4	GOLD	Seg a Sex	18:20	JBS	GUAIMBÊ
Guaimbê	4	GOLD	Seg a Sex	22:50	JBS	GUAIMBÊ
Getulina	3	GOLD	Seg a Sex	01:00	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	04:30	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	04:50	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	05:30	GETULINA	JBS
Getulina	3	Plena Van	Seg a Sex	05:30	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	05:50	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	06:00	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	13:00	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	14:50	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	15:30	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	16:15	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	17:05	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	17:50	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	21:15	GETULINA	JBS
Getulina	3	GOLD	Seg a Sex	01:45	JBS	GETULINA
Getulina	3	Plena Van	Seg a Sex	02:30	JBS	GETULINA
Getulina	3	GOLD	Seg a Sex	05:00	JBS	GETULINA
Getulina	3	GOLD	Seg a Sex	05:30	JBS	GETULINA
Getulina	3	GOLD	Seg a Sex	06:15	JBS	GETULINA
Getulina	3	GOLD	Seg a Sex	14:40	JBS	GETULINA
Getulina	3	Plena Van	Seg a Sex	14:40	JBS	GETULINA
Getulina	3	GOLD	Seg a Sex	15:45	JBS	GETULINA
Getulina	3	GOLD	Seg a Sex	16:15	JBS	GETULINA
Getulina	3	GOLD	Seg a Sex	16:40	JBS	GETULINA
Getulina	3	GOLD	Seg a Sex	17:20	JBS	GETULINA
Getulina	3	GOLD	Seg a Sex	17:30	JBS	GETULINA
Getulina	3	GOLD	Seg a Sex	17:50	JBS	GETULINA
Getulina	3	GOLD	Seg a Sex	18:20	JBS	GETULINA
Getulina	3	GOLD	Seg a Sex	22:50	JBS	GETULINA
Cafelândia	8	GOLD	Seg a Sex	04:50	CAFELANDIA	JBS
Cafelândia	8	Plena Van	Seg a Sex	05:20	CAFELANDIA	JBS
Cafelândia	8	GOLD	Seg a Sex	05:50	CAFELANDIA	JBS
Cafelândia	8	GOLD	Seg a Sex	06:50	CAFELANDIA	JBS
Cafelândia	8	GOLD	Seg a Sex	13:00	CAFELANDIA	JBS
Cafelândia	8	GOLD	Seg a Sex	14:50	CAFELANDIA	JBS
Cafelândia	8	GOLD	Seg a Sex	16:00	CAFELANDIA	JBS
Cafelândia	8	GOLD	Seg a Sex	17:00	CAFELANDIA	JBS
Cafelândia	8	GOLD	Seg a Sex	21:00	CAFELANDIA	JBS
Cafelândia	8	GOLD	Seg a Sex	01:45	JBS	CAFELANDIA
Cafelândia	8	Plena Van	Seg a Sex	02:30	JBS	CAFELANDIA
Cafelândia	8	Plena Van	Seg a Sex	04:55	JBS	CAFELANDIA
Cafelândia	8	GOLD	Seg a Sex	05:35	JBS	CAFELANDIA
Cafelândia	8	GOLD	Seg a Sex	06:10	JBS	CAFELANDIA
Cafelândia	8	GOLD	Seg a Sex	14:40	JBS	CAFELANDIA
Cafelândia	8	GOLD	Seg a Sex	16:15	JBS	CAFELANDIA
Cafelândia	8	GOLD	Seg a Sex	17:20	JBS	CAFELANDIA
Cafelândia	8	Plena Van	Seg a Sex	17:50	JBS	CAFELANDIA
Cafelândia	8	GOLD	Seg a Sex	18:20	JBS	CAFELANDIA
Cafelândia	8	GOLD	Seg a Sex	22:50	JBS	CAFELANDIA
Pirajuí	8	GOLD	Seg a Sab	14:20	Pirajui	JBS
Pirajuí	8	GOLD	Seg a Sab	01:40	JBS	Pirajui
Pirajuí	8	Plena Van	Seg a Sab	02:30	JBS	Pirajui
Guarantã	8	Plena Van	Seg a Sex	04:55	Guaranta	FRIG
Guarantã	8	Plena Van	Seg a Sex	15:30	FRIG	Guaranta
Guarantã	8	Plena Van	Seg a Sex	16:40	FRIG	Guaranta
`,
};
