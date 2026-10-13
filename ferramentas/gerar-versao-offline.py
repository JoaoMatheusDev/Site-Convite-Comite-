"""Gera a versão offline do site em um único arquivo HTML.

Junta index.html, style.css, config.js, app.js, as bibliotecas, a logo e o
cartão de autorização em versao-offline/Gerador-de-Convites.html, que abre
com dois cliques em qualquer computador, sem internet.

Uso (na pasta do repositório):  python3 ferramentas/gerar-versao-offline.py
"""
import base64
import pathlib
import re

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "versao-offline" / "Gerador-de-Convites.html"


def ler(caminho):
    return (RAIZ / caminho).read_text(encoding="utf-8")


def data_uri(caminho, tipo):
    dados = base64.b64encode((RAIZ / caminho).read_bytes()).decode()
    return f"data:{tipo};base64,{dados}"


def script_inline(caminho):
    codigo = ler(caminho)
    if re.search(r"</script|<!--", codigo, re.I):
        raise SystemExit(f"{caminho} contém texto que quebra um <script> embutido")
    return f"<script>\n{codigo}\n</script>"


def trocar_script(html, src, novo):
    tag = f'<script src="{src}"></script>'
    if html.count(tag) != 1:
        raise SystemExit(f"tag não encontrada no index.html: {tag}")
    return html.replace(tag, novo)


html = ler("index.html")
# Manifesto e ícone só servem no site publicado
html = html.replace('  <link rel="manifest" href="manifest.webmanifest">\n', "")
html = html.replace('  <link rel="icon" href="img/icone-192.png">\n', "")
html = html.replace('<link rel="stylesheet" href="style.css">', f"<style>\n{ler('style.css')}\n</style>")
html = html.replace('src="img/logo-jbs.png"', f'src="{data_uri("img/logo-jbs.png", "image/png")}"')

# Bibliotecas minificadas vão como data: URI (evita conflito com o HTML)
for lib in ["xlsx.full.min.js", "jspdf.umd.min.js", "jspdf.plugin.autotable.min.js", "jszip.min.js"]:
    html = trocar_script(html, f"lib/{lib}", f'<script src="{data_uri("lib/" + lib, "text/javascript")}"></script>')
html = trocar_script(html, "img/cartao-autorizacao.js", script_inline("img/cartao-autorizacao.js"))

# A configuração fica em texto puro, para poder ser editada no Bloco de Notas
config = (
    "<!-- ============ CONFIGURAÇÃO: textos, vagas, vale, responsáveis e horários ============ -->\n"
    + script_inline("config.js")
    + "\n<!-- ============ FIM DA CONFIGURAÇÃO ============ -->"
)
html = trocar_script(html, "config.js", config)
html = trocar_script(html, "app.js", script_inline("app.js"))

if re.search(r'(src|href)="(?!data:|#|https?:)', html):
    raise SystemExit("ainda há arquivo externo referenciado no HTML")

SAIDA.parent.mkdir(exist_ok=True)
SAIDA.write_text(html, encoding="utf-8")
print(f"{SAIDA.relative_to(RAIZ)} gerado ({SAIDA.stat().st_size / 1024 / 1024:.1f} MB)")
