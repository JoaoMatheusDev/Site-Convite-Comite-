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

## Usar no tablet (Android)

O tablet usa o **site publicado**: https://joaomatheusdev.github.io/Site-Convite-Comite-/

**Primeira vez:** abra o endereço no Chrome do tablet, toque no menu ⋮ e em **Adicionar à tela inicial** (ou **Instalar app**). Aparece um ícone **Convites** com a logo da JBS.

**Levar a planilha para o tablet:** salve a planilha (.xlsx) no Google Drive ou mande por e-mail para você mesma. No tablet, toque em **Toque ou clique para escolher a planilha** e escolha o arquivo no Drive ou em Downloads (anexos de e-mail ficam lá depois de baixados). Se a planilha for do Google Planilhas, salve como .xlsx antes (Arquivo → Fazer download → Microsoft Excel).

**Para cada candidato:**
1. Toque em **Enviar PDF**: abre a tela de compartilhar com o PDF e a mensagem.
2. Escolha **WhatsApp** e a conversa do candidato. O candidato precisa estar nos contatos do tablet ou já ter conversa no WhatsApp.
3. Envie. O candidato fica marcado como **Enviado** (✓).

A lista e as marcações ficam salvas no tablet, mesmo se o navegador recarregar ao voltar do WhatsApp. Ao terminar o lote, toque em **Limpar lista**.

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

## Versão offline (computadores sem acesso à internet)

O arquivo [`versao-offline/Gerador-de-Convites.html`](versao-offline/Gerador-de-Convites.html) tem o site inteiro dentro dele: bibliotecas, logo e cartão de autorização. Ele não acessa nada da internet.

1. Baixe o arquivo (no GitHub: abra o arquivo e clique em **Download raw file**).
2. Copie para o computador: na Área de Trabalho, numa pasta da rede ou num pen drive.
3. Dê dois cliques. Ele abre no navegador (Edge ou Chrome) e funciona igual ao site.

**Alterar textos, vagas, vale ou horários na versão offline:** abra o arquivo no Bloco de Notas, procure por `CONFIGURAÇÃO`, edite e salve. Ou altere o `config.js` e gere o arquivo de novo com `python3 ferramentas/gerar-versao-offline.py`.

Observação: o botão **Abrir no WhatsApp** precisa que o computador consiga abrir o WhatsApp (WhatsApp Web ou o aplicativo instalado). Todo o resto funciona sem internet.
