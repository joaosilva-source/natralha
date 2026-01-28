import google.generativeai as genai
import os
import json

# Configuração da API do Gemini (usando a chave de ambiente se disponível)
# Em um ambiente real, o usuário forneceria a chave. 
# Para este sandbox, assumimos que a configuração será feita no app.
def configure_genai(api_key):
    genai.configure(api_key=api_key)

def analyze_sentiment_and_reason(text):
    """Analisa sentimento e motivo usando Gemini."""
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = f"""
        Analise o seguinte texto de atendimento de rede social e retorne um JSON com:
        1. "sentiment": (Positivo, Neutro ou Negativo)
        2. "reason": (Comercial, Suporte, Bug ou Elogio)

        Texto: "{text}"
        
        Retorne APENAS o JSON.
        """
        response = model.generate_content(prompt)
        # Limpar a resposta para garantir que seja um JSON válido
        content = response.text.strip()
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        return json.loads(content)
    except Exception as e:
        print(f"Erro na análise de IA: {e}")
        return {"sentiment": "Neutro", "reason": "Suporte"}

def generate_executive_report(df_summary):
    """Gera um relatório executivo narrativo baseado nos dados."""
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = f"""
        Você é um consultor sênior de CX (Customer Experience). 
        Com base nos seguintes dados de atendimentos de redes sociais, escreva um relatório executivo narrativo, profissional e humano.
        
        Dados:
        {df_summary}
        
        O relatório deve conter:
        - Título impactante
        - Resumo executivo (tópicos)
        - Análise estratégica por rede social e sentimento
        - Plano de Ação (Action Plan) com 3 pontos estratégicos
        - Conclusão
        
        Use formatação Markdown.
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Erro ao gerar relatório: {e}"
