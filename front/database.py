import sqlite3
import pandas as pd
from datetime import datetime

DB_NAME = "social_metrics.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tabulations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            client_name TEXT NOT NULL,
            social_network TEXT NOT NULL,
            message_text TEXT,
            link TEXT,
            rating TEXT,
            reason TEXT NOT NULL,
            destination_center TEXT,
            sentiment TEXT,
            date_only DATE
        )
    ''')
    conn.commit()
    conn.close()

def save_tabulation(data):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    now = datetime.now()
    cursor.execute('''
        INSERT INTO tabulations (
            timestamp, client_name, social_network, message_text, 
            link, rating, reason, destination_center, sentiment, date_only
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        now.strftime("%Y-%m-%d %H:%M:%S"),
        data['client_name'],
        data['social_network'],
        data['message_text'],
        data.get('link', ''),
        data.get('rating', ''),
        data['reason'],
        data['destination_center'],
        data['sentiment'],
        now.date()
    ))
    conn.commit()
    conn.close()

def get_all_data():
    conn = sqlite3.connect(DB_NAME)
    df = pd.read_sql_query("SELECT * FROM tabulations ORDER BY timestamp DESC", conn)
    conn.close()
    return df
