# Gerador de Convites

Site que gera os convites de **Entrevista** (script 01) e **Comitê** (script 02) para cada candidato.
Ele funciona a partir de uma planilha ou de um cadastro individual.

Para cada candidato, o site gera:

- a **mensagem pronta** para o WhatsApp, com primeiro nome, data ("amanhã, 24/9"), horário, gênero (convidá-lo/convidá-la) e salário;
- o botão **Abrir no WhatsApp**, que abre a conversa com o número do candidato e a mensagem já escrita;
- um **PDF com o nome do candidato**, em formato de tela de celular e com letras grandes: resumo com os destaques (data e horário, local, com quem falar, salário, o que levar, atenção), mensagem completa com os pontos importantes em negrito, horários do ônibus **só da cidade dele** e cartão de autorização para o motorista;
- **Baixar todos os PDFs (.zip)** para o lote inteiro.

Os dados dos candidatos ficam só no navegador: nada é enviado ou salvo em servidor.

## Como usar

1. Escolha o tipo de convite, a data, o horário e a responsável.
2. Suba a planilha (aba **Planilha**) ou cadastre uma pessoa (aba **Individual**).
3. Resolva os avisos em vermelho ou amarelo, se houver: telefone inválido, cidade sem ônibus, salário faltando etc.
4. Em cada candidato: **Abrir no WhatsApp**, envie a mensagem e arraste o PDF para a conversa. Depois marque **Enviado**.

## Planilha

Baixe o modelo pelo link **Baixar modelo de planilha** no site. Colunas:

| Coluna | Obrigatória | Observação |
|---|---|---|
| Nome | Sim | Nome completo |
| Telefone | Para WhatsApp | DDD + número |
| Cidade | Recomendado | Define os horários de ônibus do PDF |
| Sexo | Não | M ou F |
| Tipo | Não | Entrevista ou Comitê. Em branco, usa o tipo escolhido no site |
| Data / Horário | Não | Em branco, usa os escolhidos no site |
| Cargo / Salário | Comitê | O salário vem da planilha (ou é digitado no cadastro individual) e vai na mensagem do Comitê |
| Responsável | Não | Priscila ou Natália. Em branco, usa a escolhida no site |

## Como alterar textos, vagas, vale e horários

Tudo fica em [`config.js`](config.js). No GitHub, abra o arquivo, clique no lápis, edite e salve (**Commit changes**).

- **Textos dos scripts:** `tipos.entrevista.texto` e `tipos.comite.texto`. A lista de marcadores (`{{nome}}`, `{{quando}}`...) está no próprio arquivo.
- **Vale-alimentação:** `valeAlimentacao`.
- **Quadros de destaque do PDF:** `destaques` (local, o que levar, atenção) e `negrito` (trechos em negrito na mensagem do PDF), dentro de cada tipo.
- **Horários de ônibus:** copie as linhas da planilha de horários, com o cabeçalho, e cole em `horariosOnibus`.
- **Cartão de autorização:** substitua `img/autorizacao-transporte.jpg` e rode `python3 img/gerar-cartao-js.py`.

## Publicar no GitHub Pages

No repositório: **Settings → Pages → Branch: `main` / pasta `/ (root)` → Save**.
O site fica em `https://joaomatheusdev.github.io/Site-Convite-Comite-/`.

Também dá para abrir o `index.html` direto do computador, sem internet.
