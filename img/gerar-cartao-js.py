# Regenera img/cartao-autorizacao.js a partir de img/autorizacao-transporte.jpg
import base64, pathlib

pasta = pathlib.Path(__file__).parent
dados = base64.b64encode((pasta / "autorizacao-transporte.jpg").read_bytes()).decode()
(pasta / "cartao-autorizacao.js").write_text(
    "// Cartão de autorização do transporte embutido em base64 (permite gerar o PDF\n"
    "// mesmo abrindo o site direto do computador). Para trocar o cartão, substitua\n"
    "// img/autorizacao-transporte.jpg e rode: python3 img/gerar-cartao-js.py\n"
    f'window.CARTAO_AUTORIZACAO = "data:image/jpeg;base64,{dados}";\n'
)
print("cartao-autorizacao.js atualizado")
