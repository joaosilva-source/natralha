import sqlite3
from datetime import datetime, timedelta
import random

DB_NAME = "social_metrics.db"

def seed():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    networks = ["Instagram", "Facebook", "TikTok", "Messenger", "YouTube", "PlayStore"]
    reasons = ["Comercial", "Suporte", "Bug", "Elogio"]
    sentiments = ["Positivo", "Neutro", "Negativo"]
    clients = ["João Silva", "Maria Oliveira", "Carlos Souza", "Ana Costa", "Pedro Santos", "Julia Lima"]
    messages = [
        "Adorei o novo produto, parabéns!",
        "Não consigo acessar minha conta, podem ajudar?",
        "O app está fechando sozinho no Android.",
        "Qual o valor do frete para São Paulo?",
        "Excelente atendimento, muito rápido.",
        "O vídeo de vocês é muito explicativo, obrigado!",
        "Tive um problema com meu pedido #123.",
        "Sugestão: adicionem modo escuro no app.",
        "O suporte demorou muito para responder.",
        "Melhor marca do mercado!"
    ]

    now = datetime.now()
    
    for i in range(20):
        timestamp = now - timedelta(hours=random.randint(1, 48))
        data = (
            timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            random.choice(clients),
            random.choice(networks),
            random.choice(messages),
            "",
            "5⭐" if random.random() > 0.5 else "4⭐",
            random.choice(reasons),
            "Central SP",
            random.choice(sentiments),
            timestamp.date()
        )
        cursor.execute('''
            INSERT INTO tabulations (
                timestamp, client_name, social_network, message_text, 
                link, rating, reason, destination_center, sentiment, date_only
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', data)
    
    conn.commit()
    conn.close()
    print("Dados de exemplo inseridos com sucesso!")

if __name__ == "__main__":
    seed()
