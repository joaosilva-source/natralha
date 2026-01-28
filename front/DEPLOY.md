# Guia de Implantação Permanente - Social Command Center

Este documento explica como colocar sua plataforma de tabulação online permanentemente de forma gratuita.

## Opção 1: Streamlit Community Cloud (Recomendado - Grátis)

Esta é a forma mais fácil e rápida de hospedar apps Streamlit.

1.  **Crie um repositório no GitHub**:
    - Vá para [github.com](https://github.com) e crie um novo repositório (ex: `social-command-center`).
    - Suba todos os arquivos da pasta `social_monitor` para este repositório.

2.  **Conecte ao Streamlit Cloud**:
    - Acesse [share.streamlit.io](https://share.streamlit.io).
    - Faça login com sua conta do GitHub.
    - Clique em "New app".
    - Selecione seu repositório, a branch (geralmente `main`) e o arquivo principal (`app.py`).
    - Clique em "Deploy!".

3.  **Pronto!** Seu site terá uma URL pública permanente (ex: `social-cc.streamlit.app`).

## Opção 2: Render ou Railway (PaaS)

Se preferir outras plataformas:
1. Conecte seu GitHub ao [Render.com](https://render.com).
2. Crie um novo "Web Service".
3. Comando de Build: `pip install -r requirements.txt`.
4. Comando de Start: `streamlit run app.py`.

## Observações Importantes sobre o Banco de Dados
- Como este app usa **SQLite**, os dados são salvos em um arquivo local (`social_metrics.db`).
- No Streamlit Cloud, se o app for reiniciado, o arquivo SQLite pode ser resetado.
- **Dica Pro**: Para persistência real em produção, considere conectar a um banco de dados externo (como Supabase ou PostgreSQL) ou usar o [Streamlit Cloud Secrets](https://docs.streamlit.io/deploy/streamlit-community-cloud/deploy-your-app/secrets-management) para armazenar chaves.

---
*Desenvolvido por Manus AI*
