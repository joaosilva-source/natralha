import streamlit as st
import pandas as pd
import plotly.express as px
from wordcloud import WordCloud
import matplotlib.pyplot as plt
from database import init_db, save_tabulation, get_all_data
from ai_engine import configure_genai, analyze_sentiment_and_reason, generate_executive_report
import datetime

# Configuração da Página
st.set_page_config(page_title="Social Command Center", layout="wide", initial_sidebar_state="expanded")

# Inicializar Banco de Dados
init_db()

# Estilo CSS Customizado para Dark Mode e Cards
st.markdown("""
    <style>
    .main {
        background-color: #0e1117;
    }
    .stMetric {
        background-color: #1e2130;
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #3e4451;
    }
    .card {
        background-color: #1e2130;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 15px;
        border-left: 5px solid #00d1b2;
    }
    .card-instagram { border-left-color: #E1306C; }
    .card-facebook { border-left-color: #4267B2; }
    .card-tiktok { border-left-color: #00f2ea; }
    .card-youtube { border-left-color: #FF0000; }
    .card-messenger { border-left-color: #006AFF; }
    .card-playstore { border-left-color: #34A853; }
    
    .sentiment-positivo { color: #28a745; font-weight: bold; }
    .sentiment-negativo { color: #dc3545; font-weight: bold; }
    .sentiment-neutro { color: #ffc107; font-weight: bold; }
    </style>
    """, unsafe_allow_html=True)

# Sidebar - Configurações e Filtros
with st.sidebar:
    st.title("⚙️ Configurações")
    api_key = st.text_input("Gemini API Key", type="password")
    if api_key:
        configure_genai(api_key)
    
    st.divider()
    st.title("🔍 Filtros")
    df = get_all_data()
    
    if not df.empty:
        networks = st.multiselect("Rede Social", options=df['social_network'].unique(), default=df['social_network'].unique())
        reasons = st.multiselect("Motivo", options=df['reason'].unique(), default=df['reason'].unique())
        date_range = st.date_input("Período", [df['date_only'].min(), datetime.date.today()])
        
        # Aplicar Filtros
        mask = (df['social_network'].isin(networks)) & \
               (df['reason'].isin(reasons))
        df_filtered = df[mask]
    else:
        df_filtered = df

# Navegação
tabs = st.tabs(["📥 Entrada de Dados", "📊 Dashboard", "📱 Feed de Atendimento", "📝 Relatórios"])

# --- ABA 1: ENTRADA DE DADOS ---
with tabs[0]:
    st.header("Nova Tabulação")
    
    with st.form("tabulation_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        
        with col1:
            client_name = st.text_input("Nome do Cliente")
            social_network = st.selectbox("Rede Social", ["Instagram", "Facebook", "TikTok", "Messenger", "YouTube", "PlayStore"])
            message_text = st.text_area("Texto da Mensagem Principal")
            
            # Botão de Análise Expressa (fora do form não funciona bem, então usamos um checkbox ou processamos no submit)
            ia_analyze = st.checkbox("Usar Análise Expressa (IA)")
            
        with col2:
            link = ""
            if social_network == "YouTube":
                link = st.text_input("Link do Vídeo")
            
            rating = ""
            if social_network == "PlayStore":
                rating = st.select_slider("Avaliação", options=["1⭐", "2⭐", "3⭐", "4⭐", "5⭐"])
            
            reason = st.selectbox("Motivo do Contato", ["Produto", "Suporte", "Bug", "Elogio", "Reclamação", "Oculto", "Outro"])
            sentiment = st.selectbox("Sentimento", ["Positivo", "Neutro", "Negativo"])
            dest_center = st.text_input("Central de Destino")

        submitted = st.form_submit_button("Salvar Tabulação")
        
        if submitted:
            if ia_analyze and api_key and message_text:
                with st.spinner("IA Analisando..."):
                    res = analyze_sentiment_and_reason(message_text)
                    sentiment = res.get('sentiment', sentiment)
                    reason = res.get('reason', reason)
            
            data = {
                "client_name": client_name,
                "social_network": social_network,
                "message_text": message_text,
                "link": link,
                "rating": rating,
                "reason": reason,
                "sentiment": sentiment,
                "destination_center": dest_center
            }
            save_tabulation(data)
            st.success("Dados salvos com sucesso!")
            st.rerun()

# --- ABA 2: DASHBOARD ---
with tabs[1]:
    if not df_filtered.empty:
        # Cards de Métricas
        m1, m2, m3 = st.columns(3)
        total_contacts = len(df_filtered)
        pos_perc = (len(df_filtered[df_filtered['sentiment'] == 'Positivo']) / total_contacts) * 100
        most_active = df_filtered['social_network'].mode()[0]
        
        m1.metric("Total de Contatos", total_contacts)
        m2.metric("% Sentimento Positivo", f"{pos_perc:.1f}%")
        m3.metric("Rede mais Ativa", most_active)
        
        st.divider()
        
        col_left, col_right = st.columns(2)
        
        with col_left:
            st.subheader("Volume por Rede Social")
            fig_bar = px.bar(df_filtered['social_network'].value_counts().reset_index(), 
                             x='social_network', y='count', color='social_network',
                             template="plotly_dark")
            st.plotly_chart(fig_bar, use_container_width=True)
            
        with col_right:
            st.subheader("Motivos Frequentes")
            fig_pie = px.pie(df_filtered, names='reason', hole=0.4, template="plotly_dark")
            st.plotly_chart(fig_pie, use_container_width=True)
            
        st.subheader("Nuvem de Palavras (Insights)")
        all_text = " ".join(df_filtered['message_text'].fillna(""))
        if all_text.strip():
            wordcloud = WordCloud(width=800, height=400, background_color='#0e1117', colormap='viridis').generate(all_text)
            fig_wc, ax = plt.subplots()
            ax.imshow(wordcloud, interpolation='bilinear')
            ax.axis("off")
            st.pyplot(fig_wc)
    else:
        st.info("Nenhum dado encontrado para os filtros selecionados.")

# --- ABA 3: FEED DE ATENDIMENTO ---
with tabs[2]:
    st.header("📱 Feed de Atendimento")
    
    if not df_filtered.empty:
        for _, row in df_filtered.iterrows():
            network_class = f"card-{row['social_network'].lower()}"
            sentiment_class = f"sentiment-{row['sentiment'].lower()}"
            
            st.markdown(f"""
                <div class="card {network_class}">
                    <div style="display: flex; justify-content: space-between;">
                        <strong>{row['social_network']} | {row['client_name']}</strong>
                        <span class="{sentiment_class}">{row['sentiment']}</span>
                    </div>
                    <div style="margin-top: 10px;">
                        <span style="background-color: #3e4451; padding: 2px 8px; border-radius: 5px; font-size: 0.8em;">{row['reason']}</span>
                    </div>
                    <p style="margin-top: 10px; font-style: italic;">"{row['message_text']}"</p>
                    <small>{row['timestamp']}</small>
                </div>
            """, unsafe_allow_html=True)
    else:
        st.info("O feed está vazio.")

# --- ABA 4: RELATÓRIOS ---
with tabs[3]:
    st.header("📝 Relatório Executivo de CX")
    
    if st.button("🚀 Gerar Relatório com IA"):
        if not api_key:
            st.error("Por favor, insira a Gemini API Key na barra lateral.")
        elif df_filtered.empty:
            st.warning("Não há dados para analisar.")
        else:
            with st.spinner("Consultor de CX analisando dados..."):
                summary = df_filtered[['social_network', 'reason', 'sentiment', 'message_text']].to_string()
                report = generate_executive_report(summary)
                st.markdown(report)
                
                # Opção de download
                st.download_button("Baixar Relatório (Markdown)", report, file_name="relatorio_cx.md")
