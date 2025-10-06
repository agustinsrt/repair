import sqlite3
import os

def get_config_db_connection():
    try:
        db_path = os.path.join(os.path.dirname(__file__), "config.db")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        return conn
    except sqlite3.Error as e:
        print(f"Error al conectar a config.db: {e}")
        return None

def get_svc_db_connection():
    try:
        db_path = os.path.join(os.path.dirname(__file__), "svc.db")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        return conn
    except sqlite3.Error as e:
        print(f"Error al conectar a svc.db: {e}")
        return None

def init_config_db():
    conn = get_config_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def init_svc_db():
    conn = get_svc_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS svc (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            svc_code TEXT NOT NULL UNIQUE,
            svc_name TEXT NOT NULL,
            preauthorization_amount REAL NOT NULL,
            diagnostic_fee REAL NOT NULL,
            labor REAL NOT NULL,
            major_sealed_system_labor REAL NOT NULL,
            shipping_address TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()